

import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CreatorDetails } from '../types';
import { Button } from './Button';
import { CogIcon, UserCircleIcon, CodeBracketIcon, ChartBarIcon } from './icons/Icons';
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

const TabButton: React.FC<{ name: string, active: boolean, onClick: () => void, icon: React.ReactNode }> = ({ name, active, onClick, icon }) => (
    <button
        onClick={onClick}
        className={`${active ? 'border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:text-gray-200'} flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors uppercase tracking-wider`}
    >
        {icon} {name}
    </button>
);

export const CreatorDashboard: React.FC<CreatorDashboardProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'observability' | 'powerhouse' | 'profile' | 'server'>('observability');
    const { setHelpTopic } = props;
    const auth = useContext(AuthContext);
    const creatorUser = auth?.user as (CreatorDetails & { role: 'creator' });

    useEffect(() => {
        let topic = 'creator-dashboard-monitor';
        if (activeTab === 'profile') topic = 'creator-dashboard-profile';
        if (activeTab === 'server') topic = 'creator-dashboard-server'; // Add help topic if needed
        if (activeTab === 'observability') topic = 'creator-dashboard-observability';
        setHelpTopic(topic);
    }, [activeTab, setHelpTopic]);
    
    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-sm border-b border-zinc-800 flex-shrink-0">
                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                    {creatorUser?.logoUrl && <img src={creatorUser.logoUrl} alt={creatorUser?.name || 'Creator'} className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"/>}
                    <div className="overflow-hidden">
                        <h1 className="text-base sm:text-xl font-bold text-white truncate">{creatorUser?.name || 'Creator'}</h1>
                        <p className="text-xs sm:text-sm text-red-400">System Creator</p>
                    </div>
                </div>
                <Button onClick={() => auth?.logout()} variant="secondary" size="sm" className="flex-shrink-0">Logout</Button>
            </header>
            <main className="flex-grow overflow-y-auto">
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="border-b border-zinc-800 mb-6">
                        <nav className="flex space-x-6 overflow-x-auto" aria-label="Tabs">
                            <TabButton name="Observability" active={activeTab === 'observability'} onClick={() => setActiveTab('observability')} icon={<ChartBarIcon className="w-5 h-5"/>} />
                            <TabButton name="Powerhouse Tools" active={activeTab === 'powerhouse'} onClick={() => setActiveTab('powerhouse')} icon={<CogIcon className="w-5 h-5"/>} />
                            <TabButton name="Profile & Guide Editor" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<UserCircleIcon className="w-5 h-5"/>} />
                            <TabButton name="Full Server Guide" active={activeTab === 'server'} onClick={() => setActiveTab('server')} icon={<CodeBracketIcon className="w-5 h-5"/>} />
                        </nav>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'observability' && <ObservabilityTab />}
                            {activeTab === 'powerhouse' && <SystemScanner />}
                            {activeTab === 'profile' && <CreatorProfileTab creatorDetails={props.creatorDetails} setCreatorDetails={props.setCreatorDetails} />}
                            {activeTab === 'server' && <ServerSetupTab />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};