import { NextRequest, NextResponse } from "next/server";
import { fetchMovieRecommendations } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const movieIds = (searchParams.get("movieIds") ?? "")
    .split(",").map(Number).filter(Boolean).slice(0, 5);
  const excludeIds = new Set(
    (searchParams.get("excludeIds") ?? "").split(",").map(Number).filter(Boolean)
  );

  if (movieIds.length === 0) return NextResponse.json({ results: [] });

  const allRecs = await Promise.all(movieIds.map((id) => fetchMovieRecommendations(id)));

  const seen = new Set<number>();
  const results = allRecs
    .flat()
    .filter((m) => {
      if (seen.has(m.id) || excludeIds.has(m.id)) return false;
      seen.add(m.id);
      return true;
    })
    .sort((a, b) => b.vote_average - a.vote_average)
    .slice(0, 20);

  return NextResponse.json({ results });
}
