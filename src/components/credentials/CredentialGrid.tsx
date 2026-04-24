"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { credentials } from "./credentialsData";
import CredentialCard from "./CredentialCard";
import { cn } from "@/lib/utils";

interface CredentialGridProps {
  activeTab: "all" | "verified" | "unverified";
  search: string;
  category: string;
}

const categories = ["Finance", "Identity"] as const;

export default function CredentialGrid({
  activeTab,
  search,
  category,
}: CredentialGridProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    return credentials.filter((c) => {
      if (activeTab === "verified" && !c.verified) return false;
      if (activeTab === "unverified" && c.verified) return false;
      if (category !== "All" && c.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeTab, search, category]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof credentials> = {};
    for (const cat of categories) {
      const items = filtered.filter((c) => c.category === cat);
      if (items.length > 0) map[cat] = items;
    }
    return map;
  }, [filtered]);

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
        <div className="bp-eyebrow mb-4" style={{ color: "var(--dim)" }}>
          NO MATCH
        </div>
        <p
          className="bp-editorial"
          style={{ fontSize: "22px", opacity: 0.6 }}
        >
          The archive is quiet. Adjust your filters.
        </p>
      </div>
    );
  }

  const totalCount = filtered.length;

  return (
    <div className="space-y-16 animate-fade-in-up">
      {/* Page masthead */}
      <div>
        <div className="bp-eyebrow mb-3">ATLAS · {totalCount.toString().padStart(3, "0")}</div>
        <h1
          className="bp-display"
          style={{ fontSize: "clamp(48px, 7vw, 96px)" }}
        >
          Credential
          <br />
          <span style={{ color: "var(--teal)", opacity: 0.92 }}>Archive</span>
        </h1>
      </div>

      {categories.map((cat) => {
        const items = grouped[cat];
        if (!items) return null;
        const isCollapsed = collapsed[cat];

        return (
          <section key={cat}>
            {/* Category header */}
            <button
              onClick={() =>
                setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }))
              }
              className="flex items-center justify-between w-full mb-6 pb-4 group"
              style={{ borderBottom: "1px solid var(--bone-10)" }}
            >
              <div className="flex items-baseline gap-4">
                <span
                  className="bp-readout"
                  style={{ fontSize: "11px", color: "var(--dim)" }}
                >
                  {items.length.toString().padStart(2, "0")}
                </span>
                <h2
                  className="bp-display"
                  style={{ fontSize: "clamp(24px, 3vw, 36px)" }}
                >
                  {cat}
                </h2>
              </div>
              <ChevronDown
                className={cn(
                  "w-[18px] h-[18px] transition-all duration-300",
                  isCollapsed && "-rotate-90"
                )}
                strokeWidth={1.4}
                style={{
                  color: isCollapsed ? "var(--dim)" : "var(--teal)",
                }}
              />
            </button>

            {/* Grid — 12 col (span 4 / 6 / 12) */}
            {!isCollapsed && (
              <div className="grid grid-cols-12 gap-4 stagger-children">
                {items.map((cred) => (
                  <div
                    key={cred.name}
                    className="col-span-12 sm:col-span-6 lg:col-span-4"
                  >
                    <CredentialCard cred={cred} />
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
