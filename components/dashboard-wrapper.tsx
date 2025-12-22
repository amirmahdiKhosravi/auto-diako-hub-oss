"use client";

import { useSearchTerm } from "@/lib/search-context";
import { DashboardContent } from "@/components/dashboard-content";

interface DashboardWrapperProps {
  vehicles: any[];
}

export function DashboardWrapper({ vehicles }: DashboardWrapperProps) {
  const { searchTerm } = useSearchTerm();
  return <DashboardContent vehicles={vehicles} searchTerm={searchTerm} />;
}
