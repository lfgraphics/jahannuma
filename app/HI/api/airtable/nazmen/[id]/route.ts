/**
 * GET /api/airtable/nazmen/[id]
 * Fetch a specific Nazm by ID.
 */

import {
  formatNazmenRecord,
  getNazmenRecord,
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
      return errors.badRequest("Nazm ID is required");
    }

    const record = await getNazmenRecord(id);

    if (!record) {
      return errors.notFound("Nazm not found");
    }

    // Get user-specific data if authenticated
    const { userId } = await auth();
    let userMetadata: { userId: string; isLiked: boolean } | undefined =
      undefined;

    if (userId) {
      const isLiked = await getUserLikeStatus(userId, "nazmen", id);
      userMetadata = {
        userId,
        isLiked,
      };
    }

    // Format record for consistent API output
    const formattedRecord = formatNazmenRecord(record);

    return ok({
      record: formattedRecord,
      userMetadata,
    });
  } catch (error) {
    console.error("Error fetching nazm:", error);
    return errors.internal(
      "Failed to fetch nazm",
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

    const record = await updateRecord("Nazmen", id, fields);
    return ok({ record });
  } catch (error) {
    return errors.internal(
      "Failed to update nazm",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
