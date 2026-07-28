/**
 * Centralized AI model configuration.
 * Change models here to update behavior across the entire application.
 */

import type { AIModel } from "@/types";

export interface ModelConfig {
  /** Model used for script generation (reels, YouTube, LinkedIn, etc.) */
  script: string;
  /** Model used for image prompt generation */
  imagePrompt: string;
  /** Model used for carousel content generation */
  carousel: string;
  /** Model used for caption writing */
  caption: string;
  /** Model used for hashtag generation */
  hashtags: string;
  /** Model used for video prompt generation */
  video: string;
  /** Model used for voice/SSML script generation */
  voice: string;
  /** Model used for rewriting content */
  rewrite: string;
  /** Model used for summarization tasks */
  summarize: string;
  /** Model used for JSON extraction / structured output */
  json: string;
}

/**
 * Default model configuration.
 * All models use Google Gemini 3.6 Flash — near-free and high quality.
 * Cost: ~$0.00015 per 1K input tokens, ~$0.0006 per 1K output tokens
 * A typical script generation costs ~$0.001-0.003.
 *
 * Override any model via environment variables for production.
 */
export const defaultModels: ModelConfig = {
  script: (process.env.MODEL_SCRIPT as string) || "google/gemini-3.6-flash",
  imagePrompt:
    (process.env.MODEL_IMAGE_PROMPT as string) || "google/gemini-3.6-flash",
  carousel:
    (process.env.MODEL_CAROUSEL as string) || "google/gemini-3.6-flash",
  caption: (process.env.MODEL_CAPTION as string) || "google/gemini-3.6-flash",
  hashtags:
    (process.env.MODEL_HASHTAGS as string) || "google/gemini-3.6-flash",
  video: (process.env.MODEL_VIDEO as string) || "google/gemini-3.6-flash",
  voice: (process.env.MODEL_VOICE as string) || "google/gemini-3.6-flash",
  rewrite: (process.env.MODEL_REWRITE as string) || "google/gemini-3.6-flash",
  summarize:
    (process.env.MODEL_SUMMARIZE as string) || "google/gemini-3.6-flash",
  json: (process.env.MODEL_JSON as string) || "google/gemini-3.6-flash",
};

/**
 * Get the model for a specific task.
 * Falls back to the default if not overridden.
 */
export function getModel(task: keyof ModelConfig): string {
  return defaultModels[task];
}
