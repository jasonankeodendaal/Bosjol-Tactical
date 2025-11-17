


import React, { useState, useContext } from 'react';
// FIX: The types 'Rank' and 'Tier' do not exist. The correct types are 'RankTier' and 'SubRank'.
// The component logic has been refactored to use the correct nested data structure.
import type { RankTier, SubRank, Badge, LegendaryBadge, GamificationRule, GamificationSettings } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { ShieldCheckIcon, TrophyIcon, PlusCircleIcon, PencilIcon, TrashIcon, PlusIcon, XIcon, InformationCircleIcon } from './icons/Icons';
import { Modal } from './Modal';
import { UrlOrUploadField } from './UrlOrUploadField';
import { DashboardCard } from './DashboardCard';
import { DataContext } from '../data/DataContext';


interface ProgressionTabProps {
    rankTiers: RankTier[];
    setRankTiers: React.Dispatch<React.SetStateAction<RankTier[]>>;
    badges: Badge[];
    setBadges: React.Dispatch<React.SetStateAction<Badge[]>>;
    legendaryBadges: LegendaryBadge[];
    setLegendaryBadges: React.Dispatch<React.SetStateAction<LegendaryBadge[]>>;
    gamificationSettings: GamificationSettings;
    setGamificationSettings: React.Dispatch<React.SetStateAction<GamificationSettings>>;
    addDoc: <T extends {}>(collectionName: string, data: T) => Promise<void>;
    updateDoc: <T extends { id: string; }>(collectionName: string, doc: T) => Promise<void>;
    deleteDoc: (collectionName: string, docId: string) => Promise<void>;
}

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

const TierEditorModal: React.FC<{
    tier: Partial<RankTier> | null,
    onClose: () => void,
    onSave: (tier: Omit<RankTier, 'id'> | RankTier) => void
}> = ({ tier, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: tier?.name || '',
        description: tier?.description || '',
        tierBadgeUrl: tier?.tierBadgeUrl || '',
    });

    const handleSave = () => {
        if (!formData.name) {
            alert("Tier name cannot be empty.");
            return;
        }
        const finalTier = { subranks: [], ...tier, ...formData };
        onSave(finalTier);
        onClose();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={tier?.id ? 'Edit Tier' : 'Create Tier'}>
            <div className="space-y-4">
                <Input label="Tier Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                <Input label="Description" value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} />
                <UrlOrUploadField
                    label="Tier Badge"
                    fileUrl={formData.tierBadgeUrl}
                    onUrlSet={(url) => setFormData(f => ({...f, tierBadgeUrl: url}))}
                    onRemove={() => setFormData(f => ({...f, tierBadgeUrl: ''}))}
                    accept="image/*"
                />
            </div>
            <div className="mt-6">
                <Button onClick={handleSave} className="w-full">Save Tier</Button>
            </div>
        </Modal>
    );
};

const RankEditorModal: React.FC<{
    rank: Partial<SubRank & { tierId?: string }> | null,
    tiers: RankTier[],
    onClose: () => void,
    onSave: (rank: (Omit<SubRank, 'id'> | SubRank) & { tierId: string }) => void
}> = ({ rank, tiers, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: rank?.name || '',
        tierId: rank?.tierId || (tiers.length > 0 ? tiers[0].id : ''),
        minXp: rank?.minXp || 0,
        iconUrl: rank?.iconUrl || '',
        perks: rank?.perks?.join(', ') || '',
    });

    const handleSave = () => {
        if (!formData.name || !formData.tierId) {
            alert("Rank Name and Tier are required.");
            return;
        }
        const { tierId, ...restOfRank } = rank || {};
        const finalRank = {
            ...restOfRank,
            ...formData,
            perks: formData.perks.split(',').map(s => s.trim()).filter(Boolean),
            minXp: Number(formData.minXp)
        };
        onSave(finalRank);
        onClose();
    };
    
    return (
        <Modal isOpen={true} onClose={onClose} title={rank?.id ? 'Edit Rank' : 'Create Rank'}>
            <div className="space-y-4">
                 <Input label="Rank Name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))} />
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Tier</label>
                    <select value={formData.tierId} onChange={e => setFormData(f => ({...f, tierId: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                        {tiers.length === 0 && <option value="">Create a Tier first</option>}
                        {tiers.map(tier => <option key={tier.id} value={tier.id}>{tier.name}</option>)}
                    </select>
                </div>
                <Input label="Minimum XP Required" type="number" value={formData.minXp} onChange={e => setFormData(f => ({...f, minXp: Number(e.target.value)}))} />
                <Input label="Perks (comma-separated)" value={formData.perks} onChange={e => setFormData(f => ({...f, perks: e.target.value}))} />
                <UrlOrUploadField
                    label="Rank Icon"
                    fileUrl={formData.iconUrl}
                    onUrlSet={(url) => setFormData(f => ({...f, iconUrl: url}))}
                    onRemove={() => setFormData(f => ({...f, iconUrl: ''}))}
                    accept="image/*"
                />
            </div>
            <div className="mt-6">
                <Button onClick={handleSave} className="w-full">Save Rank</Button>
            </div>
        </Modal>
    )

};


export const ProgressionTab: React.FC<ProgressionTabProps> = ({ 
    gamificationSettings, 
    setGamificationSettings,
    badges, 
    setBadges,
    legendaryBadges, 
    setLegendaryBadges,
    rankTiers,
    setRankTiers,
    addDoc, 
    updateDoc, 
    deleteDoc 
}) => {
    const [editingRule, setEditingRule] = useState<Partial<GamificationRule> | null>(null);
    const [deletingRule, setDeletingRule] = useState<GamificationRule | null>(null);
    
    const [editingBadge, setEditingBadge] = useState<Partial<Badge> | null>(null);
    const [deletingBadge, setDeletingBadge] = useState<Badge | null>(null);

    const [editingLegendaryBadge, setEditingLegendaryBadge] = useState<Partial<LegendaryBadge> | null>(null);
    const [deletingLegendaryBadge, setDeletingLegendaryBadge] = useState<LegendaryBadge | null>(null);

    const [editingTier, setEditingTier] = useState<Partial<RankTier> | null>(null);
    const [deletingTier, setDeletingTier] = useState<RankTier | null>(null);

    const [editingRank, setEditingRank] = useState<Partial<SubRank & { tierId: string }> | null>(null);
    const [deletingRank, setDeletingRank] = useState<(SubRank & { tierId: string }) | null>(null);
    
    // Handlers
    const handleSaveRule = (rule: Omit<GamificationRule, 'id'> | GamificationRule) => { 'id' in rule ? updateDoc('gamificationSettings', rule) : addDoc('gamificationSettings', rule); };
    const handleDeleteRule = () => { if (deletingRule) { deleteDoc('gamificationSettings', deletingRule.id); setDeletingRule(null); } };
    
    const handleSaveBadge = (badge: Omit<Badge, 'id'> | Badge) => { 'id' in badge ? updateDoc('badges', badge) : addDoc('badges', badge); setEditingBadge(null); }
    const handleDeleteBadge = () => { if (deletingBadge) { deleteDoc('badges', deletingBadge.id); setDeletingBadge(null); } }

    const handleSaveLegendaryBadge = (badge: Omit<LegendaryBadge, 'id'> | LegendaryBadge) => { 'id' in badge ? updateDoc('legendaryBadges', badge) : addDoc('legendaryBadges', badge); setEditingLegendaryBadge(null); }
    const handleDeleteLegendaryBadge = () => { if (deletingLegendaryBadge) { deleteDoc('legendaryBadges', deletingLegendaryBadge.id); setDeletingLegendaryBadge(null); } }

    const handleSaveTier = (tier: Omit<RankTier, 'id'> | RankTier) => { 'id' in tier ? updateDoc('rankTiers', tier) : addDoc('rankTiers', tier); setEditingTier(null); }
    const handleDeleteTier = () => { if (deletingTier) { deleteDoc('rankTiers', deletingTier.id); setDeletingTier(null); } }

    const handleSaveRank = (rank: (Omit<SubRank, 'id'> | SubRank) & { tierId: string }) => {
        setRankTiers(prevTiers => {
            const newTiers = [...prevTiers];
            const tierIndex = newTiers.findIndex(t => t.id === rank.tierId);
            if (tierIndex === -1) return prevTiers; // Should not happen

            const tier = { ...newTiers[tierIndex] };
            
            const { tierId, ...subRankData } = rank;

            if ('id' in subRankData) { // Editing existing rank
                const rankIndex = tier.subranks.findIndex(r => r.id === subRankData.id);
                if (rankIndex > -1) {
                    tier.subranks = [...tier.subranks];
                    tier.subranks[rankIndex] = subRankData;
                }
            } else { // Adding new rank
                 tier.subranks = [...tier.subranks, { ...subRankData, id: `sr_${Date.now()}` }];
            }
            
            newTiers[tierIndex] = tier;
            updateDoc('rankTiers', tier); // Persist change to the parent document.
            return newTiers;
        });
        setEditingRank(null);
    }
    const handleDeleteRank = () => { 
        if (!deletingRank) return;
        const { tierId, id: rankId } = deletingRank;
        setRankTiers(prevTiers => {
             const newTiers = [...prevTiers];
            const tierIndex = newTiers.findIndex(t => t.id === tierId);
            if (tierIndex === -1) return prevTiers;

            const tier = { ...newTiers[tierIndex] };
            tier.subranks = tier.subranks.filter(r => r.id !== rankId);
            newTiers[tierIndex] = tier;
            updateDoc('rankTiers', tier);
            return newTiers;
        });
        setDeletingRank(null); 
    }
    
    const sortedRanks = rankTiers.flatMap(t => t.subranks.map(sr => ({...sr, tierId: t.id }))).sort((a,b) => a.minXp - b.minXp);
    
    return (
        <div className="space-y-6">
            {/* Modals */}
            {editingRule && <GamificationRuleEditorModal rule={editingRule} onClose={() => setEditingRule(null)} onSave={handleSaveRule} />}
            {deletingRule && <Modal isOpen={true} onClose={() => setDeletingRule(null)} title="Confirm Deletion"><p>Delete "{deletingRule.name}"?</p><div className="flex justify-end gap-4 mt-6"><Button variant="secondary" onClick={() => setDeletingRule(null)}>Cancel</Button><Button variant="danger" onClick={handleDeleteRule}>Delete</Button></div></Modal>}
            {editingBadge && <BadgeEditorModal badge={editingBadge} onClose={() => setEditingBadge(null)} onSave={handleSaveBadge} />}
            {deletingBadge && <Modal isOpen={true} onClose={() => setDeletingBadge(null)} title="Confirm Deletion"><p>Delete "{deletingBadge.name}"?</p><div className="flex justify-end gap-4 mt-6"><Button variant="secondary" onClick={() => setDeletingBadge(null)}>Cancel</Button><Button variant="danger" onClick={handleDeleteBadge}>Delete</Button></div></Modal>}
            {editingLegendaryBadge && <LegendaryBadgeEditorModal badge={editingLegendaryBadge} onClose={() => setEditingLegendaryBadge(null)} onSave={handleSaveLegendaryBadge} />}
            {deletingLegendaryBadge && <Modal isOpen={true} onClose={() => setDeletingLegendaryBadge(null)} title="Confirm Deletion"><p>Delete "{deletingLegendaryBadge.name}"?</p><div className="flex justify-end gap-4 mt-6"><Button variant="secondary" onClick={() => setDeletingLegendaryBadge(null)}>Cancel</Button><Button variant="danger" onClick={handleDeleteLegendaryBadge}>Delete</Button></div></Modal>}
            {editingTier && <TierEditorModal tier={editingTier} onClose={() => setEditingTier(null)} onSave={handleSaveTier} />}
            {deletingTier && <Modal isOpen={true} onClose={() => setDeletingTier(null)} title="Confirm Deletion"><p>Delete "{deletingTier.name}" tier?</p><div className="flex justify-end gap-4 mt-6"><Button variant="secondary" onClick={() => setDeletingTier(null)}>Cancel</Button><Button variant="danger" onClick={handleDeleteTier}>Delete</Button></div></Modal>}
            {editingRank && <RankEditorModal rank={editingRank} tiers={rankTiers} onClose={() => setEditingRank(null)} onSave={handleSaveRank} />}
            {deletingRank && <Modal isOpen={true} onClose={() => setDeletingRank(null)} title="Confirm Deletion"><p>Delete "{deletingRank.name}" rank?</p><div className="flex justify-end gap-4 mt-6"><Button variant="secondary" onClick={() => setDeletingRank(null)}>Cancel</Button><Button variant="danger" onClick={handleDeleteRank}>Delete</Button></div></Modal>}

             {/* Main Content */}
            <DashboardCard title="How Player Progression Works" icon={<InformationCircleIcon className="w-6 h-6 text-blue-400" />}>
                <div className="p-6 space-y-4 text-sm text-gray-300 leading-relaxed">
                    <div>
                        <h4 className="font-bold text-lg text-red-400 mb-2">Automated Rank Assignment</h4>
                        <p>A player's rank is determined by their total accumulated Rank Points (XP). The system automatically assigns them the highest rank whose minimum XP requirement they meet. For example, if "Sergeant" requires 1000 XP and "Captain" requires 8000 XP, a player with 7999 XP will be a Sergeant.</p>
                        <p className="mt-2"><strong>Unranked Status:</strong> New players remain "Unranked" until they have participated in a minimum number of games (currently set to 10), regardless of their XP total.</p>
                    </div>
                    <div className="pt-4 border-t border-zinc-700/50">
                        <h4 className="font-bold text-lg text-red-400 mb-2">Automated XP & Badge Awards</h4>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Event Finalization:</strong> When you finalize a completed event from its management page, the system automatically calculates and awards XP to each attendee based on their performance.</li>
                            <li><strong>XP Calculation:</strong> The total XP awarded is a sum of the event's base 'Participation XP' plus performance XP based on the live stats you entered (kills, headshots, etc.). The value for each action is configured in the 'Gamification Settings' card.</li>
                            <li><strong>Badge Unlocks:</strong> The system continuously checks if a player's stats meet the criteria for any 'Standard Badges'. When a threshold is met (e.g., 50 headshots), the badge is awarded automatically.</li>
                        </ul>
                    </div>
                     <div className="pt-4 border-t border-zinc-700/50">
                        <h4 className="font-bold text-lg text-red-400 mb-2">The Player Experience</h4>
                        <p>When a player logs in, the system checks for any changes since their last session. If they have earned a new rank or new badges, a <strong>promotion pop-up</strong> will automatically appear to celebrate their achievements. All rank and XP changes are reflected instantly on the global leaderboard.</p>
                    </div>
                </div>
            </DashboardCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                     <DashboardCard title="Tier Management" icon={<ShieldCheckIcon className="w-6 h-6" />}>
                        <div className="p-4">
                            <div className="flex justify-end mb-4"><Button size="sm" onClick={() => setEditingTier({})}><PlusIcon className="w-5 h-5 mr-2" /> Add Tier</Button></div>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {rankTiers.map(tier => (
                                    <div key={tier.id} className="flex items-center gap-3 bg-zinc-800/50 p-2 rounded-lg">
                                        <img src={tier.tierBadgeUrl} alt={tier.name} className="w-10 h-10 object-contain"/>
                                        <p className="font-bold text-white flex-grow">{tier.name}</p>
                                        <Button size="sm" variant="secondary" onClick={() => setEditingTier(tier)} className="!p-2"><PencilIcon className="w-4 h-4"/></Button>
                                        <Button size="sm" variant="danger" onClick={() => setDeletingTier(tier)} className="!p-2"><TrashIcon className="w-4 h-4"/></Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </DashboardCard>
                    <DashboardCard title="Rank Structure" icon={<ShieldCheckIcon className="w-6 h-6" />}>
                        <div className="p-4">
                            <div className="flex justify-end mb-4"><Button size="sm" onClick={() => setEditingRank({})}><PlusIcon className="w-5 h-5 mr-2" /> Add Rank</Button></div>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {sortedRanks.map(rank => {
                                    const tier = rankTiers.find(t => t.id === rank.tierId);
                                    return (
                                         <div key={rank.id} className="flex items-center gap-3 bg-zinc-800/50 p-2 rounded-lg">
                                            <img src={rank.iconUrl} alt={rank.name} className="w-10 h-10"/>
                                            <div className="flex-grow">
                                                <p className="font-bold text-white">{rank.name}</p>
                                                <p className="text-xs text-gray-400">{tier?.name || 'No Tier'} | {rank.minXp} XP</p>
                                            </div>
                                            <Button size="sm" variant="secondary" onClick={() => setEditingRank(rank)} className="!p-2"><PencilIcon className="w-4 h-4"/></Button>
                                            <Button size="sm" variant="danger" onClick={() => setDeletingRank(rank)} className="!p-2"><TrashIcon className="w-4 h-4"/></Button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </DashboardCard>
                </div>

                <div className="space-y-6">
                    <DashboardCard title="Gamification Settings" icon={<PlusCircleIcon className="w-6 h-6" />}>
                        <div className="p-4">
                            <div className="flex justify-end mb-4"><Button size="sm" onClick={() => setEditingRule({})}><PlusIcon className="w-5 h-5 mr-2" /> Add Rule</Button></div>
                            <div className="space-y-2">{gamificationSettings.map(rule => <GamificationRuleItem key={rule.id} rule={rule} onEdit={setEditingRule} onDelete={setDeletingRule} />)}</div>
                        </div>
                    </DashboardCard>
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