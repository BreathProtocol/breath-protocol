"use client";

import { useState } from "react";
import { Search, Menu, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import ProfilePopup from "@/components/layout/ProfilePopup";
import { useAuth } from "@/components/auth/AuthProvider";

interface CredentialsTopBarProps {
  onMenuToggle: () => void;
  activeTab: "all" | "verified" | "unverified";
  onTabChange: (tab: "all" | "verified" | "unverified") => void;
  search: string;
  onSearchChange: (val: string) => void;
  category: string;
  onCategoryChange: (val: string) => void;
}

const tabs = [
  { id: "all" as const, label: "ALL", code: "00" },
  { id: "verified" as const, label: "VERIFIED", code: "01" },
  { id: "unverified" as const, label: "UNVERIFIED", code: "02" },
];

export default function CredentialsTopBar({
  onMenuToggle,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  category,
}: CredentialsTopBarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, session } = useAuth();

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
      <div
        className="sticky top-0 z-30 animate-fade-in"
        style={{
          borderBottom: "1px solid var(--bone-10)",
          background: "rgba(7, 8, 12, 0.55)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Top row */}
        <div className="h-[64px] flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuToggle}
              className="lg:hidden w-9 h-9 flex items-center justify-center"
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
                CREDENTIALS
              </span>
            </div>
          </div>

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
                  style={{ border: "1px solid var(--teal)" }}
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
                    style={{ fontSize: "10px", color: "var(--bone)" }}
                  >
                    {initials}
                  </span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Filter row */}
        <div className="flex items-center justify-between px-4 md:px-8 pb-4 gap-4 flex-wrap">
          {/* Tabs */}
          <div
            className="flex items-center"
            style={{ borderBottom: "1px solid transparent" }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 bp-label transition-colors"
                )}
                style={{
                  fontSize: "10px",
                  color: activeTab === tab.id ? "var(--teal)" : "var(--dim)",
                  borderBottom:
                    activeTab === tab.id
                      ? "1px solid var(--teal)"
                      : "1px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                <span
                  className="bp-readout"
                  style={{
                    fontSize: "9px",
                    color:
                      activeTab === tab.id ? "var(--teal)" : "var(--dim)",
                    opacity: 0.6,
                  }}
                >
                  {tab.code}
                </span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Search + Category */}
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[14px] h-[14px]"
                strokeWidth={1.4}
                style={{ color: "var(--dim)" }}
              />
              <input
                type="text"
                placeholder="SEARCH"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-[220px] h-9 pl-6 pr-2 bg-transparent outline-none"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--bone)",
                  borderBottom: "1px solid var(--bone-10)",
                }}
              />
            </div>

            <button
              className="flex items-center gap-3 h-9 px-4 bp-label transition-colors"
              style={{
                fontSize: "10px",
                border: "1px solid var(--bone-10)",
                color: "var(--bone)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--teal)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--bone-10)";
              }}
            >
              <span style={{ color: "var(--dim)" }}>CATEGORY</span>
              <span>{category.toUpperCase()}</span>
              <ChevronDown
                className="w-[12px] h-[12px]"
                style={{ color: "var(--dim)" }}
              />
            </button>
          </div>
        </div>
      </div>

      <ProfilePopup open={profileOpen} onClose={() => setProfileOpen(false)} />
    </>
  );
}
