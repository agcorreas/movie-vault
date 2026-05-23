# MovieVault — Project Guide

## Intent

MovieVault is a personal movie browsing and bookmarking app. Users can browse movies by popularity or genre, search by title or director name, view detailed info with aggregated ratings from multiple sources, and save movies to a personal watchlist. Authentication is required only for the watchlist feature.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database / Auth | Supabase (PostgreSQL + Supabase Auth) |
| Movie data | TMDB API |
| Ratings | OMDB API, Rotten Tomatoes (scraped), Letterboxd (scraped), Wikidata (canonical slugs) |

## ⚠️ Next.js 16 — read before writing any code

This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Key difference from training data: `middleware.ts` has been renamed to `proxy.ts` and the export is `proxy` instead of `middleware`.

## Project structure

```
app/
  (auth)/
    login/page.tsx       # /login  — email+password login form
    signup/page.tsx      # /signup — signup form (username + email + password)
  actions/
    auth.ts              # Server Actions: signup, login, logout (uses Supabase server client)
  api/
    genres/route.ts      # GET /api/genres — returns TMDB genre list
    movies/route.ts      # GET /api/movies — browse/search/director filmography
    movie/[id]/route.ts  # GET /api/movie/:id — full detail + aggregated ratings
  watchlist/page.tsx     # /watchlist — logged-in user's bookmarked movies with genre filter
  layout.tsx             # Root layout (fonts, metadata)
  page.tsx               # / — main browser (header + genre bar + movie grid)
  globals.css

components/
  AuthButton.tsx         # Shows username + logout, or login/signup links; reads Supabase auth state
  GenreBar.tsx           # Horizontal scrollable genre filter chips
  MovieCard.tsx          # Poster card with hover effects and prefetch on hover
  MovieGrid.tsx          # Grid of MovieCards + MovieModal state
  MovieModal.tsx         # Full detail modal with ratings, watchlist bookmark toggle
  RatingBadge.tsx        # Single rating badge (icon + score + link)
  SearchBar.tsx          # Debounced search input

lib/
  supabase/
    client.ts            # createClient() — browser Supabase client (uses createBrowserClient)
    server.ts            # createClient() — server Supabase client (uses cookies from next/headers)
  tmdb.ts                # TMDB API helpers + POSTER_BASE / BACKDROP_BASE constants
  omdb.ts                # OMDB API — fetches IMDb rating
  scrape.ts              # Scrapes Rotten Tomatoes and Letterboxd ratings
  wikidata.ts            # Fetches canonical RT/Letterboxd slugs from Wikidata

proxy.ts                 # Session refresh on every request (Supabase SSR cookie handling)
```

## Database (Supabase)

### `watchlist` table
```sql
id          uuid   primary key (gen_random_uuid())
user_id     uuid   references auth.users(id) on delete cascade, not null
movie_id    integer not null
title       text not null
poster_path text
genres      jsonb  default '[]'
added_at    timestamptz default now()
unique(user_id, movie_id)
```
RLS enabled: users can only read/write their own rows (`auth.uid() = user_id`).

### Auth
Supabase Auth handles users. Username is stored in `user.user_metadata.username` (set at signup via `options.data`). No separate profiles table.

## Environment variables

```
TMDB_API_KEY                 # TMDB v3 API key
OMDB_API_KEY                 # OMDB API key
NEXT_PUBLIC_SUPABASE_URL     # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Supabase anon/public key
```

## Key conventions

- **Movie detail** is fetched by `/api/movie/[id]` which parallelises TMDB, OMDB, Letterboxd scrape, and Wikidata in two rounds to minimise latency.
- **Director search**: when the search query matches a known TMDB person, the app shows that director's filmography sorted by ascending release date instead of regular search results.
- **Watchlist writes** go directly from the browser to Supabase (anon key + RLS) — no API route in between.
- **Session refresh** happens in `proxy.ts` on every request so Supabase JWTs never expire mid-session.
- **Username** is read from `user.user_metadata.username`; the email is the fallback if username is missing (e.g. users created before the username field was added).
