import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLLMProvider } from "@/lib/llm/factory";

// Type definitions
interface GenerateDescriptionRequest {
  make: string;
  model: string;
  year: number;
  mileage: number;
  condition: string;
  trim?: string;
  bodyClass?: string;
}

interface GenerateDescriptionResponse {
  description: string;
}

interface ErrorResponse {
  error: string;
}

// Validate request body
function validateRequest(body: unknown): body is GenerateDescriptionRequest {
  if (typeof body !== "object" || body === null) {
    return false;
  }

  const req = body as Record<string, unknown>;
  return (
    typeof req.make === "string" &&
    req.make.trim().length > 0 &&
    typeof req.model === "string" &&
    req.model.trim().length > 0 &&
    typeof req.year === "number" &&
    req.year > 1900 &&
    req.year <= new Date().getFullYear() + 1 &&
    typeof req.mileage === "number" &&
    req.mileage >= 0 &&
    typeof req.condition === "string" &&
    req.condition.trim().length > 0 &&
    (req.trim === undefined || typeof req.trim === "string") &&
    (req.bodyClass === undefined || typeof req.bodyClass === "string")
  );
}

export async function POST(req: Request) {
  try {
    // 1. Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ErrorResponse>(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    let body: unknown;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json<ErrorResponse>(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    if (!validateRequest(body)) {
      return NextResponse.json<ErrorResponse>(
        {
          error:
            "Invalid request. Required fields: make, model, year (number), mileage (number), condition",
        },
        { status: 400 }
      );
    }

    const { make, model, year, mileage, condition, trim, bodyClass } = body;

    // 3. Initialize LLM provider
    let llmProvider;
    try {
      console.log("[API] Initializing LLM provider...");
      llmProvider = createLLMProvider();
      console.log("[API] LLM provider initialized successfully");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[API] LLM provider configuration error:", errorMessage);
      console.error("[API] Full error:", error);
      return NextResponse.json<ErrorResponse>(
        { error: `Service configuration error: ${errorMessage}` },
        { status: 500 }
      );
    }

    // 4. Construct the prompt with proper message structure
    const systemMessage = `You are an expert car salesman writing a Facebook Marketplace listing.
Write catchy, professional descriptions for vehicles.

Rules:
- Use bullet points for features
- Use emojis to make it pop
- Tone: Excited but trustworthy
- Keep it under 150 words
- Do NOT include a price (it's listed in a separate field)`;

    let vehicleInfo = `Vehicle: ${year} ${make} ${model}`;
    if (trim) {
      vehicleInfo += ` ${trim}`;
    }
    if (bodyClass) {
      vehicleInfo += `\nStyle: ${bodyClass}`;
    }
    
    const userMessage = `Write a description for this vehicle:

${vehicleInfo}
Mileage: ${mileage} km
Condition/Notes: ${condition}`;

    // 5. Generate description using LLM provider
    let result;
    try {
      console.log("[API] Calling LLM generateChatCompletion...");
      console.log("[API] User message length:", userMessage.length);
      result = await llmProvider.generateChatCompletion({
        systemMessage,
        userMessage,
        temperature: 0.7,
        maxTokens: 300,
      });
      console.log("[API] LLM generation successful, content length:", result?.content?.length || 0);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[API] LLM generation error:", errorMessage);
      console.error("[API] Full error:", error);
      if (error instanceof Error && error.stack) {
        console.error("[API] Error stack:", error.stack);
      }
      return NextResponse.json<ErrorResponse>(
        { error: `Failed to generate description: ${errorMessage}` },
        { status: 500 }
      );
    }

    // 6. Return the generated description
    if (!result?.content) {
      console.error("LLM returned empty content");
      return NextResponse.json<ErrorResponse>(
        { error: "LLM returned empty response" },
        { status: 500 }
      );
    }

    return NextResponse.json<GenerateDescriptionResponse>({
      description: result.content,
    });
  } catch (error) {
    // Handle all errors - ensure we always return JSON
    console.error("Generate description error:", error);
    
    // If it's already a Response (shouldn't happen, but be safe)
    if (error instanceof Response) {
      return error;
    }
    
    // Return JSON error response
    return NextResponse.json<ErrorResponse>(
      { 
        error: error instanceof Error 
          ? error.message 
          : "Failed to generate description" 
      },
      { status: 500 }
    );
  }
}

