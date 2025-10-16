"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { mutate } from "swr";

export interface UseShareActionArgs {
  table?: string;
  recordId?: string;
  section: string; // e.g., "Ashaar", "Ghazlen"
  title: string;
  textLines?: string[];
  slugId?: string | null;
  currentShares?: number | null;
  url?: string | null;
}

export interface UseShareActionReturn {
  isSharing: boolean;
  handleShare: (overrides?: Partial<UseShareActionArgs>) => Promise<void>;
}

export function useShareAction(args: UseShareActionArgs): UseShareActionReturn {
  const {
    table,
    recordId,
    section,
    title,
    textLines = [],
    slugId,
    currentShares,
    url,
  } = args;
  const { language } = useLanguage();
  const [isSharing, setSharing] = useState(false);

  const handleShare = useCallback(
    async (overrides: Partial<UseShareActionArgs> = {}) => {
      const finalArgs = { ...args, ...overrides };
      const {
        table: finalTable,
        recordId: finalRecordId,
        section: finalSection,
        title: finalTitle,
        textLines: finalTextLines = [],
        slugId: finalSlugId,
        url: finalUrl,
      } = finalArgs;

      setSharing(true);

      try {
        // Build share text
        const shareText = [
          finalTitle,
          ...finalTextLines.slice(0, 3), // Limit to first 3 lines
        ]
          .filter(Boolean)
          .join("\n");

        // Build share URL
        let shareUrl = finalUrl;
        if (!shareUrl && finalTable && finalRecordId) {
          // Create a derived slug if needed
          const derivedSlug = slugId; // fallback to closure slugId for backward compatibility
          shareUrl = `${window.location.origin}/${finalTable}/${
            finalSlugId ?? derivedSlug
          }/${finalRecordId}`;
        }
        if (!shareUrl) {
          shareUrl = window.location.href;
        }

        const fullShareText = `${shareText}\n\n${shareUrl}`;

        // Try native sharing first
        if (navigator.share) {
          await navigator.share({
            title: finalTitle,
            text: shareText,
            url: shareUrl,
          });
        } else {
          // Fallback to clipboard
          await navigator.clipboard.writeText(fullShareText);
          toast.success("Link copied to clipboard!");
        }

        // Update share count in Airtable if we have the record info
        if (finalTable && finalRecordId) {
          try {
            const newShareCount = (currentShares || 0) + 1;

            const response = await fetch(
              `/api/airtable/${finalTable}/${finalRecordId}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  fields: { shares: newShareCount },
                }),
              }
            );

            if (response.ok) {
              // Revalidate relevant caches
              await mutate(
                (key: any) =>
                  typeof key === "string" &&
                  key.includes(`/api/airtable/${finalTable}`),
                undefined,
                { revalidate: true }
              );
            }
          } catch (error) {
            console.warn("Failed to update share count:", error);
            // Don't fail the whole operation for this
          }
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          // User cancelled the share dialog
          return;
        }

        console.error("Share failed:", error);
        toast.error("Failed to share. Please try again.");
      } finally {
        setSharing(false);
      }
    },
    [args, language, currentShares, slugId]
  );

  return {
    isSharing,
    handleShare,
  };
}
