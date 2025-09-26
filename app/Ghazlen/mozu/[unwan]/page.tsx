"use client";
import React, { useEffect, useMemo, useState } from "react";
import { XCircle } from "lucide-react";
import { format } from "date-fns";
import CommentSection from "../../../Components/CommentSection";
import DataCard from "../../../Components/DataCard";
import AOS from "aos";
import "aos/dist/aos.css";
import { Drawer, DrawerContent, DrawerClose } from "@/components/ui/drawer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import { useAirtableCreate } from "@/hooks/useAirtableCreate";
import type { AirtableRecord, GhazlenRecord, LikedMap, MozuPageParams, CommentRecord, SelectedCard } from "@/app/types";
import { buildDataIdFilter, buildUnwanFilter, formatGhazlenRecord, getLikedItems, toggleLikedItem } from "@/lib/airtable-utils";
import { updatePagedListField } from "@/lib/swr-updater";

const GHAZLEN_BASE = "appvzkf6nX376pZy6";
const GHAZLEN_TABLE = "Ghazlen";
const COMMENTS_BASE = "appzB656cMxO0QotZ";
const COMMENTS_TABLE = "Comments";

const SkeletonLoader = () => (
  <div className="flex flex-col items-center">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3">
      {[...Array(12)].map((_, index) => (
        <div key={index} role="status" className="flex items-center justify-center h-56 w-[350px] max-w-sm bg-gray-300 rounded-lg animate-pulse dark:bg-gray-700"></div>
      ))}
    </div>
  </div>
);

export default function Page({ params }: { params: MozuPageParams }) {
  const encodedUnwan = params.unwan;
  const decodedUnwan = decodeURIComponent(encodedUnwan);

  const { records, isLoading, swrKey: listSWRKey } = useAirtableList<AirtableRecord<any>>(GHAZLEN_BASE, GHAZLEN_TABLE, {
    filterByFormula: buildUnwanFilter(decodedUnwan),
    pageSize: 30,
  });
  const { updateRecord } = useAirtableMutation(GHAZLEN_BASE, GHAZLEN_TABLE);
  const { createRecord } = useAirtableCreate(COMMENTS_BASE, COMMENTS_TABLE);

  const dataItems = useMemo(() => (records || []).map((r) => formatGhazlenRecord(r)), [records]);

  const [selectedCommentId, setSelectedCommentId] = React.useState<string | null>(null);
  const [selectedCard, setSelectedCard] = React.useState<SelectedCard | null>(null);
  const [openanaween, setOpenanaween] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [commentorName, setCommentorName] = useState<string | null>(null);
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [disableHearts, setDisableHearts] = useState(false);
  const [likedMap, setLikedMap] = useState<LikedMap>({});

  useEffect(() => {
    AOS.init({ offset: 50, delay: 0, duration: 300 });
  }, []);

  // init liked map from localStorage
  useEffect(() => {
    try {
      const existing = getLikedItems<{ id: string }>("Ghazlen");
      const map: LikedMap = {};
      for (const item of dataItems) map[item.id] = existing.some((d) => d.id === item.id);
      setLikedMap(map);
    } catch {}
  }, [dataItems]);

  const handleHeartClick = async (
    e: React.MouseEvent<HTMLButtonElement>,
    shaerData: AirtableRecord<GhazlenRecord>,
    index: number,
    id: string
  ) => {
    toggleanaween(null);
    setDisableHearts(true);
    if (e.detail === 1) {
      try {
        const { liked } = toggleLikedItem("Ghazlen", shaerData as any);
        setLikedMap((prev) => ({ ...prev, [id]: liked }));
        toast[liked ? "success" : "error"](
          liked ? "آپ کی پروفائل میں یہ غزل کامیابی کے ساتھ جوڑ دی گئی ہے۔" : "آپ کی پروفائل سے یہ غزل کامیابی کے ساتھ ہٹا دی گئی ہے۔"
        );
        const inc = liked ? 1 : -1;
        const targetId = shaerData.id;
        await updateRecord([{ id: targetId, fields: { likes: (shaerData.fields.likes ?? 0) + inc } }], {
          optimistic: true,
          affectedKeys: listSWRKey ? [listSWRKey] : undefined,
          updater: (current) => updatePagedListField(current, targetId, "likes", inc),
        });
        setDisableHearts(false);
      } catch (error) {
        console.error("Error updating likes:", error);
        setDisableHearts(false);
      }
    }
  };

  const handleShareClick = async (shaerData: AirtableRecord<GhazlenRecord>, index: number) => {
    toggleanaween(null);
    try {
      if (navigator.share) {
        const head = Array.isArray(shaerData.fields.ghazalHead)
          ? shaerData.fields.ghazalHead
          : String(shaerData.fields.ghazalHead || "").split("\n");
        const target = (shaerData.fields as any).slugId ?? shaerData.id;
        const url = `${window.location.origin}/Ghazlen/${encodeURIComponent(target)}`;
        await navigator.share({
          title: shaerData.fields.shaer,
          text: head.join("\n") + `\nFound this on Jahannuma webpage\nCheckout there webpage here>> `,
          url,
        });
        const inc = 1;
        const targetId = shaerData.id;
        await updateRecord([{ id: targetId, fields: { shares: (shaerData.fields.shares ?? 0) + inc } }], {
          optimistic: true,
          affectedKeys: listSWRKey ? [listSWRKey] : undefined,
          updater: (current: any) => updatePagedListField(current, targetId, "shares", inc),
        });
      } else {
        console.warn("Web Share API is not supported.");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleCardClick = (shaerData: AirtableRecord<GhazlenRecord>) => {
    toggleanaween(null);
    const ghazalArr = Array.isArray(shaerData.fields.ghazal)
      ? shaerData.fields.ghazal
      : String(shaerData.fields.ghazal || "").split("\n");
    setSelectedCard({ id: shaerData.id, fields: { shaer: shaerData.fields.shaer, ghazal: ghazalArr, id: (shaerData.fields as any).id || shaerData.id } });
  };
  const handleCloseModal = () => setSelectedCard(null);

  const toggleanaween = (cardId: string | null) => setOpenanaween((prev) => (prev === cardId ? null : cardId));
  const hideDialog = () => setShowDialog(false);
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => setNameInput(event.target.value);
  const handleNameSubmission = () => {
    if (typeof window !== "undefined") localStorage.setItem("commentorName", nameInput);
    setCommentorName(nameInput);
    hideDialog();
  };

  const { records: commentRecords, isLoading: commentsLoading } = useAirtableList<AirtableRecord<CommentRecord>>(
    COMMENTS_BASE,
    COMMENTS_TABLE,
    {
      filterByFormula: selectedCommentId ? buildDataIdFilter(selectedCommentId) : undefined,
      pageSize: 30,
    },
    { enabled: !!selectedCommentId }
  );
  useEffect(() => {
    const storedName = typeof window !== "undefined" ? localStorage.getItem("commentorName") : null;
    if (!commentorName && storedName === null) setShowDialog(true);
    else setCommentorName(commentorName || storedName);
  }, [selectedCommentId]);
  useEffect(() => {
    setCommentLoading(commentsLoading);
    const mapped = (commentRecords || []).map((r: AirtableRecord<CommentRecord>) => r.fields);
    setComments(mapped as CommentRecord[]);
  }, [commentRecords, commentsLoading]);

  const handleNewCommentChange = (comment: string) => setNewComment(comment);
  const handleCommentSubmit = async (dataId: string) => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("commentorName");
      if (!commentorName && storedName === null) setShowDialog(true);
      else setCommentorName(commentorName || storedName);
    }
    if (newComment !== "") {
      try {
        const timestamp = new Date().toISOString();
        const date = new Date(timestamp);
        const formattedDate = format(date, "MMMM dd, yyyy h:mm", {});
        const commentData: CommentRecord = { dataId, commentorName: commentorName || "Anonymous", timestamp: formattedDate, comment: newComment };

        await createRecord([{ fields: commentData as any }]);
        setComments((prev) => [...prev, commentData]);
        setNewComment("");

        await updateRecord([{ id: dataId, fields: { comments: (dataItems.find((d: AirtableRecord<GhazlenRecord>) => d.id === dataId)?.fields.comments ?? 0) + 1 } }], {
          optimistic: true,
          affectedKeys: listSWRKey ? [listSWRKey] : undefined,
          updater: (current: any) => updatePagedListField(current, dataId, "comments", 1),
        });
      } catch (error) {
        console.error(`Error adding comment: ${error}`);
      }
    }
  };

  const openComments = (dataId: string) => {
    toggleanaween(null);
    setSelectedCommentId(dataId);
  };
  const closeComments = () => {
    setSelectedCommentId(null);
    setComments([]);
  };

  return (
    <div className="min-h-screen">
      {/* Name collection using shadcn Dialog */}
  <Dialog open={showDialog} onOpenChange={(open: boolean) => setShowDialog(open)}>
        <DialogContent className="max-w-[380px] w-full mx-auto">
          <div dir="rtl" className="p-6 rounded-md text-center">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold pb-3 border-b border-slate-700">براہ کرم اپنا نام درج کریں</DialogTitle>
            </DialogHeader>
            <p className="pt-2">ہم آپ کا نام صرف آپ کے تبصروں کو آپ کے نام سے دکھانے کے لیے استعمال کریں گے</p>
            <input type="text" id="nameInput" className="mt-4 p-2 border border-slate-700 w-full" value={nameInput} onChange={handleNameChange} />
            <div className="mt-4 flex justify-center">
              <button id="submitBtn" disabled={nameInput.length < 4} className="px-4 py-2 bg-[#984A02] disabled:bg-gray-500 rounded" onClick={handleNameSubmission}>
                محفوظ کریں
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-row w-full border-b border-slate-700 p-3 justify-center items-center">
        <div className="text-2xl sm:text-3xl md:text-4xl m-5">{`غزلیں بعنوان : ${decodedUnwan}`}</div>
      </div>

      {isLoading && <SkeletonLoader />}

      {!isLoading && (
        <section>
          <div id="section" dir="rtl" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-3">
            {dataItems.map((shaerData, index) => (
              <div data-aos="fade-up" key={shaerData.id || index}>
                <DataCard<AirtableRecord<GhazlenRecord>>
                  page="ghazal"
                  download={false}
                  shaerData={shaerData}
                  index={index}
                  handleCardClick={handleCardClick}
                  toggleanaween={toggleanaween}
                  openanaween={openanaween}
                  handleHeartClick={handleHeartClick}
                  handleShareClick={handleShareClick}
                  openComments={openComments}
                  heartLiked={!!likedMap[shaerData.id]}
                  heartDisabled={disableHearts}
                  onHeartToggle={(e) => handleHeartClick(e, shaerData, index, `${shaerData.id}`)}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Selected card shown via shadcn Drawer */}
  <Drawer open={!!selectedCard} onOpenChange={(open: boolean) => { if (!open) handleCloseModal(); }}>
        <DrawerContent className="p-0 bg-transparent shadow-none">
          {selectedCard && (
            <div onClick={(e) => e.stopPropagation()} dir="rtl" className="opacity-100 fixed bottom-0 left-0 right-0 transition-all ease-in-out min-h-[60svh] max-h-[70svh] overflow-y-auto z-50 rounded-lg rounded-b-none w-[98%] mx-auto border-2 border-b-0 border-slate-700">
              <div className="p-4 pr-0 relative">
                <DrawerClose asChild>
                  <XCircle id="modlBtn" className="text-slate-200 sticky top-4 right-7 z-50 h-8 w-8 hover:text-[#984A02] transition-all duration-500 ease-in-out" />
                </DrawerClose>
                <h2 className=" text-2xl sm:text-3xl md:text-4xl text-center top-0 bg-slate-900 sticky pt-3 -mt-8 pb-3 border-b-2 border-slate-700 mb-3">{selectedCard.fields.shaer}</h2>
                <div className="px-4 pb-8">
                  {selectedCard.fields.ghazal.map((line: string, idx: number) => (
                    <p key={idx} className="w-full  pb-3 pr-4 text-lg sm:text-xl md:text-2xl">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {/* Comment section toggle */}
      {selectedCommentId && (
        <button className=" fixed bottom-24 left-7 z-50 rounded-full  h-10 w-10 pt-2 " id="modlBtn" onClick={() => closeComments()}>
          <XCircle className="text-slate-200 h-8 w-8 hover:text-[#984A02] transition-all duration-500 ease-in-out" />
        </button>
      )}
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
    </div>
  );
}
