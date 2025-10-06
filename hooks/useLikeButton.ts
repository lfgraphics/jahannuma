"use client";
import { useEffect, useMemo, useState } from "react";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import { showMutationToast, generateRecordCacheKey } from "@/lib/airtable-utils";
import { getMessageText } from "@/lib/multilingual-texts";
import { useLanguage } from "@/contexts/LanguageContext";
import type { AirtableSWRKey } from "@/lib/airtable-fetcher";
import { buildAirtableCacheKey } from "@/lib/airtable-fetcher";
import { getCachedRecord, getStaleCachedRecord } from "@/lib/cache-utils";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { mapTableToLikesKey, type LikesMetadata } from "@/lib/user-metadata-utils";

// Module-level cache to avoid refetching likes per component
let __likesCache: { userId: string; data: LikesMetadata } | null = null;

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

  const likeKey = useMemo(() => mapTableToLikesKey(storageKey || table), [storageKey, table]);
  const initialLiked = useMemo(() => {
    if (typeof window === "undefined") return false;
    // Prefer in-memory cache first
    if (user?.id && __likesCache && __likesCache.userId === user.id) {
      const set = new Set(__likesCache.data[likeKey] || []);
      return set.has(recordId);
    }
    // Fallback to current user.publicMetadata.likes inline (no network)
    const likes = (user?.publicMetadata as any)?.likes as LikesMetadata | undefined;
    if (likes && likes[likeKey as keyof LikesMetadata]) {
      const arr = new Set((likes as any)[likeKey] as string[]);
      return arr.has(recordId);
    }
    return false;
  }, [user?.id, user?.publicMetadata, likeKey, recordId]);

  const [isLiked, setLiked] = useState<boolean>(initialLiked);
  const [likesCount, setLikesCount] = useState<number>(currentLikes);
  const [isDisabled, setDisabled] = useState<boolean>(false);
  const [isHydratingLikes, setIsHydratingLikes] = useState<boolean>(false);
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
      } catch { }
      finally {
        if (!cancelled) setIsHydratingLikes(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, isLoaded, user?.id, likeKey, recordId]);

  // keep likesCount in sync if parent sends a different currentLikes later
  useEffect(() => {
    setLikesCount(currentLikes);
    // we intentionally do not resync isLiked to avoid overriding user actions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLikes]);

  const handleLikeClick = async () => {
    if (!isLoaded) return; // avoid race conditions on initial mount
    if (!isSignedIn || !user?.id) {
      throw new AuthRequiredError();
    }
    if (isDisabled) return;
    setDisabled(true);

    // Optimistically flip local like and count, then patch server
    const prevLiked = isLiked;
    const prevCount = likesCount;

    const toastId = toast.loading(getMessageText("likeProcessing" as any, language as any) || "Processing...");
    try {
      // Determine final liked state locally and optimistically update UI immediately
      const currentLikes: LikesMetadata = (__likesCache?.data || (user.publicMetadata as any)?.likes || {}) as LikesMetadata;
      const setLocal = new Set<string>((currentLikes as any)?.[likeKey] || []);
      const likedNow = !setLocal.has(recordId);
      if (likedNow) setLocal.add(recordId); else setLocal.delete(recordId);
      // Preserve any additional likes keys by spreading existing metadata first
      const nextLikes: LikesMetadata = {
        ...(currentLikes as any),
        books: (currentLikes.books ?? []),
        ashaar: (currentLikes.ashaar ?? []),
        ghazlen: (currentLikes.ghazlen ?? []),
        nazmen: (currentLikes.nazmen ?? []),
        rubai: (currentLikes.rubai ?? []),
      };
      (nextLikes as any)[likeKey] = Array.from(setLocal);

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
        const msg = await apiRes.text().catch(() => "toggle failed");
        throw new Error(msg || "toggle failed");
      }
      let likedNowServer: boolean | undefined;
      try {
        const j = await apiRes.json().catch(() => ({}));
        if (typeof j?.liked === "boolean") likedNowServer = j.liked;
      } catch {}

      // Update local likes cache
      try {
        if (user?.id) {
          __likesCache = { userId: user.id, data: nextLikes };
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

      const nextServerLikes = Math.max(0, (serverBaseLikes ?? 0) + delta);
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
      if (onChange) onChange({ id: recordId, liked: likedNow, likes: nextServerLikes });
      try {
        document.dispatchEvent(new CustomEvent("likes-updated", { detail: { table: likeKey, id: recordId } }));
      } catch { }
    } catch (e) {
      // Rollback local state
      setLiked(prevLiked);
      setLikesCount(prevCount);
      const errMsg = getMessageText("error" as any, language as any) || "Something went wrong";
      toast.error(errMsg, { id: toastId });
    } finally {
      setDisabled(false);
    }
  };

  return { isLiked, isDisabled, likesCount, handleLikeClick, isHydratingLikes };
}
