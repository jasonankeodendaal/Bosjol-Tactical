import React, { useState, useEffect, useMemo, useContext } from 'react';
// FIX: Add EventAttendee to the type imports to resolve error on line 76.
import type { GameEvent, Player, InventoryItem, GamificationSettings, PaymentStatus, PlayerStats, EventStatus, EventType, Transaction, EventAttendee } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
// FIX: Add CurrencyDollarIcon to the icon imports to resolve error on line 333.
import { ArrowLeftIcon, CalendarIcon, UserIcon, TrashIcon, CheckCircleIcon, CreditCardIcon, PlusIcon, ChartBarIcon, ExclamationTriangleIcon, TrophyIcon, MinusIcon, CurrencyDollarIcon } from './icons/Icons';
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
    const dataContext = useContext(DataContext);
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
                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                    <DashboardCard title="Event Details" icon={<CalendarIcon className="w-6 h-6"/>}>
                        <div className="p-6 space-y-4">
                            <Input label="Event Title" value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} />
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Type</label>
                                    <select value={formData.type} onChange={e => setFormData(f => ({...f, type: e.target.value as EventType}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                                        {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Theme</label>
                                    <select value={formData.theme} onChange={e => setFormData(f => ({...f, theme: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                                        {MOCK_EVENT_THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Date" type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
                                <Input label="Start Time" type="time" value={formData.startTime} onChange={e => setFormData(f => ({ ...f, startTime: e.target.value }))} />
                            </div>
                            <Input label="Location" value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} />
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData(f => ({...f, description: e.target.value}))} rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Rules</label>
                                <textarea value={formData.rules} onChange={e => setFormData(f => ({...f, rules: e.target.value}))} rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                            </div>
                        </div>
                    </DashboardCard>
                    <DashboardCard title="Media" icon={<UserIcon className="w-6 h-6" />}>
                        <div className="p-6 space-y-4">
                            <UrlOrUploadField
                                label="Event Image"
                                fileUrl={formData.imageUrl}
                                onUrlSet={(url) => setFormData(f => ({...f, imageUrl: url}))}
                                onRemove={() => setFormData(f => ({...f, imageUrl: ''}))}
                                accept="image/*"
                                apiServerUrl={dataContext?.companyDetails.apiServerUrl}
                            />
                             <UrlOrUploadField
                                label="Audio Briefing"
                                fileUrl={formData.audioBriefingUrl}
                                onUrlSet={(url) => setFormData(f => ({...f, audioBriefingUrl: url}))}
                                onRemove={() => setFormData(f => ({...f, audioBriefingUrl: ''}))}
                                accept="audio/*"
                                previewType="audio"
                                apiServerUrl={dataContext?.companyDetails.apiServerUrl}
                            />
                        </div>
                    </DashboardCard>
                </div>
                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* The rest of the page... */}
                </div>
            </div>
        </div>
    );
};