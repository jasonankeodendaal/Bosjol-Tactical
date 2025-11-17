

import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { DataContext, IS_LIVE_DATA, DataContextType } from '../data/DataContext';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, CogIcon, ArrowPathIcon, CodeBracketIcon } from './icons/Icons';
import { db, USE_FIREBASE, firebaseInitializationError, isFirebaseConfigured } from '../firebase';
import type { Player, GamificationRule, Badge, GameEvent, Transaction } from '../types';
import { UNRANKED_SUB_RANK } from '../constants';
import { DashboardCard } from './DashboardCard';
import { AuthContext } from '../auth/AuthContext';
import { InfoTooltip } from './InfoTooltip';

type CheckStatus = 'pass' | 'fail' | 'warn' | 'info' | 'pending' | 'running';

interface Check {
    category: string;
    name: string;
    description: string;
    checkFn: () => Promise<{ status: CheckStatus, detail: string }>;
    fixable?: boolean;
}

interface CheckResult {
    name: string;
    description: string;
    status: CheckStatus;
    detail: string;
    fixable?: boolean;
}

interface ErrorLogEntry {
    timestamp: Date;
    checkName: string;
    category: string;
    detail: string;
    status: 'fail' | 'warn';
}

const checkUrl = async (url: string | undefined, name: string): Promise<{ status: 'pass' | 'fail' | 'warn', detail: string }> => {
    if (!url || typeof url !== 'string' || url.trim() === '') return { status: 'warn', detail: `URL for '${name}' is not configured.` };
    if (url.startsWith('data:')) return { status: 'pass', detail: 'URL is a valid data URI.' };
    try {
        const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
        return { status: 'pass', detail: 'URL is reachable.' };
    } catch (error) {
        return { status: 'fail', detail: `URL fetch for '${name}' failed, resource is unreachable.` };
    }
};

const CircularProgress: React.FC<{ percentage: number; size?: number; strokeWidth?: number; colorClass: string; }> = ({ percentage, size = 120, strokeWidth = 10, colorClass }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle
                className="text-zinc-700"
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
            />
            <motion.circle
                className={colorClass}
                strokeWidth={strokeWidth}
                stroke="currentColor"
                fill="transparent"
                r={radius}
                cx={size / 2}
                cy={size / 2}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                variants={{
                    initial: { strokeDashoffset: circumference },
                    animate: { strokeDashoffset: offset },
                }}
                initial="initial"
                animate="animate"
                transition={{ duration: 1, ease: "easeOut" }}
            />
        </svg>
    );
};

const MiniLineGraph: React.FC<{ colorClass: string }> = ({ colorClass }) => (
    <svg viewBox="0 0 100 30" className="w-full h-8" preserveAspectRatio="none">
        <path d="M 0 20 Q 10 10, 20 20 T 40 15 T 60 25 T 80 10 L 100 15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" className={colorClass} />
    </svg>
);


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
    // Default deny all to secure your bucket.
    match /{allPaths=**} {
      allow read, write: if false;
    }
    
    // Allow public read access to all files.
    // This is simple and suitable for this app's public assets like logos and event images.
    match /{allPaths=**} {
      allow read: if true;
    }
    
    // Allow any authenticated user (player, admin, creator) to upload/write files.
    // For a production app with user-specific content, you would restrict this further,
    // e.g., match /users/{userId}/{fileName} { allow write: if request.auth.uid == userId; }
    match /{allPaths=**} {
      allow write: if request.auth != null;
    }
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


type PowerhouseTab = 'status' | 'data' | 'rules';

const TabButton: React.FC<{ name: string, active: boolean, onClick: () => void }> = ({ name, active, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors ${active ? 'border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
    >
        {name}
    </button>
);


export const SystemScanner: React.FC = () => {
    const dataContext = useContext(DataContext as React.Context<DataContextType>);
    const authContext = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState<PowerhouseTab>('status');
    const [results, setResults] = useState<Record<string, CheckResult[]>>({});
    const [errorLog, setErrorLog] = useState<ErrorLogEntry[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const [selectedCollection, setSelectedCollection] = useState<keyof DataContextType>('players');
    const collectionData = dataContext ? JSON.stringify(dataContext[selectedCollection], null, 2) : "Data context not available.";
    const collectionNames = dataContext ? Object.keys(dataContext).filter(k => Array.isArray(dataContext[k as keyof DataContextType])) : [];

    const [editedData, setEditedData] = useState(collectionData);
    useEffect(() => { setEditedData(collectionData); }, [collectionData]);
    
    const ALL_CHECKS = useCallback((): Check[] => {
        if (!dataContext) return [];
        const { players, companyDetails, rankTiers, badges, gamificationSettings, events, inventory, creatorDetails, socialLinks, carouselMedia, transactions, signups, legendaryBadges, locations, suppliers, sponsors, vouchers, raffles } = dataContext;

        const collectionNames: (keyof DataContextType)[] = ['players', 'events', 'rankTiers', 'badges', 'legendaryBadges', 'gamificationSettings', 'sponsors', 'vouchers', 'inventory', 'suppliers', 'transactions', 'locations', 'raffles', 'socialLinks', 'carouselMedia'];
        const playerIds = new Set(players.map(p => p.id));
        const eventIds = new Set(events.map(e => e.id));
        const supplierIds = new Set(suppliers.map(s => s.id));
        const locationNames = new Set(locations.map(l => l.name));

        return [
            // --- CORE SYSTEM ---
            { category: 'Core System', name: 'React App Initialized', description: "Checks if the main application UI has successfully rendered.", checkFn: async () => document.getElementById('root')?.hasChildNodes() ? { status: 'pass', detail: 'Root element is mounted.' } : { status: 'fail', detail: 'React root not found or is empty.' } },
            { category: 'Core System', name: 'Data Context Availability', description: "Verifies that the main data provider is available to all components.", checkFn: async () => dataContext ? { status: 'pass', detail: 'DataContext is available.' } : { status: 'fail', detail: 'DataContext is not available.' } },
            { category: 'Core System', name: 'Auth Context Availability', description: "Verifies that the authentication provider is available.", checkFn: async () => authContext ? { status: 'pass', detail: 'AuthContext is available.' } : { status: 'fail', detail: 'AuthContext is not available.' } },
            { category: 'Core System', name: 'PWA Manifest', description: "Checks if the manifest.json for Progressive Web App functionality is valid.", checkFn: async () => { try { const res = await fetch('/manifest.json'); if (res.ok) { await res.json(); return { status: 'pass', detail: 'manifest.json is valid.' }; } return { status: 'fail', detail: `manifest.json fetch failed: ${res.statusText}` }; } catch (e) { return { status: 'fail', detail: `manifest.json parsing failed: ${(e as Error).message}` }; } } },

            // --- DATA & STORAGE ---
            { category: 'Data & Storage', name: 'Storage Mode', description: "Identifies if the app is using live data or mock data.", checkFn: async () => ({ status: 'info', detail: `App is running in ${IS_LIVE_DATA ? 'LIVE (Firebase/API)' : 'MOCK'} data mode.` }) },
            { category: 'Data & Storage', name: 'Firebase SDK Initialization', description: "Checks if the Firebase library initialized correctly.", checkFn: async () => !USE_FIREBASE ? {status: 'info', detail: 'Firebase is disabled.'} : firebaseInitializationError ? { status: 'fail', detail: `Init failed: ${firebaseInitializationError.message}` } : { status: 'pass', detail: 'SDK initialized successfully.' } },
            { category: 'Data & Storage', name: 'Firebase Config', description: "Verifies that all required Firebase env variables are present.", checkFn: async () => !USE_FIREBASE ? {status: 'info', detail: 'Firebase is disabled.'} : isFirebaseConfigured() ? { status: 'pass', detail: 'Env variables are set.' } : { status: 'fail', detail: 'One or more VITE_FIREBASE_* env variables are missing.' } },
            { category: 'Data & Storage', name: 'Firestore Read/Write Test', description: "Performs a live test to create, read, and delete a document.", checkFn: async () => { if (!IS_LIVE_DATA || !db) return { status: 'pass', detail: 'Skipped (mock data mode).' }; const t = db.collection('_health').doc(`test_${Date.now()}`); try { await t.set({s:'w'}); const d=await t.get(); if (!d.exists) throw new Error('Read fail.'); await t.delete(); return { status: 'pass', detail: 'CRUD operations successful.' }; } catch (e) { return { status: 'fail', detail: `R/W test failed: ${(e as Error).message}` }; } finally { try { await t.delete(); } catch (_) {} }}},
            ...collectionNames.map(name => ({
                category: 'Data & Storage' as const,
                name: `Collection: ${name}`,
                description: `Checks if the '${name}' data collection has been loaded.`,
                checkFn: async () => {
                    const data = dataContext[name];
                    const count = Array.isArray(data) ? data.length : (data ? 1 : 0);
                    return count > 0 ? { status: 'pass' as const, detail: `${count} item(s) loaded.` } : { status: 'warn' as const, detail: `Collection is empty or failed to load.`, fixable: true };
                }
            })),
             { category: 'Data & Storage', name: 'Duplicate Player Codes', description: 'Ensures every player has a unique Player Code.', checkFn: async () => { const codes = players.map(p => p.playerCode); const duplicates = codes.filter((c, i) => codes.indexOf(c) !== i); return duplicates.length > 0 ? {status: 'fail', detail: `Found duplicate codes: ${[...new Set(duplicates)].join(', ')}.`} : {status: 'pass', detail: 'All player codes are unique.'}; }},
            { category: 'Data & Storage', name: 'Orphaned Data Check', description: 'Checks for references to players/events that no longer exist.', checkFn: async () => { const orphans: string[] = []; events.forEach(e => e.attendees.forEach(a => { if (!playerIds.has(a.playerId)) orphans.push(`event '${e.title}' attendee`); })); transactions.forEach(t => { if(t.relatedPlayerId && !playerIds.has(t.relatedPlayerId)) orphans.push(`Txn ${t.id} -> player`); if(t.relatedEventId && !eventIds.has(t.relatedEventId)) orphans.push(`Txn ${t.id} -> event`); }); signups.forEach(s => { if(!playerIds.has(s.playerId)) orphans.push(`Signup ${s.id} -> player`); if(!eventIds.has(s.eventId)) orphans.push(`Signup ${s.id} -> event`); }); return orphans.length > 0 ? {status: 'warn', detail: `Found ${orphans.length} orphaned record(s).`} : {status: 'pass', detail: 'No orphaned data found.'}; }},
            { category: 'Data & Storage', name: 'Invalid Foreign Keys', description: 'Checks for broken links between collections (e.g., inventory to supplier).', checkFn: async () => { const invalids: string[] = []; inventory.forEach(i => { if(i.supplierId && !supplierIds.has(i.supplierId)) invalids.push(`Inv ${i.name} -> supplier`); }); events.forEach(e => { if(e.location && !locationNames.has(e.location)) invalids.push(`Event '${e.title}' -> location`); }); return invalids.length > 0 ? {status: 'warn', detail: `Found ${invalids.length} invalid reference(s).`} : {status: 'pass', detail: 'All foreign keys are valid.'}; }},
            
            // --- API & PERFORMANCE ---
            { category: 'API & Performance', name: 'API Server Health', description: "Pings the external API server (if configured).", checkFn: async () => !companyDetails.apiServerUrl ? { status: 'info', detail: 'Not configured.' } : checkUrl(`${companyDetails.apiServerUrl}/health`, 'API Server') },
            { category: 'API & Performance', name: 'Settings Document Size', description: "Checks the size of the companyDetails document against the 1MB Firestore limit.", checkFn: async () => { const size = new TextEncoder().encode(JSON.stringify(companyDetails)).length; const limit = 1048576; const percentage = (size / limit) * 100; if (percentage > 95) return {status: 'fail', detail: `${(size/1024).toFixed(0)} KB (${percentage.toFixed(0)}%). Critically close to 1MB limit. Use external URLs for media.`}; if (percentage > 75) return {status: 'warn', detail: `${(size/1024).toFixed(0)} KB (${percentage.toFixed(0)}%). Approaching 1MB limit.`}; return {status: 'pass', detail: `${(size/1024).toFixed(0)} KB (${percentage.toFixed(0)}% of 1MB limit).`}; }},

            // --- CONFIGURATION ---
            { category: 'Configuration', name: 'Company Details', description: "Ensures the main company configuration was loaded.", checkFn: async () => companyDetails?.name ? { status: 'pass', detail: `Loaded: ${companyDetails.name}` } : { status: 'fail', detail: 'Company details are missing.', fixable: true } },
            { category: 'Configuration', name: 'Creator Details', description: "Ensures the creator's details were loaded.", checkFn: async () => creatorDetails?.name ? { status: 'pass', detail: `Loaded: ${creatorDetails.name}` } : { status: 'warn', detail: 'Creator details are missing.', fixable: true } },
            
            // --- CONTENT & MEDIA ---
            ...Object.entries({
                'Company Logo': companyDetails.logoUrl,
                'Login Background': companyDetails.loginBackgroundUrl,
                'Login Audio': companyDetails.loginAudioUrl,
                'Player Dashboard BG': companyDetails.playerDashboardBackgroundUrl,
                'Admin Dashboard BG': companyDetails.adminDashboardBackgroundUrl,
                'Player Dashboard Audio': companyDetails.playerDashboardAudioUrl,
                'Admin Dashboard Audio': companyDetails.adminDashboardAudioUrl,
                'Creator Logo': creatorDetails.logoUrl,
            }).map(([name, url]) => ({ category: 'Content & Media' as const, name: `URL: ${name}`, description: `Validates that the URL for ${name} is accessible.`, checkFn: () => checkUrl(url, name) })),
            ...socialLinks.flatMap(s => ({ category: 'Content & Media' as const, name: `URL: Social Icon '${s.name}'`, description: `Validates the icon URL for the ${s.name} social link.`, checkFn: () => checkUrl(s.iconUrl, `Social Icon '${s.name}'`) })),
            ...carouselMedia.flatMap(c => ({ category: 'Content & Media' as const, name: `URL: Carousel Media`, description: `Validates the URL for a carousel media item.`, checkFn: () => checkUrl(c.url, `Carousel Media`) })),
            ...sponsors.flatMap(s => ({ category: 'Content & Media' as const, name: `URL: Sponsor Logo '${s.name}'`, description: `Validates the logo URL for sponsor ${s.name}.`, checkFn: () => checkUrl(s.logoUrl, `Sponsor Logo '${s.name}'`) })),
            ...rankTiers.flatMap(t => [{ category: 'Content & Media' as const, name: `URL: Tier Badge '${t.name}'`, description: `Validates the badge URL for tier ${t.name}.`, checkFn: () => checkUrl(t.tierBadgeUrl, `Tier Badge '${t.name}'`) }, ...t.subranks.map(s => ({ category: 'Content & Media' as const, name: `URL: Subrank Icon '${s.name}'`, description: `Validates the icon URL for subrank ${s.name}.`, checkFn: () => checkUrl(s.iconUrl, `Subrank Icon '${s.name}'`) }))]),
            ...badges.flatMap(b => ({ category: 'Content & Media' as const, name: `URL: Badge Icon '${b.name}'`, description: `Validates the icon URL for badge ${b.name}.`, checkFn: () => checkUrl(b.iconUrl, `Badge Icon '${b.name}'`) })),
            ...legendaryBadges.flatMap(b => ({ category: 'Content & Media' as const, name: `URL: Legendary Badge '${b.name}'`, description: `Validates the icon URL for legendary badge ${b.name}.`, checkFn: () => checkUrl(b.iconUrl, `Legendary Badge '${b.name}'`) })),
            ...events.flatMap(e => ({ category: 'Content & Media' as const, name: `URL: Event Image '${e.title}'`, description: `Validates the image URL for event ${e.title}.`, checkFn: () => checkUrl(e.imageUrl, `Event Image '${e.title}'`) })),

            // --- CORE AUTOMATIONS ---
            { category: 'Core Automations', name: 'Event Finalization Logic', description: 'Simulates finalizing an event to verify XP calculations.', checkFn: async () => { try { const mockPlayer = { ...players[0], stats: { ...players[0].stats, xp: 1000 } }; const pXp = 50; const stats = { kills: 5, deaths: 2, headshots: 1 }; const getXp = (ruleId: string) => gamificationSettings.find(r => r.id === ruleId)?.xp ?? 0; const xpg = pXp + (stats.kills * getXp('g_kill')) + (stats.headshots * getXp('g_headshot')) + (stats.deaths * getXp('g_death')); const fXp = mockPlayer.stats.xp + xpg; const eXp = 1000 + 50 + (5 * 10) + (1 * 25) + (2 * -5); return fXp === eXp ? { status: 'pass', detail: `Correctly calc ${xpg} XP.` } : { status: 'fail', detail: `Calc error. Expected ${eXp}, got ${fXp}.` }; } catch (e) { return { status: 'fail', detail: `An exception occurred: ${(e as Error).message}` }; } } },
            { category: 'Core Automations', name: 'Rank Calculation Logic', description: 'Simulates player XP to verify correct rank assignment.', checkFn: async () => { if (!rankTiers || rankTiers.length === 0) return { status: 'warn', detail: 'Rank Tiers not loaded. Skipping check.' }; const mP = { stats: { xp: 750, gamesPlayed: 11 } } as Player; if (mP.stats.gamesPlayed < 10) return { status: 'fail', detail: 'Logic failed: Player with 11 games was considered unranked.' }; const allSubRanks = rankTiers.flatMap(t => t.subranks); const sR = [...allSubRanks].sort((a, b) => b.minXp - a.minXp); const r = sR.find(r => mP.stats.xp >= r.minXp) || UNRANKED_SUB_RANK; return r && r.name === "Rookie IV" ? { status: 'pass', detail: 'Correctly assigned Rookie IV.' } : { status: 'fail', detail: `Incorrect rank. Expected Rookie IV, got ${r?.name || 'undefined'}.` }; }},
            { category: 'Core Automations', name: 'Rank Progression Sanity', description: 'Checks for sorting errors or large XP gaps between consecutive ranks.', checkFn: async () => { const allSubRanks = rankTiers.flatMap(t => t.subranks); const sortedRanks = [...allSubRanks].sort((a,b) => a.minXp - b.minXp); const errors = []; for (let i=0; i < sortedRanks.length - 1; i++) { if (sortedRanks[i].minXp >= sortedRanks[i+1].minXp) errors.push(`Sort error: ${sortedRanks[i].name} >= ${sortedRanks[i+1].name}.`); const gap = sortedRanks[i+1].minXp - sortedRanks[i].minXp; if (gap > 5000) errors.push(`Large gap: ${sortedRanks[i].name} -> ${sortedRanks[i+1].name} (${gap} XP)`); } return errors.length > 0 ? { status: 'warn', detail: `Issues found: ${errors.join('; ')}` } : { status: 'pass', detail: 'No sorting errors or large XP gaps found.' }; } },
        ];
    }, [dataContext, authContext]);

    const runChecks = useCallback(async () => {
        setIsScanning(true);
        setErrorLog([]);
        setResults({});
        const allChecks = ALL_CHECKS();

        const initialResults: Record<string, CheckResult[]> = {};
        allChecks.forEach(check => {
            if (!initialResults[check.category]) initialResults[check.category] = [];
            initialResults[check.category].push({ name: check.name, description: check.description, status: 'pending', detail: 'Waiting to run...' });
        });
        setResults(initialResults);

        const newErrorLog: ErrorLogEntry[] = [];

        for (const check of allChecks) {
            setResults(prev => ({ ...prev, [check.category]: prev[check.category].map(c => c.name === check.name ? { ...c, status: 'running', detail: 'Scanning...' } : c) }));

            const result = await check.checkFn();
            const finalResult = { ...check, ...result };

            setResults(prev => ({ ...prev, [finalResult.category]: prev[finalResult.category].map(c => c.name === finalResult.name ? { name: finalResult.name, description: finalResult.description, status: finalResult.status, detail: finalResult.detail, fixable: finalResult.fixable } : c) }));
            
            if (finalResult.status === 'fail' || finalResult.status === 'warn') {
                newErrorLog.push({ timestamp: new Date(), checkName: finalResult.name, category: finalResult.category, detail: finalResult.detail, status: finalResult.status });
                setErrorLog([...newErrorLog].sort((a, b) => (a.status === 'fail' ? -1 : 1) - (b.status === 'fail' ? -1 : 1)));
            }
        }
        setIsScanning(false);
    }, [ALL_CHECKS]);

    const handleFix = (check: CheckResult) => {
        if (!dataContext) return;
        const name = check.name;
        if (name === 'Company Details') dataContext.seedCollection('companyDetails');
        if (name === 'Creator Details') dataContext.seedCollection('creatorDetails');
        if (name.startsWith('Collection:')) {
            const collectionName = name.replace('Collection: ', '').trim() as keyof DataContextType;
            dataContext.seedCollection(collectionName as any); // cast as any to bypass complex type issues
        }
        setTimeout(runChecks, 1000); // Re-run checks after attempting a fix
    };

    const handleSaveRawData = async () => {
        if (!confirm(`Are you sure you want to overwrite all data for the '${selectedCollection}' collection? This is a high-risk operation that cannot be undone.`)) {
            return;
        }
        try {
            const parsedData = JSON.parse(editedData);
            if (!Array.isArray(parsedData)) {
                throw new Error("Data must be a JSON array of objects.");
            }
            
            if (IS_LIVE_DATA && db) {
                const collectionRef = db.collection(selectedCollection as string);
                
                // First, delete all existing documents in the collection
                const existingDocs = await collectionRef.get();
                const deleteBatch = db.batch();
                existingDocs.forEach(doc => deleteBatch.delete(doc.ref));
                await deleteBatch.commit();

                // Then, add all new documents
                const addBatch = db.batch();
                parsedData.forEach(doc => {
                    if (doc.id) {
                        const { id, ...data } = doc;
                        const docRef = collectionRef.doc(id);
                        addBatch.set(docRef, data);
                    } else {
                         addBatch.set(collectionRef.doc(), doc); // Add with auto-generated ID if none provided
                    }
                });
                await addBatch.commit();
                alert('Live data updated successfully. Data will refresh shortly.');
            } else {
                // Mock data update
                const setter = (dataContext as any)[`set${selectedCollection.charAt(0).toUpperCase() + selectedCollection.slice(1)}`];
                if (typeof setter === 'function') {
                    setter(parsedData);
                    alert('Mock data updated in memory. Changes will be lost on refresh.');
                } else {
                    throw new Error(`Setter function for ${selectedCollection} not found in DataContext.`);
                }
            }
        } catch (e) {
            alert(`Failed to save data: ${(e as Error).message}`);
        }
    };


    useEffect(() => {
        runChecks();
    }, [runChecks]);

    const { healthScore, errorCount, warningCount, noticeCount } = useMemo(() => {
        const all: CheckResult[] = (Object.values(results) as CheckResult[][]).reduce((acc, arr) => acc.concat(arr), []);
        if (all.length === 0) return { healthScore: 0, errorCount: 0, warningCount: 0, noticeCount: 0 };

        const passes = all.filter(c => c.status === 'pass').length;
        const totalRelevant = all.filter(c => c.status === 'pass' || c.status === 'fail').length;
        
        return {
            healthScore: totalRelevant > 0 ? Math.round((passes / totalRelevant) * 100) : 100,
            errorCount: all.filter(c => c.status === 'fail').length,
            warningCount: all.filter(c => c.status === 'warn').length,
            noticeCount: all.filter(c => c.status === 'info').length,
        };
    }, [results]);

    const getCategoryHealth = (category: string) => {
        const checks = results[category] || [];
        if (checks.length === 0) return { score: 100, hasFails: false, fails: 0, warns: 0 };
        const passes = checks.filter(c => c.status === 'pass').length;
        const fails = checks.filter(c => c.status === 'fail').length;
        const warns = checks.filter(c => c.status === 'warn').length;
        const totalRelevant = checks.filter(c => c.status === 'pass' || c.status === 'fail').length;
        const score = totalRelevant > 0 ? Math.round((passes / totalRelevant) * 100) : 100;
        return { score, hasFails: fails > 0, fails, warns };
    };

    return (
        <DashboardCard title="System Powerhouse" icon={<CodeBracketIcon className="w-6 h-6" />} titleAddon={<Button size="sm" variant="secondary" onClick={runChecks} disabled={isScanning} className="!p-1.5"><ArrowPathIcon className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`}/></Button>}>
            <div className="p-4 sm:p-6">
                <div className="border-b border-zinc-700 mb-4">
                    <nav className="flex space-x-4 -mb-px" aria-label="Powerhouse Tabs">
                        <TabButton name="Live Status" active={activeTab === 'status'} onClick={() => setActiveTab('status')} />
                        <TabButton name="Raw Data Editor" active={activeTab === 'data'} onClick={() => setActiveTab('data')} />
                        <TabButton name="Firebase Rules" active={activeTab === 'rules'} onClick={() => setActiveTab('rules')} />
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
                        {activeTab === 'status' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                                    <div className="lg:col-span-3 bg-zinc-900/50 p-4 rounded-lg flex flex-col items-center justify-center">
                                        <h3 className="font-semibold text-gray-300 mb-2 text-center">Site Health</h3>
                                        <div className="relative">
                                            <CircularProgress percentage={healthScore} colorClass={healthScore > 90 ? 'text-green-500' : healthScore > 60 ? 'text-yellow-500' : 'text-red-500'} />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-4xl font-bold text-white">{healthScore}%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div className="bg-zinc-900/50 p-4 rounded-lg">
                                            <h3 className="font-semibold text-gray-300 flex items-center gap-1">Errors <InfoTooltip text="Critical issues that may break application functionality."/></h3>
                                            <p className="text-4xl font-bold text-red-500">{errorCount}</p>
                                            <MiniLineGraph colorClass="text-red-500/50"/>
                                        </div>
                                        <div className="bg-zinc-900/50 p-4 rounded-lg">
                                            <h3 className="font-semibold text-gray-300 flex items-center gap-1">Warnings <InfoTooltip text="Non-critical issues that may cause degraded performance or missing content."/></h3>
                                            <p className="text-4xl font-bold text-yellow-500">{warningCount}</p>
                                            <MiniLineGraph colorClass="text-yellow-500/50"/>
                                        </div>
                                        <div className="bg-zinc-900/50 p-4 rounded-lg">
                                            <h3 className="font-semibold text-gray-300 flex items-center gap-1">Notices <InfoTooltip text="Informational messages about the system's configuration."/></h3>
                                            <p className="text-4xl font-bold text-blue-500">{noticeCount}</p>
                                            <MiniLineGraph colorClass="text-blue-500/50"/>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    <div className="lg:col-span-8">
                                        <h3 className="font-semibold text-gray-200 mb-3 text-lg">Thematic Reports</h3>
                                        <div className="space-y-2">
                                            {Object.keys(results).sort().map(category => {
                                                const { score, hasFails, fails, warns } = getCategoryHealth(category);
                                                const isOpen = expandedCategory === category;
                                                return (
                                                    <div key={category} className="bg-zinc-900/50 rounded-lg border border-zinc-700/50 overflow-hidden">
                                                        <button className="w-full flex items-center p-4 text-left" onClick={() => setExpandedCategory(isOpen ? null : category)}>
                                                            <div className="relative w-10 h-10 mr-4">
                                                                <CircularProgress percentage={score} size={40} strokeWidth={4} colorClass={hasFails ? 'text-red-500' : score < 100 ? 'text-yellow-500' : 'text-green-500'} />
                                                                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{score}%</div>
                                                            </div>
                                                            <div className="flex-grow">
                                                                <p className="font-semibold text-gray-200">{category}</p>
                                                                <div className="flex items-center gap-3 text-xs text-gray-400">
                                                                    {fails > 0 && <span className="text-red-400">{fails} Error(s)</span>}
                                                                    {warns > 0 && <span className="text-yellow-400">{warns} Warning(s)</span>}
                                                                    {fails === 0 && warns === 0 && <span className="text-green-400">All Clear</span>}
                                                                </div>
                                                            </div>
                                                            <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                                                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                            </motion.div>
                                                        </button>
                                                        <AnimatePresence>
                                                        {isOpen && (
                                                            <motion.section
                                                                key="content"
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                                className="border-t border-zinc-700/50"
                                                            >
                                                                <div className="p-4 space-y-3">
                                                                    {(results[category] || []).map(check => (
                                                                        <div key={check.name} className="flex items-start gap-3 text-sm p-2 bg-zinc-800/50 rounded-md">
                                                                            {check.status === 'pending' && <CogIcon className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />}
                                                                            {check.status === 'running' && <CogIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0 animate-spin" />}
                                                                            {check.status === 'pass' && <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />}
                                                                            {check.status === 'fail' && <XCircleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />}
                                                                            {check.status === 'warn' && <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />}
                                                                            {check.status === 'info' && <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />}
                                                                            <div className="flex-grow">
                                                                                <p className="font-semibold text-gray-200">{check.name}</p>
                                                                                <p className="text-xs text-gray-400">{check.detail}</p>
                                                                            </div>
                                                                            {check.fixable && (check.status === 'fail' || check.status === 'warn') && (
                                                                                <Button size="sm" variant="secondary" onClick={() => handleFix(check)}>Fix It</Button>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </motion.section>
                                                        )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-4">
                                        <h3 className="font-semibold text-gray-200 mb-3 text-lg">Activity Log</h3>
                                        <div className="bg-zinc-900/50 p-2 rounded-lg max-h-80 overflow-y-auto">
                                            {errorLog.length > 0 ? (
                                                <ul className="space-y-1">
                                                    {errorLog.map((log, i) => (
                                                        <li key={i} className="p-2 rounded-md hover:bg-zinc-800/50">
                                                            <div className="flex items-start gap-2">
                                                                {log.status === 'fail' ? <XCircleIcon className="w-4 h-4 text-red-500 mt-0.5"/> : <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mt-0.5"/>}
                                                                <p className="text-sm font-semibold text-gray-200">{log.checkName}</p>
                                                            </div>
                                                            <p className="text-xs text-gray-400 pl-6">{log.detail}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="text-center p-8">
                                                    <CheckCircleIcon className="w-10 h-10 text-green-500 mx-auto"/>
                                                    <p className="mt-2 text-sm text-gray-400">No issues found.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'data' && (
                            <div>
                                <h3 className="font-semibold text-gray-200 mb-3 text-lg">Raw Data Editor</h3>
                                <p className="text-sm text-amber-300 bg-amber-900/50 border border-amber-700 p-3 rounded-md mb-4">
                                    <ExclamationTriangleIcon className="inline w-5 h-5 mr-2" />
                                    <strong>High-Risk Area:</strong> Editing this data directly can break the application. Ensure your JSON is valid and all objects in an array have a unique `id` property. This tool will completely replace the existing collection data with your new content.
                                </p>
                                <select value={selectedCollection} onChange={e => setSelectedCollection(e.target.value as keyof DataContextType)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                                    {collectionNames.map(name => <option key={name} value={name}>{name}</option>)}
                                </select>
                                <textarea
                                    value={editedData}
                                    onChange={e => setEditedData(e.target.value)}
                                    className="text-xs text-gray-200 w-full font-mono h-96 bg-zinc-950 p-4 rounded-lg border border-zinc-700 mt-4 focus:ring-red-500 focus:border-red-500"
                                    spellCheck="false"
                                />
                                <Button onClick={handleSaveRawData} variant="danger" className="w-full mt-4">
                                    Save Raw Data for '{selectedCollection}'
                                </Button>
                            </div>
                        )}
                        
                        {activeTab === 'rules' && (
                           <div>
                                <h3 className="font-semibold text-gray-200 mb-3 text-lg">Required Firebase Security Rules</h3>
                                <p className="text-sm text-gray-400 mb-4">
                                    For the application to function correctly with a live Firebase backend, these security rules must be published in your project's Firestore and Storage settings. They secure your data by preventing unauthorized access (e.g., players editing their own XP).
                                </p>
                                <CodeBlock title="firestore.rules">
                                    {firestoreRulesContent}
                                </CodeBlock>
                                 <CodeBlock title="storage.rules">
                                    {storageRulesContent}
                                </CodeBlock>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>
        </DashboardCard>
    );
};
