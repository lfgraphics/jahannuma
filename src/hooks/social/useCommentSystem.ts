"use client";
import type { CommentFormData, CommentRecord } from "@/types";
import { useAuth, useUser } from "@clerk/nextjs";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import useSWR, { mutate } from "swr";

export interface UseCommentSystemOptions {
  recordId?: string | null;
}

export interface UseCommentSystemReturn {
  comments: CommentRecord[];
  isLoading: boolean;
  isSubmitting: boolean;
  submitComment: (content: string) => Promise<void>;
  commentorName: string | null;
  isAuthenticated: boolean;
  setRecordId: (id: string | null) => void;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  return response.json();
};

export function useCommentSystem(
  options: UseCommentSystemOptions = {}
): UseCommentSystemReturn {
  const [currentRecordId, setRecordId] = useState<string | null>(
    options.recordId ?? null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  // Fetch comments for the current record
  const commentsKey = currentRecordId
    ? `/api/airtable/comments?dataId=${encodeURIComponent(currentRecordId)}`
    : null;

  const {
    data: commentsData,
    error,
    mutate: mutateComments,
  } = useSWR(commentsKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
  });

  const comments: CommentRecord[] = commentsData?.data?.records || [];
  const isLoading = !error && !commentsData && !!currentRecordId;

  // Get commenter name from user metadata
  const commentorName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`.trim()
      : user?.firstName || user?.lastName || user?.username || null;

  const submitComment = useCallback(
    async (content: string) => {
      if (!isSignedIn || !user) {
        toast.error("براہ کرم لاگ ان کریں");
        return;
      }

      if (!currentRecordId) {
        toast.error("No record selected for commenting");
        return;
      }

      if (!content.trim()) {
        toast.error("Comment cannot be empty");
        return;
      }

      if (!commentorName) {
        toast.error("Unable to determine commenter name");
        return;
      }

      setIsSubmitting(true);

      try {
        const commentData: CommentFormData = {
          dataId: currentRecordId,
          comment: content.trim(),
          commentorName,
        };

        const response = await fetch("/api/airtable/comments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(commentData),
        });

        if (!response.ok) {
          throw new Error(`Comment submission failed: ${response.status}`);
        }

        const result = await response.json();

        // Revalidate comments list to include the new comment
        await mutateComments();

        // Also revalidate the main record to update comment count
        await mutate(
          (key: any) =>
            typeof key === "string" && key.includes(currentRecordId),
          undefined,
          { revalidate: true }
        );

        toast.success("Comment added successfully!");
      } catch (error) {
        console.error("Comment submission failed:", error);
        toast.error("Failed to add comment. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSignedIn, user, currentRecordId, commentorName, mutateComments]
  );

  return {
    comments,
    isLoading,
    isSubmitting,
    submitComment,
    commentorName,
    isAuthenticated: !!isSignedIn,
    setRecordId,
  };
}
