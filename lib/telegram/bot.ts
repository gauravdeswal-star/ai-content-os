/**
 * Telegram Bot service for sending messages and formatting responses.
 * Uses the Telegram Bot API via axios.
 */

import axios from "axios";
import type { ApiResponse } from "@/types";

const TELEGRAM_API = "https://api.telegram.org/bot";

/**
 * Get the Telegram Bot API base URL.
 */
function getApiUrl(): string {
  const token = process.env.TELEGRAM_TOKEN;
  if (!token) {
    throw new Error(
      "TELEGRAM_TOKEN is not configured. Set it in your environment variables.",
    );
  }
  return `${TELEGRAM_API}${token}`;
}

/**
 * Send a text message to a Telegram chat.
 *
 * @param chatId - The Telegram chat ID
 * @param text - Message text (supports MarkdownV2 formatting)
 * @param options - Additional options (parse_mode, reply_to, etc.)
 */
export async function sendMessage(
  chatId: number | string,
  text: string,
  options: {
    parseMode?: "HTML" | "MarkdownV2";
    replyToMessageId?: number;
    disableWebPagePreview?: boolean;
    disableNotification?: boolean;
  } = {},
): Promise<void> {
  const { parseMode = "HTML", replyToMessageId, disableWebPagePreview, disableNotification } = options;

  try {
    await axios.post(`${getApiUrl()}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      reply_to_message_id: replyToMessageId,
      disable_web_page_preview: disableWebPagePreview ?? true,
      disable_notification: disableNotification,
    });
  } catch (error) {
    console.error("[Telegram] Failed to send message:", error);
    throw new Error("Failed to send Telegram message");
  }
}

/**
 * Send a photo to a Telegram chat.
 *
 * Strategy (tried in order):
 *   1. Upload the image to Cloudinary (if configured) and send the URL
 *   2. Fall back to multipart/form-data upload directly to Telegram
 *   3. Fall back to a text-only message
 *
 * @param chatId - The Telegram chat ID
 * @param base64Data - Base64-encoded image data (without data: prefix)
 * @param mediaType - The MIME type of the image (e.g., "image/png")
 * @param caption - Optional caption for the photo
 */
export async function sendPhoto(
  chatId: number | string,
  base64Data: string,
  mediaType: string = "image/png",
  caption?: string,
): Promise<void> {
  // ─── Step 1: Try Cloudinary (uploads image to CDN, sends public URL) ───
  try {
    const { isCloudinaryConfigured, uploadImageToUrl } = await import("@/lib/storage/cloudinary");

    if (isCloudinaryConfigured()) {
      const imageUrl = await uploadImageToUrl(base64Data, "telegram-images");

      await axios.post(`${getApiUrl()}/sendPhoto`, {
        chat_id: chatId,
        photo: imageUrl,
        caption: caption ? caption.substring(0, 1024) : undefined,
        parse_mode: "HTML",
      });

      console.log("[Telegram] Photo sent via Cloudinary URL");
      return;
    }
  } catch (cloudinaryError) {
    console.warn("[Telegram] Cloudinary upload failed, trying multipart:", cloudinaryError);
  }

  // ─── Step 2: Try multipart/form-data upload directly to Telegram ───
  try {
    const imageBuffer = Buffer.from(base64Data, "base64");
    const extension = mediaType.split("/")[1] || "png";
    const filename = `image.${extension}`;

    const FormData = (await import("form-data")).default;
    const form = new FormData();
    form.append("chat_id", String(chatId));
    form.append("photo", imageBuffer, { filename, contentType: mediaType });

    if (caption) {
      form.append("caption", caption.substring(0, 1024));
    }

    await axios.post(`${getApiUrl()}/sendPhoto`, form, {
      headers: form.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    console.log("[Telegram] Photo sent via multipart upload");
    return;
  } catch (multipartError) {
    console.error("[Telegram] Multipart upload also failed:", multipartError);
  }

  // ─── Step 3: Fallback — send a text message explaining the image ───
  try {
    const summary = caption
      ? caption.substring(0, 200)
      : "🖼️ Image was generated successfully but could not be sent as a photo.";

    const fallbackMsg = [
      summary,
      "",
      "ℹ️ The image data is available through the API.",
      "To get it working in Telegram automatically:",
      "• Set up <b>Cloudinary</b> env vars (CLOUDINARY_CLOUD_NAME, etc.)",
      "• The bot will upload images there and send the URL into chat",
      "",
      "<i>💡 The base64 image data is in the API response.</i>",
    ].join("\n");

    await sendMessage(chatId, fallbackMsg, { parseMode: "HTML" });
  } catch (fallbackError) {
    console.error("[Telegram] Fallback send also failed:", fallbackError);
  }
}

/**
 * Send a typing action indicator to show the bot is processing.
 */
export async function sendChatAction(
  chatId: number | string,
  action: "typing" | "upload_photo" | "upload_video" | "upload_voice" | "upload_document" = "typing",
): Promise<void> {
  try {
    await axios.post(`${getApiUrl()}/sendChatAction`, {
      chat_id: chatId,
      action,
    });
  } catch (error) {
    console.error("[Telegram] Failed to send chat action:", error);
  }
}

/**
 * Send a formatted command response with proper markdown.
 */
export async function sendCommandResponse(
  chatId: number | string,
  response: ApiResponse<unknown>,
): Promise<void> {
  const formattedMessage = formatApiResponse(response);
  await sendMessage(chatId, formattedMessage, { parseMode: "HTML" });
}

/**
 * Format an API response into a user-friendly Telegram message.
 */
function formatApiResponse(response: ApiResponse<unknown>): string {
  if (response.success) {
    return `
✅ <b>Success</b>

${response.message}

<code>${JSON.stringify(response.data, null, 2)}</code>
    `.trim();
  }

  return `
❌ <b>Error</b>

${response.error?.message || response.message}

<code>Error code: ${response.error?.code || "UNKNOWN"}</code>
  `.trim();
}

/**
 * Set the webhook URL for the Telegram bot.
 * This should be called once during setup or when deploying.
 *
 * @param webhookUrl - The full URL to the webhook endpoint
 */
export async function setWebhook(webhookUrl: string): Promise<void> {
  try {
    const response = await axios.post(`${getApiUrl()}/setWebhook`, {
      url: webhookUrl,
      secret_token: process.env.TELEGRAM_WEBHOOK_SECRET,
      allowed_updates: ["message"],
    });

    console.log("[Telegram] Webhook set:", response.data);
  } catch (error) {
    console.error("[Telegram] Failed to set webhook:", error);
    throw new Error("Failed to set Telegram webhook");
  }
}

/**
 * Delete the current webhook.
 */
export async function deleteWebhook(): Promise<void> {
  try {
    await axios.post(`${getApiUrl()}/deleteWebhook`);
    console.log("[Telegram] Webhook deleted");
  } catch (error) {
    console.error("[Telegram] Failed to delete webhook:", error);
  }
}

/**
 * Get current webhook info.
 */
export async function getWebhookInfo(): Promise<{
  url: string;
  hasCustomCertificate: boolean;
  pendingUpdateCount: number;
}> {
  try {
    const response = await axios.get(`${getApiUrl()}/getWebhookInfo`);
    return response.data.result;
  } catch (error) {
    console.error("[Telegram] Failed to get webhook info:", error);
    throw new Error("Failed to get webhook info");
  }
}
