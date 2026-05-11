"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useSolanaWallet } from "@/components/auth/Web3AuthSolanaProvider";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName } from "@solana/wallet-adapter-base";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useAuth();
  const [authLoading, setAuthLoading] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
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
  const handleNativeSolana = async (walletName: WalletName) => {
    setWalletError(null);
    setAuthLoading("solana");
    try {
      const { getWallets } = await import("@wallet-standard/app");
      const name = String(walletName);

      // Trigger Phantom/Solflare auto-registration on the page (they listen for
      // the wallet-standard:app-ready event before announcing themselves).
      window.dispatchEvent(new Event("wallet-standard:app-ready"));
      // Small delay so just-registered wallets show up.
      await new Promise((r) => setTimeout(r, 100));

      const found = getWallets()
        .get()
        .find((w) => w.name.toLowerCase() === name.toLowerCase());
      if (!found) {
        const installed = getWallets().get().map((w) => w.name).join(", ") || "none";
        throw new Error(
          `${name} not found. Detected Standard Wallets: ${installed}. ` +
            `Install ${name} and reload.`
        );
      }
      console.info("[wallet-standard] picked", found.name);

      const { error: web3Err } = await supabase.auth.signInWithWeb3({
        chain: "solana",
        statement: "I accept the Breath Protocol Terms of Service.",
        wallet: found,
      } as unknown as Parameters<typeof supabase.auth.signInWithWeb3>[0]);
      if (web3Err) {
        console.error("[supabase web3]", web3Err);
        throw new Error(web3Err.message);
      }
      router.push("/dashboard");
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e ?? "");
      console.error("[native solana sign-in]", e);
      setWalletError(
        /rejected|denied|user rejected/i.test(m)
          ? "Signature request rejected in wallet."
          : m || "Solana wallet sign-in failed."
      );
      setAuthLoading(null);
    }
  };

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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              onClick={() => {
                setShowWalletModal(true);
                setWalletError(null);
              }}
              disabled={authLoading !== null}
              className="bp-button flex items-center justify-center gap-3"
            >
              {(authLoading === "wallet" || authLoading === "solana") ? (
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

      {/* Wallet selection modal */}
      {showWalletModal && (
        <>
          <div
            className="fixed inset-0 z-50 backdrop-blur-sm"
            style={{ background: "rgba(31, 26, 20, 0.32)" }}
            onClick={() => {
              setShowWalletModal(false);
              setAuthLoading(null);
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="w-full max-w-[420px] pointer-events-auto animate-fade-in-up"
              style={{
                background: "rgba(255, 255, 255, 0.96)",
                border: "1px solid var(--bone-10)",
                backdropFilter: "blur(20px)",
                animationDuration: "0.25s",
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 pb-4">
                <div>
                  <div className="bp-eyebrow mb-2">WALLET · SELECT</div>
                  <h3
                    className="bp-display"
                    style={{ fontSize: "28px", lineHeight: 1 }}
                  >
                    Connect
                  </h3>
                  <p
                    className="bp-editorial mt-2"
                    style={{ fontSize: "14px", color: "var(--bone)", opacity: 0.6 }}
                  >
                    Choose your preferred signer.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowWalletModal(false);
                    setAuthLoading(null);
                  }}
                  className="bp-label transition-colors hover:text-[var(--teal)]"
                  style={{ fontSize: "11px" }}
                >
                  CLOSE
                </button>
              </div>

              {/* Error */}
              {walletError && (
                <div
                  className="mx-6 mb-4 px-4 py-3"
                  style={{
                    border: "1px solid var(--bone-20)",
                    background: "rgba(201, 123, 94, 0.05)",
                  }}
                >
                  <p
                    className="bp-label"
                    style={{ color: "var(--teal)", letterSpacing: "0.15em" }}
                  >
                    {walletError}
                  </p>
                </div>
              )}

              {/* Wallet list */}
              <div className="px-6 pb-4 space-y-2">
                <div className="bp-label" style={{ fontSize: "9px", letterSpacing: "0.3em", color: "var(--dim)", textTransform: "uppercase", padding: "4px 4px 8px" }}>— Solana wallets</div>
                {/* Native Solana wallets — Phantom + Solflare via wallet-adapter */}
                {(["Phantom", "Solflare"] as const).map((name, i) => (
                  <button
                    key={`sol-${name}`}
                    onClick={() => handleNativeSolana(name as WalletName)}
                    disabled={authLoading !== null}
                    className="w-full flex items-center justify-between px-4 py-4 transition-all duration-200 group disabled:opacity-50"
                    style={{
                      border: "1px solid var(--bone-10)",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--teal)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--bone-10)";
                    }}
                  >
                    <div className="text-left">
                      <div className="bp-label" style={{ fontSize: "10px", marginBottom: "6px" }}>
                        SOLANA · {String(i + 1).padStart(2, "0")}
                      </div>
                      <div
                        className="font-display"
                        style={{
                          fontWeight: 300,
                          fontSize: "18px",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          color: "var(--bone)",
                        }}
                      >
                        {name}
                      </div>
                    </div>
                    <span className="bp-label" style={{ fontSize: "10px" }}>→</span>
                  </button>
                ))}
                </div>

              {/* Footer */}
              <div
                className="px-6 py-4"
                style={{ borderTop: "1px solid var(--bone-10)" }}
              >
                <p className="bp-label" style={{ fontSize: "9px", letterSpacing: "0.2em" }}>
                  By connecting, you sign a message to verify wallet ownership.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
