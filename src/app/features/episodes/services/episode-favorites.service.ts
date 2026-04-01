import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { AuthService } from '../../auth/services/auth';
import { FavoriteEpisode } from '../interfaces/episode.interface';

@Injectable({
  providedIn: 'root'
})
export class EpisodeFavoritesService {
  private authService = inject(AuthService);
  private readonly localStoragePrefix = 'favorite-episodes:';

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

      const storageKey = this.getStorageKey();
      const rawValue = localStorage.getItem(storageKey);
      if (!rawValue) {
        this.favoritesState.set([]);
        return;
      }

      try {
        const parsedValue = JSON.parse(rawValue) as FavoriteEpisode[];
        this.favoritesState.set(Array.isArray(parsedValue) ? parsedValue : []);
      } catch {
        this.favoritesState.set([]);
      }
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
    this.persistFavorites();
  }

  removeFavorite(episodeId: number): void {
    this.favoritesState.update(current =>
      current.filter(episode => episode.id !== episodeId)
    );
    this.persistFavorites();
  }

  private persistFavorites(): void {
    const user = this.authService.currentUser();
    if (!user) {
      return;
    }

    localStorage.setItem(
      this.getStorageKey(),
      JSON.stringify(this.favoritesState())
    );
  }

  private getStorageKey(): string {
    const user = this.authService.currentUser();
    return `${this.localStoragePrefix}${user?.id || user?.email || 'guest'}`;
  }
}
