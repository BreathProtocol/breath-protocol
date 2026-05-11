"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

const apiKeys = [
  { name: "PROD-MAIN",    key: "bp_live_••••••••••••f29d", created: "2026-02-14", lastUsed: "2m ago",  status: "LIVE" },
  { name: "STAGING-LAB",  key: "bp_test_••••••••••••814c", created: "2026-03-02", lastUsed: "1d ago",  status: "LIVE" },
];

const webhooks = [
  { url: "https://api.example.com/breath/hook",     event: "attestation.created", status: "LIVE" },
  { url: "https://proofs.labs.dev/webhook/breath",  event: "credential.verified", status: "LIVE" },
  { url: "https://legacy.internal/bp",              event: "specimen.updated",    status: "PAUSED" },
];

const usage = [
  { label: "REQUESTS",  current: 12847, total: 50000, unit: "" },
  { label: "BANDWIDTH", current: 2.3,   total: 10,    unit: "GB" },
];

export default function PortalPage() {
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
        <Sidebar activePage="developer-portal" />
      </div>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-screen">
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} pageTitle="Portal" />
        <main className="flex-1 overflow-y-auto min-h-0 px-4 md:px-8 py-8 space-y-12">
          {/* Hero */}
          <div className="animate-fade-in-up">
            <div className="bp-eyebrow mb-4">PORTAL · 0047</div>
            <h1 className="bp-display" style={{ fontSize: "clamp(44px, 6vw, 72px)" }}>
              Developer
              <br />
              <span style={{ color: "var(--teal)", opacity: 0.92 }}>Portal</span>
            </h1>
            <p
              className="bp-editorial mt-5 max-w-xl"
              style={{ fontSize: "clamp(16px, 1.5vw, 20px)", opacity: 0.7, lineHeight: 1.4 }}
            >
              Your keys. Your quota.
            </p>
          </div>

          {/* API Keys */}
          <div className="bp-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="bp-eyebrow">KEYS · {String(apiKeys.length).padStart(2, "0")}</div>
              <button className="bp-button" style={{ padding: "8px 14px", fontSize: "10px" }}>
                + Create Key
              </button>
            </div>
            <div
              className="hidden md:grid grid-cols-12 gap-4 py-3 px-2 bp-label"
              style={{ borderBottom: "1px solid var(--bone-10)" }}
            >
              <div className="col-span-2">NAME</div>
              <div className="col-span-4">KEY</div>
              <div className="col-span-2">CREATED</div>
              <div className="col-span-2">LAST USED</div>
              <div className="col-span-1">STATUS</div>
              <div className="col-span-1 text-right">ACTION</div>
            </div>
            {apiKeys.map((k) => (
              <div
                key={k.name}
                className="grid grid-cols-2 md:grid-cols-12 gap-4 py-4 px-2"
                style={{ borderBottom: "1px solid var(--bone-10)" }}
              >
                <div className="col-span-2 md:col-span-2 bp-label" style={{ color: "var(--bone)" }}>
                  {k.name}
                </div>
                <div className="col-span-2 md:col-span-4 bp-readout" style={{ color: "var(--teal)" }}>
                  {k.key}
                </div>
                <div className="col-span-1 md:col-span-2 bp-label">{k.created}</div>
                <div className="col-span-1 md:col-span-2 bp-label">{k.lastUsed.toUpperCase()}</div>
                <div className="col-span-1 md:col-span-1 flex items-center gap-2">
                  <span
                    className="w-[6px] h-[6px] rounded-full"
                    style={{
                      background: k.status === "LIVE" ? "var(--teal)" : "var(--dim)",
                      boxShadow: k.status === "LIVE" ? "0 0 6px var(--teal)" : "none",
                    }}
                  />
                  <span
                    className="bp-label"
                    style={{ color: k.status === "LIVE" ? "var(--teal)" : "var(--dim)" }}
                  >
                    {k.status}
                  </span>
                </div>
                <div className="col-span-1 md:col-span-1 text-right">
                  <button className="bp-label" style={{ fontSize: "10px" }}>
                    REVOKE
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Usage */}
          <div className="bp-card p-6">
            <div className="bp-eyebrow mb-6">USAGE · 30D</div>
            <div className="space-y-6">
              {usage.map((u) => (
                <div key={u.label}>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="bp-label">{u.label}</span>
                    <span className="bp-readout" style={{ fontSize: "11px" }}>
                      {u.current.toLocaleString()}
                      {u.unit} / {u.total.toLocaleString()}
                      {u.unit}
                    </span>
                  </div>
                  <div
                    className="w-full h-px relative"
                    style={{ background: "var(--bone-10)" }}
                  >
                    <div
                      className="absolute inset-y-0 left-0 h-px"
                      style={{
                        width: `${(u.current / u.total) * 100}%`,
                        background: "var(--teal)",
                        boxShadow: "0 0 4px var(--teal)",
                      }}
                    />
                  </div>
                </div>
              ))}
              <div
                className="flex items-baseline justify-between pt-4"
                style={{ borderTop: "1px solid var(--bone-10)" }}
              >
                <span className="bp-label">COST · MONTH TO DATE</span>
                <span
                  className="bp-display"
                  style={{ fontSize: "28px", color: "var(--teal)" }}
                >
                  $42.18
                </span>
              </div>
            </div>
          </div>

          {/* Webhooks */}
          <div className="bp-card p-6">
            <div className="bp-eyebrow mb-6">WEBHOOKS · {String(webhooks.length).padStart(2, "0")}</div>
            {webhooks.map((w, i) => (
              <div
                key={w.url}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 py-4"
                style={{
                  borderTop: "1px solid var(--bone-10)",
                  borderBottom: i === webhooks.length - 1 ? "1px solid var(--bone-10)" : "none",
                }}
              >
                <div className="md:col-span-7 bp-readout" style={{ fontSize: "11px" }}>
                  {w.url}
                </div>
                <div className="md:col-span-3 bp-label">{w.event}</div>
                <div className="md:col-span-2 flex items-center gap-2 md:justify-end">
                  <span
                    className="w-[6px] h-[6px] rounded-full"
                    style={{
                      background: w.status === "LIVE" ? "var(--teal)" : "var(--dim)",
                      boxShadow: w.status === "LIVE" ? "0 0 6px var(--teal)" : "none",
                    }}
                  />
                  <span
                    className="bp-label"
                    style={{ color: w.status === "LIVE" ? "var(--teal)" : "var(--dim)" }}
                  >
                    {w.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="h-12" />
        </main>
      </div>
    </div>
  );
}
