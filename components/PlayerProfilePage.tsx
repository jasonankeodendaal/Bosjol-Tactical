import React, { useState, useMemo, useEffect, useContext } from 'react';
import type { Player, GameEvent, Tier, XpAdjustment, LegendaryBadge, PlayerRole, Rank, CompanyDetails } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { BadgePill } from './BadgePill';
import { EventCard } from './EventCard';
import { MOCK_PLAYER_ROLES, UNRANKED_TIER } from '../constants';
import { ArrowLeftIcon, UserIcon, ChartBarIcon, CalendarIcon, TrophyIcon, CrosshairsIcon, PlusCircleIcon, TrashIcon } from './icons/Icons';
import { Modal } from './Modal';
import { InfoTooltip } from './InfoTooltip';
import { DataContext } from '../data/DataContext';
import { UrlOrUploadField } from './UrlOrUploadField';
import { SendCredentialsModal } from './SendCredentialsModal';

const getTierForPlayer = (player: Player, ranks: Rank[]): Tier => {
    // Determines a player's tier based on their total XP.
    if (!ranks || ranks.length === 0) return UNRANKED_TIER;
    const allTiers = ranks.flatMap(rank => rank.tiers || []).filter(Boolean).sort((a, b) => b.minXp - a.minXp);
    const tier = allTiers.find(r => (player.stats?.xp ?? 0) >= r.minXp);
    const lowestTier = [...allTiers].sort((a,b) => a.minXp - b.minXp)[0];
    return tier || lowestTier || UNRANKED_TIER;
};

interface PlayerProfilePageProps {
    player: Player;
    events: GameEvent[];
    legendaryBadges: LegendaryBadge[];
    onBack: () => void;
    onUpdatePlayer: (player: Player) => void;
    ranks: Rank[];
    companyDetails: CompanyDetails;
}

const StatDisplay: React.FC<{ value: string | number, label: string, tooltip?: string }> = ({ value, label, tooltip }) => (
    <div className="text-center">
        <p className="text-3xl font-bold text-white">{value}</p>
        <div className="flex items-center justify-center gap-1">
            <p className="text-sm text-gray-400">{label}</p>
            {tooltip && <InfoTooltip text={tooltip} />}
        </div>
    </div>
);

const AwardXpModal: React.FC<{ onClose: () => void, onSave: (amount: number, reason: string) => void }> = ({ onClose, onSave }) => {
    const [amount, setAmount] = useState<number | ''>('');
    const [reason, setReason] = useState('');

    const handleSave = () => {
        if (typeof amount === 'number' && reason.trim()) {
            onSave(amount, reason);
        } else {
            alert('Please enter a valid amount and reason.');
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Award Manual XP">
            <div className="space-y-4">
                <Input
                    label="XP Amount"
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    placeholder="e.g., 100 for a bonus, -50 for a penalty"
                    tooltip="Enter the amount of Rank Points (XP) to adjust. Use a positive number (e.g., 100) to award a bonus for good sportsmanship, or a negative number (e.g., -50) to issue a penalty for rule violations. This adjustment will be logged."
                />
                <div>
                     <div className="flex items-center mb-1.5">
                        <label className="block text-sm font-medium text-gray-400">Reason for Adjustment</label>
                        <div className="ml-1.5"><InfoTooltip text="You must provide a clear and concise reason for this XP adjustment. This reason will be permanently logged and will be visible to the player on their dashboard, so be professional. Examples: 'Bonus for exceptional teamwork', 'Penalty for repeated rule violations'." /></div>
                    </div>
                    <textarea
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        rows={3}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="e.g., Bonus for excellent sportsmanship"
                    />
                </div>
            </div>
            <div className="mt-6">
                <Button onClick={handleSave} className="w-full">
                    Confirm Award
                </Button>
            </div>
        </Modal>
    );
};

export const PlayerProfilePage: React.FC<PlayerProfilePageProps> = ({ player, events, legendaryBadges, onBack, onUpdatePlayer, ranks, companyDetails }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...player });
    const [isAwardingXp, setIsAwardingXp] = useState(false);
    const [selectedLegendaryBadge, setSelectedLegendaryBadge] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [isResettingPin, setIsResettingPin] = useState(false);
    const [isSendingCredentials, setIsSendingCredentials] = useState(false);
    const dataContext = useContext(DataContext);
    
    useEffect(() => {
        setFormData(player);
    }, [player]);

    const playerTier = getTierForPlayer(player, ranks);
    const playerRank = ranks.find(rank => (rank.tiers || []).some(t => t.id === playerTier.id));
    const { stats, matchHistory } = player;
    const kills = stats?.kills ?? 0;
    const deaths = stats?.deaths ?? 0;
    const kdr = deaths > 0 ? (kills / deaths).toFixed(2) : kills.toFixed(2);

    const handleSave = () => {
        onUpdatePlayer({...formData, age: Number(formData.age), rank: player.rank }); // Ensure rank object isn't overwritten by stale form data
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData(player);
        setIsEditing(false);
    };
    
    const handleAvatarUpdate = (url: string) => {
        if (url) {
            setFormData(f => ({ ...f, avatarUrl: url }));
        }
    };

    const handleRemoveAvatar = () => {
        const defaultAvatar = `https://api.dicebear.com/8.x/bottts/svg?seed=${formData.name}${formData.surname}`;
        setFormData(f => ({ ...f, avatarUrl: defaultAvatar }));
    };

    const handleAwardXp = (amount: number, reason: string) => {
        const newAdjustment: XpAdjustment = {
            amount,
            reason,
            date: new Date().toISOString(),
        };
        
        const currentStats = player.stats || { kills: 0, deaths: 0, headshots: 0, gamesPlayed: 0, xp: 0 };
        const newXp = currentStats.xp + amount;
        
        const tempPlayerForRankCalc = { ...player, stats: { ...currentStats, xp: newXp }};
        const newTier = getTierForPlayer(tempPlayerForRankCalc, ranks);
        
        const updatedPlayer: Player = {
            ...player,
            stats: {
                ...currentStats,
                xp: newXp,
            },
            xpAdjustments: [...(player.xpAdjustments || []), newAdjustment],
            rank: newTier,
        };
        onUpdatePlayer(updatedPlayer);
        setIsAwardingXp(false);
    };
    
    const handleAwardLegendaryBadge = () => {
        const badgeToAward = legendaryBadges.find(b => b.id === selectedLegendaryBadge);
        if (!badgeToAward) {
            alert("Please select a valid badge to award.");
            return;
        }

        const playerAlreadyHasBadge = player.legendaryBadges.some(b => b.id === badgeToAward.id);
        if (playerAlreadyHasBadge) {
            alert(`${player.name} already has the "${badgeToAward.name}" badge.`);
            return;
        }

        const updatedPlayer: Player = {
            ...player,
            legendaryBadges: [...player.legendaryBadges, badgeToAward],
        };
        onUpdatePlayer(updatedPlayer);
        setSelectedLegendaryBadge(''); // Reset dropdown
    };

    const handleRevokeLegendaryBadge = (badgeId: string) => {
        if (confirm("Are you sure you want to revoke this legendary badge from the player?")) {
            const updatedPlayer: Player = {
                ...player,
                legendaryBadges: player.legendaryBadges.filter(b => b.id !== badgeId),
            };
            onUpdatePlayer(updatedPlayer);
        }
    };
    
    const availableBadgesToAward = legendaryBadges.filter(
        globalBadge => !player.legendaryBadges.some(playerBadge => playerBadge.id === globalBadge.id)
    );
    
    const handleResetPin = (newPin: string) => {
        const updatedPlayer: Player = { ...player, pin: newPin };
        onUpdatePlayer(updatedPlayer);
        setIsResettingPin(false);
    };

    const ResetPinModal: React.FC<{ onClose: () => void, onSave: (newPin: string) => void }> = ({ onClose, onSave }) => {
        const [newPin, setNewPin] = useState('');
        const isValid = /^\d{6}$/.test(newPin);

        const handleSave = () => {
            if (isValid) {
                onSave(newPin);
            }
        };

        return (
            <Modal isOpen={true} onClose={onClose} title={`Reset PIN for ${player.name}`}>
                <div className="space-y-4">
                    <Input
                        label="New 6-Digit PIN"
                        type="text"
                        value={newPin}
                        onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 6) {
                                setNewPin(val);
                            }
                        }}
                        maxLength={6}
                        placeholder="Enter a new 6-digit PIN"
                        inputMode="numeric"
                        pattern="\d{6}"
                    />
                </div>
                <div className="mt-6">
                    <Button onClick={handleSave} className="w-full" disabled={!isValid}>
                        Confirm Reset
                    </Button>
                </div>
            </Modal>
        );
    };


    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {isAwardingXp && <AwardXpModal onClose={() => setIsAwardingXp(false)} onSave={handleAwardXp} />}
            {isResettingPin && <ResetPinModal onClose={() => setIsResettingPin(false)} onSave={handleResetPin} />}
            {isSendingCredentials && <SendCredentialsModal player={player} onClose={() => setIsSendingCredentials(false)} />}
            <header className="flex items-center mb-6">
                <Button onClick={onBack} variant="secondary" size="sm" className="mr-4">
                    <ArrowLeftIcon className="w-5 h-5" />
                </Button>
                <img src={player.avatarUrl} alt={player.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                <div>
                    <h1 className="text-2xl font-bold text-white">{player.name} "{player.callsign}" {player.surname}</h1>
                    <div className="flex items-center mt-1">
                        <img src={playerTier.iconUrl} alt={playerTier.name} className="w-6 h-6 mr-2" />
                        <span className="text-md font-semibold text-red-400">
                            {playerRank ? `${playerRank.name} - ${playerTier.name}` : playerTier.name}
                        </span>
                        <span className="text-gray-400 mx-2">|</span>
                        <BadgePill color={player.status === 'Active' ? 'green' : 'red'}>{player.status}</BadgePill>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <DashboardCard title="Operator Details" icon={<UserIcon className="w-6 h-6" />}>
                        <div className="p-6 space-y-4">
                            {isEditing ? (
                                <>
                                    <div className="flex flex-col items-center">
                                        <UrlOrUploadField
                                            label="Avatar"
                                            fileUrl={formData.avatarUrl}
                                            onUrlSet={handleAvatarUpdate}
                                            onRemove={handleRemoveAvatar}
                                            accept="image/*"
                                            apiServerUrl={companyDetails.apiServerUrl}
                                        />
                                    </div>
                                    <Input label="First Name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))}/>
                                    <Input label="Surname" value={formData.surname} onChange={e => setFormData(f => ({...f, surname: e.target.value}))}/>
                                    <Input label="Callsign" value={formData.callsign} onChange={e => setFormData(f => ({...f, callsign: e.target.value}))}/>
                                     <div className="grid grid-cols-2 gap-4">
                                        <Input label="Age" type="number" value={formData.age} onChange={e => setFormData(f => ({...f, age: Number(e.target.value)}))} />
                                        <Input label="ID Number" value={formData.idNumber} onChange={e => setFormData(f => ({...f, idNumber: e.target.value}))} />
                                    </div>
                                    <Input
                                        label="6-Digit PIN"
                                        type="text"
                                        value={formData.pin}
                                        onChange={e => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 6) {
                                                setFormData(f => ({ ...f, pin: val }));
                                            }
                                        }}
                                        maxLength={6}
                                        pattern="\d{6}"
                                        inputMode="numeric"
                                    />
                                    <Input label="Email" value={formData.email} onChange={e => setFormData(f => ({...f, email: e.target.value}))}/>
                                    <Input label="Phone" type="tel" value={formData.phone} onChange={e => setFormData(f => ({...f, phone: e.target.value}))}/>
                                    <Input label="Address" value={formData.address} onChange={e => setFormData(f => ({...f, address: e.target.value}))}/>
                                    <textarea placeholder="Bio" value={formData.bio} onChange={e => setFormData(p => ({...p, bio: e.target.value}))} rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                                     <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Preferred Role</label>
                                        <select value={formData.preferredRole} onChange={e => setFormData(p => ({...p, preferredRole: e.target.value as PlayerRole}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                                            {MOCK_PLAYER_ROLES.map(role => <option key={role}>{role}</option>)}
                                        </select>
                                    </div>
                                    <Input label="Allergies" value={formData.allergies} onChange={e => setFormData(f => ({...f, allergies: e.target.value}))}/>
                                    <Input label="Medical Notes" value={formData.medicalNotes} onChange={e => setFormData(f => ({...f, medicalNotes: e.target.value}))}/>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Status</label>
                                        <select value={formData.status} onChange={(e) => setFormData(p => ({...p, status: e.target.value as Player['status']}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                                            <option>Active</option>
                                            <option>On Leave</option>
                                            <option>Retired</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button variant="secondary" onClick={handleCancel} className="w-full">Cancel</Button>
                                        <Button onClick={handleSave} className="w-full">Save</Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p><strong className="text-gray-400">Code:</strong> <span className="font-mono text-red-400">{player.playerCode}</span> <InfoTooltip text="This is the player's unique identification code. Use this code to quickly find and check them into events. It is also used on any manual stat-tracking sheets during live games to ensure XP and stats are assigned correctly." /></p>
                                    <p><strong className="text-gray-400">Age:</strong> {player.age}</p>
                                    <p><strong className="text-gray-400">ID Number:</strong> {player.idNumber}</p>
                                    <div className="bg-zinc-800/50 p-3 rounded-md border border-zinc-700/50">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium text-gray-400">PIN Code</label>
                                                <p className="font-mono text-lg text-red-400 tracking-widest">{showPin ? player.pin : '******'}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="secondary" onClick={() => setShowPin(!showPin)}>{showPin ? 'Hide' : 'Show'}</Button>
                                                <Button size="sm" variant="secondary" onClick={() => setIsResettingPin(true)}>Reset</Button>
                                            </div>
                                        </div>
                                    </div>
                                    <p><strong className="text-gray-400">Email:</strong> {player.email}</p>
                                    <p><strong className="text-gray-400">Phone:</strong> {player.phone}</p>
                                    <p><strong className="text-gray-400">Address:</strong> {player.address || 'N/A'}</p>
                                    <p><strong className="text-gray-400">Preferred Role:</strong> {player.preferredRole || 'N/A'}</p>
                                    <p><strong className="text-gray-400">Allergies:</strong> {player.allergies || 'N/A'}</p>
                                    <p><strong className="text-gray-400">Medical Notes:</strong> {player.medicalNotes || 'N/A'}</p>
                                    <p><strong className="text-gray-400">Bio:</strong> {player.bio || 'N/A'}</p>
                                    <div className="flex gap-2 pt-2">
                                        <Button variant="secondary" onClick={() => setIsEditing(true)} className="w-full">Edit Profile</Button>
                                        <Button onClick={() => setIsAwardingXp(true)} className="w-full">Award XP</Button>
                                    </div>
                                    <div className="pt-2">
                                        <Button variant="secondary" onClick={() => setIsSendingCredentials(true)} className="w-full">
                                            Send Credentials
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    </DashboardCard>
                    <DashboardCard title="Legendary Awards" icon={<TrophyIcon className="w-6 h-6 text-amber-400" />}>
                        <div className="p-6 space-y-3">
                            {player.legendaryBadges.length > 0 ? player.legendaryBadges.map(badge => (
                                <div key={badge.id} className="flex items-center justify-between gap-3 bg-zinc-800/50 p-2 rounded-md">
                                    <div className="flex items-center gap-3">
                                        <img src={badge.iconUrl} alt={badge.name} className="w-8 h-8"/>
                                        <p className="font-semibold text-amber-300">{badge.name}</p>
                                    </div>
                                    <Button size="sm" variant="danger" className="!p-1.5" onClick={() => handleRevokeLegendaryBadge(badge.id)}><TrashIcon className="w-4 h-4" /></Button>
                                </div>
                            )) : <p className="text-gray-500 text-center text-sm">No legendary badges earned.</p>}
                            <div className="pt-3 border-t border-zinc-700/50">
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Award New Badge</label>
                                <div className="flex gap-2">
                                    <select 
                                        value={selectedLegendaryBadge} 
                                        onChange={e => setSelectedLegendaryBadge(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="">Select a badge...</option>
                                        {availableBadgesToAward.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                    <Button onClick={handleAwardLegendaryBadge} disabled={!selectedLegendaryBadge}>Award</Button>
                                </div>
                            </div>
                        </div>
                    </DashboardCard>
                    <DashboardCard title="XP History" icon={<PlusCircleIcon className="w-6 h-6" />} titleAddon={<InfoTooltip text="This section displays a complete history of all manual Rank Point (XP) adjustments made to this player's account by an administrator. It does not include XP earned automatically from playing matches. Each entry shows the amount, the reason provided by the admin, and the date of the adjustment." />}>
                        <div className="p-6 space-y-3 max-h-60 overflow-y-auto">
                           {(player.xpAdjustments || []).length > 0 ? [...player.xpAdjustments].reverse().map((adj, i) => (
                               <div key={i} className="bg-zinc-800/50 p-2.5 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <p className={`font-bold text-lg ${adj.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {adj.amount >= 0 ? '+' : ''}{adj.amount.toLocaleString()} XP
                                        </p>
                                        <p className="text-xs text-gray-500">{new Date(adj.date).toLocaleDateString()}</p>
                                    </div>
                                   <p className="text-sm text-gray-300 italic">"{adj.reason}"</p>
                               </div>
                           )) : (
                               <p className="text-gray-500 text-center text-sm py-4">No manual XP adjustments recorded.</p>
                           )}
                        </div>
                    </DashboardCard>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <DashboardCard title="Lifetime Performance" icon={<ChartBarIcon className="w-6 h-6"/>}>
                        <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-y-6">
                            <StatDisplay value={kdr} label="K/D Ratio" tooltip="Kill/Death Ratio. Calculated as Total Kills divided by Total Deaths."/>
                            <StatDisplay value={(stats?.kills ?? 0).toLocaleString()} label="Total Kills"/>
                            <StatDisplay value={(stats?.deaths ?? 0).toLocaleString()} label="Total Deaths"/>
                            <StatDisplay value={(stats?.headshots ?? 0).toLocaleString()} label="Total Headshots"/>
                            <StatDisplay value={(stats?.gamesPlayed ?? 0).toLocaleString()} label="Matches Played"/>
                            <StatDisplay value={(stats?.xp ?? 0).toLocaleString()} label="Total Rank Points"/>
                        </div>
                    </DashboardCard>
                     <DashboardCard title="Match History" icon={<CalendarIcon className="w-6 h-6" />}>
                        <div className="p-6 space-y-4 max-h-[40rem] overflow-y-auto">
                            {player.matchHistory && player.matchHistory.length > 0 ? (
                                player.matchHistory
                                    .map(record => ({...record, event: events.find(e => e.id === record.eventId)}))
                                    .filter(record => record.event)
                                    .sort((a,b) => new Date(b.event!.date).getTime() - new Date(a.event!.date).getTime())
                                    .map(({ event, playerStats }) => (
                                        <div key={event!.id} className="bg-zinc-900/50 p-1 rounded-lg">
                                            <EventCard event={event!} />
                                            <div className="grid grid-cols-3 gap-2 text-center p-3">
                                                <StatDisplay value={playerStats.kills} label="Kills" />
                                                <StatDisplay value={playerStats.deaths} label="Deaths" />
                                                <StatDisplay value={playerStats.headshots} label="Headshots" />
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">No matches played yet.</p>
                            )}
                        </div>
                    </DashboardCard>
                </div>
            </div>
        </div>
    );
};