"use client";
import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const paramReturn =
    searchParams.get("returnUrl") ||
    searchParams.get("returnBackUrl") ||
    searchParams.get("redirect_url") ||
    searchParams.get("redirectUrl");

  const fallback =
    typeof window !== "undefined"
      ? window.localStorage.getItem("lastVisited") || "/"
      : "/";

  const dest = paramReturn || fallback;

  return (
    <div className="min-h-[70svh] grid place-items-center p-6">
      <SignUp
        routing="hash"
        afterSignInUrl={dest}
        afterSignUpUrl={dest}
        // Allow switching to sign-in while preserving return
        signInUrl={`/sign-in?returnUrl=${encodeURIComponent(dest)}`}
      />
    </div>
  );
}
