"use client";

import { usePathname } from "next/navigation";

/**
 * Four corner overlays. Hidden below 640px.
 * All pointer-events-none, JetBrains Mono 10–11px, 0.22em tracking, uppercase.
 */

function routeMeta(pathname: string | null): {
  label: string;
  system: string;
  hint: string;
} {
  if (pathname === "/credentials") {
    return {
      label: "Vertebra Atlas · Credentials",
      system: "Sys // Atlas · ONLINE",
      hint: "Tab · Filter",
    };
  }
  if (pathname === "/dashboard") {
    return {
      label: "Vertebra Atlas · Session",
      system: "Sys // Dashboard · ONLINE",
      hint: "Cmd+K · Search",
    };
  }
  return {
    label: "Vertebra Atlas · v0.04",
    system: "Sys // Access · ONLINE",
    hint: "Click · Access",
  };
}

export default function HUD() {
  const pathname = usePathname();
  const { system } = routeMeta(pathname);

  // Hide top-right system chip on /dashboard to avoid overlap with BreathIndex "LIVE"
  const showSystemBadge = pathname !== "/dashboard";

  return (
    <div
      aria-hidden
      className="hidden sm:block fixed inset-0 z-10 pointer-events-none"
    >
      {/* Top-right: system status */}
      {showSystemBadge && (
        <div className="absolute top-7 right-8 text-right bp-label leading-relaxed">
          <div>{system.split("·")[0].trim()}</div>
          <div className="mt-1.5" style={{ color: "var(--bone)" }}>
            ONLINE
          </div>
        </div>
      )}
    </div>
  );
}
