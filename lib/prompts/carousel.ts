/**
 * Prompt templates for carousel/slide content generation.
 */

import type { CarouselParams } from "@/types";

/**
 * Build the system prompt for carousel generation.
 */
export function getCarouselSystemPrompt(): string {
  return `You are an expert content strategist specializing in carousel/slide content.
You create engaging, scroll-stopping carousels that educate, entertain, and convert.

Rules:
- First slide must hook the viewer immediately
- Each slide builds on the previous one
- Slides should be scannable with clear headers
- Include data points, quotes, or stats where relevant
- Final slide should have a clear call to action
- Make it Canva-compatible for easy design`;
}

/**
 * Build the user prompt for carousel generation.
 */
export function buildCarouselPrompt(params: CarouselParams): string {
  const slideCount = params.slideCount || 5;
  const tone = params.tone || "educational";

  return `Create a ${slideCount}-slide carousel about: "${params.topic}"

${params.platform ? `Platform: ${params.platform}` : ""}
Tone: ${tone}
${params.includeCta !== false ? "Include a CTA on the final slide" : "No CTA needed"}

Format the response as a JSON object:

{
  "title": "Carousel title",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Hook title",
      "content": "Main content for this slide",
      "imagePrompt": "Suggested image description for this slide",
      "notes": "Design notes for the creator"
    }
  ],
  "cta": "Final call to action",
  "caption": "Suggested Instagram caption for this carousel"
}

Make sure the JSON is valid and complete.`;
}

/**
 * Build prompt for Canva-compatible carousel JSON export.
 */
export function buildCanvaCarouselPrompt(carouselData: string): string {
  return `Convert the following carousel content into a Canva-compatible JSON format:

${carouselData}

Return a JSON array where each element represents a page/slide with:
- title: string
- subtitle: string (optional)
- body: string
- imagePrompt: string
- backgroundColor: string (hex)
- textColor: string (hex)

Make it ready to import into Canva's bulk create feature.`;
}
