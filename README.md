# Wellness

One codebase for the iPhone app and the website, built with Expo.

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

## Try it
```bash
npm install
npx expo start        # scan the QR code with the Camera app, opens in Expo Go on iPhone
npx expo start --web  # opens the website in your browser
```
