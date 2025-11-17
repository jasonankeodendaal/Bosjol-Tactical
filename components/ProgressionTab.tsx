import React, { useState, useContext } from 'react';
import type { Rank, Tier, Badge, LegendaryBadge, GamificationRule, GamificationSettings } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { ShieldCheckIcon, TrophyIcon, PlusCircleIcon, PencilIcon, TrashIcon, PlusIcon, InformationCircleIcon } from './icons/Icons';
import { Modal } from './Modal';
import { UrlOrUploadField } from './UrlOrUploadField';
import { DashboardCard } from './DashboardCard';
import { DataContext } from '../data/DataContext';

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
        <div className="flex items-center gap-4 bg-zinc-800/50 p-3 rounded-lg">
            <div className="flex-grow">
                <p className="font-bold text-white">{rule.name}</p>
                <p className="text-xs text-gray-400">{rule.description}</p>
            </div>
            <div className="flex items-center gap-2">
                <p className={`font-bold text-lg w-24 text-right ${rule.xp >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {rule.xp >= 0 ? '+' : ''}{rule.xp} XP
                </p>
                <Button size="sm" variant="secondary" onClick={() => onEdit(rule)} className="!p-2"><PencilIcon className="w-4 h-4"/></Button>
                <Button size="sm" variant="danger" onClick={() => onDelete(rule)} className="!p-2"><TrashIcon className="w-4 h-4"/></Button>
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
    const [formData, setFormData] = useState({
        name: rank?.name || '',
        description: rank?.description || '',
        rankBadgeUrl: rank?.rankBadgeUrl || '',
    });

    const handleSave = () => {
        if (!formData.name) {
            alert("Rank name cannot be empty.");
            return;
        }
        const finalRank = { tiers: [], ...rank, ...formData };
        onSave(finalRank);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={rank?.id ? 'Edit Rank' : 'Create Rank'}>
            <div className="space-y-4">
                <Input label="Rank Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                <Input label="Description" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
                <UrlOrUploadField
                    label="Rank Badge"
                    fileUrl={formData.rankBadgeUrl}
                    onUrlSet={(url) => setFormData(f => ({...f, rankBadgeUrl: url}))}
                    onRemove={() => setFormData(f => ({...f, rankBadgeUrl: ''}))}
                    accept="image/*"
                />
            </div>
            <div className="mt-6">
                <Button onClick={handleSave} className="w-full">Save Rank</Button>
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
        minXp: tier?.minXp || 0,
        iconUrl: tier?.iconUrl || '',
        perks: tier?.perks?.join(', ') || '',
    });

    const currentTierIndex = allTiers.findIndex(t => t.id === tier?.id);
    const nextTier = currentTierIndex > -1 && currentTierIndex < allTiers.length - 1 ? allTiers[currentTierIndex + 1] : null;

    const handleSave = () => {
        if (!formData.name || !tier?.rankId) {
            alert("Tier Name and Rank ID are required.");
            return;
        }
        const finalTier = {
            ...tier,
            ...formData,
            perks: formData.perks.split(',').map(s => s.trim()).filter(Boolean),
            minXp: Number(formData.minXp)
        };
        onSave(finalTier);
    };
    
    return (
        <Modal isOpen={true} onClose={onClose} title={tier?.id ? 'Edit Tier' : 'Create Tier'}>
            <div className="space-y-4">
                 <Input label="Tier Name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))} />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Starts At (XP)" type="number" value={formData.minXp} onChange={e => setFormData(f => ({...f, minXp: Number(e.target.value)}))} />
                    <Input label="Ends Before (XP)" type="number" value={nextTier ? nextTier.minXp : ''} disabled placeholder="No upper limit" tooltip="This value is determined by the 'Starts At' XP of the next tier." />
                </div>
                <Input label="Perks (comma-separated)" value={formData.perks} onChange={e => setFormData(f => ({...f, perks: e.target.value}))} />
                <UrlOrUploadField
                    label="Tier Icon"
                    fileUrl={formData.iconUrl}
                    onUrlSet={(url) => setFormData(f => ({...f, iconUrl: url}))}
                    onRemove={() => setFormData(f => ({...f, iconUrl: ''}))}
                    accept="image/*"
                />
            </div>
            <div className="mt-6">
                <Button onClick={handleSave} className="w-full">Save Tier</Button>
            </div>
        </Modal>
    )
};


export const ProgressionTab: React.FC<ProgressionTabProps> = ({ 
    gamificationSettings, setGamificationSettings,
    badges, setBadges,
    legendaryBadges, setLegendaryBadges,
    ranks, setRanks,
    addDoc, updateDoc, deleteDoc 
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
    
    const allTiers = ranks.flatMap(r => r.tiers).sort((a,b) => a.minXp - b.minXp);
    const sortedRanks = [...ranks].sort((a, b) => {
        const minXpA = a.tiers.length > 0 ? Math.min(...a.tiers.map(t => t.minXp)) : Infinity;
        const minXpB = b.tiers.length > 0 ? Math.min(...b.tiers.map(t => t.minXp)) : Infinity;
        return minXpA - minXpB;
    });

    const earningRules = gamificationSettings.filter(rule => rule.xp >= 0);
    const penaltyRules = gamificationSettings.filter(rule => rule.xp < 0);
    
    return (
        <div className="space-y-6">
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

            {/* Rank Structure */}
            <DashboardCard title="Rank Structure" icon={<ShieldCheckIcon className="w-6 h-6"/>} titleAddon={<Button size="sm" onClick={() => setEditingRank({})}><PlusIcon className="w-5 h-5 mr-2" /> Add Rank</Button>}>
                 <div className="p-4 space-y-4">
                    {sortedRanks.map(rank => (
                        <div key={rank.id} className="bg-zinc-900/50 rounded-lg border border-zinc-700/50">
                            <div className="flex items-center gap-4 p-4 border-b border-zinc-800">
                                <img src={rank.rankBadgeUrl} alt={rank.name} className="w-12 h-12 flex-shrink-0" />
                                <div className="flex-grow">
                                    <h3 className="text-xl font-bold text-red-400">{rank.name}</h3>
                                    <p className="text-sm text-gray-400">{rank.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => setEditingRank(rank)} className="!p-2"><PencilIcon className="w-4 h-4"/></Button>
                                    <Button size="sm" variant="danger" onClick={() => setDeletingRank(rank)} className="!p-2"><TrashIcon className="w-4 h-4"/></Button>
                                </div>
                            </div>
                            <div className="p-4 space-y-2">
                                {(rank.tiers || []).sort((a,b) => a.minXp - b.minXp).map(tier => (
                                    <div key={tier.id} className="flex items-center gap-3 bg-zinc-800/50 p-2 rounded-md">
                                        <img src={tier.iconUrl} alt={tier.name} className="w-8 h-8"/>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-white">{tier.name}</p>
                                            <p className="text-xs text-gray-400">Starts at {tier.minXp.toLocaleString()} XP</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="secondary" onClick={() => setEditingTier({...tier, rankId: rank.id})} className="!p-2"><PencilIcon className="w-4 h-4"/></Button>
                                            <Button size="sm" variant="danger" onClick={() => setDeletingTier({...tier, rankId: rank.id})} className="!p-2"><TrashIcon className="w-4 h-4"/></Button>
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-2">
                                    <Button size="sm" variant="secondary" className="w-full" onClick={() => setEditingTier({ rankId: rank.id })}>
                                        <PlusIcon className="w-4 h-4 mr-2" />
                                        Add Tier to {rank.name}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            </DashboardCard>
            
            {/* Other sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardCard title="Gamification Settings" icon={<PlusCircleIcon className="w-6 h-6" />}>
                    <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-gray-200">XP Earning Rules</h4>
                            <Button size="sm" onClick={() => setEditingRule({})}><PlusIcon className="w-5 h-5 mr-2" /> Add Rule</Button>
                        </div>
                        <div className="space-y-2">{earningRules.map(rule => <GamificationRuleItem key={rule.id} rule={rule} onEdit={setEditingRule} onDelete={setDeletingRule} />)}</div>
                        
                        <div className="mt-6 pt-6 border-t border-zinc-800">
                            <h4 className="font-semibold text-gray-200 mb-2">XP Penalty Rules</h4>
                            <div className="space-y-2">{penaltyRules.map(rule => <GamificationRuleItem key={rule.id} rule={rule} onEdit={setEditingRule} onDelete={setDeletingRule} />)}</div>
                        </div>
                    </div>
                </DashboardCard>
                 <div className="space-y-6">
                    <DashboardCard title="Standard Badges" icon={<TrophyIcon className="w-6 h-6" />}>
                        <div className="p-4">
                            <div className="flex justify-end mb-4"><Button size="sm" onClick={() => setEditingBadge({})}><PlusIcon className="w-5 h-5 mr-2"/>Add Badge</Button></div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {badges.map(badge => (
                                    <div key={badge.id} className="flex items-center gap-3 bg-zinc-800/50 p-2 rounded-lg">
                                        <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10"/>
                                        <div className="flex-grow"><p className="font-bold text-white">{badge.name}</p><p className="text-xs text-gray-400">{badge.description}</p></div>
                                        <Button size="sm" variant="secondary" onClick={() => setEditingBadge(badge)} className="!p-2"><PencilIcon className="w-4 h-4"/></Button>
                                        <Button size="sm" variant="danger" onClick={() => setDeletingBadge(badge)} className="!p-2"><TrashIcon className="w-4 h-4"/></Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </DashboardCard>
                    <DashboardCard title="Legendary Badges" icon={<TrophyIcon className="w-6 h-6 text-amber-400" />}>
                        <div className="p-4">
                            <div className="flex justify-end mb-4"><Button size="sm" onClick={() => setEditingLegendaryBadge({})}><PlusIcon className="w-5 h-5 mr-2"/>Add Badge</Button></div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {legendaryBadges.map(badge => (
                                    <div key={badge.id} className="flex items-center gap-3 bg-zinc-800/50 p-2 rounded-lg">
                                        <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10"/>
                                        <div className="flex-grow"><p className="font-bold text-amber-300">{badge.name}</p><p className="text-xs text-gray-400">{badge.description}</p></div>
                                        <Button size="sm" variant="secondary" onClick={() => setEditingLegendaryBadge(badge)} className="!p-2"><PencilIcon className="w-4 h-4"/></Button>
                                        <Button size="sm" variant="danger" onClick={() => setDeletingLegendaryBadge(badge)} className="!p-2"><TrashIcon className="w-4 h-4"/></Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </DashboardCard>
                </div>
            </div>
        </div>
    );
};