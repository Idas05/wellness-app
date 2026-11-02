# Wellness

One codebase for the iPhone app and the website, built with Expo.

## Reminders
Create reminders in sections: skin care, bedtime, breakfast, lunch, dinner, gym and brushing teeth.
Pick a time and which days it repeats.

- **iPhone:** notifications are scheduled on the phone itself, so they arrive even when the app is closed. Free.
- **Website:** your browser shows a desktop notification while the site is open in a tab. Free.

To add a section, add a line to `src/lib/categories.ts`.

## Try it
```bash
npm install
npx expo start        # scan the QR code with the Camera app, opens in Expo Go on iPhone
npx expo start --web  # opens the website in your browser
```
