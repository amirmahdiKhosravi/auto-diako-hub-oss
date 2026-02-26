import { GoogleGenerativeAI } from "@google/generative-ai";
import type {
  LLMProviderInterface,
  ChatCompletionConfig,
  ChatCompletionResponse,
  EmbeddingConfig,
  EmbeddingResponse,
} from "../types";

/**
 * Google Gemini LLM Provider Implementation
 */
export class GeminiProvider implements LLMProviderInterface {
  private client: GoogleGenerativeAI;
  private chatModel: string;
  private embeddingModel: string;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    this.client = new GoogleGenerativeAI(apiKey);
    
    // Get model from environment variable or use defaults
    // Valid model names: gemini-pro, gemini-1.5-pro, gemini-2.5-flash, gemini-2.0-flash-exp
    this.chatModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    // Note: For embeddings, use "gemini-embedding-001" (without "models/" prefix when using getGenerativeModel)
    this.embeddingModel = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
  }

  async generateChatCompletion(
    config: ChatCompletionConfig
  ): Promise<ChatCompletionResponse> {
    try {
      const model = this.client.getGenerativeModel({ 
        model: this.chatModel,
        generationConfig: {
          temperature: config.temperature ?? 0.7,
          maxOutputTokens: config.maxTokens ?? 8192,
        },
      });

      // Combine system and user messages for Gemini
      // Gemini doesn't have a separate system message role, so we prepend it
      let prompt = config.userMessage;
      if (config.systemMessage) {
        prompt = `${config.systemMessage}\n\n${config.userMessage}`;
      }

      const result = await model.generateContent(prompt);
      const response = result.response;
      const content = response.text();

      if (!content) {
        throw new Error("Failed to generate completion from Gemini: Empty response");
      }

      return { content };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[Gemini Provider] Error generating completion:", errorMessage);
      if (error instanceof Error && error.stack) {
        console.error("[Gemini Provider] Error stack:", error.stack);
      }
      throw new Error(`Gemini API error: ${errorMessage}`);
    }
  }

  async generateEmbedding(config: EmbeddingConfig): Promise<EmbeddingResponse> {
    const model = this.client.getGenerativeModel({ model: this.embeddingModel });
    
    const result = await model.embedContent(config.text);
    const embedding = result.embedding.values;

    if (!embedding || embedding.length === 0) {
      throw new Error("Failed to generate embedding from Gemini");
    }

    return {
      embedding: Array.from(embedding),
      dimensions: embedding.length,
    };
  }
}

