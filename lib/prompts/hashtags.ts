/**
 * Prompt templates for hashtag generation.
 */

import type { HashtagParams } from "@/types";

/**
 * Build the system prompt for hashtag generation.
 */
export function getHashtagSystemPrompt(): string {
  return `You are an expert social media hashtag strategist.
You know exactly which hashtags drive engagement, reach, and conversions on each platform.

Rules:
- Generate hashtags across different competition levels
- Include a mix of broad and niche tags
- Ensure hashtags are relevant and currently trending where possible
- Group hashtags by competition level for strategic use
- Avoid banned or shadowbanned hashtags`;
}

/**
 * Build the user prompt for hashtag generation.
 */
export function buildHashtagPrompt(params: HashtagParams): string {
  const count = params.count || 30;
  const language = params.language || "en";

  return `Generate ${count} optimized hashtags for the topic: "${params.topic}"

Language: ${language}

Group the hashtags into 4 categories:

**High Competition** (10 tags - broad, high-volume)
Popular tags with millions of posts. Use 1-2 per post.

**Medium Competition** (10 tags - balanced)
Moderate-volume tags with engaged audiences. Use 3-5 per post.

**Low Competition** (5 tags - specific)
Niche tags with less competition but highly targeted. Use 2-3 per post.

**Niche** (5 tags - hyper-specific)
Very specific tags for the exact topic. Use 2-3 per post.

Format as:
#hashtag1 #hashtag2 #hashtag3

Return them grouped with clear headers.`;
}
