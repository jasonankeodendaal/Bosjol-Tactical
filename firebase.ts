import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/storage';

// Vite exposes environment variables on `import.meta.env`.
// These variables are replaced at build time. They MUST be prefixed with `VITE_`
// to be exposed to the client-side code. Access them directly.

// This flag controls whether the app uses Firebase or mock data.
// FIX: Cast `import.meta` to `any` to access `env` and resolve TypeScript error.
export const USE_FIREBASE = (import.meta as any).env.VITE_USE_FIREBASE === 'true';

// IMPORTANT: These environment variables must be set for Firebase to work.
// In a Vercel deployment, these should be configured as Environment Variables.
// For local development, you can create a .env.local file.
const firebaseConfig = {
  // FIX: Cast `import.meta` to `any` to access `env` properties and resolve TypeScript errors.
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY,
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID,
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

export const uploadFile = (
    file: Blob, 
    originalName: string, 
    path: string = 'uploads',
    onProgress?: (percentage: number) => void
): Promise<string> => {
    return new Promise((resolve, reject) => {
        if (!storage) {
            return reject(new Error("Firebase Storage is not initialized."));
        }
        const fileExtension = originalName.split('.').pop() || 'bin';
        const randomString = Math.random().toString(36).substring(2);
        const fileName = `${Date.now()}-${randomString}.${fileExtension}`;
        
        const storageRef = storage.ref(`${path}/${fileName}`);
        const uploadTask = storageRef.put(file);

        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) {
                    onProgress(progress);
                }
            }, 
            (error) => {
                reject(error);
            }, 
            async () => {
                try {
                    const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                    resolve(downloadURL);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
};

export { firebase };
