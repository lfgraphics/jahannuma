/**
 * Centralized Airtable constants for base IDs, table names, and field mappings.
 * This file should be the single source of truth for all Airtable-related constants.
 */

// === Content Base IDs ===
export const BASE_IDS = {
  ASHAAR: "appeI2xzzyvUN5bR7",
  GHAZLEN: "appvzkf6nX376pZy6", 
  NAZMEN: "app5Y2OsuDgpXeQdz",
  RUBAI: "appIewyeCIcAD4Y11",
  EBOOKS: "appXcBoNMGdIaSUyA",
  SHAER: "appgWv81tu4RT3uRB",
  // Comment bases for each content type
  ASHAAR_COMMENTS: "appkb5lm483FiRD54",
  GHAZLEN_COMMENTS: "appzB656cMxO0QotZ", 
  NAZMEN_COMMENTS: "appjF9QvJeKAM9c9F",
  RUBAI_COMMENTS: "appseIUI98pdLBT1K",
} as const;

// === Fallback for legacy code ===
export const MAIN_BASE_ID = process.env.AIRTABLE_BASE_ID || BASE_IDS.ASHAAR;

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
  COMMENTS: "Comments",
} as const;

// === Table to Base ID Mapping ===
export const TABLE_BASE_MAPPING = {
  "Ashaar": BASE_IDS.ASHAAR,
  "Ghazlen": BASE_IDS.GHAZLEN,
  "Nazmen": BASE_IDS.NAZMEN,
  "Rubai": BASE_IDS.RUBAI,
  "E-Books": BASE_IDS.EBOOKS,
  "Shaer": BASE_IDS.SHAER,
  "Intro": BASE_IDS.SHAER, // Intro table is in the Shaer base
  // Comments are handled separately since they depend on content type
} as const;

// === Comment Base Mapping by Content Type ===
export const COMMENT_BASE_MAPPING = {
  "ashaar": BASE_IDS.ASHAAR_COMMENTS,
  "ghazlen": BASE_IDS.GHAZLEN_COMMENTS,
  "nazmen": BASE_IDS.NAZMEN_COMMENTS,
  "rubai": BASE_IDS.RUBAI_COMMENTS,
} as const;

// === Route to Table Mapping ===
export const ROUTE_TABLES = {
  ashaar: "Ashaar",
  ghazlen: "Ghazlen",
  nazmen: "Nazmen",
  rubai: "Rubai",
  ebooks: "E-Books",
  shaer: "Intro", // Shaer route maps to Intro table
  comments: "Comments",
} as const;

export type RouteSlug = keyof typeof ROUTE_TABLES;

export function ensureRouteSlug(input: string): RouteSlug {
  // Map tolerant - try to convert table names to route slugs
  const lowerInput = input.toLowerCase();

  if (lowerInput === "ashaar") return "ashaar";
  if (lowerInput === "ghazlen") return "ghazlen";
  if (lowerInput === "nazmen") return "nazmen";
  if (lowerInput === "rubai") return "rubai";
  if (lowerInput === "e-books" || lowerInput === "ebooks") return "ebooks";
  if (lowerInput === "comments") return "comments";

  // If it's already a valid route slug, return it
  if (input in ROUTE_TABLES) {
    return input as RouteSlug;
  }

  // Default fallback
  throw new Error(
    `Unknown table/route: ${input}. Valid routes: ${Object.keys(
      ROUTE_TABLES
    ).join(", ")}`
  );
}

/**
 * Helper to migrate callers that still pass Airtable table names
 * @deprecated Use RouteSlug directly instead
 */
export function migrateTableNameToSlug(tableName: string): RouteSlug {
  return ensureRouteSlug(tableName);
}

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
// Note: Only include sorts for fields that actually exist in Airtable
export const SORTS = {
  AUTHOR_ASC: `${FIELDS.AUTHOR}:asc`,
  AUTHOR_DESC: `${FIELDS.AUTHOR}:desc`,
  // Add other sorts only for fields that exist in your Airtable base
} as const;

// === Table Type Mapping ===
export type TableName = (typeof TABLES)[keyof typeof TABLES];
