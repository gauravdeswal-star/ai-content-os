/**
 * Core type definitions for AI Content OS.
 * All shared types are defined here for consistency across the codebase.
 */

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
}

// ============================================================================
// Command Types
// ============================================================================

export type CommandName =
  | "script"
  | "carousel"
  | "image"
  | "video"
  | "voice"
  | "hashtags"
  | "caption"
  | "post"
  | "schedule"
  | "translate"
  | "help"
  | "start";

export interface ParsedCommand {
  /** The detected command name */
  command: CommandName;
  /** Parsed options/key-value arguments */
  options: Record<string, string>;
  /** Raw message text */
  rawText: string;
  /** Optional attachments (photo, document, voice, video) */
  attachments?: Attachment[];
}

export interface Attachment {
  type: "photo" | "document" | "voice" | "video";
  fileId: string;
  fileUniqueId: string;
  mimeType?: string;
  fileSize?: number;
}

// ============================================================================
// Platform Types
// ============================================================================

export type SocialPlatform =
  | "instagram"
  | "linkedin"
  | "facebook"
  | "x"
  | "threads"
  | "youtube"
  | "tiktok";

export type ContentType =
  | "reel"
  | "story"
  | "post"
  | "carousel"
  | "thread"
  | "video"
  | "article";

// ============================================================================
// Script Generation Types
// ============================================================================

export interface ScriptParams {
  topic: string;
  platform: SocialPlatform | string;
  duration?: number;
  tone?: string;
  language?: string;
  targetAudience?: string;
}

export interface ScriptResult {
  title: string;
  body: string;
  hooks: string[];
  cta: string;
  estimatedDuration: number;
  platform: string;
}

// ============================================================================
// Hashtag Types
// ============================================================================

export interface HashtagParams {
  topic: string;
  count?: number;
  language?: string;
}

export interface HashtagResult {
  highCompetition: string[];
  mediumCompetition: string[];
  lowCompetition: string[];
  niche: string[];
}

// ============================================================================
// Caption Types
// ============================================================================

export interface CaptionParams {
  topic: string;
  platform: SocialPlatform | string;
  tone?: string;
  includeHashtags?: boolean;
  includeEmojis?: boolean;
  includeSeo?: boolean;
  cta?: string;
}

export interface CaptionResult {
  hook: string;
  body: string;
  cta: string;
  hashtags: string[];
  seoKeywords: string[];
  fullCaption: string;
}

// ============================================================================
// Carousel Types
// ============================================================================

export interface CarouselParams {
  topic: string;
  slideCount?: number;
  platform?: SocialPlatform | string;
  tone?: string;
  includeCta?: boolean;
}

export interface CarouselSlide {
  title: string;
  content: string;
  imagePrompt?: string;
  notes?: string;
}

export interface CarouselResult {
  title: string;
  slides: CarouselSlide[];
  cta: string;
  caption: string;
  json: string; // Compatible with Canva import
}

// ============================================================================
// Image Generation Types
// ============================================================================

export interface ImageParams {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: string;
  style?: string;
  platform?: SocialPlatform | string;
}

export interface ImageResult {
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
  style: string;
  imagePrompt: string;
}

// ============================================================================
// Video Generation Types
// ============================================================================

export interface VideoParams {
  topic: string;
  duration?: number;
  platform?: SocialPlatform | string;
  tone?: string;
}

export interface SceneBreakdown {
  scene: number;
  description: string;
  duration: number;
  cameraMotion: string;
  lighting: string;
  audioSuggestion: string;
}

export interface VideoResult {
  title: string;
  prompt: string;
  sceneBreakdown: SceneBreakdown[];
  transitions: string[];
  audioSuggestions: string[];
}

// ============================================================================
// Voice Generation Types
// ============================================================================

export interface VoiceParams {
  script: string;
  language?: string;
  voiceStyle?: string;
}

export interface VoiceResult {
  script: string;
  ssml: string;
  narration: string;
  timing: number;
}

// ============================================================================
// Schedule Types
// ============================================================================

export interface ScheduleParams {
  contentId: string;
  platforms: SocialPlatform[];
  scheduledAt: string;
  timezone?: string;
}

export interface ScheduleResult {
  id: string;
  contentId: string;
  platforms: SocialPlatform[];
  scheduledAt: string;
  status: "scheduled" | "published" | "failed";
}

// ============================================================================
// Publish Types
// ============================================================================

export interface PublishParams {
  content: string;
  platforms: SocialPlatform[];
  mediaUrls?: string[];
  scheduledAt?: string;
}

export interface PublishResult {
  platformResults: {
    platform: SocialPlatform;
    success: boolean;
    postId?: string;
    error?: string;
  }[];
}

// ============================================================================
// AI Provider Types
// ============================================================================

export type AIProvider = "openrouter" | "gemini";

export type AIModel =
  | "anthropic/claude-sonnet"
  | "anthropic/claude-3.5-haiku"
  | "google/gemini-2.5-flash"
  | "google/gemini-2.5-pro"
  | "deepseek/deepseek-chat"
  | "qwen/qwen-2.5-72b"
  | "openai/gpt-4o"
  | "openai/gpt-4o-mini";

export interface AIRequestOptions {
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  costEstimate: number;
}

// ============================================================================
// Log Entry Types
// ============================================================================

export interface LogEntry {
  id: string;
  userId: string;
  command: CommandName;
  executionTimeMs: number;
  tokens: number;
  model: string;
  costEstimate: number;
  status: "success" | "error";
  error?: string;
  createdAt: string;
}

// ============================================================================
// User & Project Types
// ============================================================================

export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  userId: string;
  projectId?: string;
  type: "image" | "video" | "voice" | "script" | "carousel";
  url: string;
  cloudinaryPublicId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  projectId?: string;
  content: string;
  platforms: SocialPlatform[];
  status: "draft" | "scheduled" | "published" | "failed";
  scheduledAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}
