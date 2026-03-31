import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CharacterPreview, Episode, EpisodesResponse } from '../interfaces/episode.interface';

@Injectable({
  providedIn: 'root'
})
export class EpisodesService {
  private http = inject(HttpClient);

  getEpisodes(page: number = 1, name?: string) {
    let url = `https://rickandmortyapi.com/api/episode?page=${page}`;

    if (name && name.trim().length > 0) {
      url += `&name=${encodeURIComponent(name.trim())}`;
    }

    return this.http.get<EpisodesResponse>(url);
  }

  getEpisodeById(id: number) {
    return this.http.get<Episode>(
      `https://rickandmortyapi.com/api/episode/${id}`
    );
  }

  getCharactersByIds(ids: string) {
    return this.http.get<CharacterPreview | CharacterPreview[]>(
      `https://rickandmortyapi.com/api/character/${ids}`
    );
  }
}
