import React from 'react';
import { usePWA } from '../utils/usePWA';
import { motion, AnimatePresence } from 'framer-motion';

export const PWAOfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 px-3.5 py-2 text-xs font-chakra font-medium text-white shadow-2xl border border-amber-400/40 backdrop-blur-md"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <span>Tactical Offline Mode — Serving Cached App Assets</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
