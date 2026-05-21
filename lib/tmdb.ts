const BASE = "https://api.themoviedb.org/3";
const KEY = process.env.TMDB_API_KEY;

export const POSTER_BASE = "https://image.tmdb.org/t/p/w500";
export const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

function url(path: string, params: Record<string, string> = {}) {
  const q = new URLSearchParams({ api_key: KEY!, ...params });
  return `${BASE}${path}?${q}`;
}

export interface TmdbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
}

export interface TmdbMovieDetail extends TmdbMovie {
  runtime: number;
  genres: { id: number; name: string }[];
  imdb_id: string | null;
  tagline: string;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

export async function fetchGenres(): Promise<TmdbGenre[]> {
  const res = await fetch(url("/genre/movie/list"), { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error("TMDB genres fetch failed");
  const data = await res.json();
  return data.genres;
}

export async function fetchMovies(
  page = 1,
  query = "",
  genreId: number | null = null,
): Promise<{ results: TmdbMovie[]; total_pages: number }> {
  let endpoint: string;
  if (query) {
    endpoint = url("/search/movie", { query, page: String(page), include_adult: "false" });
  } else {
    const today = new Date().toISOString().slice(0, 10);
    const params: Record<string, string> = {
      sort_by: "primary_release_date.desc",
      "primary_release_date.lte": today,
      page: String(page),
      include_adult: "false",
    };
    if (genreId) params.with_genres = String(genreId);
    endpoint = url("/discover/movie", params);
  }

  const res = await fetch(endpoint, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("TMDB fetch failed");
  return res.json();
}

export async function fetchMovieDetail(id: number): Promise<TmdbMovieDetail> {
  const res = await fetch(url(`/movie/${id}`), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("TMDB detail fetch failed");
  return res.json();
}
