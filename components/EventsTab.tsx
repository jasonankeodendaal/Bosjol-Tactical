import React, { useState } from 'react';
import type { GameEvent, Signup } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { CalendarIcon, PlusIcon } from './icons/Icons';
import { EventCard } from './EventCard';
import { EventQRCodeModal } from './EventQRCodeModal';
import { EventCalendarView } from './EventCalendarView';
import { Modal } from './Modal';
import { LayoutGrid, CalendarDays, Database, Copy, Check } from 'lucide-react';

interface EventsTabProps {
    events: GameEvent[];
    signups?: Signup[];
    onManageEvent: (id: string | null) => void;
}

const EVENTS_SQL_SNIPPET = `-- ==========================================================
-- SUPABASE / POSTGRESQL SCHEMA & UPDATE SCRIPT FOR AIRSOFT EVENTS
-- ==========================================================

-- 1. Ensure the events table exists with all modern columns
CREATE TABLE IF NOT EXISTS public.events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Mission',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    "startTime" TEXT NOT NULL DEFAULT '10:00',
    location TEXT NOT NULL DEFAULT 'Main Arena',
    description TEXT DEFAULT '',
    theme TEXT DEFAULT 'Standard Field Skirmish',
    rules TEXT DEFAULT '',
    "participationXp" INTEGER DEFAULT 50,
    status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'In Progress', 'Completed', 'Cancelled')),
    "imageUrl" TEXT,
    "audioBriefingUrl" TEXT,
    "gameFee" NUMERIC(10,2) DEFAULT 0,
    "gearForRent" JSONB DEFAULT '[]'::jsonb,
    "rentalPriceOverrides" JSONB DEFAULT '{}'::jsonb,
    "eventBadges" JSONB DEFAULT '[]'::jsonb,
    "awardedBadges" JSONB DEFAULT '[]'::jsonb,
    attendees JSONB DEFAULT '[]'::jsonb,
    "liveStats" JSONB DEFAULT '{}'::jsonb,
    teams JSONB DEFAULT '[]'::jsonb,
    "xpOverrides" JSONB DEFAULT '{}'::jsonb,
    "gameDurationSeconds" INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Safely add any missing columns to existing events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "startTime" TEXT DEFAULT '10:00';
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "audioBriefingUrl" TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "gameFee" NUMERIC(10,2) DEFAULT 0;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "gearForRent" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "rentalPriceOverrides" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "eventBadges" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "awardedBadges" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS attendees JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "liveStats" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS teams JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "xpOverrides" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS "gameDurationSeconds" INTEGER;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Update status CHECK constraint to allow 'Cancelled'
DO $$
BEGIN
    ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_status_check;
    ALTER TABLE public.events ADD CONSTRAINT events_status_check 
        CHECK (status IN ('Upcoming', 'In Progress', 'Completed', 'Cancelled'));
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 4. Ensure match signups table exists
CREATE TABLE IF NOT EXISTS public.signups (
    id TEXT PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ DEFAULT NOW(),
    "paymentStatus" TEXT DEFAULT 'Unpaid' CHECK ("paymentStatus" IN ('Paid (Online)', 'Paid (Card)', 'Paid (Cash)', 'Unpaid')),
    "rentals" JSONB DEFAULT '[]'::jsonb,
    "totalPaid" NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS) and grant open access for app client
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access on events" ON public.events;
CREATE POLICY "Allow full access on events" ON public.events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access on signups" ON public.signups;
CREATE POLICY "Allow full access on signups" ON public.signups FOR ALL USING (true) WITH CHECK (true);

-- 6. Enable Realtime Change Data Capture (CDC) over WebSockets
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.signups;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 7. Optimize performance with indexes
CREATE INDEX IF NOT EXISTS idx_events_date_status ON public.events (date, status);
CREATE INDEX IF NOT EXISTS idx_signups_event_player ON public.signups ("eventId", "playerId");`;

export const EventsTab: React.FC<EventsTabProps> = ({ events, signups = [], onManageEvent }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
    const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
    const [selectedQREvent, setSelectedQREvent] = useState<GameEvent | null>(null);
    const [showSqlModal, setShowSqlModal] = useState(false);
    const [copiedSql, setCopiedSql] = useState(false);

    const upcomingEvents = events
        .filter(e => e.status === 'Upcoming' || e.status === 'In Progress')
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const pastEvents = events
        .filter(e => e.status === 'Completed' || e.status === 'Cancelled')
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const eventsToShow = filter === 'upcoming' ? upcomingEvents : pastEvents;

    const handleCopySql = () => {
        navigator.clipboard.writeText(EVENTS_SQL_SNIPPET);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 2000);
    };

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
                        <Button 
                            onClick={() => setShowSqlModal(true)} 
                            size="sm" 
                            variant="secondary" 
                            className="!px-2 !py-1 !text-[10px] sm:!text-xs !border-cyan-500/40 !text-cyan-400 hover:!bg-cyan-950/40"
                        >
                            <Database className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                            <span>SQL Updates</span>
                        </Button>

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

            {showSqlModal && (
                <Modal title="Events & Countdown SQL Setup Snippet" onClose={() => setShowSqlModal(false)}>
                    <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-zinc-400">
                                Run this script in your <strong className="text-white">Supabase SQL Editor</strong> to ensure all table columns, status constraints (including <code className="text-red-400 font-mono">Cancelled</code>), and CDC Realtime subscriptions are set up correctly.
                            </p>
                            <Button 
                                size="sm" 
                                variant={copiedSql ? 'primary' : 'secondary'} 
                                onClick={handleCopySql}
                                className="shrink-0 ml-3 !text-xs flex items-center gap-1.5"
                            >
                                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedSql ? 'Copied!' : 'Copy SQL'}</span>
                            </Button>
                        </div>

                        <div className="relative rounded-lg overflow-hidden border border-zinc-700 bg-zinc-950 p-3 font-mono text-[11px] text-emerald-400/90 leading-relaxed overflow-x-auto select-all max-h-96">
                            <pre>{EVENTS_SQL_SNIPPET}</pre>
                        </div>
                    </div>
                </Modal>
            )}
        </DashboardCard>
    );
};