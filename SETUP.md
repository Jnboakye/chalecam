# Chalecam Setup Guide

## Prerequisites

1. Node.js and npm installed
2. Expo CLI installed globally: `npm install -g expo-cli`
3. Firebase project created

## Installation

1. Install dependencies:
```bash
npm install
```

## Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select an existing one
3. Enable the following services:

### Authentication
- Go to Authentication > Sign-in method
- Enable **Email/Password**
- Enable **Google** (you'll need to configure OAuth credentials)

### Firestore Database
- Go to Firestore Database
- Create database in **production mode** (we'll add security rules)
- Copy the security rules from the main README

### Storage
- Go to Storage
- Get started with default rules
- Copy the storage rules from the main README

4. Get your Firebase config:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - If you don't have a web app, click "Add app" > Web
   - Copy the config values

5. Update `config/firebase.js` with your Firebase config:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Google Sign-In Setup

1. In Firebase Console, go to Authentication > Sign-in method > Google
2. Enable Google sign-in
3. For iOS: Add your iOS bundle identifier
4. For Android: Add your SHA-1 fingerprint
5. Update `contexts/AuthContext.js` with your OAuth client IDs:
   - iOS Client ID
   - Android Client ID  
   - Web Client ID

## Firestore Security Rules

Copy these rules to Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.ownerId 
                    || request.auth.uid in resource.data.participants;
    }
    match /photos/{photoId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
```

## Storage Security Rules

Copy these rules to Storage > Rules in Firebase Console (Storage > Rules). **You must add the `events/covers/` rule** so cover image uploads work:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Event cover images (uploaded when creating/editing an event)
    match /events/covers/{fileName} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 10 * 1024 * 1024;
    }
    // Event photo gallery
    match /events/{eventId}/photos/{photoId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

## Running the App

1. Start the Expo development server:
```bash
npm start
```

2. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

3. Or run on a specific platform:
```bash
npm run android
# or
npm run ios
```

## Project Structure

```
chalecam/
├── App.js                 # Main app entry with navigation
├── config/
│   └── firebase.js        # Firebase configuration
├── contexts/
│   └── AuthContext.js     # Authentication context
├── screens/
│   ├── LoginScreen.js
│   ├── RegisterScreen.js
│   ├── HomeScreen.js
│   ├── CreateEventScreen.js
│   ├── EventDetailScreen.js
│   ├── JoinEventScreen.js
│   ├── EventGalleryScreen.js
│   ├── CameraScreen.js
│   └── PhotoDetailScreen.js
├── components/
│   └── EventCard.js
└── utils/
    └── helpers.js
```

## Features Implemented

✅ Email and Google authentication
✅ Create events with customizable settings
✅ QR code and 6-digit code sharing
✅ Join events via QR scan or code entry
✅ Real-time photo sharing
✅ Camera and gallery uploads
✅ Photo upload limits per user
✅ Approval system for private events
✅ Event status tracking (Upcoming/Active/Ended)
✅ Photo gallery with grid view
✅ Photo detail view with navigation

## Testing Checklist

- [ ] Register new account with email
- [ ] Sign in with Google
- [ ] Create an event
- [ ] Share event via QR code
- [ ] Join event with 6-digit code
- [ ] Join event with QR scanner
- [ ] Upload photo from camera
- [ ] Upload photos from gallery (test limit)
- [ ] Test approval system (create event with approval required)
- [ ] View photos in gallery
- [ ] Navigate between photos in detail view

## Troubleshooting

### Camera not working
- Check app permissions in device settings
- Ensure camera permissions are granted

### Firebase errors
- Verify Firebase config is correct
- Check Firestore and Storage rules are deployed
- Ensure authentication methods are enabled

### Navigation errors
- Clear cache: `expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`

