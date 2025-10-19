"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useCommentSystem } from "@/hooks/useCommentSystem";
import { COMMENTS_TABLE, NAZMEN_COMMENTS_BASE } from "@/lib/airtable-constants";
import { shareRecordWithCount } from "@/lib/social-utils";
import AOS from "aos";
import "aos/dist/aos.css";
import React, { useEffect, useMemo, useState } from "react";
import type { AirtableRecord, NazmenRecord } from "../../../../app/types";
import {
  buildShaerFilter,
  formatNazmenRecord,
  prepareShareUpdate,
} from "../../../../lib/airtable-utils";
import CommentSection from "../../../Components/CommentSection";
import DataCard from "../../../Components/DataCard";
import SkeletonLoader from "../../../Components/SkeletonLoader";

const BASE_ID = "app5Y2OsuDgpXeQdz";
const TABLE = "nazmen";
const COMMENTS_BASE = NAZMEN_COMMENTS_BASE;
const COMMENTS_TABLE_NAME = COMMENTS_TABLE;

const Page = ({ params }: { params: Promise<{ name: string }> }) => {
  const resolved = React.use(params);
  const rawName = decodeURIComponent(resolved.name).replace("_", " ");
  const displayName = rawName.includes("-") ? rawName.replace(/-/g, " ") : rawName;

  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<{ id: string; fields: { shaer: string; ghazal: string[]; id: string } } | null>(null);
  const [openanaween, setOpenanaween] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading: commentLoading, submitComment, setRecordId } = useCommentSystem(COMMENTS_BASE, COMMENTS_TABLE_NAME, null);
  const { requireAuth } = useAuthGuard();

  useEffect(() => { AOS.init({ offset: 50, delay: 0, duration: 300 }); }, []);

  const [records, setRecords] = useState<AirtableRecord<any>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams({
          filterByFormula: buildShaerFilter(displayName),
          pageSize: "30",
        });

        const response = await fetch(`/api/airtable/nazmen?${params}`);
        if (!response.ok) throw new Error("Failed to fetch");

        const result = await response.json();
        setRecords(result.data?.records || []);
      } catch (error) {
        console.error("Error fetching nazmen data:", error);
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (displayName) {
      fetchData();
    }
  }, [displayName]);

  const dataItems = useMemo(() => (records || []).map(formatNazmenRecord) as AirtableRecord<NazmenRecord>[], [records]);

  const { updateRecord } = useAirtableMutation(BASE_ID, TABLE);
  const { language } = useLanguage();

  const handleShareClick = async (shaerData: AirtableRecord<NazmenRecord>, index: number) => {
    toggleanaween(null);
    await shareRecordWithCount(
      {
        section: "Nazmen",
        id: shaerData.id,
        title: shaerData.fields.shaer,
        textLines: shaerData.fields.ghazalLines ?? [],
        fallbackSlugText: (shaerData.fields.ghazalLines || [])[0] || (shaerData.fields.unwan || [])[0] || "",
        language,
      },
      {
        onShared: async () => {
          try {
            await updateRecord([{ id: shaerData.id, fields: prepareShareUpdate(shaerData.fields.shares) }]);
          } catch (error) {
            console.error("Error updating shares:", error);
          }
        },
      }
    );
  };

  const handleCardClick = (shaerData: AirtableRecord<NazmenRecord>) => {
    toggleanaween(null);
    setSelectedCard({ id: shaerData.id, fields: { shaer: shaerData.fields.shaer, ghazal: shaerData.fields.ghazalLines || [], id: shaerData.fields.id || shaerData.id } });
  };
  const handleCloseModal = () => setSelectedCard(null);

  const toggleanaween = (cardId: string | null) => setOpenanaween((prev) => (prev === cardId ? null : cardId));
  const handleNewCommentChange = (comment: string) => setNewComment(comment);
  const handleCommentSubmit = async (dataId: string) => {
    if (!requireAuth("comment")) return;
    if (!newComment) return;
    try {
      await submitComment({ recordId: dataId, content: newComment });
      setNewComment("");
      // Update comments count optimistically
      const currentRecord = dataItems.find(d => d.id === dataId);
      const newCommentCount = (currentRecord?.fields.comments ?? 0) + 1;

      // Update local state optimistically
      setRecords(prev =>
        prev.map(r =>
          r.id === dataId
            ? { ...r, fields: { ...r.fields, comments: newCommentCount } }
            : r
        )
      );

      try {
        await updateRecord([
          { id: dataId, fields: { comments: newCommentCount } }
        ]);
      } catch (err) {
        // Rollback the optimistic increment
        setRecords(prev =>
          prev.map(r =>
            r.id === dataId
              ? { ...r, fields: { ...r.fields, comments: Math.max(0, newCommentCount - 1) } }
              : r
          )
        );
      }
    } catch { }
  };
  const openComments = (dataId: string) => { toggleanaween(null); setSelectedCommentId(dataId); setRecordId(dataId); };
  const closeComments = () => { setSelectedCommentId(null); setRecordId(null); };

  return (
    <div>
      <div className="flex flex-row w-screen md:p-6 justify-center items-center top-14 z-10">{`${displayName} کی نظمیں`}</div>
      {isLoading && <SkeletonLoader />}
      {!isLoading && (
        <section>
          <div id="section" dir="rtl" className={`grid md:grid-cols-2 lg:grid-cols-4 gap-4 m-3 min-h-[500px]`}>
            {dataItems.map((shaerData, index) => (
              <div data-aos="fade-up" key={index + shaerData.id}>
                <DataCard
                  page="nazm"
                  download={false}
                  key={index}
                  shaerData={shaerData}
                  index={index}
                  baseId={BASE_ID}
                  table={TABLE}
                  storageKey="Nazmen"

                  handleCardClick={handleCardClick}
                  toggleanaween={toggleanaween}
                  openanaween={openanaween}
                  handleShareClick={handleShareClick as any}
                  openComments={openComments}
                />
              </div>
            ))}
          </div>
        </section>
      )}
      {selectedCommentId && (
        <CommentSection
          dataId={selectedCommentId}
          comments={comments}
          onCommentSubmit={handleCommentSubmit}
          commentLoading={commentLoading}
          newComment={newComment}
          onNewCommentChange={handleNewCommentChange}
          onCloseComments={closeComments}
        />
      )}
    </div>
  );
};

export default Page;
