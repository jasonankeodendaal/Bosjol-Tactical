import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyDetails } from '../types';
import { 
    Shield, 
    Crosshair, 
    Trophy, 
    Users, 
    Gauge, 
    Sparkles, 
    Radio, 
    Database, 
    Zap, 
    Award, 
    Compass, 
    Activity, 
    Target, 
    Cpu, 
    Boxes, 
    Glasses, 
    ShieldAlert, 
    Terminal, 
    CheckCircle2, 
    ChevronDown, 
    ChevronLeft, 
    ChevronRight, 
    Lock, 
    ShieldCheck, 
    AlertTriangle, 
    Workflow, 
    Search,
    BookOpen,
    HelpCircle,
    Flag,
    Calendar,
    Server,
    Sliders,
    Layers,
    PackageCheck
} from 'lucide-react';

import { AboutOverview } from './about/AboutOverview';
import { AboutOperations } from './about/AboutOperations';
import { AboutBallistics } from './about/AboutBallistics';
import { AboutProgression } from './about/AboutProgression';
import { AboutArmory } from './about/AboutArmory';
import { AboutArchitecture } from './about/AboutArchitecture';
import { AboutSafetySOP } from './about/AboutSafetySOP';
import { AboutIntelFaq } from './about/AboutIntelFaq';

interface AboutTabProps {
    companyDetails?: CompanyDetails;
}

type SubTabKey = 'overview' | 'operations' | 'ballistics' | 'progression' | 'armory' | 'architecture' | 'sop' | 'faq';

export const AboutTab: React.FC<AboutTabProps> = ({ companyDetails }) => {
    const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('overview');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const clubName = companyDetails?.name || 'Bosjol Tactical Airsoft';
    const clubSlogan = companyDetails?.slogan || 'Precision Tactical Operations & Combat Simulation';
    const clubLogo = companyDetails?.logoUrl || '';

    // Close dropdown on click outside
    useEffect(() => {
        const handleOutside = (event: MouseEvent | TouchEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        document.addEventListener('touchstart', handleOutside);
        return () => {
            document.removeEventListener('mousedown', handleOutside);
            document.removeEventListener('touchstart', handleOutside);
        };
    }, []);

    const subTabs: { id: SubTabKey; label: string; shortLabel: string; desc: string; icon: React.ReactNode; badge?: string }[] = [
        { 
            id: 'overview', 
            label: 'Command Hub', 
            shortLabel: 'Overview',
            desc: 'System architecture, arena map & 8-step match day lifecycle',
            icon: <Compass className="w-4 h-4" /> 
        },
        { 
            id: 'operations', 
            label: 'Field Operations', 
            shortLabel: 'Ops & Modes',
            desc: '8 combat scenarios, respawns, radio & ROE rules',
            icon: <Target className="w-4 h-4" />, 
            badge: '8 Modes' 
        },
        { 
            id: 'ballistics', 
            label: 'Ballistics & Chrono', 
            shortLabel: 'Ballistics',
            desc: 'Joules, FPS matrix, BB weights & MED safety',
            icon: <Gauge className="w-4 h-4" />, 
            badge: 'Safety' 
        },
        { 
            id: 'progression', 
            label: 'Progression & Ranks', 
            shortLabel: 'Ranks & Badges',
            desc: '6 Career tiers, 18 sub-ranks, RP math & legendary medals',
            icon: <Trophy className="w-4 h-4" /> 
        },
        { 
            id: 'armory', 
            label: 'Tactical Armory', 
            shortLabel: 'Armory Specs',
            desc: 'LiPo battery specs, gas/HPA pressures & rental bundles',
            icon: <Boxes className="w-4 h-4" />,
            badge: 'Tech'
        },
        { 
            id: 'architecture', 
            label: 'Systems & Cloud', 
            shortLabel: 'Cloud Systems',
            desc: 'PostgreSQL CDC, 19 schemas & automated financial ledger',
            icon: <Cpu className="w-4 h-4" /> 
        },
        { 
            id: 'sop', 
            label: 'Safety Code & SOP', 
            shortLabel: 'Safety SOP',
            desc: 'ANSI Z87.1+, "Blind Man" emergency drill & medical',
            icon: <ShieldAlert className="w-4 h-4" />,
            badge: 'Zero Tolerance'
        },
        { 
            id: 'faq', 
            label: 'Intel Terminal', 
            shortLabel: 'FAQ Intel',
            desc: 'Searchable knowledgebase for rules, payments & troubleshooting',
            icon: <Terminal className="w-4 h-4" /> 
        }
    ];

    const currentTabIndex = subTabs.findIndex(t => t.id === activeSubTab);
    const currentTab = subTabs[currentTabIndex] || subTabs[0];

    const handlePrevTab = () => {
        const nextIdx = (currentTabIndex - 1 + subTabs.length) % subTabs.length;
        setActiveSubTab(subTabs[nextIdx].id);
    };

    const handleNextTab = () => {
        const nextIdx = (currentTabIndex + 1) % subTabs.length;
        setActiveSubTab(subTabs[nextIdx].id);
    };

    return (
        <div className="relative w-full text-zinc-100 font-sans pb-16 space-y-4 sm:space-y-6 select-none max-w-7xl mx-auto px-1 sm:px-2">
            {/* Ambient Background Glowing Lights */}
            <div className="absolute -top-12 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
            <div className="absolute top-1/3 -right-16 w-60 sm:w-80 h-60 sm:h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-10 left-10 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* COMMAND HERO BANNER */}
            <div className="relative p-4 sm:p-6 lg:p-7 rounded-3xl bg-gradient-to-br from-zinc-900/90 via-zinc-950/95 to-black border border-zinc-800/80 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl z-30">
                {/* Tactical Top Accent Light Line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 opacity-80 rounded-t-3xl" />
                
                {/* Watermark Crosshair */}
                <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
                    <Crosshair className="w-64 h-64 sm:w-96 sm:h-96 text-red-500" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
                    <div className="space-y-2 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-800/60 flex items-center gap-1 shadow-sm">
                                <Sparkles className="w-3 h-3 text-red-400" /> Tactical Engine v3.0
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1 shadow-sm">
                                <Activity className="w-3 h-3 text-emerald-400" /> Supabase Realtime CDC
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-700/80">
                                19 Schemas
                            </span>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 pt-1">
                            {clubLogo ? (
                                <img 
                                    src={clubLogo} 
                                    alt={clubName} 
                                    referrerPolicy="no-referrer"
                                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-2xl border border-zinc-700/80 bg-black/60 p-1.5 shrink-0 drop-shadow-md"
                                />
                            ) : (
                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border border-red-500/40 bg-red-950/40 flex items-center justify-center p-2 shrink-0 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                                    <Shield className="w-7 h-7 sm:w-9 sm:h-9 text-red-500" />
                                </div>
                            )}

                            <div>
                                <h1 className="text-lg sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2 flex-wrap">
                                    <span>{clubName}</span>
                                    <span className="text-[10px] sm:text-xs font-mono font-bold px-2 py-0.5 bg-red-600/20 text-red-400 border border-red-500/40 rounded-lg">
                                        OFFICIAL FIELD &amp; TECH MANUAL
                                    </span>
                                </h1>
                                <p className="text-xs sm:text-sm text-zinc-400 font-medium">
                                    {clubSlogan}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Live Telemetry Grid */}
                    <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-row gap-2">
                        <div className="p-2.5 sm:p-3 rounded-2xl bg-black/60 border border-zinc-800/80 backdrop-blur-sm flex items-center gap-2.5">
                            <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                            <div>
                                <div className="text-[9px] sm:text-[10px] font-mono text-zinc-400 uppercase leading-none">Max Capacity</div>
                                <div className="text-xs sm:text-sm font-black text-white font-mono mt-0.5">Unlimited</div>
                            </div>
                        </div>

                        <div className="p-2.5 sm:p-3 rounded-2xl bg-black/60 border border-zinc-800/80 backdrop-blur-sm flex items-center gap-2.5">
                            <Gauge className="w-4 h-4 text-red-400 shrink-0" />
                            <div>
                                <div className="text-[9px] sm:text-[10px] font-mono text-zinc-400 uppercase leading-none">Chrono Limit</div>
                                <div className="text-xs sm:text-sm font-black text-white font-mono mt-0.5">1.50J (AEG)</div>
                            </div>
                        </div>

                        <div className="p-2.5 sm:p-3 rounded-2xl bg-black/60 border border-zinc-800/80 backdrop-blur-sm flex items-center gap-2.5">
                            <Radio className="w-4 h-4 text-amber-400 shrink-0" />
                            <div>
                                <div className="text-[9px] sm:text-[10px] font-mono text-zinc-400 uppercase leading-none">Command Freq</div>
                                <div className="text-xs sm:text-sm font-black text-white font-mono mt-0.5">CH 01 (462.56)</div>
                            </div>
                        </div>

                        <div className="p-2.5 sm:p-3 rounded-2xl bg-black/60 border border-zinc-800/80 backdrop-blur-sm flex items-center gap-2.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div>
                                <div className="text-[9px] sm:text-[10px] font-mono text-zinc-400 uppercase leading-none">Eye Standard</div>
                                <div className="text-xs sm:text-sm font-black text-white font-mono mt-0.5">ANSI Z87.1+</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* NAVIGATION BAR: DROPDOWN + QUICK CYCLER + DESKTOP PILLS */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    
                    {/* DROPDOWN SELECTOR */}
                    <div className="relative flex-grow max-w-full sm:max-w-md" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)] text-left transition-all"
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="listbox"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-1.5 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 shrink-0">
                                    {currentTab.icon}
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate">
                                            {currentTab.label}
                                        </span>
                                        {currentTab.badge && (
                                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 bg-red-950 text-red-400 rounded border border-red-800/60 shrink-0">
                                                {currentTab.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-zinc-400 truncate hidden sm:block">
                                        {currentTab.desc}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 text-zinc-400">
                                <span className="text-[10px] font-mono font-bold uppercase text-red-400 bg-red-950/60 px-2 py-0.5 rounded-lg border border-red-900/40">
                                    {currentTabIndex + 1}/{subTabs.length}
                                </span>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-red-400' : ''}`} />
                            </div>
                        </button>

                        {/* Dropdown Options Popup */}
                        <AnimatePresence>
                            {isDropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                    transition={{ duration: 0.15 }}
                                    style={{ backgroundColor: '#09090b' }}
                                    className="absolute left-0 right-0 top-full mt-2 z-[999] p-2 rounded-2xl bg-zinc-950 border-2 border-zinc-700 shadow-[0_20px_60px_rgba(0,0,0,1)] space-y-1.5 max-h-[420px] overflow-y-auto"
                                    role="listbox"
                                >
                                    <div className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase text-zinc-400 bg-zinc-900/90 rounded-lg border border-zinc-800 flex items-center justify-between">
                                        <span>Select Field Guide Section</span>
                                        <span className="text-red-400">{subTabs.length} Modules</span>
                                    </div>
                                    {subTabs.map((tab, idx) => {
                                        const isSelected = activeSubTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => {
                                                    setActiveSubTab(tab.id);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all border ${
                                                    isSelected
                                                        ? 'bg-red-600 text-white font-bold border-red-500 shadow-lg shadow-red-900/40'
                                                        : 'bg-zinc-900/90 hover:bg-zinc-800/90 text-zinc-200 hover:text-white border-zinc-800/90 hover:border-zinc-700'
                                                }`}
                                                role="option"
                                                aria-selected={isSelected}
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <div className={`p-1.5 rounded-lg shrink-0 ${
                                                        isSelected ? 'bg-black/30 text-white' : 'bg-zinc-950 text-red-400 border border-zinc-800'
                                                    }`}>
                                                        {tab.icon}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-bold uppercase tracking-wider truncate flex items-center gap-1.5">
                                                            <span className={isSelected ? 'text-white' : 'text-zinc-100'}>{tab.label}</span>
                                                            {tab.badge && (
                                                                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                                                    isSelected ? 'bg-black/40 text-white' : 'bg-red-950 text-red-300 border border-red-800/50'
                                                                }`}>
                                                                    {tab.badge}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className={`text-[10px] truncate ${isSelected ? 'text-red-100' : 'text-zinc-400'}`}>
                                                            {tab.desc}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className={`shrink-0 font-mono text-[11px] font-bold ${isSelected ? 'text-white' : 'text-zinc-500'}`}>
                                                    0{idx + 1}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Quick Cycler & Desktop Nav Strip */}
                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                        <button
                            onClick={handlePrevTab}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
                            title="Previous Section"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-xs sm:hidden">Prev</span>
                        </button>

                        {/* Desktop Pill Strip for Wide Screens */}
                        <div className="hidden lg:flex items-center gap-1 px-1.5 py-1 rounded-2xl bg-black/40 border border-zinc-800/80">
                            {subTabs.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveSubTab(t.id)}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                                        activeSubTab === t.id
                                            ? 'bg-red-600 text-white shadow-md'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                                    }`}
                                >
                                    {t.shortLabel}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleNextTab}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
                            title="Next Section"
                        >
                            <span className="text-xs sm:hidden">Next</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* SUB-TAB CONTENTS */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSubTab}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                >
                    {activeSubTab === 'overview' && <AboutOverview />}
                    {activeSubTab === 'operations' && <AboutOperations />}
                    {activeSubTab === 'ballistics' && <AboutBallistics />}
                    {activeSubTab === 'progression' && <AboutProgression />}
                    {activeSubTab === 'armory' && <AboutArmory />}
                    {activeSubTab === 'architecture' && <AboutArchitecture />}
                    {activeSubTab === 'sop' && <AboutSafetySOP />}
                    {activeSubTab === 'faq' && <AboutIntelFaq />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
