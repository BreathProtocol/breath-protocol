"use client";

/**
 * BreathPrint section for the dashboard Explorer.
 *
 * Resolves attestations from two sources, merged by tx signature:
 *   1. Supabase `public.attestations` — rows the verify.breath.id flow
 *      inserts after each successful run. Always available.
 *   2. Helius RPC compression-signature indexer — real on-chain
 *      attestations from the BreathPrint program once it's broadcasting.
 *      Skipped silently when the API key is missing or rejected.
 *
 * Wallet pubkey comes from explicit prop, the connected wallet in
 * AuthProvider, or `?wallet=<pubkey>` on the URL (used by the
 * cross-domain handoff from verify.breath.id).
 */

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PublicKey } from "@solana/web3.js";
import { createRpc } from "@lightprotocol/stateless.js";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";

const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY ?? "";
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
  const { walletAddress: connectedAddr } = useAuth();

  // Priority: explicit prop → connected Web3Auth wallet → ?wallet= URL param
  const walletStr =
    walletProp ?? connectedAddr ?? params.get("wallet") ?? "";

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
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);

      // 1) Supabase attestations (verify.breath.id writes here). Always
      //    available. If we have a wallet, filter by it; otherwise show
      //    the most recent rows globally so the demo always has content.
      const supabaseRecords: TxRecord[] = [];
      try {
        let q = supabase
          .from("attestations")
          .select("tx_signature, attestation_type, slot, created_at, cluster, wallet_address")
          .order("created_at", { ascending: false })
          .limit(50);
        if (wallet) q = q.ilike("wallet_address", wallet.toBase58());
        const { data, error: dbErr } = await q;
        if (dbErr) throw dbErr;
        for (const row of data ?? []) {
          supabaseRecords.push({
            signature: row.tx_signature,
            slot: row.slot ?? 0,
            blockTime: row.created_at
              ? Math.floor(new Date(row.created_at).getTime() / 1000)
              : null,
            type: row.attestation_type ?? "breathprint",
            solscanUrl: solscanTx(row.tx_signature),
          });
        }
      } catch (e) {
        console.warn("[breathprint] supabase fetch failed:", e);
      }

      // 2) Helius on-chain index (optional — silenced on 401/no key).
      //    Only meaningful when we have a wallet to query for.
      const onchainRecords: TxRecord[] = [];
      if (rpc && wallet) {
        try {
          const sigs = await rpc.getCompressionSignaturesForOwner(wallet);
          for (const sig of (sigs.items ?? []) as {
            signature: string;
            slot?: number;
            blockTime?: number;
            type?: string;
          }[]) {
            onchainRecords.push({
              signature: sig.signature,
              slot: sig.slot ?? 0,
              blockTime: sig.blockTime ?? null,
              type: sig.type ?? "compressed",
              solscanUrl: solscanTx(sig.signature),
            });
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : "";
          console.warn("[breathprint] RPC unreachable:", msg);
        }
      }

      // Merge, dedupe by signature, newest first.
      const merged = new Map<string, TxRecord>();
      for (const r of [...onchainRecords, ...supabaseRecords]) {
        merged.set(r.signature, r);
      }
      const records = Array.from(merged.values()).sort(
        (a, b) => (b.blockTime ?? 0) - (a.blockTime ?? 0),
      );

      if (!cancelled) {
        setTxs(records);
        setError(null);
        setLoading(false);
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
            ZK-compressed biometric commitments on Solana {NETWORK}. ~0.0003 SOL per attestation.
          </p>
        </div>
      </div>

      {/* Stats row — always visible. ATTESTATIONS count is zero-padded
          so a brand-new user lands on "01" right after their first proof. */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="bp-eyebrow mb-2">SPECIMEN</div>
          {wallet ? (
            <a
              href={solscanAccount(wallet.toBase58())}
              target="_blank"
              rel="noopener noreferrer"
              className="bp-readout"
              style={{ fontSize: "12px", color: "var(--teal)", wordBreak: "break-all" }}
            >
              {shortHash(wallet.toBase58(), 8, 6)} ↗
            </a>
          ) : (
            <div className="bp-readout" style={{ fontSize: "12px", opacity: 0.5 }}>
              —
            </div>
          )}
        </div>
        <div>
          <div className="bp-eyebrow mb-2">PROOFS</div>
          <div
            className="bp-display"
            style={{ fontSize: "28px", color: "var(--bone)" }}
          >
            {loading
              ? "…"
              : String(txs.length).padStart(2, "0")}
          </div>
          {!loading && txs.length > 0 && (
            <div className="bp-label" style={{ fontSize: "10px", marginTop: "4px" }}>
              {txs.length === 1 ? "PROOF REGISTERED" : "PROOFS REGISTERED"}
            </div>
          )}
        </div>
        <div>
          <div className="bp-eyebrow mb-2">NETWORK</div>
          <div className="bp-readout" style={{ fontSize: "12px" }}>{NETWORK.toUpperCase()}</div>
        </div>
      </div>

      {!loading && txs.length === 0 && (
        <div className="bp-editorial text-sm" style={{ opacity: 0.55 }}>
          No attestations yet. Complete a biometric verification to register your first proof.
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
