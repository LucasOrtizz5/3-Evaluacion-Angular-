import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '../../../../shared/ui/components/breadcrumb/breadcrumb';
import { LoaderComponent } from '../../../../shared/ui/components/loader/loader';
import { SearchBarComponent } from '../../../../shared/ui/components/search-bar/search-bar';
import { Episode, FavoriteEpisode } from '../../interfaces/episode.interface';
import { EpisodesService } from '../../services/episodes.service';
import { EpisodeFavoritesService } from '../../services/episode-favorites.service';
import { PaginationControlsComponent } from '../../../../shared/ui/components/pagination-controls/pagination-controls';
import { createListPagination } from '../../../../shared/utils/list-pagination';

@Component({
  selector: 'app-episodes-page',
  standalone: true,
  imports: [RouterLink, BreadcrumbComponent, LoaderComponent, SearchBarComponent, PaginationControlsComponent],
  templateUrl: './episodes-page.html',
  styleUrl: './episodes-page.css'
})
export class EpisodesPage implements OnInit {
  private episodesService = inject(EpisodesService);
  private episodeFavoritesService = inject(EpisodeFavoritesService);

  episodes = signal<Episode[]>([]);
  visibleEpisodes = computed(() => {
    const localPage = this.currentPage();
    const start = ((localPage - 1) % 2) * 10;
    return this.episodes().slice(start, start + 10);
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
    this.loadEpisodes();
  }

  loadEpisodes(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    const localPage = this.currentPage();
    const apiPage = Math.ceil(localPage / 2);
    this.apiPage.set(apiPage);

    this.episodesService.getEpisodes(apiPage, this.searchTerm()).subscribe({
      next: (response) => {
        this.episodes.set(response.results);
        this.totalPages.set(Math.ceil(response.info.count / 10));
        this.isLoading.set(false);
      },
      error: () => {
        this.episodes.set([]);
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
    this.loadEpisodes();
  }

  onSearch(term: string): void {
    this.pagination.setSearchTerm(term);
    this.loadEpisodes();
  }

  toggleFavorite(episode: Episode, event: MouseEvent): void {
    event.stopPropagation();

    const payload: FavoriteEpisode = {
      id: episode.id,
      name: episode.name,
      episode: episode.episode,
      air_date: episode.air_date,
    };

    this.episodeFavoritesService.toggleFavorite(payload);
  }

  isFavorite(episodeId: number): boolean {
    return this.episodeFavoritesService.isFavorite(episodeId);
  }
}
