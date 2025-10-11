/**
 * Ghazlen feature types.
 * Defines the structure for Ghazlen records and related data.
 */

import type { WithCounts } from "../airtable/base";

/**
 * Main Ghazlen record type representing a ghazal.
 * Note: Some fields can be either string or string[] depending on the data source.
 * Formatters are responsible for normalizing these to arrays when needed.
 */
export interface GhazlenRecord extends WithCounts {
  /**
   * The ghazal text - can be string (with newlines) or string array.
   * Formatters should convert strings to arrays by splitting on newlines.
   */
  ghazal: string[] | string;
  /**
   * The ghazal heading - can be string (with newlines) or string array.
   * Formatters should convert strings to arrays by splitting on newlines.
   */
  ghazalHead: string[] | string;
  /**
   * The title(s) - can be string (with newlines) or string array.
   * Formatters should convert strings to arrays by splitting on newlines.
   */
  unwan: string[] | string;
  /** Name of the poet */
  shaer: string;
}

/**
 * Extended Ghazlen record for Mozu (theme) listings.
 * Contains all fields normalized to arrays for consistent processing.
 */
export interface GhazlenMozuRecord extends WithCounts {
  /** The ghazal text as an array of lines */
  ghazal: string[];
  /** The ghazal heading as an array of lines */
  ghazalHead: string[];
  /** The title(s) as an array */
  unwan: string[];
  /** Name of the poet */
  shaer: string;
}
