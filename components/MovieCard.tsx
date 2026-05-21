"use client";
import Image from "next/image";
import { useRef } from "react";
import { POSTER_BASE } from "@/lib/tmdb";

interface Props {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  onClick: () => void;
}

export default function MovieCard({ id, title, posterPath, releaseDate, onClick }: Props) {
  const year = releaseDate?.slice(0, 4) ?? "";
  const src = posterPath ? `${POSTER_BASE}${posterPath}` : null;
  const prefetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    prefetchTimer.current = setTimeout(() => {
      fetch(`/api/movie/${id}`);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (prefetchTimer.current) clearTimeout(prefetchTimer.current);
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-[#1c1c1e] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
    >
      {src ? (
        <Image
          src={src}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.07]"
        />
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2.5 px-4 text-center">
          <svg className="w-8 h-8 text-white/10 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75.125V6.375A1.125 1.125 0 0 1 3.375 5.25h1.5C5.496 5.25 6 5.754 6 6.375m0 12V6.375m0 0a1.125 1.125 0 0 1 1.125-1.125h9.75a1.125 1.125 0 0 1 1.125 1.125M6 6.375v12m12-12v12m0-12a1.125 1.125 0 0 1 1.125 1.125v11.25A1.125 1.125 0 0 1 18 19.5h-1.5" />
          </svg>
          <p className="font-[family-name:var(--font-geist-sans)] text-white/70 text-[13px] font-medium leading-snug tracking-[-0.01em] line-clamp-4">{title}</p>
          {year && <p className="font-[family-name:var(--font-geist-sans)] text-white/25 text-[11px] font-normal tracking-[0.06em] uppercase">{year}</p>}
        </div>
      )}

      {/* Ambient glow ring on hover */}
      <div className="absolute inset-0 rounded-xl ring-1 ring-white/0 group-hover:ring-white/10 transition-all duration-300" />

      {/* Bottom gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out flex flex-col justify-end p-3.5">
        <p className="font-[family-name:var(--font-geist-sans)] text-white font-medium text-[13px] leading-snug tracking-[-0.01em] line-clamp-2">{title}</p>
        {year && <p className="font-[family-name:var(--font-geist-sans)] text-white/40 text-[11px] mt-1 font-normal tracking-[0.06em] uppercase">{year}</p>}
      </div>
    </button>
  );
}
