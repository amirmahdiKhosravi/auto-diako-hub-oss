import { OpenAI } from "openai";

// Type definition for vehicle data used for embedding
export interface VehicleEmbeddingData {
  make: string;
  model: string;
  year: number;
  mileage: number;
  color: string;
  conditionNotes: string;
  description?: string;
  trim?: string;
  bodyClass?: string;
  listedPrice?: number;
  floorPrice?: number;
  vin?: string | null;
}

// Initialize OpenAI client
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey });
}

/**
 * Constructs a comprehensive text representation of vehicle details for embedding
 */
function constructVehicleText(data: VehicleEmbeddingData): string {
  const parts: string[] = [];

  // Basic vehicle information
  parts.push(`${data.year} ${data.make} ${data.model}`);
  
  if (data.trim) {
    parts.push(`Trim: ${data.trim}`);
  }
  
  if (data.bodyClass) {
    parts.push(`Body Style: ${data.bodyClass}`);
  }

  // Physical attributes
  parts.push(`Color: ${data.color}`);
  parts.push(`Mileage: ${data.mileage} km`);

  // Condition and notes
  if (data.conditionNotes) {
    parts.push(`Condition: ${data.conditionNotes}`);
  }

  // Description (if available)
  if (data.description) {
    parts.push(`Description: ${data.description}`);
  }

  // Price context (if available)
  if (data.listedPrice) {
    parts.push(`Listed Price: $${data.listedPrice}`);
  }
  if (data.floorPrice) {
    parts.push(`Floor Price: $${data.floorPrice}`);
  }

  // VIN (if available)
  if (data.vin) {
    parts.push(`VIN: ${data.vin}`);
  }

  return parts.join(". ");
}

/**
 * Generates a vector embedding for a vehicle using OpenAI's text-embedding-3-small model
 * Returns a 1536-dimensional vector array
 * 
 * @param data - Vehicle data to embed
 * @returns Promise<number[]> - The embedding vector (1536 dimensions)
 * @throws Error if OpenAI API key is not configured or API call fails
 */
export async function generateVehicleEmbedding(
  data: VehicleEmbeddingData
): Promise<number[]> {
  try {
    const openai = getOpenAIClient();
    const text = constructVehicleText(data);

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    const embedding = response.data[0]?.embedding;

    if (!embedding || embedding.length !== 1536) {
      throw new Error("Invalid embedding response from OpenAI");
    }

    return embedding;
  } catch (error) {
    console.error("Embedding generation error:", error);
    throw error;
  }
}
