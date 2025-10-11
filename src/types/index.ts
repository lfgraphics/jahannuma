/**
 * Main types barrel export file.
 * Provides convenient single-import access to commonly used types.
 *
 * Import patterns:
 * - `import { AshaarRecord } from '@/types'` - Common types
 * - `import type { AshaarRecord } from '@/types/features/ashaar'` - Specific type
 * - `import type { ApiResponse } from '@/types/api/responses'` - API types
 */

// === Airtable Base Types ===
export type {
  AirtableListParams,
  AirtableRecord,
  AirtableRecordParams,
  MutationParams,
  WithCounts,
} from "./airtable/base";

// === Feature Types ===
// Ashaar types
export type {
  AshaarMozuRecord,
  AshaarPageParams,
  AshaarRecord,
  AshaarShaerRecord,
} from "./features/ashaar";

// Ghazlen types
export type { GhazlenMozuRecord, GhazlenRecord } from "./features/ghazlen";

// Nazmen types
export type { NazmenRecord } from "./features/nazmen";

// Rubai types
export type { Rubai } from "./features/rubai";

// Shaer types (legacy - prefer domain-specific types for new code)
export type { Shaer, ShaerFields, ShaerPageParams } from "./features/shaer";

// Comments types
export type { CommentFormData, CommentRecord } from "./features/comments";

// === UI State Types ===
export type { LikedMap, PaginationState, SelectedCard } from "./ui/state";

// === Route Types ===
export type { MozuPageParams } from "./routes";

// === API Types ===
// Response types
export type {
  AirtableListResponse,
  AirtableSingleResponse,
  ApiError,
  ApiResponse,
  AshaarDetailResponse,
  AshaarListResponse,
  GhazalDetailResponse,
  GhazalListResponse,
  LikeToggleResponse,
  MutationResponse,
  PaginatedResponse,
} from "./api/responses";

// Request types
export type {
  CreateRecordBody,
  DeleteRecordParams,
  LikeToggleRequest,
  ListQueryParams,
  RecordQueryParams,
  UpdateRecordBody,
} from "./api/requests";

