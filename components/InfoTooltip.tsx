
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InformationCircleIcon } from './icons/Icons';

interface InfoTooltipProps {
  text: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ text }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center align-middle" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button
        type="button"
        className="text-yellow-400 hover:text-yellow-300 transition-colors inline-flex items-center"
        aria-label="More info"
      >
        <InformationCircleIcon className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.span
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-800 border border-zinc-700 text-white text-xs rounded-lg shadow-lg z-50 pointer-events-none block font-normal normal-case text-left"
          >
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
};