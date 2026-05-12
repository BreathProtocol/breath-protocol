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
  const [walletPickerOpen, setWalletPickerOpen] = useState(false);
  const w3a = useSolanaWallet();

  // Wallet Standard detects every Solana wallet installed in the browser
  // (Phantom, Solflare, Backpack, Glow, Brave, etc.) through a different
  // injection path than `window.phantom.solana`. Phantom registers itself
  // via Wallet Standard *in addition to* the legacy path, so this is a
  // completely separate code path inside the extension — when the legacy
  // signMessage throws "Unexpected error", the Wallet Standard feature
  // (`solana:signMessage`) often still works.
  const sol = useWallet();

  // Step trace in the console only — on-page panel was distracting.
  const log = (msg: string) => {
    console.log("[breath-auth]", msg);
  };

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
      log("start: detecting injected Solana wallet");
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
      log(`provider: ${provider ? walletName : "NONE"}`);
      if (!provider) {
        throw new Error("No Solana wallet detected. Install Phantom or Solflare and reload.");
      }

      // Phantom on this user's machine throws `Me: Unexpected error` from
      // its internal `#n` method when we call signIn() or signMessage()
      // directly. Different Phantom API entry points sometimes route to
      // different internal handlers, so we try them in order and surface
      // the first one that succeeds.
      type SignInResult = {
        signature: Uint8Array;
        signedMessage: Uint8Array;
        account: { publicKey: { toBase58?: () => string } | string };
      };
      type SolProviderFull = SolProvider & {
        signIn?: (input?: { domain?: string; statement?: string; uri?: string }) => Promise<SignInResult>;
        request?: (args: { method: string; params?: Record<string, unknown> }) => Promise<unknown>;
        disconnect?: () => Promise<void>;
      };
      const provFull = provider as SolProviderFull;

      // Wipe any stale connection state — Phantom occasionally returns
      // stuck "Unexpected error" if a previous session is half-cached.
      try {
        if (typeof provFull.disconnect === "function") {
          await provFull.disconnect();
          log("provider.disconnect() ok");
        }
      } catch (e) {
        log(`disconnect threw (ignored): ${e instanceof Error ? e.message : String(e)}`);
      }

      let pubkey: string = "";
      let sigBytes: Uint8Array | null = null;
      let signedMessageText: string = "";
      const errors: string[] = [];

      // Always connect first so we have the public key.
      log("calling provider.connect()");
      const connectRes = await provFull.connect();
      const pkObj = (connectRes?.publicKey ?? provFull.publicKey) as { toBase58: () => string } | null | undefined;
      if (!pkObj) throw new Error(`${walletName} did not return a public key.`);
      pubkey = pkObj.toBase58();
      log(`connected. pubkey: ${pubkey.slice(0, 8)}…`);

      // Strategy 1: legacy signMessage(Uint8Array)
      if (!sigBytes) {
        try {
          log("[strategy 1] provider.signMessage(bytes)");
          signedMessageText = `Sign in to Breath Protocol\n\nWallet: ${pubkey}`;
          const msg = new TextEncoder().encode(signedMessageText);
          const signRes = await provFull.signMessage(msg);
          sigBytes =
            signRes instanceof Uint8Array
              ? signRes
              : (signRes as { signature: Uint8Array }).signature;
          log(`[strategy 1] ok, ${sigBytes.length} bytes`);
        } catch (e) {
          const m = e instanceof Error ? e.message : String(e);
          errors.push(`signMessage: ${m}`);
          log(`[strategy 1] failed: ${m}`);
        }
      }

      // Strategy 2: signMessage with explicit 'utf8' encoding hint
      if (!sigBytes) {
        try {
          log("[strategy 2] provider.signMessage(bytes, 'utf8')");
          signedMessageText = `Sign in to Breath Protocol\n\nWallet: ${pubkey}`;
          const msg = new TextEncoder().encode(signedMessageText);
          const signRes = await provFull.signMessage(msg, "utf8");
          sigBytes =
            signRes instanceof Uint8Array
              ? signRes
              : (signRes as { signature: Uint8Array }).signature;
          log(`[strategy 2] ok, ${sigBytes.length} bytes`);
        } catch (e) {
          const m = e instanceof Error ? e.message : String(e);
          errors.push(`signMessage(utf8): ${m}`);
          log(`[strategy 2] failed: ${m}`);
        }
      }

      // Strategy 3: RPC-style request({ method: 'signMessage', ... })
      if (!sigBytes && typeof provFull.request === "function") {
        try {
          log("[strategy 3] provider.request({method:'signMessage'})");
          signedMessageText = `Sign in to Breath Protocol\n\nWallet: ${pubkey}`;
          const msg = new TextEncoder().encode(signedMessageText);
          const r = (await provFull.request({
            method: "signMessage",
            params: { message: msg, display: "utf8" },
          })) as { signature: Uint8Array } | Uint8Array;
          sigBytes = r instanceof Uint8Array ? r : (r.signature as Uint8Array);
          // The request() shape sometimes returns a base58 string — normalise.
          if (typeof (sigBytes as unknown) === "string") {
            const { default: bs58dec } = await import("bs58");
            sigBytes = bs58dec.decode(sigBytes as unknown as string);
          }
          log(`[strategy 3] ok, ${sigBytes.length} bytes`);
        } catch (e) {
          const m = e instanceof Error ? e.message : String(e);
          errors.push(`request(signMessage): ${m}`);
          log(`[strategy 3] failed: ${m}`);
        }
      }

      // Strategy 4: SIWS signIn() — newer code path
      if (!sigBytes && typeof provFull.signIn === "function") {
        try {
          log("[strategy 4] provider.signIn()");
          const r = await provFull.signIn();
          sigBytes = r.signature;
          signedMessageText = new TextDecoder().decode(r.signedMessage);
          const acct = r.account.publicKey;
          pubkey = typeof acct === "string" ? acct : acct.toBase58!();
          log(`[strategy 4] ok, ${sigBytes.length} bytes`);
        } catch (e) {
          const m = e instanceof Error ? e.message : String(e);
          errors.push(`signIn: ${m}`);
          log(`[strategy 4] failed: ${m}`);
        }
      }

      if (!sigBytes) {
        throw new Error(
          `All Phantom signing methods failed: ${errors.join(" | ")}. Your Phantom extension may need to be removed and re-installed.`
        );
      }

      const { default: bs58 } = await import("bs58");
      const sigBase58 = bs58.encode(sigBytes);
      log(`sig base58: ${sigBase58.slice(0, 12)}…`);

      // Server verifies the ed25519 signature, finds-or-creates the user via
      // the Supabase admin SDK, and returns a one-time OTP we redeem for a
      // real session.
      log("POST /api/auth/solana");
      const resp = await fetch("/api/auth/solana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pubkey,
          signature: sigBase58,
          message: signedMessageText,
        }),
      });
      log(`server status: ${resp.status}`);
      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || `Server auth failed (${resp.status})`);
      }
      const { email, token } = (await resp.json()) as { email: string; token: string };
      log(`got OTP for ${email}, verifying…`);
      const { error: otpError, data: otpData } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "email",
      });
      if (otpError) throw new Error(`OTP verify failed: ${otpError.message}`);
      log(`session attached: ${otpData?.session?.user?.id?.slice(0, 8)}… → /dashboard`);

      // Hard-redirect so AuthProvider re-hydrates the session from storage.
      window.location.assign("/dashboard");
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

      // After connect() resolves, the provider sometimes takes a tick to
      // populate publicKey (especially when the popup-close detection was
      // delayed by COOP). Poll briefly instead of failing immediately.
      let addr = w3a.publicKey?.toBase58();
      for (let i = 0; i < 20 && !addr; i++) {
        await new Promise((r) => setTimeout(r, 250));
        addr = w3a.publicKey?.toBase58();
      }
      if (!addr) throw new Error("Web3Auth connected but never returned a public key (popup-blocker or COOP).");

      const message = `Sign in to Breath Protocol\n\nWallet: ${addr}`;
      const signature = await w3a.signMessage(message); // base58-encoded already
      log(`web3auth signed for ${addr.slice(0, 8)}…`);

      // Go through the same server-verified path as direct wallet sign-in
      // (which we proved works end-to-end) instead of the synthetic-email
      // signInWithPassword path that has been flaky.
      const resp = await fetch("/api/auth/solana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubkey: addr, signature, message }),
      });
      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || `Server auth failed (${resp.status})`);
      }
      const { email, token } = (await resp.json()) as { email: string; token: string };
      const { error: otpError } = await supabase.auth.verifyOtp({ email, token, type: "email" });
      if (otpError) throw new Error(`OTP verify failed: ${otpError.message}`);

      window.location.assign("/dashboard");
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

  // Wallet Standard path: pick a wallet, connect, sign via the feature
  // protocol (different code path than legacy window.phantom).
  const signInWithWalletStandard = async (walletName: string) => {
    setWalletError(null);
    setAuthLoading("wallet");
    try {
      const adapter = sol.wallets.find((w) => w.adapter.name === walletName)?.adapter;
      if (!adapter) throw new Error(`${walletName} adapter not found`);
      log(`[ws] select ${walletName}`);
      sol.select(adapter.name);
      log("[ws] connecting…");
      await adapter.connect();
      const pk = adapter.publicKey;
      if (!pk) throw new Error(`${walletName} returned no public key`);
      const pubkey = pk.toBase58();
      log(`[ws] connected ${pubkey.slice(0, 8)}…`);

      const signedMessageText = `Sign in to Breath Protocol\n\nWallet: ${pubkey}`;
      const msg = new TextEncoder().encode(signedMessageText);
      log("[ws] signMessage via wallet-standard feature");
      // @solana/wallet-adapter-react routes through the `solana:signMessage`
      // Wallet Standard feature, NOT window.phantom.solana.signMessage.
      const sigBytes = await (adapter as unknown as {
        signMessage: (m: Uint8Array) => Promise<Uint8Array>;
      }).signMessage(msg);
      log(`[ws] got ${sigBytes.length} sig bytes`);

      const { default: bs58 } = await import("bs58");
      const sigBase58 = bs58.encode(sigBytes);

      const resp = await fetch("/api/auth/solana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pubkey, signature: sigBase58, message: signedMessageText }),
      });
      if (!resp.ok) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || `Server auth failed (${resp.status})`);
      }
      const { email, token } = (await resp.json()) as { email: string; token: string };
      const { error: otpError } = await supabase.auth.verifyOtp({ email, token, type: "email" });
      if (otpError) throw new Error(`OTP verify failed: ${otpError.message}`);

      window.location.assign("/dashboard");
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e ?? "");
      console.error("[wallet-standard]", e);
      setWalletError(m || "Wallet sign-in failed.");
      setAuthLoading(null);
      setWalletPickerOpen(false);
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
              onClick={() => {
                setWalletError(null);
                setWalletPickerOpen(true);
              }}
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

          {/* Wallet picker — lists every Solana wallet the browser detects
              via the Wallet Standard protocol. */}
          {walletPickerOpen && (
            <div
              className="mt-4 p-4"
              style={{
                border: "1px solid rgba(31, 26, 20, 0.16)",
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="bp-label" style={{ fontSize: "10px" }}>
                  SELECT WALLET
                </span>
                <button
                  onClick={() => setWalletPickerOpen(false)}
                  className="bp-label hover:opacity-100"
                  style={{ fontSize: "10px", opacity: 0.6 }}
                >
                  CLOSE
                </button>
              </div>

              {sol.wallets.length === 0 && (
                <div
                  className="bp-editorial text-center py-6"
                  style={{ fontSize: "13px", opacity: 0.7 }}
                >
                  No Solana wallet detected.
                  <br />
                  Install Phantom, Solflare, Backpack, or Glow and reload.
                </div>
              )}

              <div className="space-y-2">
                {sol.wallets.map((w) => (
                  <button
                    key={w.adapter.name}
                    onClick={() => signInWithWalletStandard(w.adapter.name)}
                    disabled={authLoading !== null}
                    className="w-full flex items-center justify-between px-4 py-3 transition-colors disabled:opacity-50"
                    style={{
                      border: "1px solid rgba(31, 26, 20, 0.16)",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--teal)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(31, 26, 20, 0.16)";
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "var(--bone)" }}>
                      {w.adapter.name}
                    </span>
                    <span
                      className="bp-label"
                      style={{ fontSize: "9px", opacity: 0.55 }}
                    >
                      {w.readyState}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error (single line) — full step log stays in the browser console only */}
          {walletError && (
            <div
              className="mt-5 px-4 py-3 text-center bp-label"
              style={{
                border: "1px solid rgba(31, 26, 20, 0.16)",
                background: "rgba(201, 123, 94, 0.06)",
                color: "var(--teal)",
                fontSize: "11px",
              }}
            >
              {walletError}
            </div>
          )}

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
