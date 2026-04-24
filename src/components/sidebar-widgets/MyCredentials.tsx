"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function MyCredentials() {
  return (
    <div
      className="bp-card p-5 animate-slide-in-right"
      style={{ animationDelay: "0.08s" }}
    >
      <Link href="/credentials" className="w-full flex items-center justify-between mb-4 group">
        <div>
          <div className="bp-eyebrow mb-1">HELD · 00</div>
          <span
            className="font-display"
            style={{
              fontSize: "18px",
              fontWeight: 300,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            My Credentials
          </span>
        </div>
        <ChevronRight
          className="w-[14px] h-[14px] transition-transform group-hover:translate-x-0.5"
          strokeWidth={1.4}
          style={{ color: "var(--dim)" }}
        />
      </Link>

      <p
        className="bp-editorial mb-4"
        style={{ fontSize: "14px", opacity: 0.6, lineHeight: 1.4 }}
      >
        No credentials selected. The archive is quiet.
      </p>

      <Link
        href="/credentials"
        className="w-full flex items-center justify-between py-3 px-4 transition-colors group"
        style={{ border: "1px solid var(--bone-10)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--teal)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--bone-10)";
        }}
      >
        <span className="bp-label" style={{ fontSize: "10px", color: "var(--bone)" }}>
          VERIFY MORE
        </span>
        <span className="bp-label" style={{ fontSize: "10px", color: "var(--teal)" }}>
          +
        </span>
      </Link>
    </div>
  );
}
