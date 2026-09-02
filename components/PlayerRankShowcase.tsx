import React, { useState, useMemo, useEffect } from 'react';
import type { Player, Rank, Tier, CompanyDetails, GameEvent } from '../types';
import { getRankProgression, getAllTiersSorted, FlatTierItem, DEFAULT_RANKS, resolveRankIcon, getRankBadgeSvg } from '../utils/rankUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheckIcon, 
    TrophyIcon, 
    InformationCircleIcon, 
    XIcon, 
    ChevronRightIcon, 
    ChevronLeftIcon, 
    SparklesIcon, 
    LockClosedIcon, 
    CheckCircleIcon,
    CalendarIcon,
    ArrowRightIcon
} from './icons/Icons';
import { Button } from './Button';
import { PromotionCelebrationModal } from './PromotionCelebrationModal';

interface PlayerRankShowcaseProps {
    player: Player;
    players?: Player[];
    ranks?: Rank[];
    events?: GameEvent[];
    companyDetails?: CompanyDetails;
    onNavigateTab?: (tab: string) => void;
}

export const PlayerRankShowcase: React.FC<PlayerRankShowcaseProps> = ({
    player,
    players = [],
    ranks = [],
    events = [],
    companyDetails,
    onNavigateTab
}) => {
    const activeRanks = ranks && ranks.length > 0 ? ranks : DEFAULT_RANKS;
    const allTiers = useMemo(() => getAllTiersSorted(activeRanks), [activeRanks]);
    const progression = useMemo(() => getRankProgression(player, activeRanks), [player, activeRanks]);
    
    // Default selection is player's current tier
    const [selectedTierId, setSelectedTierId] = useState<string>(progression.current.id);

    // Sync selection when player's rank or tier changes (e.g. after ranking up in Admin)
    useEffect(() => {
        if (progression.current?.id) {
            setSelectedTierId(progression.current.id);
        }
    }, [progression.current?.id]);
    const [showSeasonInfo, setShowSeasonInfo] = useState<boolean>(false);
    const [showAllTiersModal, setShowAllTiersModal] = useState<boolean>(false);
    const [showRewardModal, setShowRewardModal] = useState<boolean>(false);
    const [showCelebrationPreview, setShowCelebrationPreview] = useState<boolean>(false);
    const [viewMode, setViewMode] = useState<'hud' | 'ladder'>('hud');

    // Find currently selected tier object
    const selectedTierIndex = useMemo(() => {
        const idx = allTiers.findIndex(t => t.id === selectedTierId);
        return idx >= 0 ? idx : progression.currentIdx;
    }, [allTiers, selectedTierId, progression.currentIdx]);

    const selectedTier: FlatTierItem = allTiers[selectedTierIndex] || allTiers[0];

    // Compute player tactical combat stats
    const stats = player.stats || { xp: 0, kills: 0, deaths: 0, gamesPlayed: 0, headshots: 0, mvpCount: 0 };
    const playerXp = stats.xp ?? 0;
    const matches = stats.gamesPlayed ?? (player.matchHistory?.length || 0);
    
    // Derive wins from match history or estimated from matches
    const wins = useMemo(() => {
        if (player.matchHistory && player.matchHistory.length > 0) {
            return player.matchHistory.filter(m => m.result === 'win').length;
        }
        return Math.floor(matches * 0.55);
    }, [player.matchHistory, matches]);

    const winRate = matches > 0 ? ((wins / matches) * 100).toFixed(1) : '50.0';
    const kills = stats.kills ?? 0;
    const deaths = stats.deaths ?? 0;
    const kdr = deaths > 0 ? (kills / deaths).toFixed(2) : kills > 0 ? kills.toFixed(2) : '1.00';
    const headshots = stats.headshots ?? Math.floor(kills * 0.28);
    const avgScore = matches > 0 ? Math.round(playerXp / matches) : playerXp || 1250;
    const winStreak = player.matchHistory && player.matchHistory.length > 0
        ? player.matchHistory.reduce((acc, m) => (m.result === 'win' ? acc + 1 : 0), 0)
        : 2;

    // Navigation through tiers
    const prevTier = selectedTierIndex > 0 ? allTiers[selectedTierIndex - 1] : null;
    const nextTier = selectedTierIndex < allTiers.length - 1 ? allTiers[selectedTierIndex + 1] : null;

    const handlePrev = () => {
        if (prevTier) setSelectedTierId(prevTier.id);
    };

    const handleNext = () => {
        if (nextTier) setSelectedTierId(nextTier.id);
    };

    // Calculate rank tier relation to player
    const isCurrentPlayerTier = selectedTier.id === progression.current.id;
    const isUnlocked = playerXp >= selectedTier.minXp;
    const xpNeededForSelected = selectedTier.minXp > playerXp ? selectedTier.minXp - playerXp : 0;

    // Season Date computation
    const seasonEndDate = useMemo(() => {
        if (companyDetails?.nextRankResetDate) {
            try {
                const date = new Date(companyDetails.nextRankResetDate);
                if (!isNaN(date.getTime())) {
                    return date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit', year: '2-digit' });
                }
            } catch (e) {
                // fallback
            }
        }
        return '14/07/26';
    }, [companyDetails?.nextRankResetDate]);

    return (
        <div className="w-full text-white select-none font-sans relative overflow-hidden">
            {/* Ambient tactical lighting effect */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-amber-500/10 via-red-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

            {/* TOP HEADER: COD MOBILE RANKED STYLE (SHRINK-TO-FIT OPEN-SPACE) */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-zinc-800/80 mb-3.5">
                <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-6 sm:h-7 bg-amber-400 rounded-sm shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-black tracking-wider uppercase text-white font-mono drop-shadow-md">
                                RANK MATCH
                            </h1>
                            <button
                                onClick={() => setShowSeasonInfo(true)}
                                className="text-amber-400 hover:text-amber-300 transition-colors p-0.5 rounded-full hover:bg-amber-400/10"
                                title="Season & Rank Rules"
                                aria-label="Season information"
                            >
                                <InformationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-zinc-400 tracking-wider uppercase font-semibold">
                            PRESEASON 1 &bull; AIRSOFT COMPETITIVE LEAGUE
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="text-right hidden sm:block">
                        <span className="text-[9px] text-zinc-500 uppercase tracking-widest block font-mono">Season Reset</span>
                        <span className="text-xs font-bold text-amber-400 font-mono">{seasonEndDate}</span>
                    </div>

                    <div className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded-xl p-0.5 shadow-inner">
                        <button
                            onClick={() => setViewMode('hud')}
                            className={`px-2.5 py-1 text-[11px] sm:text-xs font-bold uppercase rounded-lg transition-all font-mono ${
                                viewMode === 'hud'
                                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            Tactical HUD
                        </button>
                        <button
                            onClick={() => setViewMode('ladder')}
                            className={`px-2.5 py-1 text-[11px] sm:text-xs font-bold uppercase rounded-lg transition-all font-mono ${
                                viewMode === 'ladder'
                                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            All Ranks &amp; Tiers
                        </button>
                    </div>
                </div>
            </div>

            {/* VIEW MODE 1: FREE-VIEW TACTICAL HUD (3-COLUMN SQUARE OPEN-SPACE WORKSTATION) */}
            {viewMode === 'hud' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 items-stretch">
                    
                    {/* COLUMN 1: COMBAT METRICS & OPERATOR INTEL (FREE-VIEW SQUARE 3D HOLO PANEL) */}
                    <div className="relative flex flex-col justify-between p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-zinc-900/40 via-zinc-950/70 to-zinc-950/90 border border-zinc-800/50 shadow-[0_16px_40px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-xl group transition-all duration-300">
                        {/* 3D Top Accent Glow Line */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent pointer-events-none" />

                        <div className="space-y-2.5">
                            {/* Column Header */}
                            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/50">
                                <div className="flex items-center gap-1.5">
                                    <ShieldCheckIcon className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-white font-mono">
                                        COMBAT DOSSIER
                                    </span>
                                </div>
                                <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                                    LVL {Math.floor(playerXp / 100) + 1}
                                </span>
                            </div>

                            {/* 2-Column Compact Metric Free Grid (No Boxy Bloat) */}
                            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                                <div className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/30 border border-zinc-800/40 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Matches</span>
                                    <span className="text-white font-black text-xs sm:text-sm mt-0.5">{matches}</span>
                                </div>
                                <div className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/30 border border-zinc-800/40 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Victories</span>
                                    <span className="text-emerald-400 font-black text-xs sm:text-sm mt-0.5">{wins}</span>
                                </div>
                                <div className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/30 border border-zinc-800/40 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Win Rate</span>
                                    <span className="text-amber-400 font-black text-xs sm:text-sm mt-0.5">{winRate}%</span>
                                </div>
                                <div className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/30 border border-zinc-800/40 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Win Streak</span>
                                    <span className="text-orange-400 font-black text-xs sm:text-sm mt-0.5">{winStreak}W</span>
                                </div>
                                <div className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/30 border border-zinc-800/40 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider">Avg Score</span>
                                    <span className="text-white font-black text-xs sm:text-sm mt-0.5">{avgScore.toLocaleString()} RP</span>
                                </div>
                                <div className="p-1.5 sm:p-2 rounded-xl bg-zinc-900/30 border border-zinc-800/40 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider">K/D Ratio</span>
                                    <span className="text-yellow-400 font-black text-xs sm:text-sm mt-0.5">{kdr}</span>
                                </div>
                            </div>

                            {/* Total XP & Season Countdown Badge */}
                            <div className="p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/60 flex items-center justify-between text-xs font-mono shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
                                <div>
                                    <span className="text-[9px] text-zinc-400 block uppercase">Total Career RP</span>
                                    <span className="text-emerald-400 font-black text-xs sm:text-sm">{playerXp.toLocaleString()} RP</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] text-zinc-400 block uppercase">Season Closes</span>
                                    <span className="text-amber-400 font-bold text-[10px] sm:text-[11px]">{seasonEndDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* Fast Quick-Switch Insignia Ribbon */}
                        <div className="mt-2.5 pt-2 border-t border-zinc-800/50">
                            <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 mb-1 px-0.5">
                                <span className="uppercase tracking-wider font-semibold">Tier Ribbon</span>
                                <span className="text-amber-400 font-bold">{selectedTierIndex + 1} / {allTiers.length}</span>
                            </div>
                            <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
                                {allTiers.map((t) => {
                                    const isSel = t.id === selectedTier.id;
                                    const isCur = t.id === progression.current.id;
                                    const isUnl = playerXp >= t.minXp;

                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedTierId(t.id)}
                                            className={`relative flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border transition-all ${
                                                isSel
                                                    ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.6)] scale-105'
                                                    : isCur
                                                        ? 'bg-zinc-900/90 border-amber-500/50'
                                                        : 'bg-zinc-950/50 border-zinc-800/50 opacity-60 hover:opacity-100'
                                            }`}
                                            title={`${t.name} (${t.minXp.toLocaleString()} RP)`}
                                        >
                                            <img
                                                src={resolveRankIcon(t.iconUrl || t.rankBadgeUrl, t.rankName, t.name)}
                                                alt={t.name}
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(t.name || t.rankName);
                                                }}
                                                className={`w-5 h-5 sm:w-6 sm:h-6 object-contain ${!isUnl ? 'grayscale' : ''}`}
                                            />
                                            {isCur && (
                                                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full border border-black" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* COLUMN 2: 3D CENTRAL INSIGNIA HOLO-STAGE & XP PROGRESS (FREE-VIEW SQUARE FOCAL HUB) */}
                    <div className="relative flex flex-col justify-between items-center text-center p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-zinc-900/40 via-zinc-950/70 to-zinc-950/90 border border-zinc-800/50 shadow-[0_16px_40px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-xl group overflow-hidden">
                        {/* 3D Top Accent Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gradient-to-r from-transparent via-amber-400/70 to-transparent pointer-events-none" />

                        {/* Interactive Emblem Stage */}
                        <div className="w-full flex items-center justify-between gap-1 my-auto">
                            {/* Prev Button */}
                            <button
                                onClick={handlePrev}
                                disabled={!prevTier}
                                className={`p-1.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all ${
                                    !prevTier ? 'opacity-20 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                                }`}
                                title={prevTier ? `Previous: ${prevTier.name}` : undefined}
                                aria-label="Previous Tier"
                            >
                                <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                            </button>

                            {/* Center Insignia 3D Podium */}
                            <div className="flex flex-col items-center flex-grow min-w-0 px-2 py-0.5">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={selectedTier.id}
                                        initial={{ scale: 0.88, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.88, opacity: 0 }}
                                        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
                                        className="flex flex-col items-center relative"
                                    >
                                        {/* Insignia Aura / Glow */}
                                        <div className={`absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full blur-2xl -z-10 transition-colors ${
                                            isCurrentPlayerTier 
                                                ? 'bg-amber-500/25' 
                                                : isUnlocked 
                                                    ? 'bg-emerald-500/20' 
                                                    : 'bg-zinc-700/15'
                                        }`} />

                                        {/* Emblem Frame with 3D Depth */}
                                        <div className="relative w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center mb-1.5">
                                            <img
                                                src={resolveRankIcon(selectedTier.iconUrl || selectedTier.rankBadgeUrl, selectedTier.rankName, selectedTier.name)}
                                                alt={selectedTier.name}
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(selectedTier.name || selectedTier.rankName);
                                                }}
                                                className={`w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] ${
                                                    !isUnlocked ? 'grayscale brightness-75' : ''
                                                }`}
                                            />
                                            {!isUnlocked && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-full">
                                                    <LockClosedIcon className="w-5 h-5 sm:w-7 sm:h-7 text-zinc-300 drop-shadow" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Stars & Tier Title */}
                                        <div className="space-y-0.5">
                                            <div className="flex items-center justify-center gap-1">
                                                {Array.from({ length: selectedTier.totalTiersInRank || 5 }).map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                                            i < selectedTier.tierIndex
                                                                ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.9)]'
                                                                : 'bg-zinc-800'
                                                        }`}
                                                    />
                                                ))}
                                            </div>

                                            <h2 className="text-xs sm:text-sm lg:text-base font-black tracking-wider uppercase font-mono text-white truncate max-w-[180px] sm:max-w-none">
                                                {selectedTier.name}
                                            </h2>

                                            <p className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider">
                                                {selectedTier.rankName} &bull; {selectedTier.minXp.toLocaleString()} RP
                                            </p>
                                        </div>

                                        {/* Status Pill */}
                                        <div className="mt-1.5">
                                            {isCurrentPlayerTier ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-[9px] sm:text-[10px] font-black uppercase font-mono tracking-wider shadow-[0_0_12px_rgba(251,191,36,0.3)]">
                                                    <SparklesIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> ACTIVE RANK
                                                </span>
                                            ) : isUnlocked ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[9px] sm:text-[10px] font-bold uppercase font-mono tracking-wider">
                                                    <CheckCircleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> UNLOCKED
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-zinc-400 text-[8px] sm:text-[9px] font-mono font-bold">
                                                    <LockClosedIcon className="w-2.5 h-2.5 text-zinc-500" /> {xpNeededForSelected.toLocaleString()} RP NEEDED
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={handleNext}
                                disabled={!nextTier}
                                className={`p-1.5 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all ${
                                    !nextTier ? 'opacity-20 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                                }`}
                                title={nextTier ? `Next: ${nextTier.name}` : undefined}
                                aria-label="Next Tier"
                            >
                                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                            </button>
                        </div>

                        {/* XP Progress Bar (Compact & Sleek) */}
                        <div className="w-full space-y-1 mt-2.5 pt-2 border-t border-zinc-800/50">
                            <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-mono">
                                <span className="font-bold text-amber-400 tracking-wider flex items-center gap-1">
                                    <ShieldCheckIcon className="w-3 h-3 text-amber-400" /> PROMOTION PATH
                                </span>
                                <span className="font-bold text-white">
                                    {playerXp.toLocaleString()} / {progression.next ? progression.next.minXp.toLocaleString() : playerXp.toLocaleString()} RP
                                </span>
                            </div>

                            <div className="h-1.5 sm:h-2 w-full bg-zinc-950 border border-zinc-800/80 rounded-full overflow-hidden p-0.5 relative shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progression.progressPercentage}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(251,191,36,0.7)]"
                                />
                            </div>

                            <div className="flex justify-between items-center text-[8px] sm:text-[9px] font-mono text-zinc-400">
                                <span className="truncate max-w-[110px]">Cur: {progression.current.name}</span>
                                <span className="truncate max-w-[130px]">
                                    {progression.next ? `${progression.xpToNext.toLocaleString()} RP to ${progression.next.name}` : 'MAX RANK'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* COLUMN 3: PERKS, UNLOCK REWARDS & TACTICAL DEPLOYMENT (FREE-VIEW SQUARE PANEL) */}
                    <div className="relative flex flex-col justify-between p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-zinc-900/40 via-zinc-950/70 to-zinc-950/90 border border-zinc-800/50 shadow-[0_16px_40px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-xl group">
                        {/* 3D Top Accent Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent pointer-events-none" />

                        <div className="space-y-2.5">
                            {/* Column Header */}
                            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/50">
                                <div className="flex items-center gap-1.5">
                                    <TrophyIcon className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-white font-mono">
                                        TIER PERKS &amp; BONUSES
                                    </span>
                                </div>
                                <button
                                    onClick={() => setShowRewardModal(true)}
                                    className="text-[9px] sm:text-[10px] text-amber-400 hover:text-amber-300 font-mono font-bold uppercase transition-colors"
                                >
                                    Inspect All &gt;
                                </button>
                            </div>

                            {/* Active Tier Perk Showcase Tile */}
                            <div className="p-2.5 rounded-xl bg-zinc-900/30 border border-zinc-800/40 space-y-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-lg bg-zinc-950 border border-zinc-800/60 shadow-inner">
                                        <img
                                            src={resolveRankIcon(selectedTier.iconUrl || selectedTier.rankBadgeUrl, selectedTier.rankName, selectedTier.name)}
                                            alt={selectedTier.name}
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(selectedTier.name || selectedTier.rankName);
                                            }}
                                            className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow"
                                        />
                                    </div>
                                    <div className="overflow-hidden min-w-0">
                                        <p className="text-[11px] font-bold text-white uppercase truncate font-mono">
                                            {selectedTier.name} Unlocks
                                        </p>
                                        <span className="text-[9px] text-amber-400 font-mono font-bold">
                                            {selectedTier.minXp.toLocaleString()} RP Required
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-0.5 pt-0.5">
                                    {(selectedTier.perks && selectedTier.perks.length > 0 ? selectedTier.perks : ['Exclusive Weapon XP Card (+100 RP)', 'Tactical Field Patch', 'Priority Event Entry']).slice(0, 3).map((perk, pi) => (
                                        <div key={pi} className="flex items-center gap-1 text-[10px] text-zinc-300">
                                            <CheckCircleIcon className="w-3 h-3 text-amber-400 flex-shrink-0" />
                                            <span className="truncate">{perk}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tactical Season Status & Reset Note */}
                            <div className="p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/40 text-[9px] text-zinc-400 leading-relaxed font-mono">
                                <span className="text-white font-bold block mb-0.5">COMPETITIVE MULTIPLIER ACTIVE</span>
                                Every match win provides +50 Bonus RP. Win streaks trigger tiered XP scaling.
                            </div>
                        </div>

                        {/* CTA Deployment Actions */}
                        <div className="space-y-1.5 pt-2.5 border-t border-zinc-800/50">
                            {onNavigateTab && (
                                <button
                                    onClick={() => onNavigateTab('Events')}
                                    className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-[11px] uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5"
                                >
                                    <span>JOIN RANKED MATCH</span>
                                    <ArrowRightIcon className="w-3 h-3" />
                                </button>
                            )}

                            <div className="grid grid-cols-2 gap-1.5">
                                <button
                                    onClick={() => setShowAllTiersModal(true)}
                                    className="py-1.5 px-2 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/60 text-zinc-300 hover:text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1 font-mono truncate"
                                >
                                    <TrophyIcon className="w-3 h-3 text-amber-400 flex-shrink-0" />
                                    <span>LADDER</span>
                                </button>
                                <button
                                    onClick={() => setShowCelebrationPreview(true)}
                                    className="py-1.5 px-2 bg-gradient-to-r from-amber-500/25 to-yellow-400/25 hover:from-amber-500/35 hover:to-yellow-400/35 border border-amber-400/60 text-amber-300 hover:text-amber-200 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center gap-1 font-mono truncate"
                                    title="Experience 3D Live-Action Promotion Ceremony"
                                >
                                    <SparklesIcon className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 animate-pulse" />
                                    <span>3D CEREMONY</span>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* VIEW MODE 2: FREE-VIEW ALL RANKS & TIERS LADDER (3-COLUMN SQUARE MATRIX) */}
            {viewMode === 'ladder' && (
                <div className="space-y-4 pt-1">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800/80">
                        <div>
                            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider font-mono text-amber-400">
                                OPERATIONAL RANK HIERARCHY
                            </h2>
                            <p className="text-[11px] text-zinc-400 font-mono">
                                3D free-view matrix of all tactical divisions and sub-tiers. Click any insignia to preview.
                            </p>
                        </div>
                        <span className="text-xs font-mono text-amber-400 font-bold bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/30">
                            Your RP: {playerXp.toLocaleString()}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
                        {activeRanks.map(rank => {
                            const rankTiers = [...(rank.tiers || [])].sort((a, b) => a.minXp - b.minXp);
                            const lowestXp = rankTiers.length > 0 ? rankTiers[0].minXp : (rank.minXp ?? 0);
                            const highestXp = rankTiers.length > 0 ? rankTiers[rankTiers.length - 1].minXp : lowestXp;

                            return (
                                <div
                                    key={rank.id}
                                    className="relative flex flex-col justify-between p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-zinc-900/40 via-zinc-950/70 to-zinc-950/90 border border-zinc-800/50 shadow-[0_16px_40px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.06)] backdrop-blur-xl hover:border-amber-500/40 transition-all duration-300 space-y-2.5 group"
                                >
                                    {/* 3D Ambient Top Glow Line */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none" />

                                    {/* Division Header */}
                                    <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800/50">
                                        <div className="w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-b from-zinc-800/60 to-zinc-950 border border-zinc-700/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform">
                                            <img
                                                src={resolveRankIcon(rank.rankBadgeUrl, rank.name)}
                                                alt={rank.name}
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(rank.name);
                                                }}
                                                className="w-7 h-7 sm:w-8 sm:h-8 object-contain filter drop-shadow-[0_4px_8px_rgba(251,191,36,0.3)]"
                                            />
                                        </div>
                                        <div className="overflow-hidden min-w-0">
                                            <h3 className="text-xs sm:text-sm font-black text-white uppercase font-mono tracking-wider truncate group-hover:text-amber-400 transition-colors">
                                                {rank.name}
                                            </h3>
                                            <span className="inline-block text-[9px] font-mono text-zinc-400">
                                                {lowestXp.toLocaleString()} RP{rankTiers.length > 1 ? ` – ${highestXp.toLocaleString()}` : '+'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Sub-Tier Mini List (Shrink to Fit Mobile Free View) */}
                                    <div className="space-y-1">
                                        {rankTiers.map((tier) => {
                                            const isPlayerTier = tier.id === progression.current.id;
                                            const isUnlockedTier = playerXp >= tier.minXp;

                                            return (
                                                <button
                                                    key={tier.id}
                                                    onClick={() => {
                                                        setSelectedTierId(tier.id);
                                                        setViewMode('hud');
                                                    }}
                                                    className={`w-full flex items-center justify-between p-1.5 rounded-xl text-left transition-all ${
                                                        isPlayerTier
                                                            ? 'bg-amber-400/20 border border-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.25)]'
                                                            : isUnlockedTier
                                                                ? 'bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]'
                                                                : 'bg-zinc-950/40 border border-zinc-900/40 opacity-60 hover:opacity-90'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-1.5 overflow-hidden min-w-0">
                                                        <img
                                                            src={resolveRankIcon(tier.iconUrl || rank.rankBadgeUrl, rank.name, tier.name)}
                                                            alt={tier.name}
                                                            onError={(e) => {
                                                                (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(tier.name || rank.name);
                                                            }}
                                                            className={`w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain flex-shrink-0 ${
                                                                !isUnlockedTier ? 'grayscale' : ''
                                                            }`}
                                                        />
                                                        <div className="overflow-hidden">
                                                            <p className="text-[10px] sm:text-[11px] font-bold text-white uppercase truncate font-mono">
                                                                {tier.name}
                                                            </p>
                                                            <p className="text-[8px] sm:text-[9px] text-zinc-400 truncate">
                                                                {tier.minXp.toLocaleString()} RP
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex-shrink-0 ml-1">
                                                        {isPlayerTier ? (
                                                            <span className="text-[8px] font-black uppercase text-amber-400 font-mono tracking-wider bg-amber-400/20 px-1 py-0.2 rounded border border-amber-400/40">
                                                                ACTIVE
                                                            </span>
                                                        ) : isUnlockedTier ? (
                                                            <CheckCircleIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                                                        ) : (
                                                            <LockClosedIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-600" />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* MODAL 1: SEASON & RANK RULES INFO MODAL */}
            <AnimatePresence>
                {showSeasonInfo && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative"
                        >
                            <button
                                onClick={() => setShowSeasonInfo(false)}
                                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
                                aria-label="Close modal"
                            >
                                <XIcon className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                    <ShieldCheckIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-wider font-mono text-white">
                                        Rank Match Rules &amp; Season
                                    </h3>
                                    <p className="text-xs text-zinc-400">Bosjol Tactical Airsoft Competitive League</p>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed font-sans divide-y divide-zinc-800/80">
                                <div className="pt-2">
                                    <p className="font-bold text-amber-400 uppercase font-mono mb-1">1. Rank Point (RP) System</p>
                                    <p>
                                        Operators earn RP automatically by participating in CQB, MilSim, and SpeedSoft matches. Match wins and objectives grant additional bonus RP.
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <p className="font-bold text-amber-400 uppercase font-mono mb-1">2. Instant Promotion</p>
                                    <p>
                                        As soon as your total RP reaches the next tier threshold, your rank and insignia are automatically upgraded in real time with zero delay or page reload needed.
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <p className="font-bold text-amber-400 uppercase font-mono mb-1">3. Seasonal Resets &amp; Rewards</p>
                                    <p>
                                        At the end of each competitive season, ranks reset and players unlock exclusive Weapon XP Cards, tactical badges, and venue discounts according to their highest tier achieved.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-3">
                                <Button onClick={() => setShowSeasonInfo(false)} className="w-full">
                                    Understood, Operator
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 2: TIER REWARDS & PERKS INSPECTOR */}
            <AnimatePresence>
                {showRewardModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col"
                        >
                            <button
                                onClick={() => setShowRewardModal(false)}
                                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
                                aria-label="Close modal"
                            >
                                <XIcon className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                    <TrophyIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-wider font-mono text-white">
                                        All Tier Unlock Rewards
                                    </h3>
                                    <p className="text-xs text-zinc-400">Perks, weapon bonuses, and season benefits</p>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                                {allTiers.map(tier => {
                                    const isUnl = playerXp >= tier.minXp;
                                    return (
                                        <div
                                            key={tier.id}
                                            className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                                                isUnl
                                                    ? 'bg-zinc-900/80 border-zinc-800'
                                                    : 'bg-zinc-950/60 border-zinc-900 opacity-70'
                                            }`}
                                        >
                                            <img
                                                src={resolveRankIcon(tier.iconUrl || tier.rankBadgeUrl, tier.rankName, tier.name)}
                                                alt={tier.name}
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(tier.name || tier.rankName);
                                                }}
                                                className={`w-10 h-10 object-contain flex-shrink-0 ${
                                                    !isUnl ? 'grayscale' : ''
                                                }`}
                                            />
                                            <div className="flex-grow overflow-hidden">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-bold text-white uppercase font-mono">
                                                        {tier.name}
                                                    </h4>
                                                    <span className="text-[10px] font-mono text-amber-400 font-bold">
                                                        {tier.minXp.toLocaleString()} RP
                                                    </span>
                                                </div>
                                                <div className="mt-1 flex flex-wrap gap-1.5">
                                                    {(tier.perks && tier.perks.length > 0 ? tier.perks : ['Weapon XP Card', 'Field Patch']).map((perk, pi) => (
                                                        <span
                                                            key={pi}
                                                            className="text-[11px] px-2 py-0.5 rounded bg-zinc-800/90 text-zinc-300 border border-zinc-700/60"
                                                        >
                                                            {perk}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-2">
                                <Button onClick={() => setShowRewardModal(false)} className="w-full">
                                    Close Rewards Inspector
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* MODAL 3: ALL TIERS MATRIX POPUP (TRIGGERED FROM CTA) */}
            <AnimatePresence>
                {showAllTiersModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col"
                        >
                            <button
                                onClick={() => setShowAllTiersModal(false)}
                                className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1"
                                aria-label="Close modal"
                            >
                                <XIcon className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                                    <TrophyIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-wider font-mono text-white">
                                        All Ranks &amp; Tiers Matrix
                                    </h3>
                                    <p className="text-xs text-zinc-400">Complete ladder progression for all operators</p>
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {allTiers.map(t => {
                                        const isUnl = playerXp >= t.minXp;
                                        const isCur = t.id === progression.current.id;

                                        return (
                                            <button
                                                key={t.id}
                                                onClick={() => {
                                                    setSelectedTierId(t.id);
                                                    setShowAllTiersModal(false);
                                                    setViewMode('hud');
                                                }}
                                                className={`p-3 rounded-xl border text-center flex flex-col items-center gap-2 transition-all ${
                                                    isCur
                                                        ? 'bg-amber-400/20 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                                                        : isUnl
                                                            ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                                                            : 'bg-zinc-950/60 border-zinc-900 opacity-60 hover:opacity-100'
                                                }`}
                                            >
                                                <img
                                                    src={resolveRankIcon(t.iconUrl || t.rankBadgeUrl, t.rankName, t.name)}
                                                    alt={t.name}
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(t.name || t.rankName);
                                                    }}
                                                    className={`w-12 h-12 object-contain ${!isUnl ? 'grayscale' : ''}`}
                                                />
                                                <div className="overflow-hidden w-full">
                                                    <p className="text-xs font-bold text-white uppercase truncate font-mono">
                                                        {t.name}
                                                    </p>
                                                    <p className="text-[10px] text-amber-400 font-mono">
                                                        {t.minXp.toLocaleString()} RP
                                                    </p>
                                                </div>
                                                {isCur && (
                                                    <span className="text-[9px] font-black uppercase text-amber-400 font-mono px-2 py-0.5 bg-amber-400/20 rounded">
                                                        ACTIVE
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button onClick={() => setShowAllTiersModal(false)} className="w-full">
                                    Close Matrix
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* CELEBRATION PREVIEW MODAL */}
            <AnimatePresence>
                {showCelebrationPreview && (
                    <PromotionCelebrationModal
                        promotion={{
                            oldTier: progression.prev || undefined,
                            newTier: selectedTier || progression.current,
                            newBadges: player.badges || [],
                            xpGained: 250,
                            bonusXp: 100,
                            rewards: ['Tier Up Bonus Crate', 'Rank Emote'],
                            finalXp: playerXp,
                            currentXp: playerXp
                        }}
                        onDismiss={() => setShowCelebrationPreview(false)}
                        ranks={ranks}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const FALLBACK_ICON = 'https://img.icons8.com/color/96/military-rank.png';
