

import React from 'react';
import { InfoTooltip } from './InfoTooltip';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  tooltip?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, className = '', tooltip, icon, ...props }) => {
  const baseClasses = "w-full bg-zinc-900 border border-zinc-700 rounded-lg py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300";
  const withIconClasses = icon ? "pl-10 pr-4" : "px-4";

  const { onChange, type, value } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'tel') {
      const numericValue = e.target.value.replace(/\D/g, ''); // Remove all non-digits
      if (numericValue.length > 0 && numericValue.startsWith('0')) {
        e.target.value = '+27' + numericValue.substring(1);
      } else if (numericValue.length > 0 && !numericValue.startsWith('+27')) {
        // If it's a numeric string but doesn't start with 0 or +27, assume it needs a prefix.
        // This is a more aggressive auto-format, might need user feedback.
        // For now, only apply if starts with 0.
        // e.target.value = '+27' + numericValue;
      }
    }
    if (onChange) {
      onChange(e);
    }
  };

  const inputElement = (
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input className={`${baseClasses} ${withIconClasses} ${className}`} {...props} onChange={handleChange} />
      </div>
  );
  
  if (label) {
    return (
        <div>
            <div className="flex items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-400">{label}</label>
                {tooltip && <div className="ml-1.5"><InfoTooltip text={tooltip} /></div>}
            </div>
            {inputElement}
        </div>
    );
  }

  return inputElement;
};