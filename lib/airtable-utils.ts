import type {
  AirtableListParams,
  AirtableRecord,
  AshaarRecord,
  GhazlenRecord,
  NazmenRecord,
} from "@/app/types";
import { createSlug } from "@/utils/formatters";
import { toast } from "sonner";

// Data transformation utilities
// Re-export the centralized createSlug function
export { createSlug } from "@/utils/formatters";

// Helper function to extract ID from slug
export function extractIdFromSlug(slug: string): string {
  if (!slug || typeof slug !== "string") return "";

  // Split by hyphen and get the last part (which should be the ID)
  const parts = slug.split("-");
  return parts[parts.length - 1] || "";
}

// Helper function to extract the text part from slug (without ID)
export function extractTextFromSlug(slug: string): string {
  if (!slug || typeof slug !== "string") return "";

  // Split by hyphen, remove the last part (ID), and join back
  const parts = slug.split("-");
  if (parts.length <= 1) return "";

  parts.pop(); // Remove the ID part
  return parts.join("-");
}

export function formatAshaarRecord(
  rec: AirtableRecord<any>
): AirtableRecord<AshaarRecord> {
  const f = rec.fields as Record<string, any>;

  // Generate slug from shaer name and record ID
  const baseId = f.id || rec.id;
  const slug = createSlug(f.unwan || "");

  const formatted: AshaarRecord = {
    sher: f.sher,
    body: f.body,
    unwan: f.unwan,
    shaer: f.shaer,
    likes: f.likes ?? 0,
    shares: f.shares ?? 0,
    comments: f.comments ?? 0,
    id: baseId,
    slugId: slug,
    airtableId: rec.id,
    ghazalHead: Array.isArray(f.ghazalHead)
      ? f.ghazalHead
      : f.sher
      ? String(f.sher).split("\n")
      : [],
    ghazal: Array.isArray(f.ghazal)
      ? f.ghazal
      : f.body
      ? String(f.body).split("\n")
      : [],
    anaween: Array.isArray(f.anaween)
      ? f.anaween
      : f.unwan
      ? String(f.unwan).split("\n")
      : [],
  };
  return { ...rec, fields: formatted };
}

export function formatGhazlenRecord(
  rec: AirtableRecord<any>
): AirtableRecord<GhazlenRecord> {
  const f = rec.fields as Record<string, any>;

  // Generate slug from ghazal head and record ID
  const baseId = f.id || rec.id;
  const ghazalHeadText = Array.isArray(f.ghazalHead)
    ? f.ghazalHead[0]
    : f.ghazalHead
    ? String(f.ghazalHead).split("\n")[0]
    : "";
  const slug = createSlug(ghazalHeadText || f.shaer || "");

  const formatted: GhazlenRecord = {
    ghazal: Array.isArray(f.ghazal)
      ? f.ghazal
      : f.ghazal
      ? String(f.ghazal).split("\n")
      : [],
    ghazalHead: Array.isArray(f.ghazalHead)
      ? f.ghazalHead
      : f.ghazalHead
      ? String(f.ghazalHead).split("\n")
      : [],
    unwan: Array.isArray(f.unwan)
      ? f.unwan
      : f.unwan
      ? String(f.unwan).split("\n")
      : [],
    shaer: f.shaer,
    likes: f.likes ?? 0,
    shares: f.shares ?? 0,
    comments: f.comments ?? 0,
    id: baseId, // Keep original ID
    slugId: slug, // Use slug for navigation
    airtableId: rec.id,
  };
  return { ...rec, fields: formatted };
}

export function formatNazmenRecord(
  rec: AirtableRecord<any>
): AirtableRecord<NazmenRecord> {
  const f = rec.fields as Record<string, any>;

  // Generate slug from nazm title (first line) and record ID
  const baseId = f.id || rec.id;
  const nazmTitle = Array.isArray(f.ghazalLines)
    ? f.ghazalLines[0]
    : f.nazm
    ? String(f.nazm).split("\n")[0]
    : "";
  const unwanText = Array.isArray(f.anaween)
    ? f.anaween[0]
    : f.unwan
    ? String(f.unwan).split("\n")[0]
    : "";
  const slug = createSlug(nazmTitle || unwanText || f.shaer || "");

  const formatted: NazmenRecord = {
    nazm: f.nazm,
    unwan: f.unwan,
    shaer: f.shaer,
    paband: !!f.paband,
    likes: f.likes ?? 0,
    shares: f.shares ?? 0,
    comments: f.comments ?? 0,
    id: baseId, // Keep original ID
    slugId: slug, // Use slug for navigation
    airtableId: rec.id,
    ghazalLines: Array.isArray(f.ghazalLines)
      ? f.ghazalLines
      : f.nazm
      ? String(f.nazm).split("\n")
      : [],
    anaween: Array.isArray(f.anaween)
      ? f.anaween
      : f.unwan
      ? String(f.unwan).split("\n")
      : [],
  };
  return { ...rec, fields: formatted };
}

// Add book record formatter for E-Books
export function formatBookRecord(
  rec: AirtableRecord<any>
): AirtableRecord<any> {
  const f = rec.fields as Record<string, any>;

  // Generate slug from book name and record ID
  const baseId = f.id || rec.id;
  const slug = createSlug(f.bookName || f.writer || "");

  const formatted = {
    ...f,
    id: baseId, // Keep original ID
    slugId: slug, // Use slug for navigation
    airtableId: rec.id,
  };

  return { ...rec, fields: formatted };
}

// Filter formula builders
const esc = (s: string) => String(s).replace(/'/g, "''");
export const buildShaerFilter = (shaerName: string) =>
  `({shaer}='${esc(shaerName)}')`;
// Handle both single text {unwan} and array/multi-select {unwan}
// We coerce text to string with {unwan}&'' and also check ARRAYJOIN for array schemas
export const buildUnwanFilter = (unwan: string) =>
  `OR(FIND('${esc(unwan)}', {unwan}&''), FIND('${esc(
    unwan
  )}', ARRAYJOIN({unwan}, ' ')))`;
export const buildIdFilter = (id: string) => `(RECORD_ID() = '${esc(id)}')`;
export const buildDataIdFilter = (dataId: string) =>
  `({dataId}='${esc(dataId)}')`;

// Mutation helpers
export const prepareLikeUpdate = (
  current: number | undefined,
  increment: number
) => ({ likes: (current ?? 0) + increment });
export const prepareShareUpdate = (current: number | undefined) => ({
  shares: (current ?? 0) + 1,
});
export const prepareCommentUpdate = (current: number | undefined) => ({
  comments: (current ?? 0) + 1,
});

// Error + toast helpers
export function handleAirtableError(error: any) {
  console.error(error);
  toast.error("سرور کی خرابی، براہ کرم دوبارہ کوشش کریں۔");
}
export function showMutationToast(
  type: "success" | "error" | "warning",
  msg: string
) {
  const map: Record<string, (m: string) => void> = {
    success: toast.success,
    error: toast.error,
    warning: toast.info,
  };
  (map[type] || toast.info)(msg);
}

// Cache key helpers (align with airtable-fetcher)
export function generateListCacheKey(
  baseId: string,
  table: string,
  params: AirtableListParams
) {
  const qs: Record<string, any> = { ...params };
  return `${baseId}:${table}:${JSON.stringify(qs)}`;
}
export function generateRecordCacheKey(
  baseId: string,
  table: string,
  id: string
) {
  return `${baseId}:${table}:id=${id}`;
}
