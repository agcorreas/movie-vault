"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { logout } from "@/app/actions/auth";

export default function AuthButton() {
  const [username, setUsername] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      setLoggedIn(!!user);
      setUsername(user?.user_metadata?.username ?? user?.email ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setLoggedIn(!!user);
      setUsername(user?.user_metadata?.username ?? user?.email ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <div className="w-20 h-8" />;

  if (!loggedIn) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <Link
          href="/login"
          className="text-sm text-white/60 hover:text-white transition px-3 py-1.5"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="text-sm bg-white text-black font-medium rounded-full px-4 py-1.5 hover:bg-white/90 transition"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 shrink-0">
      <Link
        href="/watchlist"
        className="text-sm text-white/60 hover:text-white transition hidden sm:block"
      >
        Watchlist
      </Link>
      {username && (
        <span className="text-sm text-white/40 hidden sm:block truncate max-w-[160px]">
          {username}
        </span>
      )}
      <form action={logout}>
        <button
          type="submit"
          className="text-sm text-white/60 hover:text-white transition px-3 py-1.5 cursor-pointer"
        >
          Log out
        </button>
      </form>
    </div>
  );
}
