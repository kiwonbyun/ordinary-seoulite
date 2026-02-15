# Ordinary Seoulite

Vite + React SPA deployed to Cloudflare Pages, using Supabase for auth and data.

## Scripts

- `pnpm dev`
- `pnpm build`
- `pnpm test:run`

## Environment

Create `.env` from `.env.example` and set:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`
- `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`

## Local Google OAuth (Supabase)

1. Create a Google OAuth Client (Web application) in Google Cloud.
2. Add redirect URI:
   - `http://localhost:54321/auth/v1/callback`
3. Set local env values:
   - `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`
   - `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET`
4. Restart local Supabase so auth config reloads:
   - `supabase stop`
   - `supabase start`
