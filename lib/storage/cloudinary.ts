/**
 * Cloudinary storage service.
 * Handles uploading generated images to Cloudinary for reliable URL-based delivery.
 *
 * Required env vars:
 *   CLOUDINARY_CLOUD_NAME  - Your Cloudinary cloud name (e.g. "dhj9abcde")
 *   CLOUDINARY_API_KEY     - Your Cloudinary API key
 *   CLOUDINARY_API_SECRET  - Your Cloudinary API secret
 *
 * Free tier: 25GB storage, 25GB bandwidth/month, unlimited transformations.
 * Sign up: https://cloudinary.com/register
 */

import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import { Readable } from "stream";

// ============================================================================
// Initialization
// ============================================================================

/**
 * Get whether Cloudinary is configured with valid credentials.
 */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Initialize the Cloudinary SDK with environment variables.
 * Call this before any upload operation.
 */
export function initCloudinary(): void {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, " +
      "and CLOUDINARY_API_SECRET in your environment variables.",
    );
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  });
}

// ============================================================================
// Upload
// ============================================================================

export interface CloudinaryUploadOptions {
  /** Folder to store the image in (e.g., "ai-content-os/images") */
  folder?: string;
  /** Public ID for the image (auto-generated if not provided) */
  publicId?: string;
  /** Whether the image should be eagerly optimized */
  eager?: boolean;
  /** Tags to apply to the image */
  tags?: string[];
}

export interface CloudinaryUploadResult {
  /** Public URL of the uploaded image */
  url: string;
  /** Secure HTTPS URL */
  secureUrl: string;
  /** Public ID assigned by Cloudinary */
  publicId: string;
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
  /** File format (png, jpg, webp, etc.) */
  format: string;
  /** File size in bytes */
  bytes: number;
  /** When the asset was created */
  createdAt: string;
}

/**
 * Upload an image buffer to Cloudinary using upload_stream.
 * This is more reliable than the data URI approach, especially in Bun/Node environments.
 *
 * @param imageBuffer - Decoded image buffer
 * @param options - Upload options
 * @returns Upload result with public URL
 */
function uploadBuffer(
  imageBuffer: Buffer,
  options: CloudinaryUploadOptions = {},
): Promise<CloudinaryUploadResult> {
  const folder = options.folder || "ai-content-os";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const publicId = options.publicId || `generated_${timestamp}_${random}`;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder,
        tags: options.tags,
        resource_type: "image",
      },
      (
        error: UploadApiErrorResponse | undefined,
        result: UploadApiResponse | undefined,
      ) => {
        if (error) {
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }

        if (!result) {
          reject(new Error("Cloudinary upload returned no result"));
          return;
        }

        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          createdAt: result.created_at,
        });
      },
    );

    // Create a readable stream from the buffer and pipe it to Cloudinary
    const readable = new Readable();
    readable.push(imageBuffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

/**
 * Upload a base64-encoded image to Cloudinary.
 * Decodes the base64 to a buffer and uploads via upload_stream.
 *
 * @param base64Data - Base64-encoded image data (with or without data: URI prefix)
 * @param options - Upload options
 * @returns Upload result with public URL
 *
 * @example
 * const result = await uploadBase64Image("iVBORw0KGgo...", {
 *   folder: "ai-content-os/images",
 *   tags: ["telegram", "generated"],
 * });
 * console.log(result.secureUrl); // https://res.cloudinary.com/...
 */
export async function uploadBase64Image(
  base64Data: string,
  options: CloudinaryUploadOptions = {},
): Promise<CloudinaryUploadResult> {
  initCloudinary();

  // Strip data URI prefix if present, then decode base64 to buffer
  const rawBase64 = base64Data.includes("base64,")
    ? base64Data.split("base64,")[1]?.trim() || base64Data
    : base64Data;

  const imageBuffer = Buffer.from(rawBase64, "base64");

  if (imageBuffer.length === 0) {
    throw new Error("Cloudinary upload failed: empty image data");
  }

  return uploadBuffer(imageBuffer, options);
}

/**
 * Upload a base64 image and get just the secure URL (convenience wrapper).
 *
 * @param base64Data - Base64-encoded image data
 * @param folder - Optional folder to store in
 * @returns The secure HTTPS URL
 */
export async function uploadImageToUrl(
  base64Data: string,
  folder?: string,
): Promise<string> {
  const result = await uploadBase64Image(base64Data, { folder: folder || "ai-content-os" });
  return result.secureUrl;
}

// ============================================================================
// Delete
// ============================================================================

/**
 * Delete an image from Cloudinary by public ID.
 *
 * @param publicId - The public ID of the image to delete
 */
export async function deleteImage(publicId: string): Promise<void> {
  initCloudinary();

  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(new Error(`Cloudinary delete failed: ${error.message}`));
        return;
      }
      if (result.result !== "ok") {
        console.warn(`[Cloudinary] Delete returned: ${result.result}`);
      }
      resolve();
    });
  });
}

// ============================================================================
// URL Generation
// ============================================================================

/**
 * Generate a transformed image URL from a Cloudinary public ID.
 *
 * @param publicId - The public ID
 * @param transformations - Image transformations (e.g., "w_400,h_400,c_fill")
 * @returns The transformed URL
 *
 * @example
 * const url = getTransformedUrl("ai-content-os/generated_12345", "w_600,h_600,c_fill");
 * // https://res.cloudinary.com/.../w_600,h_600,c_fill/ai-content-os/generated_12345.png
 */
export function getTransformedUrl(
  publicId: string,
  transformations: string,
): string {
  initCloudinary();
  return cloudinary.url(publicId, {
    transformation: transformations,
    secure: true,
  });
}
