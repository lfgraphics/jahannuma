"use client";
import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const paramReturn =
    searchParams.get("returnUrl") ||
    searchParams.get("returnBackUrl") ||
    searchParams.get("redirect_url") ||
    searchParams.get("redirectUrl");

  // Fallbacks: localStorage lastVisited or root
  const fallback =
    typeof window !== "undefined"
      ? window.localStorage.getItem("lastVisited") || "/"
      : "/";

  const dest = paramReturn || fallback;

  return (
    <div className="min-h-[70svh] grid place-items-center p-6">
      <SignIn
        routing="hash"
        afterSignInUrl={dest}
        // If user switches to sign up from here, keep returnUrl
        signUpUrl={`/sign-up?returnUrl=${encodeURIComponent(dest)}`}
        afterSignUpUrl={dest}
      />
    </div>
  );
}
