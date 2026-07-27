/**
 * Supabase client initialization and storage service.
 * Handles database operations and file storage.
 */

import { createClient } from "@supabase/supabase-js";

/**
 * Get the Supabase service client (server-side only, uses service role).
 * This has admin privileges and should only be used in API routes.
 */
export function getServiceClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE must be configured.",
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get the Supabase anon client (can be used in limited contexts).
 */
export function getAnonClient() {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be configured.");
  }

  return createClient(url, anonKey);
}

/**
 * Save a log entry to Supabase.
 */
export async function saveLogEntry(entry: {
  userId: string;
  command: string;
  executionTimeMs: number;
  tokens: number;
  model: string;
  costEstimate: number;
  status: string;
  error?: string;
}): Promise<void> {
  try {
    const client = getServiceClient();
    await client.from("logs").insert({
      user_id: entry.userId,
      command: entry.command,
      execution_time_ms: entry.executionTimeMs,
      tokens: entry.tokens,
      model: entry.model,
      cost_estimate: entry.costEstimate,
      status: entry.status,
      error: entry.error,
    });
  } catch (error) {
    console.error("[Supabase] Failed to save log:", error);
  }
}

/**
 * Save a generated asset reference to Supabase.
 */
export async function saveAsset(asset: {
  userId: string;
  projectId?: string;
  type: string;
  url: string;
  cloudinaryPublicId?: string;
  metadata?: Record<string, unknown>;
}): Promise<string | null> {
  try {
    const client = getServiceClient();
    const { data } = await client
      .from("assets")
      .insert({
        user_id: asset.userId,
        project_id: asset.projectId,
        type: asset.type,
        url: asset.url,
        cloudinary_public_id: asset.cloudinaryPublicId,
        metadata: asset.metadata,
      })
      .select("id")
      .single();

    return data?.id ?? null;
  } catch (error) {
    console.error("[Supabase] Failed to save asset:", error);
    return null;
  }
}

/**
 * Get user by Telegram ID.
 */
export async function getUserByTelegramId(
  telegramId: string,
): Promise<unknown | null> {
  try {
    const client = getServiceClient();
    const { data } = await client
      .from("users")
      .select("*")
      .eq("telegram_id", telegramId)
      .single();

    return data;
  } catch {
    return null;
  }
}

/**
 * Create or update a user.
 */
export async function upsertUser(user: {
  telegramId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}): Promise<void> {
  try {
    const client = getServiceClient();
    await client.from("users").upsert(
      {
        telegram_id: user.telegramId,
        username: user.username,
        first_name: user.firstName,
        last_name: user.lastName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "telegram_id" },
    );
  } catch (error) {
    console.error("[Supabase] Failed to upsert user:", error);
  }
}
