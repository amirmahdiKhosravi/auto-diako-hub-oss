/**
 * Supported LLM providers
 */
export type LLMProvider = "openai" | "gemini";

/**
 * Configuration for chat completion
 */
export interface ChatCompletionConfig {
  systemMessage?: string;
  userMessage: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Response from chat completion
 */
export interface ChatCompletionResponse {
  content: string;
}

/**
 * Configuration for embedding generation
 */
export interface EmbeddingConfig {
  text: string;
}

/**
 * Response from embedding generation
 */
export interface EmbeddingResponse {
  embedding: number[];
  dimensions: number;
}

/**
 * Base interface that all LLM providers must implement
 */
export interface LLMProviderInterface {
  /**
   * Generate a chat completion
   */
  generateChatCompletion(config: ChatCompletionConfig): Promise<ChatCompletionResponse>;

  /**
   * Generate an embedding vector
   */
  generateEmbedding(config: EmbeddingConfig): Promise<EmbeddingResponse>;
}

