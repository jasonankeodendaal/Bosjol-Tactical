import React, { useState, useEffect, useMemo, useContext } from 'react';
import type { GameEvent, Player, InventoryItem, GamificationSettings, PaymentStatus, PlayerStats, EventStatus, EventType, Transaction, EventAttendee, Signup, CompanyDetails } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { ArrowLeftIcon, CalendarIcon, UserIcon, TrashIcon, CheckCircleIcon, CreditCardIcon, PlusIcon, ChartBarIcon, ExclamationTriangleIcon, TrophyIcon, MinusIcon, CurrencyDollarIcon, CogIcon } from './icons/Icons';
import { MOCK_EVENT_THEMES, EVENT_STATUSES, EVENT_TYPES } from '../constants';
import { BadgePill } from './BadgePill';
import { InfoTooltip } from './InfoTooltip';
import { DataContext } from '../data/DataContext';
import { UrlOrUploadField } from './UrlOrUploadField';

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
    signups: Signup[];
    setDoc: (collectionName: string, docId: string, data: object) => Promise<void>;
    deleteDoc: (collectionName: string, docId: string) => Promise<void>;
    companyDetails: CompanyDetails;
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
    absentPlayers: [],
    status: 'Upcoming',
    gameFee: 0,
    gearForRent: [],
    liveStats: {},
};

export const ManageEventPage: React.FC<ManageEventPageProps> = ({
    event, players, inventory, gamificationSettings, onBack, onSave, onDelete, setPlayers, setTransactions, signups, setDoc, deleteDoc, companyDetails
}) => {
    const dataContext = useContext(DataContext);
    const [formData, setFormData] = useState<Omit<GameEvent, 'id'>>(() => {
        if (!event) return defaultEvent;
        // Ensure date is in 'YYYY-MM-DD' format for the input
        const date = new Date(event.date).toISOString().split('T')[0];
        return { ...event, date };
    });
    
    const [liveStats, setLiveStats] = useState<Record<string, Partial<Pick<PlayerStats, 'kills' | 'deaths' | 'headshots'>>>>(event?.liveStats || {});

    const signedUpPlayersDetails = useMemo(() => {
        const signedUpPlayerIds = signups.filter(s => s.eventId === event?.id).map(s => s.playerId);
        return players.filter(p => signedUpPlayerIds.includes(p.id));
    }, [signups, event?.id, players]);


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
    
    const handleCheckIn = async (playerId: string) => {
        if (!event) return;
        const signup = signups.find(s => s.playerId === playerId && s.eventId === event.id);
        if (!signup) return;

        const newAttendee: EventAttendee = {
            playerId,
            paymentStatus: 'Unpaid',
            rentedGearIds: signup.requestedGearIds || [],
            note: signup.note,
        };
        
        // This is an optimistic update. We update the local form state immediately.
        setFormData(prev => ({
            ...prev,
            attendees: [...prev.attendees, newAttendee]
        }));
        
        // Then we perform the database operation to remove the signup doc.
        await deleteDoc('signups', signup.id);
    };

    const handleCheckOut = async (playerId: string) => {
        if (!event) return;

        const attendee = formData.attendees.find(a => a.playerId === playerId);
        if (!attendee) return;

        const newSignupData = {
            eventId: event.id,
            playerId: playerId,
            requestedGearIds: attendee.rentedGearIds || [],
            note: attendee.note || '',
        };

        // Optimistic update: update local state first
        setFormData(prev => ({
            ...prev,
            attendees: prev.attendees.filter(a => a.playerId !== playerId),
        }));
        
        // Perform database operation
        await setDoc('signups', `${event.id}_${playerId}`, newSignupData);
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
            if (attendeeInfo.paymentStatus?.startsWith('Paid') && event?.id) {
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
                {/* Left Column - Event Details & Live Stats */}
                <div className="lg:col-span-2 space-y-6">
                    <DashboardCard title="Event Configuration" icon={<CalendarIcon className="w-6 h-6" />}>
                        <div className="p-6 space-y-4">
                            <Input label="Event Title" value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} />
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Input label="Date" type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
                                <Input label="Start Time" type="time" value={formData.startTime} onChange={e => setFormData(f => ({ ...f, startTime: e.target.value }))} />
                                <Input label="Location" value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Event Type</label>
                                    <select value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value as EventType }))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                                        {EVENT_TYPES.map(type => <option key={type}>{type}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Theme</label>
                                    <select value={formData.theme} onChange={e => setFormData(f => ({ ...f, theme: e.target.value }))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                                        {MOCK_EVENT_THEMES.map(theme => <option key={theme}>{theme}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData(f => ({...f, description: e.target.value}))} rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Rules</label>
                                <textarea value={formData.rules} onChange={e => setFormData(f => ({...f, rules: e.target.value}))} rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Input label="Game Fee (R)" type="number" value={formData.gameFee} onChange={e => setFormData(f => ({ ...f, gameFee: Number(e.target.value) }))} />
                                <Input label="Participation XP" type="number" value={formData.participationXp} onChange={e => setFormData(f => ({ ...f, participationXp: Number(e.target.value) }))} />
                                 <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Event Status</label>
                                    <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value as EventStatus }))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                                        {EVENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <UrlOrUploadField
                                    label="Event Image"
                                    fileUrl={formData.imageUrl}
                                    onUrlSet={(url) => setFormData(f => ({...f, imageUrl: url}))}
                                    onRemove={() => setFormData(f => ({...f, imageUrl: ''}))}
                                    accept="image/*"
                                    apiServerUrl={companyDetails.apiServerUrl}
                                />
                                <UrlOrUploadField
                                    label="Audio Briefing"
                                    fileUrl={formData.audioBriefingUrl}
                                    onUrlSet={(url) => setFormData(f => ({...f, audioBriefingUrl: url}))}
                                    onRemove={() => setFormData(f => ({...f, audioBriefingUrl: ''}))}
                                    accept="audio/*"
                                    previewType="audio"
                                    apiServerUrl={companyDetails.apiServerUrl}
                                />
                            </div>
                        </div>
                    </DashboardCard>
                    <DashboardCard title="Event Live Stats" icon={<ChartBarIcon className="w-6 h-6" />}>
                        <div className="p-6">
                            <ul className="space-y-3">
                                {attendeesDetails.map(player => (
                                    <li key={player.id} className="bg-zinc-900/50 p-3 rounded-lg">
                                        <p className="font-bold text-white mb-2">{player.name}</p>
                                        <div className="grid grid-cols-3 gap-3">
                                            <Input 
                                                label="Kills" type="number" 
                                                value={liveStats[player.id]?.kills || 0}
                                                onChange={e => handleStatChange(player.id, 'kills', Number(e.target.value))}
                                                className="!py-1.5 text-center"
                                            />
                                            <Input 
                                                label="Deaths" type="number"
                                                value={liveStats[player.id]?.deaths || 0}
                                                onChange={e => handleStatChange(player.id, 'deaths', Number(e.target.value))}
                                                className="!py-1.5 text-center"
                                            />
                                            <Input 
                                                label="Headshots" type="number"
                                                value={liveStats[player.id]?.headshots || 0}
                                                onChange={e => handleStatChange(player.id, 'headshots', Number(e.target.value))}
                                                className="!py-1.5 text-center"
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </DashboardCard>
                </div>

                {/* Right Column - Players & Actions */}
                <div className="lg:col-span-1 space-y-6">
                     <DashboardCard title={`Signed Up (${signedUpPlayersDetails.length})`} icon={<UserIcon className="w-6 h-6" />}>
                        <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                            {signedUpPlayersDetails.length > 0 ? signedUpPlayersDetails.map(player => (
                                <div key={player.id} className="bg-zinc-800/50 p-2 rounded-md flex justify-between items-center">
                                    <p className="font-semibold text-white">{player.name}</p>
                                    <Button size="sm" onClick={() => handleCheckIn(player.id)}>Check In</Button>
                                </div>
                            )) : <p className="text-center text-gray-500 text-sm py-4">No players signed up yet.</p>}
                        </div>
                    </DashboardCard>
                    <DashboardCard title={`Attendees (${formData.attendees.length})`} icon={<UserIcon className="w-6 h-6" />}>
                        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                             {attendeesDetails.length > 0 ? attendeesDetails.map(player => {
                                const attendee = formData.attendees.find(a => a.playerId === player.id)!;
                                return (
                                <div key={player.id} className="bg-zinc-800/50 p-3 rounded-md">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-white">{player.name}</p>
                                        <Button size="sm" variant="danger" onClick={() => handleCheckOut(player.id)}>
                                            <MinusIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex gap-2 items-center mt-2">
                                        <Button size="sm" variant={attendee.paymentStatus === 'Paid (Card)' ? 'primary' : 'secondary'} onClick={() => handlePaymentStatus(player.id, 'Paid (Card)')}>Card</Button>
                                        <Button size="sm" variant={attendee.paymentStatus === 'Paid (Cash)' ? 'primary' : 'secondary'} onClick={() => handlePaymentStatus(player.id, 'Paid (Cash)')}>Cash</Button>
                                        <Button size="sm" variant={attendee.paymentStatus === 'Unpaid' ? 'primary' : 'secondary'} onClick={() => handlePaymentStatus(player.id, 'Unpaid')}>Unpaid</Button>
                                    </div>
                                </div>
                                )
                             }) : <p className="text-center text-gray-500 text-sm py-4">No players checked in.</p>}
                        </div>
                    </DashboardCard>
                    <div className="space-y-3">
                         {event && formData.status === 'Completed' && (
                            <div className="bg-green-900/50 border border-green-700 p-3 rounded-lg text-center">
                                <CheckCircleIcon className="w-8 h-8 mx-auto text-green-400 mb-2" />
                                <p className="font-semibold text-green-300">This event has been finalized.</p>
                                <p className="text-xs text-green-400">XP and stats have been awarded.</p>
                            </div>
                        )}
                        {event && formData.status !== 'Completed' && (
                            <Button onClick={handleFinalizeEvent} variant="primary" className="w-full !bg-green-600 hover:!bg-green-500">
                                <CheckCircleIcon className="w-5 h-5 mr-2" />
                                Finalize Event & Award XP
                            </Button>
                        )}
                        <Button onClick={handleSaveClick} variant="secondary" className="w-full">
                            Save Changes
                        </Button>
                        {event && (
                            <Button onClick={() => onDelete(event.id)} variant="danger" className="w-full">
                                <TrashIcon className="w-5 h-5 mr-2" />
                                Delete Event
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
