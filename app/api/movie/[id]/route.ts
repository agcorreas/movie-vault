import { NextRequest, NextResponse } from "next/server";
import { fetchMovieDetail, fetchExternalIds } from "@/lib/tmdb";
import { fetchRatings } from "@/lib/omdb";
import { scrapeLetterboxdRating, scrapeRTRating } from "@/lib/scrape";
import { fetchWikidataIds } from "@/lib/wikidata";

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
    const [detail, externalIds] = await Promise.all([
      fetchMovieDetail(Number(id)),
      fetchExternalIds(Number(id)),
    ]);

    // Get canonical RT/LB IDs from Wikidata; fall back to title slugs
    const wikidataIds = externalIds.wikidata_id
      ? await fetchWikidataIds(externalIds.wikidata_id)
      : { rtId: null, lbId: null };

    const rtSlug = wikidataIds.rtId ?? toSlug(detail.title, "_");
    const lbSlug = wikidataIds.lbId ?? toSlug(detail.title, "-");

    const [ratings, lbRating] = await Promise.all([
      detail.imdb_id ? fetchRatings(detail.imdb_id) : Promise.resolve({ imdbRating: null, rtRating: null }),
      scrapeLetterboxdRating(lbSlug),
    ]);

    const rtRating = ratings.rtRating ?? (await scrapeRTRating(rtSlug));

    const imdbLink = detail.imdb_id ? `https://www.imdb.com/title/${detail.imdb_id}/` : null;
    // RT IDs from Wikidata already include the "m/" prefix; slugs don't
    const rtLink = wikidataIds.rtId
      ? `https://www.rottentomatoes.com/${rtSlug}`
      : `https://www.rottentomatoes.com/m/${rtSlug}`;
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
