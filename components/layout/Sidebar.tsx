"use client";

import { usePathname } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LetterFilter } from "@/components/filters/LetterFilter";
import { TypeFilter } from "@/components/filters/TypeFilter";
import { GenreFilter } from "@/components/filters/GenreFilter";

/** Shared filter body used by both the desktop rail and the mobile sheet. */
function FilterBody() {
  const pathname = usePathname();
  // Attempt to read active letter/type/genre from the pathname.
  const parts = pathname.split("/").filter(Boolean);
  let activeLetter: string | undefined;
  let activeType: string | undefined;
  let activeGenre: string | undefined;
  if (parts[0] === "index") {
    activeLetter = parts[1];
    activeType = parts[2];
  } else if (parts[0] === "genre") {
    activeGenre = parts[1];
  }

  return (
    <div className="space-y-6">
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Type
        </h3>
        <TypeFilter active={activeType} letter={activeLetter ?? "a"} />
      </section>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Browse by letter
        </h3>
        <LetterFilter active={activeLetter} type={activeType ?? "hentai"} />
      </section>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Genres
        </h3>
        <GenreFilter active={activeGenre} />
      </section>
    </div>
  );
}

export function Sidebar({
  variant = "desktop",
}: {
  variant?: "desktop" | "mobile";
}) {
  if (variant === "mobile") {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open filters">
            <SlidersHorizontal className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="p-4 pt-0">
            <FilterBody />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-64 shrink-0 overflow-y-auto pr-2 no-scrollbar lg:block">
      <FilterBody />
    </aside>
  );
}
