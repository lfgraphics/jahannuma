"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { handleShare as _handleShare, handleDownload as _handleDownload } from "@/lib/social-utils";

export function useSocialActions() {
  const { language } = useLanguage();

  const handleShare = (url: string, title: string, text: string) =>
    _handleShare(url, title, text, language);

  const handleDownload = (fileUrl: string, filename?: string, force?: boolean) =>
    _handleDownload(fileUrl, filename, force, language);

  return { handleShare, handleDownload };
}
// Like and comment actions are managed by useLikeButton and useCommentSystem respectively.
