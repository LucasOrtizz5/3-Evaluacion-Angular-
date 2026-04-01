import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '../../../../shared/ui/components/breadcrumb/breadcrumb';
import { LoaderComponent } from '../../../../shared/ui/components/loader/loader';
import { SearchBarComponent } from '../../../../shared/ui/components/search-bar/search-bar';
import { Location } from '../../interfaces/location.interface';
import { LocationsService } from '../../services/locations.service';
import { PaginationControlsComponent } from '../../../../shared/ui/components/pagination-controls/pagination-controls';
import { createListPagination } from '../../../../shared/utils/list-pagination';

@Component({
  selector: 'app-locations-page',
  standalone: true,
  imports: [RouterLink, BreadcrumbComponent, LoaderComponent, SearchBarComponent, PaginationControlsComponent],
  templateUrl: './locations-page.html',
  styleUrl: './locations-page.css'
})
export class LocationsPage implements OnInit {
  private locationsService = inject(LocationsService);

  locations = signal<Location[]>([]);
  visibleLocations = computed(() => {
    const localPage = this.currentPage();
    const start = ((localPage - 1) % 2) * 10;
    return this.locations().slice(start, start + 10);
  });
  isLoading = signal(true);
  hasError = signal(false);

  private pagination = createListPagination();

  currentPage = this.pagination.currentPage;
  totalPages = this.pagination.totalPages;
  pages = this.pagination.pages;
  apiPage = signal(1);
  searchTerm = this.pagination.searchTerm;

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    const localPage = this.currentPage();
    const apiPage = Math.ceil(localPage / 2);
    this.apiPage.set(apiPage);

    this.locationsService.getLocations(apiPage, this.searchTerm()).subscribe({
      next: (response) => {
        this.locations.set(response.results);
        this.totalPages.set(Math.ceil(response.info.count / 10));
        this.isLoading.set(false);
      },
      error: () => {
        this.locations.set([]);
        this.totalPages.set(0);
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  goToPage(page: number): void {
    if (!this.pagination.setPage(page)) {
      return;
    }
    this.loadLocations();
  }

  onSearch(term: string): void {
    this.pagination.setSearchTerm(term);
    this.loadLocations();
  }
}
