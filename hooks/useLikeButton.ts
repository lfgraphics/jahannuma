"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAirtableMutation } from "./useAirtableMutation";
import { showMutationToast, generateRecordCacheKey } from "../lib/airtable-utils";
import { getMessageText } from "../lib/multilingual-texts";
import { useLanguage } from "../contexts/LanguageContext";
import type { AirtableSWRKey } from "../lib/airtable-fetcher";
import { buildAirtableCacheKey } from "../lib/airtable-fetcher";
import { getCachedRecord, getStaleCachedRecord } from "../lib/cache-utils";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { mapTableToLikesKey, type LikesMetadata, type LikesTableKey } from "../lib/user-metadata-utils";

// Module-level cache to avoid refetching likes per component
let __likesCache: { userId: string; data: LikesMetadata } | null = null;
// Deduped background fetch state to avoid many components spamming fresh likes fetch
let __likesFreshInflight: Promise<LikesMetadata> | null = null;
let __likesFreshLastAt = 0;

export class AuthRequiredError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

/**
 * Hook: useLikeButton
 *
 * Contract
 * - Requires an authenticated Clerk user (throws AuthRequiredError if not signed in)
 * - Uses Clerk publicMetadata.likes as the single source of truth; NO localStorage fallback
 * - Maintains a small in-memory cache per-session to avoid redundant reads
 * - Optimistically updates UI and persists count to Airtable; SWR revalidation converges to server truth
 */
/**
 * UseLikeButton options
 * - swrKey: Pass the exact SWR key object returned by useAirtableList/useAirtableRecord
 *   (e.g., { kind: 'list' | 'record', baseId, table, ... }). Strings are also accepted but
 *   objects are preferred for precise invalidation.
 */
interface UseLikeButtonOptions {
  baseId: string;
  table: string;
  storageKey: string;
  recordId: string;
  currentLikes?: number;
  swrKey?: AirtableSWRKey | string | null | undefined;
  onChange?: (args: { id: string; liked: boolean; likes: number }) => void;
}

interface UseLikeButtonReturn {
  isLiked: boolean;
  isDisabled: boolean;
  likesCount: number;
  handleLikeClick: () => Promise<void>;
  isHydratingLikes: boolean;
}

export function useLikeButton(opts: UseLikeButtonOptions): UseLikeButtonReturn {
  const { language } = useLanguage();
  const { baseId, table, storageKey, recordId, currentLikes = 0, swrKey, onChange } = opts;
  const { updateRecord } = useAirtableMutation(baseId, table);
  const { isSignedIn } = useAuth();
  const { user, isLoaded } = useUser();

  const likeKeyMeta = useMemo(() => {
    try {
      const key = mapTableToLikesKey(storageKey || table, { strict: true });
      return { key, error: false as const };
    } catch (e) {
      return { key: "ashaar" as LikesTableKey, error: true as const };
    }
  }, [storageKey, table]);
  const likeKey = likeKeyMeta.key;
  const initialLiked = useMemo(() => {
    if (typeof window === "undefined") return false;
    // Prefer in-memory cache first
    if (user?.id && __likesCache && __likesCache.userId === user.id) {
  const set = new Set((__likesCache.data[likeKey as keyof LikesMetadata] as string[] | undefined) || []);
      return set.has(recordId);
    }
    // Fallback to current user.publicMetadata.likes inline (no network)
    const likes = (user?.publicMetadata as any)?.likes as LikesMetadata | undefined;
    if (likes && (likes as any)[likeKey as keyof LikesMetadata]) {
      const arr = new Set(((likes as any)[likeKey as keyof LikesMetadata] as string[]) || []);
      return arr.has(recordId);
    }
    return false;
  }, [user?.id, user?.publicMetadata, likeKey, recordId]);

  const [isLiked, setLiked] = useState<boolean>(initialLiked);
  const [likesCount, setLikesCount] = useState<number>(currentLikes);
  const [isDisabled, setDisabled] = useState<boolean>(false);
  const [isHydratingLikes, setIsHydratingLikes] = useState<boolean>(false);
  const lastClickAtRef = useRef<number>(0);
  const snapshotRef = useRef<{ liked: boolean; count: number; cache: LikesMetadata | null } | null>(null);
  const hydratedRef = useRef<boolean>(false);
  // Hydrate from current user.publicMetadata or in-memory cache (no backend call)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof window === "undefined") return;
      if (!isSignedIn || !user?.id || !isLoaded) {
        if (!cancelled) setIsHydratingLikes(false);
        return;
      }
      try {
        setIsHydratingLikes(true);
        // Refresh in-memory cache from current user claims/publicMetadata
        const likesFromUser = ((user?.publicMetadata as any)?.likes || {}) as LikesMetadata;
        if (!__likesCache || __likesCache.userId !== user.id) {
          __likesCache = { userId: user.id, data: likesFromUser };
        } else {
          __likesCache.data = likesFromUser;
        }
        const set = new Set(__likesCache?.data?.[likeKey] || []);
        if (!cancelled) setLiked(set.has(recordId));
        hydratedRef.current = true;
      } catch { }
      finally {
        if (!cancelled) setIsHydratingLikes(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, isLoaded, user?.id, likeKey, recordId]);

  // Background confirm with server to avoid stale claims
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof window === "undefined") return;
      if (!isSignedIn || !user?.id || !isLoaded) return;
      try {
        // Throttle to at most once per 3s globally; and dedupe concurrent requests
        const now = Date.now();
        if (!__likesFreshInflight && now - __likesFreshLastAt > 3000) {
          __likesFreshInflight = (async () => {
            const res = await fetch("/api/user/likes?fresh=true", { credentials: "include" });
            if (!res.ok) throw new Error("fresh likes failed");
            type LikesGetResponse = { likes: LikesMetadata; timestamp?: number };
            const j = (await res.json().catch(() => ({}))) as Partial<LikesGetResponse>;
            const serverLikes = (j && (j as any).likes) ? (j as any).likes as LikesMetadata : ({} as LikesMetadata);
            __likesFreshLastAt = Date.now();
            return serverLikes;
          })().finally(() => {
            // small delay before allowing next fetch to coalesce callers
            setTimeout(() => { __likesFreshInflight = null; }, 0);
          });
        }
        const serverLikes = __likesFreshInflight ? await __likesFreshInflight : (__likesCache?.data || (user?.publicMetadata as any)?.likes || ({} as LikesMetadata));
  const localArr = ((__likesCache?.userId === user.id ? (__likesCache?.data as any)?.[likeKey as keyof LikesMetadata] : undefined) as string[] | undefined) || [];
  const serverArr = ((serverLikes as any)?.[likeKey as keyof LikesMetadata] as string[] | undefined) || [];
        const localSet = new Set(localArr);
        const serverSet = new Set(serverArr);
        let changed = localSet.size !== serverSet.size;
        if (!changed) {
          for (const v of serverSet) { if (!localSet.has(v)) { changed = true; break; } }
        }
        if (!__likesCache || __likesCache.userId !== user.id || changed) {
          __likesCache = { userId: user.id, data: serverLikes };
          const set = new Set(((serverLikes as any)?.[likeKey as keyof LikesMetadata] as string[] | undefined) || []);
          if (!cancelled) setLiked(set.has(recordId));
        }
      } catch { }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, isLoaded, user?.id]);

  // keep likesCount in sync if parent sends a different currentLikes later
  useEffect(() => {
    setLikesCount(currentLikes);
    // we intentionally do not resync isLiked to avoid overriding user actions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLikes]);

  const handleLikeClick = async () => {
    if (!isLoaded) return; // avoid race conditions on initial mount
    if (likeKeyMeta.error) {
      toast.error("غلطی: اس سیکشن کیلئے پسند محفوظ نہیں ہو سکتی");
      return;
    }
    if (!isSignedIn || !user?.id) {
      // no-op with gentle prompt, avoid throwing to prevent UI errors
      toast.error("براہ کرم لاگ ان کریں");
      return;
    }
    if (isDisabled) return;
    const now = Date.now();
    if (now - (lastClickAtRef.current || 0) < 300) {
      // debounce rapid clicks
      return;
    }
    lastClickAtRef.current = now;
    setDisabled(true);

    // Optimistically flip local like and count, then patch server
    const prevLiked = isLiked;
    const prevCount = likesCount;
    const currentLikesMeta: LikesMetadata = (__likesCache?.data || (user.publicMetadata as any)?.likes || {}) as LikesMetadata;
  const setLocal = new Set<string>(((currentLikesMeta as any)?.[likeKey as keyof LikesMetadata] as string[] | undefined) || []);
    const likedNow = !setLocal.has(recordId);
    if (likedNow) setLocal.add(recordId); else setLocal.delete(recordId);
    const nextLikes: LikesMetadata = {
      ...(currentLikesMeta as any),
      books: (currentLikesMeta.books ?? []),
      ashaar: (currentLikesMeta.ashaar ?? []),
      ghazlen: (currentLikesMeta.ghazlen ?? []),
      nazmen: (currentLikesMeta.nazmen ?? []),
      rubai: (currentLikesMeta.rubai ?? []),
      shaer: (currentLikesMeta.shaer ?? []),
    };
  (nextLikes as any)[likeKey as keyof LikesMetadata] = Array.from(setLocal);
    snapshotRef.current = { liked: prevLiked, count: prevCount, cache: __likesCache?.data ? JSON.parse(JSON.stringify(__likesCache.data)) : null };

    const toastId = toast.loading(getMessageText("likeProcessing" as any, language as any) || "Processing...");
    try {
      // Optimistic local update before network
      setLiked(likedNow);
      const delta = likedNow ? 1 : -1;
      setLikesCount((c) => Math.max(0, (c ?? 0) + delta));

      // Persist via internal API
      const apiRes = await fetch("/api/user/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "toggle", table: likeKey, recordId }),
      });
      if (!apiRes.ok) {
        // Surface server error to trigger rollback
        if (apiRes.status === 429) {
          const msg429 = getMessageText("rateLimited" as any, language as any) || "زیادہ درخواستیں، براہ کرم کچھ دیر بعد کوشش کریں";
          const err = new Error(msg429);
          (err as any).status = 429;
          throw err;
        }
        const msg = await apiRes.text().catch(() => "toggle failed");
        const err = new Error(msg || "toggle failed");
        (err as any).status = apiRes.status;
        throw err;
      }
      const j = await apiRes.json().catch(() => ({}));
      const likedNowServer: boolean = !!j?.liked;
      const countServer: number | undefined = typeof j?.count === 'number' ? j.count : undefined;
      const serverLikes: LikesMetadata | undefined = j?.likes as LikesMetadata | undefined;

      // Update local likes cache
      try {
        if (user?.id) {
          if (serverLikes) {
            __likesCache = { userId: user.id, data: serverLikes };
          } else {
            __likesCache = { userId: user.id, data: nextLikes };
          }
        }
      } catch { }

      // Persist to Airtable
      // NOTE on concurrency: This uses previous local count as a base. Under concurrent toggles
      // from multiple clients, this may drift until revalidation completes. For strict accuracy,
      // consider fetching the latest record before computing nextServerLikes or using a server API
      // that supports atomic increments. We rely on SWR revalidation to converge to server truth.

      // Try to derive the freshest server base likes value
      let serverBaseLikes = prevCount ?? 0;
      try {
        // 1) Prefer record cache via simplified record key
        const simpleRecordKey = generateRecordCacheKey(baseId, table, recordId);
        const cachedSimple = getCachedRecord<any>(simpleRecordKey) ?? getStaleCachedRecord<any>(simpleRecordKey);
        let likeFromCache = cachedSimple?.fields?.likes ?? cachedSimple?.likes;
        // 2) Fallback: if we have an exact record SWR key, use that cache entry
        if (typeof likeFromCache !== 'number' && swrKey && typeof swrKey === 'object' && (swrKey as any).kind === 'record') {
          const exactCacheKey = buildAirtableCacheKey(swrKey as AirtableSWRKey);
          const cachedExact = getCachedRecord<any>(exactCacheKey) ?? getStaleCachedRecord<any>(exactCacheKey);
          likeFromCache = cachedExact?.fields?.likes ?? cachedExact?.likes;
        }
        if (typeof likeFromCache === 'number') {
          serverBaseLikes = likeFromCache;
        }
      } catch { }

  const nextServerLikes = typeof countServer === 'number' ? countServer : Math.max(0, (serverBaseLikes ?? 0) + delta);
      const recordKey = generateRecordCacheKey(baseId, table, recordId);
      const normalizedKey = swrKey && typeof swrKey === 'object' ? swrKey : (swrKey || undefined);
      await updateRecord([
        { id: recordId, fields: { likes: nextServerLikes } },
      ], {
        // We'll rely on local state for instant feedback; trigger global revalidation afterwards
        optimistic: false,
        affectedKeys: [normalizedKey, recordKey].filter(Boolean) as any,
      });
      // Only show success after both the toggle API and Airtable update succeed
      toast.success(
        likedNow
          ? (getMessageText("likeAdded" as any, language as any) || "Added to favorites!")
          : (getMessageText("likeRemoved" as any, language as any) || "Removed from favorites!"),
        { id: toastId }
      );
      // Inform listeners/analytics
      const finalLiked = typeof likedNowServer === 'boolean' ? likedNowServer : likedNow;
      if (finalLiked !== likedNow) {
        // reconcile UI with server truth if mismatch
        setLiked(finalLiked);
        setLikesCount(nextServerLikes);
        console.warn("Optimistic like mismatch; reconciled with server state", { recordId, likeKey, finalLiked });
      }
      if (onChange) onChange({ id: recordId, liked: finalLiked, likes: nextServerLikes });
      try {
        document.dispatchEvent(new CustomEvent("likes-updated", { detail: { table: likeKey, id: recordId, liked: finalLiked, allLikes: __likesCache?.data } }));
      } catch { }

      // Give backend a moment to propagate, then refresh Clerk session claims
      try {
        await new Promise((r) => setTimeout(r, 100));
        await user?.reload?.();
      } catch {}
    } catch (e) {
      // Inspect structured error to decide if toggle succeeded but Airtable update failed
      const status = (e as any)?.status as number | undefined;
      let parsed: any = null;
      try { parsed = JSON.parse((e as any)?.message || ''); } catch {}
      const partialOk = parsed && typeof parsed === 'object' && (parsed.liked === true || parsed.liked === false) && parsed.code === 'AIRTABLE_UPDATE_FAILED';
      if (partialOk) {
        // Keep liked state; inform user count sync failed and will retry via revalidation
        toast.warning("پسند محفوظ ہوگئی، لیکن گنتی کی ہم آہنگی میں مسئلہ آیا—کچھ دیر بعد از خود درست ہو جائے گی");
        // Do not rollback UI; allow SWR to converge
        setDisabled(false);
        toast.dismiss(toastId);
        return;
      }
      // Otherwise rollback local state
      setLiked(prevLiked);
      setLikesCount(prevCount);
      if (snapshotRef.current && __likesCache?.data && user?.id) {
        try {
          __likesCache = { userId: user.id, data: snapshotRef.current.cache || (__likesCache.data as any) };
        } catch {}
      }
      try { document.dispatchEvent(new CustomEvent("likes-rollback", { detail: { table: likeKey, id: recordId } })); } catch {}
      let errMsg = getMessageText("error" as any, language as any) || "Something went wrong";
  if (status === 401) errMsg = "براہ کرم لاگ ان کریں";
      else if (status === 409) errMsg = "براہ کرم انتظار کریں، پچھلی کارروائی جاری ہے";
  else if (status === 429) errMsg = "زیادہ درخواستیں، براہ کرم کچھ دیر بعد کوشش کریں";
      else if (!navigator.onLine) errMsg = "اتصال میں خرابی، دوبارہ کوشش کریں";

      // Show a toast with a Retry action
      const doRetry = async () => {
        let delay = 1000;
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const apiRes = await fetch("/api/user/likes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ action: "toggle", table: likeKey, recordId }),
            });
            if (!apiRes.ok) throw new Error(`retry failed ${apiRes.status}`);
            const j = await apiRes.json().catch(() => ({}));
            const serverLikes: LikesMetadata | undefined = j?.likes as LikesMetadata | undefined;
            const likedNowServer: boolean = !!j?.liked;
            const countServer: number | undefined = typeof j?.count === 'number' ? j.count : undefined;
            if (user?.id && serverLikes) __likesCache = { userId: user.id, data: serverLikes };
            setLiked(likedNowServer);
            if (typeof countServer === 'number') setLikesCount(countServer);
            try { document.dispatchEvent(new CustomEvent("likes-updated", { detail: { table: likeKey, id: recordId, liked: likedNowServer, allLikes: __likesCache?.data } })); } catch {}
            toast.success(likedNowServer ? (getMessageText("likeAdded" as any, language as any) || "Added to favorites!") : (getMessageText("likeRemoved" as any, language as any) || "Removed from favorites!"));
            return;
          } catch {
            await new Promise((r) => setTimeout(r, delay));
            delay *= 2;
          }
        }
        toast.error(getMessageText("error" as any, language as any) || "Something went wrong");
      };
      toast.error(errMsg, {
        id: toastId,
        action: status === 429 ? undefined : {
          label: "Retry",
          onClick: doRetry,
        },
      });
    } finally {
      setDisabled(false);
    }
  };

  return { isLiked, isDisabled: isDisabled || likeKeyMeta.error, likesCount, handleLikeClick, isHydratingLikes };
}
