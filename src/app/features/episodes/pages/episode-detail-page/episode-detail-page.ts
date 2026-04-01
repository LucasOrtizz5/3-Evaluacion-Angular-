import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CharacterPreview, Episode, FavoriteEpisode } from '../../interfaces/episode.interface';
import { EpisodesService } from '../../services/episodes.service';
import { EpisodeFavoritesService } from '../../services/episode-favorites.service';
import { BreadcrumbComponent } from '../../../../shared/ui/components/breadcrumb/breadcrumb';
import { LoaderComponent } from '../../../../shared/ui/components/loader/loader';
import { createDetailPagination } from '../../../../shared/utils/detail-pagination';
import { DetailMoreListComponent } from '../../../../shared/ui/components/detail-more-list/detail-more-list';
import { EpisodeCommentsSectionComponent } from '../../components/episode-comments-section/episode-comments-section';

@Component({
  selector: 'app-episode-detail-page',
  standalone: true,
  imports: [RouterLink, BreadcrumbComponent, LoaderComponent, DetailMoreListComponent, EpisodeCommentsSectionComponent],
  templateUrl: './episode-detail-page.html',
  styleUrl: './episode-detail-page.css'
})
export class EpisodeDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private episodesService = inject(EpisodesService);
  private episodeFavoritesService = inject(EpisodeFavoritesService);

  episode = signal<Episode | null>(null);
  characters = signal<CharacterPreview[]>([]);
  private charactersPagination = createDetailPagination(this.characters, 5);
  visibleCharacters = this.charactersPagination.visibleItems;
  hasMoreCharacters = this.charactersPagination.hasMore;

  isLoading = signal(true);
  hasError = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.hasError.set(true);
      this.isLoading.set(false);
      return;
    }

    this.episodesService.getEpisodeById(+id).subscribe({
      next: (episode) => {
        this.episode.set(episode);
        this.loadCharacters(episode.characters || []);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  toggleFavorite(): void {
    const episode = this.episode();
    if (!episode) {
      return;
    }

    const payload: FavoriteEpisode = {
      id: episode.id,
      name: episode.name,
      episode: episode.episode,
      air_date: episode.air_date,
    };

    this.episodeFavoritesService.toggleFavorite(payload);
  }

  isFavorite(): boolean {
    const episode = this.episode();
    return !!episode && this.episodeFavoritesService.isFavorite(episode.id);
  }

  private loadCharacters(characterUrls: string[]): void {
    if (!characterUrls.length) {
      this.characters.set([]);
      this.charactersPagination.reset();
      this.isLoading.set(false);
      return;
    }

    this.episodesService.getCharactersByUrls(characterUrls).subscribe({
      next: (characters) => {
        this.characters.set(characters);
        this.charactersPagination.reset();
        this.isLoading.set(false);
      },
      error: () => {
        this.characters.set([]);
        this.isLoading.set(false);
      }
    });
  }

  showMoreCharacters(): void {
    this.charactersPagination.showMore();
  }
}
