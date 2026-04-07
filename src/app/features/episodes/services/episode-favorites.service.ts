import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/services/auth';
import { FavoriteEpisode } from '../interfaces/episode.interface';
import { environment } from '../../../../environments/environment';
import { catchError, map, of } from 'rxjs';

interface ApiResponse<T> {
  header: {
    resultCode: number;
    error?: string;
  };
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class EpisodeFavoritesService {
  private readonly http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/episodes/favorites`;

  private favoritesState = signal<FavoriteEpisode[]>([]);

  readonly favorites = computed(() => this.favoritesState());
  readonly favoritesCount = computed(() => this.favoritesState().length);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();

      if (!user) {
        this.favoritesState.set([]);
        return;
      }

      this.loadFavorites();
    });
  }

  isFavorite(episodeId: number): boolean {
    return this.favoritesState().some(episode => episode.id === episodeId);
  }

  toggleFavorite(episode: FavoriteEpisode): void {
    if (this.isFavorite(episode.id)) {
      this.removeFavorite(episode.id);
      return;
    }

    this.favoritesState.update(current => [episode, ...current]);

    this.http
      .post<ApiResponse<FavoriteEpisode>>(this.apiUrl, episode, {
        withCredentials: true,
      })
      .pipe(catchError(() => of(null)))
      .subscribe((response) => {
        if (!response) {
          this.loadFavorites();
        }
      });
  }

  removeFavorite(episodeId: number): void {
    this.favoritesState.update(current =>
      current.filter(episode => episode.id !== episodeId)
    );

    this.http
      .delete<ApiResponse<unknown>>(`${this.apiUrl}/${episodeId}`, {
        withCredentials: true,
      })
      .pipe(catchError(() => of(null)))
      .subscribe((response) => {
        if (!response) {
          this.loadFavorites();
        }
      });
  }

  private loadFavorites(): void {
    this.http
      .get<ApiResponse<FavoriteEpisode[]>>(this.apiUrl, {
        withCredentials: true,
      })
      .pipe(
        map((response) => response.data ?? []),
        catchError(() => of([])),
      )
      .subscribe((favorites) => this.favoritesState.set(favorites));
  }
}
