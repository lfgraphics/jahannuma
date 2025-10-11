/**
 * Ashaar (Poetry) feature types.
 * Defines the structure for Ashaar records and related data.
 */

import type { WithCounts } from "../airtable/base";

/**
 * Main Ashaar record type representing a complete ghazal/poem.
 * Contains the full text, metadata, and social interaction counts.
 */
export interface AshaarRecord extends WithCounts {
  /** Heading lines of the ghazal, newline separated */
  sher: string;
  /** Full body of the ghazal, newline separated */
  body: string;
  /** Title(s) of the ghazal, newline separated */
  unwan: string;
  /** Name of the poet */
  shaer: string;

  // Derived helpers (computed from string fields)
  /** Array version of sher field for easier rendering */
  ghazalHead?: string[];
  /** Array version of body field for easier rendering */
  ghazal?: string[];
  /** Array version of unwan field for easier rendering */
  anaween?: string[];
}

/**
 * Simplified Ashaar record for Shaer (poet) listings.
 * Contains minimal data needed for poet-specific views.
 */
export interface AshaarShaerRecord extends WithCounts {
  /** Heading lines of the ghazal */
  sher: string;
  /** Name of the poet */
  shaer: string;
  /** Array version of sher field, derived from sher */
  ghazalHead: string[];
}

/**
 * Extended Ashaar record for Mozu (theme) listings.
 * Contains all fields with pre-computed array versions for performance.
 */
export interface AshaarMozuRecord extends WithCounts {
  /** Heading lines of the ghazal */
  sher: string;
  /** Full body of the ghazal */
  body: string;
  /** Title(s) of the ghazal */
  unwan: string;
  /** Name of the poet */
  shaer: string;

  // Pre-computed arrays for performance
  /** Array version of body field */
  ghazal: string[];
  /** Array version of sher field */
  ghazalHead: string[];
  /** Array version of unwan field */
  anaween: string[];
}

/**
 * Route parameters for Ashaar pages.
 * Re-exported from routes for convenience.
 */
export type { AshaarPageParams } from "../routes";
