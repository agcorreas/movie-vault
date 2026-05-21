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
    // Round 1: both TMDB calls in parallel
    const [detail, externalIds] = await Promise.all([
      fetchMovieDetail(Number(id)),
      fetchExternalIds(Number(id)),
    ]);

    const titleRtSlug = toSlug(detail.title, "_");
    const titleLbSlug = toSlug(detail.title, "-");

    // Round 2: Wikidata, OMDB, and Letterboxd scrape all in parallel.
    // Letterboxd scrape starts optimistically with the title slug; Wikidata may
    // give us a different canonical slug — we'll retry below if it did.
    const [ratings, lbRatingFromTitleSlug, wikidataIds] = await Promise.all([
      detail.imdb_id
        ? fetchRatings(detail.imdb_id)
        : Promise.resolve({ imdbRating: null, rtRating: null }),
      scrapeLetterboxdRating(titleLbSlug),
      externalIds.wikidata_id
        ? fetchWikidataIds(externalIds.wikidata_id)
        : Promise.resolve({ rtId: null, lbId: null }),
    ]);

    // Links use Wikidata canonical IDs when available, title slugs as fallback
    const rtId = wikidataIds.rtId ?? titleRtSlug;
    const lbId = wikidataIds.lbId ?? titleLbSlug;

    // If the title-slug scrape failed AND Wikidata gave a different slug, retry
    // with the correct one (title slug may have hit a different or missing page).
    const lbRating = lbRatingFromTitleSlug ??
      (wikidataIds.lbId && wikidataIds.lbId !== titleLbSlug
        ? await scrapeLetterboxdRating(wikidataIds.lbId)
        : null);

    const imdbRating = ratings.imdbRating;
    const rtRating = ratings.rtRating ?? (await scrapeRTRating(rtId));

    const imdbLink = detail.imdb_id ? `https://www.imdb.com/title/${detail.imdb_id}/` : null;
    const rtLink = wikidataIds.rtId
      ? `https://www.rottentomatoes.com/${rtId}`
      : `https://www.rottentomatoes.com/m/${rtId}`;
    const lbLink = `https://letterboxd.com/film/${lbId}/`;

    return NextResponse.json({
      ...detail,
      imdbRating,
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
