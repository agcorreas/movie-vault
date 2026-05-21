// P1258 = Rotten Tomatoes ID, P6127 = Letterboxd film ID
const RT_PROP = "P1258";
const LB_PROP = "P6127";

interface WikidataIds {
  rtId: string | null;
  lbId: string | null;
}

export async function fetchWikidataIds(wikidataId: string): Promise<WikidataIds> {
  try {
    const res = await fetch(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${wikidataId}&props=claims&format=json&origin=*`,
      { next: { revalidate: 86400 } },
    );
    if (!res.ok) return { rtId: null, lbId: null };

    const data = await res.json();
    const claims = data.entities?.[wikidataId]?.claims ?? {};

    const firstValue = (prop: string): string | null =>
      claims[prop]?.[0]?.mainsnak?.datavalue?.value ?? null;

    return {
      rtId: firstValue(RT_PROP),
      lbId: firstValue(LB_PROP),
    };
  } catch {
    return { rtId: null, lbId: null };
  }
}
