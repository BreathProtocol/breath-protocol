"use client";

import { useAuth } from "@/components/auth/AuthProvider";

export default function WelcomeBanner() {
  const { user } = useAuth();
  const name =
    user?.user_metadata?.full_name?.split(" ")[0]?.toLowerCase() ||
    user?.user_metadata?.name?.split(" ")[0]?.toLowerCase() ||
    user?.email?.split("@")[0] ||
    "specimen";

  return (
    <div className="relative py-8 animate-fade-in-up">
      <div className="bp-eyebrow mb-4">SESSION · 0047</div>

      <h2
        className="bp-display"
        style={{ fontSize: "clamp(44px, 6vw, 72px)", color: "var(--bone)" }}
      >
        Specimen
        <br />
        <span style={{ color: "var(--teal)", opacity: 0.92 }}>Atlas</span>
      </h2>

      <p
        className="bp-editorial mt-5 max-w-xl"
        style={{
          fontSize: "clamp(16px, 1.6vw, 20px)",
          color: "var(--bone)",
          opacity: 0.7,
          lineHeight: 1.4,
        }}
      >
        Welcome back, <span style={{ color: "var(--teal)" }}>{name}</span>.
        The archive resumes where you left it.
      </p>

      <div className="flex items-center gap-6 mt-6 bp-label" style={{ fontSize: "10px" }}>
        <span>
          LAST SYNC · <span style={{ color: "var(--bone)" }}>00:42:18</span>
        </span>
        <span>
          ENTRIES · <span style={{ color: "var(--bone)" }}>0047</span>
        </span>
        <span style={{ color: "var(--teal)" }}>STABLE</span>
      </div>
    </div>
  );
}
