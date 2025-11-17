



import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { DataContext, IS_LIVE_DATA, DataContextType } from '../data/DataContext';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, CogIcon, ArrowPathIcon, CodeBracketIcon } from './icons/Icons';
import { db, USE_FIREBASE, firebaseInitializationError, isFirebaseConfigured } from '../firebase';
import type { Player, GamificationRule, Badge, GameEvent, Transaction } from '../types';
import { UNRANKED_RANK } from '../constants';
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

const checkUrl = async (url: string | undefined): Promise<{ status: 'pass' | 'fail' | 'warn', detail: string }> => {
    if (!url || typeof url !== 'string' || url.trim() === '') return { status: 'warn', detail: 'URL is not configured.' };
    if (url.startsWith('data:')) return { status: 'pass', detail: 'URL is a valid data URI.' };
    try {
        const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
        return { status: 'pass', detail: 'URL is reachable.' };
    } catch (error) {
        return { status: 'fail', detail: 'URL fetch failed, resource is unreachable.' };
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


export const SystemScanner: React.FC = () => {
    const dataContext = useContext(DataContext as React.Context<DataContextType>);
    const authContext = useContext(AuthContext);
    const [results, setResults] = useState<Record<string, CheckResult[]>>({});
    const [errorLog, setErrorLog] = useState<ErrorLogEntry[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

    const ALL_CHECKS = useCallback((): Check[] => {
        if (!dataContext) return [];
        const { players, companyDetails, ranks, badges, gamificationSettings, events, inventory, creatorDetails, socialLinks, carouselMedia } = dataContext;

        const collectionNames: (keyof DataContextType)[] = ['players', 'events', 'ranks', 'badges', 'legendaryBadges', 'gamificationSettings', 'sponsors', 'vouchers', 'inventory', 'suppliers', 'transactions', 'locations', 'raffles', 'socialLinks', 'carouselMedia'];

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
                name: `Collection: ${name} Loaded`,
                description: `Checks if the '${name}' data collection has been loaded.`,
                checkFn: async () => {
                    const data = dataContext[name];
                    const count = Array.isArray(data) ? data.length : (data ? 1 : 0);
                    return count > 0 ? { status: 'pass' as const, detail: `${count} item(s) loaded.` } : { status: 'warn' as const, detail: `Collection is empty or failed to load.`, fixable: true };
                }
            })),
            { category: 'Data & Storage', name: 'Orphaned Data Check', description: 'Checks for references to players that no longer exist.', checkFn: async () => { const playerIds = new Set(players.map(p => p.id)); const orphans: string[] = []; events.forEach(e => e.attendees.forEach(a => { if (!playerIds.has(a.playerId)) orphans.push(`event '${e.title}' attendee`); })); return orphans.length > 0 ? {status: 'warn', detail: `Found ${orphans.length} orphaned record(s).`} : {status: 'pass', detail: 'No orphaned data found.'}; }},

            // --- API CONNECTIVITY ---
            { category: 'API Connectivity', name: 'API Server Health', description: "Pings the external API server (if configured).", checkFn: async () => !companyDetails.apiServerUrl ? { status: 'info', detail: 'Not configured.' } : checkUrl(`${companyDetails.apiServerUrl}/health`) },

            // --- CONFIGURATION ---
            { category: 'Configuration', name: 'Company Details', description: "Ensures the main company configuration was loaded.", checkFn: async () => companyDetails?.name ? { status: 'pass', detail: `Loaded: ${companyDetails.name}` } : { status: 'fail', detail: 'Company details are missing.', fixable: true } },
            { category: 'Configuration', name: 'Creator Details', description: "Ensures the creator's details were loaded.", checkFn: async () => creatorDetails?.name ? { status: 'pass', detail: `Loaded: ${creatorDetails.name}` } : { status: 'warn', detail: 'Creator details are missing.', fixable: true } },
            
            // --- CONTENT & MEDIA ---
            { category: 'Content & Media', name: 'Company Logo URL', description: "Validates that the company logo URL is accessible.", checkFn: () => checkUrl(companyDetails.logoUrl) },
            { category: 'Content & Media', name: 'Login Background URL', description: "Checks the background media for the login screen.", checkFn: () => checkUrl(companyDetails.loginBackgroundUrl) },
            { category: 'Content & Media', name: 'Login Audio URL', description: "Checks the audio file for the login screen.", checkFn: () => checkUrl(companyDetails.loginAudioUrl) },
            { category: 'Content & Media', name: 'Player Dashboard BG', description: "Checks the player dashboard background image.", checkFn: () => checkUrl(companyDetails.playerDashboardBackgroundUrl) },
            { category: 'Content & Media', name: 'Admin Dashboard BG', description: "Checks the admin dashboard background image.", checkFn: () => checkUrl(companyDetails.adminDashboardBackgroundUrl) },
            
            // --- CORE AUTOMATIONS ---
            { category: 'Core Automations', name: 'Event Finalization Logic', description: 'Simulates finalizing an event to verify XP calculations.', checkFn: async () => { try { const mockPlayer = { ...players[0], stats: { ...players[0].stats, xp: 1000 } }; const pXp = 50; const stats = { kills: 5, deaths: 2, headshots: 1 }; const getXp = (ruleId: string) => gamificationSettings.find(r => r.id === ruleId)?.xp ?? 0; const xpg = pXp + (stats.kills * getXp('g_kill')) + (stats.headshots * getXp('g_headshot')) + (stats.deaths * getXp('g_death')); const fXp = mockPlayer.stats.xp + xpg; const eXp = 1000 + 50 + (5 * 10) + (1 * 25) + (2 * -5); return fXp === eXp ? { status: 'pass', detail: `Correctly calc ${xpg} XP.` } : { status: 'fail', detail: `Calc error. Expected ${eXp}, got ${fXp}.` }; } catch (e) { return { status: 'fail', detail: `An exception occurred: ${(e as Error).message}` }; } } },
            { category: 'Core Automations', name: 'Rank Calculation Logic', description: 'Simulates player XP to verify correct rank assignment.', checkFn: async () => { const mP={stats:{xp:1100,gamesPlayed:11}} as Player; const sR=[...ranks].sort((a,b)=>b.minXp-a.minXp); const r=sR.find(r=>mP.stats.xp>=r.minXp)||UNRANKED_RANK; return r&&r.name==="Corporal"?{status:'pass',detail:'Correctly assigned Corporal.'}:{status:'fail',detail:`Incorrect rank. Expected Corporal, got ${r?.name||'Unranked'}.`} }},
            { category: 'Core Automations', name: 'Rank Progression Gaps', description: 'Checks for large XP gaps between consecutive ranks.', checkFn: async () => { const sortedRanks = [...ranks].sort((a,b) => a.minXp - b.minXp); const gaps = []; for (let i=0; i < sortedRanks.length - 1; i++) { const gap = sortedRanks[i+1].minXp - sortedRanks[i].minXp; if (gap > 5000) gaps.push(`${sortedRanks[i].name} -> ${sortedRanks[i+1].name} (${gap} XP)`); } return gaps.length > 0 ? { status: 'warn', detail: `Large gaps found: ${gaps.join(', ')}` } : { status: 'pass', detail: 'No large XP gaps between ranks.' }; } },
        ];
    }, [dataContext, authContext]);

    const runChecks = useCallback(async () => {
        setIsScanning(true);
        setErrorLog([]);
        setResults({});
        const allChecks = ALL_CHECKS();

        const promises = allChecks.map(async (check) => {
            const result = await check.checkFn();
            return { ...check, ...result };
        });

        const allResults = await Promise.all(promises);

        const newResults: Record<string, CheckResult[]> = {};
        const newErrorLog: ErrorLogEntry[] = [];

        allResults.forEach(res => {
            if (!newResults[res.category]) newResults[res.category] = [];
            newResults[res.category].push({ name: res.name, description: res.description, status: res.status, detail: res.detail, fixable: res.fixable });
            if (res.status === 'fail' || res.status === 'warn') {
                newErrorLog.push({ timestamp: new Date(), checkName: res.name, category: res.category, detail: res.detail, status: res.status });
            }
        });

        setResults(newResults);
        setErrorLog(newErrorLog.sort((a, b) => (a.status === 'fail' ? -1 : 1) - (b.status === 'fail' ? -1 : 1)));
        setIsScanning(false);
    }, [ALL_CHECKS]);

    const handleFix = (check: CheckResult) => {
        if (!dataContext) return;
        const name = check.name;
        if (name === 'Company Details') dataContext.seedCollection('companyDetails');
        if (name === 'Creator Details') dataContext.seedCollection('creatorDetails');
        if (name.startsWith('Collection:')) {
            const collectionName = name.replace('Collection: ', '').replace(' Loaded', '').trim() as keyof DataContextType;
            dataContext.seedCollection(collectionName as any); // cast as any to bypass complex type issues
        }
        setTimeout(runChecks, 1000); // Re-run checks after attempting a fix
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
        <DashboardCard title="System Health Overview" icon={<CodeBracketIcon className="w-6 h-6" />} titleAddon={<Button size="sm" variant="secondary" onClick={runChecks} disabled={isScanning} className="!p-1.5"><ArrowPathIcon className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`}/></Button>}>
            <div className="p-6">
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

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8">
                        <h3 className="font-semibold text-gray-200 mb-3 text-lg">Thematic Reports</h3>
                        <div className="space-y-2">
                            {Object.keys(results).map(category => {
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
                                                        <div key={check.name} className="flex items-center gap-3 text-sm p-2 bg-zinc-800/50 rounded-md">
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
                        <h3 className="font-semibold text-gray-200 mb-3 text-lg">Top Issues</h3>
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
        </DashboardCard>
    );
};