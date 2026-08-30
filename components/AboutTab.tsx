import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CompanyDetails,
    Rank,
    Tier
} from '../types';
import { 
    Shield, 
    Crosshair, 
    Trophy, 
    Users, 
    Gauge, 
    Layers, 
    Sparkles, 
    Radio, 
    FileText, 
    Flame, 
    RadioTower, 
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
    Info, 
    ArrowRight, 
    ChevronDown, 
    ChevronLeft, 
    ChevronRight, 
    ExternalLink, 
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
    Layers3
} from 'lucide-react';
import { resolveRankIcon, getRankBadgeSvg } from '../utils/rankBadges';

interface AboutTabProps {
    companyDetails?: CompanyDetails;
}

type SubTabKey = 'overview' | 'operations' | 'ballistics' | 'progression' | 'architecture' | 'sop' | 'faq';

export const AboutTab: React.FC<AboutTabProps> = ({ companyDetails }) => {
    const [activeSubTab, setActiveSubTab] = useState<SubTabKey>('overview');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [faqSearch, setFaqSearch] = useState('');
    const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>('All');
    const [expandedFaq, setExpandedFaq] = useState<string | null>('faq-1');
    const [activeChronoTab, setActiveChronoTab] = useState<'aeg' | 'dmr' | 'sniper' | 'pistol'>('aeg');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const clubName = companyDetails?.name || 'Bosjol Tactical Airsoft';
    const clubSlogan = companyDetails?.slogan || 'Precision Tactical Operations & Combat Simulation';
    const clubLogo = companyDetails?.logoUrl || '';

    // Close dropdown on click or touch outside
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
            desc: 'System architecture, mission cycle & live telemetry',
            icon: <Compass className="w-4 h-4" /> 
        },
        { 
            id: 'operations', 
            label: 'Field Operations', 
            shortLabel: 'Ops & Modes',
            desc: '6 scenario modes, respawns, radio & objectives',
            icon: <Target className="w-4 h-4" />, 
            badge: '6 Modes' 
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
            desc: 'Career tier brackets, XP math & legendary medals',
            icon: <Trophy className="w-4 h-4" /> 
        },
        { 
            id: 'architecture', 
            label: 'Systems & Cloud', 
            shortLabel: 'Cloud Systems',
            desc: 'PostgreSQL CDC, ledger & automated sync',
            icon: <Cpu className="w-4 h-4" /> 
        },
        { 
            id: 'sop', 
            label: 'Safety & SOP', 
            shortLabel: 'Safety SOP',
            desc: 'ANSI Z87.1+, Blind Man cease-fire & medical',
            icon: <ShieldAlert className="w-4 h-4" /> 
        },
        { 
            id: 'faq', 
            label: 'Intel Terminal', 
            shortLabel: 'FAQ Intel',
            desc: 'Field protocols, rules, payments & troubleshooting',
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

    const faqs = [
        {
            id: 'faq-1',
            category: 'Match Operations',
            question: 'How does single-click Event Finalization cascade stats across operators?',
            answer: 'When a Game Master clicks "Finalize Event" on the Manage Event console, the system loops through all confirmed signed-up operators. It awards earned event participation RP (+500 RP), applies all earned match milestone badges, records career attendance, auto-updates the global leaderboard, and automatically writes the event ticket and rental revenue to the Financial Ledger.'
        },
        {
            id: 'faq-2',
            category: 'Cloud & Database',
            question: 'How does real-time live synchronization work across player and admin dashboards?',
            answer: 'The system uses Supabase Cloud PostgreSQL with Change Data Capture (CDC) over WebSockets (`postgres_changes`). Every match signup, attendance scan, RP adjustment, inventory rental, and system setting updates immediately across all connected field marshal and player devices with sub-15ms latency.'
        },
        {
            id: 'faq-3',
            category: 'Chrono & Safety',
            question: 'What happens if a primary replica fails the morning chronograph check?',
            answer: 'Any replica exceeding maximum allowed Joules/FPS is flagged RED and prohibited from field entry until adjusted or down-tuned. Operators may rent an armory backup AEG or switch to a compliant secondary weapon. Marshals affix a tamper-evident color-coded zip tie to validated replicas.'
        },
        {
            id: 'faq-4',
            category: 'Ranks & XP',
            question: 'How are Rank Level-Ups and Promotion Perks deposited?',
            answer: 'As operators accumulate XP from field matches and commendations, the progression engine compares their total XP against the configured rank tiers (Recruit -> Operative -> Veteran -> Specialist -> Commander -> Tactical Elite). Crossing a threshold automatically triggers an in-app promotion alert and deposits unlocked perks (such as rental discounts and free raffle entries) to their profile.'
        },
        {
            id: 'faq-5',
            category: 'Financial Ledger',
            question: 'How are ticket entry fees and rental gear income calculated automatically?',
            answer: 'During event finalization, the system checks total confirmed operator attendance and requested rental equipment. It computes `(Attended Operators × Base Ticket Price) + (Rental Bundles × Rental Fee)` and posts a balance entry into the Income Ledger without requiring manual accounting.'
        },
        {
            id: 'faq-6',
            category: 'Emergency & First Aid',
            question: 'What is the "Blind Man" emergency cease-fire protocol?',
            answer: 'If any individual loses eye protection, sustains a medical injury, or an unauthorized civilian enters the active combat zone, ANY operator must loudly shout "BLIND MAN! BLIND MAN!". All players immediately repeat the call, stop firing, switch replicas to SAFE, barrel-down, and remain in place until Field Marshals declare "ALL CLEAR".'
        },
        {
            id: 'faq-7',
            category: 'Field Etiquette',
            question: 'What is the standard Hit-Call protocol and Ricochet rule?',
            answer: 'Airsoft operates strictly on the honor system. Any direct BB strike to any part of the operator’s body, tactical vest, helmet, or carried gear counts as a valid hit. When struck, the operator must loudly shout "HIT!", raise their red dead-rag or hand high, and proceed to the respawn zone. Ricochets and gun hits do not count unless specified by game scenario.'
        }
    ];

    const faqCategories = ['All', 'Match Operations', 'Cloud & Database', 'Chrono & Safety', 'Ranks & XP', 'Financial Ledger', 'Emergency & First Aid', 'Field Etiquette'];

    const filteredFaqs = faqs.filter(f => {
        const matchesCat = selectedFaqCategory === 'All' || f.category === selectedFaqCategory;
        const matchesSearch = !faqSearch.trim() || 
            f.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
            f.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
            f.category.toLowerCase().includes(faqSearch.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <div className="relative w-full text-zinc-100 font-sans pb-16 space-y-4 sm:space-y-6 select-none max-w-7xl mx-auto px-1 sm:px-2">
            {/* Ambient 3D Glowing Lights Background Depth */}
            <div className="absolute -top-12 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
            <div className="absolute top-1/3 -right-16 w-60 sm:w-80 h-60 sm:h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute bottom-10 left-10 w-72 sm:w-96 h-72 sm:h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

            {/* 3D COMMAND HERO BANNER - Free View / Mobile-Shrink Depth */}
            <div className="relative p-3.5 sm:p-5 lg:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-zinc-900/90 via-zinc-950/95 to-black border border-zinc-800/80 shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl z-30">
                {/* Decorative Background Elements Contained */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden pointer-events-none">
                    {/* Tactical Top Accent Light Line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 opacity-80" />
                    
                    {/* Holographic Watermark Grid Layer */}
                    <div className="absolute inset-0 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]" />
                    <div className="absolute -right-8 -bottom-8 opacity-5">
                        <Crosshair className="w-64 h-64 sm:w-96 sm:h-96 text-red-500" />
                    </div>
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
                    <div className="space-y-2 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-800/60 flex items-center gap-1 shadow-sm">
                                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400 animate-spin" /> Tactical Engine v2.5
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 flex items-center gap-1 shadow-sm">
                                <Activity className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" /> Cloud Sync
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-mono font-bold uppercase tracking-wider bg-zinc-900 text-zinc-300 border border-zinc-700/80">
                                19 Schemas
                            </span>
                        </div>

                        <div className="flex items-center gap-2.5 sm:gap-3.5 pt-0.5">
                            {clubLogo ? (
                                <img 
                                    src={clubLogo} 
                                    alt={clubName} 
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 sm:w-14 sm:h-14 object-contain rounded-xl border border-zinc-700/80 bg-black/60 p-1 shrink-0 drop-shadow-md"
                                />
                            ) : (
                                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl border border-red-500/40 bg-red-950/40 flex items-center justify-center p-1.5 shrink-0 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                                    <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                                </div>
                            )}

                            <div>
                                <h1 className="text-base sm:text-2xl lg:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2 flex-wrap">
                                    <span>{clubName}</span>
                                    <span className="text-[10px] sm:text-xs font-mono font-bold px-1.5 py-0.5 bg-red-600/20 text-red-400 border border-red-500/40 rounded">
                                        OFFICIAL FIELD GUIDE
                                    </span>
                                </h1>
                                <p className="text-xs sm:text-sm text-zinc-400 font-medium line-clamp-2">
                                    {clubSlogan}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Live Telemetry Grid - Mobile Shrunk 2x2 */}
                    <div className="w-full lg:w-auto grid grid-cols-2 sm:grid-cols-4 lg:flex lg:flex-row gap-1.5 sm:gap-2.5 pt-1 lg:pt-0">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-black/60 border border-zinc-800/80 backdrop-blur-sm flex items-center gap-2">
                            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 shrink-0" />
                            <div>
                                <div className="text-[9px] sm:text-[10px] font-mono text-zinc-400 uppercase leading-none">Max Capacity</div>
                                <div className="text-xs sm:text-sm font-black text-white font-mono mt-0.5">Unlimited</div>
                            </div>
                        </div>

                        <div className="p-2 sm:p-2.5 rounded-xl bg-black/60 border border-zinc-800/80 backdrop-blur-sm flex items-center gap-2">
                            <Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 shrink-0" />
                            <div>
                                <div className="text-[9px] sm:text-[10px] font-mono text-zinc-400 uppercase leading-none">Chrono Limit</div>
                                <div className="text-xs sm:text-sm font-black text-white font-mono mt-0.5">1.50J (AEG)</div>
                            </div>
                        </div>

                        <div className="p-2 sm:p-2.5 rounded-xl bg-black/60 border border-zinc-800/80 backdrop-blur-sm flex items-center gap-2">
                            <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0" />
                            <div>
                                <div className="text-[9px] sm:text-[10px] font-mono text-zinc-400 uppercase leading-none">Command Freq</div>
                                <div className="text-xs sm:text-sm font-black text-white font-mono mt-0.5">CH 01 (462.56)</div>
                            </div>
                        </div>

                        <div className="p-2 sm:p-2.5 rounded-xl bg-black/60 border border-zinc-800/80 backdrop-blur-sm flex items-center gap-2">
                            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                            <div>
                                <div className="text-[9px] sm:text-[10px] font-mono text-zinc-400 uppercase leading-none">Eye Standard</div>
                                <div className="text-xs sm:text-sm font-black text-white font-mono mt-0.5">ANSI Z87.1+</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SUB-PAGES NAVIGATION: TACTICAL DROPDOWN MENU + QUICK CYCLER */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    
                    {/* DROPDOWN SELECTOR (Interactive Menu for Sub Pages) */}
                    <div className="relative flex-grow max-w-full sm:max-w-md" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800/90 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)] text-left transition-all"
                            aria-expanded={isDropdownOpen}
                            aria-haspopup="listbox"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="p-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 shrink-0">
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
                                <span className="text-[10px] font-mono font-bold uppercase text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-900/40">
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
                                    className="absolute left-0 right-0 top-full mt-2 z-[999] p-2 rounded-2xl bg-zinc-950 border-2 border-zinc-700 shadow-[0_20px_60px_rgba(0,0,0,1)] space-y-1.5 max-h-[380px] overflow-y-auto"
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

                    {/* QUICK CYCLER BUTTONS (Next / Prev on Mobile & Desktop) */}
                    <div className="flex items-center justify-between sm:justify-end gap-1.5 shrink-0">
                        <button
                            onClick={handlePrevTab}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
                            title="Previous Section"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span className="text-[11px] sm:hidden">Prev</span>
                        </button>

                        {/* Desktop Pill Tab Strip (Compact helper for wide screens) */}
                        <div className="hidden xl:flex items-center gap-1 px-1 py-1 rounded-xl bg-black/40 border border-zinc-800/80">
                            {subTabs.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setActiveSubTab(t.id)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors ${
                                        activeSubTab === t.id
                                            ? 'bg-red-600 text-white shadow'
                                            : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                                    }`}
                                >
                                    {t.shortLabel}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={handleNextTab}
                            className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-300 hover:text-white transition-colors"
                            title="Next Section"
                        >
                            <span className="text-[11px] sm:hidden">Next</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* SUB TAB CONTENT WITH SMOOTH ANIMATION */}
            <AnimatePresence mode="wait">
                {/* 1. COMMAND HUB / OVERVIEW */}
                {activeSubTab === 'overview' && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 sm:space-y-6"
                    >
                        {/* 4-Pillar Tactical Highlights - Shrink to fit mobile */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
                            <PillarCard
                                title="Combat Progression"
                                subtitle="Rank & RP Mathematics"
                                icon={<Trophy className="w-4 h-4 text-amber-400" />}
                                accent="amber"
                                points={[
                                    '+500 RP awarded per finalized combat match',
                                    '6 distinct Career Ranks from Recruit to Tactical Elite',
                                    'Auto-deposit promotion perks & gear discounts',
                                    'Dynamic seasonal resets preserving badge legacies'
                                ]}
                            />

                            <PillarCard
                                title="Chrono & Ballistics"
                                subtitle="Joules & Minimum Distance"
                                icon={<Gauge className="w-4 h-4 text-red-400" />}
                                accent="red"
                                points={[
                                    '1.50J / 400 FPS hard limit for Assault AEGs',
                                    'Chrono color tagging (Green / Amber / Red)',
                                    'Strict Minimum Engagement Distance (MED) enforcement',
                                    'Mandatory ANSI Z87.1+ full-seal eye protection'
                                ]}
                            />

                            <PillarCard
                                title="Operational Center"
                                subtitle="QR Check-in & Signups"
                                icon={<Target className="w-4 h-4 text-emerald-400" />}
                                accent="emerald"
                                points={[
                                    'Instant QR code player scanning at marshaling points',
                                    'Rental package reservation & real-time armory deduction',
                                    'Direct single-click event finalization cascade',
                                    'Live automated game roster generation'
                                ]}
                            />

                            <PillarCard
                                title="Cloud Engine"
                                subtitle="Double-Entry Financial Ledger"
                                icon={<Database className="w-4 h-4 text-cyan-400" />}
                                accent="cyan"
                                points={[
                                    'Live Supabase PostgreSQL CDC over WebSockets',
                                    'Auto-balanced event entry and rental income logs',
                                    'Row-Level Security guarding player medical records',
                                    '19 structured database collections with zero-lag cache'
                                ]}
                            />
                        </div>

                        {/* Interactive Match Cycle Timeline */}
                        <div className="p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950/80 border border-zinc-800/80 shadow-2xl backdrop-blur-md relative overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-3 border-b border-zinc-800/80">
                                <div>
                                    <h3 className="text-xs sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        <Workflow className="w-4 h-4 text-red-500" /> Operational Match Day Flowchart
                                    </h3>
                                    <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                                        From registration and armory pickup to field marshalling and atomic finalization.
                                    </p>
                                </div>
                                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-red-400 px-2 py-0.5 rounded-full bg-red-950/60 border border-red-800/50 self-start sm:self-auto">
                                    STANDARD COMBAT TIMELINE
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 pt-3.5">
                                <TimelineStep 
                                    step="01"
                                    title="Chrono & Armory Check"
                                    badge="08:00 - 09:00"
                                    desc="Operators report to chrono marshal with primary & sidearm replicas. FPS & Joules stamped, tamper-evident tag attached, and rental packages issued."
                                    icon={<Gauge className="w-4 h-4 text-amber-400" />}
                                />
                                <TimelineStep 
                                    step="02"
                                    title="Briefing & Factions"
                                    badge="09:15 - 09:45"
                                    desc="Safety briefing, medic rules, squad radio channels assignment, mission objective review, and faction arm-band color allocation."
                                    icon={<Users className="w-4 h-4 text-cyan-400" />}
                                />
                                <TimelineStep 
                                    step="03"
                                    title="Active Field Engagements"
                                    badge="10:00 - 15:30"
                                    desc="High-intensity tactical scenarios (CQB Assault, VIP Escort, Domination) overseen by field marshals with live QR scan tracking."
                                    icon={<Crosshair className="w-4 h-4 text-red-400" />}
                                />
                                <TimelineStep 
                                    step="04"
                                    title="Finalization & Debrief"
                                    badge="16:00 - End"
                                    desc="Marshal triggers event finalization. RP, attendance records, badges, and financial ledger income sync across all cloud nodes."
                                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                                />
                            </div>
                        </div>

                        {/* Tactical Squad Radio Grid & Comm Matrix */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                            <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md space-y-3">
                                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                                    <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        <RadioTower className="w-4 h-4 text-amber-400" /> Squad Radio Communications Matrix
                                    </h4>
                                    <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 font-bold">UHF / FRS</span>
                                </div>
                                <div className="space-y-2">
                                    {[
                                        { ch: 'CH 01', freq: '462.5625 MHz', role: 'Command & Field Marshals', desc: 'Reserved for emergency cease-fire, rule enforcement, and match timing' },
                                        { ch: 'CH 02', freq: '462.5875 MHz', role: 'Alpha Faction (Red Team)', desc: 'Squad leader coordination, objective capture status, reinforcement requests' },
                                        { ch: 'CH 03', freq: '462.6125 MHz', role: 'Bravo Faction (Blue Team)', desc: 'Tactical movement, defense perimeter callouts, sniper recon intel' },
                                        { ch: 'CH 04', freq: '462.6375 MHz', role: 'Field Medic & Armory Support', desc: 'Rental gear battery swaps, medical assistance, BB restock requests' }
                                    ].map((r, i) => (
                                        <div key={i} className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="px-2 py-0.5 rounded-lg bg-zinc-950 border border-amber-900/50 font-mono text-[11px] font-black text-amber-400 shrink-0">
                                                    {r.ch}
                                                </span>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-white truncate">{r.role}</div>
                                                    <div className="text-[10px] text-zinc-400 truncate">{r.desc}</div>
                                                </div>
                                            </div>
                                            <span className="text-[9px] sm:text-[10px] font-mono text-zinc-500 font-bold shrink-0">{r.freq}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-zinc-950/80 border border-zinc-800/80 backdrop-blur-md space-y-3">
                                <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
                                    <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-400" /> Operator Combat Readiness Standard
                                    </h4>
                                    <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400 font-bold">MANDATORY</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-0.5">
                                        <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                            <Glasses className="w-3.5 h-3.5" /> Full-Seal Eye Protection
                                        </div>
                                        <p className="text-[10px] text-zinc-400 leading-normal">
                                            ANSI Z87.1+ or EN166 rating mandatory with retention strap. Mesh goggles require sub-glasses.
                                        </p>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-0.5">
                                        <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                                            <Shield className="w-3.5 h-3.5" /> Lower Face Mesh Guard
                                        </div>
                                        <p className="text-[10px] text-zinc-400 leading-normal">
                                            Steel mesh or rigid polymer protecting teeth, jaw, and nose. Mandatory for operators under 18.
                                        </p>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-0.5">
                                        <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                                            <Flame className="w-3.5 h-3.5" /> Red Dead-Rag / Beacon
                                        </div>
                                        <p className="text-[10px] text-zinc-400 leading-normal">
                                            Minimum 20x20cm bright red cloth displayed immediately upon taking a hit to avoid overkill.
                                        </p>
                                    </div>
                                    <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-0.5">
                                        <div className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                                            <Boxes className="w-3.5 h-3.5" /> Bio-Degradable BBs Only
                                        </div>
                                        <p className="text-[10px] text-zinc-400 leading-normal">
                                            Field ecology policy requires PLA biodegradable BBs (0.20g to 0.40g). No plastic BBs permitted.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 2. FIELD OPERATIONS & GAME MODES */}
                {activeSubTab === 'operations' && (
                    <motion.div
                        key="operations"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 sm:space-y-6"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-zinc-800">
                            <div>
                                <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <Target className="w-4 h-4 text-red-500" /> Standard Match Scenarios & Rules of Engagement
                                </h3>
                                <p className="text-[11px] sm:text-xs text-zinc-400">
                                    Official scenario rules, respawn mechanics, hit protocols, and victory win-conditions.
                                </p>
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 self-start sm:self-auto">
                                6 OFFICIAL ROTATIONS
                            </span>
                        </div>

                        {/* 6 Tactical Game Modes Grid - Mobile-Shrunk */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            <ScenarioCard
                                title="Team Deathmatch (TDM)"
                                type="Elimination / Attrition"
                                duration="20 - 30 Minutes"
                                respawn="Wave Respawns (Every 3 mins) or Touch-Base"
                                icon={<Flame className="w-4 h-4 text-red-400" />}
                                points={[
                                    'Two factions clash across full terrain with defined HQ respawn zones',
                                    'First faction to reach 50 confirmed eliminations or highest count at timeout wins',
                                    'Hit players must return directly to respawn without speaking or signaling',
                                    'Encourages squad fire-and-maneuver tactics and perimeter control'
                                ]}
                            />

                            <ScenarioCard
                                title="Domination / Sector Control"
                                type="Zone Capture"
                                duration="35 - 45 Minutes"
                                respawn="Forward FOB or Main Spawn"
                                icon={<Flag className="w-4 h-4 text-amber-400" />}
                                points={[
                                    '3 designated capture flags (Alpha, Bravo, Charlie) with digital timers',
                                    'Holding flags generates 1 point per 30 seconds for controlling faction',
                                    'FOB respawns unlocked when adjacent sector is firmly held',
                                    'Forces dynamic offensive and defensive squad splits'
                                ]}
                            />

                            <ScenarioCard
                                title="VIP Extraction / Escort"
                                type="High-Value Target"
                                duration="25 - 35 Minutes"
                                respawn="1 Life for VIP / 1 Respawn for Squad"
                                icon={<Shield className="w-4 h-4 text-emerald-400" />}
                                points={[
                                    'Assault team must locate and escort un-armed VIP to Extraction Zone Alpha',
                                    'VIP possesses only 1 life and must be moved under covering fire',
                                    'Defending faction establishes ambushes, chokepoints, and sniper overwatch',
                                    'Victory achieved if VIP reaches extraction or if escort team is neutralized'
                                ]}
                            />

                            <ScenarioCard
                                title="Bomb Defusal / Search & Destroy"
                                type="Objective CQB"
                                duration="15 - 20 Mins / Round"
                                respawn="Single Life (No Respawns)"
                                icon={<Zap className="w-4 h-4 text-cyan-400" />}
                                points={[
                                    'Attackers carry digital bomb prop to Site A (Armory) or Site B (Bunker)',
                                    'Defenders hold both sites and prevent 45-second detonation sequence',
                                    'Defusing requires 10 uninterrupted seconds of physical interaction',
                                    'Best of 5 round structure with faction side-swaps at half time'
                                ]}
                            />

                            <ScenarioCard
                                title="Hostage Rescue / Breach & Clear"
                                type="CQB Urban Infiltration"
                                duration="20 - 30 Minutes"
                                respawn="Single Life with Buddy Revive"
                                icon={<Lock className="w-4 h-4 text-purple-400" />}
                                points={[
                                    'Tactical entry into urban structures containing 2 civilian hostages',
                                    'Flashlights and semi-auto only inside building perimeters',
                                    'Hostage crossfire penalty: -200 RP if hostage is hit by friendly BBs',
                                    'Requires tactical communication, doorway pie-slicing, and room clearance'
                                ]}
                            />

                            <ScenarioCard
                                title="King of the Hill (Juggernaut)"
                                type="King of the Hill"
                                duration="30 Minutes"
                                respawn="Continuous Rolling Spawns"
                                icon={<Trophy className="w-4 h-4 text-yellow-400" />}
                                points={[
                                    'Single fortified hilltop compound with 360-degree firing slits',
                                    'Faction holding the hill counts cumulative seconds on central timer clock',
                                    'Grenades (sound flash) count as instant room clearance inside bunker',
                                    'High-intensity combat designed for heavy sustained support gunners'
                                ]}
                            />
                        </div>

                        {/* Tactical Hit & Respawn SOP Box */}
                        <div className="p-3.5 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2.5">
                            <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-400" /> Universal Hit Calling & Medic Revive Protocols
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                                    <span className="text-[10px] font-mono text-red-400 font-bold uppercase">RULE 01: IMMEDIATE HIT CALL</span>
                                    <p className="text-[11px] text-zinc-300">
                                        Loudly call "HIT!", raise dead-rag immediately. Do not talk, give directions, or reveal enemy positions while dead.
                                    </p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                                    <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">RULE 02: MEDIC REVIVE</span>
                                    <p className="text-[11px] text-zinc-300">
                                        Teammates can revive by holding shoulder for 30 seconds or tying a white medic bandage. Maximum 1 revive per life.
                                    </p>
                                </div>
                                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">RULE 03: SURRENDER CALL</span>
                                    <p className="text-[11px] text-zinc-300">
                                        Within 3 meters from behind, say "Surrender!". Defending player should accept honorably to prevent point-blank hits.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 3. BALLISTICS & CHRONOGRAPH MATRIX */}
                {activeSubTab === 'ballistics' && (
                    <motion.div
                        key="ballistics"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 sm:space-y-6"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-zinc-800">
                            <div>
                                <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <Gauge className="w-4 h-4 text-red-500" /> Ballistics, Joules & Minimum Engagement Distance (MED)
                                </h3>
                                <p className="text-[11px] sm:text-xs text-zinc-400">
                                    Energy-based chronograph limits measured with 0.20g, 0.25g, 0.30g, and 0.40g BBs for field safety.
                                </p>
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 self-start sm:self-auto">
                                JOULE-FIRST CHRONO STANDARD
                            </span>
                        </div>

                        {/* Weapon Class Selector Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                            {[
                                { id: 'aeg', label: 'Assault AEG / SMG', joules: '1.50 J', med: '5 Meters' },
                                { id: 'dmr', label: 'Designated Marksman (DMR)', joules: '1.88 J', med: '15 Meters' },
                                { id: 'sniper', label: 'Bolt Action Sniper (BASR)', joules: '2.32 J', med: '20 Meters' },
                                { id: 'pistol', label: 'Sidearm / GBB Pistol', joules: '1.14 J', med: '0 Meters (CQB)' }
                            ].map((w) => (
                                <button
                                    key={w.id}
                                    onClick={() => setActiveChronoTab(w.id as any)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 ${
                                        activeChronoTab === w.id
                                            ? 'bg-red-600 text-white shadow-md font-black'
                                            : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                                    }`}
                                >
                                    <span>{w.label}</span>
                                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                        activeChronoTab === w.id ? 'bg-black/40 text-white' : 'bg-zinc-950 text-zinc-400'
                                    }`}>
                                        {w.joules}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Active Class Highlight Card */}
                        <div className="p-3.5 sm:p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-zinc-800">
                                <div>
                                    <span className="text-[9px] sm:text-[10px] font-mono text-red-400 font-bold uppercase tracking-wider">
                                        ACTIVE PROFILE: {activeChronoTab.toUpperCase()}
                                    </span>
                                    <h4 className="text-sm sm:text-base font-black text-white uppercase mt-0.5">
                                        {activeChronoTab === 'aeg' && 'Assault Rifle, Carbine, Submachine Gun & LMG'}
                                        {activeChronoTab === 'dmr' && 'Designated Marksman Rifle (Locked Semi-Auto Only)'}
                                        {activeChronoTab === 'sniper' && 'Bolt Action Sniper Rifle (Manual Cocking Spring / HPA)'}
                                        {activeChronoTab === 'pistol' && 'Gas Blowback (GBB), CO2 & AEP Secondary Pistols'}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono font-bold px-2 py-1 bg-red-950/60 text-red-300 border border-red-800/40 rounded">
                                        TAG: {activeChronoTab === 'aeg' ? 'GREEN ZIP-TIE' : activeChronoTab === 'dmr' ? 'AMBER ZIP-TIE' : activeChronoTab === 'sniper' ? 'RED ZIP-TIE' : 'BLUE ZIP-TIE'}
                                    </span>
                                </div>
                            </div>

                            {/* Ballistics Table */}
                            <div className="overflow-x-auto -mx-1">
                                <table className="w-full text-left text-xs font-mono">
                                    <thead>
                                        <tr className="bg-zinc-900/90 text-zinc-400 text-[10px] uppercase border-b border-zinc-800">
                                            <th className="p-2 sm:p-2.5">BB Weight</th>
                                            <th className="p-2 sm:p-2.5">Max Velocity (FPS)</th>
                                            <th className="p-2 sm:p-2.5">Max Velocity (m/s)</th>
                                            <th className="p-2 sm:p-2.5">Max Kinetic Energy</th>
                                            <th className="p-2 sm:p-2.5">Min. Engagement Distance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                                        {activeChronoTab === 'aeg' && (
                                            <>
                                                <tr className="hover:bg-zinc-900/40">
                                                    <td className="p-2 sm:p-2.5 font-bold text-white">0.20g Standard</td>
                                                    <td className="p-2 sm:p-2.5 text-red-400 font-bold">400 FPS</td>
                                                    <td className="p-2 sm:p-2.5">122 m/s</td>
                                                    <td className="p-2 sm:p-2.5 text-amber-400 font-bold">1.49 Joules</td>
                                                    <td className="p-2 sm:p-2.5">5 Meters</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-900/40">
                                                    <td className="p-2 sm:p-2.5 font-bold text-white">0.25g Tactical</td>
                                                    <td className="p-2 sm:p-2.5 text-red-400 font-bold">358 FPS</td>
                                                    <td className="p-2 sm:p-2.5">109 m/s</td>
                                                    <td className="p-2 sm:p-2.5 text-amber-400 font-bold">1.49 Joules</td>
                                                    <td className="p-2 sm:p-2.5">5 Meters</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-900/40">
                                                    <td className="p-2 sm:p-2.5 font-bold text-white">0.28g Match Grade</td>
                                                    <td className="p-2 sm:p-2.5 text-red-400 font-bold">338 FPS</td>
                                                    <td className="p-2 sm:p-2.5">103 m/s</td>
                                                    <td className="p-2 sm:p-2.5 text-amber-400 font-bold">1.49 Joules</td>
                                                    <td className="p-2 sm:p-2.5">5 Meters</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-900/40">
                                                    <td className="p-2 sm:p-2.5 font-bold text-white">0.30g Heavy Bio</td>
                                                    <td className="p-2 sm:p-2.5 text-red-400 font-bold">327 FPS</td>
                                                    <td className="p-2 sm:p-2.5">100 m/s</td>
                                                    <td className="p-2 sm:p-2.5 text-amber-400 font-bold">1.49 Joules</td>
                                                    <td className="p-2 sm:p-2.5">5 Meters</td>
                                                </tr>
                                            </>
                                        )}
                                        {activeChronoTab === 'dmr' && (
                                            <>
                                                <tr className="hover:bg-zinc-900/40">
                                                    <td className="p-2 sm:p-2.5 font-bold text-white">0.20g Standard</td>
                                                    <td className="p-2 sm:p-2.5 text-red-400 font-bold">450 FPS</td>
                                                    <td className="p-2 sm:p-2.5">137 m/s</td>
                                                    <td className="p-2 sm:p-2.5 text-amber-400 font-bold">1.88 Joules</td>
                                                    <td className="p-2 sm:p-2.5 text-red-400 font-bold">15 Meters</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-900/40">
                                                    <td className="p-2 sm:p-2.5 font-bold text-white">0.28g Match Grade</td>
                                                    <td className="p-2 sm:p-2.5 text-red-400 font-bold">380 FPS</td>
                                                    <td className="p-2 sm:p-2.5">116 m/s</td>
                                                    <td className="p-2 sm:p-2.5 text-amber-400 font-bold">1.88 Joules</td>
                                                    <td className="p-2 sm:p-2.5 text-red-400 font-bold">15 Meters</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-900/40">
                                                    <td className="p-2 sm:p-2.5 font-bold text-white">0.32g Precision</td>
                                                    <td className="p-2 sm:p-2.5 text-red-400 font-bold">356 FPS</td>
                                                    <td className="p-2 sm:p-2.5">108 m/s</td>
                                                    <td className="p-2 sm:p-2.5 text-amber-400 font-bold">1.88 Joules</td>
                                                    <td className="p-2 sm:p-2.5 text-red-400 font-bold">15 Meters</td>
                                                </tr>
                                            </>
                                        )}
                                        {activeChronoTab === 'sniper' && (
                                            <>
                                                <tr className="hover:bg-zinc-900/40">
                                                    <td className="p-2 sm:p-2.5 font-bold text-white">0.20g Standard</td>
                                                    <td className="p-2 sm:p-2.5 text-red-400 font-bold">500 FPS</td>
                                                    <td className="p-2 sm:p-2.5">152 m/s</td>
                                                    <td className="p-2 sm:p-2.5 text-amber-400 font-bold">2.32 Joules</td>
                                                    <td className="p-2 sm:p-2.5 text-red-400 font-bold">20 Meters</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-900/40">
                                                    <td className="p-2 sm:p-2.5 font-bold text-white">0.36g Heavy Sniper</td>
                                                    <td className="p-2 sm:p-2.5 text-red-400 font-bold">372 FPS</td>
                                                    <td className="p-2 sm:p-2.5">113 m/s</td>
                                                    <td className="p-2 sm:p-2.5 text-amber-400 font-bold">2.32 Joules</td>
                                                    <td className="p-2 sm:p-2.5 text-red-400 font-bold">20 Meters</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-900/40">
                                                    <td className="p-2 sm:p-2.5 font-bold text-white">0.40g Ultra Heavy</td>
                                                    <td className="p-2 sm:p-2.5 text-red-400 font-bold">353 FPS</td>
                                                    <td className="p-2 sm:p-2.5">107 m/s</td>
                                                    <td className="p-2 sm:p-2.5 text-amber-400 font-bold">2.32 Joules</td>
                                                    <td className="p-2 sm:p-2.5 text-red-400 font-bold">20 Meters</td>
                                                </tr>
                                            </>
                                        )}
                                        {activeChronoTab === 'pistol' && (
                                            <>
                                                <tr className="hover:bg-zinc-900/40">
                                                    <td className="p-2 sm:p-2.5 font-bold text-white">0.20g Standard</td>
                                                    <td className="p-2 sm:p-2.5 text-red-400 font-bold">350 FPS</td>
                                                    <td className="p-2 sm:p-2.5">106 m/s</td>
                                                    <td className="p-2 sm:p-2.5 text-amber-400 font-bold">1.14 Joules</td>
                                                    <td className="p-2 sm:p-2.5 text-emerald-400 font-bold">0 Meters (CQB Legal)</td>
                                                </tr>
                                                <tr className="hover:bg-zinc-900/40">
                                                    <td className="p-2 sm:p-2.5 font-bold text-white">0.25g Tactical</td>
                                                    <td className="p-2 sm:p-2.5 text-red-400 font-bold">313 FPS</td>
                                                    <td className="p-2 sm:p-2.5">95 m/s</td>
                                                    <td className="p-2 sm:p-2.5 text-amber-400 font-bold">1.14 Joules</td>
                                                    <td className="p-2 sm:p-2.5 text-emerald-400 font-bold">0 Meters (CQB Legal)</td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-2.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-[11px] text-zinc-400 leading-relaxed flex items-center gap-2">
                                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                                <span>
                                    <strong>Kinetic Energy Formula:</strong> <code className="text-zinc-200">E = 0.5 × m × v²</code> where <em>m</em> is mass in kilograms and <em>v</em> is muzzle velocity in meters per second. All chronograph checks are performed with the operator's actual game-weight BBs.
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 4. PROGRESSION & RANKS */}
                {activeSubTab === 'progression' && (
                    <motion.div
                        key="progression"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 sm:space-y-6"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-zinc-800">
                            <div>
                                <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-amber-400" /> Career Ranks, XP Thresholds & Progression Perks
                                </h3>
                                <p className="text-[11px] sm:text-xs text-zinc-400">
                                    Earn Rank Points (RP) in combat matches to unlock prestigious tier insignias and armory benefits.
                                </p>
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50 self-start sm:self-auto">
                                6 CAREER TIERS
                            </span>
                        </div>

                        {/* Rank Insignias Showcase - Transparent Pure Vector Insignias */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {[
                                { name: 'Rookie I', xp: '0 - 499 RP', color: 'from-zinc-700 to-zinc-900', border: 'border-zinc-700', subranks: 'Training • Rookie Level 1–3 • Field Qualified', perks: 'Calling Card, 5% Rental Discount, Weapon XP Boost' },
                                { name: 'Veteran I', xp: '500 - 1,749 RP', color: 'from-emerald-900 to-zinc-900', border: 'border-emerald-600/50', subranks: 'Field Operative • Veteran Level 1–3 • Combat Veteran', perks: 'Bronze Insignia, 10% Ammo Discount, Squad Leader Eligible' },
                                { name: 'Elite I', xp: '1,750 - 3,499 RP', color: 'from-blue-900 to-zinc-900', border: 'border-blue-500/50', subranks: 'Specialist Training • Elite Level 1–3 • Elite Vanguard', perks: 'Silver Wings, 15% Rental Discount, VIP Staging Access' },
                                { name: 'Pro I', xp: '3,500 - 5,999 RP', color: 'from-amber-900 to-zinc-900', border: 'border-amber-500/50', subranks: 'Pro Cadet • Pro Level 1–3 • Pro Master', perks: 'Gold Star, 20% Store & Rental Discount, Neon Callsign' },
                                { name: 'Master I', xp: '6,000 - 11,999 RP', color: 'from-purple-900 to-zinc-900', border: 'border-purple-500/50', subranks: 'Master Initiate • Master Level 1–3 • Grandmaster', perks: 'Ruby Master Crest, 25% All-Access Pass, 3D Banner' },
                                { name: 'Legendary I', xp: '12,000+ RP', color: 'from-red-900 to-zinc-900', border: 'border-red-500/60', subranks: 'Apex Legend', perks: 'Mythic Insignia, Golden Frame, Hall of Legends Plaque' }
                            ].map((rank, i) => {
                                const rankBadge = resolveRankIcon('', rank.name);
                                return (
                                    <div key={i} className={`p-3.5 rounded-2xl bg-gradient-to-br ${rank.color} border ${rank.border} backdrop-blur-md space-y-2 relative overflow-hidden group hover:scale-[1.01] transition-transform`}>
                                        <div className="flex items-center gap-3">
                                            {/* Clean transparent badge, no box container */}
                                            <div className="w-12 h-12 flex items-center justify-center shrink-0">
                                                <img 
                                                    src={rankBadge} 
                                                    alt={rank.name} 
                                                    onError={(e) => {
                                                        (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(rank.name);
                                                    }}
                                                    className="w-full h-full object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)]"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-mono font-bold text-zinc-400">MAIN TIER</span>
                                                    <h4 className="text-sm font-black text-white uppercase truncate">{rank.name}</h4>
                                                </div>
                                                <span className="inline-block text-[10px] font-mono font-bold text-amber-400 bg-black/50 px-1.5 py-0.2 rounded border border-amber-500/30">
                                                    {rank.xp}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="pt-1.5 border-t border-white/10 space-y-1">
                                            <div>
                                                <div className="text-[10px] text-zinc-400 uppercase font-mono">Sub-Ranks Inside:</div>
                                                <div className="text-xs text-amber-300/90 font-mono font-medium truncate mt-0.5">{rank.subranks}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-zinc-400 uppercase font-mono">Key Perks:</div>
                                                <div className="text-xs text-zinc-200 font-medium truncate mt-0.5">{rank.perks}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* XP Math Breakdown */}
                        <div className="p-3.5 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                            <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-400" /> Rank Points (RP) Earning Formula
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                                    <div className="text-base font-black text-green-400 font-mono">+500 RP</div>
                                    <div className="text-[10px] text-zinc-400 uppercase mt-0.5">Match Attendance</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                                    <div className="text-base font-black text-green-400 font-mono">+250 RP</div>
                                    <div className="text-[10px] text-zinc-400 uppercase mt-0.5">Objective Capture / VIP Escort</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                                    <div className="text-base font-black text-green-400 font-mono">+150 RP</div>
                                    <div className="text-[10px] text-zinc-400 uppercase mt-0.5">Marshal Commendation</div>
                                </div>
                                <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center">
                                    <div className="text-base font-black text-red-400 font-mono">-200 RP</div>
                                    <div className="text-[10px] text-zinc-400 uppercase mt-0.5">Safety Violation / Chrono Fail</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 5. SYSTEMS & CLOUD ARCHITECTURE */}
                {activeSubTab === 'architecture' && (
                    <motion.div
                        key="architecture"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 sm:space-y-6"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-zinc-800">
                            <div>
                                <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <Cpu className="w-4 h-4 text-cyan-400" /> Cloud Database, Microservices & Ledger Architecture
                                </h3>
                                <p className="text-[11px] sm:text-xs text-zinc-400">
                                    Full-stack reactive architecture powering real-time marshal coordination and double-entry bookkeeping.
                                </p>
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50 self-start sm:self-auto">
                                SUPABASE POSTGRESQL CDC
                            </span>
                        </div>

                        {/* Architecture Blocks */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                                <div className="flex items-center gap-2 text-cyan-400">
                                    <Database className="w-4 h-4" />
                                    <h4 className="text-xs font-black uppercase tracking-wider">19 Cloud Schemas</h4>
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-normal">
                                    Relational PostgreSQL schemas including Operators, Match Signups, Ledger Transactions, Armory Inventory, Badges, and Audit Logs.
                                </p>
                                <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 font-mono text-[10px] text-zinc-300">
                                    Row-Level Security (RLS) + Cascade Finalization
                                </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <Zap className="w-4 h-4" />
                                    <h4 className="text-xs font-black uppercase tracking-wider">WebSocket Realtime</h4>
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-normal">
                                    Instant Change Data Capture (CDC) streaming over secure WebSockets. Live QR check-ins sync to marshal screens instantly.
                                </p>
                                <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 font-mono text-[10px] text-zinc-300">
                                    &lt; 15ms Latency Across Field Marshals
                                </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                                <div className="flex items-center gap-2 text-amber-400">
                                    <Server className="w-4 h-4" />
                                    <h4 className="text-xs font-black uppercase tracking-wider">Automated Ledger</h4>
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-normal">
                                    Double-entry accounting engine automatically reconciling event ticket revenue, rental gear fees, and armory maintenance costs.
                                </p>
                                <div className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 font-mono text-[10px] text-zinc-300">
                                    Zero Manual Spreadsheet Reconciliations
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 6. SAFETY & SOP */}
                {activeSubTab === 'sop' && (
                    <motion.div
                        key="sop"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 sm:space-y-6"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-zinc-800">
                            <div>
                                <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-red-500" /> Standard Operating Procedures (SOP) & Safety Code
                                </h3>
                                <p className="text-[11px] sm:text-xs text-zinc-400">
                                    Non-negotiable safety mandates, emergency cease-fire rules, and marshal instructions.
                                </p>
                            </div>
                            <span className="text-[9px] sm:text-[10px] font-mono text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/50 self-start sm:self-auto">
                                ZERO TOLERANCE POLICY
                            </span>
                        </div>

                        {/* SOP Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3.5 rounded-2xl bg-red-950/20 border border-red-800/50 space-y-2">
                                <h4 className="text-xs font-black text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <AlertTriangle className="w-4 h-4" /> "Blind Man" Emergency Protocol
                                </h4>
                                <p className="text-[11px] text-zinc-300 leading-relaxed">
                                    If eye protection falls off, an injury occurs, or an unauthorized civilian enters the field:
                                </p>
                                <ul className="text-[10px] text-zinc-400 space-y-1 list-disc list-inside">
                                    <li>Loudly shout <strong>"BLIND MAN! BLIND MAN!"</strong></li>
                                    <li>All players immediately stop firing, switch to SAFE, and barrel-down</li>
                                    <li>Remain in position until marshals declare "ALL CLEAR"</li>
                                </ul>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Glasses className="w-4 h-4" /> Eye & Face Protection Mandates
                                </h4>
                                <p className="text-[11px] text-zinc-300 leading-relaxed">
                                    Eye protection must NEVER be removed or lifted anywhere on the active field or chrono range.
                                </p>
                                <ul className="text-[10px] text-zinc-400 space-y-1 list-disc list-inside">
                                    <li>Full-seal ANSI Z87.1+ or EN166 ballistic rated only</li>
                                    <li>Lower face steel mesh recommended for all; mandatory under 18</li>
                                    <li>Removing goggles on the field results in immediate expulsion</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* 7. INTEL TERMINAL / FAQ */}
                {activeSubTab === 'faq' && (
                    <motion.div
                        key="faq"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4 sm:space-y-6"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800">
                            <div>
                                <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-red-500" /> Tactical Intel Terminal & Frequently Asked Questions
                                </h3>
                                <p className="text-[11px] sm:text-xs text-zinc-400">
                                    Search knowledgebase for match operations, cloud architecture, safety rules, and billing.
                                </p>
                            </div>

                            {/* Search Input */}
                            <div className="relative w-full sm:w-64">
                                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search FAQ intel..."
                                    value={faqSearch}
                                    onChange={e => setFaqSearch(e.target.value)}
                                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-900/90 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                            {faqCategories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedFaqCategory(cat)}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors shrink-0 ${
                                        selectedFaqCategory === cat
                                            ? 'bg-red-600 text-white font-black shadow-sm'
                                            : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* FAQ Accordion List */}
                        <div className="space-y-2">
                            {filteredFaqs.map(faq => {
                                const isExpanded = expandedFaq === faq.id;
                                return (
                                    <div
                                        key={faq.id}
                                        className="rounded-xl border border-zinc-800/80 bg-zinc-950/80 overflow-hidden transition-colors"
                                    >
                                        <button
                                            onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                                            className="w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-zinc-900/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <span className="text-[9px] font-mono font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800/40 shrink-0">
                                                    {faq.category}
                                                </span>
                                                <span className="text-xs sm:text-sm font-bold text-white truncate">
                                                    {faq.question}
                                                </span>
                                            </div>
                                            <ChevronDown className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform ${isExpanded ? 'rotate-180 text-red-400' : ''}`} />
                                        </button>
                                        {isExpanded && (
                                            <div className="px-3 pb-3 pt-1 text-xs text-zinc-300 leading-relaxed border-t border-zinc-800/60 bg-black/40">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {filteredFaqs.length === 0 && (
                                <div className="text-center py-8 text-zinc-500 text-xs">
                                    No intel records found matching your query.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* HELPER COMPONENTS */

const PillarCard: React.FC<{
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    accent: 'red' | 'amber' | 'emerald' | 'cyan';
    points: string[];
}> = ({ title, subtitle, icon, points }) => {
    return (
        <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 backdrop-blur-sm hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0">
                    {icon}
                </div>
                <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate">{title}</h4>
                    <p className="text-[10px] text-zinc-400 truncate">{subtitle}</p>
                </div>
            </div>
            <ul className="text-[10px] sm:text-[11px] text-zinc-300 space-y-1 pt-1 border-t border-zinc-800/60">
                {points.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                        <span className="text-red-500 text-xs leading-none shrink-0">•</span>
                        <span className="leading-tight">{p}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const TimelineStep: React.FC<{
    step: string;
    title: string;
    badge: string;
    desc: string;
    icon: React.ReactNode;
}> = ({ step, title, badge, desc, icon }) => {
    return (
        <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-black text-red-400">{step}</span>
                <span className="text-[9px] font-mono font-bold text-zinc-400 bg-zinc-950 px-1.5 py-0.2 rounded border border-zinc-800">{badge}</span>
            </div>
            <div className="flex items-center gap-1.5">
                {icon}
                <h5 className="text-xs font-bold text-white uppercase truncate">{title}</h5>
            </div>
            <p className="text-[10px] text-zinc-400 leading-normal">{desc}</p>
        </div>
    );
};

const ScenarioCard: React.FC<{
    title: string;
    type: string;
    duration: string;
    respawn: string;
    icon: React.ReactNode;
    points: string[];
}> = ({ title, type, duration, respawn, icon, points }) => {
    return (
        <div className="p-3 sm:p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 backdrop-blur-sm">
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
                <div className="flex items-center gap-1.5 min-w-0">
                    <div className="p-1 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0">{icon}</div>
                    <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider truncate">{title}</h4>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-mono">
                <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800/40">{type}</span>
                <span className="px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">{duration}</span>
                <span className="px-1.5 py-0.2 rounded bg-zinc-900 text-emerald-400 border border-zinc-800 truncate max-w-[140px]">{respawn}</span>
            </div>
            <ul className="text-[10px] sm:text-[11px] text-zinc-300 space-y-1 pt-1 border-t border-zinc-800/60">
                {points.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                        <span className="text-red-500 text-xs leading-none shrink-0">•</span>
                        <span className="leading-tight">{p}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};
