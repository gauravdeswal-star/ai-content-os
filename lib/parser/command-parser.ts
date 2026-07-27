/**
 * Command Parser for AI Content OS.
 * Parses Telegram messages into structured command objects with arguments.
 *
 * Supports two input formats:
 * 1. Structured format (key: value pairs):
 *    /script
 *    Topic: AI Marketing
 *    Platform: Instagram
 *    Duration: 60
 *
 * 2. Inline format:
 *    /script AI Marketing for Instagram 60 seconds
 */

import type { CommandName, ParsedCommand, Attachment } from "@/types";
import { getCommandDefinition } from "@/config/commands";

/**
 * Parse a raw Telegram message text into a structured command.
 *
 * @param text - The raw message text from Telegram
 * @param attachments - Optional file attachments from the message
 * @returns Parsed command with extracted options
 *
 * @example
 * ```ts
 * const cmd = parseCommand("/script\nTopic: AI Marketing\nPlatform: Instagram");
 * // { command: "script", options: { topic: "AI Marketing", platform: "Instagram" }, ... }
 * ```
 */
export function parseCommand(
  text: string,
  attachments?: Attachment[],
): ParsedCommand | null {
  if (!text || typeof text !== "string") {
    return null;
  }

  const trimmedText = text.trim();
  if (!trimmedText.startsWith("/")) {
    return null;
  }

  // Extract command name
  const commandMatch = trimmedText.match(/^\/(\w+)/);
  if (!commandMatch?.[1]) {
    return null;
  }

  const commandName = commandMatch[1].toLowerCase() as CommandName;
  const argsText = trimmedText.slice(commandMatch[0].length).trim();

  // Verify command is registered
  const definition = getCommandDefinition(commandName);
  if (!definition) {
    return {
      command: commandName,
      options: {},
      rawText: trimmedText,
      attachments,
    };
  }

  // Parse options from structured format (Key: Value pairs)
  const options = parseKeyValuePairs(argsText);

  // If structured parsing yields nothing, try inline parsing
  if (Object.keys(options).length === 0 && argsText.length > 0) {
    const inlineOptions = parseInlineArgs(commandName, argsText);
    Object.assign(options, inlineOptions);
  }

  return {
    command: commandName,
    options,
    rawText: trimmedText,
    attachments,
  };
}

/**
 * Parse key-value pairs from text.
 * Handles format:
 *   Key: Value
 *   Multi Word Key: Value with spaces
 */
function parseKeyValuePairs(text: string): Record<string, string> {
  const options: Record<string, string> = {};

  if (!text) return options;

  // Match lines like "Key: Value" or "Key: Value with spaces"
  const lineRegex = /^([a-zA-Z_][a-zA-Z0-9_ ]*):\s*(.+)$/gm;
  let match;

  while ((match = lineRegex.exec(text)) !== null) {
    const key = match[1]!.trim().toLowerCase().replace(/\s+/g, "");
    const value = match[2]!.trim();
    if (key && value) {
      options[key] = value;
    }
  }

  return options;
}

/**
 * Parse inline arguments for commands.
 * e.g., "/script AI Marketing for Instagram 60 seconds"
 * Falls back to positional arguments based on the command.
 */
function parseInlineArgs(
  command: CommandName,
  text: string,
): Record<string, string> {
  const options: Record<string, string> = {};

  switch (command) {
    case "hashtags": {
      // /hashtags topic topic
      options["topic"] = text;
      break;
    }
    case "script":
    case "caption":
    case "carousel":
    case "image": {
      // Try to extract platform if mentioned
      const platforms = [
        "instagram",
        "linkedin",
        "facebook",
        "twitter",
        "x",
        "threads",
        "youtube",
        "tiktok",
      ];

      options["topic"] = text;

      for (const platform of platforms) {
        if (text.toLowerCase().includes(platform)) {
          options["platform"] = platform;
          break;
        }
      }
      break;
    }
    default: {
      options["text"] = text;
    }
  }

  return options;
}

export type { ParsedCommand } from "@/types";
