export type LikesTableKey = "books" | "ashaar" | "ghazlen" | "nazmen" | "rubai";

export interface LikesMetadata {
  books?: string[];
  ashaar?: string[];
  ghazlen?: string[];
  nazmen?: string[];
  rubai?: string[];
  shaer?: string[];
}

function ensureArray(arr?: unknown): string[] {
  if (!arr) return [];
  if (Array.isArray(arr)) return arr.map(String);
  return [];
}

// Map Airtable table names or storage keys to LikesTableKey
export function mapTableToLikesKey(tableOrStorageKey: string): LikesTableKey {
  const key = tableOrStorageKey.toLowerCase();
  if (key.includes("book")) return "books";
  if (key.includes("ashaar") || key.includes("ashar")) return "ashaar";
  if (key.includes("ghazlen") || key.includes("ghazal")) return "ghazlen";
  if (key.includes("nazm")) return "nazmen";
  if (key.includes("rubai")) return "rubai";
  return "ashaar";
}

// Client-side migration helper: moves localStorage likes into Clerk metadata via API
export async function migrateLocalStorageLikes(userId?: string): Promise<{ migrated: boolean }> {
  if (typeof window === "undefined") return { migrated: false };
  try {
    // Prevent repeated migrations
    const FLAG = "likes_migrated_v1";
    if (localStorage.getItem(FLAG)) return { migrated: false };

    const storageKeys = ["Ghazlen", "Ashaar", "Nazmen", "Books", "Rubai"]; // common keys in app
    const likes: LikesMetadata = {};
    for (const sk of storageKeys) {
      const raw = localStorage.getItem(sk);
      if (!raw) continue;
      try {
        const list = JSON.parse(raw) as Array<{ id?: string } & Record<string, any>>;
        const ids = list
          .map((x) => x?.id || (x as any)?.fields?.id)
          .filter(Boolean) as string[];
        const lk = mapTableToLikesKey(sk);
        (likes as any)[lk] = Array.from(new Set([...(likes as any)[lk] ?? [], ...ids]));
      } catch {}
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
      localStorage.setItem(FLAG, "1");
      return { migrated: true };
    }
  } catch (e) {
    console.warn("likes migration failed", e);
  }
  return { migrated: false };
}
