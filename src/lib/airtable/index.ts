/**
 * Airtable utilities barrel export.
 * Provides convenient access to all Airtable-related utilities.
 */

// Client functions (for server-side use in API routes)
export {
  createRecord,
  deleteRecord,
  fetchRecord,
  fetchRecords,
  getAirtableConfig,
  updateRecord,
} from "./airtable-client";

// Constants
export {
  COMMENTS_TABLE,
  COMMENT_BASES,
  DEFAULT_PAGE_SIZE,
  FIELDS,
  FILTERS,
  MAIN_BASE_ID,
  MAX_PAGE_SIZE,
  SORTS,
  TABLES,
} from "./airtable-constants";

export type { CommentBaseKey, TableName } from "./airtable-constants";

// Utility functions
export {
  buildDataIdFilter,
  buildIdFilter,
  buildShaerFilter,
  buildUnwanFilter,
  createSlug,
  extractIdFromSlug,
  extractTextFromSlug,
  formatAshaarRecord,
  formatBookRecord,
  formatGhazlenRecord,
  formatNazmenRecord,
  generateListCacheKey,
  generateRecordCacheKey,
  normalizeText,
  prepareCommentUpdate,
  prepareLikeUpdate,
  prepareShareUpdate,
  splitIntoLines,
  truncateText,
} from "./airtable-utils";
