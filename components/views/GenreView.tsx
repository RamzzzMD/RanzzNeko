"use client";

import { useQuery } from "@tanstack/react-query";
import { Tag } from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { ContentSection } from "@/components/shared/ContentSection";
import { GenreFilter } from "@/components/filters/GenreFilter";
import { humanize } from "@/lib/utils";

export function GenreView({ genre }: { genre: string }) {
  const query = useQuery({
    queryKey: queryKeys.genre(genre),
    queryFn: () => api.genre(genre),
  });

  return (
    <div>
      <PageHeader
        title={humanize(genre)}
        subtitle="Titles tagged with this genre"
        icon={<Tag className="h-6 w-6 text-primary" />}
      />

      <div className="mb-6 lg:hidden">
        <GenreFilter active={genre} />
      </div>

      <ContentSection
        data={query.data}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        refetch={query.refetch}
        emptyTitle="No titles in this genre"
        emptyDescription="Try browsing a different genre from the filters."
      />
    </div>
  );
}
