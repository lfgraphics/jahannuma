/**
 * GET /api/airtable/ashaar
 * Fetch list of Ashaar with pagination and filtering.
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { listAshaarRecords } from "../../../../src/lib/airtable/airtable-client";
import { AsharListResponse } from "../../../../src/types/api/responses";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const offset = searchParams.get("offset") || undefined;
    const filterByFormula = searchParams.get("filter") || undefined;
    const sort = searchParams.get("sort") || "Created";
    const view = searchParams.get("view") || "Main View";

    const result = await listAshaarRecords({
      pageSize,
      offset,
      filterByFormula,
      sort: [{ field: sort, direction: "desc" }],
      view,
    });

    // Get user info for likes/favorites if authenticated
    const { userId } = await auth();
    const userMetadata = userId ? { userId } : undefined;

    const response: AsharListResponse = {
      success: true,
      data: {
        records: result.records,
        offset: result.offset,
        hasMore: !!result.offset,
        total: result.records.length,
        userMetadata,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching ashaar:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_FAILED",
          message: "Failed to fetch ashaar",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
