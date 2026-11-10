export interface RawgPlatformItem {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface RawgGenreItem {
  id: number;
  name: string;
  slug: string;
}

export interface RawgCompanyItem {
  id: number;
  name: string;
  slug?: string;
}

export interface RawgGameSearchResult {
  id: number;
  name: string;
  slug: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  ratings_count: number;
  platforms?: RawgPlatformItem[];
  genres?: RawgGenreItem[];
}

export interface RawgGameDetails extends RawgGameSearchResult {
  description_raw?: string;
  description?: string;
  developers?: RawgCompanyItem[];
  publishers?: RawgCompanyItem[];
  website?: string;
}

export interface RawgSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgGameSearchResult[];
}
