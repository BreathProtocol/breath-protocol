"use client";
import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";

/**
 * Modern Phantom / Solflare register themselves via the Wallet Standard
 * protocol, so the legacy `PhantomWalletAdapter` / `SolflareWalletAdapter`
 * are intentionally NOT included here. `useWallet().wallets` will still
 * contain both wallets at runtime.
 */

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
    if (RPC_OR_NETWORK.startsWith("http")) return RPC_OR_NETWORK;
    try {
      return clusterApiUrl(
        RPC_OR_NETWORK as "mainnet-beta" | "testnet" | "devnet"
      );
    } catch {
      return clusterApiUrl("mainnet-beta");
    }
  }, []);

  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect={false}>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}
