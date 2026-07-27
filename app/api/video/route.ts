/**
 * Video generation API route.
 * POST /api/video - Generate video prompts AND/OR actual videos.
 *
 * Mode: "prompt" (default) - Generates a detailed video production brief
 * Mode: "generate" - Generates an actual video using Runway
 */

import { NextRequest, NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { videoSchema } from "@/lib/validators";
import { generateText } from "@/lib/ai/client";
import { generateVideo, getVideoStatus } from "@/lib/ai/video-generation";
import { getModel } from "@/config/models";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();
    const parseResult = videoSchema.safeParse(body);

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
    const action = body.action || "generate";

    // ----- MODE: GENERATE (actual video via Runway) -----
    if (mode === "generate") {
      try {
        // If checking status of an existing task
        if (action === "status" && body.taskId) {
          const status = await getVideoStatus(body.taskId);

          const statusMessages: Record<string, string> = {
            pending: "⏳ Your video is queued for generation...",
            processing: "🎬 Your video is being generated...",
            completed: "✅ Video generation complete!",
            failed: "❌ Video generation failed.",
          };

          return NextResponse.json({
            success: status.status !== "failed",
            message:
              statusMessages[status.status] || "Unknown status",
            data: {
              mode: "generate",
              action: "status",
              taskId: body.taskId,
              status: status.status,
              videoUrl: status.videoUrl || null,
              progress: status.progress || 0,
            },
            error: status.error
              ? { code: "VIDEO_ERROR", message: status.error }
              : null,
          });
        }

        // Generate a new video
        const result = await generateVideo(params.topic, {
          duration: params.duration,
          aspectRatio:
            params.platform === "youtube"
              ? "16:9"
              : params.platform === "instagram" || params.platform === "tiktok"
                ? "9:16"
                : "16:9",
        });

        return NextResponse.json({
          success: true,
          message:
            result.status === "completed"
              ? "✅ Video generated successfully!"
              : "🎬 Video generation started. Use action=status with the taskId to check progress.",
          data: {
            mode: "generate",
            action: "generate",
            taskId: result.taskId,
            status: result.status,
            videoUrl: result.videoUrl || null,
            topic: params.topic,
            duration: params.duration || 60,
            platform: params.platform || "",
            cost: result.cost,
          },
          error: null,
        });
      } catch (genError) {
        const message =
          genError instanceof Error
            ? genError.message
            : "Video generation failed";

        // Provide helpful message if RUNWAY_API_KEY is missing
        if (message.includes("RUNWAY_API_KEY")) {
          return NextResponse.json({
            success: false,
            message:
              "Video generation requires a Runway API key.\n\n" +
              "Set RUNWAY_API_KEY in your environment variables.\n" +
              "Get a key at: https://runwayml.com\n\n" +
              "In the meantime, use mode=\"prompt\" to generate video production briefs instead.",
            data: null,
            error: { code: "CONFIG_ERROR", message },
          });
        }

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

    // ----- MODE: PROMPT (default - generate video production brief) -----
    const systemPrompt = `You are an expert video content strategist and prompt engineer.
Create detailed video production briefs optimized for AI video generation tools like Veo.
Include creative direction, technical specifications, and production notes.`;

    const promptText = `Create a comprehensive video production brief for:

Topic: ${params.topic}
Target Duration: ${params.duration || 60} seconds
${params.platform ? `Platform: ${params.platform}` : ""}
${params.tone ? `Tone: ${params.tone}` : ""}

Provide:

1. **TITLE**: Catchy video title

2. **OVERALL VIDEO PROMPT**: A 2-3 sentence master prompt for AI video generation

3. **SCENE BREAKDOWN** (table format):
| Scene | Duration | Description | Camera Motion | Lighting | Audio |

4. **TRANSITIONS**: List 3-5 suggested transitions between scenes

5. **AUDIO SUGGESTIONS**: Music genre, pacing, sound effects

6. **PRODUCTION NOTES**: Key creative decisions and tips`;

    const response = await generateText(promptText, {
      model: getModel("video"),
      systemPrompt,
    });

    return NextResponse.json({
      success: true,
      message: "Video production brief generated",
      data: {
        mode: "prompt",
        raw: response.content,
        topic: params.topic,
        duration: params.duration || 60,
        platform: params.platform || "",
        tone: params.tone || "",
      },
      error: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        success: false,
        message: "Failed to process video request",
        data: null,
        error: { code: "SERVER_ERROR", message },
      },
      { status: 500 },
    );
  }
}
