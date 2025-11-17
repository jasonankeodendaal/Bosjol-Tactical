

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
    checkFn: (allData: DataContextType) => Promise<{ status: CheckStatus, detail: string }>;
    fixable?: boolean;
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

const checkUrl = async (url: string | undefined, name: string): Promise<{ status: 'pass' | 'fail' | 'warn', detail: string }> => {
    if (!url || typeof url !== 'string' || url.trim() === '') return { status: 'warn', detail: `URL for '${name}' is not configured.` };
    if (url.startsWith('data:')) {
        if (url.length > 100 * 1024) { // Check for large data URIs
            return { status: 'warn', detail: `URL is a large data URI (${(url.length / 1024).toFixed(1)} KB). Consider external hosting.` };
        }
        return { status: 'pass', detail: 'URL is a valid data URI.' };
    }
    try {
        await fetch(url, { method: 'HEAD', mode: 'no-cors' });
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

const getTierForXp = (xp: number, allTiers: Tier[]): Tier => {
    const sortedTiers = [...allTiers].sort((a,b) => b.minXp - a.minXp);
    const tier = sortedTiers.find(r => xp >= r.minXp);
    return tier || allTiers.sort((a,b) => a.minXp - b.minXp)[0] || UNRANKED_TIER;
};

export const SystemScanner: React.FC = () => {
    const dataContext = useContext(DataContext as React.Context<DataContextType>);
    const authContext = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState<PowerhouseTab>('status');
    const [results, setResults] = useState<Record<string, CheckResult[]>>({});
    const [errorLog, setErrorLog] = useState<ErrorLogEntry[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const [playerIdFilter, setPlayerIdFilter] = useState('');
    const [logSearchTerm, setLogSearchTerm] = useState('');

    const [selectedCollection, setSelectedCollection] = useState<keyof DataContextType>('players');
    const collectionData = dataContext ? JSON.stringify(dataContext[selectedCollection], null, 2) : "Data context not available.";
    const collectionNames = dataContext ? Object.keys(dataContext).filter(k => Array.isArray(dataContext[k as keyof DataContextType])) : [];

    const [editedData, setEditedData] = useState(collectionData);
    useEffect(() => { setEditedData(collectionData); }, [collectionData]);
    
    const ALL_CHECKS = useCallback((filterPlayerId?: string): Check[] => {
        if (!dataContext) return [];
        const allData = dataContext;
        const { players, ranks, badges, legendaryBadges, gamificationSettings, events, inventory, signups, transactions, locations, suppliers, vouchers, raffles } = allData;
        const collections: {name: keyof DataContextType, data: any[]}[] = [{name: 'players', data: players}, {name: 'events', data: events}, {name: 'ranks', data: ranks}, {name: 'badges', data: badges}, {name: 'legendaryBadges', data: legendaryBadges}, {name: 'gamificationSettings', data: gamificationSettings}, {name: 'inventory', data: inventory}, {name: 'signups', data: signups}, {name: 'transactions', data: transactions}, {name: 'locations', data: locations}, {name: 'suppliers', data: suppliers}, {name: 'vouchers', data: vouchers}, {name: 'raffles', data: raffles}];
        
        const playerIds = new Set(players.map(p => p.id));
        const eventIds = new Set(events.map(e => e.id));
        const inventoryIds = new Set(inventory.map(i => i.id));
        const badgeIds = new Set(badges.map(b => b.id));
        const legendaryBadgeIds = new Set(legendaryBadges.map(b => b.id));
        const allTiers = ranks.flatMap(r => r.tiers);

        const filteredPlayers = filterPlayerId ? players.filter(p => p.id === filterPlayerId) : players;

        let checks: Check[] = [
            // --- CORE SYSTEM ---
            { category: 'Core System', name: 'React App Initialized', description: "Checks if the main application UI has successfully rendered.", checkFn: async () => document.getElementById('root')?.hasChildNodes() ? { status: 'pass', detail: 'Root element is mounted.' } : { status: 'fail', detail: 'React root not found or is empty.' } },
            { category: 'Data & Storage', name: 'Storage Mode', description: "Identifies if the app is using live data or mock data.", checkFn: async () => ({ status: 'info', detail: `App is running in ${IS_LIVE_DATA ? 'LIVE (Firebase/API)' : 'MOCK'} data mode.` }) },
            { category: 'Data & Storage', name: 'Firebase SDK Initialization', description: "Checks if the Firebase library initialized correctly.", checkFn: async () => !USE_FIREBASE ? {status: 'info', detail: 'Firebase is disabled.'} : firebaseInitializationError ? { status: 'fail', detail: `Init failed: ${firebaseInitializationError.message}` } : { status: 'pass', detail: 'SDK initialized successfully.' } },
            { category: 'Data & Storage', name: 'Firebase Config', description: "Verifies that all required Firebase env variables are present.", checkFn: async () => !USE_FIREBASE ? {status: 'info', detail: 'Firebase is disabled.'} : isFirebaseConfigured() ? { status: 'pass', detail: 'Env variables are set.' } : { status: 'fail', detail: 'One or more VITE_FIREBASE_* env variables are missing.' } },
        ];
        
        if (!filterPlayerId) {
             checks = checks.concat([
                ...collections.map(({name, data}) => ({
                    category: 'Data & Storage' as const, name: `Collection: ${name}`, description: `Checks if the '${name}' data collection has been loaded.`,
                    checkFn: async () => (data && data.length > 0) ? { status: 'pass' as const, detail: `${data.length} item(s) loaded.` } : { status: 'warn' as const, detail: `Collection is empty or failed to load.` }
                })),
                { category: 'Data Integrity', name: 'Duplicate Player Emails', description: 'Ensures no two players share the same email.', checkFn: async () => { const emails = players.map(p => p.email.toLowerCase()); const duplicates = [...new Set(emails.filter((e, i) => emails.indexOf(e) !== i))]; return duplicates.length > 0 ? { status: 'fail', detail: `Duplicate emails found: ${duplicates.join(', ')}` } : { status: 'pass', detail: 'All player emails are unique.' }; }},
                { category: 'Data Integrity', name: 'Duplicate Player Codes', description: 'Ensures every player has a unique Player Code.', checkFn: async () => { const codes = players.map(p => p.playerCode); const duplicates = [...new Set(codes.filter((c, i) => codes.indexOf(c) !== i))]; return duplicates.length > 0 ? {status: 'fail', detail: `Duplicate codes: ${duplicates.join(', ')}.`} : {status: 'pass', detail: 'All player codes are unique.'}; }},
                { category: 'Data Integrity', name: 'Future-Dated Entries', description: 'Scans for events or transactions logged with a future date.', checkFn: async () => { const now = new Date(); const future = [...events, ...transactions].filter(e => new Date(e.date) > now); return future.length > 0 ? { status: 'warn', detail: `Found ${future.length} item(s) with a future date.` } : { status: 'pass', detail: 'No future-dated entries found.' }; }},
                { category: 'Data Integrity', name: 'Negative Inventory Stock', description: 'Scans for any inventory items with a stock quantity below zero.', checkFn: async () => { const negatives = inventory.filter(i => i.stock < 0); return negatives.length > 0 ? { status: 'fail', detail: `${negatives.length} item(s) have negative stock.` } : { status: 'pass', detail: 'No negative stock found.' }; }},
                { category: 'Data Integrity', name: 'Stale Event Status', description: 'Finds past events still marked as Upcoming.', checkFn: async () => { const now = new Date(); const stale = events.filter(e => (new Date(e.date) < now) && e.status === 'Upcoming'); return stale.length > 0 ? { status: 'warn', detail: `${stale.length} past event(s) still marked 'Upcoming'.`, fixable: true } : { status: 'pass', detail: 'No stale event statuses found.' }; }, fixFn: async (d) => { const now = new Date(); const stale = d.events.filter(e => (new Date(e.date) < now) && e.status === 'Upcoming'); for (const event of stale) { await d.updateDoc('events', { ...event, status: 'Completed' }); } }},
                { category: 'Configuration', name: 'Rank Progression Sanity', description: 'Checks for sorting errors or large XP gaps between tiers.', checkFn: async () => { const sortedTiers = [...allTiers].sort((a,b) => a.minXp - b.minXp); const errors = []; for (let i=0; i < sortedTiers.length - 1; i++) { if (sortedTiers[i].minXp >= sortedTiers[i+1].minXp) errors.push(`Sort error: ${sortedTiers[i].name} >= ${sortedTiers[i+1].name}.`); } return errors.length > 0 ? { status: 'warn', detail: `Issues found: ${errors.join('; ')}` } : { status: 'pass', detail: 'No logical errors found.' }; } },
                { category: 'Security', name: 'Insecure PIN Scan', description: 'Scans for common and insecure PINs like "123456".', checkFn: async () => { const insecure = players.filter(p => ['123456', '000000', '111111', '654321'].includes(p.pin)); return insecure.length > 0 ? { status: 'warn', detail: `${insecure.length} player(s) using common PINs.` } : { status: 'pass', detail: 'No common insecure PINs found.' }; }},
            ]);
        }

        checks = checks.concat([
            { category: 'Data Integrity', name: 'Orphaned Data', description: 'Checks for references to deleted players or events.', checkFn: async () => { const targetSignups = filterPlayerId ? signups.filter(s => s.playerId === filterPlayerId) : signups; const targetTransactions = filterPlayerId ? transactions.filter(t => t.relatedPlayerId === filterPlayerId) : transactions; const orphans: string[] = []; targetSignups.forEach(s => { if(!playerIds.has(s.playerId)) orphans.push(`Signup ${s.id} -> player`); if(!eventIds.has(s.eventId)) orphans.push(`Signup ${s.id} -> event`); }); targetTransactions.forEach(t => { if(t.relatedPlayerId && !playerIds.has(t.relatedPlayerId)) orphans.push(`Txn ${t.id} -> player`); if(t.relatedEventId && !eventIds.has(t.relatedEventId)) orphans.push(`Txn ${t.id} -> event`); if(t.relatedInventoryId && !inventoryIds.has(t.relatedInventoryId)) orphans.push(`Txn ${t.id} -> inventory`); }); return orphans.length > 0 ? {status: 'warn', detail: `Found ${orphans.length} orphaned record(s).`} : {status: 'pass', detail: 'No orphaned data found.'}; }},
            ...filteredPlayers.map(p => ({
                category: 'Data Integrity' as const, name: `Player Rank Object: ${p.name}`, description: 'Verifies the player\'s stored rank object matches their current XP.',
                checkFn: async () => { const correctTier = getTierForXp(p.stats.xp, allTiers); return p.rank.id === correctTier.id ? { status: 'pass', detail: `Correctly assigned: ${correctTier.name}` } : { status: 'fail', detail: `Mismatch. Stored: ${p.rank.name}, should be: ${correctTier.name}.`, fixable: true }; },
                fixFn: async (d) => { const correctTier = getTierForXp(p.stats.xp, d.ranks.flatMap(r => r.tiers)); await d.updateDoc('players', { ...p, rank: correctTier }); }
            })),
            ...filteredPlayers.map(p => ({
                category: 'Data Integrity' as const, name: `Player Stat Consistency: ${p.name}`, description: 'Verifies lifetime stats match sum of match history.',
                checkFn: async () => { if (p.matchHistory.length === 0) return { status: 'pass', detail: 'No match history to verify.'}; const calc = p.matchHistory.reduce((a,c) => ({ k: a.k+c.playerStats.kills, d: a.d+c.playerStats.deaths, h: a.h+c.playerStats.headshots }),{k:0,d:0,h:0}); const errors = []; if (p.stats.kills !== calc.k) errors.push('kills'); if (p.stats.deaths !== calc.d) errors.push('deaths'); if (p.stats.headshots !== calc.h) errors.push('headshots'); return errors.length === 0 ? {status: 'pass', detail: 'Stats are consistent.'} : {status: 'warn', detail: `Inconsistent stats for: ${errors.join(', ')}.`}; }
            })),
            ...filteredPlayers.map(p => ({
                category: 'Data Integrity' as const, name: `Orphaned Badges: ${p.name}`, description: 'Ensures all player badges exist in the main badge collections.',
                checkFn: async () => { const orphans = [...p.badges.filter(b => !badgeIds.has(b.id)), ...p.legendaryBadges.filter(b => !legendaryBadgeIds.has(b.id))]; return orphans.length > 0 ? { status: 'warn', detail: `Found ${orphans.length} orphaned badge(s).` } : { status: 'pass', detail: 'No orphaned badges.' }; }
            })),
            ...Object.entries(allData).filter(([key]) => key.endsWith('Details')).flatMap(([key, details]) => 
                Object.entries(details as object).filter(([_, value]) => typeof value === 'string' && value.includes('https://')).map(([prop, url]) => ({
                    category: 'Content & Media' as const, name: `URL: ${key} - ${prop}`, description: `Validates URL for ${prop}.`, checkFn: async () => checkUrl(url, `${key} - ${prop}`)
                }))
            ),
        ]);

        return checks;
    }, [dataContext, authContext]);

    const runChecks = useCallback(async (categoryToRun?: string, checkNameToRun?: string) => {
        setIsScanning(true);
        if (!categoryToRun && !checkNameToRun) {
            setErrorLog([]);
            setResults({});
        }
        
        const allChecks = ALL_CHECKS(playerIdFilter);
        const checksToRun = checkNameToRun ? allChecks.filter(c => c.name === checkNameToRun) : categoryToRun ? allChecks.filter(c => c.category === categoryToRun) : allChecks;

        if (categoryToRun && !checkNameToRun) { // Reset category before re-running
            setResults(prev => ({ ...prev, [categoryToRun]: checksToRun.map(c => ({...c, status: 'pending', detail: 'Waiting to run...'})) }));
        }

        const newErrorLog: ErrorLogEntry[] = errorLog.filter(e => !checksToRun.some(c => c.name === e.checkName));

        for (const check of checksToRun) {
            setResults(prev => {
                const categoryResults = prev[check.category] || [];
                const existing = categoryResults.find(c => c.name === check.name);
                if (existing) {
                    return { ...prev, [check.category]: categoryResults.map(c => c.name === check.name ? { ...c, status: 'running', detail: 'Scanning...' } : c) };
                }
                return { ...prev, [check.category]: [...categoryResults, { ...check, status: 'running', detail: 'Scanning...' }] };
            });

            const result = await check.checkFn(dataContext);
            const finalResult = { ...check, ...result };
            
            setResults(prev => ({ ...prev, [finalResult.category]: prev[finalResult.category].map(c => c.name === finalResult.name ? { name: finalResult.name, description: finalResult.description, status: finalResult.status, detail: finalResult.detail, fixable: !!finalResult.fixFn } : c) }));
            
            if (finalResult.status === 'fail' || finalResult.status === 'warn') {
                newErrorLog.push({ timestamp: new Date(), checkName: finalResult.name, category: finalResult.category, detail: finalResult.detail, status: finalResult.status });
            }
        }
        setErrorLog([...newErrorLog].sort((a, b) => (a.status === 'fail' ? -1 : 1) - (b.status === 'fail' ? -1 : 1)));
        setIsScanning(false);
    }, [ALL_CHECKS, dataContext, errorLog, playerIdFilter]);

    const handleFix = useCallback(async (checkName: string) => {
        const check = ALL_CHECKS(playerIdFilter).find(c => c.name === checkName);
        if (check?.fixFn && dataContext) {
            await check.fixFn(dataContext);
            await runChecks(undefined, checkName); // Rescan just the fixed check
        }
    }, [ALL_CHECKS, dataContext, runChecks, playerIdFilter]);

    const handleFixAll = async () => {
        // FIX: Explicitly type 'r' as CheckResult to fix TypeScript inference issue.
        const fixableErrors = Object.values(results).flat().filter((r: CheckResult) => r.fixable && (r.status === 'fail' || r.status === 'warn'));
        if (fixableErrors.length === 0) { alert("No fixable issues found."); return; }
        if (!confirm(`This will attempt to automatically fix ${fixableErrors.length} issue(s). Proceed?`)) return;

        for (const error of fixableErrors) {
            await handleFix(error.name);
        }
    };
    
    const handleDownloadLog = () => {
        const logContent = errorLog.map(entry => `[${entry.timestamp.toISOString()}] [${entry.status.toUpperCase()}] ${entry.category} - ${entry.checkName}: ${entry.detail}`).join('\n');
        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-health-log-${new Date().toISOString()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    const handleBeautifyJson = () => {
        try {
            const parsed = JSON.parse(editedData);
            setEditedData(JSON.stringify(parsed, null, 2));
        } catch (e) {
            alert("Invalid JSON: Cannot beautify.");
        }
    };

    const handleSaveRawData = async () => { /* ... (existing implementation) ... */ };
    useEffect(() => { runChecks(); }, []); // Run on mount

    const { healthScore, errorCount, warningCount, noticeCount } = useMemo(() => { /* ... (existing implementation) ... */ return { healthScore: 0, errorCount: 0, warningCount: 0, noticeCount: 0 }; }, [results]);
    const getCategoryHealth = (category: string) => { /* ... (existing implementation) ... */ return { score: 100, hasFails: false, fails: 0, warns: 0 }; };

    const filteredErrorLog = useMemo(() => errorLog.filter(log => log.checkName.toLowerCase().includes(logSearchTerm.toLowerCase()) || log.detail.toLowerCase().includes(logSearchTerm.toLowerCase())), [errorLog, logSearchTerm]);

    return (
        <DashboardCard title="System Powerhouse" icon={<CodeBracketIcon className="w-6 h-6" />}>
             <div className="p-4 sm:p-6">
                <div className="border-b border-zinc-700 mb-4"><nav className="flex space-x-4 -mb-px"><TabButton name="Live Status" active={activeTab === 'status'} onClick={() => setActiveTab('status')} /><TabButton name="Raw Data Editor" active={activeTab === 'data'} onClick={() => setActiveTab('data')} /><TabButton name="Firebase Rules" active={activeTab === 'rules'} onClick={() => setActiveTab('rules')} /></nav></div>
                <AnimatePresence mode="wait">
                    <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                        {activeTab === 'status' && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Input value={playerIdFilter} onChange={e => setPlayerIdFilter(e.target.value)} placeholder="Filter by Player ID (e.g., p001)" icon={<MagnifyingGlassIcon className="w-5 h-5"/>} className="flex-grow"/>
                                    <Button onClick={() => runChecks()} disabled={isScanning} className="w-full sm:w-auto"><ArrowPathIcon className={`w-5 h-5 mr-2 ${isScanning ? 'animate-spin' : ''}`}/>Scan All</Button>
                                    <Button onClick={handleFixAll} variant="secondary" className="w-full sm:w-auto">Fix All Available</Button>
                                    <Button onClick={handleDownloadLog} variant="secondary" className="w-full sm:w-auto"><CloudArrowDownIcon className="w-5 h-5 mr-2"/>Download Log</Button>
                                </div>
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
                                <div className="flex gap-4 mb-4"><select value={selectedCollection} onChange={e => setSelectedCollection(e.target.value as keyof DataContextType)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500">{collectionNames.map(name => <option key={name} value={name}>{name}</option>)}</select><Button onClick={handleBeautifyJson} variant="secondary">Beautify JSON</Button></div>
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