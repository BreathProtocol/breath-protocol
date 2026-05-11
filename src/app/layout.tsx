import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/layout/ThemeProvider";
import AuthProvider from "@/components/auth/AuthProvider";
import Web3AuthSolanaProvider from "@/components/auth/Web3AuthSolanaProvider";
import SolanaWalletProvider from "@/components/auth/SolanaWalletProvider";
import AmbientBackground from "@/components/layout/AmbientBackground";
import HUD from "@/components/layout/HUD";
import Cursor from "@/components/layout/Cursor";

export const metadata: Metadata = {
  title: "Breath Protocol — Vertebra Atlas",
  description:
    "A living ledger of who you are. Prove, verify, and own your credentials on-chain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@200;300;400&family=JetBrains+Mono:wght@300;400;500&family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full overflow-hidden">
        <AmbientBackground />
          <SolanaWalletProvider>
            <Web3AuthSolanaProvider>
            <AuthProvider>
              <ThemeProvider>
                <div className="relative z-[1] h-full">{children}</div>
              </ThemeProvider>
            </AuthProvider>
          </Web3AuthSolanaProvider>
          </SolanaWalletProvider>
        <HUD />
        <Cursor />
      </body>
    </html>
  );
}
