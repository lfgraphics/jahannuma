/**
 * Airtable utility functions for data formatting, filtering, and manipulation.
 * Updated to work with the new type system and API routes.
 */

import type {
  AirtableListParams,
  AirtableRecord,
  AshaarRecord,
  GhazlenRecord,
  NazmenRecord,
} from "@/types";

import {
  normalizeText as baseNormalizeText,
  truncateText as baseTruncateText,
  createSlug,
} from "@/utils/formatters";

// === Data Transformation Utilities ===

// Re-export the centralized createSlug function
export { createSlug } from "@/utils/formatters";

/**
 * Extract ID from the end of a slug.
 */
export function extractIdFromSlug(slug: string): string {
  if (!slug || typeof slug !== "string") return "";

  // Split by hyphen and get the last part (which should be the ID)
  const parts = slug.split("-");
  return parts[parts.length - 1] || "";
}

/**
 * Extract the text part from slug (without ID).
 */
export function extractTextFromSlug(slug: string): string {
  if (!slug || typeof slug !== "string") return "";

  // Split by hyphen, remove the last part (ID), and join back
  const parts = slug.split("-");
  if (parts.length <= 1) return "";

  parts.pop(); // Remove the ID part
  return parts.join("-");
}

// === Record Formatters ===

/**
 * Format raw Airtable record into AshaarRecord with derived fields.
 */
export function formatAshaarRecord(
  rec: AirtableRecord<any>
): AirtableRecord<AshaarRecord> {
  const f = rec.fields as Record<string, any>;

  // Generate slug from title and record ID
  const baseId = f.id || rec.id;
  const slug = createSlug(f.unwan || "");

  const formatted: AshaarRecord = {
    sher: f.sher || "",
    body: f.body || "",
    unwan: f.unwan || "",
    shaer: f.shaer || "",
    likes: f.likes ?? 0,
    shares: f.shares ?? 0,
    comments: f.comments ?? 0,
    id: baseId,
    slugId: slug,
    airtableId: rec.id,
    ghazalHead: (f.sher ? String(f.sher).split("\n") : []) as string[],
    ghazal: (f.body ? String(f.body).split("\n") : []) as string[],
    anaween: (f.unwan ? String(f.unwan).split("\n") : []) as string[],
  };

  return { ...rec, fields: formatted };
}

/**
 * Format raw Airtable record into GhazlenRecord with derived fields.
 */
export function formatGhazlenRecord(
  rec: AirtableRecord<any>
): AirtableRecord<GhazlenRecord> {
  const f = rec.fields as Record<string, any>;

  // Generate slug from ghazal head and record ID
  const baseId = f.id || rec.id;
  const ghazalHeadText = f.ghazalHead
    ? String(f.ghazalHead).split("\n")[0]
    : "";
  const slug = createSlug(ghazalHeadText || f.shaer || "");

  const formatted: GhazlenRecord = {
    ghazal: (f.ghazal ? String(f.ghazal).split("\n") : []) as string[],
    ghazalHead: (f.ghazalHead
      ? String(f.ghazalHead).split("\n")
      : []) as string[],
    unwan: (f.unwan ? String(f.unwan).split("\n") : []) as string[],
    shaer: f.shaer || "",
    likes: f.likes ?? 0,
    shares: f.shares ?? 0,
    comments: f.comments ?? 0,
    id: baseId,
    slugId: slug,
    airtableId: rec.id,
  };

  return { ...rec, fields: formatted };
}

/**
 * Format raw Airtable record into NazmenRecord with derived fields.
 */
export function formatNazmenRecord(
  rec: AirtableRecord<any>
): AirtableRecord<NazmenRecord> {
  const f = rec.fields as Record<string, any>;

  // Generate slug from nazm title (first line) and record ID
  const baseId = f.id || rec.id;
  const nazmTitle = f.nazm ? String(f.nazm).split("\n")[0] : "";
  const unwanText = f.unwan ? String(f.unwan).split("\n")[0] : "";
  const slug = createSlug(nazmTitle || unwanText || f.shaer || "");

  const formatted: NazmenRecord = {
    nazm: f.nazm || "",
    unwan: f.unwan || "",
    shaer: f.shaer || "",
    paband: !!f.paband,
    likes: f.likes ?? 0,
    shares: f.shares ?? 0,
    comments: f.comments ?? 0,
    id: baseId,
    slugId: slug,
    airtableId: rec.id,
    ghazalLines: (f.nazm ? String(f.nazm).split("\n") : []) as string[],
    anaween: (f.unwan ? String(f.unwan).split("\n") : []) as string[],
  };

  return { ...rec, fields: formatted };
}

/**
 * Format E-Books record with derived fields.
 */
export function formatBookRecord(
  rec: AirtableRecord<any>
): AirtableRecord<any> {
  const f = rec.fields as Record<string, any>;

  // Generate slug from book name and record ID
  const baseId = f.id || rec.id;
  const slug = createSlug(f.bookName || f.writer || "");

  const formatted = {
    ...f,
    id: baseId,
    slugId: slug,
    airtableId: rec.id,
  };

  return { ...rec, fields: formatted };
}

/**
 * Format Rubai record with derived fields.
 */
export function formatRubaiRecord(
  rec: AirtableRecord<any>
): AirtableRecord<any> {
  const f = rec.fields as Record<string, any>;

  // Generate slug from title and poet name
  const baseId = f.id || rec.id;
  const slug = createSlug(f.unwan || f.shaer || "");

  const formatted = {
    ...f,
    id: baseId,
    slugId: slug,
    airtableId: rec.id,
    // Ensure numeric fields are properly typed
    likes: Number(f.likes || 0),
    comments: Number(f.comments || 0),
    shares: Number(f.shares || 0),
  };

  return { ...rec, fields: formatted };
}

// === Filter Formula Builders ===

/**
 * Escape single quotes in Airtable filter formulas.
 */
const escapeForFilter = (s: string) => String(s).replace(/'/g, "''");

/**
 * Build filter for records by poet/author name.
 */
export const buildShaerFilter = (shaerName: string) =>
  `({shaer}='${escapeForFilter(shaerName)}')`;

/**
 * Build filter for records by title (unwan).
 * Handles both single text and array fields.
 */
export const buildUnwanFilter = (unwan: string) =>
  `OR(FIND('${escapeForFilter(unwan)}', {unwan}&''), FIND('${escapeForFilter(
    unwan
  )}', ARRAYJOIN({unwan}, ' ')))`;

/**
 * Build filter for specific record ID.
 */
export const buildIdFilter = (id: string) =>
  `(RECORD_ID() = '${escapeForFilter(id)}')`;

/**
 * Build filter for comments by data ID.
 */
export const buildDataIdFilter = (dataId: string) =>
  `({dataId}='${escapeForFilter(dataId)}')`;

// === Mutation Helpers ===

/**
 * Prepare update object for like count increment/decrement.
 */
export const prepareLikeUpdate = (
  current: number | undefined,
  increment: number
) => ({ likes: (current ?? 0) + increment });

/**
 * Prepare update object for share count increment.
 */
export const prepareShareUpdate = (current: number | undefined) => ({
  shares: (current ?? 0) + 1,
});

/**
 * Prepare update object for comment count increment.
 */
export const prepareCommentUpdate = (current: number | undefined) => ({
  comments: (current ?? 0) + 1,
});

// === Cache Key Helpers ===

/**
 * Generate cache key for list queries.
 */
export function generateListCacheKey(
  table: string,
  params: AirtableListParams
) {
  const qs: Record<string, any> = { ...params };
  return `list:${table}:${JSON.stringify(qs)}`;
}

/**
 * Generate cache key for single record queries.
 */
export function generateRecordCacheKey(table: string, id: string) {
  return `record:${table}:${id}`;
}

// === Text Processing Utilities ===

/**
 * Normalize line breaks and trim whitespace from text.
 * Enhanced version that handles line breaks before applying base normalization.
 */
export function normalizeText(text: string): string {
  if (!text || typeof text !== "string") return "";

  // First handle line breaks specific to Airtable content
  const lineBreakNormalized = text
    .replace(/\r\n/g, "\n") // Normalize line breaks
    .replace(/\r/g, "\n"); // Handle old Mac line breaks

  // Then apply base normalization from formatters
  return baseNormalizeText(lineBreakNormalized);
}

/**
 * Split text into lines and filter out empty lines.
 */
export function splitIntoLines(text: string): string[] {
  if (!text || typeof text !== "string") return [];

  return normalizeText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Truncate text to a specific length with ellipsis.
 * Uses the base implementation from formatters.
 */
export function truncateText(text: string, maxLength: number): string {
  return baseTruncateText(text, maxLength);
}
