/**
 * Handler for the /script command.
 * Generates platform-optimized scripts using AI.
 */

import type { ParsedCommand, ApiResponse, ScriptResult } from "@/types";
import { generateText } from "@/lib/ai/client";
import { getModel } from "@/config/models";
import { getScriptSystemPrompt, buildScriptPrompt } from "@/lib/prompts/script";
import { logger } from "@/lib/logger";

/**
 * Handler for /script command.
 * Accepts structured arguments: Topic, Platform, Duration, Tone, Language.
 */
export async function scriptHandler(
  command: ParsedCommand,
): Promise<ApiResponse<ScriptResult>> {
  const options = command.options;

  // Validate required fields
  const topic = options["topic"] || options["t"];
  if (!topic) {
    return {
      success: false,
      message: "Please provide a topic for the script.",
      data: null,
      error: {
        code: "MISSING_TOPIC",
        message:
          "Topic is required. Use:\n/script\nTopic: Your topic here\nPlatform: Instagram",
      },
    };
  }

  const platform = options["platform"] || options["p"] || "instagram";
  const duration = options["duration"] || options["d"];
  const tone = options["tone"];
  const language = options["language"] || options["lang"];
  const targetAudience = options["targetaudience"] || options["audience"];

  const startTime = Date.now();

  // Generate the script using AI
  const response = await generateText(
    buildScriptPrompt({
      topic,
      platform,
      duration: duration ? parseInt(duration, 10) : undefined,
      tone,
      language,
      targetAudience,
    }),
    {
      model: getModel("script"),
      systemPrompt: getScriptSystemPrompt(),
    },
  );

  const executionTime = Date.now() - startTime;

  logger.log({
    userId: "telegram",
    command: "script",
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
      title: topic,
      body: response.content,
      hooks: [],
      cta: "",
      estimatedDuration: duration ? parseInt(duration, 10) : 60,
      platform,
    },
    error: null,
  };
}
