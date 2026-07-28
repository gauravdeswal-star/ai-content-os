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
 * Note: Environment variable overrides have been intentionally removed
 * to prevent Vercel env vars from breaking model configuration.
 * Change models here directly for full control.
 */
export const defaultModels: ModelConfig = {
  script: "inclusionai/ling-3.0-flash:free",
  imagePrompt: "inclusionai/ling-3.0-flash:free",
  carousel: "inclusionai/ling-3.0-flash:free",
  caption: "inclusionai/ling-3.0-flash:free",
  hashtags: "inclusionai/ling-3.0-flash:free",
  video: "inclusionai/ling-3.0-flash:free",
  voice: "inclusionai/ling-3.0-flash:free",
  rewrite: "inclusionai/ling-3.0-flash:free",
  summarize: "inclusionai/ling-3.0-flash:free",
  json: "inclusionai/ling-3.0-flash:free",
};

/**
 * Get the model for a specific task.
 * Falls back to the default if not overridden.
 */
export function getModel(task: keyof ModelConfig): string {
  return defaultModels[task];
}
