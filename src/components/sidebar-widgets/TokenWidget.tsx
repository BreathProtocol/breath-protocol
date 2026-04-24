"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function TokenWidget() {
  const [tab, setTab] = useState<"buy" | "swap">("buy");

  return (
    <div
      className="bp-card p-5 animate-slide-in-right"
      style={{ animationDelay: "0.14s" }}
    >
      {/* Tabs */}
      <div
        className="flex mb-5"
        style={{ borderBottom: "1px solid var(--bone-10)" }}
      >
        {(["buy", "swap"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn("flex-1 py-3 bp-label transition-colors")}
            style={{
              fontSize: "10px",
              color: tab === t ? "var(--teal)" : "var(--dim)",
              borderBottom:
                tab === t ? "1px solid var(--teal)" : "1px solid transparent",
              marginBottom: "-1px",
            }}
          >
            {t === "buy" ? "BUY $BTH" : "SWAP $BTH"}
          </button>
        ))}
      </div>

      {/* Price */}
      <div className="bp-eyebrow mb-2">$BTH · 24H</div>
      <div className="flex items-baseline gap-3 mb-5">
        <span
          className="bp-readout"
          style={{
            fontSize: "28px",
            color: "var(--bone)",
            letterSpacing: "0.03em",
          }}
        >
          $0.0857
        </span>
        <span
          className="bp-label"
          style={{ fontSize: "10px", color: "var(--teal)" }}
        >
          +1.94%
        </span>
      </div>

      {/* Venues */}
      <div className="bp-eyebrow mb-3">AVAILABLE ON</div>
      <div className="flex items-center gap-2 mb-5">
        <span
          className="bp-label px-3 py-2"
          style={{
            fontSize: "9.5px",
            border: "1px solid var(--bone-10)",
            color: "var(--bone)",
          }}
        >
          BINANCE
        </span>
        <span
          className="bp-label px-3 py-2"
          style={{
            fontSize: "9.5px",
            border: "1px solid var(--bone-10)",
            color: "var(--bone)",
          }}
        >
          CRYPTO.COM
        </span>
      </div>

      <button
        className="w-full py-3 bp-label transition-colors"
        style={{
          fontSize: "10px",
          border: "1px solid var(--bone-10)",
          color: "var(--bone)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--teal)";
          e.currentTarget.style.color = "var(--teal)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--bone-10)";
          e.currentTarget.style.color = "var(--bone)";
        }}
      >
        EXPLORE MORE →
      </button>
    </div>
  );
}
