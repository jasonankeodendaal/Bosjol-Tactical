

import React, { useState, useEffect, useContext } from 'react';
import type { CreatorDetails } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { ImageUpload } from './ImageUpload';
// FIX: Add CircleStackIcon to imports
import { UserCircleIcon, CodeBracketIcon, ShieldCheckIcon, InformationCircleIcon, CircleStackIcon } from './icons/Icons';
import { DataContext, DataContextType } from '../data/DataContext';
import { SystemScanner } from './SystemScanner';
import { motion, AnimatePresence } from 'framer-motion';

const firebaseRulesContent = `
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
  
    // --- Helper Functions ---

    // isAdmin: Checks if the signed-in user is the designated administrator by their email.
    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'bosjoltactical@gmail.com';
    }

    // isCreator: Checks if the signed-in user is the designated creator by their email.
    function isCreator() {
      return request.auth != null && request.auth.token.email == 'jstypme@gmail.com';
    }

    // --- Default Security Posture ---

    // By default, deny all reads and writes to the entire database.
    match /{document=**} {
      allow read, write: if false;
    }

    // --- Publicly Readable Collections ---
    // These must be readable by anyone (including unauthenticated players)
    // for the dashboard to function. Write access is strictly limited.
    match /(settings|socialLinks|carouselMedia|players|events|ranks|badges|legendaryBadges|gamificationSettings|sponsors|inventory|suppliers|locations|raffles|vouchers)/{docId} {
      allow read: if true;
      allow write: if isAdmin() || isCreator(); // Allow creator to edit settings too
    }
    
    // --- Admin-Only Collections ---

    // The 'transactions' collection contains sensitive financial data.
    match /transactions/{transactionId} {
      allow read, write: if isAdmin() || isCreator(); 
    }

    // The 'admins' collection contains admin user data.
    match /admins/{adminId} {
      allow read, write: if isAdmin() || isCreator();
    }
    
    // --- Special Rules ---
    
    // The _health collection is used for the System Scanner's R/W test.
    // It requires an authenticated Admin or Creator session.
    match /_health/{testId} {
        allow read, write: if isAdmin() || isCreator();
    }
  }
}
`;

const FirebaseRulesTab: React.FC<{
    setShowHelp: (show: boolean) => void;
    setHelpTopic: (topic: string) => void;
}> = ({ setShowHelp, setHelpTopic }) => {
    const [copyStatus, setCopyStatus] = useState('Copy Rules');

    const handleCopy = () => {
        navigator.clipboard.writeText(firebaseRulesContent.trim());
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy Rules'), 2000);
    };

    return (
        <DashboardCard title="Firestore Security Rules" icon={<ShieldCheckIcon className="w-6 h-6" />}>
            <div className="p-6 space-y-4">
                <p className="text-sm text-gray-300">
                    These are the recommended security rules for the application. They ensure data is publicly readable but restrict all write operations to authenticated Admins or the Creator. This is the primary defense against cheating. Copy these rules and paste them into your Firebase project's Firestore rules editor.
                </p>
                <div className="relative">
                    <pre className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 text-sm text-gray-200 overflow-x-auto font-mono max-h-96">
                        <code>
                            {firebaseRulesContent.trim()}
                        </code>
                    </pre>
                    <Button size="sm" variant="secondary" className="absolute top-3 right-3" onClick={handleCopy}>
                        {copyStatus}
                    </Button>
                </div>
                <div className="mt-4">
                    <Button variant="secondary" onClick={() => { setHelpTopic('firestore-rules-explained'); setShowHelp(true); }}>
                        <InformationCircleIcon className="w-5 h-5 mr-2" />
                        Explain These Rules in Detail
                    </Button>
                </div>
            </div>
        </DashboardCard>
    );
};

type CollectionName = keyof Omit<DataContextType, 'loading' | 'isSeeding' | 'seedInitialData' | 'updateDoc' | 'addDoc' | 'deleteDoc' | 'deleteAllData' | 'restoreFromBackup' | 'seedCollection'>;

const RawDataEditor: React.FC = () => {
    const dataContext = useContext(DataContext);
    if (!dataContext) throw new Error("DataContext not found");

    const collectionNames: CollectionName[] = ['players', 'events', 'ranks', 'badges', 'legendaryBadges', 'gamificationSettings', 'sponsors', 'companyDetails', 'creatorDetails', 'socialLinks', 'carouselMedia', 'vouchers', 'inventory', 'suppliers', 'transactions', 'locations', 'raffles'];

    const [selectedCollection, setSelectedCollection] = useState<CollectionName>('companyDetails');
    const [jsonData, setJsonData] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const data = dataContext[selectedCollection];
        setJsonData(JSON.stringify(data, null, 2));
        setError('');
    }, [selectedCollection, dataContext]);

    const handleSave = async () => {
        try {
            const parsedData = JSON.parse(jsonData);
            setError('');
            
            const setterName = `set${selectedCollection.charAt(0).toUpperCase() + selectedCollection.slice(1)}`;
            // @ts-ignore
            const setter = dataContext[setterName];

            if (typeof setter === 'function') {
                if (Array.isArray(parsedData)) {
                    await dataContext.updateDoc(selectedCollection, parsedData as any); // This is a bit of a hack for array-based collections
                } else if (typeof parsedData === 'object' && parsedData !== null) {
                    await setter(parsedData); // For single-doc settings
                }
                 alert(`Successfully updated '${selectedCollection}'`);
            } else {
                 throw new Error(`Setter function '${setterName}' not found in DataContext.`);
            }
        } catch (e) {
            setError(`Invalid JSON: ${(e as Error).message}`);
        }
    };


    return (
        <DashboardCard title="Raw Data Editor" icon={<CircleStackIcon className="w-6 h-6"/>}>
            <div className="p-6 space-y-4">
                 <div className="bg-red-900/40 border border-red-700 text-red-200 p-4 rounded-lg">
                    <h4 className="font-bold text-lg flex items-center gap-2"><InformationCircleIcon className="w-5 h-5"/>Direct Database Access</h4>
                    <p className="text-sm mt-1">
                        WARNING: You are editing the raw JSON data for the application. Any changes saved here are applied directly to the database. Incorrectly formatted JSON or invalid data structures can break the application. Use this tool with extreme caution. Always create a backup before making significant changes.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <label htmlFor="collection-select" className="text-gray-300 font-semibold">Select Data Collection:</label>
                    <select
                        id="collection-select"
                        value={selectedCollection}
                        onChange={e => setSelectedCollection(e.target.value as CollectionName)}
                        className="flex-grow bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        {collectionNames.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
                 <textarea
                    value={jsonData}
                    onChange={e => setJsonData(e.target.value)}
                    className="w-full h-[50vh] bg-zinc-950 font-mono text-sm p-3 border border-zinc-700 rounded-md focus:ring-2 focus:ring-red-500 focus:outline-none"
                    spellCheck="false"
                 />
                 {error && <p className="text-red-400 text-sm bg-red-900/50 p-2 rounded-md">{error}</p>}
                 <Button onClick={handleSave} className="w-full">Save Changes to '{selectedCollection}'</Button>
            </div>
        </DashboardCard>
    )
}

export const CreatorDashboard: React.FC<
    DataContextType & {
    setShowHelp: (show: boolean) => void;
    setHelpTopic: (topic: string) => void;
}> = (props) => {
    const { creatorDetails, setCreatorDetails, companyDetails, setShowHelp, setHelpTopic } = props;

    const [formData, setFormData] = useState(creatorDetails);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('monitor');

    useEffect(() => {
        setFormData(creatorDetails);
    }, [creatorDetails]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await setCreatorDetails(formData);
            alert("Creator details updated successfully!");
        } catch (error) {
            console.error("Failed to save creator details:", error);
            alert(`An error occurred: ${(error as Error).message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const isDirty = JSON.stringify(formData) !== JSON.stringify(creatorDetails);
    
    const tabs = [
        { id: 'monitor', label: 'System Monitor', icon: <CodeBracketIcon className="w-5 h-5"/> },
        { id: 'data', label: 'Raw Data Editor', icon: <CircleStackIcon className="w-5 h-5"/> },
        { id: 'rules', label: 'Firebase Rules', icon: <ShieldCheckIcon className="w-5 h-5"/> },
    ];
    
     useEffect(() => {
        if(setHelpTopic) {
            const helpTopic = activeTab === 'monitor' ? 'creator-dashboard-monitor' :
                              activeTab === 'data' ? 'creator-dashboard-data' : 'admin-dashboard-api-setup'; // Placeholder
            setHelpTopic(helpTopic);
        }
    }, [activeTab, setHelpTopic]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area with Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex border-b border-zinc-800 overflow-x-auto">
                        {tabs.map(tab => (
                             <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${
                                    activeTab === tab.id
                                        ? 'border-red-500 text-red-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                } flex items-center gap-2 whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors uppercase tracking-wider flex-shrink-0`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div>
                        {activeTab === 'monitor' && <SystemScanner />}
                        {activeTab === 'data' && <RawDataEditor />}
                        {activeTab === 'rules' && <FirebaseRulesTab setShowHelp={setShowHelp} setHelpTopic={setHelpTopic} />}
                    </div>
                </div>

                {/* Sidebar: Creator Settings */}
                <div className="lg:col-span-1 space-y-6">
                    <DashboardCard title="Creator Profile" icon={<UserCircleIcon className="w-6 h-6" />}>
                        <div className="p-6 space-y-4">
                            <Input label="Display Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                            <Input label="Tagline" value={formData.tagline} onChange={e => setFormData(f => ({ ...f, tagline: e.target.value }))} />
                             <div>
                                 <label className="block text-sm font-medium text-gray-400 mb-1.5">Bio</label>
                                <textarea value={formData.bio} onChange={e => setFormData(f => ({...f, bio: e.target.value}))} rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                            </div>
                            <Input label="Email" type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                            <Input label="WhatsApp Number" value={formData.whatsapp} onChange={e => setFormData(f => ({ ...f, whatsapp: e.target.value }))} />
                            <div>
                                 <label className="block text-sm font-medium text-gray-400 mb-1.5">Logo</label>
                                {formData.logoUrl ? (
                                    <div className="flex items-center gap-2">
                                        <img src={formData.logoUrl} alt="logo preview" className="w-16 h-16 object-contain rounded-md bg-zinc-800 p-1" />
                                        <Button variant="danger" size="sm" onClick={() => setFormData(f => ({ ...f, logoUrl: '' }))}>Remove</Button>
                                    </div>
                                ) : (
                                    <ImageUpload onUpload={(urls) => { if (urls.length > 0) setFormData(f => ({ ...f, logoUrl: urls[0] })); }} accept="image/*" apiServerUrl={companyDetails.apiServerUrl} />
                                )}
                            </div>
                        </div>
                    </DashboardCard>

                    <DashboardCard title="App Source Code" icon={<CodeBracketIcon className="w-6 h-6" />}>
                        <div className="p-6">
                             <Input 
                                label="GitHub Repository URL" 
                                value={formData.githubUrl} 
                                onChange={e => setFormData(f => ({ ...f, githubUrl: e.target.value }))} 
                                placeholder="https://github.com/user/repo"
                            />
                             <p className="text-xs text-gray-400 mt-2">This link will be displayed on the Admin's API Setup page to allow them to download the server source code.</p>
                        </div>
                    </DashboardCard>
                    
                    <div className="sticky top-24 z-10">
                        <Button onClick={handleSave} disabled={!isDirty || isSaving} className="w-full py-3 text-lg">
                            {isSaving ? 'Saving...' : isDirty ? 'Save Creator Settings' : 'All Changes Saved'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};