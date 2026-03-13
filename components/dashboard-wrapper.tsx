"use client";

import { useSearchTerm } from "@/lib/search-context";
import { DashboardContent } from "@/components/dashboard-content";
import type { Vehicle } from "@/types/vehicle";

interface DashboardWrapperProps {
  vehicles: Vehicle[];
}

export function DashboardWrapper({ vehicles }: DashboardWrapperProps) {
  const { searchTerm } = useSearchTerm();
  return <DashboardContent vehicles={vehicles} searchTerm={searchTerm} />;
}
