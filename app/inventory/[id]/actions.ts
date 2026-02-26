"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updateVehicle(vehicleId: string, formData: FormData) {
  const supabase = await createClient();

  // 1. Check Auth (Security)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // 2. Handle Image Uploads (if new images provided)
  const imageFiles = formData.getAll("images") as File[];
  const newImageUrls: string[] = [];

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
        newImageUrls.push(urlData.publicUrl);
      }
    }
  }

  // 3. Get existing vehicle to preserve existing images
  const { data: existingVehicle } = await supabase
    .from("inventory")
    .select("image_urls")
    .eq("id", vehicleId)
    .single();

  // 4. Combine existing images with new ones (if any)
  const existingImages = existingVehicle?.image_urls || [];
  const allImages = Array.isArray(existingImages) 
    ? [...existingImages, ...newImageUrls]
    : newImageUrls.length > 0 
      ? newImageUrls 
      : null;

  // 5. Extract Data
  const latStr = formData.get("latitude") as string;
  const lonStr = formData.get("longitude") as string;
  const latitude = latStr && latStr.trim() ? parseFloat(latStr) : null;
  const longitude = lonStr && lonStr.trim() ? parseFloat(lonStr) : null;

  const rawData = {
    vin: formData.get("vin") as string,
    make: formData.get("make") as string,
    model: formData.get("model") as string,
    year: parseInt(formData.get("year") as string),
    listed_price: parseFloat(formData.get("price") as string),
    floor_price: parseFloat(formData.get("floor_price") as string),
    color: formData.get("color") as string,
    mileage: parseInt(formData.get("mileage") as string),
    condition_notes: (formData.get("condition") as string) || "",
    description: (formData.get("description") as string)?.trim() || null,
    carfax_link: (formData.get("carfax_link") as string)?.trim() || null,
    image_urls: allImages && allImages.length > 0 ? allImages : existingImages,
    body_style: (formData.get("body_style") as string) || null,
    transmission: (formData.get("transmission") as string) || null,
    fuel_type: (formData.get("fuel_type") as string) || null,
    latitude,
    longitude,
    vehicle_condition: (formData.get("vehicle_condition") as string) || null,
    trim: (formData.get("trim") as string)?.trim() || null,
    body_class: (formData.get("body_class") as string)?.trim() || null,
  };

  // 6. Update in Supabase
  const { error } = await supabase
    .from("inventory")
    .update(rawData)
    .eq("id", vehicleId);

  if (error) {
    console.error("Database Error:", error);
    redirect(`/inventory/${vehicleId}/edit?error=Database Error`);
  }

  // 7. Success! Revalidate and redirect
  revalidatePath("/dashboard");
  revalidatePath(`/inventory/${vehicleId}`);
  redirect(`/inventory/${vehicleId}`);
}

export async function deleteVehicle(vehicleId: string) {
  const supabase = await createClient();

  // 1. Check Auth (Security)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // 2. Get vehicle to potentially delete images
  const { data: vehicle } = await supabase
    .from("inventory")
    .select("image_urls")
    .eq("id", vehicleId)
    .single();

  // 3. Clear references from chat_sessions so the delete can succeed
  await supabase
    .from("chat_sessions")
    .update({ active_car_id: null })
    .eq("active_car_id", vehicleId);

  // 4. Delete vehicle from database
  const { error } = await supabase
    .from("inventory")
    .delete()
    .eq("id", vehicleId);

  if (error) {
    console.error("Database Error:", error);
    redirect(`/inventory/${vehicleId}?error=Delete Failed`);
  }

  // 5. Optionally delete images from storage (commented out for safety)
  // If you want to delete images, uncomment and implement:
  // if (vehicle?.image_urls) {
  //   // Extract file paths from URLs and delete from storage
  // }

  // 6. Success! Revalidate and redirect
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function toggleStatus(vehicleId: string, currentStatus: string) {
  const supabase = await createClient();

  // 1. Check Auth (Security)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // 2. Toggle status
  const newStatus = currentStatus === "Available" ? "Unavailable" : "Available";

  // 3. Update status in Supabase
  const { error } = await supabase
    .from("inventory")
    .update({ status: newStatus })
    .eq("id", vehicleId);

  if (error) {
    console.error("Database Error:", error);
    redirect(`/inventory/${vehicleId}?error=Status Update Failed`);
  }

  // 4. Success! Revalidate and return so client can refresh
  revalidatePath("/dashboard");
  revalidatePath(`/inventory/${vehicleId}`);
  return { success: true, newStatus };
}

