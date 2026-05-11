"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { useConnect, useAccount, useSignMessage, useDisconnect } from "wagmi";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletName } from "@solana/wallet-adapter-base";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle, signInWithWallet, signInWithSolana } = useAuth();
  const [authLoading, setAuthLoading] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  // Wagmi hooks
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  // On mount: clear any stale wagmi connection from previous EVM-flow attempts.
  useEffect(() => {
    try { disconnect(); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleWalletSign = async (walletAddress: string) => {
    try {
      // Deterministic message — same wallet always produces the same signature,
      // which becomes a stable password in Supabase. (Was previously broken
      // by including Date.now() in the message.)
      const message = `Sign in to Breath Protocol\n\nWallet: ${walletAddress}`;
      const signature = await signMessageAsync({ message });
      await signInWithWallet(walletAddress, signature, message);
      router.push("/dashboard");
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e ?? "");
      console.error("[wallet sign-in]", e);
      if (/user (rejected|denied)|rejected request|rejected the request/i.test(msg)) {
        setWalletError("Signature request rejected in wallet.");
      } else if (msg) {
        setWalletError(msg);
      } else {
        setWalletError("Authentication failed. Open the browser console for details.");
      }
      disconnect();
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
      type SolanaProvider = {
        publicKey?: { toBase58: () => string } | null;
        isConnected?: boolean;
        connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toBase58: () => string } }>;
        disconnect?: () => Promise<void>;
        signMessage: (
          m: Uint8Array,
          encoding?: string
        ) => Promise<{ signature: Uint8Array } | Uint8Array>;
      };

      const w = (typeof window !== "undefined" ? window : ({} as Record<string, unknown>)) as Record<string, unknown>;
      const name = String(walletName);

      let provider: SolanaProvider | undefined;
      if (name === "Phantom") {
        provider = (w["phantom"] as { solana?: SolanaProvider } | undefined)?.solana;
        if (!provider) {
          throw new Error("Phantom is not installed. Install it from phantom.app and reload this page.");
        }
      } else if (name === "Solflare") {
        provider = w["solflare"] as SolanaProvider | undefined;
        if (!provider) {
          throw new Error("Solflare is not installed. Install it from solflare.com and reload this page.");
        }
      } else {
        throw new Error(`Unsupported wallet: ${name}`);
      }

      // Trigger the wallet popup
      const connectRes = await provider.connect();
      const pk = (connectRes?.publicKey ?? provider.publicKey) as { toBase58: () => string } | null | undefined;
      if (!pk) throw new Error(`${name} did not return a public key.`);
      const pubkey = pk.toBase58();

      // Sign the canonical message
      const msg = new TextEncoder().encode(
        `Sign in to Breath Protocol\n\nWallet: ${pubkey}`
      );
      const signRes = await provider.signMessage(msg, "utf8");
      const sigBytes: Uint8Array =
        signRes instanceof Uint8Array
          ? signRes
          : (signRes as { signature: Uint8Array }).signature;
      if (!sigBytes || !sigBytes.length) {
        throw new Error(`${name} returned an empty signature.`);
      }
      const sigBase64 = btoa(String.fromCharCode(...sigBytes));

      await signInWithSolana(pubkey, sigBase64);
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

  const handleWalletConnect = (connectorIndex: number) => {
    setWalletError(null);
    setAuthLoading("wallet");
    const connector = connectors[connectorIndex];
    if (connector) {
      connect({ connector });
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
