


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
      allow write: if isAdmin() || isCreator(); // Only admins/creator can upload/delete
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
      allow write: if isAdmin() || isCreator();
      // A logged-in user can update ONLY the activeAuthUID field on any player document.
      // This is required for the anonymous login flow to work without server-side code.
      allow update: if request.auth != null && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['activeAuthUID']);
    }
    
    // --- Publicly Readable, Admin/Creator Writable Collections ---
    match /settings/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /socialLinks/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /carouselMedia/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /events/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /ranks/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
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

const envFileContent = `
# -----------------------------------------------------------------------------
# BOSJOL TACTICAL DASHBOARD - FIREBASE CONFIGURATION
# -----------------------------------------------------------------------------
# This flag enables Firebase integration. Set to "true" to use a live backend.
# Set to "false" to run the app with local mock data for offline development.
VITE_USE_FIREBASE="true"

# Paste your Firebase project configuration credentials below.
# You can find these in your Firebase project settings under "Web App".
# IMPORTANT: These values are exposed to the client-side, which is normal for
# Firebase web apps. Security is handled by Firestore/Storage Rules, not by
# hiding these keys.

VITE_FIREBASE_API_KEY="YOUR_API_KEY_HERE"
VITE_FIREBASE_AUTH_DOMAIN="YOUR_PROJECT_ID.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="YOUR_PROJECT_ID.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"
VITE_FIREBASE_APP_ID="YOUR_APP_ID"
`;

const CodeBlock: React.FC<{ children: React.ReactNode, language?: string, fileName?: string }> = ({ children, language = 'bash', fileName }) => {
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
            {fileName && (
                <div className="px-4 py-2 border-b border-zinc-700 text-xs text-gray-400 font-mono">
                    {fileName}
                </div>
            )}
            <div className="relative p-4">
                <pre className="text-sm text-gray-200 overflow-x-auto font-mono">
                    <code className={`language-${language}`}>
                        {children}
                    </code>
                </pre>
                <button
                    className="absolute top-3 right-3 bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-semibold py-1 px-2 rounded-md transition-colors"
                    onClick={handleCopy}
                >
                    {copyStatus}
                </button>
            </div>
        </div>
    );
};

const InlineCode: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <code className="bg-zinc-700 text-red-300 font-mono text-sm px-1.5 py-0.5 rounded-md">{children}</code>
);

const StepCard: React.FC<{ number?: number, title: string, children: React.ReactNode, isSubStep?: boolean }> = ({ number, title, children, isSubStep = false }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className={`border rounded-lg shadow-lg overflow-hidden ${isSubStep ? 'bg-amber-900/20 border-amber-700/50' : 'bg-zinc-900/50 border-zinc-800/80'}`}
        >
            <header className={`flex items-center p-4 border-b ${isSubStep ? 'border-amber-600/30 bg-black/10' : 'border-red-600/30 bg-black/20'}`}>
                {number && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white font-bold text-lg mr-4 flex-shrink-0">{number}</div>
                )}
                <h3 className={`font-bold text-xl tracking-wider uppercase ${isSubStep ? 'text-amber-300' : 'text-gray-200'}`}>{title}</h3>
            </header>
            <div className="p-5 text-gray-300 text-sm space-y-3 leading-relaxed">
                {children}
            </div>
        </motion.div>
    );
};

export const SetupGuideTab: React.FC = () => {
    return (
        <div className="space-y-6">
            <p className="text-center text-amber-300 bg-amber-900/40 p-3 rounded-md border border-amber-700/50">This guide is for setting up the main <strong>Dashboard Application</strong>. For instructions on the optional file upload server, please see the <strong>API Setup</strong> tab.</p>
            <StepCard number={1} title="Prerequisites">
                <p>Before you begin, ensure you have the following software installed on your computer. These are essential for running the project.</p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                    <li>
                        <strong>Node.js and npm:</strong> The runtime environment for the project. Download it from the official <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Node.js website</a> (LTS version is recommended).
                    </li>
                    <li>
                        <strong>Git:</strong> The version control system used to download the project source code. Get it from the <a href="https://git-scm.com/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Git website</a>.
                    </li>
                    <li>
                        <strong>A Code Editor:</strong> An application to view and edit the code. <a href="https://code.visualstudio.com/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Visual Studio Code</a> is highly recommended.
                    </li>
                </ul>
            </StepCard>

            <StepCard number={2} title="Firebase Project Setup">
                <p>Firebase will be your backend, handling the database and user authentication. File uploads are managed within the database itself.</p>
                <ol className="list-decimal list-inside space-y-2 pl-2">
                    <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline">Firebase Console</a> and sign in with your Google account.</li>
                    <li>Click <strong>"Add project"</strong> and give your project a name (e.g., "BosjolTacticalDashboard"). Follow the setup steps.</li>
                    <li>Once your project is created, navigate to the <strong>Build</strong> section in the left sidebar.</li>
                    <li>Click on <strong>Firestore Database</strong>, then <strong>"Create database"</strong>. Start in <strong>Test mode</strong> for now and select a region for your data.</li>
                    <li>Finally, go to <strong>Authentication</strong> in the <strong>Build</strong> section. Click <strong>"Get started"</strong>, then select <strong>Email/Password</strong> as a sign-in method and enable it.</li>
                </ol>
            </StepCard>

            <StepCard number={3} title="Get Firebase Credentials">
                <p>You need to get the configuration keys from Firebase to link your project to the application code.</p>
                <ol className="list-decimal list-inside space-y-2 pl-2">
                    <li>In your Firebase project, go to <strong>Project Settings</strong> (click the gear icon next to "Project Overview").</li>
                    <li>Under the <strong>General</strong> tab, scroll down to "Your apps". Click the web icon <InlineCode>&lt;/&gt;</InlineCode> to create a new web app.</li>
                    <li>Give it a nickname (e.g., "Dashboard Web App") and click <strong>"Register app"</strong>.</li>
                    <li>Firebase will show you an object called <InlineCode>firebaseConfig</InlineCode>. You will need the values from this object in the next step. Keep this page open.</li>
                </ol>
            </StepCard>

            <StepCard number={4} title="Local Project Setup">
                <p>Now, let's download the application code and connect it to your Firebase project.</p>
                <ol className="list-decimal list-inside space-y-2 pl-2">
                    <li>Open your terminal or command prompt and clone the project repository from GitHub:</li>
                    <CodeBlock language="bash">git clone https://github.com/jstyp/bosjol-tactical-dashboard.git</CodeBlock>
                    <li>Navigate into the newly created project folder:</li>
                    <CodeBlock language="bash">cd bosjol-tactical-dashboard</CodeBlock>
                    <li>Install all the necessary project dependencies:</li>
                    <CodeBlock language="bash">npm install</CodeBlock>
                    <li>Create a new file in the root of the project named <InlineCode>.env.local</InlineCode>. This file will securely store your Firebase credentials.</li>
                    <li>Copy the content below and paste it into your new <InlineCode>.env.local</InlineCode> file. Then, replace the placeholder values with the actual credentials from the <InlineCode>firebaseConfig</InlineCode> object you got in Step 3.</li>
                    <CodeBlock language="bash" fileName=".env.local">{envFileContent}</CodeBlock>
                </ol>
            </StepCard>

            <StepCard number={5} title="Configure Firestore Security Rules">
                <p>Security rules are crucial. They protect your database from unauthorized access and prevent players from cheating.</p>
                <ol className="list-decimal list-inside space-y-2 pl-2">
                    <li>
                        <strong>Firestore Rules:</strong> In your Firebase Console, go to <strong>Build &rarr; Firestore Database &rarr; Rules</strong>. Delete the existing content and paste in the following rules. Click <strong>Publish</strong>.
                        <CodeBlock language="text" fileName="firestore.rules">{firestoreRulesContent}</CodeBlock>
                    </li>
                </ol>
            </StepCard>

            <StepCard number={6} title="Create Admin & Creator Users">
                <p>You need to create the user accounts for the Administrator and the Creator so they can log in via email and password. This is done through Firebase Authentication.</p>
                <ol className="list-decimal list-inside space-y-2 pl-2">
                    <li>In your Firebase Console, go to <strong>Build &rarr; Authentication &rarr; Users</strong>.</li>
                    <li>Click <strong>"Add user"</strong>.</li>
                    <li>For the <strong>Admin</strong> user, enter the email <InlineCode>bosjoltactical@gmail.com</InlineCode> and a password (e.g., <InlineCode>1234</InlineCode>). Click "Add user".</li>
                    <li>Click <strong>"Add user"</strong> again.</li>
                    <li>For the <strong>Creator</strong> user, enter the email <InlineCode>jstypme@gmail.com</InlineCode> and a password of your choice. Click "Add user".</li>
                </ol>
                <p className="!mt-4">These specific emails are hardcoded into the security rules to grant them special permissions. Player accounts are managed within the admin dashboard, not here.</p>
            </StepCard>

            <StepCard number={7} title="Run the Application">
                <p>With everything configured, you can now start the local development server.</p>
                <ol className="list-decimal list-inside space-y-2 pl-2">
                    <li>In your terminal (still inside the project folder), run the start command:</li>
                    <CodeBlock language="bash">npm run dev</CodeBlock>
                    <li>The terminal will output a local URL, usually <InlineCode>http://localhost:5173</InlineCode>. Open this URL in your web browser.</li>
                </ol>
            </StepCard>

            <StepCard number={8} title="First Run & Data Seeding">
                <p>On the very first run, the application will detect that your database is empty and automatically populate it with all the necessary initial data (ranks, badges, mock players, etc.).</p>
                <ol className="list-decimal list-inside space-y-2 pl-2">
                    <li>You should see a loading screen with the message "Seeding initial database configuration...". This process may take a minute.</li>
                    <li>Once complete, the page will automatically reload, and you will be presented with the application's front page.</li>
                </ol>
            </StepCard>

             <StepCard number={9} title="Login and Explore">
                <p>Your dashboard is now fully operational. You can log in with the different roles to explore its features. Player accounts are created and managed inside the Admin Dashboard.</p>
                 <ul className="list-disc list-inside space-y-2 pl-2">
                    <li><strong>Creator Login:</strong> Use <InlineCode>jstypme@gmail.com</InlineCode> and the password you set.</li>
                    <li><strong>Admin Login:</strong> Use <InlineCode>bosjoltactical@gmail.com</InlineCode> and the password you set (e.g., <InlineCode>1234</InlineCode>).</li>
                    <li><strong>Player Login:</strong> Use a pre-seeded player's credentials, for example, Player Code: <InlineCode>P001</InlineCode> and PIN: <InlineCode>111111</InlineCode>.</li>
                </ul>
            </StepCard>

             <StepCard number={10} title="Next Steps: Deployment">
                <p>When you are ready to make your dashboard public, you can deploy it to a hosting service like Vercel or Netlify.</p>
                <ul className="list-disc list-inside space-y-2 pl-2">
                    <li>Connect your GitHub repository to the hosting service.</li>
                    <li><strong>Crucially</strong>, you must copy the contents of your local <InlineCode>.env.local</InlineCode> file and add them as <strong>Environment Variables</strong> in your hosting provider's project settings.</li>
                    <li>The hosting service will then build and deploy your application, making it accessible via a public URL.</li>
                </ul>
            </StepCard>
        </div>
    );
};