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
  bodyStyle?: string;
  transmission?: string;
  fuelType?: string;
  listedPrice?: number;
  floorPrice?: number;
  vin?: string | null;
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
  if (data.bodyStyle) {
    parts.push(`Body Type: ${data.bodyStyle}`);
  }
  if (data.transmission) {
    parts.push(`Transmission: ${data.transmission}`);
  }
  if (data.fuelType) {
    parts.push(`Fuel Type: ${data.fuelType}`);
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
 * Initializes OpenAI client for embeddings
 */
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured. OpenAI embeddings are always used regardless of LLM_PROVIDER.");
  }
  return new OpenAI({ apiKey });
}

/**
 * Generates a vector embedding for a vehicle using OpenAI's embedding model.
 * 
 * IMPORTANT: This function always uses OpenAI for embeddings, regardless of the
 * LLM_PROVIDER setting. This ensures consistent 1536-dimensional embeddings
 * that can be compared across all vehicles in the database.
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
    
    // Get embedding model from environment or use default
    const embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";

    // Request 1536 dimensions to match pgvector column. Only 3.x models support this param.
    const supportsDimensions =
      embeddingModel === "text-embedding-3-small" ||
      embeddingModel === "text-embedding-3-large";

    const response = await openai.embeddings.create({
      model: embeddingModel,
      input: text,
      ...(supportsDimensions && { dimensions: 1536 }),
    });

    const embedding = response.data[0]?.embedding;

    if (!embedding) {
      throw new Error("Failed to generate embedding from OpenAI");
    }

    // Verify dimensions match DB expectation (pgvector column is 1536)
    if (embedding.length !== 1536) {
      throw new Error(
        `Embedding dimensions mismatch: got ${embedding.length}, expected 1536. ` +
          `Ensure OPENAI_EMBEDDING_MODEL is compatible (e.g. text-embedding-3-small or text-embedding-ada-002) and no dimensions override is set.`
      );
    }

    return embedding;
  } catch (error) {
    console.error("Embedding generation error:", error);
    throw error;
  }
}
