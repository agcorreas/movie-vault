"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { POSTER_BASE, BACKDROP_BASE } from "@/lib/tmdb";
import RatingBadge from "./RatingBadge";

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
  imdbRating: string | null;
  rtRating: string | null;
  lbRating: string | null;
  imdbLink: string | null;
  rtLink: string | null;
  lbLink: string | null;
}

interface Props {
  movieId: number;
  onClose: () => void;
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

export default function MovieModal({ movieId, onClose }: Props) {
  const [detail, setDetail] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/movie/${movieId}`)
      .then((r) => r.json())
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [movieId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const year = detail?.release_date?.slice(0, 4) ?? "";
  const runtime = detail?.runtime ? `${Math.floor(detail.runtime / 60)}h ${detail.runtime % 60}m` : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1a1a1a] shadow-2xl animate-modal">
        {/* Backdrop */}
        {detail?.backdrop_path && (
          <div className="relative w-full h-48 overflow-hidden rounded-t-2xl">
            <Image
              src={`${BACKDROP_BASE}${detail.backdrop_path}`}
              alt=""
              fill
              className="object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a1a1a]" />
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/80 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">Loading…</div>
        ) : !detail ? (
          <div className="flex items-center justify-center h-64 text-gray-400">Failed to load.</div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-6 p-6 -mt-10 relative">
            {/* Poster */}
            {detail.poster_path && (
              <div className="shrink-0 mx-auto sm:mx-0">
                <div className="relative w-36 sm:w-44 aspect-[2/3] rounded-xl overflow-hidden shadow-xl">
                  <Image
                    src={`${POSTER_BASE}${detail.poster_path}`}
                    alt={detail.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            )}

            {/* Details */}
            <div className="flex flex-col gap-3 flex-1">
              <div>
                <h2 className="text-2xl font-bold text-white leading-tight">{detail.title}</h2>
                <p className="text-gray-400 text-sm mt-0.5">
                  {[year, runtime].filter(Boolean).join(" · ")}
                </p>
                {detail.tagline && (
                  <p className="text-gray-400 italic text-sm mt-1">"{detail.tagline}"</p>
                )}
              </div>

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

              {/* Ratings */}
              <div className="flex flex-wrap gap-2 mt-1">
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
