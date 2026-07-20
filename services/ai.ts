import OpenAI from "openai";
import {
  AIProvider,
  AIRequest,
  AIResponse,
  StreamingChunk,
} from "@/types/ai";

/**
 * AI Service Layer - Abstraction for multi-provider LLM integrations.
 */

const DEFAULT_PROVIDER: AIProvider = "openai";
const DEFAULT_OPENAI_MODEL = "gpt-5";

export async function generateContent(request: AIRequest): Promise<AIResponse> {
  const provider = request.provider || DEFAULT_PROVIDER;

  if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in the environment.");
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const model = request.model || DEFAULT_OPENAI_MODEL;
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (request.systemPrompt) {
      messages.push({ role: "system", content: request.systemPrompt });
    }

    messages.push({ role: "user", content: request.prompt });

    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens,
    });

    const content = response.choices[0]?.message?.content || "";

    return {
      id: response.id,
      text: content,
      provider,
      model: response.model,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    };
  }

  throw new Error(`Provider not implemented: ${provider}`);
}

export async function* streamContent(
  request: AIRequest
): AsyncGenerator<StreamingChunk, void, unknown> {
  const provider = request.provider || DEFAULT_PROVIDER;

  if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in the environment.");
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const model = request.model || DEFAULT_OPENAI_MODEL;
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (request.systemPrompt) {
      messages.push({ role: "system", content: request.systemPrompt });
    }

    messages.push({ role: "user", content: request.prompt });

    const stream = await openai.chat.completions.create({
      model,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens,
      stream: true,
    }, {
      signal: request.signal
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        yield { text, done: false };
      }
    }
    
    yield { text: "", done: true };
    return;
  }

  throw new Error(`Provider not implemented for streaming: ${provider}`);
}
