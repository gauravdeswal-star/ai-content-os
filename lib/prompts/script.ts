/**
 * Prompt templates for script generation.
 * Each platform has tailored prompts optimized for its format.
 */

import type { ScriptParams } from "@/types";

/**
 * Build the system prompt for script generation.
 */
export function getScriptSystemPrompt(): string {
  return `You are an expert content scriptwriter specializing in social media content. 
You write engaging, platform-optimized scripts that capture attention and drive conversions.

Rules:
- Write in a natural, conversational tone unless instructed otherwise
- Include hooks, body, and calls to action
- Optimize for the specified platform's best practices
- Consider pacing, pauses, and visual cues for video content
- Return the script in a clean, well-formatted structure`;
}

/**
 * Build the user prompt for script generation.
 */
export function buildScriptPrompt(params: ScriptParams): string {
  const lines: string[] = [
    `Create a ${params.platform} script about: "${params.topic}"`,
  ];

  if (params.duration) {
    lines.push(`Target duration: ${params.duration} seconds`);
  }

  if (params.tone) {
    lines.push(`Tone: ${params.tone}`);
  }

  if (params.language) {
    lines.push(`Language: ${params.language}`);
  }

  if (params.targetAudience) {
    lines.push(`Target audience: ${params.targetAudience}`);
  }

  lines.push("");
  lines.push(getPlatformInstructions(params.platform));
  lines.push("");
  lines.push(`Format the response as:

**Title:** [Script title]

**Hook:** [Opening hook - first 3-5 seconds]

**Body:**
[Main script body with scene descriptions in brackets]

**Key Points:**
- [Point 1]
- [Point 2]
- [Point 3]

**Call to Action:** [CTA]

**Estimated Duration:** [X seconds]`);

  return lines.join("\n");
}

/**
 * Get platform-specific instructions.
 */
function getPlatformInstructions(platform: string): string {
  const instructions: Record<string, string> = {
    instagram: `Platform: Instagram Reel
- Hook in the first 3 seconds
- Fast-paced, trending audio
- Text overlays for accessibility
- 15-60 seconds optimal
- End with strong CTA to profile link`,
    youtube: `Platform: YouTube
- Strong intro in first 5 seconds
- Clear structure with chapters
- Mid-roll engagement hooks
- 1-15 minutes optimal
- End screen with subscribe CTA`,
    linkedin: `Platform: LinkedIn
- Professional but personal tone
- Start with a relatable observation
- Use storytelling to illustrate points
- 3-5 minute read optimal
- End with a question to drive comments`,
    twitter: `Platform: X (Twitter) Thread
- First tweet must grab attention
- Each tweet self-contained
- Number tweets for easy reading
- 5-15 tweets per thread
- End with retweet/like CTA`,
    facebook: `Platform: Facebook
- Hook in first line (above the fold)
- Conversational, authentic tone
- Include personal experience
- 100-300 words optimal
- End with comment engagement question`,
    threads: `Platform: Threads
- Casual, authentic voice
- Short, punchy sentences
- 2-5 paragraphs
- Use line breaks generously
- End with a thought-provoking question`,
    tiktok: `Platform: TikTok
- First 2 seconds MUST hook
- Trending sounds/effects suggested
- Text overlays throughout
- 15-30 seconds optimal
- Fast cuts and transitions`,
  };

  return (
    instructions[platform.toLowerCase()] ||
    `Platform: ${platform}
- Hook early and often
- Clear, concise messaging
- Optimize for the platform's format`
  );
}
