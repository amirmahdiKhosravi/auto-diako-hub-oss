import { OpenAI } from "openai";
import type {
  LLMProviderInterface,
  ChatCompletionConfig,
  ChatCompletionResponse,
  EmbeddingConfig,
  EmbeddingResponse,
} from "../types";

/**
 * OpenAI LLM Provider Implementation
 */
export class OpenAIProvider implements LLMProviderInterface {
  private client: OpenAI;
  private chatModel: string;
  private embeddingModel: string;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    this.client = new OpenAI({ apiKey });
    
    // Get model from environment variable or use defaults
    this.chatModel = process.env.OPENAI_MODEL || "gpt-4o";
    this.embeddingModel = process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
  }

  async generateChatCompletion(
    config: ChatCompletionConfig
  ): Promise<ChatCompletionResponse> {
    try {
      const messages: Array<{ role: "system" | "user"; content: string }> = [];

      if (config.systemMessage) {
        messages.push({ role: "system", content: config.systemMessage });
      }

      messages.push({ role: "user", content: config.userMessage });

      const completion = await this.client.chat.completions.create({
        model: this.chatModel,
        messages,
        temperature: config.temperature ?? 0.7,
        max_tokens: config.maxTokens ?? 300,
      });

      const content = completion.choices[0]?.message?.content;

      if (!content) {
        throw new Error("Failed to generate completion from OpenAI: Empty response");
      }

      return { content };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[OpenAI Provider] Error generating completion:", errorMessage);
      if (error instanceof Error && error.stack) {
        console.error("[OpenAI Provider] Error stack:", error.stack);
      }
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }
  }

  async generateEmbedding(config: EmbeddingConfig): Promise<EmbeddingResponse> {
    const response = await this.client.embeddings.create({
      model: this.embeddingModel,
      input: config.text,
    });

    const embedding = response.data[0]?.embedding;

    if (!embedding) {
      throw new Error("Failed to generate embedding from OpenAI");
    }

    return {
      embedding,
      dimensions: embedding.length,
    };
  }
}

