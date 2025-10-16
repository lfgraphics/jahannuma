/**
 * Server-side Airtable client for use in API routes.
 * Provides secure access to Airtable with proper error handling.
 *
 * This module should only be used on the server side (API routes).
 * Client-side code should use the hooks that call API routes.
 */

interface AirtableConfig {
  apiKey: string;
  baseId: string;
}

/**
 * Get configured Airtable API key from environment.
 * Throws if AIRTABLE_API_KEY environment variable is not set.
 */
export function getAirtableApiKey(): string {
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) {
    throw new Error("AIRTABLE_API_KEY environment variable is required");
  }
  return apiKey;
}

/**
 * Get the base ID for a specific table.
 * Uses the TABLE_BASE_MAPPING to find the correct base for each table.
 * For comments, requires a contentType parameter.
 */
export function getBaseIdForTable(tableName: string, contentType?: string): string {
  const { TABLE_BASE_MAPPING, COMMENT_BASE_MAPPING } = require("./airtable-constants");
  
  // Handle comments specially since they have different bases per content type
  if (tableName === "Comments") {
    if (!contentType) {
      throw new Error("Comments table requires contentType parameter (ashaar, ghazlen, nazmen, rubai)");
    }
    const baseId = COMMENT_BASE_MAPPING[contentType as keyof typeof COMMENT_BASE_MAPPING];
    if (!baseId) {
      throw new Error(`No comment base ID configured for content type: ${contentType}`);
    }
    return baseId;
  }
  
  const baseId = TABLE_BASE_MAPPING[tableName as keyof typeof TABLE_BASE_MAPPING];
  
  if (!baseId) {
    throw new Error(`No base ID configured for table: ${tableName}`);
  }
  
  return baseId;
}

/**
 * Get configured Airtable client with API key and base ID for a specific table.
 */
export function getAirtableConfig(tableName: string, contentType?: string): AirtableConfig {
  const apiKey = getAirtableApiKey();
  const baseId = getBaseIdForTable(tableName, contentType);
  return { apiKey, baseId };
}

/**
 * Table-specific searchable fields mapping to prevent API errors
 */
const TABLE_SEARCH_FIELDS: Record<string, string[]> = {
  Ashaar: ["shaer", "unwan", "sher", "body"],
  Ghazlen: ["shaer", "unwan", "ghazal", "ghazalHead"],
  Nazmen: ["shaer", "unwan", "nazm"],
  Rubai: ["shaer", "unwan", "body"],
  "E-Books": ["bookName", "writer", "description"],
  Comments: ["comment", "commentorName"],
};

/**
 * Fetch records from an Airtable table with filtering, sorting, and pagination.
 */
export async function fetchRecords<T = any>(
  tableName: string,
  params: {
    pageSize?: number;
    offset?: string;
    filterByFormula?: string;
    sort?: string;
    fields?: string;
    search?: string;
    view?: string;
  } = {},
  contentType?: string // Add contentType parameter
): Promise<{ records: T[]; offset?: string }> {
  const { apiKey, baseId } = getAirtableConfig(tableName, contentType); // Pass contentType

  const searchParams = new URLSearchParams();

  // Add pagination
  if (params.pageSize) {
    searchParams.set("pageSize", String(Math.min(params.pageSize, 100))); // Max 100
  }
  if (params.offset) {
    searchParams.set("offset", params.offset);
  }

  // Add filtering
  if (params.filterByFormula) {
    searchParams.set("filterByFormula", params.filterByFormula);
  }

  // Add view
  if (params.view) {
    searchParams.set("view", params.view);
  }

  // Add sorting
  if (params.sort) {
    // Parse sort string like "field:asc,field2:desc"
    const sorts = params.sort.split(",");
    sorts.forEach((sortSpec, index) => {
      const [field, direction = "asc"] = sortSpec.split(":");
      searchParams.set(`sort[${index}][field]`, field.trim());
      searchParams.set(`sort[${index}][direction]`, direction.trim());
    });
  }

  // Add fields filter
  if (params.fields) {
    const fieldsList = params.fields.split(",").map((f) => f.trim());
    fieldsList.forEach((field) => {
      searchParams.append("fields[]", field);
    });
  }

  // Handle search (convert to filter formula with table-specific fields)
  if (params.search) {
    const searchFields = TABLE_SEARCH_FIELDS[tableName];
    if (searchFields && searchFields.length > 0) {
      const fieldsConcat = searchFields.map(field => `{${field}}`).join(', " ", ');
      const searchFilter = `SEARCH("${params.search.replace(
        /"/g,
        '""'
      )}", CONCATENATE(${fieldsConcat}))`;
      if (params.filterByFormula) {
        const combinedFilter = `AND(${params.filterByFormula}, ${searchFilter})`;
        searchParams.set("filterByFormula", combinedFilter);
      } else {
        searchParams.set("filterByFormula", searchFilter);
      }
    } else {
      // Fallback: if table not in mapping, ignore search to prevent errors
      console.warn(`Search not supported for table: ${tableName}. Please add field mapping.`);
    }
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
    tableName
  )}?${searchParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Airtable API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return {
    records: data.records || [],
    offset: data.offset,
  };
}

/**
 * Fetch a single record by ID from an Airtable table.
 */
export async function fetchRecord<T = any>(
  tableName: string,
  recordId: string,
  fields?: string[]
): Promise<T | null> {
  const { apiKey, baseId } = getAirtableConfig(tableName);

  const searchParams = new URLSearchParams();
  if (fields && fields.length > 0) {
    fields.forEach((field) => {
      searchParams.append("fields[]", field);
    });
  }

  const queryString = searchParams.toString();
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
    tableName
  )}/${recordId}${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Airtable API error: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Create a new record in an Airtable table.
 */
export async function createRecord<T = any>(
  tableName: string,
  fields: Record<string, any>,
  contentType?: string // Add contentType parameter
): Promise<T> {
  const { apiKey, baseId } = getAirtableConfig(tableName, contentType); // Pass contentType

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
    tableName
  )}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Airtable API error: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Update an existing record in an Airtable table.
 */
export async function updateRecord<T = any>(
  tableName: string,
  recordId: string,
  fields: Record<string, any>
): Promise<T> {
  const { apiKey, baseId } = getAirtableConfig(tableName);

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
    tableName
  )}/${recordId}`;

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Airtable API error: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Delete a record from an Airtable table.
 */
export async function deleteRecord(
  tableName: string,
  recordId: string
): Promise<{ deleted: boolean; id: string }> {
  const { apiKey, baseId } = getAirtableConfig(tableName);

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
    tableName
  )}/${recordId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Airtable API error: ${response.status} ${errorText}`);
  }

  return response.json();
}

// ============================================================================
// Feature-specific convenience functions
// ============================================================================

/**
 * List Ashaar records with typed response.
 */
export async function listAshaarRecords(
  params: {
    pageSize?: number;
    offset?: string;
    filterByFormula?: string;
    sort?: Array<{ field: string; direction: "asc" | "desc" }>;
    view?: string;
    fields?: string;
    search?: string;
  } = {}
) {
  const sortParam = params.sort
    ? params.sort.map((s) => `${s.field}:${s.direction}`).join(",")
    : undefined;
  return fetchRecords("Ashaar", {
    ...params,
    sort: sortParam,
  });
}

/**
 * Get a specific Ashaar record by ID.
 */
export async function getAshaarRecord(recordId: string) {
  return fetchRecord("Ashaar", recordId);
}

/**
 * List Ghazlen records with typed response.
 */
export async function listGhazlenRecords(
  params: {
    pageSize?: number;
    offset?: string;
    filterByFormula?: string;
    sort?: Array<{ field: string; direction: "asc" | "desc" }>;
    view?: string;
    fields?: string;
    search?: string;
  } = {}
) {
  const sortParam = params.sort
    ? params.sort.map((s) => `${s.field}:${s.direction}`).join(",")
    : undefined;
  return fetchRecords("Ghazlen", {
    ...params,
    sort: sortParam,
  });
}

/**
 * Get a specific Ghazal record by ID.
 */
export async function getGhazlenRecord(recordId: string) {
  return fetchRecord("Ghazlen", recordId);
}

/**
 * List Nazmen records with typed response.
 */
export async function listNazmenRecords(
  params: {
    pageSize?: number;
    offset?: string;
    filterByFormula?: string;
    sort?: Array<{ field: string; direction: "asc" | "desc" }>;
    view?: string;
    fields?: string;
    search?: string;
  } = {}
) {
  const sortParam = params.sort
    ? params.sort.map((s) => `${s.field}:${s.direction}`).join(",")
    : undefined;
  return fetchRecords("Nazmen", {
    ...params,
    sort: sortParam,
  });
}

/**
 * Get a specific Nazm record by ID.
 */
export async function getNazmenRecord(recordId: string) {
  return fetchRecord("Nazmen", recordId);
}

/**
 * List Rubai records with typed response.
 */
export async function listRubaiRecords(
  params: {
    pageSize?: number;
    offset?: string;
    filterByFormula?: string;
    sort?: Array<{ field: string; direction: "asc" | "desc" }>;
    view?: string;
    fields?: string;
    search?: string;
  } = {}
) {
  const sortParam = params.sort
    ? params.sort.map((s) => `${s.field}:${s.direction}`).join(",")
    : undefined;
  return fetchRecords("Rubai", {
    ...params,
    sort: sortParam,
  });
}

/**
 * Get a specific Rubai record by ID.
 */
export async function getRubaiRecord(recordId: string) {
  return fetchRecord("Rubai", recordId);
}

/**
 * List E-Books records with typed response.
 */
export async function listEbooksRecords(
  params: {
    pageSize?: number;
    offset?: string;
    filterByFormula?: string;
    sort?: Array<{ field: string; direction: "asc" | "desc" }>;
    view?: string;
    fields?: string;
    search?: string;
  } = {}
) {
  const sortParam = params.sort
    ? params.sort.map((s) => `${s.field}:${s.direction}`).join(",")
    : undefined;
  return fetchRecords("E-Books", {
    ...params,
    sort: sortParam,
  });
}

/**
 * Get a specific E-Book record by ID.
 */
export async function getEbooksRecord(recordId: string) {
  return fetchRecord("E-Books", recordId);
}

/**
 * List Comments records with typed response.
 */
export async function listCommentsRecords(
  params: {
    pageSize?: number;
    offset?: string;
    filterByFormula?: string;
    sort?: Array<{ field: string; direction: "asc" | "desc" }>;
    view?: string;
    fields?: string;
    search?: string;
    contentType?: string; // Add contentType parameter
  } = {}
) {
  const sortParam = params.sort
    ? params.sort.map((s) => `${s.field}:${s.direction}`).join(",")
    : undefined;
  
  const { contentType, ...restParams } = params;
  
  return fetchRecords("Comments", {
    ...restParams,
    sort: sortParam,
  }, contentType); // Pass contentType to fetchRecords
}

/**
 * Get a specific Comment record by ID.
 */
export async function getCommentsRecord(recordId: string) {
  return fetchRecord('Comments', recordId);
}
