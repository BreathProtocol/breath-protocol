"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import ProfilePopup from "./ProfilePopup";
import SearchOverlay from "./SearchOverlay";
import { useAuth } from "@/components/auth/AuthProvider";

interface TopBarProps {
  onMenuToggle?: () => void;
  pageTitle?: string;
}

export default function TopBar({ onMenuToggle, pageTitle = "Home" }: TopBarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, session } = useAuth();

  // Cmd+K / Ctrl+K opens the search overlay
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const launchKYC = () => {
    const token = session?.access_token;
    if (token) {
      window.open(`https://breathkyc.vercel.app/verify?token=${token}`, "_blank");
    }
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "PS";
  const initials = displayName.slice(0, 2).toUpperCase();
  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <>
      <header
        className="h-[64px] flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 animate-fade-in"
        style={{
          borderBottom: "1px solid var(--bone-10)",
          background: "rgba(7, 8, 12, 0.55)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Left: mobile menu + breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="lg:hidden w-9 h-9 flex items-center justify-center transition-colors"
            style={{
              color: "var(--dim)",
              border: "1px solid var(--bone-10)",
            }}
          >
            <Menu className="w-[16px] h-[16px]" strokeWidth={1.4} />
          </button>
          <div className="flex items-center gap-3">
            <span className="bp-label" style={{ fontSize: "10px" }}>
              SPECIMEN / 0047
            </span>
            <span style={{ color: "var(--dim)" }}>/</span>
            <span
              className="bp-label"
              style={{ fontSize: "10px", color: "var(--bone)" }}
            >
              {pageTitle.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Center: Cmd+K search trigger (desktop) */}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-3 px-4 py-2 transition-colors"
          style={{
            border: "1px solid var(--bone-10)",
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--teal)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--bone-10)";
          }}
        >
          <span className="bp-label" style={{ fontSize: "10px" }}>
            SEARCH
          </span>
          <span
            className="bp-label"
            style={{ fontSize: "9px", color: "var(--bone)", opacity: 0.6 }}
          >
            CMD + K
          </span>
        </button>

        {/* Right: KYC + profile */}
        <div className="flex items-center gap-4">
          <button
            onClick={launchKYC}
            className="hidden sm:block bp-label transition-colors"
            style={{ fontSize: "10px" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--teal)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--dim)";
            }}
            title="Open BreathKYC"
          >
            VERIFY · KYC
          </button>
          <div
            className="hidden sm:block w-px h-4"
            style={{ background: "var(--bone-10)" }}
          />
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 group"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 object-cover"
                style={{
                  border: "1px solid var(--teal)",
                }}
              />
            ) : (
              <div
                className="w-8 h-8 flex items-center justify-center"
                style={{
                  border: "1px solid var(--teal)",
                  background: "var(--nebula)",
                }}
              >
                <span
                  className="bp-label"
                  style={{
                    fontSize: "10px",
                    color: "var(--bone)",
                    letterSpacing: "0.1em",
                  }}
                >
                  {initials}
                </span>
              </div>
            )}
          </button>
        </div>
      </header>

      <ProfilePopup open={profileOpen} onClose={() => setProfileOpen(false)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
