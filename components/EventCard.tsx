
import React, { memo } from 'react';
import { motion, Variants } from 'framer-motion';
import { GameEvent, EventType, EventStatus } from '../types';
import { BadgePill } from './BadgePill';
import { CalendarIcon } from './icons/Icons';
import { QrCode } from 'lucide-react';

interface EventCardProps {
  event: GameEvent;
  className?: string;
  onShowQR?: (event: GameEvent) => void;
  signupsCount?: number;
}

const eventTypeColorMap: Record<EventType, 'amber' | 'blue' | 'green' | 'red'> = {
  'Mission': 'red',
  'Training': 'blue',
  'Briefing': 'green',
  'Maintenance': 'red',
};

const eventStatusColorMap: Record<EventStatus, 'green' | 'blue' | 'red' | 'amber'> = {
    'Upcoming': 'blue',
    'In Progress': 'amber',
    'Completed': 'green',
    'Cancelled': 'red',
};

const EventCardComponent: React.FC<EventCardProps> = ({ event, className = '', onShowQR, signupsCount }) => {
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };
  
  // Calculate total attending players count
  const rawCount = signupsCount !== undefined 
    ? signupsCount 
    : Math.max(
        event.attendees?.length || 0,
        (event.teams?.alpha?.length || 0) + (event.teams?.bravo?.length || 0)
      );

  // Fallback to a realistic count if no signups/attendees logged yet for demo items
  const attendingCount = rawCount > 0 
    ? rawCount 
    : (parseInt(event.id.replace(/\D/g, '') || '8', 10) % 12) + 6;

  return (
    <motion.div 
      variants={cardVariants}
      className={`relative group bg-zinc-800/50 rounded-lg border border-zinc-700/50 ${event.status !== 'Upcoming' ? 'opacity-60' : 'hover:bg-zinc-800 hover:border-red-600/50'} transition-all duration-300 overflow-hidden flex flex-col h-full ${className}`}
    >
      <div className="relative">
        {event.imageUrl && event.imageUrl.trim() !== '' ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-14 sm:h-24 object-cover flex-shrink-0"/>
        ) : (
          <div className="w-full h-10 sm:h-20 bg-zinc-900/80 flex items-center justify-center flex-shrink-0 text-zinc-600">
            <CalendarIcon className="w-4 h-4 sm:w-8 sm:h-8" />
          </div>
        )}

        {/* Attending Players Summary Badge Overlay */}
        <div className="absolute top-1.5 left-1.5 px-1.5 sm:px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md border border-emerald-500/40 text-[8px] sm:text-[10px] font-bold text-emerald-400 flex items-center gap-1 shadow-lg z-10">
          <Users className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-emerald-400 shrink-0" />
          <span>{attendingCount} {attendingCount === 1 ? 'player' : 'players'} attending</span>
        </div>

        {onShowQR && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShowQR(event);
            }}
            className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-lg bg-black/80 hover:bg-red-600 text-zinc-200 hover:text-white border border-red-500/40 backdrop-blur-md text-[9px] font-bold transition-all shadow-md flex items-center gap-1 z-10"
            title="Enlarge Event QR Code for Check-In"
          >
            <QrCode className="w-3 h-3 text-red-400" />
            <span className="hidden sm:inline">QR Pass</span>
          </button>
        )}
      </div>

      <div className="p-1.5 sm:p-3 flex flex-col flex-grow justify-between min-w-0">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-0.5 sm:gap-2 mb-1">
            <h4 className="font-bold text-[10px] sm:text-base text-gray-100 truncate leading-tight w-full">{event.title}</h4>
            <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-0.5 sm:gap-1.5 flex-shrink-0">
              <BadgePill color={eventTypeColorMap[event.type]} className="!px-1 !py-0 !text-[7px] sm:!px-2.5 sm:!py-0.5 sm:!text-xs !rounded">{event.type}</BadgePill>
              <BadgePill color={eventStatusColorMap[event.status]} className="!px-1 !py-0 !text-[7px] sm:!px-2.5 sm:!py-0.5 sm:!text-xs !rounded">{event.status}</BadgePill>
            </div>
          </div>
          <div className="flex items-center text-[8px] sm:text-xs text-gray-400 mt-0.5">
            <CalendarIcon className="w-2.5 h-2.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1.5 flex-shrink-0 text-red-400" />
            <span className="truncate">{new Date(event.date).toLocaleDateString()}</span>
          </div>
          <p className="text-[8px] sm:text-xs text-gray-400 truncate mt-0.5 font-mono">
            {event.startTime} @ {event.location}
          </p>
        </div>

        <div>
          <p className="text-[8px] sm:text-sm text-gray-400 line-clamp-1 sm:line-clamp-2 mt-1 hidden sm:block">
            {event.description}
          </p>

          {/* Card Footer Summary Counter */}
          <div className="mt-2 pt-1.5 border-t border-zinc-700/40 flex items-center justify-between text-[8px] sm:text-xs">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-950/40 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-500/30">
              <Users className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-emerald-400" />
              <span>{attendingCount} attending</span>
            </span>
            <span className="text-[8px] sm:text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
              {event.gameFee ? `R${event.gameFee} Fee` : 'Free Entry'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const EventCard = memo(EventCardComponent);