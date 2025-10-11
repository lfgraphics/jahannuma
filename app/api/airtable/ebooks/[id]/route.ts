/**
 * GET /api/airtable/ebooks/[id]
 * Fetch a specific EBook by ID.
 */

import { getEbooksRecord, updateRecord } from "@/lib/airtable/airtable-client";
import { getUserLikeStatus } from "@/lib/user/user-metadata-utils";
import { EbooksDetailResponse } from "@/types/api/responses";
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
            message: "EBook ID is required",
          },
        },
        { status: 400 }
      );
    }

    const record = await getEbooksRecord(id);

    if (!record) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "EBook not found",
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
      const isLiked = await getUserLikeStatus(userId, "ebooks", id);
      userMetadata = {
        userId,
        isLiked,
      };
    }

    const response: EbooksDetailResponse = {
      success: true,
      data: {
        record,
        userMetadata,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching ebook:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_FAILED",
          message: "Failed to fetch ebook",
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

    const record = await updateRecord("E-Books", id, fields);
    return NextResponse.json({ success: true, data: { record } });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UPDATE_FAILED",
          message: "Failed to update ebook",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
