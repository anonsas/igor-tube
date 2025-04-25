"use client";

import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { SEARCH_PARAMS } from "@/constants";
import { FilterCarousel } from "@/components/filter-carousel";

interface Props {
  categoryId?: string;
}

export function CategoriesSection({ categoryId }: Props) {
  return (
    <ErrorBoundary fallback={<p>Error: something went wrong</p>}>
      <Suspense fallback={<FilterCarousel isLoading data={[]} onSelect={() => {}} />}>
        <CategoriesSectionSuspense categoryId={categoryId} />
      </Suspense>
    </ErrorBoundary>
  );
}

export function CategoriesSectionSuspense({ categoryId }: Props) {
  const [categories] = trpc.categories.getMany.useSuspenseQuery();
  const router = useRouter();

  const data = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  const onSelect = (value: string | null) => {
    const url = new URL(window.location.href);

    value ? url.searchParams.set(SEARCH_PARAMS.CATEGORY_ID, value) : url.searchParams.delete(SEARCH_PARAMS.CATEGORY_ID);
    router.push(url.toString());
  };

  return <FilterCarousel value={categoryId} isLoading={false} onSelect={onSelect} data={data} />;
}
