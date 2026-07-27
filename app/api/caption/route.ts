/**
 * Caption generation API route.
 * POST /api/caption - Generate engaging captions.
 */

import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { captionSchema } from "@/lib/validators";
import { generateText } from "@/lib/ai/client";
import { getModel } from "@/config/models";
import { getCaptionSystemPrompt, buildCaptionPrompt } from "@/lib/prompts/caption";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();
    const parseResult = captionSchema.safeParse(body);

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

    const response = await generateText(buildCaptionPrompt(params), {
      model: getModel("caption"),
      systemPrompt: getCaptionSystemPrompt(),
    });

    return NextResponse.json({
      success: true,
      message: "Caption generated successfully",
      data: {
        raw: response.content,
      },
      error: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate caption",
        data: null,
        error: { code: "GENERATION_ERROR", message },
      },
      { status: 500 },
    );
  }
}
