/**
 * GET /api/airtable/rubai/[id]
 * Fetch a specific Rubai by ID.
 */

import { getRubaiRecord, updateRecord } from "@/lib/airtable/airtable-client";
import { formatRubaiRecord } from "@/lib/airtable/airtable-utils";
import { getUserLikeStatus } from "@/lib/user/user-metadata-utils";
import { RubaiDetailResponse } from "@/types/api/responses";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Rubai ID is required",
          },
        },
        { status: 400 }
      );
    }

    const record = await getRubaiRecord(id);

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Rubai not found",
          },
        },
        { status: 404 }
      );
    }

    // Get user-specific data if authenticated
    const { userId } = await auth();
    let userMetadata: { userId: string; isLiked: boolean } | undefined =
      undefined;

    if (userId) {
      const isLiked = await getUserLikeStatus(userId, "rubai", id);
      userMetadata = {
        userId,
        isLiked,
      };
    }

    // Format record for consistent API output
    const formattedRecord = formatRubaiRecord(record);

    const response: RubaiDetailResponse = {
      success: true,
      data: {
        record: formattedRecord,
        userMetadata,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching rubai:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_FAILED",
          message: "Failed to fetch rubai",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { fields } = await req.json();

    if (!id || !fields || typeof fields !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: "id and fields required",
          },
        },
        { status: 400 }
      );
    }

    const record = await updateRecord("Rubai", id, fields);
    return NextResponse.json({ success: true, data: { record } });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_FAILED",
          message: "Failed to update rubai",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
