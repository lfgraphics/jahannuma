/**
 * GET /api/airtable/ghazlen/[id]
 * Fetch a specific Ghazal by ID.
 */

import {
  formatGhazlenRecord,
  getGhazlenRecord,
  updateRecord,
} from "@/lib/airtable";
import { errors, ok } from "@/lib/api-response";
import { getUserLikeStatus } from "@/lib/user/user-metadata-utils";
import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return errors.badRequest("Ghazal ID is required");
    }

    const record = await getGhazlenRecord(id);

    if (!record) {
      return errors.notFound("Ghazal not found");
    }

    // Get user-specific data if authenticated
    const { userId } = await auth();
    let userMetadata: { userId: string; isLiked: boolean } | undefined =
      undefined;

    if (userId) {
      const isLiked = await getUserLikeStatus(userId, "ghazlen", id);
      userMetadata = {
        userId,
        isLiked,
      };
    }

    // Format record for consistent API output
    const formattedRecord = formatGhazlenRecord(record);

    return ok({
      record: formattedRecord,
      userMetadata,
    });
  } catch (error) {
    console.error("Error fetching ghazal:", error);
    return errors.internal(
      "Failed to fetch ghazal",
      error instanceof Error ? error.message : "Unknown error"
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
      return errors.badRequest("ID and fields are required");
    }

    const record = await updateRecord("Ghazlen", id, fields);
    return ok({ record });
  } catch (error) {
    return errors.internal(
      "Failed to update ghazal",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
