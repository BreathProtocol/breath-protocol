"use client";

import { useRef, useEffect } from "react";
import {
  ChevronRight,
  LogOut,
  Fingerprint,
  Link2,
  AppWindow,
  Wallet,
  Plus,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";

interface ProfilePopupProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfilePopup({ open, onClose }: ProfilePopupProps) {
  const { user, session, signOut } = useAuth();
  const popupRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "specimen";
  const initials = displayName.slice(0, 2).toUpperCase();
  const avatarUrl =
    user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const emailOrAddress = user?.email || "Es9v…wWQRSm9";

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 10);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleLogout = async () => {
    onClose();
    await signOut();
    router.push("/");
  };

  const menuItemStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "var(--bone)",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 backdrop-blur-sm"
        style={{ background: "rgba(7, 8, 12, 0.55)" }}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-start justify-end p-4 pt-20 md:pr-8 pointer-events-none">
        <div
          ref={popupRef}
          className="w-full max-w-[360px] pointer-events-auto animate-fade-in-up"
          style={{
            background: "rgba(7, 8, 12, 0.94)",
            border: "1px solid var(--bone-10)",
            backdropFilter: "blur(20px)",
            animationDuration: "0.25s",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 p-5">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-12 h-12 object-cover"
                  style={{ border: "1px solid var(--teal)" }}
                />
              ) : (
                <div
                  className="w-12 h-12 flex items-center justify-center"
                  style={{
                    border: "1px solid var(--teal)",
                    background: "var(--nebula)",
                  }}
                >
                  <span
                    className="bp-label"
                    style={{ fontSize: "12px", color: "var(--bone)" }}
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
            <div className="flex-1 min-w-0">
              <div className="bp-eyebrow mb-1">SPECIMEN · 0047</div>
              <p
                className="font-display truncate"
                style={{
                  fontWeight: 300,
                  fontSize: "20px",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}
              >
                {displayName}
              </p>
              <p
                className="bp-readout truncate mt-1"
                style={{ fontSize: "10px", color: "var(--dim)" }}
              >
                {emailOrAddress}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px mx-5" style={{ background: "var(--bone-10)" }} />

          {/* Menu */}
          <div className="py-2">
            <a
              href={
                session?.access_token
                  ? `https://verify.breath.id/verify?token=${session.access_token}`
                  : "https://verify.breath.id/verify"
              }
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onClose()}
              className="w-full flex items-center gap-4 px-5 py-3 transition-colors hover:bg-[rgba(201,123,94,0.05)]"
              style={menuItemStyle}
            >
              <Fingerprint
                className="w-[14px] h-[14px]"
                strokeWidth={1.4}
                style={{ color: "var(--teal)" }}
              />
              <span className="flex-1 text-left">Verify Identity</span>
              <ChevronRight
                className="w-[12px] h-[12px]"
                style={{ color: "var(--dim)" }}
              />
            </a>

            <button
              className="w-full flex items-center gap-4 px-5 py-3 transition-colors hover:bg-[rgba(201, 123, 94,0.05)]"
              style={menuItemStyle}
            >
              <Wallet
                className="w-[14px] h-[14px]"
                strokeWidth={1.4}
                style={{ color: "var(--dim)" }}
              />
              <span className="flex-1 text-left">Wallets</span>
              <Plus
                className="w-[12px] h-[12px]"
                style={{ color: "var(--dim)" }}
              />
            </button>

            <button
              className="w-full flex items-center gap-4 px-5 py-3 transition-colors hover:bg-[rgba(201, 123, 94,0.05)]"
              style={menuItemStyle}
            >
              <AppWindow
                className="w-[14px] h-[14px]"
                strokeWidth={1.4}
                style={{ color: "var(--dim)" }}
              />
              <span className="flex-1 text-left">Connected Apps</span>
              <Link2
                className="w-[12px] h-[12px]"
                style={{ color: "var(--dim)" }}
              />
            </button>
          </div>

          {/* Divider */}
          <div className="h-px mx-5" style={{ background: "var(--bone-10)" }} />

          {/* Logout */}
          <div className="p-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 transition-colors"
              style={{
                border: "1px solid var(--bone-20)",
                ...menuItemStyle,
                letterSpacing: "0.3em",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--teal)";
                e.currentTarget.style.color = "var(--teal)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--bone-20)";
                e.currentTarget.style.color = "var(--bone)";
              }}
            >
              <LogOut className="w-[12px] h-[12px]" strokeWidth={1.4} />
              LOG OUT
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
