/**
 * Handler for the /hashtags command.
 * Generates optimized hashtags grouped by competition level.
 */

import type { ParsedCommand, ApiResponse, HashtagResult } from "@/types";
import { generateText } from "@/lib/ai/client";
import { getModel } from "@/config/models";
import { getHashtagSystemPrompt, buildHashtagPrompt } from "@/lib/prompts/hashtags";
import { logger } from "@/lib/logger";

/**
 * Handler for /hashtags command.
 * Accepts: Topic, Count (optional, default 30), Language (optional).
 */
export async function hashtagsHandler(
  command: ParsedCommand,
): Promise<ApiResponse<HashtagResult>> {
  const options = command.options;

  const topic = options["topic"] || options["t"];
  if (!topic) {
    return {
      success: false,
      message: "Please provide a topic for hashtag generation.",
      data: null,
      error: {
        code: "MISSING_TOPIC",
        message: "Topic is required. Use:\n/hashtags\nTopic: Your topic here",
      },
    };
  }

  const count = options["count"] || options["c"] || "30";
  const language = options["language"] || options["lang"];

  const startTime = Date.now();

  const response = await generateText(
    buildHashtagPrompt({
      topic,
      count: parseInt(count, 10),
      language,
    }),
    {
      model: getModel("hashtags"),
      systemPrompt: getHashtagSystemPrompt(),
    },
  );

  const executionTime = Date.now() - startTime;

  logger.log({
    userId: "telegram",
    command: "hashtags",
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
      highCompetition: [],
      mediumCompetition: [],
      lowCompetition: [],
      niche: [],
    },
    error: null,
  };
}
