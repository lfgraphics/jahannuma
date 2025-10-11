/**
 * Nazmen feature types.
 * Defines the structure for Nazmen (free verse) records and related data.
 */

import type { WithCounts } from "../airtable/base";

/**
 * Main Nazmen record type representing a nazm (free verse poem).
 * Contains the poem text, metadata, and social interaction counts.
 */
export interface NazmenRecord extends WithCounts {
  /** The nazm text, newline separated */
  nazm: string;
  /** Title of the nazm, newline separated if multiple titles */
  unwan: string;
  /** Name of the poet */
  shaer: string;
  /**
   * Whether this is a paband (structured) nazm or azad (free) nazm.
   * Paband nazms follow traditional meter and rhyme schemes.
   */
  paband: boolean;

  // Derived helpers (computed from string fields)
  /** Array version of nazm field for easier line-by-line rendering */
  ghazalLines?: string[];
  /** Array version of unwan field for multiple titles */
  anaween?: string[];
}
