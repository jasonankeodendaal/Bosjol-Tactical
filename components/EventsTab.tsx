import React, { useState } from 'react';
import type { GameEvent } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { CalendarIcon, PlusIcon } from './icons/Icons';
import { EventCard } from './EventCard';

interface EventsTabProps {
    events: GameEvent[];
    onManageEvent: (id: string | null) => void;
}

export const EventsTab: React.FC<EventsTabProps> = ({ events, onManageEvent }) => {
    const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

    const upcomingEvents = events
        .filter(e => e.status === 'Upcoming' || e.status === 'In Progress')
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const pastEvents = events
        .filter(e => e.status === 'Completed' || e.status === 'Cancelled')
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const eventsToShow = filter === 'upcoming' ? upcomingEvents : pastEvents;

    return (
        <DashboardCard title="Event Management" icon={<CalendarIcon className="w-6 h-6"/>}>
            <div className="p-4">
                 <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <div className="flex space-x-1 p-1 bg-zinc-900 rounded-lg border border-zinc-700">
                        <Button size="sm" variant={filter === 'upcoming' ? 'primary' : 'secondary'} onClick={() => setFilter('upcoming')}>Upcoming ({upcomingEvents.length})</Button>
                        <Button size="sm" variant={filter === 'past' ? 'primary' : 'secondary'} onClick={() => setFilter('past')}>Past ({pastEvents.length})</Button>
                    </div>
                     <Button onClick={() => onManageEvent(null)} className="w-full sm:w-auto">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Create New Event
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                    {eventsToShow.length > 0 ? eventsToShow.map(event => (
                        <div key={event.id} className="cursor-pointer" onClick={() => onManageEvent(event.id)}>
                            <EventCard event={event} />
                        </div>
                    )) : (
                         <p className="text-center text-gray-500 py-8 col-span-full">No {filter} events found.</p>
                    )}
                </div>
            </div>
        </DashboardCard>
    );
};