"use client";
import { createSlug } from "@/lib/airtable-utils";
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
  desc?: string | string[];
  publishingDate?: string;
  book?: BookAttachment[];
  id?: string; // Airtable record id in fields? (keeping original shape)
  [key: string]: any;
}
interface BookRecord {
  fields: BookFields;
  id?: string; // Top-level Airtable record id
}

interface CardProps {
  data: BookRecord;
  showLikeButton?: boolean;
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

const Card: React.FC<CardProps> = ({ data, showLikeButton = false, baseId = "appXcBoNMGdIaSUyA", table = "E-Books", storageKey = "Books", onLikeChange, swrKey }) => {
  const { fields } = data;
  const { requireAuth, showLoginDialog, setShowLoginDialog, pendingAction } = useAuthGuard();
  const { bookName, publishingDate, book, id: fieldId, desc, writer, slugId } = fields;
  const recordId = fieldId || data.id; // prefer fields.id, fallback to record.id
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

  return (
    <div className="rounded overflow-hidden shadow-lg mx-auto border border-border bg-background text-foreground w-[180px]">
      <div className="relative bg-cover bg-center w-[180px] h-[260px]">
        <Link href={{ pathname: `/E-Books/${bookSlug}/${recordId}` }} className="block w-full h-full">
          {image?.url && (
            <img
              className="h-full w-full object-cover"
              src={image.url}
              height={image.height}
              width={image.width}
              alt={bookName || "Book cover"}
              loading="lazy"
            />
          )}
        </Link>
        {likeEnabled && like && (
          <button
            className={`absolute top-0 right-0 px-2 py-1 rounded-md rounded-t-none bg-background/40 backdrop-blur-sm shadow transition-colors duration-300 flex items-center gap-1 ${like.isHydratingLikes ? "text-gray-600" : (like.isLiked ? "text-red-600" : "text-gray-600")}`}
            onClick={async (e) => { e.preventDefault(); e.stopPropagation(); if (!requireAuth("like")) return; await like.handleLikeClick(); }}
            disabled={like.isHydratingLikes || like.isDisabled}
            aria-disabled={like.isHydratingLikes || like.isDisabled}
            title={like.isHydratingLikes ? "" : (like.isLiked ? "پسندیدہ" : "پسند کریں")}
          >
            <Heart className="inline" fill="currentColor" size={16} />
            <span className="text-xs text-foreground">{like.likesCount}</span>
          </button>
        )}
      </div>
      <div className="px-3 py-2">
        <Link href={{ pathname: `/E-Books/${bookSlug}/${recordId}` }}>
          <div className="font-medium text-primary dark:text-secondary truncate">{bookName} <span className="text-muted-foreground">:{writer}</span></div>
        </Link>
        <div className="text-xs text-muted-foreground line-clamp-2">{Array.isArray(desc) ? desc.join(" ") : desc}</div>
        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
          <span>
            اشاعت: {formatDate(publishingDate).split("/")[2] || formatDate(publishingDate).split("/")[0] || publishingDate}
          </span>
        </div>
      </div>
      <LoginRequiredDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} actionType={pendingAction || "like"} />
    </div>
  );
};

export default Card;