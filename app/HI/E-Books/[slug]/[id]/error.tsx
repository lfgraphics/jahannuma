"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("E-Books page error:", error);
  }, [error]);

  return (
    <div dir="ltr" className="flex flex-col min-h-screen w-screen">
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="text-center space-y-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-900">
            कुछ गलत हुआ!
          </h2>
          <p className="text-gray-600 max-w-md">
            इस पुस्तक को लोड करते समय हमें एक त्रुटि का सामना करना पड़ा। कृपया पुनः प्रयास करें या यदि समस्या बनी रहती है तो सहायता से संपर्क करें।
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={reset}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              पुनः प्रयास करें
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              वापस जाएं
            </Button>
          </div>
          {error.digest && (
            <p className="text-xs text-gray-400 mt-4">
              त्रुटि ID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}