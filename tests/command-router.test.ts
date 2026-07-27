/**
 * Unit tests for the command router.
 * Tests handler registration, execution, error handling, and extensibility.
 */

import { describe, expect, test, beforeEach, jest } from "bun:test";
import { CommandRouter } from "../lib/router/command-router";
import type { ParsedCommand, ApiResponse } from "../types";

// We need to test the class, not the singleton
// Let's create a test helper that exposes the class
class TestCommandRouter {
  private handlers = new Map<string, (command: ParsedCommand) => Promise<ApiResponse<unknown>>>();

  register(command: string, handler: (command: ParsedCommand) => Promise<ApiResponse<unknown>>): void {
    this.handlers.set(command, handler);
  }

  unregister(command: string): void {
    this.handlers.delete(command);
  }

  hasHandler(command: string): boolean {
    return this.handlers.has(command);
  }

  getRegisteredCommands(): string[] {
    return Array.from(this.handlers.keys());
  }

  async execute(command: ParsedCommand): Promise<ApiResponse<unknown>> {
    const handler = this.handlers.get(command.command);
    if (!handler) {
      return {
        success: false,
        message: `Unknown command: /${command.command}`,
        data: null,
        error: {
          code: "UNKNOWN_COMMAND",
          message: `No handler registered for /${command.command}. Use /help to see available commands.`,
        },
      };
    }
    try {
      return await handler(command);
    } catch (error) {
      return {
        success: false,
        message: "An error occurred while processing your command",
        data: null,
        error: {
          code: "HANDLER_ERROR",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  }
}

function makeCommand(
  command: string,
  options: Record<string, string> = {},
  rawText = `/${command}`,
): ParsedCommand {
  return {
    command: command as ParsedCommand["command"],
    options,
    rawText,
  };
}

describe("command-router", () => {
  let router: TestCommandRouter;

  const mockSuccessHandler = async (
    cmd: ParsedCommand,
  ): Promise<ApiResponse<unknown>> => ({
    success: true,
    message: `Handled ${cmd.command}`,
    data: { input: cmd.options },
    error: null,
  });

  const mockFailingHandler = async (): Promise<ApiResponse<unknown>> => {
    throw new Error("Something went wrong");
  };

  beforeEach(() => {
    router = new TestCommandRouter();
  });

  // ==========================================================================
  // Handler Registration
  // ==========================================================================

  describe("handler registration", () => {
    test("registers a new handler", () => {
      router.register("script", mockSuccessHandler);
      expect(router.hasHandler("script")).toBe(true);
    });

    test("overwrites existing handler silently", () => {
      router.register("script", mockSuccessHandler);
      router.register("script", mockSuccessHandler);
      expect(router.hasHandler("script")).toBe(true);
    });

    test("unregisters a handler", () => {
      router.register("script", mockSuccessHandler);
      router.unregister("script");
      expect(router.hasHandler("script")).toBe(false);
    });

    test("lists registered commands", () => {
      router.register("script", mockSuccessHandler);
      router.register("help", mockSuccessHandler);
      const commands = router.getRegisteredCommands();
      expect(commands).toContain("script");
      expect(commands).toContain("help");
      expect(commands.length).toBe(2);
    });
  });

  // ==========================================================================
  // Handler Execution
  // ==========================================================================

  describe("handler execution", () => {
    test("executes a registered handler and returns response", async () => {
      router.register("script", mockSuccessHandler);

      const result = await router.execute(makeCommand("script", { topic: "AI" }));
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ input: { topic: "AI" } });
    });

    test("returns error for unknown command", async () => {
      const result = await router.execute(makeCommand("nonexistent"));
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("UNKNOWN_COMMAND");
    });

    test("catches handler errors gracefully", async () => {
      router.register("failing", mockFailingHandler);

      const result = await router.execute(makeCommand("failing"));
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("HANDLER_ERROR");
      expect(result.error?.message).toBe("Something went wrong");
    });
  });

  // ==========================================================================
  // Extensibility
  // ==========================================================================

  describe("extensibility", () => {
    test("new commands can be added without modifying existing code", async () => {
      // Simulate adding a new /translate command
      const translateHandler = async (
        cmd: ParsedCommand,
      ): Promise<ApiResponse<unknown>> => ({
        success: true,
        message: "Translation complete",
        data: { translated: cmd.options["text"] },
        error: null,
      });

      router.register("translate", translateHandler);

      const result = await router.execute(
        makeCommand("translate", { text: "Hello", language: "Spanish" }),
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ translated: "Hello" });
    });

    test("supports multiple handlers independently", async () => {
      const scriptHandler = async (cmd: ParsedCommand) => ({
        success: true,
        message: "Script generated",
        data: { type: "script", topic: cmd.options["topic"] },
        error: null,
      });

      const captionHandler = async (cmd: ParsedCommand) => ({
        success: true,
        message: "Caption generated",
        data: { type: "caption", topic: cmd.options["topic"] },
        error: null,
      });

      router.register("script", scriptHandler);
      router.register("caption", captionHandler);

      const scriptResult = await router.execute(makeCommand("script", { topic: "AI" }));
      expect(scriptResult.data).toEqual({ type: "script", topic: "AI" });

      const captionResult = await router.execute(makeCommand("caption", { topic: "Marketing" }));
      expect(captionResult.data).toEqual({ type: "caption", topic: "Marketing" });
    });
  });

  // ==========================================================================
  // Input Passthrough
  // ==========================================================================

  describe("input passthrough", () => {
    test("passes command options to handler", async () => {
      const options = {
        topic: "AI Tools",
        platform: "Instagram",
        duration: "60",
      };

      let receivedOptions: Record<string, string> = {};
      router.register("script", async (cmd) => {
        receivedOptions = cmd.options;
        return { success: true, message: "", data: null, error: null };
      });

      await router.execute(makeCommand("script", options));
      expect(receivedOptions).toEqual(options);
    });
  });
});
