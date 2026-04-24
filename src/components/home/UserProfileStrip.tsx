"use client";

import { useAuth } from "@/components/auth/AuthProvider";

export default function UserProfileStrip() {
  const { user } = useAuth();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "specimen";
  const initials = displayName.slice(0, 2).toUpperCase();
  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <div
      className="bp-card p-6 flex flex-wrap items-center gap-6 animate-fade-in-up"
      style={{ animationDelay: "0.08s" }}
    >
      {/* Avatar + name */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-14 h-14 object-cover"
              style={{ border: "1px solid var(--teal)" }}
            />
          ) : (
            <div
              className="w-14 h-14 flex items-center justify-center"
              style={{
                border: "1px solid var(--teal)",
                background: "var(--nebula)",
              }}
            >
              <span
                className="bp-label"
                style={{ fontSize: "14px", color: "var(--bone)" }}
              >
                {initials}
              </span>
            </div>
          )}
          <span
            className="absolute -bottom-1 -right-1 w-[8px] h-[8px] rounded-full animate-dot-pulse"
            style={{
              background: "var(--teal)",
              boxShadow: "0 0 8px var(--teal)",
            }}
          />
        </div>
        <div>
          <div className="bp-eyebrow mb-1">HANDLE</div>
          <p
            className="font-display"
            style={{
              fontSize: "22px",
              fontWeight: 300,
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            @{displayName}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div
        className="w-px h-12 hidden md:block"
        style={{ background: "var(--bone-10)" }}
      />

      {/* Token price */}
      <div className="flex-shrink-0">
        <div className="bp-eyebrow mb-1">$BTH · 24H</div>
        <div className="flex items-baseline gap-3">
          <span
            className="bp-readout"
            style={{
              fontSize: "22px",
              color: "var(--bone)",
              letterSpacing: "0.05em",
            }}
          >
            $0.0857
          </span>
          <span
            className="bp-label"
            style={{ fontSize: "10px", color: "var(--teal)" }}
          >
            +1.94%
          </span>
        </div>
      </div>

      <div className="flex-1 min-w-0" />

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button className="bp-button" style={{ padding: "10px 18px" }}>
          Buy $BTH
        </button>
        <button className="bp-button" style={{ padding: "10px 18px" }}>
          Swap $BTH
        </button>
      </div>
    </div>
  );
}
