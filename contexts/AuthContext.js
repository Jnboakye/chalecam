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
import Constants from 'expo-constants';
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
  // Strategy: Try different approaches based on what works
  // For development builds: Can use custom scheme OR Expo proxy
  // For Expo Go: Must use Expo proxy
  
  // Check if we're in a development build (not Expo Go)
  const isDevelopmentBuild = Constants.executionEnvironment !== 'storeClient';
  
  // OPTION 1: Use Expo proxy (current approach - works for both)
  // OPTION 2: Use custom scheme directly (only for dev builds - uncomment to try)
  const redirectUri = AuthSession.makeRedirectUri({
    useProxy: true, // Keep using proxy for now
    // If proxy doesn't work, try: useProxy: false, scheme: 'chalecam'
  });

  // Ensure we use the correct redirect URI with your username
  const finalRedirectUri = redirectUri.includes('@jnboakye')
    ? redirectUri
    : 'https://auth.expo.io/@jnboakye/chalecam';

  // Log which redirect URI we're using
  console.log('=== REDIRECT URI CONFIGURATION ===');
  console.log('Is Development Build:', isDevelopmentBuild);
  console.log('Execution Environment:', Constants.executionEnvironment);
  console.log('Redirect URI:', finalRedirectUri);
  console.log('Using Expo Proxy: true');
  console.log('==================================');

  // Configure Google OAuth
  // Switch back to Web Client ID - it was working better before
  // The iOS Client ID might be causing the mismatch
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_WEB_CLIENT_ID, // Use Web Client ID (works with HTTPS redirects)
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_WEB_CLIENT_ID,
    redirectUri: finalRedirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  // Debug logging
  console.log('=== GOOGLE OAUTH SETUP ===');
  console.log('Platform:', Platform.OS);
  console.log('Is Development Build:', isDevelopmentBuild);
  console.log('Redirect URI:', finalRedirectUri);
  console.log('Web Client ID:', GOOGLE_WEB_CLIENT_ID);
  console.log('');
  console.log('⚠️ GOOGLE CLOUD CONSOLE CONFIGURATION:');
  console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
  console.log('2. Select your project: chalecam-c7da2');
  console.log('');
  console.log('3. Configure iOS Client ID:');
  console.log('   Client ID: 315065179459-5hpk59jcibhhmva3cam0olcjlilg4abr.apps.googleusercontent.com');
  console.log('   - Bundle ID should be: com.chalecam.app');
  console.log('   - Under "Authorized redirect URIs", add:');
  console.log('     https://auth.expo.io/@jnboakye/chalecam');
  console.log('');
  console.log('4. Configure Web Client ID (backup):');
  console.log('   Client ID: 315065179459-ea0uemlu4egagj1n7phvc2ocoohe30uh.apps.googleusercontent.com');
  console.log('   - Under "Authorized redirect URIs", ensure this is added:');
  console.log('     https://auth.expo.io/@jnboakye/chalecam');
  console.log('   - Under "Authorized JavaScript origins", ensure this is added:');
  console.log('     https://auth.expo.io');
  console.log('');
  console.log('⚠️ OAUTH CONSENT SCREEN CHECK:');
  console.log('1. Go to: APIs & Services → OAuth consent screen');
  console.log('2. Check "Publishing status":');
  console.log('   - If "Testing": Only test users can sign in');
  console.log('   - Make sure your email is added as a test user');
  console.log('');
  console.log('5. Click "Save" on both clients and wait 5-10 minutes for changes to propagate');
  console.log('==========================');

  // Additional debug: Log the actual OAuth request details
  useEffect(() => {
    if (googleRequest?.url) {
      try {
        const urlObj = new URL(googleRequest.url);
        const clientIdParam = urlObj.searchParams.get('client_id');
        const redirectParam = urlObj.searchParams.get('redirect_uri');
        const redirectParamDecoded = decodeURIComponent(redirectParam || '');
        
        console.log('=== OAUTH REQUEST DETAILS ===');
        console.log('Full OAuth URL:', googleRequest.url);
        console.log('Client ID being used:', clientIdParam);
        console.log('Redirect URI (URL-encoded):', redirectParam);
        console.log('Redirect URI (decoded):', redirectParamDecoded);
        console.log('Expected Client ID:', GOOGLE_WEB_CLIENT_ID);
        console.log('Expected Redirect URI:', finalRedirectUri);
        console.log('');
        console.log('⚠️ VERIFY IN GOOGLE CLOUD CONSOLE:');
        console.log('1. Go to: https://console.cloud.google.com/apis/credentials');
        console.log('2. Click Web Client ID:', GOOGLE_WEB_CLIENT_ID);
        console.log('3. Under "Authorized redirect URIs", check:');
        console.log('   - Does this EXACT URI exist?', redirectParamDecoded);
        console.log('   - No trailing slash?', !redirectParamDecoded.endsWith('/'));
        console.log('   - Exact case match? (case-sensitive)');
        console.log('   - No extra spaces?');
        console.log('');
        console.log('4. If not found, ADD this EXACT URI:');
        console.log('   ', redirectParamDecoded);
        console.log('');
        if (clientIdParam !== GOOGLE_WEB_CLIENT_ID) {
          console.error('❌ ERROR: Client ID mismatch!');
          console.error('   Expected:', GOOGLE_WEB_CLIENT_ID);
          console.error('   Got:', clientIdParam);
        }
        if (redirectParamDecoded !== finalRedirectUri) {
          console.warn('⚠️ WARNING: Redirect URI mismatch!');
          console.warn('   Expected:', finalRedirectUri);
          console.warn('   Got (decoded):', redirectParamDecoded);
        }
        console.log('=============================');
      } catch (e) {
        console.error('Could not parse OAuth request URL:', e);
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
        // Set user state immediately so navigation happens right away
        // Don't wait for Firestore operations
        setUser(user);
        setLoading(false);
        
        // Then try to fetch/update Firestore document in background
        // This won't block navigation
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            // Update user state with Firestore data
            setUser({ ...user, ...userDoc.data() });
          } else {
            // Create user document if it doesn't exist
            try {
              await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email?.split('@')[0] || 'User',
                photoURL: user.photoURL || null,
                createdAt: new Date(),
                eventsCreated: [],
                eventsJoined: []
              });
              // Update with display name
              setUser({ 
                ...user, 
                displayName: user.displayName || user.email?.split('@')[0] || 'User' 
              });
            } catch (firestoreError) {
              // Firestore failed, but user is still signed in
              // Keep the user state as is
              console.error('Error creating user document:', firestoreError);
            }
          }
        } catch (error) {
          // Firestore error, but user is still signed in
          // User state is already set above, so navigation will work
          console.error('Error fetching user document:', error);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Handle Google Sign-In Response
  useEffect(() => {
    if (!auth) {
      console.error('❌ Firebase Auth is not initialized');
      Alert.alert('Error', 'Firebase Auth is not initialized');
      return;
    }

    // Debug: Log whenever googleResponse changes
    if (googleResponse) {
      console.log('=== GOOGLE RESPONSE RECEIVED ===');
      console.log('Response type:', googleResponse.type);
      console.log('Full response:', JSON.stringify(googleResponse, null, 2));
      console.log('Has params:', !!googleResponse.params);
      console.log('Has authentication:', !!googleResponse.authentication);
      if (googleResponse.params) {
        console.log('Params keys:', Object.keys(googleResponse.params));
        console.log('Params:', JSON.stringify(googleResponse.params, null, 2));
      }
      if (googleResponse.authentication) {
        console.log('Authentication keys:', Object.keys(googleResponse.authentication));
        console.log('Authentication:', JSON.stringify(googleResponse.authentication, null, 2));
      }
      if (googleResponse.error) {
        console.error('Response error:', googleResponse.error);
      }
      console.log('================================');
    }

    if (googleResponse?.type === 'success') {
      console.log('✅ Google response type is SUCCESS');
      
      // expo-auth-session with proxy returns an authorization code that needs to be exchanged
      // Check if we have a code that needs to be exchanged for tokens
      const authCode = googleResponse.params?.code;
      console.log('Authorization code:', authCode ? `${authCode.substring(0, 20)}...` : 'NOT FOUND');
      
      // Try multiple locations for id_token
      // expo-auth-session may return it in different places depending on configuration
      let id_token = 
        googleResponse.params?.id_token ||           // Most common location
        googleResponse.authentication?.idToken ||    // Alternative location
        googleResponse.params?.idToken;              // Another possible location

      console.log('ID Token locations checked:');
      console.log('  - params.id_token:', googleResponse.params?.id_token ? 'FOUND' : 'NOT FOUND');
      console.log('  - authentication.idToken:', googleResponse.authentication?.idToken ? 'FOUND' : 'NOT FOUND');
      console.log('  - params.idToken:', googleResponse.params?.idToken ? 'FOUND' : 'NOT FOUND');
      console.log('Final id_token:', id_token ? `${id_token.substring(0, 20)}...` : 'NOT FOUND');

      // If we have a code but no id_token, we need to exchange it
      if (authCode && !id_token) {
        console.error('❌ Have authorization code but no id_token. Token exchange may have failed.');
        Alert.alert(
          'Token Exchange Needed',
          `Received authorization code but need to exchange it for token.\n\nCode: ${authCode.substring(0, 20)}...\n\nThis should happen automatically. Please try again.`
        );
        return;
      }

      // If no id_token found and no code, show error
      if (!id_token) {
        console.error('❌ No id_token found in response');
        console.error('Response structure:', JSON.stringify(googleResponse, null, 2));
        Alert.alert(
          'Sign In Error',
          `Could not retrieve authentication token.\n\nResponse type: ${googleResponse.type}\nHas params: ${!!googleResponse.params}\nParams keys: ${googleResponse.params ? Object.keys(googleResponse.params).join(', ') : 'none'}`
        );
        return;
      }

      console.log('✅ ID Token found, proceeding with Firebase sign-in');

      // Create Firebase credential with the id_token
      console.log('Creating Firebase credential...');
      let credential;
      try {
        credential = GoogleAuthProvider.credential(id_token);
        console.log('✅ Credential created successfully');
      } catch (error) {
        console.error('❌ Failed to create credential:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack
        });
        Alert.alert(
          'Credential Error',
          `Failed to create credential: ${error.message}`
        );
        return;
      }
      
      if (!credential) {
        console.error('❌ Credential is null or undefined');
        Alert.alert(
          'Sign In Error',
          'Failed to create authentication credential. Please try again.'
        );
        return;
      }

      // Sign in to Firebase
      console.log('Attempting Firebase sign-in with credential...');
      signInWithCredential(auth, credential)
        .then(async (result) => {
          // Sign-in successful!
          const signedInUser = result.user;
          console.log('✅ Firebase sign-in successful!');
          console.log('User UID:', signedInUser.uid);
          console.log('User email:', signedInUser.email);
          console.log('User display name:', signedInUser.displayName);
          
          // Show success message
          Alert.alert(
            'Sign In Successful',
            `Welcome ${signedInUser.email || 'User'}!\n\nYou should be redirected to the home screen now.`,
            [{ text: 'OK' }]
          );
          
          // The onAuthStateChanged listener should fire automatically
          // and update the user state, which will trigger navigation
          // But let's also manually check if it worked
          setTimeout(() => {
            if (auth.currentUser) {
              console.log('✅ auth.currentUser exists:', auth.currentUser.uid);
              // User is signed in, navigation should happen via onAuthStateChanged
            } else {
              console.error('❌ auth.currentUser is null after sign-in');
              Alert.alert(
                'Warning',
                'Sign-in completed but user state not updated. Please try refreshing the app.'
              );
            }
          }, 1000);
        })
        .catch((error) => {
          // Firebase Auth sign-in failed
          console.error('❌ Firebase sign-in failed!');
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);
          console.error('Full error:', JSON.stringify(error, null, 2));
          
          let errorMessage = `Failed to sign in with Google.\n\nError code: ${error.code || 'unknown'}\nError message: ${error.message || 'Unknown error'}`;
          
          // Provide more specific error messages
          if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid authentication token. The token may have expired or is invalid. Please try signing in again.';
          } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Network error. Please check your internet connection and try again.';
          } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many sign-in attempts. Please try again later.';
          }
          
          Alert.alert('Sign In Failed', errorMessage);
        });
    } else if (googleResponse?.type === 'cancel') {
      // User canceled the OAuth flow OR redirect failed
      console.warn('⚠️ Google OAuth was CANCELED');
      console.warn('This usually means:');
      console.warn('  1. User closed the browser/WebView');
      console.warn('  2. Redirect back to app failed');
      console.warn('  3. Deep link not properly configured');
      console.warn('Full response:', JSON.stringify(googleResponse, null, 2));
      
      // Don't show an error for cancel - user might have intentionally canceled
      // But log it for debugging
    } else if (googleResponse?.type === 'error') {
      // OAuth flow returned an error
      console.error('❌ Google OAuth returned ERROR type');
      console.error('Error object:', googleResponse.error);
      console.error('Error params:', googleResponse.params);
      console.error('Full error response:', JSON.stringify(googleResponse, null, 2));
      
      const errorMessage = 
        `OAuth Error\n\n` +
        `Error: ${googleResponse.error?.message || 'Unknown error'}\n` +
        `Error description: ${googleResponse.params?.error_description || 'None'}\n` +
        `Error code: ${googleResponse.params?.error || 'None'}`;
      Alert.alert('Sign In Failed', errorMessage);
    } else if (googleResponse) {
      // Unknown response type
      console.warn('⚠️ Unknown Google response type:', googleResponse.type);
      console.warn('Full response:', JSON.stringify(googleResponse, null, 2));
      
      // For "cancel" type, don't show error - it's expected if user cancels
      if (googleResponse.type !== 'cancel') {
        Alert.alert(
          'Unknown Response',
          `Unexpected response type: ${googleResponse.type}\n\nFull response: ${JSON.stringify(googleResponse)}`
        );
      }
    }
  }, [googleResponse, auth]);

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
      console.log('🚀 Starting Google sign-in...');
      console.log('Redirect URI:', finalRedirectUri);
      console.log('Request URL:', googleRequest?.url);
      const result = await googlePromptAsync();
      console.log('📱 Google prompt result:', result);
    } catch (error) {
      console.error('❌ Google sign-in prompt error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      Alert.alert('Error', `Failed to start Google sign-in: ${error.message}`);
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
