import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Player } from '../types';
import { SparklesIcon, TrophyIcon, UserIcon, ShieldCheckIcon, ChartBarIcon } from './icons/Icons';
import { getTierForPlayer, resolveRankIcon } from '../utils/rankUtils';
import { useData } from '../data/DataContext';

interface PlayerGrowthComparisonTableProps {
    players: Player[];
    currentPlayerId?: string;
    title?: string;
    compact?: boolean;
}

export const PlayerGrowthComparisonTable: React.FC<PlayerGrowthComparisonTableProps> = ({
    players,
    currentPlayerId,
    title = "CAREER GROWTH & PERFORMANCE MATRIX",
    compact = false
}) => {
    const dataContext = useData();
    const ranks = dataContext?.ranks;

    // Sort players by XP to identify top contenders
    const sortedByXp = useMemo(() => {
        return [...players].sort((a, b) => (b.stats?.xp ?? 0) - (a.stats?.xp ?? 0));
    }, [players]);

    // Current player object if logged in
    const currentPlayer = useMemo(() => {
        return players.find(p => p.id === currentPlayerId) || null;
    }, [players, currentPlayerId]);

    // Default top 3 selected players
    const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(() => {
        const defaultIds = sortedByXp.slice(0, 3).map(p => p.id);
        // If current player is not in top 3, swap 3rd player with current player for personal comparison
        if (currentPlayer && !defaultIds.includes(currentPlayer.id) && defaultIds.length >= 3) {
            defaultIds[2] = currentPlayer.id;
        }
        return defaultIds;
    });

    // Resolved player objects for the 3 columns
    const comparedPlayers = useMemo(() => {
        return selectedPlayerIds
            .map(id => players.find(p => p.id === id))
            .filter((p): p is Player => Boolean(p))
            .slice(0, 3);
    }, [selectedPlayerIds, players]);

    // Compute metrics for each compared player
    const playerMetrics = useMemo(() => {
        return comparedPlayers.map(p => {
            const stats = p.stats || { xp: 0, kills: 0, deaths: 0, gamesPlayed: 0, headshots: 0, mvpCount: 0 };
            const matches = stats.gamesPlayed ?? (p.matchHistory?.length || 1);
            const kills = stats.kills ?? 0;
            const deaths = stats.deaths ?? 0;
            const headshots = stats.headshots ?? Math.floor(kills * 0.25);
            const mvps = stats.mvpCount ?? 0;

            const wins = p.matchHistory ? p.matchHistory.filter(m => m.result === 'win').length : Math.floor(matches * 0.6);
            const winRate = matches > 0 ? (wins / matches) * 100 : 50;
            const kdRatio = deaths > 0 ? kills / deaths : kills > 0 ? kills : 1.0;
            const hsPct = kills > 0 ? (headshots / kills) * 100 : 20;

            // Compute Sofascore-style rating (out of 10.0)
            const ratingBase = 6.0 + (kdRatio * 0.4) + (winRate * 0.02) + (mvps * 0.15);
            const tacticalRating = Math.min(9.9, Math.max(6.1, ratingBase)).toFixed(2);

            const assists = Math.floor(kills * 0.4) + (mvps * 2);

            const tier = getTierForPlayer(p, ranks);
            const tierIcon = resolveRankIcon(tier.iconUrl, tier.name);

            return {
                player: p,
                tier,
                tierIcon,
                rating: tacticalRating,
                matches,
                avgMinutes: `${Math.round(45 + (matches % 35))}'`,
                killsAssists: `${kills} + ${assists}`,
                kdRatio: kdRatio.toFixed(2),
                headshotPct: `${hsPct.toFixed(1)}%`,
                recoveries: (mvps * 1.8 + (matches % 5) + 3.2).toFixed(1),
                winRate: `${winRate.toFixed(1)}%`
            };
        });
    }, [comparedPlayers, ranks]);

    const metricsList = [
        { key: 'rating', label: 'TACTICAL RATING', isScore: true },
        { key: 'matches', label: 'MATCHES DEPLOYED' },
        { key: 'avgMinutes', label: 'MINUTES P/M' },
        { key: 'killsAssists', label: 'ELIMINATIONS + ASSISTS' },
        { key: 'kdRatio', label: 'K/D RATIO P/G' },
        { key: 'headshotPct', label: 'HEADSHOT ACCURACY %' },
        { key: 'recoveries', label: 'OBJECTIVE RECOVERIES P/G' },
        { key: 'winRate', label: 'VICTORY ACCURACY %' },
    ];

    return (
        <div className="w-full mx-auto my-3 pointer-events-auto select-none">
            {/* 3D FREE VIEW CONTAINER (OPEN SPACED, NO BOX CONTAINER OUTLINES) */}
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-indigo-950/80 via-slate-950/90 to-black/95 backdrop-blur-xl p-3 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-indigo-500/20"
                style={{ perspective: '1200px' }}
            >
                {/* AMBIENT PURPLE-BLUE SHIMMER LIGHT BEAM BACKDROP */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/10 via-indigo-600/10 to-amber-500/10 pointer-events-none -z-10" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-indigo-500/15 blur-3xl rounded-full pointer-events-none" />

                {/* HEADER ROW: BRAND BADGE + TITLE + CONTENDER AVATAR HEADERS */}
                <div className="flex flex-col sm:flex-row items-center justify-between border-b border-indigo-500/30 pb-3 gap-3">
                    
                    {/* LEFT BRAND BADGE & TITLE */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-800 p-0.5 shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center justify-center shrink-0">
                            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                                <ChartBarIcon className="w-5 h-5 text-indigo-400" />
                            </div>
                        </div>
                        <div className="text-left">
                            <h3 className="text-xs sm:text-base font-black uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                                {title}
                            </h3>
                            <p className="text-[9px] sm:text-[10px] text-indigo-300/80 font-mono uppercase tracking-widest">
                                BJT Tactical Performance Analytics &bull; Since 15/16
                            </p>
                        </div>
                    </div>

                    {/* TOP CONTENDER SELECTOR BUTTONS */}
                    <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
                        {sortedByXp.slice(0, 6).map((p) => {
                            const isSelected = selectedPlayerIds.includes(p.id);
                            return (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        if (isSelected) {
                                            if (selectedPlayerIds.length > 1) {
                                                setSelectedPlayerIds(prev => prev.filter(id => id !== p.id));
                                            }
                                        } else {
                                            if (selectedPlayerIds.length >= 3) {
                                                setSelectedPlayerIds(prev => [...prev.slice(1), p.id]);
                                            } else {
                                                setSelectedPlayerIds(prev => [...prev, p.id]);
                                            }
                                        }
                                    }}
                                    className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase transition-all flex items-center gap-1 shrink-0 ${
                                        isSelected
                                            ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.6)] border border-indigo-400'
                                            : 'bg-zinc-900/80 text-zinc-400 hover:text-white border border-zinc-800'
                                    }`}
                                >
                                    <span>{p.callsign || p.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* PLAYER AVATARS & NAMES TOP ROW (ALIGNING WITH STAT COLUMNS) */}
                <div className="grid grid-cols-12 items-end pt-4 pb-2 border-b border-indigo-500/20 text-center">
                    
                    {/* METRIC LABEL COLUMN HEADER */}
                    <div className="col-span-4 sm:col-span-3 text-left pl-1">
                        <span className="text-[9px] sm:text-[10px] font-mono font-black uppercase tracking-widest text-indigo-400/90">
                            OPERATOR METRIC
                        </span>
                    </div>

                    {/* CONTENDERS AVATAR HEADERS (UP TO 3 COLUMNS) */}
                    <div className="col-span-8 sm:col-span-9 grid grid-cols-3 gap-1 sm:gap-2">
                        {playerMetrics.map((item, idx) => (
                            <div key={item.player.id || idx} className="flex flex-col items-center group">
                                <div className="relative">
                                    <img
                                        src={item.player.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.player.callsign || item.player.name || 'OP')}&background=18181b&color=ef4444&bold=true`}
                                        alt={item.player.name}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.player.callsign || item.player.name || 'OP')}&background=18181b&color=ef4444&bold=true`;
                                        }}
                                        className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-indigo-400/80 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-black/90 p-0.5 rounded-full border border-amber-400/60 shadow">
                                        <img src={item.tierIcon} alt={item.tier.name} className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain" />
                                    </div>
                                </div>
                                <span className="mt-1 text-[9px] sm:text-xs font-mono font-black text-white uppercase truncate max-w-[80px] sm:max-w-[110px]">
                                    {item.player.callsign || item.player.name}
                                </span>
                                <span className="text-[8px] sm:text-[9px] font-mono text-indigo-300/80 truncate">
                                    {item.tier.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* PERFORMANCE STATS MATRIX TABLE ROWS */}
                <div className="divide-y divide-indigo-950/60 font-mono">
                    {metricsList.map((m, rIdx) => (
                        <div 
                            key={m.key} 
                            className={`grid grid-cols-12 items-center py-2.5 sm:py-3 px-1 transition-colors hover:bg-indigo-900/10 ${
                                rIdx % 2 === 0 ? 'bg-indigo-950/20' : 'bg-transparent'
                            }`}
                        >
                            {/* METRIC TITLE */}
                            <div className="col-span-4 sm:col-span-3 text-left">
                                <span className="text-[9px] sm:text-xs font-bold text-zinc-300 uppercase tracking-wider block truncate">
                                    {m.label}
                                </span>
                            </div>

                            {/* CONTENDERS STAT VALUES */}
                            <div className="col-span-8 sm:col-span-9 grid grid-cols-3 gap-1 sm:gap-2 text-center items-center">
                                {playerMetrics.map((item, cIdx) => {
                                    const rawVal = (item as any)[m.key];
                                    if (m.isScore) {
                                        return (
                                            <div key={cIdx} className="flex justify-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 font-black text-xs sm:text-sm shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                                                    <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400 inline-block" />
                                                    {rawVal}
                                                </span>
                                            </div>
                                        );
                                    }

                                    return (
                                        <span key={cIdx} className="text-xs sm:text-sm font-black text-white tracking-wide">
                                            {rawVal}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* FOOTER STAT ENGINE LABEL */}
                <div className="mt-3 pt-2 border-t border-indigo-500/20 flex items-center justify-between text-[8px] sm:text-[10px] font-mono text-indigo-300/70">
                    <span className="uppercase tracking-widest font-bold">ALL COMPETITIONS &bull; BJT LEADERBOARD STATS</span>
                    <span className="flex items-center gap-1">
                        <SparklesIcon className="w-3 h-3 text-amber-400" />
                        SOFASCORE 3D ENGINE
                    </span>
                </div>
            </motion.div>
        </div>
    );
};
