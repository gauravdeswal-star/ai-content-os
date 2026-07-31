/**
 * Telegram webhook endpoint.
 * Receives updates from Telegram and routes them to the appropriate handlers.
 *
 * POST /api/telegram
 *
 * Set your Telegram bot webhook to:
 * https://your-domain.com/api/telegram
 */

import { NextRequest, NextResponse, after } from "next/server";
import type { ApiResponse } from "@/types";
import { telegramUpdateSchema } from "@/lib/validators";
import { processUpdate, initializeRouter } from "@/lib/telegram/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Initialize command router on module load
initializeRouter();

/**
 * Tracks recently-processed update IDs so Telegram retries don't cause
 * duplicate generations (e.g. multiple images for one /image command).
 * Evicts entries after 10 minutes.
 */
const processedUpdateIds = new Map<number, number>(); // update_id -> timestamp (ms)
const DEDUPE_TTL_MS = 10 * 60 * 1000;

function isDuplicateUpdate(updateId: number): boolean {
  const now = Date.now();
  // Clean up stale entries
  for (const [id, ts] of processedUpdateIds) {
    if (now - ts > DEDUPE_TTL_MS) processedUpdateIds.delete(id);
  }

  if (processedUpdateIds.has(updateId)) return true;
  processedUpdateIds.set(updateId, now);
  return false;
}

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
    const update = parseResult.data;

    // Skip duplicate deliveries (Telegram retries slow webhooks) to avoid
    // generating/sending multiple images for a single command.
    if (isDuplicateUpdate(update.update_id)) {
      return NextResponse.json(
        {
          success: true,
          message: "Duplicate update skipped",
          data: null,
          error: null,
        },
        { status: 200 },
      );
    }

    // Acknowledge Telegram immediately so it never re-sends the update while
    // the (potentially slow) image generation runs. Use Next.js `after()` so
    // the work reliably completes on serverless platforms (e.g. Vercel).
    after(async () => {
      try {
        await processUpdate(update);
      } catch (err) {
        console.error("[Telegram] Background processing failed:", err);
      }
    });

    return NextResponse.json(
      {
        success: true,
        message: "Update received, processing",
        data: null,
        error: null,
      },
      { status: 200 },
    );
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
