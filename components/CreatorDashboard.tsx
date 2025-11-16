import React, { useState, useEffect, useContext } from 'react';
import type { CreatorDetails } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { ImageUpload } from './ImageUpload';
import { UserCircleIcon, CodeBracketIcon, ShieldCheckIcon, InformationCircleIcon, CircleStackIcon, DocumentIcon } from './icons/Icons';
import { DataContext, DataContextType } from '../data/DataContext';
import { SystemScanner } from './SystemScanner';
import { SetupGuideTab } from './SetupGuideTab';

const FirebaseRulesCard: React.FC<{
    setShowHelp: (show: boolean) => void;
    setHelpTopic: (topic: string) => void;
}> = ({ setShowHelp, setHelpTopic }) => {
    const [copyStatus, setCopyStatus] = useState('Copy Rules');

    const firebaseRulesContent = `
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
  
    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'bosjoltactical@gmail.com';
    }

    function isCreator() {
      return request.auth != null && request.auth.token.email == 'jstypme@gmail.com';
    }

    match /{document=**} {
      allow read, write: if false;
    }

    match /settings/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /socialLinks/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /carouselMedia/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
    match /players/{docId} { allow read: if true; allow write: if isAdmin() || isCreator(); }
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
    match /chats/{messageId} {
      allow read: if true;
      allow write: if request.auth != null;
      allow delete: if isAdmin() || isCreator();
    }
    match /transactions/{transactionId} { allow read, write: if isAdmin() || isCreator(); }
    match /admins/{adminId} { allow read, write: if isAdmin() || isCreator(); }
    match /_health/{testId} { allow read, write: if isAdmin() || isCreator(); }
  }
}
`;

    const handleCopy = () => {
        navigator.clipboard.writeText(firebaseRulesContent.trim());
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy Rules'), 2000);
    };

    return (
        <DashboardCard title="Firestore Security Rules" icon={<ShieldCheckIcon className="w-6 h-6" />}>
            <div className="p-6 space-y-4">
                <p className="text-sm text-gray-300">
                    These rules restrict all database write operations to authenticated Admins or the Creator, which is the primary defense against cheating. Copy and paste these into your Firebase project's Firestore rules editor.
                </p>
                <div className="relative">
                    <pre className="bg-zinc-900 p-4 rounded-lg border border-zinc-700 text-sm text-gray-200 overflow-x-auto font-mono max-h-96">
                        <code>{firebaseRulesContent.trim()}</code>
                    </pre>
                    <Button size="sm" variant="secondary" className="absolute top-3 right-3" onClick={handleCopy}>
                        {copyStatus}
                    </Button>
                </div>
                 <Button variant="secondary" onClick={() => { setHelpTopic('firestore-rules-explained'); setShowHelp(true); }}>
                    <InformationCircleIcon className="w-5 h-5 mr-2" />
                    Explain These Rules
                </Button>
            </div>
        </DashboardCard>
    );
};

type CollectionName = keyof Omit<DataContextType, 'loading' | 'isSeeding' | 'seedInitialData' | 'updateDoc' | 'addDoc' | 'deleteDoc' | 'deleteAllData' | 'restoreFromBackup' | 'seedCollection'>;

const RawDataEditorCard: React.FC = () => {
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
                    // This is a simplified approach for demonstration; a real-world scenario would diff arrays.
                    // For now, we assume the entire collection is being replaced or handled by the context setter.
                    // @ts-ignore
                    setter(parsedData); 
                    alert(`NOTE: Saving array data in mock mode replaces the whole set. For live data, this would require individual updates.`);
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
                        WARNING: You are editing raw JSON. Any changes saved here are applied directly to the database. Incorrectly formatted JSON or invalid data structures can break the application. Use with extreme caution.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <label htmlFor="collection-select" className="text-gray-300 font-semibold flex-shrink-0">Select Collection:</label>
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

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <SystemScanner />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                 <div className="xl:col-span-2">
                    <RawDataEditorCard />
                </div>
                <div className="space-y-6">
                    <FirebaseRulesCard setShowHelp={setShowHelp} setHelpTopic={setHelpTopic} />
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
                            <Input 
                                label="GitHub Repository URL" 
                                value={formData.githubUrl} 
                                onChange={e => setFormData(f => ({ ...f, githubUrl: e.target.value }))} 
                                placeholder="https://github.com/user/repo"
                            />
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
                             <Button onClick={handleSave} disabled={!isDirty || isSaving} className="w-full py-2 mt-4">
                                {isSaving ? 'Saving...' : isDirty ? 'Save Profile Settings' : 'All Changes Saved'}
                            </Button>
                        </div>
                    </DashboardCard>
                </div>
            </div>
            
            <DashboardCard title="App Setup Guide" icon={<DocumentIcon className="w-6 h-6" />}>
                <SetupGuideTab />
            </DashboardCard>
        </div>
    );
};