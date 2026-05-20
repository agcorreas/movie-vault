import { NextRequest, NextResponse } from "next/server";
import { fetchMovieDetail } from "@/lib/tmdb";
import { fetchRatings } from "@/lib/omdb";
import { scrapeLetterboxdRating, scrapeRTRating } from "@/lib/scrape";

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

    const rtSlug = toSlug(detail.title, "_");
    const lbSlug = toSlug(detail.title, "-");

    const [ratings, lbRating] = await Promise.all([
      detail.imdb_id ? fetchRatings(detail.imdb_id) : Promise.resolve({ imdbRating: null, rtRating: null }),
      scrapeLetterboxdRating(lbSlug),
    ]);

    // Use scraped RT score only when OMDB doesn't have it
    const rtRating = ratings.rtRating ?? (await scrapeRTRating(rtSlug));

    const imdbLink = detail.imdb_id ? `https://www.imdb.com/title/${detail.imdb_id}/` : null;
    const rtLink = `https://www.rottentomatoes.com/m/${rtSlug}`;
    const lbLink = `https://letterboxd.com/film/${lbSlug}/`;

    return NextResponse.json({
      ...detail,
      imdbRating: ratings.imdbRating,
      rtRating,
      lbRating,
      imdbLink,
      rtLink,
      lbLink,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch movie" }, { status: 500 });
  }
}
