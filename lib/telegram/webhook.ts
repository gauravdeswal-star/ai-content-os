/**
 * Telegram webhook handler.
 * Receives updates from Telegram and processes them through the command pipeline.
 */

import type { TelegramUpdate } from "@/lib/validators";
import type { ParsedCommand, ApiResponse, CommandName } from "@/types";
import { parseCommand } from "@/lib/parser/command-parser";
import { router } from "@/lib/router/command-router";
import { sendMessage, sendPhoto, sendChatAction, sendCommandResponse } from "@/lib/telegram/bot";
import { logger } from "@/lib/logger";
import { helpHandler, startHandler } from "@/lib/router/handlers/help";
import { scriptHandler } from "@/lib/router/handlers/script";
import { hashtagsHandler } from "@/lib/router/handlers/hashtags";
import { captionHandler } from "@/lib/router/handlers/caption";
import { carouselHandler } from "@/lib/router/handlers/carousel";
import { imageHandler } from "@/lib/router/handlers/image";
import { videoHandler } from "@/lib/router/handlers/video";
import { voiceHandler } from "@/lib/router/handlers/voice";
import { postHandler } from "@/lib/router/handlers/post";
import { translateHandler } from "@/lib/router/handlers/translate";

/**
 * Initialize the command router with all handlers.
 * This is called once during application startup.
 */
export function initializeRouter(): void {
  // Register core command handlers
  router.register("script", scriptHandler);
  router.register("carousel", carouselHandler);
  router.register("image", imageHandler);
  router.register("video", videoHandler);
  router.register("voice", voiceHandler);
  router.register("hashtags", hashtagsHandler);
  router.register("caption", captionHandler);
  router.register("post", postHandler);
  router.register("translate", translateHandler);
  router.register("help", helpHandler);
  router.register("start", startHandler);
  // Future commands can be registered here without modifying router logic:
  // router.register("news", newsHandler);
  // router.register("summarize", summarizeHandler);

  console.log("[Router] Initialized with handlers:", router.getRegisteredCommands().join(", "));
}

/**
 * Process an incoming Telegram update.
 *
 * @param update - The parsed Telegram update object
 * @returns API response
 */
export async function processUpdate(
  update: TelegramUpdate,
): Promise<ApiResponse<unknown>> {
  const startTime = Date.now();

  try {
    // Validate update has a message
    if (!update.message) {
      return {
        success: false,
        message: "No message in update",
        data: null,
        error: { code: "NO_MESSAGE", message: "Update contains no message" },
      };
    }

    const message = update.message;
    const chatId = message.chat.id;
    const text = message.text || "";

    /** Extract user info */
    const userId = String(message.from?.id || "unknown");
    const userName = message.from?.username || message.from?.first_name || "Unknown";

    // Send typing indicator
    await sendChatAction(chatId);

    // Check for attachments
    const attachments = [];
    if (message.photo) {
      attachments.push({
        type: "photo" as const,
        fileId: message.photo[message.photo.length - 1]!.file_id,
        fileUniqueId: message.photo[message.photo.length - 1]!.file_unique_id,
      });
    }
    if (message.document) {
      attachments.push({
        type: "document" as const,
        fileId: message.document.file_id,
        fileUniqueId: message.document.file_unique_id,
        mimeType: message.document.mime_type,
        fileSize: message.document.file_size,
      });
    }
    if (message.voice) {
      attachments.push({
        type: "voice" as const,
        fileId: message.voice.file_id,
        fileUniqueId: message.voice.file_unique_id,
        mimeType: message.voice.mime_type,
        fileSize: message.voice.file_size,
      });
    }
    if (message.video) {
      attachments.push({
        type: "video" as const,
        fileId: message.video.file_id,
        fileUniqueId: message.video.file_unique_id,
        mimeType: message.video.mime_type,
      });
    }

    // Parse the command
    const parsedCommand = parseCommand(text, attachments.length > 0 ? attachments : undefined);

    if (!parsedCommand) {
      await sendMessage(
        chatId,
        "I couldn't understand that command. Type /help to see what I can do.",
      );

      return {
        success: false,
        message: "Could not parse command",
        data: null,
        error: { code: "INVALID_COMMAND", message: "The message does not contain a valid command" },
      };
    }

    // Route and execute the command
    const response = await router.execute(parsedCommand);

    // Send the response back to Telegram
    // Check if response contains image data — if so, send as a photo
    const data = response.data as Record<string, unknown> | null;
    if (
      response.success &&
      data?.b64Json &&
      typeof data.b64Json === "string" &&
      data?.mode === "generate"
    ) {
      const mediaType = (data.mediaType as string) || "image/png";
      const caption = response.message.substring(0, 200); // Truncate for caption
      await sendChatAction(chatId, "upload_photo");
      await sendPhoto(chatId, data.b64Json as string, mediaType, caption);
    } else {
      await sendCommandResponse(chatId, response);
    }

    const executionTime = Date.now() - startTime;
    logger.log({
      userId,
      command: parsedCommand.command,
      executionTimeMs: executionTime,
      tokens: 0,
      model: "unknown",
      costEstimate: 0,
      status: response.success ? "success" : "error",
    });

    return response;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    logger.log({
      userId: "unknown",
      command: "script" as CommandName,
      executionTimeMs: executionTime,
      tokens: 0,
      model: "unknown",
      costEstimate: 0,
      status: "error",
      error: errorMessage,
    });

    return {
      success: false,
      message: "An unexpected error occurred",
      data: null,
      error: { code: "INTERNAL_ERROR", message: errorMessage },
    };
  }
}
