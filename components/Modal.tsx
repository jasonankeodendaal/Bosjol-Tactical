
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from './icons/Icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  footer,
  maxWidth = 'lg',
  className = ''
}) => {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className={`bg-zinc-900 border border-zinc-800 rounded-lg sm:rounded-xl shadow-2xl w-full ${maxWidthClass} max-h-[94vh] sm:max-h-[88vh] flex flex-col overflow-hidden my-auto text-xs sm:text-base ${className}`}
          >
            <div className="flex justify-between items-center px-3 py-2.5 sm:px-5 sm:py-3.5 border-b border-zinc-800 flex-shrink-0 bg-zinc-900/95 backdrop-blur-sm sticky top-0 z-10">
              <h2 className="text-sm sm:text-lg font-bold text-white tracking-wide truncate pr-2">{title}</h2>
              <button 
                onClick={onClose} 
                className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors flex-shrink-0"
                aria-label="Close modal"
              >
                <XIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            
            <div className="p-3 sm:p-5 overflow-y-auto overscroll-contain flex-grow min-h-0 space-y-3 sm:space-y-4">
              {children}
            </div>

            {footer && (
              <div className="p-3 sm:p-4 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
