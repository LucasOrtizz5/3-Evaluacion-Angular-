export interface LocationInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

export interface Location {
  id: number;
  name: string;
  type: string;
  dimension: string;
  residents: string[];
  url: string;
  created: string;
}

export interface LocationResident {
  id: number;
  name: string;
  status: string;
  species: string;
  image: string;
}

export interface LocationsResponse {
  info: LocationInfo;
  results: Location[];
}
