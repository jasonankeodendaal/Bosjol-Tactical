import React, { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
  fullHeight?: boolean;
  titleAddon?: ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, icon, children, className = '', fullHeight = false, titleAddon }) => {
  // FIX: Replaced cubic-bezier array with a string literal ("easeInOut") to fix framer-motion typing issue.
  // FIX: Explicitly typed cardVariants with Variants from framer-motion to resolve typing error on `ease` property.
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`bg-zinc-900/70 backdrop-blur-sm border border-zinc-800/80 rounded-lg shadow-lg flex flex-col ${fullHeight ? 'h-full' : ''} ${className}`}
    >
      <header className="flex items-center p-5 border-b border-red-600/30 bg-black/20">
        <div className="text-red-500 mr-4">{icon}</div>
        <h3 className="font-bold text-lg text-gray-200 tracking-wider uppercase">{title}</h3>
        {titleAddon && <div className="ml-2">{titleAddon}</div>}
      </header>
      <div className="flex-grow bg-transparent">
        {children}
      </div>
    </motion.div>
  );
};
