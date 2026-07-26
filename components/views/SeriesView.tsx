"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Layers, Tag } from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PostGrid } from "@/components/shared/PostGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { humanize, shimmer } from "@/lib/utils";

export function SeriesView({ id }: { id: string }) {
  const query = useQuery({
    queryKey: queryKeys.series(id),
    queryFn: () => api.series(id),
  });

  if (query.isLoading) return <SeriesSkeleton />;

  if (query.isError || !query.data) {
    return (
      <ErrorMessage
        title="Couldn't load this series"
        message={
          query.error instanceof Error
            ? query.error.message
            : "The series could not be found."
        }
        onRetry={query.refetch}
      />
    );
  }

  const series = query.data;

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>

      <div className="flex flex-col gap-6 sm:flex-row">
        {series.thumbnail && (
          <div className="relative aspect-[3/4] w-full max-w-[200px] shrink-0 overflow-hidden rounded-2xl border border-border bg-secondary">
            <Image
              src={series.thumbnail}
              alt={series.title}
              fill
              sizes="200px"
              placeholder="blur"
              blurDataURL={shimmer(200, 267)}
              className="object-cover"
              unoptimized
              priority
            />
          </div>
        )}
        <div className="min-w-0">
          <Badge variant="accent" className="mb-2">
            <Layers className="mr-1 h-3.5 w-3.5" />
            Series
          </Badge>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {series.title}
          </h1>
          {series.description && (
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/90">
              {series.description}
            </p>
          )}
          {series.genres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {series.genres.map((g) => (
                <Link key={g} href={`/genre/${g}`}>
                  <Badge variant="outline" className="hover:border-primary">
                    <Tag className="mr-1 h-3 w-3" />
                    {humanize(g)}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">
          Episodes{" "}
          <span className="text-sm font-normal text-muted-foreground">
            ({series.episodes.length})
          </span>
        </h2>
        {series.episodes.length > 0 ? (
          <PostGrid items={series.episodes} hrefBase="post" />
        ) : (
          <EmptyState
            title="No episodes listed"
            description="This series doesn't have any episodes available yet."
          />
        )}
      </section>
    </div>
  );
}

function SeriesSkeleton() {
  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row">
        <Skeleton className="aspect-[3/4] w-full max-w-[200px] rounded-2xl" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-9 w-2/3 rounded" />
          <Skeleton className="h-20 w-full rounded" />
        </div>
      </div>
      <Skeleton className="mt-10 h-6 w-32 rounded" />
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
        ))}
      </div>
    </div>
  );
}
