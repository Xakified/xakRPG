# xakRPG

A fantasy character-creation RPG for up to 5 friends. Everyone joins a room with a 4-letter code, then:

1. **Forges a hero** in a 3D creator: any of the 67 playable D&D 5e races, body shape (slim to fat, frail to muscular, breasts or not), skin, 24 hairstyles, hair and eye colors, facial hair, then one of 13 classes and a name.
2. **Drafts five chapters** together: Weapon, Armor, Companion, Relic and Secret. Each player is dealt three cards; every pick shows up on the 3D model and adds to their ability scores (STR, DEX, CON, INT, WIS, CHA) and their legend.
3. **Tells the legends** one hero at a time, then the table votes for their favorite.

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
- `src/game/cards.js` — draft card content; add cards here
- `src/game/Forge.jsx` — the character creator
- `src/game/engine.js` — game rules (host-side reducer)
- `src/game/Game.jsx` — screens for each phase
- `src/game/Backdrop.jsx` — the painted night-sky background
