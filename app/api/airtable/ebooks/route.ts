/**
 * GET /api/airtable/ebooks
 * Fetch list of EBooks with pagination and filtering.
 */

import {
  createRecord,
  formatBookRecord,
  listEbooksRecords,
} from "@/lib/airtable";
import { errors, ok } from "@/lib/api-response";
import { getMultilingualFieldsString } from "@/lib/multilingual-field-constants";
import { isValidFilterFormula, isValidPageSize } from "@/utils/validators";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const offset = searchParams.get("offset") || undefined;
    const filterByFormula = searchParams.get("filterByFormula") || undefined;
    const search = searchParams.get("search") || undefined;
    const fields = searchParams.get("fields") || undefined;
    const sort = searchParams.get("sort") || undefined;
    const view = searchParams.get("view") || undefined;

    // Validate query parameters
    if (!isValidPageSize(pageSize)) {
      return errors.badRequest("Invalid pageSize. Must be between 1 and 100.");
    }

    if (filterByFormula && !isValidFilterFormula(filterByFormula)) {
      return errors.badRequest("Invalid filterByFormula syntax.");
    }

    // Parse sort parameter - only if provided
    const sortArray = sort
      ? sort.split(",").map((s: string) => {
          const [field, direction] = s.split(":");
          return { field, direction: (direction as "asc" | "desc") || "desc" };
        })
      : undefined;

    // Use multilingual fields if no specific fields are requested
    const fieldsToUse = fields || getMultilingualFieldsString('ebooks');

    const result = await listEbooksRecords({
      pageSize,
      offset,
      filterByFormula,
      search,
      fields: fieldsToUse,
      sort: sortArray,
      view,
      validateFields: true, // Enable field validation
    });

    // Format records for consistent API output
    const formattedRecords = result.records.map((record) =>
      formatBookRecord(record)
    );

    // Get user info for likes/favorites if authenticated
    const { userId } = await auth();
    const userMetadata = userId ? { userId } : undefined;

    const responseData = {
      records: formattedRecords,
      offset: result.offset,
      hasMore: !!result.offset,
      userMetadata,
    };

    return ok(responseData);
  } catch (error) {
    console.error("Error fetching ebooks:", error);
    return errors.internal(
      "Failed to fetch ebooks",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return errors.unauthorized();
    }

    const { fields } = await req.json();

    if (!fields || typeof fields !== "object") {
      return errors.badRequest("fields required");
    }

    const record = await createRecord("E-Books", fields);
    return ok({ record });
  } catch (error) {
    return errors.internal(
      "Failed to create ebook",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
