/**
 * Application-wide configuration constants.
 */

export const appConfig = {
  /** Application name */
  name: "AI Content OS",
  /** Application version */
  version: "1.0.0",
  /** Default language for content generation */
  defaultLanguage: "en",
  /** Maximum tokens for AI responses */
  maxTokens: 4096,
  /** Default temperature for AI generation */
  defaultTemperature: 0.7,
  /** Rate limiting */
  rateLimit: {
    /** Maximum requests per minute per user */
    maxRequestsPerMinute: 10,
    /** Maximum requests per day per user */
    maxRequestsPerDay: 100,
  },
  /** Supported social platforms */
  platforms: [
    "instagram",
    "linkedin",
    "facebook",
    "x",
    "threads",
    "youtube",
    "tiktok",
  ] as const,
  /** Asset upload limits */
  uploadLimits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
    allowedVideoTypes: ["video/mp4", "video/quicktime"],
    allowedAudioTypes: ["audio/mpeg", "audio/ogg", "audio/wav"],
  },
  /** Default pagination */
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
} as const;
