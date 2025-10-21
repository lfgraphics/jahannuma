"use client";
import CommentSection from "@/app/Components/CommentSection";
import DataCard from "@/app/Components/DataCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useCommentSystem } from "@/hooks/useCommentSystem";
import { getLanguageFieldValue } from "@/lib/language-field-utils";
import { shareRecordWithCount } from "@/lib/social-utils";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Loader from "../../Components/Loader";

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
    // Language-specific fields
    enShaer?: string;
    hiShaer?: string;
    enGhazalHead?: string[];
    hiGhazalHead?: string[];
    enGhazal?: string[];
    hiGhazal?: string[];
    enUnwan?: string[];
    hiUnwan?: string[];
  };
  id: string;
  createdTime: string;
}



const RandCard: React.FC<{}> = () => {
  const { language } = useLanguage();

  const { getClientBaseId } = require("@/lib/airtable-client-utils");
  // Fetch Ashaar list via SWR and randomly pick one; caching ensures instant loads on revisit
  const { records, isLoading } = useAirtableList<Shaer>(getClientBaseId("ASHAAR"), "Ashaar", {
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
  } = useCommentSystem(getClientBaseId("ASHAAR"), "Ashaar");
  const [newComment, setNewComment] = useState("");
  const { requireAuth } = useAuthGuard();

  // keep the same random item until the dataset changes
  useEffect(() => {
    if (records && records.length > 0 && randomIndexRef.current === null) {
      randomIndexRef.current = Math.floor(Math.random() * records.length);
    }
    if (
      records &&
      randomIndexRef.current !== null &&
      randomIndexRef.current >= records.length
    ) {
      // dataset shrank; re-roll
      randomIndexRef.current = Math.floor(Math.random() * records.length);
    }
  }, [records]);

  const randomItem = useMemo(() => {
    if (!records || records.length === 0)
      return undefined as unknown as Shaer | undefined;
    const idx = randomIndexRef.current ?? 0;
    const rec = records[idx];

    // Get language-specific field values with fallback
    const shaer = getLanguageFieldValue(rec.fields, 'shaer', language) || rec.fields.shaer;
    const ghazalHead = getLanguageFieldValue(rec.fields, 'ghazalHead', language) ||
      getLanguageFieldValue(rec.fields, 'sher', language) ||
      rec.fields.ghazalHead || rec.fields.sher;
    const ghazal = getLanguageFieldValue(rec.fields, 'ghazal', language) ||
      getLanguageFieldValue(rec.fields, 'body', language) ||
      rec.fields.ghazal;
    const unwan = getLanguageFieldValue(rec.fields, 'unwan', language) || rec.fields.unwan;

    // normalize to match component expectations
    const normalizedGhazal = Array.isArray(ghazal) ? ghazal :
      (typeof ghazal === 'string' ?
        ghazal.replace(/\r\n?/g, "\n").split("\n") :
        rec.fields.ghazal ?? []);

    const normalizedGhazalHead = Array.isArray(ghazalHead) ? ghazalHead :
      (typeof ghazalHead === 'string' ?
        ghazalHead.replace(/\r\n?/g, "\n").split("\n") :
        rec.fields.ghazalHead ?? []);

    return {
      ...rec,
      fields: {
        ...rec.fields,
        shaer,
        ghazal: normalizedGhazal,
        ghazalHead: normalizedGhazalHead,
        unwan
      },
    } as Shaer;
  }, [records, language]);

  // Mutations aligned to Ashaar table for likes/shares
  const { updateRecord: updateAshaar } = useAirtableMutation(getClientBaseId("ASHAAR"), "Ashaar");
  const [openanaween, setOpenanaween] = useState<string | null>(null);

  const toggleanaween = (cardId: string | null) => {
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  };

  const visitSher = () => {
    // window.location.href = `/EN/Ghazlen/${randomItem?.fields.id}`;
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
    shaerData: Shaer
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
            await updateAshaar([{ id: shaerData.id, fields: { shares: updatedShares } }]);
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



  if (loading || !randomItem) return <Loader />;

  const randomSherTitle = { EN: "A Selected Verse", UR: "ایک منتخب شعر", HI: "एक चुना हुआ शेर" };

  return (
    <div className="justify-center flex flex-col items-center m-4">
      <h4 className="text-2xl my-4">{randomSherTitle[language]}</h4>
      {loading && <Loader></Loader>}
      {!loading && (
        <div className="relative">
          <img
            src="https://jahan-numa.org/carousel/jnd.jpeg"
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
            baseId={getClientBaseId("ASHAAR")}
            table="Ashaar"
            storageKey="Ashaar"
            toggleanaween={toggleanaween}
            openanaween={openanaween}
            handleShareClick={handleShareClick}
            openComments={openComments}
            onLikeChange={() => {
              // Analytics integration can be added here in the future
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
              await submitComment({ recordId: dataId, content: newComment });
              setNewComment("");
              try {
                const currentComments = randomItem?.fields?.comments ?? 0;
                await updateAshaar([{ id: dataId, fields: { comments: currentComments + 1 } }]);
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
