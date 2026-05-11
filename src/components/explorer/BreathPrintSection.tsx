"use client";

/**
 * BreathPrint section for the dashboard Explorer.
 *
 * Reads `?wallet=<solana_pubkey>` from the URL and queries Light Protocol
 * compression signatures via the Helius RPC indexer. Renders a list of the
 * user's on-chain biometric attestations with Solscan links.
 *
 * No wallet-adapter dependency — wallet pubkey comes from URL or a prop, so
 * this works in the existing EVM-focused app without restructuring providers.
 */

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PublicKey } from "@solana/web3.js";
import { createRpc } from "@lightprotocol/stateless.js";
import { useSolanaWallet } from "@/components/auth/Web3AuthSolanaProvider";
import SolanaConnectButton from "@/components/auth/SolanaConnectButton";

const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY ?? "";
const PROGRAM_ID =
  process.env.NEXT_PUBLIC_BREATHPRINT_PROGRAM_ID ??
  "BPrnt1111111111111111111111111111111111111";
const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";

interface TxRecord {
  signature: string;
  slot: number;
  blockTime: number | null;
  type: string;
  solscanUrl: string;
}

const solscanTx = (sig: string) => `https://solscan.io/tx/${sig}?cluster=${NETWORK}`;
const solscanAccount = (a: string) => `https://solscan.io/account/${a}?cluster=${NETWORK}`;

function shortHash(s: string, head = 6, tail = 4) {
  if (!s || s.length < head + tail + 2) return s;
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}

function formatTime(ts: number | null) {
  if (!ts) return "—";
  return new Date(ts * 1000).toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

export interface BreathPrintSectionProps {
  /** Override the URL-param wallet (e.g. from a connected wallet). */
  wallet?: string;
}

export default function BreathPrintSection({ wallet: walletProp }: BreathPrintSectionProps = {}) {
  const params = useSearchParams();
  const { publicKey: connectedKey } = useSolanaWallet();

  // Priority: explicit prop → connected Web3Auth wallet → ?wallet= URL param
  const walletStr =
    walletProp ?? connectedKey?.toBase58() ?? params.get("wallet") ?? "";

  const wallet = useMemo<PublicKey | null>(() => {
    if (!walletStr) return null;
    try { return new PublicKey(walletStr); } catch { return null; }
  }, [walletStr]);

  const rpc = useMemo(() => {
    if (!HELIUS_API_KEY) return null;
    const url = `https://${NETWORK}.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
    return createRpc(url, url);
  }, []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txs, setTxs] = useState<TxRecord[]>([]);

  useEffect(() => {
    if (!wallet || !rpc) return;
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const sigs = await rpc.getCompressionSignaturesForOwner(wallet);
        const records: TxRecord[] = (sigs.items ?? []).map((sig: { signature: string; slot?: number; blockTime?: number; type?: string }) => ({
          signature: sig.signature,
          slot: sig.slot ?? 0,
          blockTime: sig.blockTime ?? null,
          type: sig.type ?? "compressed",
          solscanUrl: solscanTx(sig.signature),
        }));
        if (!cancelled) setTxs(records);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "RPC error";
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [wallet, rpc]);

  return (
    <div className="bp-card p-6 md:p-8 space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <div className="bp-eyebrow mb-3">BREATHPRINT · LIGHT PROTOCOL</div>
          <h2 className="bp-display" style={{ fontSize: "clamp(24px, 3vw, 32px)" }}>
            On-chain identity
          </h2>
          <p className="bp-editorial mt-2" style={{ fontSize: "13px", opacity: 0.6 }}>
            ZK-compressed biometric commitments on Solana {NETWORK}. ~0.000015 SOL per attestation.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <SolanaConnectButton />
          <a
            href={solscanAccount(PROGRAM_ID)}
            target="_blank"
            rel="noopener noreferrer"
            className="bp-label"
            style={{ fontSize: "10px", color: "var(--teal)" }}
          >
            PROGRAM {shortHash(PROGRAM_ID, 6, 4)} ↗
          </a>
        </div>
      </div>

      {!wallet && (
        <div className="text-sm bp-editorial" style={{ opacity: 0.65 }}>
          Connect a Solana wallet via Web3Auth to view your on-chain BreathPrint
          attestations. You can also append <code>?wallet=&lt;solana_pubkey&gt;</code>
          to inspect any specimen.
        </div>
      )}

      {wallet && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="bp-eyebrow mb-2">SPECIMEN</div>
            <a
              href={solscanAccount(wallet.toBase58())}
              target="_blank"
              rel="noopener noreferrer"
              className="bp-readout"
              style={{ fontSize: "12px", color: "var(--teal)", wordBreak: "break-all" }}
            >
              {shortHash(wallet.toBase58(), 8, 6)} ↗
            </a>
          </div>
          <div>
            <div className="bp-eyebrow mb-2">ATTESTATIONS</div>
            <div className="bp-display" style={{ fontSize: "28px", color: "var(--bone)" }}>
              {loading ? "…" : txs.length}
            </div>
          </div>
          <div>
            <div className="bp-eyebrow mb-2">NETWORK</div>
            <div className="bp-readout" style={{ fontSize: "12px" }}>{NETWORK.toUpperCase()}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="text-sm" style={{ color: "#FF6B8F" }}>
          <span className="bp-label">RPC ERROR · </span>{error}
        </div>
      )}

      {wallet && !loading && !error && txs.length === 0 && (
        <div className="bp-editorial text-sm" style={{ opacity: 0.55 }}>
          No on-chain attestations for this specimen yet.
        </div>
      )}

      {txs.length > 0 && (
        <div className="space-y-2">
          {txs.map((tx) => (
            <a
              key={tx.signature}
              href={tx.solscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="grid grid-cols-12 gap-3 items-center py-3 px-4 rounded transition"
              style={{ borderLeft: "2px solid transparent", borderBottom: "1px solid var(--bone-10)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderLeftColor = "var(--teal)";
                e.currentTarget.style.background = "rgba(201, 123, 94, 0.03)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderLeftColor = "transparent";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <div className="col-span-7 bp-readout" style={{ color: "var(--teal)", fontSize: "12px" }}>
                {shortHash(tx.signature, 12, 8)}
              </div>
              <div className="col-span-2 bp-label" style={{ fontSize: "10px" }}>
                {tx.type.toUpperCase()}
              </div>
              <div className="col-span-2 bp-readout text-right" style={{ fontSize: "10px", opacity: 0.7 }}>
                SLOT {tx.slot.toLocaleString()}
              </div>
              <div className="col-span-1 bp-label text-right" style={{ fontSize: "10px", opacity: 0.5 }}>
                {formatTime(tx.blockTime).slice(11, 16)}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
