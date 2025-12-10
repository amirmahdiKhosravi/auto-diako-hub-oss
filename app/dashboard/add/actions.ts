"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function addVehicle(formData: FormData) {
  const supabase = await createClient();

  // 1. Check Auth (Security)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // 2. Extract Data
  const rawData = {
    vin: formData.get("vin") as string,
    make: formData.get("make") as string,
    model: formData.get("model") as string,
    year: parseInt(formData.get("year") as string),
    listed_price: parseFloat(formData.get("price") as string),
    floor_price: parseFloat(formData.get("floor_price") as string),
    color: formData.get("color") as string,
    mileage: parseInt(formData.get("mileage") as string),
    condition_notes: formData.get("condition") as string,
    status: "Available"
  };

  // 3. Insert into Supabase
  const { error } = await supabase
    .from("inventory")
    .insert([rawData]);

  if (error) {
    console.error("Database Error:", error);
    // In a real app, pass this error back to the UI
    redirect("/dashboard/add?error=Database Error"); 
  }

  // 4. Success! Redirect to Dashboard
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
