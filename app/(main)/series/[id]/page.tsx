import type { Metadata } from "next";
import { SeriesView } from "@/components/views/SeriesView";

interface Params {
  params: { id: string };
}

export function generateMetadata({ params }: Params): Metadata {
  return {
    title: `Series #${params.id}`,
    description: `Episodes and details for series #${params.id} on RanzzNeko.`,
  };
}

export default function SeriesPage({ params }: Params) {
  return <SeriesView id={decodeURIComponent(params.id)} />;
}
