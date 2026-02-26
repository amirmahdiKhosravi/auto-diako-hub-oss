"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { toggleStatus } from "@/app/inventory/[id]/actions";

interface ToggleStatusButtonProps {
  vehicleId: string;
  currentStatus: string;
}

export function ToggleStatusButton({ vehicleId, currentStatus }: ToggleStatusButtonProps) {
  const [isToggling, setIsToggling] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await toggleStatus(vehicleId, currentStatus);
      setIsToggling(false);
      router.refresh();
    } catch (error) {
      // Auth redirect: let it propagate
      if (
        error &&
        typeof error === "object" &&
        "digest" in error &&
        String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
      ) {
        throw error;
      }
      console.error("Error toggling status:", error);
      setIsToggling(false);
      alert("Failed to update status. Please try again.");
    }
  };

  const isAvailable = currentStatus === "Available";

  return (
    <Button
      type="button"
      onClick={handleToggle}
      disabled={isToggling}
      variant={isAvailable ? "secondary" : "default"}
      className="gap-2"
    >
      {isAvailable ? (
        <>
          <XCircle className="w-4 h-4" />
          {isToggling ? "Updating..." : "Mark Unavailable"}
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4" />
          {isToggling ? "Updating..." : "Mark Available"}
        </>
      )}
    </Button>
  );
}

