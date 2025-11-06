import { ok } from "@/lib/api-response";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    return ok({
      message: "Test endpoint working",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    return Response.json({ error: "Test failed" }, { status: 500 });
  }
}
