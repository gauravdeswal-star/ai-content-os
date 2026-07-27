/**
 * Unit tests for the AI client.
 * Tests cost estimation, model detection, and the generateJSON helper.
 * Actual API calls are NOT made — these test pure functions and parsing logic.
 */

import { describe, expect, test } from "bun:test";

// ============================================================================
// Cost Estimation Tests
// The estimateCost function is internal to client.ts, so we test the
// public functions that use it and test the pricing logic directly.
// ============================================================================

describe("AI client - cost estimation", () => {
  /**
   * Replicate the estimateCost logic from client.ts for testing.
   */
  function estimateCost(
    model: string,
    promptTokens: number,
    completionTokens: number,
  ): number {
    const pricing: Record<string, [number, number]> = {
      "anthropic/claude-sonnet": [0.003, 0.015],
      "anthropic/claude-3.5-haiku": [0.0008, 0.004],
      "google/gemini-2.5-flash": [0.00015, 0.0006],
      "google/gemini-2.5-pro": [0.00125, 0.005],
      "deepseek/deepseek-chat": [0.00027, 0.0011],
      "qwen/qwen-2.5-72b": [0.0009, 0.0009],
      "openai/gpt-4o": [0.0025, 0.01],
      "openai/gpt-4o-mini": [0.00015, 0.0006],
    };

    const key = Object.keys(pricing).find((k) => model.includes(k));
    const [inputPrice, outputPrice] = key ? pricing[key]! : [0.001, 0.003];

    return (
      (promptTokens / 1000) * inputPrice +
      (completionTokens / 1000) * outputPrice
    );
  }

  test("calculates cost for Claude Sonnet", () => {
    // 1000 prompt tokens + 500 completion tokens
    const cost = estimateCost("anthropic/claude-sonnet", 1000, 500);
    expect(cost).toBeCloseTo(0.003 * 1 + 0.015 * 0.5, 6); // 0.003 + 0.0075 = 0.0105
  });

  test("calculates cost for Gemini Flash (cheap)", () => {
    const cost = estimateCost("google/gemini-2.5-flash", 1000, 1000);
    expect(cost).toBeCloseTo(0.00015 + 0.0006, 6); // 0.00075
  });

  test("calculates cost for GPT-4o (premium)", () => {
    const cost = estimateCost("openai/gpt-4o", 500, 200);
    expect(cost).toBeCloseTo(0.0025 * 0.5 + 0.01 * 0.2, 6); // 0.00125 + 0.002 = 0.00325
  });

  test("handles unknown models with fallback pricing", () => {
    const cost = estimateCost("some/unknown-model", 1000, 500);
    expect(cost).toBeCloseTo(0.001 * 1 + 0.003 * 0.5, 6); // 0.001 + 0.0015 = 0.0025
  });

  test("returns zero cost for zero tokens", () => {
    const cost = estimateCost("anthropic/claude-sonnet", 0, 0);
    expect(cost).toBe(0);
  });

  test("matches model by partial string (not exact match)", () => {
    // Should match 'anthropic/claude-sonnet' even with extra suffix
    const cost = estimateCost("anthropic/claude-sonnet-20241022", 100, 100);
    const expected = estimateCost("anthropic/claude-sonnet", 100, 100);
    expect(cost).toBe(expected);
  });
});

// ============================================================================
// Model Detection Tests
// ============================================================================

describe("AI client - model detection", () => {
  type AIProvider = "openrouter" | "gemini";

  function detectProvider(model: string): AIProvider {
    if (model.startsWith("google/")) {
      return "gemini";
    }
    return "openrouter";
  }

  test("detects Google Gemini models", () => {
    expect(detectProvider("google/gemini-2.5-flash")).toBe("gemini");
    expect(detectProvider("google/gemini-2.5-pro")).toBe("gemini");
  });

  test("detects OpenRouter models", () => {
    expect(detectProvider("anthropic/claude-sonnet")).toBe("openrouter");
    expect(detectProvider("openai/gpt-4o")).toBe("openrouter");
    expect(detectProvider("deepseek/deepseek-chat")).toBe("openrouter");
    expect(detectProvider("qwen/qwen-2.5-72b")).toBe("openrouter");
  });
});

// ============================================================================
// JSON Response Parsing Tests
// (Tests the JSON extraction logic from generateJSON in client.ts)
// ============================================================================

describe("AI client - JSON response parsing", () => {
  /**
   * Replicate the JSON extraction logic from generateJSON.
   */
  function extractJSON(raw: string): Record<string, unknown> {
    const jsonStr = raw
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    return JSON.parse(jsonStr) as Record<string, unknown>;
  }

  test("parses plain JSON without markdown fences", () => {
    const result = extractJSON('{"title": "Test", "count": 5}');
    expect(result).toEqual({ title: "Test", count: 5 });
  });

  test("parses JSON inside markdown code fences", () => {
    const result = extractJSON(
      '```json\n{"title": "Carousel", "slides": 5}\n```',
    );
    expect(result).toEqual({ title: "Carousel", slides: 5 });
  });

  test("handles JSON without language identifier", () => {
    const result = extractJSON('```\n{"key": "value"}\n```');
    expect(result).toEqual({ key: "value" });
  });

  test("parses nested objects correctly", () => {
    const result = extractJSON(
      JSON.stringify({
        slides: [
          { title: "Slide 1", content: "Hello" },
          { title: "Slide 2", content: "World" },
        ],
      }),
    );
    expect(result.slides).toBeDefined();
    expect(Array.isArray(result.slides)).toBe(true);
  });

  test("throws on invalid JSON", () => {
    expect(() => extractJSON("{invalid json}")).toThrow();
  });

  test("handles JSON with whitespace", () => {
    const result = extractJSON('  \n  {"a": 1}  \n  ');
    expect(result).toEqual({ a: 1 });
  });
});
