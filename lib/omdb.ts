const KEY = process.env.OMDB_API_KEY;

export interface OmdbRatings {
  imdbRating: string | null;
  rtRating: string | null;
}

export async function fetchRatings(imdbId: string): Promise<OmdbRatings> {
  const res = await fetch(
    `https://www.omdbapi.com/?i=${imdbId}&apikey=${KEY}`,
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) return { imdbRating: null, rtRating: null };

  const data = await res.json();
  if (data.Response === "False") return { imdbRating: null, rtRating: null };

  const rtSource = (data.Ratings as { Source: string; Value: string }[] | undefined)
    ?.find((r) => r.Source === "Rotten Tomatoes");

  return {
    imdbRating: data.imdbRating !== "N/A" ? data.imdbRating : null,
    rtRating: rtSource?.Value ?? null,
  };
}
