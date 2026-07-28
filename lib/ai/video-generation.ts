/**
 * Video generation service.
 * Supports Runway ML API (paid) and Hugging Face Inference API (free tier).
 *
 * Runway: Requires RUNWAY_API_KEY. High quality, paid per second.
 * Hugging Face: Requires HUGGINGFACE_API_KEY. Free tier with $0.10 monthly credits.
 *   Sign up free at: https://huggingface.co/join
 *   Get API token at: https://huggingface.co/settings/tokens
 */

import axios from "axios";

// ============================================================================
// Types
// ============================================================================

export interface VideoGenerationOptions {
  /** Model to use for generation */
  model?: string;
  /** Duration of the video in seconds */
  duration?: number;
  /** Aspect ratio: "16:9", "9:16", "1:1", "4:3" */
  aspectRatio?: string;
  /** Provider: "runway" (paid) or "huggingface" (free tier) */
  provider?: "runway" | "huggingface";
}

export interface VideoGenerationResult {
  /** URL to the generated video */
  videoUrl: string;
  /** Task/Job ID for status tracking */
  taskId: string;
  /** Status of the generation */
  status: "pending" | "processing" | "completed" | "failed";
  /** Model used */
  model: string;
  /** Estimated cost in credits */
  cost: number;
}

export interface VideoGenerationStatus {
  status: "pending" | "processing" | "completed" | "failed";
  videoUrl?: string;
  error?: string;
  progress?: number;
}

// ============================================================================
// Models
// ============================================================================

export const VIDEO_MODELS = {
  runwayGen3: "gen3",
  /** Best open-source text-to-video model on Hugging Face */
  hfWanVideo: "Wan-AI/Wan2.1-T2V-14B",
  /** Alternative: Tencent Hunyuan Video */
  hfHunyuanVideo: "tencent/HunyuanVideo",
} as const;

// ============================================================================
// Hugging Face Inference API (Free Tier)
// ============================================================================

const HF_API_BASE = "https://api-inference.huggingface.co";

/**
 * Get the Hugging Face API key from environment variables.
 */
function getHfApiKey(): string {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error(
      "HUGGINGFACE_API_KEY is not configured.\n\n" +
      "Sign up free at https://huggingface.co/join\n" +
      "Get your API token at: https://huggingface.co/settings/tokens\n\n" +
      "Free tier includes $0.10 monthly credits — enough for several video generations.\n" +
      "No credit card required!",
    );
  }
  return apiKey;
}

/**
 * Generate a video using Hugging Face Inference API free tier.
 * Uses open-source models like Wan2.1 and Hunyuan Video.
 *
 * @param prompt - Text description of the video
 * @param options - Video options (model, duration, etc.)
 * @returns The generated video result
 */
async function generateWithHuggingFace(
  prompt: string,
  options: VideoGenerationOptions = {},
): Promise<VideoGenerationResult> {
  const apiKey = getHfApiKey();
  const model = options.model || VIDEO_MODELS.hfWanVideo;
  const taskId = `hf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  try {
    // Hugging Face returns the video file directly as binary when it's ready
    // For slower models, it returns a 503 with estimated time
    const response = await axios.post(
      `${HF_API_BASE}/models/${model}`,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Wait-For-Model": "true",
          "X-Use-Cache": "false",
        },
        responseType: "arraybuffer",
        timeout: 120000, // 2 minutes for video generation
        validateStatus: (status) => status < 500, // Don't throw on 503
      },
    );

    const status = response.status;

    // 503 means the model is loading — return as pending
    if (status === 503) {
      const estimatedTime = response.headers["x-estimated-time"]
        ? parseInt(response.headers["x-estimated-time"] as string, 10)
        : 60;

      return {
        videoUrl: "",
        taskId,
        status: "pending",
        model,
        cost: 0,
      };
    }

    // Successful response — video binary
    if (status === 200) {
      const videoBuffer = Buffer.from(response.data);
      const base64 = videoBuffer.toString("base64");
      const contentType =
        response.headers["content-type"]?.toString() || "video/mp4";

      // Create a data URL for the video
      // For production, you'd upload this to Cloudinary/S3
      const dataUrl = `data:${contentType};base64,${base64}`;

      return {
        videoUrl: dataUrl,
        taskId,
        status: "completed",
        model,
        cost: 0, // Free tier!
      };
    }

    throw new Error(
      `Hugging Face API returned unexpected status: ${status}`,
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      let errorMessage = "Hugging Face video generation failed";

      try {
        const errorBody = JSON.parse(
          Buffer.from(error.response?.data || "{}").toString(),
        );
        errorMessage = errorBody.error || errorMessage;
      } catch {}

      if (status === 401 || status === 403) {
        throw new Error(
          "Invalid Hugging Face API token. Check your HUGGINGFACE_API_KEY.\n" +
          "Get a valid token at: https://huggingface.co/settings/tokens",
        );
      }
      if (status === 429) {
        throw new Error(
          "Hugging Face rate limit reached. Free tier: $0.10/month credits.\n" +
          "Wait a bit or upgrade at: https://huggingface.co/pricing",
        );
      }
      if (status === 400) {
        throw new Error(
          `Hugging Face rejected the request: ${errorMessage}`,
        );
      }

      throw new Error(`Hugging Face error (${status}): ${errorMessage}`);
    }

    throw new Error(
      error instanceof Error
        ? error.message
        : "Unknown error during Hugging Face video generation",
    );
  }
}

/**
 * Check the status of a Hugging Face async video generation task.
 * Note: Hugging Face doesn't have a standard async task status endpoint,
 * so this returns the initial status for tracking purposes.
 */
export async function getHuggingFaceVideoStatus(
  taskId: string,
): Promise<VideoGenerationStatus> {
  // Hugging Face's free inference API is synchronous (returns video when ready)
  // For async/queue-based models, we'd poll a status endpoint
  // For now, return pending status — the video will be ready when generateWithHuggingFace completes
  return {
    status: "pending",
    progress: 50,
  };
}

// ============================================================================
// Runway API Client (Paid)
// ============================================================================

const RUNWAY_API_BASE = "https://api.runwayml.com/v1";

/**
 * Get the Runway API key from environment variables.
 */
function getRunwayApiKey(): string {
  const apiKey = process.env.RUNWAY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RUNWAY_API_KEY is not configured. " +
      "Set it in your environment variables to enable Runway video generation.\n" +
      "Get a key at: https://runwayml.com",
    );
  }
  return apiKey;
}

/**
 * Get the Runway API headers.
 */
function getRunwayHeaders() {
  return {
    Authorization: `Bearer ${getRunwayApiKey()}`,
    "Content-Type": "application/json",
  };
}

/**
 * Generate a video from a text prompt using Runway.
 *
 * @param prompt - Text description of the video to generate
 * @param options - Generation options (duration, aspect ratio, etc.)
 * @returns Task info with video URL (once complete)
 */
async function generateWithRunway(
  prompt: string,
  options: VideoGenerationOptions = {},
): Promise<VideoGenerationResult> {
  const model = options.model || "gen3";
  const duration = options.duration || 5;
  const aspectRatio = options.aspectRatio || "16:9";

  const response = await axios.post(
    `${RUNWAY_API_BASE}/text_to_video`,
    {
      model,
      prompt_text: prompt,
      duration,
      aspect_ratio: aspectRatio,
    },
    { headers: getRunwayHeaders() },
  );

  const data = response.data;

  return {
    videoUrl: data.output?.url || "",
    taskId: data.id || data.task_id || "",
    status: data.status || "processing",
    model,
    cost: data.credits_used || 0,
  };
}

/**
 * Check the status of a Runway video generation task.
 */
async function getRunwayVideoStatus(
  taskId: string,
): Promise<VideoGenerationStatus> {
  try {
    const response = await axios.get(
      `${RUNWAY_API_BASE}/tasks/${taskId}`,
      { headers: getRunwayHeaders() },
    );

    const data = response.data;

    return {
      status: data.status || "processing",
      videoUrl: data.output?.url || data.result?.url,
      error: data.error,
      progress: data.progress,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Failed to check video status: ${error.response?.data?.error?.message || error.message}`,
      );
    }
    throw new Error(
      error instanceof Error
        ? error.message
        : "Unknown error checking video status",
    );
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Generate a video from a text prompt.
 *
 * Supports two providers:
 * - "runway" (default, paid) — Uses Runway ML API. Requires RUNWAY_API_KEY.
 * - "huggingface" (free tier) — Uses Hugging Face Inference API. Requires HUGGINGFACE_API_KEY.
 *   Free tier: $0.10/month credits, no credit card needed.
 *
 * @param prompt - Text description of the video to generate
 * @param options - Generation options (duration, aspect ratio, provider, etc.)
 * @returns Video generation result with URL or task ID
 *
 * @example
 * ```ts
 * // Using Runway (paid)
 * const result = await generateVideo("A cinematic drone shot of mountains");
 *
 * // Using Hugging Face (free)
 * const result = await generateVideo("A cat walking on a beach", {
 *   provider: "huggingface",
 *   model: "Wan-AI/Wan2.1-T2V-14B",
 * });
 * ```
 */
export async function generateVideo(
  prompt: string,
  options: VideoGenerationOptions = {},
): Promise<VideoGenerationResult> {
  const provider = options.provider || "runway";

  if (provider === "huggingface") {
    return generateWithHuggingFace(prompt, options);
  }

  return generateWithRunway(prompt, options);
}

/**
 * Check the status of a video generation task.
 * Works with both Runway and Hugging Face tasks.
 *
 * @param taskId - The task ID returned by generateVideo()
 * @param provider - The provider used for generation ("runway" | "huggingface")
 * @returns Current status and video URL if completed
 */
export async function getVideoStatus(
  taskId: string,
  provider?: "runway" | "huggingface",
): Promise<VideoGenerationStatus> {
  if (provider === "huggingface") {
    return getHuggingFaceVideoStatus(taskId);
  }

  return getRunwayVideoStatus(taskId);
}

/**
 * Get info about available video generation providers.
 */
export function getVideoProviders(): {
  id: string;
  name: string;
  free: boolean;
  models: string[];
  setup: string;
}[] {
  return [
    {
      id: "runway",
      name: "Runway ML",
      free: false,
      models: ["gen3"],
      setup: "Set RUNWAY_API_KEY env var. Get one at: https://runwayml.com",
    },
    {
      id: "huggingface",
      name: "Hugging Face Inference API",
      free: true,
      models: ["Wan-AI/Wan2.1-T2V-14B", "tencent/HunyuanVideo"],
      setup:
        "Set HUGGINGFACE_API_KEY env var. Sign up free at: https://huggingface.co/join\n" +
        "Free tier: $0.10/month credits, no credit card needed!",
    },
  ];
}

/**
 * List available video generation models for the specified provider.
 */
export async function getAvailableVideoModels(
  provider?: "runway" | "huggingface",
): Promise<{ id: string; name: string; description: string }[]> {
  if (provider === "huggingface") {
    return [
      {
        id: VIDEO_MODELS.hfWanVideo,
        name: "Wan 2.1",
        description: "State-of-the-art open-source text-to-video model",
      },
      {
        id: VIDEO_MODELS.hfHunyuanVideo,
        name: "Hunyuan Video",
        description: "Tencent's open-source video generation model",
      },
    ];
  }

  // Runway models
  try {
    const response = await axios.get(`${RUNWAY_API_BASE}/models`, {
      headers: {
        Authorization: `Bearer ${process.env.RUNWAY_API_KEY || ""}`,
        "Content-Type": "application/json",
      },
    });
    return response.data?.models || [];
  } catch {
    return [];
  }
}
