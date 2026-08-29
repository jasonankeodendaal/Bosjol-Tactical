import React, { useState, useEffect } from 'react';
import { MOCK_BRANDING_DETAILS } from '../constants';

export interface LoaderProps {
  text?: string;
  subText?: string;
  progress?: number;
  logoUrl?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  text,
  subText = 'Loading...',
  progress: controlledProgress,
  logoUrl
}) => {
  const [progress, setProgress] = useState<number>(controlledProgress ?? 10);

  // Smooth progressive animation if progress is not explicitly controlled
  useEffect(() => {
    if (controlledProgress !== undefined) {
      setProgress(controlledProgress);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 99) return 99;
        const jump = Math.random() * 3.5 + 1.2;
        return Math.min(99, +(prev + jump).toFixed(0));
      });
    }, 120);

    return () => clearInterval(interval);
  }, [controlledProgress]);

  const activeLogo = logoUrl?.trim() ? logoUrl : MOCK_BRANDING_DETAILS.logoUrl;
  const statusLabel = text || subText || 'Loading...';

  return (
    <div 
      id="app-loader"
      className="fixed inset-0 z-[99999] bg-black text-white flex flex-col items-center justify-center select-none overflow-hidden font-sans p-6"
    >
      <div className="flex flex-col items-center justify-center w-full max-w-xs sm:max-w-sm md:max-w-md space-y-7">
        {/* Company Logo Centered */}
        <div className="flex items-center justify-center">
          <img
            src={activeLogo}
            alt="Company Logo"
            referrerPolicy="no-referrer"
            className="max-h-24 sm:max-h-32 md:max-h-40 max-w-[220px] sm:max-w-[280px] object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.12)]"
          />
        </div>

        {/* Loading Bar directly underneath logo */}
        <div className="w-full space-y-2.5">
          <div className="w-full h-1.5 sm:h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/80 p-[0.5px]">
            <div 
              className="h-full bg-gradient-to-r from-red-600 via-red-500 to-amber-400 rounded-full transition-all duration-150 ease-out shadow-[0_0_12px_rgba(220,38,38,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Minimalist Progress Details */}
          <div className="flex items-center justify-between text-xs font-mono px-0.5 text-zinc-400">
            <span className="text-[11px] sm:text-xs text-zinc-400 uppercase tracking-widest font-medium">
              {statusLabel}
            </span>
            <span className="text-[11px] sm:text-xs text-zinc-300 font-bold">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
