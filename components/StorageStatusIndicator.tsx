
import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

interface StorageStatusIndicatorProps {
    apiServerUrl?: string; // Kept for backwards compatibility but not primary
}

export const StorageStatusIndicator: React.FC<StorageStatusIndicatorProps> = ({ apiServerUrl }) => {
    const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'ok' | 'error'>('checking');

    useEffect(() => {
        let isMounted = true;
        if (isSupabaseConfigured() && supabase) {
            setSupabaseStatus('checking');
            supabase.from('ranks').select('count', { count: 'exact', head: true })
                .then(({ error }) => {
                    if (isMounted) setSupabaseStatus(error ? 'error' : 'ok');
                });
        }
        return () => { isMounted = false; };
    }, []);

    const getStatus = (): { mode: 'supabase' | 'mock' | 'error', isLive: boolean, tooltip: string, label: string | null } => {
        if (isSupabaseConfigured()) {
            if (supabaseStatus === 'ok') return { mode: 'supabase', isLive: true, tooltip: 'Live Supabase Connection Active', label: 'Supabase' };
            if (supabaseStatus === 'error') return { mode: 'error', isLive: false, tooltip: 'Supabase connection failed', label: 'Error' };
            return { mode: 'supabase', isLive: false, tooltip: 'Connecting...', label: 'Checking' };
        }
        return { mode: 'mock', isLive: false, tooltip: 'Running on Local Mock Data', label: 'Mock Data' };
    };

    const { mode, isLive, tooltip, label } = getStatus();

    const colorClasses = {
        supabase: 'bg-green-500',
        mock: 'bg-yellow-500',
        error: 'bg-red-500',
    };
    
    const shadowClasses = {
        supabase: 'shadow-[0_0_8px_2px_rgba(34,197,94,0.7)]',
        mock: '',
        error: '',
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
