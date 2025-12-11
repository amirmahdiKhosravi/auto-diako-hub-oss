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

  // 2. Handle Image Uploads
  const imageFiles = formData.getAll("images") as File[];
  const imageUrls: string[] = [];

  if (imageFiles.length > 0 && imageFiles[0].size > 0) {
    for (const file of imageFiles) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        continue; // Skip non-image files
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split(".").pop();
      const fileName = `${user.id}/${timestamp}-${randomString}.${fileExtension}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("vehicle-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        continue; // Skip this file and continue with others
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("vehicle-images")
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        imageUrls.push(urlData.publicUrl);
      }
    }
  }

  // 3. Extract Data
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
    status: "Available",
    image_urls: imageUrls.length > 0 ? imageUrls : null
  };

  // 4. Insert into Supabase
  const { error } = await supabase
    .from("inventory")
    .insert([rawData]);

  if (error) {
    console.error("Database Error:", error);
    // In a real app, pass this error back to the UI
    redirect("/dashboard/add?error=Database Error"); 
  }

  // 5. Success! Redirect to Dashboard
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
