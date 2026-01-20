import { initializeApp, getApps, getApp } from 'firebase/app';
// Import Firebase Auth module to ensure it's loaded
import 'firebase/auth';
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
  FIREBASE_MEASUREMENT_ID,
} from '@env';

// Validate environment variables
if (!FIREBASE_API_KEY || !FIREBASE_PROJECT_ID || !FIREBASE_APP_ID) {
  console.error('Firebase configuration is missing. Please check your .env file.');
  console.error('Missing values:', {
    apiKey: !!FIREBASE_API_KEY,
    projectId: !!FIREBASE_PROJECT_ID,
    appId: !!FIREBASE_APP_ID,
  });
  throw new Error('Firebase configuration is incomplete. Check your .env file and restart the app.');
}

// Firebase configuration
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
  measurementId: FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase App (only if not already initialized)
const isFirstAppInit = getApps().length === 0;
let app;
try {
  app = isFirstAppInit ? initializeApp(firebaseConfig) : getApp();
  console.log('Firebase app initialized successfully');
  
  // Ensure app is fully ready before proceeding
  if (!app) {
    throw new Error('Firebase app initialization returned null');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Initialize Auth with AsyncStorage persistence for React Native
let auth;

try {
  // For first initialization, use initializeAuth with AsyncStorage
  if (isFirstAppInit) {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    console.log('Firebase Auth initialized with AsyncStorage persistence');
  } else {
    // App already initialized, get existing instance
    auth = getAuth(app);
    console.log('Firebase Auth: Using existing instance');
  }
} catch (error) {
  // Handle different error scenarios
  if (error.code === 'auth/already-initialized') {
    // Already initialized, just get it
    auth = getAuth(app);
    console.log('Firebase Auth: Already initialized, using existing instance');
  } else if (error.code === 'auth/use-before-initialization' || 
             error.message?.includes('not been registered') ||
             error.message?.includes('Component auth has not been registered')) {
    // Auth not registered yet, try initializeAuth
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
      console.log('Firebase Auth: Initialized after error recovery');
    } catch (initError) {
      console.error('Failed to initialize Firebase Auth:', initError);
      // Last resort: try getAuth (will show warning but might work)
      try {
        auth = getAuth(app);
        console.warn('Firebase Auth: Using getAuth fallback (persistence warning expected)');
      } catch (finalError) {
        console.error('All Firebase Auth initialization methods failed');
        throw new Error('Firebase Auth could not be initialized. Please restart the app after clearing cache.');
      }
    }
  } else {
    console.error('Unexpected error initializing Firebase Auth:', error);
    throw error;
  }
}

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

export { auth };
export default app;

