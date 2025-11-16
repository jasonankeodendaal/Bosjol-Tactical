
import React, { useState, useEffect, useContext } from 'react';
import type { CreatorDetails } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { ImageUpload } from './ImageUpload';
import { UserCircleIcon, CodeBracketIcon } from './icons/Icons';
import { DataContext } from '../data/DataContext';
import { SystemScanner } from './SystemScanner';

const firestoreRulesContent = `
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
  
    function isAdmin() {
      // Allow access if the user is authenticated and their corresponding document in the 'admins' collection has the role 'admin'.
      // Note: This rule assumes your admin user's UID in Firebase Auth matches the document ID in the 'admins' collection.
      // If you are only using email/password for admin, you might need a different check, but this is a secure standard.
      return request.auth != null && get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }

    function isOwner(userId) {
      // Check if the requesting user's ID matches the document ID they are trying to access.
      return request.auth.uid == userId;
    }
    
    function isAuthenticated() {
      // Check if the user is signed in.
      return request.auth != null;
    }

    // --- DEFAULT & ADMIN RULES ---

    // Default deny all access unless explicitly allowed by a more specific rule below.
    // Admins get universal read/write access to everything. This is a powerful override.
    match /{document=**} {
      allow read, write: if isAdmin();
    }
    
    // --- PUBLIC & SEMI-PUBLIC RULES ---
    
    // Allow anyone (even unauthenticated users) to read settings needed for the login/front page.
    // Only admins can change these settings.
    match /settings/{docId} {
        allow read: if true;
        allow write: if isAdmin();
    }
    match /socialLinks/{docId} {
        allow read: if true;
        allow write: if isAdmin();
    }
    match /carouselMedia/{docId} {
        allow read: if true;
        allow write: if isAdmin();
    }
    
    // --- PLAYER-SPECIFIC RULES ---
    
    match /players/{userId} {
      // Any authenticated user (players, admins) can read any player's profile data (for leaderboards, etc.).
      allow read: if isAuthenticated();
      
      // A player can only update their OWN document.
      // CRITICAL: They are NOT allowed to update sensitive fields like stats, rank, role, xp, xpAdjustments, playerCode, badges, legendaryBadges, matchHistory, etc.
      // This prevents players from cheating by modifying their own progression data.
      allow update: if isOwner(userId) && 
                    !(request.resource.data.diff(resource.data).affectedKeys()
                      .hasAny(['stats', 'rank', 'role', 'xp', 'xpAdjustments', 'playerCode', 'badges', 'legendaryBadges', 'matchHistory']));
    }
    
    // Any authenticated user can read event details. Only admins can create/update them.
    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin(); // Includes create, update, delete
    }
    
    // --- READ-ONLY FOR AUTHENTICATED USERS ---
    // All authenticated players need to be able to read these collections for the dashboard to function.
    // Only admins can modify them (covered by the `match /{document=**}` rule above).
    match /ranks/{docId} { allow read: if isAuthenticated(); }
    match /badges/{docId} { allow read: if isAuthenticated(); }
    match /legendaryBadges/{docId} { allow read: if isAuthenticated(); }
    match /gamificationSettings/{docId} { allow read: if isAuthenticated(); }
    match /sponsors/{docId} { allow read: if isAuthenticated(); }
    match /inventory/{docId} { allow read: if isAuthenticated(); }
    match /suppliers/{docId} { allow read: if isAuthenticated(); }
    match /locations/{docId} { allow read: if isAuthenticated(); }
    match /raffles/{docId} { allow read: if isAuthenticated(); }
    match /vouchers/{docId} { allow read: if isAuthenticated(); allow write: if isAdmin(); }
    
    // --- ADMIN-ONLY COLLECTIONS ---
    // Transactions are admin-only for both read and write, as they contain financial data.
    match /transactions/{docId} { 
        allow read, write: if isAdmin(); 
    }
    
    // --- SYSTEM HEALTH CHECK ---
    // A special collection for the System Scanner to test Firestore connectivity.
    // Allows any authenticated user to perform a temporary read/write test.
    match /_health/{docId} {
        allow read, write: if isAuthenticated();
    }
  }
}
`.trim();


const FirebaseRulesCard: React.FC = () => {
    const [copyStatus, setCopyStatus] = useState('Copy');
    
    const handleCopy = () => {
        navigator.clipboard.writeText(firestoreRulesContent).then(() => {
            setCopyStatus('Copied!');
            setTimeout(() => setCopyStatus('Copy'), 2000);
        }, () => {
            setCopyStatus('Failed!');
            setTimeout(() => setCopyStatus('Copy'), 2000);
        });
    };

    return (
        <DashboardCard title="Firestore Security Rules" icon={<CodeBracketIcon className="w-6 h-6" />}>
            <div className="p-4">
                <p className="text-sm text-gray-400 mb-3">Copy these rules and paste them into your Firebase project's Firestore rules editor to secure your database.</p>
                <div className="relative">
                    <pre className="bg-zinc-900 p-3 rounded-lg border border-zinc-700 text-xs text-gray-300 overflow-auto h-64 font-mono">
                        <code>{firestoreRulesContent}</code>
                    </pre>
                    <Button size="sm" variant="secondary" onClick={handleCopy} className="absolute top-2 right-2">
                        {copyStatus}
                    </Button>
                </div>
            </div>
        </DashboardCard>
    );
}

export const CreatorDashboard: React.FC = () => {
    const dataContext = useContext(DataContext);
    if (!dataContext) throw new Error("DataContext not found");

    const { creatorDetails, setCreatorDetails, companyDetails } = dataContext;

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
            // FIX: Replaced template literal with string concatenation to avoid potential parsing issues with some tools.
            alert('An error occurred: ' + (error as Error).message);
        } finally {
            setIsSaving(false);
        }
    };

    const isDirty = JSON.stringify(formData) !== JSON.stringify(creatorDetails);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: System Scanner */}
                <div className="lg:col-span-2">
                    <SystemScanner />
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
                    
                    <FirebaseRulesCard />

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
                    
                    <div className="sticky top-24 z-20">
                        <Button onClick={handleSave} disabled={!isDirty || isSaving} className="w-full py-3 text-lg shadow-lg">
                            {isSaving ? 'Saving...' : isDirty ? 'Save Creator Settings' : 'All Changes Saved'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
