import React, { useState, useEffect } from 'react';
import { USE_FIREBASE, firebaseInitializationError } from '../firebase';

interface StorageStatusIndicatorProps {
    apiServerUrl?: string;
}

export const StorageStatusIndicator: React.FC<StorageStatusIndicatorProps> = ({ apiServerUrl }) => {
    const [isApiLive, setIsApiLive] = useState(false);

    useEffect(() => {
        if (!apiServerUrl) {
            setIsApiLive(false);
            return;
        }

        let isMounted = true;
        const checkApiHealth = () => {
            fetch(`${apiServerUrl}/health`)
                .then(response => {
                    if (isMounted) {
                        setIsApiLive(response.ok);
                    }
                })
                .catch(() => {
                    if (isMounted) {
                        setIsApiLive(false);
                    }
                });
        };

        checkApiHealth();
        const interval = setInterval(checkApiHealth, 15000); // Check every 15 seconds

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [apiServerUrl]);

    const getStatus = (): { mode: 'api' | 'firebase' | 'mock', isLive: boolean, tooltip: string } => {
        if (apiServerUrl) {
            return {
                mode: 'api',
                isLive: isApiLive,
                tooltip: isApiLive ? 'Live API Server Connected' : 'API Server Connection Failed',
            };
        }
        if (USE_FIREBASE && !firebaseInitializationError) {
            return {
                mode: 'firebase',
                isLive: true,
                tooltip: 'Live Firebase Connection Active',
            };
        }
        return {
            mode: 'mock',
            isLive: true,
            tooltip: 'Running on Local Mock Data',
        };
    };

    const { mode, isLive, tooltip } = getStatus();

    const colorClasses = {
        api: 'bg-blue-500',
        firebase: 'bg-green-500',
        mock: 'bg-yellow-500',
    };
    
    const shadowClasses = {
        api: 'shadow-[0_0_8px_2px_rgba(59,130,246,0.7)]',
        firebase: 'shadow-[0_0_8px_2px_rgba(34,197,94,0.7)]',
        mock: 'shadow-[0_0_8px_2px_rgba(234,179,8,0.7)]',
    }

    const animationClass = isLive ? '' : 'animate-flicker';

    return (
        <div className="relative group flex items-center justify-center" title={tooltip}>
            <div className={`w-3 h-3 rounded-full transition-all ${colorClasses[mode]} ${isLive ? shadowClasses[mode] : ''} ${animationClass}`} />
            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block px-2 py-1 bg-zinc-800 text-white text-xs rounded-md shadow-lg whitespace-nowrap">
                {tooltip}
            </span>
        </div>
    );
};
