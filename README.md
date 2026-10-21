# xakRPG

A co-op fantasy roguelike for up to 5 friends. Everyone joins a room with a 4-letter code, then:

1. **Forges a hero** in a 3D creator: any of the 67 playable D&D 5e races, body shape (slim to fat, frail to muscular, breasts or not), skin, 24 hairstyles, hair and eye colors, facial hair, then one of 13 classes, a starting weapon and a name.
2. **Fights five battles** on a 3D hex map: goblin woods, a crypt, spider caverns, an orc warcamp and the red dragon's lair. The party moves and acts in any order, then the monsters take their turn. Ability scores, level, weapon and gear drive HP, AC, movement, hit chance, damage and spell DCs (d20 rolls against AC, saves for half).
3. **Levels up** after each win and picks one of three random rewards: weapon enchants, armor, relics, pets, tomes or new skills. Rewards share tags (fire, frost, bleed, holy…) so builds stack into synergies, and gear shows up on the hero's model. Losing a battle ends the run.

Rooms run on Supabase Realtime (presence + broadcast), so no database tables are needed. The first player in a room is the host and keeps the game state; if they leave, the next player takes over.

## Art and music
- Item art comes from [game-icons.net](https://game-icons.net) (CC BY 3.0, by Lorc, Delapouite and contributors) via `@iconify-json/game-icons`. Only the icons the game names are copied into `src/game/icons.json`; after adding an icon run `node scripts/build-icons.mjs`.
- Heroes and monsters are low-poly Three.js models built in code (`src/three/`), so there are no model files.
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
- `src/game/combat/` — weapons, skills, loot, enemies and levels (data), and `battle.js` (combat rules and monster AI)
- `src/game/Battle.jsx`, `src/game/Battle3D.jsx` — the battle screen and the 3D hex board
- `src/game/Forge.jsx` — the character creator
- `src/game/engine.js` — game rules (host-side reducer)
- `src/game/Game.jsx` — screens for each phase
- `src/game/Backdrop.jsx` — the painted night-sky background
