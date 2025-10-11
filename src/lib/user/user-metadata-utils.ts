/**
 * User metadata utilities for managing Clerk user metadata operations.
 * Handles likes, comments, and favorites with proper validation and type safety.
 */

export type LikesTableKey =
  | "books"
  | "ashaar"
  | "ghazlen"
  | "nazmen"
  | "rubai"
  | "shaer";

export interface LikesMetadata {
  books?: string[];
  ashaar?: string[];
  ghazlen?: string[];
  nazmen?: string[];
  rubai?: string[];
  shaer?: string[];
}

/**
 * Ensure a value is a string array.
 */
function ensureArray(arr?: unknown): string[] {
  if (!arr) return [];
  if (Array.isArray(arr)) return arr.map(String);
  return [];
}

/**
 * Map Airtable table names or storage keys to LikesTableKey.
 */
export function mapTableToLikesKey(
  tableOrStorageKey: string,
  { strict = false }: { strict?: boolean } = {}
): LikesTableKey {
  const key = String(tableOrStorageKey || "").toLowerCase();
  if (key.includes("book")) return "books";
  if (key.includes("ashaar") || key.includes("ashar")) return "ashaar";
  if (key.includes("ghazlen") || key.includes("ghazal")) return "ghazlen";
  if (key.includes("nazm")) return "nazmen";
  if (key.includes("rubai")) return "rubai";
  if (key.includes("shaer") || key.includes("shura") || key.includes("profile"))
    return "shaer";

  if (strict) {
    throw new Error(`UNKNOWN_LIKES_TABLE: ${tableOrStorageKey}`);
  }

  console.warn("mapTableToLikesKey: unknown key, defaulting to ashaar", {
    input: tableOrStorageKey,
  });
  return "ashaar";
}

/**
 * Client-side migration helper: moves localStorage likes into Clerk metadata via API.
 */
export async function migrateLocalStorageLikes(
  userId?: string
): Promise<{ migrated: boolean }> {
  if (typeof window === "undefined") return { migrated: false };
  if (!userId) return { migrated: false };

  try {
    // Prevent repeated migrations
    const FLAG = "likes_migrated_v1";
    if (localStorage.getItem(FLAG)) return { migrated: false };

    const storageKeys = [
      "Ghazlen",
      "Ashaar",
      "Nazmen",
      "Books",
      "Rubai",
      "Shura",
    ];
    const likes: LikesMetadata = {};

    for (const sk of storageKeys) {
      const raw = localStorage.getItem(sk);
      if (!raw) continue;

      try {
        const list = JSON.parse(raw) as Array<
          { id?: string } & Record<string, any>
        >;
        const ids = list
          .map((x) => x?.id || (x as any)?.fields?.id)
          .filter(Boolean) as string[];

        const lk = mapTableToLikesKey(sk);
        (likes as any)[lk] = Array.from(
          new Set([...((likes as any)[lk] ?? []), ...ids])
        );
      } catch {
        // Ignore parse errors for individual keys
      }
    }

    // If nothing to migrate, set flag anyway
    if (Object.values(likes).every((arr) => !arr || arr.length === 0)) {
      localStorage.setItem(FLAG, "1");
      return { migrated: false };
    }

    const res = await fetch("/api/user/likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "merge", likes }),
    });

    if (res.ok) {
      // Clear old storage keys after successful merge
      try {
        storageKeys.forEach((k) => localStorage.removeItem(k));
      } catch {
        // Ignore errors when clearing localStorage
      }
      localStorage.setItem(FLAG, "1");
      console.log("likes migration completed successfully");
      return { migrated: true };
    } else {
      const msg = await res.text().catch(() => "");
      console.warn("likes migration merge failed", { status: res.status, msg });
    }
  } catch (e) {
    console.warn("likes migration failed", e);
  }

  return { migrated: false };
}

/**
 * Validate and clean likes metadata with deduplication and size limits.
 */
export function validateLikesMetadata(
  input: LikesMetadata | undefined | null
): LikesMetadata {
  const uniq = (arr?: unknown) =>
    Array.from(
      new Set(
        ensureArray(arr)
          .map((s) => s.trim())
          .filter(Boolean)
      )
    );
  const CAP = 500; // Limit to prevent metadata from getting too large

  return {
    books: uniq(input?.books).slice(-CAP),
    ashaar: uniq(input?.ashaar).slice(-CAP),
    ghazlen: uniq(input?.ghazlen).slice(-CAP),
    nazmen: uniq(input?.nazmen).slice(-CAP),
    rubai: uniq(input?.rubai).slice(-CAP),
    shaer: uniq(input?.shaer).slice(-CAP),
  };
}

/**
 * Merge two likes metadata objects with deduplication and size limits.
 */
export function mergeLikesMetadata(
  a: LikesMetadata,
  b: LikesMetadata
): LikesMetadata {
  const CAP = 500;
  const merge = (x?: unknown, y?: unknown) =>
    Array.from(
      new Set([...ensureArray(x).map(String), ...ensureArray(y).map(String)])
    )
      .filter(Boolean)
      .slice(-CAP);

  return {
    books: merge(a?.books, b?.books),
    ashaar: merge(a?.ashaar, b?.ashaar),
    ghazlen: merge(a?.ghazlen, b?.ghazlen),
    nazmen: merge(a?.nazmen, b?.nazmen),
    rubai: merge(a?.rubai, b?.rubai),
    shaer: merge(a?.shaer, b?.shaer),
  };
}

/**
 * Toggle a like for a specific record in the metadata.
 */
export function toggleLikeInMetadata(
  metadata: LikesMetadata,
  table: LikesTableKey,
  recordId: string
): { metadata: LikesMetadata; liked: boolean } {
  const current = ensureArray(metadata[table]);
  const index = current.indexOf(recordId);

  if (index >= 0) {
    // Remove like
    const updated = current.filter((id) => id !== recordId);
    return {
      metadata: { ...metadata, [table]: updated },
      liked: false,
    };
  } else {
    // Add like
    const updated = [...current, recordId];
    return {
      metadata: { ...metadata, [table]: updated },
      liked: true,
    };
  }
}

/**
 * Check if a record is liked in the metadata.
 */
export function isRecordLiked(
  metadata: LikesMetadata,
  table: LikesTableKey,
  recordId: string
): boolean {
  const current = ensureArray(metadata[table]);
  return current.includes(recordId);
}
