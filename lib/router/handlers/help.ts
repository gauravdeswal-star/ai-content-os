/**
 * Handlers for /help and /start commands.
 */

import type { ParsedCommand, ApiResponse } from "@/types";
import { commandRegistry, getCommandDefinition } from "@/config/commands";

/**
 * Handler for /help command.
 * Shows available commands or details for a specific command.
 */
export async function helpHandler(
  command: ParsedCommand,
): Promise<ApiResponse<unknown>> {
  const specificCommand = command.options.command || command.options.cmd;

  if (specificCommand) {
    const def = getCommandDefinition(specificCommand);
    if (!def) {
      return {
        success: false,
        message: `Unknown command: /${specificCommand}`,
        data: null,
        error: {
          code: "UNKNOWN_COMMAND",
          message: `No command found for /${specificCommand}. Use /help to see all commands.`,
        },
      };
    }

    return {
      success: true,
      message: formatCommandHelp(def),
      data: def,
      error: null,
    };
  }

  // General help
  const helpText = [
    "<b>🤖 AI Content OS - Command Reference</b>",
    "",
    "Control your AI content pipeline through Telegram.",
    "",
    ...commandRegistry.map((cmd) => {
      const emojis: Record<string, string> = {
        script: "📝",
        carousel: "🎠",
        image: "🎨",
        video: "🎬",
        voice: "🎙️",
        hashtags: "#️⃣",
        caption: "💬",
        post: "📤",
        schedule: "📅",
        help: "❓",
        start: "🚀",
      };
      return `${emojis[cmd.name] || "•"} <b>/${cmd.name}</b> - ${cmd.description}`;
    }),
    "",
    "<i>Use /help &lt;command&gt; for detailed usage of a specific command.</i>",
    "",
    "💡 <b>Pro tip:</b> You can use ANY of these formats:",
    "",
    "1️⃣ <b>Single line</b> (easiest!):",
    "<code>/script AI Content OS</code>",
    "",
    "2️⃣ <b>Key: Value</b> (multi line with Shift+Enter):",
    "<code>/script",
    "Topic: AI Content OS",
    "Platform: Instagram</code>",
  ].join("\n");

  return {
    success: true,
    message: helpText,
    data: commandRegistry,
    error: null,
  };
}

/**
 * Handler for /start command.
 * Welcome message and getting started guide.
 */
export async function startHandler(
  _command: ParsedCommand,
): Promise<ApiResponse<unknown>> {
  const welcomeText = [
    "<b>🚀 Welcome to AI Content OS!</b>",
    "",
    "I'm your AI content creation assistant. I can help you create, schedule,",
    "and publish content across multiple social media platforms.",
    "",
    "<b>✨ What I can do:</b>",
    "📝 Write scripts for reels, YouTube, LinkedIn, and more",
    "🎠 Create carousel content (Canva-compatible)",
    "🎨 Generate optimized image prompts",
    "🎬 Create video prompts with scene breakdowns",
    "#️⃣ Generate strategic hashtag sets",
    "💬 Write engaging captions with hooks and CTAs",
    "",
    "<b>🚀 Quick start:</b>",
    "Try these commands to get started:",
    "",
    "<code>/script",
    "Topic: AI Tools for Students",
    "Platform: Instagram",
    "Duration: 60",
    "Tone: Conversational</code>",
    "",
    "Or just type <code>/help</code> to see all available commands.",
  ].join("\n");

  return {
    success: true,
    message: welcomeText,
    data: {
      version: "1.0.0",
      status: "ready",
    },
    error: null,
  };
}

/**
 * Format help text for a specific command.
 */
function formatCommandHelp(def: {
  name: string;
  description: string;
  usage: string;
  example: string;
}): string {
  return [
    `<b>📖 /${def.name}</b>`,
    "",
    def.description,
    "",
    "<b>Usage:</b>",
    `<code>${def.usage}</code>`,
    "",
    "<b>Example:</b>",
    `<code>${def.example}</code>`,
  ].join("\n");
}
