"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, humanize, shimmer } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import type { Post } from "@/types";

interface PostCardProps {
  post: Post;
  /** Where the card links. Series cards link to /series/:id instead. */
  hrefBase?: "post" | "series";
  index?: number;
}

export function PostCard({ post, hrefBase = "post", index = 0 }: PostCardProps) {
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isFavorite = useAppStore((s) => s.favorites.some((f) => f.id === post.id));

  const href = `/${hrefBase}/${post.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
      className="group relative"
    >
      <Link href={href} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border bg-secondary">
          {post.thumbnail ? (
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              placeholder="blur"
              blurDataURL={shimmer(300, 400)}
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <span className="text-4xl">🐾</span>
            </div>
          )}

          {/* Gradient + title overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 transition-opacity" />

          <div className="absolute inset-x-0 bottom-0 p-3">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white drop-shadow">
              {post.title}
            </h3>
            {post.meta && (
              <p className="mt-1 line-clamp-1 text-xs text-white/70">
                {post.meta}
              </p>
            )}
          </div>

          {post.type && (
            <Badge
              variant="accent"
              className="absolute left-2 top-2 backdrop-blur-md"
            >
              {humanize(post.type)}
            </Badge>
          )}

          {/* Hover play affordance */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg shadow-primary/40">
              <Play className="h-5 w-5 translate-x-0.5 fill-current" />
            </span>
          </div>
        </div>
      </Link>

      <button
        type="button"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        onClick={(e) => {
          e.preventDefault();
          toggleFavorite(post);
        }}
        className={cn(
          "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-colors",
          isFavorite
            ? "bg-primary text-primary-foreground"
            : "bg-black/40 text-white hover:bg-black/60"
        )}
      >
        <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
      </button>
    </motion.div>
  );
}
