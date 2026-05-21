const HEADERS = {
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml",
  "Accept-Language": "en-US,en;q=0.9",
};

function extractJsonLd(html: string): Record<string, unknown> | null {
  const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const m of matches) {
    try {
      // Strip CDATA wrappers that some sites add
      const raw = m[1].replace(/\/\*\s*<!\[CDATA\[[\s\S]*?\*\//g, "").replace(/\/\*\s*\]\]>[\s\S]*?\*\//g, "").trim();
      const data = JSON.parse(raw);
      if (data?.aggregateRating) return data;
    } catch {
      // skip malformed blocks
    }
  }
  return null;
}

export async function scrapeLetterboxdRating(slug: string): Promise<string | null> {
  try {
    const res = await fetch(`https://letterboxd.com/film/${slug}/`, {
      headers: HEADERS,
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const data = extractJsonLd(html);
    const value = data?.aggregateRating as { ratingValue?: number } | undefined;
    if (!value?.ratingValue) return null;
    return parseFloat(String(value.ratingValue)).toFixed(2) + " / 5";
  } catch {
    return null;
  }
}

export async function scrapeRTRating(slug: string): Promise<string | null> {
  // Wikidata rtId already includes the "m/" prefix; title slugs do not.
  const path = slug.startsWith("m/") ? slug : `m/${slug}`;
  try {
    const res = await fetch(`https://www.rottentomatoes.com/${path}`, {
      headers: HEADERS,
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const html = await res.text();

    // RT embeds score in JSON-LD and also in a <score-board> web component attribute
    const scoreboard = html.match(/tomatometerscore="(\d+)"/i);
    if (scoreboard) return `${scoreboard[1]}%`;

    const data = extractJsonLd(html);
    const rating = data?.aggregateRating as { ratingValue?: number } | undefined;
    if (rating?.ratingValue != null) return `${Math.round(rating.ratingValue)}%`;

    return null;
  } catch {
    return null;
  }
}
