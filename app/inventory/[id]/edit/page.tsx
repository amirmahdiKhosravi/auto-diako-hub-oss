import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { updateVehicle } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";

interface EditVehiclePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}

async function EditVehicleForm({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  const { id: vehicleId } = await paramsPromise;
  const supabase = await createClient();

  // 1. Verify User is Logged In
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // 2. Fetch Vehicle Data
  const { data: vehicle, error } = await supabase
    .from("inventory")
    .select("*")
    .eq("id", vehicleId)
    .single();

  if (error || !vehicle) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Breadcrumb / Back Button */}
        <div className="mb-8">
          <Link
            href={`/inventory/${vehicleId}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Vehicle Details
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Vehicle</CardTitle>
            <CardDescription>Update the details for this vehicle</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={updateVehicle.bind(null, vehicleId)} className="space-y-6">
              {/* Row 1: VIN & Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
                  <Input
                    id="vin"
                    name="vin"
                    required
                    placeholder="1HGCM..."
                    defaultValue={vehicle.vin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    required
                    placeholder="2018"
                    defaultValue={vehicle.year}
                  />
                </div>
              </div>

              {/* Row 2: Make & Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input
                    id="make"
                    name="make"
                    required
                    placeholder="Honda"
                    defaultValue={vehicle.make}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    name="model"
                    required
                    placeholder="Civic"
                    defaultValue={vehicle.model}
                  />
                </div>
              </div>

              {/* Row 3: Color & Mileage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    name="color"
                    required
                    placeholder="Black"
                    defaultValue={vehicle.color}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage (km)</Label>
                  <Input
                    id="mileage"
                    name="mileage"
                    type="number"
                    required
                    placeholder="50000"
                    defaultValue={vehicle.mileage}
                  />
                </div>
              </div>

              {/* Row 4: Pricing (The Important Part) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
                <div className="space-y-2">
                  <Label htmlFor="price">Listed Price ($)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    required
                    placeholder="15000"
                    defaultValue={vehicle.listed_price}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor_price" className="text-destructive">
                    Floor Price (Hidden Minimum)
                  </Label>
                  <Input
                    id="floor_price"
                    name="floor_price"
                    type="number"
                    required
                    placeholder="13500"
                    defaultValue={vehicle.floor_price}
                  />
                  <p className="text-xs text-muted-foreground">
                    The AI will never negotiate below this.
                  </p>
                </div>
              </div>

              {/* Condition Notes */}
              <div className="space-y-2">
                <Label htmlFor="condition">Condition & Features</Label>
                <Textarea
                  id="condition"
                  name="condition"
                  placeholder="Clean Carfax, Winter Tires included, Small scratch on rear bumper..."
                  className="h-32 resize-none"
                  defaultValue={vehicle.condition_notes || ""}
                />
              </div>

              {/* Vehicle Images */}
              <div className="space-y-2">
                <Label htmlFor="images">Add Additional Vehicle Images</Label>
                <Input
                  id="images"
                  name="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Select new images to add to existing ones. Existing images will be preserved.
                </p>
              </div>

              <Button type="submit" className="w-full">
                Update Vehicle
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

async function ErrorDisplay({ searchParamsPromise }: { searchParamsPromise: Promise<{ error?: string }> }) {
  const { error } = await searchParamsPromise;
  if (!error) return null;
  
  return (
    <div className="max-w-2xl mx-auto px-6 pt-6">
      <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md">
        Error: {error}
      </div>
    </div>
  );
}

export default function EditVehiclePage({
  params,
  searchParams,
}: EditVehiclePageProps) {
  return (
    <>
      <Suspense fallback={null}>
        <ErrorDisplay searchParamsPromise={searchParams} />
      </Suspense>
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      }>
        <EditVehicleForm paramsPromise={params} />
      </Suspense>
    </>
  );
}

