"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteVehicle } from "@/app/inventory/[id]/actions";

interface DeleteVehicleButtonProps {
  vehicleId: string;
  vehicleName: string;
}

export function DeleteVehicleButton({ vehicleId, vehicleName }: DeleteVehicleButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${vehicleName}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteVehicle(vehicleId);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      setIsDeleting(false);
      alert("Failed to delete vehicle. Please try again.");
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={isDeleting}
      className="gap-2"
    >
      <Trash2 className="w-4 h-4" />
      {isDeleting ? "Deleting..." : "Delete"}
    </Button>
  );
}

