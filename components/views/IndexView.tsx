"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { LayoutGrid } from "lucide-react";
import { api, queryKeys } from "@/lib/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { ContentSection } from "@/components/shared/ContentSection";
import { LetterFilter } from "@/components/filters/LetterFilter";
import { TypeFilter } from "@/components/filters/TypeFilter";
import { TYPE_LABELS, type ContentType } from "@/lib/constants";
import { humanize, normalizePage } from "@/lib/utils";

export function IndexView({
  letter,
  type,
}: {
  letter: string;
  type: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const page = normalizePage(params.get("page"));

  const query = useQuery({
    queryKey: queryKeys.indeks(letter, type, page),
    queryFn: () => api.indeks(letter, type, page),
    placeholderData: keepPreviousData,
  });

  const setPage = useCallback(
    (p: number) => {
      const qs = p > 1 ? `?page=${p}` : "";
      router.push(`/index/${letter}/${type}${qs}`);
      if (typeof window !== "undefined")
        window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, letter, type]
  );

  const typeLabel =
    TYPE_LABELS[type as ContentType] ?? humanize(type);

  return (
    <div>
      <PageHeader
        title="Browse"
        subtitle={`${typeLabel} · titles starting with “${letter.toUpperCase()}”`}
        icon={<LayoutGrid className="h-6 w-6 text-primary" />}
      />

      {/* Filters (visible above the grid; sidebar duplicates on desktop) */}
      <div className="mb-6 space-y-4 lg:hidden">
        <TypeFilter active={type} letter={letter} />
        <LetterFilter active={letter} type={type} />
      </div>

      <ContentSection
        data={query.data}
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        refetch={query.refetch}
        paginated
        onPageChange={setPage}
        emptyTitle="No titles here"
        emptyDescription={`No ${typeLabel} titles starting with “${letter.toUpperCase()}”. Try another letter or type.`}
      />
    </div>
  );
}
