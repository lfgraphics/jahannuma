"use client";
import LoginRequiredDialog from "@/components/ui/login-required-dialog";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useLikeButton } from "@/hooks/useLikeButton";
import { createSlug } from "@/lib/airtable-utils";
import { Heart } from "lucide-react";
import Link from "next/link";

type Photo = {
  thumbnails?: {
    full?: { url?: string; height?: number; width?: number };
  };
};

type CardProps = {
  // Accept any incoming record shape; component only reads limited fields
  data: any;
  // Enable built-in like button when identifiers provided
  showLikeButton?: boolean;
  baseId?: string;
  table?: string;
  storageKey?: string;
  onLikeChange?: (args: { id: string; liked: boolean; likes: number }) => void;
};

const Card = ({
  data,
  showLikeButton = true,
  baseId = require("@/lib/airtable-client-utils").getClientBaseId("SHAER"),
  table = "Intro",
  storageKey = "Shura",
  onLikeChange,
}: CardProps) => {
  const { fields, id: recordId } = data;
  const takhallus = fields?.takhallus as string | undefined;
  const slugId = fields?.slugId as string | undefined;
  const photo = fields?.photo as Photo[] | undefined;

  const img = photo?.[0]?.thumbnails?.full as
    | { url?: string; height?: number; width?: number }
    | undefined;
  const name = (takhallus || "").replace(" ", "-");

  // Use slugId if available, otherwise create slug from takhallus and record ID
  const shaerSlug =
    slugId || (takhallus ? `${createSlug(takhallus)}` : recordId);

  const likeEnabled = !!(showLikeButton && (fields?.id || recordId));
  const { requireAuth, showLoginDialog, setShowLoginDialog } = useAuthGuard();
  const recId = (fields?.id || recordId) as string | undefined;
  const like =
    likeEnabled && recId
      ? useLikeButton({
        baseId,
        table,
        storageKey,
        recordId: recId,
        currentLikes: Number(fields?.likes || 0),
        onChange: onLikeChange,
      })
      : null;

  return (
    <div className="w-[180px] h-52 rounded overflow-hidden shadow-[#00000080] shadow-md mx-auto my-1 bg-background text-foreground">
      <div className="relative h-full">
        <Link
          href={{ pathname: `/Shaer/${(name || "").replace(/\s+/g, "-")}` }}
          className="block h-full"
        >
          {img?.url ? (
            <img
              className="w-full h-full object-cover object-center"
              src={img.url}
              height={208}
              width={180}
              alt="Poet's Photo"
            />
          ) : (
            <img
                className="w-full h-full object-cover object-center"
              src={"/poets/nodp.jpg"}
                height={208}
              width={180}
              alt="Poet's Photo"
            />
          )}
        </Link>
        {likeEnabled && like && (
          <>
            <button
              className={`absolute top-0 right-0 px-2 py-1 rounded-md rounded-t-none bg-background/40 backdrop-blur-sm shadow transition-colors duration-300 flex items-center gap-1 ${like.isLiked ? "text-red-600" : "text-gray-600"
                }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (requireAuth("like")) like.handleLikeClick();
              }}
              disabled={like.isDisabled}
              aria-disabled={like.isDisabled}
              title={like.isLiked ? "پسندیدہ" : "پسند کریں"}
            >
              <Heart className="inline" fill="currentColor" size={16} />
              <span className="text-xs text-foreground">{like.likesCount}</span>
            </button>
            <LoginRequiredDialog
              open={showLoginDialog}
              onOpenChange={setShowLoginDialog}
              actionType="like"
            />
          </>
        )}
        <div
          className="absolute bottom-0 left-0 right-0 text-center p-2 bg-black/60 text-white backdrop-blur-sm min-h-[40px] flex items-center justify-center"
          style={{ WebkitBackdropFilter: "blur(4px)" }}
        >
          <span className="text-sm font-medium leading-tight break-words max-w-full">
            {takhallus}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Card;