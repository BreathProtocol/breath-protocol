"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";
import CredentialsTopBar from "@/components/credentials/CredentialsTopBar";
import CredentialGrid from "@/components/credentials/CredentialGrid";

export default function CredentialsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "verified" | "unverified">("all");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === "1";

  useEffect(() => {
    if (bypassAuth) return;
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router, bypassAuth]);

  if (!bypassAuth && (loading || !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <span
            className="w-[8px] h-[8px] rounded-full animate-dot-pulse"
            style={{
              background: "var(--teal)",
              boxShadow: "0 0 12px var(--teal)",
            }}
          />
          <span className="bp-label" style={{ color: "var(--bone)" }}>
            CALIBRATING · HELIX DRIVE
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {sidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          style={{ background: "rgba(255, 255, 255, 0.6)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:static lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar activePage="credentials" />
      </div>

      <div className="flex-1 flex flex-col min-w-0 min-h-0 h-screen">
        <CredentialsTopBar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
        />
        <main className="flex-1 overflow-y-auto min-h-0 px-4 md:px-8 py-8">
          <CredentialGrid
            activeTab={activeTab}
            search={search}
            category={category}
          />
        </main>
      </div>
    </div>
  );
}
