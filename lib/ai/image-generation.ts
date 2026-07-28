/**
 * Image generation service.
 * Supports OpenRouter Image API and Cloudflare Workers AI (free tier).
 *
 * OpenRouter: Uses existing OPENROUTER_API_KEY. Supports FLUX, DALL-E, Seedream.
 * Cloudflare: Free tier (10,000 neurons/day, no credit card needed). Supports FLUX.1 Schnell.
 */

import axios from "axios";

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
  /** Provider: "openrouter" or "cloudflare" */
  provider?: "openrouter" | "cloudflare";
}

export interface ImageGenerationResult {
  /** Base64-encoded image data */
  b64Json: string;
  /** Media type */
  mediaType: string;
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
  fluxPro: "black-forest-labs/flux.2-pro",
  fluxDev: "black-forest-labs/flux-dev",
  fluxSchnell: "black-forest-labs/flux-schnell",
  seedream: "bytedance-seed/seedream-4.5",
  gptImage: "openai/gpt-5-image",
  geminiFlash: "google/gemini-2.5-flash-image",
  recraft: "recraft/recraft-v3",
  /** Cloudflare FLUX model (free tier) */
  cloudflareFlux: "@cf/black-forest-labs/flux-1-schnell",
} as const;

// ============================================================================
// Cloudflare Workers AI (Free Tier)
// ============================================================================

/**
 * Generate an image using Cloudflare Workers AI free tier.
 * Requires CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN env vars.
 *
 * Free tier: 10,000 neurons per day (resets daily, no credit card needed).
 * Sign up: https://dash.cloudflare.com/sign-up/workers
 */
async function generateWithCloudflare(
  prompt: string,
  options: ImageGenerationOptions = {},
): Promise<ImageGenerationResult> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error(
      "Cloudflare Workers AI requires CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN. " +
      "Sign up free at https://dash.cloudflare.com and get your credentials."
    );
  }

  const model = "@cf/black-forest-labs/flux-1-schnell";
  const steps = options.aspectRatio === "1:1" ? 4 : 8;

  try {
    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
      {
        prompt,
        num_steps: steps,
      },
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      },
    );

    // Cloudflare returns the image as raw binary
    const imageBuffer = Buffer.from(response.data);
    const b64Json = imageBuffer.toString("base64");

    return {
      b64Json,
      mediaType: "image/png",
      model,
      provider: "cloudflare",
      usage: {
        totalTokens: 0,
        cost: 0, // Free tier!
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      let message = "Cloudflare image generation failed";

      try {
        const body = JSON.parse(Buffer.from(error.response?.data || "{}").toString());
        message = body.errors?.[0]?.message || body.error || message;
      } catch {}

      if (status === 401) {
        throw new Error("Invalid Cloudflare API token. Check your CLOUDFLARE_API_TOKEN.");
      }
      if (status === 429) {
        throw new Error("Cloudflare rate limit reached (10,000 neurons/day). Try again tomorrow.");
      }

      throw new Error(`Cloudflare image error (${status}): ${message}`);
    }

    throw new Error(error instanceof Error ? error.message : "Cloudflare image generation failed");
  }
}

// ============================================================================
// OpenRouter Image API (Paid, but uses existing key)
// ============================================================================

const MODEL_PRICING: Record<string, number> = {
  "black-forest-labs/flux.2-pro": 0.05,
  "black-forest-labs/flux-dev": 0.025,
  "black-forest-labs/flux-schnell": 0.003,
  "bytedance-seed/seedream-4.5": 0.038,
  "openai/gpt-5-image": 0.04,
  "google/gemini-2.5-flash-image": 0.002,
  "recraft/recraft-v3": 0.04,
};

/**
 * Generate an image using OpenRouter's Image API (uses existing OPENROUTER_API_KEY).
 */
async function generateWithOpenRouter(
  prompt: string,
  options: ImageGenerationOptions = {},
): Promise<ImageGenerationResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const model = options.model || IMAGE_MODELS.fluxSchnell;
  const aspectRatio = options.aspectRatio || "1:1";
  const outputFormat = options.outputFormat || "png";
  const n = Math.min(options.n || 1, 4);

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
 * By default, uses OpenRouter. Set `provider: "cloudflare"` for free generation
 * (requires CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN env vars).
 *
 * @example
 * ```ts
 * // Using OpenRouter (paid, uses existing API key)
 * const result = await generateImage("A futuristic cityscape");
 *
 * // Using Cloudflare (free, needs separate signup)
 * const result = await generateImage("A futuristic cityscape", {
 *   provider: "cloudflare"
 * });
 * ```
 */
export async function generateImage(
  prompt: string,
  options: ImageGenerationOptions = {},
): Promise<ImageGenerationResult> {
  const provider = options.provider || "openrouter";

  if (provider === "cloudflare") {
    return generateWithCloudflare(prompt, options);
  }

  return generateWithOpenRouter(prompt, options);
}

/**
 * Get info about available image generation options.
 */
export function getImageProviders(): { id: string; name: string; free: boolean; setup: string }[] {
  return [
    {
      id: "openrouter",
      name: "OpenRouter (FLUX, DALL-E, etc.)",
      free: false,
      setup: "Already configured with OPENROUTER_API_KEY",
    },
    {
      id: "cloudflare",
      name: "Cloudflare Workers AI (FLUX.1 Schnell)",
      free: true,
      setup: "Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN env vars",
    },
  ];
}
