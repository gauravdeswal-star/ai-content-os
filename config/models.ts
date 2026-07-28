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
 * Uses Claude Sonnet 5 for complex writing tasks and Gemini 3.5 Flash for lighter tasks.
 * Override via environment variables for production.
 */
export const defaultModels: ModelConfig = {
  script: (process.env.MODEL_SCRIPT as string) || "anthropic/claude-sonnet-5",
  imagePrompt:
    (process.env.MODEL_IMAGE_PROMPT as string) || "google/gemini-3.5-flash",
  carousel:
    (process.env.MODEL_CAROUSEL as string) || "anthropic/claude-sonnet-5",
  caption: (process.env.MODEL_CAPTION as string) || "anthropic/claude-sonnet-5",
  hashtags:
    (process.env.MODEL_HASHTAGS as string) || "google/gemini-3.5-flash",
  video: (process.env.MODEL_VIDEO as string) || "google/gemini-3.5-flash",
  voice: (process.env.MODEL_VOICE as string) || "anthropic/claude-sonnet-5",
  rewrite: (process.env.MODEL_REWRITE as string) || "anthropic/claude-sonnet-5",
  summarize:
    (process.env.MODEL_SUMMARIZE as string) || "google/gemini-3.5-flash",
  json: (process.env.MODEL_JSON as string) || "google/gemini-3.5-flash",
};

/**
 * Get the model for a specific task.
 * Falls back to the default if not overridden.
 */
export function getModel(task: keyof ModelConfig): string {
  return defaultModels[task];
}
