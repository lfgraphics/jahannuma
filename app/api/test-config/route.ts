import { getAirtableConfig } from "@/lib/airtable";
import { errors, ok } from "@/lib/api-response";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing Airtable config...");
    console.log("Environment variables:", {
      AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY ? "Set" : "Not set",
      AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID ? "Set" : "Not set",
    });

    const config = getAirtableConfig("Ashaar");
    console.log("Config retrieved successfully:", {
      apiKey: config.apiKey ? "Set" : "Not set",
      baseId: config.baseId,
    });

    return ok({
      message: "Airtable config successful",
      configExists: true,
      apiKeySet: !!config.apiKey,
      baseIdSet: !!config.baseId,
    });
  } catch (error) {
    console.error("Config test error:", error);
    return errors.internal(
      "Config test failed",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
