"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

const quickstart = [
  {
    code: "01",
    label: "INSTALL",
    snippet: "npm install @breath/sdk",
  },
  {
    code: "02",
    label: "AUTHENTICATE",
    snippet: "import { Breath } from '@breath/sdk';\n\nconst bp = new Breath({\n  apiKey: process.env.BREATH_KEY,\n});",
  },
  {
    code: "03",
    label: "VERIFY",
    snippet: "const proof = await bp.verify({\n  userId: 'Es9v…wWQRSm9',\n  type: 'face',\n});",
  },
];

const stats = [
  { label: "REQUESTS", value: "42.8M / DAY" },
  { label: "P50 LATENCY", value: "89MS" },
  { label: "UPTIME", value: "99.94%" },
];

const sdks = ["TypeScript", "Python", "Go", "Rust"];
const endpoints = [
  "POST  /verify/face",
  "POST  /verify/breath",
  "GET   /attestation/:id",
  "POST  /credentials/bridge",
];

export default function DevelopersPage() {
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
        <Sidebar activePage="developers" />
      </div>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-screen">
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} pageTitle="Developers" />
        <main className="flex-1 overflow-y-auto min-h-0 px-4 md:px-8 py-8 space-y-12">
          {/* Hero */}
          <div className="animate-fade-in-up">
            <div className="bp-eyebrow mb-4">API · v1.0</div>
            <h1 className="bp-display" style={{ fontSize: "clamp(44px, 6vw, 72px)" }}>
              Build on
              <br />
              <span style={{ color: "var(--teal)", opacity: 0.92 }}>Breath</span>
            </h1>
            <p
              className="bp-editorial mt-5 max-w-xl"
              style={{ fontSize: "clamp(16px, 1.5vw, 20px)", opacity: 0.7, lineHeight: 1.4 }}
            >
              Proofs-as-a-primitive for any chain.
            </p>
          </div>

          {/* Quickstart */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickstart.map((q) => (
              <div
                key={q.code}
                className="bp-card p-5"
                style={{ borderLeft: "2px solid var(--teal)" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="bp-readout" style={{ fontSize: "11px", color: "var(--dim)" }}>
                    {q.code}
                  </span>
                  <span className="bp-eyebrow">{q.label}</span>
                </div>
                <pre
                  className="bp-thumb p-4 overflow-x-auto"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--bone)",
                    lineHeight: 1.6,
                    whiteSpace: "pre",
                  }}
                >
                  {q.snippet}
                </pre>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bp-card p-5">
                <div className="bp-eyebrow mb-3">{s.label}</div>
                <div
                  className="bp-display"
                  style={{ fontSize: "28px", color: "var(--bone)" }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* SDKs + API Reference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="bp-eyebrow mb-4">SDKs · 04</div>
              <div>
                {sdks.map((s, i) => (
                  <button
                    key={s}
                    className="w-full flex items-center justify-between py-4 group transition-colors"
                    style={{
                      borderTop: "1px solid var(--bone-10)",
                      borderBottom: i === sdks.length - 1 ? "1px solid var(--bone-10)" : "none",
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className="bp-readout" style={{ fontSize: "10px", color: "var(--dim)" }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className="font-display"
                        style={{
                          fontSize: "20px",
                          fontWeight: 300,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {s}
                      </span>
                    </div>
                    <span className="bp-label" style={{ color: "var(--teal)" }}>
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="bp-eyebrow mb-4">API · REFERENCE</div>
              <div>
                {endpoints.map((e, i) => (
                  <div
                    key={e}
                    className="py-3 bp-readout"
                    style={{
                      borderTop: "1px solid var(--bone-10)",
                      borderBottom: i === endpoints.length - 1 ? "1px solid var(--bone-10)" : "none",
                      fontSize: "11px",
                      color: "var(--bone)",
                      whiteSpace: "pre",
                    }}
                  >
                    {e}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-12" />
        </main>
      </div>
    </div>
  );
}
