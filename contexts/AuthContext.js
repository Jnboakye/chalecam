import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Linking } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import {
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from '@env';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Google Auth Configuration
  // Force HTTPS proxy URL for local development (Google doesn't accept exp:// URIs)
  // The HTTPS proxy works even in local development
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true, // Force HTTPS proxy (works in local dev)
  });

  // If it still generates exp://, force the HTTPS proxy URL
  const finalRedirectUri = redirectUri.startsWith('exp://') 
    ? 'https://auth.expo.io/@anonymous/chalecam'
    : redirectUri;

  console.log('=== GOOGLE OAUTH REDIRECT URI ===');
  console.log('Generated:', redirectUri);
  console.log('Using:', finalRedirectUri);
  console.log('Make sure this URL is in Google Cloud Console Web Client ID');
  console.log('==================================');

  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID, // Required for iOS
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri: 'https://auth.expo.io/@anonymous/chalecam', // Force HTTPS proxy URL
    scopes: ['openid', 'profile', 'email'],
  });

  // Debug: Log the request configuration
  if (googleRequest) {
    console.log('Google Auth Request Config:', {
      redirectUri: googleRequest.redirectUri || 'not set',
      clientId: googleRequest.clientId || 'not set',
      url: googleRequest.url || 'not set',
    });
  }

  // Facebook Auth Configuration
  // Note: You'll need to add FACEBOOK_APP_ID to your .env file
  // Get it from Facebook Developers Console -> Settings -> Basic
  const [facebookRequest, facebookResponse, facebookPromptAsync] = Facebook.useAuthRequest({
    clientId: 'YOUR_FACEBOOK_APP_ID', // Replace with actual Facebook App ID
  });

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user document from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUser({ ...user, ...userDoc.data() });
          } else {
            // Create user document if it doesn't exist
            await setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              photoURL: user.photoURL || null,
              createdAt: new Date(),
              eventsCreated: [],
              eventsJoined: []
            });
            setUser({ ...user, displayName: user.displayName || user.email?.split('@')[0] || 'User' });
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Handle Google Sign-In Response
  useEffect(() => {
    if (!auth) return;

    if (googleResponse?.type === 'success') {
      const { id_token } = googleResponse.params;
      const credential = GoogleAuthProvider.credential(id_token);
      
      signInWithCredential(auth, credential)
        .then(async (result) => {
          const user = result.user;
          // Create or update user document
          try {
            await setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              photoURL: user.photoURL || null,
              createdAt: new Date(),
              eventsCreated: [],
              eventsJoined: []
            }, { merge: true });
          } catch (error) {
            console.error('Error saving user document:', error);
          }
        })
        .catch((error) => {
          console.error('Google sign-in error:', error);
          Alert.alert('Sign In Failed', error.message || 'Failed to sign in with Google');
        });
    } else if (googleResponse?.type === 'error') {
      Alert.alert('Sign In Failed', 'Failed to sign in with Google');
    }
  }, [googleResponse]);

  // Handle Facebook Sign-In Response
  useEffect(() => {
    if (!auth) return;

    if (facebookResponse?.type === 'success') {
      const { access_token } = facebookResponse.params;
      const credential = FacebookAuthProvider.credential(access_token);
      
      signInWithCredential(auth, credential)
        .then(async (result) => {
          const user = result.user;
          // Create or update user document
          try {
            await setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              photoURL: user.photoURL || null,
              createdAt: new Date(),
              eventsCreated: [],
              eventsJoined: []
            }, { merge: true });
          } catch (error) {
            console.error('Error saving user document:', error);
          }
        })
        .catch((error) => {
          console.error('Facebook sign-in error:', error);
          Alert.alert('Sign In Failed', error.message || 'Failed to sign in with Facebook');
        });
    } else if (facebookResponse?.type === 'error') {
      Alert.alert('Sign In Failed', 'Failed to sign in with Facebook');
    }
  }, [facebookResponse]);

  const login = async (email, password) => {
    if (!auth) {
      return { success: false, error: 'Authentication is not configured yet' };
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      let errorMessage = 'An error occurred during sign in';
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled';
          break;
        default:
          errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name, email, password) => {
    if (!auth) {
      return { success: false, error: 'Authentication is not configured yet' };
    }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Update display name
      await updateProfile(user, { displayName: name });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        photoURL: null,
        createdAt: new Date(),
        eventsCreated: [],
        eventsJoined: []
      });

      return { success: true, user };
    } catch (error) {
      let errorMessage = 'An error occurred during registration';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak';
          break;
        default:
          errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    }
  };

  const signInWithGoogle = async () => {
    if (!auth) {
      Alert.alert('Error', 'Authentication is not configured yet');
      return;
    }
    try {
      await googlePromptAsync();
    } catch (error) {
      console.error('Google sign-in prompt error:', error);
      Alert.alert('Error', 'Failed to start Google sign-in');
    }
  };

  const signInWithFacebook = async () => {
    if (!auth) {
      Alert.alert('Error', 'Authentication is not configured yet');
      return;
    }
    try {
      await facebookPromptAsync();
    } catch (error) {
      console.error('Facebook sign-in prompt error:', error);
      Alert.alert('Error', 'Failed to start Facebook sign-in');
    }
  };

  const logout = async () => {
    if (!auth) {
      return { success: false, error: 'Authentication is not configured yet' };
    }
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    signInWithGoogle,
    signInWithFacebook,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
