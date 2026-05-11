"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import WelcomeBanner from "@/components/home/WelcomeBanner";
import UserProfileStrip from "@/components/home/UserProfileStrip";
import PromoCarousel from "@/components/home/PromoCarousel";
import GettingStarted from "@/components/home/GettingStarted";
import CredentialCards from "@/components/home/CredentialCards";
import SupportFAQ from "@/components/home/SupportFAQ";
import BreathIndex from "@/components/sidebar-widgets/BreathIndex";
import MyCredentials from "@/components/sidebar-widgets/MyCredentials";
import TokenWidget from "@/components/sidebar-widgets/TokenWidget";
import HelpCenter from "@/components/sidebar-widgets/HelpCenter";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 lg:hidden"
          style={{ background: "rgba(255, 255, 255, 0.6)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:static lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <Sidebar activePage="home" />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0 min-h-0">
        <div className="flex-1 flex flex-col min-w-0 min-h-0 h-screen">
          <TopBar
            onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
            pageTitle="Atlas"
          />
          <main className="flex-1 overflow-y-auto min-h-0 px-4 md:px-8 py-6 space-y-8">
            <WelcomeBanner />
            <UserProfileStrip />
            <PromoCarousel />
            <GettingStarted />
            <CredentialCards />
            <SupportFAQ />

            {/* Sidebar widgets stacked below on mobile/tablet */}
            <div className="xl:hidden space-y-4 pt-4">
              <BreathIndex />
              <MyCredentials />
              <TokenWidget />
              <HelpCenter />
            </div>

            <div className="h-12" />
          </main>
        </div>

        {/* Right sidebar */}
        <aside
          className="hidden xl:block w-[320px] flex-shrink-0 overflow-y-auto px-4 py-6 space-y-4"
          style={{ borderLeft: "1px solid var(--violet)" }}
        >
          <BreathIndex />
          <MyCredentials />
          <TokenWidget />
          <HelpCenter />
        </aside>
      </div>
    </div>
  );
}
