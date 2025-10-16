/**
 * GET /api/airtable/shaer
 * Fetch list of Shaer (poets) with pagination and filtering.
 */

import { errors, ok } from "@/lib/api-response";
import {
  getAirtableApiKey,
  getBaseIdForTable,
} from "@/src/lib/airtable/airtable-client";
import { isValidFilterFormula, isValidPageSize } from "@/utils/validators";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const offset = searchParams.get("offset") || undefined;
    const filterByFormula = searchParams.get("filterByFormula") || undefined;
    const search = searchParams.get("search") || undefined;
    const fields = searchParams.get("fields") || undefined;
    const sort = searchParams.get("sort") || undefined;
    const view = searchParams.get("view") || undefined;

    // Validate query parameters
    if (!isValidPageSize(pageSize)) {
      return errors.badRequest("Invalid pageSize. Must be between 1 and 100.");
    }

    if (filterByFormula && !isValidFilterFormula(filterByFormula)) {
      return errors.badRequest("Invalid filterByFormula syntax.");
    }

    // Parse sort parameter - only if provided
    const sortArray = sort
      ? sort.split(",").map((s: string) => {
          const [field, direction] = s.split(":");
          return { field, direction: (direction as "asc" | "desc") || "desc" };
        })
      : undefined;

    // Get the base ID for Shaer table
    const baseId = getBaseIdForTable("Intro"); // Shaer data is in Intro table
    const apiKey = getAirtableApiKey();

    // Build Airtable API URL
    const airtableUrl = new URL(`https://api.airtable.com/v0/${baseId}/Intro`);

    // Add query parameters
    airtableUrl.searchParams.set("pageSize", pageSize.toString());
    if (offset) airtableUrl.searchParams.set("offset", offset);
    if (filterByFormula)
      airtableUrl.searchParams.set("filterByFormula", filterByFormula);
    if (view) airtableUrl.searchParams.set("view", view);

    // Add sort parameters
    if (sortArray) {
      sortArray.forEach((sortItem, index) => {
        airtableUrl.searchParams.set(`sort[${index}][field]`, sortItem.field);
        airtableUrl.searchParams.set(
          `sort[${index}][direction]`,
          sortItem.direction
        );
      });
    }

    // Add fields parameter
    if (fields) {
      const fieldArray = fields.split(",");
      fieldArray.forEach((field) => {
        airtableUrl.searchParams.append("fields[]", field.trim());
      });
    }

    // Fetch from Airtable
    const response = await fetch(airtableUrl.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(
        `Airtable API error: ${response.status} ${response.statusText}`,
        errorText
      );
      return errors.internal(
        `Failed to fetch data from Airtable: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Format the response to match the expected structure
    const result = {
      records: data.records || [],
      offset: data.offset || null,
      hasMore: !!data.offset,
    };

    return ok(result);
  } catch (error) {
    console.error("Error in shaer API route:", error);
    return errors.internal("Failed to fetch shaer data");
  }
}
