"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCallback } from "react";
import { toast } from "sonner";

export interface UseSocialActionsReturn {
  handleShare: (url: string, title: string, text: string) => Promise<void>;
  handleDownload: (
    fileUrl: string,
    filename?: string,
    force?: boolean
  ) => Promise<void>;
}

export function useSocialActions(): UseSocialActionsReturn {
  const { language } = useLanguage();

  const handleShare = useCallback(
    async (url: string, title: string, text: string) => {
      try {
        const shareData = {
          title,
          text,
          url,
        };

        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          // Fallback to clipboard
          const fullText = `${text}\n\n${url}`;
          await navigator.clipboard.writeText(fullText);

          const successMessage =
            language === "UR"
              ? "لنک کاپی ہو گیا!"
              : language === "HI"
              ? "लिंक कॉपी हो गया!"
              : "Link copied to clipboard!";

          toast.success(successMessage);
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          // User cancelled the share dialog
          return;
        }

        console.error("Share failed:", error);

        const errorMessage =
          language === "UR"
            ? "شیئر کرنے میں خرابی"
            : language === "HI"
            ? "साझा करने में त्रुटि"
            : "Failed to share";

        toast.error(errorMessage);
      }
    },
    [language]
  );

  const handleDownload = useCallback(
    async (fileUrl: string, filename?: string, force: boolean = false) => {
      try {
        if (force || !filename) {
          // Direct download
          window.open(fileUrl, "_blank");
        } else {
          // Download with custom filename
          const response = await fetch(fileUrl);
          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          window.URL.revokeObjectURL(downloadUrl);
        }

        const successMessage =
          language === "UR"
            ? "ڈاؤن لوڈ شروع ہو گیا"
            : language === "HI"
            ? "डाउनलोड शुरू हो गया"
            : "Download started";

        toast.success(successMessage);
      } catch (error) {
        console.error("Download failed:", error);

        const errorMessage =
          language === "UR"
            ? "ڈاؤن لوڈ میں خرابی"
            : language === "HI"
            ? "डाउनलोड में त्रुटि"
            : "Download failed";

        toast.error(errorMessage);
      }
    },
    [language]
  );

  return {
    handleShare,
    handleDownload,
  };
}
