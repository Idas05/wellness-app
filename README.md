# Wellness

One codebase for the iPhone app and the website, built with Expo.

The app has four tabs at the bottom: **Today** (what's next and last night's sleep), **Plan** (your reminders),
**Progress** (sleep score) and **More** (account and Apple Watch setup).

## Reminders
Create reminders in sections: wake up, personal hygiene, breakfast, lunch, dinner, gym and bedtime.
Pick a time and which days it repeats.

- **iPhone:** notifications are scheduled on the phone itself, so they arrive even when the app is closed. Free.
- **Website:** your browser shows a desktop notification while the site is open in a tab. Free.

To add a section, add a line to `src/lib/categories.ts`.

## Sync between phone and website
Sign in with the same email on both, and reminders stay in sync through Supabase (free plan).
Setup is one time: in Supabase open **SQL Editor**, paste `supabase/schema.sql`, and click **Run**.
The project address and public key live in `.env`.

## Sleep score (Apple Watch)
Expo Go can't read Apple Health directly, so a free iPhone Shortcut sends last night's sleep each morning.
Setup: run `supabase/sleep.sql` once in Supabase, then follow [docs/apple-watch-sleep.md](docs/apple-watch-sleep.md).
The score formula is in `src/lib/sleep.ts`.

## Try it
```bash
npm install
npx expo start        # scan the QR code with the Camera app, opens in Expo Go on iPhone
npx expo start --web  # opens the website in your browser
```

## Online
- Website: https://idas05.github.io/wellness-app (published on every merge to main)
- App: published to Expo Go on every merge to main, so it opens without your Mac
