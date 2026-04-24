import { http, createConfig } from "wagmi";
import { mainnet, polygon, base, arbitrum, optimism } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";

// WalletConnect Project ID — get yours at https://cloud.walletconnect.com
// Using a placeholder — replace with your own
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "breath-protocol-placeholder";

export const config = createConfig({
  chains: [mainnet, polygon, base, arbitrum, optimism],
  connectors: [
    injected(), // MetaMask, Coinbase Wallet, Brave, etc.
    walletConnect({
      projectId: WALLETCONNECT_PROJECT_ID,
      metadata: {
        name: "Breath Protocol",
        description: "Your decentralized identity hub",
        url: "https://breathprotocol.io",
        icons: [],
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
});
