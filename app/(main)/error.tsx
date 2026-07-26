"use client";

import { useEffect } from "react";
import { ErrorMessage } from "@/components/shared/ErrorMessage";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to your monitoring service here if desired.
    console.error(error);
  }, [error]);

  return (
    <div className="py-8">
      <ErrorMessage
        title="This page hit a snag"
        message={error.message || "An unexpected error occurred."}
        onRetry={reset}
      />
    </div>
  );
}
