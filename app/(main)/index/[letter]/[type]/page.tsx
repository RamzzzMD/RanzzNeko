import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IndexView } from "@/components/views/IndexView";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { LETTERS, TYPES, TYPE_LABELS, type ContentType } from "@/lib/constants";

interface Params {
  params: { letter: string; type: string };
}

export function generateMetadata({ params }: Params): Metadata {
  const label = TYPE_LABELS[params.type as ContentType] ?? params.type;
  return {
    title: `${label} · ${params.letter.toUpperCase()}`,
    description: `Browse ${label} titles starting with ${params.letter.toUpperCase()} on RanzzNeko.`,
  };
}

export default function IndexPage({ params }: Params) {
  const letter = decodeURIComponent(params.letter);
  const type = decodeURIComponent(params.type);

  if (!LETTERS.includes(letter as any) || !TYPES.includes(type as any)) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <IndexView letter={letter} type={type} />
    </Suspense>
  );
}
