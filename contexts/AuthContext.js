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
import { Alert, Linking, Platform } from 'react-native';
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

  // Google OAuth Configuration
  // Strategy: Use Web Client ID for all platforms to support HTTPS redirect URIs
  // The Web Client ID accepts HTTPS redirects like https://auth.expo.io/@jnboakye/chalecam
  // iOS Client IDs expect custom URL schemes, which don't work with Expo's proxy
  
  // Generate redirect URI using Expo's HTTPS proxy
  // This creates: https://auth.expo.io/@jnboakye/chalecam
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true, // Use Expo's HTTPS proxy for OAuth redirects
  });

  // Ensure we use the correct redirect URI with your username
  const finalRedirectUri = redirectUri.includes('@jnboakye')
    ? redirectUri
    : 'https://auth.expo.io/@jnboakye/chalecam';

  // Configure Google OAuth
  // Use Web Client ID for iosClientId (required on iOS) to support HTTPS redirects
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_WEB_CLIENT_ID, // Web Client ID works with HTTPS redirects
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri: finalRedirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  // Debug logging
  console.log('=== GOOGLE OAUTH SETUP ===');
  console.log('Platform:', Platform.OS);
  console.log('Redirect URI:', finalRedirectUri);
  console.log('Web Client ID:', GOOGLE_WEB_CLIENT_ID);
  console.log('');
  console.log('⚠️ GOOGLE CLOUD CONSOLE CONFIGURATION:');
  console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
  console.log('2. Select your project: chalecam-c7da2');
  console.log('3. Click on Web Client ID:');
  console.log('   315065179459-ea0uemlu4egagj1n7phvc2ocoohe30uh.apps.googleusercontent.com');
  console.log('4. Under "Authorized redirect URIs", add:');
  console.log('   https://auth.expo.io/@jnboakye/chalecam');
  console.log('5. Under "Authorized JavaScript origins", add:');
  console.log('   https://auth.expo.io');
  console.log('6. Click "Save" and wait a few minutes for changes to propagate');
  console.log('==========================');

  // Additional debug: Log the actual OAuth request details
  useEffect(() => {
    if (googleRequest?.url) {
      try {
        const urlObj = new URL(googleRequest.url);
        const clientIdParam = urlObj.searchParams.get('client_id');
        const redirectParam = urlObj.searchParams.get('redirect_uri');
        console.log('=== OAUTH REQUEST DETAILS ===');
        console.log('Client ID being used:', clientIdParam);
        console.log('Redirect URI in request:', redirectParam);
        console.log('Expected Client ID:', GOOGLE_WEB_CLIENT_ID);
        console.log('Expected Redirect URI:', finalRedirectUri);
        if (clientIdParam !== GOOGLE_WEB_CLIENT_ID) {
          console.warn('⚠️ WARNING: Client ID mismatch!');
        }
        if (redirectParam !== finalRedirectUri) {
          console.warn('⚠️ WARNING: Redirect URI mismatch!');
        }
        console.log('=============================');
      } catch (e) {
        console.log('Could not parse OAuth request URL');
      }
    }
  }, [googleRequest, finalRedirectUri]);

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
