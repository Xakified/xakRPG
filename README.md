# xakRPG

Browser RPG for up to 5 friends, joined by a 4-letter room code. Rooms run on Supabase Realtime (presence + broadcast), so no database tables are needed yet.

## Run locally
1. `cp .env.example .env` and fill in your Supabase project URL and anon key (Project Settings → API).
2. `npm install`
3. `npm run dev`, then open the URL in two browser tabs to test joining.
