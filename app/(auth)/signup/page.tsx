"use client";
import { useActionState } from "react";
import { signup } from "@/app/actions/auth";
import Link from "next/link";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, null);

  return (
    <main className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-8 text-center">
          MovieVault
        </h1>
        <div className="bg-[#1a1a1a] rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-white mb-6">
            Create account
          </h2>
          <form action={action} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-sm text-white/60">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                className="rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm text-white/60">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm text-white/60">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                className="rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30"
              />
            </div>
            {state?.error && (
              <p className="text-red-400 text-sm">{state.error}</p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="mt-2 rounded-lg bg-white text-black font-semibold py-2.5 text-sm hover:bg-white/90 transition disabled:opacity-50 cursor-pointer"
            >
              {pending ? "Creating account…" : "Sign up"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-white/40">
            Already have an account?{" "}
            <Link href="/login" className="text-white/70 hover:text-white transition">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
