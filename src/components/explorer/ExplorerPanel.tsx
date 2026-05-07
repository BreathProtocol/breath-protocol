/**
 * BreathPrint Explorer Panel
 *
 * Dashboard component that shows:
 * - Identity verification status
 * - On-chain transaction history with Solscan links
 * - Compressed account details
 *
 * Place this in the "Explorer" section of the breath-protocol dashboard.
 */

import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";

// Types matching the SDK
interface IdentityStatus {
  owner: string;
  commitment: string;
  isVerified: boolean;
  verificationCount: number;
  registeredAt: number;
  lastVerifiedAt: number;
}

interface TransactionRecord {
  signature: string;
  solscanUrl: string;
  type: "registration" | "verification" | "revocation";
  timestamp: number;
}

interface ExplorerPanelProps {
  breathPrintClient: any; // BreathPrintClient instance from SDK
}

export const ExplorerPanel: React.FC<ExplorerPanelProps> = ({ breathPrintClient }) => {
  const { publicKey } = useWallet();
  const [identity, setIdentity] = useState<IdentityStatus | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey || !breathPrintClient) return;
    loadData();
  }, [publicKey, breathPrintClient]);

  async function loadData() {
    if (!publicKey) return;
    setLoading(true);
    setError(null);

    try {
      const [status, txHistory] = await Promise.all([
        breathPrintClient.getIdentityStatus(publicKey),
        breathPrintClient.getTransactionHistory(publicKey),
      ]);

      setIdentity(status);
      setTransactions(txHistory);
    } catch (err: any) {
      setError(err.message || "Failed to load identity data");
    } finally {
      setLoading(false);
    }
  }

  function formatTimestamp(ts: number): string {
    if (!ts) return "—";
    return new Date(ts * 1000).toLocaleString();
  }

  function shortenSignature(sig: string): string {
    return `${sig.slice(0, 8)}...${sig.slice(-8)}`;
  }

  function shortenCommitment(hex: string): string {
    return `0x${hex.slice(0, 12)}...${hex.slice(-8)}`;
  }

  if (!publicKey) {
    return (
      <div className="explorer-panel">
        <h2>Block Explorer</h2>
        <p className="text-muted">Connect your wallet to view identity records.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="explorer-panel">
        <h2>Block Explorer</h2>
        <div className="loading-spinner">Loading compressed account data...</div>
      </div>
    );
  }

  return (
    <div className="explorer-panel">
      <h2>Block Explorer</h2>

      {/* Identity Status Card */}
      <div className="identity-card">
        <div className="identity-header">
          <div className={`status-badge ${identity?.isVerified ? "verified" : "pending"}`}>
            {identity?.isVerified ? "✓ VERIFIED" : "○ PENDING"}
          </div>
          <button onClick={loadData} className="refresh-btn" title="Refresh">
            ↻
          </button>
        </div>

        {identity ? (
          <div className="identity-details">
            <div className="detail-row">
              <span className="label">Wallet</span>
              <a
                href={`https://solscan.io/account/${identity.owner}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="value link"
              >
                {identity.owner.slice(0, 6)}...{identity.owner.slice(-4)}
              </a>
            </div>

            <div className="detail-row">
              <span className="label">Commitment</span>
              <span className="value mono">{shortenCommitment(identity.commitment)}</span>
            </div>

            <div className="detail-row">
              <span className="label">Registered</span>
              <span className="value">{formatTimestamp(identity.registeredAt)}</span>
            </div>

            <div className="detail-row">
              <span className="label">Last verified</span>
              <span className="value">{formatTimestamp(identity.lastVerifiedAt)}</span>
            </div>

            <div className="detail-row">
              <span className="label">Verifications</span>
              <span className="value">{identity.verificationCount}</span>
            </div>

            <div className="detail-row">
              <span className="label">Storage type</span>
              <span className="value">
                Light Protocol compressed PDA
                <span className="cost-badge">~0.000015 SOL</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="no-identity">
            <p>No biometric identity registered yet.</p>
            <p className="text-muted">Complete the verification flow to register.</p>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="tx-section">
        <h3>Transaction history</h3>

        {transactions.length === 0 ? (
          <p className="text-muted">No transactions found.</p>
        ) : (
          <div className="tx-list">
            {transactions.map((tx, i) => (
              <div key={tx.signature} className="tx-row">
                <div className="tx-icon">
                  {tx.type === "registration" && "🔐"}
                  {tx.type === "verification" && "✅"}
                  {tx.type === "revocation" && "❌"}
                </div>

                <div className="tx-info">
                  <div className="tx-type">
                    {tx.type === "registration" && "Biometric registered"}
                    {tx.type === "verification" && "Breathing verified"}
                    {tx.type === "revocation" && "Identity revoked"}
                  </div>
                  <div className="tx-time">{formatTimestamp(tx.timestamp)}</div>
                </div>

                <a
                  href={tx.solscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tx-link"
                >
                  {shortenSignature(tx.signature)} ↗
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Raw Solscan Links */}
      {identity && (
        <div className="solscan-section">
          <h3>Verify on Solscan</h3>
          <div className="solscan-links">
            <a
              href={`https://solscan.io/account/${identity.owner}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="solscan-btn"
            >
              View wallet account ↗
            </a>
            <a
              href={`https://solscan.io/account/${BREATHPRINT_PROGRAM_ID}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="solscan-btn"
            >
              View program ↗
            </a>
          </div>
        </div>
      )}

      {error && <div className="error-msg">{error}</div>}
    </div>
  );
};

const BREATHPRINT_PROGRAM_ID = "BPrnt1111111111111111111111111111111111111";

export default ExplorerPanel;
