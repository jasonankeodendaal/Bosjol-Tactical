import React, { useState, useEffect } from 'react';
import type { Rank, Tier, Badge, LegendaryBadge, GamificationRule, GamificationSettings, CompanyDetails } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { ShieldCheckIcon, TrophyIcon, PlusCircleIcon, PencilIcon, TrashIcon, PlusIcon, InformationCircleIcon, ArrowPathIcon, CodeBracketIcon, CheckCircleIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon } from './icons/Icons';
import { Modal } from './Modal';
import { UrlOrUploadField } from './UrlOrUploadField';
import { DashboardCard } from './DashboardCard';
import { DataContext } from '../data/DataContext';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveRankIcon, getRankBadgeSvg, DEFAULT_RANKS } from '../utils/rankUtils';


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

        const newMinXp = Math.max(0, Number(formData.minXp) || 0);
        let tiers: Tier[] = rank?.tiers ? [...rank.tiers] : [];

        // Auto-generate starting tiers if creating a new rank and option selected
        if (tiers.length === 0 && formData.autoGenerateTiers) {
            const count = Math.max(1, Math.min(10, formData.tierCount));
            const step = Math.max(10, formData.xpPerTier);
            
            tiers = Array.from({ length: count }, (_, idx) => {
                let tierName = `${formData.name} Level ${idx + 1}`;
                if (count === 1) {
                    tierName = formData.name;
                } else if (idx === 0) {
                    tierName = newMinXp === 0 ? 'Training' : `${formData.name} Operative`;
                } else if (idx === count - 1) {
                    tierName = `${formData.name} Master`;
                } else {
                    tierName = `${formData.name} Level ${idx}`;
                }

                return {
                    id: `tier_${Date.now()}_${idx}`,
                    name: tierName,
                    minXp: idx === 0 ? newMinXp : (newMinXp + (idx * step)),
                    perks: [idx === count - 1 ? 'Exclusive Rank Title' : 'Standard Badge'],
                    iconUrl: formData.rankBadgeUrl || '',
                };
            });
        } else if (tiers.length === 0) {
            // Default single base tier
            tiers = [{
                id: `tier_${Date.now()}_0`,
                name: formData.name,
                minXp: newMinXp,
                perks: ['Base Operator Access'],
                iconUrl: formData.rankBadgeUrl || ''
            }];
        } else {
            // Update existing tiers with the new base minXp and shift sub-tiers accordingly
            const sorted = [...tiers].sort((a, b) => a.minXp - b.minXp);
            const oldLowest = sorted.length > 0 ? sorted[0].minXp : 0;
            const diff = newMinXp - oldLowest;

            if (sorted.length === 1) {
                sorted[0] = {
                    ...sorted[0],
                    name: sorted[0].name || formData.name.trim(),
                    minXp: newMinXp,
                    iconUrl: formData.rankBadgeUrl || sorted[0].iconUrl || '',
                };
            } else {
                sorted[0] = {
                    ...sorted[0],
                    minXp: newMinXp,
                    iconUrl: formData.rankBadgeUrl || sorted[0].iconUrl || '',
                };
                if (diff !== 0) {
                    for (let i = 1; i < sorted.length; i++) {
                        sorted[i] = {
                            ...sorted[i],
                            minXp: Math.max(newMinXp + i, sorted[i].minXp + diff),
                            iconUrl: sorted[i].iconUrl || formData.rankBadgeUrl || '',
                        };
                    }
                }
            }
            tiers = sorted;
        }

        const finalRank: Omit<Rank, 'id'> | Rank = {
            ...rank,
            name: formData.name.trim(),
            description: formData.description.trim(),
            rankBadgeUrl: formData.rankBadgeUrl || '',
            minXp: newMinXp,
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
                    placeholder="e.g. Training, Rookie Level 1, Field Qualified" 
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
    rankIndex: number;
    totalRanks: number;
    allTiers: Tier[];
    onEditRank: () => void;
    onDeleteRank: () => void;
    onEditTier: (tier: Tier) => void;
    onDeleteTier: (tier: Tier) => void;
    onAddTier: (suggestedXp?: number) => void;
    onMoveRank?: (direction: 'up' | 'down') => void;
}> = ({ rank, rankIndex, totalRanks, allTiers, onEditRank, onDeleteRank, onEditTier, onDeleteTier, onAddTier, onMoveRank }) => {
    const [isOpen, setIsOpen] = useState(false);
    const sortedTiers = (rank.tiers || []).slice().sort((a,b) => a.minXp - b.minXp);
    const lowestXp = sortedTiers.length > 0 ? sortedTiers[0].minXp : (rank.minXp ?? 0);
    const highestXp = sortedTiers.length > 0 ? sortedTiers[sortedTiers.length - 1].minXp : lowestXp;
    const resolvedRankBadge = resolveRankIcon(rank.rankBadgeUrl, rank.name);

    return (
        <div className="relative group transition-all duration-300 flex flex-col justify-between p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-zinc-900/40 via-zinc-950/70 to-zinc-950/90 hover:bg-zinc-900/80 border border-zinc-800/50 hover:border-red-500/50 shadow-[0_16px_40px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.06)] hover:shadow-[0_18px_44px_rgba(220,38,38,0.2)] backdrop-blur-xl">
            {/* 3D Top Accent Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-[1px] bg-gradient-to-r from-transparent via-red-500/60 to-transparent pointer-events-none" />

            <div>
                {/* Header & Badges Row (Square & Space-Efficient Free View) */}
                <div className="flex items-start justify-between gap-2 pb-2 border-b border-zinc-800/50">
                    <div className="flex items-center gap-2 min-w-0">
                        {/* 3D Square Badge Frame */}
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-b from-zinc-800/60 to-zinc-950 border border-zinc-700/50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_6px_14px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300">
                            <img 
                                src={resolvedRankBadge} 
                                alt={rank.name} 
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(rank.name);
                                }}
                                className="w-7 h-7 sm:w-9 sm:h-9 object-contain filter drop-shadow-[0_4px_8px_rgba(239,68,68,0.45)]" 
                            />
                            <span className="absolute -bottom-0.5 -right-0.5 bg-red-600 text-[8px] text-white font-mono font-black px-1 rounded-full border border-red-400 shadow-sm">
                                {sortedTiers.length}
                            </span>
                        </div>

                        <div className="min-w-0">
                            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider group-hover:text-red-400 transition-colors truncate">
                                {rank.name}
                            </h3>
                            <div className="mt-0.5">
                                <span className="inline-block bg-red-950/80 text-red-300 border border-red-800/60 text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shadow-xs truncate">
                                    {lowestXp.toLocaleString()} XP{sortedTiers.length > 1 ? ` – ${highestXp.toLocaleString()}` : '+'}
                                </span>
                            </div>
                            <p className="text-[9px] sm:text-[10px] text-zinc-400 truncate mt-0.5 max-w-[140px] sm:max-w-none">
                                {rank.description || 'Combat Division'}
                            </p>
                        </div>
                    </div>

                    {/* Quick Tactical Action Buttons */}
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                        {onMoveRank && rankIndex > 0 && (
                            <button onClick={e => { e.stopPropagation(); onMoveRank('up'); }} className="p-1 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800/60 transition-colors" title="Move Up">
                                <ChevronUpIcon className="w-3 h-3"/>
                            </button>
                        )}
                        {onMoveRank && rankIndex < totalRanks - 1 && (
                            <button onClick={e => { e.stopPropagation(); onMoveRank('down'); }} className="p-1 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800/60 transition-colors" title="Move Down">
                                <ChevronDownIcon className="w-3 h-3"/>
                            </button>
                        )}
                        <button onClick={e => { e.stopPropagation(); onEditRank(); }} className="p-1 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800/60 transition-colors" title="Edit Rank">
                            <PencilIcon className="w-3 h-3"/>
                        </button>
                        <button onClick={e => { e.stopPropagation(); onDeleteRank(); }} className="p-1 rounded-lg bg-red-950/50 hover:bg-red-900 text-red-400 hover:text-red-200 border border-red-800/50 transition-colors" title="Delete Rank">
                            <TrashIcon className="w-3 h-3"/>
                        </button>
                    </div>
                </div>

                {/* Sub-Tier Summary Pill Grid (Shrink to Fit) */}
                <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 px-0.5">
                        <span className="uppercase tracking-wider font-semibold">Sub-Tiers ({sortedTiers.length})</span>
                        <button 
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-red-400 hover:text-red-300 transition-colors font-bold uppercase flex items-center gap-0.5"
                        >
                            <span>{isOpen ? 'Collapse' : 'Inspect'}</span>
                            <ChevronDownIcon className={`w-2.5 h-2.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Preview Mini Badges */}
                    <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
                        {sortedTiers.map((tier) => {
                            const resolvedTierIcon = resolveRankIcon(tier.iconUrl, rank.name, tier.name);
                            return (
                                <div 
                                    key={tier.id} 
                                    onClick={() => onEditTier(tier)}
                                    title={`${tier.name} (${tier.minXp.toLocaleString()} XP)`}
                                    className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/60 hover:border-red-500/60 transition-all cursor-pointer shadow-xs"
                                >
                                    <img 
                                        src={resolvedTierIcon} 
                                        alt={tier.name}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(tier.name || rank.name);
                                        }}
                                        className="w-4.5 h-4.5 sm:w-5 sm:h-5 object-contain filter drop-shadow"
                                    />
                                </div>
                            );
                        })}
                        <button 
                            onClick={() => {
                                const lastTierXp = sortedTiers.length > 0 ? sortedTiers[sortedTiers.length - 1].minXp : lowestXp;
                                onAddTier(lastTierXp + 200);
                            }}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0 flex items-center justify-center rounded-lg bg-zinc-900/40 hover:bg-red-950/60 border border-dashed border-zinc-700/60 hover:border-red-500/80 text-zinc-400 hover:text-red-300 transition-all text-xs"
                            title="Add Sub-Tier"
                        >
                            <PlusIcon className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Expandable Free-View Detail Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        key="content" 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }} 
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="mt-2.5 pt-2 border-t border-zinc-800/60 space-y-1 overflow-hidden"
                    >
                        {sortedTiers.length === 0 ? (
                            <p className="text-[10px] text-zinc-500 italic py-1 text-center">No sub-tiers yet.</p>
                        ) : (
                            sortedTiers.map((tier) => {
                                const globalIndex = allTiers.findIndex(t => t.id === tier.id);
                                const nextTierInProgression = globalIndex > -1 && globalIndex < allTiers.length - 1 ? allTiers[globalIndex + 1] : null;
                                const resolvedTierIcon = resolveRankIcon(tier.iconUrl, rank.name, tier.name);
                                
                                return (
                                    <div key={tier.id} className="flex items-center gap-1.5 p-1.5 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-800/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-colors">
                                        <img 
                                            src={resolvedTierIcon} 
                                            alt={tier.name} 
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(tier.name || rank.name);
                                            }}
                                            className="w-4.5 h-4.5 sm:w-5 sm:h-5 object-contain flex-shrink-0"
                                        />
                                        <div className="flex-grow min-w-0">
                                            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-0.5 xl:gap-1">
                                                <p className="font-bold text-white text-[9px] sm:text-[10px] xl:text-[11px] truncate leading-tight">{tier.name}</p>
                                                <span className="font-mono text-green-400 font-bold text-[7.5px] sm:text-[8px] xl:text-[9px] bg-zinc-950 px-1 py-0.2 rounded border border-green-500/20 leading-tight w-fit">
                                                    {tier.minXp.toLocaleString()} XP
                                                </span>
                                            </div>
                                            <p className="text-[7.5px] sm:text-[8px] xl:text-[9px] text-zinc-500 truncate leading-tight mt-0.5">
                                                Range: {tier.minXp.toLocaleString()} – {nextTierInProgression ? `${(nextTierInProgression.minXp - 1).toLocaleString()}` : 'MAX'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-0.5 flex-shrink-0">
                                            <button onClick={() => onEditTier(tier)} className="p-1 rounded bg-zinc-800/70 hover:bg-zinc-700 text-zinc-300 hover:text-white" title="Edit">
                                                <PencilIcon className="w-2.5 h-2.5"/>
                                            </button>
                                            <button onClick={() => onDeleteTier(tier)} className="p-1 rounded bg-red-950/60 hover:bg-red-900 text-red-400" title="Delete">
                                                <TrashIcon className="w-2.5 h-2.5"/>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <button 
                            className="w-full mt-1 py-1 text-[9px] font-bold text-zinc-300 hover:text-white bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800/60 rounded-xl flex items-center justify-center gap-1 transition-colors"
                            onClick={() => {
                                const lastTierXp = sortedTiers.length > 0 ? sortedTiers[sortedTiers.length - 1].minXp : lowestXp;
                                onAddTier(lastTierXp + 200);
                            }}
                        >
                            <PlusIcon className="w-2.5 h-2.5" />
                            <span>Add Sub-Tier</span>
                        </button>
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
        
        let updatedTiers: Tier[];
        if ('id' in tierData && tierData.id) { // Editing existing tier
            updatedTiers = (rankToUpdate.tiers || []).map(t => t.id === tierData.id ? (tierData as Tier) : t);
        } else { // Adding new tier
            const newTier = { ...tierData, id: `t_${Date.now()}` } as Tier;
            updatedTiers = [...(rankToUpdate.tiers || []), newTier];
        }

        const sorted = [...updatedTiers].sort((a,b) => a.minXp - b.minXp);
        const minRankXp = sorted.length > 0 ? sorted[0].minXp : (rankToUpdate.minXp ?? 0);
        const updatedRank = { ...rankToUpdate, minXp: minRankXp, tiers: sorted };
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

        const remainingTiers = (rankToUpdate.tiers || []).filter(t => t.id !== tierId).sort((a,b) => a.minXp - b.minXp);
        const minRankXp = remainingTiers.length > 0 ? remainingTiers[0].minXp : (rankToUpdate.minXp ?? 0);
        const updatedRank = {
            ...rankToUpdate,
            minXp: minRankXp,
            tiers: remainingTiers
        };
        
        await updateDoc('ranks', updatedRank);
        setDeletingTier(null);
    };
    
    const [isSyncingRanks, setIsSyncingRanks] = useState(false);

    const handleLoadDefaultRanks = async () => {
        if (!confirm("This will overwrite existing rank entries in your database with the complete 15-rank hierarchy (Rookie I to Legendary, with 150 sub-tiers). Do you want to load and update all pre-loaded ranks now?")) {
            return;
        }
        setIsSyncingRanks(true);
        try {
            // Delete current ranks in remote DB to prevent stale duplicate ranks
            if (ranks && ranks.length > 0) {
                for (const oldRank of ranks) {
                    await deleteDoc('ranks', oldRank.id);
                }
            }
            // Add all 15 default ranks
            for (const newRank of DEFAULT_RANKS) {
                await addDoc('ranks', newRank);
            }
            setRanks(DEFAULT_RANKS);
            alert("Success! Pre-loaded 15 rank divisions and 150 sub-tiers into your database.");
        } catch (err: any) {
            console.error("Error loading default ranks:", err);
            setRanks(DEFAULT_RANKS);
            alert(`Ranks loaded in app state. Database sync note: ${err?.message || err}`);
        } finally {
            setIsSyncingRanks(false);
        }
    };

    const handleMoveRank = async (rank: Rank, direction: 'up' | 'down') => {
        const currentIndex = sortedRanks.findIndex(r => r.id === rank.id);
        if (currentIndex === -1) return;
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= sortedRanks.length) return;

        const updatedSorted = [...sortedRanks];
        const temp = updatedSorted[currentIndex];
        updatedSorted[currentIndex] = updatedSorted[targetIndex];
        updatedSorted[targetIndex] = temp;

        setRanks(updatedSorted);

        try {
            await updateDoc('ranks', updatedSorted[currentIndex]);
            await updateDoc('ranks', updatedSorted[targetIndex]);
        } catch (e) {
            console.warn('Reorder save notice:', e);
        }
    };

    const activeRanks = ranks && ranks.length > 0 ? ranks : DEFAULT_RANKS;
    const allTiers = activeRanks.flatMap(r => r.tiers || []).sort((a,b) => a.minXp - b.minXp);
    const sortedRanks = [...activeRanks].sort((a, b) => {
        const tiersA = a.tiers || [];
        const tiersB = b.tiers || [];
        const minXpA = tiersA.length > 0 ? Math.min(...tiersA.map(t => t.minXp)) : (a.minXp ?? 0);
        const minXpB = tiersB.length > 0 ? Math.min(...tiersB.map(t => t.minXp)) : (b.minXp ?? 0);
        return minXpA - minXpB;
    });

    const earningRules = gamificationSettings.filter(rule => rule.xp >= 0);
    const penaltyRules = gamificationSettings.filter(rule => rule.xp < 0);
    
    const [showSqlGuide, setShowSqlGuide] = useState(false);
    const [copiedSql, setCopiedSql] = useState(false);

    const rankSqlSnippet = `-- SQL Seed Script for all 15 Rank Divisions & 150 Sub-Tiers
CREATE TABLE IF NOT EXISTS public.ranks (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    "rankBadgeUrl" TEXT,
    tiers JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist
ALTER TABLE public.ranks ADD COLUMN IF NOT EXISTS "rankBadgeUrl" TEXT;
ALTER TABLE public.ranks ADD COLUMN IF NOT EXISTS tiers JSONB DEFAULT '[]'::jsonb;

-- Insert or Update All 15 Preloaded Rank Divisions
INSERT INTO public.ranks (id, name, description, "rankBadgeUrl", tiers)
VALUES
${DEFAULT_RANKS.map(r => `(
    '${r.id}',
    '${r.name.replace(/'/g, "''")}',
    '${(r.description || '').replace(/'/g, "''")}',
    '${r.rankBadgeUrl || ''}',
    '${JSON.stringify(r.tiers).replace(/'/g, "''")}'::jsonb
)`).join(',\n')}
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
                        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                            <Button size="sm" onClick={() => setEditingRank({})} className="!px-3 !py-1 text-[11px]">
                                <PlusIcon className="w-3.5 h-3.5 mr-1" /> 
                                <span>Add Rank</span>
                            </Button>
                        </div>
                    </div>

                    {/* Free View 3-Column Ranks List - Shrink to fit mobile, 3-column square cards on desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
                        {sortedRanks.map((rank, rankIdx) => (
                            <RankCard 
                                key={rank.id}
                                rank={rank}
                                rankIndex={rankIdx}
                                totalRanks={sortedRanks.length}
                                allTiers={allTiers}
                                onEditRank={() => setEditingRank(rank)}
                                onDeleteRank={() => setDeletingRank(rank)}
                                onEditTier={(tier) => setEditingTier({ ...tier, rankId: rank.id })}
                                onDeleteTier={(tier) => setDeletingTier({ ...tier, rankId: rank.id })}
                                onAddTier={(suggestedXp) => setEditingTier({ rankId: rank.id, minXp: suggestedXp ?? 0 })}
                                onMoveRank={(dir) => handleMoveRank(rank, dir)}
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