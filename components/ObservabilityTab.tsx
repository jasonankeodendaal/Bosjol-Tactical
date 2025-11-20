
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { motion } from 'framer-motion';
import { DataContext, DataContextType } from '../data/DataContext';
import { DashboardCard } from './DashboardCard';
import { UsersIcon, ChartBarIcon, ClockIcon, SparklesIcon, UserCircleIcon, DesktopComputerIcon } from './icons/Icons';
import type { Session, ActivityLog } from '../types';
import { formatDistanceToNow } from 'date-fns';

const StatWidget: React.FC<{ title: string, value: string | number, icon: React.ReactNode, color: string }> = ({ title, value, icon, color }) => (
    <DashboardCard title="" icon={<></>}>
        <div className="p-4 flex items-center">
            <div className={`mr-4 p-3 rounded-lg bg-zinc-800 ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-3xl font-bold text-white">{value}</p>
                <p className="text-sm text-gray-400">{title}</p>
            </div>
        </div>
    </DashboardCard>
);

const PerformanceWidget: React.FC = () => {
    const [vitals, setVitals] = useState<Record<string, number | null>>({
        lcp: null,
        inp: null,
        cls: null,
    });

    useEffect(() => {
        // This is a simplified version. For production, you'd use the web-vitals library.
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'largest-contentful-paint') {
                    setVitals(v => ({ ...v, lcp: Math.round(entry.startTime) }));
                }
                if (entry.entryType === 'layout-shift') {
                    // FIX: The result of toFixed() is a string. Wrap in parseFloat() to convert it back to a number to match the state's type.
                    setVitals(v => ({ ...v, cls: parseFloat(((v.cls || 0) + (entry as any).value).toFixed(4)) }));
                }
                 if (entry.entryType === 'event') {
                    // Simplified INP-like metric
                    const duration = entry.duration;
                    if (duration > (vitals.inp || 0)) {
                        setVitals(v => ({ ...v, inp: Math.round(duration) }));
                    }
                }
            }
        });
        try {
            observer.observe({ type: ['largest-contentful-paint', 'layout-shift', 'event'], buffered: true, durationThreshold: 16 });
        } catch (e) {
            console.warn("PerformanceObserver not fully supported.", e);
        }
        return () => observer.disconnect();
    }, [vitals.inp]);

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

export const ObservabilityTab: React.FC = () => {
    const dataContext = useContext(DataContext as React.Context<DataContextType>);
    const { sessions, activityLog } = dataContext;
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const liveSessions = useMemo(() => {
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        return sessions.filter(s => new Date(s.lastSeen) > oneMinuteAgo);
    }, [sessions, time]);

    const sortedActivityLog = useMemo(() => 
        [...activityLog].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), 
    [activityLog]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatWidget title="Live Visitors" value={liveSessions.length} icon={<UsersIcon className="w-6 h-6" />} color="text-blue-400" />
                <StatWidget title="Total Sessions Tracked" value={sessions.length} icon={<DesktopComputerIcon className="w-6 h-6" />} color="text-indigo-400" />
                <StatWidget title="Activity Log Events" value={activityLog.length} icon={<ChartBarIcon className="w-6 h-6" />} color="text-green-400" />
                <StatWidget title="Server Time" value={time.toLocaleTimeString()} icon={<ClockIcon className="w-6 h-6" />} color="text-gray-400" />
            </div>

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
                    <DashboardCard title="Active Sessions" icon={<UsersIcon className="w-6 h-6" />}>
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
