import React from 'react';

interface BadgePillProps {
  children: React.ReactNode;
  color: 'amber' | 'blue' | 'green' | 'red';
  className?: string;
  iconUrl?: string;
}

export const BadgePill: React.FC<BadgePillProps> = ({ children, color, className = '', iconUrl }) => {
  const colorClasses = {
    amber: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
    blue: 'bg-cyan-500/10 text-cyan-400 ring-cyan-500/20',
    green: 'bg-green-500/10 text-green-400 ring-green-500/20',
    red: 'bg-red-700/20 text-red-300 ring-red-600/30',
  };

  return (
    <span className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-semibold ring-1 ring-inset ${colorClasses[color]} ${className} uppercase tracking-wider`}>
      {iconUrl && <img src={iconUrl} alt="badge icon" className="w-5 h-5 mr-2" />}
      {children}
    </span>
  );
};