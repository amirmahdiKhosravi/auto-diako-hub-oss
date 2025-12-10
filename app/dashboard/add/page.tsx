import { addVehicle } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AddVehiclePage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Breadcrumb / Back Button */}
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Inventory</CardTitle>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border">
              <div className="space-y-2">
                <Label htmlFor="price">Listed Price ($)</Label>
                <Input id="price" name="price" type="number" required placeholder="15000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor_price" className="text-red-600">Floor Price (Hidden Minimum)</Label>
                <Input id="floor_price" name="floor_price" type="number" required placeholder="13500" />
                <p className="text-xs text-gray-500">The AI will never negotiate below this.</p>
              </div>
            </div>

            {/* Condition Notes */}
            <div className="space-y-2">
              <Label htmlFor="condition">Condition & Features</Label>
              <Textarea 
                id="condition" 
                name="condition" 
                placeholder="Clean Carfax, Winter Tires included, Small scratch on rear bumper..." 
                className="h-32"
              />
            </div>

            <Button type="submit" className="w-full">
              Save Vehicle
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
