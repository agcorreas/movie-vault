import { NextRequest, NextResponse } from "next/server";
import { fetchMovieDetail } from "@/lib/tmdb";
import { fetchRatings } from "@/lib/omdb";

function toSlug(title: string, separator: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, separator);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const detail = await fetchMovieDetail(Number(id));
    const ratings = detail.imdb_id ? await fetchRatings(detail.imdb_id) : { imdbRating: null, rtRating: null };

    const imdbLink = detail.imdb_id ? `https://www.imdb.com/title/${detail.imdb_id}/` : null;
    const rtSlug = toSlug(detail.title, "_");
    const rtLink = `https://www.rottentomatoes.com/m/${rtSlug}`;
    const lbSlug = toSlug(detail.title, "-");
    const lbLink = `https://letterboxd.com/film/${lbSlug}/`;

    return NextResponse.json({ ...detail, ...ratings, imdbLink, rtLink, lbLink });
  } catch {
    return NextResponse.json({ error: "Failed to fetch movie" }, { status: 500 });
  }
}
