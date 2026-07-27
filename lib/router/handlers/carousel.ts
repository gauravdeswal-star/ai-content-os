/**
 * Handler for the /carousel command.
 * Generates multi-slide carousel content with Canva-compatible JSON output.
 */

import type { ParsedCommand, ApiResponse } from "@/types";
import { generateJSON } from "@/lib/ai/client";
import { getModel } from "@/config/models";
import { getCarouselSystemPrompt, buildCarouselPrompt } from "@/lib/prompts/carousel";
import { logger } from "@/lib/logger";

/**
 * Handler for /carousel command.
 * Accepts: Topic, Slides (count), Tone, Platform, CTA (yes/no).
 */
export async function carouselHandler(
  command: ParsedCommand,
): Promise<ApiResponse<unknown>> {
  const options = command.options;

  const topic = options["topic"] || options["t"];
  if (!topic) {
    return {
      success: false,
      message: "Please provide a topic for the carousel.",
      data: null,
      error: {
        code: "MISSING_TOPIC",
        message:
          "Topic is required. Use:\n/carousel\nTopic: Your topic here\nSlides: 5",
      },
    };
  }

  const slideCount = parseInt(options["slides"] || options["count"] || options["s"] || "5", 10);
  const platform = options["platform"] || options["p"];
  const tone = options["tone"];
  const includeCta = options["cta"] !== "no";

  const startTime = Date.now();

  const carouselData = await generateJSON<{
    title: string;
    slides: {
      slideNumber: number;
      title: string;
      content: string;
      imagePrompt: string;
      notes: string;
    }[];
    cta: string;
    caption: string;
  }>(buildCarouselPrompt({ topic, slideCount, platform, tone, includeCta }), {
    model: getModel("carousel"),
    systemPrompt: getCarouselSystemPrompt(),
    temperature: 0.7,
  });

  const executionTime = Date.now() - startTime;

  logger.log({
    userId: "telegram",
    command: "carousel",
    executionTimeMs: executionTime,
    tokens: 0,
    model: getModel("carousel"),
    costEstimate: 0,
    status: "success",
  });

  // Format the response for Telegram
  const slidePreviews = carouselData.slides
    ?.map(
      (s, i) =>
        `<b>Slide ${i + 1}:</b> ${s.title}\n${s.content.substring(0, 120)}...`,
    )
    .join("\n\n") || "";

  const formattedMessage = [
    `<b>🎠 ${carouselData.title}</b>`,
    "",
    slidePreviews,
    "",
    carouselData.cta ? `<b>CTA:</b> ${carouselData.cta}` : "",
    "",
    `<b>Caption:</b> ${carouselData.caption?.substring(0, 200)}...`,
    "",
    `<i>📋 JSON export available via API</i>`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    success: true,
    message: formattedMessage,
    data: {
      ...carouselData,
      slideCount: carouselData.slides?.length || 0,
    },
    error: null,
  };
}
