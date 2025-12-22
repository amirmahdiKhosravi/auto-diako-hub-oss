"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DashboardTopNavProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onMenuClick: () => void;
}

export function DashboardTopNav({
  searchTerm,
  onSearchChange,
  onMenuClick,
}: DashboardTopNavProps) {
  return (
    <div className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center gap-4 px-4 lg:px-6 py-4">
        {/* Hamburger Menu (Mobile) */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="flex-1 relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search inventory by VIN, model, or stock #..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "pl-10 h-10 rounded-lg border-slate-300 bg-white",
              "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500",
              "transition-all duration-200",
              "placeholder:text-slate-400"
            )}
          />
        </div>

        {/* Add Vehicle Button */}
        <Link href="/dashboard/add">
          <Button
            className={cn(
              "h-10 px-4 gap-2 bg-blue-600 hover:bg-blue-700 text-white",
              "rounded-lg shadow-sm hover:shadow-md",
              "transition-all duration-200",
              "font-medium"
            )}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Vehicle</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
