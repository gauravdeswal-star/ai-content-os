/**
 * Settings API route.
 * GET /api/settings - Get current configuration.
 * POST /api/settings - Update configuration.
 */

import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { defaultModels } from "@/config/models";

export const runtime = "nodejs";

/**
 * GET /api/settings
 * Returns the current application configuration (excluding secrets).
 */
export async function GET(): Promise<NextResponse<ApiResponse>> {
  return NextResponse.json({
    success: true,
    message: "Settings retrieved",
    data: {
      models: defaultModels,
      version: "1.0.0",
      environment: process.env.NODE_ENV,
      features: {
        openrouter: !!process.env.OPENROUTER_API_KEY,
        gemini: !!process.env.GOOGLE_API_KEY,
        telegram: !!process.env.TELEGRAM_TOKEN,
        supabase: !!process.env.SUPABASE_URL,
        cloudinary: !!process.env.CLOUDINARY_CLOUD_NAME,
      },
    },
    error: null,
  });
}
