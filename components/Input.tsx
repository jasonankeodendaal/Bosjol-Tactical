import React from 'react';
import { InfoTooltip } from './InfoTooltip';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  tooltip?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, className = '', tooltip, icon, ...props }) => {
  const baseClasses = "w-full bg-zinc-900 border border-zinc-700 rounded-lg py-1.5 sm:py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-300";
  const withIconClasses = icon ? "pl-8 sm:pl-10 pr-2.5 sm:pr-4" : "px-2.5 sm:px-4";

  const { onChange, type } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'tel' && e.target.value.startsWith('0')) {
      e.target.value = '+27' + e.target.value.substring(1);
    }
    if (onChange) {
      onChange(e);
    }
  };

  const inputElement = (
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 sm:pl-3 pointer-events-none text-gray-400 [&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-4 sm:[&>svg]:h-4">
            {icon}
          </div>
        )}
        <input className={`${baseClasses} ${withIconClasses} ${className}`} {...props} onChange={handleChange} />
      </div>
  );
  
  if (label) {
    return (
        <div>
            <div className="flex items-center mb-1 sm:mb-1.5">
                <label className="block text-xs sm:text-sm font-medium text-gray-400">{label}</label>
                {tooltip && <div className="ml-1 sm:ml-1.5"><InfoTooltip text={tooltip} /></div>}
            </div>
            {inputElement}
        </div>
    );
  }

  return inputElement;
};