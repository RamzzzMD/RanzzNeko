"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, Sparkles } from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { ContentSection } from "@/components/shared/ContentSection";
import { RecentlyViewed } from "@/components/shared/RecentlyViewed";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ListResponse } from "@/types";

const PAGE_SIZE = 20; // items per page
const MAX_PAGES = 20; // never show more than 20 pages

export function HomeView() {
  const query = useQuery({
    queryKey: queryKeys.latest,
    queryFn: api.latest,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  const [page, setPage] = useState(1);

  const all = query.data?.items ?? [];
  const totalPages = Math.min(
    MAX_PAGES,
    Math.max(1, Math.ceil(all.length / PAGE_SIZE))
  );

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  // /recent isn't paginated upstream, so we page the flattened list locally.
  const pageData: ListResponse | undefined = query.data
    ? {
        items: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
        pagination: {
          currentPage: page,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      }
    : undefined;

  const goTo = (p: number) => {
    setPage(p);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-accent/10 p-6 sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome to <span className="text-gradient">RanzzNeko</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
          A modern, fast catalog for hentai &amp; JAV. Browse the latest
          releases, filter by letter, type, and genre, and save your favorites.
        </p>
      </div>

      <RecentlyViewed />

      <PageHeader
        title="Latest releases"
        subtitle="Freshly added to the catalog"
        icon={<Sparkles className="h-6 w-6 text-primary" />}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setPage(1);
            query.refetch();
          }}
          disabled={query.isFetching}
          aria-label="Refresh latest"
        >
          <RefreshCw
            className={cn("h-4 w-4", query.isFetching && "animate-spin")}
          />
          {query.isFetching ? "Refreshing…" : "Refresh"}
        </Button>
      </PageHeader>

      <ContentSection
        data={pageData}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        refetch={query.refetch}
        paginated
        onPageChange={goTo}
        emptyTitle="No recent releases"
        emptyDescription="Check back soon for new additions."
      />
    </div>
  );
}
