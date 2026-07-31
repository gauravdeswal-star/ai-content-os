/**
 * Handler for the /image command.
 * Supports two modes:
 *   - "prompt" (default): Generates optimized text prompts for AI image tools
 *   - "generate": Generates actual images using OpenRouter Image API
 */

import type { ParsedCommand, ApiResponse } from "@/types";
import { generateText } from "@/lib/ai/client";
import { generateImage, IMAGE_MODELS } from "@/lib/ai/image-generation";
import { getModel } from "@/config/models";
import { logger } from "@/lib/logger";

/**
 * Handler for /image command.
 *
 * Parameters:
 *   Prompt / P    - Description of the image (required)
 *   Style / S     - Art style (cinematic, anime, realistic, etc.)
 *   Ratio / R     - Aspect ratio (1:1, 16:9, 9:16, 4:3, 4:5)
 *   Negative / Neg - Things to avoid
 *   Mode / M      - "prompt" or "generate" (default: prompt)
 *   Model         - Image model (for generate mode): flux, flux-pro, seedream, gpt
 *   Provider / P  - Image provider: "openrouter" (default) or "cloudflare" (free)
 *   Count / N     - Number of images (for generate mode, 1-4)
 *
 * @example
 * /image
 * Prompt: A futuristic city with neon lights
 * Mode: generate
 * Style: Cyberpunk
 * Ratio: 16:9
 * Provider: cloudflare
 */
export async function imageHandler(
  command: ParsedCommand,
): Promise<ApiResponse<unknown>> {
  const options = command.options;

  const prompt = options["prompt"] || options["p"];
  if (!prompt) {
    return {
      success: false,
      message:
        "Please provide a description for the image.\n\n" +
        "Usage:\n" +
        "<b>Generate prompt</b>:\n" +
        "/image\nPrompt: A futuristic cityscape\nStyle: Cinematic\n\n" +
        "<b>Generate actual image</b>:\n" +
        "/image\nPrompt: A futuristic city with neon lights\nMode: generate\nStyle: Cyberpunk",
      data: null,
      error: {
        code: "MISSING_PROMPT",
        message: "Prompt is required",
      },
    };
  }

  const mode = (options["mode"] || options["m"] || "generate").toLowerCase();
  const style = options["style"] || options["s"];
  const aspectRatio =
    options["ratio"] || options["r"] || options["aspectratio"] || "1:1";
  const negativePrompt = options["negative"] || options["neg"] || options["avoid"];
  const imageModel = options["model"];
  const count = Math.min(parseInt(options["count"] || options["n"] || "2", 10) || 2, 2);
  // Default to Hugging Face (free tier via HUGGINGFACE_API_KEY)
  // Use openrouter only if explicitly requested
  const rawProvider = (options["provider"] || options["p"] || "huggingface").toLowerCase();
  // Map common variations
  const provider =
    rawProvider === "openrouter" || rawProvider === "or"
      ? "openrouter"
      : "huggingface";

  const startTime = Date.now();

  // ----- MODE: GENERATE (actual image) -----
  if (mode === "generate") {
    try {
      const modelMap: Record<string, string> = {
        flux: IMAGE_MODELS.hfFluxSchnell,
        "flux-schnell": IMAGE_MODELS.hfFluxSchnell,
        "flux-dev": IMAGE_MODELS.hfSd35Large,
        "flux-pro": IMAGE_MODELS.flux2Pro,
        "flux-flex": IMAGE_MODELS.flux2Flex,
        "flux-klein": IMAGE_MODELS.flux2Klein,
        seedream: IMAGE_MODELS.seedream,
        gpt: IMAGE_MODELS.gptImage,
        gemini: IMAGE_MODELS.geminiFlash,
        recraft: IMAGE_MODELS.recraft,
      };

      // Default model depends on the provider:
      // Hugging Face uses FLUX.1-schnell, OpenRouter uses flux.2-klein-4b
      const defaultModel =
        provider === "openrouter"
          ? IMAGE_MODELS.flux2Klein
          : IMAGE_MODELS.hfFluxSchnell;

      const selectedModel = imageModel
        ? modelMap[imageModel.toLowerCase()] || imageModel
        : defaultModel;

      // Build a detailed prompt for better image generation
      const detailedPrompt = [
        prompt,
        style ? `Style: ${style}` : "",
        negativePrompt ? `Avoid: ${negativePrompt}` : "",
      ]
        .filter(Boolean)
        .join(". ");

      const result = await generateImage(detailedPrompt, {
        model: selectedModel,
        aspectRatio,
        n: count,
        provider: provider as "huggingface" | "openrouter",
      });

      const executionTime = Date.now() - startTime;

      logger.log({
        userId: "telegram",
        command: "image",
        executionTimeMs: executionTime,
        tokens: result.usage.totalTokens,
        model: result.model,
        costEstimate: result.usage.cost,
        status: "success",
      });

      const modelName = Object.entries(modelMap).find(
        ([, v]) => v === result.model,
      )?.[0] || result.model;

      const formattedMessage = [
        `<b>🖼️ Image Generated</b>`,
        "",
        `<b>Prompt:</b> ${prompt}`,
        `<b>Model:</b> ${modelName}`,
        `<b>Aspect Ratio:</b> ${aspectRatio}`,
        style ? `<b>Style:</b> ${style}` : "",
        `<b>Cost:</b> $${result.usage.cost.toFixed(4)}`,
        "",
        `<i>✅ Image generated successfully!</i>`,
        "",
        `<b>💡 Tip:</b> The image is available as base64 data. ` +
        `Use the API directly to download it, or send it via a web interface.`,
      ]
        .filter(Boolean)
        .join("\n");

      return {
        success: true,
        message: formattedMessage,
        data: {
          mode: "generate",
          originalPrompt: prompt,
          b64Json: result.b64Json,
          mediaType: result.mediaType,
          model: result.model,
          aspectRatio,
          style: style || "",
          cost: result.usage.cost,
        },
        error: null,
      };
    } catch (genError) {
      const message =
        genError instanceof Error ? genError.message : "Image generation failed";

      // Helpful error for missing config
      if (message.includes("OPENROUTER_API_KEY")) {
        return {
          success: false,
          message:
            "⚠️ Image generation requires a valid OpenRouter API key.\n\n" +
            "Use <b>Mode: prompt</b> to generate text prompts instead:\n" +
            "/image\nPrompt: A futuristic city\nMode: prompt",
          data: null,
          error: { code: "CONFIG_ERROR", message },
        };
      }

      return {
        success: false,
        message: `❌ Image generation failed: ${message}`,
        data: null,
        error: { code: "GENERATION_ERROR", message },
      };
    }
  }

  // ----- MODE: PROMPT (default - generate text prompt) -----
  const systemPrompt = `You are an expert AI image prompt engineer.
Create detailed, optimized prompts for AI image generation.
Include style, lighting, composition, mood, and color palette details.
Adapt the prompt for the specified aspect ratio and style.`;

  const promptText = `Create an optimized image generation prompt for:

Subject: ${prompt}
${negativePrompt ? `Avoid: ${negativePrompt}` : ""}
Aspect Ratio: ${aspectRatio}
${style ? `Style: ${style}` : ""}

Return a COMPLETE, detailed prompt (150-250 words) optimized for Midjourney / DALL-E / Stable Diffusion.
Include: subject details, lighting, color palette, composition, mood/atmosphere, and technical specifications.`;

  const response = await generateText(promptText, {
    model: getModel("imagePrompt"),
    systemPrompt,
  });

  const executionTime = Date.now() - startTime;

  logger.log({
    userId: "telegram",
    command: "image",
    executionTimeMs: executionTime,
    tokens: response.usage.totalTokens,
    model: response.model,
    costEstimate: response.costEstimate,
    status: "success",
  });

  const formattedMessage = [
    `<b>🎨 Image Prompt Generated</b>`,
    "",
    `<b>Subject:</b> ${prompt}`,
    `<b>Style:</b> ${style || "Not specified"}`,
    `<b>Aspect Ratio:</b> ${aspectRatio}`,
    negativePrompt ? `<b>Avoid:</b> ${negativePrompt}` : "",
    "",
    `<b>Optimized Prompt:</b>`,
    "",
    `<code>${response.content}</code>`,
    "",
    `<i>💡 Use this prompt with Midjourney, DALL-E, Stable Diffusion, or any AI image generator.</i>`,
    "",
    `<i>✨ To generate an actual image, add:</i>`,
    `<code>Mode: generate</code>`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    success: true,
    message: formattedMessage,
    data: {
      mode: "prompt",
      originalPrompt: prompt,
      optimizedPrompt: response.content,
      negativePrompt: negativePrompt || "",
      aspectRatio,
      style: style || "",
    },
    error: null,
  };
}
