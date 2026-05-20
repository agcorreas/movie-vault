"use client";
import { useCallback, useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import MovieGrid from "@/components/MovieGrid";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async (q: string, p: number, append: boolean) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/movies?page=${p}&query=${encodeURIComponent(q)}`);
      const data = await res.json();
      setMovies((prev) => append ? [...prev, ...data.results] : data.results);
      setTotalPages(data.total_pages);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setMovies([]);
    load(query, 1, false);
  }, [query, load]);

  const handleSearch = useCallback((q: string) => setQuery(q), []);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    load(query, next, true);
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <header className="sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur border-b border-white/5 px-4 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight shrink-0">MovieVault</h1>
          <SearchBar onSearch={handleSearch} />
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 py-8">
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
              className="rounded-full bg-white/10 hover:bg-white/20 px-8 py-2.5 text-sm font-medium transition"
            >
              Load more
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
