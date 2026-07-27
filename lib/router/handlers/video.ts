/**
 * Handler for the /video command.
 * Supports two modes:
 *   - "prompt" (default): Generates detailed video production briefs
 *   - "generate": Generates actual videos using Runway API
 */

import type { ParsedCommand, ApiResponse } from "@/types";
import { generateText } from "@/lib/ai/client";
import { generateVideo, getVideoStatus } from "@/lib/ai/video-generation";
import { getModel } from "@/config/models";
import { logger } from "@/lib/logger";

/**
 * Handler for /video command.
 *
 * Parameters:
 *   Topic / T    - Video topic or concept (required)
 *   Duration / D - Length in seconds (default: 60)
 *   Platform / P - Target platform (YouTube, Instagram, TikTok)
 *   Tone         - Video tone/style
 *   Mode / M     - "prompt" or "generate" (default: prompt)
 *   Action       - "generate" or "status" (for checking task progress)
 *   TaskId       - Task ID to check status of a running generation
 *
 * @example
 * /video
 * Topic: Product launch trailer
 * Mode: generate
 * Duration: 10
 */
export async function videoHandler(
  command: ParsedCommand,
): Promise<ApiResponse<unknown>> {
  const options = command.options;

  const topic = options["topic"] || options["t"];
  if (!topic) {
    return {
      success: false,
      message:
        "Please provide a topic for the video.\n\n" +
        "Usage:\n" +
        "<b>Generate prompt</b>:\n" +
        "/video\nTopic: Product launch\nDuration: 30\n\n" +
        "<b>Generate actual video</b>:\n" +
        "/video\nTopic: Product launch trailer\nMode: generate",
      data: null,
      error: {
        code: "MISSING_TOPIC",
        message: "Topic is required",
      },
    };
  }

  const mode = (options["mode"] || options["m"] || "prompt").toLowerCase();
  const duration = parseInt(options["duration"] || options["d"] || "60", 10);
  const platform = options["platform"] || options["p"];
  const tone = options["tone"];
  const action = (options["action"] || "generate").toLowerCase();
  const taskId = options["taskid"] || options["task"];

  const startTime = Date.now();

  // ----- Check status of an existing generation -----
  if (action === "status" && taskId) {
    try {
      const status = await getVideoStatus(taskId);

      const statusMessages: Record<string, string> = {
        pending: "⏳ Your video is queued...",
        processing: "🎬 Your video is being generated...",
        completed: "✅ Your video is ready!",
        failed: "❌ Video generation failed.",
      };

      return {
        success: status.status !== "failed",
        message: [
          `<b>🎬 Video Generation Status</b>`,
          "",
          `${statusMessages[status.status] || "Unknown status"}`,
          status.videoUrl ? `\n<b>Video URL:</b> ${status.videoUrl}` : "",
          status.progress ? `\n<b>Progress:</b> ${status.progress}%` : "",
          status.error ? `\n<b>Error:</b> ${status.error}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        data: {
          mode: "generate",
          action: "status",
          taskId,
          status: status.status,
          videoUrl: status.videoUrl || null,
          progress: status.progress || 0,
        },
        error: status.error
          ? { code: "VIDEO_ERROR", message: status.error }
          : null,
      };
    } catch (err) {
      return {
        success: false,
        message: `Failed to check video status: ${err instanceof Error ? err.message : "Unknown error"}`,
        data: null,
        error: {
          code: "STATUS_ERROR",
          message: err instanceof Error ? err.message : "Unknown error",
        },
      };
    }
  }

  // ----- MODE: GENERATE (actual video via Runway) -----
  if (mode === "generate") {
    // Check if we have the Runway API key configured
    if (!process.env.RUNWAY_API_KEY) {
      return {
        success: false,
        message:
          "⚠️ Video generation requires a Runway API key.\n\n" +
          "Set <code>RUNWAY_API_KEY</code> in your environment variables.\n" +
          "Get a key at: https://runwayml.com\n\n" +
          "In the meantime, use <b>Mode: prompt</b> to generate video production briefs:\n" +
          "/video\nTopic: Product launch\nMode: prompt",
        data: null,
        error: {
          code: "CONFIG_ERROR",
          message:
            "RUNWAY_API_KEY is not configured. Set it to enable video generation.",
        },
      };
    }

    try {
      const result = await generateVideo(topic, {
        duration: Math.min(duration, 10), // Runway has duration limits
        aspectRatio:
          platform === "youtube" || platform === "facebook"
            ? "16:9"
            : platform === "instagram" || platform === "tiktok"
              ? "9:16"
              : "16:9",
      });

      const executionTime = Date.now() - startTime;

      logger.log({
        userId: "telegram",
        command: "video",
        executionTimeMs: executionTime,
        tokens: 0,
        model: result.model,
        costEstimate: result.cost,
        status: "success",
      });

      const isComplete = result.status === "completed";

      const formattedMessage = [
        `<b>🎬 Video Generation</b>`,
        "",
        `<b>Topic:</b> ${topic}`,
        `<b>Duration:</b> ${duration}s`,
        platform ? `<b>Platform:</b> ${platform}` : "",
        `<b>Status:</b> ${isComplete ? "✅ Complete" : "⏳ Processing"}`,
        "",
        isComplete
          ? `<b>Video URL:</b> ${result.videoUrl}`
          : `<b>Task ID:</b> ${result.taskId}`,
        "",
        isComplete
          ? `<i>🎉 Your video is ready!</i>`
          : `<i>⏱️ Videos take 1-5 minutes to generate. Check status with:</i>` +
            `\n<code>/video\nMode: generate\nAction: status\nTaskId: ${result.taskId}</code>`,
      ]
        .filter(Boolean)
        .join("\n");

      return {
        success: true,
        message: formattedMessage,
        data: {
          mode: "generate",
          action: "generate",
          topic,
          duration,
          platform: platform || "",
          taskId: result.taskId,
          status: result.status,
          videoUrl: result.videoUrl || null,
          cost: result.cost,
        },
        error: null,
      };
    } catch (genError) {
      const message =
        genError instanceof Error ? genError.message : "Video generation failed";

      return {
        success: false,
        message: `❌ Video generation failed: ${message}`,
        data: null,
        error: { code: "GENERATION_ERROR", message },
      };
    }
  }

  // ----- MODE: PROMPT (default - generate video production brief) -----
  const systemPrompt = `You are an expert video content strategist and prompt engineer.
You create detailed video production briefs optimized for AI video generation tools like Veo.
Include creative direction, technical specifications, and production notes.`;

  const promptText = `Create a comprehensive video production brief for:

Topic: ${topic}
Target Duration: ${duration} seconds
${platform ? `Platform: ${platform}` : ""}
${tone ? `Tone: ${tone}` : ""}

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

  const executionTime = Date.now() - startTime;

  logger.log({
    userId: "telegram",
    command: "video",
    executionTimeMs: executionTime,
    tokens: response.usage.totalTokens,
    model: response.model,
    costEstimate: response.costEstimate,
    status: "success",
  });

  const formattedMessage = [
    `<b>🎬 Video Production Brief</b>`,
    "",
    `<b>Topic:</b> ${topic}`,
    `<b>Duration:</b> ${duration}s`,
    platform ? `<b>Platform:</b> ${platform}` : "",
    tone ? `<b>Tone:</b> ${tone}` : "",
    "",
    response.content,
    "",
    `<i>✨ To generate an actual video, add:</i>`,
    `<code>Mode: generate</code>`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    success: true,
    message: formattedMessage,
    data: {
      mode: "prompt",
      topic,
      duration,
      platform: platform || "",
      raw: response.content,
    },
    error: null,
  };
}
