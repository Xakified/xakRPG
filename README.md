# xakRPG

A story-driven fantasy RPG for up to 5 friends. Everyone joins a room with a 4-letter code, then builds a hero over five chapters (Origin, Weapon, Trinket, Companion, Secret). Each chapter you pick one of three cards and fill in its ad-lib blanks to write your backstory. Cards add Might, Wits, Charm and Luck. At the end each legend is read aloud and the table votes for their favourite.

Rooms run on Supabase Realtime (presence + broadcast), so no database tables are needed. The first player in a room is the host and keeps the game state; if they leave, the next player takes over.

## Art and music
- Item art comes from [game-icons.net](https://game-icons.net) (CC BY 3.0, by Lorc, Delapouite and contributors) via `@iconify-json/game-icons`. Only the icons the cards use are copied into `src/game/icons.json`; after changing a card's icon run `node scripts/build-icons.mjs`.
- The hero model (`src/game/HeroModel.jsx`) is an SVG paper doll: the Origin sets outfit colors and headgear, the Weapon goes in hand, the Trinket hangs from the belt, the Companion stands at the hero's feet and the Secret floats above as a thought with a colored aura.
- Music is generated live with the Web Audio API (`src/lib/music.js`), so there are no audio files. It starts on the first click and the speaker button mutes it.

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
- `src/game/Backdrop.jsx` — the painted night-sky background
