/**
 * Client-side utilities for accessing centralized Airtable configuration.
 * This module provides safe access to base IDs for client-side components.
 */

import { BASE_IDS, getBaseIdForTable, getCommentBaseId } from "@/src/lib/airtable/airtable-constants";

/**
 * Get base ID for content type (client-side safe)
 */
export function getClientBaseId(contentType: keyof typeof BASE_IDS): string {
  return BASE_IDS[contentType];
}

/**
 * Get base ID for table name (client-side safe)
 */
export function getClientBaseIdForTable(tableName: string): string {
  try {
    return getBaseIdForTable(tableName);
  } catch (error) {
    console.error(`Failed to get base ID for table ${tableName}:`, error);
    // Fallback to ASHAAR base for unknown tables
    return BASE_IDS.ASHAAR;
  }
}

/**
 * Get comment base ID for content type (client-side safe)
 */
export function getClientCommentBaseId(contentType: string): string {
  try {
    return getCommentBaseId(contentType);
  } catch (error) {
    console.error(`Failed to get comment base ID for content type ${contentType}:`, error);
    // Fallback to ASHAAR comments base
    return BASE_IDS.ASHAAR_COMMENTS;
  }
}

/**
 * Content type to base ID mapping for easy access
 */
export const CONTENT_BASE_IDS = {
  ashaar: BASE_IDS.ASHAAR,
  ghazlen: BASE_IDS.GHAZLEN,
  nazmen: BASE_IDS.NAZMEN,
  rubai: BASE_IDS.RUBAI,
  ebooks: BASE_IDS.EBOOKS,
  shaer: BASE_IDS.SHAER,
  alerts: BASE_IDS.ALERTS,
  didYouKnow: BASE_IDS.DID_YOU_KNOW,
  ads: BASE_IDS.ADS,
  carousel: BASE_IDS.CAROUSEL,
} as const;

/**
 * Comment base IDs for easy access
 */
export const COMMENT_BASE_IDS = {
  ashaar: BASE_IDS.ASHAAR_COMMENTS,
  ghazlen: BASE_IDS.GHAZLEN_COMMENTS,
  nazmen: BASE_IDS.NAZMEN_COMMENTS,
  rubai: BASE_IDS.RUBAI_COMMENTS,
} as const;

export type ContentType = keyof typeof CONTENT_BASE_IDS;
export type CommentContentType = keyof typeof COMMENT_BASE_IDS;