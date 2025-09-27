"use client";
import { useEffect, useMemo, useState } from "react";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import { getLikedItems, toggleLikedItem, showMutationToast, generateRecordCacheKey } from "@/lib/airtable-utils";

interface UseLikeButtonOptions {
  baseId: string;
  table: string;
  storageKey: string;
  recordId: string;
  currentLikes?: number;
  swrKey?: any;
  onChange?: (args: { id: string; liked: boolean; likes: number }) => void;
}

interface UseLikeButtonReturn {
  isLiked: boolean;
  isDisabled: boolean;
  likesCount: number;
  handleLikeClick: () => Promise<void>;
}

export function useLikeButton(opts: UseLikeButtonOptions): UseLikeButtonReturn {
  const { baseId, table, storageKey, recordId, currentLikes = 0, swrKey, onChange } = opts;
  const { updateRecord } = useAirtableMutation(baseId, table);

  const initialLiked = useMemo(() => {
    try {
      const items = getLikedItems<{ id: string }>(storageKey);
      return items.some((i) => i.id === recordId);
    } catch {
      return false;
    }
  }, [storageKey, recordId]);

  const [isLiked, setLiked] = useState<boolean>(initialLiked);
  const [likesCount, setLikesCount] = useState<number>(currentLikes);
  const [isDisabled, setDisabled] = useState<boolean>(false);

  // keep likesCount in sync if parent sends a different currentLikes later
  useEffect(() => {
    setLikesCount(currentLikes);
    // we intentionally do not resync isLiked to avoid overriding user actions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLikes]);

  const handleLikeClick = async () => {
    if (isDisabled) return;
    setDisabled(true);

    // Optimistically flip local like and count, then patch server
    const prevLiked = isLiked;
    const prevCount = likesCount;

    try {
      // Update localStorage and determine final liked state
      const res = toggleLikedItem(storageKey, { id: recordId });
  const likedNow = res.liked; // reflects actual toggled result

      // Local optimistic UI update
      setLiked(likedNow);
  const delta = likedNow ? 1 : -1;
  setLikesCount((c) => Math.max(0, (c ?? 0) + delta));

      showMutationToast(
        likedNow ? "success" : "warning",
        likedNow
          ? "آئٹم کامیابی کے ساتھ آپ کی پروفائل میں شامل کر دیا گیا ہے۔"
          : "آئٹم آپ کی پروفائل سے ہٹا دیا گیا ہے۔"
      );

      // Persist to Airtable
      const nextServerLikes = Math.max(0, (prevCount ?? 0) + delta);
      const recordKey = generateRecordCacheKey(baseId, table, recordId);
      await updateRecord([
        { id: recordId, fields: { likes: nextServerLikes } },
      ], {
        // We'll rely on local state for instant feedback; trigger global revalidation afterwards
        optimistic: false,
        affectedKeys: [swrKey, recordKey].filter(Boolean) as any,
      });
      // Inform listeners/analytics
      if (onChange) onChange({ id: recordId, liked: likedNow, likes: nextServerLikes });
    } catch (e) {
      // Rollback local state
      try { toggleLikedItem(storageKey, { id: recordId }); } catch {}
      setLiked(prevLiked);
      setLikesCount(prevCount);
      showMutationToast("error", "لائیک اپڈیٹ میں مسئلہ آیا۔");
    } finally {
      setDisabled(false);
    }
  };

  return { isLiked, isDisabled, likesCount, handleLikeClick };
}
