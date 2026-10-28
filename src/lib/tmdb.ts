import { MediaItem, Season } from "@/types/tmdb";

const TMDB_API_KEY =
  process.env.NEXT_PUBLIC_TMDB_API_KEY || "930ad4a1965f9d84446cdb78e49c310d";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function getImageUrl(
  path: string | null | undefined,
  size: "w300" | "w500" | "w780" | "w1280" | "original" = "w1280"
): string {
  if (!path) return "/placeholder-poster.svg";
  if (path.startsWith("http")) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

// Curated list of top genres for Navbar filtering & UI badges
export const MOVIE_GENRES = [
  { id: "28", name: "Action", sinhala: "ක්‍රියාදාම" },
  { id: "12", name: "Adventure", sinhala: "ත්‍රාසජනක" },
  { id: "16", name: "Animation", sinhala: "සජීවීකරණ" },
  { id: "35", name: "Comedy", sinhala: "හාස්‍යජනක" },
  { id: "80", name: "Crime", sinhala: "අපරාධ" },
  { id: "18", name: "Drama", sinhala: "නාට්‍යමය" },
  { id: "14", name: "Fantasy", sinhala: "ෆැන්ටසි" },
  { id: "27", name: "Horror", sinhala: "භීෂණ" },
  { id: "878", name: "Sci-Fi", sinhala: "විද්‍යා ප්‍රබන්ධ" },
  { id: "53", name: "Thriller", sinhala: "ත්‍රාසජනක" },
  { id: "10749", name: "Romance", sinhala: "ආදර කතා" },
  { id: "99", name: "Documentary", sinhala: "වාර්තාමය" },
];

export const TV_GENRES = [
  { id: "10759", name: "Action & Adventure", sinhala: "ක්‍රියාදාම සහ ත්‍රාසජනක" },
  { id: "16", name: "Animation", sinhala: "සජීවීකරණ" },
  { id: "35", name: "Comedy", sinhala: "හාස්‍යජනක" },
  { id: "80", name: "Crime", sinhala: "අපරාධ" },
  { id: "18", name: "Drama", sinhala: "නාට්‍යමය" },
  { id: "10765", name: "Sci-Fi & Fantasy", sinhala: "විද්‍යා ප්‍රබන්ධ සහ ෆැන්ටසි" },
  { id: "9648", name: "Mystery", sinhala: "අභිරහස්" },
  { id: "10768", name: "War & Politics", sinhala: "යුද සහ දේශපාලන" },
];

async function fetchFromTMDB<T>(
  endpoint: string,
  params: Record<string, string | number> = {},
  revalidate = 3600
): Promise<T> {
  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "en-US",
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ),
  });

  const url = `${TMDB_BASE_URL}${endpoint}?${queryParams.toString()}`;

  try {
    // Dynamic cache: Ensure revalidate: 3600 (1 hour) on all TMDB requests
    const res = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw error;
  }
}

// 1. Trending Day & Now Playing
export async function getTrendingAll(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: MediaItem[] }>("/trending/all/day");
  return data.results || [];
}

export async function getTrendingMovies(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: MediaItem[] }>("/trending/movie/day");
  return (data.results || []).map((item) => ({ ...item, media_type: "movie" }));
}

export async function getNowPlayingMovies(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: MediaItem[] }>("/movie/now_playing");
  return (data.results || []).map((item) => ({ ...item, media_type: "movie" }));
}

// 2. TV Series endpoints
export async function getPopularTv(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: MediaItem[] }>("/tv/popular");
  return (data.results || []).map((item) => ({ ...item, media_type: "tv" }));
}

export async function getTopRatedTv(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: MediaItem[] }>("/tv/top_rated");
  return (data.results || []).map((item) => ({ ...item, media_type: "tv" }));
}

export async function getTopRatedMovies(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: MediaItem[] }>("/movie/top_rated");
  return (data.results || []).map((item) => ({ ...item, media_type: "movie" }));
}

// 3. Category Rows with with_genres parameter
export async function getActionAndAdventure(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: MediaItem[] }>("/discover/movie", {
    with_genres: "28,12",
    sort_by: "popularity.desc",
  });
  return (data.results || []).map((item) => ({ ...item, media_type: "movie" }));
}

export async function getSciFiAndFantasy(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: MediaItem[] }>("/discover/movie", {
    with_genres: "878,14",
    sort_by: "popularity.desc",
  });
  return (data.results || []).map((item) => ({ ...item, media_type: "movie" }));
}

export async function getAnimation(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: MediaItem[] }>("/discover/movie", {
    with_genres: "16",
    sort_by: "popularity.desc",
  });
  return (data.results || []).map((item) => ({ ...item, media_type: "movie" }));
}

export async function getActionAndSciFi(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: MediaItem[] }>("/discover/movie", {
    with_genres: "28,878",
    sort_by: "popularity.desc",
  });
  return (data.results || []).map((item) => ({ ...item, media_type: "movie" }));
}

export async function getAnime(): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: MediaItem[] }>("/discover/tv", {
    with_genres: "16",
    with_original_language: "ja",
    sort_by: "popularity.desc",
  });
  return (data.results || []).map((item) => ({ ...item, media_type: "tv" }));
}

// Filter Movies or TV by specific Genre
export async function getMoviesByGenre(genreId: string | number): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: MediaItem[] }>("/discover/movie", {
    with_genres: String(genreId),
    sort_by: "popularity.desc",
  });
  return (data.results || []).map((item) => ({ ...item, media_type: "movie" }));
}

export async function getTvByGenre(genreId: string | number): Promise<MediaItem[]> {
  const data = await fetchFromTMDB<{ results: MediaItem[] }>("/discover/tv", {
    with_genres: String(genreId),
    sort_by: "popularity.desc",
  });
  return (data.results || []).map((item) => ({ ...item, media_type: "tv" }));
}

// Multi-search
export async function searchMulti(query: string, page = 1): Promise<MediaItem[]> {
  if (!query || query.trim().length === 0) return [];
  const data = await fetchFromTMDB<{ results: MediaItem[] }>(
    "/search/multi",
    { query: query.trim(), page },
    3600
  );
  return (data.results || []).filter(
    (item) => item.media_type === "movie" || item.media_type === "tv"
  );
}

// Details & Seasons
export async function getMovieDetails(id: number | string): Promise<MediaItem> {
  const data = await fetchFromTMDB<MediaItem>(
    `/movie/${id}`,
    { append_to_response: "external_ids,videos,credits,similar" },
    3600
  );
  return { ...data, media_type: "movie" };
}

export async function getTvDetails(id: number | string): Promise<MediaItem> {
  const data = await fetchFromTMDB<MediaItem>(
    `/tv/${id}`,
    { append_to_response: "external_ids,videos,credits,similar" },
    3600
  );
  return { ...data, media_type: "tv" };
}

export async function getTvSeason(
  tvId: number | string,
  seasonNumber: number
): Promise<Season> {
  const data = await fetchFromTMDB<Season>(
    `/tv/${tvId}/season/${seasonNumber}`,
    {},
    3600
  );
  return data;
}

export async function getExternalIds(
  id: number | string,
  type: "movie" | "tv"
): Promise<{ imdb_id?: string; tvdb_id?: number }> {
  try {
    const data = await fetchFromTMDB<{ imdb_id?: string; tvdb_id?: number }>(
      `/${type}/${id}/external_ids`,
      {},
      3600
    );
    return data;
  } catch {
    return {};
  }
}
