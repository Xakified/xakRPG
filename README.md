# xakRPG

A story-driven fantasy RPG for up to 5 friends. Everyone joins a room with a 4-letter code, then builds a hero over five chapters (Origin, Weapon, Trinket, Companion, Secret). Each chapter you pick one of three cards and fill in its ad-lib blanks to write your backstory. Cards add Might, Wits, Charm and Luck. At the end each legend is read aloud and the table votes for their favourite.

Rooms run on Supabase Realtime (presence + broadcast), so no database tables are needed. The first player in a room is the host and keeps the game state; if they leave, the next player takes over.

## Run locally
1. `npm install`
2. `npm run dev`

Without Supabase keys the game runs in offline mode: open several tabs in the same browser to play against yourself. To play with friends, `cp .env.example .env` and fill in your Supabase project URL and anon key (Supabase dashboard → Project Settings → API).

## Deploy (GitHub Pages)
1. Repo Settings → Pages → Source: **GitHub Actions**.
2. Repo Settings → Secrets and variables → Actions → **Variables**: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. The anon key is meant to be public, so a variable is fine.
3. Push to `main` (or run the workflow by hand). The site appears at `https://<you>.github.io/xakRPG/`.

## Where things live
- `src/lib/room.js` — room codes, presence, messaging (Supabase or offline)
- `src/game/cards.js` — all card content; add cards here
- `src/game/engine.js` — game rules (host-side reducer)
- `src/game/Game.jsx` — screens for each phase
