import type { Metadata } from "next";
import { PostDetailView } from "@/components/views/PostDetailView";

interface Params {
  params: { id: string };
}

export function generateMetadata({ params }: Params): Metadata {
  return {
    title: `Title #${params.id}`,
    description: `Details for title #${params.id} on RanzzNeko.`,
  };
}

export default function PostPage({ params }: Params) {
  return <PostDetailView id={decodeURIComponent(params.id)} />;
}
