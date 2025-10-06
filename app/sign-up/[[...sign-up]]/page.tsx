"use client";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-[70svh] grid place-items-center p-6">
      <SignUp routing="hash" />
    </div>
  );
}
