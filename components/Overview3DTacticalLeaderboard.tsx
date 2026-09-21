import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Player } from '../types';
import { TrophyIcon, CrownIcon, SparklesIcon, ChevronDownIcon, UserIcon } from './icons/Icons';
import { getTierForPlayer, resolveRankIcon, getRankBadgeSvg } from '../utils/rankUtils';
import { useData } from '../data/DataContext';

interface Overview3DTacticalLeaderboardProps {
    players: Player[];
    currentPlayerId?: string;
    onSelectPlayer: (player: Player) => void;
}

export const Overview3DTacticalLeaderboard: React.FC<Overview3DTacticalLeaderboardProps> = ({
    players,
    currentPlayerId,
    onSelectPlayer
}) => {
    const dataContext = useData();
    const ranks = dataContext?.ranks;

    const [topFilter, setTopFilter] = useState<'top3' | 'top5' | 'top10'>('top3');

    // Sort all players by XP descending
    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => (b.stats?.xp ?? 0) - (a.stats?.xp ?? 0));
    }, [players]);

    const topThree = sortedPlayers.slice(0, 3);

    // Get list of additional players based on top filter
    const additionalPlayers = useMemo(() => {
        if (topFilter === 'top5') return sortedPlayers.slice(3, 5);
        if (topFilter === 'top10') return sortedPlayers.slice(3, 10);
        return [];
    }, [sortedPlayers, topFilter]);

    return (
        <div className="w-full max-w-4xl mx-auto my-3 pointer-events-auto select-none">
            {/* 3D FREE VIEW AIRSOFT TACTICAL LEADERBOARD CONTAINER */}
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-zinc-950 via-zinc-900/90 to-black backdrop-blur-xl p-3 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-amber-500/30"
                style={{ perspective: '1000px' }}
            >
                {/* TACTICAL LASER GRID BACKDROP LIGHT */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-red-950/20 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_15px_#f59e0b]" />

                {/* HEADER ROW WITH SWITCHER (TOP 3, TOP 5, TOP 10) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-zinc-800 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 p-0.5 shadow-[0_0_12px_rgba(245,158,11,0.5)] flex items-center justify-center shrink-0">
                            <TrophyIcon className="w-4 h-4 text-black font-black" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white font-mono flex items-center gap-1.5">
                                TACTICAL RANKED LEADERBOARD
                            </h3>
                            <p className="text-[9px] sm:text-[10px] text-zinc-400 font-mono">
                                AIRSOFT COMPETITIVE SEASON STANDINGS
                            </p>
                        </div>
                    </div>

                    {/* TOP 3 / TOP 5 / TOP 10 TOGGLE BUTTONS */}
                    <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 shadow-inner">
                        <button
                            onClick={() => setTopFilter('top3')}
                            className={`px-3 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-black uppercase transition-all flex items-center gap-1 ${
                                topFilter === 'top3'
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)] font-extrabold'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            <CrownIcon className="w-3 h-3" /> Top 3
                        </button>
                        <button
                            onClick={() => setTopFilter('top5')}
                            className={`px-3 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-black uppercase transition-all flex items-center gap-1 ${
                                topFilter === 'top5'
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)] font-extrabold'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            Top 5
                        </button>
                        <button
                            onClick={() => setTopFilter('top10')}
                            className={`px-3 py-1 rounded-lg text-[10px] sm:text-xs font-mono font-black uppercase transition-all flex items-center gap-1 ${
                                topFilter === 'top10'
                                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_12px_rgba(245,158,11,0.6)] font-extrabold'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            Top 10
                        </button>
                    </div>
                </div>

                {/* 3D PODIUM STAGE FOR TOP 3 */}
                <div className="relative pt-6 pb-2 px-2 flex justify-center items-end gap-2 sm:gap-4 my-2">
                    
                    {/* RANK #2 (SILVER - LEFT) */}
                    {topThree.length > 1 && (
                        <div 
                            onClick={() => onSelectPlayer(topThree[1])}
                            className="flex flex-col items-center group cursor-pointer w-24 sm:w-32 transition-transform duration-300 hover:-translate-y-1.5"
                        >
                            {/* Avatar & Rank Ring */}
                            <div className="relative mb-2">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-b from-slate-300 via-slate-400 to-slate-700 shadow-[0_0_20px_rgba(203,213,225,0.4)]">
                                    <img
                                        src={topThree[1].avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[1].callsign || topThree[1].name || 'OP')}&background=18181b&color=ef4444&bold=true`}
                                        alt={topThree[1].name}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[1].callsign || topThree[1].name || 'OP')}&background=18181b&color=ef4444&bold=true`;
                                        }}
                                        className="w-full h-full rounded-full object-cover bg-zinc-900"
                                    />
                                </div>
                                <span className="absolute -top-2 -left-1 px-1.5 py-0.5 rounded-md bg-slate-300 text-black font-black text-[9px] font-mono shadow border border-white">
                                    #2
                                </span>
                            </div>

                            {/* Info */}
                            <p className="text-xs sm:text-sm font-black text-white uppercase truncate max-w-full group-hover:text-amber-300 transition-colors">
                                {topThree[1].callsign || topThree[1].name}
                            </p>
                            <p className="text-[10px] font-mono text-slate-300 font-bold">
                                {(topThree[1].stats?.xp ?? 0).toLocaleString()} RP
                            </p>

                            {/* 3D Metallic Pedestal Base */}
                            <div className="w-full h-16 sm:h-20 mt-2 rounded-t-xl bg-gradient-to-b from-slate-800 via-zinc-900 to-slate-950 border-t-2 border-slate-400 flex flex-col items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
                                <span className="text-xl sm:text-2xl font-black text-slate-300 font-mono">2</span>
                                <span className="text-[8px] sm:text-[9px] text-slate-400 font-mono uppercase tracking-widest">SILVER</span>
                            </div>
                        </div>
                    )}

                    {/* RANK #1 (GOLD - CENTER HIGHEST) */}
                    {topThree.length > 0 && (
                        <div 
                            onClick={() => onSelectPlayer(topThree[0])}
                            className="flex flex-col items-center group cursor-pointer w-28 sm:w-36 -mt-4 transition-transform duration-300 hover:-translate-y-2 z-10"
                        >
                            {/* Crown & Avatar */}
                            <div className="relative mb-2">
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-amber-400 animate-bounce">
                                    <CrownIcon className="w-6 h-6 filter drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                                </div>
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-b from-yellow-300 via-amber-500 to-amber-700 shadow-[0_0_30px_rgba(245,158,11,0.6)]">
                                    <img
                                        src={topThree[0].avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[0].callsign || topThree[0].name || 'OP')}&background=18181b&color=ef4444&bold=true`}
                                        alt={topThree[0].name}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[0].callsign || topThree[0].name || 'OP')}&background=18181b&color=ef4444&bold=true`;
                                        }}
                                        className="w-full h-full rounded-full object-cover bg-zinc-900 border-2 border-yellow-300"
                                    />
                                </div>
                                <span className="absolute -top-1 -left-1 px-2 py-0.5 rounded-md bg-amber-400 text-black font-black text-[10px] font-mono shadow-md border border-yellow-200">
                                    #1
                                </span>
                            </div>

                            {/* Info */}
                            <p className="text-sm sm:text-base font-black text-amber-300 uppercase truncate max-w-full group-hover:text-yellow-200 transition-colors">
                                {topThree[0].callsign || topThree[0].name}
                            </p>
                            <p className="text-xs font-mono text-amber-400 font-black">
                                {(topThree[0].stats?.xp ?? 0).toLocaleString()} RP
                            </p>

                            {/* 3D Metallic Pedestal Base */}
                            <div className="w-full h-22 sm:h-28 mt-2 rounded-t-xl bg-gradient-to-b from-amber-950/90 via-zinc-900 to-black border-t-2 border-amber-400 flex flex-col items-center justify-center shadow-[0_12px_25px_rgba(245,158,11,0.3)]">
                                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">1</span>
                                <span className="text-[8px] sm:text-[9px] text-amber-300 font-mono uppercase tracking-widest">GOLD CHAMP</span>
                            </div>
                        </div>
                    )}

                    {/* RANK #3 (BRONZE - RIGHT) */}
                    {topThree.length > 2 && (
                        <div 
                            onClick={() => onSelectPlayer(topThree[2])}
                            className="flex flex-col items-center group cursor-pointer w-24 sm:w-32 transition-transform duration-300 hover:-translate-y-1.5"
                        >
                            {/* Avatar & Rank Ring */}
                            <div className="relative mb-2">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 shadow-[0_0_20px_rgba(180,83,9,0.4)]">
                                    <img
                                        src={topThree[2].avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[2].callsign || topThree[2].name || 'OP')}&background=18181b&color=ef4444&bold=true`}
                                        alt={topThree[2].name}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[2].callsign || topThree[2].name || 'OP')}&background=18181b&color=ef4444&bold=true`;
                                        }}
                                        className="w-full h-full rounded-full object-cover bg-zinc-900"
                                    />
                                </div>
                                <span className="absolute -top-2 -left-1 px-1.5 py-0.5 rounded-md bg-amber-700 text-white font-black text-[9px] font-mono shadow border border-amber-500">
                                    #3
                                </span>
                            </div>

                            {/* Info */}
                            <p className="text-xs sm:text-sm font-black text-white uppercase truncate max-w-full group-hover:text-amber-300 transition-colors">
                                {topThree[2].callsign || topThree[2].name}
                            </p>
                            <p className="text-[10px] font-mono text-amber-400/90 font-bold">
                                {(topThree[2].stats?.xp ?? 0).toLocaleString()} RP
                            </p>

                            {/* 3D Metallic Pedestal Base */}
                            <div className="w-full h-14 sm:h-16 mt-2 rounded-t-xl bg-gradient-to-b from-amber-950/60 via-zinc-900 to-zinc-950 border-t-2 border-amber-600 flex flex-col items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
                                <span className="text-xl sm:text-2xl font-black text-amber-600 font-mono">3</span>
                                <span className="text-[8px] sm:text-[9px] text-amber-600 font-mono uppercase tracking-widest">BRONZE</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* EXPANDED RANK ROWS FOR TOP 5 OR TOP 10 */}
                {additionalPlayers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-1.5">
                        <p className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest text-left px-1 mb-2">
                            CONTENDER STANDINGS ({topFilter === 'top5' ? 'RANKS 4 - 5' : 'RANKS 4 - 10'})
                        </p>
                        {additionalPlayers.map((p, idx) => {
                            const rankNum = idx + 4;
                            const tier = getTierForPlayer(p, ranks);
                            const tierIcon = resolveRankIcon(tier.iconUrl, tier.name);
                            const isCurrentUser = p.id === currentPlayerId;

                            return (
                                <div
                                    key={p.id}
                                    onClick={() => onSelectPlayer(p)}
                                    className={`p-2 rounded-xl border transition-all flex items-center justify-between cursor-pointer group ${
                                        isCurrentUser
                                            ? 'bg-amber-950/40 border-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                                            : 'bg-zinc-900/80 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="w-6 text-center font-mono font-black text-xs text-zinc-400 group-hover:text-amber-400 transition-colors">
                                            #{rankNum}
                                        </span>
                                        <img
                                            src={p.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.callsign || p.name || 'OP')}&background=18181b&color=ef4444&bold=true`}
                                            alt={p.name}
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.callsign || p.name || 'OP')}&background=18181b&color=ef4444&bold=true`;
                                            }}
                                            className="w-8 h-8 rounded-lg object-cover bg-zinc-950 border border-zinc-700 shrink-0"
                                        />
                                        <div className="min-w-0 text-left">
                                            <p className="text-xs font-black text-white truncate group-hover:text-amber-300 transition-colors">
                                                {p.callsign || p.name} {isCurrentUser && <span className="text-[9px] text-amber-400 font-mono ml-1">(YOU)</span>}
                                            </p>
                                            <p className="text-[9px] font-mono text-zinc-400 truncate flex items-center gap-1">
                                                <img src={tierIcon} alt={tier.name} className="w-3 h-3 inline-block" />
                                                <span>{tier.name}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <span className="text-xs font-black font-mono text-amber-400 block">
                                            {(p.stats?.xp ?? 0).toLocaleString()} RP
                                        </span>
                                        <span className="text-[8px] font-mono text-zinc-500 uppercase">Inspect Stats</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </motion.div>
        </div>
    );
};
