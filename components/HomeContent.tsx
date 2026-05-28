"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import MovieGrid from "@/components/MovieGrid";
import GenreBar from "@/components/GenreBar";
import AuthButton from "@/components/AuthButton";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

interface Props {
  initialQuery?: string;
}

export default function HomeContent({ initialQuery = "" }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [searchMode, setSearchMode] = useState<"movie" | "director">(initialQuery ? "director" : "movie");
  const [genreId, setGenreId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [directorName, setDirectorName] = useState<string | null>(null);

  const load = useCallback(async (q: string, gId: number | null, p: number, append: boolean, mode: "movie" | "director" = searchMode) => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({ page: String(p), query: q, mode });
      if (gId) params.set("genreId", String(gId));
      const res = await fetch(`/api/movies?${params}`);
      const data = await res.json();
      setMovies((prev) => append ? [...prev, ...data.results] : data.results);
      setTotalPages(data.total_pages);
      setDirectorName(data.director_name ?? null);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [searchMode]);

  useEffect(() => {
    setPage(1);
    setMovies([]);
    load(query, genreId, 1, false);
  }, [query, genreId, searchMode, load]);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
  }, []);

  const handleGenre = useCallback((id: number | null) => {
    setGenreId(id);
    setQuery("");
  }, []);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(query, genreId, next, true, searchMode);
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <header className="sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4 px-4 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight shrink-0">MovieVault</Link>
          <SearchBar onSearch={handleSearch} currentQuery={query} />
          <div className="flex items-center shrink-0 rounded-full bg-white/10 p-0.5 text-xs font-medium">
            <button
              onClick={() => setSearchMode("movie")}
              className={`rounded-full px-3.5 py-1.5 transition cursor-pointer ${searchMode === "movie" ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
            >
              Movies
            </button>
            <button
              onClick={() => setSearchMode("director")}
              className={`rounded-full px-3.5 py-1.5 transition cursor-pointer ${searchMode === "director" ? "bg-white text-black" : "text-white/60 hover:text-white"}`}
            >
              Director
            </button>
          </div>
          <AuthButton />
        </div>
        <div className="max-w-7xl mx-auto">
          <GenreBar selected={genreId} onSelect={handleGenre} />
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-8">
        {directorName && (
          <div className="flex items-center gap-2 mb-6 text-sm text-white/50">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
            <span>Films directed by <span className="text-white font-medium">{directorName}</span></span>
          </div>
        )}
        {error && (
          <p className="text-center text-red-400 py-16">Failed to load movies. Check your API keys.</p>
        )}
        {!error && movies.length === 0 && !loading && (
          <p className="text-center text-gray-500 py-16">No movies found.</p>
        )}
        {movies.length > 0 && <MovieGrid movies={movies} />}

        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          </div>
        )}

        {!loading && page < totalPages && movies.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMore}
              className="rounded-full bg-white/10 hover:bg-white/20 px-8 py-2.5 text-sm font-medium transition cursor-pointer"
            >
              Load more
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
