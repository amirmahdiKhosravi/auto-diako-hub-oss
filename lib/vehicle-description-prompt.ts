/**
 * Shared system prompt and vehicle context builder for AI-generated vehicle descriptions.
 * Used by the generate-description API and the add-vehicle server action.
 */

export interface VehicleDescriptionContext {
  year: number;
  make: string;
  model: string;
  mileage: number;
  condition_notes: string;
  trim?: string | null;
  body_class?: string | null;
  color?: string | null;
  body_style?: string | null;
  transmission?: string | null;
  fuel_type?: string | null;
  vehicle_condition?: string | null;
  vin?: string | null;
}

export const VEHICLE_DESCRIPTION_SYSTEM_PROMPT = `You are writing a standard, complete vehicle listing description for a dealership inventory system.

Your task: Write a factual, professional description that gives buyers a clear picture of the vehicle. Use complete sentences. Do not use emojis or marketing hype.

Requirements:
- Tone: Professional and factual. No exaggerated claims or "experience luxury" style openings.
- Do NOT include price or any mention of cost (price is shown separately).
- Structure your description in 2–4 short paragraphs (approximately 100–200 words total):
  1. Overview: One or two sentences identifying the vehicle (year, make, model, trim if applicable) and its main appeal.
  2. Key specifications: Mileage, color, transmission, fuel type, body style, and condition—in clear, readable form (e.g. a short paragraph or a few sentences).
  3. Condition and features: Any notes about condition, options, or notable features provided in the listing.
  4. Closing: A brief, professional invitation to contact the dealership or inquire for more details.

Output only the description text, with no headings or labels.`;

/**
 * Builds a single string of vehicle details for the user message so the model can write a relevant description.
 * Only includes lines for fields that have a value.
 */
export function buildVehicleDescriptionContext(vehicle: VehicleDescriptionContext): string {
  const lines: string[] = [];

  const titleParts = [vehicle.year, vehicle.make, vehicle.model];
  if (vehicle.trim?.trim()) {
    titleParts.push(vehicle.trim.trim());
  }
  lines.push(`Vehicle: ${titleParts.join(" ")}`);

  if (vehicle.color?.trim()) {
    lines.push(`Color: ${vehicle.color.trim()}`);
  }
  lines.push(`Mileage: ${vehicle.mileage} km`);
  if (vehicle.body_style?.trim()) {
    lines.push(`Body style: ${vehicle.body_style.trim()}`);
  }
  if (vehicle.body_class?.trim()) {
    lines.push(`Body class: ${vehicle.body_class.trim()}`);
  }
  if (vehicle.transmission?.trim()) {
    lines.push(`Transmission: ${vehicle.transmission.trim()}`);
  }
  if (vehicle.fuel_type?.trim()) {
    lines.push(`Fuel type: ${vehicle.fuel_type.trim()}`);
  }
  if (vehicle.vehicle_condition?.trim()) {
    lines.push(`Condition: ${vehicle.vehicle_condition.trim()}`);
  }
  if (vehicle.vin?.trim()) {
    lines.push(`VIN: ${vehicle.vin.trim()}`);
  }
  lines.push(
    `Condition/Notes: ${vehicle.condition_notes?.trim() || "No additional notes provided."}`
  );

  return lines.join("\n");
}
