
import React, { memo } from 'react';
import { motion, Variants } from 'framer-motion';
import { GameEvent, EventType, EventStatus } from '../types';
import { BadgePill } from './BadgePill';
import { CalendarIcon } from './icons/Icons';
import { QrCode, Users, ClipboardList, MapPin, Clock, Trophy } from 'lucide-react';

interface EventCardProps {
  event: GameEvent;
  className?: string;
  onShowQR?: (event: GameEvent) => void;
  onShowRentals?: (event: GameEvent) => void;
  signupsCount?: number;
  rentalsCount?: number;
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

const EventCardComponent: React.FC<EventCardProps> = ({ 
  event, 
  className = '', 
  onShowQR, 
  onShowRentals, 
  signupsCount, 
  rentalsCount 
}) => {
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } }
  };
  
  // Calculate total attending players count accurately
  const attendeePlayerIds = new Set<string>();
  if (Array.isArray(event.attendees)) {
    event.attendees.forEach(a => {
      if (a?.playerId) attendeePlayerIds.add(a.playerId);
    });
  }
  if (event.teams && typeof event.teams === 'object') {
    Object.values(event.teams).forEach(list => {
      if (Array.isArray(list)) list.forEach(pid => pid && attendeePlayerIds.add(pid));
    });
  }

  const baseAttendeesCount = Math.max(attendeePlayerIds.size, event.attendees?.length || 0);
  const attendingCount = signupsCount !== undefined 
    ? Math.max(signupsCount, baseAttendeesCount) 
    : baseAttendeesCount;

  const isUpcoming = event.status === 'Upcoming' || event.status === 'In Progress';

  return (
    <motion.div 
      variants={cardVariants}
      className={`relative group overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-zinc-950 p-2 sm:p-2.5 border ${
        isUpcoming ? 'border-zinc-800 hover:border-red-500/70' : 'border-zinc-800/60 opacity-75'
      } shadow-[0_6px_16px_rgba(0,0,0,0.7)] hover:shadow-[0_12px_24px_rgba(239,68,68,0.22)] hover:-translate-y-0.5 hover:rotate-0.5 transition-all duration-200 flex flex-col justify-between w-full h-full select-none ${className}`}
    >
      {/* 3D Top Metallic/Laser Shimmer Line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${
        isUpcoming 
          ? 'from-transparent via-red-500/50 to-transparent' 
          : 'from-transparent via-zinc-600/30 to-transparent'
      } pointer-events-none`} />

      {/* Top Banner & Quick Action Buttons */}
      <div className="relative mb-1.5 min-w-0">
        <div className="w-full h-16 sm:h-20 rounded-lg overflow-hidden relative bg-zinc-950/80 border border-zinc-800/80 shrink-0">
          {event.imageUrl && event.imageUrl.trim() !== '' ? (
            <img 
              src={event.imageUrl} 
              alt={event.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-gradient-to-b from-zinc-900 to-black">
              <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-zinc-500 group-hover:text-red-400 transition-colors" />
              <span className="text-[9px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">Tactical Ops</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/20 to-transparent pointer-events-none" />

          {/* Top Status & Type Badges */}
          <div className="absolute top-1 left-1 flex flex-wrap gap-1 z-10 max-w-[calc(100%-60px)]">
            <BadgePill 
              color={eventStatusColorMap[event.status]} 
              className="!px-1.5 !py-0.5 !text-[8px] sm:!text-[9px] !font-bold !rounded-md !shadow-sm uppercase"
            >
              {event.status}
            </BadgePill>
            <span className="hidden xs:inline-block px-1.5 py-0.5 rounded-md bg-black/80 border border-white/10 text-zinc-300 text-[8px] font-mono uppercase">
              {event.type}
            </span>
          </div>

          {/* Action Buttons Overlay (QR Pass & Rentals) */}
          <div className="absolute top-1 right-1 flex items-center gap-1 z-10">
            {onShowRentals && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowRentals(event);
                }}
                className="px-1.5 py-0.5 rounded-md bg-black/90 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/20 backdrop-blur-md text-[8px] sm:text-[9px] font-bold transition-all shadow-md flex items-center gap-0.5"
                title="Equipment Rentals Manifest"
              >
                <ClipboardList className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400 shrink-0" />
                <span className="hidden sm:inline">Rent</span>
                {rentalsCount !== undefined && rentalsCount > 0 && (
                  <span className="text-red-400 font-mono font-bold">({rentalsCount})</span>
                )}
              </button>
            )}

            {onShowQR && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShowQR(event);
                }}
                className="px-1.5 py-0.5 rounded-md bg-black/90 hover:bg-red-600 text-zinc-300 hover:text-white border border-red-500/40 backdrop-blur-md text-[8px] sm:text-[9px] font-bold transition-all shadow-md flex items-center gap-0.5"
                title="Event QR Pass"
              >
                <QrCode className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400 shrink-0" />
                <span className="hidden sm:inline">QR</span>
              </button>
            )}
          </div>

          {/* Bottom Title Bar Inside Poster for Compact Neatness */}
          <div className="absolute bottom-1 left-1.5 right-1.5 min-w-0 z-10">
            <h4 className="font-black text-[11px] sm:text-xs text-white truncate drop-shadow-md leading-tight group-hover:text-red-300 transition-colors">
              {event.title}
            </h4>
          </div>
        </div>
      </div>

      {/* Info Body - Shrink to fit always */}
      <div className="space-y-1.5 flex flex-col justify-between flex-grow min-w-0">
        {/* Date, Time & Location Pill Matrix */}
        <div className="grid grid-cols-2 gap-1 text-[8.5px] sm:text-[9.5px] bg-zinc-950/90 p-1.5 rounded-lg border border-zinc-800/80 min-w-0">
          <div className="flex items-center gap-1 min-w-0 truncate">
            <CalendarIcon className="w-3 h-3 text-red-400 shrink-0" />
            <span className="text-zinc-200 font-semibold truncate">
              {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="flex items-center gap-1 min-w-0 truncate justify-end">
            <Clock className="w-2.5 h-2.5 text-zinc-400 shrink-0" />
            <span className="text-zinc-300 font-mono truncate">
              {event.startTime || 'TBD'}
            </span>
          </div>

          <div className="col-span-2 flex items-center gap-1 min-w-0 truncate pt-1 border-t border-zinc-800/60">
            <MapPin className="w-2.5 h-2.5 text-amber-400 shrink-0" />
            <span className="text-zinc-400 truncate text-[8px] sm:text-[9px]">
              {event.location || 'Tactical Arena'}
            </span>
          </div>
        </div>

        {/* RP & Game Fee Indicators */}
        <div className="flex items-center justify-between gap-1 text-[8px] sm:text-[9px] pt-1 border-t border-zinc-800/60 min-w-0">
          <span className={`inline-flex items-center gap-1 font-bold px-1.5 py-0.5 rounded border truncate ${
            attendingCount > 0 
              ? 'text-emerald-300 bg-emerald-950/60 border-emerald-500/30' 
              : 'text-zinc-400 bg-zinc-900/80 border-zinc-800'
          }`}>
            <Users className={`w-2.5 h-2.5 ${attendingCount > 0 ? 'text-emerald-400' : 'text-zinc-500'} shrink-0`} />
            <span className="truncate">{attendingCount} op{attendingCount === 1 ? '' : 's'}</span>
          </span>

          <div className="flex items-center gap-1 shrink-0 font-mono">
            {event.participationXp ? (
              <span className="text-amber-400 font-bold text-[8px] sm:text-[9px]">
                +{event.participationXp} RP
              </span>
            ) : null}
            <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800 font-bold uppercase text-[7.5px] sm:text-[8px]">
              {event.gameFee ? `R${event.gameFee}` : 'FREE'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const EventCard = memo(EventCardComponent);