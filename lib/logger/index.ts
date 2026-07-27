/**
 * Logging service for AI Content OS.
 * Logs all operations with timing, cost tracking, and error details.
 */

import type { CommandName, LogEntry } from "@/types";

export interface LogData {
  userId: string;
  command: CommandName;
  executionTimeMs: number;
  tokens: number;
  model: string;
  costEstimate: number;
  status: "success" | "error";
  error?: string;
}

/**
 * Logger class for structured logging across the application.
 * In production, logs would be sent to a database or external service.
 */
class Logger {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 1000;

  /**
   * Log a completed operation.
   */
  log(data: LogData): void {
    const entry: LogEntry = {
      id: this.generateId(),
      userId: data.userId,
      command: data.command,
      executionTimeMs: data.executionTimeMs,
      tokens: data.tokens,
      model: data.model,
      costEstimate: data.costEstimate,
      status: data.status,
      error: data.error,
      createdAt: new Date().toISOString(),
    };

    this.logs.push(entry);

    // Trim logs if exceeding max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output for development
    if (process.env.NODE_ENV === "development") {
      const icon = data.status === "success" ? "✅" : "❌";
      console.log(
        `${icon} [${data.command}] user=${data.userId} time=${data.executionTimeMs}ms tokens=${data.tokens} cost=$${data.costEstimate.toFixed(6)} model=${data.model}`,
      );
    }
  }

  /**
   * Get recent logs for a user.
   */
  getLogsForUser(userId: string, limit = 20): LogEntry[] {
    return this.logs
      .filter((log) => log.userId === userId)
      .slice(-limit)
      .reverse();
  }

  /**
   * Get all logs (admin).
   */
  getAllLogs(limit = 50): LogEntry[] {
    return this.logs.slice(-limit).reverse();
  }

  /**
   * Get aggregated usage stats for a user.
   */
  getUserStats(userId: string): {
    totalCommands: number;
    totalTokens: number;
    totalCost: number;
    successRate: number;
    commandBreakdown: Record<string, number>;
  } {
    const userLogs = this.logs.filter((log) => log.userId === userId);
    const total = userLogs.length;
    const successful = userLogs.filter((l) => l.status === "success").length;

    const commandBreakdown: Record<string, number> = {};
    for (const log of userLogs) {
      commandBreakdown[log.command] =
        (commandBreakdown[log.command] ?? 0) + 1;
    }

    return {
      totalCommands: total,
      totalTokens: userLogs.reduce((sum, l) => sum + l.tokens, 0),
      totalCost: userLogs.reduce((sum, l) => sum + l.costEstimate, 0),
      successRate: total > 0 ? (successful / total) * 100 : 0,
      commandBreakdown,
    };
  }

  private generateId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

/**
 * Singleton logger instance for the application.
 */
export const logger = new Logger();
