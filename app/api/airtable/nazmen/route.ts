/**
 * GET /api/airtable/nazmen
 * Fetch list of Nazmen with pagination and filtering.
 */

import { SORTS } from "@/lib/airtable";
import {
  createRecord,
  listNazmenRecords,
} from "@/lib/airtable/airtable-client";
import { formatNazmenRecord } from "@/lib/airtable/airtable-utils";
import { NazmenListResponse } from "@/types/api/responses";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const offset = searchParams.get("offset") || undefined;
    const filterByFormula = searchParams.get("filterByFormula") || undefined;
    const search = searchParams.get("search") || undefined;
    const fields = searchParams.get("fields") || undefined;
    const sort = searchParams.get("sort") || SORTS.CREATED_DESC;
    const view = searchParams.get("view") || "Main View";

    // Parse sort parameter
    const sortArray = sort.split(",").map((s) => {
      const [field, direction] = s.split(":");
      return { field, direction: (direction as "asc" | "desc") || "desc" };
    });

    const result = await listNazmenRecords({
      pageSize,
      offset,
      filterByFormula,
      search,
      fields,
      sort: sortArray,
      view,
    });

    // Format records for consistent API output
    const formattedRecords = result.records.map((record) =>
      formatNazmenRecord(record)
    );

    // Get user info for likes/favorites if authenticated
    const { userId } = await auth();
    const userMetadata = userId ? { userId } : undefined;

    const response: NazmenListResponse = {
      success: true,
      data: {
        records: formattedRecords,
        offset: result.offset,
        hasMore: !!result.offset,
        userMetadata,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching nazmen:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_FAILED",
          message: "Failed to fetch nazmen",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const { fields } = await req.json();

    if (!fields || typeof fields !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: "fields required",
          },
        },
        { status: 400 }
      );
    }

    const record = await createRecord("Nazmen", fields);
    return NextResponse.json({ success: true, data: { record } });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CREATE_FAILED",
          message: "Failed to create nazm",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
