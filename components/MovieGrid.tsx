"use client";
import { useState } from "react";
import MovieCard from "./MovieCard";
import MovieModal from "./MovieModal";

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
}

interface Props {
  movies: Movie[];
}

export default function MovieGrid({ movies }: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((m) => (
          <MovieCard
            key={m.id}
            id={m.id}
            title={m.title}
            posterPath={m.poster_path}
            releaseDate={m.release_date}
            onClick={() => setSelectedId(m.id)}
          />
        ))}
      </div>
      {selectedId !== null && (
        <MovieModal movieId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </>
  );
}
