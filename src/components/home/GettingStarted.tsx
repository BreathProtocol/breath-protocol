"use client";

import { Fingerprint, Wallet, Share2, Landmark } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

const steps = [
  {
    icon: Fingerprint,
    code: "01",
    title: "Prove Your Identity",
    subtitle: "Breath verification flow",
  },
  {
    icon: Wallet,
    code: "02",
    title: "Add a Wallet",
    subtitle: "EVM · Solana · Bitcoin",
  },
  {
    icon: Share2,
    code: "03",
    title: "Connect Social Handles",
    subtitle: "X · LinkedIn · GitHub",
  },
  {
    icon: Landmark,
    code: "04",
    title: "Verify Bank Accounts",
    subtitle: "Banks · Solana wallets",
  },
];

export default function GettingStarted() {
  const { session } = useAuth();
  const completedCount = 0;

  const launchKYC = () => {
    const token = session?.access_token;
    if (token) {
      window.open(`https://breathkyc.vercel.app/verify?token=${token}`, "_blank");
    }
  };

  return (
    <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
      {/* Section header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="bp-eyebrow mb-3">GETTING STARTED · 04 STEPS</div>
          <h3
            className="bp-display"
            style={{ fontSize: "clamp(28px, 3.5vw, 40px)" }}
          >
            Assemble the record
          </h3>
        </div>
        <div className="text-right">
          <div className="bp-eyebrow mb-1">PROGRESS</div>
          <div
            className="bp-readout"
            style={{
              fontSize: "22px",
              color: "var(--bone)",
              letterSpacing: "0.04em",
            }}
          >
            {String(completedCount).padStart(2, "0")}
            <span style={{ color: "var(--dim)" }}>
              {" "}/ {String(steps.length).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 mb-6">
        {steps.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-px"
            style={{
              background: i < completedCount ? "var(--teal)" : "var(--bone-10)",
              boxShadow: i < completedCount ? "0 0 4px var(--teal)" : "none",
            }}
          />
        ))}
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-children">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <button
              key={step.title}
              onClick={step.title === "Prove Your Identity" ? launchKYC : undefined}
              className="bp-card p-5 text-left flex items-center gap-5 group"
            >
              <span
                className="bp-readout flex-shrink-0"
                style={{
                  fontSize: "13px",
                  color: "var(--dim)",
                  letterSpacing: "0.15em",
                }}
              >
                {step.code}
              </span>
              <Icon
                className="w-[18px] h-[18px] flex-shrink-0"
                strokeWidth={1.4}
                style={{ color: "var(--teal)" }}
              />
              <div className="flex-1 min-w-0">
                <div
                  className="font-display mb-1"
                  style={{
                    fontSize: "18px",
                    fontWeight: 300,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {step.title}
                </div>
                <div
                  className="bp-editorial"
                  style={{
                    fontSize: "14px",
                    opacity: 0.6,
                  }}
                >
                  {step.subtitle}
                </div>
              </div>
              <span
                className="bp-label"
                style={{ fontSize: "10px", color: "var(--dim)" }}
              >
                →
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
