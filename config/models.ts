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
 * All models use inclusionai/ling-3.0-flash:free — completely FREE on OpenRouter!
 * No cost per generation. Rate-limited but perfect for prototyping and personal use.
 *
 * Override any model via environment variables for production.
 */
export const defaultModels: ModelConfig = {
  script: (process.env.MODEL_SCRIPT as string) || "inclusionai/ling-3.0-flash:free",
  imagePrompt:
    (process.env.MODEL_IMAGE_PROMPT as string) || "inclusionai/ling-3.0-flash:free",
  carousel:
    (process.env.MODEL_CAROUSEL as string) || "inclusionai/ling-3.0-flash:free",
  caption: (process.env.MODEL_CAPTION as string) || "inclusionai/ling-3.0-flash:free",
  hashtags:
    (process.env.MODEL_HASHTAGS as string) || "inclusionai/ling-3.0-flash:free",
  video: (process.env.MODEL_VIDEO as string) || "inclusionai/ling-3.0-flash:free",
  voice: (process.env.MODEL_VOICE as string) || "inclusionai/ling-3.0-flash:free",
  rewrite: (process.env.MODEL_REWRITE as string) || "inclusionai/ling-3.0-flash:free",
  summarize:
    (process.env.MODEL_SUMMARIZE as string) || "inclusionai/ling-3.0-flash:free",
  json: (process.env.MODEL_JSON as string) || "inclusionai/ling-3.0-flash:free",
};

/**
 * Get the model for a specific task.
 * Falls back to the default if not overridden.
 */
export function getModel(task: keyof ModelConfig): string {
  return defaultModels[task];
}
