import { PostGridSkeleton } from "@/components/cards/PostCardSkeleton";

export default function Loading() {
  return (
    <div>
      <div className="mb-6 h-9 w-48 animate-pulse rounded bg-secondary/60" />
      <PostGridSkeleton />
    </div>
  );
}
