"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

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
  const { label, system, hint } = routeMeta(pathname);
  const { user } = useAuth();

  const handle =
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "guest";
  const walletAddress =
    (user?.user_metadata?.wallet_address as string | undefined) ||
    (user?.user_metadata?.sol_wallet as string | undefined) ||
    "";
  const walletShort = walletAddress
    ? `${walletAddress.slice(0, 4)}…${walletAddress.slice(-4)}`
    : "Unlinked";

  // Hide top-right system chip on /dashboard to avoid overlap with BreathIndex "LIVE"
  const showSystemBadge = pathname !== "/dashboard";

  return (
    <div
      aria-hidden
      className="hidden sm:block fixed inset-0 z-10 pointer-events-none"
    >
            {/* Top-left: sigil + wordmark */}
      <div className="absolute top-7 left-8 flex items-center gap-2.5">
        <span
          className="w-[6px] h-[6px] rounded-full animate-dot-pulse"
          style={{
            background: "var(--teal)",
            boxShadow: "0 0 10px var(--teal)",
          }}
        />
        <div className="bp-label" style={{ color: "var(--bone)" }}>
          Vertebra Atlas
        </div>
      </div>
      </div>

      {/* Top-right: system status */}
      {showSystemBadge && (
        <div className="absolute top-7 right-8 text-right bp-label leading-relaxed">
          <div>{system.split("·")[0].trim()}</div>
          <div className="mt-1.5" style={{ color: "var(--bone)" }}>
            ONLINE
          </div>
        </div>
      )}

      {/* Bottom-left: holder + wallet */}
      <div className="absolute bottom-7 left-8 bp-label leading-relaxed">
        <div>Holder · @{String(handle).toLowerCase()}</div>
        <div className="mt-1.5">Wallet · {walletShort}</div>
      </div>

      {/* Bottom-right: contextual input hint */}
      <div className="absolute bottom-7 right-8 text-right bp-label leading-relaxed">
        <div>{hint}</div>
        <div className="mt-1.5">Mouse · Parallax</div>
      </div>
    </div>
  );
}
