"use client";

import { useEffect, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { PageHeader } from "@/components/shared/PageHeader";
import { PostGrid } from "@/components/shared/PostGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";

export function FavoritesView() {
  const favorites = useAppStore((s) => s.favorites);
  const clearFavorites = useAppStore((s) => s.clearFavorites);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div>
      <PageHeader
        title="Favorites"
        subtitle="Titles you've saved (stored on this device)"
        icon={<Heart className="h-6 w-6 text-primary" />}
      >
        {mounted && favorites.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearFavorites}>
            <Trash2 className="h-4 w-4" />
            Clear all
          </Button>
        )}
      </PageHeader>

      {!mounted ? null : favorites.length > 0 ? (
        <PostGrid items={favorites} hrefBase="post" />
      ) : (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Tap the heart on any title to save it here. Favorites are stored locally in your browser."
          actionLabel="Browse latest"
          actionHref="/"
        />
      )}
    </div>
  );
}
