import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: These environment variables must be set for Firebase to work.
// In a Vercel deployment, these should be configured as Environment Variables.
// For local development, you can create a .env.local file.
// Example: VITE_USE_FIREBASE=true
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// This flag controls whether the app uses Firebase or mock data.
export const USE_FIREBASE = process.env.VITE_USE_FIREBASE === 'true';

// Conditionally initialize Firebase
const app = USE_FIREBASE && firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
