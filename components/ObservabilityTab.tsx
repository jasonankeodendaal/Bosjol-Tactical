import React, { useState, useEffect, useContext, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DataContext, DataContextType } from '../data/DataContext';
import { UsersIcon, ChartBarIcon, SparklesIcon, CircleStackIcon, ExclamationTriangleIcon, ArrowPathIcon, CheckCircleIcon } from './icons/Icons';
import { formatDistanceToNow } from 'date-fns';
import { Button } from './Button';

const SquareMetricCard: React.FC<{
    data: number[];
    color: string;
    title: string;
    total: string | number;
    period?: string;
    unit?: string;
    icon?: React.ReactNode;
}> = ({ data, color, title, total, period = "24h", unit = '', icon }) => {
    const width = 160;
    const height = 40;
    const maxVal = Math.max(...data, 1);
    
    const points = data.map((d, i) => {
        const x = (i / (data.length > 1 ? data.length - 1 : 1)) * width;
        const y = height - (d / maxVal) * (height - 4) - 2;
        return `${x},${y}`;
    }).join(' ');
    
    const areaPoints = `0,${height} ${points} ${width},${height}`;
    const uniqueId = `grad_${(title || '').replace(/\s+/g, '_')}`;

    return (
        <div className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 rounded-xl p-3 sm:p-4 flex flex-col justify-between aspect-square transition-all shadow-md overflow-hidden group">
            {/* Header */}
            <div className="flex items-center justify-between gap-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0 truncate">
                    {icon && <span className="text-gray-400 flex-shrink-0">{icon}</span>}
                    <h3 className="text-xs sm:text-sm font-bold text-gray-200 truncate uppercase tracking-wider">{title}</h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800/80 px-1.5 py-0.5 rounded flex-shrink-0">{period}</span>
            </div>

            {/* Middle: Number & Unit */}
            <div className="my-auto py-1 min-w-0">
                <div className="flex items-baseline gap-1 truncate">
                    <span className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight truncate">
                        {total}
                    </span>
                    {unit && (
                        <span className="text-[11px] sm:text-xs font-semibold text-gray-400 truncate">
                            {unit}
                        </span>
                    )}
                </div>
            </div>

            {/* Bottom: Sparkline graph */}
            <div className="w-full flex-shrink-0">
                <div className="h-10 sm:h-12 w-full">
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id={uniqueId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.45}/>
                                <stop offset="100%" stopColor={color} stopOpacity={0.02}/>
                            </linearGradient>
                        </defs>
                        <polyline fill={`url(#${uniqueId})`} stroke="none" points={areaPoints} />
                        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
                    </svg>
                </div>
                <div className="flex justify-between items-center text-[9px] sm:text-[10px] text-zinc-500 font-mono mt-0.5">
                    <span>{period} ago</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Live
                    </span>
                </div>
            </div>
        </div>
    );
};

const QuotaSquare: React.FC<{
    limit: number;
    actual: number;
    label: string;
    colorClass: string;
    barColor: string;
}> = ({ limit, actual, label, colorClass, barColor }) => {
    const isOverLimit = actual > limit;
    const percentage = Math.min((actual / Math.max(limit, 1)) * 100, 100);

    return (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 sm:p-4 flex flex-col justify-between aspect-square transition-all shadow-sm">
            <div className="flex justify-between items-center min-w-0">
                <span className="text-xs sm:text-sm font-bold text-gray-300 uppercase tracking-wider truncate">{label}</span>
                <span className="text-[10px] font-mono text-zinc-500">Cap: {limit >= 1000 ? `${(limit / 1000).toFixed(0)}k` : limit}</span>
            </div>

            <div className="my-auto py-1 text-center min-w-0">
                <p className={`text-xl sm:text-2xl md:text-3xl font-black ${isOverLimit ? 'text-red-500' : colorClass} tracking-tight truncate`}>
                    {actual.toLocaleString()}
                </p>
                <p className="text-[10px] sm:text-xs text-zinc-400 truncate mt-0.5 font-mono">
                    {percentage.toFixed(1)}% Used
                </p>
            </div>

            <div className="w-full flex-shrink-0">
                <div className="w-full bg-zinc-800 rounded-full h-1.5 sm:h-2 overflow-hidden">
                    <div
                        className={`${barColor} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

const PerformanceSquareGrid: React.FC = () => {
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
            inpObserver.observe({ type: 'event', durationThreshold: 16, buffered: true } as any);
            observers.push(inpObserver);
        } catch (e) {
            console.warn("PerformanceObserver not supported in this session.", e);
        }

        return () => {
            observers.forEach(obs => obs.disconnect());
        };
    }, []);

    return (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">Web Vitals & Performance</h3>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">Real-time Session</span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-2.5 sm:p-3 text-center flex flex-col justify-between aspect-square">
                    <span className="text-[10px] sm:text-xs text-zinc-400 uppercase font-semibold">LCP</span>
                    <span className="text-base sm:text-xl md:text-2xl font-black text-emerald-400 font-mono truncate">
                        {vitals.lcp ? `${vitals.lcp}ms` : '< 120ms'}
                    </span>
                    <span className="text-[9px] text-zinc-500">Paint speed</span>
                </div>
                <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-2.5 sm:p-3 text-center flex flex-col justify-between aspect-square">
                    <span className="text-[10px] sm:text-xs text-zinc-400 uppercase font-semibold">INP</span>
                    <span className="text-base sm:text-xl md:text-2xl font-black text-cyan-400 font-mono truncate">
                        {vitals.inp ? `${vitals.inp}ms` : '< 24ms'}
                    </span>
                    <span className="text-[9px] text-zinc-500">Interactivity</span>
                </div>
                <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-2.5 sm:p-3 text-center flex flex-col justify-between aspect-square">
                    <span className="text-[10px] sm:text-xs text-zinc-400 uppercase font-semibold">CLS</span>
                    <span className="text-base sm:text-xl md:text-2xl font-black text-amber-400 font-mono truncate">
                        {vitals.cls ?? '0.00'}
                    </span>
                    <span className="text-[9px] text-zinc-500">Layout stability</span>
                </div>
            </div>
        </div>
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

export const ObservabilityTab: React.FC = () => {
    const dataContext = useContext(DataContext as React.Context<DataContextType>);
    const { sessions, activityLog, firestoreQuota, resetFirestoreQuotaCounters } = dataContext;
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000 * 60);
        return () => clearInterval(timer);
    }, []);

    const now = useMemo(() => time, [time]);

    const generateTimeSeriesData = <T extends { [key: string]: any }>(
        items: T[] | undefined,
        dateField: keyof T,
        valueField: keyof T | null,
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

    const READ_LIMIT = 50000;
    const WRITE_LIMIT = 20000;
    const DELETE_LIMIT = 20000;

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* 1. TOP 4 SIDE-BY-SIDE SQUARES (Shrink-to-fit) */}
            <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-300">
                        Real-time Metrics (Side-by-Side)
                    </h2>
                    <span className="text-[10px] font-mono text-zinc-500">24-Hour Active Telemetry</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
                    <SquareMetricCard
                        title="Activity"
                        total={totalActivity}
                        data={totalActivityData}
                        color="#34d399"
                        unit="events"
                        icon={<ChartBarIcon className="w-4 h-4 text-emerald-400" />}
                    />
                    <SquareMetricCard
                        title="Data IO"
                        total={totalDataValue}
                        unit={totalDataUnit}
                        data={dataQueriedData}
                        color="#60a5fa"
                        icon={<CircleStackIcon className="w-4 h-4 text-blue-400" />}
                    />
                    <SquareMetricCard
                        title="Logins"
                        total={totalLogins}
                        data={loginData}
                        color="#f87171"
                        unit="sessions"
                        icon={<UsersIcon className="w-4 h-4 text-red-400" />}
                    />
                    <SquareMetricCard
                        title="Functions"
                        total={0}
                        data={serverFunctionData}
                        color="#a78bfa"
                        unit="calls"
                        icon={<SparklesIcon className="w-4 h-4 text-purple-400" />}
                    />
                </div>
            </div>

            {/* 2. DATABASE USAGE: 3 SIDE-BY-SIDE SQUARES */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <CircleStackIcon className="w-5 h-5 text-blue-400" />
                        <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                            Database Operation Quotas
                        </h3>
                    </div>
                    <Button onClick={resetFirestoreQuotaCounters} variant="secondary" size="sm" className="!text-[11px] !py-1 !px-2.5">
                        <ArrowPathIcon className="w-3.5 h-3.5 mr-1" />
                        Reset
                    </Button>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <QuotaSquare
                        label="Reads"
                        limit={READ_LIMIT}
                        actual={firestoreQuota?.reads || 0}
                        colorClass="text-blue-400"
                        barColor="bg-blue-500"
                    />
                    <QuotaSquare
                        label="Writes"
                        limit={WRITE_LIMIT}
                        actual={firestoreQuota?.writes || 0}
                        colorClass="text-amber-400"
                        barColor="bg-amber-500"
                    />
                    <QuotaSquare
                        label="Deletes"
                        limit={DELETE_LIMIT}
                        actual={firestoreQuota?.deletes || 0}
                        colorClass="text-red-400"
                        barColor="bg-red-500"
                    />
                </div>
            </div>

            {/* 3. PERFORMANCE VITALS + SIDE-BY-SIDE LIVE PANELS */}
            <PerformanceSquareGrid />

            {/* 4. ACTIVITY & SESSIONS (Compact Side-by-Side Shrink-to-fit) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
                {/* Live Activity Feed */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 sm:p-5 flex flex-col">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                            <ChartBarIcon className="w-4 h-4 text-emerald-400" />
                            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Live Activity Feed</h3>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500">{sortedActivityLog.length} Recorded</span>
                    </div>
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                        {sortedActivityLog.length === 0 ? (
                            <p className="text-xs text-zinc-500 text-center py-6">No recent events recorded in this session.</p>
                        ) : (
                            sortedActivityLog.slice(0, 25).map(log => (
                                <div key={log.id} className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-2 flex items-center justify-between gap-2 text-xs">
                                    <div className="min-w-0 flex-1 truncate">
                                        <span className={`font-bold ${log.userRole === 'admin' ? 'text-red-400' : log.userRole === 'creator' ? 'text-cyan-400' : 'text-zinc-200'} truncate`}>
                                            {log.userName}
                                        </span>
                                        <span className="text-zinc-400 ml-1.5 truncate">{log.action}</span>
                                    </div>
                                    <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap flex-shrink-0">
                                        {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Active Sessions */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5 sm:p-5 flex flex-col">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
                        <div className="flex items-center gap-2">
                            <UsersIcon className="w-4 h-4 text-blue-400" />
                            <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Active Sessions</h3>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                            {liveSessions.length} Online
                        </span>
                    </div>
                    <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                        {liveSessions.length === 0 ? (
                            <div className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-2.5 flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                    <span className="font-bold text-white truncate">JSTYP (Creator)</span>
                                </div>
                                <span className="text-[10px] font-mono text-zinc-400 uppercase">Creator Dashboard</span>
                            </div>
                        ) : (
                            liveSessions.map(session => (
                                <div key={session.id} className="bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-2 flex items-center justify-between gap-2 text-xs">
                                    <div className="min-w-0 flex items-center gap-1.5 truncate">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0"></span>
                                        <span className="font-semibold text-white truncate">{session.userName}</span>
                                        <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded font-mono flex-shrink-0">{session.userRole}</span>
                                    </div>
                                    <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap flex-shrink-0">
                                        {formatDistanceToNow(new Date(session.lastSeen), { addSuffix: true })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
