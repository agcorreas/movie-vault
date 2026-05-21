"use client";
import { useEffect, useRef, useState } from "react";

interface Genre {
  id: number;
  name: string;
}

interface Props {
  selected: number | null;
  onSelect: (id: number | null) => void;
}

export default function GenreBar({ selected, onSelect }: Props) {
  const [genres, setGenres] = useState<Genre[]>([]);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    fetch("/api/genres")
      .then((r) => r.json())
      .then(setGenres)
      .catch(() => {});
  }, []);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [selected]);

  const pills = [{ id: null, name: "Popular" }, ...genres];

  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3">
        {pills.map((g) => {
          const active = selected === g.id;
          return (
            <button
              key={g.id ?? "latest"}
              ref={active ? activeRef : null}
              onClick={() => onSelect(g.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer
                ${active
                  ? "bg-white text-black shadow"
                  : "bg-white/8 text-white/60 hover:bg-white/15 hover:text-white"
                }`}
            >
              {g.name}
            </button>
          );
        })}
      </div>
      {/* fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#0f0f0f] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#0f0f0f] to-transparent" />
    </div>
  );
}
