import type { LLMProvider, LLMProviderInterface } from "./types";
import { OpenAIProvider } from "./providers/openai";
import { GeminiProvider } from "./providers/gemini";

/**
 * Creates and returns the appropriate LLM provider based on environment configuration
 * 
 * @returns An instance of the configured LLM provider
 * @throws Error if the provider is not configured or not supported
 */
export function createLLMProvider(): LLMProviderInterface {
  const provider = (process.env.LLM_PROVIDER || "openai").toLowerCase() as LLMProvider;

  // Debug logging (without exposing sensitive data)
  console.log(`[LLM Factory] Creating provider: ${provider}`);
  console.log(`[LLM Factory] OPENAI_API_KEY present: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`[LLM Factory] GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);

  switch (provider) {
    case "openai":
      return new OpenAIProvider();
    
    case "gemini":
      return new GeminiProvider();
    
    default:
      throw new Error(
        `Unsupported LLM provider: ${provider}. Supported providers: openai, gemini`
      );
  }
}

/**
 * Gets the current LLM provider name from environment
 */
export function getCurrentProvider(): LLMProvider {
  return (process.env.LLM_PROVIDER || "openai").toLowerCase() as LLMProvider;
}

