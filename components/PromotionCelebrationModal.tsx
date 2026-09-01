import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Tier, Rank, Badge } from '../types';
import { resolveRankIcon, getRankBadgeSvg } from '../utils/rankUtils';
import { 
    TrophyIcon, 
    ShieldCheckIcon, 
    SparklesIcon, 
    CheckCircleIcon, 
    XIcon, 
    ArrowRightIcon, 
    ChevronRightIcon 
} from './icons/Icons';

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

    const [hasInteracted, setHasInteracted] = useState(false);

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

    // Audio SFX synthesis on rank up
    useEffect(() => {
        try {
            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();

            const playFanfare = () => {
                const now = ctx.currentTime;
                // Bass drop
                const subOsc = ctx.createOscillator();
                const subGain = ctx.createGain();
                subOsc.type = 'sine';
                subOsc.frequency.setValueAtTime(140, now);
                subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.6);
                subGain.gain.setValueAtTime(0.3, now);
                subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
                subOsc.connect(subGain);
                subGain.connect(ctx.destination);
                subOsc.start(now);
                subOsc.stop(now + 0.8);

                // Brass chords
                const freqs = [392.00, 523.25, 659.25, 783.99, 1046.50]; // G4, C5, E5, G5, C6
                freqs.forEach((freq, i) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(freq, now + 0.1 + (i * 0.08));
                    
                    gain.gain.setValueAtTime(0, now);
                    gain.gain.setValueAtTime(0.12, now + 0.1 + (i * 0.08));
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2 + (i * 0.08));

                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(now + 0.1 + (i * 0.08));
                    osc.stop(now + 1.4 + (i * 0.08));
                });
            };

            playFanfare();
        } catch {
            // Audio context not allowed or unsupported
        }
    }, []);

    // Listen for ESC or Enter to dismiss
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onDismiss();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onDismiss]);

    const activeDisplayTier = newTier || finalTierAfterBonus || oldTier;
    const resolvedInsignia = useMemo(() => {
        if (!activeDisplayTier) return '';
        return resolveRankIcon(
            activeDisplayTier.iconUrl, 
            parentRank?.name || activeDisplayTier.name, 
            activeDisplayTier.name, 
            parentRank?.rankBadgeUrl
        );
    }, [activeDisplayTier, parentRank]);

    const resolvedOldInsignia = useMemo(() => {
        if (!oldTier) return '';
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

    return (
        <div 
            id="promotion-celebration-viewport"
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto overflow-x-hidden p-3 sm:p-6 select-none"
            onClick={onDismiss}
        >
            {/* AMBIENT BACKGROUND: DEEP RADIAL VIGNETTE & CYBERSPACE HORIZON */}
            <div className="fixed inset-0 bg-black/92 backdrop-blur-2xl transition-all duration-700" />
            
            {/* DYNAMIC RADIAL ILLUMINATION CORE */}
            <div 
                className="fixed inset-0 pointer-events-none opacity-80"
                style={{
                    background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(234, 179, 8, 0.18) 0%, rgba(220, 38, 38, 0.12) 40%, rgba(10, 10, 15, 0.95) 80%, rgba(0, 0, 0, 1) 100%)'
                }}
            />

            {/* 3D PERSPECTIVE CYBER GRID FLOOR */}
            <div 
                className="fixed inset-x-0 bottom-0 h-[65vh] pointer-events-none opacity-25"
                style={{
                    perspective: '800px',
                    maskImage: 'linear-gradient(to top, black 20%, transparent 95%)',
                    WebkitMaskImage: 'linear-gradient(to top, black 20%, transparent 95%)'
                }}
            >
                <div 
                    className="w-[200vw] -ml-[50vw] h-full"
                    style={{
                        transform: 'rotateX(72deg) translateY(-20%)',
                        backgroundImage: `
                            linear-gradient(to right, rgba(234, 179, 8, 0.3) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(234, 179, 8, 0.3) 1px, transparent 1px)
                        `,
                        backgroundSize: '40px 40px',
                    }}
                />
            </div>

            {/* FLOATING AMBIENT PARTICLES & LIGHT SPECKS */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {[...Array(16)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: (i % 3 + 2) * 2 + 'px',
                            height: (i % 3 + 2) * 2 + 'px',
                            left: `${(i * 19) % 100}%`,
                            top: `${(i * 23) % 100}%`,
                            backgroundColor: i % 2 === 0 ? '#fbbf24' : '#ef4444',
                            boxShadow: `0 0 ${(i % 3 + 4) * 3}px ${i % 2 === 0 ? '#f59e0b' : '#dc2626'}`,
                            opacity: 0.4 + ((i % 5) * 0.1)
                        }}
                        animate={{
                            y: [0, -40 - (i * 5), 0],
                            x: [0, (i % 2 === 0 ? 20 : -20), 0],
                            opacity: [0.2, 0.8, 0.2],
                            scale: [0.8, 1.3, 0.8]
                        }}
                        transition={{
                            duration: 3.5 + (i * 0.3),
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: i * 0.15
                        }}
                    />
                ))}
            </div>

            {/* CLOSE ACTION IN TOP RIGHT */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={(e) => {
                    e.stopPropagation();
                    onDismiss();
                }}
                className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 sm:p-3 rounded-full bg-zinc-950/80 border border-zinc-700/80 text-zinc-400 hover:text-white hover:border-amber-400/80 hover:bg-zinc-900 transition-all shadow-[0_0_25px_rgba(0,0,0,0.8)] group"
                title="Dismiss (ESC)"
            >
                <XIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            </motion.button>

            {/* MAIN FREE-VIEW 3D CANVAS WRAPPER (NO ENCLOSING BOX) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.88, y: -20 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center my-auto py-6"
            >
                {/* 1. TOP TACTICAL CLASSIFICATION STATUS BAR */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-amber-400/40 shadow-[0_0_20px_rgba(245,158,11,0.25)] mb-4"
                >
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-amber-300 font-mono">
                        OPERATOR DOSSIER // PROMOTION CONFERRED
                    </span>
                </motion.div>

                {/* 2. GRAND TITLE & HERO CELEBRATION HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="space-y-1 sm:space-y-2 mb-4 sm:mb-6"
                >
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-500 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] font-mono">
                        {newTier ? 'RANK ELEVATED' : 'PROMOTION ACHIEVED'}
                    </h1>
                    <p className="text-xs sm:text-sm font-mono text-zinc-400 uppercase tracking-widest max-w-xl mx-auto">
                        Official clearance updated in Bosjol Combat Network. All privileges activated.
                    </p>
                </motion.div>

                {/* 3. HERO 3D POPPING EMBLEM & HOLOGRAPHIC STAGE (CENTERPIECE) */}
                <div className="relative w-full flex items-center justify-center my-4 sm:my-6 min-h-[220px] sm:min-h-[280px]">
                    
                    {/* HOLOGRAPHIC ROTATING HUD RINGS (BACKDROP) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {/* Outer Slow Clockwise Ring */}
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
                            className="w-56 h-56 sm:w-80 sm:h-80 rounded-full border border-dashed border-amber-500/25 flex items-center justify-center"
                        >
                            <div className="w-full h-full border border-amber-400/10 rounded-full scale-95" />
                        </motion.div>

                        {/* Inner Rapid Counter-Clockwise Ring */}
                        <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                            className="absolute w-44 h-44 sm:w-64 sm:h-64 rounded-full border border-dotted border-red-500/30"
                        />

                        {/* Radial Shockwave Pulse */}
                        <motion.div
                            animate={{ scale: [0.85, 1.4, 0.85], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeOut' }}
                            className="absolute w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-gradient-to-r from-amber-500/20 via-red-500/10 to-transparent blur-md"
                        />
                    </div>

                    {/* VOLUMETRIC LIGHT WELL PEDESTAL (3D FLOOR GLOW) */}
                    <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                        {/* 3D Oval Hologram Base */}
                        <div 
                            className="w-48 sm:w-72 h-14 sm:h-20 rounded-[100%] bg-gradient-to-t from-amber-500/40 via-amber-400/20 to-transparent blur-lg"
                            style={{ transform: 'rotateX(75deg)' }}
                        />
                        <div 
                            className="absolute w-36 sm:w-56 h-8 sm:h-12 rounded-[100%] border-2 border-amber-400/60 shadow-[0_0_30px_rgba(245,158,11,0.8)]"
                            style={{ transform: 'rotateX(75deg)' }}
                        />
                        {/* Light Ray Shimmer Beam */}
                        <div 
                            className="absolute -top-32 sm:-top-44 w-28 sm:w-44 h-36 sm:h-52 bg-gradient-to-t from-amber-400/20 via-amber-500/5 to-transparent blur-md pointer-events-none"
                            style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}
                        />
                    </div>

                    {/* EVOLUTION DISPLAY: PREVIOUS TIER -> PROMOTED TIER */}
                    <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-10 md:gap-16">
                        
                        {/* PREVIOUS TIER (IF APPLICABLE, FLOATING SMALLER ON LEFT) */}
                        {oldTier && (
                            <motion.div
                                initial={{ opacity: 0, x: -40, scale: 0.7 }}
                                animate={{ opacity: 0.65, x: 0, scale: 0.85 }}
                                transition={{ delay: 0.25, duration: 0.6, type: 'spring' }}
                                className="hidden xs:flex flex-col items-center group cursor-default"
                            >
                                <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase mb-2">
                                    PREVIOUS
                                </span>
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl bg-zinc-950/70 border border-zinc-800 shadow-[0_10px_25px_rgba(0,0,0,0.8)] backdrop-blur-md p-2 grayscale">
                                    <img 
                                        src={resolvedOldInsignia} 
                                        alt={oldTier.name} 
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(oldTier.name);
                                        }}
                                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow"
                                    />
                                </div>
                                <p className="text-[10px] sm:text-xs font-mono font-bold text-zinc-400 mt-2 truncate max-w-[100px]">
                                    {oldTier.name}
                                </p>
                            </motion.div>
                        )}

                        {/* LASER ARROW ASCENSION BRIDGE */}
                        {oldTier && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.35, duration: 0.4 }}
                                className="hidden xs:flex items-center gap-1 text-amber-400/80"
                            >
                                <ChevronRightIcon className="w-5 h-5 animate-pulse" />
                                <ChevronRightIcon className="w-6 h-6 text-amber-300" />
                            </motion.div>
                        )}

                        {/* HERO PROMOTED INSIGNIA (3D FLOATING CENTERPIECE) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.3, y: 30, rotateY: -15 }}
                            animate={{ 
                                opacity: 1, 
                                scale: 1, 
                                y: [0, -12, 0],
                                rotateY: 0
                            }}
                            transition={{
                                opacity: { duration: 0.4 },
                                scale: { duration: 0.7, type: 'spring', stiffness: 220, damping: 14 },
                                y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }
                            }}
                            className="relative flex flex-col items-center"
                        >
                            {/* Insignia Specular Glow Aura */}
                            <div className="absolute inset-0 bg-gradient-to-b from-amber-400/30 to-red-600/30 rounded-full blur-2xl -z-10 scale-125 animate-pulse" />

                            {/* 3D Floating Insignia Canvas */}
                            <div className="relative p-3 sm:p-5 group cursor-pointer">
                                <img
                                    src={resolvedInsignia}
                                    alt={activeDisplayTier?.name || 'Promoted Rank'}
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(activeDisplayTier?.name || 'Promoted Rank');
                                    }}
                                    className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.9)] drop-shadow-[0_0_50px_rgba(245,158,11,0.65)] filter transition-transform duration-300 hover:scale-105"
                                />

                                {/* 3D Hologram Badge Pill */}
                                <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-zinc-950/90 border-2 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.6)] backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap">
                                    <SparklesIcon className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-300 font-mono">
                                        {activeDisplayTier?.name || 'NEW RANK'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* NEXT MILESTONE PREVIEW (IF APPLICABLE, FLOATING ON RIGHT) */}
                        {nextTierAfterBonus && (
                            <motion.div
                                initial={{ opacity: 0, x: 40, scale: 0.7 }}
                                animate={{ opacity: 0.45, x: 0, scale: 0.8 }}
                                transition={{ delay: 0.45, duration: 0.6, type: 'spring' }}
                                className="hidden md:flex flex-col items-center opacity-40 group cursor-default"
                            >
                                <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase mb-2">
                                    NEXT OBJECTIVE
                                </span>
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl bg-zinc-950/40 border border-zinc-800/60 shadow-[0_10px_25px_rgba(0,0,0,0.8)] backdrop-blur-md p-2 grayscale">
                                    <img 
                                        src={resolveRankIcon(nextTierAfterBonus.iconUrl, nextTierAfterBonus.name, nextTierAfterBonus.name)} 
                                        alt={nextTierAfterBonus.name} 
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(nextTierAfterBonus.name);
                                        }}
                                        className="w-12 h-12 sm:w-16 sm:h-16 object-contain opacity-50"
                                    />
                                </div>
                                <p className="text-[10px] sm:text-xs font-mono font-bold text-zinc-500 mt-2 truncate max-w-[100px]">
                                    {nextTierAfterBonus.name}
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* 4. TACTICAL COMBAT RP PROGRESSION & DELTA TRACK */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    className="w-full max-w-xl px-4 sm:px-6 my-2 sm:my-3"
                >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-mono mb-2">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-[11px] sm:text-xs tracking-wider shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                                MATCH RP +{xpGained.toLocaleString()}
                            </span>
                            {bonusXp > 0 && (
                                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-[11px] sm:text-xs tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                                    BONUS +{bonusXp} RP
                                </span>
                            )}
                        </div>
                        <div className="text-right">
                            <span className="text-zinc-300 font-bold">{finalXp.toLocaleString()} RP</span>
                            <span className="text-zinc-500 text-[11px]"> / {nextTierAfterBonus ? nextTierAfterBonus.minXp.toLocaleString() + ' RP' : 'MAX'}</span>
                        </div>
                    </div>

                    {/* Glowing Laser Progress Track */}
                    <div className="relative w-full h-3.5 sm:h-4 bg-zinc-950/90 rounded-full border border-amber-500/40 p-0.5 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9),0_0_15px_rgba(245,158,11,0.2)] overflow-hidden">
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="relative h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 shadow-[0_0_15px_#facc15]"
                        >
                            {/* Glowing Leading Head */}
                            <div className="absolute top-0 right-0 bottom-0 w-2.5 bg-white rounded-full shadow-[0_0_10px_#ffffff] animate-pulse" />
                        </motion.div>
                    </div>

                    {nextTierAfterBonus && (
                        <p className="text-[10px] sm:text-[11px] font-mono text-zinc-400 mt-2">
                            {(nextTierAfterBonus.minXp - finalXp).toLocaleString()} RP required for promotion to <span className="text-amber-400 font-bold">{nextTierAfterBonus.name}</span>
                        </p>
                    )}
                </motion.div>

                {/* 5. TACTICAL PERKS & PRIVILEGES UNLOCKED GRID */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.5 }}
                    className="w-full max-w-2xl px-2 sm:px-4 mt-3 sm:mt-4"
                >
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <ShieldCheckIcon className="w-4 h-4 text-amber-400" />
                        <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-300 font-mono">
                            UNLOCKED TACTICAL PERKS & PRIVILEGES
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
                        {perksList.map((perk, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: 0.55 + (idx * 0.08), duration: 0.4 }}
                                className="relative flex items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 border border-amber-500/30 shadow-[0_8px_20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md hover:border-amber-400 transition-colors group"
                            >
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                    <CheckCircleIcon className="w-4 h-4 text-amber-400" />
                                </div>
                                <span className="text-[11px] sm:text-xs font-bold text-white text-left font-mono tracking-tight leading-tight">
                                    {perk}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* 6. ACHIEVEMENTS & COMMENDATIONS (IF NEW BADGES UNLOCKED) */}
                {newBadges && newBadges.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.65, duration: 0.5 }}
                        className="w-full max-w-2xl px-2 sm:px-4 mt-4"
                    >
                        <div className="flex items-center justify-center gap-2 mb-3">
                            <TrophyIcon className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-300 font-mono">
                                COMMENDATIONS & MEDALS CONFERRED
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {newBadges.map((badge, idx) => (
                                <motion.div
                                    key={badge.id}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.75 + (idx * 0.1), duration: 0.4 }}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-yellow-950/40 via-zinc-950/80 to-zinc-950/90 border border-yellow-500/40 shadow-lg backdrop-blur-md"
                                >
                                    <img 
                                        src={badge.iconUrl} 
                                        alt={badge.name} 
                                        className="w-10 h-10 object-contain drop-shadow-[0_4px_8px_rgba(245,158,11,0.5)] flex-shrink-0"
                                    />
                                    <div className="text-left overflow-hidden">
                                        <p className="text-xs font-black text-white font-mono uppercase truncate">{badge.name}</p>
                                        <p className="text-[10px] text-zinc-400 line-clamp-1">{badge.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* 7. BONUS REWARDS AWARDED */}
                {rewards && rewards.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="flex flex-wrap items-center justify-center gap-2.5 mt-3 sm:mt-4"
                    >
                        {rewards.map((reward, idx) => (
                            <div 
                                key={idx}
                                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 border border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.3)] backdrop-blur-md"
                            >
                                <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
                                <span className="text-[11px] font-bold text-amber-200 font-mono tracking-wider uppercase">
                                    BONUS ITEM: {reward} (+100 RP)
                                </span>
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* 8. PRIMARY CLAIM ACTION & DISMISS PROMPT */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex flex-col items-center gap-3 mt-6 sm:mt-8 w-full max-w-sm px-4"
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDismiss();
                        }}
                        className="relative w-full py-3.5 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 font-black text-sm sm:text-base uppercase tracking-widest font-mono shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:shadow-[0_0_50px_rgba(245,158,11,0.85)] hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 group overflow-hidden"
                    >
                        {/* Shimmer Light Reflection Sweep */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
                        <span>CLAIM PROMOTION & RETURN</span>
                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-zinc-500">
                        TAP ANYWHERE OR PRESS ESC TO PROCEED
                    </p>
                </motion.div>

            </motion.div>
        </div>
    );
};
