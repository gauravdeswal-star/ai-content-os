/**
 * Social Media Publisher abstraction layer.
 * Each platform implements the Publisher interface.
 * Makes it easy to add new platforms by implementing the interface.
 */

import type { SocialPlatform, PublishResult } from "@/types";
import axios from "axios";

// ============================================================================
// Publisher Interface
// ============================================================================

export interface Publisher {
  /** The platform this publisher handles */
  platform: SocialPlatform;

  /**
   * Publish content to the platform.
   * @param content - The text/content to publish
   * @param mediaUrls - Optional URLs of media attachments
   * @returns The platform-specific post ID if successful
   */
  publish(content: string, mediaUrls?: string[]): Promise<{ postId: string }>;

  /**
   * Schedule content for future publication.
   * @param content - The text/content to publish
   * @param scheduledAt - ISO date string for when to publish
   * @param mediaUrls - Optional URLs of media attachments
   */
  schedule(
    content: string,
    scheduledAt: string,
    mediaUrls?: string[],
  ): Promise<{ postId: string }>;

  /**
   * Delete a previously published post.
   * @param postId - The platform-specific post ID
   */
  delete(postId: string): Promise<void>;

  /**
   * Get the status of a post.
   * @param postId - The platform-specific post ID
   */
  status(postId: string): Promise<{
    status: "published" | "scheduled" | "failed" | "deleted";
    publishedAt?: string;
    engagement?: { likes: number; comments: number; shares: number };
  }>;
}

// ============================================================================
// Instagram Publisher
// ============================================================================

class InstagramPublisher implements Publisher {
  platform: SocialPlatform = "instagram";

  async publish(
    _content: string,
    _mediaUrls?: string[],
  ): Promise<{ postId: string }> {
    // TODO: Implement Instagram Graph API integration
    console.log("[Instagram] Publishing content...");
    throw new Error("Instagram publishing not yet implemented. Requires Instagram Business Account and access token.");
  }

  async schedule(
    _content: string,
    _scheduledAt: string,
    _mediaUrls?: string[],
  ): Promise<{ postId: string }> {
    throw new Error("Instagram scheduling not yet implemented.");
  }

  async delete(_postId: string): Promise<void> {
    throw new Error("Instagram delete not yet implemented.");
  }

  async status(_postId: string): Promise<{
    status: "published" | "scheduled" | "failed" | "deleted";
    publishedAt?: string;
    engagement?: { likes: number; comments: number; shares: number };
  }> {
    throw new Error("Instagram status check not yet implemented.");
  }
}

// ============================================================================
// LinkedIn Publisher
// ============================================================================

class LinkedInPublisher implements Publisher {
  platform: SocialPlatform = "linkedin";

  async publish(
    content: string,
    _mediaUrls?: string[],
  ): Promise<{ postId: string }> {
    try {
      const token = process.env.LINKEDIN_ACCESS_TOKEN;
      if (!token) throw new Error("LinkedIn access token not configured");

      const response = await axios.post(
        "https://api.linkedin.com/v2/ugcPosts",
        {
          author: `urn:li:person:${process.env.LINKEDIN_USER_ID}`,
          lifecycleState: "PUBLISHED",
          specificContent: {
            "com.linkedin.ugc.ShareContent": {
              shareCommentary: {
                text: content,
              },
              shareMediaCategory: "NONE",
            },
          },
          visibility: {
            "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Restli-Protocol-Version": "2.0.0",
          },
        },
      );

      return { postId: response.data.id };
    } catch (error) {
      console.error("[LinkedIn] Publish error:", error);
      throw new Error("Failed to publish to LinkedIn");
    }
  }

  async schedule(
    _content: string,
    _scheduledAt: string,
    _mediaUrls?: string[],
  ): Promise<{ postId: string }> {
    throw new Error("LinkedIn scheduling not yet implemented.");
  }

  async delete(_postId: string): Promise<void> {
    throw new Error("LinkedIn delete not yet implemented.");
  }

  async status(_postId: string): Promise<{
    status: "published" | "scheduled" | "failed" | "deleted";
    publishedAt?: string;
    engagement?: { likes: number; comments: number; shares: number };
  }> {
    throw new Error("LinkedIn status check not yet implemented.");
  }
}

// ============================================================================
// Facebook Publisher
// ============================================================================

class FacebookPublisher implements Publisher {
  platform: SocialPlatform = "facebook";

  async publish(
    content: string,
    _mediaUrls?: string[],
  ): Promise<{ postId: string }> {
    try {
      const token = process.env.FACEBOOK_ACCESS_TOKEN;
      if (!token) throw new Error("Facebook access token not configured");

      const response = await axios.post(
        `https://graph.facebook.com/v22.0/me/feed`,
        {
          message: content,
          access_token: token,
        },
      );

      return { postId: response.data.id };
    } catch (error) {
      console.error("[Facebook] Publish error:", error);
      throw new Error("Failed to publish to Facebook");
    }
  }

  async schedule(
    _content: string,
    _scheduledAt: string,
    _mediaUrls?: string[],
  ): Promise<{ postId: string }> {
    throw new Error("Facebook scheduling not yet implemented.");
  }

  async delete(_postId: string): Promise<void> {
    throw new Error("Facebook delete not yet implemented.");
  }

  async status(_postId: string): Promise<{
    status: "published" | "scheduled" | "failed" | "deleted";
    publishedAt?: string;
    engagement?: { likes: number; comments: number; shares: number };
  }> {
    throw new Error("Facebook status check not yet implemented.");
  }
}

// ============================================================================
// X (Twitter) Publisher
// ============================================================================

class XPublisher implements Publisher {
  platform: SocialPlatform = "x";

  async publish(
    content: string,
    _mediaUrls?: string[],
  ): Promise<{ postId: string }> {
    try {
      const token = process.env.X_ACCESS_TOKEN;
      if (!token) throw new Error("X (Twitter) access token not configured");

      const response = await axios.post(
        "https://api.twitter.com/2/tweets",
        { text: content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      return { postId: response.data.data.id };
    } catch (error) {
      console.error("[X] Publish error:", error);
      throw new Error("Failed to publish to X");
    }
  }

  async schedule(
    _content: string,
    _scheduledAt: string,
    _mediaUrls?: string[],
  ): Promise<{ postId: string }> {
    throw new Error("X scheduling not yet implemented.");
  }

  async delete(_postId: string): Promise<void> {
    throw new Error("X delete not yet implemented.");
  }

  async status(_postId: string): Promise<{
    status: "published" | "scheduled" | "failed" | "deleted";
    publishedAt?: string;
    engagement?: { likes: number; comments: number; shares: number };
  }> {
    throw new Error("X status check not yet implemented.");
  }
}

// ============================================================================
// Publisher Registry
// ============================================================================

/**
 * Map of platform publishers.
 * New publishers can be added here without modifying other code.
 */
const publisherRegistry: Partial<Record<SocialPlatform, Publisher>> = {
  instagram: new InstagramPublisher(),
  linkedin: new LinkedInPublisher(),
  facebook: new FacebookPublisher(),
  x: new XPublisher(),
};

/**
 * Get a publisher for a specific platform.
 */
export function getPublisher(platform: SocialPlatform): Publisher {
  const publisher = publisherRegistry[platform];
  if (!publisher) {
    throw new Error(`No publisher registered for platform: ${platform}`);
  }
  return publisher;
}

/**
 * Publish content to multiple platforms.
 */
export async function publishToPlatforms(
  content: string,
  platforms: SocialPlatform[],
  mediaUrls?: string[],
): Promise<PublishResult> {
  const results: PublishResult["platformResults"] = [];

  for (const platform of platforms) {
    try {
      const publisher = getPublisher(platform);
      const result = await publisher.publish(content, mediaUrls);
      results.push({
        platform,
        success: true,
        postId: result.postId,
      });
    } catch (error) {
      results.push({
        platform,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return { platformResults: results };
}
