/**
 * @deprecated Use src/lib/airtable/airtable-constants.ts instead
 * This file is kept for backward compatibility during migration
 */

// Re-export from the new centralized constants
export {
  BASE_IDS, COMMENT_BASE_MAPPING, TABLES,
  TABLE_BASE_MAPPING, getAllBaseIds, getBaseIdForContentType, getBaseIdForTable, getCommentBaseId,
  validateAllBaseIds
} from '../src/lib/airtable/airtable-constants';

// Legacy exports for backward compatibility
export const ASHAAR_COMMENTS_BASE = "appkb5lm483FiRD54";
export const GHAZLEN_COMMENTS_BASE = "appzB656cMxO0QotZ";
export const NAZMEN_COMMENTS_BASE = "appjF9QvJeKAM9c9F";
export const RUBAI_COMMENTS_BASE = "appseIUI98pdLBT1K";

export const COMMENTS_TABLE = "Comments";
export const ADS_TABLE = "Ads";
export const BLOGS_TABLE = "Blogs links and data";
