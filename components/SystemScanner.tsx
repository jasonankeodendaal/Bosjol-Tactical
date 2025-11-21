// FIX: Import React and its hooks (useState, useContext, useEffect, useCallback, useMemo) to resolve multiple 'Cannot find name' errors throughout the component.
import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { DataContext, IS_LIVE_DATA, DataContextType } from '../data/DataContext';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, CogIcon, ArrowPathIcon, CodeBracketIcon, CloudArrowDownIcon, MagnifyingGlassIcon } from './icons/Icons';
import { db, USE_FIREBASE, firebaseInitializationError, isFirebaseConfigured } from '../firebase';
import type { Player, Rank, Tier, GameEvent, Transaction, Signup, InventoryItem, Badge, LegendaryBadge } from '../types';
import { UNRANKED_TIER } from '../constants';
import { DashboardCard } from './DashboardCard';
import { AuthContext } from '../auth/AuthContext';
import { InfoTooltip } from './InfoTooltip';
import { Input } from './Input';

type CheckStatus = 'pass' | 'fail' | 'warn' | 'info' | 'pending' | 'running';

interface Check {
    category: string;
    name: string;
    description: string;
    checkFn: (allData: DataContextType) => Promise<{ status: CheckStatus, detail: string, fixable?: boolean }>;
    fixFn?: (allData: DataContextType) => Promise<void>;
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

const checkUrl = async (url: string | undefined | null, name: string): Promise<{ status: 'pass' | 'fail' | 'warn', detail: string }> => {
    if (!url || typeof url !== 'string' || url.trim() === '') return { status: 'warn', detail: `URL for '${name}' is not configured.` };
    if (url.startsWith('data:')) {
        if (url.length > 500 * 1024) { // Check for large data URIs
            return { status: 'warn', detail: `URL is a large data URI (${(url.length / 1024).toFixed(1)} KB). Consider external hosting.` };
        }
        return { status: 'pass', detail: 'URL is a valid data URI.' };
    }
    try {
        // Use 'no-cors' to check reachability without being blocked by CORS.
        // A successful opaque response is a good sign. A TypeError often indicates a CORS or network issue.
        const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
         // An opaque response means we reached the server but can't read the response body. This is a pass.
        return { status: 'pass', detail: 'URL is reachable.' };
    } catch (error) {
        // This catch block will handle network errors (e.g., DNS resolution failure, server unreachable).
        // It also catches TypeErrors that can result from strict CORS policies preventing even a 'no-cors' request.
        return { status: 'fail', detail: `URL fetch for '${name}' failed. The resource might be unreachable or blocked by CORS.` };
    }
};

const CircularProgress: React.FC<{ percentage: number; size?: number; strokeWidth?: number; colorClass: string; }> = ({ percentage, size = 120, strokeWidth = 10, colorClass }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle className="text-zinc-700" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
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
                variants={{ initial: { strokeDashoffset: circumference }, animate: { strokeDashoffset: offset } }}
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

const firestoreRulesContent = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
  
    function isAdmin() { return request.auth != null && request.auth.token.email == 'bosjoltactical@gmail.com'; }
    function isCreator() { return request.auth != null && request.auth.token.email == 'jstypme@gmail.com'; }
    function isOwner(playerId) { return request.auth != null && get(/databases/$(database)/documents/players/$(playerId)).data.activeAuthUID == request.auth.uid; }

    match /{document=**} { allow read, write: if false; }

    match /players/{playerId} {
      allow read: if true;
      allow create, delete: if isAdmin() || isCreator();
      allow update: if 
        (isAdmin() || isCreator()) ||
        (request.auth != null && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['activeAuthUID'])) ||
        (isOwner(playerId) && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['name', 'surname', 'callsign', 'bio', 'preferredRole', 'email', 'phone', 'address', 'allergies', 'medicalNotes', 'avatarUrl', 'loadout']));
    }
    
    match /signups/{signupId} {
      allow read: if request.auth != null;
      allow create: if isOwner(request.resource.data.playerId);
      allow delete: if isOwner(resource.data.playerId);
      allow write: if isAdmin() || isCreator();
    }
    
    // Publicly Readable, Admin/Creator Writable Collections
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
    
    // Admin-Only Collections
    match /transactions/{transactionId} { allow read, write: if isAdmin() || isCreator(); }
    match /admins/{adminId} { allow read, write: if isAdmin() || isCreator(); }
    
    match /_health/{testId} { allow read, write: if isAdmin() || isCreator(); }
  }
}`;

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
                 <button className="bg-zinc-700 hover:bg-zinc-600 text-white text-xs font-semibold py-1 px-2 rounded-md transition-colors" onClick={handleCopy}>{copyStatus}</button>
            </div>
            <div className="p-4"><pre className="text-sm text-gray-200 overflow-x-auto font-mono max-h-80"><code>{children}</code></pre></div>
        </div>
    );
};

type PowerhouseTab = 'status' | 'data' | 'rules';

const TabButton: React.FC<{ name: string, active: boolean, onClick: () => void }> = ({ name, active, onClick }) => (
    <button onClick={onClick} className={`px-3 py-2 text-sm font-medium rounded-t-md border-b-2 transition-colors ${active ? 'border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>{name}</button>
);

const getTierForXp = (xp: number, ranks: Rank[]): Tier => {
    const allTiers = ranks.flatMap(r => r.tiers || []).filter(Boolean);
    if (allTiers.length === 0) return UNRANKED_TIER;
    const sortedTiers = [...allTiers].sort((a,b) => b.minXp - a.minXp);
    const tier = sortedTiers.find(r => xp >= r.minXp);
    return tier || allTiers.sort((a,b) => a.minXp - b.minXp)[0] || UNRANKED_TIER;
};

export const SystemScanner: React.FC = () => {
    const dataContext = useContext(DataContext as React.Context<DataContextType>);
    const [activeTab, setActiveTab] = useState<PowerhouseTab>('status');
    
    const [errorLog, setErrorLog] = useState<ErrorLogEntry[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    
    const [logSearchTerm, setLogSearchTerm] = useState('');
    const [selectedCollection, setSelectedCollection] = useState<keyof DataContextType>('players');
    const [editedData, setEditedData] = useState('');
    
    const collectionData = dataContext ? JSON.stringify(dataContext[selectedCollection], null, 2) : "Data context not available.";
    const collectionNames = dataContext ? Object.keys(dataContext).filter(k => Array.isArray(dataContext[k as keyof DataContextType])) : [];

    useEffect(() => { setEditedData(collectionData); }, [collectionData]);

    const handleSaveRawData = async () => {
        if (!dataContext) {
            alert("Data context is not available.");
            return;
        }

        if (!confirm(`WARNING: You are about to completely replace all data in the '${selectedCollection}' collection. This is a high-risk action and cannot be undone. Are you sure you want to proceed?`)) {
            return;
        }

        try {
            const newData = JSON.parse(editedData);

            if (!Array.isArray(newData)) {
                throw new Error("Data must be a JSON array.");
            }

            const collectionSetterMap: { [key in keyof DataContextType]?: (data: any) => void } = {
                players: dataContext.setPlayers,
                events: dataContext.setEvents,
                ranks: dataContext.setRanks,
                badges: dataContext.setBadges,
                legendaryBadges: dataContext.setLegendaryBadges,
                gamificationSettings: dataContext.setGamificationSettings,
                sponsors: dataContext.setSponsors,
                socialLinks: dataContext.setSocialLinks,
                carouselMedia: dataContext.setCarouselMedia,
                vouchers: dataContext.setVouchers,
                inventory: dataContext.setInventory,
                suppliers: dataContext.setSuppliers,
                transactions: dataContext.setTransactions,
                locations: dataContext.setLocations,
                raffles: dataContext.setRaffles,
                signups: dataContext.setSignups,
                apiSetupGuide: dataContext.setApiSetupGuide,
            };
            
            const setter = collectionSetterMap[selectedCollection as keyof typeof collectionSetterMap];

            if (setter) {
                if (IS_LIVE_DATA && db) {
                    const collectionName = selectedCollection as string;
                    console.log(`Wiping collection: ${collectionName}`);
                    const collectionRef = db.collection(collectionName);
                    const snapshot = await collectionRef.get();
                    const batch = db.batch();
                    snapshot.docs.forEach(doc => batch.delete(doc.ref));
                    await batch.commit();
                    console.log(`Adding ${newData.length} new documents to ${collectionName}`);

                    const addBatch = db.batch();
                    newData.forEach((item: any) => {
                         const { id, ...data } = item;
                         const docRef = id ? collectionRef.doc(id) : collectionRef.doc();
                         addBatch.set(docRef, data);
                    });
                    await addBatch.commit();

                } else {
                    setter(newData);
                }
                alert(`Collection '${selectedCollection}' has been successfully overwritten.`);
            } else {
                throw new Error(`No setter found for collection '${selectedCollection}'. This might be a settings document which cannot be edited this way.`);
            }

        } catch (error) {
            const typedError = error as Error;
            console.error("Failed to save raw data:", typedError);
            alert(`Save failed: ${typedError.message}. Please ensure the data is a valid JSON array.`);
        }
    };
    
    const handleBeautifyJson = () => {
        try {
            const parsed = JSON.parse(editedData);
            setEditedData(JSON.stringify(parsed, null, 2));
        } catch (error) {
            alert("Invalid JSON format. Cannot beautify.");
        }
    };
    
    const ALL_CHECKS = useCallback((): Check[] => {
        if (!dataContext) return [];
        const { players, ranks, badges, legendaryBadges, events, inventory, signups, transactions, suppliers, companyDetails, creatorDetails } = dataContext;
        
        const playerIds = new Set(players.map(p => p.id));
        const eventIds = new Set(events.map(e => e.id));
        const inventoryIds = new Set(inventory.map(i => i.id));
        const badgeIds = new Set(badges.map(b => b.id));
        const legendaryBadgeIds = new Set(legendaryBadges.map(b => b.id));
        const supplierIds = new Set(suppliers.map(s => s.id));
        const allTiers = ranks.flatMap(r => r.tiers || []).filter(Boolean);

        let checks: Check[] = [
            { category: 'Core System', name: 'React App Initialized', description: "Verifies that the core React application has successfully mounted to the webpage. A failure here indicates a critical rendering problem.", checkFn: async () => document.getElementById('root')?.hasChildNodes() ? { status: 'pass', detail: 'Root element is mounted.' } : { status: 'fail', detail: 'React root not found or is empty.' } },
            { category: 'Core System', name: 'Firebase Connectivity', description: 'Pings the Firestore database with a test write/read operation. This confirms that the application is fully connected and authenticated with Firebase services.', checkFn: async () => { if (!USE_FIREBASE || !db) return { status: 'info', detail: 'App is not configured to use Firebase.' }; try { await db.collection('_health').doc('status').set({ lastChecked: new Date().toISOString() }); return { status: 'pass', detail: 'Successfully connected and authenticated with Firestore.' }; } catch (error) { const typedError = error as { message?: string }; return { status: 'fail', detail: `Connection failed: ${typedError.message}. Check Firebase rules and configuration.` }; } } },
            { category: 'Core System', name: 'Environment Variables', description: 'Verifies that the necessary Firebase configuration variables are present when the application is set to use Firebase.', checkFn: async () => { if (!USE_FIREBASE) return { status: 'pass', detail: 'Firebase is disabled; no variables needed.' }; if (firebaseInitializationError) return { status: 'fail', detail: firebaseInitializationError.message }; if (!isFirebaseConfigured()) return { status: 'fail', detail: 'Firebase is enabled, but configuration variables are missing.' }; return { status: 'pass', detail: 'Firebase environment variables are correctly configured.' }; } },
            { category: 'Data & Storage', name: 'Storage Mode', description: "Reports whether the dashboard is connected to a live Firebase database or running in a local, offline 'mock data' mode.", checkFn: async () => ({ status: 'info', detail: `App is running in ${IS_LIVE_DATA ? 'LIVE (Firebase/API)' : 'MOCK'} data mode.` }) },
            { category: 'Data & Storage', name: 'API Server Health', description: 'Checks the status of the optional self-hosted API server, which is used for large file uploads.', checkFn: async () => { const apiUrl = companyDetails?.apiServerUrl; if (!apiUrl) return { status: 'info', detail: 'No API server URL is configured. Using database for file storage.' }; try { const response = await fetch(`${apiUrl}/health`); if (!response.ok) throw new Error(`Server responded with status ${response.status}`); return { status: 'pass', detail: `API server is online at ${apiUrl}` }; } catch (error) { return { status: 'fail', detail: `Could not connect to API server at ${apiUrl}.` }; } } },
            { category: 'Data Integrity', name: 'Player Rank Consistency', description: "Compares each player's assigned rank against their XP total to find any inconsistencies. Offers a fix to automatically correct any mismatches.", checkFn: async (d) => { const mismatches = d.players.filter(p => { const correctTier = getTierForXp(p.stats.xp, d.ranks); return p.rank.id !== correctTier.id; }); return mismatches.length > 0 ? { status: 'fail', detail: `${mismatches.length} player(s) have incorrect ranks for their XP.`, fixable: true } : { status: 'pass', detail: 'All player ranks are consistent with their XP.' }; }, fixFn: async (d) => { const mismatches = d.players.filter(p => { const correctTier = getTierForXp(p.stats.xp, d.ranks); return p.rank.id !== correctTier.id; }); for (const player of mismatches) { const correctTier = getTierForXp(player.stats.xp, d.ranks); await d.updateDoc('players', { ...player, rank: correctTier }); } } },
            { category: 'Data Integrity', name: 'Duplicate Player Codes', description: 'Ensures every player has a unique Player Code, which is critical for login functionality.', checkFn: async (d) => { const codes = new Map<string, string[]>(); d.players.forEach(p => { const code = p.playerCode.toUpperCase(); if (!codes.has(code)) codes.set(code, []); codes.get(code)!.push(p.name); }); const duplicates = Array.from(codes.entries()).filter(([_, names]) => names.length > 1); return duplicates.length > 0 ? { status: 'fail', detail: `Found ${duplicates.length} duplicate player code(s). Example: Code '${duplicates[0][0]}' is used by ${duplicates[0][1].join(', ')}.` } : { status: 'pass', detail: 'All player codes are unique.' }; } },
            { category: 'Data Integrity', name: 'Negative Stats Check', description: 'Checks for illogical data, such as negative kills or deaths, which may indicate a data entry error.', checkFn: async (d) => { const issues: string[] = []; d.players.forEach(p => { if (p.stats.kills < 0) issues.push(`${p.name} has negative kills.`); if (p.stats.deaths < 0) issues.push(`${p.name} has negative deaths.`); if (p.stats.headshots < 0) issues.push(`${p.name} has negative headshots.`); if (p.stats.gamesPlayed < 0) issues.push(`${p.name} has negative games played.`); }); return issues.length > 0 ? { status: 'warn', detail: `Found ${issues.length} player(s) with negative stats.` } : { status: 'pass', detail: 'No negative player stats found.' }; } },
            { category: 'Data Integrity', name: 'Overdue Event Status', description: "Flags past events that are still marked as 'Upcoming' or 'In Progress', which should be updated to 'Completed' or 'Cancelled'.", checkFn: async (d) => { const today = new Date(); today.setHours(0, 0, 0, 0); const overdueEvents = d.events.filter(e => { const eventDate = new Date(e.date); return eventDate < today && (e.status === 'Upcoming' || e.status === 'In Progress'); }); return overdueEvents.length > 0 ? { status: 'warn', detail: `${overdueEvents.length} past event(s) still marked as 'Upcoming' or 'In Progress'.` } : { status: 'pass', detail: 'All event statuses are logical.' }; } },
            { category: 'Data Integrity', name: 'Stale Signups', description: 'Scans for player signups linked to events that are already finished or cancelled. These are obsolete records that can be safely removed.', checkFn: async () => { const finishedEventIds = new Set(events.filter(e => e.status === 'Completed' || e.status === 'Cancelled').map(e => e.id)); const staleSignups = signups.filter(s => finishedEventIds.has(s.eventId)); return staleSignups.length > 0 ? {status: 'warn', detail: `Found ${staleSignups.length} signup(s) for finished events.`, fixable: true} : {status: 'pass', detail: 'No stale signups found.'}; }, fixFn: async(d) => { const finishedEventIds = new Set(d.events.filter(e => e.status === 'Completed' || e.status === 'Cancelled').map(e => e.id)); const staleSignups = d.signups.filter(s => finishedEventIds.has(s.eventId)); for(const signup of staleSignups) { await d.deleteDoc('signups', signup.id); } }},
            { category: 'Data Integrity', name: 'Orphaned Data', description: 'Performs a deep search for broken links in the data, such as a transaction pointing to a deleted player or an inventory item from a non-existent supplier.', checkFn: async () => { const orphans: string[] = []; signups.forEach(s => { if(!playerIds.has(s.playerId)) orphans.push(`Signup ${s.id} -> player`); if(!eventIds.has(s.eventId)) orphans.push(`Signup ${s.id} -> event`); }); transactions.forEach(t => { if(t.relatedPlayerId && !playerIds.has(t.relatedPlayerId)) orphans.push(`Txn ${t.id} -> player`); if(t.relatedEventId && !eventIds.has(t.relatedEventId)) orphans.push(`Txn ${t.id} -> event`); if(t.relatedInventoryId && !inventoryIds.has(t.relatedInventoryId)) orphans.push(`Txn ${t.id} -> inventory`); }); inventory.forEach(i => { if(i.supplierId && !supplierIds.has(i.supplierId)) orphans.push(`Inventory ${i.id} -> supplier`); }); return orphans.length > 0 ? {status: 'warn', detail: `Found ${orphans.length} orphaned record(s).`} : {status: 'pass', detail: 'No orphaned data found.'}; }},
        ];

        // URL Checks
        const urlChecks: Check[] = [
            ...players.map(p => ({ category: 'Content & Media' as const, name: `URL: Avatar - ${p.name}`, description: 'Validates player avatar URL.', checkFn: async () => checkUrl(p.avatarUrl, `Avatar for ${p.name}`)})),
            ...events.map(e => ({ category: 'Content & Media' as const, name: `URL: Event Image - ${e.title}`, description: 'Validates event image URL.', checkFn: async () => checkUrl(e.imageUrl, `Image for ${e.title}`)})),
            ...events.map(e => ({ category: 'Content & Media' as const, name: `URL: Event Audio - ${e.title}`, description: 'Validates event audio briefing URL.', checkFn: async () => checkUrl(e.audioBriefingUrl, `Audio for ${e.title}`)})),
            ...ranks.map(r => ({ category: 'Content & Media' as const, name: `URL: Rank Badge - ${r.name}`, description: 'Validates rank badge URL.', checkFn: async () => checkUrl(r.rankBadgeUrl, `Badge for ${r.name}`)})),
            ...allTiers.map(t => ({ category: 'Content & Media' as const, name: `URL: Tier Icon - ${t.name}`, description: 'Validates tier icon URL.', checkFn: async () => checkUrl(t.iconUrl, `Icon for ${t.name}`)})),
            ...badges.map(b => ({ category: 'Content & Media' as const, name: `URL: Badge Icon - ${b.name}`, description: 'Validates badge icon URL.', checkFn: async () => checkUrl(b.iconUrl, `Icon for ${b.name}`)})),
            ...legendaryBadges.map(b => ({ category: 'Content & Media' as const, name: `URL: Legendary Badge Icon - ${b.name}`, description: 'Validates legendary badge icon URL.', checkFn: async () => checkUrl(b.iconUrl, `Icon for ${b.name}`)})),
        ];

        // Add company & creator details URL checks
        const detailsObjects = { companyDetails, creatorDetails };
        for (const [key, details] of Object.entries(detailsObjects)) {
            if (details) {
                for (const [prop, value] of Object.entries(details)) {
                    if ((prop.toLowerCase().endsWith('url') || prop.toLowerCase().endsWith('urls')) && typeof value === 'string') {
                        urlChecks.push({ category: 'Content & Media' as const, name: `URL: ${key} - ${prop}`, description: `Validates URL for ${prop}.`, checkFn: async () => checkUrl(value, `${key} - ${prop}`)})
                    }
                }
            }
        }
        
        return [...checks, ...urlChecks];

    }, [dataContext]);

    const initializeResults = useCallback(() => {
        const initial: Record<string, CheckResult[]> = {};
        ALL_CHECKS().forEach(check => {
            if (!initial[check.category]) {
                initial[check.category] = [];
            }
            initial[check.category].push({
                name: check.name,
                description: check.description,
                status: 'pending',
                detail: 'Not yet run.',
                fixable: !!check.fixFn,
            });
        });
        return initial;
    }, [ALL_CHECKS]);

    const [results, setResults] = useState<Record<string, CheckResult[]>>(initializeResults);

    const runChecks = useCallback(async (categoryToRun?: string, checkNameToRun?: string) => {
        setIsScanning(true);
        setScanProgress(0);
        if (!categoryToRun && !checkNameToRun) {
            setErrorLog([]);
            setResults(initializeResults());
            await new Promise(resolve => setTimeout(resolve, 100)); // Allow state to update before proceeding
        }
        
        const allChecks = ALL_CHECKS();
        const checksToRun = checkNameToRun ? allChecks.filter(c => c.name === checkNameToRun) : categoryToRun ? allChecks.filter(c => c.category === categoryToRun) : allChecks;
        const totalChecks = checksToRun.length;
        if (totalChecks === 0) { setIsScanning(false); return; }

        let currentCheckIndex = 0;
        const newErrorLog: ErrorLogEntry[] = errorLog.filter(e => !checksToRun.some(c => c.name === e.checkName));

        for (const check of checksToRun) {
            setResults(prev => {
                const categoryResults = prev[check.category] || [];
                const existingIndex = categoryResults.findIndex(c => c.name === check.name);
                if (existingIndex > -1) {
                    categoryResults[existingIndex] = { ...categoryResults[existingIndex], status: 'running', detail: 'Scanning...' };
                    return { ...prev, [check.category]: [...categoryResults] };
                }
                return { ...prev, [check.category]: [...categoryResults, { ...check, status: 'running', detail: 'Scanning...' }] };
            });

            const result = await check.checkFn(dataContext);
            const finalResult = { ...check, ...result };
            
            setResults(prev => {
                const categoryResults = prev[finalResult.category] || [];
                const updatedCategory = categoryResults.map(c => c.name === finalResult.name ? { name: finalResult.name, description: finalResult.description, status: finalResult.status, detail: finalResult.detail, fixable: !!finalResult.fixFn } : c);
                // If it wasn't there before (e.g., first run), add it
                if (!updatedCategory.some(c => c.name === finalResult.name)) {
                    updatedCategory.push({ name: finalResult.name, description: finalResult.description, status: finalResult.status, detail: finalResult.detail, fixable: !!finalResult.fixFn });
                }
                return { ...prev, [finalResult.category]: updatedCategory };
            });
            
            if (finalResult.status === 'fail' || finalResult.status === 'warn') {
                newErrorLog.push({ timestamp: new Date(), checkName: finalResult.name, category: finalResult.category, detail: finalResult.detail, status: finalResult.status });
            }
            
            currentCheckIndex++;
            setScanProgress(Math.round((currentCheckIndex / totalChecks) * 100));
        }
        setErrorLog([...newErrorLog].sort((a, b) => (a.status === 'fail' ? -1 : 1) - (b.status === 'fail' ? -1 : 1)));
        setIsScanning(false);
    }, [ALL_CHECKS, dataContext, errorLog, initializeResults]);
    
    const handleFix = useCallback(async (checkName: string) => {
        const check = ALL_CHECKS().find(c => c.name === checkName);
        if (check?.fixFn && dataContext) {
            await check.fixFn(dataContext);
            await runChecks(undefined, checkName); // Rescan just the fixed check
        }
    }, [ALL_CHECKS, dataContext, runChecks]);

    const { healthScore, errorCount, warningCount, noticeCount } = useMemo(() => {
        const allResults = Object.values(results).flat() as CheckResult[];
        if (allResults.length === 0) return { healthScore: 100, errorCount: 0, warningCount: 0, noticeCount: 0 };

        const counts = { fail: 0, warn: 0, info: 0, pass: 0, pending: 0, running: 0 };
        allResults.forEach(r => { if(counts.hasOwnProperty(r.status)) counts[r.status as keyof typeof counts]++; });
        
        const totalChecks = allResults.length - counts.pending - counts.running;
        if (totalChecks === 0) return { healthScore: 100, errorCount: 0, warningCount: 0, noticeCount: 0 };
        
        const score = ((totalChecks - (counts.fail * 2) - counts.warn) / totalChecks) * 100;

        return { healthScore: Math.max(0, Math.round(score)), errorCount: counts.fail, warningCount: counts.warn, noticeCount: counts.info };
    }, [results]);

    const getCategoryHealth = (category: string) => {
        const categoryResults = results[category] || [];
        if (categoryResults.length === 0) return { score: 100, hasFails: false, fails: 0, warns: 0 };
        const fails = categoryResults.filter(r => r.status === 'fail').length;
        const warns = categoryResults.filter(r => r.status === 'warn').length;
        const totalScanned = categoryResults.filter(r => r.status !== 'pending' && r.status !== 'running').length;

        if (totalScanned === 0) return { score: 100, hasFails: false, fails: 0, warns: 0 };
        
        const score = ((totalScanned - (fails * 2) - warns) / totalScanned) * 100;
        return { score: Math.max(0, Math.round(score)), hasFails: fails > 0, fails, warns };
    };

    const filteredErrorLog = useMemo(() => errorLog.filter(log => log.checkName.toLowerCase().includes(logSearchTerm.toLowerCase()) || log.detail.toLowerCase().includes(logSearchTerm.toLowerCase())), [errorLog, logSearchTerm]);

    return (
        <DashboardCard title="System Powerhouse" icon={<CodeBracketIcon className="w-6 h-6" />}>
             <div className="p-4 sm:p-6">
                <div className="border-b border-zinc-700 mb-4"><nav className="flex space-x-4 -mb-px"><TabButton name="Live Status" active={activeTab === 'status'} onClick={() => setActiveTab('status')} /><TabButton name="Raw Data Editor" active={activeTab === 'data'} onClick={() => setActiveTab('data')} /><TabButton name="Firebase Rules" active={activeTab === 'rules'} onClick={() => setActiveTab('rules')} /></nav></div>
                <AnimatePresence>
                    {isScanning && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden mb-4">
                            <div className="w-full bg-zinc-700 rounded-full h-2.5">
                                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${scanProgress}%` }}></div>
                            </div>
                            <p className="text-center text-xs text-gray-400 mt-1">{scanProgress}% Complete</p>
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {activeTab === 'status' && (
                            <div className="space-y-6">
                                <Button onClick={() => runChecks()} disabled={isScanning} className="w-full sm:w-auto"><ArrowPathIcon className={`w-5 h-5 mr-2 ${isScanning ? 'animate-spin' : ''}`}/>Scan All Systems</Button>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                                    <div className="lg:col-span-3 bg-zinc-900/50 p-4 rounded-lg flex flex-col items-center justify-center"><h3 className="font-semibold text-gray-300 mb-2 text-center">Site Health</h3><div className="relative"><CircularProgress percentage={healthScore} colorClass={healthScore > 90 ? 'text-green-500' : healthScore > 60 ? 'text-yellow-500' : 'text-red-500'} /><div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-4xl font-bold text-white">{healthScore}%</span></div></div></div>
                                    <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div className="bg-zinc-900/50 p-4 rounded-lg"><h3 className="font-semibold text-gray-300 flex items-center gap-1">Errors <InfoTooltip text="Critical issues."/></h3><p className="text-4xl font-bold text-red-500">{errorCount}</p><MiniLineGraph colorClass="text-red-500/50"/></div>
                                        <div className="bg-zinc-900/50 p-4 rounded-lg"><h3 className="font-semibold text-gray-300 flex items-center gap-1">Warnings <InfoTooltip text="Non-critical issues."/></h3><p className="text-4xl font-bold text-yellow-500">{warningCount}</p><MiniLineGraph colorClass="text-yellow-500/50"/></div>
                                        <div className="bg-zinc-900/50 p-4 rounded-lg"><h3 className="font-semibold text-gray-300 flex items-center gap-1">Notices <InfoTooltip text="Informational messages."/></h3><p className="text-4xl font-bold text-blue-500">{noticeCount}</p><MiniLineGraph colorClass="text-blue-500/50"/></div>
                                    </div>
                                </div>
                                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    <div className="lg:col-span-8"><h3 className="font-semibold text-gray-200 mb-3 text-lg">Thematic Reports</h3><div className="space-y-2">{Object.keys(results).sort().map(category => { const { score, hasFails, fails, warns } = getCategoryHealth(category); const isOpen = expandedCategory === category; return (<div key={category} className="bg-zinc-900/50 rounded-lg border border-zinc-700/50 overflow-hidden"><button className="w-full flex items-center p-4 text-left" onClick={() => setExpandedCategory(isOpen ? null : category)}><div className="relative w-10 h-10 mr-4"><CircularProgress percentage={score} size={40} strokeWidth={4} colorClass={hasFails ? 'text-red-500' : score < 100 ? 'text-yellow-500' : 'text-green-500'} /><div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{score}%</div></div><div className="flex-grow"><p className="font-semibold text-gray-200">{category}</p><div className="flex items-center gap-3 text-xs text-gray-400">{fails > 0 && <span className="text-red-400">{fails} Error(s)</span>}{warns > 0 && <span className="text-yellow-400">{warns} Warning(s)</span>}{fails === 0 && warns === 0 && <span className="text-green-400">All Clear</span>}</div></div><Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); runChecks(category); }} className="!p-1.5 mx-4"><ArrowPathIcon className="w-4 h-4"/></Button><motion.div animate={{ rotate: isOpen ? 180 : 0 }}><svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></motion.div></button><AnimatePresence>{isOpen && (<motion.section key="content" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="border-t border-zinc-700/50"><div className="p-4 space-y-3">{(results[category] || []).map(check => (<div key={check.name} className="flex items-start gap-3 text-sm p-2 bg-zinc-800/50 rounded-md">{check.status === 'pending' && <CogIcon className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />}{check.status === 'running' && <CogIcon className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0 animate-spin" />}{check.status === 'pass' && <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />}{check.status === 'fail' && <XCircleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />}{check.status === 'warn' && <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />}{check.status === 'info' && <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />}<div className="flex-grow"><p className="font-semibold text-gray-200">{check.name}</p><p className="text-xs text-gray-400">{check.detail}</p></div><Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); runChecks(undefined, check.name); }} className="!p-1.5"><ArrowPathIcon className="w-4 h-4"/></Button>{check.fixable && (check.status === 'fail' || check.status === 'warn') && (<Button size="sm" onClick={() => handleFix(check.name)}>Fix It</Button>)}</div>))}</div ></motion.section>)}</AnimatePresence></div>);})}</div></div>
                                    <div className="lg:col-span-4"><h3 className="font-semibold text-gray-200 mb-3 text-lg">Activity Log</h3><Input value={logSearchTerm} onChange={e => setLogSearchTerm(e.target.value)} placeholder="Search log..." icon={<MagnifyingGlassIcon className="w-5 h-5"/>} className="mb-2"/><div className="bg-zinc-900/50 p-2 rounded-lg max-h-[20rem] overflow-y-auto">{filteredErrorLog.length > 0 ? (<ul className="space-y-1">{filteredErrorLog.map((log, i) => (<li key={i} className="p-2 rounded-md hover:bg-zinc-800/50"><div className="flex items-start gap-2">{log.status === 'fail' ? <XCircleIcon className="w-4 h-4 text-red-500 mt-0.5"/> : <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mt-0.5"/>}<p className="text-sm font-semibold text-gray-200">{log.checkName}</p></div><p className="text-xs text-gray-400 pl-6">{log.detail}</p></li>))}</ul>) : (<div className="text-center p-8"><CheckCircleIcon className="w-10 h-10 text-green-500 mx-auto"/><p className="mt-2 text-sm text-gray-400">No issues found.</p></div>)}</div></div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'data' && (
                            <div>
                                <h3 className="font-semibold text-gray-200 mb-3 text-lg">Raw Data Editor</h3>
                                <p className="text-sm text-amber-300 bg-amber-900/50 border border-amber-700 p-3 rounded-md mb-4"><ExclamationTriangleIcon className="inline w-5 h-5 mr-2" /><strong>High-Risk Area:</strong> Editing this data directly can break the application. This tool will completely replace the existing collection data.</p>
                                <div className="flex gap-4 mb-4"><select value={selectedCollection} onChange={e => setSelectedCollection(e.target.value as keyof DataContextType)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                                    {collectionNames.map(collectionName => <option key={collectionName} value={collectionName}>{collectionName}</option>)}
                                </select><Button onClick={handleBeautifyJson} variant="secondary">Beautify JSON</Button></div>
                                <textarea value={editedData} onChange={e => setEditedData(e.target.value)} className="text-xs text-gray-200 w-full font-mono h-96 bg-zinc-950 p-4 rounded-lg border border-zinc-700 focus:ring-red-500 focus:border-red-500" spellCheck="false" />
                                <Button onClick={handleSaveRawData} variant="danger" className="w-full mt-4">Save Raw Data for '{selectedCollection}'</Button>
                            </div>
                        )}
                        {activeTab === 'rules' && (
                           <div>
                                <h3 className="font-semibold text-gray-200 mb-3 text-lg">Required Firebase Security Rules</h3>
                                <p className="text-sm text-gray-400 mb-4">For the app to function with a live Firebase backend, these rules must be published in your project's Firestore settings to secure your data.</p>
                                <CodeBlock title="firestore.rules">{firestoreRulesContent}</CodeBlock>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </DashboardCard>
    );
};
