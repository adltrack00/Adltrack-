# Delivery for Android and iPhone

The phone app is the Delivery web app (the same logins, dashboards and live data) inside a native shell with the
camera for doorstep photos, the Android back button and pull-to-refresh. Anything you change in the web app shows up
in the phone app on the next open, without a new app release.

## Try it on your phone today

1. Set your Render address in `app.json` → `expo.extra.appUrl` (for example `https://delivery.onrender.com`).
2. `cd mobile && npm install && npx expo start`
3. Scan the QR code with the **Expo Go** app (Android) or the Camera app (iPhone).

Riders can also skip the app store entirely: open the Render address in Chrome or Safari and tap
**Add to Home Screen**. It opens full screen like an app.

## Build the installable apps

1. `npm install -g eas-cli && eas login` (free Expo account)
2. Android APK you can send to riders directly: `npm run build:android`
3. iPhone (needs an Apple Developer account): `npm run build:ios`, then `eas submit -p ios`
4. Google Play: `eas build -p android --profile production`, then `eas submit -p android`
