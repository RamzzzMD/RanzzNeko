"use client";

import { PostCard } from "@/components/cards/PostCard";
import type { Post } from "@/types";

/** A series entry uses the same visual card but links to the series route. */
export function SeriesCard({ post, index }: { post: Post; index?: number }) {
  return <PostCard post={post} hrefBase="series" index={index} />;
}
