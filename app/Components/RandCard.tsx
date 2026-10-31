"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAirtableList } from "@/hooks/airtable/useAirtableList";
import { useAirtableMutation } from "@/hooks/airtable/useAirtableMutation";
import { useCommentSystem } from "@/hooks/social/useCommentSystem";
import useAuthGuard from "@/hooks/useAuthGuard";
import { shareRecordWithCount } from "@/lib/social-utils";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import CommentSection from "./CommentSection";
import DataCard from "./DataCard";
import Loader from "./Loader";

interface Shaer {
  fields: {
    sher: string[];
    shaer: string;
    ghazalHead: string[];
    ghazal: string[];
    unwan: string[];
    likes: number;
    comments: number;
    shares: number;
    id: string;
  };
  id: string;
  createdTime: string;
}

// Local comment shape used by comment list/state for this component
interface Comment {
  dataId: string;
  commentorName: string | null;
  timestamp: string;
  comment: string;
}

const RandCard: React.FC<{}> = () => {
  // Fetch Ashaar list via SWR and randomly pick one; caching ensures instant loads on revisit
  const { records, isLoading } = useAirtableList<Shaer>("ashaar", {
    pageSize: 50,
  });
  const loading = isLoading;
  const randomIndexRef = useRef<number | null>(null);
  // Comment drawer state
  const [selectedCommentId, setSelectedCommentId] = React.useState<
    string | null
  >(null);
  const {
    comments,
    isLoading: commentLoading,
    submitComment,
    setRecordId,
  } = useCommentSystem({ contentType: "ashaar" });
  const [newComment, setNewComment] = useState("");
  const { requireAuth } = useAuthGuard();
  const { language } = useLanguage();
  // likes are now handled inside DataCard via useLikeButton
  // toast via sonner

  //function ot show toast
  const showToast = (
    msgtype: "success" | "error" | "invalid",
    message: string
  ) => {
    if (msgtype === "success") return toast.success(message);
    if (msgtype === "error") return toast.error(message);
    return toast.warning(message);
  };

  // Generate new random item on each render to avoid caching issues
  useEffect(() => {
    if (records && records.length > 0) {
    // Always generate a new random index on each data fetch
      randomIndexRef.current = Math.floor(Math.random() * records.length);
    }
  }, [records]);

  const [randomItem, setRandomItem] = useState<Shaer | undefined>()

  useEffect(() => {
    if (!records || records.length === 0) {
      setRandomItem(undefined);
      return;
    }

    const idx = randomIndexRef.current ?? 0;
    const rec = records[idx];

    // normalize to match component expectations
    const ghazal = (rec as any)?.fields?.body
      ? String((rec as any).fields.body)
          .replace(/\r\n?/g, "\n")
          .split("\n")
      : (rec as any)?.fields?.ghazal ?? [];
    const ghazalHead = (rec as any)?.fields?.sher
      ? String((rec as any).fields.sher)
          .replace(/\r\n?/g, "\n")
          .split("\n")
      : (rec as any)?.fields?.ghazalHead ?? [];

    setRandomItem({
      ...rec,
      fields: { ...(rec as any).fields, ghazal, ghazalHead },
    });
  }, [records]);

  // Mutations aligned to Ashaar table for likes/shares
  const { updateRecord: updateAshaar } = useAirtableMutation("ashaar");
  const [openanaween, setOpenanaween] = useState<string | null>(null);

  const toggleanaween = (cardId: string | null) => {
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  };

  const visitSher = () => {
    // window.location.href = `/Ghazlen/${randomItem?.fields.id}`;
  };
  const fetchComments = async (dataId: string) => {
    setRecordId(dataId);
  };

  const openComments = (dataId: string) => {
    toggleanaween(null);
    setSelectedCommentId(dataId);
    fetchComments(dataId);
  };

  const handleShareClick = async (
    shaerData: Shaer,
    index: number
  ): Promise<void> => {
    toggleanaween(null);
    await shareRecordWithCount(
      {
        section: "Ashaar",
        id: shaerData.id,
        title: shaerData.fields.shaer,
        textLines: shaerData.fields.ghazalHead ?? [],
        fallbackSlugText:
          (shaerData.fields.ghazalHead || [])[0] ||
          (shaerData.fields.unwan || [])[0] ||
          "",
        language,
      },
      {
        onShared: async () => {
          try {
            const updatedShares = (shaerData.fields.shares ?? 0) + 1;
            await updateAshaar(shaerData.id, { shares: updatedShares });
          } catch (error) {
            console.error("Error updating shares:", error);
          }
        },
      }
    );
  };

  const closeComments = () => {
    setSelectedCommentId(null);
    setRecordId(null);
  };

  const handleCardClick = (shaerData: Shaer) => {
    toggleanaween(null);
  };

  if (loading || !randomItem) return <Loader />;

  return (
    <div className="relative overflow-hidden justify-center flex flex-col items-center mt-4 pb-4">
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat opacity-15 dark:opacity-10 pointer-events-none select-none"
        style={{ backgroundImage: "url('/sherbgbanner.jpg')" }}
      />
      <h4 className="text-2xl my-4 relative z-10">ایک منتخب شعر</h4>
      {loading && <Loader></Loader>} {/* Show loader while fetching */}
      {!loading && (
        <div className="relative border-3 rounded-md pb-0 bg-background/20">
          <DataCard
            page="rand"
            download={true}
            key={randomItem.id}
            shaerData={randomItem}
            index={0}
            handleCardClick={visitSher}
            baseId={require("@/lib/airtable-client-utils").getClientBaseId("ASHAAR")}
            table="Ashaar"
            storageKey="Ashaar"
            toggleanaween={toggleanaween}
            openanaween={openanaween}
            handleShareClick={handleShareClick}
            openComments={openComments}
            onLikeChange={() => {
              // placeholder analytics
            }}
          />
        </div>
      )}
      {selectedCommentId && (
        <CommentSection
          dataId={selectedCommentId}
          comments={comments as any}
          onCommentSubmit={async (dataId) => {
            if (!requireAuth("comment")) return;
            if (!newComment) return;
            try {
              // submitComment expects the comment string; recordId is already set via setRecordId when opening comments
              await submitComment(newComment);
              setNewComment("");
              // Update comments count on Ashaar
              try {
                const currentComments = randomItem?.fields?.comments ?? 0;
                await updateAshaar(dataId, { comments: currentComments + 1 });
              } catch (err) {
                console.error("Error updating comment count:", err);
              }
            } catch (error) {
              console.error("Error submitting comment:", error);
            }
          }}
          commentLoading={commentLoading}
          newComment={newComment}
          onNewCommentChange={setNewComment}
          onCloseComments={closeComments}
        />
      )}
    </div>
  );
};
export default RandCard;