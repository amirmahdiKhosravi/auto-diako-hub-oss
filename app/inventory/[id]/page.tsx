import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, FileText, MapPin, ExternalLink, Calendar, Gauge, Hash, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleActions } from "@/components/vehicle-actions";

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  color: string;
  mileage: number;
  listed_price: number;
  floor_price: number;
  status: string;
  vin: string;
  condition_notes: string;
  created_at: string;
  image_urls?: string[] | null;
  body_style?: string | null;
  transmission?: string | null;
  fuel_type?: string | null;
  vehicle_condition?: string | null;
  trim?: string | null;
  body_class?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string | null;
  carfax_link?: string | null;
}

async function VehicleData({ id }: { id: string }) {
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
    .eq("id", id)
    .single();

  if (error || !vehicle) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Back Button and Actions */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Action Buttons */}
          <VehicleActions
            vehicleId={vehicle.id}
            vehicleName={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            currentStatus={vehicle.status}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {vehicle.image_urls && vehicle.image_urls.length > 0 ? (
              <>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                  <Image
                    src={vehicle.image_urls[0]}
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                {vehicle.image_urls.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {vehicle.image_urls.slice(1, 5).map((url: string, index: number) => (
                      <div
                        key={index}
                        className="relative aspect-square w-full overflow-hidden rounded-lg border border-border"
                      >
                        <Image
                          src={url}
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} - Image ${index + 2}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 25vw, 12.5vw"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="relative aspect-video w-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center rounded-lg border border-border">
                <div className="text-center space-y-2">
                  <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground">No images available</p>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Details */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-foreground">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h1>
                  <p className="text-lg text-muted-foreground mt-1">{vehicle.color}</p>
                </div>
                <Badge
                  variant={vehicle.status === "Available" ? "default" : "secondary"}
                  className="text-sm px-3 py-1"
                >
                  {vehicle.status}
                </Badge>
              </div>

              {/* Price */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-baseline gap-2">
                  <span className="text-muted-foreground">Listed Price</span>
                  <p className="text-4xl font-bold text-primary">
                    ${vehicle.listed_price.toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Floor Price: ${vehicle.floor_price.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Specifications */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Year</p>
                      <p className="font-semibold text-foreground">{vehicle.year}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Gauge className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Mileage</p>
                      <p className="font-semibold text-foreground">
                        {vehicle.mileage.toLocaleString()} km
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Palette className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Color</p>
                      <p className="font-semibold text-foreground">{vehicle.color}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Hash className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">VIN</p>
                      <p className="font-semibold text-foreground font-mono text-sm">
                        {vehicle.vin}
                      </p>
                    </div>
                  </div>
                  {vehicle.body_style && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Body Style</p>
                        <p className="font-semibold text-foreground">{vehicle.body_style}</p>
                      </div>
                    </div>
                  )}
                  {vehicle.body_class && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Body Class</p>
                        <p className="font-semibold text-foreground">{vehicle.body_class}</p>
                      </div>
                    </div>
                  )}
                  {vehicle.transmission && (
                    <div className="flex items-start gap-3">
                      <Gauge className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Transmission</p>
                        <p className="font-semibold text-foreground">{vehicle.transmission}</p>
                      </div>
                    </div>
                  )}
                  {vehicle.fuel_type && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Fuel Type</p>
                        <p className="font-semibold text-foreground">{vehicle.fuel_type}</p>
                      </div>
                    </div>
                  )}
                  {vehicle.vehicle_condition && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Condition</p>
                        <p className="font-semibold text-foreground">{vehicle.vehicle_condition}</p>
                      </div>
                    </div>
                  )}
                  {vehicle.trim && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Trim</p>
                        <p className="font-semibold text-foreground">{vehicle.trim}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {vehicle.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{vehicle.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Condition Notes */}
            {vehicle.condition_notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Condition & Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap">{vehicle.condition_notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Added to Inventory</span>
                    <span className="text-foreground">
                      {new Date(vehicle.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {vehicle.carfax_link && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Carfax Report</span>
                      <a
                        href={vehicle.carfax_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground underline-offset-4 hover:underline inline-flex items-center gap-1"
                      >
                        View report
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                  {(vehicle.latitude != null || vehicle.longitude != null) && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Location</span>
                      <span className="text-foreground">
                        {[vehicle.latitude, vehicle.longitude].filter((n) => n != null).join(", ")}
                        {" · "}
                        <a
                          href={`https://www.google.com/maps?q=${vehicle.latitude ?? ""},${vehicle.longitude ?? ""}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline-offset-4 hover:underline inline-flex items-center gap-1"
                        >
                          View on map
                          <MapPin className="w-3.5 h-3.5 inline" />
                        </a>
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function VehicleSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<VehicleSkeleton />}>
      <VehicleDetailContent params={params} />
    </Suspense>
  );
}

async function VehicleDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VehicleData id={id} />;
}

