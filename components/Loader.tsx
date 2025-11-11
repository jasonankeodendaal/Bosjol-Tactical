import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-[100]">
      <div className="w-16 h-16 border-4 border-zinc-700 border-t-red-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-gray-300 tracking-wider">Loading Tactical Data...</p>
    </div>
  );
};
