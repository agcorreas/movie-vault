import HomeContent from "@/components/HomeContent";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  return <HomeContent initialQuery={q} />;
}
