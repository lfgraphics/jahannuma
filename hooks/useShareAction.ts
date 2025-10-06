"use client";
import { useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getMessageText } from "@/lib/multilingual-texts";
import { shareRecordWithCount } from "@/lib/social-utils";
import { useAirtableMutation } from "@/hooks/useAirtableMutation";
import useAuthGuard from "@/hooks/useAuthGuard";
import { showMutationToast, generateRecordCacheKey } from "@/lib/airtable-utils";
import type { AirtableSWRKey } from "@/lib/airtable-fetcher";
import { buildAirtableCacheKey } from "@/lib/airtable-fetcher";
import { getCachedRecord, getStaleCachedRecord } from "@/lib/cache-utils";
import { handleShare as fallbackHandleShare } from "@/lib/social-utils";
import { mutate as swrMutate } from "swr";
import { invalidateAirtable } from "@/lib/airtable-fetcher";

export interface UseShareActionArgs {
  baseId?: string;
  table?: string;
  recordId?: string;
  section: string; // e.g., "Ashaar", "Ghazlen"
  title: string;
  textLines?: string[];
  slugId?: string | null;
  fallbackSlugText?: string | null;
  swrKey?: AirtableSWRKey | string | null;
  currentShares?: number | null;
  // Optional explicit URL to share when no record context exists (e.g., static language pages with #anchors)
  url?: string | null;
}

export function useShareAction(args: UseShareActionArgs) {
  const { baseId, table, recordId, section, title, textLines = [], slugId, fallbackSlugText, swrKey, currentShares, url } = args;
  const { language } = useLanguage();
  // Bind a mutation for the hook-level base/table (may be empty if caller supplies overrides per call)
  const boundMutation = useAirtableMutation(baseId || "", table || "");
  const { requireAuth, showLoginDialog, setShowLoginDialog, pendingAction } = useAuthGuard();
  const [isSharing, setSharing] = useState(false);

  // Fallback dynamic updater when overrides specify a different base/table than the bound one
  async function patchAirtable(base: string, tbl: string, body: { records: Array<{ id: string; fields: Record<string, any> }> }) {
    const res = await fetch(`https://api.airtable.com/v0/${base}/${encodeURIComponent(tbl)}` , {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_Api_Token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Airtable PATCH failed: ${res.status} ${text}`);
    }
    return res.json();
  }

  async function updateRecordDynamic(params: {
    base: string;
    tbl: string;
    records: Array<{ id: string; fields: Record<string, any> }>;
    affectedKeys?: any[];
  }) {
    const { base, tbl, records, affectedKeys } = params;
    await patchAirtable(base, tbl, { records });
    invalidateAirtable(base, tbl);
    if (affectedKeys && affectedKeys.length) {
      for (const key of affectedKeys) {
        await swrMutate(key);
      }
    } else {
      await swrMutate((key: any) => typeof key === "object" && key?.baseId === base && key?.table === tbl, undefined, { revalidate: true });
    }
  }

  // Allow per-call override so callers with dynamic items (e.g., language pages) can reuse one hook
  const handleShare = useCallback(async (override?: Partial<UseShareActionArgs>) => {
    if (isSharing) return;
    setSharing(true);

    // Merge base args with overrides
    const ctx = { baseId, table, recordId, section, title, textLines, slugId, fallbackSlugText, swrKey, currentShares, url, ...(override || {}) } as UseShareActionArgs;
    const hasRecord = !!(ctx.baseId && ctx.table && ctx.recordId);
    const recordCacheKey = hasRecord ? generateRecordCacheKey(ctx.baseId!, ctx.table!, ctx.recordId!) : undefined as any;
    try {
      const doShare = async () => {
        // If record context exists, use route-aware sharing with count; else fallback to direct handleShare
        if (hasRecord) {
          return await shareRecordWithCount({
            section: ctx.section,
            id: ctx.recordId!,
            title: ctx.title,
            textLines: ctx.textLines,
            slugId: ctx.slugId ?? undefined,
            fallbackSlugText: ctx.fallbackSlugText ?? undefined,
            language,
          }, handlers);
        } else {
          const origin = typeof window !== "undefined" ? window.location.href : "";
          const targetUrl = ctx.url || origin;
          const text = (ctx.textLines || []).join("\n");
          await fallbackHandleShare(targetUrl, ctx.title, text, language as any);
          // Manually invoke onShared callback to keep UX consistent (no Airtable update will occur)
          await handlers.onShared?.();
          return true;
        }
      };
      const handlers = {
        onShared: async () => {
          // Compute current shares
          try {
            if (hasRecord) {
              let baseShares = (ctx.currentShares ?? null) as number | null;
              // 1) Try simple record cache
              try {
                const simpleKey = generateRecordCacheKey(ctx.baseId!, ctx.table!, ctx.recordId!);
                const cached = getCachedRecord<any>(simpleKey) ?? getStaleCachedRecord<any>(simpleKey);
                let v = cached?.fields?.shares ?? cached?.shares;
                if (typeof v === 'number') baseShares = v;
              } catch {}
              // 2) Try exact SWR key cache
              try {
                if (typeof ctx.swrKey === 'object' && (ctx.swrKey as any).kind === 'record') {
                  const exactKey = buildAirtableCacheKey(ctx.swrKey as AirtableSWRKey);
                  const cachedExact = getCachedRecord<any>(exactKey) ?? getStaleCachedRecord<any>(exactKey);
                  const v2 = cachedExact?.fields?.shares ?? cachedExact?.shares;
                  if (typeof v2 === 'number') baseShares = v2;
                }
              } catch {}
              const nextShares = Math.max(0, (baseShares ?? 0) + 1);
              const keys = [ctx.swrKey, recordCacheKey].filter(Boolean) as any[];
              // Prefer bound mutation when base/table match; else use dynamic updater
              if (ctx.baseId && ctx.table && baseId && table && ctx.baseId === baseId && ctx.table === table) {
                await boundMutation.updateRecord([{ id: ctx.recordId!, fields: { shares: nextShares } }], {
                  optimistic: false,
                  affectedKeys: keys,
                });
              } else if (ctx.baseId && ctx.table) {
                await updateRecordDynamic({ base: ctx.baseId, tbl: ctx.table, records: [{ id: ctx.recordId!, fields: { shares: nextShares } }], affectedKeys: keys });
              }
            }
          } catch {}
          showMutationToast("success", getMessageText("shareSuccess" as any, language) || "Shared successfully");
        },
        onCancel: () => {
          // Silent or info toast if desired
          // showMutationToast("warning", getMessageText("shareCancelled" as any, language) || "Share cancelled");
        },
        onError: (err: unknown) => {
          showMutationToast("error", getMessageText("error" as any, language) || "Something went wrong");
        },
      } as const;
      const ok = await doShare();
      return ok;
    } finally {
      setSharing(false);
    }
  }, [isSharing, baseId, table, recordId, section, title, textLines, slugId, fallbackSlugText, language, swrKey, currentShares, boundMutation.updateRecord]);

  return { handleShare, isSharing, showLoginDialog, setShowLoginDialog, pendingAction } as const;
}

export default useShareAction;
