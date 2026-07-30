/**
 * Hugging Face S3-compatible storage service.
 * Handles uploading generated media to Hugging Face's S3-compatible object storage.
 *
 * Required env vars:
 *   AWS_ACCESS_KEY_ID     - Your Hugging Face S3 access key
 *   AWS_SECRET_ACCESS_KEY - Your Hugging Face S3 secret key
 *   S3_ENDPOINT           - S3 endpoint URL (e.g., "https://s3.hf.co/gaurav2077")
 *
 * Optional env var:
 *   S3_BUCKET             - Bucket name (defaults to "ai-content-os" if not set)
 *
 * Docs: https://huggingface.co/docs/hub/en/storage
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";

// ============================================================================
// Configuration
// ============================================================================

interface S3Config {
  endpoint: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  region: string;
}

/**
 * Load and validate S3 configuration from environment variables.
 */
function getS3Config(): S3Config {
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "S3 storage is not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, " +
      "and S3_ENDPOINT in your environment variables.",
    );
  }

  return {
    endpoint,
    accessKeyId,
    secretAccessKey,
    bucket: process.env.S3_BUCKET || "ai-content-os",
    region: process.env.S3_REGION || "us-east-1",
  };
}

/**
 * Get whether S3 storage is configured with valid credentials.
 */
export function isS3Configured(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.S3_ENDPOINT
  );
}

/**
 * Create a configured S3 client instance.
 */
function createS3Client(): S3Client {
  const config = getS3Config();

  return new S3Client({
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    region: config.region,
    forcePathStyle: true, // Required for S3-compatible storage (MinIO, HF, etc.)
  });
}

// ============================================================================
// Upload
// ============================================================================

export interface S3UploadOptions {
  /** Folder/prefix to store the file in (e.g., "images") */
  folder?: string;
  /** Custom filename (auto-generated if not provided) */
  filename?: string;
  /** MIME type of the file */
  contentType?: string;
  /** Whether the object should be publicly readable (default: true) */
  publicRead?: boolean;
}

export interface S3UploadResult {
  /** Public URL of the uploaded file */
  url: string;
  /** The S3 key (path) of the uploaded object */
  key: string;
  /** Bucket name */
  bucket: string;
  /** ETag of the uploaded object */
  etag?: string;
}

/**
 * Upload a buffer to S3-compatible storage.
 *
 * @param buffer - The file data as a Buffer
 * @param options - Upload options
 * @returns Upload result with public URL
 */
async function uploadBuffer(
  buffer: Buffer,
  options: S3UploadOptions = {},
): Promise<S3UploadResult> {
  const config = getS3Config();
  const client = createS3Client();

  const folder = options.folder ? `${options.folder}/` : "";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const filename = options.filename || `generated_${timestamp}_${random}`;
  const key = `${folder}${filename}`;
  const contentType = options.contentType || "image/png";
  const publicRead = options.publicRead !== false;

  const params: PutObjectCommandInput = {
    Bucket: config.bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ...(publicRead ? { ACL: "public-read" } : {}),
  };

  try {
    const command = new PutObjectCommand(params);
    const response = await client.send(command);

    // Construct the public URL
    // Hugging Face S3 URL format: {endpoint}/{bucket}/{key}
    const baseUrl = config.endpoint.replace(/\/+$/, "");
    const url = `${baseUrl}/${config.bucket}/${key}`;

    return {
      url,
      key,
      bucket: config.bucket,
      etag: response.ETag,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`S3 upload failed: ${message}`);
  }
}

/**
 * Upload a base64-encoded image to S3-compatible storage.
 * Decodes the base64 to a buffer and uploads it.
 *
 * @param base64Data - Base64-encoded image data (with or without data: URI prefix)
 * @param options - Upload options
 * @returns Upload result with public URL
 *
 * @example
 * const result = await uploadBase64Image("iVBORw0KGgo...", {
 *   folder: "images",
 *   contentType: "image/png",
 * });
 * console.log(result.url); // https://s3.hf.co/gaurav2077/ai-content-os/images/...
 */
export async function uploadBase64Image(
  base64Data: string,
  options: S3UploadOptions = {},
): Promise<S3UploadResult> {
  if (!isS3Configured()) {
    throw new Error(
      "S3 storage is not configured. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, " +
      "and S3_ENDPOINT in your environment variables.",
    );
  }

  // Strip data URI prefix if present
  const rawBase64 = base64Data.includes("base64,")
    ? base64Data.split("base64,")[1]?.trim() || base64Data
    : base64Data;

  const buffer = Buffer.from(rawBase64, "base64");

  if (buffer.length === 0) {
    throw new Error("S3 upload failed: empty image data");
  }

  return uploadBuffer(buffer, options);
}

// ============================================================================
// Delete
// ============================================================================

/**
 * Delete an object from S3 by key.
 *
 * @param key - The S3 key of the object to delete
 */
export async function deleteObject(key: string): Promise<void> {
  const config = getS3Config();
  const client = createS3Client();

  try {
    const command = new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });
    await client.send(command);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`S3 delete failed: ${message}`);
  }
}
