"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/store";
import { SearchHistory } from "@/components/search/SearchHistory";

interface SearchBarProps {
  /** Initial value (used on the /search page). */
  initialValue?: string;
  /** Called on submit — if omitted, navigates to /search?q=... */
  onSubmit?: (query: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
}

export function SearchBar({
  initialValue = "",
  onSubmit,
  autoFocus = false,
  placeholder = "Search titles…",
}: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const addHistory = useAppStore((s) => s.addHistory);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setValue(initialValue), [initialValue]);

  // Close the history dropdown on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(q: string) {
    const query = q.trim();
    if (!query) return;
    addHistory(query);
    setFocused(false);
    if (onSubmit) onSubmit(query);
    else router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className="pl-9 pr-9"
          aria-label="Search"
        />
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            aria-label="Clear"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {focused && (
        <SearchHistory
          onPick={(q) => {
            setValue(q);
            submit(q);
          }}
        />
      )}
    </div>
  );
}
