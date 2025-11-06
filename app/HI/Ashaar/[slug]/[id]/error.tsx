"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <h2 className="text-xl font-semibold mb-4">कुछ गलत हुआ!</h2>
      <p className="text-gray-600 mb-4 text-center">
        कविता रिकॉर्ड लोड करने में असमर्थ। कृपया पुनः प्रयास करें।
      </p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-[#984A02] text-white rounded-md hover:bg-[#7a3a02] transition-colors"
      >
        पुनः प्रयास करें
      </button>
    </div>
  );
}