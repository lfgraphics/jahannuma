import { errors, ok } from "@/lib/api-response";
import { isValidPageSize } from "@/utils/validators";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing ashaar route components...");

    // Test the request parsing logic
    const { searchParams } = new URL(request.url);
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const sort = searchParams.get("sort") || undefined;

    console.log("Request parsing successful", { pageSize, sort });

    // Validate query parameters
    if (!isValidPageSize(pageSize)) {
      return errors.badRequest("Invalid pageSize. Must be between 1 and 100.");
    }

    console.log("Validation successful");

    // Parse sort parameter - only if provided
    let sortArray: { field: string; direction: "asc" | "desc" }[] | undefined;
    if (sort) {
      sortArray = sort.split(",").map((s: string) => {
        const [field, direction] = s.split(":");
        return { field, direction: (direction as "asc" | "desc") || "desc" };
      });
    }

    console.log("Sort parsing successful", sortArray);

    return ok({
      message: "Components test successful",
      pageSize,
      sort,
      sortArray,
    });
  } catch (error) {
    console.error("Components test error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error details:", errorMessage);
    return errors.internal("Components test failed", errorMessage);
  }
}
