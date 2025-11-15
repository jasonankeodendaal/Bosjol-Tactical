import React, { useState, useEffect, useMemo } from 'react';
// FIX: Add EventAttendee to the type imports to resolve error on line 76.
import type { GameEvent, Player, InventoryItem, GamificationSettings, PaymentStatus, PlayerStats, EventStatus, EventType, Transaction, EventAttendee } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
// FIX: Add CurrencyDollarIcon to the icon imports to resolve error on line 333.
import { ArrowLeftIcon, CalendarIcon, UserIcon, TrashIcon, CheckCircleIcon, CreditCardIcon, PlusIcon, ChartBarIcon, ExclamationTriangleIcon, TrophyIcon, MinusIcon, CurrencyDollarIcon } from './icons/Icons';
import { MOCK_EVENT_THEMES, EVENT_STATUSES, EVENT_TYPES } from '../constants';
import { ImageUpload } from './ImageUpload';
import { BadgePill } from './BadgePill';
import { InfoTooltip } from './InfoTooltip';

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
};

export const ManageEventPage: React.FC<ManageEventPageProps> = ({
    event, players, inventory, gamificationSettings, onBack, onSave, onDelete, setPlayers, setTransactions
}) => {
    const [formData, setFormData] = useState<Omit<GameEvent, 'id'>>(() => {
        if (!event) return defaultEvent;
        // Ensure date is in 'YYYY-MM-DD' format for the input
        const date = new Date(event.date).toISOString().split('T')[0];
        return { ...event, date };
    });
    
    const [liveStats, setLiveStats] = useState<Record<string, Partial<Pick<PlayerStats, 'kills' | 'deaths' | 'headshots'>>>>(event?.liveStats || {});

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

    return (
        <div className="p-4 sm:p-6 lg:p-8">
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

                    {event && formData.status === 'In Progress' && (
                         <DashboardCard title="Live Game Stats" icon={<ChartBarIcon className="w-6 h-6"/>}>
                             <div className="p-4 max-h-96 overflow-y-auto">
                                <div className="space-y-2">
                                    {attendeesDetails.map(player => (
                                        <div key={player.id} className="bg-zinc-800/50 p-3 rounded-lg flex flex-col md:flex-row items-stretch md:items-center gap-4">
                                            <div className="flex items-center gap-3 flex-grow">
                                                <img src={player.avatarUrl} alt={player.name} className="w-10 h-10 rounded-full object-cover"/>
                                                <p className="font-semibold text-white">{player.name}</p>
                                            </div>
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
                                                <Input type="number" value={liveStats[player.id]?.kills || 0} onChange={e => handleStatChange(player.id, 'kills', Number(e.target.value))} className="w-full sm:w-20 text-center" label="Kills"/>
                                                <Input type="number" value={liveStats[player.id]?.deaths || 0} onChange={e => handleStatChange(player.id, 'deaths', Number(e.target.value))} className="w-full sm:w-20 text-center" label="Deaths"/>
                                                <Input type="number" value={liveStats[player.id]?.headshots || 0} onChange={e => handleStatChange(player.id, 'headshots', Number(e.target.value))} className="w-full sm:w-20 text-center" label="HS"/>
                                            </div>
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