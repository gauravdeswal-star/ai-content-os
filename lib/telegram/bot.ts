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
