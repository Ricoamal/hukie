import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  updateProfile,
  User,
  UserCredential
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Auth Provider
// Add scopes for Google provider
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Set custom parameters
googleProvider.setCustomParameters({
  // Force account selection even when one account is available
  prompt: 'select_account',
  // Allow redirect to mobile apps (if applicable)
  // This helps with mobile authentication flows
  mobile_redirect: 'true'
});

// Auth functions
export const signInWithEmail = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Import already moved to the top

export const signInWithGoogle = async (): Promise<UserCredential | null> => {
  try {
    console.log('Attempting Google sign-in with popup...');
    // Try popup first
    const result = await signInWithPopup(auth, googleProvider);
    console.log('Google sign-in successful:', result.user.email);

    // Get the Google Access Token
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    console.log('Google access token obtained:', token ? 'Yes' : 'No');

    return result;
  } catch (error: any) {
    console.error('Google sign-in error:', error.code, error.message);
    console.error('Error details:', error);

    // Handle specific error cases
    switch(error.code) {
      case 'auth/popup-blocked':
      case 'auth/popup-closed-by-user':
        console.log('Popup blocked or closed, trying redirect method...');
        // Use redirect method instead
        try {
          await signInWithRedirect(auth, googleProvider);
          // This won't return immediately - user will be redirected
          return null;
        } catch (redirectError) {
          console.error('Redirect error:', redirectError);
          throw redirectError;
        }

      case 'auth/cancelled-popup-request':
        console.log('Popup request cancelled, likely multiple popups');
        // Just throw the error, let the UI handle it
        throw error;

      case 'auth/network-request-failed':
        console.error('Network error during authentication');
        throw error;

      default:
        // For any other errors, just throw them
        throw error;
    }
  }
};

export const getGoogleRedirectResult = async (): Promise<UserCredential | null> => {
  try {
    console.log('Checking for redirect result...');
    const result = await getRedirectResult(auth);

    if (result) {
      console.log('Redirect sign-in successful:', result.user.email);

      // Get the Google Access Token
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      console.log('Google access token obtained:', token ? 'Yes' : 'No');
    } else {
      console.log('No redirect result found');
    }

    return result;
  } catch (error: any) {
    console.error('Error getting redirect result:', error.code, error.message);
    console.error('Error details:', error);

    // Handle specific error cases
    if (error.code === 'auth/operation-not-supported-in-this-environment') {
      console.error('Redirect not supported in this environment');
    }

    throw error;
  }
};

export const updateUserProfile = async (user: User, displayName: string, photoURL?: string) => {
  return updateProfile(user, { displayName, photoURL: photoURL || null });
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const logCurrentUser = () => {
  const user = auth.currentUser;
  if (user) {
    console.log('Current Firebase User:', {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      providerData: user.providerData.map(provider => ({
        providerId: provider.providerId,
        uid: provider.uid,
        displayName: provider.displayName,
        email: provider.email,
        phoneNumber: provider.phoneNumber,
        photoURL: provider.photoURL
      })),
      metadata: {
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime
      },
      isAnonymous: user.isAnonymous,
    });
    return true;
  } else {
    console.log('No user is currently signed in');
    return false;
  }
};

export default app;