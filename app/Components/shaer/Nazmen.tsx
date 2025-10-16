"use client";
import CommentSection from "@/app/Components/CommentSection";
import DataCard from "@/app/Components/DataCard";
import type { AirtableRecord, NazmenRecord } from "@/app/types";
import { useAirtableList } from "@/hooks/airtable/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useCommentSystem } from "@/hooks/useCommentSystem";
import { useShareAction } from "@/hooks/useShareAction";
import { COMMENTS_TABLE, NAZMEN_COMMENTS_BASE } from "@/lib/airtable-constants";
import { buildShaerFilter, formatNazmenRecord } from "@/lib/airtable-utils";
import React, { useEffect, useMemo, useState } from "react";
import ComponentsLoader from "./ComponentsLoader";

interface Props {
  takhallus: string;
}

const BASE_ID = "app5Y2OsuDgpXeQdz";
const TABLE = "nazmen";

const Nazmen: React.FC<Props> = ({ takhallus }) => {
  const [loading, setLoading] = useState(true);

  const { records, isLoading } = useAirtableList<AirtableRecord<any>>(
    "nazmen",
    {
      filterByFormula: buildShaerFilter(takhallus),
      pageSize: 30,
    }
  );
  // Map records similar to legacy implementation so DataCard (page="nazm") shows the right lines
  const items = useMemo(() => {
    return records.map((rec) => {
      const formatted = formatNazmenRecord(rec) as AirtableRecord<NazmenRecord>;
      const f: any = rec.fields || {};
      const displayLines = String(f.displayLine || "")
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .filter(Boolean);
      const nazmLines = String(f.nazm || "")
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .filter(Boolean);
      const unwanLines = String(f.unwan || "")
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .filter(Boolean);
      return {
        ...formatted,
        fields: {
          ...formatted.fields,
          ghazalHead: displayLines, // DataCard expects ghazalHeadLines for nazm view
          ghazal: nazmLines, // keep full nazm lines
          unwan: unwanLines,
        } as any,
      } as AirtableRecord<NazmenRecord>;
    });
  }, [records]);
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const share = useShareAction({ section: "Nazmen", title: "" });

  const [openanaween, setOpenanaween] = useState<string | null>(null);
  const toggleanaween = (cardId: string | null) =>
    setOpenanaween((prev) => (prev === cardId ? null : cardId));
  const handleCardClick = (_rec: AirtableRecord<NazmenRecord>) => {};

  // Comments wiring (parity with legacy Component.tsx)
  const { requireAuth } = useAuthGuard();
  const { updateRecord: updateNazmen } = useAirtableMutation(BASE_ID, TABLE);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null
  );
  const [newComment, setNewComment] = useState("");
  const {
    comments,
    isLoading: commentLoading,
    submitComment,
    setRecordId,
  } = useCommentSystem(NAZMEN_COMMENTS_BASE, COMMENTS_TABLE, null);
  const [commentOverrides, setCommentOverrides] = useState<
    Record<string, number>
  >({});

  const openComments = (id: string) => {
    setSelectedCommentId(id);
    setRecordId(id);
  };
  const closeComments = () => {
    setSelectedCommentId(null);
    setRecordId(null);
  };
  const handleCommentSubmit = async (dataId: string) => {
    if (!requireAuth("comment")) return;
    if (!newComment) return;
    try {
      await submitComment({ recordId: dataId, content: newComment });
      setNewComment("");
      // Optimistically bump local override and persist to Airtable
      const current =
        commentOverrides[dataId] ??
        items.find((x) => x.id === dataId)?.fields?.comments ??
        0;
      const next = (current || 0) + 1;
      setCommentOverrides((prev) => ({ ...prev, [dataId]: next }));
      try {
        await updateNazmen([{ id: dataId, fields: { comments: next } }], {
          optimistic: false,
        });
      } catch {}
    } catch {}
  };

  const itemsWithOverrides = useMemo(
    () =>
      items.map((rec) =>
        commentOverrides[rec.id]
          ? ({
              ...rec,
              fields: { ...rec.fields, comments: commentOverrides[rec.id] },
            } as typeof rec)
          : rec
      ),
    [items, commentOverrides]
  );

  return (
    <>
      <div
        dir="rtl"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3"
      >
        {loading && <ComponentsLoader />}
        {!loading && itemsWithOverrides.length === 0 && (
          <div className="h-[30vh] col-span-full grid place-items-center text-muted-foreground">
            کوئی مواد نہیں ملا
          </div>
        )}
        {!loading &&
          itemsWithOverrides.map((rec, index) => (
            <DataCard
              key={rec.id}
              page="nazm"
              shaerData={rec as any}
              index={index}
              download={false}
              storageKey="Nazmen"
              toggleanaween={toggleanaween}
              openanaween={openanaween}
              handleCardClick={handleCardClick as any}
              handleShareClick={(r: any) => {
                const rr = r as AirtableRecord<NazmenRecord>;
                const lines = Array.isArray(rr.fields.ghazalLines)
                  ? rr.fields.ghazalLines
                  : String(rr.fields.nazm || "").split("\n");
                return share.handleShare({
                  recordId: rr.id,
                  title: rr.fields.shaer,
                  textLines: lines,
                  slugId: rr.fields.slugId,
                  currentShares: rr.fields.shares ?? 0,
                });
              }}
              openComments={openComments}
            />
          ))}
        {/* Share no longer requires login */}
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
