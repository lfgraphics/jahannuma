/**
 * UI state management types.
 * Defines interfaces for component state, user interactions, and UI controls.
 */

/**
 * Represents a selected card in the UI.
 * Used for highlighting, detailed views, and user interactions.
 */
export interface SelectedCard {
  /** The unique identifier of the selected record */
  id: string;
  /** Essential fields for displaying the selected card */
  fields: {
    /** Name of the poet */
    shaer: string;
    /** The ghazal text as an array of lines */
    ghazal: string[];
    /** The record's custom ID */
    id: string;
  };
}

/**
 * Map of record IDs to their liked status.
 * Used for tracking which records the current user has liked.
 * Stored in component state or context for optimistic UI updates.
 */
export type LikedMap = Record<string, boolean>;

/**
 * State for pagination controls.
 * Used by list components to manage page navigation and data fetching.
 */
export interface PaginationState {
  /**
   * Airtable offset token for pagination.
   * null indicates no more pages available.
   */
  offset: string | null;
  /** Number of records to fetch per page */
  pageSize: number;
}
