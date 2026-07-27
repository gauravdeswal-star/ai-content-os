/**
 * Minimal type declarations for bun:test module.
 * These allow TypeScript to find bun:test in typecheck without full bun types.
 */

declare module "bun:test" {
  export interface TestOptions {
    timeout?: number;
    retry?: number;
    repeats?: number;
  }

  export function describe(
    label: string,
    fn: () => void,
    options?: TestOptions,
  ): void;

  export function test(
    label: string,
    fn: () => void | Promise<void>,
    options?: TestOptions,
  ): void;

  export function it(
    label: string,
    fn: () => void | Promise<void>,
    options?: TestOptions,
  ): void;

  export function expect<T>(actual: T): Expect<T>;

  interface Expect<T> {
    toBe(expected: T): void;
    toEqual(expected: T): void;
    not: {
      toBeNull(): void;
      toBeUndefined(): void;
      toEqual(expected: T): void;
      toBe(expected: T): void;
    };
    toBeNull(): void;
    toBeUndefined(): void;
    toHaveLength(n: number): void;
    toContain(item: unknown): void;
    toBeCloseTo(expected: number, numDigits?: number): void;
    toBeGreaterThan(expected: number): void;
    toBeLessThan(expected: number): void;
    toThrow(error?: unknown): void;
    toBeDefined(): void;
    toBeTruthy(): void;
    toBeFalsy(): void;
    toMatch(expected: string | RegExp): void;
  }

  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export function beforeAll(fn: () => void | Promise<void>): void;
  export function afterAll(fn: () => void | Promise<void>): void;

  export const jest: {
    fn: <T extends (...args: unknown[]) => unknown>(impl?: T) => jest.Mock<T>;
    spyOn: <T extends object, K extends keyof T>(
      obj: T,
      method: K,
    ) => jest.SpyInstance;
  };

  namespace jest {
    type Mock<T extends (...args: unknown[]) => unknown> = T & {
      mock: {
        calls: Parameters<T>[];
        results: { type: string; value: ReturnType<T> }[];
      };
      mockImplementation: (impl: T) => Mock<T>;
      mockReturnValue: (val: ReturnType<T>) => Mock<T>;
      mockResolvedValue: (val: Awaited<ReturnType<T>>) => Mock<T>;
    };

    type SpyInstance = {
      mock: {
        calls: unknown[][];
      };
      mockRestore: () => void;
      mockClear: () => void;
    };
  }
}
