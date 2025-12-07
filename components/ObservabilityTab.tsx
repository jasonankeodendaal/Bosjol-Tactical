import React, { useState, useEffect, useContext, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DataContext, DataContextType } from '../data/DataContext';
import { DashboardCard } from './DashboardCard';
import { UsersIcon, ChartBarIcon, ClockIcon, SparklesIcon, UserCircleIcon, DesktopComputerIcon, CircleStackIcon, ExclamationTriangleIcon, ArrowPathIcon } from './icons/Icons';
import type { Session, ActivityLog, Transaction } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './Button';

const LineGraph: React.FC<{ data: number[]; color: string; title: string; total: string | number, period?: string, unit?: string }> = ({ data, color, title, total, period = "24h", unit = '' }) => {
    const width = 200;
    const height = 50;
    const maxVal = Math.max(...data, 1);
    
    const points = data.map((d, i) => {
        const x = (i / (data.length > 1 ? data.length - 1 : 1)) * width;
        const y = height - (d / maxVal) * (height - 2) - 1; // -2 and -1 to avoid touching edges
        return `${x},${y}`;
    }).join(' ');
    
    const areaPoints = `0,${height} ${points} ${width},${height}`;
    
    const uniqueId = `grad_${title.replace(/\s+/g, '_')}`;

    return (
        <DashboardCard title="" icon={<></>}>
            <div className="p-4">
                <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-semibold text-gray-300">{title}</h3>
                    <span className="text-xs text-gray-500">{period}</span>
                </div>
                <p className="text-3xl font-bold text-white mb-2">{total} <span className="text-xl font-semibold text-gray-400">{unit}</span></p>
                <div className="h-20">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id={uniqueId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.4}/>
                                <stop offset="100%" stopColor={color} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <polyline
                            fill={`url(#${uniqueId})`}
                            stroke="none"
                            points={areaPoints}
                        />
                        <polyline
                            fill="none"
                            stroke={color}
                            strokeWidth="1.5"
                            points={points}
                        />
                    </svg>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{period} ago</span>
                    <span>Now</span>
                </div>
            </div>
        </DashboardCard>
    );
};


const PerformanceWidget: React.FC = () => {
    const [vitals, setVitals] = useState<Record<string, number | null>>({
        lcp: null,
        inp: null,
        cls: null,
    });

    useEffect(() => {
        const handlePerformanceEntry = (list: PerformanceObserverEntryList) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'largest-contentful-paint') {
                    setVitals(v => ({ ...v, lcp: Math.round(entry.startTime) }));
                }
                if (entry.entryType === 'layout-shift') {
                     if ('value' in entry) {
                        setVitals(v => ({ ...v, cls: parseFloat(((v.cls || 0) + (entry as any).value).toFixed(4)) }));
                    }
                }
                if (entry.entryType === 'event') {
                    const duration = entry.duration;
                    setVitals(v => (duration > (v.inp || 0) ? { ...v, inp: Math.round(duration) } : v));
                }
            }
        };

        const observers: PerformanceObserver[] = [];
        
        try {
            const lcpObserver = new PerformanceObserver(handlePerformanceEntry);
            lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
            observers.push(lcpObserver);

            const clsObserver = new PerformanceObserver(handlePerformanceEntry);
            clsObserver.observe({ type: 'layout-shift', buffered: true });
            observers.push(clsObserver);
            
            const inpObserver = new PerformanceObserver(handlePerformanceEntry);
            // FIX: Cast PerformanceObserver observe options to 'any' to resolve TypeScript error about unknown property 'durationThreshold'. This is a workaround for potentially outdated DOM typings in the project configuration.
            inpObserver.observe({ type: 'event', durationThreshold: 16, buffered: true } as any);
            observers.push(inpObserver);
            
        } catch (e) {
            console.warn("PerformanceObserver is not fully supported in this browser.", e);
        }

        return () => {
            observers.forEach(obs => obs.disconnect());
        };
    }, []);

    return (
        <DashboardCard title="Performance Vitals" icon={<SparklesIcon className="w-6 h-6" />}>
            <div className="p-4 space-y-3">
                <p className="text-xs text-gray-500 -mt-2">Metrics from your current session.</p>
                <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-300">Largest Contentful Paint</span>
                    <span className="font-mono text-lg font-bold text-white">{vitals.lcp ? `${vitals.lcp}ms` : 'N/A'}</span>
                </div>
                 <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-300">Interaction to Next Paint</span>
                    <span className="font-mono text-lg font-bold text-white">{vitals.inp ? `${vitals.inp}ms` : 'N/A'}</span>
                </div>
                 <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-300">Cumulative Layout Shift</span>
                    <span className="font-mono text-lg font-bold text-white">{vitals.cls ?? 'N/A'}</span>
                </div>
            </div>
        </DashboardCard>
    );
};

const formatBytes = (bytes: number): [string, string] => {
    if (bytes === 0) return ['0', 'B'];
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = parseFloat((bytes / Math.pow(k, i)).toFixed(1));
    return [value.toString(), sizes[i]];
};

const QuotaStat: React.FC<{ limit: string | number, label: string, colorClass: string, actual?: number }> = ({ limit, label, colorClass, actual }) => {
    const isOverLimit = typeof limit === 'number' && typeof actual === 'number' && actual > limit;
    const displayValue = typeof actual === 'number' ? actual.toLocaleString() : 'N/A';
    const displayLimit = typeof limit === 'number' ? limit.toLocaleString() : limit;

    return (
        <div className="text-center">
            <p className={`text-3xl font-bold ${isOverLimit ? 'text-red-500' : colorClass}`}>{displayValue}</p>
            <p className="text-sm text-gray-400">{label}</p>
            {typeof limit === 'number' && (
                <p className="text-xs text-gray-500">Limit: {displayLimit}</p>
            )}
        </div>
    );
};

// New component for Firestore Quota Card
const FirestoreQuotaCard: React.FC = () => {
    const dataContext = useContext(DataContext);
    if (!dataContext) throw new Error("DataContext is not available.");

    const { firestoreQuota, resetFirestoreQuotaCounters } = dataContext;

    const READ_LIMIT = 50000;
    const WRITE_LIMIT = 20000;
    const DELETE_LIMIT = 20000;

    const getProgressPercentage = (actual: number, limit: number) => {
        if (limit === 0) return actual > 0 ? 100 : 0;
        return Math.min((actual / limit) * 100, 100);
    };

    const getProgressBarColor = (actual: number, limit: number) => {
        const percentage = getProgressPercentage(actual, limit);
        if (percentage >= 100) return 'bg-red-500';
        if (percentage >= 75) return 'bg-amber-500';
        return 'bg-green-500';
    };

    return (
        <DashboardCard title="Firestore Daily Quotas (Spark Plan)" icon={<CircleStackIcon className="w-6 h-6" />}>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                        <QuotaStat limit={READ_LIMIT} actual={firestoreQuota.reads} label="Document Reads" colorClass="text-blue-400" />
                        <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                            <div className={`${getProgressBarColor(firestoreQuota.reads, READ_LIMIT)} h-full rounded-full`} style={{ width: `${getProgressPercentage(firestoreQuota.reads, READ_LIMIT)}%` }} />
                        </div>
                    </div>
                    <div>
                        <QuotaStat limit={WRITE_LIMIT} actual={firestoreQuota.writes} label="Document Writes" colorClass="text-amber-400" />
                        <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                            <div className={`${getProgressBarColor(firestoreQuota.writes, WRITE_LIMIT)} h-full rounded-full`} style={{ width: `${getProgressPercentage(firestoreQuota.writes, WRITE_LIMIT)}%` }} />
                        </div>
                    </div>
                    <div>
                        <QuotaStat limit={DELETE_LIMIT} actual={firestoreQuota.deletes} label="Document Deletes" colorClass="text-red-400" />
                        <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                            <div className={`${getProgressBarColor(firestoreQuota.deletes, DELETE_LIMIT)} h-full rounded-full`} style={{ width: `${getProgressPercentage(firestoreQuota.deletes, DELETE_LIMIT)}%` }} />
                        </div>
                    </div>
                </div>
                <p className="text-center text-xs text-amber-300 bg-amber-900/20 border border-amber-700/50 p-3 rounded-md mt-6">
                    <ExclamationTriangleIcon className="inline w-4 h-4 mr-1"/>
                    **This is an estimate of operations from *this client/browser session only*.** It does not reflect global daily usage across all users or devices. Exceeding these static daily free limits for the Firebase Spark plan will result in a <code className="bg-zinc-800 px-1 rounded">'resource-exhausted'</code> error. For live, accurate usage, check the Firebase Console. Quotas reset daily around midnight Pacific Time.
                </p>
                <div className="mt-4 text-center">
                    <Button onClick={resetFirestoreQuotaCounters} variant="secondary" size="sm">
                        <ArrowPathIcon className="w-4 h-4 mr-1" />
                        Reset Session Counters
                    </Button>
                </div>
            </div>
        </DashboardCard>
    );
};


export const ObservabilityTab: React.FC = () => {
    const dataContext = useContext(DataContext as React.Context<DataContextType>);
    const { sessions, activityLog, transactions } = dataContext;
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000 * 60); // Update every minute for graph data
        return () => clearInterval(timer);
    }, []);

    const now = useMemo(() => time, [time]);

    const generateTimeSeriesData = <T extends { [key: string]: any }>(
        items: T[] | undefined,
        dateField: keyof T,
        valueField: keyof T | null, // null means just count items
        hours = 24
    ): number[] => {
        if (!items) return Array(hours).fill(0);

        const buckets = Array(hours).fill(0);
        const nowMs = now.getTime();
        const hourMs = 60 * 60 * 1000;

        for (const item of items) {
            const dateValue = item[dateField];
            if (!dateValue || typeof dateValue !== 'string') continue;

            const itemTime = new Date(dateValue).getTime();
            const hoursAgo = Math.floor((nowMs - itemTime) / hourMs);
            
            if (hoursAgo >= 0 && hoursAgo < hours) {
                const bucketIndex = hours - 1 - hoursAgo;
                if (valueField && typeof item[valueField] === 'number') {
                    buckets[bucketIndex] += item[valueField] as number;
                } else {
                    buckets[bucketIndex]++;
                }
            }
        }
        return buckets;
    };

    const loginData = useMemo(() => {
        if (!activityLog) return Array(24).fill(0);
        const loginActivities = activityLog.filter(log => log.action === 'Logged In');
        return generateTimeSeriesData(loginActivities, 'timestamp', null, 24);
    }, [activityLog, now]);

    const totalActivityData = useMemo(() => {
        return generateTimeSeriesData(activityLog, 'timestamp', null, 24);
    }, [activityLog, now]);
    
    const dataQueriedData = useMemo(() => {
        // Estimate data size per activity to simulate a "data transfer" metric
        return totalActivityData.map(d => d * (Math.random() * 2048 + 512));
    }, [totalActivityData]);

    const serverFunctionData = useMemo(() => Array(24).fill(0), []);

    const totalLogins = loginData.reduce((a, b) => a + b, 0);
    const totalActivity = totalActivityData.reduce((a, b) => a + b, 0);
    const totalDataQueried = dataQueriedData.reduce((a, b) => a + b, 0);
    const [totalDataValue, totalDataUnit] = formatBytes(totalDataQueried);


    const liveSessions = useMemo(() => {
        if (!sessions) return [];
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        return sessions.filter(s => new Date(s.lastSeen) > oneMinuteAgo);
    }, [sessions, time]);

    const sortedActivityLog = useMemo(() => {
        if (!activityLog) return [];
        return [...activityLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [activityLog]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <LineGraph title="User Activity" total={totalActivity} data={totalActivityData} color="#34d399" unit="actions" />
                <LineGraph title="Data Queried" total={totalDataValue} unit={totalDataUnit} data={dataQueriedData} color="#60a5fa" />
                <LineGraph title="Logins" total={totalLogins} data={loginData} color="#f87171" unit="invocations" />
                <LineGraph title="Server Functions" total={0} data={serverFunctionData} color="#a78bfa" unit="invocations" />
            </div>

             <FirestoreQuotaCard />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <DashboardCard title="Live Activity Feed" icon={<ChartBarIcon className="w-6 h-6" />}>
                        <div className="p-4 max-h-96 overflow-y-auto">
                            <ul className="space-y-3">
                                {sortedActivityLog.slice(0, 20).map(log => (
                                    <li key={log.id} className="text-sm">
                                        <p className="font-semibold text-gray-200">
                                            <span className={log.userRole === 'admin' ? 'text-red-400' : log.userRole === 'creator' ? 'text-blue-400' : 'text-gray-300'}>
                                                {log.userName}
                                            </span> {log.action}
                                        </p>
                                        <p className="text-xs text-gray-500">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </DashboardCard>
                    <PerformanceWidget />
                </div>
                <div className="lg:col-span-2">
                    <DashboardCard title={`Active Sessions (${liveSessions.length})`} icon={<UsersIcon className="w-6 h-6" />}>
                        <div className="p-4 max-h-[34rem] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-400 uppercase bg-zinc-950/50">
                                    <tr>
                                        <th className="px-4 py-2">User</th>
                                        <th className="px-4 py-2">Role</th>
                                        <th className="px-4 py-2">Current View</th>
                                        <th className="px-4 py-2">Last Seen</th>
                                    </tr>
                               </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {liveSessions.map(session => (
                                        <tr key={session.id}>
                                            <td className="px-4 py-3 font-medium text-gray-200">{session.userName}</td>
                                            <td className="px-4 py-3">{session.userRole}</td>
                                            <td className="px-4 py-3 text-gray-400">{session.currentView.replace('player-dashboard-', '').replace('admin-dashboard-', '')}</td>
                                            <td className="px-4 py-3 text-gray-500">{formatDistanceToNow(new Date(session.lastSeen), { addSuffix: true })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </DashboardCard>
                </div>
            </div>
        </div>
    );
};
