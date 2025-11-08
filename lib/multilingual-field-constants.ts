/**
 * Multilingual field constants for Airtable API endpoints
 * Defines field selection patterns for English and Hindi content
 * 
 * FIELD MAPPING FIXES:
 * - Removed 'ghazalHead' from base fields (not present in Airtable schema)
 * - Removed 'enDescription' and 'hiDescription' from all content types (not present in Airtable schema)
 * - Removed 'description' from shaer and ebooks base fields (not present in Airtable schema)
 * - Updated formatters to derive ghazalHead from existing ghazal field
 */

// Base field sets for each content type (based on actual Airtable schema)
export const BASE_FIELDS = {
  ashaar: [
    'shaer', 'sher', 'body', 'unwan', 'ref', 'likes', 'comments', 'shares', 'id'
  ],
  ghazlen: [
    'shaer', 'ghazalHead', 'ghazal', 'unwan', 'ref', 'likes', 'comments', 'shares', 'id'
  ],
  nazmen: [
    'shaer', 'nazm', 'unwan', 'paband', 'displayLine', 'ref', 'likes', 'comments', 'shares', 'id'
  ],
  rubai: [
    'shaer', 'body', 'unwan', 'ref', 'likes', 'comments', 'shares', 'id'
  ],
  shaer: [
    'takhallus', 'name', 'location', 'tafseel', 'photo', 'likes', 'id'
  ],
  ebooks: [
    'bookName', 'writer', 'publishingDate', 'maloomat', 'book', 'download', 'url', 'likes', 'id'
  ]
} as const;

// English field mappings (based on actual Airtable schema)
export const ENGLISH_FIELDS = {
  ashaar: [
    'enShaer', 'enSher', 'enBody', 'enUnwan', 'enRef'
  ],
  ghazlen: [
    'enShaer', 'enGhazalHead', 'enGhazal', 'enUnwan', 'enRef'
  ],
  nazmen: [
    'enShaer', 'enNazm', 'enUnwan', 'enDisplayLine', 'enRef'
  ],
  rubai: [
    'enShaer', 'enBody', 'enRef'
  ],
  shaer: [
    'enTakhallus', 'enName', 'enLocation', 'enTafseel'
  ],
  ebooks: [
    'enBookName', 'enWriter', 'enMaloomat'
  ]
} as const;

// Hindi field mappings (based on actual Airtable schema)
export const HINDI_FIELDS = {
  ashaar: [
    'hiShaer', 'hiSher', 'hiBody', 'hiUnwan', 'hiRef'
  ],
  ghazlen: [
    'hiShaer', 'hiGhazalHead', 'hiGhazal', 'hiUnwan', 'hiRef'
  ],
  nazmen: [
    'hiShaer', 'hiNazm', 'hiUnwan', 'hiDisplayLine', 'hiRef'
  ],
  rubai: [
    'hiShaer', 'hiBody', 'hiRef'
  ],
  shaer: [
    'hiTakhallus', 'hiName', 'hiLocation', 'hiTafseel'
  ],
  ebooks: [
    'hiBookName', 'hiWriter', 'hiMaloomat'
  ]
} as const;

// Combined multilingual field sets
export const MULTILINGUAL_FIELDS = {
  ashaar: [
    ...BASE_FIELDS.ashaar,
    ...ENGLISH_FIELDS.ashaar,
    ...HINDI_FIELDS.ashaar
  ],
  ghazlen: [
    ...BASE_FIELDS.ghazlen,
    ...ENGLISH_FIELDS.ghazlen,
    ...HINDI_FIELDS.ghazlen
  ],
  nazmen: [
    ...BASE_FIELDS.nazmen,
    ...ENGLISH_FIELDS.nazmen,
    ...HINDI_FIELDS.nazmen
  ],
  rubai: [
    ...BASE_FIELDS.rubai,
    ...ENGLISH_FIELDS.rubai,
    ...HINDI_FIELDS.rubai
  ],
  shaer: [
    ...BASE_FIELDS.shaer,
    ...ENGLISH_FIELDS.shaer,
    ...HINDI_FIELDS.shaer
  ],
  ebooks: [
    ...BASE_FIELDS.ebooks,
    ...ENGLISH_FIELDS.ebooks,
    ...HINDI_FIELDS.ebooks
  ]
} as const;

// Helper function to get multilingual fields for a content type
export function getMultilingualFields(contentType: keyof typeof MULTILINGUAL_FIELDS): string[] {
  return [...MULTILINGUAL_FIELDS[contentType]];
}

// Helper function to get fields as comma-separated string
export function getMultilingualFieldsString(contentType: keyof typeof MULTILINGUAL_FIELDS): string {
  return [...MULTILINGUAL_FIELDS[contentType]].join(',');
}

// Field aliases for backward compatibility and error recovery
export const FIELD_ALIASES = {
  // Fixed field mappings based on actual Airtable schema
  'pdfUrl': null, // This field doesn't exist in E-Books table
  'ghazalLines': null, // This field doesn't exist in Nazmen table
  'anaween': null, // This field doesn't exist in current schema
  'coverImage': null, // This field doesn't exist in E-Books table
  'shares': 'likes', // Use likes as fallback for shares
  'comments': 'likes', // Use likes as fallback for comments
  'ghazal': 'ghazalHead', // Use ghazalHead instead of ghazal for ashaar
} as const;

// Helper function to get field suggestions for invalid field names
export function getFieldSuggestion(invalidField: string): string | null {
  return FIELD_ALIASES[invalidField as keyof typeof FIELD_ALIASES] || null;
}

// Helper function to validate field names against known valid fields
export function validateFieldNames(contentType: keyof typeof MULTILINGUAL_FIELDS, fields: string[]): {
  valid: string[];
  invalid: string[];
  suggestions: Record<string, string | null>;
} {
  const validFields = MULTILINGUAL_FIELDS[contentType];
  const valid: string[] = [];
  const invalid: string[] = [];
  const suggestions: Record<string, string | null> = {};

  for (const field of fields) {
    if ((validFields as readonly string[]).includes(field)) {
      valid.push(field);
    } else {
      invalid.push(field);
      suggestions[field] = getFieldSuggestion(field);
    }
  }

  return { valid, invalid, suggestions };
}