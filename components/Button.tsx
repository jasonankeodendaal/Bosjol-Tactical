import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md';
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', size = 'md', ...props }) => {
  const baseClasses = 'font-bold rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed tracking-wider uppercase';
  
  const variantClasses = {
    primary: 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500 shadow-md shadow-red-900/50',
    secondary: 'bg-zinc-800/80 text-gray-200 hover:bg-zinc-700 focus:ring-zinc-600 border border-zinc-700',
    danger: 'bg-red-800 text-red-100 hover:bg-red-700 focus:ring-red-600 border border-red-700',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
