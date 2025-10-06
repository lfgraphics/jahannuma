import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
    "/Favorites(.*)",
    "/EN/Favorites(.*)",
    "/HI/Favorites(.*)",
]);

// Configure Clerk authorized parties (origins) from env; fallback to localhost
const authorizedParties = (process.env.NEXT_PUBLIC_ALLOWED_ORIGINS || "http://localhost:3000,https://localhost:3000,https://www.jahan-numa.org")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export default clerkMiddleware(async (auth, req) => {
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

    // Normalize any favorites segment to capitalized 'Favorites'
    for (let i = 0; i < segments.length; i++) {
        if (segments[i].toLowerCase() === "favorites") {
            if (segments[i] !== "Favorites") { segments[i] = "Favorites"; changed = true; }
        }
    }

    if (changed) {
        url.pathname = "/" + segments.join("/");
        return Response.redirect(url.toString(), 308);
    }

    // Auth protect canonical Favorites paths (including nested)
    if (isProtectedRoute(req)) {
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
