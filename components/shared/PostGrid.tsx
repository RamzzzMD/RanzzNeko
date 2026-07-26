"use client";

import { PostCard } from "@/components/cards/PostCard";
import type { Post } from "@/types";

interface PostGridProps {
  items: Post[];
  hrefBase?: "post" | "series";
}

export function PostGrid({ items, hrefBase = "post" }: PostGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((post, i) => (
        <PostCard
          key={`${post.id}-${i}`}
          post={post}
          hrefBase={hrefBase}
          index={i}
        />
      ))}
    </div>
  );
}
