/**
 * Rubai feature types.
 * Defines the structure for Rubai (quatrain) records and related data.
 *
 * Note: This uses a different structure from other poetry types.
 * Consider aligning with WithCounts pattern in future updates.
 */

/**
 * Rubai record type representing a four-line poem (quatrain).
 * Uses a nested fields structure different from other poetry types.
 */
export interface Rubai {
  /** Airtable record metadata */
  id: string;
  createdTime: string;

  /** The actual rubai data */
  fields: {
    /** Name of the poet */
    shaer: string;
    /** Title of the rubai */
    unwan: string;
    /** The four-line poem text */
    body: string;
    /** Number of likes this rubai has received */
    likes: number;
    /** Number of comments this rubai has received */
    comments: number;
    /** Number of times this rubai has been shared */
    shares: number;
    /** Custom ID for the rubai */
    id: string;
  };
}
