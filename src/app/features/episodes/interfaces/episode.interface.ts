export interface EpisodeInfo {
  count: number;
  pages: number;
  next: string | null;
  prev: string | null;
}

export interface Episode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
  characters: string[];
  url: string;
  created: string;
}

export interface CharacterPreview {
  id: number;
  name: string;
}

export interface FavoriteEpisode {
  id: number;
  name: string;
  episode: string;
  air_date: string;
}

export interface EpisodesResponse {
  info: EpisodeInfo;
  results: Episode[];
}
