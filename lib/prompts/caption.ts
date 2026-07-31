/**
 * Prompt templates for caption generation.
 */

import type { CaptionParams } from "@/types";

/**
 * Build the system prompt for caption generation.
 */
export function getCaptionSystemPrompt(): string {
  return `You are an expert social media copywriter who creates high-engagement, viral-ready captions.
You understand platform-specific best practices, hook structures, trending keywords, and conversion optimization.

Rules:
- Write hooks that stop the scroll
- Use power words, emotional triggers, and curiosity gaps
- Weave in VIRAL KEYWORDS (high-volume, trending, searchable terms) naturally so the post gets discovered
- Adapt length and style to the platform
- Include strategic line breaks for readability
- End with a clear call to action
- Always include a dedicated "Viral Keywords" section listing the strongest keywords used`;
}

/**
 * Build the user prompt for caption generation.
 */
export function buildCaptionPrompt(params: CaptionParams): string {
  const lines: string[] = [];

  lines.push(`Create an engaging ${params.platform} caption about: "${params.topic}"`);

  if (params.tone) {
    lines.push(`Tone: ${params.tone}`);
  }

  if (params.cta) {
    lines.push(`Desired Call to Action: ${params.cta}`);
  }

  const features: string[] = [];
  if (params.includeEmojis) features.push("✅ Include relevant emojis");
  else features.push("❌ No emojis");
  if (params.includeHashtags) features.push("✅ Include 10-15 relevant hashtags");
  else features.push("❌ No hashtags");
  if (params.includeSeo) features.push("✅ Include SEO keywords naturally");
  else features.push("❌ No SEO keywords");
  if (params.includeViralKeywords !== false)
    features.push("✅ Include 10-12 VIRAL keywords (trending, high-volume, emotional power words) woven naturally into the copy");
  else features.push("❌ No viral keywords");

  lines.push("");
  lines.push("Features:");
  lines.push(features.join("\n"));

  lines.push("");
  lines.push(`Format the response as:

**Hook:** [Attention-grabbing opening line]

**Body:**
[2-3 paragraphs of engaging content that naturally weaves in viral keywords]

**Call to Action:** [Clear CTA]

**Viral Keywords:**
[10-12 comma-separated viral keywords + power words used in the caption]

**Hashtags:**
[Relevant hashtags]

**SEO Keywords:**
[Target keywords if applicable]`);

  return lines.join("\n");
}
