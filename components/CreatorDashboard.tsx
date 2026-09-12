

import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CreatorDetails } from '../types';
import { Button } from './Button';
import { CogIcon, UserCircleIcon, CodeBracketIcon, ChartBarIcon, SparklesIcon, ShieldCheckIcon } from './icons/Icons';
import { DataContextType } from '../data/DataContext';
import { SystemScanner } from './SystemScanner';
import { AuthContext } from '../auth/AuthContext';
import { CreatorProfileTab } from './CreatorProfileTab';
import { ServerSetupTab } from './ServerSetupTab';
import { ObservabilityTab } from './ObservabilityTab';

// --- MAIN COMPONENT ---

interface CreatorDashboardProps extends DataContextType {
    setShowHelp: (show: boolean) => void;
    setHelpTopic: (topic: string) => void;
}

const TabSquareButton: React.FC<{
    name: string;
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    subtitle?: string;
}> = ({ name, active, onClick, icon, subtitle }) => (
    <button
        onClick={onClick}
        className={`${
            active
                ? 'bg-red-950/40 border-red-500 text-white shadow-lg shadow-red-950/50'
                : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
        } flex-1 min-w-[130px] sm:min-w-[160px] p-2.5 sm:p-3.5 rounded-xl border flex items-center gap-2.5 sm:gap-3 transition-all text-left group overflow-hidden`}
    >
        <div className={`p-2 rounded-lg ${active ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-200'} flex-shrink-0 transition-colors`}>
            {icon}
        </div>
        <div className="min-w-0 truncate">
            <span className="block font-bold text-xs sm:text-sm uppercase tracking-wider truncate">
                {name}
            </span>
            {subtitle && (
                <span className="block text-[10px] sm:text-xs text-zinc-500 truncate font-mono">
                    {subtitle}
                </span>
            )}
        </div>
    </button>
);

export const CreatorDashboard: React.FC<CreatorDashboardProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'observability' | 'scanner' | 'profile' | 'server'>('observability');
    const { setHelpTopic } = props;
    const auth = useContext(AuthContext);
    const creatorUser = auth?.user as (CreatorDetails & { role: 'creator' });
    const creatorName = creatorUser?.name || 'JSTYP';

    useEffect(() => {
        let topic = 'creator-dashboard-monitor';
        if (activeTab === 'profile') topic = 'creator-dashboard-profile';
        if (activeTab === 'server') topic = 'creator-dashboard-server';
        if (activeTab === 'observability') topic = 'creator-dashboard-observability';
        setHelpTopic(topic);
    }, [activeTab, setHelpTopic]);
    
    return (
        <div className="flex flex-col h-full bg-zinc-950 text-white">
            {/* Header: Shrink-to-fit side-by-side */}
            <header className="flex items-center justify-between p-3 sm:p-4.5 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 flex-shrink-0 gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 overflow-hidden">
                    {creatorUser?.logoUrl && creatorUser.logoUrl.trim() !== '' ? (
                        <img
                            src={creatorUser.logoUrl}
                            alt={creatorName}
                            className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg object-contain bg-black/50 p-1 border border-zinc-700 flex-shrink-0"
                        />
                    ) : (
                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center font-black text-sm sm:text-base text-white flex-shrink-0 shadow-md">
                            JS
                        </div>
                    )}
                    <div className="min-w-0 truncate">
                        <div className="flex items-center gap-1.5 truncate">
                            <h1 className="text-sm sm:text-lg font-black text-white tracking-wider uppercase truncate">
                                {creatorName}
                            </h1>
                            <span className="bg-red-500/20 text-red-400 border border-red-500/40 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
                                <ShieldCheckIcon className="w-3 h-3" />
                                Creator
                            </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-zinc-400 truncate">
                            {creatorUser?.tagline || "Jason's Solutions To Your Problems"}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 text-[10px] font-mono px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        LIVE SYNC
                    </span>
                    <Button onClick={() => auth?.logout()} variant="secondary" size="sm" className="!text-xs !py-1.5 !px-3">
                        Logout
                    </Button>
                </div>
            </header>

            {/* Main Area */}
            <main className="flex-grow overflow-y-auto">
                <div className="p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
                    {/* Navigation: Side-by-Side Shrink-to-Fit Square/Pill Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
                        <TabSquareButton
                            name="Observability"
                            subtitle="Telemetry & DB"
                            active={activeTab === 'observability'}
                            onClick={() => setActiveTab('observability')}
                            icon={<ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                        />
                        <TabSquareButton
                            name="System Scanner"
                            subtitle="Health Diagnostics"
                            active={activeTab === 'scanner'}
                            onClick={() => setActiveTab('scanner')}
                            icon={<CogIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                        />
                        <TabSquareButton
                            name="Profile & Brand"
                            subtitle="JSTYP Identity"
                            active={activeTab === 'profile'}
                            onClick={() => setActiveTab('profile')}
                            icon={<UserCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                        />
                        <TabSquareButton
                            name="Server Guide"
                            subtitle="Deployment & SQL"
                            active={activeTab === 'server'}
                            onClick={() => setActiveTab('server')}
                            icon={<CodeBracketIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
                        />
                    </div>

                    {/* Active Tab Panel */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                        >
                            {activeTab === 'observability' && <ObservabilityTab />}
                            {activeTab === 'scanner' && <SystemScanner />}
                            {activeTab === 'profile' && <CreatorProfileTab creatorDetails={props.creatorDetails} setCreatorDetails={props.setCreatorDetails} />}
                            {activeTab === 'server' && <ServerSetupTab />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};