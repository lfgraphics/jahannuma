"use client";
import type { Rubai } from "@/app/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useCommentSystem } from "@/hooks/useCommentSystem";
import { useLikeButton } from "@/hooks/useLikeButton";
import { useRubaiData } from "@/hooks/useRubaiData";
import { COMMENTS_TABLE, RUBAI_COMMENTS_BASE } from "@/lib/airtable-constants";
import { buildShaerFilter, prepareShareUpdate } from "@/lib/airtable-utils";
import { shareRecordWithCount } from "@/lib/social-utils";
import AOS from "aos";
import "aos/dist/aos.css";
import { XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import CommentSection from "../../../Components/CommentSection";
import RubaiCard from "../../../Components/RubaiCard";
import SkeletonLoader from "../../../Components/SkeletonLoader";

const { getClientBaseId } = require("@/lib/airtable-client-utils");
const RUBAI_BASE = getClientBaseId("RUBAI");
const RUBAI_TABLE = "rubai";
const COMMENTS_BASE = RUBAI_COMMENTS_BASE;
const COMMENTS_TABLE_NAME = COMMENTS_TABLE;

const Page = ({ params }: { params: Promise<{ name: string }> }) => {
  const resolved = React.use(params);
  const rawName = decodeURIComponent(resolved.name).replace("_", " ");
  const displayName = rawName.includes("-") ? rawName.replace(/-/g, " ") : rawName;

  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading: commentLoading, submitComment, setRecordId } = useCommentSystem(
    RUBAI_COMMENTS_BASE,
    COMMENTS_TABLE
  );
  const { requireAuth } = useAuthGuard();

  useEffect(() => { AOS.init({ offset: 50, delay: 0, duration: 300 }); }, []);

  const {
    records: dataItems,
    isLoading,
    cacheKey,
    optimisticUpdate
  } = useRubaiData({
    filterByFormula: buildShaerFilter(displayName),
    pageSize: 30,
  });

  const { updateRecord } = useAirtableMutation(getClientBaseId("RUBAI"), "Rubai");
  const { language } = useLanguage();

  const handleLikeChange = (args: { id: string; liked: boolean; likes: number }) => {
    optimisticUpdate.updateRecord(args.id, { likes: args.likes });
  };

  const CardItem: React.FC<{ item: Rubai; index: number }> = ({ item, index }) => {
    const like = useLikeButton({
      baseId: getClientBaseId("RUBAI"),
      table: "rubai",
      storageKey: "Rubai",
      recordId: item.id,
      currentLikes: item.fields?.likes ?? 0,
      onChange: handleLikeChange,
    });
    const onHeart = async (_e: React.MouseEvent<HTMLButtonElement>) => {
      if (!requireAuth("like")) return;
      await like.handleLikeClick();
    };
    return (
      <RubaiCard
        RubaiData={item}
        index={index}
        handleHeartClick={onHeart}
        openComments={openComments}
        handleShareClick={handleShareClick}
        isLiking={like.isDisabled}
        isLiked={like.isLiked}
        likesCount={like.likesCount}
      />
    );
  };

  const handleShareClick = async (item: Rubai, index: number) => {
    await shareRecordWithCount(
      {
        section: "Rubai",
        id: item.id,
        title: item.fields?.shaer,
        textLines: [String(item.fields?.body ?? "")],
        fallbackSlugText: (String(item.fields?.body ?? "").split("\n").find(l => l.trim().length > 0) ?? ""),
        language,
      },
      {
        onShared: async () => {
          try {
            await updateRecord([{ id: item.id, fields: prepareShareUpdate(item.fields?.shares) }]);
          } catch (error) {
            console.error("Error updating shares:", error);
          }
        },
      }
    );
  };

  const handleNewCommentChange = (comment: string) => setNewComment(comment);
  const handleCommentSubmit = async (dataId: string) => {
    if (!requireAuth("comment")) return;
    if (!newComment) return;
    try {
      await submitComment({
        recordId: dataId,
        content: newComment
      });
      setNewComment("");

      // Optimistically update comment count
      const current = (dataItems || []).find((i: any) => i.id === dataId);
      const newCommentCount = (current?.fields?.comments || 0) + 1;
      optimisticUpdate.updateRecord(dataId, { comments: newCommentCount });

      try {
        await updateRecord([{ id: dataId, fields: { comments: newCommentCount } }]);
      } catch (error) {
        // Rollback optimistic comment increment
        const rollbackCount = Math.max(0, newCommentCount - 1);
        optimisticUpdate.updateRecord(dataId, { comments: rollbackCount });
        console.error("Error updating comments on the server:", error);
      }
    } catch (error) {
      // Comment submission failed, no need to rollback
      console.error("Error submitting comment:", error);
    }
  };
  const openComments = (dataId: string) => { setSelectedCommentId(dataId); setRecordId(dataId); };
  const closeComments = () => { setSelectedCommentId(null); setRecordId(null); };

  return (
    <div>
      <div className="flex flex-row w-full p-3 justify-center items-center top-14 z-10">{`${displayName} رباعی `}</div>
      {isLoading && <SkeletonLoader />}
      {!isLoading && (
        <section>
          <div id="section" dir="rtl" className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`}>
            {dataItems.map((data, index) => (
              <div data-aos="fade-up" key={data.id}>
                <CardItem item={data as any} index={index} />
              </div>
            ))}
          </div>
        </section>
      )}
      {selectedCommentId && (
        <button className=" fixed  bottom-[48svh] right-3 z-50 rounded-full  h-10 w-10 pt-2 " id="modlBtn" onClick={() => closeComments()}>
          <XCircle className="text-gray-700 text-3xl hover:text-[#984A02] transition-all duration-500 ease-in-out" />
        </button>
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
