"use client";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableCreate } from "@/hooks/useAirtableCreate";
import { buildDataIdFilter } from "@/lib/airtable-utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMessageText } from "@/lib/multilingual-texts";
import { toast } from "sonner";
import type { AirtableRecord, CommentRecord } from "@/app/types";
import { useAuth, useUser } from "@clerk/nextjs";

export class AuthRequiredError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthRequiredError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export type UseCommentSystemReturn = {
  comments: CommentRecord[];
  isLoading: boolean;
  submitComment: (args: { recordId: string; content: string; commentorName?: string }) => Promise<void>;
  commentorName: string | null;
  isAuthenticated: boolean;
  setRecordId: (id: string | null) => void;
};

/**
 * Centralized comment system hook using Airtable + Clerk user info (name) via caller.
 *
 * NOTE: Authentication gating is expected to be handled by the caller via useAuthGuard.
 */
export function useCommentSystem(baseId: string, table: string, recordId?: string | null): UseCommentSystemReturn {
  const [currentRecordId, setRecordId] = useState<string | null>(recordId ?? null);
  const [localComments, setLocalComments] = useState<CommentRecord[]>([]);
  const [isSubmitting, setSubmitting] = useState(false);
  const [commentorName, setCommentorName] = useState<string | null>(null);
  const { language } = useLanguage();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  // Fetch comments for the active recordId
  const filter = useMemo(() => (currentRecordId ? buildDataIdFilter(currentRecordId) : undefined), [currentRecordId]);
  const { records, isLoading, mutate } = useAirtableList<AirtableRecord<CommentRecord>>(baseId, table, {
    filterByFormula: filter,
    pageSize: 30,
  }, { enabled: !!currentRecordId });

  // Sync SWR records -> local state
  useEffect(() => {
    if (!records) return;
    const list = (records || []).map((r) => r.fields) as CommentRecord[];
    setLocalComments(list);
  }, [records]);

  // Derive display name from Clerk user, enforce non-anonymous
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && user) {
      const name = user.fullName || user.username || user.primaryEmailAddress?.emailAddress || user.id || "Anonymous";
      setCommentorName(name);
    } else {
      setCommentorName(null);
    }
  }, [isLoaded, isSignedIn, user]);

  const isAuthenticated = !!isSignedIn;

  const { createRecord } = useAirtableCreate(baseId, table);

  const submitComment = useCallback(async ({ recordId, content, commentorName: nameOverride }: { recordId: string; content: string; commentorName?: string; }) => {
    if (!recordId) throw new ValidationError("Missing recordId");
    if (!content || content.trim().length === 0) throw new ValidationError("Comment cannot be empty");
    // Enforce authenticated commenter with a resolvable name
  const resolvedName = nameOverride ?? (commentorName ?? (isSignedIn && user ? (user.fullName || user.username || user.primaryEmailAddress?.emailAddress || user.id || "Anonymous") : null));
    if (!isSignedIn || !resolvedName || resolvedName.trim().length === 0) {
      // Surface a consistent error for callers to handle (e.g., redirect via guard)
      throw new AuthRequiredError("Sign in required to comment");
    }
    const processing = getMessageText("commentProcessing" as any, language) || "Submitting comment...";
    const successMsg = getMessageText("commentSubmitted" as any, language) || "Comment submitted successfully";
    const failedMsg = getMessageText("commentFailed" as any, language) || "Failed to submit comment";

    const id = toast.loading(processing);
    setSubmitting(true);
    // Generate a stable client-only identifier and ISO timestamp for consistent rollback matching
    const clientId = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const formatted = new Date().toISOString();
    const optimistic: CommentRecord & { clientId?: string } = { dataId: recordId, commentorName: resolvedName, timestamp: formatted, comment: content, clientId };

    // Optimistically append
    setLocalComments((prev) => [...prev, optimistic]);

    try {
  // Do not persist clientId to server; send only fields expected by schema
  const { clientId: _omit, ...toPersist } = optimistic as any;
  await createRecord([{ fields: toPersist }]);
      // Align SWR cache lazily by revalidation; local optimistic stays
      try { await mutate(); } catch {}
      toast.success(successMsg, { id });
    } catch (e) {
  // Rollback optimistic append using the stable clientId key
  setLocalComments((prev) => prev.filter((c: any) => c.clientId ? c.clientId !== clientId : !(c.dataId === optimistic.dataId && c.timestamp === optimistic.timestamp && c.comment === optimistic.comment)));
      toast.error(failedMsg, { id });
      throw e;
    } finally {
      setSubmitting(false);
    }
  }, [commentorName, createRecord, language, mutate, isSignedIn]);

  return {
    comments: localComments,
    isLoading: isLoading || isSubmitting,
    submitComment,
    commentorName,
    isAuthenticated,
    setRecordId,
  } as const;
}
