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
      sort_by: "popularity.desc",
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

export async function searchDirector(
  query: string,
): Promise<{ id: number; name: string } | null> {
  const res = await fetch(
    url("/search/person", { query, include_adult: "false" }),
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return null;
  const data = await res.json();
  const person = (data.results as { id: number; name: string; known_for_department: string }[])?.find(
    (p) => p.known_for_department === "Directing",
  );
  return person ?? null;
}

export async function fetchDirectorMovies(personId: number): Promise<TmdbMovie[]> {
  const res = await fetch(
    url(`/person/${personId}/movie_credits`),
    { next: { revalidate: 3600 } },
  );
  if (!res.ok) return [];
  const data = await res.json();
  const directed = (data.crew as (TmdbMovie & { job: string })[])
    .filter((c) => c.job === "Director" && c.release_date)
    .sort((a, b) => (b.release_date > a.release_date ? 1 : -1));
  // deduplicate by id (a film can appear multiple times in credits)
  const seen = new Set<number>();
  return directed.filter((m) => (seen.has(m.id) ? false : seen.add(m.id) && true));
}

export async function fetchExternalIds(id: number): Promise<{ wikidata_id: string | null }> {
  const res = await fetch(url(`/movie/${id}/external_ids`), { next: { revalidate: 86400 } });
  if (!res.ok) return { wikidata_id: null };
  const data = await res.json();
  return { wikidata_id: data.wikidata_id ?? null };
}
