/** @jsxImportSource react */
import React, { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  fullHeight?: boolean;
  titleAddon?: ReactNode;
  compact?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, icon, children, className = '', fullHeight = false, titleAddon, compact = false }) => {
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3, boxShadow: '0 8px 16px rgba(185, 28, 28, 0.18)' }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`bg-zinc-950/80 backdrop-blur-md border border-zinc-800/60 rounded-lg shadow-lg flex flex-col overflow-hidden ${fullHeight ? 'h-full' : ''} ${className}`}
    >
      <header className={`flex items-center border-b border-red-600/30 bg-black/20 ${compact ? 'p-2 sm:p-3' : 'p-2.5 sm:p-4'}`}>
        <div className={`text-red-500 mr-2 sm:mr-3 shrink-0 ${compact ? '[&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4' : '[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5'}`}>{icon}</div>
        <h3 className={`font-bold text-gray-200 tracking-wider uppercase truncate ${compact ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-base'}`}>{title}</h3>
        {titleAddon && <div className="ml-auto pl-1 sm:pl-2 shrink-0">{titleAddon}</div>}
      </header>
      <div className="flex-grow bg-transparent flex flex-col">
        {children}
      </div>
    </motion.div>
  );
};