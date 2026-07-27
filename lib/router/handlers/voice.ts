/**
 * Handler for the /voice command.
 * Generates voiceover scripts with SSML markup, narration timing, and style guidance.
 */

import type { ParsedCommand, ApiResponse } from "@/types";
import { generateText } from "@/lib/ai/client";
import { getModel } from "@/config/models";
import { logger } from "@/lib/logger";

/**
 * Handler for /voice command.
 * Accepts: Script (the content to narrate), Style (voice style), Language.
 */
export async function voiceHandler(
  command: ParsedCommand,
): Promise<ApiResponse<unknown>> {
  const options = command.options;

  const script = options["script"] || options["s"] || options["text"] || options["t"];
  if (!script) {
    return {
      success: false,
      message: "Please provide the script content for voice generation.",
      data: null,
      error: {
        code: "MISSING_SCRIPT",
        message:
          "Script is required. Use:\n/voice\nScript: Welcome to our channel\nStyle: Energetic",
      },
    };
  }

  const voiceStyle = options["style"] || options["voicestyle"];
  const language = options["language"] || options["lang"] || "en";

  const startTime = Date.now();

  const systemPrompt = `You are an expert voice-over director and scriptwriter.
You create natural, engaging narration scripts optimized for text-to-speech.
You understand pacing, emphasis, tone, and vocal delivery techniques.`;

  const promptText = `Create a voice-over production script for the following content:

Content to Narrate:
"""
${script}
"""

${voiceStyle ? `Voice Style: ${voiceStyle}` : ""}
Language: ${language}

Provide:

1. **NARRATION SCRIPT**: The natural spoken version with proper pacing and emphasis
   - Use **bold** for emphasized words
   - Use ... for pauses
   - Add [bracketed delivery notes]

2. **SSML MARKUP**: The complete script wrapped in <speak> tags with:
   - <break time="..."/> for pauses
   - <emphasis level="..."> for emphasis
   - <prosody rate="..."> for speed changes

3. **TIMING ESTIMATE**: Total estimated narration time in seconds

4. **DELIVERY NOTES**: Key tips for the voice talent or TTS engine`;

  const response = await generateText(promptText, {
    model: getModel("voice"),
    systemPrompt,
  });

  const executionTime = Date.now() - startTime;

  logger.log({
    userId: "telegram",
    command: "voice",
    executionTimeMs: executionTime,
    tokens: response.usage.totalTokens,
    model: response.model,
    costEstimate: response.costEstimate,
    status: "success",
  });

  const formattedMessage = [
    `<b>🎙️ Voice Script Generated</b>`,
    "",
    voiceStyle ? `<b>Style:</b> ${voiceStyle}` : "",
    `<b>Language:</b> ${language}`,
    "",
    response.content,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    success: true,
    message: formattedMessage,
    data: {
      originalScript: script,
      voiceStyle: voiceStyle || "",
      language,
      raw: response.content,
    },
    error: null,
  };
}
