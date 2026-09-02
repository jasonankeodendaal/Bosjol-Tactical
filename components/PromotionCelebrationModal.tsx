import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Tier, Rank, Badge } from '../types';
import { resolveRankIcon, getRankBadgeSvg } from '../utils/rankUtils';
import { 
    TrophyIcon, 
    ShieldCheckIcon, 
    SparklesIcon, 
    CheckCircleIcon, 
    XIcon, 
    ArrowRightIcon 
} from './icons/Icons';
import { Eye, ZoomIn, ZoomOut, RotateCcw, Volume2, Sparkles, Layers, Award } from 'lucide-react';

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
        xpGained = 0, 
        bonusXp = 0, 
        rewards = [], 
        finalXp = 0 
    } = promotion;

    // Interactive 3D & Zoom states
    const [isMacroZoomed, setIsMacroZoomed] = useState(false);
    const [activeDisplayMode, setActiveDisplayMode] = useState<'3d_mockup' | 'hologram' | 'evolution'>('3d_mockup');
    const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [audioMuted, setAudioMuted] = useState(false);
    const [zoomPulseCount, setZoomPulseCount] = useState(0);

    const stageRef = useRef<HTMLDivElement>(null);

    // Find parent rank for name & metadata
    const parentRank = useMemo(() => {
        if (!newTier || !ranks.length) return null;
        return ranks.find(r => r.tiers?.some(t => t.id === newTier.id)) || null;
    }, [newTier, ranks]);

    // Recalculate progression target based on finalXp
    const allTiers = useMemo(() => {
        return ranks
            .flatMap(rank => rank.tiers || [])
            .filter(Boolean)
            .sort((a, b) => a.minXp - b.minXp);
    }, [ranks]);

    const finalTierAfterBonus = useMemo(() => {
        return [...allTiers].reverse().find(r => finalXp >= r.minXp) || newTier;
    }, [allTiers, finalXp, newTier]);

    const finalTierIndex = useMemo(() => {
        return allTiers.findIndex(r => r.id === (finalTierAfterBonus?.id || newTier?.id));
    }, [allTiers, finalTierAfterBonus, newTier]);

    const nextTierAfterBonus = useMemo(() => {
        return finalTierIndex !== -1 && finalTierIndex < allTiers.length - 1 
            ? allTiers[finalTierIndex + 1] 
            : null;
    }, [allTiers, finalTierIndex]);

    const startXp = oldTier?.minXp || 0;
    const endXp = nextTierAfterBonus ? nextTierAfterBonus.minXp : (finalXp || 100);
    const progressPercentage = Math.min(
        100,
        Math.max(
            15,
            endXp > startXp ? ((finalXp - startXp) / (endXp - startXp)) * 100 : 100
        )
    );

    // Audio SFX synthesis on rank up & zoom transitions
    const playFanfare = () => {
        if (audioMuted) return;
        try {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            
            const now = ctx.currentTime;
            
            // Sub bass boom for monumental impact
            const subOsc = ctx.createOscillator();
            const subGain = ctx.createGain();
            subOsc.type = 'sine';
            subOsc.frequency.setValueAtTime(140, now);
            subOsc.frequency.exponentialRampToValueAtTime(32, now + 1.2);
            subGain.gain.setValueAtTime(0.7, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);
            subOsc.connect(subGain);
            subGain.connect(ctx.destination);
            subOsc.start(now);
            subOsc.stop(now + 1.5);

            // Shimmering harmonic arpeggio fanfare
            const frequencies = [330, 440, 554.37, 659.25, 880, 1108.73, 1318.51];
            frequencies.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                const noteTime = now + (idx * 0.08);

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, noteTime);

                gain.gain.setValueAtTime(0, noteTime);
                gain.gain.linearRampToValueAtTime(0.22, noteTime + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.8);

                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.start(noteTime);
                osc.stop(noteTime + 0.85);
            });
        } catch {
            // Ignore audio context autoplay restrictions
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

    // Get active insignia asset
    const activeDisplayTier = finalTierAfterBonus || newTier;
    const resolvedInsignia = useMemo(() => {
        if (!activeDisplayTier) return getRankBadgeSvg('Commander');
        return resolveRankIcon(
            activeDisplayTier.iconUrl, 
            activeDisplayTier.name, 
            parentRank?.name || activeDisplayTier.name
        );
    }, [activeDisplayTier, parentRank]);

    const oldTierInsignia = useMemo(() => {
        if (!oldTier) return null;
        return resolveRankIcon(
            oldTier.iconUrl, 
            oldTier.name, 
            oldTier.name
        );
    }, [oldTier]);

    // Unlocked perks list
    const perksList = useMemo(() => {
        if (newTier?.perks && newTier.perks.length > 0) return newTier.perks;
        return [
            `${newTier?.name || 'Rank'} Tactical Insignia`,
            'Advanced Loadout Clearance',
            'Combat Tier Commendation'
        ];
    }, [newTier]);

    // Mouse movement inside stage for real 3D parallax tilt & specular reflection
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!stageRef.current) return;
        const rect = stageRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMouseCoords({ x, y });
    };

    const handleStageLeave = () => {
        setIsHovered(false);
        setMouseCoords({ x: 0, y: 0 });
    };

    // Calculate gyro tilt angles
    const tiltX = isHovered ? -mouseCoords.y * 18 : 0;
    const tiltY = isHovered ? mouseCoords.x * 20 : 0;

    return (
        <div 
            id="promotion-celebration-viewport"
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden p-3 sm:p-6 select-none"
            onClick={onDismiss}
        >
            {/* AMBIENT BACKGROUND: DEEP RADIAL VIGNETTE */}
            <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl transition-all duration-700" />
            
            {/* DYNAMIC RADIAL ILLUMINATION CORE */}
            <div 
                className="fixed inset-0 pointer-events-none opacity-80"
                style={{
                    background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(245, 158, 11, 0.20) 0%, rgba(220, 38, 38, 0.10) 45%, rgba(10, 10, 18, 0.95) 80%, rgba(0, 0, 0, 1) 100%)'
                }}
            />

            {/* FLOATING LIGHT PARTICLES */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {[...Array(14)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{
                            opacity: 0,
                            x: `${(i * 7.5) % 100}vw`,
                            y: '100vh',
                            scale: Math.random() * 0.6 + 0.4
                        }}
                        animate={{
                            opacity: [0, 0.7, 0],
                            y: ['100vh', '-10vh'],
                            x: [`${(i * 7.5) % 100}vw`, `${((i * 7.5) + (i % 2 === 0 ? 10 : -10)) % 100}vw`]
                        }}
                        transition={{
                            duration: 5 + (i % 4),
                            repeat: Infinity,
                            delay: i * 0.35,
                            ease: 'linear'
                        }}
                        className="absolute w-1.5 h-1.5 rounded-full bg-amber-400 blur-[0.5px] shadow-[0_0_8px_#f59e0b]"
                    />
                ))}
            </div>

            {/* QUICK ACTIONS BAR (TOP CORNERS) */}
            <div className="fixed top-3 left-3 sm:top-5 sm:left-5 z-50 flex items-center gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setAudioMuted(!audioMuted);
                    }}
                    className={`p-2 sm:p-2.5 rounded-full border backdrop-blur-md transition-all shadow-[0_0_15px_rgba(0,0,0,0.8)] ${
                        audioMuted 
                            ? 'bg-zinc-900/80 border-zinc-800 text-zinc-500 hover:text-zinc-300' 
                            : 'bg-amber-500/15 border-amber-400/50 text-amber-400 hover:bg-amber-500/25'
                    }`}
                    title={audioMuted ? "Unmute SFX" : "Mute SFX"}
                >
                    <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setZoomPulseCount(prev => prev + 1);
                        playFanfare();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full bg-zinc-950/80 border border-amber-400/40 text-amber-300 text-[10px] font-mono font-bold tracking-wider hover:bg-amber-500/20 hover:border-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    title="Replay cinematic zoom and fanfare"
                >
                    <RotateCcw className="w-3 h-3 text-amber-400" />
                    <span className="hidden xs:inline">REPLAY</span>
                </button>
            </div>

            {/* CLOSE ACTION IN TOP RIGHT */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={(e) => {
                    e.stopPropagation();
                    onDismiss();
                }}
                className="fixed top-3 right-3 sm:top-5 sm:right-5 z-50 p-2 sm:p-2.5 rounded-full bg-zinc-950/90 border border-zinc-700/80 text-zinc-400 hover:text-white hover:border-amber-400/90 hover:bg-zinc-900 transition-all shadow-[0_0_20px_rgba(0,0,0,0.9)] group"
                title="Dismiss (ESC)"
            >
                <XIcon className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            </motion.button>

            {/* MAIN FREE-VIEW 3D CANVAS WRAPPER (SHRINK-TO-FIT, NO BOX CONTAINERS, LUXURIOUS FLOATING DESIGN) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.90, y: -15 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 w-full max-w-xl mx-auto flex flex-col items-center text-center my-auto py-2 px-3 sm:px-6 pointer-events-auto"
            >
                {/* 1. TOP TACTICAL CLASSIFICATION STATUS BAR */}
                <motion.div 
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.2)] mb-1.5"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-amber-300 font-mono">
                        TACTICAL PROMOTION ELEVATED
                    </span>
                </motion.div>

                {/* 2. GRAND TITLE & HERO CELEBRATION HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.4 }}
                    className="space-y-0.5 mb-1"
                >
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-500 drop-shadow-[0_4px_18px_rgba(0,0,0,0.9)] font-mono leading-tight">
                        {newTier ? newTier.name : 'PROMOTION ACHIEVED'}
                    </h1>
                    <p className="text-[10px] sm:text-[11px] font-mono text-zinc-300 uppercase tracking-widest max-w-md mx-auto">
                        Official rank status updated in Bosjol Network
                    </p>
                </motion.div>

                {/* 3. DISPLAY CONTROLS PILL */}
                <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="flex items-center gap-1 p-0.5 rounded-full bg-zinc-950/70 border border-zinc-800/80 shadow-[0_4px_12px_rgba(0,0,0,0.6)] backdrop-blur-md mb-1"
                >
                    <button
                        onClick={() => setActiveDisplayMode('3d_mockup')}
                        className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold uppercase transition-all ${
                            activeDisplayMode === '3d_mockup'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.35)]'
                                : 'text-zinc-400 hover:text-white border border-transparent'
                        }`}
                    >
                        <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                        <span>3D Medallion</span>
                    </button>

                    <button
                        onClick={() => setActiveDisplayMode('hologram')}
                        className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold uppercase transition-all ${
                            activeDisplayMode === 'hologram'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.35)]'
                                : 'text-zinc-400 hover:text-white border border-transparent'
                        }`}
                    >
                        <Layers className="w-2.5 h-2.5 text-amber-400" />
                        <span>Insignia</span>
                    </button>

                    {oldTier && (
                        <button
                            onClick={() => setActiveDisplayMode('evolution')}
                            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold uppercase transition-all ${
                                activeDisplayMode === 'evolution'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.35)]'
                                    : 'text-zinc-400 hover:text-white border border-transparent'
                            }`}
                        >
                            <Award className="w-2.5 h-2.5 text-amber-400" />
                            <span>Progression</span>
                        </button>
                    )}
                </motion.div>

                {/* 4. HERO 3D FREE-VIEW POPPING STAGE (NO BOX FRAMING, FULL FREE-FLOATING INSIGNIA) */}
                <div 
                    ref={stageRef}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={handleStageLeave}
                    className="relative w-full flex flex-col items-center justify-center my-1 min-h-[190px] sm:min-h-[230px] cursor-grab active:cursor-grabbing"
                    style={{ perspective: '1200px' }}
                >
                    {/* HOLOGRAPHIC ROTATING HUD RINGS (BACKDROP) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
                            className="w-52 h-52 sm:w-64 sm:h-64 rounded-full border border-dashed border-amber-500/20 flex items-center justify-center relative"
                        >
                            <div className="w-full h-full border border-amber-400/10 rounded-full scale-95" />
                        </motion.div>

                        <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
                            className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-dotted border-red-500/25"
                        />

                        {/* Radial Shockwave Pulse */}
                        <motion.div
                            key={zoomPulseCount}
                            animate={{ 
                                scale: [0.9, 1.3, 0.9], 
                                opacity: [0.5, 0, 0.5] 
                            }}
                            transition={{ 
                                duration: 3.6, 
                                repeat: Infinity, 
                                ease: 'easeInOut' 
                            }}
                            className="absolute w-40 h-40 sm:w-56 sm:h-56 rounded-full bg-gradient-to-r from-amber-500/20 via-red-500/10 to-transparent blur-xl"
                        />
                    </div>

                    {/* DYNAMIC CONTACT SHADOW */}
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-0">
                        <motion.div 
                            animate={{ 
                                scale: isMacroZoomed ? [1.2, 1.35, 1.2] : [1, 1.15, 0.95, 1.1, 1],
                                opacity: isMacroZoomed ? [0.4, 0.5, 0.4] : [0.65, 0.4, 0.75, 0.5, 0.65],
                            }}
                            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                            className="w-28 sm:w-40 h-4 rounded-full bg-black blur-md"
                        />
                    </div>

                    {/* STAGE DISPLAY MODES (FREE-VIEW FLOATING MEDALLIONS) */}
                    <div className="relative z-10 flex items-center justify-center gap-3 sm:gap-6">
                        
                        {/* PREVIOUS TIER PREVIEW */}
                        {oldTier && (activeDisplayMode === 'evolution') && (
                            <motion.div
                                initial={{ opacity: 0, x: -25, scale: 0.7 }}
                                animate={{ opacity: 0.4, x: 0, scale: 0.75 }}
                                transition={{ delay: 0.3, duration: 0.4, type: 'spring' }}
                                className="flex flex-col items-center opacity-40 group cursor-default"
                            >
                                <span className="text-[8px] font-mono font-bold tracking-widest text-zinc-500 uppercase mb-0.5">
                                    PREVIOUS
                                </span>
                                <div className="relative w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center p-1 grayscale">
                                    <img 
                                        src={resolveRankIcon(oldTier.iconUrl, oldTier.name, oldTier.name)} 
                                        alt={oldTier.name} 
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(oldTier.name);
                                        }}
                                        className="w-8 h-8 sm:w-12 sm:h-12 object-contain opacity-50 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
                                    />
                                </div>
                                <p className="text-[8px] font-mono text-zinc-500 mt-0.5 truncate max-w-[70px]">
                                    {oldTier.name}
                                </p>
                            </motion.div>
                        )}

                        {/* HERO 3D FREE-VIEW FLOATING INSIGNIA / MEDALLION */}
                        <motion.div
                            key={zoomPulseCount}
                            initial={{ 
                                opacity: 0, 
                                scale: 0.2, 
                                y: 25, 
                                rotateZ: -10,
                                rotateX: 12 
                            }}
                            animate={{ 
                                opacity: 1, 
                                scale: isMacroZoomed ? [1.28, 1.38, 1.28] : [1, 1.08, 0.96, 1.05, 1],
                                y: isMacroZoomed ? [0, -6, 0] : [0, -10, 2, -6, 0],
                                rotateX: [tiltX - 2, tiltX + 3, tiltX - 2, tiltX + 2, tiltX - 2],
                                rotateY: [tiltY - 4, tiltY + 4, tiltY - 2, tiltY + 3, tiltY - 4],
                                rotateZ: [-1, 1, -0.5, 0.8, -1],
                            }}
                            transition={{
                                opacity: { duration: 0.4 },
                                scale: { 
                                    duration: 4.5, 
                                    repeat: Infinity, 
                                    ease: [0.45, 0.05, 0.55, 0.95]
                                },
                                y: { 
                                    duration: 4.5, 
                                    repeat: Infinity, 
                                    ease: 'easeInOut' 
                                },
                                rotateX: { duration: 5.0, repeat: Infinity, ease: 'easeInOut' },
                                rotateY: { duration: 5.8, repeat: Infinity, ease: 'easeInOut' },
                                rotateZ: { duration: 4.6, repeat: Infinity, ease: 'easeInOut' },
                            }}
                            className="relative flex flex-col items-center group cursor-pointer"
                            onClick={() => setIsMacroZoomed(!isMacroZoomed)}
                        >
                            {/* Insignia Specular Glow Aura */}
                            <motion.div 
                                animate={{
                                    scale: isMacroZoomed ? 1.25 : [1.05, 1.2, 1.02, 1.15, 1.05],
                                    opacity: [0.35, 0.65, 0.3, 0.6, 0.35]
                                }}
                                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                                className="absolute inset-0 bg-gradient-to-b from-amber-400/35 via-yellow-500/20 to-red-600/30 rounded-full blur-2xl -z-10" 
                            />

                            {/* FREE-VIEW FLOATING MEDALLION CORE (NO BOX, PURE METALLIC SCULPTED EMBLEM) */}
                            <div className="relative flex items-center justify-center">
                                
                                {activeDisplayMode === '3d_mockup' ? (
                                    /* LUXURY FREE-VIEW SHAPED MEDALLION */
                                    <div className="relative w-32 h-32 sm:w-44 sm:h-44 flex items-center justify-center">
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <img
                                                src={resolvedInsignia}
                                                alt={activeDisplayTier?.name || 'Insignia'}
                                                referrerPolicy="no-referrer"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(activeDisplayTier?.name || 'Promoted Rank');
                                                }}
                                                className="w-28 h-28 sm:w-40 sm:h-40 object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.95)] drop-shadow-[0_0_25px_rgba(245,158,11,0.55)] filter"
                                            />
                                        </div>

                                        {/* Specular Light Sweep */}
                                        <motion.div 
                                            animate={{ 
                                                x: ['-140%', '240%'] 
                                            }}
                                            transition={{ 
                                                duration: 3.5, 
                                                repeat: Infinity, 
                                                repeatDelay: 2, 
                                                ease: 'easeInOut' 
                                            }}
                                            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none"
                                        />
                                    </div>
                                ) : (
                                    /* HOLOGRAPHIC TRANSPARENT FLOATING INSIGNIA */
                                    <div className="relative w-32 h-32 sm:w-44 sm:h-44 flex items-center justify-center">
                                        <img
                                            src={resolvedInsignia}
                                            alt={activeDisplayTier?.name || 'Promoted Rank'}
                                            referrerPolicy="no-referrer"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(activeDisplayTier?.name || 'Promoted Rank');
                                            }}
                                            className="w-28 h-28 sm:w-40 sm:h-40 object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.95)] drop-shadow-[0_0_35px_rgba(245,158,11,0.6)] filter"
                                        />
                                    </div>
                                )}

                                {/* Floating Rank Name Pill */}
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-zinc-950/90 border border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.55)] backdrop-blur-md flex items-center gap-1 whitespace-nowrap z-20">
                                    <SparklesIcon className="w-3 h-3 text-amber-400" />
                                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-amber-300 font-mono">
                                        {activeDisplayTier?.name || 'NEW RANK'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* NEXT MILESTONE TARGET PREVIEW */}
                        {nextTierAfterBonus && (activeDisplayMode === 'evolution') && (
                            <motion.div
                                initial={{ opacity: 0, x: 25, scale: 0.7 }}
                                animate={{ opacity: 0.4, x: 0, scale: 0.75 }}
                                transition={{ delay: 0.3, duration: 0.4, type: 'spring' }}
                                className="flex flex-col items-center opacity-40 group cursor-default"
                            >
                                <span className="text-[8px] font-mono font-bold tracking-widest text-zinc-500 uppercase mb-0.5">
                                    NEXT
                                </span>
                                <div className="relative w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center p-1 grayscale">
                                    <img 
                                        src={resolveRankIcon(nextTierAfterBonus.iconUrl, nextTierAfterBonus.name, nextTierAfterBonus.name)} 
                                        alt={nextTierAfterBonus.name} 
                                        referrerPolicy="no-referrer"
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(nextTierAfterBonus.name);
                                        }}
                                        className="w-8 h-8 sm:w-12 sm:h-12 object-contain opacity-50 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]"
                                    />
                                </div>
                                <p className="text-[8px] font-mono text-zinc-500 mt-0.5 truncate max-w-[70px]">
                                    {nextTierAfterBonus.name}
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* 5. TACTICAL COMBAT RP PROGRESSION (CLEAN FLOATING HORIZONTAL LASER TRACK) */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.4 }}
                    className="w-full max-w-sm px-2 my-1"
                >
                    <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono mb-1">
                        <div className="flex items-center gap-1">
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-black text-[9px] tracking-wider">
                                +{xpGained.toLocaleString()} RP
                            </span>
                            {bonusXp > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-black text-[9px] tracking-wider">
                                    BONUS +{bonusXp} RP
                                </span>
                            )}
                        </div>
                        <div className="text-right">
                            <span className="text-zinc-200 font-bold">{finalXp.toLocaleString()} RP</span>
                            <span className="text-zinc-400 text-[9px]"> / {nextTierAfterBonus ? nextTierAfterBonus.minXp.toLocaleString() + ' RP' : 'MAX'}</span>
                        </div>
                    </div>

                    {/* Glowing Laser Progress Track */}
                    <div className="relative w-full h-2 sm:h-2.5 bg-zinc-950/80 rounded-full border border-amber-500/30 p-0.5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] overflow-hidden">
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ delay: 0.35, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                            className="relative h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 shadow-[0_0_10px_#facc15]"
                        >
                            <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-white rounded-full shadow-[0_0_6px_#ffffff] animate-pulse" />
                        </motion.div>
                    </div>

                    {nextTierAfterBonus && (
                        <p className="text-[9px] font-mono text-zinc-400 mt-0.5">
                            {(nextTierAfterBonus.minXp - finalXp).toLocaleString()} RP to <span className="text-amber-400 font-bold">{nextTierAfterBonus.name}</span>
                        </p>
                    )}
                </motion.div>

                {/* 6. TACTICAL PRIVILEGES (CLEAN CHIP ROW - NO BULKY BOXES) */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="w-full max-w-md px-1 mt-1"
                >
                    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
                        {perksList.map((perk, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.35 + (idx * 0.04), duration: 0.3 }}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-950/60 border border-amber-500/25 backdrop-blur-sm"
                            >
                                <CheckCircleIcon className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                <span className="text-[9px] sm:text-[10px] font-medium text-zinc-200 font-mono">
                                    {perk}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* 7. ACHIEVEMENTS & COMMENDATIONS (IF NEW BADGES UNLOCKED) */}
                {newBadges && newBadges.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                        className="w-full max-w-sm px-1 mt-1.5"
                    >
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                            {newBadges.map((badge) => (
                                <div
                                    key={badge.id}
                                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-950/70 border border-yellow-500/35 backdrop-blur-sm"
                                >
                                    <img 
                                        src={badge.iconUrl} 
                                        alt={badge.name} 
                                        referrerPolicy="no-referrer"
                                        className="w-4 h-4 object-contain flex-shrink-0"
                                    />
                                    <span className="text-[9px] font-bold text-white font-mono uppercase">{badge.name}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* 8. BONUS REWARDS AWARDED */}
                {rewards && rewards.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45, duration: 0.4 }}
                        className="flex flex-wrap items-center justify-center gap-1.5 mt-1.5"
                    >
                        {rewards.map((reward, idx) => (
                            <div 
                                key={idx}
                                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-400/40 backdrop-blur-sm"
                            >
                                <SparklesIcon className="w-2.5 h-2.5 text-amber-300" />
                                <span className="text-[9px] font-bold text-amber-200 font-mono tracking-wider uppercase">
                                    BONUS: {reward} (+100 RP)
                                </span>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* 9. PRIMARY CLAIM ACTION (SLEEK ACCENT BUTTON) */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.4 }}
                    className="flex flex-col items-center gap-1 mt-2.5 sm:mt-3 w-full max-w-xs px-4"
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDismiss();
                        }}
                        className="relative w-full py-2 px-5 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 font-black text-xs sm:text-sm uppercase tracking-widest font-mono shadow-[0_0_20px_rgba(245,158,11,0.45)] hover:shadow-[0_0_30px_rgba(245,158,11,0.75)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5 group overflow-hidden"
                    >
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                        <span>CLAIM PROMOTION</span>
                        <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="text-[8px] sm:text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                        TAP ANYWHERE OR PRESS ESC
                    </p>
                </motion.div>

            </motion.div>
        </div>
    );
};
