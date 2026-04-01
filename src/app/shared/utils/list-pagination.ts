import { computed, Signal, signal, WritableSignal } from '@angular/core';

export interface ListPaginationState {
  currentPage: WritableSignal<number>;
  totalPages: WritableSignal<number>;
  searchTerm: WritableSignal<string>;
  pages: Signal<number[]>;
  setPage: (page: number) => boolean;
  setSearchTerm: (term: string) => void;
  reset: () => void;
}

export interface ListPaginationOptions {
  windowSize?: number;
}

export function createListPagination(options: ListPaginationOptions = {}): ListPaginationState {
  const windowSize = options.windowSize ?? 3;

  const currentPage = signal(1);
  const totalPages = signal(0);
  const searchTerm = signal('');

  const pages = computed(() => {
    const total = totalPages();
    const current = currentPage();

    if (total === 0) {
      return [];
    }

    let start = current - 1;
    let end = current + 1;

    if (current <= 2) {
      start = 1;
      end = Math.min(windowSize, total);
    }

    if (current >= total - 1) {
      start = Math.max(total - 2, 1);
      end = total;
    }

    const pageNumbers: number[] = [];
    for (let index = start; index <= end; index += 1) {
      pageNumbers.push(index);
    }

    return pageNumbers;
  });

  return {
    currentPage,
    totalPages,
    searchTerm,
    pages,
    setPage: (page: number) => {
      if (page < 1 || page > totalPages() || page === currentPage()) {
        return false;
      }

      currentPage.set(page);
      return true;
    },
    setSearchTerm: (term: string) => {
      searchTerm.set(term.trim());
      currentPage.set(1);
    },
    reset: () => {
      currentPage.set(1);
      totalPages.set(0);
    },
  };
}
