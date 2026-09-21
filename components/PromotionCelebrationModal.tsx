import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Tier, Rank, Badge } from '../types';
import { resolveRankIcon, getRankBadgeSvg } from '../utils/rankUtils';
import { 
    XIcon, 
    SparklesIcon,
    LockClosedIcon,
    TrophyIcon,
    CheckCircleIcon
} from './icons/Icons';
import { Volume2, RotateCcw, Share2 } from 'lucide-react';

export interface PromotionCelebrationData {
    newTier?: Tier;
    oldTier?: Tier;
    newBadges?: Badge[];
    xpGained?: number;
    currentXp?: number;
    bonusXp?: number;
    rewards?: string[];
    finalXp?: number;
}

interface PromotionCelebrationModalProps {
    promotion: PromotionCelebrationData;
    onDismiss: () => void;
    ranks?: Rank[];
}

export const PromotionCelebrationModal: React.FC<PromotionCelebrationModalProps> = ({
    promotion,
    onDismiss,
    ranks = []
}) => {
    const { 
        oldTier, 
        newTier, 
        newBadges = [], 
        xpGained = 55, 
        bonusXp = 0, 
        rewards = [], 
        finalXp = 2134 
    } = promotion;

    const [audioMuted, setAudioMuted] = useState(false);
    const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);

    const stageRef = useRef<HTMLDivElement>(null);

    // Get all tiers sorted by minXp
    const allTiers = useMemo(() => {
        return ranks
            .flatMap(rank => rank.tiers || [])
            .filter(Boolean)
            .sort((a, b) => a.minXp - b.minXp);
    }, [ranks]);

    // Derive parent rank
    const parentRank = useMemo(() => {
        if (!newTier || !ranks.length) return null;
        return ranks.find(r => r.tiers?.some(t => t.id === newTier.id)) || null;
    }, [newTier, ranks]);

    // Current new tier index
    const currentTierIndex = useMemo(() => {
        if (!newTier || !allTiers.length) return 2;
        const idx = allTiers.findIndex(t => t.id === newTier.id);
        return idx !== -1 ? idx : 2;
    }, [allTiers, newTier]);

    // Previous tier (left badge)
    const prevTierDisplay = useMemo(() => {
        if (oldTier) return oldTier;
        if (currentTierIndex > 0 && allTiers[currentTierIndex - 1]) {
            return allTiers[currentTierIndex - 1];
        }
        return {
            id: 'fallback_prev',
            name: 'VETERANO V',
            minXp: 1800,
            iconUrl: ''
        } as Tier;
    }, [oldTier, currentTierIndex, allTiers]);

    // Next tier (right badge)
    const nextTierDisplay = useMemo(() => {
        if (currentTierIndex < allTiers.length - 1 && allTiers[currentTierIndex + 1]) {
            return allTiers[currentTierIndex + 1];
        }
        return {
            id: 'fallback_next',
            name: 'ÉLITE II',
            minXp: 2200,
            iconUrl: ''
        } as Tier;
    }, [currentTierIndex, allTiers]);

    // Active tier display name
    const mainTierName = newTier?.name || 'ÉLITE I';

    // Insignia icons
    const mainInsignia = useMemo(() => {
        if (newTier) {
            return resolveRankIcon(newTier.iconUrl, newTier.name, parentRank?.name || newTier.name);
        }
        return getRankBadgeSvg('Elite');
    }, [newTier, parentRank]);

    const prevInsignia = useMemo(() => {
        return resolveRankIcon(prevTierDisplay.iconUrl, prevTierDisplay.name, prevTierDisplay.name);
    }, [prevTierDisplay]);

    const nextInsignia = useMemo(() => {
        return resolveRankIcon(nextTierDisplay.iconUrl, nextTierDisplay.name, nextTierDisplay.name);
    }, [nextTierDisplay]);

    // Progress XP calculations
    const currentXpVal = finalXp || 2134;
    const targetXpVal = nextTierDisplay.minXp || 2200;
    const prevXpVal = prevTierDisplay.minXp || 1800;
    const xpProgressPct = Math.min(
        100,
        Math.max(
            20,
            targetXpVal > prevXpVal
                ? ((currentXpVal - prevXpVal) / (targetXpVal - prevXpVal)) * 100
                : 85
        )
    );

    // Audio SFX synthesis on mount
    const playFanfare = () => {
        if (audioMuted) return;
        try {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;
            
            // Bass boom
            const subOsc = ctx.createOscillator();
            const subGain = ctx.createGain();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(160, now);
            subOsc.frequency.exponentialRampToValueAtTime(35, now + 1.2);
            subGain.gain.setValueAtTime(0.7, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
            subOsc.connect(subGain);
            subGain.connect(ctx.destination);
            subOsc.start(now);
            subOsc.stop(now + 1.2);

            // Triumph Arpeggio
            const frequencies = [329.63, 440, 554.37, 659.25, 880, 1108.73];
            frequencies.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const noteTime = now + (idx * 0.08);

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, noteTime);

                gain.gain.setValueAtTime(0, noteTime);
                gain.gain.linearRampToValueAtTime(0.2, noteTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.7);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(noteTime);
                osc.stop(noteTime + 0.75);
            });
        } catch {
            // Audio context restrictions
        }
    };

    useEffect(() => {
        playFanfare();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onDismiss();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Mouse parallax 3D tilt
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!stageRef.current) return;
        const rect = stageRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMouseCoords({ x, y });
    };

    const tiltX = isHovered ? -mouseCoords.y * 12 : 0;
    const tiltY = isHovered ? mouseCoords.x * 14 : 0;

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (navigator.clipboard) {
            navigator.clipboard.writeText(`🏆 I just reached rank ${mainTierName} in Bosjol Airsoft! +${xpGained} RP Gained!`);
            setShareCopied(true);
            setTimeout(() => setShareCopied(false), 3500);
        }
    };

    return (
        <div 
            id="promotion-celebration-viewport"
            className="fixed inset-0 z-[140] flex items-center justify-center bg-black/95 text-white overflow-hidden select-none cursor-pointer"
            onClick={onDismiss}
        >
            {/* SVG HONEYCOMB GRID PATTERN OVERLAY */}
            <div className="absolute inset-0 pointer-events-none opacity-25">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="hex-grid-pattern" width="40" height="69.282" patternUnits="userSpaceOnUse">
                            <path 
                                d="M 40 0 L 20 11.547 L 0 0 L 0 23.094 L 20 34.641 L 40 23.094 Z M 0 34.641 L 20 46.188 L 0 57.735 L 0 80.829 L 20 92.376 L 40 80.829 L 40 57.735 L 20 46.188 Z" 
                                fill="none" 
                                stroke="#f59e0b" 
                                strokeWidth="1" 
                                strokeOpacity="0.4"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hex-grid-pattern)" />
                </svg>
            </div>

            {/* DYNAMIC AMBIENT GOLD RADIANCE CORE */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-85"
                style={{
                    background: 'radial-gradient(circle at 50% 48%, rgba(245, 158, 11, 0.28) 0%, rgba(217, 119, 6, 0.12) 40%, rgba(15, 15, 18, 0.95) 75%, rgba(0, 0, 0, 1) 100%)'
                }}
            />

            {/* TOP CORNER YELLOW ACCENT BEACONS */}
            <div className="absolute top-6 left-12 w-20 h-4 bg-yellow-400 rounded-sm shadow-[0_0_20px_#facc15] transform -skew-x-12 opacity-90 hidden sm:block pointer-events-none" />
            <div className="absolute top-6 right-12 w-20 h-4 bg-yellow-400 rounded-sm shadow-[0_0_20px_#facc15] transform skew-x-12 opacity-90 hidden sm:block pointer-events-none" />

            {/* TOP UTILITY CONTROLS */}
            <div className="absolute top-4 left-4 z-50 flex items-center gap-2 pointer-events-auto">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setAudioMuted(!audioMuted);
                    }}
                    className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-700 text-amber-400 hover:bg-amber-500/20 transition-all shadow"
                    title={audioMuted ? "Unmute SFX" : "Mute SFX"}
                >
                    <Volume2 className="w-4 h-4" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        playFanfare();
                    }}
                    className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-700 text-amber-400 hover:bg-amber-500/20 transition-all shadow flex items-center gap-1.5 text-xs font-mono font-bold"
                    title="Replay Fanfare SFX"
                >
                    <RotateCcw className="w-4 h-4" />
                    <span className="hidden xs:inline">REPLAY</span>
                </button>
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDismiss();
                }}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-zinc-900/80 border border-zinc-700 text-zinc-400 hover:text-white hover:border-amber-400 transition-all shadow pointer-events-auto"
                title="Close"
            >
                <XIcon className="w-5 h-5" />
            </button>

            {/* MAIN 3D MODAL STAGE WRAPPER */}
            <div 
                ref={stageRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 w-full max-w-3xl px-3 py-3 sm:py-6 flex flex-col items-center justify-center text-center my-auto pointer-events-auto"
                style={{ perspective: '1000px' }}
            >
                {/* DUAL CURVED GOLDEN ARCS (TOP & BOTTOM BORDER BEAMS) */}
                <div className="absolute inset-x-2 sm:inset-x-8 top-0 h-12 sm:h-16 border-t-2 border-amber-500/80 rounded-[100%] shadow-[0_0_25px_#f59e0b] pointer-events-none opacity-90" />
                <div className="absolute inset-x-2 sm:inset-x-8 bottom-0 h-12 sm:h-16 border-b-2 border-amber-500/80 rounded-[100%] shadow-[0_0_25px_#f59e0b] pointer-events-none opacity-90" />

                {/* TOP HUD TRIANGLE BRACKET */}
                <div className="mb-1 text-amber-400 font-mono text-lg sm:text-2xl font-black tracking-widest opacity-90">
                    /\
                </div>

                {/* 3-BADGE CAROUSEL CONTAINER WITH HORIZONTAL LENS FLARE */}
                <div className="relative w-full flex items-center justify-center my-2 sm:my-4 py-2">
                    
                    {/* HORIZONTAL INTENSE GOLD LENS FLARE BEAM */}
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_25px_#facc15] pointer-events-none z-0 opacity-90" />
                    <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-24 bg-gradient-to-r from-transparent via-yellow-500/20 to-transparent blur-xl pointer-events-none z-0" />

                    <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-12 md:gap-16">
                        
                        {/* LEFT BADGE: PREVIOUS RANK (SMALLER HEXAGON) */}
                        <motion.div 
                            initial={{ opacity: 0, x: -40, scale: 0.8 }}
                            animate={{ opacity: 0.85, x: 0, scale: 1 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="flex flex-col items-center group cursor-default"
                        >
                            <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
                                {/* SVG Hexagon Frame */}
                                <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]" viewBox="0 0 100 115">
                                    <polygon 
                                        points="50 0, 100 28.87, 100 86.6, 50 115.47, 0 86.6, 0 28.87" 
                                        fill="#18181b" 
                                        fillOpacity="0.85" 
                                        stroke="#f59e0b" 
                                        strokeWidth="3" 
                                        strokeOpacity="0.7"
                                    />
                                </svg>
                                <img 
                                    src={prevInsignia} 
                                    alt={prevTierDisplay.name}
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(prevTierDisplay.name);
                                    }}
                                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain z-10 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] opacity-90"
                                />
                            </div>
                            <span className="mt-2 text-[10px] sm:text-xs font-mono font-bold tracking-wider text-amber-300/90 uppercase truncate max-w-[100px]">
                                {prevTierDisplay.name}
                            </span>
                        </motion.div>

                        {/* CENTER BADGE: PROMOTED RANK (HERO CENTERPIECE WITH GLOWING DOUBLE HEXAGON) */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.4, y: 20 }}
                            animate={{ 
                                opacity: 1, 
                                scale: 1, 
                                y: 0,
                                rotateX: tiltX,
                                rotateY: tiltY
                            }}
                            transition={{ type: "spring", stiffness: 260, damping: 22 }}
                            className="relative flex flex-col items-center z-20 group"
                        >
                            {/* Ambient Glow behind center badge */}
                            <div className="absolute inset-0 bg-gradient-to-b from-amber-400/40 via-yellow-500/20 to-amber-600/40 rounded-full blur-2xl -z-10 scale-125 animate-pulse" />

                            <div className="relative w-32 h-32 sm:w-48 sm:h-48 md:w-52 md:h-52 flex items-center justify-center">
                                {/* Double Glowing Hexagon Frame */}
                                <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_25px_rgba(245,158,11,0.8)]" viewBox="0 0 100 115">
                                    <defs>
                                        <linearGradient id="centerHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#fef08a" />
                                            <stop offset="50%" stopColor="#f59e0b" />
                                            <stop offset="100%" stopColor="#b45309" />
                                        </linearGradient>
                                    </defs>
                                    <polygon 
                                        points="50 0, 100 28.87, 100 86.6, 50 115.47, 0 86.6, 0 28.87" 
                                        fill="#09090b" 
                                        fillOpacity="0.9" 
                                        stroke="url(#centerHexGrad)" 
                                        strokeWidth="4" 
                                    />
                                    {/* Inner Accent Hexagon */}
                                    <polygon 
                                        points="50 6, 94 31.87, 94 83.6, 50 109.47, 6 83.6, 6 31.87" 
                                        fill="none" 
                                        stroke="#fef08a" 
                                        strokeWidth="1.5" 
                                        strokeOpacity="0.6" 
                                        strokeDasharray="4 2"
                                    />
                                </svg>

                                {/* Main Metallic 3D Rank Emblem */}
                                <img 
                                    src={mainInsignia} 
                                    alt={mainTierName}
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(mainTierName);
                                    }}
                                    className="w-20 h-20 sm:w-32 sm:h-32 md:w-36 md:h-36 object-contain z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.95)] filter transform group-hover:scale-105 transition-transform duration-300"
                                />

                                {/* Top Triangle Tech Cap */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-yellow-300 font-mono text-sm font-black z-30 drop-shadow-[0_0_8px_#facc15]">
                                    /\
                                </div>
                            </div>
                        </motion.div>

                        {/* RIGHT BADGE: NEXT RANK (SMALLER HEXAGON) */}
                        <motion.div 
                            initial={{ opacity: 0, x: 40, scale: 0.8 }}
                            animate={{ opacity: 0.85, x: 0, scale: 1 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="flex flex-col items-center group cursor-default"
                        >
                            <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
                                {/* SVG Hexagon Frame */}
                                <svg className="absolute inset-0 w-full h-full drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]" viewBox="0 0 100 115">
                                    <polygon 
                                        points="50 0, 100 28.87, 100 86.6, 50 115.47, 0 86.6, 0 28.87" 
                                        fill="#18181b" 
                                        fillOpacity="0.85" 
                                        stroke="#f59e0b" 
                                        strokeWidth="3" 
                                        strokeOpacity="0.7"
                                    />
                                </svg>
                                <img 
                                    src={nextInsignia} 
                                    alt={nextTierDisplay.name}
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(nextTierDisplay.name);
                                    }}
                                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain z-10 filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] opacity-90"
                                />
                                <div className="absolute top-1 right-1 bg-black/80 p-1 rounded-full border border-amber-500/50 z-20">
                                    <LockClosedIcon className="w-3 h-3 text-amber-400" />
                                </div>
                            </div>
                            <span className="mt-2 text-[10px] sm:text-xs font-mono font-bold tracking-wider text-amber-300/90 uppercase truncate max-w-[100px]">
                                {nextTierDisplay.name}
                            </span>
                        </motion.div>

                    </div>
                </div>

                {/* TIER TITLE (E.G. ÉLITE I) */}
                <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-white font-mono drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)] mt-1"
                >
                    {mainTierName}
                </motion.h2>

                {/* GAIN STAT & NEW RANK TAG ROW */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className="flex items-center justify-center gap-4 mt-3 flex-wrap"
                >
                    <span className="text-base sm:text-xl font-black text-emerald-400 font-mono tracking-wide drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
                        Rango obtenido +{xpGained}
                    </span>
                    <span className="px-2.5 py-0.5 rounded border border-yellow-400 text-yellow-400 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-yellow-950/40 shadow-[0_0_10px_rgba(250,204,21,0.3)]">
                        NUEVO RANGO
                    </span>
                </motion.div>

                {/* PROGRESS BAR SECTION */}
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="w-full max-w-md mt-4 space-y-1 px-4"
                >
                    <div className="flex justify-between text-xs font-mono text-zinc-300 font-bold">
                        <span>Rank XP Progression</span>
                        <span className="text-amber-400">{currentXpVal} / {targetXpVal}</span>
                    </div>
                    <div className="relative w-full h-2.5 sm:h-3 bg-zinc-950 rounded-full border border-amber-500/50 p-0.5 overflow-hidden shadow-inner">
                        <motion.div 
                            initial={{ width: '0%' }}
                            animate={{ width: `${xpProgressPct}%` }}
                            transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 rounded-full shadow-[0_0_12px_#facc15]"
                        />
                    </div>
                </motion.div>

                {/* UNLOCKED PERKS & BADGES SUMMARY (IF PRESENT) */}
                {((newTier?.perks && newTier.perks.length > 0) || (newBadges && newBadges.length > 0)) && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.35, duration: 0.4 }}
                        className="flex flex-wrap items-center justify-center gap-2 mt-4 max-w-lg"
                    >
                        {newTier?.perks?.slice(0, 3).map((perk, i) => (
                            <span key={i} className="text-[10px] font-mono font-medium text-zinc-300 bg-zinc-900/90 px-2.5 py-1 rounded-full border border-zinc-700/80 flex items-center gap-1">
                                <CheckCircleIcon className="w-3 h-3 text-amber-400" /> {perk}
                            </span>
                        ))}
                        {newBadges.map((badge) => (
                            <span key={badge.id} className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2.5 py-1 rounded-full border border-amber-500/60 flex items-center gap-1">
                                <TrophyIcon className="w-3 h-3 text-amber-400" /> {badge.name}
                            </span>
                        ))}
                    </motion.div>
                )}

                {/* BOTTOM CONTINUE / TOUCH PROMPT */}
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 0.9, 0.4] }}
                    transition={{ delay: 0.45, duration: 2, repeat: Infinity }}
                    className="mt-6 text-xs sm:text-sm font-mono text-zinc-400 uppercase tracking-widest font-bold"
                >
                    CLICK ANYWHERE TO CONTINUE
                </motion.p>
            </div>

            {/* BOTTOM LEFT SHARE ACTION BUTTON */}
            <div className="absolute bottom-4 left-4 z-50 pointer-events-auto">
                <button
                    onClick={handleShare}
                    className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white hover:border-amber-400 hover:bg-zinc-800 transition-all shadow-lg flex items-center gap-2 text-xs font-mono font-bold"
                    title="Share Rank Promotion"
                >
                    <Share2 className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">{shareCopied ? 'COPIED TO CLIPBOARD!' : 'SHARE'}</span>
                </button>
            </div>
        </div>
    );
};
