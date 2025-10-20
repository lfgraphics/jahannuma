"use client";
import CommentSection from "@/app/Components/CommentSection";
import DataCard from "@/app/Components/DataCard";
import type { AirtableRecord, NazmenRecord } from "@/app/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAirtableMutation } from "@/hooks/airtable/useAirtableMutation";
import { useCommentSystem } from "@/hooks/social/useCommentSystem";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useNazmenData } from "@/hooks/useNazmenData";
import { buildShaerFilter } from "@/lib/airtable-utils";
import { shareRecordWithCount } from "@/lib/social-utils";
import { formatNazmenRecord } from "@/src/lib/airtable";
import React, { useMemo, useState } from "react";
import { toast } from "sonner";
import ComponentsLoader from "./ComponentsLoader";

interface Props {
  takhallus: string;
}

const Nazmen: React.FC<Props> = ({ takhallus }) => {
  const { language } = useLanguage();

  const filterFormula = useMemo(() => {
    return buildShaerFilter(takhallus);
  }, [takhallus]);

  const {
    records,
    isLoading,
    hasMore,
    loadMore,
    isLoadingMore,
    optimisticUpdate
  } = useNazmenData(
    {
      pageSize: 30,
      filterByFormula: filterFormula
    },
    {
      debounceMs: 300
    }
  );

  const { updateRecord: updateNazmen } = useAirtableMutation("nazmen");

  const formattedRecords = useMemo(() => {
    return (records || []).map((record: any) => {
      const formatted = formatNazmenRecord(record);
      // Transform for DataCard compatibility (similar to main Nazmen component)
      return {
        ...formatted,
        fields: {
          ...formatted.fields,
          ghazal: formatted.fields.ghazalLines || [],
          ghazalHead: formatted.fields.ghazalLines?.slice(0, 1) || [],
          unwan: formatted.fields.anaween || [],
        },
      };
    });
  }, [records]);

  const [openanaween, setOpenanaween] = useState<string | null>(null);
  const toggleanaween = (cardId: string | null) =>
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  const handleCardClick = (_rec: AirtableRecord<NazmenRecord>) => { };

  const { requireAuth } = useAuthGuard();
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const {
    comments,
    isLoading: commentLoading,
    submitComment,
    setRecordId,
  } = useCommentSystem({ contentType: "nazmen" });

  const handleLoadMore = async () => {
    try {
      await loadMore();
    } catch {
      toast.error("مزید ڈیٹا لوڈ کرنے میں خرابی");
    }
  };

  const handleShareClick = async (shaerData: any): Promise<void> => {
    toggleanaween(null);
    await shareRecordWithCount(
      {
        section: "Nazmen",
        id: shaerData.id,
        title: shaerData.fields.shaer,
        textLines: shaerData.fields.ghazalHead || [],
        fallbackSlugText:
          (shaerData.fields.ghazalHead?.[0]) ||
          (shaerData.fields.unwan?.[0]) ||
          "",
        language,
      },
      {
        onShared: async () => {
          try {
            const updatedShares = (shaerData.fields.shares ?? 0) + 1;
            optimisticUpdate.updateRecord(shaerData.id, { shares: updatedShares });
            await updateNazmen(shaerData.id, { shares: updatedShares });
          } catch {
            optimisticUpdate.revert();
            toast.error("شیئر کرنے میں خرابی");
          }
        },
      }
    );
  };

  const openComments = (dataId: string) => {
    toggleanaween(null);
    setSelectedCommentId(dataId);
    setRecordId(dataId);
  };

  const closeComments = () => {
    setSelectedCommentId(null);
    setRecordId(null);
  };

  const handleCommentSubmit = async (dataId: string) => {
    if (!requireAuth("comment")) return;
    if (!newComment) return;
    try {
      setRecordId(dataId);
      await submitComment(newComment);
      setNewComment("");

      const currentRecord = formattedRecords.find((i: any) => i.id === dataId);
      const nextCommentCount = (currentRecord?.fields.comments || 0) + 1;
      optimisticUpdate.updateRecord(dataId, { comments: nextCommentCount });

      try {
        await updateNazmen(dataId, { comments: nextCommentCount });
      } catch {
        optimisticUpdate.revert();
        toast.error("کمنٹ اپ ڈیٹ کرنے میں خرابی");
      }
    } catch {}
  };



  return (
    <>
      <div
        dir="rtl"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3"
      >
        {isLoading && <ComponentsLoader />}
        {!isLoading && formattedRecords.length === 0 && (
          <div className="h-[30vh] col-span-full grid place-items-center text-muted-foreground">
            کوئی مواد نہیں ملا
          </div>
        )}
        {!isLoading &&
          formattedRecords.map((rec: any, index: number) => (
            <DataCard
              key={rec.id}
              page="nazm"
              shaerData={rec as any}
              index={index}
              download={false}
              baseId="app5Y2OsuDgpXeQdz"
              table="nazmen"
              storageKey="Nazmen"
              toggleanaween={toggleanaween}
              openanaween={openanaween}
              handleCardClick={handleCardClick as any}
              handleShareClick={handleShareClick}
              openComments={openComments}
              onLikeChange={({ id, likes }) => {
                optimisticUpdate.updateRecord(id, { likes });
              }}
            />
          ))}

        {formattedRecords.length > 0 && (
          <div className="col-span-full flex justify-center text-lg m-5">
            <button
              onClick={handleLoadMore}
              disabled={!hasMore || isLoadingMore}
              className="text-[#984A02] disabled:text-gray-500 disabled:cursor-auto cursor-pointer"
            >
              {isLoadingMore
                ? "لوڈ ہو رہا ہے۔۔۔"
                : !hasMore
                  ? "مزید نظمیں نہیں ہیں"
                  : "اور نظمیں لوڈ کریں"}
            </button>
          </div>
        )}
      </div>

      {selectedCommentId && (
        <CommentSection
          dataId={selectedCommentId}
          comments={comments}
          onCommentSubmit={handleCommentSubmit}
          commentLoading={commentLoading}
          newComment={newComment}
          onNewCommentChange={setNewComment}
          onCloseComments={closeComments}
        />
      )}
    </>
  );
};

export default Nazmen;
