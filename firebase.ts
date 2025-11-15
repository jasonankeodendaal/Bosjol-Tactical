import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

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