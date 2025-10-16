/**
 * GET /api/airtable/rubai/[id]
 * Fetch a specific Rubai by ID.
 */

import {
  formatRubaiRecord,
  getRubaiRecord,
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
      return errors.badRequest("Rubai ID is required");
    }

    const record = await getRubaiRecord(id);

    if (!record) {
      return errors.notFound("Rubai not found");
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

    return ok({
      record: formattedRecord,
      userMetadata,
    });
  } catch (error) {
    console.error("Error fetching rubai:", error);
    return errors.internal("Failed to fetch rubai");
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

    const record = await updateRecord("Rubai", id, fields);
    return ok({ record });
  } catch (error) {
    console.error("Error updating rubai:", error);
    return errors.internal("Failed to update rubai");
  }
}
