/**
 * Image generation API route.
 * POST /api/image - Generate image prompts AND/OR actual images.
 *
 * Mode: "prompt" (default) - Generates an optimized text prompt
 * Mode: "generate" - Generates an actual image using OpenRouter Image API
 */

import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { imageSchema } from "@/lib/validators";
import { generateText } from "@/lib/ai/client";
import { generateImage, IMAGE_MODELS } from "@/lib/ai/image-generation";
import { getModel } from "@/config/models";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();
    const parseResult = imageSchema.safeParse(body);

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
    const mode = body.mode || "prompt";

    // ----- MODE: GENERATE (actual image) -----
    if (mode === "generate") {
      try {
        const imageModel = body.model || IMAGE_MODELS.fluxSchnell;
        const provider = body.provider || "huggingface";

        const result = await generateImage(params.prompt, {
          model: imageModel,
          aspectRatio: params.aspectRatio,
          n: body.count || 1,
          provider: provider as "huggingface" | "openrouter",
        });

        return NextResponse.json({
          success: true,
          message: "Image generated successfully",
          data: {
            mode: "generate",
            image: {
              b64Json: result.b64Json,
              mediaType: result.mediaType,
            },
            prompt: params.prompt,
            negativePrompt: params.negativePrompt || "",
            aspectRatio: params.aspectRatio || "1:1",
            style: params.style || "",
            model: result.model,
            cost: result.usage.cost,
          },
          error: null,
        });
      } catch (genError) {
        const message =
          genError instanceof Error ? genError.message : "Image generation failed";

        return NextResponse.json(
          {
            success: false,
            message,
            data: null,
            error: { code: "GENERATION_ERROR", message },
          },
          { status: 500 },
        );
      }
    }

    // ----- MODE: PROMPT (default - generate text prompt) -----
    const systemPrompt = `You are an expert AI image prompt engineer.
Create detailed, optimized prompts for AI image generation.
Include style, lighting, composition, and mood details.
Adapt the prompt for the specified aspect ratio and style.`;

    const promptText = `Create an optimized image generation prompt for:

Subject: ${params.prompt}
${params.negativePrompt ? `Avoid: ${params.negativePrompt}` : ""}
${params.aspectRatio ? `Aspect Ratio: ${params.aspectRatio}` : ""}
${params.style ? `Style: ${params.style}` : ""}

Return a detailed prompt (100-200 words) optimized for Midjourney / DALL-E / Stable Diffusion.
Also include: subject details, lighting, color palette, composition, mood/atmosphere.`;

    const response = await generateText(promptText, {
      model: getModel("imagePrompt"),
      systemPrompt,
    });

    return NextResponse.json({
      success: true,
      message: "Image prompt generated successfully",
      data: {
        mode: "prompt",
        prompt: response.content,
        negativePrompt: params.negativePrompt || "",
        aspectRatio: params.aspectRatio || "1:1",
        style: params.style || "",
        imagePrompt: response.content,
      },
      error: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process image request",
        data: null,
        error: { code: "SERVER_ERROR", message },
      },
      { status: 500 },
    );
  }
}
