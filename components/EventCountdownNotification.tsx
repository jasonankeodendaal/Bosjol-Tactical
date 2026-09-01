import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    intervalToDuration, 
    differenceInDays, 
    differenceInSeconds, 
    differenceInMilliseconds, 
    isBefore, 
    format, 
    isValid 
} from 'date-fns';
import type { GameEvent, Player, Signup } from '../types';
import { 
    Clock, 
    AlertTriangle, 
    Bell, 
    Calendar, 
    MapPin, 
    X, 
    ChevronRight, 
    CheckCircle2, 
    Timer,
    Radio,
    CalendarOff
} from 'lucide-react';

interface EventCountdownNotificationProps {
    player: Player;
    events: GameEvent[];
    signups: Signup[];
    onSelectEvent?: (event?: GameEvent) => void;
}

interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
    totalSeconds: number;
    isPast: boolean;
}

// Helper to reliably parse event start timestamp into a valid Date object
export function getEventStartDate(event: GameEvent): Date | null {
    if (!event || !event.date) return null;
    try {
        const datePart = event.date.includes('T') ? event.date.split('T')[0] : event.date;
        let timePart = '09:00:00';
        if (event.startTime) {
            const rawTime = event.startTime.trim();
            const match12 = rawTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
            if (match12) {
                let hours = parseInt(match12[1], 10);
                const minutes = match12[2];
                const ampm = match12[3].toUpperCase();
                if (ampm === 'PM' && hours < 12) hours += 12;
                if (ampm === 'AM' && hours === 12) hours = 0;
                timePart = `${String(hours).padStart(2, '0')}:${minutes}:00`;
            } else {
                const match24 = rawTime.match(/^(\d{1,2}):(\d{2})/);
                if (match24) {
                    timePart = `${String(match24[1]).padStart(2, '0')}:${match24[2]}:00`;
                }
            }
        }
        const parsedDate = new Date(`${datePart}T${timePart}`);
        if (isValid(parsedDate)) return parsedDate;
        
        const fallbackDate = new Date(event.date);
        return isValid(fallbackDate) ? fallbackDate : null;
    } catch {
        const fallbackDate = new Date(event.date);
        return isValid(fallbackDate) ? fallbackDate : null;
    }
}

export function getEventStartTime(event: GameEvent): number {
    const d = getEventStartDate(event);
    return d ? d.getTime() : 0;
}

// Calculate remaining time using date-fns
function calculateTimeRemaining(targetDate: Date, now: Date): TimeRemaining {
    if (isBefore(targetDate, now)) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, totalSeconds: 0, isPast: true };
    }

    const duration = intervalToDuration({ start: now, end: targetDate });
    const totalDays = differenceInDays(targetDate, now);
    const totalSeconds = differenceInSeconds(targetDate, now);
    const totalMs = differenceInMilliseconds(targetDate, now);

    return {
        days: Math.max(0, totalDays),
        hours: Math.max(0, duration.hours ?? 0),
        minutes: Math.max(0, duration.minutes ?? 0),
        seconds: Math.max(0, duration.seconds ?? 0),
        totalMs,
        totalSeconds,
        isPast: false
    };
}

// Exact Retro-Mechanical Flip Card Display matching attached reference image
interface FlipDigitProps {
    digit: string;
    isMuted?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'red' | 'white' | 'green' | 'dark';
}

const FlipDigit: React.FC<FlipDigitProps> = ({ digit, isMuted = false, size = 'md', variant = 'red' }) => {
    // Sizing matching reference card proportions
    const sizeClasses = {
        sm: 'w-6 h-9 text-lg',
        md: 'w-8 sm:w-9 md:w-11 h-12 sm:h-14 md:h-16 text-2xl sm:text-3xl md:text-4xl',
        lg: 'w-10 sm:w-12 md:w-14 h-15 sm:h-18 md:h-20 text-3xl sm:text-4xl md:text-5xl'
    }[size];

    const getTopBg = () => {
        if (isMuted) return 'bg-zinc-800';
        if (variant === 'green') return 'bg-gradient-to-b from-[#16a34a] to-[#15803d]';
        if (variant === 'white') return 'bg-gradient-to-b from-zinc-800 to-zinc-900';
        return 'bg-gradient-to-b from-[#ef4444] to-[#d32f2f]';
    };

    const getBottomBg = () => {
        if (isMuted) return 'bg-zinc-900';
        if (variant === 'green') return 'bg-gradient-to-b from-[#15803d] to-[#14532d]';
        if (variant === 'white') return 'bg-gradient-to-b from-zinc-900 to-zinc-950';
        return 'bg-gradient-to-b from-[#b71c1c] to-[#991b1b]';
    };

    const getTextColor = () => {
        if (isMuted) return 'text-zinc-500';
        if (variant === 'white') return 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]';
        if (variant === 'green') return 'text-white drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]';
        return 'text-white drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]';
    };

    return (
        <div className={`relative flex flex-col items-center justify-center ${sizeClasses} rounded-[3px] sm:rounded-[4px] overflow-hidden select-none shadow-[0_4px_14px_rgba(0,0,0,0.85)] border border-black/80`}>
            {/* Top Flap */}
            <div className={`w-full h-1/2 flex items-end justify-center overflow-hidden relative border-b border-black/90 ${getTopBg()}`}>
                <span className={`font-black font-mono leading-none translate-y-[50%] tracking-tight select-none ${getTextColor()}`}>
                    {digit}
                </span>
                {/* Subtle top flap highlight */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-white/25 pointer-events-none" />
            </div>

            {/* Bottom Flap */}
            <div className={`w-full h-1/2 flex items-start justify-center overflow-hidden relative border-t border-black/90 ${getBottomBg()}`}>
                <span className={`font-black font-mono leading-none -translate-y-[50%] tracking-tight select-none ${getTextColor()}`}>
                    {digit}
                </span>
                {/* Flap fold shadow depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/15 pointer-events-none" />
            </div>

            {/* Center horizontal split seam */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 bg-black/95 pointer-events-none z-10" />

            {/* Left mechanical notch cutout */}
            <div className="absolute top-1/2 left-0 w-[3.5px] h-[6px] -translate-y-1/2 bg-black rounded-r-[1px] z-20 pointer-events-none" />

            {/* Right mechanical notch cutout */}
            <div className="absolute top-1/2 right-0 w-[3.5px] h-[6px] -translate-y-1/2 bg-black rounded-l-[1px] z-20 pointer-events-none" />
        </div>
    );
};

interface FlipUnitProps {
    value: number | string;
    label: string;
    isMuted?: boolean;
    variant?: 'red' | 'white' | 'green' | 'dark';
    labelColor?: string;
}

const FlipUnit: React.FC<FlipUnitProps> = ({ 
    value, 
    label, 
    isMuted = false, 
    variant = 'red',
    labelColor = 'text-white'
}) => {
    const str = String(value).padStart(2, '0');
    const d1 = str[0] || '0';
    const d2 = str[1] || '0';

    return (
        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
            {/* 2-Card Flip Module with side notches & center hinge */}
            <div className="relative flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-[5px] bg-black border border-zinc-900 shadow-2xl">
                {/* Left Outer Hinge Bracket */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[2px] w-[4px] h-[8px] bg-[#1a1a1a] border border-black rounded-l-[1px] z-30 pointer-events-none" />
                
                <FlipDigit digit={d1} isMuted={isMuted} size="md" variant={variant} />

                {/* Center Hinge Connector Axle */}
                <div className="relative w-[3px] sm:w-[4px] flex items-center justify-center z-20">
                    <div className="w-[3px] sm:w-[4px] h-[8px] bg-[#141414] border-x border-black" />
                </div>

                <FlipDigit digit={d2} isMuted={isMuted} size="md" variant={variant} />

                {/* Right Outer Hinge Bracket */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[2px] w-[4px] h-[8px] bg-[#1a1a1a] border border-black rounded-r-[1px] z-30 pointer-events-none" />
            </div>

            {/* Bottom Label in Red, White, or Green */}
            <span className={`text-[10px] sm:text-xs font-sans font-black tracking-[0.2em] uppercase select-none ${isMuted ? 'text-zinc-500' : labelColor}`}>
                {label}
            </span>
        </div>
    );
};

interface FlipClockBannerProps {
    days: number | string;
    hours: number | string;
    minutes: number | string;
    seconds: number | string;
    isMuted?: boolean;
}

// Compact Single-Line Mobile Countdown Bar (Shows red, white & green flip digits across 1 line)
interface MobileCountdownBarProps {
    days: number | string;
    hours: number | string;
    minutes: number | string;
    seconds: number | string;
    isMuted?: boolean;
    onClick?: () => void;
}

export const MobileCountdownBar: React.FC<MobileCountdownBarProps> = ({
    days,
    hours,
    minutes,
    seconds,
    isMuted = false,
    onClick
}) => {
    const d = String(days).padStart(2, '0');
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    const s = String(seconds).padStart(2, '0');

    return (
        <div 
            onClick={onClick}
            className={`w-full py-2.5 px-2.5 rounded-xl border flex flex-col items-center justify-center shadow-2xl select-none transition-all bg-black ${
                isMuted 
                    ? 'border-zinc-800 text-zinc-500' 
                    : 'border-red-950/80 hover:border-red-600/60 cursor-pointer active:scale-[0.99]'
            }`}
        >
            {/* Red, White, Green Time Remaining Header */}
            <div className="text-[10px] font-sans font-black tracking-[0.25em] uppercase mb-1.5 flex items-center gap-1.5">
                <span className={isMuted ? 'text-zinc-500' : 'text-red-500 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]'}>TIME</span>
                <span className={isMuted ? 'text-zinc-600' : 'text-white'}>REMAINING</span>
                {!isMuted && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse" />
                )}
            </div>
            
            {/* 1-Line Compact Mechanical Flip Counter Bar with Red, White & Green text */}
            <div className="flex items-center gap-1.5 sm:gap-2 justify-center">
                {/* Days (Red) */}
                <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center gap-0.5 p-0.5 rounded bg-black border border-zinc-900 shadow">
                        <FlipDigit digit={d[0]} isMuted={isMuted} size="sm" variant="red" />
                        <FlipDigit digit={d[1]} isMuted={isMuted} size="sm" variant="red" />
                    </div>
                    <span className={`text-[8px] font-sans font-black tracking-wider ${isMuted ? 'text-zinc-500' : 'text-red-400'}`}>DAY</span>
                </div>

                <span className="text-zinc-600 font-bold -mt-2.5">:</span>

                {/* Hours (White) */}
                <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center gap-0.5 p-0.5 rounded bg-black border border-zinc-900 shadow">
                        <FlipDigit digit={h[0]} isMuted={isMuted} size="sm" variant="white" />
                        <FlipDigit digit={h[1]} isMuted={isMuted} size="sm" variant="white" />
                    </div>
                    <span className={`text-[8px] font-sans font-black tracking-wider ${isMuted ? 'text-zinc-500' : 'text-white'}`}>HOUR</span>
                </div>

                <span className="text-zinc-600 font-bold -mt-2.5">:</span>

                {/* Minutes (Green) */}
                <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center gap-0.5 p-0.5 rounded bg-black border border-zinc-900 shadow">
                        <FlipDigit digit={m[0]} isMuted={isMuted} size="sm" variant="green" />
                        <FlipDigit digit={m[1]} isMuted={isMuted} size="sm" variant="green" />
                    </div>
                    <span className={`text-[8px] font-sans font-black tracking-wider ${isMuted ? 'text-zinc-500' : 'text-emerald-400'}`}>MIN</span>
                </div>

                <span className="text-zinc-600 font-bold -mt-2.5">:</span>

                {/* Seconds (Red & Green) */}
                <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center gap-0.5 p-0.5 rounded bg-black border border-zinc-900 shadow">
                        <FlipDigit digit={s[0]} isMuted={isMuted} size="sm" variant="green" />
                        <FlipDigit digit={s[1]} isMuted={isMuted} size="sm" variant="green" />
                    </div>
                    <span className={`text-[8px] font-sans font-black tracking-wider ${isMuted ? 'text-zinc-500' : 'text-emerald-400'}`}>SEC</span>
                </div>
            </div>
        </div>
    );
};

export const FlipClockDisplay: React.FC<FlipClockBannerProps> = ({
    days,
    hours,
    minutes,
    seconds,
    isMuted = false
}) => {
    return (
        <div className="flex flex-col items-center gap-2.5 sm:gap-3 py-1">
            {/* Red, White, Green Tracked TIME REMAINING Header */}
            <div className="text-[11px] sm:text-xs font-sans font-black uppercase tracking-[0.3em] flex items-center justify-center gap-2 select-none">
                <span className={isMuted ? 'text-zinc-500' : 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'}>TIME</span>
                <span className={isMuted ? 'text-zinc-600' : 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]'}>REMAINING</span>
                {!isMuted && (
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-pulse" />
                )}
            </div>

            {/* Four 2-card flip units side-by-side in Red, White, and Green */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap justify-center">
                <FlipUnit value={days} label="DAY" isMuted={isMuted} variant="red" labelColor="text-red-400" />
                <FlipUnit value={hours} label="HOUR" isMuted={isMuted} variant="white" labelColor="text-white" />
                <FlipUnit value={minutes} label="MINUTES" isMuted={isMuted} variant="green" labelColor="text-emerald-400" />
                <FlipUnit value={seconds} label="SECONDS" isMuted={isMuted} variant="green" labelColor="text-emerald-400" />
            </div>
        </div>
    );
};

export const EventCountdownNotification: React.FC<EventCountdownNotificationProps> = ({
    player,
    events,
    signups,
    onSelectEvent
}) => {
    const [toastDismissed, setToastDismissed] = useState<boolean>(false);
    const [now, setNow] = useState<Date>(new Date());

    // Update timer every second
    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Find joined events for this player
    const joinedEvents = useMemo(() => {
        const playerSignupEventIds = new Set(
            signups
                .filter(s => s.playerId === player.id && s.status !== 'cancelled')
                .map(s => s.eventId)
        );

        return events.filter(e => {
            const isSignedUp = playerSignupEventIds.has(e.id);
            const isAttendee = e.attendees?.some(a => a.playerId === player.id);
            const isTeamMember = Object.values(e.teams || {}).some(list => Array.isArray(list) && list.includes(player.id));
            return (isSignedUp || isAttendee || isTeamMember) && e.status !== 'Cancelled';
        });
    }, [events, signups, player.id]);

    // Next upcoming joined event sorted by closest start time
    const nextJoinedEvent = useMemo(() => {
        if (joinedEvents.length === 0) return null;

        const nowMs = now.getTime();
        const upcoming = joinedEvents
            .map(event => ({ event, date: getEventStartDate(event) }))
            .filter((item): item is { event: GameEvent; date: Date } => item.date !== null && item.date.getTime() > nowMs - (4 * 60 * 60 * 1000))
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        return upcoming.length > 0 ? upcoming[0].event : null;
    }, [joinedEvents, now]);

    // Fallback if no joined event: closest upcoming general event
    const fallbackNextEvent = useMemo(() => {
        if (nextJoinedEvent) return null;
        const nowMs = now.getTime();
        const upcomingGeneral = events
            .filter(e => e.status === 'Upcoming' || e.status === 'In Progress')
            .map(event => ({ event, date: getEventStartDate(event) }))
            .filter((item): item is { event: GameEvent; date: Date } => item.date !== null && item.date.getTime() > nowMs - (4 * 60 * 60 * 1000))
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        return upcomingGeneral.length > 0 ? upcomingGeneral[0].event : null;
    }, [nextJoinedEvent, events, now]);

    const activeEvent = nextJoinedEvent || fallbackNextEvent;
    const isUserJoined = !!nextJoinedEvent;

    // Time calculations for active event using date-fns
    const activeEventDate = useMemo(() => {
        return activeEvent ? getEventStartDate(activeEvent) : null;
    }, [activeEvent]);

    const timeRemaining = useMemo(() => {
        return activeEventDate ? calculateTimeRemaining(activeEventDate, now) : null;
    }, [activeEventDate, now]);

    // Check 24-hour condition for Toast alert
    const isWithin24Hours = useMemo(() => {
        if (!activeEvent || !timeRemaining) return false;
        const ms = timeRemaining.totalMs;
        return ms > 0 && ms <= 24 * 60 * 60 * 1000;
    }, [activeEvent, timeRemaining]);

    const formattedEventDate = useMemo(() => {
        if (!activeEventDate || !isValid(activeEventDate)) return '';
        try {
            return format(activeEventDate, 'EEE, MMM d, yyyy');
        } catch {
            return activeEventDate.toLocaleDateString();
        }
    }, [activeEventDate]);

    // If NO active upcoming event exists, render the standby countdown timer with 00:00:00 counter
    if (!activeEvent || !timeRemaining) {
        return (
            <div className="space-y-3">
                {/* Mobile-Only Single-Line Countdown Bar (Nothing else) */}
                <div className="sm:hidden w-full">
                    <MobileCountdownBar 
                        days={0}
                        hours={0}
                        minutes={0}
                        seconds={0}
                        isMuted={true}
                        onClick={() => onSelectEvent?.(undefined)}
                    />
                </div>

                {/* Desktop/Tablet Standby Banner */}
                <div className="hidden sm:block p-4 sm:p-5 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-md relative overflow-hidden group hover:border-zinc-700/80 transition-colors">
                    {/* Background subtle ambient radar line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-zinc-700 via-zinc-600 to-zinc-800 opacity-40" />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        {/* Left Info: Standby indicator */}
                        <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/80 text-zinc-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <Radio className="w-3 h-3 text-zinc-400" />
                                    Standby • No Active Operations
                                </span>
                                <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-500 text-[10px] font-mono border border-zinc-800">
                                    Awaiting Next Briefing
                                </span>
                            </div>

                            <h3 className="text-base sm:text-lg font-bold text-zinc-300 tracking-wide truncate flex items-center gap-2">
                                <CalendarOff className="w-4 h-4 text-zinc-500 shrink-0" />
                                <span>No Upcoming Events Scheduled</span>
                            </h3>

                            <p className="text-xs text-zinc-500 max-w-xl">
                                Command has not posted upcoming combat skirmishes. Stand by or check the events schedule for updates.
                            </p>
                        </div>

                        {/* Right: Retro Mechanical Flip Clock Standby (00 00 00 00) */}
                        <div className="flex items-center gap-3 self-center lg:self-auto shrink-0">
                            <FlipClockDisplay 
                                days={0}
                                hours={0}
                                minutes={0}
                                seconds={0}
                                isMuted={true}
                            />

                            {onSelectEvent && (
                                <button
                                    onClick={() => onSelectEvent(undefined)}
                                    className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition border border-zinc-800 self-center mt-4"
                                    title="View Events Schedule"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Mobile-Only Single-Line Countdown Bar (Nothing else, only counter on 1 line) */}
            <div className="sm:hidden w-full">
                <MobileCountdownBar 
                    days={timeRemaining.days}
                    hours={timeRemaining.hours}
                    minutes={timeRemaining.minutes}
                    seconds={timeRemaining.seconds}
                    isMuted={false}
                    onClick={() => onSelectEvent?.(activeEvent)}
                />
            </div>

            {/* Desktop/Tablet Rich Countdown View */}
            <div className="hidden sm:block space-y-3">
                {/* 24-HOUR DEPLOYMENT TOAST NOTIFICATION (Fixed floating banner) */}
                <AnimatePresence>
                    {isWithin24Hours && !toastDismissed && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-red-950/95 via-zinc-900/95 to-amber-950/95 border-2 border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.25)] backdrop-blur-md relative overflow-hidden"
                        >
                            {/* Background Pulsing Glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />

                            <div className="flex items-start justify-between gap-3 relative z-10">
                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 shrink-0 animate-bounce">
                                        <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 font-extrabold text-[10px] uppercase tracking-wider border border-amber-400/50 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                Deployment Alert (24h)
                                            </span>
                                            {isUserJoined && (
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                                                    ✓ Signed Up
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="font-bold text-white text-sm sm:text-base mt-1">
                                            Operation &quot;{activeEvent.title}&quot; starts soon!
                                        </h4>

                                        <p className="text-xs text-zinc-300 mt-0.5 flex items-center gap-2">
                                            <span>Starts in:</span>
                                            <span className="font-mono font-black text-sm flex items-center gap-1.5">
                                                {timeRemaining.days > 0 && <span className="text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]">{timeRemaining.days}d</span>}
                                                <span className="text-white">{String(timeRemaining.hours).padStart(2, '0')}h</span>
                                                <span className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]">{String(timeRemaining.minutes).padStart(2, '0')}m</span>
                                                <span className="text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]">{String(timeRemaining.seconds).padStart(2, '0')}s</span>
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                    {onSelectEvent && (
                                        <button
                                            onClick={() => onSelectEvent(activeEvent)}
                                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition shadow-md flex items-center gap-1"
                                        >
                                            <span>View Details</span>
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setToastDismissed(true)}
                                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                                        title="Dismiss alert"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* LIVE COUNTDOWN TIMER BANNER / RETRO MECHANICAL FLIP CARD */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-md relative overflow-hidden group hover:border-zinc-700 transition-colors">
                    {/* Top Subtle Red Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-80" />

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        {/* Left: Event Details & Joined Badge */}
                        <div className="space-y-1.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Timer className="w-3 h-3" />
                                    {isUserJoined ? 'Next Joined Skirmish' : 'Upcoming Field Event'}
                                </span>

                                {isUserJoined ? (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Pass Confirmed
                                    </span>
                                ) : (
                                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-[10px] font-medium">
                                        Not Registered Yet
                                    </span>
                                )}
                            </div>

                            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide truncate">
                                {activeEvent.title}
                            </h3>

                            <div className="flex items-center gap-3 text-xs text-zinc-400 flex-wrap">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-red-400" />
                                    {formattedEventDate || activeEvent.date}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                                    {activeEvent.startTime || '09:00 AM'}
                                </span>
                                <span className="flex items-center gap-1 truncate max-w-[180px]">
                                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="truncate">{activeEvent.location || 'Bosjol Arena'}</span>
                                </span>
                            </div>
                        </div>

                        {/* Right: Retro Mechanical Flip Clock (DAY, HOUR, MINUTES, SECONDS) */}
                        <div className="flex items-center gap-3 self-center lg:self-auto shrink-0">
                            <FlipClockDisplay 
                                days={timeRemaining.days}
                                hours={timeRemaining.hours}
                                minutes={timeRemaining.minutes}
                                seconds={timeRemaining.seconds}
                                isMuted={false}
                            />

                            {onSelectEvent && (
                                <button
                                    onClick={() => onSelectEvent(activeEvent)}
                                    className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition border border-zinc-700 shadow-md self-center mt-4"
                                    title="Open Event Details"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

