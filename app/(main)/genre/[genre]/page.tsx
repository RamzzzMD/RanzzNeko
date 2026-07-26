import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GenreView } from "@/components/views/GenreView";
import { GENRES, BLOCKED_GENRES } from "@/lib/constants";
import { humanize } from "@/lib/utils";

interface Params {
  params: { genre: string };
}

export function generateMetadata({ params }: Params): Metadata {
  const genre = decodeURIComponent(params.genre);
  return {
    title: `${humanize(genre)} genre`,
    description: `Browse ${humanize(genre)} titles on RanzzNeko.`,
  };
}

export default function GenrePage({ params }: Params) {
  const genre = decodeURIComponent(params.genre);

  // Enforce the legal block + valid-genre check at the route boundary too.
  if (
    BLOCKED_GENRES.includes(genre as (typeof BLOCKED_GENRES)[number]) ||
    !GENRES.includes(genre as (typeof GENRES)[number])
  ) {
    notFound();
  }

  return <GenreView genre={genre} />;
}
