"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { handleLike as _handleLike, handleShare as _handleShare, handleDownload as _handleDownload, submitComment as _submitComment, type LikeResult, type CommentPayload } from "@/lib/social-utils";

export function useSocialActions() {
  const { language } = useLanguage();

  const handleLike = (itemId: string, itemType: string, currentCount: number) =>
    _handleLike(itemId, itemType, currentCount, language);

  const handleShare = (url: string, title: string, text: string) =>
    _handleShare(url, title, text, language);

  const handleDownload = (fileUrl: string, filename?: string, force?: boolean) =>
    _handleDownload(fileUrl, filename, force, language);

  const submitComment = (apiEndpoint: string, payload: CommentPayload) =>
    _submitComment(apiEndpoint, payload, language);

  return { handleLike, handleShare, handleDownload, submitComment };
}

export type { LikeResult, CommentPayload };
