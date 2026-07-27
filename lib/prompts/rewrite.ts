/**
 * Prompt templates for content rewriting and summarization.
 */

/**
 * Build a system prompt for content rewriting.
 */
export function getRewriteSystemPrompt(): string {
  return `You are an expert content editor who can rewrite content for any platform, tone, or audience.
You preserve the original meaning while optimizing for the target context.

Rules:
- Maintain the core message and key points
- Adapt tone, style, and length to requirements
- Preserve any brand voice elements
- Improve clarity and impact where possible`;
}

/**
 * Build a prompt for rewriting content.
 */
export function buildRewritePrompt(
  content: string,
  instructions: string,
): string {
  return `Rewrite the following content according to these instructions: ${instructions}

Original content:
---
${content}
---

Rewrite the content following the instructions above.`;
}

/**
 * Build a prompt for summarizing content.
 */
export function buildSummarizePrompt(
  content: string,
  maxWords?: number,
): string {
  return `Summarize the following content${maxWords ? ` in ${maxWords} words or less` : ""}:

${content}

Provide a clear, concise summary that captures the key points.`;
}

/**
 * Build a prompt for extracting key points.
 */
export function buildKeyPointsPrompt(content: string): string {
  return `Extract the key points from the following content. Return them as a bulleted list:

${content}`;
}

/**
 * Build a prompt for expanding content.
 */
export function buildExpandPrompt(
  content: string,
  targetLength: string,
): string {
  return `Expand the following content to ${targetLength}:

${content}

Add relevant details, examples, and explanations while maintaining the original message.`;
}
