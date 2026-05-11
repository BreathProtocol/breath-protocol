"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ArrowDownUp } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

const chains = ["Solana", "Bitcoin", "Sui", "Aptos", "TON"];

export default function BridgePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fromChain, setFromChain] = useState("Solana");
  const [toChain, setToChain] = useState("Bitcoin");
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

  const swapChains = () => {
    const prev = fromChain;
    setFromChain(toChain);
    setToChain(prev);
  };

  const ChainPicker = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => (
    <div className="flex items-center gap-2 flex-wrap">
      {chains.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className="bp-label px-3 py-2 transition-colors"
          style={{
            fontSize: "10px",
            border: "1px solid",
            borderColor: value === c ? "var(--teal)" : "var(--bone-10)",
            color: value === c ? "var(--teal)" : "var(--bone)",
          }}
        >
          {c.toUpperCase()}
        </button>
      ))}
    </div>
  );

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
        <Sidebar activePage="bridge" />
      </div>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-screen">
        <TopBar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} pageTitle="Bridge" />
        <main className="flex-1 overflow-y-auto min-h-0 px-4 md:px-8 py-8 space-y-12">
          {/* Hero */}
          <div className="animate-fade-in-up">
            <div className="bp-eyebrow mb-4">ROUTE · 0047</div>
            <h1 className="bp-display" style={{ fontSize: "clamp(44px, 6vw, 72px)" }}>
              Cross-chain
              <br />
              <span style={{ color: "var(--teal)", opacity: 0.92 }}>Bridge</span>
            </h1>
            <p
              className="bp-editorial mt-5 max-w-xl"
              style={{ fontSize: "clamp(16px, 1.5vw, 20px)", opacity: 0.7, lineHeight: 1.4 }}
            >
              Move your proofs between networks.
            </p>
          </div>

          {/* Bridge card */}
          <div className="bp-card p-6 md:p-8 max-w-[640px]">
            {/* FROM */}
            <div className="mb-6">
              <div className="bp-eyebrow mb-3">SOURCE · CHAIN</div>
              <button
                className="w-full flex items-center justify-between px-4 py-4 transition-colors"
                style={{ border: "1px solid var(--bone-20)", background: "transparent" }}
              >
                <span
                  className="font-display"
                  style={{
                    fontWeight: 300,
                    fontSize: "22px",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "var(--bone)",
                  }}
                >
                  {fromChain}
                </span>
                <ChevronDown className="w-[14px] h-[14px]" style={{ color: "var(--dim)" }} />
              </button>
              <div className="mt-3">
                <ChainPicker value={fromChain} onChange={setFromChain} />
              </div>
              <div className="mt-5 bp-eyebrow mb-2">CREDENTIAL</div>
              <div
                className="px-4 py-3 bp-label"
                style={{
                  fontSize: "11px",
                  color: "var(--bone)",
                  border: "1px solid var(--bone-10)",
                }}
              >
                01 / FACE ATTESTATION
              </div>
            </div>

            {/* Swap icon */}
            <div className="flex justify-center my-2">
              <button
                onClick={swapChains}
                className="w-9 h-9 flex items-center justify-center transition-colors"
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
                <ArrowDownUp className="w-[14px] h-[14px]" strokeWidth={1.4} />
              </button>
            </div>

            {/* TO */}
            <div className="mb-6">
              <div className="bp-eyebrow mb-3">DESTINATION · CHAIN</div>
              <button
                className="w-full flex items-center justify-between px-4 py-4 transition-colors"
                style={{ border: "1px solid var(--bone-20)" }}
              >
                <span
                  className="font-display"
                  style={{
                    fontWeight: 300,
                    fontSize: "22px",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    color: "var(--bone)",
                  }}
                >
                  {toChain}
                </span>
                <ChevronDown className="w-[14px] h-[14px]" style={{ color: "var(--dim)" }} />
              </button>
              <div className="mt-3">
                <ChainPicker value={toChain} onChange={setToChain} />
              </div>
            </div>

            {/* Route readout */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 py-4" style={{ borderTop: "1px solid var(--bone-10)", borderBottom: "1px solid var(--bone-10)" }}>
              <div>
                <div className="bp-label mb-1">ROUTE</div>
                <div className="bp-readout" style={{ fontSize: "10px" }}>
                  {fromChain.slice(0, 3).toUpperCase()} → {toChain.slice(0, 3).toUpperCase()}
                </div>
              </div>
              <div>
                <div className="bp-label mb-1">FEE</div>
                <div className="bp-readout" style={{ fontSize: "10px" }}>0.000005 SOL</div>
              </div>
              <div>
                <div className="bp-label mb-1">ETA</div>
                <div className="bp-readout" style={{ fontSize: "10px" }}>4 MIN</div>
              </div>
              <div>
                <div className="bp-label mb-1">STATUS</div>
                <div className="bp-readout" style={{ fontSize: "10px", color: "var(--teal)" }}>
                  READY
                </div>
              </div>
            </div>

            <button
              className="bp-button w-full justify-center mt-6"
              style={{ borderColor: "var(--teal)", color: "var(--teal)" }}
            >
              Bridge Credential
            </button>
          </div>

          {/* Supported chains */}
          <div>
            <div className="bp-eyebrow mb-4">SUPPORTED · 05</div>
            <div className="flex flex-wrap gap-2">
              {chains.map((c) => (
                <span
                  key={c}
                  className="bp-label px-4 py-2"
                  style={{
                    fontSize: "10px",
                    border: "1px solid var(--bone-10)",
                    color: "var(--bone)",
                  }}
                >
                  {c.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          <div className="h-12" />
        </main>
      </div>
    </div>
  );
}
