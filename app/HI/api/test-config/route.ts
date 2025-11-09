import { errors, ok } from "@/lib/api-response";
import { getAirtableConfig } from "@/src/lib/airtable/airtable-client";
import { BASE_IDS, validateAllBaseIds } from "@/src/lib/airtable/airtable-constants";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("Testing Airtable config...");
    console.log("Environment variables:", {
      AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY ? "Set" : "Not set",
      NEXT_PUBLIC_Api_Token: process.env.NEXT_PUBLIC_Api_Token ? "Set" : "Not set",
    });

    // Test centralized base ID validation
    const baseIdValidation = validateAllBaseIds();
    console.log("Base ID validation:", baseIdValidation);

    // Test config for different content types
    const ashaarConfig = getAirtableConfig("Ashaar");
    const ghazlenConfig = getAirtableConfig("Ghazlen");
    const alertsConfig = getAirtableConfig("Alerts");

    console.log("Configs retrieved successfully:", {
      ashaar: { apiKey: !!ashaarConfig.apiKey, baseId: ashaarConfig.baseId },
      ghazlen: { apiKey: !!ghazlenConfig.apiKey, baseId: ghazlenConfig.baseId },
      alerts: { apiKey: !!alertsConfig.apiKey, baseId: alertsConfig.baseId },
    });

    return ok({
      message: "Airtable config successful",
      configExists: true,
      apiKeySet: !!ashaarConfig.apiKey,
      baseIdValidation,
      baseIds: {
        ashaar: ashaarConfig.baseId,
        ghazlen: ghazlenConfig.baseId,
        alerts: alertsConfig.baseId,
        totalConfigured: Object.keys(BASE_IDS).length
      },
    });
  } catch (error) {
    console.error("Config test error:", error);
    return errors.internal(
      "Config test failed",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}
