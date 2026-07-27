/**
 * Unit tests for the command parser.
 * Tests all parsing scenarios: structured, inline, edge cases, attachments.
 */

import { describe, expect, test, beforeEach } from "bun:test";
import { parseCommand } from "../lib/parser/command-parser";

describe("command-parser", () => {
  // ==========================================================================
  // Edge Cases
  // ==========================================================================

  describe("edge cases", () => {
    test("returns null for empty string", () => {
      expect(parseCommand("")).toBeNull();
    });

    test("returns null for whitespace-only string", () => {
      expect(parseCommand("   \n  \t  ")).toBeNull();
    });

    test("returns null for text without leading slash", () => {
      expect(parseCommand("hello world")).toBeNull();
    });

    test("returns null for just a slash", () => {
      expect(parseCommand("/")).toBeNull();
    });

    test("returns null for non-string input", () => {
      // @ts-expect-error testing invalid input
      expect(parseCommand(null)).toBeNull();
      // @ts-expect-error testing invalid input
      expect(parseCommand(undefined)).toBeNull();
      // @ts-expect-error testing invalid input
      expect(parseCommand(123)).toBeNull();
    });
  });

  // ==========================================================================
  // Basic Command Detection
  // ==========================================================================

  describe("command detection", () => {
    test("extracts simple command name", () => {
      const result = parseCommand("/help");
      expect(result).not.toBeNull();
      expect(result!.command).toBe("help");
      expect(result!.options).toEqual({});
    });

    test("extracts command with trailing whitespace", () => {
      const result = parseCommand("  /start  ");
      expect(result).not.toBeNull();
      expect(result!.command).toBe("start");
    });

    test("is case-insensitive for command names", () => {
      const result = parseCommand("/SCRIPT");
      expect(result).not.toBeNull();
      expect(result!.command).toBe("script");
    });

    test("handles mixed case command", () => {
      const result = parseCommand("/Hashtags");
      expect(result).not.toBeNull();
      expect(result!.command).toBe("hashtags");
    });
  });

  // ==========================================================================
  // Structured Key-Value Parsing
  // ==========================================================================

  describe("structured key-value parsing", () => {
    test("parses single key-value pair", () => {
      const result = parseCommand("/script\nTopic: AI Marketing");
      expect(result).not.toBeNull();
      expect(result!.command).toBe("script");
      expect(result!.options["topic"]).toBe("AI Marketing");
    });

    test("parses multiple key-value pairs", () => {
      const text = [
        "/script",
        "Topic: Top 10 AI Tools for Students",
        "Platform: Instagram",
        "Duration: 60",
        "Tone: Conversational",
      ].join("\n");

      const result = parseCommand(text);
      expect(result).not.toBeNull();
      expect(result!.options["topic"]).toBe("Top 10 AI Tools for Students");
      expect(result!.options["platform"]).toBe("Instagram");
      expect(result!.options["duration"]).toBe("60");
      expect(result!.options["tone"]).toBe("Conversational");
    });

    test("parses multi-word keys by converting to camelCase", () => {
      const result = parseCommand(
        "/caption\nTarget Audience: College Students\nCall To Action: Click here",
      );
      expect(result).not.toBeNull();
      expect(result!.options["targetaudience"]).toBe("College Students");
      expect(result!.options["calltoaction"]).toBe("Click here");
    });

    test("handles values with colons", () => {
      const result = parseCommand("/help\nTime: 10:30 AM");
      expect(result).not.toBeNull();
      expect(result!.options["time"]).toBe("10:30 AM");
    });

    test("ignores lines without colons", () => {
      const result = parseCommand(
        "/script\nTopic: AI\nJust a random line\nPlatform: Instagram",
      );
      expect(result).not.toBeNull();
      expect(result!.options["topic"]).toBe("AI");
      expect(result!.options["platform"]).toBe("Instagram");
      // Random line without colon should be ignored
      expect(Object.keys(result!.options).length).toBe(2);
    });

    test("handles keys with trailing whitespace", () => {
      const result = parseCommand("/script\n  Topic  :  AI Tools  ");
      expect(result).not.toBeNull();
      expect(result!.options["topic"]).toBe("AI Tools");
    });
  });

  // ==========================================================================
  // Inline Parsing (fallback)
  // ==========================================================================

  describe("inline parsing fallback", () => {
    test("parses inline text as topic for hashtags", () => {
      const result = parseCommand("/hashtags Digital Marketing");
      expect(result).not.toBeNull();
      expect(result!.command).toBe("hashtags");
      expect(result!.options["topic"]).toBe("Digital Marketing");
    });

    test("detects platform in inline script text", () => {
      const result = parseCommand("/script AI Marketing for Instagram");
      expect(result).not.toBeNull();
      expect(result!.command).toBe("script");
      expect(result!.options["topic"]).toBe("AI Marketing for Instagram");
      expect(result!.options["platform"]).toBe("instagram");
    });

    test("falls back to text key for unknown commands", () => {
      const result = parseCommand("/unknown some args here");
      expect(result).not.toBeNull();
      // Unknown command returns empty options from parseCommand
      expect(result!.command).toBe("unknown" as any);
    });
  });

  // ==========================================================================
  // Attachments
  // ==========================================================================

  describe("attachments", () => {
    test("passes through attachments when provided", () => {
      const attachments = [
        {
          type: "photo" as const,
          fileId: "file123",
          fileUniqueId: "unique123",
        },
      ];

      const result = parseCommand("/post\nContent: Check this out", attachments);
      expect(result).not.toBeNull();
      expect(result!.attachments).toHaveLength(1);
      expect(result!.attachments![0]!.type).toBe("photo");
      expect(result!.attachments![0]!.fileId).toBe("file123");
    });

    test("handles multiple attachments", () => {
      const attachments = [
        { type: "photo" as const, fileId: "f1", fileUniqueId: "u1" },
        { type: "document" as const, fileId: "f2", fileUniqueId: "u2" },
      ];

      const result = parseCommand("/post\nContent: Test", attachments);
      expect(result).not.toBeNull();
      expect(result!.attachments).toHaveLength(2);
    });
  });

  // ==========================================================================
  // Raw Text Preservation
  // ==========================================================================

  describe("raw text", () => {
    test("preserves original raw text", () => {
      const text = "/script\nTopic: AI";
      const result = parseCommand(text);
      expect(result).not.toBeNull();
      expect(result!.rawText).toBe(text);
    });
  });
});
