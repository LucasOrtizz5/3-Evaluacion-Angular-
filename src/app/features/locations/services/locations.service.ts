import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Location,
  LocationResident,
  LocationsResponse,
} from '../interfaces/location.interface';

@Injectable({
  providedIn: 'root'
})
export class LocationsService {
  private http = inject(HttpClient);

  getLocations(page: number = 1, name?: string) {
    let url = `https://rickandmortyapi.com/api/location?page=${page}`;

    if (name && name.trim().length > 0) {
      url += `&name=${encodeURIComponent(name.trim())}`;
    }

    return this.http.get<LocationsResponse>(url);
  }

  getLocationById(id: number) {
    return this.http.get<Location>(
      `https://rickandmortyapi.com/api/location/${id}`
    );
  }

  getResidentsByIds(ids: string) {
    return this.http.get<LocationResident | LocationResident[]>(
      `https://rickandmortyapi.com/api/character/${ids}`
    );
  }
}
