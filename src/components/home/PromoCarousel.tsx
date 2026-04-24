"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";

const slides = [
  {
    eyebrow: "PARTNER · 01",
    title: "Solana × Breath",
    description:
      "Link your Solana wallet to your Breath ID. Sign in with Phantom, Backpack, or Solflare — port proofs of assets, SPL holdings and on-chain reputation across Solana dApps without leaking private keys.",
    cta: "Connect Wallet",
  },
  {
    eyebrow: "REWARDS · 02",
    title: "Verify & Earn",
    description:
      "Complete each verification flow and receive $BTH token rewards for every milestone crossed.",
    cta: "Start Earning",
  },
  {
    eyebrow: "BRIDGE · 03",
    title: "Identity, Cross-Chain",
    description:
      "Bring your credentials wherever you go. One living ledger, every network.",
    cta: "Learn More",
  },
];

export default function PromoCarousel() {
  const { session } = useAuth();
  const [active, setActive] = useState(0);

  const prev = () => setActive((i) => (i === 0 ? slides.length - 1 : i - 1));
  const next = () => setActive((i) => (i === slides.length - 1 ? 0 : i + 1));

  const launchKYC = () => {
    const token = session?.access_token;
    if (token) {
      window.open(`https://breathkyc.vercel.app/verify?token=${token}`, "_blank");
    }
  };

  const slide = slides[active];

  return (
    <div
      className="bp-card relative overflow-hidden animate-fade-in-up"
      style={{ animationDelay: "0.14s" }}
    >
      {/* Thumbnail wash on the right side */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1/2 hidden md:block bp-thumb"
        style={{
          opacity: 0.5,
          maskImage: "linear-gradient(to left, black 30%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to left, black 30%, transparent 100%)",
        }}
      />

      <div className="relative z-10 p-8 md:pr-[40%]">
        <div className="bp-eyebrow mb-4">{slide.eyebrow}</div>
        <h3
          className="bp-display mb-4"
          style={{ fontSize: "clamp(32px, 4vw, 48px)" }}
        >
          {slide.title}
        </h3>
        <p
          className="bp-editorial max-w-md mb-8"
          style={{ fontSize: "17px", opacity: 0.7, lineHeight: 1.4 }}
        >
          {slide.description}
        </p>
        <button
          onClick={
            slide.cta === "Get Proof" || slide.cta === "Start Earning"
              ? launchKYC
              : undefined
          }
          className="bp-button"
        >
          {slide.cta}
        </button>
      </div>

      {/* Pagination */}
      <div className="relative z-10 flex items-center gap-4 px-8 pb-6">
        <button
          onClick={prev}
          className="w-8 h-8 flex items-center justify-center transition-colors"
          style={{ border: "1px solid var(--bone-10)", color: "var(--dim)" }}
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

        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn("h-px transition-all duration-300")}
              style={{
                width: i === active ? "32px" : "12px",
                background: i === active ? "var(--teal)" : "var(--bone-20)",
                boxShadow: i === active ? "0 0 8px var(--teal)" : "none",
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-8 h-8 flex items-center justify-center transition-colors"
          style={{ border: "1px solid var(--bone-10)", color: "var(--dim)" }}
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

        <span
          className="bp-readout ml-auto"
          style={{ fontSize: "11px", color: "var(--dim)" }}
        >
          {String(active + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
