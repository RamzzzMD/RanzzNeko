"use client";

import { useEffect, useState } from "react";
import { History, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAppStore } from "@/lib/store";
import { shimmer } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function RecentlyViewed() {
  const recent = useAppStore((s) => s.recent);
  const clearRecent = useAppStore((s) => s.clearRecent);
  // Avoid hydration mismatch: only render after mount (localStorage-backed).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || recent.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <History className="h-5 w-5 text-primary" />
          Recently viewed
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearRecent}
          className="text-muted-foreground"
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
      </div>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
        {recent.map((item) => (
          <Link
            key={item.id}
            href={`/post/${item.id}`}
            className="group w-28 shrink-0"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg border border-border bg-secondary">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  sizes="112px"
                  placeholder="blur"
                  blurDataURL={shimmer(112, 150)}
                  className="object-cover transition-transform group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl">
                  🐾
                </div>
              )}
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground group-hover:text-foreground">
              {item.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
