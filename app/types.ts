// Shared domain types used across the app

// Generic Airtable record wrapper
export interface AirtableRecord<TFields = any> {
  fields: TFields;
  id: string;
  createdTime: string;
}

// Common field mixins
export interface WithCounts {
  likes?: number;
  comments?: number;
  shares?: number;
  id?: string;
  // For routes that use custom {id} vs Airtable recordId
  slugId?: string;
  airtableId?: string;
}

// Legacy Shaer types (kept for backward compatibility in some components)
export interface ShaerFields {
  sher?: string[];
  shaer: string;
  // Some data sources provide a single string with line breaks, others provide an array
  ghazalHead: string | string[];
  ghazal?: string[];
  // Some data sources provide a single string with line breaks, others provide an array
  unwan?: string | string[];
  likes?: number;
  comments?: number;
  shares?: number;
  id?: string;
}

export interface Shaer {
  fields: ShaerFields;
  id: string;
  createdTime: string;
}

export interface Rubai {
  fields: {
    shaer: string;
    unwan: string;
    body: string;
    likes: number;
    comments: number;
    shares: number;
    id: string;
  };
  id: string;
  createdTime: string;
}

// Ashaar domain types
export interface AshaarRecord extends WithCounts {
  sher: string; // heading, newline separated
  body: string; // ghazal body, newline separated
  unwan: string; // newline separated titles
  shaer: string;
  // Derived helpers
  ghazalHead?: string[];
  ghazal?: string[];
  anaween?: string[];
}

export interface AshaarShaerRecord extends WithCounts {
  sher: string;
  shaer: string;
  ghazalHead: string[]; // derived from sher
}

export interface AshaarMozuRecord extends WithCounts {
  sher: string;
  body: string;
  unwan: string;
  shaer: string;
  ghazal: string[];
  ghazalHead: string[];
  anaween: string[];
}

// Nazmen domain types
export interface NazmenRecord extends WithCounts {
  nazm: string;
  unwan: string;
  shaer: string;
  paband: boolean;
  // Derived
  ghazalLines?: string[];
  anaween?: string[];
}

// Ghazlen domain types
export interface GhazlenRecord extends WithCounts {
  ghazal: string[] | string; // source can be string; formatters derive arrays
  ghazalHead: string[] | string;
  unwan: string[] | string;
  shaer: string;
}

export interface GhazlenMozuRecord extends WithCounts {
  ghazal: string[];
  ghazalHead: string[];
  unwan: string[];
  shaer: string;
}

// Comments
export interface CommentRecord {
  dataId: string;
  commentorName: string;
  timestamp: string;
  comment: string;
}

export interface CommentFormData {
  dataId: string;
  commentorName: string;
  comment: string;
}

// UI State helpers
export interface SelectedCard {
  id: string;
  fields: { shaer: string; ghazal: string[]; id: string };
}
export type LikedMap = Record<string, boolean>;

export interface PaginationState {
  offset: string | null;
  pageSize: number;
}

// Hook parameter types
export interface AirtableListParams {
  pageSize?: number;
  filterByFormula?: string;
  fields?: string[];
  sort?: { field: string; direction?: "asc" | "desc" }[];
  search?: string;
  extra?: Record<string, any>;
}

export interface AirtableRecordParams {
  id: string;
}

export interface MutationParams {
  id: string;
  fields: Record<string, any>;
}

// Route parameter types
export interface AshaarPageParams { id: string; slug?: string }
export interface MozuPageParams { unwan: string }
export interface ShaerPageParams { name: string }