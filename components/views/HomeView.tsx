"use client";

import { useQuery } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { ContentSection } from "@/components/shared/ContentSection";
import { RecentlyViewed } from "@/components/shared/RecentlyViewed";

export function HomeView() {
  const query = useQuery({
    queryKey: queryKeys.latest,
    queryFn: api.latest,
  });

  return (
    <div>
      {/* Hero */}
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
      />

      <ContentSection
        data={query.data}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        refetch={query.refetch}
        emptyTitle="No recent releases"
        emptyDescription="Check back soon for new additions."
      />
    </div>
  );
}
