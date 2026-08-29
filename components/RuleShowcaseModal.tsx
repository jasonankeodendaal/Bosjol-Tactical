import React, { useState, useMemo } from 'react';
import { useData } from '../data/DataContext';
import type { TacticalRuleSet, TacticalRuleCategory } from '../types';
import { HELP_CONTENT } from '../helpContent';
import { 
    X, Search, Shield, Crosshair, Target, AlertTriangle, Zap, Scale, BookOpen, 
    ChevronRight, ArrowLeft, AlertOctagon, FileText, HelpCircle, Layers
} from 'lucide-react';

interface RuleShowcaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialRuleSetId?: string | null;
    initialTab?: 'rules' | 'help';
}

const CATEGORIES: { name: 'All' | TacticalRuleCategory; icon: any }[] = [
    { name: 'All', icon: BookOpen },
    { name: 'Specific Game Rules', icon: Target },
    { name: 'Safety Rules', icon: Shield },
    { name: 'Chronograph & FPS', icon: Crosshair },
    { name: 'CQB Standards', icon: Zap },
    { name: 'Medic & Respawn', icon: Scale },
    { name: 'Field Protocols', icon: AlertTriangle },
    { name: 'General', icon: FileText },
];

export const RuleShowcaseModal: React.FC<RuleShowcaseModalProps> = ({
    isOpen,
    onClose,
    initialRuleSetId = null,
    initialTab = 'rules'
}) => {
    const { tacticalRules, companyDetails } = useData();
    const [mainTab, setMainTab] = useState<'rules' | 'help'>(initialTab);
    const [selectedCategory, setSelectedCategory] = useState<'All' | TacticalRuleCategory>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeRuleSet, setActiveRuleSet] = useState<TacticalRuleSet | null>(null);
    const [selectedHelpTopicKey, setSelectedHelpTopicKey] = useState<string>('front-page');

    const adminBg = companyDetails?.adminDashboardBackgroundUrl;

    // Active rule sets filtering
    const activeSets = useMemo(() => {
        return (tacticalRules || []).filter(s => s.isActive !== false);
    }, [tacticalRules]);

    // Handle initialRuleSetId preset
    React.useEffect(() => {
        if (initialRuleSetId) {
            const found = activeSets.find(s => s.id === initialRuleSetId);
            if (found) {
                setActiveRuleSet(found);
                setMainTab('rules');
            }
        }
    }, [initialRuleSetId, activeSets]);

    const filteredSets = useMemo(() => {
        return activeSets.filter(set => {
            const matchesCategory = selectedCategory === 'All' || set.category === selectedCategory;
            const matchesSearch = !searchQuery.trim() || 
                set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                set.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                set.rules.some(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCategory && matchesSearch;
        });
    }, [activeSets, selectedCategory, searchQuery]);

    // Help Topics Filter
    const helpTopicsList = useMemo(() => {
        return Object.entries(HELP_CONTENT).map(([key, topic]) => ({
            key,
            ...topic
        }));
    }, []);

    const filteredHelpTopics = useMemo(() => {
        if (!searchQuery.trim()) return helpTopicsList;
        const q = searchQuery.toLowerCase();
        return helpTopicsList.filter(t => 
            t.title.toLowerCase().includes(q) || 
            t.description.toLowerCase().includes(q) ||
            t.sections.some(s => s.heading.toLowerCase().includes(q))
        );
    }, [helpTopicsList, searchQuery]);

    const selectedHelpTopic = HELP_CONTENT[selectedHelpTopicKey] || helpTopicsList[0];

    if (!isOpen) return null;

    const getIcon = (iconName?: string) => {
        switch (iconName) {
            case 'shield': return Shield;
            case 'crosshair': return Crosshair;
            case 'target': return Target;
            case 'alert-triangle': return AlertTriangle;
            case 'zap': return Zap;
            case 'scale': return Scale;
            default: return BookOpen;
        }
    };

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-1.5 sm:p-4 bg-black/80 backdrop-blur-xl animate-fade-in overflow-hidden">
            {/* 3D Depth Ambient Lighting Background Orbs */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-red-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-[120px] pointer-events-none -z-10" />

            <div className="relative w-[96vw] sm:w-full max-w-4xl h-[85vh] sm:h-[88vh] max-h-[780px] bg-black/50 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden text-zinc-100">
                
                {/* Admin Background Image Overlay */}
                {adminBg && (
                    <div 
                        className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-overlay pointer-events-none -z-10 transition-opacity duration-500" 
                        style={{ backgroundImage: `url(${adminBg})` }} 
                    />
                )}

                {/* 3D Ambient Top Glow Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 shadow-[0_0_15px_#ef4444]" />

                {/* Modal Header (Free View Open Layout, shrink-to-fit) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 sm:p-4 border-b border-white/10 bg-white/[0.03] backdrop-blur-md shrink-0 gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(220,38,38,0.3)] shrink-0">
                            <img src="https://i.ibb.co/70YnGRY/image-removebg-preview-5.png" alt="Rules & Help" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xs sm:text-base font-black uppercase tracking-wider text-white truncate">
                                {activeRuleSet ? activeRuleSet.title : 'Tactical Rules Centre'}
                            </h2>
                            <p className="text-[10px] sm:text-xs text-zinc-300 line-clamp-1">
                                {mainTab === 'rules' ? 'Operational Protocols & Field Rules' : 'Interactive System Briefing & Manual'}
                            </p>
                        </div>
                    </div>

                    {/* Merged Main Tab Switcher */}
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-1.5">
                        <div className="flex items-center p-0.5 rounded-xl bg-black/50 border border-white/10 w-full sm:w-auto backdrop-blur-md">
                            <button
                                onClick={() => { setMainTab('rules'); setActiveRuleSet(null); }}
                                className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 ${
                                    mainTab === 'rules'
                                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <Shield className="w-3 h-3" />
                                <span>Rules</span>
                            </button>
                            <button
                                onClick={() => { setMainTab('help'); setActiveRuleSet(null); }}
                                className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 ${
                                    mainTab === 'help'
                                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-[0_0_10px_rgba(220,38,38,0.4)]'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <HelpCircle className="w-3 h-3" />
                                <span>Help</span>
                            </button>
                        </div>

                        <button 
                            onClick={onClose}
                            className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-red-950/60 hover:text-red-400 border border-white/10 transition text-zinc-300 shrink-0"
                            aria-label="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Modal Main Content Container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-4 space-y-3">

                    {/* TAB 1: RULES & PROTOCOLS */}
                    {mainTab === 'rules' && (
                        <>
                            {!activeRuleSet ? (
                                <div className="space-y-3">
                                    {/* Search & Categories */}
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                            <input 
                                                type="text"
                                                placeholder="Search rules, safety, FPS limits, CQB..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-8 pr-8 py-1.5 sm:py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/50 backdrop-blur-md transition"
                                            />
                                            {searchQuery && (
                                                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 hover:text-white">
                                                    Clear
                                                </button>
                                            )}
                                        </div>

                                        {/* Category Pills */}
                                        <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                                            {CATEGORIES.map(cat => {
                                                const CatIcon = cat.icon;
                                                const isSelected = selectedCategory === cat.name;
                                                return (
                                                    <button
                                                        key={cat.name}
                                                        onClick={() => setSelectedCategory(cat.name)}
                                                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                                                            isSelected
                                                                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.4)] scale-[1.02]'
                                                                : 'bg-white/[0.03] text-zinc-400 border-white/10 hover:bg-white/[0.08] hover:text-zinc-200'
                                                        }`}
                                                    >
                                                        <CatIcon className="w-3 h-3" />
                                                        <span>{cat.name}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* 3D Modern Free-View Rule Set Grid - Compact 2-Column Square Grid on Mobile */}
                                    {filteredSets.length === 0 ? (
                                        <div className="py-8 text-center text-zinc-500 space-y-1 bg-white/[0.02] border border-white/10 rounded-xl backdrop-blur-md">
                                            <AlertOctagon className="w-6 h-6 mx-auto text-zinc-600" />
                                            <p className="text-xs font-semibold text-zinc-400">No matching rule sets found</p>
                                            <p className="text-[10px]">Try searching for different keywords or select "All".</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                                            {filteredSets.map((set) => {
                                                const IconComp = getIcon(set.icon);
                                                return (
                                                    <div
                                                        key={set.id}
                                                        onClick={() => setActiveRuleSet(set)}
                                                        className="group relative cursor-pointer aspect-square p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] backdrop-blur-md border border-white/10 hover:border-red-500/50 shadow-sm hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all duration-300 transform hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
                                                    >
                                                        {/* Top Micro Accents */}
                                                        <div className="flex items-center justify-between z-10">
                                                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform shadow-[0_0_8px_rgba(220,38,38,0.2)]">
                                                                <IconComp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                            </div>

                                                            {set.badge ? (
                                                                <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 truncate max-w-[60px]">
                                                                    {set.badge}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[8.5px] font-bold text-zinc-500 tracking-wider">
                                                                    {set.rules.length} RUL
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Body Title & Short Desc (Shrink-to-fit text) */}
                                                        <div className="z-10 my-auto py-0.5">
                                                            <h3 className="font-extrabold text-[10.5px] sm:text-xs text-white group-hover:text-red-400 transition-colors line-clamp-1 leading-tight">
                                                                {set.title}
                                                            </h3>
                                                            <p className="text-[9px] sm:text-[10px] text-zinc-300 line-clamp-2 mt-0.5 leading-tight">
                                                                {set.shortDescription}
                                                            </p>
                                                        </div>

                                                        {/* Bottom Inspect Link */}
                                                        <div className="z-10 flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-400 group-hover:text-white pt-0.5 border-t border-white/5">
                                                            <span className="font-semibold text-zinc-500 text-[8.5px]">
                                                                {set.rules.length} Rule{set.rules.length !== 1 ? 's' : ''}
                                                            </span>
                                                            <div className="flex items-center gap-0.5 font-bold text-red-400 group-hover:translate-x-0.5 transition-transform">
                                                                <span>View</span>
                                                                <ChevronRight className="w-2.5 h-2.5" />
                                                            </div>
                                                        </div>

                                                        {/* Subtle 3D Ambient Corner Glow */}
                                                        <div className="absolute -bottom-6 -right-6 w-14 h-14 bg-red-600/10 rounded-full blur-xl group-hover:bg-red-600/25 transition-all pointer-events-none" />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                /* DETAILED RULE SET VIEW */
                                <div className="space-y-3 animate-fade-in">
                                    <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex flex-wrap items-center justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                                                    {activeRuleSet.category}
                                                </span>
                                                {activeRuleSet.badge && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                                        {activeRuleSet.badge}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xs sm:text-sm font-black text-white mt-0.5 truncate">{activeRuleSet.title}</h3>
                                            <p className="text-[10px] sm:text-xs text-zinc-300 mt-0.5 line-clamp-2 leading-tight">{activeRuleSet.shortDescription}</p>
                                        </div>

                                        <button
                                            onClick={() => setActiveRuleSet(null)}
                                            className="px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-[11px] font-semibold text-zinc-200 flex items-center gap-1 transition shrink-0"
                                        >
                                            <ArrowLeft className="w-3 h-3" />
                                            Back
                                        </button>
                                    </div>

                                    {/* Rules Free View List */}
                                    <div className="space-y-2">
                                        {activeRuleSet.rules.map((item, idx) => (
                                            <div 
                                                key={item.id || idx}
                                                className="p-2.5 sm:p-3 rounded-xl bg-black/40 border border-white/10 hover:border-red-500/30 transition space-y-1.5"
                                            >
                                                <div className="flex items-start justify-between gap-1.5">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <span className="w-4 h-4 rounded bg-red-600/20 text-red-400 text-[9.5px] font-black flex items-center justify-center border border-red-500/30 shrink-0">
                                                            {idx + 1}
                                                        </span>
                                                        <h4 className="font-bold text-xs text-white truncate">{item.name}</h4>
                                                    </div>

                                                    {item.importance && (
                                                        <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider shrink-0 ${
                                                            item.importance === 'critical'
                                                                ? 'bg-red-950/80 text-red-400 border border-red-700/60'
                                                                : item.importance === 'important'
                                                                ? 'bg-amber-950/80 text-amber-400 border border-amber-700/60'
                                                                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                                                        }`}>
                                                            {item.importance}
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-[10.5px] sm:text-xs text-zinc-300 leading-tight pl-5">
                                                    {item.description}
                                                </p>

                                                {(item.penalty || item.note) && (
                                                    <div className="pl-5 pt-0.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                                                        {item.penalty && (
                                                            <span className="px-1.5 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-900/40 font-semibold flex items-center gap-1">
                                                                <AlertTriangle className="w-2.5 h-2.5 text-red-400" />
                                                                Penalty: {item.penalty}
                                                            </span>
                                                        )}
                                                        {item.note && (
                                                            <span className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 font-normal">
                                                                Note: {item.note}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* TAB 2: SYSTEM HELP & GUIDES */}
                    {mainTab === 'help' && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 animate-fade-in">
                            {/* Help Topic Navigation Column */}
                            <div className="md:col-span-4 space-y-1.5">
                                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-1 flex items-center gap-1">
                                    <Layers className="w-3 h-3 text-red-400" />
                                    <span>Help Modules</span>
                                </h3>

                                <div className="space-y-1 max-h-[180px] md:max-h-[450px] overflow-y-auto custom-scrollbar pr-1">
                                    {filteredHelpTopics.map(t => {
                                        const isSelected = selectedHelpTopicKey === t.key;
                                        return (
                                            <button
                                                key={t.key}
                                                onClick={() => setSelectedHelpTopicKey(t.key)}
                                                className={`w-full text-left p-2 rounded-lg text-xs font-semibold transition flex items-center justify-between border ${
                                                    isSelected
                                                        ? 'bg-red-600/20 text-red-400 border-red-500/50 shadow-[0_0_8px_rgba(220,38,38,0.2)]'
                                                        : 'bg-white/[0.03] text-zinc-400 border-white/10 hover:bg-white/[0.08] hover:text-white'
                                                }`}
                                            >
                                                <span className="line-clamp-1">{t.title}</span>
                                                <ChevronRight className={`w-3 h-3 shrink-0 transition-transform ${isSelected ? 'translate-x-0.5 text-red-400' : 'text-zinc-600'}`} />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Help Topic Details Column */}
                            <div className="md:col-span-8 p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-3 backdrop-blur-md">
                                <div>
                                    <h3 className="text-xs sm:text-sm font-black text-white">{selectedHelpTopic.title}</h3>
                                    <p className="text-[10.5px] sm:text-xs text-zinc-300 mt-0.5 leading-tight">{selectedHelpTopic.description}</p>
                                </div>

                                <div className="space-y-2 pt-1">
                                    {selectedHelpTopic.sections.map((sec, idx) => (
                                        <div key={idx} className="p-2.5 rounded-lg bg-black/40 border border-white/10 space-y-1">
                                            <h4 className="font-bold text-xs text-red-400 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                                {sec.heading}
                                            </h4>
                                            <div className="text-[10.5px] sm:text-xs text-zinc-300 leading-tight">
                                                {sec.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-2.5 sm:p-3 border-t border-white/10 bg-black/50 backdrop-blur-md text-center flex items-center justify-between text-xs text-zinc-500 shrink-0">
                    <span className="flex items-center gap-1 text-zinc-400 text-[10px]">
                        <Shield className="w-3 h-3 text-red-500" />
                        Tactical Rules & Operations Briefing
                    </span>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white font-medium text-xs transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

