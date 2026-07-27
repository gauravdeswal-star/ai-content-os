/**
 * Script generation API route.
 * POST /api/script - Generate a script based on provided parameters.
 */

import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse, ScriptResult } from "@/types";
import { scriptSchema } from "@/lib/validators";
import { generateText } from "@/lib/ai/client";
import { getModel } from "@/config/models";
import { getScriptSystemPrompt, buildScriptPrompt } from "@/lib/prompts/script";

export const runtime = "nodejs";

/**
 * POST /api/script
 * Generate a platform-optimized script.
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ScriptResult>>> {
  try {
    const body = await request.json();
    const parseResult = scriptSchema.safeParse(body);

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

    const response = await generateText(
      buildScriptPrompt({
        topic: params.topic,
        platform: params.platform,
        duration: params.duration,
        tone: params.tone,
        language: params.language,
        targetAudience: params.targetAudience,
      }),
      {
        model: getModel("script"),
        systemPrompt: getScriptSystemPrompt(),
      },
    );

    return NextResponse.json({
      success: true,
      message: "Script generated successfully",
      data: {
        title: params.topic,
        body: response.content,
        hooks: [],
        cta: "",
        estimatedDuration: params.duration || 60,
        platform: params.platform,
      },
      error: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate script",
        data: null,
        error: { code: "GENERATION_ERROR", message },
      },
      { status: 500 },
    );
  }
}
