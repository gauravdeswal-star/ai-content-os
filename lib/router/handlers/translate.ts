/**
 * Handler for the /translate command.
 * Demonstrates the extensible command architecture — registered in one place,
 * no router modifications needed.
 *
 * Translates content from one language to another using the AI client.
 */

import type { ParsedCommand, ApiResponse, CommandName } from "@/types";
import { generateText } from "@/lib/ai/client";
import { getModel } from "@/config/models";
import { logger } from "@/lib/logger";

/**
 * Handler for /translate command.
 * Accepts: Text (content to translate), Language (target language).
 *
 * @example
 * /translate
 * Text: Hello, how are you?
 * Language: Spanish
 */
export async function translateHandler(
  command: ParsedCommand,
): Promise<ApiResponse<unknown>> {
  const options = command.options;

  const text = options["text"] || options["t"] || options["content"] || options["c"];
  if (!text) {
    return {
      success: false,
      message: "Please provide the text to translate.",
      data: null,
      error: {
        code: "MISSING_TEXT",
        message:
          "Text is required. Use:\n/translate\nText: Hello, how are you?\nLanguage: Spanish",
      },
    };
  }

  const targetLanguage =
    options["language"] || options["lang"] || options["l"] || options["to"];

  if (!targetLanguage) {
    return {
      success: false,
      message: "Please specify the target language.",
      data: null,
      error: {
        code: "MISSING_LANGUAGE",
        message:
          "Target language is required. Use:\n/translate\nText: Hello\nLanguage: French",
      },
    };
  }

  const sourceLanguage = options["source"] || options["from"] || "auto";

  const startTime = Date.now();

  const systemPrompt = `You are an expert translator.
Translate accurately while preserving tone, style, and meaning.
For social media content, adapt idioms and cultural references appropriately.
Return only the translated text, no explanations.`;

  const prompt = `Translate the following text from ${sourceLanguage === "auto" ? "the detected language" : sourceLanguage} to ${targetLanguage}:

---
${text}
---

Translation:`;

  const response = await generateText(prompt, {
    model: getModel("rewrite"),
    systemPrompt,
    temperature: 0.3,
  });

  const executionTime = Date.now() - startTime;

  logger.log({
    userId: "telegram",
    command: "translate" as CommandName,
    executionTimeMs: executionTime,
    tokens: response.usage.totalTokens,
    model: response.model,
    costEstimate: response.costEstimate,
    status: "success",
  });

  const formattedMessage = [
    `<b>🌐 Translation</b>`,
    "",
    `<b>From:</b> ${sourceLanguage === "auto" ? "Auto-detected" : sourceLanguage}`,
    `<b>To:</b> ${targetLanguage}`,
    "",
    `<b>Original:</b>`,
    `<i>${text}</i>`,
    "",
    `<b>Translated:</b>`,
    response.content,
  ].join("\n");

  return {
    success: true,
    message: formattedMessage,
    data: {
      original: text,
      translated: response.content,
      sourceLanguage,
      targetLanguage,
    },
    error: null,
  };
}
