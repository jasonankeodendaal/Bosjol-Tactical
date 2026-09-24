import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameEvent } from '../types';
import { 
    Calendar as CalendarIcon, 
    ChevronLeft, 
    ChevronRight, 
    Clock, 
    MapPin, 
    Users, 
    Sparkles, 
    CheckCircle2, 
    AlertCircle, 
    CalendarDays,
    Info,
    Grid,
    ListFilter,
    Radio,
    Flame
} from 'lucide-react';

interface EventCalendarViewProps {
    events: GameEvent[];
    onSelectEvent: (event: GameEvent) => void;
    activeFilter?: 'upcoming' | 'past' | 'all';
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const EventCalendarView: React.FC<EventCalendarViewProps> = ({ 
    events = [], 
    onSelectEvent,
    activeFilter: initialActiveFilter = 'all' 
}) => {
    // Current viewed date (month & year)
    const [currentDate, setCurrentDate] = useState(() => new Date());
    // Selected day for detailed viewing
    const [selectedDay, setSelectedDay] = useState<Date | null>(() => new Date());
    // Local calendar filter to allow viewing All, Upcoming, Live, or Past
    const [calendarFilter, setCalendarFilter] = useState<'all' | 'upcoming' | 'live' | 'past'>('all');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Helper: format month title (e.g., "September 2026")
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Determine real-time event status: Past, Present (Live/In Progress), Upcoming
    const getComputedStatus = (event: GameEvent): 'live' | 'upcoming' | 'past' => {
        if (event.status === 'In Progress') return 'live';
        if (event.status === 'Completed' || event.status === 'Cancelled') return 'past';
        if (event.status === 'Upcoming') {
            // Check if date is today or past
            const eventDate = new Date(event.date);
            const now = new Date();
            if (!isNaN(eventDate.getTime())) {
                const diffHours = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                if (diffHours < -8) return 'past'; // Event concluded
                if (diffHours >= -8 && diffHours <= 6) return 'live'; // Event happening today/now
            }
            return 'upcoming';
        }
        return 'upcoming';
    };

    // Filter events based on calendarFilter: Default 'all' showcases ALL past, present and upcoming events
    const displayEvents = useMemo(() => {
        return (events || []).filter(e => {
            const compStatus = getComputedStatus(e);
            if (calendarFilter === 'upcoming') {
                return compStatus === 'upcoming';
            }
            if (calendarFilter === 'live') {
                return compStatus === 'live';
            }
            if (calendarFilter === 'past') {
                return compStatus === 'past';
            }
            // 'all' shows everything: past, present, and upcoming
            return true;
        });
    }, [events, calendarFilter]);

    // Parse event date safely into year, month, day string key 'YYYY-MM-DD'
    const getEventDateKey = (dateInput: string | Date): string => {
        try {
            const d = new Date(dateInput);
            if (isNaN(d.getTime())) return '';
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        } catch {
            return '';
        }
    };

    // Map events by date key 'YYYY-MM-DD'
    const eventsByDateKey = useMemo(() => {
        const map: Record<string, GameEvent[]> = {};
        displayEvents.forEach(event => {
            const key = getEventDateKey(event.date);
            if (key) {
                if (!map[key]) map[key] = [];
                map[key].push(event);
            }
        });
        return map;
    }, [displayEvents]);

    // Calendar grid calculations
    const calendarDays = useMemo(() => {
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        
        const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday
        const totalDaysInMonth = lastDayOfMonth.getDate();
        
        // Days from previous month to fill row
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        const prevDays = [];
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            prevDays.push({
                date: new Date(year, month - 1, prevMonthLastDay - i),
                isCurrentMonth: false,
                isPrevMonth: true
            });
        }

        // Days of current month
        const currentDays = [];
        for (let day = 1; day <= totalDaysInMonth; day++) {
            currentDays.push({
                date: new Date(year, month, day),
                isCurrentMonth: true,
                isPrevMonth: false
            });
        }

        // Days of next month to complete grid
        const totalSlotsNeeded = Math.ceil((prevDays.length + currentDays.length) / 7) * 7;
        const nextDaysNeeded = totalSlotsNeeded - (prevDays.length + currentDays.length);
        const nextDays = [];
        for (let day = 1; day <= nextDaysNeeded; day++) {
            nextDays.push({
                date: new Date(year, month + 1, day),
                isCurrentMonth: false,
                isNextMonth: true
            });
        }

        return [...prevDays, ...currentDays, ...nextDays];
    }, [year, month]);

    // Navigation functions
    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleToday = () => {
        const today = new Date();
        setCurrentDate(today);
        setSelectedDay(today);
    };

    const todayKey = getEventDateKey(new Date());

    // Selected day events
    const selectedDateKey = selectedDay ? getEventDateKey(selectedDay) : '';
    const selectedDayEvents = selectedDateKey ? (eventsByDateKey[selectedDateKey] || []) : [];

    // Counts for past, present/live, upcoming
    const stats = useMemo(() => {
        let upcomingCount = 0;
        let liveCount = 0;
        let pastCount = 0;
        (events || []).forEach(e => {
            const st = getComputedStatus(e);
            if (st === 'upcoming') upcomingCount++;
            else if (st === 'live') liveCount++;
            else if (st === 'past') pastCount++;
        });
        return { total: events.length, upcoming: upcomingCount, live: liveCount, past: pastCount };
    }, [events]);

    // Helper for visual status styling
    const getStatusStyle = (event: GameEvent) => {
        const computed = getComputedStatus(event);
        switch (computed) {
            case 'live':
                return {
                    label: 'LIVE NOW',
                    badge: 'bg-red-600/40 text-red-300 border-red-500/60 animate-pulse',
                    dot: 'bg-red-500 shadow-[0_0_8px_#ef4444]',
                    pill: 'bg-red-950/80 text-red-200 border-red-500/50 hover:bg-red-900',
                    border: 'border-red-500/60 bg-red-950/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                };
            case 'upcoming':
                return {
                    label: 'UPCOMING',
                    badge: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40',
                    dot: 'bg-emerald-400 shadow-[0_0_6px_#34d399]',
                    pill: 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40 hover:bg-emerald-900',
                    border: 'border-emerald-500/40 bg-emerald-950/20'
                };
            case 'past':
            default:
                return {
                    label: 'COMPLETED',
                    badge: 'bg-zinc-800/60 text-zinc-400 border-zinc-700/50',
                    dot: 'bg-zinc-500',
                    pill: 'bg-zinc-900/90 text-zinc-400 border-zinc-800 hover:bg-zinc-800',
                    border: 'border-zinc-800 bg-zinc-950/40'
                };
        }
    };

    return (
        <div className="w-full space-y-2.5 font-sans">
            {/* Calendar Controls & Month Header Strip (Shrink to Fit, 3D Depth) */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-zinc-950/90 shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center shadow-inner">
                        <CalendarDays className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm sm:text-base font-black text-white tracking-wide uppercase font-mono flex items-center gap-2">
                            <span>{monthName}</span>
                            <span className="px-2 py-0.2 rounded-full text-[9px] font-mono bg-zinc-800 text-zinc-300">
                                {displayEvents.length} Events on Schedule
                            </span>
                        </h3>
                        <p className="text-[10px] text-zinc-400">
                            Showcasing all Past, Present & Upcoming matches on calendar
                        </p>
                    </div>
                </div>

                {/* Filter Selector & Navigation Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Filter Pills */}
                    <div className="flex items-center p-0.5 rounded-xl bg-zinc-900 shadow-inner font-mono text-[10px]">
                        <button
                            onClick={() => setCalendarFilter('all')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                                calendarFilter === 'all'
                                    ? 'bg-amber-600 text-white shadow-sm'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            All ({stats.total})
                        </button>
                        <button
                            onClick={() => setCalendarFilter('upcoming')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                                calendarFilter === 'upcoming'
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            Upcoming ({stats.upcoming})
                        </button>
                        {stats.live > 0 && (
                            <button
                                onClick={() => setCalendarFilter('live')}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                                    calendarFilter === 'live'
                                        ? 'bg-red-600 text-white shadow-sm animate-pulse'
                                        : 'text-red-400 hover:text-red-300'
                                }`}
                            >
                                <Radio className="w-2.5 h-2.5 animate-pulse" />
                                <span>Live ({stats.live})</span>
                            </button>
                        )}
                        <button
                            onClick={() => setCalendarFilter('past')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                                calendarFilter === 'past'
                                    ? 'bg-zinc-700 text-white shadow-sm'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            Past ({stats.past})
                        </button>
                    </div>

                    {/* Month Nav Buttons */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleToday}
                            className="px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10.5px] font-mono font-bold transition shadow-sm"
                        >
                            Today
                        </button>
                        <div className="flex items-center rounded-xl bg-zinc-900 p-0.5 shadow-inner">
                            <button
                                onClick={handlePrevMonth}
                                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                                title="Previous Month"
                            >
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={handleNextMonth}
                                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                                title="Next Month"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Legend Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/80 shadow-sm text-[10px] font-mono">
                <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-zinc-500 font-bold uppercase tracking-wider text-[9px]">Legend:</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" /> Upcoming
                    </span>
                    <span className="inline-flex items-center gap-1 text-red-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]" /> Present / Live
                    </span>
                    <span className="inline-flex items-center gap-1 text-zinc-400 font-bold">
                        <span className="w-2 h-2 rounded-full bg-zinc-500" /> Past / Completed
                    </span>
                </div>
                <span className="text-zinc-500 text-[9px]">
                    Click any day or event pill to inspect
                </span>
            </div>

            {/* Calendar Main Grid Container */}
            <div className="rounded-2xl bg-zinc-950/90 shadow-[0_16px_36px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 bg-zinc-900/90 border-b border-white/5 text-center text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 py-1.5">
                    {WEEKDAYS.map((day, idx) => (
                        <div key={day} className={idx === 0 || idx === 6 ? 'text-amber-400/80' : ''}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 auto-rows-fr gap-px bg-zinc-800/40">
                    {calendarDays.map((item, index) => {
                        const dateKey = getEventDateKey(item.date);
                        const dayEvents = eventsByDateKey[dateKey] || [];
                        const isToday = dateKey === todayKey;
                        const isSelected = selectedDateKey === dateKey;
                        const dayNum = item.date.getDate();

                        return (
                            <div
                                key={index}
                                onClick={() => setSelectedDay(item.date)}
                                className={`min-h-[78px] sm:min-h-[100px] p-1 sm:p-1.5 transition-all cursor-pointer relative flex flex-col justify-between select-none ${
                                    item.isCurrentMonth
                                        ? 'bg-zinc-950 hover:bg-zinc-900/90 text-white'
                                        : 'bg-zinc-950/50 text-zinc-600 hover:bg-zinc-950/80'
                                } ${
                                    isToday
                                        ? 'ring-2 ring-red-500/90 bg-red-950/20 shadow-[inset_0_0_15px_rgba(220,38,38,0.2)]'
                                        : ''
                                } ${
                                    isSelected && !isToday
                                        ? 'ring-1 ring-amber-400/80 bg-amber-950/20'
                                        : ''
                                }`}
                            >
                                {/* Day Number Bar */}
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold ${
                                            isToday
                                                ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(220,38,38,0.8)]'
                                                : isSelected
                                                ? 'bg-amber-500 text-black font-extrabold'
                                                : item.isCurrentMonth
                                                ? 'text-zinc-200'
                                                : 'text-zinc-600'
                                        }`}
                                    >
                                        {dayNum}
                                    </span>

                                    {/* Mobile/Micro Dot Indicators */}
                                    {dayEvents.length > 0 && (
                                        <div className="flex items-center gap-0.5">
                                            {dayEvents.slice(0, 3).map((ev, i) => {
                                                const st = getStatusStyle(ev);
                                                return <span key={i} className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />;
                                            })}
                                            {dayEvents.length > 3 && (
                                                <span className="text-[8px] font-mono text-zinc-400 font-bold">
                                                    +{dayEvents.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Event Pills Directly on Calendar Tile */}
                                <div className="mt-1 space-y-1 overflow-hidden">
                                    {dayEvents.slice(0, 2).map(event => {
                                        const st = getStatusStyle(event);
                                        return (
                                            <div
                                                key={event.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectEvent(event);
                                                }}
                                                className={`p-1 rounded-lg text-left text-[9px] leading-tight transition-all shadow-sm cursor-pointer border ${st.pill} active:scale-95`}
                                                title={`${event.title} (${st.label})`}
                                            >
                                                <div className="flex items-center justify-between gap-0.5">
                                                    <span className="font-mono text-[8px] font-bold truncate">
                                                        {event.startTime || '09:00'}
                                                    </span>
                                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                                                </div>
                                                <p className="font-bold truncate mt-0.2">
                                                    {event.title}
                                                </p>
                                            </div>
                                        );
                                    })}

                                    {dayEvents.length > 2 && (
                                        <div 
                                            onClick={() => setSelectedDay(item.date)}
                                            className="text-[8px] font-mono font-bold text-amber-400 text-center py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 transition-colors"
                                        >
                                            +{dayEvents.length - 2} more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected Day Event Drawer / List Section */}
            {selectedDay && (
                <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950/90 shadow-[0_16px_36px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] space-y-2.5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-amber-400" />
                            <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-mono">
                                Operations on {selectedDay.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 text-[10px] font-mono font-bold">
                            {selectedDayEvents.length} Event{selectedDayEvents.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {selectedDayEvents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {selectedDayEvents.map(event => {
                                const st = getStatusStyle(event);
                                return (
                                    <div
                                        key={event.id}
                                        onClick={() => onSelectEvent(event)}
                                        className={`p-3 rounded-2xl bg-zinc-900/90 hover:bg-zinc-900 cursor-pointer transition-all shadow-md group flex flex-col justify-between border ${st.border}`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-1.5 font-mono text-[9px]">
                                                <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${st.badge}`}>
                                                    {st.label}
                                                </span>
                                                <span className="text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded">
                                                    {event.gameType || 'Skirmish'}
                                                </span>
                                            </div>

                                            <h5 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-400 transition-colors">
                                                {event.title}
                                            </h5>

                                            <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                                                {event.description || 'Tactical airsoft match operations.'}
                                            </p>
                                        </div>

                                        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-amber-400" />
                                                {event.startTime || '09:00 AM'}
                                            </span>
                                            <span className="flex items-center gap-1 truncate max-w-[130px]">
                                                <MapPin className="w-3 h-3 text-emerald-400" />
                                                <span className="truncate">{event.location || 'Tactical Field'}</span>
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-zinc-500 text-xs py-2 italic font-mono">
                            No operations scheduled for this date. Click on any date with a marker to view matches.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
