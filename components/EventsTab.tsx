import React, { useState } from 'react';
import type { GameEvent, Signup } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { CalendarIcon, PlusIcon } from './icons/Icons';
import { EventCard } from './EventCard';
import { EventQRCodeModal } from './EventQRCodeModal';
import { EventCalendarView } from './EventCalendarView';
import { LayoutGrid, CalendarDays } from 'lucide-react';

interface EventsTabProps {
    events: GameEvent[];
    signups?: Signup[];
    onManageEvent: (id: string | null) => void;
}

export const EventsTab: React.FC<EventsTabProps> = ({ events, signups = [], onManageEvent }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
    const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
    const [selectedQREvent, setSelectedQREvent] = useState<GameEvent | null>(null);

    const upcomingEvents = events
        .filter(e => e.status === 'Upcoming' || e.status === 'In Progress')
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const pastEvents = events
        .filter(e => e.status === 'Completed' || e.status === 'Cancelled')
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const eventsToShow = filter === 'upcoming' ? upcomingEvents : pastEvents;

    return (
        <DashboardCard title="Event Management" icon={<CalendarIcon className="w-6 h-6"/>}>
            <div className="p-2 sm:p-4 space-y-3">
                 <div className="flex flex-wrap items-center justify-between mb-3 sm:mb-4 gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex space-x-1 p-0.5 sm:p-1 bg-zinc-900 rounded-lg border border-zinc-700">
                            <Button size="sm" className="!px-2 !py-1 !text-[10px] sm:!text-xs" variant={filter === 'upcoming' ? 'primary' : 'secondary'} onClick={() => setFilter('upcoming')}>Upcoming ({upcomingEvents.length})</Button>
                            <Button size="sm" className="!px-2 !py-1 !text-[10px] sm:!text-xs" variant={filter === 'past' ? 'primary' : 'secondary'} onClick={() => setFilter('past')}>Past ({pastEvents.length})</Button>
                        </div>

                        {/* View Switcher */}
                        <div className="flex space-x-1 p-0.5 sm:p-1 bg-zinc-950 rounded-lg border border-zinc-800">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-red-600 text-white shadow-sm'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                }`}
                                title="Grid Layout"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span className="hidden xs:inline">Grid List</span>
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition-all ${
                                    viewMode === 'calendar'
                                        ? 'bg-red-600 text-white shadow-sm'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                }`}
                                title="Monthly Calendar Layout"
                            >
                                <CalendarDays className="w-3.5 h-3.5" />
                                <span className="hidden xs:inline">Monthly Calendar</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button onClick={() => onManageEvent(null)} size="sm" className="!px-2 !py-1 !text-[10px] sm:!text-xs w-auto">
                            <PlusIcon className="w-3.5 h-3.5 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Create New Event</span>
                            <span className="sm:hidden">Create</span>
                        </Button>
                    </div>
                </div>

                {viewMode === 'calendar' ? (
                    <EventCalendarView
                        events={events}
                        onSelectEvent={(ev) => onManageEvent(ev.id)}
                        activeFilter={filter}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-4 max-h-[65vh] overflow-y-auto pr-1 sm:pr-2">
                        {eventsToShow.length > 0 ? eventsToShow.map(event => (
                            <div key={event.id} className="cursor-pointer h-full" onClick={() => onManageEvent(event.id)}>
                                <EventCard 
                                    event={event} 
                                    onShowQR={(ev) => setSelectedQREvent(ev)}
                                    signupsCount={signups ? signups.filter(s => s.eventId === event.id).length : undefined}
                                />
                            </div>
                        )) : (
                             <p className="text-center text-gray-500 py-8 col-span-full text-xs sm:text-base">No {filter} events found.</p>
                        )}
                    </div>
                )}
            </div>

            {selectedQREvent && (
                <EventQRCodeModal 
                    event={selectedQREvent}
                    signups={signups}
                    onClose={() => setSelectedQREvent(null)}
                />
            )}
        </DashboardCard>
    );
};