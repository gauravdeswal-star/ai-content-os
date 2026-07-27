/**
 * Content scheduling API route.
 * POST /api/schedule - Schedule content for future publication.
 */

import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { scheduleSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();
    const parseResult = scheduleSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: parseResult.error.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join(", "),
          },
        },
        { status: 400 },
      );
    }

    const params = parseResult.data;

    // TODO: Store scheduled post in database and set up publishing job
    return NextResponse.json({
      success: true,
      message: "Content scheduled successfully",
      data: {
        id: `sched_${Date.now()}`,
        content: params.content.substring(0, 100) + "...",
        platforms: params.platforms,
        scheduledAt: params.scheduledAt,
        status: "scheduled",
      },
      error: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to schedule content",
        data: null,
        error: { code: "SCHEDULE_ERROR", message },
      },
      { status: 500 },
    );
  }
}
