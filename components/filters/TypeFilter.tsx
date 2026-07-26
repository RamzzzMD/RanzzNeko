"use client";

import Link from "next/link";
import { TYPES, TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface TypeFilterProps {
  active?: string;
  /** The letter segment to preserve in the link. Defaults to "a". */
  letter?: string;
}

export function TypeFilter({ active, letter = "a" }: TypeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {TYPES.map((type) => {
        const isActive = active === type;
        return (
          <Link
            key={type}
            href={`/index/${letter}/${type}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary text-foreground hover:border-primary/50 hover:text-primary"
            )}
          >
            {TYPE_LABELS[type]}
          </Link>
        );
      })}
    </div>
  );
}
