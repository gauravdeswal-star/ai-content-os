/**
 * Handler for the /caption command.
 * Generates engaging captions with hooks, body, CTA, and hashtags.
 */

import type { ParsedCommand, ApiResponse, CaptionResult } from "@/types";
import { generateText } from "@/lib/ai/client";
import { getModel } from "@/config/models";
import { getCaptionSystemPrompt, buildCaptionPrompt } from "@/lib/prompts/caption";
import { logger } from "@/lib/logger";

/**
 * Handler for /caption command.
 * Accepts: Topic, Platform, Tone, Emojis (yes/no), Hashtags (yes/no), SEO (yes/no), CTA.
 */
export async function captionHandler(
  command: ParsedCommand,
): Promise<ApiResponse<CaptionResult>> {
  const options = command.options;

  const topic = options["topic"] || options["t"];
  if (!topic) {
    return {
      success: false,
      message: "Please provide a topic for the caption.",
      data: null,
      error: {
        code: "MISSING_TOPIC",
        message:
          "Topic is required. Use:\n/caption\nTopic: Your topic here\nPlatform: Instagram",
      },
    };
  }

  const platform = options["platform"] || options["p"] || "instagram";
  const tone = options["tone"];
  const includeEmojis = options["emojis"] !== "no";
  const includeHashtags = options["hashtags"] !== "no";
  const includeSeo = options["seo"] === "yes";
  const cta = options["cta"] || options["calltoaction"];

  const startTime = Date.now();

  const response = await generateText(
    buildCaptionPrompt({
      topic,
      platform,
      tone,
      includeEmojis,
      includeHashtags,
      includeSeo,
      cta,
    }),
    {
      model: getModel("caption"),
      systemPrompt: getCaptionSystemPrompt(),
    },
  );

  const executionTime = Date.now() - startTime;

  logger.log({
    userId: "telegram",
    command: "caption",
    executionTimeMs: executionTime,
    tokens: response.usage.totalTokens,
    model: response.model,
    costEstimate: response.costEstimate,
    status: "success",
  });

  return {
    success: true,
    message: response.content,
    data: {
      hook: "",
      body: response.content,
      cta: cta || "",
      hashtags: [],
      seoKeywords: [],
      fullCaption: response.content,
    },
    error: null,
  };
}
