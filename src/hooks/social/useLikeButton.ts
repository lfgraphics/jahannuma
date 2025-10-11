"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export interface UseLikeButtonOptions {
  table: string;
  recordId: string;
  currentLikes?: number;
  onChange?: (args: { id: string; liked: boolean; likes: number }) => void;
}

export interface UseLikeButtonReturn {
  isLiked: boolean;
  isDisabled: boolean;
  likesCount: number;
  handleLikeClick: () => Promise<void>;
  isLoading: boolean;
}

export function useLikeButton(
  options: UseLikeButtonOptions
): UseLikeButtonReturn {
  const { table, recordId, currentLikes = 0, onChange } = options;
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(currentLikes);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load initial like status from user metadata
  useEffect(() => {
    if (user?.publicMetadata) {
      const userLikes = (user.publicMetadata as any)?.likes?.[table] || [];
      setIsLiked(userLikes.includes(recordId));
    }
  }, [user?.publicMetadata, table, recordId]);

  // Update likes count when prop changes
  useEffect(() => {
    setLikesCount(currentLikes);
  }, [currentLikes]);

  const handleLikeClick = useCallback(async () => {
    if (!isSignedIn || !user) {
      toast.error("براہ کرم لاگ ان کریں");
      return;
    }

    if (isDisabled) return;

    setIsDisabled(true);
    setIsLoading(true);

    // Optimistic update
    const newLiked = !isLiked;
    const newCount = newLiked ? likesCount + 1 : Math.max(0, likesCount - 1);

    setIsLiked(newLiked);
    setLikesCount(newCount);

    try {
      // Call the user likes API
      const response = await fetch("/api/user/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          action: "toggle",
          table,
          recordId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Like failed: ${response.status}`);
      }

      const result = await response.json();
      const serverLiked = !!result.liked;
      const serverCount =
        typeof result.count === "number" ? result.count : newCount;

      // Update with server response
      setIsLiked(serverLiked);
      setLikesCount(serverCount);

      // Update the record in Airtable
      const updateResponse = await fetch(`/api/airtable/${table}/${recordId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: { likes: serverCount },
        }),
      });

      if (!updateResponse.ok) {
        console.warn("Failed to update Airtable likes count");
      }

      // Revalidate relevant SWR caches
      await mutate(
        (key: any) =>
          typeof key === "string" && key.includes(`/api/airtable/${table}`),
        undefined,
        { revalidate: true }
      );

      // Success feedback
      toast.success(
        serverLiked ? "Added to favorites!" : "Removed from favorites!"
      );

      // Notify onChange callback
      if (onChange) {
        onChange({ id: recordId, liked: serverLiked, likes: serverCount });
      }

      // Reload user data to update metadata
      await user.reload();
    } catch (error) {
      // Rollback optimistic update
      setIsLiked(!newLiked);
      setLikesCount(currentLikes);

      console.error("Like operation failed:", error);
      toast.error("Operation failed. Please try again.");
    } finally {
      setIsDisabled(false);
      setIsLoading(false);
    }
  }, [
    isSignedIn,
    user,
    isDisabled,
    isLiked,
    likesCount,
    table,
    recordId,
    currentLikes,
    onChange,
  ]);

  return {
    isLiked,
    isDisabled,
    likesCount,
    handleLikeClick,
    isLoading,
  };
}
