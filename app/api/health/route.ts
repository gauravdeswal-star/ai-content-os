/**
 * Health check endpoint.
 * Returns the current status of the API and its dependencies.
 */

import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * Returns the health status of the service.
 */
export async function GET(): Promise<NextResponse<ApiResponse>> {
  const healthData = {
    status: "healthy",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    checks: {
      openrouter: !!process.env.OPENROUTER_API_KEY,
      gemini: !!process.env.GOOGLE_API_KEY,
      telegram: !!process.env.TELEGRAM_TOKEN,
      supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE),
    },
  };

  return NextResponse.json({
    success: true,
    message: "Service is healthy",
    data: healthData,
    error: null,
  });
}
