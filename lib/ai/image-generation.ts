/**
 * Image generation service.
 * Supports Hugging Face Inference Providers (free, default) and OpenRouter Image API.
 *
 * Hugging Face: Uses HUGGINGFACE_API_KEY with the official @huggingface/inference SDK.
 *   The SDK routes through router.huggingface.co and automatically selects the best
 *   provider serving the requested model. Free tier with $0.10 monthly credits.
 * OpenRouter: Uses OPENROUTER_API_KEY. Supports FLUX, DALL-E, Seedream.
 */

import axios from "axios";
import { InferenceClient } from "@huggingface/inference";

// ============================================================================
// Types
// ============================================================================

export interface ImageGenerationOptions {
  /** Model slug */
  model?: string;
  /** Number of images to generate (1-4) */
  n?: number;
  /** Aspect ratio: "1:1", "16:9", "9:16", "4:3", "3:2", "4:5" */
  aspectRatio?: string;
  /** Output format */
  outputFormat?: "png" | "jpeg" | "webp";
  /** Resolution tier */
  resolution?: string;
  /** Provider: "huggingface" (default, free) or "openrouter" */
  provider?: "huggingface" | "openrouter";
}

export interface ImageGenerationResult {
  /** Base64-encoded image data */
  b64Json: string;
  /** Media type */
  mediaType: string;
  /** All generated images when n > 1 (parallel generation) */
  images?: { b64Json: string; mediaType: string }[];
  /** Model used */
  model: string;
  /** Provider used */
  provider: string;
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
  /** OpenRouter models (via /api/v1/images) */
  flux2Pro: "black-forest-labs/flux.2-pro",
  flux2Flex: "black-forest-labs/flux.2-flex",
  flux2Klein: "black-forest-labs/flux.2-klein-4b",
  seedream: "bytedance-seed/seedream-4.5",
  gptImage: "openai/gpt-5-image",
  geminiFlash: "google/gemini-2.5-flash-image",
  recraft: "recraft/recraft-v3",
  /** Hugging Face models */
  hfFluxSchnell: "black-forest-labs/FLUX.1-schnell",
  hfSd35Large: "stabilityai/stable-diffusion-3.5-large",
  hfSdxl: "stabilityai/stable-diffusion-xl-base-1.0",
} as const;

// ============================================================================
// Hugging Face Inference Providers (Free Tier)
// ============================================================================

/**
 * Generate an image using Hugging Face Inference Providers via the official SDK.
 * Requires HUGGINGFACE_API_KEY env var.
 *
 * The SDK routes through router.huggingface.co and automatically picks the fastest
 * available provider for the requested model (provider="auto").
 *
 * Free tier: $0.10/month credits (no credit card needed).
 * Sign up: https://huggingface.co/join
 * Get token: https://huggingface.co/settings/tokens
 */
async function generateWithHuggingFace(
  prompt: string,
  options: ImageGenerationOptions = {},
): Promise<ImageGenerationResult> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "HUGGINGFACE_API_KEY is not configured.\n\n" +
      "Sign up free at https://huggingface.co/join\n" +
      "Get your API token at: https://huggingface.co/settings/tokens\n\n" +
      "Free tier includes $0.10 monthly credits — no credit card required!",
    );
  }

  const model = options.model || IMAGE_MODELS.hfFluxSchnell;
  const n = Math.min(Math.max(options.n || 1, 1), 2);

  try {
    const client = new InferenceClient(apiKey);

    // Generate all images in parallel so N images take ~the same time as 1
    const settled = await Promise.allSettled(
      Array.from({ length: n }, () =>
        client.textToImage(
          {
            model,
            inputs: prompt,
          },
          { outputType: "blob" },
        ),
      ),
    );

    const images: { b64Json: string; mediaType: string }[] = [];
    for (const result of settled) {
      if (result.status !== "fulfilled") continue;
      const blob = result.value;
      if (!blob || blob.size < 100) continue;
      const arrayBuffer = await blob.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuffer);
      images.push({
        b64Json: imageBuffer.toString("base64"),
        mediaType: blob.type || "image/png",
      });
    }

    if (images.length === 0) {
      const rejected = settled.find(
        (r) => r.status === "rejected",
      ) as PromiseRejectedResult | undefined;
      const reason = rejected?.reason;
      throw new Error(
        reason instanceof Error
          ? reason.message
          : "Hugging Face returned no valid images",
      );
    }

    return {
      b64Json: images[0]!.b64Json,
      mediaType: images[0]!.mediaType,
      images,
      model,
      provider: "huggingface",
      usage: { totalTokens: 0, cost: 0 },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const lower = message.toLowerCase();

    if (
      lower.includes("401") ||
      lower.includes("unauthorized") ||
      lower.includes("403") ||
      lower.includes("forbidden") ||
      lower.includes("invalid token")
    ) {
      throw new Error(
        "Invalid Hugging Face API token. Check your HUGGINGFACE_API_KEY.",
      );
    }
    if (
      lower.includes("429") ||
      lower.includes("rate limit") ||
      lower.includes("credit") ||
      lower.includes("billing")
    ) {
      throw new Error(
        "Hugging Face rate limit or insufficient credits. Free tier: $0.10/month credits.",
      );
    }

    throw new Error(`Hugging Face error: ${message}`);
  }
}

// ============================================================================
// OpenRouter Image API
// ============================================================================

const MODEL_PRICING: Record<string, number> = {
  "black-forest-labs/flux.2-pro": 0.05,
  "black-forest-labs/flux.2-flex": 0.06,
  "black-forest-labs/flux.2-klein-4b": 0.002,
  "bytedance-seed/seedream-4.5": 0.038,
  "openai/gpt-5-image": 0.04,
  "google/gemini-2.5-flash-image": 0.002,
  "recraft/recraft-v3": 0.04,
};

/**
 * Generate an image using OpenRouter's Image API (uses OPENROUTER_API_KEY).
 */
async function generateWithOpenRouter(
  prompt: string,
  options: ImageGenerationOptions = {},
): Promise<ImageGenerationResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const model = options.model || IMAGE_MODELS.flux2Klein;
  const aspectRatio = options.aspectRatio || "1:1";
  const outputFormat = options.outputFormat || "png";
  const n = Math.min(options.n || 1, 4);

  const response = await axios.post(
    "https://openrouter.ai/api/v1/images",
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

  const images: { b64Json: string; mediaType: string }[] = data.data.map(
    (img: { b64_json: string; media_type?: string }) => ({
      b64Json: img.b64_json,
      mediaType: img.media_type || `image/${outputFormat}`,
    }),
  );
  const imageData = data.data[0];
  const cost = MODEL_PRICING[model] || 0.03;

  return {
    b64Json: imageData.b64_json,
    mediaType: imageData.media_type || `image/${outputFormat}`,
    images,
    model: data.model || model,
    provider: "openrouter",
    usage: {
      totalTokens: data.usage?.total_tokens || 0,
      cost: data.usage?.cost || cost,
    },
  };
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Generate an image from a text prompt.
 *
 * @param prompt - Text description of the image to generate
 * @param options - Generation options
 * @returns The generated image data (base64) with metadata
 *
 * By default, uses Hugging Face (free, requires HUGGINGFACE_API_KEY).
 * Set `provider: "openrouter"` to use OpenRouter instead.
 *
 * @example
 * ```ts
 * // Using Hugging Face (free, requires HUGGINGFACE_API_KEY)
 * const result = await generateImage("A futuristic cityscape");
 *
 * // Using OpenRouter (requires OPENROUTER_API_KEY)
 * const result = await generateImage("A futuristic cityscape", {
 *   provider: "openrouter"
 * });
 * ```
 */
export async function generateImage(
  prompt: string,
  options: ImageGenerationOptions = {},
): Promise<ImageGenerationResult> {
  const provider = options.provider || "huggingface";

  if (provider === "openrouter") {
    return generateWithOpenRouter(prompt, options);
  }

  // Use Hugging Face only (no OpenRouter fallback)
  return generateWithHuggingFace(prompt, options);
}

/**
 * Get info about available image generation providers.
 */
export function getImageProviders(): { id: string; name: string; free: boolean; setup: string }[] {
  return [
    {
      id: "huggingface",
      name: "Hugging Face (FLUX.1-schnell, SD 3.5)",
      free: true,
      setup: "Set HUGGINGFACE_API_KEY. Free tier: $0.10/month credits.",
    },
    {
      id: "openrouter",
      name: "OpenRouter (FLUX, DALL-E, Seedream)",
      free: false,
      setup: "Already configured with OPENROUTER_API_KEY",
    },
  ];
}
