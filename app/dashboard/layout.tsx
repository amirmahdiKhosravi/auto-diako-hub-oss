"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardTopNav } from "@/components/dashboard-top-nav";
import { SearchProvider } from "@/lib/search-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <SearchProvider>
      <div className="flex h-screen bg-background">
        {/* Desktop Sidebar */}
        <DashboardSidebar />

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <DashboardSidebar
            isMobile
            onClose={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-72 overflow-hidden">
          {/* Top Navigation - Only mobile menu button */}
          <DashboardTopNav
            onMenuClick={() => setMobileMenuOpen(true)}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SearchProvider>
  );
}
