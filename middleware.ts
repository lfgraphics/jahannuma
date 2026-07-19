import { normalizeContentRouteSegment } from "@/lib/content-route-segments";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple path-based protected route check
const isProtectedPath = (pathname: string) => {
    return (
        pathname.startsWith("/Favorites") ||
        pathname.startsWith("/EN/Favorites") ||
        pathname.startsWith("/HI/Favorites")
    );
};

// Configure Clerk authorized parties (origins) from env; fallback to localhost
const authorizedParties = (process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || "http://localhost:3000,https://localhost:3000,https://www.jahan-numa.org,https://jahan-numa.org,https://jhbeta.vercel.app")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export default clerkMiddleware(async (auth: () => any, req: NextRequest) => {
    const url = new URL(req.url);
    const path = url.pathname;
    const segments = path.split("/").filter(Boolean); // [seg1, seg2, ...]
    let changed = false;

    // Normalize language prefix casing for EN/HI; UR has no prefix in this app
    if (segments.length >= 1) {
        const first = segments[0];
        if (first.toLowerCase() === "en") {
            if (first !== "EN") { segments[0] = "EN"; changed = true; }
        } else if (first.toLowerCase() === "hi") {
            if (first !== "HI") { segments[0] = "HI"; changed = true; }
        }
    }

    // Normalize only the page section segment, e.g. /EBooks -> /E-Books
    const contentSegmentIndex = segments[0] === "EN" || segments[0] === "HI" ? 1 : 0;
    const normalizedContentSegment = segments[contentSegmentIndex]
        ? normalizeContentRouteSegment(segments[contentSegmentIndex])
        : null;
    if (normalizedContentSegment && segments[contentSegmentIndex] !== normalizedContentSegment) {
        segments[contentSegmentIndex] = normalizedContentSegment;
        changed = true;
    }

    // Normalize any favorites segment to capitalized 'Favorites'
    for (let i = 0; i < segments.length; i++) {
        if (segments[i].toLowerCase() === "favorites") {
            if (segments[i] !== "Favorites") { segments[i] = "Favorites"; changed = true; }
        }
    }

    if (changed) {
        url.pathname = "/" + segments.join("/");
        return NextResponse.redirect(url, 308);
    }

    // Auth protect canonical Favorites paths (including nested)
    if (isProtectedPath(url.pathname)) {
        const { userId, redirectToSignIn } = (await auth()) as any;
        if (!userId) {
            return redirectToSignIn({ returnBackUrl: req.url });
        }
    }
}, { authorizedParties });

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
