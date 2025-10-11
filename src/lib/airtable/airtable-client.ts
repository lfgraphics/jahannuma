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
 * Get configured Airtable client with API key from environment.
 * Throws if AIRTABLE_API_KEY environment variable is not set.
 */
export function getAirtableConfig(): AirtableConfig {
  const apiKey = process.env.AIRTABLE_API_KEY;
  if (!apiKey) {
    throw new Error("AIRTABLE_API_KEY environment variable is required");
  }

  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!baseId) {
    throw new Error("AIRTABLE_BASE_ID environment variable is required");
  }

  return { apiKey, baseId };
}

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
  } = {}
): Promise<{ records: T[]; offset?: string }> {
  const { apiKey, baseId } = getAirtableConfig();

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

  // Handle search (convert to filter formula)
  if (params.search) {
    const searchFilter = `SEARCH("${params.search.replace(
      /"/g,
      '""'
    )}", CONCATENATE({shaer}, " ", {unwan}, " ", {sher}, " ", {body}))`;
    if (params.filterByFormula) {
      const combinedFilter = `AND(${params.filterByFormula}, ${searchFilter})`;
      searchParams.set("filterByFormula", combinedFilter);
    } else {
      searchParams.set("filterByFormula", searchFilter);
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
  const { apiKey, baseId } = getAirtableConfig();

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
  fields: Record<string, any>
): Promise<T> {
  const { apiKey, baseId } = getAirtableConfig();

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
  const { apiKey, baseId } = getAirtableConfig();

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
  const { apiKey, baseId } = getAirtableConfig();

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
export async function listAshaarRecords(params: {
  pageSize?: number;
  offset?: string;
  filterByFormula?: string;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  view?: string;
} = {}) {
  const sortParam = params.sort ? params.sort.map(s => `${s.field}%20${s.direction}`).join(',') : undefined;
  return fetchRecords('Ashaar', {
    ...params,
    sort: sortParam,
  });
}

/**
 * Get a specific Ashaar record by ID.
 */
export async function getAshaarRecord(recordId: string) {
  return fetchRecord('Ashaar', recordId);
}

/**
 * List Ghazlen records with typed response.
 */
export async function listGhazlenRecords(params: {
  pageSize?: number;
  offset?: string;
  filterByFormula?: string;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  view?: string;
} = {}) {
  const sortParam = params.sort ? params.sort.map(s => `${s.field}%20${s.direction}`).join(',') : undefined;
  return fetchRecords('Ghazlen', {
    ...params,
    sort: sortParam,
  });
}

/**
 * Get a specific Ghazal record by ID.
 */
export async function getGhazlenRecord(recordId: string) {
  return fetchRecord('Ghazlen', recordId);
}

/**
 * List Nazmen records with typed response.
 */
export async function listNazmenRecords(params: {
  pageSize?: number;
  offset?: string;
  filterByFormula?: string;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  view?: string;
} = {}) {
  const sortParam = params.sort ? params.sort.map(s => `${s.field}%20${s.direction}`).join(',') : undefined;
  return fetchRecords('Nazmen', {
    ...params,
    sort: sortParam,
  });
}

/**
 * Get a specific Nazm record by ID.
 */
export async function getNazmenRecord(recordId: string) {
  return fetchRecord('Nazmen', recordId);
}

/**
 * List Rubai records with typed response.
 */
export async function listRubaiRecords(params: {
  pageSize?: number;
  offset?: string;
  filterByFormula?: string;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  view?: string;
} = {}) {
  const sortParam = params.sort ? params.sort.map(s => `${s.field}%20${s.direction}`).join(',') : undefined;
  return fetchRecords('Rubai', {
    ...params,
    sort: sortParam,
  });
}

/**
 * Get a specific Rubai record by ID.
 */
export async function getRubaiRecord(recordId: string) {
  return fetchRecord('Rubai', recordId);
}

/**
 * List E-Books records with typed response.
 */
export async function listEbooksRecords(params: {
  pageSize?: number;
  offset?: string;
  filterByFormula?: string;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  view?: string;
} = {}) {
  const sortParam = params.sort ? params.sort.map(s => `${s.field}%20${s.direction}`).join(',') : undefined;
  return fetchRecords('E-Books', {
    ...params,
    sort: sortParam,
  });
}

/**
 * Get a specific E-Book record by ID.
 */
export async function getEbooksRecord(recordId: string) {
  return fetchRecord('E-Books', recordId);
}

/**
 * List Comments records with typed response.
 */
export async function listCommentsRecords(params: {
  pageSize?: number;
  offset?: string;
  filterByFormula?: string;
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
  view?: string;
} = {}) {
  const sortParam = params.sort ? params.sort.map(s => `${s.field}%20${s.direction}`).join(',') : undefined;
  return fetchRecords('Comments', {
    ...params,
    sort: sortParam,
  });
}

/**
 * Get a specific Comment record by ID.
 */
export async function getCommentsRecord(recordId: string) {
  return fetchRecord('Comments', recordId);
}
