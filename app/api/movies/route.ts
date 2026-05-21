import { NextRequest, NextResponse } from "next/server";
import { fetchMovies, searchDirector, fetchDirectorMovies } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const query = searchParams.get("query") ?? "";
  const genreId = searchParams.get("genreId") ? Number(searchParams.get("genreId")) : null;

  try {
    if (query) {
      // Run movie title search and director person search in parallel
      const [movieData, director] = await Promise.all([
        fetchMovies(page, query, null),
        searchDirector(query),
      ]);

      // Prefer director results when a matching director is found
      if (director) {
        const movies = await fetchDirectorMovies(director.id);
        // Paginate manually (director credits come back all at once)
        const pageSize = 20;
        const start = (page - 1) * pageSize;
        const results = movies.slice(start, start + pageSize);
        return NextResponse.json({
          results,
          total_pages: Math.ceil(movies.length / pageSize),
          director_name: director.name,
        });
      }

      return NextResponse.json(movieData);
    }

    const data = await fetchMovies(page, query, genreId);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
  }
}
