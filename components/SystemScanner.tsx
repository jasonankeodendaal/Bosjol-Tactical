import React, { useState, useContext, useEffect, useCallback } from 'react';
import { DataContext, IS_LIVE_DATA, DataContextType } from '../data/DataContext';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, CogIcon, CodeBracketIcon, ArrowPathIcon, ClockIcon } from './icons/Icons';
import { db, USE_FIREBASE, firebaseInitializationError, isFirebaseConfigured } from '../firebase';
import { DashboardCard } from './DashboardCard';
import type { Player, GamificationRule, Badge } from '../types';
import { UNRANKED_RANK } from '../constants';

type CheckStatus = 'pass' | 'fail' | 'warn' | 'info' | 'pending' | 'running';
type OverallStatus = 'operational' | 'degraded' | 'critical' | 'pending';
type ScannerTab = 'status' | 'diagnostics' | 'history';

interface Check {
    category: string;
    name: string;
    description: string;
    checkFn: () => Promise<{ status: CheckStatus, detail: string }>;
}

interface CheckResult {
    text: string;
    description: string;
    status: CheckStatus;
    detail: string;
}

interface ErrorLogEntry {
    timestamp: Date;
    checkName: string;
    category: string;
    detail: string;
}

const SOLUTIONS_MAP: Record<string, { problem: string; solution: React.ReactNode; fixable?: boolean }> = {
    'React App Initialized': { problem: "The main React application component failed to render inside its root container.", solution: <p>This is a critical rendering failure. 1. Check the browser console for JavaScript errors. 2. Ensure the `index.html` file has a `&lt;div id="root"&gt;&lt;/div&gt;`. 3. Verify that `index.tsx` is correctly targeting this root element.</p> },
    'Firebase SDK Initialization': { problem: "The Firebase SDK failed to initialize. This usually points to incorrect configuration credentials.", solution: <p>This is a critical error when in Firebase mode. 1. Double-check all `VITE_FIREBASE_*` variables in your environment file (`.env.local`). 2. Verify the credentials in your Firebase project settings match what's in your environment file. 3. Check for any typos in the variable names.</p> },
    'Firebase Config': { problem: "The application is configured to use Firebase, but one or more necessary environment variables are missing.", solution: <p>The app cannot connect to Firebase without the full configuration. 1. Ensure your `.env.local` file (for development) or hosting provider's environment variables include all required `VITE_FIREBASE_*` keys. 2. Make sure you haven't misspelled any variable names.</p> },
    'Firestore Connectivity': { problem: "The application successfully initialized the Firebase SDK but cannot establish a connection to the Firestore database.", solution: <p>This blocks all data operations. 1. Check your server's internet connection. 2. Go to your Firebase project console and ensure the Firestore Database is enabled and created. 3. Check your Firestore Security Rules to ensure they aren't blocking all read/write access.</p> },
    'Firestore Read/Write Test': { problem: "A live test to create, read, update, and delete a temporary document in Firestore failed. This indicates a permission issue.", solution: <p>This is likely due to restrictive Firestore Security Rules. 1. Go to your Firebase console → Firestore → Rules. 2. Ensure your rules allow authenticated users (Admin or Creator) to read and write. You can find the correct ruleset in the 'Firebase Rules' tab. <strong>Note:</strong> You must be logged in as the Admin or Creator to run this test successfully, as it requires a real Firebase Auth session.</p> },
    'API Server Health': { problem: "The application cannot reach the configured external API server. The server may be down or the URL may be incorrect.", solution: <p>File uploads will fail. 1. Verify the API server is running (e.g., using `pm2 status`). 2. Check the server logs for errors (`pm2 logs [app_name]`). 3. Ensure the 'API Server URL' in the Admin Settings is correct and publicly accessible. 4. If using a tunnel (like Cloudflare), ensure the tunnel is active and pointing to the correct local port.</p> },
    'Company Details Loaded': { problem: "The core `companyDetails` document could not be loaded from the database.", solution: <p>This is a critical configuration issue. If this is a new project, the initial data seeding may have failed. If this is an existing project, the document may have been accidentally deleted. Use the 'Restore from Backup' feature in the Admin Settings if you have a backup file.</p>, fixable: true },
    'Ranks Loaded': { problem: "The player rank structure could not be loaded from the database.", solution: <p>Player progression will not work. This data may be missing from the `ranks` collection. You can try re-seeding this specific collection using the 'Fix It' button.</p>, fixable: true },
    'Gamification Rules Loaded': { problem: "XP rules for in-game actions could not be loaded.", solution: <p>Automatic XP calculation will fail. This data may be missing from the `gamificationSettings` collection. You can try re-seeding this specific collection using the 'Fix It' button.</p>, fixable: true },
    'Company Logo URL': { problem: "The URL for the company logo is either not configured or points to an unreachable address.", solution: <p>The logo will appear broken throughout the app. 1. Go to Admin Dashboard → Settings → Branding & Visuals. 2. Under 'Company Logo', re-upload the image or paste a valid, publicly accessible URL. 3. Save the settings.</p> },
};

const checkUrl = async (url: string | undefined): Promise<{ status: 'pass' | 'fail' | 'warn', detail: string }> => {
    if (!url || typeof url !== 'string' || url.trim() === '') return { status: 'warn', detail: 'URL is not configured.' };
    if (url.startsWith('data:')) return { status: 'pass', detail: 'URL is a valid data URI.' };
    try {
        const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
        // 'no-cors' responses have status 0, but a response means it's likely reachable.
        return { status: 'pass', detail: 'URL is reachable.' };
    } catch (error) {
        return { status: 'fail', detail: 'URL fetch failed.' };
    }
};

// --- Mock Test Functions ---
const testEventFinalizationLogic = (players: Player[], settings: GamificationRule[]): { status: CheckStatus, detail: string } => {
    try {
        const mockPlayer = { ...players[0], stats: { ...players[0].stats, xp: 1000 } };
        const participationXp = 50;
        const liveStats = { kills: 5, deaths: 2, headshots: 1 };
        const rules = new Map(settings.map(r => [r.id, r.xp]));
        const getXp = (id: string) => rules.get(id) ?? 0;

        let xpGained = participationXp;
        xpGained += liveStats.kills * getXp('g_kill');
        xpGained += liveStats.headshots * getXp('g_headshot');
        xpGained += liveStats.deaths * getXp('g_death');
        
        const finalXp = mockPlayer.stats.xp + xpGained;
        const expectedXp = 1000 + 50 + (5 * 10) + (1 * 25) + (2 * -5); // Based on mock gamification settings

        if (finalXp === expectedXp) {
            return { status: 'pass', detail: `Correctly calculated ${xpGained} XP.` };
        } else {
            return { status: 'fail', detail: `Calculation error. Expected ${expectedXp}, got ${finalXp}.` };
        }
    } catch (e) {
        return { status: 'fail', detail: `An exception occurred: ${(e as Error).message}` };
    }
};

const testRankCalculation = (ranks: any[]): { status: CheckStatus, detail: string } => {
    const mockPlayer: Player = { stats: { xp: 1100, gamesPlayed: 11 } } as Player;
    const sortedRanks = [...ranks].sort((a, b) => b.minXp - a.minXp);
    const rank = sortedRanks.find(r => mockPlayer.stats.xp >= r.minXp) || UNRANKED_RANK;
    if (rank && rank.name === "Corporal 1") {
        return { status: 'pass', detail: 'Correctly assigned Corporal 1 for 1100 XP.' };
    }
    return { status: 'fail', detail: `Incorrect rank. Expected Corporal 1, got ${rank?.name || 'Unranked'}.` };
};

const testBadgeAwarding = (badges: Badge[]): { status: CheckStatus, detail: string } => {
    const mockPlayer: Player = { stats: { kills: 55, headshots: 10, gamesPlayed: 5 }, badges: [] } as Player;
    const sharpshooterBadge = badges.find(b => b.id === 'b01'); // 50 headshots
    const firstKillBadge = badges.find(b => b.id === 'b03'); // 1 kill
    
    if (!sharpshooterBadge || !firstKillBadge) return { status: 'fail', detail: 'Mock badges not found.' };

    const hasSharpshooter = mockPlayer.stats.headshots >= (sharpshooterBadge.criteria.value as number);
    const hasFirstKill = mockPlayer.stats.kills >= (firstKillBadge.criteria.value as number);

    if (!hasSharpshooter && hasFirstKill) {
        return { status: 'pass', detail: 'Correctly identified earned and unearned badges.' };
    }
    return { status: 'fail', detail: 'Logic for awarding badges seems incorrect.' };
};

export const SystemScanner: React.FC = () => {
    const dataContext = useContext(DataContext as React.Context<DataContextType>);
    const [results, setResults] = useState<Record<string, CheckResult[]>>({});
    const [overallStatus, setOverallStatus] = useState<OverallStatus>('pending');
    const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [activeTab, setActiveTab] = useState<ScannerTab>('status');
    const [errorLog, setErrorLog] = useState<ErrorLogEntry[]>([]);

    const ALL_CHECKS = useCallback((): Check[] => {
        if (!dataContext) return [];
        const { players, companyDetails, ranks, badges, gamificationSettings, creatorDetails, addDoc } = dataContext;

        return [
            { category: 'Core System', name: 'React App Initialized', description: "Checks if the main application UI has successfully rendered.", checkFn: async () => document.getElementById('root')?.hasChildNodes() ? { status: 'pass', detail: 'Root element is mounted.' } : { status: 'fail', detail: 'React root not found or is empty.' } },
            { category: 'Core System', name: 'Data Context Ready', description: "Verifies the central data management system is available.", checkFn: async () => dataContext ? { status: 'pass', detail: 'DataContext is available.' } : { status: 'fail', detail: 'DataContext is missing.' } },
            { category: 'Service Worker', name: 'Browser Support', description: "Checks if the browser is capable of running service workers.", checkFn: async () => 'serviceWorker' in navigator ? { status: 'pass', detail: 'Service Worker API is supported.' } : { status: 'fail', detail: 'Service Worker API not supported.' } },
            { category: 'Data & Storage', name: 'Storage Mode', description: "Identifies if the app is using live data or mock data.", checkFn: async () => ({ status: 'info', detail: `App is running in ${IS_LIVE_DATA ? 'LIVE (Firebase/API)' : 'MOCK'} data mode.` }) },
            { category: 'Data & Storage', name: 'Firebase SDK Initialization', description: "Checks if the Firebase library initialized correctly.", checkFn: async () => !USE_FIREBASE ? {status: 'info', detail: 'Firebase is disabled.'} : firebaseInitializationError ? { status: 'fail', detail: `Init failed: ${firebaseInitializationError.message}` } : { status: 'pass', detail: 'SDK initialized successfully.' } },
            { category: 'Data & Storage', name: 'Firebase Config', description: "Verifies that all required Firebase env variables are present.", checkFn: async () => !USE_FIREBASE ? {status: 'info', detail: 'Firebase is disabled.'} : isFirebaseConfigured() ? { status: 'pass', detail: 'Env variables are set.' } : { status: 'fail', detail: 'One or more VITE_FIREBASE_* env variables are missing.' } },
            { category: 'Data & Storage', name: 'Firestore Connectivity', description: "Attempts a basic connection to the Firestore database.", checkFn: async () => !IS_LIVE_DATA ? { status: 'pass', detail: 'Skipped (mock data mode).' } : !db ? {status: 'fail', detail: 'DB object not initialized.'} : db.collection('settings').doc('companyDetails').get().then(() => ({ status: 'pass', detail: 'Successfully connected.' })).catch(e => ({ status: 'fail', detail: `Connection failed: ${(e as Error).message}` })) },
            { category: 'Data & Storage', name: 'Firestore Read/Write Test', description: "Performs a live test to create, read, and delete a document.", checkFn: async () => { if (!IS_LIVE_DATA || !db) return { status: 'pass', detail: 'Skipped (mock data mode).' }; const t = db.collection('_health').doc(`test_${Date.now()}`); try { await t.set({s:'w'}); const d=await t.get(); if (!d.exists) throw new Error('Read fail.'); await t.delete(); return { status: 'pass', detail: 'CRUD operations successful.' }; } catch (e) { return { status: 'fail', detail: `R/W test failed: ${(e as Error).message}` }; } finally { try { await t.delete(); } catch (_) {} }}},
            { category: 'Data & Storage', name: 'API Server Health', description: "Pings the external API server (if configured).", checkFn: async () => !companyDetails.apiServerUrl ? { status: 'info', detail: 'Not configured.' } : checkUrl(`${companyDetails.apiServerUrl}/health`) },
            { category: 'Configuration', name: 'Company Details Loaded', description: "Ensures the main company configuration was loaded.", checkFn: async () => companyDetails?.name ? { status: 'pass', detail: `Loaded: ${companyDetails.name}` } : { status: 'fail', detail: 'Company details are missing.' } },
            { category: 'Configuration', name: 'Creator Details Loaded', description: "Ensures the creator's profile information was loaded.", checkFn: async () => creatorDetails?.name ? { status: 'pass', detail: `Loaded: ${creatorDetails.name}` } : { status: 'warn', detail: 'Creator details are missing.' } },
            { category: 'Configuration', name: 'Ranks Loaded', description: "Checks that the player rank structure is available.", checkFn: async () => ranks.length > 0 ? { status: 'pass', detail: `${ranks.length} ranks loaded.` } : { status: 'fail', detail: 'No ranks found.' } },
            { category: 'Configuration', name: 'Gamification Rules Loaded', description: "Verifies that XP rules are loaded.", checkFn: async () => gamificationSettings.length > 0 ? { status: 'pass', detail: `${gamificationSettings.length} rules loaded.` } : { status: 'fail', detail: 'No gamification rules found.' } },
            { category: 'Content & Media', name: 'Company Logo URL', description: "Validates that the company logo URL is accessible.", checkFn: () => checkUrl(companyDetails.logoUrl) },
            { category: 'Content & Media', name: 'Login Screen Background', description: "Validates the login screen background URL.", checkFn: () => checkUrl(companyDetails.loginBackgroundUrl) },
            { category: 'Core Automations', name: 'Event Finalization Logic', description: 'Simulates finalizing an event to verify XP calculations.', checkFn: async () => testEventFinalizationLogic(players, gamificationSettings) },
            { category: 'Core Automations', name: 'Rank Calculation Logic', description: 'Simulates player XP to verify correct rank assignment.', checkFn: async () => testRankCalculation(ranks) },
            { category: 'Core Automations', name: 'Badge Awarding Logic', description: 'Simulates player stats to verify badge unlocking logic.', checkFn: async () => testBadgeAwarding(badges) },
            { category: 'Admin Functions', name: 'Player Creation Logic', description: 'Simulates creating a new player to check for errors.', checkFn: async () => { try { await addDoc('players', {name: 'Test', stats: {xp: 0}}); return {status: 'pass', detail: 'Player creation function is available.'}} catch(e) {return {status: 'fail', detail: `Function failed: ${(e as Error).message}`}}}},
        ];
    }, [dataContext]);

    const runChecks = useCallback(async (checksToRun: Check[]) => {
        setIsScanning(true);
        for (const { category, name, description } of checksToRun) {
            setResults(prev => {
                const updatedCategory = [...(prev[category] || [])];
                const idx = updatedCategory.findIndex(c => c.text === name);
                const newCheck: CheckResult = { text: name, description, status: 'running', detail: 'Running check...' };
                if (idx > -1) updatedCategory[idx] = newCheck; else updatedCategory.push(newCheck);
                return {...prev, [category]: updatedCategory};
            });
        }
        
        for (const { category, name, description, checkFn } of checksToRun) {
            const result = await checkFn();
            
            setResults(prev => {
                const updatedCategory = [...(prev[category] || [])];
                const idx = updatedCategory.findIndex(c => c.text === name);
                const finalCheck = { text: name, description, ...result };
                if (idx > -1) updatedCategory[idx] = finalCheck; else updatedCategory.push(finalCheck);
                if (finalCheck.status === 'fail' || finalCheck.status === 'warn') {
                    setErrorLog(log => [{ timestamp: new Date(), checkName: name, category, detail: finalCheck.detail }, ...log].slice(0, 50));
                }
                return {...prev, [category]: updatedCategory};
            });
        }
        
        setLastScanTime(new Date());
        setIsScanning(false);
    }, []);

    useEffect(() => {
        const groupedChecks: Record<string, CheckResult[]> = {};
        for(const { category, name, description } of ALL_CHECKS()) {
            if (!groupedChecks[category]) groupedChecks[category] = [];
            groupedChecks[category].push({ text: name, description, status: 'pending', detail: 'Awaiting scan...' });
        }
        setResults(groupedChecks);
        runChecks(ALL_CHECKS());
    }, [ALL_CHECKS, runChecks]);

    useEffect(() => {
        const allChecks: CheckResult[] = (Object.values(results) as CheckResult[][]).flat();
        if (allChecks.length === 0) return;

        const fails = allChecks.filter(c => c.status === 'fail').length;
        const warns = allChecks.filter(c => c.status === 'warn').length;
        
        if (allChecks.every(c => c.status === 'pending' || c.status === 'running')) {
            setOverallStatus('pending');
        } else if (fails > 0) {
            setOverallStatus('critical');
        } else if (warns > 0) {
            setOverallStatus('degraded');
        } else {
            setOverallStatus('operational');
        }

    }, [results]);

    const StatusIcon: React.FC<{ status: CheckStatus }> = ({ status }) => {
        const icons: Record<CheckStatus, React.ReactNode> = {
            pass: <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />,
            fail: <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />,
            warn: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />,
            info: <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />,
            pending: <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-gray-500"></div></div>,
            running: <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center"><CogIcon className="w-4 h-4 text-gray-400 animate-spin"/></div>,
        };
        return icons[status] || null;
    };
    
    const statusInfo: Record<OverallStatus, { text: string; color: string; bgColor: string }> = {
        pending: { text: 'Awaiting Scan...', color: 'text-gray-400', bgColor: 'bg-gray-500' },
        operational: { text: 'All Systems Operational', color: 'text-green-400', bgColor: 'bg-green-500' },
        degraded: { text: 'Degraded Performance', color: 'text-yellow-400', bgColor: 'bg-yellow-500' },
        critical: { text: 'Critical Errors Detected', color: 'text-red-400', bgColor: 'bg-red-500' },
    };
    const currentStatus = statusInfo[overallStatus];

    return (
        <div className="space-y-4">
            <div className="flex border-b border-zinc-700">
                {(['status', 'diagnostics', 'history'] as ScannerTab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === tab ? 'text-red-400 border-b-2 border-red-500' : 'text-gray-400 hover:text-white'}`}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} {tab === 'history' && errorLog.length > 0 && `(${errorLog.length})`}
                    </button>
                ))}
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
                         <div className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-700/50 space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative flex items-center justify-center">
                                        <span className={`absolute inline-flex h-3 w-3 rounded-full ${currentStatus.bgColor} ${isScanning ? 'opacity-75 animate-ping' : ''}`}></span>
                                        <span className={`relative inline-flex rounded-full h-3 w-3 ${currentStatus.bgColor}`}></span>
                                    </div>
                                    <h4 className={`text-lg font-bold ${currentStatus.color}`}>{isScanning ? 'Scanning...' : currentStatus.text}</h4>
                                </div>
                                <div className="flex items-center gap-2">
                                    <p className="text-xs text-gray-500">Last full scan: {lastScanTime ? lastScanTime.toLocaleTimeString() : 'N/A'}</p>
                                    <Button size="sm" variant="secondary" onClick={() => runChecks(ALL_CHECKS())} disabled={isScanning} className="!p-1.5"><ArrowPathIcon className="w-4 h-4"/></Button>
                                </div>
                            </div>
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                <h5 className="text-sm font-semibold text-gray-400">Recent Activity</h5>
                                {errorLog.length > 0 ? errorLog.slice(0, 5).map((log, i) => (
                                     <div key={i} className="flex items-start gap-2 text-xs p-2 bg-red-900/20 rounded-md">
                                        <ExclamationTriangleIcon className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0"/>
                                        <div>
                                            <p className="text-red-400">
                                                <span className="font-bold">{log.checkName}</span> failed at {log.timestamp.toLocaleTimeString()}
                                            </p>
                                            <p className="text-gray-300">{log.detail}</p>
                                        </div>
                                    </div>
                                )) : <p className="text-sm text-center text-gray-500 p-4">No issues detected in this session.</p>}
                            </div>
                        </div>
                    )}
                    {activeTab === 'diagnostics' && (
                        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                             {(Object.entries(results) as [string, CheckResult[]][]).map(([category, checks]) => (
                                <div key={category} className="bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                                    <div className="flex items-center justify-between p-3 text-left">
                                        <div className="flex items-center gap-3"><span className="font-semibold text-white">{category}</span></div>
                                        <Button size="sm" variant="secondary" onClick={() => runChecks(ALL_CHECKS().filter(c => c.category === category))} disabled={isScanning}>Scan Category</Button>
                                    </div>
                                    <div className="border-t border-zinc-700/50 p-3 space-y-3">
                                        {checks.map((check, i) => (
                                            <div key={i}>
                                                <div className="flex items-start gap-3 text-sm">
                                                    <StatusIcon status={check.status} />
                                                    <div className="flex-grow">
                                                        <p className="text-gray-200 font-semibold">{check.text}</p>
                                                        <p className="text-xs text-gray-500 italic mt-0.5">{check.description}</p>
                                                        <p className="text-xs text-gray-400 mt-1">{check.detail}</p>
                                                    </div>
                                                    <Button size="sm" variant="secondary" className="!px-2 !py-1" onClick={() => runChecks([ALL_CHECKS().find(c => c.name === check.text)!])} disabled={isScanning}><ArrowPathIcon className="w-4 h-4"/></Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {activeTab === 'history' && (
                        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                             {errorLog.length > 0 ? errorLog.map((log, i) => (
                                <div key={i} className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                                    <div className="flex justify-between items-start text-xs">
                                        <p className="font-bold text-red-400">{log.category} / {log.checkName}</p>
                                        <p className="text-gray-500 flex items-center gap-1"><ClockIcon className="w-3 h-3"/>{log.timestamp.toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm text-gray-300 mt-1">{log.detail}</p>
                                </div>
                             )) : <p className="text-center text-gray-500 p-8">No errors have been logged in this session.</p>}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};