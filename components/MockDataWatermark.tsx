import React from 'react';

export const MockDataWatermark: React.FC = () => {
    return (
        <div className="fixed bottom-0 left-0 right-0 h-6 bg-yellow-900/50 text-yellow-300 text-sm font-bold overflow-hidden z-[100] pointer-events-none">
            <div className="flex whitespace-nowrap scrolling-wrapper">
                {Array(20).fill(null).map((_, i) => (
                    <span key={i} className="px-8">MOCK DATA - NOT LIVE</span>
                ))}
            </div>
        </div>
    );
};
