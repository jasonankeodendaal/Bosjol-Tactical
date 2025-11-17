
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const storageRulesContent = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper Functions
    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'bosjoltactical@gmail.com';
    }
    function isCreator() {
      return request.auth != null && request.auth.token.email == 'jstypme@gmail.com';
    }
  
    // Default: Deny all reads and writes
    match /{allPaths=**} {
      allow read, write: if false;
    }
    
    // Allow public read access to all files in the 'uploads' folder.
    // This is necessary for images, audio briefings, avatars, etc. to be displayed in the app.
    match /uploads/{allPaths=**} {
      allow read: if true;
      // Allow any authenticated user (player, admin, creator) to write (create, update, delete) files.
      allow write: if request.auth != null;
    }

    // The _health folder is used for the System Scanner's R/W test.
    match /_health/{allPaths=**} {
       allow read, write: if isAdmin() || isCreator();
    }
  }
}
`;

const firestoreRulesContent = `
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
  
    // --- Helper Functions ---
    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'bosjoltactical@gmail.com';
    }
    function isCreator() {
      return request.auth != null && request.auth.token.email == 'jstypme@gmail.com';
    }

    // --- Default Security Posture ---
    match /{document=**} {
      allow read, write: if false;
    }

    // --- Special Rules for Collections ---
    match /players/{playerId} {
      allow read: if true;
      allow create, delete: if isAdmin() || isCreator();
      
      // Allow updates under specific conditions:
      allow update: if 
        // 1. Admins/Creators can update anything.
        (isAdmin() || isCreator()) ||
        // 2. The login flow can update ONLY the activeAuthUID.
        (request.auth != null && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['activeAuthUID'])) ||
        // 3. The player can update their own non-sensitive profile data.
        (request.auth != null && request.auth.uid == resource.data.activeAuthUID &&
         request.resource.data.diff(resource.data).affectedKeys().hasOnly([
           'name', 'surname', 'callsign', 'bio', 'preferredRole', 'email', 'phone', 'address', 'allergies', 'medicalNotes', 'avatarUrl', 'loadout'
         ]));
    }
    
    match /signups/{signupId} {
      allow read: if request.auth != null;
      // Allow a player to create their own signup doc, where the docId is eventId_playerId
      allow create: if request.auth != null &&
      						 request.resource.data.playerId == signupId.split('_')[1] &&
                   get(/databases/$(database)/documents/players/$(request.resource.data.playerId)).data.activeAuthUID == request.auth.uid;
      // Allow a player to delete their own signup doc
      allow delete: if request.auth != null &&
      						 resource.data.playerId == signupId.split('_')[1] &&
                   get(/databases/$(database)/documents/players/$(resource.data.playerId)).data.activeAuthUID == request.auth.uid;
      // Admins/Creators can manage any signup
      allow write: if isAdmin() || isCreator();
    }
    
    // --- Publicly Readable, Admin/Creator Writable Collections ---
    match /settings/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /socialLinks/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /carouselMedia/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /events/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /rankTiers/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /badges/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /legendaryBadges/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /gamificationSettings/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /sponsors/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /inventory/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /suppliers/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /locations/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /raffles/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /vouchers/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    
    // --- Admin-Only Collections ---
    match /transactions/{transactionId} { allow read, write: if isAdmin() || isCreator(); }
    match /admins/{adminId} { allow read, write: if isAdmin() || isCreator(); }
    
    // --- System Collections ---
    match /_health/{testId} { allow read, write: if isAdmin() || isCreator(); }
  }
}
`;

const CodeBlock: React.FC<{ children: React.ReactNode, title: string }> = ({ children, title }) => {
    const [copyStatus, setCopyStatus] = useState('Copy');

    const handleCopy = () => {
        if (typeof children === 'string') {
            navigator.clipboard.writeText(children.trim());
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus('Copy'), 2000);
        }
    };
    
    return (
        <div className="bg-zinc-900 rounded-lg border border-zinc-700 my-2">
            <div className="flex justify-between items-center px-4 py-2 border-b border-zinc-700">
                <p className="text-sm text-gray-300 font-semibold">{title}</p>
                 <button
                    className="bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-semibold py-1 px-2 rounded-md transition-colors"
                    onClick={handleCopy}
                >
                    {copyStatus}
                </button>
            </div>
            <div className="p-4">
                 <pre className="text-sm text-gray-200 overflow-x-auto font-mono max-h-80">
                    <code>
                        {children}
                    </code>
                </pre>
            </div>
        </div>
    );
};

const StepCard: React.FC<{ number: number, title: string, children: React.ReactNode }> = ({ number, title, children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="border border-zinc-800/80 rounded-lg shadow-lg overflow-hidden bg-zinc-900/50"
        >
            <header className="flex items-center p-4 border-b border-red-600/30 bg-black/20">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white font-bold text-lg mr-4 flex-shrink-0">{number}</div>
                <h3 className="font-bold text-xl tracking-wider uppercase text-gray-200">{title}</h3>
            </header>
            <div className="p-5 text-gray-300 text-sm space-y-3 leading-relaxed">
                {children}
            </div>
        </motion.div>
    );
};

// FIX: Export the component so it can be imported in CreatorDashboard.tsx
export const SetupGuideTab: React.FC = () => {
    return (
        <div className="p-6 space-y-6">
            <StepCard number={1} title="Create a Firebase Project">
                <p>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Firebase Console</a>, create a new project, and add a "Web" app to it. Firebase will provide you with a configuration object containing your project keys.</p>
            </StepCard>

             <StepCard number={2} title="Configure Environment Variables">
                <p>You need to provide your Firebase project keys to the application. Create a file named <code className="text-sm bg-zinc-700 p-1 rounded">.env.local</code> in the project's root directory and add the following, replacing the placeholders with your actual keys:</p>
                <CodeBlock title=".env.local">
                    {`# This flag enables Firebase. Set to 'false' to use local mock data.
VITE_USE_FIREBASE=true

# Get these from your Firebase project settings
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
`}
                </CodeBlock>
                <p><strong>Important:</strong> For deployment (e.g., on Vercel), add these variables in your project's "Environment Variables" settings instead of using a file.</p>
            </StepCard>

            <StepCard number={3} title="Enable Firebase Services">
                 <p>In the Firebase Console, you need to enable the following services for your project:</p>
                 <ul className="list-disc list-inside space-y-2 pl-2">
                    <li>
                        <strong>Authentication:</strong>
                        <ol className="list-decimal list-inside pl-6">
                            <li>Go to the 'Authentication' section and click 'Get started'.</li>
                            <li>Under 'Sign-in method', enable <strong>Email/Password</strong>.</li>
                            <li>Enable <strong>Anonymous sign-in</strong>. This is crucial for player logins.</li>
                        </ol>
                    </li>
                     <li>
                        <strong>Firestore Database:</strong>
                        <ol className="list-decimal list-inside pl-6">
                            <li>Go to the 'Firestore Database' section and click 'Create database'.</li>
                            <li>Start in <strong>Production mode</strong>. Choose a server location closest to you.</li>
                        </ol>
                    </li>
                    <li>
                        <strong>Storage:</strong>
                         <ol className="list-decimal list-inside pl-6">
                            <li>Go to the 'Storage' section and click 'Get started'.</li>
                            <li>Start in <strong>Production mode</strong>. Use the default bucket location.</li>
                        </ol>
                    </li>
                 </ul>
            </StepCard>

             <StepCard number={4} title="Set Up Security Rules">
                <p>By default, your database and storage are locked down. You need to apply security rules to allow the application to work correctly while remaining secure.</p>
                <p><strong>For Firestore:</strong> Go to 'Firestore Database' -&gt; 'Rules', paste the following, and click 'Publish'.</p>
                <CodeBlock title="firestore.rules">
                    {firestoreRulesContent}
                </CodeBlock>
                 <p><strong>For Storage:</strong> Go to 'Storage' -&gt; 'Rules', paste the following, and click 'Publish'.</p>
                <CodeBlock title="storage.rules">
                    {storageRulesContent}
                </CodeBlock>
            </StepCard>

             <StepCard number={5} title="Create Admin & Creator Users">
                <p>Go to 'Authentication' -&gt; 'Users' and click 'Add user'. Manually create two users:</p>
                 <ul className="list-disc list-inside space-y-2 pl-2">
                    <li><strong>Admin User:</strong> Email: <code className="text-sm bg-zinc-700 p-1 rounded">bosjoltactical@gmail.com</code>. Set a secure password.</li>
                    <li><strong>Creator User:</strong> Email: <code className="text-sm bg-zinc-700 p-1 rounded">jstypme@gmail.com</code>. Set a secure password.</li>
                 </ul>
                 <p>The application is hard-coded to recognize these two emails as privileged users. After creating them, you can log in with their credentials.</p>
            </StepCard>

            <StepCard number={6} title="Initial Data Seeding">
                <p>When you run the app for the first time connected to a new, empty Firestore database, it will automatically detect this and "seed" all the initial mock data (players, events, settings, etc.) into your live database. You will see a "Seeding initial database..." loading screen. After it completes, the app will reload, and you will be running on your own live Firebase backend.</p>
            </StepCard>
        </div>
    );
};
