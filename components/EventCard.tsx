import React from 'react';
// FIX: The Variants type is not exported from framer-motion in this environment. It has been removed.
import { motion } from 'framer-motion';
import { GameEvent, EventType, EventStatus } from '../types';
import { BadgePill } from './BadgePill';
import { CalendarIcon } from './icons/Icons';

interface EventCardProps {
  event: GameEvent;
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

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  // FIX: Removed explicit Variants type as it's not available and can be inferred.
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };
  
  return (
    <motion.div 
      variants={cardVariants}
      className={`bg-zinc-800/50 rounded-lg border border-zinc-700/50 ${event.status !== 'Upcoming' ? 'opacity-60' : 'hover:bg-zinc-800 hover:border-red-600/50'} transition-all duration-300 overflow-hidden flex flex-col h-full`}
    >
      {event.imageUrl && (
        <img src={event.imageUrl} alt={event.title} className="w-full h-24 object-cover flex-shrink-0"/>
      )}
      <div className="p-3 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-base text-gray-100 truncate">{event.title}</h4>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                    <CalendarIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{new Date(event.date).toLocaleDateString()}, {event.startTime} @ {event.location}</span>
                </div>
            </div>
            <div className="flex flex-col items-end space-y-1.5 flex-shrink-0 ml-2">
                <BadgePill color={eventTypeColorMap[event.type]}>{event.type}</BadgePill>
                <BadgePill color={eventStatusColorMap[event.status]}>{event.status}</BadgePill>
            </div>
        </div>
        <p className="text-sm text-gray-400 line-clamp-2 flex-grow">{event.description}</p>
      </div>
    </motion.div>
  );
};
