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

export async function fetchMovies(page = 1, query = ""): Promise<{ results: TmdbMovie[]; total_pages: number }> {
  const endpoint = query
    ? url("/search/movie", { query, page: String(page), include_adult: "false" })
    : url("/discover/movie", { sort_by: "popularity.desc", page: String(page), include_adult: "false" });

  const res = await fetch(endpoint, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("TMDB fetch failed");
  return res.json();
}

export async function fetchMovieDetail(id: number): Promise<TmdbMovieDetail> {
  const res = await fetch(url(`/movie/${id}`), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("TMDB detail fetch failed");
  return res.json();
}
