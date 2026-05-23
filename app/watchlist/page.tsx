"use client";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import MovieCard from "@/components/MovieCard";
import MovieModal from "@/components/MovieModal";
import Link from "next/link";
import AuthButton from "@/components/AuthButton";

interface Genre {
  id: number;
  name: string;
}

interface WatchlistItem {
  id: string;
  movie_id: number;
  title: string;
  poster_path: string | null;
  genres: Genre[];
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeGenre, setActiveGenre] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setNotLoggedIn(true);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("watchlist")
        .select("id, movie_id, title, poster_path, genres")
        .order("added_at", { ascending: false });
      setItems((data ?? []).map((row) => ({ ...row, genres: row.genres ?? [] })));
      setLoading(false);
    })();
  }, []);

  async function remove(id: string) {
    const supabase = createClient();
    await supabase.from("watchlist").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const genres = useMemo(() => {
    const map = new Map<number, string>();
    items.forEach((item) =>
      item.genres.forEach((g) => map.set(g.id, g.name))
    );
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  const filtered = useMemo(
    () =>
      activeGenre === null
        ? items
        : items.filter((item) => item.genres.some((g) => g.id === activeGenre)),
    [items, activeGenre]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </main>
    );
  }

  if (notLoggedIn) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-white/60">You need to be logged in to view your watchlist.</p>
        <Link
          href="/login"
          className="rounded-full bg-white text-black font-medium px-6 py-2 text-sm hover:bg-white/90 transition"
        >
          Log in
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <header className="sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight shrink-0">
            MovieVault
          </Link>
          <span className="text-white/20">/</span>
          <h1 className="text-white/60 text-sm font-medium flex-1">Watchlist</h1>
          <AuthButton />
        </div>

        {genres.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveGenre(null)}
              className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-medium transition cursor-pointer ${
                activeGenre === null
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white"
              }`}
            >
              All
            </button>
            {genres.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveGenre(g.id === activeGenre ? null : g.id)}
                className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-medium transition cursor-pointer ${
                  activeGenre === g.id
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/60 hover:bg-white/15 hover:text-white"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        )}
      </header>

      <section className="max-w-7xl mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-white/40">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
            <p>Your watchlist is empty.</p>
            <Link href="/" className="text-white/60 hover:text-white text-sm transition">
              Browse movies
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-white/30 py-24 text-sm">No movies in this genre.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((item) => (
              <div key={item.id} className="relative group/card">
                <MovieCard
                  id={item.movie_id}
                  title={item.title}
                  posterPath={item.poster_path}
                  releaseDate=""
                  onClick={() => setSelectedId(item.movie_id)}
                />
                <button
                  onClick={() => remove(item.id)}
                  className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 opacity-0 group-hover/card:opacity-100 transition hover:bg-black/80 cursor-pointer"
                  title="Remove from watchlist"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedId !== null && (
        <MovieModal movieId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </main>
  );
}
