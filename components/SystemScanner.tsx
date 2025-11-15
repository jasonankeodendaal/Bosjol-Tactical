import React, { useState, useContext, useEffect, useRef } from 'react';
import { DataContext, IS_LIVE_DATA } from '../data/DataContext';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, CogIcon, CodeBracketIcon } from './icons/Icons';
import { db, USE_FIREBASE, firebaseInitializationError, isFirebaseConfigured } from '../firebase';
import { DashboardCard } from './DashboardCard';

type ScanStatus = 'idle' | 'scanning' | 'complete';
type CheckStatus = 'pass' | 'fail' | 'warn' | 'info';

interface LogEntry {
    text: string;
    status: CheckStatus | 'running';
}

interface CheckResult {
    text: string;
    status: CheckStatus;
    detail: string;
}

interface ResultCategory {
    title: string;
    checks: CheckResult[];
}

// Utility to check if a URL is accessible
const checkUrl = async (url: string): Promise<{ status: 'pass' | 'fail' | 'warn', detail: string }> => {
    if (!url || typeof url !== 'string') {
        return { status: 'fail', detail: 'URL is missing or invalid.' };
    }
    try {
        const response = await fetch(url, { method: 'HEAD', mode: 'cors' });
        if (response.ok) {
            return { status: 'pass', detail: `URL is accessible (Status: ${response.status})` };
        } else {
            return { status: 'fail', detail: `URL returned an error (Status: ${response.status})` };
        }
    } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            return { status: 'warn', detail: 'Could not verify URL due to CORS policy. Assuming it is correct.' };
        }
        return { status: 'fail', detail: `URL fetch failed: ${(error as Error).message}` };
    }
};

export const SystemScanner: React.FC = () => {
    const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [results, setResults] = useState<Record<string, ResultCategory>>({});
    const [progress, setProgress] = useState(0);
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    const logContainerRef = useRef<HTMLDivElement>(null);

    const dataContext = useContext(DataContext);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    if (!dataContext) return null;

    const { players, events, companyDetails, ranks, gamificationSettings, carouselMedia, socialLinks, sponsors } = dataContext;
    
    const runScan = async () => {
        setScanStatus('scanning');
        setLogs([]);
        setResults({});
        setProgress(0);

        const appendLog = (text: string, status: LogEntry['status'] = 'running') => {
            setLogs(prev => [...prev.slice(-200), { text, status }]); // Keep logs from getting too long
        };

        const checks = [
            // Core System
            { category: 'Core System', name: 'React App Initialized', checkFn: async () => document.getElementById('root')?.hasChildNodes() ? { status: 'pass', detail: 'Root element is mounted.' } : { status: 'fail', detail: 'React root not found or is empty.' } },
            { category: 'Core System', name: 'Auth Context Ready', checkFn: async () => dataContext ? { status: 'pass', detail: 'AuthContext is available.' } : { status: 'fail', detail: 'AuthContext is missing.' } },
            { category: 'Core System', name: 'Data Context Ready', checkFn: async () => dataContext ? { status: 'pass', detail: 'DataContext is available.' } : { status: 'fail', detail: 'DataContext is missing.' } },
            { category: 'Core System', name: 'Service Worker Active', checkFn: async () => 'serviceWorker' in navigator && navigator.serviceWorker.controller ? { status: 'pass', detail: 'Service worker is controlling the page.' } : { status: 'warn', detail: 'Service worker not registered or not active.' } },
            // Data & Storage
            { category: 'Data & Storage', name: 'Storage Mode Detection', checkFn: async () => ({ status: 'info', detail: `App is running in ${IS_LIVE_DATA ? 'LIVE (Firebase/API)' : 'MOCK'} data mode.` }) },
            { category: 'Data & Storage', name: 'Firebase SDK Initialization', checkFn: async () => !USE_FIREBASE ? {status: 'info', detail: 'Firebase is disabled (VITE_USE_FIREBASE=false).'} : firebaseInitializationError ? { status: 'fail', detail: `Firebase SDK failed to initialize: ${firebaseInitializationError.message}` } : { status: 'pass', detail: 'Firebase SDK initialized successfully.' } },
            { category: 'Data & Storage', name: 'Firebase Config Variables', checkFn: async () => !USE_FIREBASE ? {status: 'info', detail: 'Firebase is disabled.'} : isFirebaseConfigured() ? { status: 'pass', detail: 'All required Firebase environment variables are set.' } : { status: 'fail', detail: 'One or more VITE_FIREBASE_* environment variables are missing.' } },
            { category: 'Data & Storage', name: 'Firestore Connection', checkFn: async () => !IS_LIVE_DATA ? { status: 'pass', detail: 'Skipped (mock data mode).' } : !db ? {status: 'fail', detail: 'DB object not initialized.'} : db.collection('settings').doc('companyDetails').get().then(() => ({ status: 'pass', detail: 'Successfully connected to Firestore.' })).catch(e => ({ status: 'fail', detail: `Firestore connection failed: ${e.message}` })) },
            { category: 'Data & Storage', name: 'API Server Health', checkFn: async () => !companyDetails.apiServerUrl ? { status: 'info', detail: 'API Server URL not configured.' } : checkUrl(`${companyDetails.apiServerUrl}/health`) },
            // Configuration
            { category: 'Configuration', name: 'Company Details Loaded', checkFn: async () => companyDetails?.name ? { status: 'pass', detail: `Loaded: ${companyDetails.name}` } : { status: 'fail', detail: 'Company details are missing.' } },
            { category: 'Configuration', name: 'Ranks Loaded', checkFn: async () => ranks.length > 0 ? { status: 'pass', detail: `${ranks.length} ranks loaded.` } : { status: 'fail', detail: 'No ranks found.' } },
            { category: 'Configuration', name: 'Gamification Rules Loaded', checkFn: async () => gamificationSettings.length > 0 ? { status: 'pass', detail: `${gamificationSettings.length} rules loaded.` } : { status: 'fail', detail: 'No gamification rules found.' } },
            // Content & Media
            { category: 'Content & Media', name: 'Company Logo URL', checkFn: () => checkUrl(companyDetails.logoUrl) },
            { category: 'Content & Media', name: 'Player Avatars (Sample)', checkFn: () => checkUrl(players[0]?.avatarUrl) },
            { category: 'Content & Media', name: 'Event Images (Sample)', checkFn: () => { const eventWithImage = events.find(e => e.imageUrl); return checkUrl(eventWithImage?.imageUrl || ''); } },
            { category: 'Content & Media', name: 'Carousel Media URLs', checkFn: async () => { for (const media of carouselMedia) { const res = await checkUrl(media.url); if (res.status === 'fail') return res; } return { status: 'pass', detail: 'All carousel media URLs are valid.' }; } },
            { category: 'Content & Media', name: 'Social Link Icons', checkFn: async () => { for (const link of socialLinks) { const res = await checkUrl(link.iconUrl); if (res.status === 'fail') return res; } return { status: 'pass', detail: 'All social link icons are valid.' }; } },
            { category: 'Content & Media', name: 'Sponsor Logos', checkFn: async () => { for (const sponsor of sponsors) { const res = await checkUrl(sponsor.logoUrl); if (res.status === 'fail') return res; } return { status: 'pass', detail: 'All sponsor logos are valid.' }; } },
        ];

        const tempResults: Record<string, ResultCategory> = {};

        for (let i = 0; i < checks.length; i++) {
            const { category, name, checkFn } = checks[i];
            appendLog(`[${category}] Running check: ${name}...`);

            const result = await checkFn();

            if (!tempResults[category]) {
                tempResults[category] = { title: category, checks: [] };
            }
            tempResults[category].checks.push({ text: name, ...result });

            setLogs(prev => prev.map(log => log.text.includes(name) ? { ...log, status: result.status } : log));
            setProgress(Math.round(((i + 1) / checks.length) * 100));
            await new Promise(resolve => setTimeout(resolve, 100)); // Artificial delay
        }

        setResults(tempResults);
        setScanStatus('complete');
    };

    const StatusIcon = ({ status }: { status: CheckStatus }) => {
        switch (status) {
            case 'pass': return <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />;
            case 'fail': return <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />;
            case 'warn': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
            case 'info': return <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />;
            default: return null;
        }
    };

    const renderIdle = () => (
        <div className="text-center p-8">
            <h4 className="text-lg font-semibold text-gray-200">System Health & Diagnostics</h4>
            <p className="text-sm text-gray-400 mt-2 mb-6">Run a series of checks on the application's core components, data connections, and content to identify potential issues.</p>
            <Button onClick={runScan}>
                Run System Scan
            </Button>
        </div>
    );

    const renderScanning = () => (
        <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
                <CogIcon className="w-8 h-8 text-red-500 animate-spin" />
                <div>
                    <h4 className="font-bold text-lg text-white">Scanning System...</h4>
                    <p className="text-sm text-gray-400">Please wait while checks are being performed.</p>
                </div>
            </div>
            <div className="w-full bg-zinc-700 rounded-full h-2.5 mb-4">
                <div className="bg-red-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <div ref={logContainerRef} className="h-64 bg-zinc-950/70 p-3 rounded-lg font-mono text-xs text-gray-300 overflow-y-auto border border-zinc-700">
                {logs.map((log, i) => (
                    <div key={i} className="flex items-center gap-2">
                        {log.status === 'running' ? <div className="w-3 h-3 border-2 border-zinc-500 border-t-zinc-200 rounded-full animate-spin flex-shrink-0"></div> : <StatusIcon status={log.status} />}
                        <span className={log.status === 'fail' ? 'text-red-400' : log.status === 'warn' ? 'text-yellow-400' : ''}>{log.text}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderComplete = () => {
        // FIX: Explicitly type `cat` to resolve 'property does not exist on type unknown' error.
        const totalFails = Object.values(results).flatMap((cat: ResultCategory) => cat.checks).filter(c => c.status === 'fail').length;
        // FIX: Explicitly type `cat` to resolve 'property does not exist on type unknown' error.
        const totalWarns = Object.values(results).flatMap((cat: ResultCategory) => cat.checks).filter(c => c.status === 'warn').length;

        return (
            <div className="p-4">
                <div className="text-center mb-6">
                    <h4 className="text-xl font-bold text-white">Scan Complete</h4>
                    <p className={`font-semibold ${totalFails > 0 ? 'text-red-400' : totalWarns > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                        {totalFails > 0 ? `${totalFails} failure(s)` : ''}
                        {totalFails > 0 && totalWarns > 0 ? ' and ' : ''}
                        {totalWarns > 0 ? `${totalWarns} warning(s)` : ''}
                        {totalFails === 0 && totalWarns === 0 ? 'No issues found.' : ' found.'}
                    </p>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {/* FIX: Explicitly type array from Object.entries to resolve 'property does not exist on type unknown' errors. */}
                    {Object.entries(results).map(([key, category]: [string, ResultCategory]) => {
                        const hasFail = category.checks.some(c => c.status === 'fail');
                        const hasWarn = category.checks.some(c => c.status === 'warn');
                        const categoryStatus: CheckStatus = hasFail ? 'fail' : hasWarn ? 'warn' : 'pass';
                        const isOpen = openCategories[key] ?? hasFail;

                        return (
                            <div key={key} className="bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                                <button
                                    className="w-full flex items-center justify-between p-3 text-left"
                                    onClick={() => setOpenCategories(prev => ({ ...prev, [key]: !isOpen }))}
                                >
                                    <div className="flex items-center gap-3">
                                        <StatusIcon status={categoryStatus} />
                                        <span className="font-semibold text-white">{category.title}</span>
                                    </div>
                                    <span className={`transform transition-transform ${isOpen ? 'rotate-90' : 'rotate-0'}`}>{'>'}</span>
                                </button>
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="border-t border-zinc-700/50 p-3 space-y-2">
                                                {category.checks.map((check, i) => (
                                                    <div key={i} className="flex items-start gap-3 text-sm">
                                                        <StatusIcon status={check.status} />
                                                        <div>
                                                            <p className="text-gray-200">{check.text}</p>
                                                            <p className="text-xs text-gray-400">{check.detail}</p>
                                                        </div>
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
                <div className="mt-6">
                    <Button onClick={runScan} variant="secondary" className="w-full">Run Scan Again</Button>
                </div>
            </div>
        );
    }

    return (
        <DashboardCard title="System Health & Diagnostics Scanner" icon={<CodeBracketIcon className="w-6 h-6" />}>
            {scanStatus === 'idle' && renderIdle()}
            {scanStatus === 'scanning' && renderScanning()}
            {scanStatus === 'complete' && renderComplete()}
        </DashboardCard>
    );
};
