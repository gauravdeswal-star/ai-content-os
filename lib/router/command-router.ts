/**
 * Command Router for AI Content OS.
 * Routes parsed commands to their registered handlers.
 * New commands can be added by registering a handler without modifying this file.
 */

import type { ParsedCommand, ApiResponse } from "@/types";
import { logger } from "@/lib/logger";

/**
 * Handler function type for command processing.
 * Each handler receives the parsed command and returns a response.
 */
export type CommandHandler = (
  command: ParsedCommand,
) => Promise<ApiResponse<unknown>>;

/**
 * Registry for command handlers.
 * Handlers are registered by command name.
 */
export class CommandRouter {
  private handlers = new Map<string, CommandHandler>();

  /**
   * Register a handler for a specific command.
   *
   * @param command - The command name (without /)
   * @param handler - The handler function
   *
   * @example
   * ```ts
   * router.register("script", scriptHandler);
   * router.register("translate", translateHandler); // New command, no router changes needed
   * ```
   */
  register(command: string, handler: CommandHandler): void {
    if (this.handlers.has(command)) {
      console.warn(`[Router] Overwriting existing handler for /${command}`);
    }
    this.handlers.set(command, handler);
    console.log(`[Router] Registered handler for /${command}`);
  }

  /**
   * Unregister a handler for a command.
   */
  unregister(command: string): void {
    this.handlers.delete(command);
  }

  /**
   * Check if a handler is registered for a command.
   */
  hasHandler(command: string): boolean {
    return this.handlers.has(command);
  }

  /**
   * Execute the handler for a parsed command.
   *
   * @param command - The parsed command from the parser
   * @returns The handler's response
   */
  async execute(command: ParsedCommand): Promise<ApiResponse<unknown>> {
    const startTime = Date.now();
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
      const response = await handler(command);
      const executionTime = Date.now() - startTime;

      logger.log({
        userId: "telegram", // Will be replaced with actual user ID in production
        command: command.command,
        executionTimeMs: executionTime,
        tokens: 0, // Will be populated by the AI client
        model: "unknown",
        costEstimate: 0,
        status: "success",
      });

      return response;
    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      logger.log({
        userId: "telegram",
        command: command.command,
        executionTimeMs: executionTime,
        tokens: 0,
        model: "unknown",
        costEstimate: 0,
        status: "error",
        error: errorMessage,
      });

      return {
        success: false,
        message: "An error occurred while processing your command",
        data: null,
        error: {
          code: "HANDLER_ERROR",
          message: errorMessage,
        },
      };
    }
  }

  /**
   * Get a list of all registered command names.
   */
  getRegisteredCommands(): string[] {
    return Array.from(this.handlers.keys());
  }
}

/**
 * Singleton router instance for the application.
 */
export const router = new CommandRouter();
