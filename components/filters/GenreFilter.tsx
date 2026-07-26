"use client";

import Link from "next/link";
import { GENRES } from "@/lib/constants";
import { cn, humanize } from "@/lib/utils";

export function GenreFilter({ active }: { active?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {GENRES.map((genre) => {
        const isActive = active === genre;
        return (
          <Link
            key={genre}
            href={`/genre/${genre}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              isActive
                ? "border-accent bg-accent/15 text-accent"
                : "border-border bg-secondary/60 text-muted-foreground hover:border-primary/40 hover:text-primary"
            )}
          >
            {humanize(genre)}
          </Link>
        );
      })}
    </div>
  );
}
