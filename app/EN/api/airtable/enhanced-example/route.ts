/**
 * Enhanced API Route Example
 * 
 * This is an example of how API routes should be structured using
 * the new enhanced error handling and validation infrastructure.
 * This can serve as a template for updating existing routes.
 */

import { formatAshaarRecord } from "@/lib/airtable-utils";
import {
  AuthHelper,
  RequestParser,
  commonValidationRules,
  createAuthenticatedPOSTHandler,
  createStandardGETHandler
} from "@/lib/api-route-helpers";
import {
  EnhancedAPIResponse,
  RequestValidator,
  type ValidationRule
} from "@/lib/enhanced-api-response";
import {
  ErrorContext,
  ErrorSeverity,
  createServerError,
  withRetry
} from "@/lib/error-handling";
import { getUniversalFetcher } from "@/lib/universal-data-fetcher";
import { getBaseIdForTable } from "@/src/lib/airtable";
import { NextRequest } from "next/server";

// Validation rules for this endpoint
const getValidationRules: ValidationRule[] = [
  { ...commonValidationRules.pageSize, required: false },
  commonValidationRules.offset,
  commonValidationRules.filterByFormula,
  commonValidationRules.search,
  commonValidationRules.fields,
  commonValidationRules.sort,
  {
    field: 'view',
    type: 'string',
    required: false,
    max: 100
  }
];

const postValidationRules: ValidationRule[] = [
  {
    field: 'fields',
    type: 'object',
    required: true,
    validator: (value: any) => {
      if (!value || typeof value !== 'object') {
        return 'Fields must be an object';
      }

      // Add specific field validation here
      if (!value.sher && !value.body) {
        return 'Either sher or body field is required';
      }

      return true;
    }
  }
];

// GET handler with enhanced error handling
async function handleGET(validatedData: any, request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || 'unknown';

  try {
    // Get optional authentication
    const { userId } = await AuthHelper.getOptionalAuth();

    // Parse and validate parameters
    const {
      pageSize = 20,
      offset,
      filterByFormula,
      search,
      fields,
      sort,
      view
    } = validatedData;

    // Parse sort parameter
    const sortArray = RequestParser.parseSortParameter(sort);

    // Use universal data fetcher
    const universalFetcher = getUniversalFetcher();

    // Get centralized base ID configuration
    const baseId = getBaseIdForTable("Ashaar");

    const fetchParams = {
      kind: 'list' as const,
      baseId,
      table: 'Ashaar',
      params: {
        pageSize,
        offset,
        filterByFormula,
        search,
        fields,
        sort: sortArray,
        view
      }
    };

    // Fetch data with retry logic
    const result = await withRetry(
      () => universalFetcher.fetchList(fetchParams, {
        cache: true,
        revalidate: 300000, // 5 minutes
        throwOnError: true,
        debug: process.env.NODE_ENV === 'development'
      }),
      3, // max retries
      1000, // base delay
      ErrorContext.SERVER_SIDE
    );

    // Format records for consistent API output
    const typedResult = result as { records?: any[]; offset?: string };
    const formattedRecords = typedResult.records?.map((record: any) =>
      formatAshaarRecord(record)
    ) || [];

    // Prepare response data
    const responseData = {
      records: formattedRecords,
      offset: typedResult.offset,
      hasMore: !!typedResult.offset,
      meta: {
        total: formattedRecords.length,
        pageSize,
        ...(userId && { userId })
      }
    };

    return EnhancedAPIResponse.ok(responseData, { requestId });

  } catch (error) {
    // Enhanced error handling
    if (error && typeof error === 'object' && 'context' in error) {
      // Already an enhanced error
      return EnhancedAPIResponse.error(error as any, undefined, { requestId });
    }

    // Create enhanced error for unknown errors
    const enhancedError = createServerError(
      `Failed to fetch Ashaar data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        code: 'ASHAAR_FETCH_ERROR',
        severity: ErrorSeverity.HIGH,
        debugInfo: {
          params: validatedData,
          originalError: error instanceof Error ? error.message : error
        }
      }
    );

    return EnhancedAPIResponse.error(enhancedError, 500, { requestId });
  }
}

// POST handler with enhanced error handling
async function handlePOST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || 'unknown';

  try {
    // Require authentication
    const { userId } = await AuthHelper.requireAuth(request);

    // Parse and validate request body
    const body = await RequestParser.parseJSONBody(request);
    const validation = RequestValidator.validate(body, postValidationRules);

    if (!validation.isValid) {
      return EnhancedAPIResponse.badRequest(
        "Validation failed",
        { errors: validation.errors },
        { requestId }
      );
    }

    const { fields } = RequestValidator.sanitizeObject(body, postValidationRules);

    // Use universal data fetcher for creation
    const universalFetcher = getUniversalFetcher();

    // Get centralized base ID configuration
    const baseId = getBaseIdForTable("Ashaar");

    // This would need to be implemented in the universal fetcher
    // For now, we'll use the existing pattern but with enhanced error handling
    const createParams = {
      kind: 'create' as const,
      baseId,
      table: 'Ashaar',
      fields
    };

    const result = await withRetry(
      async () => {
        // This is a placeholder - the actual implementation would use
        // the universal fetcher's create method when implemented
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/Ashaar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ fields })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw createServerError(
            `Airtable API error: ${response.status} ${response.statusText}`,
            {
              code: 'AIRTABLE_CREATE_ERROR',
              statusCode: response.status,
              debugInfo: { errorText, fields }
            }
          );
        }

        return response.json();
      },
      3,
      1000,
      ErrorContext.SERVER_SIDE
    );

    return EnhancedAPIResponse.created(
      { record: result },
      {
        requestId,
        location: `/api/airtable/ashaar/${result.id}`
      }
    );

  } catch (error) {
    if (error && typeof error === 'object' && 'context' in error) {
      return EnhancedAPIResponse.error(error as any, undefined, { requestId });
    }

    const enhancedError = createServerError(
      `Failed to create Ashaar record: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {
        code: 'ASHAAR_CREATE_ERROR',
        severity: ErrorSeverity.HIGH,
        debugInfo: {
          originalError: error instanceof Error ? error.message : error
        }
      }
    );

    return EnhancedAPIResponse.error(enhancedError, 500, { requestId });
  }
}

// Export handlers with middleware
export const GET = createStandardGETHandler(handleGET);
export const POST = createAuthenticatedPOSTHandler(handlePOST);