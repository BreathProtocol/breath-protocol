"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useSolanaWallet } from "@/components/auth/Web3AuthSolanaProvider";
import { useWallet } from "@solana/wallet-adapter-react";
export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle, signInWithSolana } = useAuth();
  const [authLoading, setAuthLoading] = useState<string | null>(null);
  const [walletError, setWalletError] = useState<string | null>(null);
  const w3a = useSolanaWallet();

  // Redirect to dashboard if already logged in (or auth is bypassed for demos)
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === "1";
  useEffect(() => {
    if (bypassAuth) {
      router.replace("/dashboard");
      return;
    }
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router, bypassAuth]);

  const handleDirectWallet = async () => {
    setWalletError(null);
    setAuthLoading("wallet");
    try {
      const w = window as unknown as Record<string, unknown>;
      type SolProvider = {
        publicKey?: { toBase58: () => string } | null;
        isPhantom?: boolean;
        connect: () => Promise<{ publicKey: { toBase58: () => string } }>;
        signMessage: (m: Uint8Array, encoding?: string) => Promise<{ signature: Uint8Array } | Uint8Array>;
      };
      // Try Phantom first, then Solflare.
      let provider: SolProvider | undefined;
      let walletName = "wallet";
      const phantom = (w["phantom"] as { solana?: SolProvider } | undefined)?.solana;
      if (phantom && (phantom as SolProvider & { isPhantom?: boolean }).isPhantom) {
        provider = phantom;
        walletName = "Phantom";
      } else if (w["solflare"]) {
        provider = w["solflare"] as SolProvider;
        walletName = "Solflare";
      }
      if (!provider) {
        throw new Error("No Solana wallet detected. Install Phantom or Solflare and reload.");
      }

      // Use the wallet's signIn (SIWS) instead of signMessage. Phantom's
      // signMessage has been throwing "Me: Unexpected error" for some users
      // — signIn is a separate code path and is the modern Solana standard.
      type SignInResult = {
        signature: Uint8Array;
        signedMessage: Uint8Array;
        account: { publicKey: { toBase58?: () => string } | string };
      };
      type SolProviderWithSignIn = SolProvider & {
        signIn?: (input: { domain?: string; statement?: string; uri?: string }) => Promise<SignInResult>;
      };
      const provSI = provider as SolProviderWithSignIn;

      let pubkey: string;
      let sigBytes: Uint8Array;
      let signedMessageText: string;

      if (typeof provSI.signIn === "function") {
        // SIWS — Phantom returns the exact message it signed in `signedMessage`.
        const r = await provSI.signIn({
          domain: window.location.host,
          statement: "Sign in to Breath Protocol",
          uri: window.location.origin,
        });
        sigBytes = r.signature;
        const acct = r.account.publicKey;
        pubkey = typeof acct === "string" ? acct : acct.toBase58!();
        signedMessageText = new TextDecoder().decode(r.signedMessage);
      } else {
        // Older wallets without signIn — fall back to connect + signMessage
        const connectRes = await provider.connect();
        const pk = (connectRes?.publicKey ?? provider.publicKey) as { toBase58: () => string } | null | undefined;
        if (!pk) throw new Error(`${walletName} did not return a public key.`);
        pubkey = pk.toBase58();
        signedMessageText = `Sign in to Breath Protocol\n\nWallet: ${pubkey}`;
        const msg = new TextEncoder().encode(signedMessageText);
        const signRes = await provider.signMessage(msg);
        sigBytes =
          signRes instanceof Uint8Array
            ? signRes
            : (signRes as { signature: Uint8Array }).signature;
      }

      const { default: bs58 } = await import("bs58");
      const sigBase58 = bs58.encode(sigBytes);

      // Server verifies the ed25519 signature, finds-or-creates the user via
      // the Supabase admin SDK, and returns a one-time OTP we redeem for a
      // real session. Bypasses the synthetic-email/signInWithPassword path
      // that was failing intermittently, and Supabase's signInWithWeb3 URI
      // validation.
      const resp = await fetch("/api/auth/solana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pubkey,
          signature: sigBase58,
          message: signedMessageText,
        }),
      });
      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || `Server auth failed (${resp.status})`);
      }
      const { email, token } = (await resp.json()) as { email: string; token: string };
      const { error: otpError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });
      if (otpError) throw new Error(`OTP verify failed: ${otpError.message}`);

      router.push("/dashboard");
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e ?? "");
      console.error("[direct wallet sign-in]", e);
      setWalletError(
        /rejected|denied|user rejected/i.test(m)
          ? "Signature request rejected in wallet."
          : m || "Wallet sign-in failed."
      );
      setAuthLoading(null);
    }
  };

  const handleSolanaWeb3Auth = async () => {
    setWalletError(null);
    setAuthLoading("solana-w3a");
    try {
      if (!w3a.ready) throw new Error("Web3Auth still initialising — try again in a moment.");
      await w3a.connect();
      const addr = w3a.publicKey?.toBase58();
      if (!addr) throw new Error("Web3Auth did not return a public key.");
      const message = `Sign in to Breath Protocol\n\nWallet: ${addr}`;
      const signature = await w3a.signMessage(message);
      await signInWithSolana(addr, signature);
      router.push("/dashboard");
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e ?? "");
      console.error("[web3auth solana]", e);
      setWalletError(m || "Web3Auth sign-in failed.");
      setAuthLoading(null);
    }
  };

  const handleGoogle = async () => {
    setAuthLoading("google");
    try {
      await signInWithGoogle();
    } catch {
      setAuthLoading(null);
    }
  };

  const sol = useWallet();

  // Native Solana sign-in talking directly to the wallet's injected provider.
  // Bypasses @solana/wallet-adapter-react — the adapter wraps every error
  // as `WalletSignMessageError: Unexpected error`, which is unhelpful.
  // Loading gate: pulsing teal dot + mono label
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <span
            className="w-[8px] h-[8px] rounded-full animate-dot-pulse"
            style={{
              background: "var(--teal)",
              boxShadow: "0 0 12px var(--teal)",
            }}
          />
          <span className="bp-label" style={{ color: "var(--bone)" }}>
            CALIBRATING · HELIX DRIVE
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      {/* Editorial block */}
      <div className="relative z-10 w-full max-w-[640px] animate-fade-in-up">
        {/* Eyebrow */}
        <div className="bp-eyebrow mb-8 text-center">ACCESS · 0047</div>

        {/* Display */}
        <h1
          className="bp-display text-center"
          style={{ fontSize: "clamp(56px, 11vw, 140px)" }}
        >
          <span className="block">Breath</span>
          <span className="block" style={{ marginLeft: "6%" }}>
            Protocol
          </span>
          <span
            className="block"
            style={{ marginLeft: "2%", color: "var(--teal)", opacity: 0.92 }}
          >
            Identity
          </span>
        </h1>

        {/* Tag */}
        <p
          className="bp-editorial text-center mt-7 mx-auto"
          style={{
            fontSize: "clamp(18px, 2vw, 22px)",
            color: "var(--bone)",
            opacity: 0.7,
            maxWidth: "480px",
            lineHeight: 1.4,
          }}
        >
          A living ledger of who you are.
        </p>

        {/* Sign-in row */}
        <div className="mt-14 mx-auto w-full max-w-[480px]">
          {/* Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleGoogle}
              disabled={authLoading !== null}
              className="bp-button flex items-center justify-center gap-3"
            >
              {authLoading === "google" ? (
                <>
                  <span
                    className="w-[6px] h-[6px] rounded-full animate-dot-pulse"
                    style={{ background: "var(--teal)" }}
                  />
                  <span>Connecting</span>
                </>
              ) : (
                <span>Continue with Google</span>
              )}
            </button>

            <button
              onClick={handleSolanaWeb3Auth}
              disabled={authLoading !== null}
              className="bp-button flex items-center justify-center gap-3"
            >
              {authLoading === "solana-w3a" ? (
                <>
                  <span
                    className="w-[6px] h-[6px] rounded-full animate-dot-pulse"
                    style={{ background: "var(--teal)" }}
                  />
                  <span>Signing</span>
                </>
              ) : (
                <span>{w3a.ready ? "Solana · Web3Auth" : "Init…"}</span>
              )}
            </button>

            <button
              onClick={handleDirectWallet}
              disabled={authLoading !== null}
              className="bp-button flex items-center justify-center gap-3"
            >
              {authLoading === "wallet" ? (
                <>
                  <span
                    className="w-[6px] h-[6px] rounded-full animate-dot-pulse"
                    style={{ background: "var(--teal)" }}
                  />
                  <span>Signing</span>
                </>
              ) : (
                <span>Connect Wallet</span>
              )}
            </button>
          </div>

          {/* OR divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px" style={{ background: "var(--bone-10)" }} />
            <span className="bp-label" style={{ fontSize: "10px" }}>
              OR
            </span>
            <div className="flex-1 h-px" style={{ background: "var(--bone-10)" }} />
          </div>

          {/* Trust row */}
          <div
            className="bp-label text-center flex items-center justify-center gap-4 flex-wrap"
            style={{ fontSize: "10px" }}
          >
            <span>END-TO-END ENCRYPTED</span>
            <span style={{ color: "var(--teal)", opacity: 0.6 }}>·</span>
            <span>ZERO-KNOWLEDGE PROOFS</span>
          </div>

          {/* Terms */}
          <p
            className="text-center mt-8 mx-auto bp-label leading-relaxed"
            style={{ fontSize: "10px", maxWidth: "360px" }}
          >
            By continuing, you agree to Breath Protocol&apos;s{" "}
            <button
              className="underline underline-offset-4 transition-colors"
              style={{ color: "var(--bone)", opacity: 0.7 }}
            >
              Terms
            </button>{" "}
            and{" "}
            <button
              className="underline underline-offset-4 transition-colors"
              style={{ color: "var(--bone)", opacity: 0.7 }}
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
