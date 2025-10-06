"use client";
import { toast } from "sonner";
import { getMessageText, Language } from "@/lib/multilingual-texts";
import { createSlug } from "@/lib/airtable-utils";

/**
 * Social utilities for sharing and downloading.
 *
 * Important: Like and comment functionality have been migrated to dedicated hooks
 * (useLikeButton, useCommentSystem) that rely on Clerk metadata. This module intentionally
 * does NOT handle likes or comments nor use localStorage for user data.
 */

export async function handleShare(url: string, title: string, text: string, language: Language) {
  try {
    if (navigator.share) {
      await navigator.share({ url, title, text });
      toast.success(getMessageText("success", language));
      return true;
    }
  } catch (e) {
    // If native share fails, fallback to clipboard
  }
  try {
    await navigator.clipboard.writeText(url);
    toast.success(getMessageText("copied" as any, language) ?? "Copied");
    return true;
  } catch (e) {
    toast.error(getMessageText("error", language));
    return false;
  }
}

// Reusable, route-aware sharing helper that only increments counts on confirmed share
export interface ShareRecordOptions {
  section: string; // e.g., "Ashaar" | "Ghazlen" | "Nazmen" | "Rubai" | "Blogs"
  id: string; // Airtable record id
  title: string; // e.g., shaer name or item title
  textLines?: string[]; // optional lines to join for the share text
  slugId?: string | null; // precomputed slug if available
  fallbackSlugText?: string | null; // e.g., first ghazal head line
  origin?: string; // defaults to window.location.origin
  language?: Language; // for toasts
  siteTagline?: string; // appended message
}

export interface ShareRecordHandlers {
  // Called only if the user confirms the share in the OS sheet
  onShared?: () => Promise<void> | void;
  // Called if the share sheet is explicitly cancelled (AbortError)
  onCancel?: () => void;
  // Called on any other error
  onError?: (error: unknown) => void;
}

export async function shareRecordWithCount(
  opts: ShareRecordOptions,
  handlers: ShareRecordHandlers = {}
): Promise<boolean> {
  const {
    section,
    id,
    title,
    textLines = [],
    slugId,
    fallbackSlugText,
    origin = typeof window !== "undefined" ? window.location.origin : "",
    language = "UR",
    siteTagline = "Found this on Jahannuma webpage\nCheckout their webpage here >>",
  } = opts;

  // Resolve slug robustly
  const baseSlug = (slugId && String(slugId).trim().length > 0)
    ? slugId!
    : (fallbackSlugText && fallbackSlugText.trim().length > 0)
      ? createSlug(fallbackSlugText)
      : id;
  const url = `${origin}/${section}/${baseSlug}/${id}`;
  const text = [
    ...(textLines?.length ? [textLines.join("\n")] : []),
    siteTagline,
  ].join("\n");

  try {
    if (navigator.share) {
      await navigator.share({ title, text, url });
      // If we reached here, treat it as a confirmed share (best-effort per spec/UA behavior)
      try {
        await handlers.onShared?.();
      } catch (inner) {
        // Swallow to avoid breaking UX
      }
      return true;
    }
  } catch (err: any) {
    // Many browsers throw AbortError on cancel; don't increment in that case
    if (err && (err.name === "AbortError" || err.message?.includes("AbortError"))) {
      handlers.onCancel?.();
      // Optional info toast; avoid noise if you prefer silent cancel
      // toast.message(getMessageText("cancelled" as any, language) ?? "Share cancelled");
      return false;
    }
    handlers.onError?.(err);
    // Fall through to clipboard fallback
  }

  // Fallback: copy URL. Do NOT increment counters on fallback.
  try {
    await navigator.clipboard.writeText(url);
    toast.success(getMessageText("copied" as any, language) ?? "Copied");
    return true;
  } catch (e) {
    toast.error(getMessageText("error", language));
    handlers.onError?.(e);
    return false;
  }
}

/**
 * Download helper
 * Note: Authentication should be enforced by the caller (e.g., requireAuth("download")).
 */
export async function handleDownload(
  fileUrl: string,
  filename?: string,
  _force: boolean = false,
  language: Language = "EN"
) {
  try {
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error("download failed");
    const blob = await res.blob();
    const link = document.createElement("a");
    const objectUrl = URL.createObjectURL(blob);
    link.href = objectUrl;
    link.download = filename || fileUrl.split("/").pop() || "file";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    toast.success(getMessageText("success", language));
    return true;
  } catch (e) {
    toast.error(getMessageText("error", language));
    return false;
  }
}
