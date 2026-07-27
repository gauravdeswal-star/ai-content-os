/**
 * Command registry configuration.
 * New commands can be added here without modifying the router logic.
 * Each command maps to its handler module and required parameters.
 */

import type { CommandName } from "@/types";

export interface CommandDefinition {
  /** The command name as used in Telegram messages (without /) */
  name: CommandName;
  /** Description shown in /help */
  description: string;
  /** Usage instructions */
  usage: string;
  /** Whether the command requires arguments */
  requiresArgs: boolean;
  /** Whether the command can handle attachments */
  supportsAttachments: boolean;
  /** Example usage */
  example: string;
}

/**
 * Registry of all supported commands.
 * To add a new command, simply add an entry here and create the corresponding
 * handler in lib/router/handlers/.
 */
export const commandRegistry: CommandDefinition[] = [
  {
    name: "script",
    description: "Generate scripts for reels, YouTube, LinkedIn, Twitter threads",
    usage:
      "/script\nTopic: <topic>\nPlatform: <platform>\nDuration: <seconds>\nTone: <tone>",
    requiresArgs: true,
    supportsAttachments: false,
    example: "/script\nTopic: Top 10 AI Tools\nPlatform: Instagram\nDuration: 60",
  },
  {
    name: "carousel",
    description: "Generate carousel content with slides compatible with Canva",
    usage: "/carousel\nTopic: <topic>\nSlides: <count>\nTone: <tone>",
    requiresArgs: true,
    supportsAttachments: false,
    example: "/carousel\nTopic: Digital Marketing Trends\nSlides: 5",
  },
  {
    name: "image",
    description: "Generate optimized image prompts for AI image generation",
    usage: "/image\nPrompt: <description>\nStyle: <style>\nRatio: <aspect>",
    requiresArgs: true,
    supportsAttachments: false,
    example: "/image\nPrompt: A futuristic cityscape\nStyle: Cinematic",
  },
  {
    name: "video",
    description: "Generate video prompts with scene breakdowns",
    usage:
      "/video\nTopic: <topic>\nDuration: <seconds>\nPlatform: <platform>",
    requiresArgs: true,
    supportsAttachments: false,
    example: "/video\nTopic: Product launch\nDuration: 30\nPlatform: YouTube",
  },
  {
    name: "voice",
    description: "Generate voiceover scripts with SSML and timing",
    usage: "/voice\nScript: <content>\nStyle: <voice style>",
    requiresArgs: true,
    supportsAttachments: false,
    example: "/voice\nScript: Welcome to our channel\nStyle: Energetic",
  },
  {
    name: "hashtags",
    description: "Generate optimized hashtags grouped by competition level",
    usage: "/hashtags\nTopic: <topic>\nCount: <number>",
    requiresArgs: true,
    supportsAttachments: false,
    example: "/hashtags\nTopic: Digital Marketing\nCount: 30",
  },
  {
    name: "caption",
    description: "Generate engaging captions with hooks, body, CTA, and emojis",
    usage:
      "/caption\nTopic: <topic>\nPlatform: <platform>\nTone: <tone>\nEmojis: yes/no",
    requiresArgs: true,
    supportsAttachments: false,
    example:
      "/caption\nTopic: New product launch\nPlatform: Instagram\nTone: Exciting",
  },
  {
    name: "post",
    description: "Publish content to connected social media platforms",
    usage: "/post\nContent: <text>\nPlatforms: <platform1, platform2>",
    requiresArgs: true,
    supportsAttachments: true,
    example: "/post\nContent: Check out our new feature!\nPlatforms: instagram, linkedin",
  },
  {
    name: "schedule",
    description: "Schedule content for future publication",
    usage:
      "/schedule\nContent: <text>\nPlatforms: <platforms>\nTime: <datetime>",
    requiresArgs: true,
    supportsAttachments: true,
    example:
      "/schedule\nContent: Monday motivation post\nPlatforms: instagram\nTime: 2026-08-01 09:00",
  },
  {
    name: "help",
    description: "Show available commands and usage",
    usage: "/help\n<command> (optional - show help for specific command)",
    requiresArgs: false,
    supportsAttachments: false,
    example: "/help\n/help script",
  },
  {
    name: "start",
    description: "Welcome message and getting started guide",
    usage: "/start",
    requiresArgs: false,
    supportsAttachments: false,
    example: "/start",
  },
];

/**
 * Get definition for a specific command.
 */
export function getCommandDefinition(
  name: string,
): CommandDefinition | undefined {
  return commandRegistry.find((cmd) => cmd.name === name);
}
