"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAirtableList } from "@/hooks/airtable/useAirtableList";
import { useAirtableMutation } from "@/hooks/airtable/useAirtableMutation";
import { useCommentSystem } from "@/hooks/social/useCommentSystem";
import useAuthGuard from "@/hooks/useAuthGuard";
import { shareRecordWithCount } from "@/lib/social-utils";
import { Harmattan } from 'next/font/google';
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import CommentSection from "./CommentSection";
import DataCard from "./DataCard";
import Loader from "./Loader";

interface Shaer {
  fields: {
    sher: string[];
    shaer: string;
    enShaer: string;
    ghazalHead: string[];
    enGhazalHead: string[];
    ghazal: string[];
    enGhazal: string[];
    unwan: string[];
    enUnwan: string[];
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
  const [selectedCommentId, setSelectedCommentId] = React.useState<string | null>(null);
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

  // keep the same random item until the dataset changes, persist across page navigation
  useEffect(() => {
    if (records && records.length > 0) {
      // Try to get persisted random index from sessionStorage
      const persistedIndex = sessionStorage.getItem('randCard_selectedIndex');
      const persistedRecordsLength = sessionStorage.getItem('randCard_recordsLength');

      if (
        persistedIndex !== null &&
        persistedRecordsLength !== null &&
        parseInt(persistedRecordsLength) === records.length &&
        randomIndexRef.current === null
      ) {
        // Use persisted index if dataset hasn't changed
        randomIndexRef.current = parseInt(persistedIndex);
      } else if (randomIndexRef.current === null) {
        // Generate new random index
        randomIndexRef.current = Math.floor(Math.random() * records.length);
        // Persist the selection
        sessionStorage.setItem('randCard_selectedIndex', randomIndexRef.current.toString());
        sessionStorage.setItem('randCard_recordsLength', records.length.toString());
      }
    }

    if (
      records &&
      randomIndexRef.current !== null &&
      randomIndexRef.current >= records.length
    ) {
      // dataset shrank; re-roll and update persistence
      randomIndexRef.current = Math.floor(Math.random() * records.length);
      sessionStorage.setItem('randCard_selectedIndex', randomIndexRef.current.toString());
      sessionStorage.setItem('randCard_recordsLength', records.length.toString());
    }
  }, [records]);

  const [randomItem, setRandomItem] = useState<Shaer | undefined>()

  // Clear persistence when component unmounts (optional - for fresh selection on app restart)
  useEffect(() => {
    return () => {
      // Uncomment the lines below if you want fresh selection on app restart
      // sessionStorage.removeItem('randCard_selectedIndex');
      // sessionStorage.removeItem('randCard_recordsLength');
    };
  }, []);

  useEffect(() => {
    if (!records || records.length === 0) {
      setRandomItem(undefined);
      return;
    }

    const idx = randomIndexRef.current ?? 0;
    const rec = records[idx];
    console.table(rec?.fields)
    // normalize to match component expectations
    const ghazal = (rec as any)?.fields?.hiGhazalHead
      ? String((rec as any).fields.hiGhazalHead)
        .replace(/\r\n?/g, "\n")
        .split("\n")
      : (rec as any)?.fields?.hiGhazalHead ?? [];
    const ghazalHead = (rec as any)?.fields?.hiGhazalHead
      ? String((rec as any).fields.hiGhazalHead)
        .replace(/\r\n?/g, "\n")
        .split("\n")
      : (rec as any)?.fields?.hiGhazalHead ?? [];

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
        title: shaerData.fields.enShaer,
        textLines: shaerData.fields.enGhazalHead ?? [],
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
    <div className={`justify-center flex flex-col items-center m-4`}>
      <h4 className="text-2xl my-4">मुंतखब शेर</h4>
      {loading && <Loader></Loader>} {/* Show loader while fetching */}
      {!loading && (
        <div className="relative">
          {/* <div className="bg-white absolute left-0 top-0 bg-opacity-10 w-screen h-[300px] z-auto"></div> */}
          <img
            src="/carousel/jnd.jpeg"
            className="object-cover bg-center absolute top-0 left-0 w-screen opacity-[0.09] rounded-lg overflow-clip scale-x-125 scale-y-110 translate-y-3 select-none z-0 touch-none h-[220px]"
            draggable="false"
          />
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