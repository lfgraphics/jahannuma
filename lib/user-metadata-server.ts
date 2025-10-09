import { clerkClient, auth } from "@clerk/nextjs/server";
import type { LikesMetadata, LikesTableKey } from "./user-metadata-utils";
import { validateLikesMetadata } from "./user-metadata-utils";

type usersMetadata = {
  likes?: LikesMetadata;
};
// Provide a minimal typed view of the Clerk client to avoid pervasive `any` casts
type MinimalClerkUsers = {
  getUser: (userId: string) => Promise<{ publicMetadata?: Record<string, unknown> } | null>;
  updateUser: (userId: string, data: { publicMetadata?: Record<string, unknown> }) => Promise<unknown>;
  updateUserMetadata?: (userId: string, data: { publicMetadata?: Record<string, unknown> }) => Promise<unknown>;
};
type MinimalClerkClient = { users: MinimalClerkUsers };
async function getClerkUsers(): Promise<MinimalClerkUsers> {
  const anyClient = clerkClient as unknown as any;
  if (typeof anyClient === 'function') {
    // Some Clerk SDK versions export a function returning a client
    const c = await anyClient();
    return (c as any).users as MinimalClerkUsers;
  }
  return (anyClient as any).users as MinimalClerkUsers;
}

// Minimal deep merge for plain objects; arrays are replaced by right-hand side
function deepMerge<T extends Record<string, any>, U extends Record<string, any>>(a: T, b: U): T & U {
  const out: any = { ...a };
  for (const [k, v] of Object.entries(b)) {
    const prev = (out as any)[k];
    if (prev && typeof prev === 'object' && !Array.isArray(prev) && v && typeof v === 'object' && !Array.isArray(v)) {
      (out as any)[k] = deepMerge(prev, v as any);
    } else {
      (out as any)[k] = v;
    }
  }
  return out as T & U;
}

// Simple per-user concurrency guard to avoid overlapping writes
const userLocks = new Map<string, Promise<any>>();

async function withUserLock<T>(userId: string, task: () => Promise<T>, { rejectOnBusy = true }: { rejectOnBusy?: boolean } = {}): Promise<T> {
  if (!userId) throw new Error("userId required");
  const inFlight = userLocks.get(userId);
  if (inFlight) {
    if (rejectOnBusy) {
      const err = new Error("CONCURRENT_UPDATE");
      (err as any).code = "CONCURRENT_UPDATE";
      throw err;
    } else {
      // wait for previous to finish before proceeding
      await inFlight.catch(() => undefined);
    }
  }
  let resolveRun!: (value: T | PromiseLike<T>) => void;
  let rejectRun!: (reason?: any) => void;
  const runPromise = new Promise<T>((resolve, reject) => { resolveRun = resolve; rejectRun = reject; });
  userLocks.set(userId, runPromise as unknown as Promise<any>);
  (async () => {
    try {
      const result = await task();
      resolveRun(result);
    } catch (e) {
      rejectRun(e);
    } finally {
      if (userLocks.get(userId) === (runPromise as unknown as Promise<any>)) userLocks.delete(userId);
    }
  })();
  return runPromise;
}

export async function getUserLikes(): Promise<LikesMetadata> {
  // Read likes from session claims (no backend hit) if available
  try {
    const { sessionClaims, userId } = await auth();
    // Clerk typically exposes custom claims at sessionClaims, not under metadata
    const likes = (sessionClaims as any)?.likes as LikesMetadata | undefined;
    // NOTE: This fast-path requires Clerk custom claims to include a `likes` object.
    // If not configured or missing, we'll fall back to a fresh Clerk fetch below.
    const fast: LikesMetadata = {
      books: Array.isArray(likes?.books) ? likes.books.map(String) : [],
      ashaar: Array.isArray(likes?.ashaar) ? likes.ashaar.map(String) : [],
      ghazlen: Array.isArray(likes?.ghazlen) ? likes.ghazlen.map(String) : [],
      nazmen: Array.isArray(likes?.nazmen) ? likes.nazmen.map(String) : [],
      rubai: Array.isArray(likes?.rubai) ? likes.rubai.map(String) : [],
      shaer: Array.isArray(likes?.shaer) ? likes.shaer.map(String) : [],
    };
    // Fallback to fresh fetch only when `likes` is missing or not an object.
    // When `likes` exists but arrays are empty, honor claims fast-path to avoid extra fetches by default.
    if ((!(likes && typeof likes === 'object')) && userId) {
      try {
        const users = await getClerkUsers();
        const user = await users.getUser(userId);
        const pmLikes = (user?.publicMetadata as usersMetadata | undefined)?.likes as LikesMetadata | undefined;
        return {
          books: Array.isArray(pmLikes?.books) ? pmLikes.books.map(String) : [],
          ashaar: Array.isArray(pmLikes?.ashaar) ? pmLikes.ashaar.map(String) : [],
          ghazlen: Array.isArray(pmLikes?.ghazlen) ? pmLikes.ghazlen.map(String) : [],
          nazmen: Array.isArray(pmLikes?.nazmen) ? pmLikes.nazmen.map(String) : [],
          rubai: Array.isArray(pmLikes?.rubai) ? pmLikes.rubai.map(String) : [],
          shaer: Array.isArray(pmLikes?.shaer) ? pmLikes.shaer.map(String) : [],
        };
      } catch {
        // swallow and return fast path
      }
    }
    // Optional: If configured, perform a one-time fresh read when likes exists but is empty
    if (FRESH_WHEN_EMPTY && userId) {
      const hasAny = Object.values(fast).some((arr) => Array.isArray(arr) && arr.length > 0);
      if (!hasAny) {
        const now = Date.now();
        const nextAllowedAt = emptyFetchDebounce.get(userId) || 0;
        if (now >= nextAllowedAt) {
          try {
            const fresh = await refreshUserLikes(userId);
            emptyFetchDebounce.set(userId, now + EMPTY_FETCH_TTL_MS);
            return fresh;
          } catch {
            // ignore and fall through to fast
          }
        }
      }
    }
    return fast;
  } catch {
    // If auth/sessionClaims is unavailable for any reason, return empty likes
    return { books: [], ashaar: [], ghazlen: [], nazmen: [], rubai: [], shaer: [] };
  }
}

// Tiny 5s TTL cache for fresh reads to avoid hammering Clerk
const FRESH_CACHE_TTL_MS = 5000;
const FRESH_CACHE_MAX_ENTRIES = 500; // cap to avoid unbounded growth in large multi-user sessions
const freshCache = new Map<string, { data: LikesMetadata; expires: number }>();
// Optional: when claims.likes exists but is empty, perform a one-time fresh read per user within a debounce TTL
const FRESH_WHEN_EMPTY = /^1|true|yes$/i.test(String(process.env.LIKES_FRESH_WHEN_EMPTY || ""));
const EMPTY_FETCH_TTL_MS = 60_000;
const emptyFetchDebounce = new Map<string, number>(); // userId -> nextAllowedAt

function cleanupFreshCache(now: number) {
  // Remove expired entries first
  for (const [k, v] of freshCache) {
    if (!v || v.expires <= now) freshCache.delete(k);
  }
  // If still above cap, evict oldest entries (Map preserves insertion order)
  if (freshCache.size > FRESH_CACHE_MAX_ENTRIES) {
    const overflow = freshCache.size - FRESH_CACHE_MAX_ENTRIES;
    let i = 0;
    for (const key of freshCache.keys()) {
      freshCache.delete(key);
      i += 1;
      if (i >= overflow) break;
    }
  }
}

/**
 * Always fetch the freshest likes from Clerk publicMetadata, bypassing session claims.
 * Uses a very short TTL cache (5s) to prevent excessive calls when multiple components request it.
 */
export async function refreshUserLikes(userId: string): Promise<LikesMetadata> {
  if (!userId) return { books: [], ashaar: [], ghazlen: [], nazmen: [], rubai: [], shaer: [] };
  const now = Date.now();
  cleanupFreshCache(now);
  const cached = freshCache.get(userId);
  if (cached && cached.expires > now) return cached.data;
  try {
    const users = await getClerkUsers();
    const user = await users.getUser(userId);
    const likes = (user?.publicMetadata as usersMetadata | undefined)?.likes as LikesMetadata | undefined;
    const data: LikesMetadata = {
      books: Array.isArray(likes?.books) ? likes.books.map(String) : [],
      ashaar: Array.isArray(likes?.ashaar) ? likes.ashaar.map(String) : [],
      ghazlen: Array.isArray(likes?.ghazlen) ? likes.ghazlen.map(String) : [],
      nazmen: Array.isArray(likes?.nazmen) ? likes.nazmen.map(String) : [],
      rubai: Array.isArray(likes?.rubai) ? likes.rubai.map(String) : [],
      shaer: Array.isArray(likes?.shaer) ? likes.shaer.map(String) : [],
    };
    freshCache.set(userId, { data, expires: now + FRESH_CACHE_TTL_MS });
    cleanupFreshCache(now);
    return data;
  } catch (e) {
    console.warn("refreshUserLikes failed", e);
    return { books: [], ashaar: [], ghazlen: [], nazmen: [], rubai: [], shaer: [] };
  }
}

/**
 * Persist likes to Clerk publicMetadata with deep-merge semantics.
 * Uses updateUserMetadata to avoid wiping other publicMetadata fields.
 */
export async function setUserLikes(
  userId: string,
  likes: LikesMetadata,
  options?: { skipLock?: boolean }
): Promise<{ ok: boolean }> {
  if (!userId || typeof userId !== "string") throw new Error("INVALID_USER_ID");
  const CAP = 500;
  // sanitize and enforce caps, then validate shape
  const safe: LikesMetadata = validateLikesMetadata({
    books: Array.isArray(likes?.books) ? likes.books.map(String).filter(Boolean).slice(-CAP) : [],
    ashaar: Array.isArray(likes?.ashaar) ? likes.ashaar.map(String).filter(Boolean).slice(-CAP) : [],
    ghazlen: Array.isArray(likes?.ghazlen) ? likes.ghazlen.map(String).filter(Boolean).slice(-CAP) : [],
    nazmen: Array.isArray(likes?.nazmen) ? likes.nazmen.map(String).filter(Boolean).slice(-CAP) : [],
    rubai: Array.isArray(likes?.rubai) ? likes.rubai.map(String).filter(Boolean).slice(-CAP) : [],
    shaer: Array.isArray(likes?.shaer) ? likes.shaer.map(String).filter(Boolean).slice(-CAP) : [],
  });

  const attempt = async () => {
    // Prefer updateUserMetadata when available; otherwise, fall back to updateUser with merge
    const users = await getClerkUsers();
    const now = Date.now();
    if (typeof users.updateUserMetadata === "function") {
      await users.updateUserMetadata!(userId, { publicMetadata: { likes: safe, likesUpdatedAt: now } });
    } else {
      // Merge-safe fallback to avoid overwriting unrelated publicMetadata fields
      const current = await users.getUser(userId);
      const existingPM = (current?.publicMetadata ?? {}) as Record<string, any>;
      const mergedPM = deepMerge(existingPM, { likes: safe, likesUpdatedAt: now });
      await users.updateUser(userId, { publicMetadata: mergedPM });
    }
    // Invalidate fresh cache for this user so next read is fresh
    freshCache.delete(userId);
  };

  const maxRetries = 3;
  let delay = 200;
  for (let i = 0; i < maxRetries; i++) {
    try {
      if (options?.skipLock) {
        await attempt();
        return { ok: true };
      }
      await withUserLock(userId, attempt, { rejectOnBusy: false });
      return { ok: true };
    } catch (e: any) {
      const isLast = i === maxRetries - 1;
      if (e?.code === "CONCURRENT_UPDATE") {
        // brief wait and retry
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
        continue;
      }
      if (isLast) {
        console.error("setUserLikes failed", { userId, error: e });
        throw new Error("SET_LIKES_FAILED");
      } else {
        await new Promise((r) => setTimeout(r, delay));
        delay *= 2;
      }
    }
  }
  // Safety return; loop always returns on success or throws on failure
  return { ok: true };
}

export async function toggleUserLike(userId: string, table: LikesTableKey, recordId: string) {
  if (!userId || typeof userId !== "string") throw Object.assign(new Error("INVALID_USER_ID"), { code: "INVALID_USER_ID" });
  if (!recordId || typeof recordId !== "string") throw Object.assign(new Error("MISSING_RECORD_ID"), { code: "MISSING_RECORD_ID" });
  const validTables: LikesTableKey[] = ["books", "ashaar", "ghazlen", "nazmen", "rubai", "shaer"];
  if (!validTables.includes(table)) throw Object.assign(new Error("INVALID_TABLE"), { code: "INVALID_TABLE" });

  const op = async () => {
    const current = await refreshUserLikes(userId);
    const set = new Set<string>(current[table] || []);
    let liked: boolean;
    if (set.has(recordId)) {
      set.delete(recordId);
      liked = false;
    } else {
      set.add(recordId);
      liked = true;
    }
    await setUserLikes(userId, { ...current, [table]: Array.from(set) }, { skipLock: true });
    // Read back to confirm server state
    const fresh = await refreshUserLikes(userId);
    const count = Array.isArray(fresh[table]) ? fresh[table]!.length : 0;
    const actuallyLiked = new Set(fresh[table] || []).has(recordId);
    if (actuallyLiked !== liked) {
      console.warn("toggleUserLike mismatch", { userId, table, recordId, likedLocal: liked, likedServer: actuallyLiked });
    }
    return { liked: actuallyLiked, count, likes: fresh };
  };

  return withUserLock(userId, op, { rejectOnBusy: true });
}