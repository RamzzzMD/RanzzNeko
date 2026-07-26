import { Suspense } from "react";
import type { Metadata } from "next";
import { SearchView } from "@/components/views/SearchView";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the RanzzNeko catalog.",
};

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SearchView />
    </Suspense>
  );
}
