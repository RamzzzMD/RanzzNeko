"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages?: number | null;
  hasNext: boolean;
  hasPrev: boolean;
  onPageChange: (page: number) => void;
}

/** Build a compact page-number window when totalPages is known. */
function pageWindow(current: number, total: number): (number | "…")[] {
  const pages: (number | "…")[] = [];
  const add = (p: number) => pages.push(p);
  const around = 1;

  add(1);
  const start = Math.max(2, current - around);
  const end = Math.min(total - 1, current + around);
  if (start > 2) pages.push("…");
  for (let p = start; p <= end; p++) add(p);
  if (end < total - 1) pages.push("…");
  if (total > 1) add(total);
  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  hasNext,
  hasPrev,
  onPageChange,
}: PaginationProps) {
  if (!hasNext && !hasPrev) return null;

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPrev}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>

      {totalPages && totalPages > 1 ? (
        <div className="flex items-center gap-1">
          {pageWindow(currentPage, totalPages).map((p, i) =>
            p === "…" ? (
              <span
                key={`e${i}`}
                className="px-2 text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={cn(
                  "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors",
                  p === currentPage
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground hover:bg-secondary/70"
                )}
              >
                {p}
              </button>
            )
          )}
        </div>
      ) : (
        <span className="rounded-md bg-secondary px-3 py-1.5 text-sm font-medium">
          Page {currentPage}
        </span>
      )}

      <Button
        variant="outline"
        size="sm"
        disabled={!hasNext}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
