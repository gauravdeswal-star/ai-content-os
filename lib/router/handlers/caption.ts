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
  const includeViralKeywords =
    (options["viral"] || options["keywords"] || "yes").toLowerCase() !== "no";
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
      includeViralKeywords,
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

  // Extract viral keywords from the generated caption (best-effort parse)
  const viralKeywords = extractSectionKeywords(
    response.content,
    /\*{1,2}Viral Keywords\*{0,2}:?\s*/i,
  );

  return {
    success: true,
    message: response.content,
    data: {
      hook: "",
      body: response.content,
      cta: cta || "",
      hashtags: [],
      seoKeywords: [],
      viralKeywords,
      fullCaption: response.content,
    },
    error: null,
  };
}

/**
 * Best-effort extraction of a comma-separated keyword list from a generated
 * response section (e.g. "**Viral Keywords:** word1, word2, ...").
 */
function extractSectionKeywords(content: string, pattern: RegExp): string[] {
  const match = content.match(pattern);
  if (!match) return [];

  const section = content
    .slice(match.index! + match[0].length)
    .split(/\n{2,}|\*{1,2}[A-Z]/)
    .find((block) => block.trim().length > 0);
  if (!section) return [];

  return section
    .split(/[,\n]/)
    .map((kw) => kw.trim().replace(/^[#*\-\d\.]+\s*/, ""))
    .filter((kw) => kw.length > 1 && kw.length < 60)
    .slice(0, 15);
}
