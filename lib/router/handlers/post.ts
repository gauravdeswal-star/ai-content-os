/**
 * Handler for the /post command.
 * Publishes content to connected social media platforms using the publisher abstraction.
 */

import type { ParsedCommand, ApiResponse, SocialPlatform } from "@/types";
import { publishToPlatforms } from "@/lib/social/publishers";
import { logger } from "@/lib/logger";

/**
 * Handler for /post command.
 * Accepts: Content, Platforms (comma-separated), Media URLs (optional).
 *
 * @example
 * /post
 * Content: Check out our new AI-powered content tool!
 * Platforms: linkedin, facebook
 */
export async function postHandler(
  command: ParsedCommand,
): Promise<ApiResponse<unknown>> {
  const options = command.options;

  const content = options["content"] || options["text"] || options["c"];
  if (!content) {
    return {
      success: false,
      message: "Please provide the content to publish.",
      data: null,
      error: {
        code: "MISSING_CONTENT",
        message:
          "Content is required. Use:\n/post\nContent: Your post content\nPlatforms: linkedin, facebook",
      },
    };
  }

  const platformsRaw =
    options["platforms"] || options["platform"] || options["p"] || "";
  if (!platformsRaw) {
    return {
      success: false,
      message: "Please specify at least one platform to publish to.",
      data: null,
      error: {
        code: "MISSING_PLATFORMS",
        message:
          "Platforms are required. Use:\n/post\nContent: Your content\nPlatforms: linkedin, facebook",
      },
    };
  }

  // Parse platforms (comma or space separated)
  const platforms: SocialPlatform[] = platformsRaw
    .split(/[,\s]+/)
    .map((p) => p.trim().toLowerCase() as SocialPlatform)
    .filter((p) =>
      ["instagram", "linkedin", "facebook", "x", "threads", "youtube", "tiktok"].includes(p),
    );

  if (platforms.length === 0) {
    return {
      success: false,
      message: "No valid platforms specified.",
      data: null,
      error: {
        code: "INVALID_PLATFORMS",
        message:
          "Supported platforms: instagram, linkedin, facebook, x, threads, youtube, tiktok",
      },
    };
  }

  // Parse optional media URLs from the Media field or attachments
  const mediaUrlsRaw = options["media"] || options["mediaurls"] || options["m"];
  const mediaUrls = mediaUrlsRaw
    ? mediaUrlsRaw.split(/[,\s]+/).filter((u) => u.startsWith("http"))
    : [];

  // If there are file attachments, note them
  const hasAttachments =
    command.attachments && command.attachments.length > 0;

  const startTime = Date.now();

  try {
    // Attempt to publish
    const publishResult = await publishToPlatforms(
      content,
      platforms,
      mediaUrls.length > 0 ? mediaUrls : undefined,
    );

    const executionTime = Date.now() - startTime;

    logger.log({
      userId: "telegram",
      command: "post",
      executionTimeMs: executionTime,
      tokens: 0,
      model: "publisher",
      costEstimate: 0,
      status: "success",
    });

    // Format results
    const results = publishResult.platformResults
      .map((r) =>
        r.success
          ? `✅ ${r.platform}: Published (ID: ${r.postId})`
          : `❌ ${r.platform}: ${r.error}`,
      )
      .join("\n");

    const formattedMessage = [
      "<b>📤 Publishing Results</b>",
      "",
      results,
      hasAttachments
        ? "\n<i>📎 Attachments detected. Media publishing requires platform-specific API setup.</i>"
        : "",
      "",
      `<b>Content preview:</b> ${content.substring(0, 100)}${content.length > 100 ? "..." : ""}`,
    ]
      .filter(Boolean)
      .join("\n");

    return {
      success: publishResult.platformResults.some((r) => r.success),
      message: formattedMessage,
      data: publishResult,
      error: null,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    logger.log({
      userId: "telegram",
      command: "post",
      executionTimeMs: executionTime,
      tokens: 0,
      model: "publisher",
      costEstimate: 0,
      status: "error",
      error: errorMessage,
    });

    // Check for missing token errors and provide helpful message
    if (errorMessage.includes("not configured") || errorMessage.includes("not yet implemented")) {
      return {
        success: false,
        message: `<b>⚠️ Publishing not fully configured</b>\n\n${errorMessage}\n\nTo enable publishing, set the required access tokens in your environment variables:\n- LINKEDIN_ACCESS_TOKEN\n- FACEBOOK_ACCESS_TOKEN\n- INSTAGRAM_ACCESS_TOKEN\n- X_ACCESS_TOKEN`,
        data: null,
        error: {
          code: "PUBLISHER_NOT_CONFIGURED",
          message: errorMessage,
        },
      };
    }

    return {
      success: false,
      message: "Failed to publish content",
      data: null,
      error: {
        code: "PUBLISH_ERROR",
        message: errorMessage,
      },
    };
  }
}
