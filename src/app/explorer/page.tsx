"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BreathPrintSection from "@/components/explorer/BreathPrintSection";

const stats = [
  { label: "TOTAL ATTESTATIONS", value: "12,847" },
  { label: "UNIQUE SPECIMENS", value: "3,412" },
  { label: "AVG FEE", value: "0.000005 SOL" },
];

const attestations = [
  { hash: "0xae42…f1c9", specimen: "0x7a3b…f29d", type: "FACE",   chain: "SOLANA",     block: "24,801,312", time: "2m ago" },
  { hash: "0x91b3…e284", specimen: "0x4e0c…a17f", type: "BREATH", chain: "SOLANA",     block: "24,801,309", time: "4m ago" },
  { hash: "0xd5fa…2b61", specimen: "0x7a3b…f29d", type: "GEO",    chain: "ECLIPSE",  block: "58,214,901", time: "6m ago" },
  { hash: "0x32c8…7d40", specimen: "0x8f1e…c53b", type: "DOC",    chain: "SONIC", block: "218,409,112", time: "11m ago" },
  { hash: "0x71ef…94a2", specimen: "0x2d5a…88bc", type: "FACE",   chain: "SOLANA",     block: "24,801,287", time: "14m ago" },
  { hash: "0x088a…c3f5", specimen: "0xb9e2…014d", type: "BREATH", chain: "SOLANA",     block: "24,801,282", time: "19m ago" },
  { hash: "0x4dc1…71ea", specimen: "0x4e0c…a17f", type: "FACE",   chain: "ECLIPSE",  block: "58,214,840", time: "23m ago" },
  { hash: "0xfc03…92d8", specimen: "0x8f1e…c53b", type: "GEO",    chain: "SONIC", block: "218,409,080", time: "31m ago" },
];

export default function ExplorerPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === "1";

  useEffect(() => {
    if (bypassAuth) return;
    if (!loading && !user) router.replace("/");
  }, [user, loading, router, bypassAuth]);

  if (!bypassAuth && (loading || !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <span
            className="w-[8px] h-[8px] rounded-full animate-dot-pulse"
            style={{ background: "var(--teal)", boxShadow: "0 0 12px var(--teal)" }}
          />
          <span className="bp-label" style={{ color: "var(--bone)" }}>
            CALIBRATING · HELIX DRIVE
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {sidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          style={{ background: "rgba(7, 8, 12, 0.6)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar activePage="block-explorer" />
      </div>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-screen">
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} pageTitle="Explorer" />
        <main className="flex-1 overflow-y-auto min-h-0 px-4 md:px-8 py-8 space-y-12">
          {/* Hero */}
          <div className="animate-fade-in-up">
            <div className="bp-eyebrow mb-4">LEDGER · 0047</div>
            <h1 className="bp-display" style={{ fontSize: "clamp(44px, 6vw, 72px)" }}>
              Chain
              <br />
              <span style={{ color: "var(--teal)", opacity: 0.92 }}>Explorer</span>
            </h1>
            <p
              className="bp-editorial mt-5 max-w-xl"
              style={{ fontSize: "clamp(16px, 1.5vw, 20px)", opacity: 0.7, lineHeight: 1.4 }}
            >
              Every proof, permanently recorded.
            </p>
          </div>

          {/* BreathPrint live on-chain section */}
          <Suspense fallback={<div className="bp-card p-8 bp-label" style={{ opacity: 0.5 }}>LOADING · BREATHPRINT</div>}>
            <BreathPrintSection />
          </Suspense>

          {/* Stats row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bp-card p-6">
                <div className="bp-eyebrow mb-4">{s.label}</div>
                <div
                  className="bp-display"
                  style={{ fontSize: "clamp(32px, 4vw, 44px)", color: "var(--bone)" }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Attestations table */}
          <div>
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="bp-eyebrow mb-3">ATTESTATIONS · LIVE</div>
                <h2 className="bp-display" style={{ fontSize: "clamp(28px, 3.5vw, 40px)" }}>
                  Recent proofs
                </h2>
              </div>
              <span className="bp-label" style={{ fontSize: "10px" }}>
                SHOWING 08 / 12,847
              </span>
            </div>

            {/* Column headers */}
            <div
              className="hidden md:grid grid-cols-12 gap-4 py-3 px-4 bp-label"
              style={{ borderBottom: "1px solid var(--bone-10)" }}
            >
              <div className="col-span-3">HASH</div>
              <div className="col-span-3">SPECIMEN</div>
              <div className="col-span-2">TYPE</div>
              <div className="col-span-2">CHAIN</div>
              <div className="col-span-1 text-right">BLOCK</div>
              <div className="col-span-1 text-right">TIME</div>
            </div>

            {attestations.map((a, i) => (
              <div
                key={i}
                className="grid grid-cols-2 md:grid-cols-12 gap-4 py-4 px-4 group transition-colors"
                style={{
                  borderBottom: "1px solid var(--bone-10)",
                  borderLeft: "2px solid transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderLeftColor = "var(--teal)";
                  e.currentTarget.style.background = "rgba(122, 224, 212, 0.03)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderLeftColor = "transparent";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <div className="col-span-2 md:col-span-3 bp-readout" style={{ color: "var(--teal)" }}>
                  {a.hash}
                </div>
                <div className="col-span-2 md:col-span-3 bp-readout">{a.specimen}</div>
                <div className="col-span-1 md:col-span-2 bp-label" style={{ color: "var(--bone)" }}>
                  {a.type}
                </div>
                <div className="col-span-1 md:col-span-2 bp-label">{a.chain}</div>
                <div className="col-span-1 md:col-span-1 bp-readout text-right" style={{ fontSize: "10px" }}>
                  {a.block}
                </div>
                <div className="col-span-1 md:col-span-1 bp-label text-right" style={{ fontSize: "10px" }}>
                  {a.time.toUpperCase()}
                </div>
              </div>
            ))}

            <div className="pt-6">
              <button className="bp-button w-full justify-center">
                View all · 12,847 entries →
              </button>
            </div>
          </div>

          <div className="h-12" />
        </main>
      </div>
    </div>
  );
}
