import { computed, signal, Signal } from '@angular/core';

export interface DetailPagination<T> {
  page: ReturnType<typeof signal<number>>;
  visibleItems: Signal<T[]>;
  hasMore: Signal<boolean>;
  showMore: () => void;
  reset: () => void;
}

export function createDetailPagination<T>(items: Signal<T[]>, itemsPerPage: number): DetailPagination<T> {
  const page = signal(1);

  const visibleItems = computed(() => {
    const currentPage = page();
    const start = (currentPage - 1) * itemsPerPage;
    return items().slice(start, start + itemsPerPage);
  });

  const hasMore = computed(() => page() * itemsPerPage < items().length);

  return {
    page,
    visibleItems,
    hasMore,
    showMore: () => page.update(value => value + 1),
    reset: () => page.set(1),
  };
}
