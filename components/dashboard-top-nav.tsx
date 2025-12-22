"use client";

import { Menu } from "lucide-react";

interface DashboardTopNavProps {
  onMenuClick: () => void;
}

export function DashboardTopNav({
  onMenuClick,
}: DashboardTopNavProps) {
  return (
    <div className="sticky top-0 z-40 w-full lg:hidden bg-card border-b border-border shadow-sm">
      <div className="flex items-center px-4 lg:px-6 py-4">
        {/* Hamburger Menu (Mobile) */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
