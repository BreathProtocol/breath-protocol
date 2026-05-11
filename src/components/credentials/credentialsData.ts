export interface Credential {
  name: string;
  type: string;
  category: "Identity" | "Finance" | "Social" | "Reputation";
  description: string;
  gradient: string;
  initial: string;
  verified: boolean;
  /** Short ZK badge shown on the card (e.g. "ZK · selective disclosure"). */
  proof?: string;
  /** Chain settlement label (e.g. "Solana · devnet"). */
  chain?: string;
}

/**
 * Demo credential archive.
 *
 * Most entries are "available" — the user acquires them through the linked
 * issuer. **Proof of Personhood** is the only one that actually settles
 * on-chain today (via the BreathPrint biometric flow at verify.breath.id);
 * everything else is the surface area we're shipping next.
 */
export const credentials: Credential[] = [
  // ── Identity ─────────────────────────────────────────────────────────
  {
    name: "Proof of Personhood",
    type: "Identity",
    category: "Identity",
    description:
      "Triangulated biometric attestation (breath rhythm + facial micro-structure + thermal vitality) issued by the BreathPrint hardware oracle. Sybil-resistant.",
    gradient: "from-[#C97B5E] to-[#7A3E26]",
    initial: "PH",
    verified: true,
    proof: "ZK · biometric · Groth16",
    chain: "Solana · devnet",
  },
  {
    name: "Proof of Age",
    type: "Identity",
    category: "Identity",
    description:
      "Prove you are over 18 / 21 / 65 without revealing your date of birth. Selective disclosure over a government-issued credential.",
    gradient: "from-[#E9D6C4] to-[#C97B5E]",
    initial: "AG",
    verified: false,
    proof: "ZK · selective disclosure",
    chain: "Solana",
  },
  {
    name: "Proof of Citizenship",
    type: "Identity",
    category: "Identity",
    description:
      "Confirm citizenship of a country (e.g. \"Citizen of Brazil\") without exposing your passport number or document image.",
    gradient: "from-[#D8B89A] to-[#A66341]",
    initial: "CI",
    verified: false,
    proof: "ZK · passport",
    chain: "Solana",
  },
  {
    name: "Proof of Residency",
    type: "Identity",
    category: "Identity",
    description:
      "Confirm your residency details using linked financial or on-chain institutions. Country names are normalized to ISO codes.",
    gradient: "from-[#E9D6C4] to-[#B86A45]",
    initial: "RE",
    verified: false,
    proof: "ZK · range proof",
    chain: "Solana",
  },
  {
    name: "Proof of KYC",
    type: "Identity",
    category: "Identity",
    description:
      "Verify your identity by connecting a bank account or Solana wallet. We confirm the account holder without storing the underlying documents.",
    gradient: "from-[#D8B89A] to-[#8F5036]",
    initial: "KY",
    verified: false,
    proof: "ZK · attestation",
    chain: "Solana",
  },
  {
    name: "Proof of Email",
    type: "Identity",
    category: "Identity",
    description:
      "Prove you control an email address (domain class — gmail, ic.ac.uk, anthropic.com) without revealing the address itself.",
    gradient: "from-[#F2DCC4] to-[#C97B5E]",
    initial: "EM",
    verified: false,
    proof: "ZK · DKIM",
    chain: "Solana",
  },

  // ── Finance ──────────────────────────────────────────────────────────
  {
    name: "Proof of Assets",
    type: "Finance",
    category: "Finance",
    description:
      "Connect your wallets and banks to reflect on-chain and USD balances, unlocking tiers at $100, $10K, $1M.",
    gradient: "from-[#E9D6C4] to-[#C97B5E]",
    initial: "PA",
    verified: false,
    proof: "ZK · range proof",
    chain: "Solana",
  },
  {
    name: "Proof of Income",
    type: "Finance",
    category: "Finance",
    description:
      "Demonstrate income above a threshold (e.g. \"> $50k/yr\") without revealing the underlying salary or employer.",
    gradient: "from-[#D8B89A] to-[#A66341]",
    initial: "IN",
    verified: false,
    proof: "ZK · range proof",
    chain: "Solana",
  },
  {
    name: "Proof of Credit Score",
    type: "Finance",
    category: "Finance",
    description:
      "Prove your credit score falls into a band (e.g. \">700\") without exposing the exact number or the issuing bureau.",
    gradient: "from-[#E9D6C4] to-[#B86A45]",
    initial: "CR",
    verified: false,
    proof: "ZK · bucket proof",
    chain: "Solana",
  },
  {
    name: "Proof of Mortgage",
    type: "Finance",
    category: "Finance",
    description:
      "Verify outstanding mortgage balances from your linked lending institutions, rounded to the nearest tier.",
    gradient: "from-[#D8B89A] to-[#8F5036]",
    initial: "MO",
    verified: false,
    proof: "ZK · range proof",
    chain: "Solana",
  },

  // ── Social ───────────────────────────────────────────────────────────
  {
    name: "Proof of GitHub",
    type: "Social",
    category: "Social",
    description:
      "Prove ownership of a GitHub account and a contribution band (\">100 commits in 2026\") without revealing the username.",
    gradient: "from-[#E9D6C4] to-[#C97B5E]",
    initial: "GH",
    verified: false,
    proof: "ZK · OAuth",
    chain: "Solana",
  },
  {
    name: "Proof of X",
    type: "Social",
    category: "Social",
    description:
      "Verify an X (Twitter) account and follower band without disclosing the handle. Useful for KOL gating and Sybil-resistant airdrops.",
    gradient: "from-[#D8B89A] to-[#A66341]",
    initial: "PX",
    verified: false,
    proof: "ZK · OAuth",
    chain: "Solana",
  },
  {
    name: "Proof of LinkedIn",
    type: "Social",
    category: "Social",
    description:
      "Confirm your LinkedIn graph (years of experience, industry) without surfacing the full profile.",
    gradient: "from-[#E9D6C4] to-[#B86A45]",
    initial: "LI",
    verified: false,
    proof: "ZK · OAuth",
    chain: "Solana",
  },

  // ── Reputation ───────────────────────────────────────────────────────
  {
    name: "Proof of NFT Ownership",
    type: "Reputation",
    category: "Reputation",
    description:
      "Prove ownership of an NFT from a curated collection (Mad Lads, Tensorians, …) without revealing the wallet address.",
    gradient: "from-[#E9D6C4] to-[#C97B5E]",
    initial: "NF",
    verified: false,
    proof: "ZK · membership",
    chain: "Solana",
  },
  {
    name: "Proof of DAO Vote",
    type: "Reputation",
    category: "Reputation",
    description:
      "Demonstrate participation in a DAO vote above a threshold (e.g. \"voted on > 5 proposals\") without leaking your stake.",
    gradient: "from-[#D8B89A] to-[#A66341]",
    initial: "DV",
    verified: false,
    proof: "ZK · membership",
    chain: "Solana",
  },
];
