"use client";
// ShaerCard.tsx
import LoginRequiredDialog from "@/components/ui/login-required-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import useAuthGuard from "@/hooks/useAuthGuard";
import { useLikeButton } from "@/hooks/useLikeButton";
import { createSlug } from "@/lib/airtable-utils";
import { getLanguageFieldValue } from "@/lib/language-field-utils";
import { Download, Heart, MessageCircle, Share2, Tag } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import DynamicDownloadHandler from "./Download";
// Use a minimal local shape for safety without forcing all callers to match a strict type
export type MinimalShaer = {
  id: string;
  fields?: {
    shaer?: string;
    enShaer?: string;
    hiShaer?: string;
    ghazalHead?: string | string[];
    enGhazalHead?: string | string[];
    hiGhazalHead?: string | string[];
    sher?: string | string[];
    enSher?: string | string[];
    hiSher?: string | string[];
    unwan?: string | string[];
    enUnwan?: string | string[];
    hiUnwan?: string | string[];
    likes?: number;
    comments?: number;
    shares?: number;
    // Some sources embed identifiers in fields
    id?: string;
    slugId?: string;
  };
};

// Track records we've warned about to avoid noisy logs
const __warnedNoHandlerIds = new Set<string>();

export interface ShaerCardProps<T extends MinimalShaer = MinimalShaer> {
  page: string;
  shaerData: T; // strongly type record shape (minimal)
  index: number;
  download: boolean;
  // Optional built-in like integration (when provided, enables internal like handling)
  baseId?: string;
  table?: string;
  storageKey?: string;
  // SWR key for precise cache invalidation when internal like is enabled
  swrKey?: any;
  // Optional analytics callback invoked after like toggles
  onLikeChange?: (args: { id: string; liked: boolean; likes: number }) => void;
  handleCardClick: (shaerData: T) => void; // Keep specific type
  toggleanaween: (cardId: string | null) => void;
  openanaween: string | null; // Updated type
  handleHeartClick?: (
    e: React.MouseEvent<HTMLButtonElement>,
    shaerData: T,
    index: number,
    id: string
  ) => void; // Replace Shaer with the actual type
  handleShareClick: (shaerData: T, index: number) => void; // Replace Shaer with the actual type
  openComments: (id: string) => void;
  // Optional state-driven heart control
  heartLiked?: boolean;
  onHeartToggle?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  heartDisabled?: boolean;
  // Back-compat: some callsites rely on DOM id selection
  id?: string;
}

function DataCard<T extends MinimalShaer>({
  page,
  shaerData,
  index,
  download,
  handleCardClick,
  baseId,
  table,
  storageKey,
  swrKey,
  toggleanaween,
  openanaween,
  handleHeartClick,
  handleShareClick,
  openComments,
  heartLiked,
  onHeartToggle,
  heartDisabled,
  id,
  onLikeChange,
}: ShaerCardProps<T>) {
  const { language, isRTL } = useLanguage();
  const [selectedShaer, setSelectedShaer] = useState<MinimalShaer | null>(null);
  const { requireAuth, showLoginDialog, setShowLoginDialog, pendingAction } =
    useAuthGuard();

  const cancelDownload = () => {
    // Reset the selectedShaer state to null
    setSelectedShaer(null);
  };

  // Normalize heads: ensure we always have an array of lines
  const sd = shaerData as MinimalShaer;

  const prefix = language === "UR" ? "" : `/${language}`;
  const withPrefix = (pathname: string) =>
    `${prefix}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;

  const shaerName = useMemo(() => {
    const f = (sd?.fields ?? {}) as Record<string, any>;
    const v = getLanguageFieldValue<string>(f, "shaer", language);
    return String(v ?? f.shaer ?? "");
  }, [sd, language]);

  const ghazalHeadLines: string[] = useMemo(() => {
    const f = (sd?.fields ?? {}) as Record<string, any>;
    const fallbackHead =
      language === "EN"
        ? f.enSher ?? f.sher
        : language === "HI"
          ? f.hiSher ?? f.sher
          : f.sher;
    const head =
      language === "EN"
        ? f.enGhazalHead ?? fallbackHead
        : language === "HI"
          ? f.hiGhazalHead ?? fallbackHead
          : f.ghazalHead ?? fallbackHead;
    if (!head) return [];
    if (Array.isArray(head)) return head.filter(Boolean);
    return head.split("\n").filter(Boolean);
  }, [sd, language]);

  const nazmLines: string[] = useMemo(() => {
    const f = (sd?.fields ?? {}) as Record<string, any>;
    const nazm =
      language === "EN"
        ? f.enNazm ?? f.nazm
        : language === "HI"
          ? f.hiNazm ?? f.nazm
          : f.nazm;
    if (!nazm) return [];
    if (Array.isArray(nazm)) return nazm.filter(Boolean);
    return String(nazm)
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && line !== "****");
  }, [sd, language]);

  const nazmPreviewLines = useMemo(() => {
    if (ghazalHeadLines.length > 0) return ghazalHeadLines;
    return nazmLines.slice(0, 2);
  }, [ghazalHeadLines, nazmLines]);

  // Normalize unwan entries as array
  const unwanList: string[] = useMemo(() => {
    const f = (sd?.fields ?? {}) as Record<string, any>;
    const u = getLanguageFieldValue<string | string[]>(f, "unwan", language);
    if (!u) return [];
    if (Array.isArray(u)) return u.filter(Boolean);
    return u.split("\n").filter(Boolean);
  }, [sd, language]);

  const texts = useMemo(() => {
    if (language === "EN") {
      return {
        topics: "Topics:",
        read: "Read...",
        readGhazal: "Read Ghazal",
        more: "More",
        noMore: "",
        andMore: (n: number) => (n > 0 ? ` and ${n} more` : ""),
      };
    }
    if (language === "HI") {
      return {
        topics: "विषय:",
        read: "पढ़ें...",
        readGhazal: "ग़ज़ल पढ़ें",
        more: "और",
        noMore: "",
        andMore: (n: number) => (n > 0 ? ` और ${n} और` : ""),
      };
    }
    return {
      topics: ":موضوعات",
      read: "پڑھیں۔۔۔",
      readGhazal: "غزل پڑھیں",
      more: "مزید",
      noMore: "",
      andMore: (n: number) => (n > 0 ? ` ، ${n} اور ` : ""),
    };
  }, [language]);

  const recordId = sd?.id || sd?.fields?.id || "";
  const nazmSlugSource =
    unwanList[0] || nazmPreviewLines[0] || shaerName || recordId || "nazm";
  const heartElementId = id || recordId;

  // Built-in like logic: enabled only if baseId/table/storageKey and record id are available
  const likeEnabled = !!(baseId && table && storageKey && recordId);
  const like = likeEnabled
    ? useLikeButton({
        baseId,
        table,
        storageKey,
        recordId,
        currentLikes: (sd?.fields?.likes as number | undefined) ?? 0,
        swrKey,
        onChange: onLikeChange,
      })
    : null;
  const resolvedHeartLiked = like
    ? like.isHydratingLikes
      ? false
      : like.isLiked
    : !!heartLiked;
  const resolvedHeartDisabled = like
    ? like.isHydratingLikes
      ? true
      : like.isDisabled
    : !!heartDisabled;
  const noHandlers = !like && !handleHeartClick && !onHeartToggle;

  // Warn once if the card has no like ability due to missing prerequisites/handlers
  useEffect(() => {
    if (noHandlers && recordId && !__warnedNoHandlerIds.has(recordId)) {
      console.warn(
        `[DataCard] Heart click is disabled: missing baseId/table/storageKey and no legacy handlers for recordId=${recordId}`
      );
      __warnedNoHandlerIds.add(recordId);
    }
  }, [noHandlers, recordId]);
  const onHeart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Internal-like-first when enabled
    if (like) {
      try {
        if (!requireAuth("like")) return;
        await like.handleLikeClick();
      } catch (err) {
        if (err && (err as any).name === "AuthRequiredError") {
          setShowLoginDialog(true);
        }
      }
      return;
    }
    // Legacy precedence when internal like is not enabled: handleHeartClick first, then onHeartToggle
    if (handleHeartClick)
      return handleHeartClick(e, shaerData, index, recordId);
    if (onHeartToggle) return onHeartToggle(e);
    // default: if internal like not enabled and no external handler, do nothing
  };

  return (
    <>
      {page == "nazm" && (
        <div
          dir={isRTL ? "rtl" : "ltr"}
          key={index}
          id={`card${index}`}
          className={`${
            index % 2 === 1 ? "bg-gray-50 dark:bg-[#2d2d2f]" : ""
          } p-4 rounded-sm relative flex flex-col justify-between min-h-[180px] max-h-[200px]`}
        >
          <>
            <div className="flex justify-between items-end">
              <p className="text-3xl mb-4 text-[#984A02]">
                {unwanList[0] ?? ""}
              </p>
              <Link
                href={{
                  pathname: withPrefix(
                    `/Shaer/${encodeURIComponent(
                      shaerName.replace(/\s+/g, "-")
                    )}`
                  ),
                  query: {
                    tab: "intro",
                  },
                }}
              >
                <h2 className="text-foreground text-xl">
                  {shaerName}
                </h2>
              </Link>
            </div>
            <div className="flex items-center justify-baseline text-center icons">
              <div className="sec1 basis-1/2">
                {nazmPreviewLines.map((lin, index) => (
                  <p
                    key={index}
                    className="text-foreground text-lg cursor-default"
                    onClick={() => handleCardClick(shaerData)}
                  >
                    {lin} <span>۔۔۔</span>
                  </p>
                ))}
              </div>
              <div className="sec2 basis-[70%] flex justify-between items-center">
                <button className="text-[#984A02] font-semibold m-3">
                  <Link
                    href={{
                      pathname: withPrefix(
                        `/Nazmen/${encodeURIComponent(
                          createSlug(nazmSlugSource) as string
                        )}/${encodeURIComponent(shaerData?.id)}`
                      ),
                    }}
                  >
                    {texts.read}
                  </Link>
                </button>
                <button
                  id={heartElementId}
                  className={`m-2 flex items-center gap-1 transition-all duration-500 ${
                    resolvedHeartLiked ? "text-red-600" : "text-gray-500"
                  } ${noHandlers ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={onHeart}
                  disabled={resolvedHeartDisabled || noHandlers}
                  aria-disabled={resolvedHeartDisabled || noHandlers}
                >
                  <Heart className="inline" fill="currentColor" size={16} />{" "}
                  <span id="likescount" className="text-gray-500 text-sm">
                    {like ? like.likesCount : shaerData?.fields?.likes ?? 0}
                  </span>
                </button>
                <button
                  className="m-3 flex items-center gap-1"
                  onClick={() => {
                    if (requireAuth("comment")) openComments(shaerData?.id);
                  }}
                >
                  <MessageCircle color="#984A02" className="ml-2" size={16} />{" "}
                  <span className="text-gray-500 text-sm">
                    {shaerData?.fields?.comments ?? 0}
                  </span>
                </button>
                <button
                  className="m-3 flex items-center gap-1"
                  onClick={() => handleShareClick(shaerData, index)}
                >
                  <Share2 color="#984A02" size={16} />{" "}
                  <span className="text-gray-500 text-sm">
                    {shaerData?.fields?.shares ?? 0}
                  </span>
                </button>
              </div>
            </div>
          </>
        </div>
      )}
      {page !== "nazm" && (
        <div
          dir={isRTL ? "rtl" : "ltr"}
          key={index}
          id={`card${index}`}
          className={`${
            index % 2 === 1 ? "bg-gray-50 dark:bg-[#2d2d2f]" : ""
          } p-4 rounded-sm relative flex flex-col h-[250px]`}
        >
          <Link
            href={{
              pathname: withPrefix(
                `/Shaer/${encodeURIComponent(shaerName.replace(/\s+/g, "-"))}`
              ),
              query: { tab: "intro" },
            }}
          >
            <h2 className="text-foreground text-lg mb-4">{shaerName}</h2>
          </Link>
          <div className="unwan flex flex-col w-full items-center mb-2">
            {ghazalHeadLines.map((lin: string, index: number) => (
              <p
                key={index}
                className="text-lg w-full text-center px-6"
                onClick={() => handleCardClick(shaerData)}
              >
                {lin}
              </p>
            ))}
          </div>
          <div className="relative">
            <div
              className="anaween-container flex flex-col items-center absolute bottom-full -translate-y-2 z-10 overflow-y-scroll w-[90px] shadow-md transition-all duration-500 ease-in-out rounded-sm bg-opacity-70 backdrop-blur-sm"
              style={{ height: openanaween === `card${index}` ? "120px" : "0" }}
            >
              {page !== "rand" &&
                unwanList.map((unwaan, index) => (
                  <span key={index} className="text-md text-blue-500 underline p-2">
                    <Link
                      href={{
                        pathname: withPrefix(
                          `/Ghazlen/mozu/${encodeURIComponent(unwaan)}`
                        ),
                      }}
                    >
                      {unwaan}
                    </Link>
                  </span>
                ))}
              {page == "rand" &&
                unwanList.map((unwaan, index) => (
                  <span key={index} className="text-md text-blue-500 underline p-2">
                    <Link
                      href={{
                        pathname: withPrefix(
                          `/Ashaar/mozu/${encodeURIComponent(unwaan)}`
                        ),
                      }}
                    >
                      {unwaan}
                    </Link>
                  </span>
                ))}
            </div>
            <button
              dir="ltr"
              className="text-[#984A02] cursor-auto mt-2 justify-start flex items-start flex-row-reverse border rounded-full px-2 py-1 shadow active:shadow-lg transition-all duration-500 ease-in-out"
              onClick={() => toggleanaween(`card${index}`)}
            >
              <span className="flex items-center">
                {texts.topics}{" "}
                <Tag
                  className="ml-2 text-yellow-400 cursor-pointer"
                  size={16}
                />
              </span>
              {page !== "rand" &&
                (download ? (
                  <Link
                    className="text-blue-500 underline"
                    href={{
                      pathname: withPrefix(
                        `/Ashaar/mozu/${encodeURIComponent(unwanList[0] || "")}`
                      ),
                    }}
                  >
                    {unwanList[0] ?? ""}
                  </Link>
                ) : (
                  <Link
                    className="text-blue-500 underline"
                    href={{
                      pathname: withPrefix(
                        `/Ghazlen/mozu/${encodeURIComponent(unwanList[0] || "")}`
                      ),
                    }}
                  >
                    {unwanList[0] ?? ""}
                  </Link>
                ))}
              {page == "rand" &&
                (download ? (
                  <Link
                    className="text-blue-500 underline"
                    href={{
                      pathname: withPrefix(
                        `/Ashaar/mozu/${encodeURIComponent(
                          unwanList[0] || "nothing"
                        )}`
                      ),
                    }}
                  >
                    {unwanList[0] ?? "nothing"}
                  </Link>
                ) : (
                  <Link
                    className="text-blue-500 underline"
                    href={{
                      pathname: withPrefix(
                        `/Ghazlen/mozu/${encodeURIComponent(
                          unwanList[0] || "nothing"
                        )}`
                      ),
                    }}
                  >
                    {unwanList[0] ?? "nothing"}
                  </Link>
                ))}
              <span dir={isRTL ? "rtl" : "ltr"} className="cursor-auto">
                {texts.andMore(unwanList.length > 1 ? unwanList.length - 1 : 0)}
              </span>
            </button>
          </div>
          <div className="flex items-end text-center w-full">
            <button
              id={heartElementId}
              className={`m-3 flex gap-1 items-center transition-all duration-500 ${
                resolvedHeartLiked ? "text-red-600" : "text-gray-500"
              } ${noHandlers ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={onHeart}
              disabled={resolvedHeartDisabled || noHandlers}
              aria-disabled={resolvedHeartDisabled || noHandlers}
            >
              <Heart className="inline" fill="currentColor" size={16} />{" "}
              <span id="likescount" className="text-gray-500 text-sm">
                {like ? like.likesCount : shaerData?.fields?.likes ?? 0}
              </span>
            </button>
            <button
              className="m-3 flex items-center gap-1"
              onClick={() => {
                if (requireAuth("comment")) openComments(shaerData?.id);
              }}
            >
              <MessageCircle color="#984A02" className="ml-2" size={16} />{" "}
              <span className="text-gray-500 text-sm">
                {shaerData?.fields?.comments ?? 0}
              </span>
            </button>
            <button
              className="m-3 flex items-center gap-1"
              onClick={() => handleShareClick(shaerData, index)}
            >
              <Share2 color="#984A02" size={16} />{" "}
              <span className="text-gray-500 text-sm">
                {shaerData?.fields?.shares ?? 0}
              </span>
            </button>
            <button
              className="text-[#984A02] font-semibold m-3"
              onClick={() => handleCardClick(shaerData)}
            >
              {download ? (
                <Link
                  href={{
                    pathname: withPrefix(
                      `/Ashaar/${encodeURIComponent(
                        createSlug(ghazalHeadLines[0] || "") as string
                      )}/${encodeURIComponent(shaerData?.id)}`
                    ),
                  }}
                >
                  {texts.readGhazal}
                </Link>
              ) : (
                <Link
                  href={{
                    pathname: withPrefix(
                      `/Ghazlen/${encodeURIComponent(
                        createSlug(ghazalHeadLines[0] || "") as string
                      )}/${encodeURIComponent(shaerData?.id)}`
                    ),
                  }}
                >
                  {texts.readGhazal}
                </Link>
              )}
            </button>
            {download && (
              <button
                className="m-3 flex items-center gap-1"
                onClick={() => {
                  if (requireAuth("download")) setSelectedShaer(shaerData);
                }}
              >
                <Download color="#984A02" />
              </button>
            )}
          </div>
          {download && selectedShaer && (
            <div className="fixed z-50 ">
              <DynamicDownloadHandler
                data={shaerData}
                onCancel={cancelDownload}
              />
            </div>
          )}
        </div>
      )}
      {/* Ensure login dialog renders for all variants (nazm and others) */}
      <LoginRequiredDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        actionType={pendingAction || "like"}
      />
    </>
  );
}

export default DataCard;
