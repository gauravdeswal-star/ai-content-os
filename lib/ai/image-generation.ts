/**
 * Image generation service.
 * Supports Hugging Face Inference API (free, default) and OpenRouter Image API.
 *
 * Hugging Face: Uses HUGGINGFACE_API_KEY. Free tier with $0.10 monthly credits.
 *   Supports FLUX.1-schnell, Stable Diffusion 3.5, and many open-source models.
 * OpenRouter: Uses OPENROUTER_API_KEY. Supports FLUX, DALL-E, Seedream.
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
  /** Provider: "huggingface" (default, free) or "openrouter" */
  provider?: "huggingface" | "openrouter";
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
  /** Hugging Face models */
  hfFluxSchnell: "black-forest-labs/FLUX.1-schnell",
  hfSd35Large: "stabilityai/stable-diffusion-3.5-large",
  hfSdxl: "stabilityai/stable-diffusion-xl-base-1.0",
} as const;

// ============================================================================
// Hugging Face Inference API (Free Tier)
// ============================================================================

const HF_API_BASE = "https://api-inference.huggingface.co";

/**
 * Generate an image using Hugging Face Inference API free tier.
 * Requires HUGGINGFACE_API_KEY env var.
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
  const hfModel = model.startsWith("black-forest-labs/") || model.startsWith("stabilityai/")
    ? model
    : IMAGE_MODELS.hfFluxSchnell;

  try {
    const response = await axios.post(
      `${HF_API_BASE}/models/${hfModel}`,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Wait-For-Model": "true",
          "X-Use-Cache": "false",
        },
        responseType: "arraybuffer",
        timeout: 60000,
        validateStatus: (status) => status < 500,
      },
    );

    const contentType = String(response.headers["content-type"] || "");

    // JSON response = error
    if (contentType.includes("application/json") || contentType.includes("text/")) {
      const bodyText = Buffer.from(response.data).toString("utf-8");
      let errorMsg = "Hugging Face image generation failed";

      try {
        const body = JSON.parse(bodyText);
        errorMsg = body.error || body.errors?.[0]?.message || JSON.stringify(body).substring(0, 300);
      } catch {
        errorMsg = bodyText.substring(0, 300);
      }

      throw new Error(`Hugging Face error: ${errorMsg}`);
    }

    // 503 = model is loading
    if (response.status === 503) {
      throw new Error(
        "Hugging Face model is loading. Please try again in 30 seconds.",
      );
    }

    // Must be an image now
    const imageBuffer = Buffer.from(response.data);

    if (imageBuffer.length < 100) {
      throw new Error("Hugging Face returned an image that appears too small to be valid");
    }

    const b64Json = imageBuffer.toString("base64");
    const mediaType = contentType.includes("jpeg") || contentType.includes("jpg")
      ? "image/jpeg"
      : contentType.includes("webp")
        ? "image/webp"
        : "image/png";

    return {
      b64Json,
      mediaType,
      model: hfModel,
      provider: "huggingface",
      usage: { totalTokens: 0, cost: 0 },
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const bodyText = error.response?.data
        ? Buffer.from(error.response.data).toString("utf-8")
        : "";

      let errorMsg = "Hugging Face image generation failed";
      try {
        const body = JSON.parse(bodyText);
        errorMsg = body.error || body.errors?.[0]?.message || errorMsg;
      } catch {
        errorMsg = bodyText.substring(0, 200) || errorMsg;
      }

      if (status === 401 || status === 403) {
        throw new Error("Invalid Hugging Face API token. Check your HUGGINGFACE_API_KEY.");
      }
      if (status === 429) {
        throw new Error("Hugging Face rate limit reached. Free tier: $0.10/month credits.");
      }

      throw new Error(`Hugging Face error (${status}): ${errorMsg}`);
    }

    throw new Error(
      error instanceof Error ? error.message : "Hugging Face image generation failed",
    );
  }
}

// ============================================================================
// OpenRouter Image API
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

  // Default: try Hugging Face first, fall back to OpenRouter if it fails
  try {
    return await generateWithHuggingFace(prompt, options);
  } catch (hfError) {
    console.warn("[Image] Hugging Face failed, falling back to OpenRouter:", hfError);

    // Only fallback if OpenRouter is configured
    if (process.env.OPENROUTER_API_KEY) {
      try {
        return await generateWithOpenRouter(prompt, { ...options, model: options.model || IMAGE_MODELS.fluxSchnell });
      } catch (orError) {
        // Both failed — throw the original HF error for clarity
        throw hfError;
      }
    }

    throw hfError;
  }
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
