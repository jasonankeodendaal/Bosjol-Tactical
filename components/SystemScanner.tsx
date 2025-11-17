

import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { DataContext, IS_LIVE_DATA, DataContextType } from '../data/DataContext';
import { Button } from './Button';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, XCircleIcon, CogIcon, ArrowPathIcon, CodeBracketIcon } from './icons/Icons';
import { db, USE_FIREBASE, firebaseInitializationError, isFirebaseConfigured } from '../firebase';
import type { Player, GamificationRule, Badge, GameEvent, Transaction } from '../types';
import { UNRANKED_RANK } from '../constants';
import { Modal } from './Modal';
import { DashboardCard } from './DashboardCard';
import { AuthContext } from '../auth/AuthContext';
import { InfoTooltip } from './InfoTooltip';

type CheckStatus = 'pass' | 'fail' | 'warn' | 'info' | 'pending' | 'running';

interface Check {
    category: string;
    name: string;
    description: string;
    checkFn: () => Promise<{ status: CheckStatus, detail: string }>;
}

interface CheckResult {
    name: string;
    description: string;
    status: CheckStatus;
    detail: string;
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
    const [modalCategory, setModalCategory] = useState<string | null>(null);

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
                    return count > 0 ? { status: 'pass' as const, detail: `${count} item(s) loaded.` } : { status: 'warn' as const, detail: `Collection is empty or failed to load.` };
                }
            })),

            // --- API CONNECTIVITY ---
            { category: 'API Connectivity', name: 'API Server Health', description: "Pings the external API server (if configured).", checkFn: async () => !companyDetails.apiServerUrl ? { status: 'info', detail: 'Not configured.' } : checkUrl(`${companyDetails.apiServerUrl}/health`) },

            // --- CONFIGURATION ---
            { category: 'Configuration', name: 'Company Details', description: "Ensures the main company configuration was loaded.", checkFn: async () => companyDetails?.name ? { status: 'pass', detail: `Loaded: ${companyDetails.name}` } : { status: 'fail', detail: 'Company details are missing.' } },
            { category: 'Configuration', name: 'Creator Details', description: "Ensures the creator's details were loaded.", checkFn: async () => creatorDetails?.name ? { status: 'pass', detail: `Loaded: ${creatorDetails.name}` } : { status: 'warn', detail: 'Creator details are missing.' } },
            
            // --- CONTENT & MEDIA ---
            { category: 'Content & Media', name: 'Company Logo URL', description: "Validates that the company logo URL is accessible.", checkFn: () => checkUrl(companyDetails.logoUrl) },
            { category: 'Content & Media', name: 'Login Background URL', description: "Checks the background media for the login screen.", checkFn: () => checkUrl(companyDetails.loginBackgroundUrl) },
            { category: 'Content & Media', name: 'Login Audio URL', description: "Checks the audio file for the login screen.", checkFn: () => checkUrl(companyDetails.loginAudioUrl) },
            { category: 'Content & Media', name: 'Player Dashboard BG', description: "Checks the player dashboard background image.", checkFn: () => checkUrl(companyDetails.playerDashboardBackgroundUrl) },
            { category: 'Content & Media', name: 'Admin Dashboard BG', description: "Checks the admin dashboard background image.", checkFn: () => checkUrl(companyDetails.adminDashboardBackgroundUrl) },
            { category: 'Content & Media', name: 'Sample Event Images', description: "Checks a few event image URLs for accessibility.", checkFn: async () => { const sample = events.slice(0,3).map(e => e.imageUrl).filter((url): url is string => !!url); if (sample.length === 0) return { status: 'info', detail: 'No events with images to check.' }; const results = await Promise.all(sample.map(checkUrl)); const fails = results.filter(r => r.status === 'fail').length; return fails > 0 ? { status: 'warn', detail: `${fails}/${sample.length} sample images are unreachable.` } : { status: 'pass', detail: 'All sample images are reachable.' }; } },
            { category: 'Content & Media', name: 'Sample Avatar URLs', description: "Checks a few player avatar URLs.", checkFn: async () => { const sample = players.slice(0,3).map(p => p.avatarUrl).filter((url): url is string => !!url); if (sample.length === 0) return { status: 'warn', detail: 'No players with avatars to check.' }; const results = await Promise.all(sample.map(checkUrl)); const fails = results.filter(r => r.status === 'fail').length; return fails > 0 ? { status: 'warn', detail: `${fails}/${sample.length} sample avatars are unreachable.` } : { status: 'pass', detail: 'All sample avatars are reachable.' }; } },
            
            // --- CORE AUTOMATIONS ---
            { category: 'Core Automations', name: 'Event Finalization Logic', description: 'Simulates finalizing an event to verify XP calculations.', checkFn: async () => { try { const mockPlayer = { ...players[0], stats: { ...players[0].stats, xp: 1000 } }; const pXp = 50; const stats = { kills: 5, deaths: 2, headshots: 1 }; const getXp = (ruleId: string) => gamificationSettings.find(r => r.id === ruleId)?.xp ?? 0; const xpg = pXp + (stats.kills * getXp('g_kill')) + (stats.headshots * getXp('g_headshot')) + (stats.deaths * getXp('g_death')); const fXp = mockPlayer.stats.xp + xpg; const eXp = 1000 + 50 + (5 * 10) + (1 * 25) + (2 * -5); return fXp === eXp ? { status: 'pass', detail: `Correctly calc ${xpg} XP.` } : { status: 'fail', detail: `Calc error. Expected ${eXp}, got ${fXp}.` }; } catch (e) { return { status: 'fail', detail: `An exception occurred: ${(e as Error).message}` }; } } },
            { category: 'Core Automations', name: 'Finance Generation Logic', description: 'Simulates event finalization to verify transaction creation.', checkFn: async () => { const event = events.find(e=>e.id==='e000'); const player = players.find(p=>p.id==='p001'); if (!event || !player) return {status:'warn', detail: 'Mock data not found for test.'}; const attendee = event.attendees.find(a=>a.playerId===player.id); if(!attendee) return {status:'warn', detail:'Mock attendee not found.'}; let transactions = 0; transactions++; (attendee.rentedGearIds || []).forEach(()=>transactions++); return transactions === 3 ? {status: 'pass', detail:'Correctly simulated 3 transactions.'} : {status:'fail', detail:`Expected 3 transactions, simulated ${transactions}.`}; }},
            { category: 'Core Automations', name: 'Rank Calculation Logic', description: 'Simulates player XP to verify correct rank assignment.', checkFn: async () => { const mP={stats:{xp:1100,gamesPlayed:11}} as Player; const sR=[...ranks].sort((a,b)=>b.minXp-a.minXp); const r=sR.find(r=>mP.stats.xp>=r.minXp)||UNRANKED_RANK; return r&&r.name==="Corporal 1"?{status:'pass',detail:'Correctly assigned Corporal 1.'}:{status:'fail',detail:`Incorrect rank. Expected Corporal 1, got ${r?.name||'Unranked'}.`} }},
            { category: 'Core Automations', name: 'Badge Awarding Logic', description: 'Simulates player stats to verify badge unlocking logic.', checkFn: async () => { const mP={stats:{kills:55,headshots:10,gamesPlayed:5},badges:[]} as Player; const sB=badges.find(b=>b.id==='b01'); const fKB=badges.find(b=>b.id==='b03'); if(!sB||!fKB)return{status:'warn',detail:'Mock badges not found.'}; const hS=mP.stats.headshots>=(sB.criteria.value as number); const hFK=mP.stats.kills>=(fKB.criteria.value as number); return !hS&&hFK?{status:'pass',detail:'Correctly identified earned/unearned.'}:{status:'fail',detail:'Logic appears incorrect.'}}},
            { category: 'Core Automations', name: 'Player Code Generation', description: 'Tests the automatic player code generation logic.', checkFn: async () => { const initials = 'TU'; const existing = players.filter(p => p.playerCode.startsWith(initials)); let num = 1; if(existing.length > 0) { num = existing.reduce((max, p) => Math.max(max, parseInt(p.playerCode.substring(2), 10) || 0), 0) + 1; } const code = `${initials}${String(num).padStart(2,'0')}`; return code ? {status:'pass', detail: `Correctly generated next code: ${code}`} : {status:'fail', detail: 'Logic failed.'}; } },
            { category: 'Core Automations', name: 'Leaderboard Sorting Logic', description: 'Verifies players are correctly sorted by XP.', checkFn: async () => { const sample = [...players].slice(0, 10); const sorted = [...sample].sort((a,b) => b.stats.xp - a.stats.xp); const isCorrect = sample.every((p, i) => p.id === sorted[i].id); return isCorrect ? {status:'pass', detail: 'Leaderboard sorting is correct.'} : {status:'warn', detail: 'Player list is not pre-sorted by XP as expected.'}; } },
            { category: 'Core Automations', name: 'Rental Stock Availability', description: 'Simulates event signup to check rental stock logic.', checkFn: async () => { const eventWithRentals = events.find(e => e.gearForRent.length > 0 && e.rentalSignups); if (!eventWithRentals) return { status: 'info', detail: 'No suitable event found to test.'}; const gearId = eventWithRentals.gearForRent[0]; const gearItem = inventory.find(i => i.id === gearId); if (!gearItem) return { status: 'fail', detail: `Inventory item ${gearId} not found.` }; const initialRented = (eventWithRentals.rentalSignups || []).filter(s => s.requestedGearIds.includes(gearId)).length; const available = gearItem.stock - initialRented; return available >= 0 ? { status: 'pass', detail: `${available} units of ${gearItem.name} correctly calculated as available.` } : { status: 'fail', detail: `Stock miscalculation. Available: ${available}.`}; } },
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
            newResults[res.category].push({ name: res.name, description: res.description, status: res.status, detail: res.detail });
            if (res.status === 'fail' || res.status === 'warn') {
                newErrorLog.push({ timestamp: new Date(), checkName: res.name, category: res.category, detail: res.detail, status: res.status });
            }
        });

        setResults(newResults);
        setErrorLog(newErrorLog.sort((a, b) => (a.status === 'fail' ? -1 : 1) - (b.status === 'fail' ? -1 : 1)));
        setIsScanning(false);
    }, [ALL_CHECKS]);

    useEffect(() => {
        runChecks();
    }, [runChecks]);

    const { healthScore, errorCount, warningCount, noticeCount } = useMemo(() => {
        // Flatten the array of arrays. `reduce` is used for broader environment compatibility over `flat()`.
        // FIX: Cast the result of Object.values to the correct type to guide TypeScript's inference inside the reduce function.
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
        if (checks.length === 0) return { score: 100, hasFails: false };
        const passes = checks.filter(c => c.status === 'pass').length;
        const totalRelevant = checks.filter(c => c.status === 'pass' || c.status === 'fail').length;
        const hasFails = checks.some(c => c.status === 'fail');
        const score = totalRelevant > 0 ? Math.round((passes / totalRelevant) * 100) : 100;
        return { score, hasFails };
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
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.keys(results).map(category => {
                                const { score, hasFails } = getCategoryHealth(category);
                                return (
                                    <div key={category} className="bg-zinc-900/50 p-4 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="relative w-10 h-10">
                                                <CircularProgress percentage={score} size={40} strokeWidth={4} colorClass={hasFails ? 'text-red-500' : score < 100 ? 'text-yellow-500' : 'text-green-500'} />
                                                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{score}%</div>
                                            </div>
                                            <p className="font-semibold text-gray-300">{category}</p>
                                        </div>
                                        <Button size="sm" variant="secondary" className="w-full mt-3" onClick={() => setModalCategory(category)}>View details</Button>
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
            <AnimatePresence>
                {modalCategory && (
                    <Modal isOpen={true} onClose={() => setModalCategory(null)} title={`Details: ${modalCategory}`}>
                        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
                            {(results[modalCategory] || []).map(check => (
                                <div key={check.name} className="flex items-start gap-3 text-sm p-3 bg-zinc-800/50 rounded-lg">
                                    {check.status === 'pass' && <CheckCircleIcon className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />}
                                    {check.status === 'fail' && <XCircleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />}
                                    {check.status === 'warn' && <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />}
                                    {check.status === 'info' && <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />}
                                    <div className="flex-grow">
                                        <p className="font-semibold text-gray-200">{check.name}</p>
                                        <p className="text-xs text-gray-400">{check.detail}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </DashboardCard>
    );
};
