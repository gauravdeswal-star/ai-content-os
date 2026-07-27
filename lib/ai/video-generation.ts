/**
 * Video generation service using Runway ML API.
 * Generates actual videos from text prompts.
 * Requires a RUNWAY_API_KEY environment variable.
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
// Runway API Client
// ============================================================================

const RUNWAY_API_BASE = "https://api.runwayml.com/v1";

/**
 * Get the Runway API key from environment variables.
 */
function getApiKey(): string {
  const apiKey = process.env.RUNWAY_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RUNWAY_API_KEY is not configured. " +
      "Set it in your environment variables to enable video generation.\n" +
      "Get a key at: https://runwayml.com",
    );
  }
  return apiKey;
}

/**
 * Get the Runway API headers.
 */
function getHeaders() {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    "Content-Type": "application/json",
  };
}

// ============================================================================
// Video Generation
// ============================================================================

/**
 * Generate a video from a text prompt using Runway.
 *
 * @param prompt - Text description of the video to generate
 * @param options - Generation options (duration, aspect ratio, etc.)
 * @returns Task info with video URL (once complete)
 *
 * @example
 * ```ts
 * const result = await generateVideo("A cinematic drone shot of a mountain range at sunset");
 * // result.videoUrl -> URL to the generated video
 * ```
 */
export async function generateVideo(
  prompt: string,
  options: VideoGenerationOptions = {},
): Promise<VideoGenerationResult> {
  const model = options.model || "gen3";
  const duration = options.duration || 5; // Default 5 seconds
  const aspectRatio = options.aspectRatio || "16:9";

  try {
    const response = await axios.post(
      `${RUNWAY_API_BASE}/text_to_video`,
      {
        model,
        prompt_text: prompt,
        duration,
        aspect_ratio: aspectRatio,
      },
      { headers: getHeaders() },
    );

    const data = response.data;

    return {
      videoUrl: data.output?.url || "",
      taskId: data.id || data.task_id || "",
      status: data.status || "processing",
      model,
      cost: data.credits_used || 0,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.error?.message || error.message;

      if (status === 401) {
        throw new Error(
          "Invalid Runway API key. Please check your RUNWAY_API_KEY.",
        );
      }
      if (status === 429) {
        throw new Error(
          "Rate limited by Runway. Please try again in a moment.",
        );
      }
      if (status === 402) {
        throw new Error(
          "Insufficient Runway credits. Please add funds to your account.",
        );
      }

      throw new Error(`Video generation failed (${status}): ${message}`);
    }

    throw new Error(
      error instanceof Error
        ? error.message
        : "Unknown error during video generation",
    );
  }
}

/**
 * Check the status of a video generation task.
 *
 * @param taskId - The task ID returned by generateVideo()
 * @returns Current status and video URL if completed
 */
export async function getVideoStatus(
  taskId: string,
): Promise<VideoGenerationStatus> {
  try {
    const response = await axios.get(
      `${RUNWAY_API_BASE}/tasks/${taskId}`,
      { headers: getHeaders() },
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

/**
 * List available video generation models.
 */
export async function getAvailableVideoModels(): Promise<
  { id: string; name: string; description: string }[]
> {
  try {
    const response = await axios.get(
      `${RUNWAY_API_BASE}/models`,
      { headers: getHeaders() },
    );
    return response.data?.models || [];
  } catch {
    return [];
  }
}
