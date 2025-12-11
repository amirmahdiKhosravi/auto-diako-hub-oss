import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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

  // 2. Fetch Inventory (Real Data)
  const { data: vehicles, error } = await supabase
    .from("inventory")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching inventory:", error);
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

      {/* KPI Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${vehicles?.reduce((sum, v) => sum + (v.listed_price || 0), 0).toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Floor Price</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No vehicles found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              vehicles?.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell>
                    <Badge variant={vehicle.status === 'Sold' ? 'destructive' : 'default'}>
                      {vehicle.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{vehicle.vin}</TableCell>
                  <TableCell>${vehicle.listed_price?.toLocaleString() || 0}</TableCell>
                  <TableCell className="text-red-600 font-medium">
                    ${vehicle.floor_price?.toLocaleString() || 0}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
