import React, { useState, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player, PlayerHonor, HonorType, Badge, LegendaryBadge } from '../types';
import { CrownIcon, TrophyIcon, SparklesIcon, PlusIcon, TrashIcon, PencilIcon, UserIcon, CalendarIcon, PhotoIcon, XIcon, ChartBarIcon } from './icons/Icons';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { UrlOrUploadField } from './UrlOrUploadField';
import { useData } from '../data/DataContext';
import { getTierForPlayer, getRankProgression, FALLBACK_RECRUIT_TIER, resolveRankIcon, getRankBadgeSvg } from '../utils/rankUtils';
import { MOCK_BADGES } from '../constants';

// Player Profile / Stats Popup Modal
const PlayerStatsModal: React.FC<{
    player: Player;
    onClose: () => void;
}> = ({ player, onClose }) => {
    const dataContext = useData();
    const ranks = dataContext?.ranks;
    const honors = dataContext?.honors || [];
    const systemBadges = dataContext?.badges || MOCK_BADGES;

    const [activeTab, setActiveTab] = useState<'stats' | 'badges' | 'honors'>('stats');

    const playerTier = useMemo(() => getTierForPlayer(player, ranks), [player, ranks]);
    const tierIcon = resolveRankIcon(playerTier.iconUrl, playerTier.name);
    const progression = useMemo(() => getRankProgression(player, ranks), [player, ranks]);

    // Honors earned by this player
    const playerHonors = useMemo(() => {
        return honors.filter(h => h.playerId === player.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [honors, player.id]);

    // Badges earned or unlocked
    const earnedBadges = useMemo(() => {
        if (player.badges && player.badges.length > 0) return player.badges;
        return systemBadges.filter(b => {
            if (b.criteria?.type === 'kills') return (player.stats?.kills ?? 0) >= Number(b.criteria.value);
            if (b.criteria?.type === 'gamesPlayed') return (player.stats?.gamesPlayed ?? 0) >= Number(b.criteria.value);
            return false;
        });
    }, [player, systemBadges]);

    const legendaryBadges = player.legendaryBadges || [];

    const kills = player.stats?.kills ?? 0;
    const deaths = player.stats?.deaths ?? 0;
    const gamesPlayed = player.stats?.gamesPlayed ?? 0;
    const headshots = player.stats?.headshots ?? 0;
    const kdRatio = (kills / Math.max(deaths, 1)).toFixed(2);
    const headshotPct = kills > 0 ? ((headshots / kills) * 100).toFixed(0) : '0';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-[130] overflow-y-auto"
                aria-modal="true"
                role="dialog"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    onClick={e => e.stopPropagation()}
                    className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl shadow-[0_0_60px_rgba(220,38,38,0.2)] overflow-hidden text-white my-auto flex flex-col max-h-[90vh]"
                >
                    {/* Header Banner */}
                    <div className="relative bg-gradient-to-r from-red-950/80 via-zinc-900 to-amber-950/60 p-4 sm:p-6 border-b border-zinc-800 shrink-0">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-black/40 hover:bg-black/80 rounded-full transition-colors z-10"
                            aria-label="Close modal"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                <img
                                    src={player.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.callsign || player.name || 'OP')}&background=18181b&color=ef4444&bold=true`}
                                    alt={player.name}
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.callsign || player.name || 'OP')}&background=18181b&color=ef4444&bold=true`;
                                    }}
                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-red-500/80 shadow-lg bg-zinc-900"
                                />
                                <div className="absolute -bottom-2 -right-2 bg-zinc-950 p-1 rounded-lg border border-amber-500/60 shadow">
                                    <img
                                        src={tierIcon}
                                        alt={playerTier.name}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(playerTier.name);
                                        }}
                                        className="w-6 h-6 object-contain"
                                    />
                                </div>
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {player.playerCode && (
                                        <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                                            {player.playerCode}
                                        </span>
                                    )}
                                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                                        {player.status || 'Active'}
                                    </span>
                                </div>

                                <h2 className="text-xl sm:text-2xl font-black text-white truncate mt-1">
                                    {player.name} {player.surname || ''}
                                </h2>
                                {player.callsign && (
                                    <p className="text-sm font-semibold text-red-400 truncate">
                                        "{player.callsign}"
                                    </p>
                                )}
                                <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5 truncate">
                                    <span className="text-amber-400 font-bold">{playerTier.name}</span>
                                    <span>•</span>
                                    <span className="text-zinc-300 font-mono">{(player.stats?.xp ?? 0).toLocaleString()} RP</span>
                                </p>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex items-center gap-2 mt-5 p-1 bg-zinc-900/90 rounded-xl border border-zinc-800">
                            <button
                                onClick={() => setActiveTab('stats')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                    activeTab === 'stats'
                                        ? 'bg-red-600 text-white shadow'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <ChartBarIcon className="w-3.5 h-3.5" /> Stats & Rank
                            </button>
                            <button
                                onClick={() => setActiveTab('badges')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                    activeTab === 'badges'
                                        ? 'bg-amber-600 text-white shadow'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <TrophyIcon className="w-3.5 h-3.5" /> Badges ({earnedBadges.length + legendaryBadges.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('honors')}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                    activeTab === 'honors'
                                        ? 'bg-purple-600 text-white shadow'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <CrownIcon className="w-3.5 h-3.5" /> Honors ({playerHonors.length})
                            </button>
                        </div>
                    </div>

                    {/* Modal Scrollable Body */}
                    <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
                        {activeTab === 'stats' && (
                            <div className="space-y-4">
                                {/* Rank & RP Progression Card */}
                                <div className="bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <img
                                                src={tierIcon}
                                                alt={playerTier.name}
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(playerTier.name);
                                                }}
                                                className="w-8 h-8 object-contain"
                                            />
                                            <div>
                                                <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-wider">Current Tier</p>
                                                <p className="text-base font-black text-amber-400">{playerTier.name}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-bold text-white font-mono">
                                                {(player.stats?.xp ?? 0).toLocaleString()} RP
                                            </p>
                                            <p className="text-[10px] text-zinc-500 font-mono">Total Career XP</p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div>
                                        <div className="flex justify-between text-[11px] font-mono text-zinc-400 mb-1">
                                            <span>Progress to {progression.next ? progression.next.name : 'Max Rank'}</span>
                                            <span className="text-amber-400 font-bold">{progression.progressPercentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 p-0.5">
                                            <div
                                                className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                                                style={{ width: `${progression.progressPercentage}%` }}
                                            />
                                        </div>
                                        {progression.next ? (
                                            <p className="text-[10px] text-zinc-400 font-mono mt-1 text-right">
                                                Need <strong className="text-amber-300">{progression.xpToNext.toLocaleString()} RP</strong> to level up
                                            </p>
                                        ) : (
                                            <p className="text-[10px] text-amber-400 font-mono font-bold mt-1 text-right">
                                                👑 MAX RANK ACHIEVED
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Performance Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 text-center">
                                        <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Matches Played</p>
                                        <p className="text-xl font-black text-white font-mono mt-0.5">{gamesPlayed}</p>
                                        <p className="text-[9px] text-zinc-500 mt-0.5">Events Deployed</p>
                                    </div>
                                    <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 text-center">
                                        <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Total Kills</p>
                                        <p className="text-xl font-black text-red-400 font-mono mt-0.5">{kills}</p>
                                        <p className="text-[9px] text-zinc-500 mt-0.5">Confirmed Tags</p>
                                    </div>
                                    <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 text-center">
                                        <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">K/D Ratio</p>
                                        <p className="text-xl font-black text-amber-400 font-mono mt-0.5">{kdRatio}</p>
                                        <p className="text-[9px] text-zinc-500 mt-0.5">{deaths} Deaths</p>
                                    </div>
                                    <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 text-center">
                                        <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Headshots</p>
                                        <p className="text-xl font-black text-purple-300 font-mono mt-0.5">{headshots}</p>
                                        <p className="text-[9px] text-zinc-500 mt-0.5">Critical Hits</p>
                                    </div>
                                    <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 text-center">
                                        <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Headshot %</p>
                                        <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">{headshotPct}%</p>
                                        <p className="text-[9px] text-zinc-500 mt-0.5">Accuracy Precision</p>
                                    </div>
                                    <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 text-center">
                                        <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Honors Won</p>
                                        <p className="text-xl font-black text-amber-300 font-mono mt-0.5">{playerHonors.length}</p>
                                        <p className="text-[9px] text-zinc-500 mt-0.5">Hall of Fame</p>
                                    </div>
                                </div>

                                {/* Loadout & Bio Summary if present */}
                                {player.loadout && (player.loadout.primaryWeapon || player.loadout.secondaryWeapon) && (
                                    <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/80 space-y-1.5">
                                        <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Preferred Tactical Loadout</p>
                                        <div className="flex items-center gap-3 text-xs text-zinc-200 flex-wrap">
                                            {player.loadout.primaryWeapon && (
                                                <span className="bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800 font-mono text-zinc-300">
                                                    🔫 Primary: <strong className="text-white">{player.loadout.primaryWeapon}</strong>
                                                </span>
                                            )}
                                            {player.loadout.secondaryWeapon && (
                                                <span className="bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800 font-mono text-zinc-300">
                                                    🗡️ Secondary: <strong className="text-white">{player.loadout.secondaryWeapon}</strong>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'badges' && (
                            <div className="space-y-4">
                                {legendaryBadges.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <SparklesIcon className="w-4 h-4" /> Legendary Commendations ({legendaryBadges.length})
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {legendaryBadges.map((lb, idx) => (
                                                <div key={lb.id || idx} className="bg-gradient-to-r from-amber-950/60 to-zinc-900 p-3 rounded-xl border border-amber-500/50 flex items-center gap-3 shadow">
                                                    {lb.iconUrl ? (
                                                        <img src={lb.iconUrl} alt={lb.name} className="w-10 h-10 object-contain shrink-0" />
                                                    ) : (
                                                        <SparklesIcon className="w-10 h-10 text-amber-400 shrink-0" />
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-xs text-amber-300 truncate">{lb.name}</p>
                                                        <p className="text-[10px] text-zinc-400 leading-tight line-clamp-2 mt-0.5">{lb.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <TrophyIcon className="w-4 h-4 text-amber-400" /> Earned Combat Badges ({earnedBadges.length})
                                    </h4>
                                    {earnedBadges.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {earnedBadges.map((badge, idx) => (
                                                <div key={badge.id || idx} className="bg-zinc-900/90 p-3 rounded-xl border border-zinc-800 flex items-center gap-3">
                                                    {badge.iconUrl ? (
                                                        <img src={badge.iconUrl} alt={badge.name} className="w-9 h-9 object-contain shrink-0" />
                                                    ) : (
                                                        <TrophyIcon className="w-9 h-9 text-amber-400 shrink-0" />
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-xs text-white truncate">{badge.name}</p>
                                                        <p className="text-[10px] text-zinc-400 leading-tight line-clamp-2 mt-0.5">{badge.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 bg-zinc-900/40 rounded-xl border border-dashed border-zinc-800">
                                            <TrophyIcon className="w-10 h-10 text-zinc-600 mx-auto mb-1.5" />
                                            <p className="text-xs text-zinc-400">No standard badges unlocked yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'honors' && (
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                                    <CrownIcon className="w-4 h-4 text-amber-400" /> Hall of Fame Honors ({playerHonors.length})
                                </h4>
                                {playerHonors.length > 0 ? (
                                    <div className="space-y-2">
                                        {playerHonors.map((honor) => (
                                            <div key={honor.id} className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 p-3 rounded-xl border border-amber-500/30 flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-500/40 font-mono">
                                                            {honor.type}
                                                        </span>
                                                        <span className="text-xs font-bold text-white">{honor.title}</span>
                                                    </div>
                                                    {honor.notes && (
                                                        <p className="text-[11px] text-zinc-300 italic mt-1 bg-black/40 p-2 rounded border border-zinc-800/80">
                                                            "{honor.notes}"
                                                        </p>
                                                    )}
                                                    <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                                                        <CalendarIcon className="w-3 h-3" /> Awarded: {honor.date}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-zinc-900/40 rounded-xl border border-dashed border-zinc-800">
                                        <CrownIcon className="w-10 h-10 text-zinc-600 mx-auto mb-1.5" />
                                        <p className="text-xs text-zinc-400">No Hall of Fame honors recorded for this player yet.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-3 sm:p-4 bg-zinc-900/80 border-t border-zinc-800 text-right shrink-0">
                        <Button onClick={onClose} variant="secondary" size="sm" className="w-full sm:w-auto font-bold">
                            Close Profile
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// RankedPlayerListItem Component
const RankedPlayerListItem: React.FC<{
    player: Player;
    rank: number;
    isCurrentUser?: boolean;
    onSelectPlayer?: (player: Player) => void;
}> = memo(({ player, rank, isCurrentUser, onSelectPlayer }) => {
    const dataContext = useData();
    const playerTier = useMemo(() => getTierForPlayer(player, dataContext?.ranks), [player, dataContext?.ranks]);
    const tierIcon = resolveRankIcon(playerTier.iconUrl, playerTier.name);

    return (
        <li
            onClick={() => onSelectPlayer && onSelectPlayer(player)}
            className={`flex items-center p-1.5 sm:p-3 rounded-lg transition-all cursor-pointer bg-zinc-800/40 border border-transparent ${isCurrentUser ? 'bg-red-500/20 !border-red-500/30' : 'hover:bg-zinc-800/90 hover:border-zinc-700/80'} group`}
            title="Click to view player stats & badges"
        >
            <div className={`text-center w-5 sm:w-10 font-bold text-xs sm:text-xl ${rank <= 3 ? 'text-amber-400' : isCurrentUser ? 'text-red-400' : 'text-gray-400'}`}>{rank}</div>
            <img 
                src={player.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.callsign || player.name || 'OP')}&background=18181b&color=ef4444&bold=true`} 
                alt={player.name} 
                onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.callsign || player.name || 'OP')}&background=18181b&color=ef4444&bold=true`;
                }}
                className="w-7 h-7 sm:w-12 sm:h-12 rounded-full object-cover mx-1.5 sm:mx-3 border-2 border-zinc-700 group-hover:border-red-500/60 transition-colors flex-shrink-0" 
            />
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className={`font-bold text-xs sm:text-lg truncate group-hover:text-red-300 transition-colors ${isCurrentUser ? 'text-white' : 'text-gray-200'}`}>{player.name}</p>
                    <img 
                        src={tierIcon} 
                        alt={playerTier.name} 
                        title={playerTier.name}
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(playerTier.name);
                        }}
                        className="w-4 h-4 sm:w-5 sm:h-5 object-contain flex-shrink-0" 
                    />
                </div>
                <p className="text-[9px] sm:text-sm text-gray-500 truncate">"{player.callsign}" · <span className="text-amber-400/90 font-mono text-[9px] sm:text-xs">{playerTier.name}</span></p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-1">
                <div className="text-right">
                    <p className={`font-bold text-xs sm:text-xl ${isCurrentUser ? 'text-red-300' : 'text-gray-100'}`}>{(player.stats?.xp ?? 0).toLocaleString()}</p>
                    <p className="text-[8px] sm:text-xs text-gray-500">Rank Points</p>
                </div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectPlayer && onSelectPlayer(player);
                    }}
                    className="p-1 sm:p-2 rounded-lg bg-zinc-900 group-hover:bg-red-600 group-hover:text-white text-zinc-400 transition-all border border-zinc-800 group-hover:border-red-500/40 shadow-sm"
                    title="View player stats & badges"
                >
                    <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
            </div>
        </li>
    );
});

// PodiumPlayer Component
const PodiumPlayer: React.FC<{
    player: Player;
    rank: 1 | 2 | 3;
    delay: number;
    onSelectPlayer?: (player: Player) => void;
}> = ({ player, rank, delay, onSelectPlayer }) => {
    const podiumClass = `podium-${rank}`;
    const animationVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay } }
    };

    return (
        <motion.div
            onClick={() => onSelectPlayer && onSelectPlayer(player)}
            className={`podium-item ${podiumClass} cursor-pointer group transition-all`}
            variants={animationVariants}
            title="Click to view player stats & badges"
        >
            <div className="podium-avatar-wrapper flex flex-col items-center">
                {rank === 1 && <CrownIcon className="w-5 h-5 sm:w-10 sm:h-10 crown-icon" />}
                <img 
                    src={player.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.callsign || player.name || 'OP')}&background=18181b&color=ef4444&bold=true`} 
                    alt={player.name} 
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.callsign || player.name || 'OP')}&background=18181b&color=ef4444&bold=true`;
                    }}
                    className="podium-avatar group-hover:border-amber-400 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all" 
                />
                <p className={`font-bold text-[10px] sm:text-base mt-1 sm:mt-2 truncate max-w-full px-0.5 sm:px-1 group-hover:text-amber-300 transition-colors ${rank === 1 ? 'text-amber-300' : 'text-white'}`}>{player.name}</p>
                <p className="text-[9px] sm:text-xs text-zinc-300 font-mono">{(player.stats?.xp ?? 0).toLocaleString()} RP</p>
                <span className="mt-1 text-[8px] sm:text-[10px] font-bold text-amber-300 bg-black/70 px-2 py-0.5 rounded-full border border-amber-500/40 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm flex items-center gap-1">
                    🔍 View Stats
                </span>
            </div>
            <div className="podium-base">
                {rank}
            </div>
        </motion.div>
    );
};

// Admin Add / Edit Honor Modal
const AdminHonorModal: React.FC<{
    honor: Partial<PlayerHonor> | null;
    players: Player[];
    onClose: () => void;
    onSave: (honor: PlayerHonor | Omit<PlayerHonor, 'id'>) => void;
}> = ({ honor, players, onClose, onSave }) => {
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>(honor?.playerId || players[0]?.id || '');
    const [type, setType] = useState<string>(honor?.type || 'Man of Match');
    const [title, setTitle] = useState<string>(honor?.title || '');
    const [badgeImageUrl, setBadgeImageUrl] = useState<string>(honor?.badgeImageUrl || '');
    const [date, setDate] = useState<string>(honor?.date || new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState<string>(honor?.notes || '');

    const handleSave = () => {
        if (!selectedPlayerId) {
            alert('Please select a player.');
            return;
        }
        if (!type.trim()) {
            alert('Please enter an honor category (e.g. Man of Match, Man of Month, Man of Year).');
            return;
        }
        if (!title.trim()) {
            alert('Please enter a title or event/season name (e.g. Operation Nightfall or August 2026).');
            return;
        }

        const targetPlayer = players.find(p => p.id === selectedPlayerId);

        const honorData = {
            ...honor,
            playerId: selectedPlayerId,
            playerName: targetPlayer ? `${targetPlayer.name} ${targetPlayer.surname || ''}`.trim() : 'Unknown Player',
            playerCallsign: targetPlayer?.callsign || '',
            playerAvatarUrl: targetPlayer?.avatarUrl || '',
            type: type.trim(),
            title: title.trim(),
            badgeImageUrl: badgeImageUrl.trim() || undefined,
            date,
            notes: notes.trim(),
        };

        onSave(honorData as any);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={honor?.id ? 'Edit Player Honor' : 'Assign Player Honor'}>
            <div className="space-y-4 text-left">
                <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Honor Category (Manual Text Entry)
                    </label>
                    <Input
                        value={type}
                        onChange={e => setType(e.target.value)}
                        placeholder="e.g. Man of Match, Man of Month, Man of Year"
                        className="mb-2"
                    />
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] text-zinc-500 font-medium mr-1">Quick Select:</span>
                        <button
                            type="button"
                            onClick={() => setType('Man of Match')}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all border ${type.toLowerCase().includes('match') ? 'bg-amber-950/90 border-amber-500 text-amber-300' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'}`}
                        >
                            🌟 Man of Match
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('Man of Month')}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all border ${type.toLowerCase().includes('month') ? 'bg-purple-950/90 border-purple-500 text-purple-300' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'}`}
                        >
                            🏆 Man of Month
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('Man of Year')}
                            className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all border ${type.toLowerCase().includes('year') ? 'bg-amber-900/90 border-amber-400 text-amber-200' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'}`}
                        >
                            👑 Man of Year
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Select Player
                    </label>
                    <select
                        value={selectedPlayerId}
                        onChange={e => setSelectedPlayerId(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                    >
                        {players.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.playerCode ? `[${p.playerCode}] ` : ''}{p.name} {p.surname || ''} {p.callsign ? `("${p.callsign}")` : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Event / Period Title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder={type.toLowerCase().includes('match') ? 'e.g. Operation Nightfall' : type.toLowerCase().includes('month') ? 'e.g. August 2026' : 'e.g. 2025/2026 Season'}
                    />
                    <Input
                        label="Award Date"
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                    />
                </div>

                <UrlOrUploadField
                    label="Badge Image (JPG / PNG Custom Upload)"
                    fileUrl={badgeImageUrl}
                    onUrlSet={setBadgeImageUrl}
                    onRemove={() => setBadgeImageUrl('')}
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                />

                <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                        Performance Notes / Citation (Optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        rows={2}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="e.g. Outstanding squad leadership and clutch defense."
                    />
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 flex gap-3">
                <Button variant="secondary" onClick={onClose} className="w-1/2">
                    Cancel
                </Button>
                <Button onClick={handleSave} className="w-1/2 font-bold bg-amber-600 hover:bg-amber-500">
                    {honor?.id ? 'Update Honor' : 'Award Honor'}
                </Button>
            </div>
        </Modal>
    );
};

// Main Leaderboard Component
export const Leaderboard: React.FC<{ players: Player[], currentPlayerId?: string, isAdmin?: boolean }> = ({ players, currentPlayerId, isAdmin }) => {
    const dataContext = useData();
    const honors = dataContext?.honors || [];
    const [viewMode, setViewMode] = useState<'leaderboard' | 'honors'>('leaderboard');
    const [honorFilter, setHonorFilter] = useState<string>('all');
    const [editingHonor, setEditingHonor] = useState<Partial<PlayerHonor> | null>(null);
    const [selectedPlayerForModal, setSelectedPlayerForModal] = useState<Player | null>(null);

    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => (b.stats?.xp ?? 0) - (a.stats?.xp ?? 0));
    }, [players]);

    const topThree = sortedPlayers.slice(0, 3);
    const rest = sortedPlayers.slice(3);

    const availableCategories = useMemo(() => {
        const set = new Set<string>();
        honors.forEach(h => {
            if (h.type && h.type.trim()) set.add(h.type.trim());
        });
        return Array.from(set);
    }, [honors]);

    const filteredHonors = useMemo(() => {
        let list = [...honors];
        if (honorFilter !== 'all') {
            const filterNorm = honorFilter.toLowerCase().trim();
            list = list.filter(h => {
                const typeNorm = (h.type || '').toLowerCase().trim();
                if (filterNorm === 'match') return typeNorm.includes('match') || typeNorm === 'man_of_the_match';
                if (filterNorm === 'month') return typeNorm.includes('month') || typeNorm === 'man_of_the_month';
                if (filterNorm === 'year') return typeNorm.includes('year') || typeNorm === 'man_of_the_year';
                return typeNorm === filterNorm;
            });
        }
        return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [honors, honorFilter]);

    const handleSaveHonor = async (honorData: PlayerHonor | Omit<PlayerHonor, 'id'>) => {
        setEditingHonor(null);
        if ('id' in honorData && honorData.id) {
            await dataContext.updateDoc('honors', honorData);
        } else {
            await dataContext.addDoc('honors', honorData);
        }
    };

    const handleDeleteHonor = async (honorId: string) => {
        if (confirm('Are you sure you want to remove this honor record?')) {
            await dataContext.deleteDoc('honors', honorId);
        }
    };

    const getHonorBadge = (type: string = '') => {
        const normalized = type.toLowerCase().replace(/[_\-\s]+/g, ' ').trim();
        if (normalized.includes('match') || normalized === 'man of match') {
            return { label: type || 'Man of Match', badgeBg: 'bg-amber-950/70 border-amber-500/60 text-amber-400', icon: '🌟' };
        }
        if (normalized.includes('month') || normalized === 'man of month') {
            return { label: type || 'Man of Month', badgeBg: 'bg-purple-950/70 border-purple-500/60 text-purple-300', icon: '🏆' };
        }
        if (normalized.includes('year') || normalized === 'man of year') {
            return { label: type || 'Man of Year', badgeBg: 'bg-gradient-to-r from-amber-600/30 to-amber-900/30 border-amber-400 text-amber-200', icon: '👑' };
        }
        return { label: type || 'Honor', badgeBg: 'bg-zinc-800 border-amber-500/50 text-amber-300', icon: '🎖️' };
    };

    return (
        <div className="flex flex-col h-full">
            {/* View Switcher Header */}
            <div className="p-2 sm:p-3 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between gap-1.5 flex-wrap">
                <div className="flex items-center gap-1 p-0.5 sm:p-1 bg-zinc-900 rounded-lg border border-zinc-800">
                    <button
                        onClick={() => setViewMode('leaderboard')}
                        className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 ${viewMode === 'leaderboard' ? 'bg-red-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <CrownIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> RP Standings
                    </button>
                    <button
                        onClick={() => setViewMode('honors')}
                        className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold transition-all flex items-center gap-1 ${viewMode === 'honors' ? 'bg-amber-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}
                    >
                        <TrophyIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Hall of Fame ({honors.length})
                    </button>
                </div>

                {viewMode === 'honors' && (
                    <div className="flex items-center gap-1.5">
                        <select
                            value={honorFilter}
                            onChange={e => setHonorFilter(e.target.value)}
                            className="bg-zinc-900 border border-zinc-700 rounded-lg px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-xs text-white focus:outline-none"
                        >
                            <option value="all">All Honors</option>
                            <option value="match">Man of Match</option>
                            <option value="month">Man of Month</option>
                            <option value="year">Man of Year</option>
                            {availableCategories.filter(c => !['match', 'month', 'year', 'man of match', 'man of month', 'man of year', 'man_of_the_match', 'man_of_the_month', 'man_of_the_year'].includes(c.toLowerCase())).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        {isAdmin && (
                            <Button
                                size="sm"
                                onClick={() => setEditingHonor({})}
                                className="bg-amber-600 hover:bg-amber-500 text-white !px-2 !py-0.5 text-[10px] sm:text-xs font-bold flex items-center gap-1"
                            >
                                <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Record Honor
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {viewMode === 'leaderboard' ? (
                <>
                    <div className="leaderboard-podium-bg">
                        <motion.div
                            className="podium-container"
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                        >
                            {topThree.length > 1 && <PodiumPlayer player={topThree[1]} rank={2} delay={0.1} onSelectPlayer={setSelectedPlayerForModal} />}
                            {topThree.length > 0 && <PodiumPlayer player={topThree[0]} rank={1} delay={0} onSelectPlayer={setSelectedPlayerForModal} />}
                            {topThree.length > 2 && <PodiumPlayer player={topThree[2]} rank={3} delay={0.2} onSelectPlayer={setSelectedPlayerForModal} />}
                        </motion.div>
                    </div>
                    <div className="flex-grow overflow-y-auto p-1.5 sm:p-4">
                        <ul className="space-y-1 sm:space-y-2">
                            {rest.map((player, index) => (
                                <RankedPlayerListItem
                                    key={player.id}
                                    player={player}
                                    rank={index + 4}
                                    isCurrentUser={player.id === currentPlayerId}
                                    onSelectPlayer={setSelectedPlayerForModal}
                                />
                            ))}
                        </ul>
                    </div>
                </>
            ) : (
                <div className="flex-grow overflow-y-auto p-2 sm:p-4 space-y-3">
                    {filteredHonors.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-1.5 sm:gap-3">
                            {filteredHonors.map(honor => {
                                const badgeInfo = getHonorBadge(honor.type);
                                const playerObj = players.find(p => p.id === honor.playerId);
                                const name = honor.playerName || playerObj?.name || 'Player';
                                const callsign = honor.playerCallsign || playerObj?.callsign || '';
                                const avatar = honor.playerAvatarUrl || playerObj?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(callsign || name || 'OP')}&background=18181b&color=ef4444&bold=true`;

                                return (
                                    <div
                                        key={honor.id}
                                        onClick={() => playerObj && setSelectedPlayerForModal(playerObj)}
                                        className={`bg-zinc-900/90 border border-zinc-800 rounded-xl p-2 sm:p-4 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-md relative group overflow-hidden ${playerObj ? 'cursor-pointer' : ''}`}
                                        title={playerObj ? 'Click to view player stats & badges' : ''}
                                    >
                                        <div className="flex items-start justify-between gap-1 sm:gap-3">
                                            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
                                                <img
                                                    src={avatar}
                                                    alt={name}
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(callsign || name || 'OP')}&background=18181b&color=ef4444&bold=true`;
                                                    }}
                                                    className="w-7 h-7 sm:w-12 sm:h-12 rounded-full border border-amber-500/50 bg-zinc-950 object-cover flex-shrink-0 group-hover:border-amber-400 transition-colors"
                                                />
                                                <div className="min-w-0">
                                                    <span className={`inline-flex items-center gap-1 text-[8px] sm:text-[11px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${badgeInfo.badgeBg} mb-0.5 truncate max-w-full`}>
                                                        {honor.badgeImageUrl && honor.badgeImageUrl.trim() !== '' ? (
                                                            <img src={honor.badgeImageUrl} alt={badgeInfo.label} className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain rounded-full inline-block flex-shrink-0" />
                                                        ) : (
                                                            <span>{badgeInfo.icon}</span>
                                                        )}
                                                        <span className="truncate">{badgeInfo.label}</span>
                                                    </span>
                                                    <h3 className="font-bold text-white text-xs sm:text-base leading-tight truncate group-hover:text-amber-300 transition-colors">
                                                        {name}
                                                    </h3>
                                                    {callsign && <p className="text-amber-400 font-mono text-[9px] sm:text-xs truncate">"{callsign}"</p>}
                                                    <p className="text-[9px] sm:text-xs text-zinc-400 flex items-center gap-0.5 mt-0.5 truncate">
                                                        <SparklesIcon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-amber-400 flex-shrink-0" />
                                                        <span className="font-semibold text-zinc-200 truncate">{honor.title}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            {isAdmin && (
                                                <div className="flex items-center gap-0.5 flex-shrink-0">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingHonor(honor);
                                                        }}
                                                        className="p-1 text-zinc-400 hover:text-amber-400 transition-colors"
                                                        title="Edit Honor"
                                                    >
                                                        <PencilIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteHonor(honor.id);
                                                        }}
                                                        className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                                                        title="Delete Honor"
                                                    >
                                                        <TrashIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {honor.notes && (
                                            <p className="mt-1.5 sm:mt-3 text-[9px] sm:text-xs text-zinc-300 italic bg-zinc-950/60 p-1.5 sm:p-2.5 rounded-lg border border-zinc-800/80 line-clamp-2">
                                                "{honor.notes}"
                                            </p>
                                        )}

                                        <div className="mt-1.5 sm:mt-3 pt-1 sm:pt-2 border-t border-zinc-800/60 flex justify-between items-center text-[8px] sm:text-[11px] text-zinc-500">
                                            <span className="flex items-center gap-0.5 truncate">
                                                <CalendarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" /> {honor.date}
                                            </span>
                                            <span className="font-mono text-amber-500/80 uppercase tracking-widest text-[7px] sm:text-[10px] hidden sm:inline">Official</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-zinc-900/40 rounded-xl border border-dashed border-zinc-800">
                            <TrophyIcon className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
                            <p className="text-zinc-400 font-semibold text-sm">No honors recorded yet for this filter.</p>
                            {isAdmin && (
                                <p className="text-xs text-amber-400 mt-1">Click "Record Honor" above to award Man of the Match, Month, or Year.</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {editingHonor && (
                <AdminHonorModal
                    honor={editingHonor}
                    players={players}
                    onClose={() => setEditingHonor(null)}
                    onSave={handleSaveHonor}
                />
            )}

            {selectedPlayerForModal && (
                <PlayerStatsModal
                    player={selectedPlayerForModal}
                    onClose={() => setSelectedPlayerForModal(null)}
                />
            )}
        </div>
    );
};
