# LLM Provider Abstraction Layer

This directory contains a provider-agnostic abstraction layer for LLM operations, allowing you to easily switch between different LLM providers (OpenAI, Gemini, etc.) without changing your application code.

## Architecture

The abstraction follows a strategy pattern with the following structure:

- **`types.ts`**: Defines the `LLMProviderInterface` that all providers must implement
- **`factory.ts`**: Creates the appropriate provider instance based on environment configuration
- **`providers/`**: Contains provider-specific implementations
  - `openai.ts`: OpenAI provider implementation
  - `gemini.ts`: Google Gemini provider implementation

## Environment Variables

### Provider Selection
- `LLM_PROVIDER`: The LLM provider to use (`openai` or `gemini`). Defaults to `openai` if not set.

### OpenAI Configuration
- `OPENAI_API_KEY`: Your OpenAI API key (required when using OpenAI)
- `OPENAI_MODEL`: Model for chat completions (default: `gpt-4o`)
- `OPENAI_EMBEDDING_MODEL`: Model for embeddings (default: `text-embedding-3-small`)

### Gemini Configuration
- `GEMINI_API_KEY`: Your Google Gemini API key (required when using Gemini)
- `GEMINI_MODEL`: Model for chat completions (default: `gemini-pro`)
- `GEMINI_EMBEDDING_MODEL`: Model for embeddings (default: `gemini-embedding-001`)

## Usage

```typescript
import { createLLMProvider } from "@/lib/llm/factory";

// Create provider instance (automatically selects based on LLM_PROVIDER env var)
const provider = createLLMProvider();

// Generate chat completion
const result = await provider.generateChatCompletion({
  systemMessage: "You are a helpful assistant.",
  userMessage: "Hello!",
  temperature: 0.7,
  maxTokens: 300,
});

// Generate embedding
const embedding = await provider.generateEmbedding({
  text: "Your text here",
});
```

## Adding a New Provider

To add a new LLM provider:

1. Create a new file in `providers/` (e.g., `providers/anthropic.ts`)
2. Implement the `LLMProviderInterface` from `types.ts`
3. Add the provider type to the `LLMProvider` union type in `types.ts`
4. Add a case in the `createLLMProvider()` function in `factory.ts`
5. Add the necessary environment variables for configuration

Example:

```typescript
// providers/anthropic.ts
export class AnthropicProvider implements LLMProviderInterface {
  // Implement generateChatCompletion and generateEmbedding
}

// factory.ts
case "anthropic":
  return new AnthropicProvider();
```

## Embedding Strategy

**IMPORTANT**: Embeddings always use OpenAI, regardless of the `LLM_PROVIDER` setting. This ensures:
- **Consistent dimensions**: All embeddings are 1536-dimensional (OpenAI `text-embedding-3-small`)
- **Comparability**: All vehicle embeddings can be compared for similarity search
- **No dimension mismatch**: Avoids issues with mixing different embedding dimensions in the same database

The `LLM_PROVIDER` environment variable only affects chat completions (description generation), not embeddings.

**Why always use OpenAI for embeddings?**
- Embeddings from different providers have different dimensions and semantic spaces
- Mixing embeddings would break vector similarity search
- Standardizing on one provider ensures all embeddings are comparable

**Configuration**: 
- `OPENAI_API_KEY` is required even when using Gemini for chat completions
- `OPENAI_EMBEDDING_MODEL` (optional, defaults to `text-embedding-3-small`)

