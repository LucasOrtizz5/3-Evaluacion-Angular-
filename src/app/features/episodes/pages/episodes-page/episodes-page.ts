import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '../../../../shared/breadcrumb/breadcrumb';
import { LoaderComponent } from '../../../../shared/loader/loader';
import { SearchBarComponent } from '../../../../shared/search-bar/search-bar';
import { Episode, FavoriteEpisode } from '../../interfaces/episode.interface';
import { EpisodesService } from '../../services/episodes.service';
import { EpisodeFavoritesService } from '../../services/episode-favorites.service';

@Component({
  selector: 'app-episodes-page',
  standalone: true,
  imports: [RouterLink, BreadcrumbComponent, LoaderComponent, SearchBarComponent],
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

  currentPage = signal(1);
  totalPages = signal(0);
  apiPage = signal(1);
  searchTerm = signal('');

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
    this.loadEpisodes();
  }

  onSearch(term: string): void {
    this.searchTerm.set(term.trim());
    this.currentPage.set(1);
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
