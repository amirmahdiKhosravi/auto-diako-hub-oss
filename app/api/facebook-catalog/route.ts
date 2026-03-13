import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase Client (anon key for public API - no cookies/session)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

// Escape special characters for XML to prevent breaking the feed
function escape(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Strip URLs from text so Facebook does not treat description as URL field
function stripUrls(text: string): string {
  if (!text) return "";
  return text.replace(/https?:\/\/\S+/gi, "(link removed)").trim();
}

// True if string is a valid absolute URL for the feed
function isValidFeedUrl(url: string): boolean {
  const trimmed = typeof url === "string" ? url.trim() : "";
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}

export async function GET() {
  // Normalize base URL (no trailing slash) to avoid malformed listing URLs
  const baseUrlRaw = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const baseUrl = baseUrlRaw.replace(/\/$/, "");

  // Street address required by Facebook catalog (env, fallback if unset)
  const streetAddress =
    process.env.NEXT_PUBLIC_DEALER_STREET_ADDRESS ||
    process.env.FACEBOOK_CATALOG_STREET_ADDRESS ||
    "Address not specified";

  // 1. Fetch Active Inventory
  const { data: cars, error } = await supabase
    .from("inventory")
    .select("*")
    .eq("status", "Available"); // Only sync available cars

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 2. Start building XML - Facebook Automotive Feed Format
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<listings>
  <title>Vehicle Inventory</title>
  <link rel="self" href="${baseUrl}/api/facebook-catalog"/>
`;

  // Location defaults (read once, used per-vehicle as fallback)
  const defaultLat = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LATITUDE || "0");
  const defaultLon = parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LONGITUDE || "0");
  const defaultCity = process.env.NEXT_PUBLIC_DEFAULT_CITY || "City";
  const defaultRegion = process.env.NEXT_PUBLIC_DEFAULT_REGION || "Region";
  const defaultCountry = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || "US";
  const supabaseStorageBase = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vehicles`;

  const getImageUrl = (pathOrUrl: string) => {
    const s = typeof pathOrUrl === "string" ? pathOrUrl.trim() : "";
    return s.startsWith("http") ? s : `${supabaseStorageBase}/${s}`.trim();
  };

  cars?.forEach((car) => {
    const carLink = `${baseUrl}/inventory/${car.id}`;

    const rawImageUrls = car.image_urls && Array.isArray(car.image_urls) ? car.image_urls : [];
    const imageUrls = rawImageUrls
      .filter((url: unknown): url is string => typeof url === "string" && isValidFeedUrl(getImageUrl(url)))
      .slice(0, 20);

    const price = car.listed_price ?? car.floor_price ?? 0;
    const description = stripUrls(car.description ?? car.condition_notes ?? "");
    const exteriorColor = car.color ?? "Unknown";

    const bodyStyle = (car.body_style || "SEDAN").toUpperCase();
    const transmission = escape(car.transmission || "Automatic");
    const fuelType = (car.fuel_type || "Gasoline").toUpperCase();
    const vehicleCondition = (car.vehicle_condition || "GOOD").toUpperCase();

    const title = car.trim
      ? `${car.year} ${car.make} ${car.model} ${car.trim}`
      : `${car.year} ${car.make} ${car.model}`;

    const imageElements = imageUrls.length > 0
      ? imageUrls.map((img: string) => `<image><url>${escape(getImageUrl(img))}</url></image>`).join("\n        ")
      : "";

    const mileageXml = `
        <mileage>
          <value>${car.mileage ?? 0}</value>
          <unit>KM</unit>
        </mileage>`;

    const lat = car.latitude ?? defaultLat;
    const lon = car.longitude ?? defaultLon;
    const addressXml = `
        <address format="simple">
          <component name="addr1">${escape(streetAddress)}</component>
          <component name="city">${escape(defaultCity)}</component>
          <component name="region">${escape(defaultRegion)}</component>
          <component name="country">${escape(defaultCountry)}</component>
        </address>
        <latitude>${lat}</latitude>
        <longitude>${lon}</longitude>`;

    xml += `
    <listing>
        <vehicle_id>${car.id}</vehicle_id>
        <title>${escape(title)}</title>
        <description>${escape(description)}</description>
        <url>${escape(carLink)}</url>
        <make>${escape(car.make)}</make>
        <model>${escape(car.model)}</model>
        <year>${car.year}</year>
        ${mileageXml}
        ${imageElements}
        <price>${price} CAD</price>
        <transmission>${transmission}</transmission>
        <body_style>${bodyStyle}</body_style>
        <fuel_type>${fuelType}</fuel_type>
        <exterior_color>${escape(exteriorColor)}</exterior_color>
        <vin>${escape(car.vin ?? "")}</vin>
        <condition>${vehicleCondition}</condition>
        <state_of_vehicle>Used</state_of_vehicle>
        <availability>AVAILABLE</availability>
        ${addressXml}
    </listing>
    `;
  });

  xml += `</listings>`;

  // 4. Return XML with correct headers
  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate", // Cache for 1 hour
    },
  });
}
