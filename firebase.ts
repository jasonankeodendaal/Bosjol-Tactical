import * as firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Helper to get environment variables from either Vite's `import.meta.env` or a Node-like `process.env`.
// This provides compatibility for both the AI Studio preview environment and a standard Vite deployment.
export const getEnvVar = (key: string): string | undefined => {
  // Vite environment variables are replaced at build time, so `import.meta.env` will be an object.
  // FIX: Cast `import.meta` to `any` to resolve TypeScript error "Property 'env' does not exist on type 'ImportMeta'".
  // This is necessary because the environment doesn't include Vite's client type definitions.
  if (typeof (import.meta as any).env !== 'undefined' && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  // Fallback for environments like AI Studio that provide `process.env` in a browser-like context.
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    // @ts-ignore
    return process.env[key];
  }
  return undefined;
};


// IMPORTANT: These environment variables must be set for Firebase to work.
// In a Vercel deployment, these should be configured as Environment Variables.
// For local development, you can create a .env.local file.
// Example: VITE_USE_FIREBASE=true
const firebaseConfig = {
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY'),
  authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVar('VITE_FIREBASE_APP_ID'),
};

// This flag controls whether the app uses Firebase or mock data.
export const USE_FIREBASE = getEnvVar('VITE_USE_FIREBASE') === 'true';

export const isFirebaseConfigured = () => {
    return !!(
        firebaseConfig.apiKey &&
        firebaseConfig.authDomain &&
        firebaseConfig.projectId
    );
};


// Conditionally initialize Firebase
// FIX: Use compat library initialization to resolve module export error.
const app = USE_FIREBASE && isFirebaseConfigured() ? firebase.initializeApp(firebaseConfig) : null;

export const auth = app ? firebase.auth() : null;
export const db = app ? firebase.firestore() : null;