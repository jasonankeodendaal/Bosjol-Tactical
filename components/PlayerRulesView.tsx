import React, { useState, useMemo } from 'react';
import { useData } from '../data/DataContext';
import type { TacticalRuleSet, TacticalRuleCategory } from '../types';
import { 
    BookOpen, Search, Shield, Crosshair, Target, AlertTriangle, Zap, Scale, 
    ChevronDown, ChevronUp, Printer, Info, Sparkles, Filter, ExternalLink, FileText
} from 'lucide-react';

interface PlayerRulesViewProps {
    onOpenInfoModal?: (ruleSetId?: string) => void;
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

export const PlayerRulesView: React.FC<PlayerRulesViewProps> = ({ onOpenInfoModal }) => {
    const { tacticalRules, companyDetails } = useData();
    const [selectedCategory, setSelectedCategory] = useState<'All' | TacticalRuleCategory>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedSetId, setExpandedSetId] = useState<string | null>(null);

    const adminBg = companyDetails?.adminDashboardBackgroundUrl;

    const activeRules = useMemo(() => {
        return (tacticalRules || []).filter(s => s.isActive !== false);
    }, [tacticalRules]);

    const filteredRules = useMemo(() => {
        return activeRules.filter(set => {
            const matchesCat = selectedCategory === 'All' || set.category === selectedCategory;
            const matchesQuery = !searchQuery.trim() ||
                set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                set.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                set.rules.some(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.description.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesCat && matchesQuery;
        });
    }, [activeRules, selectedCategory, searchQuery]);

    const handlePrint = () => {
        window.print();
    };

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
        <div className="relative w-full max-w-7xl mx-auto space-y-3 sm:space-y-6 animate-fade-in p-2 sm:p-4 pt-4 sm:pt-6 overflow-hidden">
            {/* Admin Background Image Overlay */}
            {adminBg && (
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay pointer-events-none -z-10 transition-opacity duration-500 rounded-3xl" 
                    style={{ backgroundImage: `url(${adminBg})` }} 
                />
            )}

            {/* 3D Depth Ambient Lighting Effects */}
            <div className="absolute top-10 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

            {/* 3D Modern Free-View Header Banner (Open layout, zero box bounds) */}
            <div className="relative p-3 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/[0.03] backdrop-blur-md border border-white/10 shadow-[0_0_30px_rgba(220,38,38,0.15)] overflow-hidden">
                {/* Subtle top edge glow */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500/60 to-transparent" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 sm:space-y-1.5 max-w-2xl min-w-0">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[9px] sm:text-xs font-bold tracking-wider uppercase">
                            <Sparkles className="w-3 h-3 shrink-0 animate-spin" />
                            <span className="truncate">Official Field Regulations</span>
                        </div>
                        
                        <h1 className="text-base sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white drop-shadow-md leading-tight">
                            Rules of Engagement & Tactical Codes
                        </h1>
                        
                        <p className="text-[10px] sm:text-xs text-zinc-300 leading-normal line-clamp-2 sm:line-clamp-none">
                            Review active tactical rule sets, FPS limits, CQB regulations, and safety protocols before entering match operations.
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
                        {onOpenInfoModal && (
                            <button
                                onClick={() => onOpenInfoModal()}
                                className="px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-[11px] sm:text-xs font-bold shadow-[0_0_15px_rgba(220,38,38,0.4)] transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
                            >
                                <img src="https://i.ibb.co/70YnGRY/image-removebg-preview-5.png" alt="Info Icon" className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0" />
                                <span>Open Info Viewer</span>
                            </button>
                        )}

                        <button
                            onClick={handlePrint}
                            className="p-1.5 sm:px-3 sm:py-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/60 text-zinc-300 hover:text-white text-[11px] sm:text-xs font-semibold transition flex items-center gap-1.5"
                            title="Print Rules"
                        >
                            <Printer className="w-3.5 h-3.5 shrink-0" />
                            <span className="hidden sm:inline">Print Rules</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar - Free-view spatial arrangement */}
            <div className="space-y-2.5 sm:space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search rule name, FPS limits, CQB, medic..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-8 py-2 sm:py-2.5 bg-white/[0.03] border border-white/10 rounded-xl sm:rounded-2xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/40 backdrop-blur-md transition"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500 hover:text-white"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Stats pill */}
                    <div className="px-3 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/10 text-[11px] sm:text-xs text-zinc-400 flex items-center justify-between sm:justify-end gap-2 shrink-0 backdrop-blur-md">
                        <span className="font-semibold text-zinc-300">{filteredRules.length} Rule Sets Available</span>
                    </div>
                </div>

                {/* Category Pills Slider */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {CATEGORIES.map(cat => {
                        const CatIcon = cat.icon;
                        const isSelected = selectedCategory === cat.name;
                        return (
                            <button
                                key={cat.name}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 border whitespace-nowrap ${
                                    isSelected
                                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500/80 shadow-[0_0_12px_rgba(220,38,38,0.4)] scale-[1.02]'
                                        : 'bg-white/[0.03] text-zinc-400 border-white/10 hover:bg-white/[0.08] hover:text-zinc-200'
                                }`}
                            >
                                <CatIcon className="w-3.5 h-3.5" />
                                <span>{cat.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* FREE VIEW 3D CARD GRID (Shrink to fit, open layout, zero heavy container boxes) */}
            {filteredRules.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 backdrop-blur-md">
                    <Shield className="w-10 h-10 mx-auto text-zinc-600 animate-pulse" />
                    <h3 className="text-sm font-bold text-zinc-300">No Rule Sets Match Your Filter</h3>
                    <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">Try clearing search terms or selecting a different rule category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
                    {filteredRules.map((set) => {
                        const IconComp = getIcon(set.icon);
                        const isExpanded = expandedSetId === set.id;

                        return (
                            <div
                                key={set.id}
                                className={`group relative rounded-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden border backdrop-blur-md ${
                                    isExpanded 
                                        ? 'bg-gradient-to-b from-zinc-900/95 via-zinc-950/95 to-black border-red-500/50 shadow-[0_0_35px_rgba(220,38,38,0.2)] col-span-2 sm:col-span-3 md:col-span-4' 
                                        : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 hover:border-red-500/40 shadow-sm hover:shadow-[0_0_20px_rgba(220,38,38,0.25)] transform hover:-translate-y-1'
                                }`}
                            >
                                {/* Subtle Top Glow Accent */}
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500/40 to-transparent group-hover:via-red-500 transition-all" />

                                <div className="p-2 sm:p-3.5 space-y-1.5 sm:space-y-2">
                                    {/* Card Header Category & Badge */}
                                    <div className="flex items-center justify-between gap-1 min-w-0">
                                        <span className="text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider text-red-400/90 truncate">
                                            {set.category}
                                        </span>
                                        {set.badge && (
                                            <span className="px-1 py-0.2 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                                                {set.badge}
                                            </span>
                                        )}
                                    </div>

                                    {/* Icon + Title */}
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shadow-[0_0_8px_rgba(220,38,38,0.2)] shrink-0">
                                            <IconComp className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        </div>
                                        <h3 className="font-black text-[11px] sm:text-xs md:text-sm text-white group-hover:text-red-400 transition-colors truncate">
                                            {set.title}
                                        </h3>
                                    </div>

                                    {/* Short Description */}
                                    <p className="text-[9.5px] sm:text-xs text-zinc-300 leading-snug line-clamp-2">
                                        {set.shortDescription}
                                    </p>

                                    {/* EXPANDED DETAILED RULES LIST */}
                                    {isExpanded && (
                                        <div className="pt-3 border-t border-white/10 space-y-2.5 animate-fade-in">
                                            <h4 className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                                                <FileText className="w-3 h-3 text-red-400" />
                                                Detailed Rule Specifications ({set.rules.length})
                                            </h4>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                                                {set.rules.map((item, idx) => (
                                                    <div 
                                                        key={item.id || idx}
                                                        className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5 hover:border-zinc-700 transition"
                                                    >
                                                        <div className="flex items-start justify-between gap-1.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="w-4 h-4 rounded bg-red-600/20 text-red-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                                                                    {idx + 1}
                                                                </span>
                                                                <h5 className="font-bold text-xs text-white">{item.name}</h5>
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

                                                        <p className="text-[11px] text-zinc-300 leading-relaxed pl-5">
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
                                                                    <span className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
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
                                </div>

                                {/* Card Bottom Actions */}
                                <div className="p-1.5 sm:p-2.5 bg-black/40 border-t border-white/5 flex items-center justify-between gap-1 text-[9px] sm:text-xs text-zinc-400">
                                    <span className="text-[8.5px] sm:text-[10px] font-medium text-zinc-500 shrink-0">
                                        {set.rules.length} Rule{set.rules.length !== 1 ? 's' : ''}
                                    </span>

                                    <div className="flex items-center gap-1 shrink-0">
                                        {onOpenInfoModal && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onOpenInfoModal(set.id);
                                                }}
                                                className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[8.5px] sm:text-[10.5px] font-semibold transition flex items-center gap-0.5"
                                                title="Open in Info Popup"
                                            >
                                                <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                <span>Popup</span>
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setExpandedSetId(isExpanded ? null : set.id)}
                                            className="px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-red-600/15 hover:bg-red-600/30 text-red-400 border border-red-500/30 font-bold text-[8.5px] sm:text-[10.5px] transition flex items-center gap-0.5"
                                        >
                                            <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                                            {isExpanded ? <ChevronUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
