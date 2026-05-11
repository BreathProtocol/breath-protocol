"use client";
import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

const RPC_OR_NETWORK =
  process.env.NEXT_PUBLIC_SOLANA_RPC ||
  process.env.NEXT_PUBLIC_SOLANA_NETWORK ||
  "mainnet-beta";

export default function SolanaWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const endpoint = useMemo(() => {
    // If env points to a full RPC URL, use it as-is; otherwise treat as cluster name.
    if (RPC_OR_NETWORK.startsWith("http")) return RPC_OR_NETWORK;
    try {
      // clusterApiUrl accepts "mainnet-beta" | "testnet" | "devnet"
      return clusterApiUrl(RPC_OR_NETWORK as "mainnet-beta" | "testnet" | "devnet");
    } catch {
      return clusterApiUrl("mainnet-beta");
    }
  }, []);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
