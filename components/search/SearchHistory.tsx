"use client";

import { Clock, Trash2, X } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function SearchHistory({ onPick }: { onPick: (q: string) => void }) {
  const history = useAppStore((s) => s.history);
  const removeHistory = useAppStore((s) => s.removeHistory);
  const clearHistory = useAppStore((s) => s.clearHistory);

  if (history.length === 0) return null;

  return (
    <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-xl">
      <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          Recent searches
        </span>
        <button
          onClick={clearHistory}
          className="flex items-center gap-1 hover:text-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>
      <ul className="max-h-64 overflow-y-auto pb-1">
        {history.map((h) => (
          <li
            key={h.query}
            className="group flex items-center justify-between px-3 py-2 hover:bg-secondary"
          >
            <button
              onClick={() => onPick(h.query)}
              className="flex-1 truncate text-left text-sm"
            >
              {h.query}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeHistory(h.query);
              }}
              aria-label={`Remove ${h.query}`}
              className="ml-2 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
