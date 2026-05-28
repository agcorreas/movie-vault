import { NextRequest, NextResponse } from "next/server";
import { fetchMovies, searchDirector, fetchDirectorMovies } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const query = searchParams.get("query") ?? "";
  const genreId = searchParams.get("genreId") ? Number(searchParams.get("genreId")) : null;
  const mode = searchParams.get("mode") ?? "movie"; // "movie" | "director"

  try {
    if (query) {
      if (mode === "director") {
        const director = await searchDirector(query);
        if (director) {
          const movies = await fetchDirectorMovies(director.id);
          const pageSize = 20;
          const start = (page - 1) * pageSize;
          return NextResponse.json({
            results: movies.slice(start, start + pageSize),
            total_pages: Math.ceil(movies.length / pageSize),
            director_name: director.name,
          });
        }
        return NextResponse.json({ results: [], total_pages: 1 });
      }

      // mode === "movie": straight title search, no director detection
      return NextResponse.json(await fetchMovies(page, query, null));
    }

    return NextResponse.json(await fetchMovies(page, query, genreId));
  } catch {
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
  }
}
