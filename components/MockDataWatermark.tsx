import React from 'react';
import { ExclamationTriangleIcon } from './icons/Icons';

export const MockDataWatermark: React.FC = () => {
    return (
        <div 
            className="fixed top-0 left-0 z-[200] pointer-events-none"
            style={{ transform: 'translate(-50%, -50%) rotate(-45deg)', transformOrigin: 'center center' }}
        >
            <div className="flex items-center justify-center w-[400px] h-12 bg-yellow-500/80 backdrop-blur-sm shadow-2xl">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-900 mr-3"/>
                <p className="text-lg font-black text-yellow-900 tracking-wider uppercase">
                    MOCK DATA MODE
                </p>
            </div>
        </div>
    );
};
