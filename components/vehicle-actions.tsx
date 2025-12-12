"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteVehicleButton } from "@/components/delete-vehicle-button";
import { ToggleStatusButton } from "@/components/toggle-status-button";

interface VehicleActionsProps {
  vehicleId: string;
  vehicleName: string;
  currentStatus: string;
}

export function VehicleActions({ vehicleId, vehicleName, currentStatus }: VehicleActionsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by only rendering on client
  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
        <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
        <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href={`/inventory/${vehicleId}/edit`}>
        <Button variant="outline" className="gap-2">
          <Edit className="w-4 h-4" />
          Edit
        </Button>
      </Link>
      
      <ToggleStatusButton
        vehicleId={vehicleId}
        currentStatus={currentStatus}
      />

      <DeleteVehicleButton
        vehicleId={vehicleId}
        vehicleName={vehicleName}
      />
    </div>
  );
}

