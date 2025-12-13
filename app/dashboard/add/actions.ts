"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// VIN Decoding using NHTSA API
async function decodeVIN(vin: string): Promise<{ make: string; model: string; year: number; trim: string; bodyClass: string } | null> {
  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );
    
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    
    if (data.Results && data.Results.length > 0) {
      const results = data.Results;
      
      // Extract vehicle information from NHTSA response
      const getValue = (variable: string) => {
        const result = results.find((r: any) => r.Variable === variable);
        return result?.Value && result.Value !== "Not Applicable" && result.Value !== "" ? result.Value : null;
      };

      const make = getValue("Make") || "Unknown";
      const model = getValue("Model") || "Unknown";
      const modelYear = getValue("Model Year");
      const year = modelYear ? parseInt(modelYear) : new Date().getFullYear();
      const trim = getValue("Trim") || "";
      const bodyClass = getValue("Body Class") || "";
      
      // Color is not available in NHTSA VIN decode, will default to "Unknown"
      // Users can update it manually later if needed

      return { make, model, year, trim, bodyClass };
    }
    
    return null;
  } catch (error) {
    console.error("VIN Decode Error:", error);
    return null;
  }
}

export async function addVehicle(formData: FormData) {
  const supabase = await createClient();

  // 1. Check Auth (Security)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login");
  }

  // 2. Extract Common Data
  const vin = (formData.get("vin") as string)?.trim().toUpperCase() || null;
  const mileage = parseInt(formData.get("mileage") as string);
  const listedPrice = parseFloat(formData.get("price") as string);
  const conditionNotes = (formData.get("condition") as string) || "";
  const carfaxLink = (formData.get("carfax_link") as string) || null;

  // 3. Extract Manual Data (May be empty/null if using Auto Mode)
  let make = (formData.get("make") as string)?.trim() || "";
  let model = (formData.get("model") as string)?.trim() || "";
  const yearStr = formData.get("year") as string;
  let year = yearStr ? parseInt(yearStr) : 0;
  const color = (formData.get("color") as string)?.trim() || "Unknown";
  const floorPriceStr = formData.get("floor_price") as string;
  const floorPrice = floorPriceStr ? parseFloat(floorPriceStr) : null;
  const description = (formData.get("description") as string)?.trim() || "";

  // 4. Specs Logic: Auto-Decode if Manual Data is missing
  let trim = "";
  let bodyClass = "";

  if ((!make || !model || !year) && vin) {
    try {
      console.log(`Auto-decoding VIN: ${vin}`);
      const vinData = await decodeVIN(vin);
      
      if (vinData) {
        // Only overwrite if the user didn't provide it
        if (!make) make = vinData.make;
        if (!model) model = vinData.model;
        if (!year) year = vinData.year;
        
        trim = vinData.trim || "";
        bodyClass = vinData.bodyClass || "";

        if (make === "Unknown") {
          throw new Error("Could not decode VIN");
        }
      } else {
        throw new Error("Failed to decode VIN");
      }
    } catch (error) {
      console.error("VIN Decode Error:", error);
      // Fallback: If manual is missing AND auto fails, we must stop.
      if (!make || !model) {
        throw new Error("Vehicle details missing. Please enter Make/Model manually or provide a valid VIN.");
      }
    }
  }

  // Validate required fields
  if (!make || !model || !year) {
    throw new Error("Make, Model, and Year are required. Please provide them manually or enter a valid VIN.");
  }

  // 5. Description Logic: Generate if missing
  let finalDescription = description;
  if (!finalDescription) {
    try {
      // Get base URL for API route (server-side)
      // In production, use NEXT_PUBLIC_SITE_URL or construct from VERCEL_URL
      // In development, use localhost
      let baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
      if (!baseUrl && process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      }
      if (!baseUrl) {
        baseUrl = "http://localhost:3000";
      }
      
      const apiUrl = `${baseUrl}/api/generate-description`;
      
      const requestBody: Record<string, unknown> = {
        make,
        model,
        year,
        mileage,
        condition: conditionNotes || "No additional notes provided.",
      };
      
      // Add optional fields if available
      if (trim) requestBody.trim = trim;
      if (bodyClass) requestBody.bodyClass = bodyClass;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        // Check if response is actually JSON before parsing
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const data = await response.json();
            finalDescription = data.description || "";
          } catch (parseError) {
            console.error("Failed to parse JSON response:", parseError);
            finalDescription = conditionNotes || "Contact us for details.";
          }
        } else {
          // Response is not JSON (likely HTML error page)
          const text = await response.text();
          console.error("API route returned non-JSON response:", text.substring(0, 200));
          finalDescription = conditionNotes || "Contact us for details.";
        }
      } else {
        // Try to get error message from response
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            console.error("API route error:", response.status, errorData.error || response.statusText);
          } catch {
            console.error("API route error:", response.status, response.statusText);
          }
        } else {
          console.error("API route error:", response.status, response.statusText);
        }
        finalDescription = conditionNotes || "Contact us for details.";
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      finalDescription = conditionNotes || "Contact us for details.";
    }
  }

  // 6. Calculate floor price if not provided
  const finalFloorPrice = floorPrice !== null ? floorPrice : Math.round(listedPrice * 0.9);

  // 7. Handle Image Uploads
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

  // 8. Prepare data for insertion
  const rawData: Record<string, any> = {
    vin: vin,
    make,
    model,
    year,
    listed_price: listedPrice,
    floor_price: finalFloorPrice,
    color,
    mileage,
    condition_notes: conditionNotes,
    status: "Available",
    image_urls: imageUrls.length > 0 ? imageUrls : null,
  };

  // Add carfax_link if provided
  if (carfaxLink) {
    rawData.carfax_link = carfaxLink;
  }

  // Add description if available
  if (finalDescription) {
    rawData.description = finalDescription;
  }

  // 9. Insert into Supabase
  const { error } = await supabase
    .from("inventory")
    .insert([rawData]);

  if (error) {
    console.error("Database Error:", error);
    throw new Error("Failed to save vehicle. Please try again.");
  }

  // 10. Success! Redirect to Dashboard
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
