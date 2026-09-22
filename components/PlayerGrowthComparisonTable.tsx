import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Player } from '../types';
import { SparklesIcon, ChartBarIcon } from './icons/Icons';
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

    const sortedByXp = useMemo(() => {
        return [...players].sort((a, b) => (b.stats?.xp ?? 0) - (a.stats?.xp ?? 0));
    }, [players]);

    const currentPlayer = useMemo(() => {
        return players.find(p => p.id === currentPlayerId) || null;
    }, [players, currentPlayerId]);

    const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(() => {
        const defaultIds = sortedByXp.slice(0, 3).map(p => p.id);
        if (currentPlayer && !defaultIds.includes(currentPlayer.id) && defaultIds.length >= 3) {
            defaultIds[2] = currentPlayer.id;
        }
        return defaultIds;
    });

    const comparedPlayers = useMemo(() => {
        return selectedPlayerIds
            .map(id => players.find(p => p.id === id))
            .filter((p): p is Player => Boolean(p))
            .slice(0, 3);
    }, [selectedPlayerIds, players]);

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
        { key: 'matches', label: 'DEPLOYMENTS' },
        { key: 'avgMinutes', label: 'MIN/MATCH' },
        { key: 'killsAssists', label: 'ELIM + AST' },
        { key: 'kdRatio', label: 'K/D RATIO' },
        { key: 'recoveries', label: 'OBJ RECOV' },
        { key: 'winRate', label: 'VICTORY %' },
    ];

    return (
        <div className="w-full max-w-3xl mx-auto my-1 pointer-events-auto select-none">
            {/* 3D FREE VIEW CONTAINER - BORDERLESS 3D SHADOW DEPTH */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950/95 via-zinc-950/95 to-black p-3 sm:p-4 shadow-[0_25px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
                style={{ perspective: '1200px' }}
            >
                {/* 3D AMBIENT BACKDROP GLOW */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/30 via-purple-950/20 to-transparent pointer-events-none -z-10" />

                {/* HEADER: TITLE + SELECTOR */}
                <div className="flex flex-col sm:flex-row items-center justify-between pb-3 gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-800 p-0.5 shadow-[0_0_12px_rgba(99,102,241,0.5)] flex items-center justify-center shrink-0">
                            <ChartBarIcon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white font-mono">
                                {title}
                            </h3>
                            <p className="text-[8px] sm:text-[9px] text-indigo-400 font-mono tracking-widest uppercase">
                                3D Tactical Telemetry Matrix
                            </p>
                        </div>
                    </div>

                    {/* QUICK CONTENDER SWITCHER */}
                    <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-0.5 scrollbar-none">
                        {sortedByXp.slice(0, 5).map((p) => {
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
                                    className={`px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-mono font-bold uppercase transition-all shrink-0 ${
                                        isSelected
                                            ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.7)]'
                                            : 'bg-zinc-900/60 text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    {p.callsign || p.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* OPERATOR AVATARS */}
                <div className="grid grid-cols-12 items-end pt-2 pb-2 text-center">
                    <div className="col-span-4 sm:col-span-3 text-left pl-1">
                        <span className="text-[8px] sm:text-[9px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
                            OPERATIVE
                        </span>
                    </div>
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
                                        className="w-9 h-9 sm:w-12 sm:h-12 rounded-full object-cover border border-indigo-500/50 shadow-[0_4px_12px_rgba(0,0,0,0.8)] transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-black p-0.5 rounded-full shadow">
                                        <img src={item.tierIcon} alt={item.tier.name} className="w-3 h-3 sm:w-3.5 sm:h-3.5 object-contain" />
                                    </div>
                                </div>
                                <span className="mt-1 text-[9px] sm:text-[11px] font-mono font-bold text-white uppercase truncate max-w-[75px] sm:max-w-[100px]">
                                    {item.player.callsign || item.player.name}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* METRICS ROWS - BORDERLESS SHRINK TO FIT */}
                <div className="space-y-1 font-mono pt-1">
                    {metricsList.map((m, rIdx) => (
                        <div 
                            key={m.key} 
                            className={`grid grid-cols-12 items-center py-1 px-1 rounded-lg transition-colors hover:bg-white/[0.03] ${
                                rIdx % 2 === 0 ? 'bg-white/[0.015]' : 'bg-transparent'
                            }`}
                        >
                            <div className="col-span-4 sm:col-span-3 text-left">
                                <span className="text-[8px] sm:text-[10px] font-medium text-zinc-400 tracking-wider truncate block">
                                    {m.label}
                                </span>
                            </div>
                            <div className="col-span-8 sm:col-span-9 grid grid-cols-3 gap-1 sm:gap-2 text-center items-center">
                                {playerMetrics.map((item, cIdx) => {
                                    const rawVal = (item as any)[m.key];
                                    if (m.isScore) {
                                        return (
                                            <div key={cIdx} className="flex justify-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px] sm:text-xs shadow-[0_0_10px_rgba(52,211,153,0.15)]">
                                                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                                    {rawVal}
                                                </span>
                                            </div>
                                        );
                                    }
                                    return (
                                        <span key={cIdx} className="text-[10px] sm:text-xs font-bold text-white tracking-tight">
                                            {rawVal}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* FOOTER */}
                <div className="mt-2 pt-2 flex items-center justify-between text-[7px] sm:text-[9px] font-mono text-zinc-500">
                    <span className="uppercase tracking-wider">BJT TELEMETRY ENGINE</span>
                    <span className="flex items-center gap-1 text-indigo-400/80">
                        <SparklesIcon className="w-2.5 h-2.5" /> 3D DEPTH VIEW
                    </span>
                </div>
            </motion.div>
        </div>
    );
};
