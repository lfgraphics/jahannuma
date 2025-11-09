import { auth } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import {
  getUserLikes,
  refreshUserLikes,
  setUserLikes,
  toggleUserLike,
} from "../../../../../lib/user-metadata-server";
import {
  mapTableToLikesKey,
  mergeLikesMetadata,
  validateLikesMetadata,
  type LikesMetadata,
} from "../../../../../lib/user-metadata-utils";

// Basic in-memory rate limiter: requests per minute per user
// Consider that GET without fresh=true may read from claims and is cheaper; POST should have headroom
const RATE_LIMIT_GET = 120; // allow higher GET rate
const RATE_LIMIT_POST = 60; // default 60 rpm for mutations
const WINDOW_MS = 60_000;
const buckets = new Map<string, { count: number; resetAt: number }>();

function cleanupBuckets(now: number) {
  for (const [k, v] of buckets) {
    if (!v || v.resetAt <= now) buckets.delete(k);
  }
}

function rateLimit(userId: string, limit: number) {
  const now = Date.now();
  cleanupBuckets(now);
  const b = buckets.get(userId);
  if (!b || b.resetAt <= now) {
    buckets.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (b.count < limit) {
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
    const reqOrigin = req
      ? ((req.headers as any).get?.("origin") as string | null)
      : null;
    if (reqOrigin && allowList.includes(reqOrigin)) {
      allowOrigin = reqOrigin;
    }
  } catch { }

  // When no allowlist is configured, do not reflect arbitrary origins; default to no AC-Allow-Origin header
  if (allowOrigin) resp.headers.set("Access-Control-Allow-Origin", allowOrigin);
  resp.headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  resp.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  resp.headers.set("Vary", "Origin");
  return resp;
}

export async function OPTIONS(req: Request) {
  return cors(new NextResponse(null, { status: 204 }), req);
}

export async function GET(req: Request) {
  const requestId = randomUUID();
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return cors(
      NextResponse.json({ error: "unauthorized" }, { status: 401 }),
      req
    );
  }

  // GETs are cheaper; allow higher limit
  if (!rateLimit(userId, RATE_LIMIT_GET)) {
    return cors(
      NextResponse.json({ error: "rate_limited" }, { status: 429 }),
      req
    );
  }

  try {
    const url = new URL(req.url);
    const fresh = url.searchParams.get("fresh") === "true";
    // Note: When fresh=false, results may reflect session claims and could be slightly stale.
    // Use fresh=true for strong consistency after toggles.
    const rawLikes: LikesMetadata = fresh
      ? await refreshUserLikes(userId)
      : await getUserLikes();
    const likes = validateLikesMetadata(rawLikes);
    const resp = NextResponse.json({ likes, timestamp: Date.now() });
    resp.headers.set("X-Request-Id", requestId);
    return cors(resp, req);
  } catch (e: any) {
    console.error("GET /api/user/likes error:", { error: e, requestId });
    const resp = NextResponse.json(
      { error: e?.message || "failed", requestId },
      { status: 500 }
    );
    resp.headers.set("X-Request-Id", requestId);
    return cors(resp, req);
  }
}

export async function POST(req: Request) {
  const requestId = randomUUID();
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return cors(
      NextResponse.json({ error: "unauthorized" }, { status: 401 }),
      req
    );
  }

  if (!rateLimit(userId, RATE_LIMIT_POST)) {
    return cors(
      NextResponse.json({ error: "rate_limited" }, { status: 429 }),
      req
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "").toLowerCase();

    if (action === "toggle") {
      let table: any;
      try {
        table = mapTableToLikesKey(String(body?.table || ""), { strict: true });
      } catch (e: any) {
        const resp = NextResponse.json(
          { error: "invalid table", code: "INVALID_TABLE", requestId },
          { status: 400 }
        );
        resp.headers.set("X-Request-Id", requestId);
        return cors(resp, req);
      }
      const recordId = String(body?.recordId || "");
      if (!recordId) {
        const resp = NextResponse.json(
          { error: "recordId required", code: "MISSING_RECORD_ID", requestId },
          { status: 400 }
        );
        resp.headers.set("X-Request-Id", requestId);
        return cors(resp, req);
      }
      try {
        const res = await toggleUserLike(userId, table, recordId);
        const likes: LikesMetadata =
          res?.likes ?? (await refreshUserLikes(userId));
        const payload = {
          liked: !!res?.liked,
          count:
            res?.count ??
            (Array.isArray((likes as any)[table])
              ? (likes as any)[table].length
              : 0),
          likes,
        };
        const resp = NextResponse.json({ ...payload, requestId });
        resp.headers.set("X-Likes-Updated", "true");
        resp.headers.set("X-Request-Id", requestId);
        return cors(resp, req);
      } catch (e: any) {
        const code = e?.code || "TOGGLE_FAILED";
        const status =
          code === "CONCURRENT_UPDATE"
            ? 409
            : code === "INVALID_TABLE" ||
              code === "MISSING_RECORD_ID" ||
              code === "INVALID_USER_ID"
              ? 400
              : 500;
        const resp = NextResponse.json(
          { error: e?.message || String(code), code, requestId },
          { status }
        );
        resp.headers.set("X-Request-Id", requestId);
        return cors(resp, req);
      }
    }

    if (action === "merge") {
      const likes = (body?.likes || {}) as LikesMetadata;
      // Always merge against fresh server state
      const existing = await refreshUserLikes(userId);
      const merged: LikesMetadata = mergeLikesMetadata(existing, likes);
      await setUserLikes(userId, merged);
      const confirmed = await refreshUserLikes(userId);
      const resp = NextResponse.json({ ok: true, likes: confirmed, requestId });
      resp.headers.set("X-Request-Id", requestId);
      return cors(resp, req);
    }

    const resp = NextResponse.json(
      { error: "unsupported action", requestId },
      { status: 400 }
    );
    resp.headers.set("X-Request-Id", requestId);
    return cors(resp, req);
  } catch (e: any) {
    console.error("POST /api/user/likes error:", { error: e, requestId });
    const resp = NextResponse.json(
      { error: e?.message || "failed", requestId },
      { status: 500 }
    );
    resp.headers.set("X-Request-Id", requestId);
    return cors(resp, req);
  }
}
