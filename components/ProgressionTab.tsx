import React, { useState } from 'react';
import type { Rank, Badge, LegendaryBadge, GamificationRule, GamificationSettings } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { ShieldCheckIcon, TrophyIcon, PlusCircleIcon, PencilIcon, TrashIcon, Bars3Icon } from './icons/Icons';
import { Modal } from './Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageUpload } from './ImageUpload';


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

const AccordionItem: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; isOpen: boolean; onToggle: () => void; }> = ({ title, icon, children, isOpen, onToggle }) => (
    <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-lg">
        <button onClick={onToggle} className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-zinc-800/50">
            <div className="flex items-center">
                <div className="text-red-500 mr-4">{icon}</div>
                <h3 className="font-bold text-lg text-gray-200 tracking-wider uppercase">{title}</h3>
            </div>
            <Bars3Icon className={`w-6 h-6 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                >
                    <div className="p-5 border-t border-red-600/30">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);


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

export const ProgressionTab: React.FC<ProgressionTabProps> = ({ ranks, setRanks, badges, setBadges, legendaryBadges, setLegendaryBadges, gamificationSettings, setGamificationSettings }) => {
    const [openAccordion, setOpenAccordion] = useState<string | null>('Ranks');

    const handleToggle = (title: string) => {
        setOpenAccordion(openAccordion === title ? null : title);
    };

    const handleRankSave = (updatedRank: Rank) => {
        if(updatedRank.id) {
            setRanks(prevRanks => prevRanks.map(r => r.id === updatedRank.id ? updatedRank : r));
        } else {
            const newRankWithId = {...updatedRank, id: `rank_${Date.now()}`};
            setRanks(prevRanks => [...prevRanks, newRankWithId]);
        }
    }

    const handleRankDelete = (rankId: string) => {
        setRanks(prevRanks => prevRanks.filter(r => r.id !== rankId));
    }

    const handleGamificationSave = (id: string, newXp: number) => {
        setGamificationSettings(prev => prev.map(rule => rule.id === id ? {...rule, xp: newXp} : rule));
    }

    return (
         <div className="space-y-4">
            <AccordionItem title="Ranks" icon={<ShieldCheckIcon className="w-6 h-6"/>} isOpen={openAccordion === 'Ranks'} onToggle={() => handleToggle('Ranks')}>
                <RanksSection ranks={ranks} onSave={handleRankSave} onDelete={handleRankDelete}/>
            </AccordionItem>
            <AccordionItem title="Gamification Settings" icon={<PlusCircleIcon className="w-6 h-6"/>} isOpen={openAccordion === 'Gamification Settings'} onToggle={() => handleToggle('Gamification Settings')}>
                <div className="space-y-2">
                    {gamificationSettings.map(rule => (
                        <GamificationEditor key={rule.id} rule={rule} onSave={handleGamificationSave} />
                    ))}
                </div>
            </AccordionItem>
             <AccordionItem title="Standard Badges" icon={<TrophyIcon className="w-6 h-6"/>} isOpen={openAccordion === 'Standard Badges'} onToggle={() => handleToggle('Standard Badges')}>
                <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                    {badges.map(badge => (
                        <div key={badge.id} className="flex items-center gap-4 bg-zinc-800/50 p-3 rounded-lg">
                            <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10" />
                            <div>
                                <p className="font-bold text-white">{badge.name}</p>
                                <p className="text-xs text-gray-400">{badge.description} ({badge.criteria.type}: {badge.criteria.value})</p>
                            </div>
                        </div>
                    ))}
                </div>
            </AccordionItem>
            <AccordionItem title="Legendary Badges" icon={<TrophyIcon className="w-6 h-6 text-amber-400"/>} isOpen={openAccordion === 'Legendary Badges'} onToggle={() => handleToggle('Legendary Badges')}>
                 <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                    {legendaryBadges.map(badge => (
                         <div key={badge.id} className="flex items-center gap-4 bg-zinc-800/50 p-3 rounded-lg">
                            <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10" />
                            <div>
                                <p className="font-bold text-amber-300">{badge.name}</p>
                                <p className="text-xs text-gray-300">{badge.description}</p>
                                <p className="text-xs text-gray-500 italic mt-1">How to obtain: {badge.howToObtain}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </AccordionItem>
        </div>
    );
};

const RankEditorModal: React.FC<{ rank: Partial<Rank> | null, onClose: () => void, onSave: (rank: Rank) => void }> = ({ rank, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Rank>>({
        name: rank?.name || '',
        tier: rank?.tier || '',
        minXp: rank?.minXp || 0,
        iconUrl: rank?.iconUrl || '',
        unlocks: rank?.unlocks || [],
    });

    const handleSave = () => {
        onSave({ id: rank?.id || '', ...formData } as Rank);
        onClose();
    };
    
    return (
        <Modal isOpen={true} onClose={onClose} title={rank?.id ? 'Edit Rank' : 'Create New Rank'}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <Input label="Rank Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                <Input label="Tier" value={formData.tier} onChange={e => setFormData(f => ({ ...f, tier: e.target.value }))} />
                <Input label="Minimum XP" type="number" value={formData.minXp} onChange={e => setFormData(f => ({ ...f, minXp: Number(e.target.value) }))} />
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Rank Icon</label>
                    <ImageUpload onUpload={(url) => setFormData(f => ({...f, iconUrl: url}))} accept="image/*" />
                    {formData.iconUrl && <img src={formData.iconUrl} alt="Icon preview" className="w-16 h-16 object-contain rounded-md bg-zinc-800 p-1 mt-2" />}
                </div>
            </div>
            <div className="mt-6">
                <Button onClick={handleSave} className="w-full">Save Rank</Button>
            </div>
        </Modal>
    )
}

const RanksSection: React.FC<{ ranks: Rank[], onSave: (rank: Rank) => void, onDelete: (rankId: string) => void }> = ({ ranks, onSave, onDelete }) => {
    const [editingRank, setEditingRank] = useState<Partial<Rank> | null>(null);
    const [deletingRank, setDeletingRank] = useState<Rank | null>(null);

    const handleDeleteConfirm = () => {
        if (deletingRank) {
            onDelete(deletingRank.id);
            setDeletingRank(null);
        }
    };
    
    return (
        <div>
            {editingRank && <RankEditorModal rank={editingRank} onClose={() => setEditingRank(null)} onSave={onSave}/>}
            {deletingRank && (
                 <Modal isOpen={true} onClose={() => setDeletingRank(null)} title="Confirm Deletion">
                    <p className="text-gray-300">Are you sure you want to delete the rank "{deletingRank.name}"? This could affect player progression data.</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <Button variant="secondary" onClick={() => setDeletingRank(null)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDeleteConfirm}>Delete</Button>
                    </div>
                </Modal>
            )}
            <div className="flex justify-end mb-4">
                <Button onClick={() => setEditingRank({})}>
                    Create New Rank
                </Button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {ranks.sort((a,b) => a.minXp - b.minXp).map(rank => (
                     <div key={rank.id} className="flex items-center gap-4 bg-zinc-800/50 p-3 rounded-lg">
                        <img src={rank.iconUrl} alt={rank.name} className="w-10 h-10" />
                        <div className="flex-grow">
                            <p className="font-bold text-white">{rank.name}</p>
                            <p className="text-xs text-gray-400">{rank.tier}</p>
                        </div>
                        <p className="text-sm text-amber-400">{rank.minXp.toLocaleString()} XP</p>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="secondary" onClick={() => setEditingRank(rank)}><PencilIcon className="w-4 h-4"/></Button>
                            <Button size="sm" variant="danger" onClick={() => setDeletingRank(rank)}><TrashIcon className="w-4 h-4"/></Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};