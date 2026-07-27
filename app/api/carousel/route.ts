/**
 * Carousel content generation API route.
 * POST /api/carousel - Generate carousel content with Canva-compatible JSON.
 */

import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { carouselSchema } from "@/lib/validators";
import { generateText, generateJSON } from "@/lib/ai/client";
import { getModel } from "@/config/models";
import { getCarouselSystemPrompt, buildCarouselPrompt } from "@/lib/prompts/carousel";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();
    const parseResult = carouselSchema.safeParse(body);

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

    // Generate carousel content as JSON for structured output
    const carouselData = await generateJSON<{
      title: string;
      slides: {
        slideNumber: number;
        title: string;
        content: string;
        imagePrompt: string;
        notes: string;
      }[];
      cta: string;
      caption: string;
    }>(buildCarouselPrompt(params), {
      model: getModel("carousel"),
      systemPrompt: getCarouselSystemPrompt(),
      temperature: 0.7,
    });

    return NextResponse.json({
      success: true,
      message: "Carousel generated successfully",
      data: {
        ...carouselData,
        slideCount: carouselData.slides?.length || 0,
      },
      error: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate carousel",
        data: null,
        error: { code: "GENERATION_ERROR", message },
      },
      { status: 500 },
    );
  }
}
