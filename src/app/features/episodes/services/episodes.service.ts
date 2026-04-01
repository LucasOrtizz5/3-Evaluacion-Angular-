import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CharacterPreview, Episode, EpisodesResponse } from '../interfaces/episode.interface';
import { forkJoin, map, Observable, of } from 'rxjs';

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

  getCharactersByUrls(characterUrls: string[]): Observable<CharacterPreview[]> {
    const ids = characterUrls
      .map(url => url.split('/').pop())
      .filter((value): value is string => !!value);

    if (!ids.length) {
      return of([]);
    }

    const chunks = this.chunkIds(ids, 20);
    const requests = chunks.map(chunk =>
      this.getCharactersByIds(chunk.join(',')).pipe(
        map(response => Array.isArray(response) ? response : [response])
      )
    );

    return forkJoin(requests).pipe(
      map(results => results.flat())
    );
  }

  private chunkIds(ids: string[], chunkSize: number): string[][] {
    const chunks: string[][] = [];
    for (let index = 0; index < ids.length; index += chunkSize) {
      chunks.push(ids.slice(index, index + chunkSize));
    }

    return chunks;
  }
}
