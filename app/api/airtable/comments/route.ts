/**
 * GET /api/airtable/comments
 * Fetch list of Comments with pagination and filtering.
 */

import { FILTERS, SORTS } from "@/lib/airtable";
import {
  createRecord,
  listCommentsRecords,
} from "@/lib/airtable/airtable-client";
import { CommentListResponse } from "@/types/api/responses";
import { isValidComment, isValidDomainId } from "@/utils/validators";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const offset = searchParams.get("offset") || undefined;
    const dataId = searchParams.get("dataId");
    const filterByFormula = searchParams.get("filterByFormula") || undefined;
    const fields = searchParams.get("fields") || undefined;
    const sort = searchParams.get("sort") || SORTS.CREATED_DESC;
    const view = searchParams.get("view") || "Main View";

    // Build filter for dataId if present
    let finalFilter = filterByFormula;
    if (dataId) {
      const dataIdFilter = FILTERS.COMMENTS_FOR_RECORD(dataId);
      if (filterByFormula) {
        finalFilter = `AND(${dataIdFilter}, ${filterByFormula})`;
      } else {
        finalFilter = dataIdFilter;
      }
    }

    // Parse sort parameter
    const sortArray = sort.split(",").map((s) => {
      const [field, direction] = s.split(":");
      return { field, direction: (direction as "asc" | "desc") || "desc" };
    });

    const result = await listCommentsRecords({
      pageSize,
      offset,
      filterByFormula: finalFilter,
      sort: sortArray,
      view,
    });

    // Get user info for likes/favorites if authenticated
    const { userId } = await auth();
    const userMetadata = userId ? { userId } : undefined;

    const response: CommentListResponse = {
      success: true,
      data: {
        records: result.records,
        offset: result.offset,
        hasMore: !!result.offset,
        userMetadata,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching comments:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_FAILED",
          message: "Failed to fetch comments",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
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
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { dataId, comment, commentorName } = body;

    // Parse and validate body
    if (!isValidDomainId(dataId) || !isValidComment(comment)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: "Invalid data",
          },
        },
        { status: 400 }
      );
    }

    // Create record
    const record = await createRecord("Comments", {
      dataId,
      comment,
      commentorName: commentorName || "Anonymous",
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, data: { record } });
  } catch (error) {
    console.error("Error creating comment:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CREATE_FAILED",
          message: "Failed to create comment",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
