import React, { useState, useMemo } from 'react';
import { AdminNotification, Player } from '../types';
import { 
    BellIcon, 
    CheckCircleIcon, 
    TrashIcon, 
    TrophyIcon, 
    SparklesIcon, 
    ShieldCheckIcon, 
    UserIcon, 
    CalendarIcon,
    MagnifyingGlassIcon,
    CodeBracketIcon,
    InformationCircleIcon
} from './icons/Icons';
import { Button } from './Button';
import { Modal } from './Modal';
import { DashboardCard } from './DashboardCard';

interface AdminNotificationsTabProps {
    notifications: AdminNotification[];
    onUpdateNotification: (notification: AdminNotification) => Promise<void>;
    onDeleteNotification: (id: string) => Promise<void>;
    onClearAllNotifications: () => Promise<void>;
    onMarkAllAsRead: () => Promise<void>;
    onViewPlayer?: (playerId: string) => void;
    players?: Player[];
}

export const AdminNotificationsTab: React.FC<AdminNotificationsTabProps> = ({
    notifications,
    onUpdateNotification,
    onDeleteNotification,
    onClearAllNotifications,
    onMarkAllAsRead,
    onViewPlayer,
    players = []
}) => {
    const [filter, setFilter] = useState<'all' | 'unread' | 'badge' | 'rank' | 'signup'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
    const [copiedSql, setCopiedSql] = useState(false);

    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length;
    }, [notifications]);

    const filteredNotifications = useMemo(() => {
        return notifications
            .filter(n => {
                if (filter === 'unread') return !n.read;
                if (filter === 'badge') return n.type === 'badge_earned' || n.type === 'legendary_badge_earned';
                if (filter === 'rank') return n.type === 'rank_up';
                if (filter === 'signup') return n.type === 'event_signup' || n.type === 'new_player';
                return true;
            })
            .filter(n => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (
                    n.title.toLowerCase().includes(q) ||
                    n.message.toLowerCase().includes(q) ||
                    (n.playerName && n.playerName.toLowerCase().includes(q)) ||
                    (n.playerCallsign && n.playerCallsign.toLowerCase().includes(q)) ||
                    (n.playerCode && n.playerCode.toLowerCase().includes(q)) ||
                    (n.badgeName && n.badgeName.toLowerCase().includes(q)) ||
                    (n.rankName && n.rankName.toLowerCase().includes(q))
                );
            })
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [notifications, filter, searchQuery]);

    const formatRelativeTime = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffSecs = Math.floor(diffMs / 1000);
            const diffMins = Math.floor(diffSecs / 60);
            const diffHours = Math.floor(diffMins / 60);
            const diffDays = Math.floor(diffHours / 24);

            if (diffSecs < 60) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        } catch {
            return 'Recently';
        }
    };

    const handleToggleRead = async (notif: AdminNotification) => {
        await onUpdateNotification({
            ...notif,
            read: !notif.read
        });
    };

    const sqlSnippets = `-- ==========================================================
-- SUPABASE / POSTGRESQL NOTIFICATIONS SCHEMA & REALTIME SYNC
-- ==========================================================

-- 1. Create the notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    read BOOLEAN NOT NULL DEFAULT false,
    "playerId" TEXT,
    "playerName" TEXT,
    "playerCallsign" TEXT,
    "playerCode" TEXT,
    "playerAvatarUrl" TEXT,
    "badgeId" TEXT,
    "badgeName" TEXT,
    "badgeIconUrl" TEXT,
    "badgeDescription" TEXT,
    "badgeCriteria" TEXT,
    "rankName" TEXT,
    "rankIconUrl" TEXT,
    "eventId" TEXT,
    "eventTitle" TEXT,
    details JSONB
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for Admin Access & App Operations
CREATE POLICY "Allow all access to notifications for authenticated users" 
ON public.notifications 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow public read-write for app services" 
ON public.notifications 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

-- 4. Enable Realtime Publications for instant live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 5. Performance Indexing for fast queries
CREATE INDEX IF NOT EXISTS idx_notifications_timestamp ON public.notifications (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_player ON public.notifications ("playerId");
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications (read);
`;

    const handleCopySql = () => {
        navigator.clipboard.writeText(sqlSnippets);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 2500);
    };

    return (
        <DashboardCard 
            title="Admin Notification Center" 
            icon={<BellIcon className="w-6 h-6 text-red-500" />}
            fullHeight
        >
            <div className="p-4 sm:p-6 space-y-5">
                {/* Header Actions & Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-lg bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-400">
                                <BellIcon className="w-6 h-6" />
                            </div>
                            {unreadCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-zinc-900 animate-pulse">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                Activity & Milestone Alerts
                                {unreadCount > 0 && (
                                    <span className="text-xs bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full font-mono border border-red-500/30">
                                        {unreadCount} Unread
                                    </span>
                                )}
                            </h2>
                            <p className="text-xs text-zinc-400">
                                Real-time alerts for player badge unlocks, promotions, and milestone events.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => setIsSqlModalOpen(true)}
                            className="flex items-center gap-1.5 text-xs text-blue-400 border-blue-900/50 hover:bg-blue-950/30"
                        >
                            <CodeBracketIcon className="w-4 h-4" />
                            SQL Setup Snippet
                        </Button>
                        {unreadCount > 0 && (
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={onMarkAllAsRead}
                                className="flex items-center gap-1.5 text-xs text-emerald-400 border-emerald-900/50 hover:bg-emerald-950/30"
                            >
                                <CheckCircleIcon className="w-4 h-4" />
                                Mark All Read
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={() => {
                                    if (confirm("Are you sure you want to clear all notifications? This cannot be undone.")) {
                                        onClearAllNotifications();
                                    }
                                }}
                                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-400 hover:border-red-800"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Clear All
                            </Button>
                        )}
                    </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    {/* Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                                filter === 'all' 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                            }`}
                        >
                            All ({notifications.length})
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                                filter === 'unread' 
                                    ? 'bg-red-600 text-white' 
                                    : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                            }`}
                        >
                            Unread ({unreadCount})
                        </button>
                        <button
                            onClick={() => setFilter('badge')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                                filter === 'badge' 
                                    ? 'bg-amber-600 text-white' 
                                    : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                            }`}
                        >
                            <TrophyIcon className="w-3.5 h-3.5" />
                            Badges
                        </button>
                        <button
                            onClick={() => setFilter('rank')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                                filter === 'rank' 
                                    ? 'bg-emerald-600 text-white' 
                                    : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                            }`}
                        >
                            <ShieldCheckIcon className="w-3.5 h-3.5" />
                            Ranks
                        </button>
                        <button
                            onClick={() => setFilter('signup')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 ${
                                filter === 'signup' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                            }`}
                        >
                            <UserIcon className="w-3.5 h-3.5" />
                            Signups & Events
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative min-w-[240px]">
                        <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search player, badge, code..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
                            >
                                ×
                            </button>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
                    {filteredNotifications.length === 0 ? (
                        <div className="text-center py-12 bg-zinc-950/40 rounded-xl border border-zinc-800/60 p-6">
                            <BellIcon className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                            <h3 className="text-base font-semibold text-zinc-300">No Notifications Found</h3>
                            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                                {searchQuery 
                                    ? `No notifications matching "${searchQuery}". Try changing your search or filter.` 
                                    : "You're all caught up! New badge unlocks and promotions will appear here instantly."}
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((notif) => {
                            const isLegendary = notif.type === 'legendary_badge_earned';
                            const isBadge = notif.type === 'badge_earned' || isLegendary;
                            const isRank = notif.type === 'rank_up';

                            return (
                                <article 
                                    key={notif.id}
                                    className={`p-4 rounded-xl border transition-all ${
                                        notif.read 
                                            ? 'bg-zinc-950/40 border-zinc-800/70 hover:border-zinc-700' 
                                            : isLegendary
                                                ? 'bg-purple-950/20 border-purple-800/60 shadow-lg shadow-purple-950/20'
                                                : isBadge
                                                    ? 'bg-amber-950/20 border-amber-800/60 shadow-lg shadow-amber-950/20'
                                                    : isRank
                                                        ? 'bg-emerald-950/20 border-emerald-800/60 shadow-lg shadow-emerald-950/20'
                                                        : 'bg-zinc-900 border-zinc-700 shadow-md'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        {/* Main Icon & Type */}
                                        <div className="flex items-start gap-3.5 flex-grow">
                                            {/* Badge or Icon Avatar */}
                                            <div className="relative flex-shrink-0">
                                                {notif.badgeIconUrl ? (
                                                    <div className={`w-12 h-12 rounded-xl p-1.5 flex items-center justify-center border ${
                                                        isLegendary 
                                                            ? 'bg-purple-900/40 border-purple-500 shadow-md shadow-purple-600/30' 
                                                            : 'bg-amber-900/30 border-amber-500/50'
                                                    }`}>
                                                        <img 
                                                            src={notif.badgeIconUrl} 
                                                            alt={notif.badgeName || 'Badge'} 
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                ) : notif.rankIconUrl ? (
                                                    <div className="w-12 h-12 rounded-xl p-1.5 bg-emerald-900/30 border border-emerald-500/50 flex items-center justify-center">
                                                        <img 
                                                            src={notif.rankIconUrl} 
                                                            alt={notif.rankName || 'Rank'} 
                                                            className="w-full h-full object-contain"
                                                        />
                                                    </div>
                                                ) : notif.playerAvatarUrl ? (
                                                    <img 
                                                        src={notif.playerAvatarUrl} 
                                                        alt={notif.playerName || 'Player'} 
                                                        className="w-12 h-12 rounded-xl object-cover border border-zinc-700"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                                                        <BellIcon className="w-6 h-6" />
                                                    </div>
                                                )}

                                                {/* Status indicator pip */}
                                                {!notif.read && (
                                                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 ring-2 ring-zinc-900 animate-pulse" />
                                                )}
                                            </div>

                                            {/* Notification Content */}
                                            <div className="space-y-1 flex-grow">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className="text-sm font-bold text-white">
                                                        {notif.title}
                                                    </h4>
                                                    
                                                    {/* Type Tags */}
                                                    {isLegendary && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/40 uppercase tracking-wider">
                                                            <SparklesIcon className="w-3 h-3" />
                                                            Legendary Badge
                                                        </span>
                                                    )}
                                                    {notif.type === 'badge_earned' && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-600/30 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                                                            <TrophyIcon className="w-3 h-3" />
                                                            Badge Unlocked
                                                        </span>
                                                    )}
                                                    {isRank && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                                                            <ShieldCheckIcon className="w-3 h-3" />
                                                            Rank Up
                                                        </span>
                                                    )}
                                                    {notif.type === 'new_player' && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40 uppercase tracking-wider">
                                                            New Player
                                                        </span>
                                                    )}
                                                    {notif.type === 'event_signup' && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 uppercase tracking-wider">
                                                            Event Signup
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs text-zinc-300 leading-relaxed">
                                                    {notif.message}
                                                </p>

                                                {/* Embedded Details Box if Badge or Rank is present */}
                                                {(notif.badgeDescription || notif.badgeCriteria || notif.details) && (
                                                    <div className="mt-2 p-2.5 bg-zinc-950/70 rounded-lg border border-zinc-800/80 text-xs space-y-1 max-w-xl">
                                                        {notif.badgeName && (
                                                            <div className="flex items-center gap-2 font-medium text-amber-400">
                                                                <span>Badge: {notif.badgeName}</span>
                                                                {notif.badgeCriteria && (
                                                                    <span className="text-zinc-500 font-normal">
                                                                        • Requirement: {notif.badgeCriteria}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                        {notif.badgeDescription && (
                                                            <p className="text-zinc-400 text-[11px]">
                                                                "{notif.badgeDescription}"
                                                            </p>
                                                        )}
                                                        {notif.eventTitle && (
                                                            <p className="text-cyan-400 text-[11px] flex items-center gap-1">
                                                                <CalendarIcon className="w-3 h-3" /> Event: {notif.eventTitle}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Player Details & Timestamp */}
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-zinc-400 pt-1">
                                                    {notif.playerName && (
                                                        <span className="flex items-center gap-1 text-zinc-300 font-medium">
                                                            <UserIcon className="w-3 h-3 text-zinc-500" />
                                                            {notif.playerCallsign ? `${notif.playerCallsign} (${notif.playerName})` : notif.playerName}
                                                            {notif.playerCode && <span className="font-mono text-zinc-500">[{notif.playerCode}]</span>}
                                                        </span>
                                                    )}
                                                    <span className="text-zinc-500">
                                                        {formatRelativeTime(notif.timestamp)} • {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex flex-col sm:flex-row items-center gap-1 flex-shrink-0">
                                            {notif.playerId && onViewPlayer && (
                                                <button
                                                    onClick={() => onViewPlayer(notif.playerId!)}
                                                    className="px-2.5 py-1 text-xs text-red-400 hover:text-white hover:bg-red-600/20 rounded-md border border-red-900/40 transition-colors whitespace-nowrap"
                                                    title="View player profile"
                                                >
                                                    View Profile
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleToggleRead(notif)}
                                                className={`p-1.5 rounded-md text-xs transition-colors ${
                                                    notif.read 
                                                        ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800' 
                                                        : 'text-emerald-400 hover:bg-emerald-950/40'
                                                }`}
                                                title={notif.read ? "Mark as unread" : "Mark as read"}
                                            >
                                                <CheckCircleIcon className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDeleteNotification(notif.id)}
                                                className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded-md text-xs transition-colors"
                                                title="Delete notification"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>
            </div>

            {/* SQL Snippet Helper Modal */}
            <Modal
                isOpen={isSqlModalOpen}
                onClose={() => setIsSqlModalOpen(false)}
                title="Supabase Notifications SQL Setup"
                maxWidth="xl"
            >
                <div className="space-y-4">
                    <div className="bg-blue-950/40 border border-blue-800/60 p-3.5 rounded-lg flex items-start gap-3">
                        <InformationCircleIcon className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-200 space-y-1">
                            <p className="font-semibold">Run this SQL in your Supabase SQL Editor:</p>
                            <p>
                                This script creates the <code>notifications</code> table, sets up appropriate row-level security (RLS), adds high-performance indexes, and enables Supabase Realtime publication so alerts appear without refreshing.
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <pre className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-[340px] scrollbar-thin">
                            {sqlSnippets}
                        </pre>
                        <button
                            onClick={handleCopySql}
                            className="absolute top-3 right-3 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-xs font-semibold shadow-md flex items-center gap-1.5 transition-colors"
                        >
                            {copiedSql ? '✓ Copied!' : 'Copy SQL'}
                        </button>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="secondary" onClick={() => setIsSqlModalOpen(false)}>
                            Close
                        </Button>
                        <Button variant="primary" onClick={handleCopySql}>
                            {copiedSql ? 'Copied to Clipboard' : 'Copy Full SQL Script'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </DashboardCard>
    );
};
