"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  walletAddress: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithWallet: (address: string, signature: string, message: string) => Promise<void>;
  signInWithSolana: (address: string, signature: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  walletAddress: null,
  signInWithGoogle: async () => {},
  signInWithWallet: async () => {},
  signInWithSolana: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      // Check if user logged in via wallet
      if (session?.user?.user_metadata?.wallet_address) {
        setWalletAddress(session.user.user_metadata.wallet_address);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.user_metadata?.wallet_address) {
        setWalletAddress(session.user.user_metadata.wallet_address);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  }, []);

  const signInWithWallet = useCallback(async (address: string, signature: string, message: string) => {
    void message;
    const walletEmail = `${address.toLowerCase()}@wallet.breathprotocol.io`;
    const walletPassword = signature.slice(0, 72); // bcrypt cap

    // Try sign-in first — succeeds for any wallet with a stable signature
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: walletEmail,
      password: walletPassword,
    });
    if (signInData?.session) {
      setWalletAddress(address);
      return;
    }

    const looksMissing =
      !!signInError &&
      /invalid login credentials|email not confirmed|user not found/i.test(signInError.message);

    if (looksMissing) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: walletEmail,
        password: walletPassword,
        options: {
          data: {
            wallet_address: address,
            full_name: `${address.slice(0, 6)}...${address.slice(-4)}`,
            auth_method: "wallet",
          },
        },
      });
      if (signUpError) {
        console.error("[wallet auth] signUp failed:", signUpError);
        throw new Error(`Sign-up failed: ${signUpError.message}`);
      }
      if (!signUpData.session) {
        throw new Error(
          "Wallet sign-up created an unconfirmed account. Disable email confirmation for wallet@... in Supabase Auth settings."
        );
      }
      setWalletAddress(address);
      return;
    }

    console.error("[wallet auth] signIn failed:", signInError);
    throw new Error(
      signInError?.message
        ? `Wallet sign-in failed: ${signInError.message}. This wallet may have a stale Supabase record from a previous build — delete it from Auth dashboard to re-sign up.`
        : "Wallet authentication failed."
    );
  }, []);

  /**
   * Sign in with a Solana wallet (via Web3Auth).
   * Uses the ed25519 signature of a deterministic message as the Supabase
   * password — same key + same message → same signature → same password.
   */
  const signInWithSolana = useCallback(async (address: string, signature: string) => {
    const walletEmail = `sol_${address.toLowerCase()}@wallet.breathprotocol.io`;
    const walletPassword = signature.slice(0, 60);

    // Try sign-in first (this account may already exist with a stable signature)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: walletEmail,
      password: walletPassword,
    });
    if (signInData?.session) {
      setWalletAddress(address);
      return;
    }

    // Not an existing user — sign up
    const looksMissing =
      !!signInError &&
      /invalid login credentials|email not confirmed|user not found/i.test(signInError.message);

    if (looksMissing) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: walletEmail,
        password: walletPassword,
        options: {
          data: {
            wallet_address: address,
            chain: "solana",
            full_name: `${address.slice(0, 4)}…${address.slice(-4)}`,
            auth_method: "solana_wallet",
          },
        },
      });
      if (signUpError) {
        console.error("[signInWithSolana] signUp failed:", signUpError);
        throw new Error(`Sign-up failed: ${signUpError.message}`);
      }
      if (!signUpData.session) {
        throw new Error(
          "Sign-up succeeded but no session was created. Check Supabase 'Confirm email' setting (should be off for synthetic emails)."
        );
      }
      setWalletAddress(address);
      return;
    }

    // Sign-in failed for a different reason
    console.error("[signInWithSolana] signIn failed:", signInError);
    throw new Error(
      signInError?.message
        ? `Solana wallet sign-in failed: ${signInError.message}`
        : "Solana wallet authentication failed."
    );
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setWalletAddress(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        walletAddress,
        signInWithGoogle,
        signInWithWallet,
        signInWithSolana,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
