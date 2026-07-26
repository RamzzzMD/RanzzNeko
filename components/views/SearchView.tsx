"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { ContentSection } from "@/components/shared/ContentSection";
import { SearchBar } from "@/components/search/SearchBar";
import { EmptyState } from "@/components/shared/EmptyState";
import { normalizePage } from "@/lib/utils";

/** Simple debounce hook. */
function useDebounced<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function SearchView() {
  const router = useRouter();
  const params = useSearchParams();
  const urlQuery = params.get("q") ?? "";
  const urlPage = normalizePage(params.get("page"));

  const [term, setTerm] = useState(urlQuery);
  const debouncedTerm = useDebounced(term, 450);

  // Keep local state in sync when the URL changes (e.g. navbar search).
  useEffect(() => setTerm(urlQuery), [urlQuery]);

  // Reflect the debounced term into the URL (page resets to 1 on new term).
  useEffect(() => {
    const trimmed = debouncedTerm.trim();
    if (trimmed === urlQuery) return;
    const qs = new URLSearchParams();
    if (trimmed) qs.set("q", trimmed);
    router.replace(qs.toString() ? `/search?${qs}` : "/search");
  }, [debouncedTerm, urlQuery, router]);

  const query = useQuery({
    queryKey: queryKeys.search(urlQuery, urlPage),
    queryFn: () => api.search(urlQuery, urlPage),
    enabled: urlQuery.trim().length > 0,
    placeholderData: keepPreviousData,
    const MAX_PAGES = 20;
  const pageData = query.data
    ? {
        ...query.data,
        pagination: {
          currentPage: urlPage,
          totalPages: MAX_PAGES,
          hasNext: urlPage < MAX_PAGES && query.data.items.length > 0,
          hasPrev: urlPage > 1,
        },
      }
    : undefined;
  });

  const setPage = useCallback(
    (page: number) => {
      const qs = new URLSearchParams();
      qs.set("q", urlQuery);
      if (page > 1) qs.set("page", String(page));
      router.push(`/search?${qs}`);
      if (typeof window !== "undefined")
        window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, urlQuery]
  );

  return (
    <div>
      <PageHeader
        title="Search"
        subtitle="Find titles across the catalog"
        icon={<SearchIcon className="h-6 w-6 text-primary" />}
      />

      <div className="mb-6 max-w-xl">
        <SearchBar
          initialValue={term}
          autoFocus
          onSubmit={(q) => setTerm(q)}
          placeholder="Search e.g. shoujo ramune…"
        />
      </div>

      {urlQuery.trim().length === 0 ? (
        <EmptyState
          icon={SearchIcon}
          title="Start typing to search"
          description="Search results appear here. Your recent searches are saved locally for quick access."
        />
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">
            Results for{" "}
            <span className="font-medium text-foreground">
              &ldquo;{urlQuery}&rdquo;
            </span>
          </p>
          <ContentSection
            data={pageData}
            isLoading={query.isLoading}
            isError={query.isError}
            error={query.error}
            refetch={query.refetch}
            paginated
            onPageChange={setPage}
            emptyTitle="No matches"
            emptyDescription={`Nothing found for "${urlQuery}". Try another spelling or keyword.`}
          />
        </>
      )}
    </div>
  );
}
