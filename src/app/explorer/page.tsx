"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import BreathPrintSection from "@/components/explorer/BreathPrintSection";

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
          style={{ background: "rgba(255, 255, 255, 0.6)" }}
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

          {/* BreathPrint live on-chain section — the only real data on this
              page. The old mock stats row + mock attestations table were
              placeholder copy from the design pass; removed until we wire
              a real network-wide index. */}
          <Suspense fallback={<div className="bp-card p-8 bp-label" style={{ opacity: 0.5 }}>LOADING · BREATHPRINT</div>}>
            <BreathPrintSection />
          </Suspense>

          <div className="h-12" />
        </main>
      </div>
    </div>
  );
}
