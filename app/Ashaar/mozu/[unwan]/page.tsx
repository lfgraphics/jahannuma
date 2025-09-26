"use client";
import React, { useEffect, useMemo, useState } from "react";
import { XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import CommentSection from "../../../Components/CommentSection";
import DataCard, { MinimalShaer } from "../../../Components/DataCard";
import AOS from "aos";
import "aos/dist/aos.css";
import { useAirtableList } from "@/hooks/useAirtableList";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import { useAirtableCreate } from "@/hooks/useAirtableCreate";
import type { AirtableRecord, AshaarRecord, CommentRecord, LikedMap, MozuPageParams, SelectedCard } from "@/app/types";
import { buildDataIdFilter, buildUnwanFilter, formatAshaarRecord, getLikedItems, toggleLikedItem, showMutationToast } from "@/lib/airtable-utils";
import { updatePagedListField } from "@/lib/swr-updater";

const ASHAAR_BASE = "appeI2xzzyvUN5bR7";
const ASHAAR_TABLE = "Ashaar";
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

    const { records, isLoading, swrKey: listSWRKey } = useAirtableList<AirtableRecord<any>>(ASHAAR_BASE, ASHAAR_TABLE, {
        filterByFormula: buildUnwanFilter(decodedUnwan),
        pageSize: 30,
    });
    const { updateRecord } = useAirtableMutation(ASHAAR_BASE, ASHAAR_TABLE);
    const { createRecord, isCreating } = useAirtableCreate(COMMENTS_BASE, COMMENTS_TABLE);

    const dataItems = useMemo(() => (records || []).map((r: AirtableRecord<any>) => formatAshaarRecord(r)), [records]);

    const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
    const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null);
    const [openanaween, setOpenanaween] = useState<string | null>(null);
    const [commentorName, setCommentorName] = useState<string | null>(null);
    const [comments, setComments] = useState<CommentRecord[]>([]);
    const [commentLoading, setCommentLoading] = useState(false);
    const [newComment, setNewComment] = useState("");
    const [likedMap, setLikedMap] = useState<LikedMap>({});
    const [disableHearts, setDisableHearts] = useState(false);

    useEffect(() => {
        AOS.init({ offset: 50, delay: 0, duration: 300 });
    }, []);

    // use isLoading directly; remove legacy mirrored loading state

    // init liked from localStorage for these records
    useEffect(() => {
        try {
            const existing = getLikedItems<{ id: string }>("Ashaar");
            const map: LikedMap = {};
            for (const item of dataItems) map[item.id] = existing.some((d: { id: string }) => d.id === item.id);
            setLikedMap(map);
        } catch { }
    }, [dataItems]);

    // use shared mutation toast helper from airtable-utils

    const handleHeartClick = async (
        e: React.MouseEvent<HTMLButtonElement>,
        shaerData: AirtableRecord<AshaarRecord>,
        index: number,
        id: string
    ) => {
        toggleanaween(null);
        if (e.detail === 1) {
            setDisableHearts(true);
            try {
                const { liked } = toggleLikedItem("Ashaar", shaerData);
                const prev = likedMap[id];
                setLikedMap((prevMap: LikedMap) => ({ ...prevMap, [id]: liked }));
                showMutationToast(liked ? "success" : "warning", liked ? "آپ کی پروفائل میں یہ غزل کامیابی کے ساتھ جوڑ دی گئی ہے۔" : "آپ کی پروفائل سے یہ غزل کامیابی کے ساتھ ہٹا دی گئی ہے۔");

                const inc = liked ? 1 : -1;
                const targetId = shaerData.id;
                await updateRecord([
                    { id: targetId, fields: { likes: (shaerData.fields.likes ?? 0) + inc } },
                ], {
                    optimistic: true,
                    affectedKeys: listSWRKey ? [listSWRKey] : undefined,
                    updater: (current: any) => updatePagedListField(current, targetId, "likes", inc),
                });
            } catch (error) {
                const prev = likedMap[id];
                setLikedMap((prevMap: LikedMap) => ({ ...prevMap, [id]: prev }));
                toast.error("لائیک اپڈیٹ میں مسئلہ آیا۔");
            } finally {
                setDisableHearts(false);
            }
        }
    };

    const handleShareClick = async (shaerData: AirtableRecord<AshaarRecord>, index: number) => {
        toggleanaween(null);
        try {
            if (navigator.share) {
                const target = (shaerData.fields as any).slugId ?? shaerData.id;
                await navigator.share({
                    title: shaerData.fields.shaer,
                    text: (shaerData.fields.ghazalHead || []).join("\n") + `\nFound this on Jahannuma webpage\nCheckout there webpage here>> `,
                    url: `${window.location.origin}/Ashaar/${encodeURIComponent(target)}`,
                });
                const inc = 1;
                const targetId = shaerData.id;
                await updateRecord([
                    { id: targetId, fields: { shares: (shaerData.fields.shares ?? 0) + inc } }
                ], {
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

    const handleCardClick = (shaerData: AirtableRecord<AshaarRecord>) => {
        toggleanaween(null);
        setSelectedCard({
            id: shaerData.id,
            fields: { shaer: shaerData.fields.shaer, ghazal: shaerData.fields.ghazal || [], id: shaerData.fields.id || shaerData.id },
        });
    };
    const handleCloseModal = () => setSelectedCard(null);

    //toggling anaween box
    const toggleanaween = (cardId: string | null) => setOpenanaween((prev) => (prev === cardId ? null : cardId));

    const [showDialog, setShowDialog] = useState(false);

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
        if (!commentorName && storedName) setCommentorName(storedName);
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
            if (!commentorName && storedName) setCommentorName(storedName);
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

                // increment comments count on main record
                await updateRecord([{ id: dataId, fields: { comments: (dataItems.find((d: AirtableRecord<AshaarRecord>) => d.id === dataId)?.fields.comments ?? 0) + 1 } }], {
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
        setSelectedCommentId(dataId);
    };
    const closeComments = () => {
        setSelectedCommentId(null);
        setComments([]);
    };

    // removed legacy search placeholders

    return (
        <div>
            <div className="flex flex-row w-screen border-b-2 p-3 justify-center items-center">
                <div className="text-4xl m-5">{`اشعار بعنوان : ${decodedUnwan}`}</div>
            </div>
            {isLoading && <SkeletonLoader />}
            {!isLoading && (
                <section>
                    <div id="section" dir="rtl" className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 m-3`}>
                        {dataItems.map((shaerData: AirtableRecord<AshaarRecord>, index: number) => (
                            <div data-aos="fade-up" key={shaerData.id}>
                                <DataCard<AirtableRecord<AshaarRecord>>
                                    page="ashaar"
                                    download={true}
                                    shaerData={shaerData}
                                    index={index}
                                    handleCardClick={handleCardClick}
                                    toggleanaween={toggleanaween}
                                    openanaween={openanaween}
                                    handleHeartClick={handleHeartClick}
                                    handleShareClick={handleShareClick}
                                    openComments={openComments}
                                    heartLiked={!!likedMap[shaerData.id]}
                                    onHeartToggle={(e) => handleHeartClick(e, shaerData, index, `${shaerData.id}`)}
                                    heartDisabled={disableHearts}
                                />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {selectedCard && (
                <div onClick={handleCloseModal} id="modal" className="bg-black bg-opacity-50 backdrop-blur-[2px] h-[100vh] w-[100vw] fixed top-0 z-20 overflow-hidden pb-5">
                    <div dir="rtl" className="opacity-100 fixed bottom-0 left-0 right-0   transition-all ease-in-out min-h-[60svh] max-h-[70svh] overflow-y-scroll z-50 rounded-lg rounded-b-none w-[98%] mx-auto border-2 border-b-0">
                        <div className="p-4 pr-0 relative">
                            <button id="modlBtn" className="sticky top-4 right-7 z-50" onClick={handleCloseModal}>
                                <XCircle className="text-gray-700 h-8 w-8 hover:text-[#984A02] transition-all duration-500 ease-in-out" />
                            </button>
                            <h2 className="text-black text-4xl text-center top-0  sticky pt-3 -mt-8 pb-3 border-b-2 mb-3">{selectedCard.fields.shaer}</h2>
                            {selectedCard.fields.ghazal.map((line: string, index: number) => (
                                <p key={index} className="justif w-[320px] text-black pb-3 pr-4 text-2xl">
                                    {line}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {selectedCommentId && (
                <button className=" fixed bottom-24 left-7 z-50 rounded-full  h-10 w-10 pt-2 " id="modlBtn" onClick={() => closeComments()}>
                    <XCircle className="text-gray-700 h-8 w-8 hover:text-[#984A02] transition-all duration-500 ease-in-out" />
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
}
