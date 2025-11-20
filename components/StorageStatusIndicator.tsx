

import React, { useState, useEffect } from 'react';
import { USE_FIREBASE, firebaseInitializationError, firebaseConfig } from '../firebase';

interface StorageStatusIndicatorProps {
    apiServerUrl?: string;
}

export const StorageStatusIndicator: React.FC<StorageStatusIndicatorProps> = ({ apiServerUrl }) => {
    const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking');

    useEffect(() => {
        let isMounted = true;
        if (apiServerUrl) {
            setApiStatus('checking');
            fetch(`${apiServerUrl}/health`)
                .then(res => {
                    if (isMounted) setApiStatus(res.ok ? 'ok' : 'error');
                })
                .catch(() => {
                    if (isMounted) setApiStatus('error');
                });
        }
        return () => { isMounted = false; };
    }, [apiServerUrl]);

    const getStatus = (): { mode: 'firebase' | 'mock' | 'api_ok' | 'api_error', isLive: boolean, tooltip: string, label: string | null } => {
        if (apiServerUrl) {
            if (apiStatus === 'ok') return { mode: 'api_ok', isLive: true, tooltip: `Live API Server: ${apiServerUrl}`, label: 'API Server' };
            if (apiStatus === 'error') return { mode: 'api_error', isLive: false, tooltip: `API Server connection failed`, label: 'API Error' };
            return { mode: 'api_error', isLive: false, tooltip: 'Connecting to API Server...', label: 'API Checking' };
        }
        if (USE_FIREBASE && !firebaseInitializationError) {
            return { mode: 'firebase', isLive: true, tooltip: 'Live Firebase Connection Active', label: firebaseConfig.projectId };
        }
        return { mode: 'mock', isLive: false, tooltip: 'Running on Local Mock Data', label: 'Mock Data' };
    };

    const { mode, isLive, tooltip, label } = getStatus();

    const colorClasses = {
        firebase: 'bg-green-500',
        mock: 'bg-yellow-500',
        api_ok: 'bg-blue-500',
        api_error: 'bg-red-500',
    };
    
    const shadowClasses = {
        firebase: 'shadow-[0_0_8px_2px_rgba(34,197,94,0.7)]',
        mock: '',
        api_ok: 'shadow-[0_0_8px_2px_rgba(59,130,246,0.7)]',
        api_error: '',
    };

    const animationClass = !isLive ? 'animate-pulse' : '';

    return (
        <div className="relative group flex items-center justify-center gap-2" title={tooltip}>
            {label && <span className="text-gray-500 text-[10px] hidden sm:inline-block font-mono">{label}</span>}
            <div className={`w-3 h-3 rounded-full transition-all ${colorClasses[mode]} ${isLive ? shadowClasses[mode] : ''} ${animationClass}`} />
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-1 bg-zinc-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap z-50">
                {tooltip}
            </span>
        </div>
    );
};
