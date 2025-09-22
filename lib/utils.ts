import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Pagination helpers
export interface PaginationResult<T> {
  data: T[]
  hasMore: boolean
  offset?: string
  total?: number
}

export async function fetchMoreData<T>(
  currentData: T[],
  fetchFunction: (offset?: string) => Promise<PaginationResult<T>>,
  offset?: string,
  keySelector?: (item: T) => string | number
): Promise<{ newData: T[]; hasMore: boolean; nextOffset?: string }> {
  const res = await fetchFunction(offset)
  const toKey = keySelector ?? ((x: any) => JSON.stringify(x))
  const set = new Set(currentData.map((x) => String(toKey(x))))
  const merged: T[] = [...currentData]
  for (const item of res.data) {
    const key = String(toKey(item))
    if (!set.has(key)) {
      merged.push(item)
      set.add(key)
    }
  }
  return { newData: merged, hasMore: res.hasMore, nextOffset: res.offset }
}

// Data processing utilities
export function formatPoetryLines(text: string): string[] {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ") // control chars
    .replace(/[<>]/g, (m) => ({ "<": "&lt;", ">": "&gt;" }[m]!))
}

// Deterministic JSON serializer: sorts object keys and handles cycles
function stableStringify(value: any): string {
  const seen = new WeakSet<object>()

  const normalize = (val: any): any => {
    if (val === null) return null
    const t = typeof val
    if (t === "undefined") return { $undefined: true }
    if (t === "number" || t === "string" || t === "boolean") return val
    if (t === "bigint") return { $bigint: val.toString() }
    if (t === "function") return { $function: String(val.name || "anonymous") }

    if (val instanceof Date) return { $date: val.toISOString() }
    if (Array.isArray(val)) return val.map((v) => normalize(v))

    if (val instanceof Map) {
      const entries = Array.from(val.entries()).sort(([a], [b]) => (a > b ? 1 : a < b ? -1 : 0))
      return { $map: entries.map(([k, v]) => [normalize(k), normalize(v)]) }
    }
    if (val instanceof Set) {
      const arr = Array.from(val.values()).map((v) => normalize(v))
      arr.sort((a, b) => {
        const sa = JSON.stringify(a)
        const sb = JSON.stringify(b)
        return sa < sb ? -1 : sa > sb ? 1 : 0
      })
      return { $set: arr }
    }

    if (typeof val === "object") {
      if (seen.has(val)) return { $circular: true }
      seen.add(val)
      const obj: Record<string, any> = {}
      for (const key of Object.keys(val).sort()) {
        obj[key] = normalize(val[key])
      }
      return obj
    }

    return val
  }

  const normalized = normalize(value)
  const json = JSON.stringify(normalized)
  return json ?? String(value)
}

export function generateCacheKey(params: any): string {
  try {
    const s = stableStringify(params)
    return s ?? String(params)
  } catch {
    return String(params)
  }
}

export function debounce<T extends (...args: any[]) => void>(fn: T, delay = 300) {
  let t: any
  return (...args: Parameters<T>) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), delay)
  }
}

// Re-export social utilities for unified imports
export * from "@/lib/social-utils"
