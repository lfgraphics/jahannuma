/**
 * POST /api/user/likes
 * Toggle user like for a specific content item.
 */

import { toggleUserLike } from "@/src/lib/user/user-metadata-utils";
import type { LikeToggleRequest, LikeToggleResponse } from "@/src/types/api";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

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

    const body: LikeToggleRequest = await request.json();
    const { contentType, contentId } = body;

    if (!contentType || !contentId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Content type and ID are required",
          },
        },
        { status: 400 }
      );
    }

    const result = await toggleUserLike(userId, contentType, contentId);

    const response: LikeToggleResponse = {
      success: true,
      data: {
        isLiked: result.isLiked,
        likeCount: result.newCount,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error toggling like:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "TOGGLE_FAILED",
          message: "Failed to toggle like",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/likes
 * Get user's liked content.
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get("contentType") as
      | "ashaar"
      | "ghazlen"
      | "nazmen"
      | "rubai"
      | null;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Import the getUserLikes function (will need to implement)
    // const likes = await getUserLikes(userId, contentType, page, limit);

    return NextResponse.json({
      success: true,
      data: {
        likes: [], // Placeholder - implement getUserLikes
        pagination: {
          page,
          limit,
          total: 0,
          hasMore: false,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user likes:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_FAILED",
          message: "Failed to fetch user likes",
          details: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}
