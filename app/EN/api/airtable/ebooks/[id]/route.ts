/**
 * GET /api/airtable/ebooks/[id]
 * Fetch a specific EBook by ID.
 */

import {
  formatBookRecord,
  getEbooksRecord,
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
      return errors.badRequest("EBook ID is required");
    }

    const record = await getEbooksRecord(id);

    if (!record) {
      return errors.notFound("EBook not found");
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

    // Format record for consistent API output
    const formattedRecord = formatBookRecord(record);

    return ok({
      record: formattedRecord,
      userMetadata,
    });
  } catch (error) {
    console.error("Error fetching ebook:", error);
    return errors.internal("Failed to fetch ebook");
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

    const record = await updateRecord("E-Books", id, fields);
    return ok({ record });
  } catch (error) {
    console.error("Error updating ebook:", error);
    return errors.internal("Failed to update ebook");
  }
}
