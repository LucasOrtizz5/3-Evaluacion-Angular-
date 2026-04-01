import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '../../../../shared/breadcrumb/breadcrumb';
import { LoaderComponent } from '../../../../shared/loader/loader';
import { SearchBarComponent } from '../../../../shared/search-bar/search-bar';
import { Location } from '../../interfaces/location.interface';
import { LocationsService } from '../../services/locations.service';

@Component({
  selector: 'app-locations-page',
  standalone: true,
  imports: [RouterLink, BreadcrumbComponent, LoaderComponent, SearchBarComponent],
  templateUrl: './locations-page.html',
  styleUrl: './locations-page.css'
})
export class LocationsPage implements OnInit {
  private locationsService = inject(LocationsService);

  locations = signal<Location[]>([]);
  visibleLocations = computed(() => this.locations().slice(0, 10));
  isLoading = signal(true);
  hasError = signal(false);

  currentPage = signal(1);
  totalPages = signal(0);
  searchTerm = signal('');

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.locationsService.getLocations(this.currentPage(), this.searchTerm()).subscribe({
      next: (response) => {
        this.locations.set(response.results);
        this.totalPages.set(Math.ceil(response.info.count / 20));
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

  pages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const windowSize = 3;

    if (total === 0) return [];

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

    const pagesArray = [];
    for (let i = start; i <= end; i++) {
      pagesArray.push(i);
    }

    return pagesArray;
  });

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages() || page === this.currentPage()) {
      return;
    }

    this.currentPage.set(page);
    this.loadLocations();
  }

  onSearch(term: string): void {
    this.searchTerm.set(term.trim());
    this.currentPage.set(1);
    this.loadLocations();
  }
}
