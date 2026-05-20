"use client";
import Image from "next/image";
import { POSTER_BASE } from "@/lib/tmdb";

interface Props {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  onClick: () => void;
}

export default function MovieCard({ title, posterPath, releaseDate, onClick }: Props) {
  const year = releaseDate?.slice(0, 4) ?? "";
  const src = posterPath ? `${POSTER_BASE}${posterPath}` : null;

  return (
    <button
      onClick={onClick}
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
        <div className="flex h-full items-center justify-center text-gray-500 text-sm px-3 text-center leading-snug">{title}</div>
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
