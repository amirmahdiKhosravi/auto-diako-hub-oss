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

  // 3. Loop through cars and add to XML
  cars?.forEach((car) => {
    // Construct absolute URL for the vehicle page
    const carLink = `${baseUrl}/inventory/${car.id}`;

    // Handle Images: Use image_urls (schema) - ensure full URLs, validate format
    const rawImageUrls = car.image_urls && Array.isArray(car.image_urls) ? car.image_urls : [];
    const getImageUrl = (pathOrUrl: string) => {
      const s = typeof pathOrUrl === "string" ? pathOrUrl.trim() : "";
      return s.startsWith("http") ? s : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/vehicles/${s}`.trim();
    };
    // Only include valid absolute URLs (Facebook rejects malformed or multiple links)
    const imageUrls = rawImageUrls
      .filter((url: unknown): url is string => typeof url === "string" && isValidFeedUrl(getImageUrl(url)))
      .slice(0, 20);

    // Schema: listed_price, description ?? condition_notes, color
    const price = car.listed_price ?? car.floor_price ?? 0;
    // Sanitize description: strip URLs so Facebook does not treat it as URL field
    const rawDescription = car.description ?? car.condition_notes ?? "";
    const description = stripUrls(rawDescription);
    const exteriorColor = car.color ?? "Unknown";

    // Use real fields from DB, fallbacks for backwards compatibility
    const bodyStyle = (car.body_style || "SEDAN").toUpperCase();
    const transmission = escape(car.transmission || "Automatic");
    const fuelType = (car.fuel_type || "Gasoline").toUpperCase();
    const vehicleCondition = (car.vehicle_condition || "GOOD").toUpperCase();

    // Title: include trim if available
    const title = car.trim
      ? `${car.year} ${car.make} ${car.model} ${car.trim}`
      : `${car.year} ${car.make} ${car.model}`;

    // Build image elements - Facebook nested format
    const imageElements =
      imageUrls.length > 0
        ? imageUrls
            .map((img: string) => `<image><url>${escape(getImageUrl(img))}</url></image>`)
            .join("\n        ")
        : "";

    // Mileage: Facebook nested format with KM (uppercase)
    const mileageXml = `
        <mileage>
          <value>${car.mileage ?? 0}</value>
          <unit>KM</unit>
        </mileage>`;

    const defaultLat = process.env.NEXT_PUBLIC_DEFAULT_LATITUDE || "0";
    const defaultLon = process.env.NEXT_PUBLIC_DEFAULT_LONGITUDE || "0";
    const defaultCity = process.env.NEXT_PUBLIC_DEFAULT_CITY || "City";
    const defaultRegion = process.env.NEXT_PUBLIC_DEFAULT_REGION || "Region";
    const defaultCountry = process.env.NEXT_PUBLIC_DEFAULT_COUNTRY || "US";

    const lat = car.latitude ?? parseFloat(defaultLat);
    const lon = car.longitude ?? parseFloat(defaultLon);
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
