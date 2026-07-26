"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clapperboard,
  Clock,
  Download,
  Heart,
  Layers,
  Tag,
} from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import { useAppStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/shared/ErrorMessage";
import { cn, humanize, orDash, shimmer } from "@/lib/utils";
import type { PostDetail } from "@/types";

export function PostDetailView({ id }: { id: string }) {
  const query = useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => api.detail(id),
  });

  const post = query.data;
  const addRecent = useAppStore((s) => s.addRecent);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const isFavorite = useAppStore((s) =>
    post ? s.favorites.some((f) => f.id === post.id) : false
  );

  // Record in "recently viewed" once loaded.
  useEffect(() => {
    if (post?.id) {
      addRecent({
        id: post.id,
        title: post.title,
        thumbnail: post.thumbnail,
        type: post.type,
      });
    }
  }, [post?.id, post?.title, post?.thumbnail, post?.type, addRecent]);

  if (query.isLoading) return <DetailSkeleton />;

  if (query.isError || !post) {
    return (
      <ErrorMessage
        title="Couldn't load this title"
        message={
          query.error instanceof Error
            ? query.error.message
            : "The post could not be found."
        }
        onRetry={query.refetch}
      />
    );
  }

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        {/* Poster */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mx-auto aspect-[3/4] w-full max-w-[280px] overflow-hidden rounded-2xl border border-border bg-secondary"
        >
          {post.thumbnail ? (
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              sizes="280px"
              placeholder="blur"
              blurDataURL={shimmer(280, 373)}
              className="object-cover"
              unoptimized
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">
              🐾
            </div>
          )}
        </motion.div>

        {/* Info */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            {post.type && <Badge variant="accent">{humanize(post.type)}</Badge>}
            {post.meta && <Badge variant="secondary">{post.meta}</Badge>}
          </div>

          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            {post.title}
          </h1>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              onClick={() => toggleFavorite(post)}
              variant={isFavorite ? "default" : "outline"}
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
              {isFavorite ? "Saved" : "Save"}
            </Button>
            {post.seriesId && (
              <Button asChild variant="secondary">
                <Link href={`/series/${post.seriesId}`}>
                  <Layers className="h-4 w-4" />
                  View series
                </Link>
              </Button>
            )}
          </div>

          {/* Meta grid */}
          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-border bg-card/50 p-4 text-sm sm:grid-cols-3">
            <MetaItem icon={Calendar} label="Released" value={orDash(post.released)} />
            <MetaItem icon={Clock} label="Duration" value={orDash(post.duration)} />
            <MetaItem
              icon={Clapperboard}
              label="Type"
              value={post.type ? humanize(post.type) : "—"}
            />
          </dl>

          {post.description && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Synopsis
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                {post.description}
              </p>
            </div>
          )}

          {post.genres.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Tag className="h-4 w-4" />
                Genres
              </h2>
              <div className="flex flex-wrap gap-2">
                {post.genres.map((g) => (
                  <Link key={g} href={`/genre/${g}`}>
                    <Badge variant="outline" className="hover:border-primary">
                      {humanize(g)}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Screenshots */}
      {post.screenshots.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">Screenshots</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {post.screenshots.map((src, i) => (
              <div
                key={i}
                className="relative aspect-video overflow-hidden rounded-lg border border-border bg-secondary"
              >
                <Image
                  src={src}
                  alt={`${post.title} screenshot ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 33vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Streaming embeds */}
      {post.players.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">Watch</h2>
          <div className="flex flex-wrap gap-2">
            {post.players.map((p, i) => (
              <Button key={i} asChild variant="secondary" size="sm">
                <a href={p.url ?? "#"} target="_blank" rel="noopener noreferrer">
                  <Clapperboard className="h-4 w-4" />
                  {p.label ? humanize(p.label) : `Player ${i + 1}`}
                </a>
              </Button>
            ))}
          </div>
        </section>
      )}

      {/* Download links */}
      {post.downloads && post.downloads.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Download className="h-5 w-5 text-primary" />
            Download
          </h2>
          <div className="space-y-4">
            {groupByQuality(post.downloads).map((group) => (
              <div key={group.quality} className="rounded-xl border border-border bg-card/50 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="accent">{group.quality}</Badge>
                  {post.type && <Badge variant="secondary">{humanize(post.type)}</Badge>}
                  {post.duration && (
                    <span className="text-xs text-muted-foreground">{post.duration}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {group.links.map((d, i) => (
                    <Button key={i} asChild variant="outline" size="sm">
                      <a href={d.url ?? "#"} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                        {d.provider ? humanize(d.provider) : `Link ${i + 1}`}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

{/* Download — one block per episode, each grouped by quality. */}
      {post.episodes.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Download className="h-5 w-5 text-primary" />
            Download
            <span className="text-sm font-normal text-muted-foreground">
              ({post.episodes.length}{" "}
              {post.episodes.length === 1 ? "episode" : "episodes"})
            </span>
          </h2>

          <div className="space-y-3">
            {post.episodes.map((ep, idx) => (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-border bg-card/50"
              >
                <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-secondary/40 px-4 py-2.5">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-xs text-primary">
                      {idx + 1}
                    </span>
                    {ep.title ?? `Episode ${idx + 1}`}
                  </h3>
                  {post.type && (
                    <Badge variant="secondary">{humanize(post.type)}</Badge>
                  )}
                </div>

                <div className="space-y-3 p-4">
                  {groupByQuality(ep.downloads).map((group) => (
                    <div key={group.quality}>
                      <div className="mb-2">
                        <Badge variant="accent">{group.quality}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.links.map((d, i) => (
                          <Button key={i} asChild variant="outline" size="sm">
                            <a href={d.url ?? "#"} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4" />
                              {d.provider ? humanize(d.provider) : `Link ${i + 1}`}
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
      
/** Group download links by their quality label for a tidy layout. */
function groupByQuality(
  downloads: PostDetail["downloads"]
): { quality: string; links: PostDetail["downloads"] }[] {
  if (!downloads) return [];
  const map = new Map<string, PostDetail["downloads"]>();
  for (const d of downloads) {
    const q = d.quality?.trim() || "Download";
    if (!map.has(q)) map.set(q, []);
    map.get(q)!.push(d);
  }
  return Array.from(map.entries()).map(([quality, links]) => ({ quality, links }));
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="truncate font-medium">{value}</dd>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      <Skeleton className="mx-auto aspect-[3/4] w-full max-w-[280px] rounded-2xl" />
      <div className="space-y-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-9 w-3/4 rounded" />
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded" />
      </div>
    </div>
  );
}
