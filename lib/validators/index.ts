/**
 * Zod validation schemas for all AI Content OS commands and inputs.
 */

import { z } from "zod";

// ============================================================================
// Shared Schemas
// ============================================================================

const platformSchema = z
  .enum(["instagram", "linkedin", "facebook", "x", "threads", "youtube", "tiktok"])
  .or(z.string());

const toneSchema = z
  .enum([
    "conversational",
    "professional",
    "funny",
    "inspirational",
    "educational",
    "controversial",
    "storytelling",
    "casual",
  ])
  .or(z.string());

// ============================================================================
// Script Command
// ============================================================================

export const scriptSchema = z.object({
  topic: z
    .string()
    .min(1, "Topic is required")
    .max(500, "Topic must be under 500 characters"),
  platform: platformSchema,
  duration: z.coerce.number().min(5).max(600).optional(),
  tone: toneSchema.optional(),
  language: z.string().min(2).max(10).optional(),
  targetAudience: z.string().max(200).optional(),
});

export type ScriptInput = z.infer<typeof scriptSchema>;

// ============================================================================
// Hashtags Command
// ============================================================================

export const hashtagsSchema = z.object({
  topic: z
    .string()
    .min(1, "Topic is required")
    .max(200, "Topic must be under 200 characters"),
  count: z.coerce.number().min(5).max(50).optional().default(30),
  language: z.string().min(2).max(10).optional(),
});

export type HashtagsInput = z.infer<typeof hashtagsSchema>;

// ============================================================================
// Caption Command
// ============================================================================

export const captionSchema = z.object({
  topic: z
    .string()
    .min(1, "Topic is required")
    .max(500, "Topic must be under 500 characters"),
  platform: platformSchema,
  tone: toneSchema.optional(),
  includeHashtags: z
    .enum(["yes", "no", "true", "false"])
    .transform((v) => v === "yes" || v === "true")
    .optional()
    .default(true),
  includeEmojis: z
    .enum(["yes", "no", "true", "false"])
    .transform((v) => v === "yes" || v === "true")
    .optional()
    .default(true),
  includeSeo: z
    .enum(["yes", "no", "true", "false"])
    .transform((v) => v === "yes" || v === "true")
    .optional()
    .default(false),
  cta: z.string().max(200).optional(),
});

export type CaptionInput = z.infer<typeof captionSchema>;

// ============================================================================
// Carousel Command
// ============================================================================

export const carouselSchema = z.object({
  topic: z
    .string()
    .min(1, "Topic is required")
    .max(500, "Topic must be under 500 characters"),
  slideCount: z.coerce.number().min(2).max(20).optional().default(5),
  platform: platformSchema.optional(),
  tone: toneSchema.optional(),
  includeCta: z
    .enum(["yes", "no", "true", "false"])
    .transform((v) => v === "yes" || v === "true")
    .optional()
    .default(true),
});

export type CarouselInput = z.infer<typeof carouselSchema>;

// ============================================================================
// Image Command
// ============================================================================

const aspectRatioSchema = z
  .enum(["1:1", "4:5", "9:16", "16:9", "4:3", "3:2"])
  .or(z.string());

const modeSchema = z.enum(["prompt", "generate"]).or(z.string());

export const imageSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt is required")
    .max(1000, "Prompt must be under 1000 characters"),
  negativePrompt: z.string().max(500).optional(),
  aspectRatio: aspectRatioSchema.optional().default("1:1"),
  style: z.string().max(100).optional(),
  platform: platformSchema.optional(),
  mode: modeSchema.optional().default("prompt"),
  model: z.string().max(100).optional(),
  provider: z.enum(["huggingface", "openrouter"]).or(z.string()).optional().default("huggingface"),
  count: z.coerce.number().min(1).max(4).optional().default(1),
});

export type ImageInput = z.infer<typeof imageSchema>;

// ============================================================================
// Video Command
// ============================================================================

export const videoSchema = z.object({
  topic: z
    .string()
    .min(1, "Topic is required")
    .max(500, "Topic must be under 500 characters"),
  duration: z.coerce.number().min(5).max(600).optional().default(60),
  platform: platformSchema.optional(),
  tone: toneSchema.optional(),
  mode: modeSchema.optional().default("prompt"),
  action: z.enum(["generate", "status"]).or(z.string()).optional().default("generate"),
  taskId: z.string().optional(),
});

export type VideoInput = z.infer<typeof videoSchema>;

// ============================================================================
// Voice Command
// ============================================================================

export const voiceSchema = z.object({
  script: z
    .string()
    .min(1, "Script is required")
    .max(5000, "Script must be under 5000 characters"),
  language: z.string().min(2).max(10).optional().default("en"),
  voiceStyle: z.string().max(100).optional(),
});

export type VoiceInput = z.infer<typeof voiceSchema>;

// ============================================================================
// Publish Command
// ============================================================================

export const publishSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Content must be under 5000 characters"),
  platforms: z
    .array(platformSchema)
    .min(1, "At least one platform is required")
    .max(5, "Maximum 5 platforms"),
  mediaUrls: z.array(z.string().url()).optional(),
  scheduledAt: z.string().datetime().optional(),
});

export type PublishInput = z.infer<typeof publishSchema>;

// ============================================================================
// Schedule Command
// ============================================================================

export const scheduleSchema = z.object({
  content: z
    .string()
    .min(1, "Content is required")
    .max(5000, "Content must be under 5000 characters"),
  platforms: z
    .array(platformSchema)
    .min(1, "At least one platform is required")
    .max(5, "Maximum 5 platforms"),
  scheduledAt: z
    .string()
    .min(1, "Scheduled time is required")
    .refine(
      (val) => !isNaN(Date.parse(val)),
      "Invalid date/time format",
    ),
  timezone: z.string().optional(),
});

export type ScheduleInput = z.infer<typeof scheduleSchema>;

// ============================================================================
// Telegram Webhook
// ============================================================================

export const telegramUpdateSchema = z.object({
  update_id: z.number(),
  message: z
    .object({
      message_id: z.number(),
      from: z.object({
        id: z.number(),
        is_bot: z.boolean(),
        first_name: z.string(),
        last_name: z.string().optional(),
        username: z.string().optional(),
        language_code: z.string().optional(),
      }),
      chat: z.object({
        id: z.number(),
        type: z.enum(["private", "group", "supergroup", "channel"]),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        username: z.string().optional(),
      }),
      date: z.number(),
      text: z.string().optional(),
      photo: z
        .array(
          z.object({
            file_id: z.string(),
            file_unique_id: z.string(),
            file_size: z.number().optional(),
            width: z.number().optional(),
            height: z.number().optional(),
          }),
        )
        .optional(),
      document: z
        .object({
          file_id: z.string(),
          file_unique_id: z.string(),
          mime_type: z.string().optional(),
          file_size: z.number().optional(),
          file_name: z.string().optional(),
        })
        .optional(),
      voice: z
        .object({
          file_id: z.string(),
          file_unique_id: z.string(),
          duration: z.number(),
          mime_type: z.string().optional(),
          file_size: z.number().optional(),
        })
        .optional(),
      video: z
        .object({
          file_id: z.string(),
          file_unique_id: z.string(),
          width: z.number().optional(),
          height: z.number().optional(),
          duration: z.number().optional(),
          mime_type: z.string().optional(),
          file_size: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
});

export type TelegramUpdate = z.infer<typeof telegramUpdateSchema>;
