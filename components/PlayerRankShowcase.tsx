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
    const mvpCount = (stats as any).mvpCount ?? Math.floor(wins * 0.35);

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

            {/* TOP HEADER: COD MOBILE RANKED STYLE */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/80 mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 sm:h-8 bg-amber-400 rounded-sm shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-wider uppercase text-white font-mono drop-shadow-md">
                                RANK MATCH
                            </h1>
                            <button
                                onClick={() => setShowSeasonInfo(true)}
                                className="text-amber-400 hover:text-amber-300 transition-colors p-1 rounded-full hover:bg-amber-400/10"
                                title="Season & Rank Rules"
                                aria-label="Season information"
                            >
                                <InformationCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-[11px] sm:text-xs text-zinc-400 tracking-widest uppercase font-semibold">
                            PRESEASON 1 &bull; AIRSOFT COMBAT LEAGUE
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-mono">Season Ends (UTC)</span>
                        <span className="text-xs sm:text-sm font-bold text-amber-400 font-mono">{seasonEndDate}</span>
                    </div>

                    <div className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('hud')}
                            className={`px-3 py-1 text-xs font-bold uppercase rounded transition-all ${
                                viewMode === 'hud'
                                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            Tactical HUD
                        </button>
                        <button
                            onClick={() => setViewMode('ladder')}
                            className={`px-3 py-1 text-xs font-bold uppercase rounded transition-all ${
                                viewMode === 'ladder'
                                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            All Ranks & Tiers
                        </button>
                    </div>
                </div>
            </div>

            {/* VIEW MODE 1: FREE-VIEW TACTICAL HUD (COD MOBILE RANKED LAYOUT) */}
            {viewMode === 'hud' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    
                    {/* LEFT COLUMN: COMBAT STATS HUD & SEASON REWARD PREVIEW (NO BOX CONTAINERS) */}
                    <div className="lg:col-span-4 space-y-4">
                        {/* Stats HUD Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                            <span className="text-xs font-bold tracking-widest uppercase text-amber-400 font-mono">
                                COMBAT METRICS
                            </span>
                            <span className="text-[11px] text-zinc-500 font-mono">
                                LVL {Math.floor(playerXp / 100) + 1}
                            </span>
                        </div>

                        {/* Minimalist Floating Stats List with Hairline Dividers */}
                        <div className="space-y-2.5 text-xs font-mono">
                            <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                                <span className="text-zinc-400 tracking-wider">MATCHES</span>
                                <span className="text-white font-bold text-sm">{matches}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                                <span className="text-zinc-400 tracking-wider">VICTORIES</span>
                                <span className="text-emerald-400 font-bold text-sm">{wins}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                                <span className="text-zinc-400 tracking-wider">WIN RATE</span>
                                <span className="text-amber-400 font-bold text-sm">{winRate}%</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                                <span className="text-zinc-400 tracking-wider">WIN STREAK</span>
                                <span className="text-orange-400 font-bold text-sm">{winStreak} STREAK</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                                <span className="text-zinc-400 tracking-wider">AVG. SCORE</span>
                                <span className="text-white font-bold text-sm">{avgScore.toLocaleString()} RP</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                                <span className="text-zinc-400 tracking-wider">MVP TITLES</span>
                                <span className="text-yellow-400 font-bold text-sm">{mvpCount}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                                <span className="text-zinc-400 tracking-wider">BADGES</span>
                                <span className="text-amber-400 font-bold text-sm">{(player.badges || []).length + (player.legendaryBadges || []).length}</span>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                                <span className="text-zinc-400 tracking-wider">TOTAL XP</span>
                                <span className="text-emerald-400 font-bold text-sm">{playerXp.toLocaleString()} RP</span>
                            </div>
                        </div>

                        {/* TIER REWARD PREVIEW (FREE VIEW / MINIMAL CONTAINER) */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                                <span className="text-xs font-bold tracking-widest uppercase text-amber-400 font-mono">
                                    TIER REWARDS
                                </span>
                                <button
                                    onClick={() => setShowRewardModal(true)}
                                    className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors uppercase font-mono font-bold hover:underline"
                                >
                                    ALL REWARDS &gt;
                                </button>
                            </div>

                            <div className="mt-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-amber-500/40 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-zinc-950/80 border border-amber-500/30 flex items-center justify-center p-1.5 flex-shrink-0 shadow-inner">
                                        <img
                                            src={resolveRankIcon(selectedTier.iconUrl || selectedTier.rankBadgeUrl, selectedTier.rankName, selectedTier.name)}
                                            alt={selectedTier.name}
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(selectedTier.name || selectedTier.rankName);
                                            }}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs font-bold text-white uppercase truncate">
                                            {selectedTier.name} Unlock Perks
                                        </p>
                                        <p className="text-[11px] text-amber-300/90 truncate">
                                            {selectedTier.perks && selectedTier.perks.length > 0
                                                ? selectedTier.perks[0]
                                                : 'Weapon XP Card (+100 RP)'}
                                        </p>
                                        {selectedTier.perks && selectedTier.perks.length > 1 && (
                                            <p className="text-[10px] text-zinc-400 truncate">
                                                +{selectedTier.perks.length - 1} additional perks
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CENTER & RIGHT COLUMN: INTERACTIVE BADGE CAROUSEL & PROGRESS BAR */}
                    <div className="lg:col-span-8 flex flex-col items-center justify-between min-h-[460px] py-4">
                        
                        {/* BADGE SHOWCASE CAROUSEL (CLICK BADGES TO VIEW) */}
                        <div className="w-full flex items-center justify-between gap-2 sm:gap-4 my-auto relative">
                            {/* Prev Tier Button / Preview */}
                            <div className="w-1/4 sm:w-1/5 flex flex-col items-center">
                                {prevTier ? (
                                    <button
                                        onClick={handlePrev}
                                        className="group flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-all transform hover:scale-105"
                                        title={`View ${prevTier.name}`}
                                    >
                                        <div className="relative w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center">
                                            <img
                                                src={resolveRankIcon(prevTier.iconUrl || prevTier.rankBadgeUrl, prevTier.rankName, prevTier.name)}
                                                alt={prevTier.name}
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(prevTier.name || prevTier.rankName);
                                                }}
                                                className="w-full h-full object-contain filter drop-shadow-md grayscale group-hover:grayscale-0 transition-all"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
                                                <ChevronLeftIcon className="w-6 h-6 text-amber-400" />
                                            </div>
                                        </div>
                                        <span className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 group-hover:text-white uppercase truncate max-w-[90px] text-center">
                                            {prevTier.name}
                                        </span>
                                    </button>
                                ) : (
                                    <div className="w-14 sm:w-20" />
                                )}
                            </div>

                            {/* Center Active Tier Showcase */}
                            <div className="w-2/4 sm:w-3/5 flex flex-col items-center text-center relative px-2">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={selectedTier.id}
                                        initial={{ scale: 0.85, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.85, opacity: 0 }}
                                        transition={{ type: 'spring', damping: 20, stiffness: 250 }}
                                        className="flex flex-col items-center relative"
                                    >
                                        {/* Insignia Aura / Glow */}
                                        <div className={`absolute w-36 h-36 sm:w-56 sm:h-56 rounded-full blur-2xl -z-10 transition-colors ${
                                            isCurrentPlayerTier 
                                                ? 'bg-amber-500/25' 
                                                : isUnlocked 
                                                    ? 'bg-emerald-500/20' 
                                                    : 'bg-zinc-700/20'
                                        }`} />

                                        {/* Large Emblem */}
                                        <div className="relative w-28 h-28 sm:w-44 sm:h-44 flex items-center justify-center mb-3">
                                            <img
                                                src={resolveRankIcon(selectedTier.iconUrl || selectedTier.rankBadgeUrl, selectedTier.rankName, selectedTier.name)}
                                                alt={selectedTier.name}
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(selectedTier.name || selectedTier.rankName);
                                                }}
                                                className={`w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] ${
                                                    !isUnlocked ? 'grayscale brightness-75' : ''
                                                }`}
                                            />
                                            {!isUnlocked && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-full">
                                                    <LockClosedIcon className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-300 drop-shadow" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Tier Title & Stars */}
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {Array.from({ length: selectedTier.totalTiersInRank || 5 }).map((_, i) => (
                                                    <span
                                                        key={i}
                                                        className={`w-2 h-2 rounded-full transition-colors ${
                                                            i < selectedTier.tierIndex
                                                                ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                                                                : 'bg-zinc-700'
                                                        }`}
                                                    />
                                                ))}
                                            </div>

                                            <h2 className="text-xl sm:text-3xl font-black tracking-wider uppercase font-mono text-white drop-shadow-md">
                                                {selectedTier.name}
                                            </h2>

                                            <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                                                {selectedTier.rankName} DIVISION &bull; {selectedTier.minXp.toLocaleString()} RP MINIMUM
                                            </p>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="mt-3">
                                            {isCurrentPlayerTier ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 text-xs font-black uppercase font-mono tracking-wider shadow-[0_0_15px_rgba(251,191,36,0.3)] animate-pulse">
                                                    <SparklesIcon className="w-4 h-4" /> CURRENT OPERATOR RANK
                                                </span>
                                            ) : isUnlocked ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs font-bold uppercase font-mono tracking-wider">
                                                    <CheckCircleIcon className="w-4 h-4" /> RANK UNLOCKED
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold uppercase font-mono tracking-wider">
                                                    <LockClosedIcon className="w-4 h-4 text-zinc-400" /> LOCKED &bull; {xpNeededForSelected.toLocaleString()} RP REQUIRED
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Next Tier Button / Preview */}
                            <div className="w-1/4 sm:w-1/5 flex flex-col items-center">
                                {nextTier ? (
                                    <button
                                        onClick={handleNext}
                                        className="group flex flex-col items-center gap-1.5 opacity-60 hover:opacity-100 transition-all transform hover:scale-105"
                                        title={`View ${nextTier.name}`}
                                    >
                                        <div className="relative w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center">
                                            <img
                                                src={resolveRankIcon(nextTier.iconUrl || nextTier.rankBadgeUrl, nextTier.rankName, nextTier.name)}
                                                alt={nextTier.name}
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(nextTier.name || nextTier.rankName);
                                                }}
                                                className={`w-full h-full object-contain filter drop-shadow-md transition-all ${
                                                    playerXp < nextTier.minXp ? 'grayscale brightness-75' : ''
                                                }`}
                                            />
                                            {playerXp < nextTier.minXp && (
                                                <div className="absolute top-1 right-1 bg-black/70 p-1 rounded-full border border-zinc-700">
                                                    <LockClosedIcon className="w-3 h-3 text-zinc-400" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-full">
                                                <ChevronRightIcon className="w-6 h-6 text-amber-400" />
                                            </div>
                                        </div>
                                        <span className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 group-hover:text-white uppercase truncate max-w-[90px] text-center">
                                            {nextTier.name}
                                        </span>
                                    </button>
                                ) : (
                                    <div className="w-14 sm:w-20" />
                                )}
                            </div>
                        </div>

                        {/* BOTTOM PROGRESS BAR & OPERATOR ACTIONS */}
                        <div className="w-full max-w-xl space-y-4 mt-6">
                            
                            {/* Sleek Golden Progress Bar */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-xs font-mono">
                                    <span className="font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                                        <ShieldCheckIcon className="w-4 h-4" /> RANK XP PROGRESS
                                    </span>
                                    <span className="font-bold text-white tracking-widest">
                                        {playerXp.toLocaleString()} / {progression.next ? progression.next.minXp.toLocaleString() : playerXp.toLocaleString()} RP
                                    </span>
                                </div>

                                <div className="h-3 w-full bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden p-0.5 relative shadow-inner">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progression.progressPercentage}%` }}
                                        transition={{ duration: 0.8, ease: 'easeOut' }}
                                        className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 shadow-[0_0_10px_rgba(251,191,36,0.7)]"
                                    />
                                </div>

                                <div className="flex justify-between items-center text-[11px] font-mono text-zinc-400">
                                    <span>Current: {progression.current.name}</span>
                                    <span>
                                        {progression.next
                                            ? `${progression.xpToNext.toLocaleString()} RP needed for ${progression.next.name}`
                                            : 'MAXIMUM OPERATOR RANK REACHED'}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Badges Click Ribbon (Free View Slider) */}
                            <div className="pt-2 border-t border-zinc-800/80">
                                <p className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest text-center mb-2">
                                    SELECT BADGE TO INSPECT PERKS & STATS
                                </p>
                                <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-zinc-800">
                                    {allTiers.map((t, idx) => {
                                        const isSel = t.id === selectedTier.id;
                                        const isCur = t.id === progression.current.id;
                                        const isUnl = playerXp >= t.minXp;

                                        return (
                                            <button
                                                key={t.id || idx}
                                                onClick={() => setSelectedTierId(t.id)}
                                                className={`relative flex-shrink-0 p-1 rounded-lg transition-all ${
                                                    isSel
                                                        ? 'bg-amber-400/20 border-2 border-amber-400 scale-110 shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                                                        : isCur
                                                            ? 'border border-amber-500/50 bg-zinc-900/80'
                                                            : 'border border-zinc-800 hover:border-zinc-700 bg-zinc-950/60'
                                                }`}
                                                title={`${t.name} (${t.minXp} RP)`}
                                            >
                                                <img
                                                    src={resolveRankIcon(t.iconUrl || t.rankBadgeUrl, t.rankName, t.name)}
                                                    alt={t.name}
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(t.name || t.rankName);
                                                    }}
                                                    className={`w-7 h-7 sm:w-8 sm:h-8 object-contain ${
                                                        !isUnl ? 'grayscale brightness-75' : ''
                                                    }`}
                                                />
                                                {isCur && (
                                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-black" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* CTA Action Buttons */}
                            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                                {onNavigateTab && (
                                    <button
                                        onClick={() => onNavigateTab('Events')}
                                        className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-sm uppercase tracking-wider rounded-lg shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                                    >
                                        <span>JOIN RANKED MATCH</span>
                                        <ArrowRightIcon className="w-4 h-4" />
                                    </button>
                                )}

                                <button
                                    onClick={() => setShowAllTiersModal(true)}
                                    className="w-full sm:w-auto px-5 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    <TrophyIcon className="w-4 h-4 text-amber-400" />
                                    <span>TIER LADDER MATRIX</span>
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* VIEW MODE 2: FREE-VIEW ALL RANKS & TIERS LADDER */}
            {viewMode === 'ladder' && (
                <div className="space-y-6 pt-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider font-mono text-amber-400">
                                OPERATIONAL RANK HIERARCHY
                            </h2>
                            <p className="text-xs text-zinc-400 font-mono">
                                Click any badge insignia to preview tier perks, required RP, and progression bonuses.
                            </p>
                        </div>
                        <span className="text-xs font-mono text-amber-400 font-bold bg-amber-400/10 px-3 py-1.5 rounded-lg border border-amber-400/30">
                            Your RP: {playerXp.toLocaleString()}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {activeRanks.map(rank => {
                            const rankTiers = [...(rank.tiers || [])].sort((a, b) => a.minXp - b.minXp);
                            return (
                                <div
                                    key={rank.id}
                                    className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors space-y-3"
                                >
                                    <div className="flex items-center gap-3 pb-2 border-b border-zinc-800">
                                        <img
                                            src={resolveRankIcon(rank.rankBadgeUrl, rank.name)}
                                            alt={rank.name}
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(rank.name);
                                            }}
                                            className="w-10 h-10 object-contain drop-shadow"
                                        />
                                        <div className="overflow-hidden">
                                            <h3 className="text-base font-black text-white uppercase font-mono tracking-wider">
                                                {rank.name}
                                            </h3>
                                            <p className="text-[11px] text-zinc-400 line-clamp-1">
                                                {rank.description || 'Combat Division'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Tiers List */}
                                    <div className="space-y-2">
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
                                                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all ${
                                                        isPlayerTier
                                                            ? 'bg-amber-400/20 border border-amber-400/80 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                                                            : isUnlockedTier
                                                                ? 'bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700'
                                                                : 'bg-zinc-950/40 border border-zinc-900 opacity-60 hover:opacity-90'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                                        <img
                                                            src={resolveRankIcon(tier.iconUrl || rank.rankBadgeUrl, rank.name, tier.name)}
                                                            alt={tier.name}
                                                            onError={(e) => {
                                                                (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(tier.name || rank.name);
                                                            }}
                                                            className={`w-7 h-7 object-contain flex-shrink-0 ${
                                                                !isUnlockedTier ? 'grayscale' : ''
                                                            }`}
                                                        />
                                                        <div className="overflow-hidden">
                                                            <p className="text-xs font-bold text-white uppercase truncate font-mono">
                                                                {tier.name}
                                                            </p>
                                                            <p className="text-[10px] text-zinc-400 truncate">
                                                                {tier.minXp.toLocaleString()} RP Required
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        {isPlayerTier ? (
                                                            <span className="text-[10px] font-black uppercase text-amber-400 font-mono tracking-wider">
                                                                CURRENT
                                                            </span>
                                                        ) : isUnlockedTier ? (
                                                            <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                                                        ) : (
                                                            <LockClosedIcon className="w-3.5 h-3.5 text-zinc-500" />
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
                                        Operators earn RP automatically by participating in CQB, MilSim, and SpeedSoft matches. Match wins, MVP finishes, and objectives grant additional bonus RP.
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
        </div>
    );
};

const FALLBACK_ICON = 'https://img.icons8.com/color/96/military-rank.png';
