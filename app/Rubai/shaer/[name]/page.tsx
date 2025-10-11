"use client";
import type { AirtableRecord, Rubai } from "@/app/types";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useCommentSystem } from "@/hooks/useCommentSystem";
import { useLikeButton } from "@/hooks/useLikeButton";
import { COMMENTS_TABLE, RUBAI_COMMENTS_BASE } from "@/lib/airtable-constants";
import { buildShaerFilter, prepareShareUpdate } from "@/lib/airtable-utils";
import { shareRecordWithCount } from "@/lib/social-utils";
import { updatePagedListField } from "@/lib/swr-updater";
import AOS from "aos";
import "aos/dist/aos.css";
import { XCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import CommentSection from "../../../Components/CommentSection";
import RubaiCard from "../../../Components/RubaiCard";
import SkeletonLoader from "../../../Components/SkeletonLoader";

const RUBAI_BASE = "appIewyeCIcAD4Y11";
const RUBAI_TABLE = "rubai";
const COMMENTS_BASE = RUBAI_COMMENTS_BASE;
const COMMENTS_TABLE_NAME = COMMENTS_TABLE;

const Page = ({ params }: { params: Promise<{ name: string }> }) => {
  const resolved = React.use(params);
  const rawName = decodeURIComponent(resolved.name).replace("_", " ");
  const displayName = rawName.includes("-") ? rawName.replace(/-/g, " ") : rawName;

  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const { comments, isLoading: commentLoading, submitComment, setRecordId } = useCommentSystem(COMMENTS_BASE, COMMENTS_TABLE_NAME, null);
  const { requireAuth } = useAuthGuard();

  useEffect(() => { AOS.init({ offset: 50, delay: 0, duration: 300 }); }, []);

  const { records, isLoading, swrKey, mutate } = useAirtableList<AirtableRecord<any>>(RUBAI_BASE, RUBAI_TABLE, {
    filterByFormula: buildShaerFilter(displayName),
    pageSize: 30,
  });
  const dataItems = records as unknown as Rubai[];

  const { updateRecord } = useAirtableMutation(RUBAI_BASE, RUBAI_TABLE);
  const { language } = useLanguage();

  const handleLikeChange = (args: { id: string; liked: boolean; likes: number }) => {
    try {
      mutate((curr: any) => updatePagedListField(curr, args.id, "likes", args.liked ? 1 : -1), { revalidate: false });
    } catch {}
  };

  const CardItem: React.FC<{ item: Rubai; index: number }> = ({ item, index }) => {
    const like = useLikeButton({
      baseId: RUBAI_BASE,
      table: RUBAI_TABLE,
      storageKey: "Rubai",
      recordId: item.id,
      currentLikes: item.fields?.likes ?? 0,
      swrKey,
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
      await submitComment({ recordId: dataId, content: newComment });
      setNewComment("");
      // If the rubai table tracks comment counts, optimistically increment and rollback on failure
      const current = (dataItems || []).find((i: any) => i.id === dataId);
      const hasCommentsField = current && typeof current.fields?.comments !== 'undefined';
      if (hasCommentsField) {
        // Optimistic local bump via SWR updater; rollback in catch
        const next = (current.fields?.comments || 0) + 1;
        try {
          await updateRecord([
            { id: dataId, fields: { comments: next } }
          ], {
            optimistic: true,
            affectedKeys: swrKey ? [swrKey] : undefined,
            updater: (curr: any) => updatePagedListField(curr, dataId, "comments", 1),
          });
        } catch (err) {
          // Rollback optimistic increment
          try {
            await mutate((curr: any) => updatePagedListField(curr, dataId, "comments", -1), { revalidate: false });
          } catch {}
        }
      }
    } catch {}
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
