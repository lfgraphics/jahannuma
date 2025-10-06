import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { mapTableToLikesKey, type LikesMetadata } from "@/lib/user-metadata-utils";
import { getUserLikes, setUserLikes, toggleUserLike } from "@/lib/user-metadata-server";

// Basic in-memory rate limiter: 60 req/min per user
const RATE_LIMIT = 60;
const WINDOW_MS = 60_000;
const buckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(userId: string) {
    const now = Date.now();
    const b = buckets.get(userId);
    if (!b || b.resetAt <= now) {
        buckets.set(userId, { count: 1, resetAt: now + WINDOW_MS });
        return true;
    }
    if (b.count < RATE_LIMIT) {
        b.count += 1;
        return true;
    }
    return false;
}

function cors(resp: NextResponse, req?: Request) {
    const allowList = (process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    let allowOrigin = "";
    try {
        const reqOrigin = req ? (req.headers as any).get?.("origin") as string | null : null;
        if (reqOrigin && allowList.includes(reqOrigin)) {
            allowOrigin = reqOrigin;
        }
    } catch { }

    if (!allowOrigin && allowList.length === 0 && req) {
        try {
            const u = new URL((req as any).url || "");
            allowOrigin = `${u.protocol}//${u.host}`;
        } catch { }
    }
    if (allowOrigin) resp.headers.set("Access-Control-Allow-Origin", allowOrigin);
    resp.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    resp.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    resp.headers.set("Vary", "Origin");
    return resp;
}

export async function OPTIONS(req: Request) {
    return cors(new NextResponse(null, { status: 204 }), req);
}

export async function GET(req: Request) {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        return cors(NextResponse.json({ error: "unauthorized" }, { status: 401 }), req);
    }

    if (!rateLimit(userId)) {
        return cors(NextResponse.json({ error: "rate_limited" }, { status: 429 }), req);
    }

    try {
        // Access likes from session claims if available, fallback to server function
        const likes = sessionClaims?.likes || await getUserLikes();
        return cors(NextResponse.json({ likes }), req);
    } catch (e: any) {
        console.error("GET /api/user/likes error:", e);
        return cors(NextResponse.json({ error: e?.message || "failed" }, { status: 500 }), req);
    }
}

export async function POST(req: Request) {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        return cors(NextResponse.json({ error: "unauthorized" }, { status: 401 }), req);
    }

    if (!rateLimit(userId)) {
        return cors(NextResponse.json({ error: "rate_limited" }, { status: 429 }), req);
    }

    try {
        const body = await req.json().catch(() => ({}));
        const action = String(body?.action || "").toLowerCase();

        if (action === "toggle") {
            const table = mapTableToLikesKey(String(body?.table || ""));
            const recordId = String(body?.recordId || "");
            if (!recordId) {
                return cors(NextResponse.json({ error: "recordId required" }, { status: 400 }), req);
            }
            const res = await toggleUserLike(userId, table, recordId);
            return cors(NextResponse.json(res), req);
        }

        if (action === "merge") {
            const likes = (body?.likes || {}) as LikesMetadata;
            // Use session claims for existing likes if available
            const existing = (sessionClaims?.likes as LikesMetadata) || await getUserLikes();
            const merged: LikesMetadata = {
                books: Array.from(new Set([...(existing.books ?? []), ...(likes.books ?? [])])),
                ashaar: Array.from(new Set([...(existing.ashaar ?? []), ...(likes.ashaar ?? [])])),
                ghazlen: Array.from(new Set([...(existing.ghazlen ?? []), ...(likes.ghazlen ?? [])])),
                nazmen: Array.from(new Set([...(existing.nazmen ?? []), ...(likes.nazmen ?? [])])),
                rubai: Array.from(new Set([...(existing.rubai ?? []), ...(likes.rubai ?? [])])),
                shaer: Array.from(new Set([...(existing.shaer ?? []), ...(likes.shaer ?? [])])),
            };
            await setUserLikes(userId, merged);
            return cors(NextResponse.json({ ok: true }), req);
        }

        return cors(NextResponse.json({ error: "unsupported action" }, { status: 400 }), req);
    } catch (e: any) {
        console.error("POST /api/user/likes error:", e);
        return cors(NextResponse.json({ error: e?.message || "failed" }, { status: 500 }), req);
    }
}