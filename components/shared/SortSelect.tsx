"use client";

import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS, type SortValue } from "@/lib/constants";
import type { Post } from "@/types";

export function SortSelect({
  value,
  onChange,
}: {
  value: SortValue;
  onChange: (v: SortValue) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as SortValue)}>
      <SelectTrigger className="w-[160px]">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Sort" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/** Apply a SortValue to a list of posts (client-side, non-mutating). */
export function applySort(items: Post[], sort: SortValue): Post[] {
  if (sort === "default") return items;
  const copy = [...items];
  copy.sort((a, b) => {
    const cmp = a.title.localeCompare(b.title, undefined, {
      sensitivity: "base",
    });
    return sort === "title_asc" ? cmp : -cmp;
  });
  return copy;
}
