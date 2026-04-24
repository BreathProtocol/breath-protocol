"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

const credentials = [
  {
    name: "Proof of KYC",
    type: "Identity",
    code: "01",
    description:
      "Verify your identity instantly by connecting a bank account or Solana wallet — no documents uploaded.",
    initial: "KY",
  },
  {
    name: "Proof of Assets",
    type: "Finance",
    code: "02",
    description:
      "Reflect your verified on-chain and USD balances. Unlock tiers at $100, $10K, $1M without exposing amounts.",
    initial: "PA",
  },
  {
    name: "Proof of Residency",
    type: "Identity",
    code: "03",
    description:
      "Confirm residency using linked financial or on-chain institutions. Country normalized to ISO.",
    initial: "RE",
  },
  {
    name: "Proof of Investments",
    type: "Finance",
    code: "04",
    description:
      "Show verified balances across investment accounts and on-chain portfolios — rounded, never raw.",
    initial: "PI",
  },
  {
    name: "Proof of Mortgage",
    type: "Finance",
    code: "05",
    description:
      "Verify outstanding mortgage balances from linked lending institutions, rounded to the nearest tier.",
    initial: "PM",
  },
];

export default function CredentialCards() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = dir === "left" ? -320 : 320;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: "0.26s" }}>
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="bp-eyebrow mb-3">ARCHIVE · PARTNERS</div>
          <h3
            className="bp-display"
            style={{ fontSize: "clamp(28px, 3.5vw, 40px)" }}
          >
            Verify more
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-9 h-9 flex items-center justify-center transition-colors"
            style={{
              border: "1px solid var(--bone-10)",
              color: "var(--dim)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--teal)";
              e.currentTarget.style.color = "var(--teal)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--bone-10)";
              e.currentTarget.style.color = "var(--dim)";
            }}
          >
            <ChevronLeft className="w-[14px] h-[14px]" strokeWidth={1.4} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-9 h-9 flex items-center justify-center transition-colors"
            style={{
              border: "1px solid var(--bone-10)",
              color: "var(--dim)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--teal)";
              e.currentTarget.style.color = "var(--teal)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--bone-10)";
              e.currentTarget.style.color = "var(--dim)";
            }}
          >
            <ChevronRight className="w-[14px] h-[14px]" strokeWidth={1.4} />
          </button>
        </div>
      </div>

      {/* Scroll rail */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar pb-2"
      >
        {credentials.map((cred) => (
          <Link
            key={cred.name}
            href="/credentials"
            className="bp-card flex-shrink-0 w-[280px] p-5 flex flex-col cursor-pointer transition-colors"
          >
            {/* Eyebrow */}
            <div className="flex items-center justify-between mb-3">
              <span className="bp-eyebrow">CRED · {cred.code}</span>
              <span
                className="bp-label"
                style={{ fontSize: "9.5px", color: "var(--dim)" }}
              >
                UNVERIFIED
              </span>
            </div>

            {/* Thumb */}
            <div className="bp-thumb aspect-[4/3] mb-5 flex items-center justify-center">
              <span
                className="font-display"
                style={{
                  fontSize: "44px",
                  fontWeight: 200,
                  letterSpacing: "-0.02em",
                  color: "var(--bone)",
                  opacity: 0.85,
                }}
              >
                {cred.initial}
              </span>
            </div>

            {/* Title */}
            <div
              className="font-display mb-2"
              style={{
                fontSize: "20px",
                fontWeight: 300,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                lineHeight: 1.1,
              }}
            >
              {cred.name}
            </div>

            {/* Tag */}
            <p
              className="bp-editorial mb-4 flex-1"
              style={{ fontSize: "14px", opacity: 0.6, lineHeight: 1.4 }}
            >
              {cred.description}
            </p>

            {/* Meta + CTA */}
            <div
              className="flex items-center justify-between pt-4"
              style={{ borderTop: "1px solid var(--bone-10)" }}
            >
              <span className="bp-label" style={{ fontSize: "9.5px" }}>
                {cred.type.toUpperCase()}
              </span>
              <span
                className="bp-label transition-colors"
                style={{ fontSize: "10px", color: "var(--bone)" }}
              >
                Get Proof →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
