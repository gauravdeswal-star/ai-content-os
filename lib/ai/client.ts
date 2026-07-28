/**
 * Reusable AI client that supports OpenRouter (multi-model) and Google Gemini.
 * All AI interactions go through this client.
 */

import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getModel } from "@/config/models";
import type { AIRequestOptions, AIResponse, AIProvider } from "@/types";

// ============================================================================
// Client Initialization
// ============================================================================

let openaiClient: OpenAI | null = null;
let geminiClient: GoogleGenerativeAI | null = null;

/**
 * Get or initialize the OpenRouter client.
 * OpenRouter provides access to Claude, GPT, Gemini, DeepSeek, Qwen, and more.
 */
function getOpenRouterClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENROUTER_API_KEY is not configured. Set it in your environment variables.",
      );
    }
    openaiClient = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
      defaultHeaders: {
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "AI Content OS",
      },
    });
  }
  return openaiClient;
}

/**
 * Get or initialize the Google Gemini client.
 */
function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GOOGLE_API_KEY is not configured. Set it in your environment variables.",
      );
    }
    geminiClient = new GoogleGenerativeAI(apiKey);
  }
  return geminiClient;
}

/**
 * Detect which provider to use for a given model string.
 */
function detectProvider(model: string): AIProvider {
  if (model.startsWith("google/")) {
    return "gemini";
  }
  return "openrouter";
}

// ============================================================================
// Cost Estimation
// ============================================================================

/**
 * Estimate cost for a given model and token usage.
 * Prices are in USD per 1K tokens (approximate).
 */
function estimateCost(
  model: string,
  promptTokens: number,
  completionTokens: number,
): number {
  // Approximate pricing per 1K tokens (input/output)
  const pricing: Record<string, [number, number]> = {
    "inclusionai/ling-3.0-flash:free": [0, 0], // Free!
    "anthropic/claude-sonnet-5": [0.003, 0.015],
    "anthropic/claude-haiku-latest": [0.0008, 0.004],
    "google/gemini-3.5-flash": [0.00015, 0.0006],
    "google/gemini-3.6-flash": [0.00015, 0.0006],
    "deepseek/deepseek-chat": [0.00027, 0.0011],
    "qwen/qwen-2.5-72b": [0.0009, 0.0009],
    "openai/gpt-4o": [0.0025, 0.01],
    "openai/gpt-4o-mini": [0.00015, 0.0006],
  };

  const key = Object.keys(pricing).find((k) => model.includes(k));
  const [inputPrice, outputPrice] = key ? pricing[key]! : [0.001, 0.003];

  return (
    (promptTokens / 1000) * inputPrice + (completionTokens / 1000) * outputPrice
  );
}

// ============================================================================
// Core AI Functions
// ============================================================================

/**
 * Generate text using the specified AI model.
 * Supports all models available through OpenRouter and Google Gemini.
 *
 * @param prompt - The user prompt to send
 * @param options - Configuration options (model, temperature, maxTokens, systemPrompt)
 * @returns The generated text with usage metadata
 *
 * @example
 * ```ts
 * const response = await generateText("Write a script about AI", {
 *   model: "anthropic/claude-sonnet-5",
 *   temperature: 0.8,
 * });
 * console.log(response.content);
 * ```
 */
export async function generateText(
  prompt: string,
  options: Partial<AIRequestOptions> = {},
): Promise<AIResponse> {
  const model = options.model || getModel("script");
  const provider = detectProvider(model);

  // Strip google/ prefix for Gemini API
  const geminiModelName = model.replace("google/", "");

  if (provider === "gemini") {
    const client = getGeminiClient();
    const geminiModel = client.getGenerativeModel({
      model: geminiModelName,
      systemInstruction: options.systemPrompt,
    });

    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens ?? 4096,
      },
    });

    const response = result.response;
    const text = response.text();
    const usage = response.usageMetadata;

    const promptTokens = usage?.promptTokenCount ?? 0;
    const completionTokens = usage?.candidatesTokenCount ?? 0;

    return {
      content: text,
      model,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
      costEstimate: estimateCost(model, promptTokens, completionTokens),
    };
  }

  // OpenRouter (OpenAI-compatible)
  const client = getOpenRouterClient();

  const completion = await client.chat.completions.create({
    model,
    messages: [
      ...(options.systemPrompt
        ? [{ role: "system" as const, content: options.systemPrompt }]
        : []),
      { role: "user", content: prompt },
    ],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
  });

  const content = completion.choices[0]?.message?.content ?? "";
  const usage = completion.usage;

  const promptTokens = usage?.prompt_tokens ?? 0;
  const completionTokens = usage?.completion_tokens ?? 0;

  return {
    content,
    model: completion.model,
    usage: {
      promptTokens,
      completionTokens,
      totalTokens: promptTokens + completionTokens,
    },
    costEstimate: estimateCost(model, promptTokens, completionTokens),
  };
}

/**
 * Generate structured JSON output from the AI.
 * Uses the configured JSON model (typically Gemini Flash for cost efficiency).
 *
 * @param prompt - Instructions for what JSON to generate
 * @param options - Optional AI configuration overrides
 * @returns Parsed JSON object
 */
export async function generateJSON<T = Record<string, unknown>>(
  prompt: string,
  options: Partial<AIRequestOptions> = {},
): Promise<T> {
  const model = options.model || getModel("json");
  const systemPrompt =
    options.systemPrompt ||
    "You are a JSON generator. Always respond with valid JSON only, no markdown formatting.";

  const response = await generateText(prompt, {
    ...options,
    model,
    systemPrompt,
    temperature: options.temperature ?? 0.1,
  });

  // Extract JSON from response (handle markdown code blocks)
  const jsonStr = response.content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    throw new Error(
      `Failed to parse JSON response from AI. Response: ${jsonStr.substring(0, 200)}...`,
    );
  }
}

/**
 * Generate an optimized image prompt.
 */
export async function generateImagePrompt(
  topic: string,
  style?: string,
): Promise<string> {
  const response = await generateText(
    `Create a detailed image generation prompt for: "${topic}"${style ? ` in ${style} style` : ""}`,
    { model: getModel("imagePrompt") },
  );
  return response.content;
}

/**
 * Generate a video prompt with scene descriptions.
 */
export async function generateVideoPrompt(
  topic: string,
  duration?: number,
): Promise<string> {
  const response = await generateText(
    `Create a detailed video generation prompt for: "${topic}"${duration ? ` (${duration} seconds)` : ""}`,
    { model: getModel("video") },
  );
  return response.content;
}

/**
 * Rewrite existing content with a different tone or style.
 */
export async function rewrite(
  content: string,
  instructions: string,
): Promise<string> {
  const response = await generateText(
    `Rewrite the following content:\n\n${content}\n\nInstructions: ${instructions}`,
    { model: getModel("rewrite") },
  );
  return response.content;
}

/**
 * Summarize content to a shorter version.
 */
export async function summarize(
  content: string,
  maxLength?: number,
): Promise<string> {
  const response = await generateText(
    `Summarize the following content${maxLength ? ` in ${maxLength} words or less` : ""}:\n\n${content}`,
    { model: getModel("summarize") },
  );
  return response.content;
}
