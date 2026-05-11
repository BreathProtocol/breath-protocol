"use client";

import { useState, useRef, useEffect } from "react";
import {
  Search,
  ArrowRight,
  ShieldCheck,
  Blocks,
  Gift,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const quickLinks = [
  {
    label: "Credentials",
    description: "Verify and manage proofs",
    icon: ShieldCheck,
    href: "/credentials",
    code: "01",
  },
  {
    label: "Block Explorer",
    description: "Track on-chain activity",
    icon: Blocks,
    href: "#",
    code: "02",
  },
  {
    label: "Rewards",
    description: "Earn $BTH token rewards",
    icon: Gift,
    href: "#",
    code: "03",
  },
  {
    label: "Help Center",
    description: "FAQs and support articles",
    icon: HelpCircle,
    href: "#",
    code: "04",
  },
];

const recentSearches = [
  "Accor Live Limitless",
  "KYC verification",
  "wallet connect",
];

const trendingTopics = [
  "Bridge credentials",
  "$BTH staking",
  "Zero-knowledge proofs",
  "Developer API",
];

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const filtered = quickLinks.filter(
    (l) =>
      l.label.toLowerCase().includes(query.toLowerCase()) ||
      l.description.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <div
        className="fixed inset-0 z-50 backdrop-blur-sm"
        style={{ background: "rgba(255, 255, 255, 0.65)" }}
        onClick={onClose}
      />

      <div className="fixed inset-x-0 top-0 z-50 flex justify-center pt-[14vh] px-4 pointer-events-none">
        <div
          className="w-full max-w-[620px] pointer-events-auto animate-fade-in-up"
          style={{
            background: "rgba(255, 255, 255, 0.94)",
            border: "1px solid var(--bone-10)",
            backdropFilter: "blur(20px)",
            animationDuration: "0.2s",
          }}
        >
          {/* Input */}
          <div
            className="flex items-center gap-4 px-6 py-5"
            style={{ borderBottom: "1px solid var(--bone-10)" }}
          >
            <Search
              className="w-[16px] h-[16px] flex-shrink-0"
              strokeWidth={1.4}
              style={{ color: "var(--dim)" }}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH THE ATLAS..."
              className="flex-1 bg-transparent outline-none"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--bone)",
              }}
            />
            <span
              className="bp-label px-2 py-1"
              style={{
                fontSize: "9px",
                border: "1px solid var(--bone-10)",
              }}
            >
              ESC
            </span>
          </div>

          {/* Results */}
          <div className="max-h-[460px] overflow-y-auto">
            {!query ? (
              <div className="p-6 space-y-8">
                <div>
                  <div className="bp-eyebrow mb-4">QUICK LINKS · 04</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {quickLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.label}
                          href={link.href}
                          onClick={onClose}
                          className="flex items-center gap-4 p-4 transition-all duration-200 group"
                          style={{
                            border: "1px solid var(--bone-10)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--teal)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--bone-10)";
                          }}
                        >
                          <Icon
                            className="w-[14px] h-[14px] flex-shrink-0"
                            strokeWidth={1.4}
                            style={{ color: "var(--teal)" }}
                          />
                          <div className="flex-1 min-w-0">
                            <div
                              className="font-display truncate"
                              style={{
                                fontSize: "16px",
                                fontWeight: 300,
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                                color: "var(--bone)",
                              }}
                            >
                              {link.label}
                            </div>
                            <div
                              className="bp-label truncate mt-1"
                              style={{ fontSize: "9.5px" }}
                            >
                              {link.description}
                            </div>
                          </div>
                          <span
                            className="bp-readout"
                            style={{ fontSize: "10px", color: "var(--dim)" }}
                          >
                            {link.code}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="bp-eyebrow mb-3">RECENT · 03</div>
                  <div className="space-y-px">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="w-full flex items-center justify-between px-3 py-3 bp-label transition-colors hover:bg-[rgba(201, 123, 94,0.05)]"
                        style={{ fontSize: "11px", color: "var(--bone)" }}
                      >
                        <span>{term}</span>
                        <span style={{ color: "var(--dim)" }}>↵</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="bp-eyebrow mb-3">TRENDING · 04</div>
                  <div className="flex flex-wrap gap-2">
                    {trendingTopics.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => setQuery(topic)}
                        className="bp-label px-3 py-2 transition-colors"
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
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="bp-eyebrow mb-4">
                  RESULTS · {filtered.length.toString().padStart(2, "0")}
                </div>
                {filtered.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={onClose}
                      className="flex items-center gap-4 px-4 py-4 group transition-colors hover:bg-[rgba(201, 123, 94,0.05)]"
                    >
                      <Icon
                        className="w-[14px] h-[14px] flex-shrink-0"
                        strokeWidth={1.4}
                        style={{ color: "var(--teal)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-display"
                          style={{
                            fontSize: "16px",
                            fontWeight: 300,
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                            color: "var(--bone)",
                          }}
                        >
                          {link.label}
                        </div>
                        <div className="bp-label mt-1" style={{ fontSize: "9.5px" }}>
                          {link.description}
                        </div>
                      </div>
                      <ArrowRight
                        className="w-[14px] h-[14px] transition-colors"
                        style={{ color: "var(--dim)" }}
                      />
                    </Link>
                  );
                })}
                {filtered.length === 0 && (
                  <div className="text-center py-12">
                    <div className="bp-eyebrow mb-3" style={{ color: "var(--dim)" }}>
                      NO MATCH
                    </div>
                    <p
                      className="bp-editorial"
                      style={{ fontSize: "18px", opacity: 0.6 }}
                    >
                      Nothing found for &ldquo;{query}&rdquo;.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
