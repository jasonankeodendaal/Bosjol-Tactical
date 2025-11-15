

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Vite exposes environment variables on `import.meta.env`.
// These variables are replaced at build time. They MUST be prefixed with `VITE_`
// to be exposed to the client-side code.
// We add a fallback for environments that might not have `import.meta`.
// @ts-ignore - `import.meta` is a standard feature but may not be in all TS configs.
const env = typeof import.meta !== 'undefined' ? import.meta.env : {};

// This flag controls whether the app uses Firebase or mock data.
export const USE_FIREBASE = env.VITE_USE_FIREBASE === 'true';

// IMPORTANT: These environment variables must be set for Firebase to work.
// In a Vercel deployment, these should be configured as Environment Variables.
// For local development, you can create a .env.local file.
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = () => {
    return !!(
        firebaseConfig.apiKey &&
        firebaseConfig.authDomain &&
        firebaseConfig.projectId &&
        firebaseConfig.storageBucket
    );
};


// Conditionally initialize Firebase and capture any errors.
let app: firebase.app.App | null = null;
export let firebaseInitializationError: Error | null = null;

try {
  if (USE_FIREBASE && isFirebaseConfigured()) {
    // Check if Firebase is already initialized to prevent re-initialization errors.
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
    } else {
      app = firebase.app();
    }
  } else if (USE_FIREBASE && !isFirebaseConfigured()) {
      firebaseInitializationError = new Error("Firebase is enabled (VITE_USE_FIREBASE=true), but the required Firebase environment variables are missing or not exposed to the client. Ensure they are prefixed with 'VITE_'.");
      console.error(firebaseInitializationError.message, 'Config found:', firebaseConfig);
  }
} catch (error) {
    console.error("Firebase initialization failed:", error);
    firebaseInitializationError = error as Error;
}


export const auth = app ? firebase.auth() : null;
export const db = app ? firebase.firestore() : null;
export const storage = app ? firebase.storage() : null;

export const uploadFile = async (file: Blob, originalName: string, path: string = 'uploads'): Promise<string> => {
    if (!storage) {
        throw new Error("Firebase Storage is not initialized.");
    }
    const fileExtension = originalName.split('.').pop() || 'bin';
    const randomString = Math.random().toString(36).substring(2);
    const fileName = `${Date.now()}-${randomString}.${fileExtension}`;
    
    const storageRef = storage.ref(`${path}/${fileName}`);
    const snapshot = await storageRef.put(file);
    const downloadURL = await snapshot.ref.getDownloadURL();
    return downloadURL;
};

export { firebase };