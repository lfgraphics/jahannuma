"use client";
import { toast } from "sonner";
import { getMessageText, Language } from "@/lib/multilingual-texts";

type ItemType = "poem" | "book" | "blog" | "author" | string;

export interface LikeResult {
  success: boolean;
  newCount: number;
  isLiked: boolean;
  error?: string;
}

const LIKE_KEY = "_likes";

function getLikeStore(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LIKE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLikeStore(store: Record<string, boolean>) {
  try {
    localStorage.setItem(LIKE_KEY, JSON.stringify(store));
  } catch {}
}

export async function handleLike(itemId: string, itemType: ItemType, currentCount: number, language: Language): Promise<LikeResult> {
  const key = `${itemType}:${itemId}`;
  const store = getLikeStore();
  const wasLiked = !!store[key];
  const isLiked = !wasLiked;
  const newCount = Math.max(0, currentCount + (isLiked ? 1 : -1));

  // optimistic
  store[key] = isLiked;
  setLikeStore(store);
  toast.message(isLiked ? getMessageText("success", language) : getMessageText("success", language));

  // Simulate remote update if needed; wrap in try/catch in real impl
  return { success: true, newCount, isLiked };
}

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

const downloadedSet = new Set<string>();

export async function handleDownload(
  fileUrl: string,
  filename?: string,
  force: boolean = false,
  language: Language = "EN"
) {
  try {
    if (!force && downloadedSet.has(fileUrl)) {
      toast.info(getMessageText("success" as any, language) ?? "Already downloaded");
      return true;
    }
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
    downloadedSet.add(fileUrl);
    toast.success(getMessageText("success", language));
    return true;
  } catch (e) {
    toast.error(getMessageText("error", language));
    return false;
  }
}

export interface CommentPayload {
  content: string;
  parentId?: string;
}

export async function submitComment(apiEndpoint: string, payload: CommentPayload, language: Language): Promise<boolean> {
  try {
    if (!payload.content || payload.content.trim().length < 1) {
      toast.error(getMessageText("error", language));
      return false;
    }
    // Placeholder: integrate with real API
    // await fetch(apiEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    toast.success(getMessageText("success", language));
    return true;
  } catch (e) {
    toast.error(getMessageText("error", language));
    return false;
  }
}
