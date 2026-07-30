/**
 * Telegram webhook setup endpoint.
 * POST /api/setup/webhook - Configure the Telegram bot webhook.
 * GET /api/setup/webhook - Get current webhook status.
 *
 * Use this endpoint after deploying to set your bot's webhook URL.
 */

import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { setWebhook, deleteWebhook, getWebhookInfo } from "@/lib/telegram/bot";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/setup/webhook
 * Returns the current webhook configuration status.
 */
export async function GET(): Promise<NextResponse<ApiResponse>> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    let webhookInfo = null;
    try {
      webhookInfo = await getWebhookInfo();
    } catch {
      // Telegram token not configured
    }

    return NextResponse.json({
      success: true,
      message: "Webhook setup information",
      data: {
        currentWebhook: webhookInfo,
        recommendedUrl: `${appUrl}/api/telegram`,
        tokenConfigured: !!process.env.TELEGRAM_TOKEN,
        secretConfigured: !!process.env.TELEGRAM_WEBHOOK_SECRET,
        instructions: [
          "1. Set your NEXT_PUBLIC_APP_URL environment variable to your deployed URL",
          `2. POST to this endpoint with { "url": "${appUrl}/api/telegram" } to set the webhook`,
          "   Or run: curl -X POST https://api.telegram.org/bot<TOKEN>/setWebhook",
          `     -d '{"url": "${appUrl}/api/telegram", "secret_token": "your_secret"}'`,
        ],
      },
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get webhook info",
        data: null,
        error: {
          code: "WEBHOOK_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/setup/webhook
 * Set or update the Telegram bot webhook URL.
 *
 * Body:
 *   { "url": "https://your-domain.com/api/telegram" }
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json().catch(() => ({}));
    const url = body.url
      || (process.env.NEXT_PUBLIC_APP_URL
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram`
        : null);

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          message: "Webhook URL is required",
          data: null,
          error: {
            code: "MISSING_URL",
            message:
              "Provide a 'url' field or set NEXT_PUBLIC_APP_URL environment variable.",
          },
        },
        { status: 400 },
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid webhook URL format",
          data: null,
          error: { code: "INVALID_URL", message: "The provided URL is not valid." },
        },
        { status: 400 },
      );
    }

    await setWebhook(url);

    return NextResponse.json({
      success: true,
      message: `Webhook configured successfully to: ${url}`,
      data: {
        url,
        secretConfigured: !!process.env.TELEGRAM_WEBHOOK_SECRET,
      },
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to set webhook",
        data: null,
        error: {
          code: "WEBHOOK_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/setup/webhook
 * Remove the current webhook.
 */
export async function DELETE(): Promise<NextResponse<ApiResponse>> {
  try {
    await deleteWebhook();

    return NextResponse.json({
      success: true,
      message: "Webhook deleted successfully",
      data: null,
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete webhook",
        data: null,
        error: {
          code: "WEBHOOK_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 },
    );
  }
}
