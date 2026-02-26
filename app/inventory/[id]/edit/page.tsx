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

              {/* Row: Body Style, Transmission, Fuel Type, Condition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="body_style">Body Style</Label>
                  <select id="body_style" name="body_style" className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-base shadow-sm md:text-sm" defaultValue={vehicle.body_style || ""}>
                    <option value="">Select...</option>
                    <option value="SEDAN">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="TRUCK">Truck</option>
                    <option value="HATCHBACK">Hatchback</option>
                    <option value="COUPE">Coupe</option>
                    <option value="CONVERTIBLE">Convertible</option>
                    <option value="VAN">Van</option>
                    <option value="MINIVAN">Minivan</option>
                    <option value="CROSSOVER">Crossover</option>
                    <option value="WAGON">Wagon</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transmission">Transmission</Label>
                  <select id="transmission" name="transmission" className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-base shadow-sm md:text-sm" defaultValue={vehicle.transmission || ""}>
                    <option value="">Select...</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fuel_type">Fuel Type</Label>
                  <select id="fuel_type" name="fuel_type" className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-base shadow-sm md:text-sm" defaultValue={vehicle.fuel_type || ""}>
                    <option value="">Select...</option>
                    <option value="Gasoline">Gasoline</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle_condition">Condition</Label>
                  <select id="vehicle_condition" name="vehicle_condition" className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-base shadow-sm md:text-sm" defaultValue={vehicle.vehicle_condition || ""}>
                    <option value="">Select...</option>
                    <option value="EXCELLENT">Excellent</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trim">Trim (Optional)</Label>
                  <Input id="trim" name="trim" placeholder="LX, Sport, etc." defaultValue={vehicle.trim || ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body_class">Body Class (Optional - from VIN)</Label>
                  <Input id="body_class" name="body_class" placeholder="Sedan/Sedan, SUV, etc." defaultValue={vehicle.body_class || ""} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude (Optional)</Label>
                  <Input id="latitude" name="latitude" type="number" step="any" placeholder="43.5890" defaultValue={vehicle.latitude ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude (Optional)</Label>
                  <Input id="longitude" name="longitude" type="number" step="any" placeholder="-79.6441" defaultValue={vehicle.longitude ?? ""} />
                </div>
              </div>

              {/* Condition Notes */}
              <div className="space-y-2">
                <Label htmlFor="condition">Condition & Features (Notes)</Label>
                <Textarea
                  id="condition"
                  name="condition"
                  placeholder="Clean Carfax, Winter Tires included, Small scratch on rear bumper..."
                  className="h-32 resize-none"
                  defaultValue={vehicle.condition_notes || ""}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Listing Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Full listing description shown to buyers. Leave empty to hide."
                  className="min-h-40 resize-y"
                  defaultValue={vehicle.description || ""}
                />
                <p className="text-xs text-muted-foreground">
                  This is the main description shown on the vehicle listing. The AI uses it for chat; you can edit it here.
                </p>
              </div>

              {/* Carfax Link */}
              <div className="space-y-2">
                <Label htmlFor="carfax_link">Carfax Link (Optional)</Label>
                <Input
                  id="carfax_link"
                  name="carfax_link"
                  type="url"
                  placeholder="https://vhr.carfax.ca/..."
                  defaultValue={vehicle.carfax_link || ""}
                />
              </div>

              {/* Vehicle Images */}
              <div className="space-y-2">
                <Label htmlFor="images">Add Additional Vehicle Images</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 hover:bg-muted/50 transition">
                  <Input
                    id="images"
                    name="images"
                    type="file"
                    accept="image/*"
                    multiple
                    className="cursor-pointer bg-background text-foreground file:text-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Select new images to add to existing ones. Existing images will be preserved.
                  </p>
                </div>
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

