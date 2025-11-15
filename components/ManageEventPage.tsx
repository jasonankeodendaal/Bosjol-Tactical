import React, { useState, useEffect, useMemo } from 'react';
// FIX: Add EventAttendee to the type imports to resolve error on line 76.
import type { GameEvent, Player, InventoryItem, GamificationSettings, PaymentStatus, PlayerStats, EventStatus, EventType, Transaction, EventAttendee, XpAdjustment, CustomEventXpRule } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
// FIX: Add CurrencyDollarIcon to the icon imports to resolve error on line 333.
import { ArrowLeftIcon, CalendarIcon, UserIcon, TrashIcon, CheckCircleIcon, CreditCardIcon, PlusIcon, ChartBarIcon, ExclamationTriangleIcon, TrophyIcon, MinusIcon, CurrencyDollarIcon, PlusCircleIcon, PencilIcon, XIcon } from './icons/Icons';
import { MOCK_EVENT_THEMES, EVENT_STATUSES, EVENT_TYPES } from '../constants';
import { ImageUpload } from './ImageUpload';
import { BadgePill } from './BadgePill';
import { InfoTooltip } from './InfoTooltip';
import { HelpSystem } from './Help';
import { Modal } from './Modal';

interface ManageEventPageProps {
    event?: GameEvent;
    players: Player[];
    inventory: InventoryItem[];
    gamificationSettings: GamificationSettings;
    onBack: () => void;
    onSave: (eventData: GameEvent) => void;
    onDelete: (eventId: string) => void;
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const defaultEvent: Omit<GameEvent, 'id'> = {
    title: '',
    type: 'Mission',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    location: '',
    description: '',
    theme: MOCK_EVENT_THEMES[0],
    rules: '',
    participationXp: 50,
    attendees: [],
    signedUpPlayers: [],
    absentPlayers: [],
    status: 'Upcoming',
    gameFee: 0,
    gearForRent: [],
    rentalSignups: [],
    liveStats: {},
    customXpRules: [],
    awardedCustomXp: {},
};

export const ManageEventPage: React.FC<ManageEventPageProps> = ({
    event, players, inventory, gamificationSettings, onBack, onSave, onDelete, setPlayers, setTransactions
}) => {
    const [formData, setFormData] = useState<Omit<GameEvent, 'id'>>(() => {
        if (!event) return defaultEvent;
        // Ensure date is in 'YYYY-MM-DD' format for the input
        const date = new Date(event.date).toISOString().split('T')[0];
        return { ...defaultEvent, ...event, date };
    });
    
    const [liveStats, setLiveStats] = useState<Record<string, Partial<Pick<PlayerStats, 'kills' | 'deaths' | 'headshots'>>>>(event?.liveStats || {});
    const [editingCustomRule, setEditingCustomRule] = useState<Partial<CustomEventXpRule> | null>(null);
    const [awardingXpToPlayer, setAwardingXpToPlayer] = useState<Player | null>(null);


    const signedUpPlayersDetails = useMemo(() =>
        players.filter(p => formData.signedUpPlayers.includes(p.id)),
    [players, formData.signedUpPlayers]);

    const attendeesDetails = useMemo(() =>
        players.filter(p => formData.attendees.some(a => a.playerId === p.id)),
    [players, formData.attendees]);
    
    const handleStatChange = (playerId: string, stat: keyof PlayerStats, value: number) => {
        setLiveStats(prev => ({
            ...prev,
            [playerId]: {
                ...prev[playerId],
                [stat]: Math.max(0, value)
            }
        }));
    };
    
    const handleCheckIn = (playerId: string) => {
        const rentalSignup = formData.rentalSignups?.find(s => s.playerId === playerId);
        const newAttendee: EventAttendee = {
            playerId,
            paymentStatus: 'Unpaid',
            rentedGearIds: rentalSignup?.requestedGearIds || [],
            note: rentalSignup?.note,
        };
        setFormData(prev => ({
            ...prev,
            signedUpPlayers: prev.signedUpPlayers.filter(id => id !== playerId),
            attendees: [...prev.attendees, newAttendee]
        }));
    };

    const handleCheckOut = (playerId: string) => {
        setFormData(prev => ({
            ...prev,
            attendees: prev.attendees.filter(a => a.playerId !== playerId),
            signedUpPlayers: [...prev.signedUpPlayers, playerId]
        }));
    }
    
    const handlePaymentStatus = (playerId: string, status: PaymentStatus) => {
        setFormData(prev => ({
            ...prev,
            attendees: prev.attendees.map(a => a.playerId === playerId ? { ...a, paymentStatus: status } : a)
        }));
    };

    const handleFinalizeEvent = () => {
        if (!confirm('Are you sure you want to finalize this event? This will award XP to all attendees and cannot be easily undone.')) {
            return;
        }

        const newTransactions: Transaction[] = [];

        const updatedPlayers = players.map(player => {
            const attendeeInfo = formData.attendees.find(a => a.playerId === player.id);
            if (!attendeeInfo) return player;

            const playerLiveStats = liveStats[player.id] || {};
            let xpGained = formData.participationXp || 0;
            
            const rules = new Map(gamificationSettings.map(r => [r.id, r.xp]));
            const getXp = (ruleId: string) => formData.xpOverrides?.[ruleId] ?? rules.get(ruleId) ?? 0;

            xpGained += (playerLiveStats.kills || 0) * getXp('g_kill');
            xpGained += (playerLiveStats.headshots || 0) * getXp('g_headshot');
            xpGained += (playerLiveStats.deaths || 0) * getXp('g_death'); // Usually negative

            // Add custom XP
            const awardedXpForPlayer = formData.awardedCustomXp?.[player.id] || [];
            const customXpTotal = awardedXpForPlayer.reduce((sum, award) => sum + award.xp, 0);
            xpGained += customXpTotal;
            
            // Add financial transactions for this player
            if (attendeeInfo.paymentStatus.startsWith('Paid')) {
                 newTransactions.push({
                    id: `txn-${event!.id}-${player.id}-fee`,
                    date: formData.date,
                    type: 'Event Revenue',
                    description: `Event Fee: ${formData.title}`,
                    amount: formData.gameFee,
                    relatedEventId: event!.id,
                    relatedPlayerId: player.id,
                    paymentStatus: attendeeInfo.paymentStatus
                });

                (attendeeInfo.rentedGearIds || []).forEach(gearId => {
                    const gear = inventory.find(i => i.id === gearId);
                    if (gear) {
                        newTransactions.push({
                            id: `txn-${event!.id}-${player.id}-${gearId}`,
                            date: formData.date,
                            type: 'Rental Revenue',
                            description: `Rental: ${gear.name}`,
                            amount: gear.salePrice,
                            relatedEventId: event!.id,
                            relatedPlayerId: player.id,
                            relatedInventoryId: gearId,
                            paymentStatus: attendeeInfo.paymentStatus
                        });
                    }
                });
            }


            const newMatchRecord = {
                eventId: event!.id,
                playerStats: {
                    kills: playerLiveStats.kills || 0,
                    deaths: playerLiveStats.deaths || 0,
                    headshots: playerLiveStats.headshots || 0,
                }
            };
             // Add xpAdjustments for custom awards
            const customXpAdjustments: XpAdjustment[] = awardedXpForPlayer.map(award => ({
                amount: award.xp,
                reason: `"${award.ruleName}" objective in "${formData.title}"`,
                date: new Date().toISOString(),
            }));
            
            return {
                ...player,
                stats: {
                    ...player.stats,
                    xp: player.stats.xp + xpGained,
                    kills: player.stats.kills + (playerLiveStats.kills || 0),
                    deaths: player.stats.deaths + (playerLiveStats.deaths || 0),
                    headshots: player.stats.headshots + (playerLiveStats.headshots || 0),
                    gamesPlayed: player.stats.gamesPlayed + 1,
                },
                xpAdjustments: [...player.xpAdjustments, ...customXpAdjustments],
                matchHistory: [...player.matchHistory, newMatchRecord]
            };
        });

        setPlayers(updatedPlayers);
        setTransactions(prev => [...prev, ...newTransactions]);

        const finalEventData = {
            ...(event || {}),
            ...formData,
            id: event?.id || '',
            status: 'Completed' as EventStatus,
            liveStats: liveStats,
        };

        onSave(finalEventData);
    };


    const handleSaveClick = () => {
        const eventData = {
             ...(event || {}),
            ...formData,
            id: event?.id || '',
            liveStats: liveStats,
        };
        onSave(eventData);
    };

     const handleSaveCustomRule = (rule: CustomEventXpRule) => {
        setFormData(prev => {
            const existingRules = prev.customXpRules || [];
            const index = existingRules.findIndex(r => r.id === rule.id);
            if (index > -1) {
                const newRules = [...existingRules];
                newRules[index] = rule;
                return { ...prev, customXpRules: newRules };
            }
            return { ...prev, customXpRules: [...existingRules, rule] };
        });
        setEditingCustomRule(null);
    };

    const handleDeleteCustomRule = (ruleId: string) => {
        if (confirm('Are you sure you want to delete this custom rule?')) {
            setFormData(prev => ({
                ...prev,
                customXpRules: (prev.customXpRules || []).filter(r => r.id !== ruleId)
            }));
        }
    };

    const handleAwardRule = (player: Player, rule: CustomEventXpRule) => {
        setFormData(prev => {
            const newAwards = { ...(prev.awardedCustomXp || {}) };
            const playerAwards = newAwards[player.id] || [];
            newAwards[player.id] = [...playerAwards, { ruleId: rule.id, ruleName: rule.name, xp: rule.xp }];
            return { ...prev, awardedCustomXp: newAwards };
        });
    };
    
    const handleRemoveAwardedXp = (playerId: string, awardIndex: number) => {
        setFormData(prev => {
            const newAwardedCustomXp = { ...prev.awardedCustomXp };
            if (newAwardedCustomXp[playerId]) {
                newAwardedCustomXp[playerId] = newAwardedCustomXp[playerId].filter((_, index) => index !== awardIndex);
            }
            return { ...prev, awardedCustomXp: newAwardedCustomXp };
        });
    };


    const handleAwardManualXp = (player: Player, amount: number, reason: string) => {
        const newAdjustment: XpAdjustment = {
            amount,
            reason: `Manual award during "${formData.title}": ${reason}`,
            date: new Date().toISOString(),
        };
        const updatedPlayer: Player = {
            ...player,
            stats: {
                ...player.stats,
                xp: player.stats.xp + amount,
            },
            xpAdjustments: [...(player.xpAdjustments || []), newAdjustment],
        };
        setPlayers(prevPlayers => prevPlayers.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
        setAwardingXpToPlayer(null);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <HelpSystem topic="admin-manage-event" />
             {editingCustomRule && <CustomRuleEditorModal rule={editingCustomRule} onClose={() => setEditingCustomRule(null)} onSave={handleSaveCustomRule} />}
             {awardingXpToPlayer && <AwardXpToPlayerModal player={awardingXpToPlayer} customRules={formData.customXpRules || []} onClose={() => setAwardingXpToPlayer(null)} onAwardRule={(rule) => handleAwardRule(awardingXpToPlayer, rule)} onAwardManual={handleAwardManualXp} />}

            <header className="flex items-center mb-6">
                <Button onClick={onBack} variant="secondary" size="sm" className="mr-4">
                    <ArrowLeftIcon className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold text-white">{event ? 'Manage Event' : 'Create New Event'}</h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <DashboardCard title="Event Details" icon={<CalendarIcon className="w-6 h-6" />}>
                        <div className="p-6 space-y-4">
                            <Input label="Event Title" value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="Date" type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
                                <Input label="Start Time" type="time" value={formData.startTime} onChange={e => setFormData(f => ({ ...f, startTime: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Event Type</label>
                                    <select value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value as EventType }))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                                        {EVENT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Event Status</label>
                                    <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value as EventStatus }))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                                        {EVENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <Input label="Location" value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} />
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="Game Fee (R)" type="number" value={formData.gameFee} onChange={e => setFormData(f => ({ ...f, gameFee: Number(e.target.value) }))} />
                                <Input label="Participation XP" type="number" value={formData.participationXp} onChange={e => setFormData(f => ({ ...f, participationXp: Number(e.target.value) }))} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData(f => ({...f, description: e.target.value}))} rows={4} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Rules of Engagement</label>
                                <textarea value={formData.rules} onChange={e => setFormData(f => ({...f, rules: e.target.value}))} rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="Theme" value={formData.theme} onChange={e => setFormData(f => ({ ...f, theme: e.target.value }))} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Event Image</label>
                                    {formData.imageUrl ? (
                                        <div className="flex items-center gap-2">
                                            <img src={formData.imageUrl} alt="Event preview" className="w-32 h-20 object-cover rounded-md bg-zinc-800 p-1" />
                                            <Button variant="danger" size="sm" onClick={() => setFormData(f => ({ ...f, imageUrl: '' }))}>Remove</Button>
                                        </div>
                                    ) : (
                                        <ImageUpload onUpload={(urls) => { if (urls.length > 0) setFormData(f => ({ ...f, imageUrl: urls[0] })); }} accept="image/*" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </DashboardCard>
                    
                    <DashboardCard title="Custom XP Rules" icon={<PlusCircleIcon className="w-6 h-6" />}>
                        <div className="p-6 space-y-3">
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {(formData.customXpRules || []).map(rule => (
                                    <div key={rule.id} className="flex items-center justify-between gap-4 bg-zinc-800/50 p-3 rounded-lg">
                                        <div>
                                            <p className="font-bold text-white">{rule.name}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className={`font-bold text-lg ${rule.xp >= 0 ? 'text-green-400' : 'text-red-400'}`}>{rule.xp >= 0 ? '+' : ''}{rule.xp} XP</p>
                                            <Button size="sm" variant="secondary" onClick={() => setEditingCustomRule(rule)} className="!p-2"><PencilIcon className="w-4 h-4" /></Button>
                                            <Button size="sm" variant="danger" onClick={() => handleDeleteCustomRule(rule.id)} className="!p-2"><TrashIcon className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button onClick={() => setEditingCustomRule({})} size="sm" variant="secondary" className="w-full">
                                <PlusIcon className="w-4 h-4 mr-2" />Add Custom Rule
                            </Button>
                        </div>
                    </DashboardCard>

                    {event && formData.status === 'In Progress' && (
                         <DashboardCard title="Live Game Stats" icon={<ChartBarIcon className="w-6 h-6"/>}>
                             <div className="p-4 max-h-96 overflow-y-auto">
                                <div className="space-y-3">
                                    {attendeesDetails.map(player => (
                                        <div key={player.id} className="bg-zinc-800/50 p-3 rounded-lg">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <img src={player.avatarUrl} alt={player.name} className="w-10 h-10 rounded-full object-cover"/>
                                                <p className="font-semibold text-white flex-grow">{player.name}</p>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Input type="number" value={liveStats[player.id]?.kills || 0} onChange={e => handleStatChange(player.id, 'kills', Number(e.target.value))} className="w-20 text-center" label="Kills"/>
                                                    <Input type="number" value={liveStats[player.id]?.deaths || 0} onChange={e => handleStatChange(player.id, 'deaths', Number(e.target.value))} className="w-20 text-center" label="Deaths"/>
                                                    <Input type="number" value={liveStats[player.id]?.headshots || 0} onChange={e => handleStatChange(player.id, 'headshots', Number(e.target.value))} className="w-20 text-center" label="HS"/>
                                                    <Button size="sm" variant="secondary" onClick={() => setAwardingXpToPlayer(player)}>+ Award XP</Button>
                                                </div>
                                            </div>
                                             {(formData.awardedCustomXp?.[player.id] || []).length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-zinc-700/50">
                                                    <div className="flex flex-wrap gap-2">
                                                        {formData.awardedCustomXp![player.id].map((award, index) => (
                                                            <div key={index} className="relative group">
                                                                <BadgePill color="blue">{award.ruleName} (+{award.xp} XP)</BadgePill>
                                                                <button onClick={() => handleRemoveAwardedXp(player.id, index)} className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <XIcon className="w-3 h-3 text-white"/>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </DashboardCard>
                    )}

                    {event && formData.status === 'In Progress' && (
                        <div className="bg-green-900/50 border border-green-700 text-green-200 p-4 rounded-lg">
                            <h4 className="font-bold text-lg flex items-center gap-2"><TrophyIcon className="w-5 h-5"/>Finalize Event & Award XP</h4>
                            <p className="text-sm mb-3">This action will mark the event as "Completed", calculate and award XP to all attendees based on the live stats above, and generate financial transactions. This cannot be undone.</p>
                            <Button onClick={handleFinalizeEvent} className="bg-green-600 hover:bg-green-500 focus:ring-green-500">
                                Finalize Event
                            </Button>
                        </div>
                    )}

                </div>

                <div className="lg:col-span-1 space-y-6">
                    <DashboardCard title="Attendees" icon={<UserIcon className="w-6 h-6" />}>
                        <div className="p-4 space-y-4">
                             <div>
                                <h4 className="font-semibold text-gray-200 mb-2">Signed Up ({signedUpPlayersDetails.length})</h4>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {signedUpPlayersDetails.map(player => (
                                        <div key={player.id} className="bg-zinc-800/50 p-2 rounded-lg flex items-center">
                                            <img src={player.avatarUrl} alt={player.name} className="w-8 h-8 rounded-full object-cover mr-3"/>
                                            <p className="text-sm text-white flex-grow">{player.name}</p>
                                            <Button size="sm" variant="secondary" onClick={() => handleCheckIn(player.id)}>Check In</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <h4 className="font-semibold text-gray-200 mb-2">Checked In ({attendeesDetails.length})</h4>
                                 <div className="space-y-2 max-h-96 overflow-y-auto">
                                    {attendeesDetails.map(player => {
                                        const attendee = formData.attendees.find(a => a.playerId === player.id)!;
                                        const rentalCost = (attendee.rentedGearIds || []).reduce((sum, id) => sum + (inventory.find(i => i.id === id)?.salePrice || 0), 0);
                                        const totalFee = formData.gameFee + rentalCost;

                                        return (
                                            <div key={player.id} className="bg-zinc-800/50 p-3 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <img src={player.avatarUrl} alt={player.name} className="w-8 h-8 rounded-full object-cover mr-3"/>
                                                        <p className="text-sm text-white flex-grow">{player.name}</p>
                                                    </div>
                                                     <Button size="sm" variant="secondary" onClick={() => handleCheckOut(player.id)}>
                                                        <MinusIcon className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                                <div className="mt-2 pt-2 border-t border-zinc-700/50 text-xs text-gray-300">
                                                    <div className="flex justify-between items-center">
                                                         <span>Total Fee: <span className="font-bold text-white">R {totalFee.toFixed(2)}</span></span>
                                                         <BadgePill color={attendee.paymentStatus.startsWith('Paid') ? 'green' : 'red'}>{attendee.paymentStatus}</BadgePill>
                                                    </div>
                                                    <div className="flex justify-end gap-1 mt-2">
                                                        <Button size="sm" className="!p-1.5" onClick={() => handlePaymentStatus(player.id, 'Paid (Card)')}><CreditCardIcon className="w-4 h-4"/></Button>
                                                        <Button size="sm" className="!p-1.5" onClick={() => handlePaymentStatus(player.id, 'Paid (Cash)')}><CurrencyDollarIcon className="w-4 h-4"/></Button>
                                                        <Button size="sm" variant="secondary" className="!p-1.5" onClick={() => handlePaymentStatus(player.id, 'Unpaid')}><ExclamationTriangleIcon className="w-4 h-4"/></Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                 </div>
                            </div>
                        </div>
                    </DashboardCard>
                </div>
            </div>
             <div className="mt-6 flex flex-col sm:flex-row justify-end items-center gap-4">
                {event && (
                    <Button variant="danger" onClick={() => onDelete(event.id)}>
                        <TrashIcon className="w-5 h-5 mr-2" />
                        Delete Event
                    </Button>
                )}
                <Button onClick={handleSaveClick} className="w-full sm:w-auto">
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    Save Changes
                </Button>
            </div>
        </div>
    );
};

const CustomRuleEditorModal: React.FC<{ rule: Partial<CustomEventXpRule>, onClose: () => void, onSave: (rule: CustomEventXpRule) => void }> = ({ rule, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: rule.name || '',
        xp: rule.xp === undefined ? 0 : rule.xp,
    });

    const handleSave = () => {
        onSave({ id: rule.id || `cr${Date.now()}`, ...formData });
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={rule.id ? 'Edit Rule' : 'Add Rule'}>
            <div className="space-y-4">
                <Input label="Rule Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Capture the Flag" />
                <Input label="XP Value" type="number" value={formData.xp} onChange={e => setFormData(f => ({ ...f, xp: Number(e.target.value) }))} />
            </div>
            <div className="mt-6">
                <Button onClick={handleSave} className="w-full">Save Rule</Button>
            </div>
        </Modal>
    );
};

const AwardXpToPlayerModal: React.FC<{ player: Player, customRules: CustomEventXpRule[], onClose: () => void, onAwardRule: (rule: CustomEventXpRule) => void, onAwardManual: (player: Player, amount: number, reason: string) => void }> = ({ player, customRules, onClose, onAwardRule, onAwardManual }) => {
    const [manualAmount, setManualAmount] = useState<number | ''>('');
    const [manualReason, setManualReason] = useState('');

    const handleManualSave = () => {
        if (typeof manualAmount === 'number' && manualReason.trim()) {
            onAwardManual(player, manualAmount, manualReason);
        } else {
            alert('Please enter an amount and a reason for the manual award.');
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Award XP to ${player.name}`}>
            <div className="space-y-6">
                <div>
                    <h4 className="font-semibold text-gray-200 mb-2 text-lg">Award Objective</h4>
                    <div className="flex flex-wrap gap-2">
                        {customRules.map(rule => (
                            <Button key={rule.id} variant="secondary" size="sm" onClick={() => onAwardRule(rule)}>
                                {rule.name} <span className={`ml-2 font-bold ${rule.xp >= 0 ? 'text-green-400' : 'text-red-400'}`}>{rule.xp >= 0 ? '+' : ''}{rule.xp}</span>
                            </Button>
                        ))}
                         {customRules.length === 0 && <p className="text-sm text-gray-500">No custom rules defined for this event.</p>}
                    </div>
                </div>
                <div className="pt-6 border-t border-zinc-700/50">
                     <h4 className="font-semibold text-gray-200 mb-2 text-lg">Manual Adjustment</h4>
                     <p className="text-sm text-gray-400 mb-3">Use this for on-the-spot bonuses or penalties. This adjustment is applied immediately.</p>
                     <div className="space-y-4">
                        <Input label="XP Amount" type="number" value={manualAmount} onChange={e => setManualAmount(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g. 50 or -20"/>
                        <Input label="Reason" value={manualReason} onChange={e => setManualReason(e.target.value)} placeholder="e.g. Good sportsmanship"/>
                        <Button onClick={handleManualSave} className="w-full">Save Manual Award</Button>
                     </div>
                </div>
            </div>
        </Modal>
    );
};