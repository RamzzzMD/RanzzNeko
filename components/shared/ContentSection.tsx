"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PostGrid } from "@/components/shared/PostGrid";
import { PostGridSkeleton } from "@/components/cards/PostCardSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { Pagination } from "@/components/shared/Pagination";
import { SortSelect, applySort } from "@/components/shared/SortSelect";
import type { ListResponse } from "@/types";
import type { SortValue } from "@/lib/constants";

interface ContentSectionProps {
  data?: ListResponse;
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  refetch?: () => void;
  hrefBase?: "post" | "series";
  showSort?: boolean;
  paginated?: boolean;
  onPageChange?: (page: number) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  skeletonCount?: number;
}

export function ContentSection({
  data,
  isLoading,
  isError,
  error,
  refetch,
  hrefBase = "post",
  showSort = true,
  paginated = false,
  onPageChange,
  emptyTitle,
  emptyDescription,
  skeletonCount = 12,
}: ContentSectionProps) {
  const [sort, setSort] = useState<SortValue>("default");

  useEffect(() => {
    if (isError && error) {
      const message =
        error instanceof Error ? error.message : "Failed to load content";
      toast.error(message);
    }
  }, [isError, error]);

  const items = useMemo(
    () => applySort(data?.items ?? [], sort),
    [data?.items, sort]
  );

  if (isLoading) return <PostGridSkeleton count={skeletonCount} />;

  if (isError) {
    return (
      <ErrorMessage
        message={
          error instanceof Error
            ? error.message
            : "We couldn't load this content."
        }
        onRetry={refetch}
      />
    );
  }

  if (!items.length) {
    return (
      <EmptyState
        title={emptyTitle ?? "No results"}
        description={
          emptyDescription ?? "Try a different filter, letter, or search term."
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "title" : "titles"}
          {data?.pagination.currentPage
            ? ` · page ${data.pagination.currentPage}`
            : ""}
        </p>
        {showSort && <SortSelect value={sort} onChange={setSort} />}
      </div>

      <PostGrid items={items} hrefBase={hrefBase} />

      {paginated && data && onPageChange && (
        <Pagination
          currentPage={data.pagination.currentPage}
          totalPages={data.pagination.totalPages}
          hasNext={data.pagination.hasNext}
          hasPrev={data.pagination.hasPrev}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
