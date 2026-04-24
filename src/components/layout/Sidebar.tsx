"use client";

import {
  Home,
  ShieldCheck,
  Blocks,
  ArrowLeftRight,
  Code2,
  TerminalSquare,
  Gift,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const navItems = [
  { label: "Home", icon: Home, id: "home", href: "/dashboard", code: "00" },
  { label: "Credentials", icon: ShieldCheck, id: "credentials", href: "/credentials", code: "01" },
  { label: "Explorer", icon: Blocks, id: "block-explorer", href: "/explorer", code: "02" },
  { label: "Bridge", icon: ArrowLeftRight, id: "bridge", href: "/bridge", code: "03" },
  { label: "Developers", icon: Code2, id: "developers", href: "/developers", code: "04", badge: "NEW" },
  { label: "Portal", icon: TerminalSquare, id: "developer-portal", href: "/portal", code: "05" },
  { label: "Rewards", icon: Gift, id: "rewards", href: "/rewards", code: "06", badge: "SOON" },
  { label: "Discover", icon: Compass, id: "discover", href: "/discover", code: "07", badge: "SOON" },
];

interface SidebarProps {
  activePage?: string;
}

export default function Sidebar({ activePage = "home" }: SidebarProps) {
  return (
    <aside
      className="w-[220px] min-w-[220px] flex flex-col z-40 animate-slide-in-left h-screen sticky top-0"
      style={{
        background: "transparent",
        borderRight: "1px solid var(--violet)",
      }}
    >
      {/* Brand */}
      <Link href="/dashboard" className="px-6 pt-20 pb-6 flex items-center gap-2.5">
        <span
          className="w-[6px] h-[6px] rounded-full animate-dot-pulse"
          style={{
            background: "var(--teal)",
            boxShadow: "0 0 8px var(--teal)",
          }}
        />
        <span
          className="bp-label"
          style={{ color: "var(--bone)", fontSize: "11px" }}
        >
          BREATH / 00
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-2 stagger-children space-y-px">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activePage;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 transition-all duration-200 group",
                "bp-label"
              )}
              style={{
                color: isActive ? "var(--teal)" : "var(--dim)",
                fontSize: "11px",
              }}
            >
              <span
                className="w-[6px] h-[6px] rounded-full flex-shrink-0"
                style={{
                  background: isActive ? "var(--teal)" : "transparent",
                  border: isActive ? "none" : "1px solid var(--bone-20)",
                  boxShadow: isActive ? "0 0 8px var(--teal)" : "none",
                }}
              />
              <Icon
                className="w-[14px] h-[14px] flex-shrink-0 transition-colors"
                style={{
                  color: isActive ? "var(--teal)" : "var(--dim)",
                }}
                strokeWidth={1.4}
              />
              <span
                className="flex-1 text-left transition-colors"
                style={{
                  color: isActive ? "var(--bone)" : "var(--dim)",
                }}
              >
                {item.label}
              </span>
              {item.badge && (
                <span
                  className="bp-label"
                  style={{
                    fontSize: "8.5px",
                    color:
                      item.badge === "NEW" ? "var(--teal)" : "var(--dim)",
                    opacity: item.badge === "NEW" ? 1 : 0.6,
                  }}
                >
                  {item.badge}
                </span>
              )}
              {!item.badge && (
                <span
                  className="bp-readout"
                  style={{ fontSize: "9px", color: "var(--dim)", opacity: 0.5 }}
                >
                  {item.code}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 pb-16">
        <div
          className="h-px mb-4"
          style={{ background: "var(--bone-10)" }}
        />
        <p
          className="bp-label"
          style={{ fontSize: "9px", letterSpacing: "0.3em" }}
        >
          v0.04 · BCN
        </p>
      </div>
    </aside>
  );
}
