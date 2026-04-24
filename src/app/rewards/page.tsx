"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

const benefits = [
  { code: "VERIFY · EARN", title: "Earn on every proof", tag: "Every credential minted drops $BTH directly into your wallet." },
  { code: "REFER · EARN",  title: "Bring a specimen",   tag: "Share your atlas. A slice of their rewards flows back to you." },
  { code: "STAKE · EARN",  title: "Stake your index",   tag: "Lock your Breath Index and compound network returns over time." },
];

export default function RewardsPage() {
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
        <Sidebar activePage="rewards" />
      </div>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-screen">
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} pageTitle="Rewards" />
        <main className="flex-1 overflow-y-auto min-h-0 px-4 md:px-8 py-12 space-y-16">
          {/* Hero */}
          <div className="max-w-xl mx-auto text-center animate-fade-in-up">
            <div className="bp-eyebrow mb-4">REWARDS · LAUNCHING SOON</div>
            <h1 className="bp-display" style={{ fontSize: "clamp(72px, 12vw, 140px)" }}>
              Earn
              <br />
              <span style={{ color: "var(--teal)", opacity: 0.92 }}>$BTH</span>
            </h1>
            <p
              className="bp-editorial mt-6"
              style={{ fontSize: "clamp(17px, 1.8vw, 22px)", opacity: 0.7, lineHeight: 1.4 }}
            >
              Proof is currency. Breath is proof.
            </p>
          </div>

          {/* Benefits */}
          <div className="max-w-2xl mx-auto">
            {benefits.map((b, i) => (
              <div
                key={b.code}
                className="py-6"
                style={{
                  borderTop: "1px solid var(--bone-10)",
                  borderBottom: i === benefits.length - 1 ? "1px solid var(--bone-10)" : "none",
                }}
              >
                <div className="bp-eyebrow mb-3">{b.code}</div>
                <h3
                  className="font-display mb-2"
                  style={{
                    fontSize: "24px",
                    fontWeight: 300,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {b.title}
                </h3>
                <p
                  className="bp-editorial"
                  style={{ fontSize: "17px", opacity: 0.7, lineHeight: 1.45 }}
                >
                  {b.tag}
                </p>
              </div>
            ))}
          </div>

          {/* Waitlist */}
          <div className="max-w-lg mx-auto">
            <div className="bp-eyebrow mb-4 text-center">WAITLIST · OPEN</div>
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
                  Join Waitlist
                </button>
              </div>
            )}
            <div className="flex items-center justify-center gap-6 mt-10 bp-label" style={{ fontSize: "10px" }}>
              <span>LAUNCH · <span style={{ color: "var(--bone)" }}>Q3 2026</span></span>
              <span>QUEUE · <span style={{ color: "var(--bone)" }}>12,847</span></span>
            </div>
          </div>

          <div className="h-16" />
        </main>
      </div>
    </div>
  );
}
