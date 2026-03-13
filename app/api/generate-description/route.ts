import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLLMProvider } from "@/lib/llm/factory";
import {
  VEHICLE_DESCRIPTION_SYSTEM_PROMPT,
  buildVehicleDescriptionContext,
} from "@/lib/vehicle-description-prompt";

interface GenerateDescriptionRequest {
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: string;
  trim?: string;
  bodyClass?: string;
  color?: string;
  body_style?: string;
  transmission?: string;
  fuel_type?: string;
  vehicle_condition?: string;
}

function validateRequest(body: unknown): body is GenerateDescriptionRequest {
  if (typeof body !== "object" || body === null) return false;

  const req = body as Record<string, unknown>;

  const hasRequiredFields =
    typeof req.make === "string" && req.make.trim().length > 0 &&
    typeof req.model === "string" && req.model.trim().length > 0 &&
    typeof req.year === "number" && req.year > 1900 && req.year <= new Date().getFullYear() + 1 &&
    typeof req.mileage === "number" && req.mileage >= 0 &&
    typeof req.condition === "string";

  const hasValidOptionals =
    (req.trim === undefined || typeof req.trim === "string") &&
    (req.bodyClass === undefined || typeof req.bodyClass === "string") &&
    (req.color === undefined || typeof req.color === "string") &&
    (req.body_style === undefined || typeof req.body_style === "string") &&
    (req.transmission === undefined || typeof req.transmission === "string") &&
    (req.fuel_type === undefined || typeof req.fuel_type === "string") &&
    (req.vehicle_condition === undefined || typeof req.vehicle_condition === "string");

  return hasRequiredFields && hasValidOptionals;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    if (!validateRequest(body)) {
      return NextResponse.json(
        { error: "Invalid request. Required fields: make, model, year (number), mileage (number), condition" },
        { status: 400 },
      );
    }

    const { make, model, year, mileage, condition, trim, bodyClass, color, body_style, transmission, fuel_type, vehicle_condition } = body;

    let llmProvider;
    try {
      llmProvider = createLLMProvider();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[generate-description] LLM config error:", message);
      return NextResponse.json({ error: `Service configuration error: ${message}` }, { status: 500 });
    }

    const userMessage = `Write a description for this vehicle based on the following details:\n\n${buildVehicleDescriptionContext({
      year, make, model, mileage,
      condition_notes: condition,
      trim: trim?.trim() || null,
      body_class: bodyClass?.trim() || null,
      color: color?.trim() || null,
      body_style: body_style?.trim() || null,
      transmission: transmission?.trim() || null,
      fuel_type: fuel_type?.trim() || null,
      vehicle_condition: vehicle_condition?.trim() || null,
    })}`;

    const result = await llmProvider.generateChatCompletion({
      systemMessage: VEHICLE_DESCRIPTION_SYSTEM_PROMPT,
      userMessage,
      temperature: 0.5,
      maxTokens: 8192,
    });

    if (!result?.content) {
      return NextResponse.json({ error: "LLM returned empty response" }, { status: 500 });
    }

    return NextResponse.json({ description: result.content });
  } catch (error) {
    console.error("[generate-description] Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate description" },
      { status: 500 },
    );
  }
}
