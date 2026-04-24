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
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: true,
  walletAddress: null,
  signInWithGoogle: async () => {},
  signInWithWallet: async () => {},
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
    // Use Supabase signInWithPassword with wallet address as email
    // The wallet address becomes a unique identifier
    const walletEmail = `${address.toLowerCase()}@wallet.breathprotocol.io`;
    const walletPassword = signature; // Use signature as password (unique per sign)

    // Try to sign up first (new user)
    const { error: signUpError } = await supabase.auth.signUp({
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

    // If user exists, sign in
    if (signUpError?.message?.includes("already registered")) {
      // Update password to current signature and sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: walletPassword,
      });

      if (signInError) {
        // If password changed, try signing up again (Supabase will handle)
        throw new Error("Wallet authentication failed. Please try again.");
      }
    }

    setWalletAddress(address);
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
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
