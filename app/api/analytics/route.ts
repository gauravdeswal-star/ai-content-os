/**
 * Analytics API route.
 * GET /api/analytics - Get usage analytics and stats.
 */

import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/analytics
 * Returns analytics data. Supports filtering by user.
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  try {
    const logs = userId
      ? logger.getLogsForUser(userId, limit)
      : logger.getAllLogs(limit);

    const stats = userId ? logger.getUserStats(userId) : null;

    return NextResponse.json({
      success: true,
      message: "Analytics retrieved successfully",
      data: {
        logs,
        stats,
        totalLogs: logs.length,
      },
      error: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve analytics",
        data: null,
        error: { code: "ANALYTICS_ERROR", message },
      },
      { status: 500 },
    );
  }
}
