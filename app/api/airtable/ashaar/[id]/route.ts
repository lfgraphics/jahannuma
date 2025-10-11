/**
 * GET /api/airtable/ashaar/[id]
 * Fetch a specific Ashar by ID.
 */

import { getAshaarRecord } from "@/src/lib/airtable/airtable-client";
import { getUserLikeStatus } from "@/src/lib/user/user-metadata-utils";
import type { AsharDetailResponse } from "@/src/types/api";
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
            message: "Ashar ID is required",
          },
        },
        { status: 400 }
      );
    }

    const record = await getAshaarRecord(id);

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Ashar not found",
          },
        },
        { status: 404 }
      );
    }

    // Get user-specific data if authenticated
    const { userId } = await auth();
    let userMetadata = null;

    if (userId) {
      const isLiked = await getUserLikeStatus(userId, "ashaar", id);
      userMetadata = {
        userId,
        isLiked,
      };
    }

    const response: AsharDetailResponse = {
      success: true,
      data: {
        record,
        userMetadata,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching ashar:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_FAILED",
          message: "Failed to fetch ashar",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
