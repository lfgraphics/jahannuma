/**
 * GET /api/airtable/ghazlen/[id]
 * Fetch a specific Ghazal by ID.
 */

import { getGhazlenRecord } from "@/src/lib/airtable/airtable-client";
import { getUserLikeStatus } from "@/src/lib/user/user-metadata-utils";
import type { GhazalDetailResponse } from "@/src/types/api";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Ghazal ID is required",
          },
        },
        { status: 400 }
      );
    }

    const record = await getGhazlenRecord(id);

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Ghazal not found",
          },
        },
        { status: 404 }
      );
    }

    // Get user-specific data if authenticated
    const { userId } = await auth();
    let userMetadata = null;

    if (userId) {
      const isLiked = await getUserLikeStatus(userId, "ghazlen", id);
      userMetadata = {
        userId,
        isLiked,
      };
    }

    const response: GhazalDetailResponse = {
      success: true,
      data: {
        record,
        userMetadata,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching ghazal:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_FAILED",
          message: "Failed to fetch ghazal",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
