"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login?returnTo=/settings");
        return;
      }
      setSelectedIds((user.user_metadata?.provider_ids as number[]) ?? []);

      const res = await fetch("/api/providers");
      if (res.ok) setProviders(await res.json());
      setLoading(false);
    }

    init();
  }, [router]);

  async function toggle(id: number) {
    const supabase = createClient();
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    setSelectedIds(next);
    setSaving(true);
    await supabase.auth.updateUser({ data: { provider_ids: next } });
    setSaving(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] text-white flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <header className="sticky top-0 z-40 bg-[#0f0f0f]/90 backdrop-blur border-b border-white/5">
        <div className="max-w-3xl mx-auto flex items-center gap-4 px-4 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight shrink-0">MovieVault</Link>
          <span className="text-white/30">/</span>
          <span className="text-sm text-white/60">Settings</span>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold">Streaming Services</h1>
            <p className="text-sm text-white/40 mt-0.5">Select the services you subscribe to. Available in Argentina.</p>
          </div>
          {saving && <span className="text-xs text-white/30">Saving…</span>}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {providers.map((p) => {
            const active = selectedIds.includes(p.provider_id);
            return (
              <button
                key={p.provider_id}
                onClick={() => toggle(p.provider_id)}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer text-left ${
                  active
                    ? "bg-white text-black ring-2 ring-white"
                    : "bg-white/8 text-white/70 hover:bg-white/12 hover:text-white"
                }`}
              >
                <Image
                  src={`https://image.tmdb.org/t/p/w45${p.logo_path}`}
                  alt={p.provider_name}
                  width={28}
                  height={28}
                  className="rounded-md shrink-0"
                />
                <span className="truncate leading-tight">{p.provider_name}</span>
              </button>
            );
          })}
        </div>

        {providers.length === 0 && (
          <p className="text-center text-white/30 py-16 text-sm">No streaming services found.</p>
        )}
      </section>
    </main>
  );
}
