"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

const partners = [
  { code: "01", initial: "UN", name: "Uniswap",   tag: "Proof-gated pool access, directly in the AMM." },
  { code: "02", initial: "AA", name: "Aave",      tag: "Undercollateralized loans via breath attestation." },
  { code: "03", initial: "LE", name: "Lens",      tag: "One breath to claim your handle, forever." },
  { code: "04", initial: "FA", name: "Farcaster", tag: "Sybil-resistant frames powered by your proofs." },
  { code: "05", initial: "WO", name: "Worldcoin", tag: "Cross-network identity reconciliation." },
  { code: "06", initial: "AR", name: "Arweave",   tag: "Permanently anchor your attestation graph." },
];

export default function DiscoverPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [queued, setQueued] = useState(false);
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
        <Sidebar activePage="discover" />
      </div>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-screen">
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} pageTitle="Discover" />
        <main className="flex-1 overflow-y-auto min-h-0 px-4 md:px-8 py-8 space-y-12">
          {/* Hero */}
          <div className="animate-fade-in-up">
            <div className="bp-eyebrow mb-4">DISCOVER · LAUNCHING SOON</div>
            <h1 className="bp-display" style={{ fontSize: "clamp(44px, 6vw, 72px)" }}>
              <span style={{ color: "var(--teal)", opacity: 0.92 }}>Integrations</span>
            </h1>
            <p
              className="bp-editorial mt-5 max-w-xl"
              style={{ fontSize: "clamp(16px, 1.5vw, 20px)", opacity: 0.7, lineHeight: 1.4 }}
            >
              Every dApp your credentials unlock.
            </p>
          </div>

          {/* Partner grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {partners.map((p) => (
              <article key={p.code} className="bp-card p-5 flex flex-col">
                <div className="bp-thumb aspect-video mb-5 flex items-center justify-center">
                  <span
                    className="font-display"
                    style={{
                      fontSize: "64px",
                      fontWeight: 200,
                      letterSpacing: "-0.02em",
                      color: "var(--bone)",
                      opacity: 0.85,
                    }}
                  >
                    {p.initial}
                  </span>
                </div>
                <div className="bp-eyebrow mb-3">PARTNER · {p.code}</div>
                <h3
                  className="font-display mb-3"
                  style={{
                    fontSize: "24px",
                    fontWeight: 300,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {p.name}
                </h3>
                <p
                  className="bp-editorial mb-5 flex-1"
                  style={{ fontSize: "14px", opacity: 0.65, lineHeight: 1.4 }}
                >
                  {p.tag}
                </p>
                <div
                  className="pt-4 flex items-center justify-between"
                  style={{ borderTop: "1px solid var(--bone-10)" }}
                >
                  <span className="bp-label" style={{ fontSize: "10px" }}>
                    COMING SOON
                  </span>
                  <span
                    className="w-[5px] h-[5px] rounded-full"
                    style={{ background: "var(--dim)" }}
                  />
                </div>
              </article>
            ))}
          </div>

          {/* Early access */}
          <div className="max-w-lg mx-auto">
            <div className="bp-eyebrow mb-4 text-center">EARLY ACCESS · OPEN</div>
            {queued ? (
              <div className="flex items-center justify-center gap-3 py-4">
                <span
                  className="w-[8px] h-[8px] rounded-full animate-dot-pulse"
                  style={{ background: "var(--teal)", boxShadow: "0 0 10px var(--teal)" }}
                />
                <span className="bp-label" style={{ color: "var(--teal)" }}>
                  QUEUED · POSITION 0047
                </span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="YOUR.EMAIL@DOMAIN"
                  className="flex-1 px-1 py-3 bg-transparent outline-none"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--bone)",
                    borderBottom: "1px solid var(--bone-20)",
                  }}
                />
                <button
                  onClick={() => setQueued(true)}
                  className="bp-button"
                  style={{ borderColor: "var(--teal)", color: "var(--teal)" }}
                >
                  Request Access
                </button>
              </div>
            )}
          </div>

          <div className="h-12" />
        </main>
      </div>
    </div>
  );
}
