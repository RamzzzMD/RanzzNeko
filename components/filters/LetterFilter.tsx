"use client";

import Link from "next/link";
import { LETTERS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LetterFilterProps {
  /** Currently active letter, if any. */
  active?: string;
  /** The type segment to preserve in the link. Defaults to "hentai". */
  type?: string;
}

export function LetterFilter({ active, type = "hentai" }: LetterFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {LETTERS.map((letter) => {
        const isActive = active === letter;
        return (
          <Link
            key={letter}
            href={`/index/${letter}/${type}`}
            className={cn(
              "flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm font-medium uppercase transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-foreground hover:bg-primary/20 hover:text-primary"
            )}
          >
            {letter}
          </Link>
        );
      })}
    </div>
  );
}
