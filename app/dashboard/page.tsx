import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";

async function DashboardContent() {
  const supabase = await createClient();

  // 1. Verify User is Logged In
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Central Hub</h1>
          <p className="text-muted-foreground">Manage your inventory and pricing.</p>
        </div>
        <Link href="/dashboard/add">
          <Button className="w-full md:w-auto">
            + Add Vehicle
          </Button>
        </Link>
      </div>

      {/* KPI Section (Placeholder for now) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory List Placeholder */}
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">No vehicles found. Click "Add Vehicle" to start.</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Central Hub</h1>
            <p className="text-muted-foreground">Manage your inventory and pricing.</p>
          </div>
        </div>
        <div className="rounded-md border p-8 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
