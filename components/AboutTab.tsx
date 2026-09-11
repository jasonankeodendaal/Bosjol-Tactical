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
            <div className="relative p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-zinc-900/95 via-zinc-950/95 to-black border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-xl z-30">
                {/* Tactical Top Accent Light Line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 opacity-90 rounded-t-2xl sm:rounded-t-3xl shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                
                {/* Watermark Crosshair */}
                <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
                    <Crosshair className="w-64 h-64 sm:w-96 sm:h-96 text-red-500" />
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 sm:gap-5">
                    <div className="space-y-1.5 sm:space-y-2 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-red-950/90 text-red-400 border border-red-800/70 flex items-center gap-1 shadow-[0_2px_8px_rgba(220,38,38,0.3)]">
                                <Sparkles className="w-3 h-3 text-red-400" /> Tactical Engine v3.0
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-emerald-950/90 text-emerald-400 border border-emerald-800/70 flex items-center gap-1 shadow-[0_2px_8px_rgba(16,185,129,0.3)]">
                                <Activity className="w-3 h-3 text-emerald-400" /> Supabase Realtime CDC
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900/90 text-zinc-300 border border-zinc-700/80 shadow-sm">
                                19 Schemas
                            </span>
                        </div>

                        <div className="flex items-center gap-2.5 sm:gap-4 pt-0.5">
                            {clubLogo ? (
                                <img 
                                    src={clubLogo} 
                                    alt={clubName} 
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 sm:w-14 sm:h-14 object-contain rounded-xl sm:rounded-2xl border border-zinc-700/80 bg-black/70 p-1 shrink-0 drop-shadow-xl shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
                                />
                            ) : (
                                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl border border-red-500/50 bg-gradient-to-b from-red-950/60 to-black flex items-center justify-center p-1.5 shrink-0 shadow-[0_0_25px_rgba(239,68,68,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)]">
                                    <Shield className="w-5 h-5 sm:w-8 sm:h-8 text-red-500" />
                                </div>
                            )}

                            <div>
                                <h1 className="text-base sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                    <span>{clubName}</span>
                                    <span className="text-[9px] sm:text-xs font-mono font-bold px-1.5 sm:px-2 py-0.5 bg-red-600/25 text-red-400 border border-red-500/50 rounded-lg shadow-inner">
                                        OFFICIAL FIELD &amp; TECH MANUAL
                                    </span>
                                </h1>
                                <p className="text-[11px] sm:text-sm text-zinc-400 font-medium line-clamp-1 sm:line-clamp-none">
                                    {clubSlogan}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Live Telemetry Grid - Side-by-Side 3D Squares on Mobile */}
                    <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-row gap-1.5 sm:gap-2 pt-1 lg:pt-0">
                        <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-zinc-900/90 to-black border border-white/10 shadow-[0_6px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] flex items-center gap-2 hover:-translate-y-0.5 transition-transform">
                            <div className="p-1 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shrink-0">
                                <Users className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[8.5px] sm:text-[9.5px] font-mono text-zinc-400 uppercase leading-none truncate">Max Capacity</div>
                                <div className="text-[11px] sm:text-xs font-black text-white font-mono mt-0.5 truncate">Unlimited</div>
                            </div>
                        </div>

                        <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-zinc-900/90 to-black border border-white/10 shadow-[0_6px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] flex items-center gap-2 hover:-translate-y-0.5 transition-transform">
                            <div className="p-1 rounded-lg bg-red-950/80 border border-red-500/40 text-red-400 shrink-0">
                                <Gauge className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[8.5px] sm:text-[9.5px] font-mono text-zinc-400 uppercase leading-none truncate">Chrono Limit</div>
                                <div className="text-[11px] sm:text-xs font-black text-white font-mono mt-0.5 truncate">1.50J (AEG)</div>
                            </div>
                        </div>

                        <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-zinc-900/90 to-black border border-white/10 shadow-[0_6px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] flex items-center gap-2 hover:-translate-y-0.5 transition-transform">
                            <div className="p-1 rounded-lg bg-amber-950/80 border border-amber-500/40 text-amber-400 shrink-0">
                                <Radio className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[8.5px] sm:text-[9.5px] font-mono text-zinc-400 uppercase leading-none truncate">Command Freq</div>
                                <div className="text-[11px] sm:text-xs font-black text-white font-mono mt-0.5 truncate">CH 01 (462.56)</div>
                            </div>
                        </div>

                        <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-zinc-900/90 to-black border border-white/10 shadow-[0_6px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] flex items-center gap-2 hover:-translate-y-0.5 transition-transform">
                            <div className="p-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shrink-0">
                                <ShieldCheck className="w-3.5 h-3.5" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[8.5px] sm:text-[9.5px] font-mono text-zinc-400 uppercase leading-none truncate">Eye Standard</div>
                                <div className="text-[11px] sm:text-xs font-black text-white font-mono mt-0.5 truncate">ANSI Z87.1+</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* NAVIGATION BAR: DROPDOWN + QUICK CYCLER + DESKTOP PILLS */}
                <div className="mt-3 sm:mt-5 pt-2.5 sm:pt-3.5 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    
                    {/* DROPDOWN SELECTOR */}
                    <div className="relative flex-grow max-w-full sm:max-w-md" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center justify-between gap-2 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 hover:from-zinc-850 hover:to-zinc-900 border border-red-500/50 shadow-[0_4px_20px_rgba(239,68,68,0.2),inset_0_1px_0_rgba(255,255,255,0.15)] text-left transition-all active:scale-[0.99]"
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="listbox"
                        >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-red-600/25 text-red-400 border border-red-500/40 shrink-0 shadow-inner">
                                    {currentTab.icon}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[11.5px] sm:text-sm font-black text-white uppercase tracking-tight sm:tracking-wider leading-tight">
                                            {currentTab.label}
                                        </span>
                                        {currentTab.badge && (
                                            <span className="text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 bg-red-950 text-red-400 rounded border border-red-800/60 shrink-0 whitespace-nowrap">
                                                {currentTab.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[9.5px] sm:text-[10px] text-zinc-400 truncate hidden sm:block">
                                        {currentTab.desc}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 text-zinc-400">
                                <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase text-red-400 bg-red-950/80 px-1.5 py-0.5 rounded-lg border border-red-900/50 whitespace-nowrap">
                                    {currentTabIndex + 1}/{subTabs.length}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-red-400' : ''}`} />
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
                    <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 shrink-0">
                        <button
                            onClick={handlePrevTab}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 hover:from-zinc-800 hover:to-zinc-900 border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] text-xs font-bold text-zinc-300 hover:text-white transition-all active:scale-95"
                            title="Previous Section"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span className="text-[11px] sm:hidden">Prev</span>
                        </button>

                        {/* Desktop Pill Strip for Wide Screens */}
                        <div className="hidden lg:flex items-center gap-1 px-1.5 py-1 rounded-2xl bg-black/60 border border-white/10 shadow-inner">
                            {subTabs.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveSubTab(t.id)}
                                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                                        activeSubTab === t.id
                                            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_4px_14px_rgba(220,38,38,0.4)] border border-red-500/50'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                                    }`}
                                >
                                    {t.shortLabel}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleNextTab}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-b from-zinc-900 to-zinc-950 hover:from-zinc-800 hover:to-zinc-900 border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] text-xs font-bold text-zinc-300 hover:text-white transition-all active:scale-95"
                            title="Next Section"
                        >
                            <span className="text-[11px] sm:hidden">Next</span>
                            <ChevronRight className="w-3.5 h-3.5" />
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
