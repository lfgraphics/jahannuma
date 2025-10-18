"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ErrorSeverity,
  createClientError,
  handleError
} from "@/lib/error-handling";
import { handleDownload as _handleDownload, handleShare as _handleShare } from "@/lib/social-utils";
import { useCallback } from "react";

export function useSocialActions() {
  const { language } = useLanguage();

  const handleShare = useCallback(async (url: string, title: string, text: string) => {
    try {
      return await _handleShare(url, title, text, language);
    } catch (error) {
      const enhancedError = createClientError(
        `Share action failed: ${(error as Error).message}`,
        {
          code: 'SHARE_ERROR',
          severity: ErrorSeverity.LOW,
          userMessage: "شیئر کرنے میں خرابی",
          debugInfo: { url, title, text, language }
        }
      );

      handleError(enhancedError);
      throw enhancedError;
    }
  }, [language]);

  const handleDownload = useCallback(async (fileUrl: string, filename?: string, force?: boolean) => {
    try {
      return await _handleDownload(fileUrl, filename, force, language);
    } catch (error) {
      const enhancedError = createClientError(
        `Download action failed: ${(error as Error).message}`,
        {
          code: 'DOWNLOAD_ERROR',
          severity: ErrorSeverity.MEDIUM,
          userMessage: "ڈاؤن لوڈ کرنے میں خرابی",
          debugInfo: { fileUrl, filename, force, language }
        }
      );

      handleError(enhancedError);
      throw enhancedError;
    }
  }, [language]);

  return { handleShare, handleDownload };
}
// Like and comment actions are managed by useLikeButton and useCommentSystem respectively.
