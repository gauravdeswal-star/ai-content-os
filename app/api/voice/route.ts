/**
 * Voice/SSML script generation API route.
 * POST /api/voice - Generate voice scripts with SSML and timing.
 */

import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { voiceSchema } from "@/lib/validators";
import { generateText } from "@/lib/ai/client";
import { getModel } from "@/config/models";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();
    const parseResult = voiceSchema.safeParse(body);

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

    const systemPrompt = `You are an expert voice-over script writer.
Create natural-sounding voice scripts with proper SSML markup.
Include timing, emphasis, pauses, and narration style notes.`;

    const prompt = `Create a voice-over script for the following content:

Script: ${params.script}
${params.language ? `Language: ${params.language}` : ""}
${params.voiceStyle ? `Voice Style: ${params.voiceStyle}` : ""}

Provide:
1. Natural narration script
2. SSML markup for text-to-speech
3. Estimated timing (seconds)
4. Emphasis and pause suggestions`;

    const response = await generateText(prompt, {
      model: getModel("voice"),
      systemPrompt,
    });

    return NextResponse.json({
      success: true,
      message: "Voice script generated successfully",
      data: { raw: response.content },
      error: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate voice script",
        data: null,
        error: { code: "GENERATION_ERROR", message },
      },
      { status: 500 },
    );
  }
}
