"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  onSearch: (query: string) => void;
  currentQuery: string;
}

export default function SearchBar({ onSearch, currentQuery }: Props) {
  const [value, setValue] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync input when parent clears the query (e.g. genre selected)
  useEffect(() => {
    if (currentQuery === "") setValue("");
  }, [currentQuery]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(value.trim()), 400);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [value, onSearch]);

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search movies…"
        className="w-full bg-white/10 text-white placeholder-gray-400 rounded-full pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-white/30 transition"
      />
    </div>
  );
}
