"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { createSlug } from "@/lib/airtable-utils";
import { getLanguageFieldValue } from "@/lib/language-field-utils";
import Link from "next/link";
import React from "react";

interface BookAttachmentThumb {
  url?: string;
  width?: number;
  height?: number;
}
interface BookAttachment {
  thumbnails?: {
    large?: BookAttachmentThumb;
  };
}
interface BookFields {
  bookName?: string;
  enBookName?: string;
  hiBookName?: string;
  desc?: string | string[];
  enDesc?: string | string[];
  hiDesc?: string | string[];
  writer?: string;
  enWriter?: string;
  hiWriter?: string;
  publishingDate?: string;
  book?: BookAttachment[];
  id?: string;
  [key: string]: any;
}
interface BookRecord {
  fields: BookFields;
  id?: string;
}

interface CardProps {
  data: BookRecord;
  showLikeButton?: boolean;
  showShareButton?: boolean;
  baseId?: string;
  table?: string;
  storageKey?: string;
  onLikeChange?: (args: { id: string; liked: boolean; likes: number }) => void;
  onDownload?: (bookId: string, bookUrl: string) => void;
  onDownloadError?: (bookId: string, error: Error) => void;
  swrKey?: any;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
};

import LoginRequiredDialog from "@/components/ui/login-required-dialog";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useLikeButton } from "@/hooks/useLikeButton";
import { Heart } from "lucide-react";

const Card: React.FC<CardProps> = ({ data, showLikeButton = false, showShareButton = true, baseId = require("@/lib/airtable-client-utils").getClientBaseId("EBOOKS"), table = "E-Books", storageKey = "Books", onLikeChange, swrKey }) => {
  const { fields } = data;
  const { language } = useLanguage();
  const { requireAuth, showLoginDialog, setShowLoginDialog, pendingAction } = useAuthGuard();

  // Get language-specific field values with fallback
  const bookName = getLanguageFieldValue(fields, 'bookName', language);
  const writer = getLanguageFieldValue(fields, 'writer', language);
  const desc = getLanguageFieldValue(fields, 'desc', language);

  const { publishingDate, book, id: fieldId, slugId } = fields;
  const recordId = fieldId || data.id;
  const image = book?.[0]?.thumbnails?.large;

  // Use slugId if available, otherwise create slug from book name
  const bookSlug = slugId || (bookName ? `${createSlug(bookName)}` : recordId);

  // Like integration (optional)
  const likeEnabled = !!(showLikeButton && recordId);
  const like = likeEnabled
    ? useLikeButton({
        baseId,
        table,
        storageKey,
        recordId: recordId as string,
        currentLikes: (fields as any)?.likes ?? 0,
        // let parent pass a real SWR key if needed later; avoid string list key here
        onChange: onLikeChange,
        swrKey,
      })
    : null;

  // Language-specific text
  const getLanguageText = () => {
    switch (language) {
      case 'EN':
        return {
          bookFallback: "Book",
          shareText: "Found this on Jahan Numa webpage\nVisit it here",
          likeTitle: "Like",
          likedTitle: "Liked",
          publishedText: "Published:",
          altText: "Book cover"
        };
      case 'HI':
        return {
          bookFallback: "किताब",
          shareText: "जहान नुमा वेबपेज पर मिला\nयहाँ देखें",
          likeTitle: "पसंद करें",
          likedTitle: "पसंदीदा",
          publishedText: "इशाअत :",
          altText: "किताब का कवर"
        };
      default:
        return {
          bookFallback: "کتاب",
          shareText: "Found this on Jahannuma webpage\nVisit it here",
          likeTitle: "پسند کریں",
          likedTitle: "پسندیدہ",
          publishedText: "اشاعت:",
          altText: "کتاب کا سرورق"
        };
    }
  };

  const langText = getLanguageText();
  const routePrefix = language === 'UR' ? '' : `/${language}`;

  // Share functionality
  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (navigator.share) {
        const title = bookName || langText.bookFallback;
        const text = `${title}${writer ? ` - ${writer}` : ""}\n${Array.isArray(desc) ? desc.join(" ") : desc || ""}`;
        const shareUrl = `${window.location.origin}${routePrefix}/E-Books/${bookSlug}/${recordId}`;

        navigator
          .share({
            title,
            text: `${text}\n\n${langText.shareText}\n${shareUrl}`,
            url: shareUrl,
          })
          .then(() => console.log("Successful share"))
          .catch((error) => console.log("Error sharing", error));
      } else {
        // Fallback: copy to clipboard
        const shareUrl = `${window.location.origin}${routePrefix}/E-Books/${bookSlug}/${recordId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
          console.log("URL copied to clipboard");
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  return (
    <div className="rounded overflow-hidden shadow-lg mx-auto border border-border bg-background text-foreground w-[180px]">
      <div className="relative bg-cover bg-center w-[180px] h-[260px]">
        <Link href={{ pathname: `/EN/${routePrefix}/E-Books/${bookSlug}/${recordId}` }} className="block w-full h-full">
          {image?.url && (
            <img
              className="h-full w-full object-cover"
              src={image.url}
              height={image.height}
              width={image.width}
              alt={bookName || langText.altText}
              loading="lazy"
            />
          )}
        </Link>
        <div className="absolute top-0 left-0 flex gap-1">
          {likeEnabled && like && (
            <button
              className={`px-2 py-1 rounded-md rounded-t-none bg-background/40 backdrop-blur-sm shadow transition-colors duration-300 flex items-center gap-1 ${like.isHydratingLikes ? "text-gray-600" : (like.isLiked ? "text-red-600" : "text-gray-600")}`}
              onClick={async (e) => { e.preventDefault(); e.stopPropagation(); if (!requireAuth("like")) return; await like.handleLikeClick(); }}
              disabled={like.isHydratingLikes || like.isDisabled}
              aria-disabled={like.isHydratingLikes || like.isDisabled}
              title={like.isHydratingLikes ? "" : (like.isLiked ? langText.likedTitle : langText.likeTitle)}
            >
              <Heart className="inline" fill="currentColor" size={16} />
              <span className="text-xs text-foreground">{like.likesCount}</span>
            </button>
          )}
        </div>
      </div>
      <div className="px-3 py-2">
        <Link href={{ pathname: `/EN/${routePrefix}/E-Books/${bookSlug}/${recordId}` }}>
          <div className="font-medium text-primary dark:text-secondary truncate">{bookName} <span className="text-muted-foreground">: {writer}</span></div>
        </Link>
        <div className="text-xs text-muted-foreground line-clamp-2">{Array.isArray(desc) ? desc.join(" ") : desc}</div>
        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
          <span>
            {langText.publishedText} {formatDate(publishingDate).split("/")[2] || formatDate(publishingDate).split("/")[0] || publishingDate}
          </span>
        </div>
      </div>
      <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} actionType={pendingAction || "like"} />
    </div>
  );
};

export default Card;