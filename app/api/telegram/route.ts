/**
 * Telegram webhook endpoint.
 * Receives updates from Telegram and routes them to the appropriate handlers.
 *
 * POST /api/telegram
 *
 * Set your Telegram bot webhook to:
 * https://your-domain.com/api/telegram
 */

import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { telegramUpdateSchema } from "@/lib/validators";
import { processUpdate, initializeRouter } from "@/lib/telegram/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Initialize command router on module load
initializeRouter();

/**
 * POST /api/telegram
 * Receives webhook updates from Telegram.
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  // Verify webhook secret if configured
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (webhookSecret) {
    const headerSecret = request.headers.get("x-telegram-bot-api-secret-token");
    if (headerSecret !== webhookSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid webhook secret",
          data: null,
          error: { code: "UNAUTHORIZED", message: "Invalid webhook secret token" },
        },
        { status: 401 },
      );
    }
  }

  try {
    const body = await request.json();

    // Validate the update structure
    const parseResult = telegramUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Telegram update format",
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: parseResult.error.message,
          },
        },
        { status: 400 },
      );
    }

    // Process the update
    const result = await processUpdate(parseResult.data);

    // Always return 200 OK to Telegram, even on errors.
    // Telegram will retry non-200 responses indefinitely, causing spam.
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Always return 200 to prevent Telegram retries
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        data: null,
        error: { code: "INTERNAL_ERROR", message },
      },
      { status: 200 },
    );
  }
}

/**
 * GET /api/telegram
 * Returns information about the webhook configuration.
 */
export async function GET(): Promise<NextResponse<ApiResponse>> {
  const webhookUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/api/telegram`;

  return NextResponse.json({
    success: true,
    message: "Telegram webhook endpoint is active",
    data: {
      webhookUrl,
      tokenConfigured: !!process.env.TELEGRAM_TOKEN,
      secretConfigured: !!process.env.TELEGRAM_WEBHOOK_SECRET,
      registeredCommands: [], // Would be populated from router
    },
    error: null,
  });
}
