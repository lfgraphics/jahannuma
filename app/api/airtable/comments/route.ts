/**
 * GET /api/airtable/comments
 * Fetch list of Comments with pagination and filtering.
 */

import {
  buildDataIdFilter,
  createRecord,
  listCommentsRecords,
} from "@/lib/airtable";
import { errors, ok } from "@/lib/api-response";
import {
  isValidComment,
  isValidDomainId,
  isValidRecordId,
} from "@/utils/validators";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const offset = searchParams.get("offset") || undefined;
    const dataId = searchParams.get("dataId");
    const contentType = searchParams.get("contentType"); // Add contentType parameter
    const filterByFormula = searchParams.get("filterByFormula") || undefined;
    const fields = searchParams.get("fields") || undefined;
    const sort = searchParams.get("sort") || undefined;
    const view = searchParams.get("view") || undefined;

    // Build filter for dataId if present
    let finalFilter = filterByFormula;
    if (dataId) {
      const dataIdFilter = buildDataIdFilter(dataId);
      if (filterByFormula) {
        finalFilter = `AND(${dataIdFilter}, ${filterByFormula})`;
      } else {
        finalFilter = dataIdFilter;
      }
    }

    // Parse sort parameter - only if provided
    const sortArray = sort
      ? sort.split(",").map((s: string) => {
          const [field, direction] = s.split(":");
          return { field, direction: (direction as "asc" | "desc") || "desc" };
        })
      : undefined;

    const result = await listCommentsRecords({
      pageSize,
      offset,
      filterByFormula: finalFilter,
      sort: sortArray,
      view,
      contentType: contentType || undefined, // Pass contentType to determine the correct base
    });

    // Get user info for likes/favorites if authenticated
    const { userId } = await auth();
    const userMetadata = userId ? { userId } : undefined;

    const responseData = {
      records: result.records,
      offset: result.offset,
      hasMore: !!result.offset,
      userMetadata,
    };

    return ok(responseData);
  } catch (error) {
    console.error("Error fetching comments:", error);
    return errors.internal(
      "Failed to fetch comments",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * POST /api/airtable/comments
 * Create a new comment.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return errors.unauthorized();
    }

    const body = await request.json();
    const { dataId, comment, commentorName, contentType } = body; // Add contentType

    // Parse and validate body
    if (
      !(isValidDomainId(dataId) || isValidRecordId(dataId)) ||
      !isValidComment(comment)
    ) {
      return errors.badRequest("Invalid data");
    }

    // Create record with contentType to determine correct base
    const record = await createRecord(
      "Comments",
      {
        dataId,
        comment,
        commentorName: commentorName || "Anonymous",
        timestamp: new Date().toISOString(),
      },
      contentType || undefined
    );

    return ok({ record });
  } catch (error) {
    console.error("Error creating comment:", error);
    return errors.internal(
      "Failed to create comment",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
