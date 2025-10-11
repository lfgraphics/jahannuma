/**
 * Social utilities for sharing and downloading content.
 * Updated to work with the new API routes architecture.
 */

import { toast } from "sonner";

/**
 * Language type for social utilities.
 */
export type Language = "UR" | "EN" | "HI";

/**
 * Get localized message text.
 */
function getLocalizedMessage(key: string, language: Language): string {
  const messages = {
    success: {
      UR: "کامیاب",
      EN: "Success",
      HI: "सफल",
    },
    error: {
      UR: "خرابی",
      EN: "Error",
      HI: "त्रुटि",
    },
    copied: {
      UR: "کاپی ہو گیا",
      EN: "Copied",
      HI: "कॉपी हो गया",
    },
    cancelled: {
      UR: "منسوخ کر دیا گیا",
      EN: "Cancelled",
      HI: "रद्द कर दिया गया",
    },
  };

  return (
    messages[key as keyof typeof messages]?.[language] ||
    messages[key as keyof typeof messages]?.EN ||
    key
  );
}

/**
 * Create URL-friendly slug from text.
 */
function createSlug(text: string): string {
  if (!text || typeof text !== "string") return "";

  return text
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Handle basic sharing functionality.
 */
export async function handleShare(
  url: string,
  title: string,
  text: string,
  language: Language = "EN"
): Promise<boolean> {
  try {
    if (navigator.share) {
      await navigator.share({ url, title, text });
      toast.success(getLocalizedMessage("success", language));
      return true;
    }
  } catch (e: any) {
    if (e.name === "AbortError") {
      // User cancelled - not an error
      return false;
    }
    // Fall through to clipboard fallback
  }

  try {
    await navigator.clipboard.writeText(url);
    toast.success(getLocalizedMessage("copied", language));
    return true;
  } catch (e) {
    toast.error(getLocalizedMessage("error", language));
    return false;
  }
}

/**
 * Options for sharing a record with count increment.
 */
export interface ShareRecordOptions {
  section: string; // e.g., "ashaar" | "ghazlen" | "nazmen" | "rubai"
  id: string; // Airtable record id
  title: string; // e.g., poet name or item title
  textLines?: string[]; // optional lines to join for the share text
  slugId?: string | null; // precomputed slug if available
  fallbackSlugText?: string | null; // e.g., first ghazal head line
  origin?: string; // defaults to window.location.origin
  language?: Language; // for toasts
  siteTagline?: string; // appended message
}

/**
 * Handlers for share record events.
 */
export interface ShareRecordHandlers {
  // Called only if the user confirms the share
  onShared?: () => Promise<void> | void;
  // Called if the share sheet is explicitly cancelled
  onCancel?: () => void;
  // Called on any other error
  onError?: (error: unknown) => void;
}

/**
 * Share a record with count increment and proper URL generation.
 */
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
  const baseSlug =
    slugId && String(slugId).trim().length > 0
      ? slugId!
      : fallbackSlugText && fallbackSlugText.trim().length > 0
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
      // If we reached here, treat it as a confirmed share
      try {
        await handlers.onShared?.();
      } catch (inner) {
        // Swallow to avoid breaking UX
        console.warn("onShared handler failed:", inner);
      }
      return true;
    }
  } catch (err: any) {
    // Many browsers throw AbortError on cancel
    if (
      err &&
      (err.name === "AbortError" || err.message?.includes("AbortError"))
    ) {
      handlers.onCancel?.();
      return false;
    }
    handlers.onError?.(err);
    // Fall through to clipboard fallback
  }

  // Fallback: copy URL. Do NOT increment counters on fallback.
  try {
    await navigator.clipboard.writeText(url);
    toast.success(getLocalizedMessage("copied", language));
    return true;
  } catch (e) {
    toast.error(getLocalizedMessage("error", language));
    handlers.onError?.(e);
    return false;
  }
}

/**
 * Handle file downloads with proper error handling.
 */
export async function handleDownload(
  fileUrl: string,
  filename?: string,
  _force: boolean = false,
  language: Language = "EN"
): Promise<boolean> {
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

    toast.success(getLocalizedMessage("success", language));
    return true;
  } catch (e) {
    console.error("Download failed:", e);
    toast.error(getLocalizedMessage("error", language));
    return false;
  }
}
