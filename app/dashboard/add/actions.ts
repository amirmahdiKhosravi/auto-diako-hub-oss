"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateVehicleEmbedding } from "@/lib/embeddings";
import { createLLMProvider } from "@/lib/llm/factory";
import {
  VEHICLE_DESCRIPTION_SYSTEM_PROMPT,
  buildVehicleDescriptionContext,
} from "@/lib/vehicle-description-prompt";

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

  // New Facebook/vehicle fields
  const bodyStyle = (formData.get("body_style") as string)?.trim() || null;
  const transmission = (formData.get("transmission") as string)?.trim() || null;
  const fuelType = (formData.get("fuel_type") as string)?.trim() || null;
  const vehicleCondition = (formData.get("vehicle_condition") as string)?.trim() || null;
  const trimFromForm = (formData.get("trim") as string)?.trim() || null;
  const latStr = formData.get("latitude") as string;
  const lonStr = formData.get("longitude") as string;
  const latitude = latStr && latStr.trim() ? parseFloat(latStr) : null;
  const longitude = lonStr && lonStr.trim() ? parseFloat(lonStr) : null;

  // 4. Specs Logic: Auto-Decode if Manual Data is missing
  let trim = trimFromForm || "";
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
        
        trim = vinData.trim || trimFromForm || "";
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
      const llmProvider = createLLMProvider();
      const userMessage = `Write a description for this vehicle based on the following details:\n\n${buildVehicleDescriptionContext({
        year,
        make,
        model,
        mileage,
        condition_notes: conditionNotes,
        trim: trim || null,
        body_class: bodyClass || null,
        color: color || null,
        body_style: bodyStyle || null,
        transmission: transmission || null,
        fuel_type: fuelType || null,
        vehicle_condition: vehicleCondition || null,
        vin: vin || null,
      })}`;

      const result = await llmProvider.generateChatCompletion({
        systemMessage: VEHICLE_DESCRIPTION_SYSTEM_PROMPT,
        userMessage,
        temperature: 0.5,
        maxTokens: 8192,
      });

      if (result?.content && result.content.trim()) {
        finalDescription = result.content;
      } else {
        console.error("LLM returned empty description");
        finalDescription = conditionNotes || "Contact us for details.";
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("AI Generation Error:", errorMessage);
      console.error("Full error:", error);
      finalDescription = conditionNotes || "Contact us for details.";
    }
  }

  // 6. Calculate floor price if not provided
  const finalFloorPrice = floorPrice !== null ? floorPrice : Math.round(listedPrice * 0.9);

  // 7. Generate Embedding
  let vehicleEmbedding: number[] | null = null;
  try {
    vehicleEmbedding = await generateVehicleEmbedding({
      make,
      model,
      year,
      mileage,
      color,
      conditionNotes: conditionNotes || "",
      description: finalDescription || undefined,
      trim: trim || undefined,
      bodyClass: bodyClass || undefined,
      bodyStyle: bodyStyle || undefined,
      transmission: transmission || undefined,
      fuelType: fuelType || undefined,
      listedPrice,
      floorPrice: finalFloorPrice,
      vin: vin || undefined,
    });
  } catch (error) {
    // Log error but don't block vehicle creation
    console.error("Embedding generation failed:", error);
    // Continue without embedding - vehicle creation will proceed
  }

  // 8. Handle Image Uploads
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

  // 9. Prepare data for insertion (use null for empty optional strings)
  const rawData: Record<string, unknown> = {
    vin: vin || null,
    make,
    model,
    year,
    listed_price: listedPrice,
    floor_price: finalFloorPrice,
    color: color || "Unknown",
    mileage,
    condition_notes: conditionNotes || "",
    status: "Available",
    image_urls: imageUrls.length > 0 ? imageUrls : null,
    body_style: bodyStyle?.trim() || null,
    transmission: transmission?.trim() || null,
    fuel_type: fuelType?.trim() || null,
    latitude: latitude ?? null,
    longitude: longitude ?? null,
    vehicle_condition: vehicleCondition?.trim() || null,
    trim: trim?.trim() || null,
    body_class: bodyClass?.trim() || null,
  };

  // Add carfax_link if provided
  if (carfaxLink?.trim()) {
    rawData.carfax_link = carfaxLink.trim();
  }

  // Add description if available
  if (finalDescription?.trim()) {
    rawData.description = finalDescription.trim();
  }

  // Add embedding if generated successfully (pgvector expects array format)
  if (vehicleEmbedding && vehicleEmbedding.length > 0) {
    rawData.embedding = vehicleEmbedding;
  }

  // 10. Insert into Supabase
  const { error } = await supabase
    .from("inventory")
    .insert([rawData]);

  if (error) {
    console.error("Database Error:", error);
    const message = error.message || "Unknown database error";
    const hint = error.details ? ` (${error.details})` : "";
    throw new Error(`Failed to save vehicle: ${message}${hint}`);
  }

  // 11. Success! Redirect to Dashboard
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
