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
    InformationCircleIcon,
    ChevronDownIcon
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
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);
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
        <div className="w-full space-y-4">
            {/* Free View Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2.5">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-400">
                            <BellIcon className="w-5 h-5" />
                        </div>
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-zinc-900 animate-pulse">
                                {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                            Notifications & Field Alerts
                            {unreadCount > 0 && (
                                <span className="text-[10px] bg-red-600/20 text-red-400 px-1.5 py-0.5 rounded-full font-mono border border-red-500/30">
                                    {unreadCount} Unread
                                </span>
                            )}
                        </h2>
                        <p className="text-[10px] sm:text-xs text-zinc-400">
                            Real-time alerts for player badge unlocks, promotions, and milestone events.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => setIsSqlModalOpen(true)}
                        className="!py-1 !px-2.5 text-[11px] text-blue-400 border-blue-900/50 hover:bg-blue-950/30"
                    >
                        <CodeBracketIcon className="w-3.5 h-3.5 mr-1" />
                        SQL Setup
                    </Button>
                    {unreadCount > 0 && (
                        <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={onMarkAllAsRead}
                            className="!py-1 !px-2.5 text-[11px] text-emerald-400 border-emerald-900/50 hover:bg-emerald-950/30"
                        >
                            <CheckCircleIcon className="w-3.5 h-3.5 mr-1" />
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
                            className="!py-1 !px-2.5 text-[11px] text-zinc-400 hover:text-red-400 hover:border-red-800"
                        >
                            <TrashIcon className="w-3.5 h-3.5 mr-1" />
                            Clear All
                        </Button>
                    )}
                </div>
            </div>

            {/* Filters & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                {/* Mobile Filter Dropdown */}
                <div className="sm:hidden relative">
                    <button
                        onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                        className="w-full flex items-center justify-between px-3.5 py-2 bg-zinc-900 border border-zinc-700/80 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-sm"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-400 font-mono text-[10px]">FILTER:</span>
                            <span className="text-red-400">
                                {filter === 'all' && `All (${notifications.length})`}
                                {filter === 'unread' && `Unread (${unreadCount})`}
                                {filter === 'badge' && 'Badges'}
                                {filter === 'rank' && 'Ranks'}
                                {filter === 'signup' && 'Signups'}
                            </span>
                        </div>
                        <ChevronDownIcon className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${filterMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {filterMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" onClick={() => setFilterMenuOpen(false)} />
                            <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1.5 space-y-0.5">
                                <button
                                    onClick={() => { setFilter('all'); setFilterMenuOpen(false); }}
                                    className={`w-full text-left px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                                        filter === 'all' ? 'bg-red-600/20 text-red-400 border-l-2 border-red-500' : 'text-zinc-300 hover:bg-zinc-800'
                                    }`}
                                >
                                    <span>All Notifications</span>
                                    <span className="text-zinc-500 font-mono text-[10px]">({notifications.length})</span>
                                </button>
                                <button
                                    onClick={() => { setFilter('unread'); setFilterMenuOpen(false); }}
                                    className={`w-full text-left px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                                        filter === 'unread' ? 'bg-red-600/20 text-red-400 border-l-2 border-red-500' : 'text-zinc-300 hover:bg-zinc-800'
                                    }`}
                                >
                                    <span>Unread</span>
                                    <span className="text-red-500 font-mono text-[10px]">({unreadCount})</span>
                                </button>
                                <button
                                    onClick={() => { setFilter('badge'); setFilterMenuOpen(false); }}
                                    className={`w-full text-left px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                                        filter === 'badge' ? 'bg-amber-600/20 text-amber-400 border-l-2 border-amber-500' : 'text-zinc-300 hover:bg-zinc-800'
                                    }`}
                                >
                                    <TrophyIcon className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Badges</span>
                                </button>
                                <button
                                    onClick={() => { setFilter('rank'); setFilterMenuOpen(false); }}
                                    className={`w-full text-left px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                                        filter === 'rank' ? 'bg-emerald-600/20 text-emerald-400 border-l-2 border-emerald-500' : 'text-zinc-300 hover:bg-zinc-800'
                                    }`}
                                >
                                    <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                                    <span>Ranks</span>
                                </button>
                                <button
                                    onClick={() => { setFilter('signup'); setFilterMenuOpen(false); }}
                                    className={`w-full text-left px-3.5 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                                        filter === 'signup' ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500' : 'text-zinc-300 hover:bg-zinc-800'
                                    }`}
                                >
                                    <UserIcon className="w-3.5 h-3.5 text-blue-500" />
                                    <span>Signups</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Desktop Filter Pills */}
                <div className="hidden sm:flex items-center gap-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                            filter === 'all' 
                                ? 'bg-red-600 text-white shadow-md shadow-red-900/30' 
                                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                        }`}
                    >
                        All ({notifications.length})
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                            filter === 'unread' 
                                ? 'bg-red-600 text-white shadow-md shadow-red-900/30' 
                                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                        }`}
                    >
                        Unread ({unreadCount})
                    </button>
                    <button
                        onClick={() => setFilter('badge')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1 ${
                            filter === 'badge' 
                                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30' 
                                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                        }`}
                    >
                        <TrophyIcon className="w-3 h-3" />
                        Badges
                    </button>
                    <button
                        onClick={() => setFilter('rank')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1 ${
                            filter === 'rank' 
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30' 
                                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                        }`}
                    >
                        <ShieldCheckIcon className="w-3 h-3" />
                        Ranks
                    </button>
                    <button
                        onClick={() => setFilter('signup')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1 ${
                            filter === 'signup' 
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30' 
                                : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                        }`}
                    >
                        <UserIcon className="w-3 h-3" />
                        Signups
                    </button>
                </div>

                {/* Search Input */}
                <div className="relative min-w-[200px] flex-shrink-0">
                    <MagnifyingGlassIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search player, code, badge..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-1 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
                        >
                            ×
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications Grid - Responsive side-by-side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[68vh] overflow-y-auto pr-1">
                {filteredNotifications.length === 0 ? (
                    <div className="col-span-full text-center py-10 bg-zinc-900/20 rounded-xl border border-zinc-800/60 p-4">
                        <BellIcon className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                        <h3 className="text-sm font-semibold text-zinc-300">No Notifications Found</h3>
                        <p className="text-[11px] text-zinc-500 mt-0.5 max-w-sm mx-auto">
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
                                className={`p-2.5 sm:p-3 rounded-xl border transition-all flex flex-col justify-between ${
                                    notif.read 
                                        ? 'bg-zinc-900/30 border-zinc-800/70 hover:border-zinc-700' 
                                        : isLegendary
                                            ? 'bg-purple-950/20 border-purple-800/60 shadow-lg shadow-purple-950/20'
                                            : isBadge
                                                ? 'bg-amber-950/20 border-amber-800/60 shadow-lg shadow-amber-950/20'
                                                : isRank
                                                    ? 'bg-emerald-950/20 border-emerald-800/60 shadow-lg shadow-emerald-950/20'
                                                    : 'bg-zinc-900/80 border-zinc-700 shadow-md'
                                }`}
                            >
                                <div className="flex items-start gap-2.5">
                                    {/* Badge or Icon Avatar */}
                                    <div className="relative flex-shrink-0">
                                        {notif.badgeIconUrl && notif.badgeIconUrl.trim() !== '' ? (
                                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg p-1 flex items-center justify-center border ${
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
                                        ) : notif.rankIconUrl && notif.rankIconUrl.trim() !== '' ? (
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg p-1 bg-emerald-900/30 border border-emerald-500/50 flex items-center justify-center">
                                                <img 
                                                    src={notif.rankIconUrl} 
                                                    alt={notif.rankName || 'Rank'} 
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                        ) : notif.playerAvatarUrl && notif.playerAvatarUrl.trim() !== '' ? (
                                            <img 
                                                src={notif.playerAvatarUrl} 
                                                alt={notif.playerName || 'Player'} 
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.playerName || 'OP')}&background=18181b&color=ef4444&bold=true`;
                                                }}
                                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover border border-zinc-700"
                                            />
                                        ) : (
                                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                                                <BellIcon className="w-5 h-5" />
                                            </div>
                                        )}

                                        {/* Status indicator pip */}
                                        {!notif.read && (
                                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-zinc-900 animate-pulse" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-1 flex-grow min-w-0">
                                        <div className="flex items-center justify-between gap-1 flex-wrap">
                                            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                                                {notif.title}
                                            </h4>
                                            <span className="text-[9px] font-mono text-zinc-500">
                                                {formatRelativeTime(notif.timestamp)}
                                            </span>
                                        </div>

                                        <p className="text-[11px] text-zinc-300 leading-snug line-clamp-2">
                                            {notif.message}
                                        </p>

                                        {notif.badgeName && (
                                            <div className="text-[10px] text-amber-400 font-medium truncate">
                                                Badge: {notif.badgeName}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Footer details & actions */}
                                <div className="flex items-center justify-between gap-2 pt-2 mt-2 border-t border-zinc-800/50 text-[10px]">
                                    <div className="flex items-center gap-1.5 text-zinc-400 truncate">
                                        {notif.playerName && (
                                            <span className="truncate text-zinc-300 font-medium">
                                                {notif.playerCallsign ? `"${notif.playerCallsign}"` : notif.playerName}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {notif.playerId && onViewPlayer && (
                                            <button
                                                onClick={() => onViewPlayer(notif.playerId!)}
                                                className="px-2 py-0.5 text-[10px] text-red-400 hover:text-white hover:bg-red-600/20 rounded border border-red-900/40 transition-colors"
                                            >
                                                Profile
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleToggleRead(notif)}
                                            className={`p-1 rounded text-xs transition-colors ${
                                                notif.read ? 'text-zinc-500 hover:text-zinc-300' : 'text-emerald-400 hover:bg-emerald-950/40'
                                            }`}
                                            title={notif.read ? "Mark unread" : "Mark read"}
                                        >
                                            <CheckCircleIcon className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => onDeleteNotification(notif.id)}
                                            className="p-1 text-zinc-500 hover:text-red-400 hover:bg-red-950/30 rounded text-xs transition-colors"
                                            title="Delete"
                                        >
                                            <TrashIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        );
                    })
                )}
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
        </div>
    );
};
