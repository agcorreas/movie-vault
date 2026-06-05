import { NextResponse } from "next/server";
import { fetchAvailableProviders } from "@/lib/tmdb";

export async function GET() {
  const providers = await fetchAvailableProviders("AR");
  return NextResponse.json(providers);
}
