"use client";

import { useState, createContext, useContext } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardTopNav } from "@/components/dashboard-top-nav";

// Create a simple context to pass search term to pages
const SearchContext = createContext<{
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}>({
  searchTerm: "",
  setSearchTerm: () => {},
});

export function useSearchTerm() {
  return useContext(SearchContext);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm }}>
      <div className="flex h-screen bg-slate-50">
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
        <div className="flex-1 flex flex-col lg:pl-64 overflow-hidden">
          {/* Top Navigation */}
          <DashboardTopNav
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
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
    </SearchContext.Provider>
  );
}
