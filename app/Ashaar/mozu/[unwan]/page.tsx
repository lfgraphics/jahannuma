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
import { buildDataIdFilter, buildUnwanFilter, formatAshaarRecord, showMutationToast } from "@/lib/airtable-utils";
import { updatePagedListField } from "@/lib/swr-updater";
import { useCommentSystem } from "@/hooks/useCommentSystem";
import { ASHAAR_COMMENTS_BASE, COMMENTS_TABLE } from "@/lib/airtable-constants";
import useAuthGuard from "@/hooks/useAuthGuard";

const ASHAAR_BASE = "appeI2xzzyvUN5bR7";
const ASHAAR_TABLE = "Ashaar";
const COMMENTS_BASE = ASHAAR_COMMENTS_BASE;
const COMMENTS_TABLE_NAME = COMMENTS_TABLE;

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

    const { records, isLoading, swrKey: listSWRKey, mutate } = useAirtableList<AirtableRecord<any>>(ASHAAR_BASE, ASHAAR_TABLE, {
        filterByFormula: buildUnwanFilter(decodedUnwan),
        pageSize: 30,
    });
    const { updateRecord } = useAirtableMutation(ASHAAR_BASE, ASHAAR_TABLE);
    const { createRecord, isCreating } = useAirtableCreate(COMMENTS_BASE, COMMENTS_TABLE);

    const dataItems = useMemo(() => (records || []).map((r: AirtableRecord<any>) => formatAshaarRecord(r)), [records]);

    const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);
    const [selectedCard, setSelectedCard] = useState<SelectedCard | null>(null);
    const [openanaween, setOpenanaween] = useState<string | null>(null);
    const [newComment, setNewComment] = useState("");
    const { comments, isLoading: commentLoading, submitComment, setRecordId } = useCommentSystem(COMMENTS_BASE, COMMENTS_TABLE_NAME, null);
    const { requireAuth } = useAuthGuard();
    const [likedMap, setLikedMap] = useState<LikedMap>({});
    const [disableHearts, setDisableHearts] = useState(false);

    useEffect(() => {
        AOS.init({ offset: 50, delay: 0, duration: 300 });
    }, []);

    // use isLoading directly; remove legacy mirrored loading state

    // likes now come from Clerk metadata via DataCard/useLikeButton; no localStorage init
    useEffect(() => { setLikedMap({}); }, [dataItems]);

    // use shared mutation toast helper from airtable-utils

    // Legacy like handler removed; DataCard will manage likes internally

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

    const handleNewCommentChange = (comment: string) => setNewComment(comment);
    const handleCommentSubmit = async (dataId: string) => {
        if (!requireAuth("comment")) return;
        if (!newComment) return;
        try {
            await submitComment({ recordId: dataId, content: newComment });
            setNewComment("");
            try {
                await updateRecord([
                    { id: dataId, fields: { comments: (dataItems.find((d: AirtableRecord<AshaarRecord>) => d.id === dataId)?.fields.comments ?? 0) + 1 } }
                ], {
                    optimistic: true,
                    affectedKeys: listSWRKey ? [listSWRKey] : undefined,
                    updater: (current: any) => updatePagedListField(current, dataId, "comments", 1),
                });
            } catch (err) {
                // Rollback the optimistic increment on failure
                try {
                    await mutate(
                        (current: any) => updatePagedListField(current, dataId, "comments", -1),
                        { revalidate: false }
                    );
                } catch {}
            }
        } catch {}
    };

    const openComments = (dataId: string) => {
        setSelectedCommentId(dataId);
        setRecordId(dataId);
    };
    const closeComments = () => {
        setSelectedCommentId(null);
        setRecordId(null);
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
                                    baseId={ASHAAR_BASE}
                                    table={ASHAAR_TABLE}
                                    storageKey="Ashaar"
                                    swrKey={listSWRKey as any}
                                    handleShareClick={handleShareClick}
                                    openComments={openComments}
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

            {/* Close handled via DrawerClose inside CommentSection */}
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
