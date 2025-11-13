import React, { useState } from 'react';
import type { Rank, Badge, LegendaryBadge, GamificationRule, GamificationSettings } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { ShieldCheckIcon, TrophyIcon, PlusCircleIcon, PencilIcon, TrashIcon, PlusIcon } from './icons/Icons';
import { Modal } from './Modal';
import { ImageUpload } from './ImageUpload';
import { DashboardCard } from './DashboardCard';


interface ProgressionTabProps {
    ranks: Rank[];
    setRanks: React.Dispatch<React.SetStateAction<Rank[]>>;
    badges: Badge[];
    setBadges: React.Dispatch<React.SetStateAction<Badge[]>>;
    legendaryBadges: LegendaryBadge[];
    setLegendaryBadges: React.Dispatch<React.SetStateAction<LegendaryBadge[]>>;
    gamificationSettings: GamificationSettings;
    setGamificationSettings: React.Dispatch<React.SetStateAction<GamificationSettings>>;
}

const GamificationEditor: React.FC<{rule: GamificationRule, onSave: (id: string, newXp: number) => void}> = ({rule, onSave}) => {
     const [xp, setXp] = useState(rule.xp);

    const handleSave = () => {
        onSave(rule.id, Number(xp));
    }
    
    return (
        <div className="flex items-center gap-4 bg-zinc-800/50 p-3 rounded-lg">
            <div className="flex-grow">
                <p className="font-bold text-white">{rule.name}</p>
                <p className="text-xs text-gray-400">{rule.description}</p>
            </div>
            <div className="flex items-center gap-2">
                <Input type="number" value={xp} onChange={e => setXp(Number(e.target.value))} className="w-24 text-right"/>
                <Button size="sm" onClick={handleSave} disabled={xp === rule.xp}>Save</Button>
            </div>
        </div>
    )
}

const StandardBadgeEditorModal: React.FC<{ badge: Partial<Badge> | null, onClose: () => void, onSave: (b: Badge) => void }> = ({ badge, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: badge?.name || '',
        description: badge?.description || '',
        iconUrl: badge?.iconUrl || '',
        criteriaType: badge?.criteria?.type || 'kills',
        criteriaValue: badge?.criteria?.value || '',
    });

    const handleSave = () => {
        const finalBadge: Badge = {
            id: badge?.id || `b${Date.now()}`,
            name: formData.name,
            description: formData.description,
            iconUrl: formData.iconUrl,
            criteria: {
                type: formData.criteriaType as Badge['criteria']['type'],
                value: formData.criteriaType === 'rank' || formData.criteriaType === 'custom' ? formData.criteriaValue : Number(formData.criteriaValue)
            }
        };
        onSave(finalBadge);
        onClose();
    }
    
    return (
         <Modal isOpen={true} onClose={onClose} title={badge?.id ? 'Edit Standard Badge' : 'Create Standard Badge'}>
            <div className="space-y-4">
                <Input label="Badge Name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))} />
                <Input label="Description" value={formData.description} onChange={e => setFormData(f => ({...f, description: e.target.value}))} />
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Badge Icon</label>
                    <ImageUpload onUpload={(url) => setFormData(f => ({...f, iconUrl: url}))} accept="image/*" />
                    {formData.iconUrl && <img src={formData.iconUrl} alt="Icon preview" className="w-16 h-16 object-contain rounded-md bg-zinc-800 p-1 mt-2" />}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Criteria Type</label>
                        {/* FIX: Cast e.target.value to the correct literal union type to satisfy TypeScript. */}
                        <select value={formData.criteriaType} onChange={e => setFormData(f => ({...f, criteriaType: e.target.value as Badge['criteria']['type']}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option value="kills">Kills</option>
                            <option value="headshots">Headshots</option>
                            <option value="gamesPlayed">Games Played</option>
                            <option value="rank">Rank</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    <Input label="Criteria Value" value={formData.criteriaValue} onChange={e => setFormData(f => ({...f, criteriaValue: e.target.value}))} />
                </div>
            </div>
            <div className="mt-6">
                <Button className="w-full" onClick={handleSave}>Save Badge</Button>
            </div>
        </Modal>
    );
}

const LegendaryBadgeEditorModal: React.FC<{ badge: Partial<LegendaryBadge> | null, onClose: () => void, onSave: (b: LegendaryBadge) => void }> = ({ badge, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: badge?.name || '',
        description: badge?.description || '',
        iconUrl: badge?.iconUrl || '',
        howToObtain: badge?.howToObtain || 'Manually awarded by an admin.',
    });

    const handleSave = () => {
        const finalBadge: LegendaryBadge = {
            id: badge?.id || `leg${Date.now()}`,
            name: formData.name,
            description: formData.description,
            iconUrl: formData.iconUrl,
            howToObtain: formData.howToObtain,
        };
        onSave(finalBadge);
        onClose();
    }
    
    return (
         <Modal isOpen={true} onClose={onClose} title={badge?.id ? 'Edit Legendary Badge' : 'Create Legendary Badge'}>
            <div className="space-y-4">
                <Input label="Badge Name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))} />
                <Input label="Description" value={formData.description} onChange={e => setFormData(f => ({...f, description: e.target.value}))} />
                <Input label="How to Obtain" value={formData.howToObtain} onChange={e => setFormData(f => ({...f, howToObtain: e.target.value}))} />
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Badge Icon</label>
                    <ImageUpload onUpload={(url) => setFormData(f => ({...f, iconUrl: url}))} accept="image/*" />
                    {formData.iconUrl && <img src={formData.iconUrl} alt="Icon preview" className="w-16 h-16 object-contain rounded-md bg-zinc-800 p-1 mt-2" />}
                </div>
            </div>
            <div className="mt-6">
                <Button className="w-full" onClick={handleSave}>Save Badge</Button>
            </div>
        </Modal>
    );
};


export const ProgressionTab: React.FC<ProgressionTabProps> = ({ ranks, setRanks, badges, setBadges, legendaryBadges, setLegendaryBadges, gamificationSettings, setGamificationSettings }) => {
    const [editingStandardBadge, setEditingStandardBadge] = useState<Partial<Badge> | null>(null);
    const [editingLegendaryBadge, setEditingLegendaryBadge] = useState<Partial<LegendaryBadge> | null>(null);
    const [deletingBadge, setDeletingBadge] = useState<Badge | LegendaryBadge | null>(null);
    
    const handleGamificationSave = (id: string, newXp: number) => {
        setGamificationSettings(prev => prev.map(rule => rule.id === id ? {...rule, xp: newXp} : rule));
    };

    const handleStandardBadgeSave = (badge: Badge) => {
        setBadges(prev => {
            const index = prev.findIndex(b => b.id === badge.id);
            if (index > -1) {
                const newBadges = [...prev];
                newBadges[index] = badge;
                return newBadges;
            }
            return [...prev, badge];
        });
    };

    const handleLegendaryBadgeSave = (badge: LegendaryBadge) => {
        setLegendaryBadges(prev => {
            const index = prev.findIndex(b => b.id === badge.id);
            if (index > -1) {
                const newBadges = [...prev];
                newBadges[index] = badge;
                return newBadges;
            }
            return [...prev, badge];
        });
    };
    
    const handleDeleteConfirm = () => {
        if (!deletingBadge) return;
        if ('criteria' in deletingBadge) { // It's a Standard Badge
            setBadges(prev => prev.filter(b => b.id !== deletingBadge.id));
        } else { // It's a Legendary Badge
            setLegendaryBadges(prev => prev.filter(b => b.id !== deletingBadge.id));
        }
        setDeletingBadge(null);
    }

    return (
         <div className="space-y-6">
            {editingStandardBadge && <StandardBadgeEditorModal badge={editingStandardBadge} onClose={() => setEditingStandardBadge(null)} onSave={handleStandardBadgeSave} />}
            {editingLegendaryBadge && <LegendaryBadgeEditorModal badge={editingLegendaryBadge} onClose={() => setEditingLegendaryBadge(null)} onSave={handleLegendaryBadgeSave} />}
            {deletingBadge && (
                 <Modal isOpen={true} onClose={() => setDeletingBadge(null)} title="Confirm Deletion">
                    <p className="text-gray-300">Are you sure you want to delete the badge "{deletingBadge.name}"? This action cannot be undone.</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <Button variant="secondary" onClick={() => setDeletingBadge(null)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDeleteConfirm}>Delete</Button>
                    </div>
                </Modal>
            )}

            <DashboardCard title="Gamification Settings" icon={<PlusCircleIcon className="w-6 h-6"/>}>
                <div className="p-4 space-y-2">
                    {gamificationSettings.map(rule => (
                        <GamificationEditor key={rule.id} rule={rule} onSave={handleGamificationSave} />
                    ))}
                </div>
            </DashboardCard>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <DashboardCard title="Standard Badges" icon={<TrophyIcon className="w-6 h-6"/>}>
                     <div className="p-4">
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => setEditingStandardBadge({})}><PlusIcon className="w-5 h-5 mr-2" />Add Badge</Button>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {badges.map(badge => (
                                <div key={badge.id} className="flex items-center gap-4 bg-zinc-800/50 p-3 rounded-lg">
                                    <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10" />
                                    <div className="flex-grow">
                                        <p className="font-bold text-white">{badge.name}</p>
                                        <p className="text-xs text-gray-400">{badge.description} ({badge.criteria.type}: {badge.criteria.value})</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => setEditingStandardBadge(badge)}><PencilIcon className="w-4 h-4"/></Button>
                                        <Button size="sm" variant="danger" onClick={() => setDeletingBadge(badge)}><TrashIcon className="w-4 h-4"/></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                </DashboardCard>
                <DashboardCard title="Legendary Badges" icon={<TrophyIcon className="w-6 h-6 text-amber-400"/>}>
                     <div className="p-4">
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => setEditingLegendaryBadge({})}><PlusIcon className="w-5 h-5 mr-2" />Add Badge</Button>
                        </div>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {legendaryBadges.map(badge => (
                                <div key={badge.id} className="flex items-center gap-4 bg-zinc-800/50 p-3 rounded-lg">
                                    <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10" />
                                    <div className="flex-grow">
                                        <p className="font-bold text-amber-300">{badge.name}</p>
                                        <p className="text-xs text-gray-300">{badge.description}</p>
                                    </div>
                                     <div className="flex gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => setEditingLegendaryBadge(badge)}><PencilIcon className="w-4 h-4"/></Button>
                                        <Button size="sm" variant="danger" onClick={() => setDeletingBadge(badge)}><TrashIcon className="w-4 h-4"/></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                </DashboardCard>
             </div>
        </div>
    );
};
