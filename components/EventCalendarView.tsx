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
    ListFilter
} from 'lucide-react';

interface EventCalendarViewProps {
    events: GameEvent[];
    onSelectEvent: (event: GameEvent) => void;
    activeFilter?: 'upcoming' | 'past' | 'all';
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const EventCalendarView: React.FC<EventCalendarViewProps> = ({ 
    events, 
    onSelectEvent,
    activeFilter = 'all' 
}) => {
    // Current viewed date (month & year)
    const [currentDate, setCurrentDate] = useState(() => new Date());
    // Selected day for detailed viewing on mobile or bottom drawer
    const [selectedDay, setSelectedDay] = useState<Date | null>(() => new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Helper: format month title (e.g., "August 2026")
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Filter events according to activeFilter prop
    const filteredEvents = useMemo(() => {
        return events.filter(e => {
            if (activeFilter === 'upcoming') {
                return e.status === 'Upcoming' || e.status === 'In Progress';
            }
            if (activeFilter === 'past') {
                return e.status === 'Completed' || e.status === 'Cancelled';
            }
            return true;
        });
    }, [events, activeFilter]);

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
        filteredEvents.forEach(event => {
            const key = getEventDateKey(event.date);
            if (key) {
                if (!map[key]) map[key] = [];
                map[key].push(event);
            }
        });
        return map;
    }, [filteredEvents]);

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

        // Days of next month to complete grid (42 total slots for 6 rows)
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

    // Helper for status styling
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'In Progress':
                return {
                    badge: 'bg-red-600/30 text-red-300 border-red-500/50 animate-pulse',
                    dot: 'bg-red-500 shadow-[0_0_8px_#ef4444]',
                    border: 'border-red-500/60 bg-red-950/20'
                };
            case 'Upcoming':
                return {
                    badge: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/40',
                    dot: 'bg-emerald-400 shadow-[0_0_6px_#34d399]',
                    border: 'border-emerald-500/40 bg-emerald-950/20'
                };
            case 'Completed':
                return {
                    badge: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40',
                    dot: 'bg-zinc-400',
                    border: 'border-zinc-700/50 bg-zinc-900/30'
                };
            default:
                return {
                    badge: 'bg-amber-600/30 text-amber-300 border-amber-500/40',
                    dot: 'bg-amber-400',
                    border: 'border-amber-500/40 bg-amber-950/20'
                };
        }
    };

    return (
        <div className="w-full space-y-3">
            {/* Calendar Controls & Month Title */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 sm:p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-lg backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-red-600/20 border border-red-500/30 text-red-400">
                        <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm sm:text-base font-bold text-white tracking-wide capitalize flex items-center gap-2">
                            {monthName}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-zinc-400">
                            {filteredEvents.length} total event{filteredEvents.length !== 1 ? 's' : ''} listed
                        </p>
                    </div>
                </div>

                {/* Month Nav Buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <button
                        onClick={handleToday}
                        className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] sm:text-xs font-semibold border border-zinc-700 transition"
                    >
                        Today
                    </button>
                    <div className="flex items-center rounded-lg bg-zinc-950 border border-zinc-800 p-0.5">
                        <button
                            onClick={handlePrevMonth}
                            className="p-1 sm:p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                            title="Previous Month"
                            aria-label="Previous Month"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleNextMonth}
                            className="p-1 sm:p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition"
                            title="Next Month"
                            aria-label="Next Month"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Legend */}
            <div className="flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-[10.5px] sm:text-xs">
                <span className="text-zinc-400 font-semibold uppercase tracking-wider text-[9.5px]">Legend:</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span> Upcoming
                </span>
                <span className="inline-flex items-center gap-1 text-red-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_#ef4444]"></span> Live / In Progress
                </span>
                <span className="inline-flex items-center gap-1 text-zinc-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-zinc-500"></span> Completed / Past
                </span>
            </div>

            {/* Calendar Main Table / Grid Container */}
            <div className="rounded-2xl bg-zinc-950/80 border border-zinc-800/90 overflow-hidden shadow-xl box-border">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 bg-zinc-900/90 border-b border-zinc-800 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 py-2">
                    {WEEKDAYS.map((day, idx) => (
                        <div key={day} className={idx === 0 || idx === 6 ? 'text-red-400/80' : ''}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 auto-rows-fr gap-px bg-zinc-800/60">
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
                                className={`min-h-[75px] sm:min-h-[105px] p-1 sm:p-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                                    item.isCurrentMonth
                                        ? 'bg-zinc-950 hover:bg-zinc-900/90 text-white'
                                        : 'bg-zinc-950/40 text-zinc-600 hover:bg-zinc-950/60'
                                } ${
                                    isToday
                                        ? 'ring-2 ring-red-500/80 bg-red-950/30 shadow-[inset_0_0_15px_rgba(220,38,38,0.2)]'
                                        : ''
                                } ${
                                    isSelected && !isToday
                                        ? 'ring-1 ring-amber-400/70 bg-amber-950/20'
                                        : ''
                                }`}
                            >
                                {/* Top Day Number Bar */}
                                <div className="flex items-center justify-between">
                                    <span
                                        className={`inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[11px] sm:text-xs font-bold ${
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

                                    {/* Mobile Dot Indicators */}
                                    {dayEvents.length > 0 && (
                                        <div className="flex sm:hidden items-center gap-0.5">
                                            {dayEvents.slice(0, 3).map((ev, i) => {
                                                const st = getStatusStyle(ev.status);
                                                return <span key={i} className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />;
                                            })}
                                            {dayEvents.length > 3 && (
                                                <span className="text-[8px] text-zinc-400 font-bold">+</span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Event Cards inside Desktop Grid */}
                                <div className="mt-1 space-y-1 overflow-y-auto max-h-[55px] sm:max-h-[75px] custom-scrollbar hidden sm:block">
                                    {dayEvents.map(event => {
                                        const st = getStatusStyle(event.status);
                                        return (
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                key={event.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onSelectEvent(event);
                                                }}
                                                className={`p-1 sm:p-1.5 rounded-lg border text-left text-[10px] leading-tight transition-all shadow-sm ${st.border} ${
                                                    event.status === 'In Progress' ? 'bg-red-950/60' : 'bg-zinc-900/90'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`} />
                                                    <span className="font-mono text-[9px] text-zinc-400 truncate">
                                                        {event.startTime || 'TBD'}
                                                    </span>
                                                </div>
                                                <p className="font-bold text-white truncate drop-shadow-sm">
                                                    {event.title}
                                                </p>
                                                <p className="text-[9px] text-zinc-400 truncate flex items-center gap-0.5 mt-0.5">
                                                    <MapPin className="w-2.5 h-2.5 text-zinc-500 shrink-0" />
                                                    <span className="truncate">{event.location || 'Tactical Arena'}</span>
                                                </p>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Selected Day Event Drawer / List Section */}
            {selectedDay && (
                <div className="mt-4 p-3 sm:p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-red-400" />
                            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                                Events on {selectedDay.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                            </h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px] sm:text-xs font-semibold">
                            {selectedDayEvents.length} Event{selectedDayEvents.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {selectedDayEvents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {selectedDayEvents.map(event => {
                                const st = getStatusStyle(event.status);
                                return (
                                    <div
                                        key={event.id}
                                        onClick={() => onSelectEvent(event)}
                                        className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-red-500/50 cursor-pointer transition-all shadow-md group flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider border ${st.badge}`}>
                                                    {event.status}
                                                </span>
                                                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                                                    {event.type}
                                                </span>
                                            </div>

                                            <h5 className="font-bold text-sm text-white group-hover:text-red-400 transition-colors">
                                                {event.title}
                                            </h5>

                                            <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                                                {event.description || 'Join Command for tactical skirmish operations.'}
                                            </p>
                                        </div>

                                        <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-red-400" />
                                                {event.startTime || '09:00 AM'}
                                            </span>
                                            <span className="flex items-center gap-1 truncate max-w-[120px]">
                                                <MapPin className="w-3 h-3 text-emerald-400" />
                                                <span className="truncate">{event.location}</span>
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-center text-zinc-500 text-xs py-3 italic">
                            No operations scheduled for this date. Select another calendar date above.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};
