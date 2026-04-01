import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { BreadcrumbComponent } from '../../../../shared/ui/components/breadcrumb/breadcrumb';
import { LoaderComponent } from '../../../../shared/ui/components/loader/loader';
import { createDetailPagination } from '../../../../shared/utils/detail-pagination';
import { StatusColorPipe } from '../../../../shared/pipes/status-color-pipe';
import { Location, LocationResident } from '../../interfaces/location.interface';
import { LocationsService } from '../../services/locations.service';
import { DetailMoreListComponent } from '../../../../shared/ui/components/detail-more-list/detail-more-list';

@Component({
  selector: 'app-location-detail-page',
  standalone: true,
  imports: [RouterLink, NgClass, BreadcrumbComponent, LoaderComponent, StatusColorPipe, DetailMoreListComponent],
  templateUrl: './location-detail-page.html',
  styleUrl: './location-detail-page.css'
})
export class LocationDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private locationsService = inject(LocationsService);

  location = signal<Location | null>(null);
  residents = signal<LocationResident[]>([]);
  private residentsPagination = createDetailPagination(this.residents, 5);
  visibleResidents = this.residentsPagination.visibleItems;
  hasMoreResidents = this.residentsPagination.hasMore;

  isLoading = signal(true);
  hasError = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.hasError.set(true);
      this.isLoading.set(false);
      return;
    }

    this.locationsService.getLocationById(+id).subscribe({
      next: (location) => {
        this.location.set(location);
        this.loadResidents(location.residents || []);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  private loadResidents(residentUrls: string[]): void {
    if (!residentUrls.length) {
      this.residents.set([]);
      this.isLoading.set(false);
      return;
    }

    const ids = residentUrls
      .map(url => url.split('/').pop())
      .filter((value): value is string => !!value)
      .join(',');

    this.locationsService.getResidentsByIds(ids).subscribe({
      next: (residents) => {
        this.residents.set(Array.isArray(residents) ? residents : [residents]);
        this.residentsPagination.reset();
        this.isLoading.set(false);
      },
      error: () => {
        this.residents.set([]);
        this.isLoading.set(false);
      }
    });
  }

  showMoreResidents(): void {
    this.residentsPagination.showMore();
  }
}
