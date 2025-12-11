import { addVehicle } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AddVehiclePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Breadcrumb / Back Button */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Inventory</CardTitle>
            <CardDescription>Enter the details for the new vehicle</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={addVehicle} className="space-y-6">
              
              {/* Row 1: VIN & Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
                  <Input id="vin" name="vin" required placeholder="1HGCM..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" name="year" type="number" required placeholder="2018" />
                </div>
              </div>

              {/* Row 2: Make & Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" name="make" required placeholder="Honda" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" name="model" required placeholder="Civic" />
                </div>
              </div>

              {/* Row 3: Color & Mileage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" name="color" required placeholder="Black" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage (km)</Label>
                  <Input id="mileage" name="mileage" type="number" required placeholder="50000" />
                </div>
              </div>

              {/* Row 4: Pricing (The Important Part) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
                <div className="space-y-2">
                  <Label htmlFor="price">Listed Price ($)</Label>
                  <Input id="price" name="price" type="number" required placeholder="15000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor_price" className="text-destructive">Floor Price (Hidden Minimum)</Label>
                  <Input id="floor_price" name="floor_price" type="number" required placeholder="13500" />
                  <p className="text-xs text-muted-foreground">The AI will never negotiate below this.</p>
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
                />
              </div>

              {/* Vehicle Images */}
              <div className="space-y-2">
                <Label htmlFor="images">Vehicle Images</Label>
                <Input 
                  id="images" 
                  name="images" 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">You can select multiple images to upload</p>
              </div>

              <Button type="submit" className="w-full">
                Save Vehicle
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
