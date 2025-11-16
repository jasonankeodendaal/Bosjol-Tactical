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
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, icon, children, className = '', fullHeight = false, titleAddon }) => {
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeInOut" } }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(185, 28, 28, 0.2)' }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`bg-zinc-950/80 backdrop-blur-md border border-zinc-800/60 rounded-lg shadow-lg flex flex-col ${fullHeight ? 'h-full' : ''} ${className}`}
    >
      <header className="flex items-center p-5 border-b border-red-600/30 bg-black/20">
        <div className="text-red-500 mr-4">{icon}</div>
        <h3 className="font-bold text-lg text-gray-200 tracking-wider uppercase">{title}</h3>
        {titleAddon && <div className="ml-auto pl-2">{titleAddon}</div>}
      </header>
      <div className="flex-grow bg-transparent">
        {children}
      </div>
    </motion.div>
  );
};