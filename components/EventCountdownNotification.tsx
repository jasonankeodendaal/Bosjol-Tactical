import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    ShieldAlert,
    Sparkles,
    Timer
} from 'lucide-react';

interface EventCountdownNotificationProps {
    player: Player;
    events: GameEvent[];
    signups: Signup[];
    onSelectEvent?: (event: GameEvent) => void;
}

interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
    isPast: boolean;
}

// Helper to reliably parse event start timestamp
export function getEventStartTime(event: GameEvent): number {
    if (!event.date) return 0;
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
        if (!isNaN(parsedDate.getTime())) return parsedDate.getTime();
        return new Date(event.date).getTime();
    } catch {
        return new Date(event.date).getTime();
    }
}

function calculateTimeRemaining(targetTimestamp: number): TimeRemaining {
    const now = Date.now();
    const diff = targetTimestamp - now;

    if (diff <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: diff, isPast: true };
    }

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds, totalMs: diff, isPast: false };
}

export const EventCountdownNotification: React.FC<EventCountdownNotificationProps> = ({
    player,
    events,
    signups,
    onSelectEvent
}) => {
    const [toastDismissed, setToastDismissed] = useState<boolean>(false);
    const [now, setNow] = useState<number>(Date.now());

    // Update timer every second
    useEffect(() => {
        const timer = setInterval(() => {
            setNow(Date.now());
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
            const isAlpha = e.teams?.alpha?.includes(player.id);
            const isBravo = e.teams?.bravo?.includes(player.id);
            return (isSignedUp || isAttendee || isAlpha || isBravo) && e.status !== 'Cancelled';
        });
    }, [events, signups, player.id]);

    // Next upcoming joined event sorted by closest start time
    const nextJoinedEvent = useMemo(() => {
        if (joinedEvents.length === 0) return null;

        const upcoming = joinedEvents
            .map(event => ({ event, timestamp: getEventStartTime(event) }))
            .filter(item => item.timestamp > now - (4 * 60 * 60 * 1000)) // count event as current up to 4 hrs after start
            .sort((a, b) => a.timestamp - b.timestamp);

        return upcoming.length > 0 ? upcoming[0].event : null;
    }, [joinedEvents, now]);

    // Fallback if no joined event: closest upcoming general event
    const fallbackNextEvent = useMemo(() => {
        if (nextJoinedEvent) return null;
        const upcomingGeneral = events
            .filter(e => e.status === 'Upcoming' || e.status === 'In Progress')
            .map(event => ({ event, timestamp: getEventStartTime(event) }))
            .filter(item => item.timestamp > now - (4 * 60 * 60 * 1000))
            .sort((a, b) => a.timestamp - b.timestamp);

        return upcomingGeneral.length > 0 ? upcomingGeneral[0].event : null;
    }, [nextJoinedEvent, events, now]);

    const activeEvent = nextJoinedEvent || fallbackNextEvent;
    const isUserJoined = !!nextJoinedEvent;

    // Time calculations for active event
    const activeEventTimestamp = activeEvent ? getEventStartTime(activeEvent) : 0;
    const timeRemaining = useMemo(() => {
        return activeEventTimestamp ? calculateTimeRemaining(activeEventTimestamp) : null;
    }, [activeEventTimestamp, now]);

    // Check 24-hour condition for Toast
    // Trigger toast if event starts within 24 hrs (86,400,000 ms) and hasn't passed more than 2 hrs ago
    const isWithin24Hours = useMemo(() => {
        if (!activeEvent || !timeRemaining) return false;
        const ms = timeRemaining.totalMs;
        return ms > 0 && ms <= 24 * 60 * 60 * 1000;
    }, [activeEvent, timeRemaining]);

    if (!activeEvent || !timeRemaining) {
        return null;
    }

    return (
        <div className="space-y-3">
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
                                        <span className="font-mono font-black text-amber-400 text-sm">
                                            {String(timeRemaining.hours).padStart(2, '0')}h{' '}
                                            {String(timeRemaining.minutes).padStart(2, '0')}m{' '}
                                            {String(timeRemaining.seconds).padStart(2, '0')}s
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

            {/* LIVE COUNTDOWN TIMER BANNER / CARD */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800 shadow-xl backdrop-blur-md relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Left: Event Details & Joined Badge */}
                    <div className="space-y-1">
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
                                {new Date(activeEvent.date).toLocaleDateString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric'
                                })}
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

                    {/* Right: Live Ticking Countdown Units */}
                    <div className="flex items-center gap-2 sm:gap-3 self-center md:self-auto">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            {/* Days */}
                            <div className="flex flex-col items-center justify-center w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-zinc-900 border border-zinc-800 text-center shadow-inner">
                                <span className="font-mono text-base sm:text-xl font-black text-white">
                                    {String(timeRemaining.days).padStart(2, '0')}
                                </span>
                                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                                    Days
                                </span>
                            </div>

                            <span className="text-red-500 font-bold text-lg mb-2">:</span>

                            {/* Hours */}
                            <div className="flex flex-col items-center justify-center w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-zinc-900 border border-zinc-800 text-center shadow-inner">
                                <span className="font-mono text-base sm:text-xl font-black text-white">
                                    {String(timeRemaining.hours).padStart(2, '0')}
                                </span>
                                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                                    Hours
                                </span>
                            </div>

                            <span className="text-red-500 font-bold text-lg mb-2">:</span>

                            {/* Minutes */}
                            <div className="flex flex-col items-center justify-center w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-zinc-900 border border-zinc-800 text-center shadow-inner">
                                <span className="font-mono text-base sm:text-xl font-black text-white">
                                    {String(timeRemaining.minutes).padStart(2, '0')}
                                </span>
                                <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                                    Mins
                                </span>
                            </div>

                            <span className="text-red-500 font-bold text-lg mb-2">:</span>

                            {/* Seconds */}
                            <div className="flex flex-col items-center justify-center w-12 h-14 sm:w-14 sm:h-16 rounded-xl bg-red-950/40 border border-red-500/40 text-center shadow-[inset_0_0_10px_rgba(220,38,38,0.2)]">
                                <span className="font-mono text-base sm:text-xl font-black text-red-400 animate-pulse">
                                    {String(timeRemaining.seconds).padStart(2, '0')}
                                </span>
                                <span className="text-[9px] uppercase font-bold text-red-500/80 tracking-wider">
                                    Secs
                                </span>
                            </div>
                        </div>

                        {onSelectEvent && (
                            <button
                                onClick={() => onSelectEvent(activeEvent)}
                                className="ml-2 p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition border border-zinc-700"
                                title="Open Event Details"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
