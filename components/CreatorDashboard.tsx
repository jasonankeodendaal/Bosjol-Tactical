import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CreatorDetails } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { ImageUpload } from './ImageUpload';
import { UserCircleIcon, CodeBracketIcon, ShieldCheckIcon, InformationCircleIcon, CircleStackIcon, DocumentIcon, CloudArrowDownIcon, CogIcon, ExclamationTriangleIcon } from './icons/Icons';
import { DataContext, DataContextType } from '../data/DataContext';
import { SystemScanner } from './SystemScanner';
import { SetupGuideTab } from './SetupGuideTab';
import { ApiSetupTab } from './ApiSetupTab';

// --- HELPER COMPONENTS ---

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

// --- RULES CONTENT ---
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
      // Allow any authenticated user to read signups (needed for gear availability checks).
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

// --- SUB-COMPONENTS FOR CREATOR DASHBOARD ---

const FirebaseRulesCard: React.FC<{
    setShowHelp: (show: boolean) => void;
    setHelpTopic: (topic: string) => void;
}> = ({ setShowHelp, setHelpTopic }) => {
    return (
        <div className="space-y-4">
            <div className="bg-blue-900/40 border border-blue-700 text-blue-200 p-4 rounded-lg">
                <h4 className="font-bold text-lg flex items-center gap-2"><InformationCircleIcon className="w-5 h-5"/>Security Rules Overview</h4>
                <p className="text-sm mt-1">
                    These rules are essential for securing your Firebase project. They ensure that only authorized users can access and modify data. You must copy and paste these rules into the 'Rules' tab of your Firebase project's Firestore and Storage sections.
                </p>
            </div>
            <div>
                <h3 className="text-xl font-bold text-red-400 mb-2">Firestore Database Rules</h3>
                <p className="text-gray-300 mb-3 text-sm">
                    These rules govern who can read, write, and update data in your Firestore database. They are critical for preventing unauthorized data manipulation, such as a player editing their own XP.
                </p>
                <CodeBlock language="javascript" fileName="firestore.rules">
                    {firestoreRulesContent}
                </CodeBlock>
            </div>
             <div>
                <h3 className="text-xl font-bold text-red-400 mb-2">Cloud Storage Rules</h3>
                <p className="text-gray-300 mb-3 text-sm">
                    These rules control who can upload and view files in your Firebase Storage bucket. They allow public read access for uploaded files (like avatars and event images) but restrict write access to authenticated users only.
                </p>
                <CodeBlock language="javascript" fileName="storage.rules">
                    {storageRulesContent}
                </CodeBlock>
            </div>
        </div>
    );
};

const RawDataEditor: React.FC = () => {
    const dataContext = useContext(DataContext);
    const [selectedCollection, setSelectedCollection] = useState<keyof DataContextType | ''>('');
    const [jsonData, setJsonData] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (selectedCollection && dataContext) {
            try {
                // @ts-ignore
                const data = dataContext[selectedCollection];
                setJsonData(JSON.stringify(data, null, 2));
                setError('');
            } catch (e) {
                setError('Failed to serialize data.');
            }
        } else {
            setJsonData('');
        }
    }, [selectedCollection, dataContext]);

    const handleSave = async () => {
        if (!selectedCollection || !dataContext) return;
        try {
            JSON.parse(jsonData);
            setError('');
            alert("Live data editing is disabled in this view for safety. This feature is intended for diagnostics. Please use the main admin tabs for data manipulation.");
        } catch (e) {
            setError('Invalid JSON: ' + (e as Error).message);
        }
    };

    const collectionNames = Object.keys(dataContext || {}).filter(k => !k.startsWith('set') && !k.startsWith('add') && !k.startsWith('update') && !k.startsWith('delete') && !k.startsWith('restore') && !k.startsWith('seed') && !['loading', 'isSeeding'].includes(k));

    return (
        <div className="space-y-4">
            <div className="bg-red-900/40 border border-red-700 text-red-200 p-4 rounded-lg">
                <h4 className="font-bold text-lg flex items-center gap-2"><ExclamationTriangleIcon className="w-5 h-5"/>Developer Tool: Direct Data Viewer</h4>
                <p className="text-sm mt-1">
                    <strong>Read-Only Mode:</strong> This tool provides a raw JSON view of the data currently loaded in the application's state. Saving is disabled for safety. Use this for advanced debugging and data inspection only.
                </p>
            </div>
            <select 
                value={selectedCollection} 
                onChange={e => setSelectedCollection(e.target.value as keyof DataContextType)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
                <option value="">-- Select a collection to view --</option>
                {collectionNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
            <textarea 
                value={jsonData}
                readOnly
                className="w-full h-96 bg-zinc-950 border border-zinc-700 rounded-lg p-4 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Select a collection to view its raw JSON data..."
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>
    );
};


// --- MAIN COMPONENT ---

interface CreatorDashboardProps extends DataContextType {
    setShowHelp: (show: boolean) => void;
    setHelpTopic: (topic: string) => void;
}

const TabButton: React.FC<{ name: string, active: boolean, onClick: () => void, icon: React.ReactNode }> = ({ name, active, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`${active ? 'border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:text-gray-200'} flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors uppercase tracking-wider`}
    >
        {icon} {name}
    </button>
);

const SubTabButton: React.FC<{ name: string, active: boolean, onClick: () => void }> = ({ name, active, onClick }) => (
    <button
        onClick={onClick}
        className={`${active ? 'bg-zinc-800 text-white' : 'text-gray-400 hover:bg-zinc-800/50 hover:text-gray-200'} px-3 py-2 rounded-md text-sm font-medium transition-colors`}
    >
        {name}
    </button>
);

export const CreatorDashboard: React.FC<CreatorDashboardProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'monitor' | 'setup' | 'api'>('monitor');
    const [monitorTab, setMonitorTab] = useState<'status' | 'data' | 'rules'>('status');
    const { setHelpTopic } = props;

    useEffect(() => {
        let topic = 'creator-dashboard-monitor';
        if (activeTab === 'setup') topic = 'admin-dashboard-setup-guide'; // Reuse help topic
        if (activeTab === 'api') topic = 'admin-dashboard-api-setup';
        setHelpTopic(topic);
    }, [activeTab, setHelpTopic]);
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="border-b border-zinc-800 mb-6">
                <nav className="flex space-x-6" aria-label="Tabs">
                    <TabButton name="System Monitor" active={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} icon={<CogIcon className="w-5 h-5"/>} />
                    <TabButton name="Setup Guide" active={activeTab === 'setup'} onClick={() => setActiveTab('setup')} icon={<DocumentIcon className="w-5 h-5"/>} />
                    <TabButton name="API Server" active={activeTab === 'api'} onClick={() => setActiveTab('api')} icon={<CodeBracketIcon className="w-5 h-5"/>} />
                </nav>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'monitor' && (
                        <div className="space-y-6">
                            <div className="border-b border-zinc-700/50 mb-6">
                                <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-2">
                                    <SubTabButton name="Live Status" active={monitorTab === 'status'} onClick={() => setMonitorTab('status')} />
                                    <SubTabButton name="Raw Data Viewer" active={monitorTab === 'data'} onClick={() => setMonitorTab('data')} />
                                    <SubTabButton name="Firebase Rules" active={monitorTab === 'rules'} onClick={() => setMonitorTab('rules')} />
                                </nav>
                            </div>
                            {monitorTab === 'status' && <SystemScanner />}
                            {monitorTab === 'data' && <DashboardCard title="Raw Data Viewer" icon={<CircleStackIcon className="w-6 h-6"/>}><div className="p-6"><RawDataEditor /></div></DashboardCard>}
                            {monitorTab === 'rules' && <DashboardCard title="Firebase Security Rules" icon={<ShieldCheckIcon className="w-6 h-6"/>}><div className="p-6"><FirebaseRulesCard {...props} /></div></DashboardCard>}
                        </div>
                    )}
                    {activeTab === 'setup' && <SetupGuideTab />}
                    {activeTab === 'api' && <ApiSetupTab creatorDetails={props.creatorDetails} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};