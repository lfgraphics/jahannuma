/**
 * Utility functions for the application.
 * Provides common helpers and utility functions.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with clsx and merges Tailwind classes with tailwind-merge.
 * This utility helps avoid Tailwind class conflicts and provides a clean API.
 *
 * @param inputs - Class values to combine
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number with commas for better readability.
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

/**
 * Sleep utility for async operations.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Format poetry lines by splitting on newlines and trimming.
 */
export function formatPoetryLines(text: string): string[] {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * Escape a value for Airtable formula strings. Wrap with single quotes in caller.
 * Rules:
 * - Escape single quotes by doubling them: ' -> ''
 * - Remove control chars; allow unicode letters
 * - Trim excessive whitespace
 */
export function escapeAirtableFormulaValue(value: string): string {
  const cleaned = (value ?? "")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
    .trim();
  return cleaned.replace(/'/g, "''");
}

/**
 * Generate a deterministic cache key from any value.
 */
export function generateCacheKey(params: any): string {
  const seen = new WeakSet<object>();

  const normalize = (val: any): any => {
    if (val === null) return null;
    const t = typeof val;
    if (t === "undefined") return { $undefined: true };
    if (t === "number" || t === "string" || t === "boolean") return val;
    if (t === "bigint") return { $bigint: val.toString() };
    if (t === "function") return { $function: String(val.name || "anonymous") };

    if (val instanceof Date) return { $date: val.toISOString() };
    if (Array.isArray(val)) return val.map((v) => normalize(v));

    if (val instanceof Map) {
      const entries = Array.from(val.entries()).sort(([a], [b]) =>
        a > b ? 1 : a < b ? -1 : 0
      );
      return { $map: entries.map(([k, v]) => [normalize(k), normalize(v)]) };
    }
    if (val instanceof Set) {
      const arr = Array.from(val.values()).map((v) => normalize(v));
      arr.sort((a, b) => {
        const sa = JSON.stringify(a);
        const sb = JSON.stringify(b);
        return sa < sb ? -1 : sa > sb ? 1 : 0;
      });
      return { $set: arr };
    }

    if (typeof val === "object") {
      if (seen.has(val)) return { $circular: true };
      seen.add(val);
      const obj: Record<string, any> = {};
      for (const key of Object.keys(val).sort()) {
        obj[key] = normalize(val[key]);
      }
      return obj;
    }

    return val;
  };

  try {
    const normalized = normalize(params);
    const json = JSON.stringify(normalized);
    return json ?? String(params);
  } catch {
    return String(params);
  }
}
