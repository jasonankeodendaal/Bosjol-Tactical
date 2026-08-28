import React, { useState, useEffect } from 'react';
import type { Rank, Tier, Badge, LegendaryBadge, GamificationRule, GamificationSettings, CompanyDetails } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { ShieldCheckIcon, TrophyIcon, PlusCircleIcon, PencilIcon, TrashIcon, PlusIcon, InformationCircleIcon, ArrowPathIcon, CodeBracketIcon, CheckCircleIcon, SparklesIcon, ChevronDownIcon } from './icons/Icons';
import { Modal } from './Modal';
import { UrlOrUploadField } from './UrlOrUploadField';
import { DashboardCard } from './DashboardCard';
import { DataContext } from '../data/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveRankIcon, getRankBadgeSvg } from '../utils/rankUtils';


interface ProgressionTabProps {
    ranks: Rank[];
    setRanks: React.Dispatch<React.SetStateAction<Rank[]>>;
    badges: Badge[];
    setBadges: React.Dispatch<React.SetStateAction<Badge[]>>;
    legendaryBadges: LegendaryBadge[];
    setLegendaryBadges: React.Dispatch<React.SetStateAction<LegendaryBadge[]>>;
    gamificationSettings: GamificationSettings;
    setGamificationSettings: React.Dispatch<React.SetStateAction<GamificationSettings>>;
    addDoc: <T extends {}>(collectionName: string, data: T) => Promise<string>;
    updateDoc: <T extends { id: string; }>(collectionName: string, doc: T) => Promise<void>;
    deleteDoc: (collectionName: string, docId: string) => Promise<void>;
    companyDetails: CompanyDetails;
    setCompanyDetails: (d: CompanyDetails | ((p: CompanyDetails) => CompanyDetails)) => Promise<void>;
}

// ... (Gamification and Badge components remain the same as previous implementation)

const GamificationRuleEditorModal: React.FC<{
    rule: Partial<GamificationRule> | null,
    onClose: () => void,
    onSave: (rule: Omit<GamificationRule, 'id'> | GamificationRule) => void
}> = ({ rule, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: rule?.name || '',
        description: rule?.description || '',
        xp: rule?.xp === undefined ? 0 : rule.xp,
    });

    const handleSave = () => {
        if (!formData.name.trim() || !formData.description.trim()) {
            alert("Rule Name and Description cannot be empty.");
            return;
        }
        const finalRule = {
            ...rule,
            ...formData,
            xp: Number(formData.xp) || 0
        };
        onSave(finalRule);
        onClose();
    }

    return (
        <Modal isOpen={true} onClose={onClose} title={rule?.id ? 'Edit Gamification Rule' : 'Create Gamification Rule'}>
            <div className="space-y-4">
                <Input label="Rule Name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))} />
                <Input label="Description" value={formData.description} onChange={e => setFormData(f => ({...f, description: e.target.value}))} />
                <Input label="XP Value" type="number" value={formData.xp} onChange={e => setFormData(f => ({...f, xp: e.target.value === '' ? 0 : Number(e.target.value)}))} placeholder="e.g., 10 or -5" />
            </div>
            <div className="mt-6">
                <Button className="w-full" onClick={handleSave}>Save Rule</Button>
            </div>
        </Modal>
    );
}

const GamificationRuleItem: React.FC<{
    rule: GamificationRule,
    onEdit: (rule: GamificationRule) => void,
    onDelete: (rule: GamificationRule) => void
}> = ({ rule, onEdit, onDelete }) => {
    return (
        <div className="flex items-center gap-2 sm:gap-4 bg-transparent border-b border-zinc-800/60 p-2 sm:p-3 hover:bg-zinc-900/40 transition-colors">
            <div className="flex-grow min-w-0">
                <p className="font-bold text-white text-xs sm:text-base truncate">{rule.name}</p>
                <p className="text-[10px] sm:text-xs text-gray-400 truncate">{rule.description}</p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <p className={`font-bold text-xs sm:text-lg w-16 sm:w-24 text-right ${rule.xp >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {rule.xp >= 0 ? '+' : ''}{rule.xp} XP
                </p>
                <Button size="sm" variant="secondary" onClick={() => onEdit(rule)} className="!p-1 sm:!p-2"><PencilIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/></Button>
                <Button size="sm" variant="danger" onClick={() => onDelete(rule)} className="!p-1 sm:!p-2"><TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/></Button>
            </div>
        </div>
    );
}

const BadgeEditorModal: React.FC<{
    badge: Partial<Badge> | null,
    onClose: () => void,
    onSave: (badge: Omit<Badge, 'id'> | Badge) => void
}> = ({ badge, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: badge?.name || '',
        description: badge?.description || '',
        iconUrl: badge?.iconUrl || '',
        criteriaType: badge?.criteria?.type || 'kills',
        criteriaValue: badge?.criteria?.value || 0,
    });

    const handleSave = () => {
        const finalBadge = {
            ...badge,
            name: formData.name,
            description: formData.description,
            iconUrl: formData.iconUrl,
            criteria: {
                type: formData.criteriaType as Badge['criteria']['type'],
                value: formData.criteriaValue
            }
        };
        onSave(finalBadge);
        onClose();
    }

    return (
        <Modal isOpen={true} onClose={onClose} title={badge?.id ? 'Edit Badge' : 'Create Badge'}>
            <div className="space-y-4">
                <Input label="Badge Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                <Input label="Description" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
                <UrlOrUploadField
                    label="Badge Icon"
                    fileUrl={formData.iconUrl}
                    onUrlSet={(url) => setFormData(f => ({...f, iconUrl: url}))}
                    onRemove={() => setFormData(f => ({...f, iconUrl: ''}))}
                    accept="image/*"
                />
                <div className="grid grid-cols-2 gap-4">
                    <select value={formData.criteriaType} onChange={e => setFormData(f => ({...f, criteriaType: e.target.value as Badge['criteria']['type']}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="kills">Kills</option>
                        <option value="headshots">Headshots</option>
                        <option value="gamesPlayed">Games Played</option>
                        <option value="rank">Rank</option>
                        <option value="custom">Custom (Admin Awarded)</option>
                    </select>
                     <Input label="Criteria Value" value={formData.criteriaValue} onChange={e => setFormData(f => ({ ...f, criteriaValue: e.target.value }))} />
                </div>
            </div>
            <div className="mt-6">
                <Button onClick={handleSave} className="w-full">Save Badge</Button>
            </div>
        </Modal>
    );
}

const LegendaryBadgeEditorModal: React.FC<{
    badge: Partial<LegendaryBadge> | null,
    onClose: () => void,
    onSave: (badge: Omit<LegendaryBadge, 'id'> | LegendaryBadge) => void
}> = ({ badge, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: badge?.name || '',
        description: badge?.description || '',
        iconUrl: badge?.iconUrl || '',
        howToObtain: badge?.howToObtain || ''
    });

    const handleSave = () => {
        const finalBadge = {
            ...badge,
            ...formData,
        };
        onSave(finalBadge);
        onClose();
    }

    return (
        <Modal isOpen={true} onClose={onClose} title={badge?.id ? 'Edit Legendary Badge' : 'Create Legendary Badge'}>
            <div className="space-y-4">
                <Input label="Badge Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                <Input label="Description" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
                <Input label="How to Obtain" value={formData.howToObtain} onChange={e => setFormData(f => ({ ...f, howToObtain: e.target.value }))} />
                <UrlOrUploadField
                    label="Badge Icon"
                    fileUrl={formData.iconUrl}
                    onUrlSet={(url) => setFormData(f => ({...f, iconUrl: url}))}
                    onRemove={() => setFormData(f => ({...f, iconUrl: ''}))}
                    accept="image/*"
                />
            </div>
            <div className="mt-6">
                <Button onClick={handleSave} className="w-full">Save Badge</Button>
            </div>
        </Modal>
    );
};

const RankEditorModal: React.FC<{
    rank: Partial<Rank> | null,
    onClose: () => void,
    onSave: (rank: Omit<Rank, 'id'> | Rank) => void
}> = ({ rank, onClose, onSave }) => {
    const existingTiers = rank?.tiers || [];
    const initialMinXp = existingTiers.length > 0 ? Math.min(...existingTiers.map(t => t.minXp)) : (rank?.minXp ?? 0);
    const [formData, setFormData] = useState({
        name: rank?.name || '',
        description: rank?.description || '',
        rankBadgeUrl: rank?.rankBadgeUrl || '',
        minXp: initialMinXp,
        autoGenerateTiers: existingTiers.length === 0,
        tierCount: 5,
        xpPerTier: 200,
    });

    const handleSave = () => {
        if (!formData.name.trim()) {
            alert("Rank name cannot be empty.");
            return;
        }

        let tiers: Tier[] = rank?.tiers ? [...rank.tiers] : [];

        // Auto-generate starting tiers if creating a new rank and option selected
        if (tiers.length === 0 && formData.autoGenerateTiers) {
            const count = Math.max(1, Math.min(10, formData.tierCount));
            const step = Math.max(10, formData.xpPerTier);
            const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
            
            tiers = Array.from({ length: count }, (_, idx) => {
                const tierMinXp = formData.minXp + (idx === 0 ? 0 : 1 + (idx * step));
                return {
                    id: `tier_${Date.now()}_${idx}`,
                    name: count === 1 ? formData.name : `${formData.name} ${romanNumerals[idx] || (idx + 1)}`,
                    minXp: idx === 0 ? formData.minXp : (formData.minXp + (idx * step) + (idx > 0 && formData.minXp === 0 && idx === 1 ? 1 : 1)),
                    perks: [idx === count - 1 ? 'Exclusive Rank Title' : 'Standard Badge'],
                    iconUrl: formData.rankBadgeUrl || '',
                };
            });
        } else if (tiers.length === 0) {
            // Default single base tier
            tiers = [{
                id: `tier_${Date.now()}_0`,
                name: formData.name,
                minXp: Number(formData.minXp) || 0,
                perks: ['Base Operator Access'],
                iconUrl: formData.rankBadgeUrl || ''
            }];
        }

        const finalRank: Omit<Rank, 'id'> | Rank = {
            ...rank,
            name: formData.name.trim(),
            description: formData.description.trim(),
            rankBadgeUrl: formData.rankBadgeUrl || '',
            minXp: Number(formData.minXp) || 0,
            tiers: tiers
        };

        onSave(finalRank);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={rank?.id ? `Edit Rank: ${rank.name}` : 'Create New Rank & XP Tier Structure'}>
            <div className="space-y-4">
                <Input 
                    label="Rank Name" 
                    value={formData.name} 
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} 
                    placeholder="e.g., Rookie, Veteran, Elite, Master" 
                />
                <Input 
                    label="Description" 
                    value={formData.description} 
                    onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} 
                    placeholder="e.g., Introductory rank for new recruits starting at 0 XP" 
                />
                
                <div className="bg-zinc-800/60 p-3.5 rounded-lg border border-zinc-700/60 space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-200">Required Starting XP</label>
                        <span className="text-xs text-red-400 font-mono font-bold">{formData.minXp} XP</span>
                    </div>
                    <Input 
                        label="Starts At (XP needed to attain this rank)" 
                        type="number" 
                        value={formData.minXp} 
                        onChange={e => setFormData(f => ({ ...f, minXp: Math.max(0, parseInt(e.target.value, 10) || 0) }))} 
                        placeholder="0 for 1st Rank (e.g. 0-100 XP)" 
                        tooltip="Enter the minimum XP a player must earn to achieve this rank. For the initial starting rank (e.g. Rookie / Recruit), set this to 0."
                    />
                    <div className="text-xs text-gray-400 flex items-start gap-2 bg-zinc-900/60 p-2.5 rounded border border-zinc-800">
                        <span className="text-amber-400 font-bold">💡 Example:</span>
                        <span>
                            First rank: <strong>0 – 100 XP</strong>. Second rank: <strong>101 – 500 XP</strong>. Third rank: <strong>501 – 1,000 XP</strong>.
                        </span>
                    </div>
                </div>

                {!rank?.id && (
                    <div className="bg-zinc-800/40 p-3 rounded-lg border border-zinc-700/50 space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300 font-medium">
                            <input 
                                type="checkbox" 
                                checked={formData.autoGenerateTiers} 
                                onChange={e => setFormData(f => ({ ...f, autoGenerateTiers: e.target.checked }))} 
                                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-zinc-900 border-zinc-700"
                            />
                            <span>Auto-generate Sub-Tiers (e.g., Tier I to V)</span>
                        </label>
                        {formData.autoGenerateTiers && (
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Input 
                                    label="Number of Sub-Tiers" 
                                    type="number" 
                                    value={formData.tierCount} 
                                    onChange={e => setFormData(f => ({ ...f, tierCount: Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1)) }))} 
                                />
                                <Input 
                                    label="XP Increment per Tier" 
                                    type="number" 
                                    value={formData.xpPerTier} 
                                    onChange={e => setFormData(f => ({ ...f, xpPerTier: Math.max(10, parseInt(e.target.value, 10) || 50) }))} 
                                />
                            </div>
                        )}
                    </div>
                )}

                <UrlOrUploadField
                    label="Rank Insignia / Badge"
                    fileUrl={formData.rankBadgeUrl}
                    onUrlSet={(url) => setFormData(f => ({...f, rankBadgeUrl: url}))}
                    onRemove={() => setFormData(f => ({...f, rankBadgeUrl: ''}))}
                    accept="image/*"
                />
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save Rank Structure</Button>
            </div>
        </Modal>
    );
};

const TierEditorModal: React.FC<{
    tier: Partial<Tier & { rankId?: string }> | null,
    allTiers: Tier[],
    onClose: () => void,
    onSave: (tier: (Omit<Tier, 'id'> | Tier) & { rankId: string }) => void
}> = ({ tier, allTiers, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: tier?.name || '',
        minXp: tier?.minXp !== undefined ? tier.minXp : 0,
        iconUrl: tier?.iconUrl || '',
        perks: tier?.perks?.join(', ') || '',
    });

    const currentTierIndex = tier?.id ? allTiers.findIndex(t => t.id === tier.id) : -1;
    const nextTier = currentTierIndex > -1 && currentTierIndex < allTiers.length - 1 ? allTiers[currentTierIndex + 1] : null;

    const handleSave = () => {
        if (!formData.name.trim() || !tier?.rankId) {
            alert("Tier Name and Rank ID are required.");
            return;
        }
        const finalTier = {
            ...tier,
            name: formData.name.trim(),
            minXp: Math.max(0, Number(formData.minXp) || 0),
            perks: formData.perks.split(',').map(s => s.trim()).filter(Boolean),
            iconUrl: formData.iconUrl || '',
        };
        onSave(finalTier);
    };
    
    return (
        <Modal isOpen={true} onClose={onClose} title={tier?.id ? `Edit Tier: ${tier.name}` : 'Create Sub-Tier'}>
            <div className="space-y-4">
                <Input 
                    label="Tier Name" 
                    value={formData.name} 
                    onChange={e => setFormData(f => ({...f, name: e.target.value}))} 
                    placeholder="e.g. Rookie I, Rookie II, Level 1" 
                />
                
                <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/60 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Starts At (XP Required)" 
                            type="number" 
                            value={formData.minXp} 
                            onChange={e => setFormData(f => ({...f, minXp: Math.max(0, parseInt(e.target.value, 10) || 0)}))} 
                            placeholder="e.g., 0, 100, 201"
                            tooltip="The exact minimum XP required for a player to be promoted to this tier."
                        />
                        <Input 
                            label="Ends Before (XP)" 
                            type="text" 
                            value={nextTier ? `${nextTier.minXp.toLocaleString()} XP` : 'MAX (No upper limit)'} 
                            disabled 
                            tooltip="Calculated automatically by the 'Starts At' XP of the subsequent tier in the progression system." 
                        />
                    </div>
                    
                    <div className="flex items-center justify-between text-xs px-2 py-1.5 bg-zinc-900/80 rounded border border-zinc-800">
                        <span className="text-gray-400">Effective Active Bracket:</span>
                        <span className="font-mono font-bold text-red-400">
                            {formData.minXp.toLocaleString()} XP {nextTier ? `– ${(nextTier.minXp - 1).toLocaleString()} XP` : '+'}
                        </span>
                    </div>
                </div>

                <Input 
                    label="Perks & Rewards (comma-separated)" 
                    value={formData.perks} 
                    onChange={e => setFormData(f => ({...f, perks: e.target.value}))} 
                    placeholder="e.g., Calling Card, Weapon XP, Custom Title" 
                />
                <UrlOrUploadField
                    label="Tier Insignia / Icon"
                    fileUrl={formData.iconUrl}
                    onUrlSet={(url) => setFormData(f => ({...f, iconUrl: url}))}
                    onRemove={() => setFormData(f => ({...f, iconUrl: ''}))}
                    accept="image/*"
                />
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save Tier</Button>
            </div>
        </Modal>
    );
};

const RankCard: React.FC<{
    rank: Rank;
    allTiers: Tier[];
    onEditRank: () => void;
    onDeleteRank: () => void;
    onEditTier: (tier: Tier) => void;
    onDeleteTier: (tier: Tier) => void;
    onAddTier: (suggestedXp?: number) => void;
}> = ({ rank, allTiers, onEditRank, onDeleteRank, onEditTier, onDeleteTier, onAddTier }) => {
    const [isOpen, setIsOpen] = useState(false);
    const sortedTiers = (rank.tiers || []).slice().sort((a,b) => a.minXp - b.minXp);
    const lowestXp = sortedTiers.length > 0 ? sortedTiers[0].minXp : (rank.minXp ?? 0);
    const highestXp = sortedTiers.length > 0 ? sortedTiers[sortedTiers.length - 1].minXp : lowestXp;
    const resolvedRankBadge = resolveRankIcon(rank.rankBadgeUrl, rank.name);

    return (
        <div className="border-b border-zinc-800/70 pb-3 mb-2 transition-colors">
            <div 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex items-center gap-2 sm:gap-4 p-1.5 sm:p-3 cursor-pointer hover:bg-zinc-900/40 rounded-xl transition-all group"
            >
                <div className="relative flex-shrink-0">
                    <img 
                        src={resolvedRankBadge} 
                        alt={rank.name} 
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(rank.name);
                        }}
                        className="w-10 h-10 sm:w-16 sm:h-16 object-contain filter drop-shadow-[0_0_12px_rgba(239,68,68,0.35)] transition-transform group-hover:scale-105" 
                    />
                    <span className="absolute -bottom-1 -right-1 bg-red-600 text-[8px] sm:text-[10px] text-white font-mono font-bold px-1 py-0.2 rounded-full border border-red-400/60 shadow">
                        {sortedTiers.length}
                    </span>
                </div>

                <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider group-hover:text-red-400 transition-colors truncate">
                            {rank.name}
                        </h3>
                        <span className="bg-red-950/60 text-red-300 border border-red-800/40 text-[9px] sm:text-xs font-mono font-bold px-1.5 py-0.2 rounded truncate">
                            {lowestXp.toLocaleString()} XP{sortedTiers.length > 1 ? ` – ${highestXp.toLocaleString()} XP` : '+'}
                        </span>
                    </div>
                    <p className="text-[10px] sm:text-xs text-zinc-400 truncate mt-0.5">{rank.description || 'No description'}</p>
                </div>

                <div className="flex gap-1 items-center flex-shrink-0">
                    <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); onEditRank(); }} className="!p-1 sm:!p-1.5" title="Edit Rank">
                        <PencilIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300"/>
                    </Button>
                    <Button size="sm" variant="danger" onClick={(e) => { e.stopPropagation(); onDeleteRank(); }} className="!p-1 sm:!p-1.5" title="Delete Rank">
                        <TrashIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
                    </Button>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="ml-1 text-zinc-500 group-hover:text-zinc-300">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </motion.div>
                </div>
            </div>
            
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        key="content" 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }} 
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="mt-2 pl-2 sm:pl-6 space-y-1.5"
                    >
                        <div className="flex justify-between items-center px-1 text-[10px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            <span>Sub-Tiers & Details</span>
                            <span className="font-mono text-zinc-500">XP Thresholds</span>
                        </div>

                        {sortedTiers.length === 0 ? (
                            <p className="text-xs text-zinc-500 italic py-2 text-center">No sub-tiers configured. Click "Add Sub-Tier" below.</p>
                        ) : (
                            sortedTiers.map((tier) => {
                                const globalIndex = allTiers.findIndex(t => t.id === tier.id);
                                const nextTierInProgression = globalIndex > -1 && globalIndex < allTiers.length - 1 ? allTiers[globalIndex + 1] : null;
                                const resolvedTierIcon = resolveRankIcon(tier.iconUrl, rank.name, tier.name);
                                
                                return (
                                    <div key={tier.id} className="flex items-center gap-2 sm:gap-3 bg-zinc-900/30 p-2 rounded-r-lg border-l-2 border-red-500/80 hover:bg-zinc-900/70 transition-all">
                                        <img 
                                            src={resolvedTierIcon} 
                                            alt={tier.name} 
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(tier.name || rank.name);
                                            }}
                                            className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0 drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]"
                                        />
                                        <div className="flex-grow min-w-0">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <p className="font-bold text-white text-xs sm:text-sm truncate">{tier.name}</p>
                                                <span className="bg-zinc-800/90 text-green-400 font-mono text-[9px] sm:text-[11px] font-bold px-1.5 py-0.2 rounded border border-green-500/20">
                                                    {tier.minXp.toLocaleString()} XP
                                                </span>
                                            </div>
                                            <div className="text-[9px] sm:text-xs text-zinc-400 truncate mt-0.5">
                                                <span>Range: {tier.minXp.toLocaleString()} – {nextTierInProgression ? `${(nextTierInProgression.minXp - 1).toLocaleString()} XP` : 'MAX'}</span>
                                                {tier.perks && tier.perks.length > 0 && (
                                                    <span className="text-zinc-500 ml-1.5 hidden sm:inline">• {tier.perks.join(', ')}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                            <Button size="sm" variant="secondary" onClick={() => onEditTier(tier)} className="!p-1 sm:!p-1.5" title="Edit Tier XP">
                                                <PencilIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => onDeleteTier(tier)} className="!p-1 sm:!p-1.5" title="Delete Tier">
                                                <TrashIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        <div className="pt-1">
                            <Button 
                                size="sm" 
                                variant="secondary" 
                                className="w-full !py-1.5 text-[10px] sm:text-xs font-semibold" 
                                onClick={() => {
                                    const lastTierXp = sortedTiers.length > 0 ? sortedTiers[sortedTiers.length - 1].minXp : lowestXp;
                                    onAddTier(lastTierXp + 200);
                                }}
                            >
                                <PlusIcon className="w-3.5 h-3.5 mr-1" />
                                Add Sub-Tier Threshold
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


export const ProgressionTab: React.FC<ProgressionTabProps> = ({ 
    gamificationSettings, setGamificationSettings,
    badges, setBadges,
    legendaryBadges, setLegendaryBadges,
    ranks, setRanks,
    addDoc, updateDoc, deleteDoc,
    companyDetails, setCompanyDetails
}) => {
    const [editingRule, setEditingRule] = useState<Partial<GamificationRule> | null>(null);
    const [deletingRule, setDeletingRule] = useState<GamificationRule | null>(null);
    
    const [editingBadge, setEditingBadge] = useState<Partial<Badge> | null>(null);
    const [deletingBadge, setDeletingBadge] = useState<Badge | null>(null);

    const [editingLegendaryBadge, setEditingLegendaryBadge] = useState<Partial<LegendaryBadge> | null>(null);
    const [deletingLegendaryBadge, setDeletingLegendaryBadge] = useState<LegendaryBadge | null>(null);

    const [editingRank, setEditingRank] = useState<Partial<Rank> | null>(null);
    const [deletingRank, setDeletingRank] = useState<Rank | null>(null);

    const [editingTier, setEditingTier] = useState<Partial<Tier & { rankId: string }> | null>(null);
    const [deletingTier, setDeletingTier] = useState<(Tier & { rankId: string }) | null>(null);
    
    const [activeSection, setActiveSection] = useState<'ranks' | 'badges' | 'rules' | 'reset'>('ranks');
    const [sectionMenuOpen, setSectionMenuOpen] = useState(false);
    const [resetDate, setResetDate] = useState(companyDetails.nextRankResetDate || '');
    
    useEffect(() => {
        setResetDate(companyDetails.nextRankResetDate || '');
    }, [companyDetails.nextRankResetDate]);

    const handleSetDate = async () => {
        if (resetDate && new Date(resetDate) <= new Date()) {
            alert("Reset date must be in the future.");
            return;
        }
        if (confirm(`Are you sure you want to set the rank reset to occur on ${resetDate || 'an unset date'}? This will clear the date if empty.`)) {
            await setCompanyDetails(prev => ({ ...prev, nextRankResetDate: resetDate }));
            alert("Reset date has been set.");
        }
    };
    
    // Handlers
    const handleSaveRule = async (rule: Omit<GamificationRule, 'id'> | GamificationRule) => { 
        setEditingRule(null);
        'id' in rule ? await updateDoc('gamificationSettings', rule) : await addDoc('gamificationSettings', rule); 
    };
    const handleDeleteRule = async () => { if (deletingRule) { await deleteDoc('gamificationSettings', deletingRule.id); setDeletingRule(null); } };
    
    const handleSaveBadge = async (badge: Omit<Badge, 'id'> | Badge) => { 
        setEditingBadge(null);
        'id' in badge ? await updateDoc('badges', badge) : await addDoc('badges', badge);
    }
    const handleDeleteBadge = async () => { if (deletingBadge) { await deleteDoc('badges', deletingBadge.id); setDeletingBadge(null); } }

    const handleSaveLegendaryBadge = async (badge: Omit<LegendaryBadge, 'id'> | LegendaryBadge) => { 
        setEditingLegendaryBadge(null);
        'id' in badge ? await updateDoc('legendaryBadges', badge) : await addDoc('legendaryBadges', badge);
    }
    const handleDeleteLegendaryBadge = async () => { if (deletingLegendaryBadge) { await deleteDoc('legendaryBadges', deletingLegendaryBadge.id); setDeletingLegendaryBadge(null); } }

    const handleSaveRank = async (rank: Omit<Rank, 'id'> | Rank) => { 
        setEditingRank(null);
        'id' in rank ? await updateDoc('ranks', rank) : await addDoc('ranks', rank);
    }
    const handleDeleteRank = async () => { 
        if (!deletingRank) return;
        await deleteDoc('ranks', deletingRank.id); 
        setDeletingRank(null); 
    }

    const handleSaveTier = async (tier: (Omit<Tier, 'id'> | Tier) & { rankId: string }) => {
        setEditingTier(null); // Optimistic close
        const { rankId, ...tierData } = tier;
        const rankToUpdate = ranks.find(r => r.id === rankId);
        if (!rankToUpdate) {
            console.error(`Could not find Rank with ID ${rankId} to save tier.`);
            return;
        }
        
        let updatedTiers;
        if ('id' in tierData && tierData.id) { // Editing existing tier
            updatedTiers = rankToUpdate.tiers.map(t => t.id === tierData.id ? (tierData as Tier) : t);
        } else { // Adding new tier
            const newTier = { ...tierData, id: `t_${Date.now()}` } as Tier;
            updatedTiers = [...(rankToUpdate.tiers || []), newTier];
        }

        const updatedRank = { ...rankToUpdate, tiers: updatedTiers };
        await updateDoc('ranks', updatedRank);
    };

    const handleDeleteTier = async () => {
        if (!deletingTier) return;
        const { rankId, id: tierId } = deletingTier;
        
        const rankToUpdate = ranks.find(r => r.id === rankId);
        if (!rankToUpdate) {
            console.error(`Could not find Rank with ID ${rankId} to delete tier.`);
            setDeletingTier(null);
            return;
        }

        const updatedRank = {
            ...rankToUpdate,
            tiers: rankToUpdate.tiers.filter(t => t.id !== tierId)
        };
        
        await updateDoc('ranks', updatedRank);
        setDeletingTier(null);
    };
    
    const allTiers = ranks.flatMap(r => r.tiers || []).sort((a,b) => a.minXp - b.minXp);
    const sortedRanks = [...ranks].sort((a, b) => {
        const tiersA = a.tiers || [];
        const tiersB = b.tiers || [];
        const minXpA = tiersA.length > 0 ? Math.min(...tiersA.map(t => t.minXp)) : Infinity;
        const minXpB = tiersB.length > 0 ? Math.min(...tiersB.map(t => t.minXp)) : Infinity;
        return minXpA - minXpB;
    });

    const earningRules = gamificationSettings.filter(rule => rule.xp >= 0);
    const penaltyRules = gamificationSettings.filter(rule => rule.xp < 0);
    
    const [showSqlGuide, setShowSqlGuide] = useState(false);
    const [copiedSql, setCopiedSql] = useState(false);

    const rankSqlSnippet = `-- 1. Ensure ranks table has all required columns including updated_at, created_at, and tiers jsonb
CREATE TABLE IF NOT EXISTS public.ranks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    "rankBadgeUrl" TEXT,
    tiers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure existing ranks tables have the updated_at & created_at columns if they were created earlier without them
ALTER TABLE public.ranks ADD COLUMN IF NOT EXISTS "rankBadgeUrl" TEXT;
ALTER TABLE public.ranks ADD COLUMN IF NOT EXISTS tiers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.ranks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.ranks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Insert or update Ranks with custom XP brackets
INSERT INTO public.ranks (id, name, description, "rankBadgeUrl", tiers)
VALUES
(
    'rank_rookie', 
    'Rookie', 
    'Introductory rank for new operators (0 to 100 XP).',
    '',
    '[
        {"id": "r_i", "name": "Rookie I", "minXp": 0, "perks": ["Basic Calling Card"], "iconUrl": ""},
        {"id": "r_ii", "name": "Rookie II", "minXp": 25, "perks": ["Calling Card"], "iconUrl": ""},
        {"id": "r_iii", "name": "Rookie III", "minXp": 50, "perks": ["Custom Banner"], "iconUrl": ""},
        {"id": "r_iv", "name": "Rookie IV", "minXp": 75, "perks": ["Weapon XP Card"], "iconUrl": ""},
        {"id": "r_v", "name": "Rookie V", "minXp": 100, "perks": ["Credits Reward"], "iconUrl": ""}
    ]'::jsonb
),
(
    'rank_vet', 
    'Veteran', 
    'Experienced operators with proven battlefield record (101 to 500 XP).',
    '',
    '[
        {"id": "v_i", "name": "Veteran I", "minXp": 101, "perks": ["Weapon XP Card"], "iconUrl": ""},
        {"id": "v_ii", "name": "Veteran II", "minXp": 200, "perks": ["Custom Banner"], "iconUrl": ""},
        {"id": "v_iii", "name": "Veteran III", "minXp": 300, "perks": ["Credits Reward"], "iconUrl": ""},
        {"id": "v_iv", "name": "Veteran IV", "minXp": 400, "perks": ["Weapon XP Card"], "iconUrl": ""},
        {"id": "v_v", "name": "Veteran V", "minXp": 500, "perks": ["Exclusive Skin"], "iconUrl": ""}
    ]'::jsonb
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    "rankBadgeUrl" = EXCLUDED."rankBadgeUrl",
    tiers = EXCLUDED.tiers,
    updated_at = NOW();`;

    const handleCopySql = () => {
        navigator.clipboard.writeText(rankSqlSnippet);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 2500);
    };

    return (
        <div className="w-full max-w-full overflow-hidden space-y-4 sm:space-y-6">
            {/* Modals */}
            {editingRule && <GamificationRuleEditorModal rule={editingRule} onClose={() => setEditingRule(null)} onSave={handleSaveRule} />}
            {deletingRule && <Modal isOpen={true} onClose={() => setDeletingRule(null)} title="Confirm Deletion"><p>Delete "{deletingRule.name}"?</p><div className="flex justify-end gap-4 mt-6"><Button variant="secondary" onClick={() => setDeletingRule(null)}>Cancel</Button><Button variant="danger" onClick={handleDeleteRule}>Delete</Button></div></Modal>}
            {editingBadge && <BadgeEditorModal badge={editingBadge} onClose={() => setEditingBadge(null)} onSave={handleSaveBadge} />}
            {deletingBadge && <Modal isOpen={true} onClose={() => setDeletingBadge(null)} title="Confirm Deletion"><p>Delete "{deletingBadge.name}"?</p><div className="flex justify-end gap-4 mt-6"><Button variant="secondary" onClick={() => setDeletingBadge(null)}>Cancel</Button><Button variant="danger" onClick={handleDeleteBadge}>Delete</Button></div></Modal>}
            {editingLegendaryBadge && <LegendaryBadgeEditorModal badge={editingLegendaryBadge} onClose={() => setEditingLegendaryBadge(null)} onSave={handleSaveLegendaryBadge} />}
            {deletingLegendaryBadge && <Modal isOpen={true} onClose={() => setDeletingLegendaryBadge(null)} title="Confirm Deletion"><p>Delete "{deletingLegendaryBadge.name}"?</p><div className="flex justify-end gap-4 mt-6"><Button variant="secondary" onClick={() => setDeletingLegendaryBadge(null)}>Cancel</Button><Button variant="danger" onClick={handleDeleteLegendaryBadge}>Delete</Button></div></Modal>}
            {editingRank && <RankEditorModal rank={editingRank} onClose={() => setEditingRank(null)} onSave={handleSaveRank} />}
            {deletingRank && <Modal isOpen={true} onClose={() => setDeletingRank(null)} title="Confirm Deletion"><p>Delete "{deletingRank.name}" rank and all its tiers?</p><div className="flex justify-end gap-4 mt-6"><Button variant="secondary" onClick={() => setDeletingRank(null)}>Cancel</Button><Button variant="danger" onClick={handleDeleteRank}>Delete</Button></div></Modal>}
            {editingTier && <TierEditorModal tier={editingTier} allTiers={allTiers} onClose={() => setEditingTier(null)} onSave={handleSaveTier} />}
            {deletingTier && <Modal isOpen={true} onClose={() => setDeletingTier(null)} title="Confirm Deletion"><p>Delete "{deletingTier.name}" tier?</p><div className="flex justify-end gap-4 mt-6"><Button variant="secondary" onClick={() => setDeletingTier(null)}>Cancel</Button><Button variant="danger" onClick={handleDeleteTier}>Delete</Button></div></Modal>}

            {/* Navigation Tabs (Mobile Dropdown & Desktop Tabs) */}
            <div className="sm:hidden relative border-b border-zinc-800/80 pb-3">
                <button
                    onClick={() => setSectionMenuOpen(!sectionMenuOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-md"
                >
                    <div className="flex items-center gap-2">
                        {activeSection === 'ranks' && <ShieldCheckIcon className="w-4 h-4 text-red-500" />}
                        {activeSection === 'badges' && <TrophyIcon className="w-4 h-4 text-amber-500" />}
                        {activeSection === 'rules' && <PlusCircleIcon className="w-4 h-4 text-blue-500" />}
                        {activeSection === 'reset' && <ArrowPathIcon className="w-4 h-4 text-emerald-500" />}
                        <span>
                            {activeSection === 'ranks' && `Ranks (${ranks.length})`}
                            {activeSection === 'badges' && `Badges (${badges.length + legendaryBadges.length})`}
                            {activeSection === 'rules' && `XP Rules (${gamificationSettings.length})`}
                            {activeSection === 'reset' && 'Season Reset'}
                        </span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${sectionMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {sectionMenuOpen && (
                    <>
                        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" onClick={() => setSectionMenuOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1.5 space-y-0.5">
                            <button
                                onClick={() => { setActiveSection('ranks'); setSectionMenuOpen(false); }}
                                className={`w-full text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors ${
                                    activeSection === 'ranks' ? 'bg-red-600/20 text-red-400 border-l-2 border-red-500 font-extrabold' : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                                }`}
                            >
                                <ShieldCheckIcon className="w-4 h-4 text-red-400" />
                                <span>Ranks ({ranks.length})</span>
                            </button>
                            <button
                                onClick={() => { setActiveSection('badges'); setSectionMenuOpen(false); }}
                                className={`w-full text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors ${
                                    activeSection === 'badges' ? 'bg-red-600/20 text-red-400 border-l-2 border-red-500 font-extrabold' : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                                }`}
                            >
                                <TrophyIcon className="w-4 h-4 text-amber-400" />
                                <span>Badges ({badges.length + legendaryBadges.length})</span>
                            </button>
                            <button
                                onClick={() => { setActiveSection('rules'); setSectionMenuOpen(false); }}
                                className={`w-full text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors ${
                                    activeSection === 'rules' ? 'bg-red-600/20 text-red-400 border-l-2 border-red-500 font-extrabold' : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                                }`}
                            >
                                <PlusCircleIcon className="w-4 h-4 text-blue-400" />
                                <span>XP Rules ({gamificationSettings.length})</span>
                            </button>
                            <button
                                onClick={() => { setActiveSection('reset'); setSectionMenuOpen(false); }}
                                className={`w-full text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors ${
                                    activeSection === 'reset' ? 'bg-red-600/20 text-red-400 border-l-2 border-red-500 font-extrabold' : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                                }`}
                            >
                                <ArrowPathIcon className="w-4 h-4 text-emerald-400" />
                                <span>Season Reset</span>
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 pb-1 border-b border-zinc-800/80">
                <button 
                    onClick={() => setActiveSection('ranks')}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        activeSection === 'ranks' 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                    <ShieldCheckIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Ranks ({ranks.length})</span>
                </button>
                <button 
                    onClick={() => setActiveSection('badges')}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        activeSection === 'badges' 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                    <TrophyIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Badges ({badges.length + legendaryBadges.length})</span>
                </button>
                <button 
                    onClick={() => setActiveSection('rules')}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        activeSection === 'rules' 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                    <PlusCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>XP Rules ({gamificationSettings.length})</span>
                </button>
                <button 
                    onClick={() => setActiveSection('reset')}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        activeSection === 'reset' 
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/30' 
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                    <ArrowPathIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Season Reset</span>
                </button>
            </div>

            {/* SECTION 1: RANKS FREE VIEW */}
            {activeSection === 'ranks' && (
                <div className="space-y-4">
                    {/* Free View Header Bar without heavy boxed container */}
                    <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-zinc-800/60">
                        <div>
                            <h2 className="text-base sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <ShieldCheckIcon className="w-5 h-5 text-red-500" />
                                <span>Rank Badges & Tiers</span>
                            </h2>
                            <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                                Clean, free view of operator progression badges and tier brackets.
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                            <Button size="sm" variant="secondary" onClick={() => setShowSqlGuide(!showSqlGuide)} className="!px-2.5 !py-1 text-[11px]">
                                <CodeBracketIcon className="w-3.5 h-3.5 mr-1" />
                                <span>{showSqlGuide ? 'Hide SQL' : 'SQL'}</span>
                            </Button>
                            <Button size="sm" onClick={() => setEditingRank({})} className="!px-3 !py-1 text-[11px]">
                                <PlusIcon className="w-3.5 h-3.5 mr-1" /> 
                                <span>Add Rank</span>
                            </Button>
                        </div>
                    </div>

                    {/* SQL Guide Dropdown */}
                    {showSqlGuide && (
                        <div className="p-3 bg-zinc-950/90 rounded-xl border border-zinc-800 space-y-2 shadow-xl">
                            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                                <span className="text-xs font-bold text-white">Database Seed Script</span>
                                <Button size="sm" variant="secondary" onClick={handleCopySql} className="!py-0.5 !px-2 text-[10px]">
                                    {copiedSql ? 'Copied!' : 'Copy SQL'}
                                </Button>
                            </div>
                            <pre className="text-[10px] font-mono text-zinc-300 overflow-x-auto p-2 bg-black/60 rounded border border-zinc-800/70">
                                <code>{rankSqlSnippet}</code>
                            </pre>
                        </div>
                    )}

                    {/* Free View Ranks List - Shrink to fit mobile without rigid containers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {sortedRanks.map(rank => (
                            <RankCard 
                                key={rank.id}
                                rank={rank}
                                allTiers={allTiers}
                                onEditRank={() => setEditingRank(rank)}
                                onDeleteRank={() => setDeletingRank(rank)}
                                onEditTier={(tier) => setEditingTier({ ...tier, rankId: rank.id })}
                                onDeleteTier={(tier) => setDeletingTier({ ...tier, rankId: rank.id })}
                                onAddTier={(suggestedXp) => setEditingTier({ rankId: rank.id, minXp: suggestedXp ?? 0 })}
                            />
                        ))}
                    </div>

                    {sortedRanks.length === 0 && (
                        <div className="text-center py-12 text-zinc-500">
                            <ShieldCheckIcon className="w-12 h-12 mx-auto text-zinc-700 mb-2" />
                            <p className="font-bold text-white text-sm">No Ranks Configured</p>
                            <p className="text-xs text-zinc-500 mt-1">Click "Add Rank" above to establish your progression hierarchy.</p>
                        </div>
                    )}
                </div>
            )}

            {/* SECTION 2: BADGES FREE VIEW */}
            {activeSection === 'badges' && (
                <div className="space-y-6">
                    {/* Standard Badges Free Flow */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
                            <div className="flex items-center gap-2">
                                <TrophyIcon className="w-5 h-5 text-red-500" />
                                <h3 className="text-sm sm:text-lg font-bold text-white uppercase tracking-wider">Standard Badges</h3>
                            </div>
                            <Button size="sm" onClick={() => setEditingBadge({})} className="!px-2.5 !py-1 text-[11px]">
                                <PlusIcon className="w-3.5 h-3.5 mr-1"/> Add Badge
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {badges.map(badge => (
                                <div key={badge.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900/80 transition-all">
                                    {badge.iconUrl && badge.iconUrl.trim() !== '' ? (
                                        <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10 object-contain flex-shrink-0 drop-shadow-[0_0_8px_rgba(239,68,68,0.3)]"/>
                                    ) : (
                                        <TrophyIcon className="w-10 h-10 text-red-500 flex-shrink-0" />
                                    )}
                                    <div className="flex-grow min-w-0">
                                        <p className="font-bold text-white text-xs sm:text-sm truncate">{badge.name}</p>
                                        <p className="text-[10px] text-zinc-400 truncate">{badge.description}</p>
                                        <span className="inline-block mt-1 text-[9px] font-mono text-red-400 bg-red-950/40 px-1.5 py-0.2 rounded border border-red-800/30">
                                            {badge.criteria?.type}: {badge.criteria?.value}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1 flex-shrink-0">
                                        <Button size="sm" variant="secondary" onClick={() => setEditingBadge(badge)} className="!p-1"><PencilIcon className="w-3.5 h-3.5"/></Button>
                                        <Button size="sm" variant="danger" onClick={() => setDeletingBadge(badge)} className="!p-1"><TrashIcon className="w-3.5 h-3.5"/></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Legendary Badges Free Flow */}
                    <div className="space-y-3 pt-4 border-t border-zinc-800/80">
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
                            <div className="flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5 text-amber-400" />
                                <h3 className="text-sm sm:text-lg font-bold text-amber-400 uppercase tracking-wider">Legendary Badges</h3>
                            </div>
                            <Button size="sm" onClick={() => setEditingLegendaryBadge({})} className="!px-2.5 !py-1 text-[11px] !bg-amber-600 hover:!bg-amber-500">
                                <PlusIcon className="w-3.5 h-3.5 mr-1"/> Add Legendary
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {legendaryBadges.map(badge => (
                                <div key={badge.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-amber-500/30 bg-amber-950/10 hover:bg-amber-950/30 transition-all">
                                    {badge.iconUrl && badge.iconUrl.trim() !== '' ? (
                                        <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10 object-contain flex-shrink-0 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]"/>
                                    ) : (
                                        <SparklesIcon className="w-10 h-10 text-amber-400 flex-shrink-0" />
                                    )}
                                    <div className="flex-grow min-w-0">
                                        <p className="font-bold text-amber-300 text-xs sm:text-sm truncate">{badge.name}</p>
                                        <p className="text-[10px] text-zinc-400 truncate">{badge.description}</p>
                                        {badge.howToObtain && (
                                            <p className="text-[9px] text-amber-400/80 italic truncate mt-0.5">{badge.howToObtain}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 flex-shrink-0">
                                        <Button size="sm" variant="secondary" onClick={() => setEditingLegendaryBadge(badge)} className="!p-1"><PencilIcon className="w-3.5 h-3.5"/></Button>
                                        <Button size="sm" variant="danger" onClick={() => setDeletingLegendaryBadge(badge)} className="!p-1"><TrashIcon className="w-3.5 h-3.5"/></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 3: XP RULES FREE VIEW */}
            {activeSection === 'rules' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/60">
                        <div className="flex items-center gap-2">
                            <PlusCircleIcon className="w-5 h-5 text-red-500" />
                            <h3 className="text-sm sm:text-lg font-bold text-white uppercase tracking-wider">XP Gamification Rules</h3>
                        </div>
                        <Button size="sm" onClick={() => setEditingRule({})} className="!px-2.5 !py-1 text-[11px]">
                            <PlusIcon className="w-3.5 h-3.5 mr-1"/> Add Rule
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Earning Rules */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider">XP Earning Rules</h4>
                            <div className="space-y-1">
                                {earningRules.map(rule => (
                                    <GamificationRuleItem key={rule.id} rule={rule} onEdit={setEditingRule} onDelete={setDeletingRule} />
                                ))}
                            </div>
                        </div>

                        {/* Penalty Rules */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">XP Penalty Rules</h4>
                            <div className="space-y-1">
                                {penaltyRules.map(rule => (
                                    <GamificationRuleItem key={rule.id} rule={rule} onEdit={setEditingRule} onDelete={setDeletingRule} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 4: SEASONAL RESET FREE VIEW */}
            {activeSection === 'reset' && (
                <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/30 space-y-4 max-w-xl">
                    <div className="flex items-center gap-2">
                        <ArrowPathIcon className="w-5 h-5 text-red-500" />
                        <h3 className="text-sm sm:text-lg font-bold text-white uppercase tracking-wider">Seasonal Rank Reset</h3>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        Set a scheduled date to reset all operators' Rank Points (XP) and active Rank back to baseline tier. 
                        Legendary Badges and permanent match counts will not be modified.
                    </p>
                    <div className="space-y-3 pt-2">
                        <Input
                            label="Next Reset Date"
                            type="date"
                            value={resetDate}
                            onChange={e => setResetDate(e.target.value)}
                            min={new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]}
                        />
                        <Button 
                            onClick={handleSetDate} 
                            className="w-full !py-2 text-xs font-bold" 
                            disabled={resetDate === (companyDetails.nextRankResetDate || '')}
                        >
                            {companyDetails.nextRankResetDate ? 'Update Reset Date' : 'Set Reset Date'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};