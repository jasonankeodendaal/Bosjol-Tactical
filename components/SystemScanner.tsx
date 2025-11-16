import React, { useState, useContext, useEffect, useCallback } from 'react';
import { DataContext, IS_LIVE_DATA } from '../data/DataContext';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, CogIcon, CodeBracketIcon, ArrowPathIcon } from './icons/Icons';
import { db, USE_FIREBASE, firebaseInitializationError, isFirebaseConfigured } from '../firebase';
import { DashboardCard } from './DashboardCard';

type CheckStatus = 'pass' | 'fail' | 'warn' | 'info';
type OverallStatus = 'operational' | 'degraded' | 'critical' | 'pending';

interface CheckResult {
    text: string;
    status: CheckStatus;
    detail: string;
}

interface ResultCategory {
    title: string;
    checks: CheckResult[];
}

const SOLUTIONS_MAP: Record<string, { problem: string; solution: React.ReactNode }> = {
    'React App Initialized': {
        problem: "The main React application component failed to render inside its root container.",
        solution: <p>This is a critical rendering failure. 1. Check the browser console for JavaScript errors. 2. Ensure the `index.html` file has a `&lt;div id="root"&gt;&lt;/div&gt;`. 3. Verify that `index.tsx` is correctly targeting this root element.</p>
    },
    'PWA Manifest Check': {
        problem: "The Progressive Web App manifest file (`manifest.json`) is either missing, malformed, or couldn't be fetched.",
        solution: <p>The manifest is required for PWA features like 'Add to Home Screen'. 1. Ensure `manifest.json` exists in the public root folder. 2. Validate its syntax using an online JSON validator. 3. Check that it includes essential keys like `name`, `short_name`, `icons`, and `start_url`.</p>
    },
    'Service Worker Registration Status': {
        problem: "The Service Worker script, which enables offline functionality, is not registered or active.",
        solution: <p>This can happen on the very first visit or if the script fails. 1. Ensure `service-worker.js` exists in the public root. 2. Check the browser console for registration errors. 3. Try a hard refresh (Ctrl+Shift+R) to force re-registration.</p>
    },
    'Firebase SDK Initialization': {
        problem: "The Firebase SDK failed to initialize. This usually points to incorrect configuration credentials.",
        solution: <p>This is a critical error when in Firebase mode. 1. Double-check all `VITE_FIREBASE_*` variables in your environment file (`.env.local`). 2. Verify the credentials in your Firebase project settings match what's in your environment file. 3. Check for any typos in the variable names.</p>
    },
    'Firebase Config': {
        problem: "The application is configured to use Firebase, but one or more necessary environment variables are missing.",
        solution: <p>The app cannot connect to Firebase without the full configuration. 1. Ensure your `.env.local` file (for development) or hosting provider's environment variables include all required `VITE_FIREBASE_*` keys. 2. Make sure you haven't misspelled any variable names.</p>
    },
    'Firestore Connectivity': {
        problem: "The application successfully initialized the Firebase SDK but cannot establish a connection to the Firestore database.",
        solution: <p>This blocks all data operations. 1. Check your server's internet connection. 2. Go to your Firebase project console and ensure the Firestore Database is enabled and created. 3. Check your Firestore Security Rules to ensure they aren't blocking all read/write access.</p>
    },
    'Firestore Read/Write Test': {
        problem: "A live test to create, read, update, and delete a temporary document in Firestore failed. This indicates a permission issue.",
        solution: <p>This is likely due to restrictive Firestore Security Rules. 1. Go to your Firebase console -> Firestore -> Rules. 2. Ensure your rules allow authenticated users (or the specific admin user) to read and write to the collections. For testing, you can temporarily allow all access: `allow read, write: if true;` but be sure to secure this for production.</p>
    },
    'API Server Health': {
        problem: "The application cannot reach the configured external API server. The server may be down or the URL may be incorrect.",
        solution: <p>File uploads will fail. 1. Verify the API server is running (e.g., using `pm2 status`). 2. Check the server logs for errors (`pm2 logs [app_name]`). 3. Ensure the 'API Server URL' in the Admin Settings is correct and publicly accessible. 4. If using a tunnel (like Cloudflare), ensure the tunnel is active and pointing to the correct local port.</p>
    },
    'Company Details Loaded': {
        problem: "The core `companyDetails` document could not be loaded from the database.",
        solution: <p>This is a critical configuration issue. If this is a new project, the initial data seeding may have failed. If this is an existing project, the document may have been accidentally deleted. Use the 'Restore from Backup' feature in the Admin Settings if you have a backup file.</p>
    },
    'Company Logo URL': {
        problem: "The URL for the company logo is either not configured or points to an unreachable address.",
        solution: <p>The logo will appear broken throughout the app. 1. Go to Admin Dashboard -> Settings -> Branding & Visuals. 2. Under 'Company Logo', re-upload the image or paste a valid, publicly accessible URL. 3. Save the settings.</p>
    }
    // Add other solutions as needed...
};


// Utility to check if a URL is accessible
const checkUrl = async (url: string | undefined): Promise<{ status: 'pass' | 'fail' | 'warn', detail: string }> => {
    if (!url || typeof url !== 'string' || url.trim() === '') {
        return { status: 'warn', detail: 'URL is not configured.' };
    }
    if (url.startsWith('data:')) {
        return { status: 'pass', detail: 'URL is a valid data URI.' };
    }
    try {
        const testUrl = new URL(url);
        testUrl.searchParams.append('_t', Date.now().toString());
        await fetch(testUrl.toString(), { method: 'HEAD', mode: 'no-cors' });
        return { status: 'pass', detail: `URL is reachable.` };
    } catch (error) {
        return { status: 'fail', detail: `URL fetch failed: ${(error as Error).message}` };
    }
};

const StatCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
    <div className="bg-zinc-800/50 p-3 rounded-lg text-center border border-zinc-700/50 flex-1">
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-gray-400 uppercase tracking-wider">{title}</p>
    </div>
);

const HealthScoreHistoryChart: React.FC<{ history: { time: number; score: number }[] }> = ({ history }) => {
    if (history.length < 2) return <div className="h-24 flex items-center justify-center text-gray-500 text-sm">Awaiting more data...</div>;
    const width = 300, height = 80;
    const maxScore = 100, minScore = 0;
    const maxTime = Math.max(...history.map(p => p.time));
    const minTime = Math.min(...history.map(p => p.time));
    const timeRange = maxTime - minTime;

    const points = history
        .map(p => {
            const x = timeRange > 0 ? ((p.time - minTime) / timeRange) * width : width / 2;
            const y = height - ((p.score - minScore) / (maxScore - minScore)) * height;
            return `${x},${y}`;
        })
        .join(' ');
    
    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </linearGradient>
            </defs>
            <polyline fill="url(#lineGradient)" stroke="#ef4444" strokeWidth="2" points={`0,${height} ${points} ${width},${height}`} />
            <polyline fill="none" stroke="#ef4444" strokeWidth="2" points={points} />
        </svg>
    );
};

const StatusDistributionChart: React.FC<{ data: Record<CheckStatus, number> }> = ({ data }) => {
    // FIX: Explicitly typed accumulator and value in reduce to prevent 'unknown' type error.
    const total = Object.values(data).reduce((sum: number, val: number) => sum + val, 0);
    if (total === 0) return null;
    
    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    const items = [
        { status: 'pass', color: '#22c55e' },
        { status: 'warn', color: '#f59e0b' },
        { status: 'fail', color: '#ef4444' },
        { status: 'info', color: '#3b82f6' },
    ] as const;

    let accumulatedOffset = 0;

    return (
        <div className="flex items-center justify-center gap-6">
            <svg width="100" height="100" viewBox="0 0 100 100">
                <g transform="rotate(-90 50 50)">
                    {items.map(({ status, color }) => {
                        if (data[status] === 0) return null;
                        const dash = (data[status] / total) * circumference;
                        const strokeDasharray = `${dash} ${circumference - dash}`;
                        const strokeDashoffset = -accumulatedOffset;
                        accumulatedOffset += dash;

                        return (
                            <circle
                                key={status}
                                cx="50" cy="50" r={radius}
                                fill="transparent"
                                stroke={color}
                                strokeWidth="10"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                            />
                        );
                    })}
                </g>
            </svg>
            <div className="text-sm space-y-1">
                {items.map(({ status, color }) => data[status] > 0 && (
                    <div key={status} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                        <span className="text-gray-300 capitalize">{status}: {data[status]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const SystemScanner: React.FC = () => {
    const [results, setResults] = useState<Record<string, ResultCategory>>({});
    const [overallStatus, setOverallStatus] = useState<OverallStatus>('pending');
    const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    const [healthHistory, setHealthHistory] = useState<{time: number; score: number}[]>([]);
    
    const dataContext = useContext(DataContext);

    const runScan = useCallback(async () => {
        if (!dataContext) return;
        const { players, events, companyDetails, ranks, gamificationSettings, carouselMedia, socialLinks, sponsors, creatorDetails } = dataContext;
        
        const checks = [
            { category: 'Core System', name: 'React App Initialized', checkFn: async () => document.getElementById('root')?.hasChildNodes() ? { status: 'pass' as CheckStatus, detail: 'Root element is mounted.' } : { status: 'fail' as CheckStatus, detail: 'React root not found or is empty.' } },
            { category: 'Core System', name: 'Data Context Ready', checkFn: async () => dataContext ? { status: 'pass' as CheckStatus, detail: 'DataContext is available.' } : { status: 'fail' as CheckStatus, detail: 'DataContext is missing.' } },
            { category: 'Core System', name: 'PWA Manifest Check', checkFn: async () => { try { const r = await fetch('/manifest.json'); if (!r.ok) return { status: 'fail', detail: `manifest.json not found (Status: ${r.status})` }; const m = await r.json(); return (m.name && m.icons) ? { status: 'pass', detail: `Manifest "${m.name}" loaded.` } : { status: 'warn', detail: 'Manifest missing "name" or "icons".' }; } catch (e) { return { status: 'fail', detail: `Failed to fetch/parse manifest: ${(e as Error).message}` }; } }},
            { category: 'Service Worker', name: 'Browser Support', checkFn: async () => 'serviceWorker' in navigator ? { status: 'pass' as CheckStatus, detail: 'Service Worker API is supported.' } : { status: 'fail' as CheckStatus, detail: 'Service Worker API not supported.' } },
            { category: 'Service Worker', name: 'Registration Status', checkFn: async () => { if (!('serviceWorker' in navigator)) return { status: 'fail' as CheckStatus, detail: 'Browser does not support Service Workers.' }; const r = await navigator.serviceWorker.getRegistration(); return r ? { status: 'pass' as CheckStatus, detail: `Scope: ${r.scope}` } : { status: 'warn' as CheckStatus, detail: 'No active registration found.' }; }},
            { category: 'Data & Storage', name: 'Storage Mode', checkFn: async () => ({ status: 'info' as CheckStatus, detail: `App is running in ${IS_LIVE_DATA ? 'LIVE (Firebase/API)' : 'MOCK'} data mode.` }) },
            { category: 'Data & Storage', name: 'Firebase SDK Initialization', checkFn: async () => !USE_FIREBASE ? {status: 'info' as CheckStatus, detail: 'Firebase is disabled.'} : firebaseInitializationError ? { status: 'fail' as CheckStatus, detail: `Init failed: ${firebaseInitializationError.message}` } : { status: 'pass' as CheckStatus, detail: 'SDK initialized successfully.' } },
            { category: 'Data & Storage', name: 'Firebase Config', checkFn: async () => !USE_FIREBASE ? {status: 'info'as CheckStatus, detail: 'Firebase is disabled.'} : isFirebaseConfigured() ? { status: 'pass' as CheckStatus, detail: 'Env variables are set.' } : { status: 'fail' as CheckStatus, detail: 'One or more VITE_FIREBASE_* env variables are missing.' } },
            { category: 'Data & Storage', name: 'Firestore Connectivity', checkFn: async () => !IS_LIVE_DATA ? { status: 'pass' as CheckStatus, detail: 'Skipped (mock data mode).' } : !db ? {status: 'fail' as CheckStatus, detail: 'DB object not initialized.'} : db.collection('settings').doc('companyDetails').get().then(() => ({ status: 'pass' as CheckStatus, detail: 'Successfully connected.' })).catch(e => ({ status: 'fail' as CheckStatus, detail: `Connection failed: ${e.message}` })) },
            { category: 'Data & Storage', name: 'Firestore Read/Write Test', checkFn: async () => { if (!IS_LIVE_DATA || !db) return { status: 'pass', detail: 'Skipped (mock data mode).' }; const t = db.collection('_health').doc(`test_${Date.now()}`); try { await t.set({s:'w'}); const d=await t.get(); if (!d.exists) throw new Error('Read fail.'); await t.delete(); return { status: 'pass', detail: 'CRUD operations successful.' }; } catch (e) { return { status: 'fail', detail: `R/W test failed: ${(e as Error).message}` }; } finally { try { await t.delete(); } catch (_) {} }}},
            { category: 'Data & Storage', name: 'API Server Health', checkFn: async () => !companyDetails.apiServerUrl ? { status: 'info' as CheckStatus, detail: 'Not configured.' } : checkUrl(`${companyDetails.apiServerUrl}/health`) },
            { category: 'Configuration', name: 'Company Details Loaded', checkFn: async () => companyDetails?.name ? { status: 'pass' as CheckStatus, detail: `Loaded: ${companyDetails.name}` } : { status: 'fail' as CheckStatus, detail: 'Company details are missing.' } },
            { category: 'Configuration', name: 'Creator Details Loaded', checkFn: async () => creatorDetails?.name ? { status: 'pass' as CheckStatus, detail: `Loaded: ${creatorDetails.name}` } : { status: 'warn' as CheckStatus, detail: 'Creator details are missing.' } },
            { category: 'Configuration', name: 'Ranks Loaded', checkFn: async () => ranks.length > 0 ? { status: 'pass' as CheckStatus, detail: `${ranks.length} ranks loaded.` } : { status: 'fail' as CheckStatus, detail: 'No ranks found.' } },
            { category: 'Configuration', name: 'Gamification Rules Loaded', checkFn: async () => gamificationSettings.length > 0 ? { status: 'pass' as CheckStatus, detail: `${gamificationSettings.length} rules loaded.` } : { status: 'fail' as CheckStatus, detail: 'No gamification rules found.' } },
            { category: 'Content & Media', name: 'Company Logo URL', checkFn: () => checkUrl(companyDetails.logoUrl) },
            { category: 'Content & Media', name: 'Login Screen Background', checkFn: () => checkUrl(companyDetails.loginBackgroundUrl) },
            { category: 'Content & Media', name: 'Event Images (Sample)', checkFn: () => { const e = events.find(ev => ev.imageUrl); return e ? checkUrl(e.imageUrl) : { status: 'info' as CheckStatus, detail: 'No events with images.' }; } },
        ];

        const tempResults: Record<string, ResultCategory> = {};
        for (const { category, name, checkFn } of checks) {
            const result = await checkFn();
            if (!tempResults[category]) tempResults[category] = { title: category, checks: [] };
            const typedResult = result as { status: CheckStatus; detail: string };
            tempResults[category].checks.push({ text: name, ...typedResult });
        }
        
        setResults(tempResults);
        setLastScanTime(new Date());

        const allChecks = Object.values(tempResults).flatMap((cat: ResultCategory) => cat.checks);
        const fails = allChecks.filter(c => c.status === 'fail').length;
        const warns = allChecks.filter(c => c.status === 'warn').length;
        const total = allChecks.length;
        
        const healthScore = total > 0 ? ((total - fails - warns * 0.5) / total) * 100 : 100;
        setHealthHistory(prev => [...prev.slice(-19), { time: Date.now(), score: Math.max(0, healthScore) }]);

        if (fails > 0) setOverallStatus('critical');
        else if (warns > 0) setOverallStatus('degraded');
        else setOverallStatus('operational');

        // FIX: Cast `category` to `ResultCategory` to resolve type errors. This ensures type safety when TypeScript infers `unknown` from `Object.entries`.
        const categoriesWithIssues = Object.entries(tempResults).reduce((acc, [key, category]) => {
            const cat = category as ResultCategory;
            if (cat.checks.some(c => c.status === 'fail' || c.status === 'warn')) {
                acc[key] = true;
            }
            return acc;
        }, {} as Record<string, boolean>);
        setOpenCategories(prev => ({ ...prev, ...categoriesWithIssues }));

    }, [dataContext]);

    useEffect(() => {
        runScan();
    }, [runScan]);

    const StatusIcon: React.FC<{ status: CheckStatus }> = ({ status }) => {
        const icons: Record<CheckStatus, React.ReactNode> = {
            pass: <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />,
            fail: <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />,
            warn: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />,
            info: <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />,
        };
        return icons[status] || null;
    };
    
    const SolutionDisplay: React.FC<{ checkName: string }> = ({ checkName }) => {
        const [isOpen, setIsOpen] = useState(false);
        const solution = SOLUTIONS_MAP[checkName];
        if (!solution) return null;
        
        return (
            <div className="mt-2 pl-8">
                <Button variant="secondary" size="sm" onClick={() => setIsOpen(!isOpen)}>{isOpen ? 'Hide' : 'Show'} Solution</Button>
                <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-2 p-3 bg-zinc-900/50 rounded-md border border-zinc-700">
                             <h5 className="font-bold text-red-400">Problem</h5>
                             <p className="text-sm text-gray-300 mb-2">{solution.problem}</p>
                             <h5 className="font-bold text-green-400">Solution</h5>
                             <div className="text-sm text-gray-300 prose prose-sm prose-invert max-w-none">{solution.solution}</div>
                        </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
        );
    };

    const statusInfo: Record<OverallStatus, { text: string; color: string; bgColor: string }> = {
        pending: { text: 'Initializing Scan...', color: 'text-gray-400', bgColor: 'bg-gray-500' },
        operational: { text: 'All Systems Operational', color: 'text-green-400', bgColor: 'bg-green-500' },
        degraded: { text: 'Degraded Performance', color: 'text-yellow-400', bgColor: 'bg-yellow-500' },
        critical: { text: 'Critical Errors Detected', color: 'text-red-400', bgColor: 'bg-red-500' },
    };
    const currentStatus = statusInfo[overallStatus];
    const allChecks = Object.values(results).flatMap(cat => (cat as ResultCategory).checks);
    const checkCounts = {
        total: allChecks.length,
        pass: allChecks.filter(c => c.status === 'pass').length,
        warn: allChecks.filter(c => c.status === 'warn').length,
        fail: allChecks.filter(c => c.status === 'fail').length,
        info: allChecks.filter(c => c.status === 'info').length,
    };
    // FIX: Exclude the 'total' property from the data passed to the chart
    // to prevent it from being double-counted in the chart's own total calculation.
    const { total, ...statusCounts } = checkCounts;

    return (
        <DashboardCard title="Live System Monitor" icon={<CodeBracketIcon className="w-6 h-6" />}>
            <div className="p-4 space-y-4">
                 <div className="p-3 bg-zinc-950/50 rounded-lg border border-zinc-700/50">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center">
                                <span className={`absolute inline-flex h-3 w-3 rounded-full ${currentStatus.bgColor} opacity-75 animate-ping`}></span>
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${currentStatus.bgColor}`}></span>
                            </div>
                            <h4 className={`text-lg font-bold ${currentStatus.color}`}>{currentStatus.text}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500">Last check: {lastScanTime ? lastScanTime.toLocaleTimeString() : 'Pending...'}</p>
                            <Button size="sm" variant="secondary" onClick={runScan} className="!p-1.5"><ArrowPathIcon className="w-4 h-4"/></Button>
                        </div>
                    </div>
                     <div className="flex flex-wrap gap-2 mt-3">
                        <StatCard title="Total Checks" value={checkCounts.total} color="text-white"/>
                        <StatCard title="Passed" value={checkCounts.pass} color="text-green-400"/>
                        <StatCard title="Warnings" value={checkCounts.warn} color="text-yellow-400"/>
                        <StatCard title="Failures" value={checkCounts.fail} color="text-red-400"/>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                         <h5 className="font-semibold text-center text-gray-300 mb-2">Health Score Over Time</h5>
                         <HealthScoreHistoryChart history={healthHistory}/>
                    </div>
                     <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                        <h5 className="font-semibold text-center text-gray-300 mb-2">Status Distribution</h5>
                        <StatusDistributionChart data={statusCounts} />
                    </div>
                 </div>
                
                {overallStatus === 'pending' ? (
                     <div className="text-center p-8"><CogIcon className="w-12 h-12 text-gray-500 mx-auto animate-spin"/><p className="mt-2 text-gray-400">Running diagnostics...</p></div>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {
                        Object.entries(results).map(([key, category]) => {
                            const cat = category as ResultCategory;
                            const hasFail = cat.checks.some(c => c.status === 'fail');
                            const hasWarn = cat.checks.some(c => c.status === 'warn');
                            const categoryStatus: CheckStatus = hasFail ? 'fail' : hasWarn ? 'warn' : 'pass';
                            const isOpen = openCategories[key] ?? false;

                            return (
                                <div key={key} className="bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                                    <button className="w-full flex items-center justify-between p-3 text-left" onClick={() => setOpenCategories(p => ({ ...p, [key]: !isOpen }))} aria-expanded={isOpen}>
                                        <div className="flex items-center gap-3"><StatusIcon status={categoryStatus} /><span className="font-semibold text-white">{cat.title}</span></div>
                                        <span className={`transform transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`}>{'>'}</span>
                                    </button>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                <div className="border-t border-zinc-700/50 p-3 space-y-3">
                                                    {cat.checks.map((check, i) => (
                                                        <div key={i}>
                                                            <div className="flex items-start gap-3 text-sm">
                                                                <StatusIcon status={check.status} />
                                                                <div>
                                                                    <p className="text-gray-200">{check.text}</p>
                                                                    <p className="text-xs text-gray-400">{check.detail}</p>
                                                                </div>
                                                            </div>
                                                            {(check.status === 'fail' || check.status === 'warn') && <SolutionDisplay checkName={check.text} />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardCard>
    );
};
