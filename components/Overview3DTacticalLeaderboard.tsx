import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Player } from '../types';
import { TrophyIcon, CrownIcon, SparklesIcon } from './icons/Icons';
import { getTierForPlayer, resolveRankIcon } from '../utils/rankUtils';
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
        <div className="w-full max-w-4xl mx-auto my-4 pointer-events-auto select-none">
            {/* 3D FREE VIEW OPEN SPACED CONTAINER - NO HARD BOX CONTAINERS OR CARD BORDERS */}
            <motion.div 
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative p-2 sm:p-4 rounded-3xl"
                style={{ perspective: '1200px' }}
            >
                {/* FLOATING AMBIENT LIGHTING & LASER REFLECTION BACKDROP */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-48 bg-gradient-to-tr from-amber-500/10 via-red-600/10 to-indigo-600/10 blur-3xl rounded-full pointer-events-none -z-10" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-transparent via-amber-400/80 to-transparent shadow-[0_0_20px_#f59e0b] pointer-events-none" />

                {/* OPEN FLOATING HEADER ROW WITH SWITCHER */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 relative z-10 px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-red-600 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center shrink-0">
                            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                                <TrophyIcon className="w-4 h-4 text-amber-400 font-black" />
                            </div>
                        </div>
                        <div className="text-left">
                            <h3 className="text-sm sm:text-base font-black uppercase tracking-widest text-white font-mono flex items-center gap-2 drop-shadow-md">
                                TACTICAL LEADERBOARD <span className="text-amber-400 text-xs font-normal font-sans">3D FREE VIEW</span>
                            </h3>
                            <p className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
                                AIRSOFT COMPETITIVE SEASON STANDINGS
                            </p>
                        </div>
                    </div>

                    {/* SLEEK FLOATING GLASS FILTER PILLS (TOP 3 / TOP 5 / TOP 10) */}
                    <div className="flex items-center gap-1.5 bg-zinc-950/80 backdrop-blur-md p-1 rounded-full border border-zinc-800/80 shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
                        <button
                            onClick={() => setTopFilter('top3')}
                            className={`px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-black uppercase transition-all flex items-center gap-1.5 ${
                                topFilter === 'top3'
                                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.7)] font-extrabold'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            <CrownIcon className="w-3.5 h-3.5" /> Top 3
                        </button>
                        <button
                            onClick={() => setTopFilter('top5')}
                            className={`px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-black uppercase transition-all flex items-center gap-1.5 ${
                                topFilter === 'top5'
                                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.7)] font-extrabold'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            Top 5
                        </button>
                        <button
                            onClick={() => setTopFilter('top10')}
                            className={`px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-black uppercase transition-all flex items-center gap-1.5 ${
                                topFilter === 'top10'
                                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.7)] font-extrabold'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            Top 10
                        </button>
                    </div>
                </div>

                {/* 3D FREE VIEW FLOATING PODIUM STAGE (TOP 3) */}
                <div className="relative pt-8 pb-4 px-2 flex justify-center items-end gap-3 sm:gap-6 my-2">
                    
                    {/* RANK #2 (SILVER - LEFT) */}
                    {topThree.length > 1 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            onClick={() => onSelectPlayer(topThree[1])}
                            className="flex flex-col items-center group cursor-pointer w-28 sm:w-36 transition-transform duration-300 hover:-translate-y-2"
                        >
                            {/* Avatar & Silver Ring */}
                            <div className="relative mb-2">
                                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-b from-slate-200 via-slate-400 to-slate-700 shadow-[0_0_25px_rgba(203,213,225,0.5)] group-hover:scale-105 transition-transform">
                                    <img
                                        src={topThree[1].avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[1].callsign || topThree[1].name || 'OP')}&background=18181b&color=ef4444&bold=true`}
                                        alt={topThree[1].name}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[1].callsign || topThree[1].name || 'OP')}&background=18181b&color=ef4444&bold=true`;
                                        }}
                                        className="w-full h-full rounded-full object-cover bg-zinc-950 border-2 border-slate-300"
                                    />
                                </div>
                                <span className="absolute -top-2 -left-1 px-2 py-0.5 rounded-full bg-slate-200 text-black font-black text-[10px] font-mono shadow-md border border-white">
                                    #2
                                </span>
                            </div>

                            {/* Info */}
                            <p className="text-xs sm:text-sm font-black text-white uppercase truncate max-w-full group-hover:text-amber-300 transition-colors">
                                {topThree[1].callsign || topThree[1].name}
                            </p>
                            <p className="text-[10px] sm:text-xs font-mono text-slate-300 font-bold">
                                {(topThree[1].stats?.xp ?? 0).toLocaleString()} RP
                            </p>

                            {/* 3D Open Metallic Floating Pedestal */}
                            <div className="w-full h-16 sm:h-22 mt-2 rounded-2xl bg-gradient-to-b from-slate-700/80 via-zinc-900/90 to-slate-950/90 border-t-2 border-slate-300 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.8)] group-hover:shadow-[0_20px_40px_rgba(203,213,225,0.2)] transition-shadow">
                                <span className="text-2xl sm:text-3xl font-black text-slate-200 font-mono tracking-tight">2</span>
                                <span className="text-[8px] sm:text-[9px] text-slate-400 font-mono uppercase tracking-widest font-bold">SILVER OP</span>
                            </div>
                        </motion.div>
                    )}

                    {/* RANK #1 (GOLD CHAMP - CENTER HIGHEST) */}
                    {topThree.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0 }}
                            onClick={() => onSelectPlayer(topThree[0])}
                            className="flex flex-col items-center group cursor-pointer w-32 sm:w-44 -mt-6 transition-transform duration-300 hover:-translate-y-2.5 z-20"
                        >
                            {/* Floating Crown & Gold Ring */}
                            <div className="relative mb-2">
                                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-400 animate-bounce">
                                    <CrownIcon className="w-7 h-7 filter drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]" />
                                </div>
                                <div className="w-20 h-20 sm:w-26 sm:h-26 rounded-full p-1.5 bg-gradient-to-b from-yellow-300 via-amber-500 to-amber-700 shadow-[0_0_35px_rgba(245,158,11,0.7)] group-hover:scale-105 transition-transform">
                                    <img
                                        src={topThree[0].avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[0].callsign || topThree[0].name || 'OP')}&background=18181b&color=ef4444&bold=true`}
                                        alt={topThree[0].name}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[0].callsign || topThree[0].name || 'OP')}&background=18181b&color=ef4444&bold=true`;
                                        }}
                                        className="w-full h-full rounded-full object-cover bg-zinc-950 border-2 border-yellow-300"
                                    />
                                </div>
                                <span className="absolute -top-1 -left-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-black font-black text-xs font-mono shadow-lg border border-yellow-200">
                                    #1
                                </span>
                            </div>

                            {/* Info */}
                            <p className="text-sm sm:text-base font-black text-amber-300 uppercase truncate max-w-full group-hover:text-yellow-200 transition-colors">
                                {topThree[0].callsign || topThree[0].name}
                            </p>
                            <p className="text-xs sm:text-sm font-mono text-amber-400 font-extrabold">
                                {(topThree[0].stats?.xp ?? 0).toLocaleString()} RP
                            </p>

                            {/* 3D Open Metallic Floating Gold Pedestal */}
                            <div className="w-full h-24 sm:h-32 mt-2 rounded-2xl bg-gradient-to-b from-amber-950/90 via-zinc-950/95 to-black border-t-2 border-amber-400 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_20px_45px_rgba(245,158,11,0.35)] group-hover:shadow-[0_25px_55px_rgba(245,158,11,0.5)] transition-shadow">
                                <span className="text-3xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">1</span>
                                <span className="text-[9px] sm:text-[10px] text-amber-300 font-mono uppercase tracking-widest font-black">GOLD CHAMPION</span>
                            </div>
                        </motion.div>
                    )}

                    {/* RANK #3 (BRONZE - RIGHT) */}
                    {topThree.length > 2 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            onClick={() => onSelectPlayer(topThree[2])}
                            className="flex flex-col items-center group cursor-pointer w-28 sm:w-36 transition-transform duration-300 hover:-translate-y-2"
                        >
                            {/* Avatar & Bronze Ring */}
                            <div className="relative mb-2">
                                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-b from-amber-600 via-amber-800 to-amber-950 shadow-[0_0_25px_rgba(180,83,9,0.5)] group-hover:scale-105 transition-transform">
                                    <img
                                        src={topThree[2].avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[2].callsign || topThree[2].name || 'OP')}&background=18181b&color=ef4444&bold=true`}
                                        alt={topThree[2].name}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(topThree[2].callsign || topThree[2].name || 'OP')}&background=18181b&color=ef4444&bold=true`;
                                        }}
                                        className="w-full h-full rounded-full object-cover bg-zinc-950 border-2 border-amber-600"
                                    />
                                </div>
                                <span className="absolute -top-2 -left-1 px-2 py-0.5 rounded-full bg-amber-700 text-white font-black text-[10px] font-mono shadow-md border border-amber-500">
                                    #3
                                </span>
                            </div>

                            {/* Info */}
                            <p className="text-xs sm:text-sm font-black text-white uppercase truncate max-w-full group-hover:text-amber-300 transition-colors">
                                {topThree[2].callsign || topThree[2].name}
                            </p>
                            <p className="text-[10px] sm:text-xs font-mono text-amber-400/90 font-bold">
                                {(topThree[2].stats?.xp ?? 0).toLocaleString()} RP
                            </p>

                            {/* 3D Open Metallic Floating Pedestal */}
                            <div className="w-full h-14 sm:h-18 mt-2 rounded-2xl bg-gradient-to-b from-amber-950/60 via-zinc-900/90 to-zinc-950/90 border-t-2 border-amber-600 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_15px_30px_rgba(0,0,0,0.8)] group-hover:shadow-[0_20px_40px_rgba(217,119,6,0.3)] transition-shadow">
                                <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono tracking-tight">3</span>
                                <span className="text-[8px] sm:text-[9px] text-amber-600 font-mono uppercase tracking-widest font-bold">BRONZE OP</span>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* OPEN SPACED EXPANDED RANKS (4 - 10) - NO BOX CONTAINER ENCLOSURES */}
                {additionalPlayers.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 pt-4 space-y-2 px-1 sm:px-3"
                    >
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
                            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                                CONTENDER RANKINGS ({topFilter === 'top5' ? 'RANKS 4 - 5' : 'RANKS 4 - 10'})
                            </span>
                            <span className="text-[9px] font-mono text-amber-400/80">Click player to inspect profile</span>
                        </div>

                        {additionalPlayers.map((p, idx) => {
                            const rankNum = idx + 4;
                            const tier = getTierForPlayer(p, ranks);
                            const tierIcon = resolveRankIcon(tier.iconUrl, tier.name);
                            const isCurrentUser = p.id === currentPlayerId;

                            return (
                                <motion.div
                                    key={p.id}
                                    whileHover={{ x: 4 }}
                                    onClick={() => onSelectPlayer(p)}
                                    className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-between cursor-pointer group backdrop-blur-sm ${
                                        isCurrentUser
                                            ? 'bg-amber-950/30 border-l-4 border-amber-500 shadow-[0_5px_15px_rgba(245,158,11,0.15)]'
                                            : 'bg-zinc-950/30 hover:bg-zinc-900/60 border-b border-zinc-800/40'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="w-7 font-mono font-black text-xs text-zinc-400 group-hover:text-amber-400 transition-colors">
                                            #{rankNum}
                                        </span>
                                        <img
                                            src={p.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.callsign || p.name || 'OP')}&background=18181b&color=ef4444&bold=true`}
                                            alt={p.name}
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.callsign || p.name || 'OP')}&background=18181b&color=ef4444&bold=true`;
                                            }}
                                            className="w-9 h-9 rounded-full object-cover bg-zinc-950 border border-zinc-700/80 shrink-0 shadow"
                                        />
                                        <div className="min-w-0 text-left">
                                            <p className="text-xs sm:text-sm font-black text-white truncate group-hover:text-amber-300 transition-colors">
                                                {p.callsign || p.name} {isCurrentUser && <span className="text-[9px] text-amber-400 font-mono ml-1.5">(YOU)</span>}
                                            </p>
                                            <p className="text-[10px] font-mono text-zinc-400 truncate flex items-center gap-1.5 mt-0.5">
                                                <img src={tierIcon} alt={tier.name} className="w-3.5 h-3.5 inline-block" />
                                                <span>{tier.name}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <span className="text-xs sm:text-sm font-black font-mono text-amber-400 block">
                                            {(p.stats?.xp ?? 0).toLocaleString()} RP
                                        </span>
                                        <span className="text-[9px] font-mono text-zinc-500 uppercase group-hover:text-amber-300 transition-colors">Inspect →</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};
