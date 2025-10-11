/**
 * Centralized Airtable constants for base IDs, table names, and field mappings.
 * This file should be the single source of truth for all Airtable-related constants.
 */

// === Main Content Bases ===
export const MAIN_BASE_ID = process.env.AIRTABLE_BASE_ID || "app1eVOGD6PdjD3vS";

// === Content Tables ===
export const TABLES = {
  ASHAAR: "Ashaar",
  GHAZLEN: "Ghazlen",
  NAZMEN: "Nazmen",
  RUBAI: "Rubai",
  SHAER: "Shaer",
  EBOOKS: "E-Books",
  BLOGS: "Blogs links and data",
  ADS: "Ads",
} as const;

// === Comment Bases (separate bases for each content type) ===
export const COMMENT_BASES = {
  ASHAAR: "appkb5lm483FiRD54",
  GHAZLEN: "appzB656cMxO0QotZ",
  NAZMEN: "appjF9QvJeKAM9c9F",
  RUBAI: "appseIUI98pdLBT1K",
} as const;

// === Comment Tables ===
export const COMMENTS_TABLE = "Comments";

// === Default Pagination ===
export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

// === Common Field Names ===
export const FIELDS = {
  // Social interaction fields
  LIKES: "likes",
  COMMENTS: "comments",
  SHARES: "shares",

  // Content fields
  TITLE: "unwan",
  AUTHOR: "shaer",
  BODY: "body",
  TEXT: "sher",

  // Metadata fields
  ID: "id",
  CREATED_TIME: "createdTime",

  // Comment fields
  DATA_ID: "dataId",
  COMMENTOR_NAME: "commentorName",
  COMMENT: "comment",
  TIMESTAMP: "timestamp",
} as const;

// === Filter Formulas ===
export const FILTERS = {
  /**
   * Create a filter to find comments for a specific record
   */
  COMMENTS_FOR_RECORD: (dataId: string) => `{${FIELDS.DATA_ID}} = "${dataId}"`,

  /**
   * Create a search filter across multiple text fields
   */
  SEARCH: (query: string) => {
    const escapedQuery = query.replace(/"/g, '""');
    return `SEARCH("${escapedQuery}", CONCATENATE({${FIELDS.AUTHOR}}, " ", {${FIELDS.TITLE}}, " ", {${FIELDS.TEXT}}, " ", {${FIELDS.BODY}}))`;
  },

  /**
   * Filter by author/poet
   */
  BY_AUTHOR: (authorName: string) => `{${FIELDS.AUTHOR}} = "${authorName}"`,
} as const;

// === Sort Options ===
export const SORTS = {
  CREATED_DESC: `${FIELDS.CREATED_TIME}:desc`,
  CREATED_ASC: `${FIELDS.CREATED_TIME}:asc`,
  LIKES_DESC: `${FIELDS.LIKES}:desc`,
  AUTHOR_ASC: `${FIELDS.AUTHOR}:asc`,
} as const;

// === Table Type Mapping ===
export type TableName = (typeof TABLES)[keyof typeof TABLES];
export type CommentBaseKey = keyof typeof COMMENT_BASES;
