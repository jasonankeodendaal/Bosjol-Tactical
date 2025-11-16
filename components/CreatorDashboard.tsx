import React, { useState, useEffect, useContext } from 'react';
import type { CreatorDetails } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { ImageUpload } from './ImageUpload';
import { UserCircleIcon, CodeBracketIcon, ShieldCheckIcon } from './icons/Icons';
import { DataContext } from '../data/DataContext';
import { SystemScanner } from './SystemScanner';

const firebaseRulesContent = `
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
  
    function isAdmin() {
      return exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    match /settings/{docId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    match /(ranks|badges|...)/{docId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
    
    match /players/{playerId} {
      allow get: if request.auth != null && (isOwner(playerId) || isAdmin());
      allow list: if request.auth != null;
      allow update: if request.auth != null && (isOwner(playerId) || isAdmin());
      allow create, delete: if isAdmin();
    }
    
    match /(events|vouchers|...)/{docId} {
        allow read: if request.auth != null;
        allow write: if isAdmin();
    }

    match /_health/{testId} {
      allow write, delete: if request.auth != null;
      allow read: if request.auth != null;
    }
  }
}
`;

const FirebaseRulesTab: React.FC = () => {
    const [copyStatus, setCopyStatus] = useState('Copy Rules');

    const handleCopy = () => {
        navigator.clipboard.writeText(firebaseRulesContent.trim());
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy Rules'), 2000);
    };

    return (
        <DashboardCard title="Firestore Security Rules Reference" icon={<ShieldCheckIcon className="w-6 h-6" />}>
            <div className="p-6 space-y-4">
                <p className="text-sm text-gray-300">
                    These are the recommended security rules for the Bosjol Tactical application. They ensure that players can only edit their own data, while admins have full control. You can copy these rules and paste them directly into your Firebase project's Firestore rules editor.
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
            </div>
        </DashboardCard>
    );
};


export const CreatorDashboard: React.FC = () => {
    const dataContext = useContext(DataContext);
    if (!dataContext) throw new Error("DataContext not found");

    const { creatorDetails, setCreatorDetails, companyDetails } = dataContext;

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
        { id: 'rules', label: 'Firebase Rules', icon: <ShieldCheckIcon className="w-5 h-5"/> },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area with Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex border-b border-zinc-800">
                        {tabs.map(tab => (
                             <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${
                                    activeTab === tab.id
                                        ? 'border-red-500 text-red-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                } flex items-center gap-2 whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors uppercase tracking-wider`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div>
                        {activeTab === 'monitor' && <SystemScanner />}
                        {activeTab === 'rules' && <FirebaseRulesTab />}
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
