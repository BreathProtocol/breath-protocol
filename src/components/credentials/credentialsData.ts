export interface Credential {
  name: string;
  type: string;
  category: "Finance" | "Identity";
  description: string;
  gradient: string;
  initial: string;
  verified: boolean;
}

export const credentials: Credential[] = [
  // ── Finance (4) ──────────────────────────────
  { name: "Proof of Assets", type: "Finance", category: "Finance", description: "Connect your wallets and banks to reflect on-chain and USD balances, unlocking tiers at $100, $10K, $1M.", gradient: "from-signal-rose to-[#E05585]", initial: "PA", verified: false },
  { name: "Proof of Investments", type: "Finance", category: "Finance", description: "Show verified balances across your investment accounts and on-chain portfolios. Balances are rounded to", gradient: "from-signal-rose to-[#D04070]", initial: "PI", verified: false },
  { name: "Proof of Retirement Savin...", type: "Finance", category: "Finance", description: "Demonstrate your verified retirement savings from accounts like 401(k) and IRAs, including long-term", gradient: "from-signal-rose to-[#C03060]", initial: "PR", verified: false },
  { name: "Proof of Mortgage", type: "Finance", category: "Finance", description: "Verify outstanding mortgage balances from your linked lending institutions, rounded to the", gradient: "from-signal-rose to-[#B02050]", initial: "PM", verified: false },

  // ── Identity (2) ─────────────────────────────
  { name: "Proof of KYC", type: "Identity", category: "Identity", description: "Verify your identity instantly by connecting a bank account or Solana wallet. We confirm the account holder and", gradient: "from-signal-rose to-[#E05585]", initial: "KY", verified: false },
  { name: "Proof of Residency", type: "Identity", category: "Identity", description: "Confirm your residency details using linked financial or on-chain institutions. Country names are normalized to ISO", gradient: "from-signal-rose to-[#D04070]", initial: "RE", verified: false },
];
