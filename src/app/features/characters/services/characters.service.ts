import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../interfaces/character.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CharactersService {

  private http = inject(HttpClient);

  private cache = new Map<number, ApiResponse>();

  getCharacters(page: number = 1, name?: string) {

    let url = `https://rickandmortyapi.com/api/character?page=${page}`;

    if (name && name.trim().length > 0) {
      url += `&name=${name}`;
    }

    return this.http.get<ApiResponse>(url);
  }

  getCharacterById(id: number) {
    return this.http.get<any>(
      `https://rickandmortyapi.com/api/character/${id}`
    );
  }

  getEpisodesByIds(ids: string) {
    return this.http.get<any>(
      `https://rickandmortyapi.com/api/episode/${ids}`
    );
  }
}
