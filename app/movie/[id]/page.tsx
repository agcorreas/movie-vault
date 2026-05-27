"use client";
import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { POSTER_BASE, BACKDROP_BASE } from "@/lib/tmdb";
import RatingBadge from "@/components/RatingBadge";
import { createClient } from "@/lib/supabase/client";

interface MovieDetail {
  id: number;
  title: string;
  tagline: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  genres: { id: number; name: string }[];
  vote_average: number;
  director: string | null;
  trailerKey: string | null;
  imdbRating: string | null;
  rtRating: string | null;
  lbRating: string | null;
  imdbLink: string | null;
  rtLink: string | null;
  lbLink: string | null;
}

const ImdbIcon = () => (
  <svg viewBox="0 0 24 24" fill="#F5C518" className="w-5 h-5">
    <rect width="24" height="24" rx="4" fill="#F5C518"/>
    <text x="2" y="18" fontSize="12" fontWeight="bold" fill="black" fontFamily="Arial">IMDb</text>
  </svg>
);

const TomatoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
    <circle cx="12" cy="14" r="9" fill="#FA320A"/>
    <ellipse cx="12" cy="6" rx="3" ry="4" fill="#4CAF50"/>
  </svg>
);

const LetterboxdIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <rect width="24" height="24" rx="4" fill="#00B020"/>
    <text x="3" y="17" fontSize="9" fontWeight="bold" fill="white" fontFamily="Arial">LBD</text>
  </svg>
);

const TmdbIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <rect width="24" height="24" rx="4" fill="#01B4E4"/>
    <text x="1" y="17" fontSize="8" fontWeight="bold" fill="white" fontFamily="Arial">TMDB</text>
  </svg>
);

export default function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [detail, setDetail] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchlisted, setWatchlisted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [watchlistId, setWatchlistId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/movie/${id}`)
      .then((r) => r.json())
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data } = await supabase
        .from("watchlist")
        .select("id")
        .eq("movie_id", id)
        .maybeSingle();
      if (data) {
        setWatchlisted(true);
        setWatchlistId(data.id);
      }
    })();
  }, [id]);

  async function toggleWatchlist() {
    if (!userId || !detail) return;
    const supabase = createClient();
    if (watchlisted && watchlistId) {
      await supabase.from("watchlist").delete().eq("id", watchlistId);
      setWatchlisted(false);
      setWatchlistId(null);
    } else {
      const { data } = await supabase
        .from("watchlist")
        .insert({ user_id: userId, movie_id: Number(id), title: detail.title, poster_path: detail.poster_path, genres: detail.genres })
        .select("id")
        .single();
      if (data) {
        setWatchlisted(true);
        setWatchlistId(data.id);
      }
    }
  }

  const year = detail?.release_date?.slice(0, 4) ?? "";
  const runtime = detail?.runtime ? `${Math.floor(detail.runtime / 60)}h ${detail.runtime % 60}m` : "";
  const meta = [year, runtime].filter(Boolean).join(" · ");

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <header className="sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur border-b border-white/5">
        <div className="max-w-5xl mx-auto flex items-center gap-4 px-4 py-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            MovieVault
          </Link>
          <span className="text-white/20 shrink-0">/</span>
          <span className="text-white/60 text-sm truncate flex-1">{detail?.title ?? "…"}</span>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      ) : !detail ? (
        <div className="flex items-center justify-center h-96 text-white/40">Failed to load movie.</div>
      ) : (
        <>
          {/* Backdrop */}
          {detail.backdrop_path && (
            <div className="relative w-full h-56 sm:h-80 overflow-hidden">
              <Image
                src={`${BACKDROP_BASE}${detail.backdrop_path}`}
                alt=""
                fill
                className="object-cover opacity-40"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f0f0f]/40 to-[#0f0f0f]" />
            </div>
          )}

          <div className="max-w-5xl mx-auto px-4 pb-16">
            <div className={`flex flex-col sm:flex-row gap-8 ${detail.backdrop_path ? "-mt-20 sm:-mt-32 relative z-10" : "pt-10"}`}>
              {/* Poster */}
              <div className="shrink-0 mx-auto sm:mx-0">
                <div className="relative w-40 sm:w-52 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl bg-[#1c1c1e]">
                  {detail.poster_path ? (
                    <Image
                      src={`${POSTER_BASE}${detail.poster_path}`}
                      alt={detail.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center">
                      <svg className="w-8 h-8 text-white/10 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125V6.375A1.125 1.125 0 0 1 3.375 5.25h1.5C5.496 5.25 6 5.754 6 6.375m0 12V6.375m0 0a1.125 1.125 0 0 1 1.125-1.125h9.75a1.125 1.125 0 0 1 1.125 1.125M6 6.375v12m12-12v12m0-12a1.125 1.125 0 0 1 1.125 1.125v11.25A1.125 1.125 0 0 1 18 19.5h-1.5" />
                      </svg>
                      <p className="text-white/30 text-xs">No poster</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-4 flex-1 pt-2 sm:pt-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{detail.title}</h1>
                  {meta && <p className="text-gray-400 text-sm mt-1">{meta}</p>}
                  {detail.tagline && (
                    <p className="text-gray-400 italic text-sm mt-1">"{detail.tagline}"</p>
                  )}
                </div>

                {userId && (
                  <button
                    onClick={toggleWatchlist}
                    className={`self-start flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition cursor-pointer ${
                      watchlisted
                        ? "bg-white text-black hover:bg-white/90"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    <svg
                      className="w-4 h-4 shrink-0"
                      fill={watchlisted ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                    </svg>
                    {watchlisted ? "In Watchlist" : "Add to Watchlist"}
                  </button>
                )}

                {detail.director && (
                  <p className="text-sm text-white/50">
                    Directed by <span className="text-white font-medium">{detail.director}</span>
                  </p>
                )}

                {detail.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {detail.genres.map((g) => (
                      <span key={g.id} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-gray-300">
                        {g.name}
                      </span>
                    ))}
                  </div>
                )}

                {detail.overview && (
                  <p className="text-gray-300 text-sm leading-relaxed">{detail.overview}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  <RatingBadge
                    label="IMDb"
                    score={detail.imdbRating ? `${detail.imdbRating}/10` : null}
                    link={detail.imdbLink}
                    color="bg-yellow-500/20"
                    icon={<ImdbIcon />}
                  />
                  <RatingBadge
                    label="Rotten Tomatoes"
                    score={detail.rtRating}
                    link={detail.rtLink}
                    color="bg-red-600/20"
                    icon={<TomatoIcon />}
                  />
                  <RatingBadge
                    label="Letterboxd"
                    score={detail.lbRating}
                    link={detail.lbLink}
                    color="bg-green-600/20"
                    icon={<LetterboxdIcon />}
                  />
                  <RatingBadge
                    label="TMDB"
                    score={detail.vote_average ? `${detail.vote_average.toFixed(1)} / 10` : null}
                    link={`https://www.themoviedb.org/movie/${detail.id}`}
                    color="bg-sky-500/20"
                    icon={<TmdbIcon />}
                  />
                </div>
              </div>
            </div>

            {/* Trailer */}
            {detail.trailerKey && (
              <div className="mt-14">
                <h2 className="text-lg font-semibold mb-4 text-white/80">Trailer</h2>
                <div className="relative w-full aspect-video max-w-2xl rounded-2xl overflow-hidden bg-black/40">
                  <iframe
                    src={`https://www.youtube.com/embed/${detail.trailerKey}`}
                    title={`${detail.title} trailer`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
