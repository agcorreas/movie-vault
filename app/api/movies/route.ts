import { NextRequest, NextResponse } from "next/server";
import { fetchMovies } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") ?? 1);
  const query = searchParams.get("query") ?? "";

  try {
    const data = await fetchMovies(page, query);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
  }
}
