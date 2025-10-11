/**
 * Standard API response types for consistent API responses.
 * All API routes should use these types for type-safe responses.
 */

/**
 * Generic success response wrapper.
 * Used for all successful API responses.
 *
 * @template T - The type of data being returned
 */
export interface ApiResponse<T> {
  /** Indicates the request was successful */
  success: true;
  /** The actual response data */
  data: T;
  /** Optional message for additional context */
  message?: string;
}

/**
 * Error response wrapper.
 * Used for all error responses from API routes.
 */
export interface ApiError {
  /** Indicates the request failed */
  success: false;
  /** Error details */
  error: {
    /** Human-readable error message */
    message: string;
    /** Machine-readable error code for client handling */
    code: string;
    /** Optional additional error details */
    details?: any;
  };
}

/**
 * Paginated response wrapper for list endpoints.
 * Includes pagination metadata along with the data.
 *
 * @template T - The type of items in the list
 */
export interface PaginatedResponse<T> {
  /** Indicates the request was successful */
  success: true;
  /** Array of items for this page */
  data: T[];
  /** Pagination metadata */
  pagination: {
    /** Total number of items available */
    total?: number;
    /** Current page number (1-based) */
    page: number;
    /** Number of items per page */
    pageSize: number;
    /** Whether there are more pages available */
    hasMore: boolean;
    /** Token for fetching the next page */
    nextOffset?: string;
  };
}

/**
 * Airtable-specific list response.
 * Matches Airtable's API response format for list operations.
 *
 * @template T - The type of Airtable records being returned
 */
export interface AirtableListResponse<T> {
  /** Indicates the request was successful */
  success: true;
  /** Array of Airtable records */
  records: T[];
  /**
   * Airtable offset token for pagination.
   * Present if there are more records to fetch.
   */
  offset?: string;
}

/**
 * Airtable-specific single record response.
 * Used for endpoints that return a single record.
 *
 * @template T - The type of Airtable record being returned
 */
export interface AirtableSingleResponse<T> {
  /** Indicates the request was successful */
  success: true;
  /** The Airtable record */
  record: T;
}

/**
 * Response for mutation operations (create, update, delete).
 * Provides feedback on the operation performed.
 */
export interface MutationResponse {
  /** Indicates the request was successful */
  success: true;
  /** Type of operation performed */
  operation: "create" | "update" | "delete";
  /** ID of the affected record */
  recordId: string;
  /** Optional message describing the operation */
  message?: string;
  /** The updated record data (for create/update operations) */
  record?: any;
}
