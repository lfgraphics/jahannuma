/**
 * Standard API request types for type-safe API requests.
 * These types ensure consistent request structure across all API routes.
 */

/**
 * Query parameters for list endpoints.
 * Used by GET requests to filter, sort, and paginate data.
 */
export interface ListQueryParams {
  /** Number of records to return per page (default: 50, max: 100) */
  pageSize?: number;
  /**
   * Airtable offset token for pagination.
   * Pass the offset from the previous response to get the next page.
   */
  offset?: string;
  /**
   * Airtable filter formula to apply.
   * Uses Airtable's formula syntax to filter records.
   */
  filterByFormula?: string;
  /**
   * Sort configuration as a string.
   * Format: "field:direction" or "field1:asc,field2:desc"
   */
  sort?: string;
  /**
   * Search query to filter records.
   * Server will apply appropriate search logic for the table.
   */
  search?: string;
  /**
   * Specific fields to retrieve.
   * If not specified, all fields are returned.
   */
  fields?: string;
}

/**
 * Query parameters for single record endpoints.
 * Used by GET requests to fetch a specific record.
 */
export interface RecordQueryParams {
  /** The record ID to fetch */
  id: string;
  /**
   * Specific fields to retrieve.
   * If not specified, all fields are returned.
   */
  fields?: string;
}

/**
 * Request body for creating new records.
 * Used by POST requests to create records.
 *
 * @template T - The type of fields being created
 */
export interface CreateRecordBody<T = Record<string, any>> {
  /** The fields to set on the new record */
  fields: T;
}

/**
 * Request body for updating existing records.
 * Used by PATCH requests to update records.
 *
 * @template T - The type of fields being updated
 */
export interface UpdateRecordBody<T = Record<string, any>> {
  /** The fields to update on the record */
  fields: Partial<T>;
}

/**
 * Parameters for deleting records.
 * Used by DELETE requests to remove records.
 */
export interface DeleteRecordParams {
  /** The record ID to delete */
  id: string;
  /** Optional confirmation flag for destructive operations */
  confirm?: boolean;
}

// ============================================================================
// Feature-specific request types
// ============================================================================

/**
 * Request body for toggling likes.
 */
export interface LikeToggleRequest {
  /** Type of content being liked */
  contentType: 'ashaar' | 'ghazlen' | 'nazmen' | 'rubai';
  /** ID of the content being liked */
  contentId: string;
}
