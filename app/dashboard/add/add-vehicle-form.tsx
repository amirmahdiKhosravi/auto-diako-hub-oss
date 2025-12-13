'use client'

import { useState } from "react";
import { addVehicle } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import Link from "next/link";

type FormType = "manual" | "vin";

export default function AddVehicleForm() {
  const [formType, setFormType] = useState<FormType>("manual");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      await addVehicle(formData);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Link href="/dashboard" className="text-sm text-gray-500 hover:underline mb-4 block">
        ← Back to Dashboard
      </Link>

      <Card className="border-t-4 border-t-black shadow-lg">
        <CardHeader>
          <CardTitle>Add New Inventory</CardTitle>
          <p className="text-sm text-gray-500 mb-4">
            Choose your entry method. Both options will auto-generate descriptions.
          </p>
          
          {/* Form Type Selector */}
          <div className="flex gap-2 border-b border-gray-200 pb-4">
            <Button
              type="button"
              variant={formType === "manual" ? "default" : "outline"}
              onClick={() => setFormType("manual")}
              className="flex-1"
            >
              Manual Entry
            </Button>
            <Button
              type="button"
              variant={formType === "vin" ? "default" : "outline"}
              onClick={() => setFormType("vin")}
              className="flex-1"
            >
              Quick Entry (VIN)
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {formType === "manual" ? (
            <form action={handleSubmit} className="space-y-6">
              {/* Manual Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vin">VIN (Optional)</Label>
                  <Input id="vin" name="vin" placeholder="1HGCM..." maxLength={17} className="font-mono uppercase" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" name="year" type="number" required placeholder="2018" />
                </div>
              </div>

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

              <div className="space-y-2">
                <Label htmlFor="carfax_link">Carfax Link (Optional)</Label>
                <Input id="carfax_link" name="carfax_link" type="url" placeholder="https://vhr.carfax.ca/..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Vehicle Photos</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <Input id="images" name="images" type="file" multiple accept="image/*" required className="cursor-pointer" />
                  <p className="text-xs text-gray-400 mt-2 text-center">Upload main angles (Front, Back, Interior)</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition & Features</Label>
                <Textarea 
                  id="condition" 
                  name="condition" 
                  placeholder="Clean Carfax, Winter Tires included, Small scratch on rear bumper..." 
                  className="h-24"
                />
                <p className="text-xs text-gray-500">The AI will use this to write the listing description.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Leave empty to auto-generate, or enter your own custom description..." 
                  className="h-32"
                />
                <p className="text-xs text-gray-500">If left empty, AI will generate a description based on the vehicle details above.</p>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Description...
                  </>
                ) : (
                  "Add Vehicle"
                )}
              </Button>
            </form>
          ) : (
            <form action={handleSubmit} className="space-y-6">
              {/* VIN Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
                  <Input 
                    id="vin" name="vin" 
                    required 
                    placeholder="1HGCM..." 
                    maxLength={17} 
                    className="font-mono uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Mileage (km)</Label>
                  <Input id="mileage" name="mileage" type="number" required placeholder="125000" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Listed Price ($)</Label>
                  <Input id="price" name="price" type="number" required placeholder="15000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carfax_link">Carfax Link (Optional)</Label>
                  <Input id="carfax_link" name="carfax_link" type="url" placeholder="https://vhr.carfax.ca/..." />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Vehicle Photos</Label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                  <Input id="images" name="images" type="file" multiple accept="image/*" required className="cursor-pointer" />
                  <p className="text-xs text-gray-400 mt-2 text-center">Upload main angles (Front, Back, Interior)</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition & Extra Features</Label>
                <Textarea 
                  id="condition" 
                  name="condition" 
                  placeholder="e.g. Winter tires included, small scratch on bumper, fresh oil change..." 
                  className="h-24"
                />
                <p className="text-xs text-gray-500">The AI will combine this with the VIN data to write the listing.</p>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Decoding & Generating...
                  </>
                ) : (
                  "Add Vehicle"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

