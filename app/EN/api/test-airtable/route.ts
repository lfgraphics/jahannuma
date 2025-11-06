import { listAshaarRecords, SORTS } from "@/lib/airtable";
import { ok } from "@/lib/api-response";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    return ok({
      message: "Airtable imports successful",
      constants: { SORTS },
      functions: { listAshaarRecords: typeof listAshaarRecords },
    });
  } catch (error) {
    console.error("Airtable import test error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
