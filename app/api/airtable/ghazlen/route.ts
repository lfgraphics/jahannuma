/**
 * GET /api/airtable/ghazlen
 * Fetch list of Ghazals with pagination and filtering.
 */

import { listGhazlenRecords } from "@/src/lib/airtable/airtable-client";
import type { GhazalListResponse } from "@/src/types/api";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const offset = searchParams.get("offset") || undefined;
    const filterByFormula = searchParams.get("filter") || undefined;
    const sort = searchParams.get("sort") || "Created";
    const view = searchParams.get("view") || "Main View";

    const result = await listGhazlenRecords({
      pageSize,
      offset,
      filterByFormula,
      sort: [{ field: sort, direction: "desc" }],
      view,
    });

    // Get user info for likes/favorites if authenticated
    const { userId } = await auth();
    const userMetadata = userId ? { userId } : null;

    const response: GhazalListResponse = {
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
    console.error("Error fetching ghazlen:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_FAILED",
          message: "Failed to fetch ghazals",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
