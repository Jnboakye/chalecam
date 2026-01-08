# Chalecam

A React Native mobile app for collaborative event photo sharing. Users create events, share QR codes/links, and attendees upload photos to a shared album during the event.

## Tech Stack

- React Native (Expo)
- Firebase (Authentication, Firestore, Storage)
- React Navigation (Bottom Tabs + Stack)
- Context API for state management

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password and Google Sign-In)
   - Create Firestore database
   - Enable Storage
   - Copy your Firebase config to `config/firebase.js`

3. Start the app:
```bash
npm start
```

## Firebase Configuration

Update `config/firebase.js` with your Firebase project credentials.

## Features

- Email and Google authentication
- Create and join events
- QR code and 6-digit code sharing
- Real-time photo sharing
- Camera and gallery uploads
- Approval system for private events
- Photo upload limits per user

# chalecam
