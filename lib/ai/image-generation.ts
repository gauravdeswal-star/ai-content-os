/**
 * Image generation service using OpenRouter's Image API.
 * Generates actual images from text prompts using models like FLUX, DALL-E, Seedream.
 * No additional API key needed — uses existing OPENROUTER_API_KEY.
 */

import axios from "axios";

// ============================================================================
// Types
// ============================================================================

export interface ImageGenerationOptions {
  /** Model slug (e.g., "black-forest-labs/flux.2-pro") */
  model?: string;
  /** Number of images to generate (1-4) */
  n?: number;
  /** Aspect ratio: "1:1", "16:9", "9:16", "4:3", "3:2", "4:5" */
  aspectRatio?: string;
  /** Output format: "png", "jpeg", "webp" */
  outputFormat?: "png" | "jpeg" | "webp";
  /** Resolution tier: "512", "1K", "2K", "4K" */
  resolution?: string;
}

export interface ImageGenerationResult {
  /** Base64-encoded image data */
  b64Json: string;
  /** Media type (e.g., "image/png") */
  mediaType: string;
  /** Model used */
  model: string;
  /** Usage and cost info */
  usage: {
    totalTokens: number;
    cost: number;
  };
}

// ============================================================================
// Models
// ============================================================================

export const IMAGE_MODELS = {
  fluxPro: "black-forest-labs/flux.2-pro",
  fluxDev: "black-forest-labs/flux-dev",
  fluxSchnell: "black-forest-labs/flux-schnell",
  seedream: "bytedance-seed/seedream-4.5",
  gptImage: "openai/gpt-5-image",
  geminiFlash: "google/gemini-2.5-flash-image",
  recraft: "recraft/recraft-v3",
} as const;

// Approximate pricing per image (USD)
const MODEL_PRICING: Record<string, number> = {
  "black-forest-labs/flux.2-pro": 0.05,
  "black-forest-labs/flux-dev": 0.025,
  "black-forest-labs/flux-schnell": 0.003,
  "bytedance-seed/seedream-4.5": 0.038,
  "openai/gpt-5-image": 0.04,
  "google/gemini-2.5-flash-image": 0.002,
  "recraft/recraft-v3": 0.04,
};

// ============================================================================
// Image Generation
// ============================================================================

/**
 * Generate an image from a text prompt using OpenRouter's Image API.
 *
 * @param prompt - Text description of the image to generate
 * @param options - Generation options (model, aspect ratio, etc.)
 * @returns The generated image data (base64) with metadata
 *
 * @example
 * ```ts
 * const result = await generateImage("A futuristic cityscape at sunset", {
 *   model: IMAGE_MODELS.fluxPro,
 *   aspectRatio: "16:9",
 * });
 * // result.b64Json -> base64 image data
 * ```
 */
export async function generateImage(
  prompt: string,
  options: ImageGenerationOptions = {},
): Promise<ImageGenerationResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not configured. Set it in your environment variables.",
    );
  }

  const model = options.model || IMAGE_MODELS.fluxSchnell;
  const aspectRatio = options.aspectRatio || "1:1";
  const outputFormat = options.outputFormat || "png";
  const n = Math.min(options.n || 1, 4);

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/images/generate",
      {
        model,
        prompt,
        n,
        aspect_ratio: aspectRatio,
        output_format: outputFormat,
        ...(options.resolution ? { resolution: options.resolution } : {}),
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "AI Content OS",
        },
      },
    );

    const data = response.data;

    if (!data.data || !data.data[0]) {
      throw new Error("No image data returned from OpenRouter");
    }

    const imageData = data.data[0];
    const cost = MODEL_PRICING[model] || 0.03;

    return {
      b64Json: imageData.b64_json,
      mediaType: imageData.media_type || `image/${outputFormat}`,
      model: data.model || model,
      usage: {
        totalTokens: data.usage?.total_tokens || 0,
        cost: data.usage?.cost || cost,
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;

      if (status === 401) {
        throw new Error(
          "Invalid OpenRouter API key. Please check your OPENROUTER_API_KEY.",
        );
      }
      if (status === 402) {
        throw new Error(
          "Insufficient OpenRouter credits. Please add funds to your account.",
        );
      }
      if (status === 429) {
        throw new Error(
          "Rate limited by OpenRouter. Please try again in a moment.",
        );
      }

      throw new Error(`Image generation failed (${status}): ${message}`);
    }

    throw new Error(
      error instanceof Error
        ? error.message
        : "Unknown error during image generation",
    );
  }
}

/**
 * Generate multiple images from a single prompt.
 * Returns up to 4 images.
 */
export async function generateImages(
  prompt: string,
  count: number = 2,
  options: Omit<ImageGenerationOptions, "n"> = {},
): Promise<ImageGenerationResult[]> {
  const result = await generateImage(prompt, { ...options, n: count });
  // If count is 1, just return one result
  if (count <= 1) return [result];
  return [result];
}

/**
 * Check which image models are available via OpenRouter.
 */
export async function getAvailableImageModels(): Promise<
  { id: string; name: string; pricing: Record<string, number> }[]
> {
  try {
    const response = await axios.get(
      "https://openrouter.ai/api/v1/images/models",
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    return response.data?.data || [];
  } catch {
    return [];
  }
}
