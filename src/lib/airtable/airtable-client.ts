/**
 * Server-side Airtable client for use in API routes.
 * Provides secure access to Airtable with proper error handling and field validation.
 *
 * This module should only be used on the server side (API routes).
 * Client-side code should use the hooks that call API routes.
 */

import {
  createAirtableError,
  createFieldMappingError,
  detectAirtableErrorType,
  logApiRequest,
  logFieldValidation,
  parseAirtableErrorResponse,
  withAirtableErrorLogging,
  type AirtableErrorContext
} from './airtable-error-logger';
import {
  cacheForFallback,
  createUserFriendlyErrorMessage,
  executeWithFallback,
  type FallbackOptions
} from './airtable-fallback-manager';
import { preValidateApiFields, type ContentType } from './field-validator';

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
  Ghazlen: ["shaer", "unwan", "ghazal"],
  Nazmen: ["shaer", "unwan", "nazm"],
  Rubai: ["shaer", "unwan", "body"],
  "E-Books": ["bookName", "writer"],
  Comments: ["comment", "commentorName"],
};

/**
 * Fetch records from an Airtable table with filtering, sorting, and pagination.
 * Includes field validation to prevent API errors and fallback mechanisms.
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
    validateFields?: boolean; // New option to enable/disable field validation
    enableFallback?: boolean; // New option to enable fallback mechanisms
    fallbackOptions?: FallbackOptions; // Fallback configuration
  } = {},
  contentType?: string // Add contentType parameter
): Promise<{ records: T[]; offset?: string }> {
  // Create the core operation function
  const coreOperation = async (): Promise<{ records: T[]; offset?: string }> => {
    return withAirtableErrorLogging(
      `fetchRecords:${tableName}`,
      {
        baseId: undefined, // Will be set below
        tableName,
        contentType,
        operation: 'fetchRecords',
        requestedFields: params.fields?.split(',').map(f => f.trim())
      },
      async () => {
        const { apiKey, baseId } = getAirtableConfig(tableName, contentType);

        // Validate fields if requested and contentType is available
        let validatedFields = params.fields;
        let fieldValidationResults: any = null;

        if (params.validateFields !== false && params.fields && contentType) {
          try {
            const fieldList = params.fields.split(',').map(f => f.trim());
            const validation = preValidateApiFields(contentType as ContentType, fieldList, {
              autoCorrect: true,
              logErrors: true
            });

            fieldValidationResults = validation;

            // Log field validation results
            logFieldValidation(
              tableName,
              contentType,
              fieldList,
              validation.validatedFields,
              validation.errors,
              validation.corrections
            );

            if (!validation.success) {
              // Continue with corrected fields if available
              if (validation.validatedFields.length > 0) {
                validatedFields = validation.validatedFields.join(',');
              }
            } else if (Object.keys(validation.corrections).length > 0) {
              validatedFields = validation.validatedFields.join(',');
            }
          } catch (error) {
            // Log field validation error but continue
            const validationError = createFieldMappingError(tableName, params.fields?.split(',') || [], {
              baseId,
              contentType,
              operation: 'field_validation'
            });
            console.warn(`Field validation error for ${tableName}:`, error);
          }
        }

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

        // Add fields filter (use validated fields if available)
        if (validatedFields) {
          const fieldsList = validatedFields.split(",").map((f) => f.trim());
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

        // Log API request
        logApiRequest('GET', url, {
          tableName,
          baseId,
          params,
          validatedFields,
          fieldValidationResults: fieldValidationResults ? {
            success: fieldValidationResults.success,
            correctionCount: Object.keys(fieldValidationResults.corrections).length,
            errorCount: fieldValidationResults.errors.length
          } : null
        });

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => "Unknown error");
          const parsedError = parseAirtableErrorResponse(errorText);

          // Create detailed error context
          const errorContext: AirtableErrorContext = {
            baseId,
            tableName,
            contentType,
            operation: 'fetchRecords',
            requestedFields: params.fields?.split(',').map(f => f.trim()),
            validFields: fieldValidationResults?.validatedFields,
            invalidFields: parsedError.invalidFields,
            apiUrl: url,
            httpStatus: response.status,
            responseBody: errorText,
            requestParams: params,
            timestamp: Date.now()
          };

          // Log the API response error
          logApiRequest('GET', url, params, response, new Error(errorText));

          // Create appropriate Airtable error
          const errorType = detectAirtableErrorType(new Error(errorText), response);
          const airtableError = createAirtableError(
            `Airtable API error: ${response.status} ${parsedError.errorMessage || errorText}`,
            errorType,
            errorContext,
            new Error(errorText),
            response
          );

          throw airtableError;
        }

        // Log successful API response
        logApiRequest('GET', url, params, response);

        const data = await response.json();
        const result = {
          records: data.records || [],
          offset: data.offset,
        };

        // Cache successful results for fallback
        if (contentType && result.records.length > 0) {
          cacheForFallback(tableName, contentType, 'fetchRecords', result);
        }

        return result;
      }
    );
  };

  // Use fallback manager if enabled
  if (params.enableFallback !== false) {
    const fallbackResult = await executeWithFallback(
      coreOperation,
      {
        operationName: `fetchRecords:${tableName}`,
        tableName,
        contentType,
        requestedFields: params.fields?.split(',').map(f => f.trim())
      },
      params.fallbackOptions || {}
    );

    if (fallbackResult.success) {
      return fallbackResult.data!;
    } else {
      // Return empty result with user-friendly error
      const emptyResult = { records: [], offset: undefined };
      if (fallbackResult.originalError) {
        // Log the user-friendly error message
        const userMessage = createUserFriendlyErrorMessage(fallbackResult.originalError, fallbackResult);
        console.warn('Airtable fetch failed with fallback:', userMessage);
      }
      return emptyResult;
    }
  }

  // Execute without fallback
  return coreOperation();
}

/**
 * Fetch a single record by ID from an Airtable table.
 */
export async function fetchRecord<T = any>(
  tableName: string,
  recordId: string,
  fields?: string[],
  options: {
    enableFallback?: boolean;
    fallbackOptions?: FallbackOptions;
  } = {}
): Promise<T | null> {
  // Create the core operation function
  const coreOperation = async (): Promise<T | null> => {
    return withAirtableErrorLogging(
      `fetchRecord:${tableName}:${recordId}`,
      {
        baseId: undefined, // Will be set below
        tableName,
        recordId,
        operation: 'fetchRecord',
        requestedFields: fields
      },
      async () => {
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

        // Log API request
        logApiRequest('GET', url, { tableName, baseId, recordId, fields });

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            // Log successful 404 (record not found is expected sometimes)
            logApiRequest('GET', url, { tableName, baseId, recordId, fields }, response);
            return null;
          }

          const errorText = await response.text().catch(() => "Unknown error");
          const parsedError = parseAirtableErrorResponse(errorText);

          // Create error context
          const errorContext: AirtableErrorContext = {
            baseId,
            tableName,
            recordId,
            operation: 'fetchRecord',
            requestedFields: fields,
            invalidFields: parsedError.invalidFields,
            apiUrl: url,
            httpStatus: response.status,
            responseBody: errorText,
            timestamp: Date.now()
          };

          // Log the API response error
          logApiRequest('GET', url, { tableName, baseId, recordId, fields }, response, new Error(errorText));

          // Create appropriate Airtable error
          const errorType = detectAirtableErrorType(new Error(errorText), response);
          const airtableError = createAirtableError(
            `Airtable API error: ${response.status} ${parsedError.errorMessage || errorText}`,
            errorType,
            errorContext,
            new Error(errorText),
            response
          );

          throw airtableError;
        }

        // Log successful API response
        logApiRequest('GET', url, { tableName, baseId, recordId, fields }, response);

        const result = await response.json();

        // Cache successful results for fallback
        if (result) {
          cacheForFallback(tableName, 'single_record', `fetchRecord:${recordId}`, result);
        }

        return result;
      }
    );
  };

  // Use fallback manager if enabled
  if (options.enableFallback !== false) {
    const fallbackResult = await executeWithFallback(
      coreOperation,
      {
        operationName: `fetchRecord:${tableName}:${recordId}`,
        tableName,
        requestedFields: fields
      },
      options.fallbackOptions || {}
    );

    if (fallbackResult.success) {
      return fallbackResult.data!;
    } else {
      // Return null for failed single record fetch
      if (fallbackResult.originalError) {
        const userMessage = createUserFriendlyErrorMessage(fallbackResult.originalError, fallbackResult);
        console.warn('Airtable record fetch failed with fallback:', userMessage);
      }
      return null;
    }
  }

  // Execute without fallback
  return coreOperation();
}

/**
 * Create a new record in an Airtable table.
 */
export async function createRecord<T = any>(
  tableName: string,
  fields: Record<string, any>,
  contentType?: string // Add contentType parameter
): Promise<T> {
  return withAirtableErrorLogging(
    `createRecord:${tableName}`,
    {
      baseId: undefined, // Will be set below
      tableName,
      contentType,
      operation: 'createRecord',
      requestedFields: Object.keys(fields)
    },
    async () => {
      const { apiKey, baseId } = getAirtableConfig(tableName, contentType);

      const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(
        tableName
      )}`;

      const requestBody = { fields };

      // Log API request
      logApiRequest('POST', url, { tableName, baseId, fields: Object.keys(fields) });

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        const parsedError = parseAirtableErrorResponse(errorText);

        // Create error context
        const errorContext: AirtableErrorContext = {
          baseId,
          tableName,
          contentType,
          operation: 'createRecord',
          requestedFields: Object.keys(fields),
          invalidFields: parsedError.invalidFields,
          apiUrl: url,
          httpStatus: response.status,
          responseBody: errorText,
          requestParams: { fields },
          timestamp: Date.now()
        };

        // Log the API response error
        logApiRequest('POST', url, { tableName, baseId, fields: Object.keys(fields) }, response, new Error(errorText));

        // Create appropriate Airtable error
        const errorType = detectAirtableErrorType(new Error(errorText), response);
        const airtableError = createAirtableError(
          `Airtable API error: ${response.status} ${parsedError.errorMessage || errorText}`,
          errorType,
          errorContext,
          new Error(errorText),
          response
        );

        throw airtableError;
      }

      // Log successful API response
      logApiRequest('POST', url, { tableName, baseId, fields: Object.keys(fields) }, response);

      return response.json();
    }
  );
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
    validateFields?: boolean;
  } = {}
) {
  const sortParam = params.sort
    ? params.sort.map((s) => `${s.field}:${s.direction}`).join(",")
    : undefined;
  return fetchRecords("Ashaar", {
    ...params,
    sort: sortParam,
  }, "ashaar"); // Pass content type for field validation
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
    validateFields?: boolean;
  } = {}
) {
  const sortParam = params.sort
    ? params.sort.map((s) => `${s.field}:${s.direction}`).join(",")
    : undefined;
  return fetchRecords("Ghazlen", {
    ...params,
    sort: sortParam,
  }, "ghazlen"); // Pass content type for field validation
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
    validateFields?: boolean;
  } = {}
) {
  const sortParam = params.sort
    ? params.sort.map((s) => `${s.field}:${s.direction}`).join(",")
    : undefined;
  return fetchRecords("E-Books", {
    ...params,
    sort: sortParam,
  }, "ebooks"); // Pass content type for field validation
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
