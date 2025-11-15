import React, { useState, useContext, useEffect, useCallback } from 'react';
import { DataContext, IS_LIVE_DATA } from '../data/DataContext';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, CogIcon, CodeBracketIcon } from './icons/Icons';
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

// Utility to check if a URL is accessible
const checkUrl = async (url: string | undefined): Promise<{ status: 'pass' | 'fail' | 'warn', detail: string }> => {
    if (!url || typeof url !== 'string') {
        return { status: 'warn', detail: 'URL is not configured.' };
    }
    try {
        // Use a cache-busting parameter to avoid browser caching stale results
        const testUrl = new URL(url);
        testUrl.searchParams.append('_t', Date.now().toString());
        
        const response = await fetch(testUrl.toString(), { method: 'HEAD', mode: 'cors' });
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
    const [results, setResults] = useState<Record<string, ResultCategory>>({});
    const [overallStatus, setOverallStatus] = useState<OverallStatus>('pending');
    const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
    const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
    
    const dataContext = useContext(DataContext);

    const runScan = useCallback(async () => {
        if (!dataContext) return;

        const { players, events, companyDetails, ranks, gamificationSettings, carouselMedia, socialLinks, sponsors, creatorDetails } = dataContext;
        
        const checks = [
            // Core System
            { category: 'Core System', name: 'React App Initialized', checkFn: async () => document.getElementById('root')?.hasChildNodes() ? { status: 'pass' as CheckStatus, detail: 'Root element is mounted.' } : { status: 'fail' as CheckStatus, detail: 'React root not found or is empty.' } },
            { category: 'Core System', name: 'Data Context Ready', checkFn: async () => dataContext ? { status: 'pass' as CheckStatus, detail: 'DataContext is available.' } : { status: 'fail' as CheckStatus, detail: 'DataContext is missing.' } },
            { category: 'Core System', name: 'PWA Manifest Check', checkFn: async () => {
                try {
                    const response = await fetch('/manifest.json');
                    if (!response.ok) return { status: 'fail', detail: `manifest.json not found (Status: ${response.status})` };
                    const manifest = await response.json();
                    if (manifest.name && manifest.icons) {
                        return { status: 'pass', detail: `Manifest "${manifest.name}" loaded successfully.` };
                    }
                    return { status: 'warn', detail: 'Manifest is missing key properties like "name" or "icons".' };
                } catch (e) {
                    return { status: 'fail', detail: `Failed to fetch or parse manifest.json: ${(e as Error).message}` };
                }
            }},

            // Service Worker
            { category: 'Service Worker', name: 'Browser Support', checkFn: async () => 'serviceWorker' in navigator ? { status: 'pass' as CheckStatus, detail: 'Service Worker API is supported by this browser.' } : { status: 'fail' as CheckStatus, detail: 'Service Worker API is not supported.' } },
            { category: 'Service Worker', name: 'Registration Status', checkFn: async () => {
                if (!('serviceWorker' in navigator)) return { status: 'fail' as CheckStatus, detail: 'Browser does not support Service Workers.' };
                const registration = await navigator.serviceWorker.getRegistration();
                return registration ? { status: 'pass' as CheckStatus, detail: `Service Worker registered with scope: ${registration.scope}` } : { status: 'warn' as CheckStatus, detail: 'No active Service Worker registration found.' };
            }},
            { category: 'Service Worker', name: 'Page Control', checkFn: async () => navigator.serviceWorker.controller ? { status: 'pass' as CheckStatus, detail: 'Page is currently controlled by a Service Worker.' } : { status: 'warn' as CheckStatus, detail: 'Page is not controlled by a Service Worker (may happen on first load).' } },
            
            // Data & Storage
            { category: 'Data & Storage', name: 'Storage Mode', checkFn: async () => ({ status: 'info' as CheckStatus, detail: `App is running in ${IS_LIVE_DATA ? 'LIVE (Firebase/API)' : 'MOCK'} data mode.` }) },
            { category: 'Data & Storage', name: 'Firebase SDK Initialization', checkFn: async () => !USE_FIREBASE ? {status: 'info' as CheckStatus, detail: 'Firebase is disabled (VITE_USE_FIREBASE=false).'} : firebaseInitializationError ? { status: 'fail' as CheckStatus, detail: `Firebase SDK failed to initialize: ${firebaseInitializationError.message}` } : { status: 'pass' as CheckStatus, detail: 'Firebase SDK initialized successfully.' } },
            { category: 'Data & Storage', name: 'Firebase Config', checkFn: async () => !USE_FIREBASE ? {status: 'info'as CheckStatus, detail: 'Firebase is disabled.'} : isFirebaseConfigured() ? { status: 'pass' as CheckStatus, detail: 'All required Firebase environment variables are set.' } : { status: 'fail' as CheckStatus, detail: 'One or more VITE_FIREBASE_* environment variables are missing.' } },
            { category: 'Data & Storage', name: 'Firestore Connectivity', checkFn: async () => !IS_LIVE_DATA ? { status: 'pass' as CheckStatus, detail: 'Skipped (mock data mode).' } : !db ? {status: 'fail' as CheckStatus, detail: 'DB object not initialized.'} : db.collection('settings').doc('companyDetails').get().then(() => ({ status: 'pass' as CheckStatus, detail: 'Successfully connected to Firestore.' })).catch(e => ({ status: 'fail' as CheckStatus, detail: `Firestore connection failed: ${e.message}` })) },
            { category: 'Data & Storage', name: 'Firestore Read/Write Test', checkFn: async () => {
                if (!IS_LIVE_DATA || !db) return { status: 'pass', detail: 'Skipped (mock data mode).' };
                const testDocRef = db.collection('_system_health_check').doc(`test_${Date.now()}`);
                try {
                    await testDocRef.set({ status: 'written', timestamp: new Date() });
                    const doc = await testDocRef.get();
                    if (!doc.exists || doc.data()?.status !== 'written') throw new Error('Read verification failed.');
                    await testDocRef.update({ status: 'updated' });
                    const updatedDoc = await testDocRef.get();
                    if (updatedDoc.data()?.status !== 'updated') throw new Error('Update verification failed.');
                    await testDocRef.delete();
                    const deletedDoc = await testDocRef.get();
                    if (deletedDoc.exists) throw new Error('Delete verification failed.');
                    return { status: 'pass', detail: 'Firestore CRUD operations (write, read, update, delete) successful.' };
                } catch (e) {
                    return { status: 'fail', detail: `Firestore R/W test failed: ${(e as Error).message}` };
                } finally {
                    try { await testDocRef.delete(); } catch (_) {}
                }
            }},
            { category: 'Data & Storage', name: 'API Server Health', checkFn: async () => !companyDetails.apiServerUrl ? { status: 'info' as CheckStatus, detail: 'API Server URL not configured.' } : checkUrl(`${companyDetails.apiServerUrl}/health`) },
            { category: 'Data & Storage', name: 'Browser LocalStorage', checkFn: async () => {
                try {
                    const testKey = '_health_check';
                    localStorage.setItem(testKey, 'ok');
                    const result = localStorage.getItem(testKey);
                    localStorage.removeItem(testKey);
                    if (result === 'ok') return { status: 'pass', detail: 'LocalStorage is writable and readable.' };
                    throw new Error('Read/write verification failed.');
                } catch (e) {
                    return { status: 'fail', detail: `LocalStorage access failed: ${(e as Error).message}` };
                }
            }},
            { category: 'Data & Storage', name: 'Browser IndexedDB', checkFn: async () => {
                return new Promise(resolve => {
                    if (!('indexedDB' in window)) {
                        resolve({ status: 'fail', detail: 'IndexedDB is not supported by this browser.' });
                        return;
                    }
                    try {
                        const request = indexedDB.open('_health_check_db');
                        request.onupgradeneeded = () => { try { request.result.createObjectStore('test'); } catch(e) {} };
                        request.onsuccess = () => {
                            request.result.close();
                            indexedDB.deleteDatabase('_health_check_db');
                            resolve({ status: 'pass', detail: 'IndexedDB is available and operational.' });
                        };
                        request.onerror = () => resolve({ status: 'fail', detail: `IndexedDB access failed: ${request.error?.message}` });
                    } catch(e) {
                        resolve({ status: 'fail', detail: `IndexedDB access failed: ${(e as Error).message}` });
                    }
                });
            }},

            // Configuration
            { category: 'Configuration', name: 'Company Details Loaded', checkFn: async () => companyDetails?.name ? { status: 'pass' as CheckStatus, detail: `Loaded: ${companyDetails.name}` } : { status: 'fail' as CheckStatus, detail: 'Company details are missing.' } },
            { category: 'Configuration', name: 'Creator Details Loaded', checkFn: async () => creatorDetails?.name ? { status: 'pass' as CheckStatus, detail: `Loaded: ${creatorDetails.name}` } : { status: 'warn' as CheckStatus, detail: 'Creator details are missing.' } },
            { category: 'Configuration', name: 'Ranks Loaded', checkFn: async () => ranks.length > 0 ? { status: 'pass' as CheckStatus, detail: `${ranks.length} ranks loaded.` } : { status: 'fail' as CheckStatus, detail: 'No ranks found.' } },
            { category: 'Configuration', name: 'Gamification Rules Loaded', checkFn: async () => gamificationSettings.length > 0 ? { status: 'pass' as CheckStatus, detail: `${gamificationSettings.length} rules loaded.` } : { status: 'fail' as CheckStatus, detail: 'No gamification rules found.' } },
            { category: 'Configuration', name: 'Fixed Event Rules Content', checkFn: async () => companyDetails?.fixedEventRules && companyDetails.fixedEventRules.length > 50 ? { status: 'pass' as CheckStatus, detail: 'Event rules content is present.' } : { status: 'warn' as CheckStatus, detail: 'Fixed Event Rules content is missing or very short.' } },

            // Content & Media
            { category: 'Content & Media', name: 'Company Logo URL', checkFn: () => checkUrl(companyDetails.logoUrl) },
            { category: 'Content & Media', name: 'Creator Logo URL', checkFn: () => checkUrl(creatorDetails.logoUrl) },
            { category: 'Content & Media', name: 'Login Screen Background', checkFn: () => checkUrl(companyDetails.loginBackgroundUrl) },
            { category: 'Content & Media', name: 'Login Screen Audio', checkFn: () => checkUrl(companyDetails.loginAudioUrl) },
            { category: 'Content & Media', name: 'Player Avatars (Sample)', checkFn: () => players.length > 0 ? checkUrl(players[0]?.avatarUrl) : {status: 'info', detail: 'No players to check.'} },
            { category: 'Content & Media', name: 'Event Images (Sample)', checkFn: () => { const eventWithImage = events.find(e => e.imageUrl); return eventWithImage ? checkUrl(eventWithImage.imageUrl) : { status: 'info' as CheckStatus, detail: 'No events with images to check.' }; } },
            { category: 'Content & Media', name: 'Carousel Media URLs', checkFn: async () => { for (const media of carouselMedia) { const res = await checkUrl(media.url); if (res.status === 'fail') return { status: 'fail', detail: `Carousel item failed: ${media.url}`}; } return { status: 'pass' as CheckStatus, detail: 'All carousel media URLs are valid.' }; } },
            { category: 'Content & Media', name: 'Social Link Icons', checkFn: async () => { for (const link of socialLinks) { const res = await checkUrl(link.iconUrl); if (res.status === 'fail') return { status: 'fail', detail: `Icon for "${link.name}" failed: ${link.iconUrl}`}; } return { status: 'pass' as CheckStatus, detail: 'All social link icons are valid.' }; } },
            { category: 'Content & Media', name: 'Sponsor Logos', checkFn: async () => { for (const sponsor of sponsors) { const res = await checkUrl(sponsor.logoUrl); if (res.status === 'fail') return { status: 'fail', detail: `Logo for "${sponsor.name}" failed: ${sponsor.logoUrl}`}; } return { status: 'pass' as CheckStatus, detail: 'All sponsor logos are valid.' }; } },
        ];

        const tempResults: Record<string, ResultCategory> = {};

        for (const { category, name, checkFn } of checks) {
            const result = await checkFn();

            if (!tempResults[category]) {
                tempResults[category] = { title: category, checks: [] };
            }
            // FIX: Add a type assertion to `result` to fix property 'status' does not exist on type '{}' error
            const typedResult = result as { status: CheckStatus; detail: string };
            tempResults[category].checks.push({ text: name, ...typedResult });
        }
        
        setResults(tempResults);
        setLastScanTime(new Date());

        // FIX: Explicitly type `cat` as ResultCategory to resolve error "Property 'checks' does not exist on type 'unknown'".
        const allChecks = Object.values(tempResults).flatMap((cat: ResultCategory) => cat.checks);
        const fails = allChecks.filter(c => c.status === 'fail').length;
        const warns = allChecks.filter(c => c.status === 'warn').length;

        if (fails > 0) {
            setOverallStatus('critical');
        } else if (warns > 0) {
            setOverallStatus('degraded');
        } else {
            setOverallStatus('operational');
        }

        // Auto-expand categories with issues on first scan or if new issues appear
        const categoriesWithIssues = Object.entries(tempResults).reduce((acc, [key, category]: [string, ResultCategory]) => {
            if (category.checks.some(c => c.status === 'fail' || c.status === 'warn')) {
                acc[key] = true;
            }
            return acc;
        }, {} as Record<string, boolean>);
        setOpenCategories(prev => ({ ...prev, ...categoriesWithIssues }));

    }, [dataContext]);

    useEffect(() => {
        runScan(); // Initial scan
        const intervalId = setInterval(runScan, 60000); // Scan every 60 seconds
        return () => clearInterval(intervalId); // Cleanup
    }, [runScan]);

    const StatusIcon = ({ status }: { status: CheckStatus }) => {
        switch (status) {
            case 'pass': return <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />;
            case 'fail': return <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />;
            case 'warn': return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
            case 'info': return <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />;
            default: return null;
        }
    };

    const statusInfo: Record<OverallStatus, { text: string; color: string; bgColor: string }> = {
        pending: { text: 'Initializing Scan...', color: 'text-gray-400', bgColor: 'bg-gray-500' },
        operational: { text: 'All Systems Operational', color: 'text-green-400', bgColor: 'bg-green-500' },
        degraded: { text: 'Degraded Performance', color: 'text-yellow-400', bgColor: 'bg-yellow-500' },
        critical: { text: 'Critical Errors Detected', color: 'text-red-400', bgColor: 'bg-red-500' },
    };

    const currentStatus = statusInfo[overallStatus];

    return (
        <DashboardCard title="Live System Monitor" icon={<CodeBracketIcon className="w-6 h-6" />}>
            <div className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 p-3 bg-zinc-950/50 rounded-lg border border-zinc-700/50">
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                            <span className={`absolute inline-flex h-3 w-3 rounded-full ${currentStatus.bgColor} opacity-75 animate-ping`}></span>
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${currentStatus.bgColor}`}></span>
                        </div>
                        <h4 className={`text-lg font-bold ${currentStatus.color}`}>{currentStatus.text}</h4>
                    </div>
                    <p className="text-xs text-gray-500">
                        Last check: {lastScanTime ? lastScanTime.toLocaleTimeString() : 'Pending...'}
                    </p>
                </div>
                
                {overallStatus === 'pending' ? (
                     <div className="text-center p-8">
                        <CogIcon className="w-12 h-12 text-gray-500 mx-auto animate-spin"/>
                        <p className="mt-2 text-gray-400">Running initial system diagnostics...</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {/* FIX: Explicitly type `category` to resolve errors on accessing its properties like 'title' and 'checks'. */}
                        {Object.entries(results).map(([key, category]: [string, ResultCategory]) => {
                            const hasFail = category.checks.some(c => c.status === 'fail');
                            const hasWarn = category.checks.some(c => c.status === 'warn');
                            const categoryStatus: CheckStatus = hasFail ? 'fail' : hasWarn ? 'warn' : 'pass';
                            const isOpen = openCategories[key] ?? false;

                            return (
                                <div key={key} className="bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                                    <button
                                        className="w-full flex items-center justify-between p-3 text-left"
                                        onClick={() => setOpenCategories(prev => ({ ...prev, [key]: !isOpen }))}
                                        aria-expanded={isOpen}
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
                )}
            </div>
        </DashboardCard>
    );
};