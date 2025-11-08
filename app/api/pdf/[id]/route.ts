import { GoogleAuth } from "google-auth-library";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const range = request.headers.get("range"); // <-- detect range
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT!);

    const auth = new GoogleAuth({
      credentials: serviceAccount,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const client = await auth.getClient();
    const token = await client.getAccessToken();

    // Build base fetch URL
    const driveUrl = `https://www.googleapis.com/drive/v3/files/${id}?alt=media`;

    const driveRes = await fetch(driveUrl, {
      headers: {
        Authorization: `Bearer ${token.token}`,
        ...(range ? { Range: range } : {}), // <-- forward range header
      },
    });

    if (!driveRes.ok && driveRes.status !== 206) {
      return NextResponse.json(
        { error: driveRes.statusText },
        { status: driveRes.status }
      );
    }

    const headers = new Headers(driveRes.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Cache-Control", "public, max-age=86400, s-maxage=86400",)
    headers.delete("transfer-encoding"); // avoid streaming quirks

    return new NextResponse(driveRes.body, {
      status: driveRes.status,
      headers,
    });
  } catch (err) {
    console.error("Error in Google Drive proxy:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
