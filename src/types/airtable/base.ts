/**
 * Base Airtable types and interfaces used across all Airtable operations.
 * These types provide the foundation for all domain-specific types.
 */

/**
 * Generic Airtable record wrapper that all Airtable records extend.
 * Contains the standard fields that Airtable provides for every record.
 *
 * @template TFields - The shape of the fields object for the specific table
 */
export interface AirtableRecord<TFields = any> {
  /** The actual data fields from the Airtable record */
  fields: TFields;
  /** Unique identifier for the record in Airtable */
  id: string;
  /** ISO timestamp when the record was created */
  createdTime: string;
}

/**
 * Common field mixin for records that support social interactions.
 * Used by poetry records (Ashaar, Ghazlen, Nazmen, Rubai) to track engagement.
 */
export interface WithCounts {
  /** Number of likes this record has received */
  likes?: number;
  /** Number of comments this record has received */
  comments?: number;
  /** Number of times this record has been shared */
  shares?: number;
  /** Custom ID field for the record (may differ from Airtable ID) */
  id?: string;
  /** URL-friendly slug for routing */
  slugId?: string;
  /** Reference to the original Airtable record ID */
  airtableId?: string;
}

/**
 * Query parameters for listing Airtable records.
 * Used by useAirtableList hook and list API endpoints.
 */
export interface AirtableListParams {
  /** Number of records to return per page (default: 50) */
  pageSize?: number;
  /** Airtable filter formula to apply */
  filterByFormula?: string;
  /** Specific fields to retrieve (returns all if not specified) */
  fields?: string[];
  /** Sort configuration */
  sort?: { field: string; direction?: "asc" | "desc" }[];
  /** Search query to filter records */
  search?: string;
  /** Additional parameters for specific use cases */
  extra?: Record<string, any>;
}

/**
 * Parameters for fetching a single Airtable record.
 * Used by useAirtableRecord hook and single record API endpoints.
 */
export interface AirtableRecordParams {
  /** The record ID to fetch */
  id: string;
}

/**
 * Parameters for mutating (creating, updating, deleting) Airtable records.
 * Used by useAirtableMutation hook and mutation API endpoints.
 */
export interface MutationParams {
  /** The record ID to mutate */
  id: string;
  /** The fields to update/create */
  fields: Record<string, any>;
}
