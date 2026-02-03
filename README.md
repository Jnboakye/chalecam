# Chalecam

A React Native (Expo) app for **collaborative event photo sharing**. Create events, share a QR code or link, and let guests contribute photos to a shared album—during the event in real time or after, on your schedule.

---

## Features

- **Authentication** — Email/password and Google Sign-In
- **Create events** — Name, cover image, start/end time, max guests, photos per guest
- **Album reveal** — During the event (real time), or after: 12h, 24h, or a custom date/time
- **Share** — QR code and 6-digit event code; join by scanning or entering the code
- **Photos** — Take photos in-app or upload from camera roll (with per-guest limits)
- **Event management** — Edit event details or delete an event (owner only); confirm before delete
- **Pending approvals** — Optional approval flow so the owner can approve join requests
- **Theme** — Light/dark mode with theme-aware UI across the app
- **Event status** — Upcoming / Active / Ended with live Firestore updates

---

## Tech Stack

| Layer        | Tech |
|-------------|------|
| Framework   | React Native (Expo SDK 54) |
| Auth & Data | Firebase (Auth, Firestore, Storage) |
| Navigation  | React Navigation (Stack + Bottom Tabs) |
| State       | React Context (Auth, Theme) |
| UI          | StyleSheet + theme tokens, NativeWind/Tailwind available |

---

## Prerequisites

- **Node.js** (v18+)
- **npm** or yarn
- **Expo Go** on your device (for `npm start`), or Xcode / Android Studio for `expo run:ios` / `expo run:android`
- **Firebase project** with Auth (Email/Password + Google), Firestore, and Storage enabled

---

## Quick Start

### 1. Clone and install

```bash
cd chalecam
npm install
```

### 2. Environment variables

Create a `.env` file in the project root (see [SETUP.md](./SETUP.md) for Firebase and Google OAuth setup):

```env
# Firebase (from Firebase Console > Project settings)
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MEASUREMENT_ID=

# Google OAuth (for Google Sign-In)
GOOGLE_WEB_CLIENT_ID=
# Optional: GOOGLE_IOS_CLIENT_ID= for native iOS build
```

### 3. Run the app

```bash
# Start Expo dev server (then scan QR with Expo Go or press i/a for simulator)
npm start

# Or run native build
npm run ios
npm run android
```

For full Firebase setup, Firestore/Storage rules, and Google Sign-In configuration, see **[SETUP.md](./SETUP.md)**.

---

## Project Structure

```
chalecam/
├── App.js                    # Root: navigation (Auth stack, Main stack, tabs)
├── app.json                  # Expo config (name, slug, permissions, plugins)
├── config/
│   └── firebase.js           # Firebase init (Auth persistence, Firestore, Storage)
├── contexts/
│   ├── AuthContext.js        # Auth state, sign in/up/out, Google OAuth
│   └── ThemeContext.js       # Light/dark theme
├── screens/
│   ├── LoginScreen.js        # Sign-in entry (email vs Google)
│   ├── EmailLoginScreen.js   # Email/password sign-in
│   ├── RegisterScreen.js     # Email/password sign-up
│   ├── HomeScreen.js         # Events list (tab)
│   ├── CreateEventScreen.js  # Entry → EventName (create flow)
│   ├── EventNameScreen.js    # Event name
│   ├── CoverImageScreen.js   # Cover image picker
│   ├── TimelineScreen.js     # Start/end date, reveal (during / after: 12h, 24h, custom)
│   ├── GuestsScreen.js       # Max guests
│   ├── PhotosPerGuestScreen.js # Photos per guest / unlimited
│   ├── EventSummaryScreen.js # Preview + Save (create or update)
│   ├── EventDetailScreen.js  # Event details, QR, edit/delete, view photos
│   ├── JoinEventScreen.js    # Join by code or QR scan (tab)
│   ├── EventGalleryScreen.js # Event photo gallery
│   ├── CameraScreen.js       # In-app camera
│   ├── PhotoDetailScreen.js  # Single photo view
│   └── SettingsScreen.js     # Settings (tab)
├── components/
│   ├── EventCard.js          # Event list card
│   └── Icons.js              # Tab/icons
├── utils/
│   └── helpers.js            # formatDate, getEventStatus, generate6DigitCode
├── .env                      # Not committed; copy from SETUP.md
├── SETUP.md                  # Detailed Firebase & Google setup
└── README.md                 # This file
```

---

## Scripts

| Command           | Description                    |
|-------------------|--------------------------------|
| `npm start`       | Start Expo dev server          |
| `npm run ios`     | Run iOS app (native build)     |
| `npm run android` | Run Android app (native build) |
| `npm run web`     | Start for web                  |

---

## License

Private project.
