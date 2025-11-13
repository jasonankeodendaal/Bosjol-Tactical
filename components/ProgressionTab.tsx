import React, { useState } from 'react';
import type { Rank, Badge, LegendaryBadge, GamificationRule, GamificationSettings } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { ShieldCheckIcon, TrophyIcon, PlusCircleIcon, PencilIcon } from './icons/Icons';
import { InfoTooltip } from './InfoTooltip';
import { Modal } from './Modal';

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

const RankEditor: React.FC<{rank: Rank, onSave: (field: keyof Rank, value: any) => void}> = ({rank, onSave}) => {
    const [minXp, setMinXp] = useState(rank.minXp);

    const handleSave = () => {
        onSave('minXp', Number(minXp));
    }
    
    return (
        <div className="flex items-center gap-4 bg-zinc-800/50 p-3 rounded-lg">
            <img src={rank.iconUrl} alt={rank.name} className="w-10 h-10" />
            <div className="flex-grow">
                <p className="font-bold text-white">{rank.name}</p>
                <p className="text-xs text-gray-400">{rank.tier}</p>
            </div>
            <div className="flex items-center gap-2">
                <Input type="number" value={minXp} onChange={e => setMinXp(Number(e.target.value))} className="w-28 text-right"/>
                <Button size="sm" onClick={handleSave} disabled={minXp === rank.minXp}>Save</Button>
            </div>
        </div>
    )
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

export const ProgressionTab: React.FC<ProgressionTabProps> = ({ ranks, setRanks, badges, setBadges, legendaryBadges, setLegendaryBadges, gamificationSettings, setGamificationSettings }) => {

    const handleRankSave = (id: string, field: keyof Rank, value: any) => {
        setRanks(prevRanks => prevRanks.map(r => r.id === id ? {...r, [field]: value} : r));
    }

    const handleGamificationSave = (id: string, newXp: number) => {
        setGamificationSettings(prev => prev.map(rule => rule.id === id ? {...rule, xp: newXp} : rule));
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
                <DashboardCard title="Ranks" icon={<ShieldCheckIcon className="w-6 h-6"/>}>
                    <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                        {ranks.sort((a,b) => a.minXp - b.minXp).map(rank => (
                            <RankEditor key={rank.id} rank={rank} onSave={(field, value) => handleRankSave(rank.id, field, value)} />
                        ))}
                    </div>
                </DashboardCard>
                <DashboardCard title="Gamification Settings" icon={<PlusCircleIcon className="w-6 h-6"/>}>
                     <div className="p-4 space-y-2">
                        {gamificationSettings.map(rule => (
                            <GamificationEditor key={rule.id} rule={rule} onSave={handleGamificationSave} />
                        ))}
                    </div>
                </DashboardCard>
            </div>
             <div className="space-y-6">
                <DashboardCard title="Standard Badges" icon={<TrophyIcon className="w-6 h-6"/>}>
                    <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                        {/* Note: Badge editing is complex due to criteria. For now, it's display-only in this UI, but can be changed in constants.ts or a future modal editor. */}
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
                </DashboardCard>
                 <DashboardCard title="Legendary Badges" icon={<TrophyIcon className="w-6 h-6 text-amber-400"/>}>
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
                </DashboardCard>
            </div>
        </div>
    );
};