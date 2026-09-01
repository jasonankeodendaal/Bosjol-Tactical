import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import type { GameEvent, Player, InventoryItem, GamificationSettings, PaymentStatus, PlayerStats, EventStatus, EventType, Transaction, EventAttendee, Signup, CompanyDetails, LegendaryBadge, XpAdjustment, Rank, Tier } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { ArrowLeftIcon, CalendarIcon, UserIcon, UsersIcon, TrashIcon, CheckCircleIcon, CreditCardIcon, PlusIcon, ChartBarIcon, ExclamationTriangleIcon, TrophyIcon, MinusIcon, CurrencyDollarIcon, CogIcon } from './icons/Icons';
import { MOCK_EVENT_THEMES, EVENT_STATUSES, EVENT_TYPES, UNRANKED_TIER, MOCK_LOCATIONS } from '../constants';
import { BadgePill } from './BadgePill';
import { InfoTooltip } from './InfoTooltip';
import { DataContext } from '../data/DataContext';
import { UrlOrUploadField } from './UrlOrUploadField';
import { QrCode, Ban, RotateCcw, Database, Sparkles, Image as ImageIcon, Palette } from 'lucide-react';
import { EventQRCodeModal } from './EventQRCodeModal';
import { EventPosterModal } from './EventPosterModal';

interface ManageEventPageProps {
    event?: GameEvent;
    players: Player[];
    inventory: InventoryItem[];
    gamificationSettings: GamificationSettings;
    legendaryBadges: LegendaryBadge[];
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
    winXpAward: 50,
    attendees: [],
    status: 'Upcoming',
    gameFee: 0,
    gearForRent: [],
    eventBadges: [],
    liveStats: {},
    teamCount: 2,
    teams: { alpha: [], bravo: [] },
};

import { getRankForPlayer } from '../utils/rankUtils';


export const ManageEventPage: React.FC<ManageEventPageProps> = ({
    event, players, inventory, gamificationSettings, legendaryBadges, onBack, onSave, onDelete, setPlayers, setTransactions, signups, setDoc, deleteDoc, companyDetails
}) => {
    const dataContext = useContext(DataContext);
    const availableLocations = useMemo(() => {
        const ctxLocs = dataContext?.locations || [];
        return ctxLocs.length > 0 ? ctxLocs : MOCK_LOCATIONS;
    }, [dataContext?.locations]);

    const [showQRModal, setShowQRModal] = useState(false);
    const [showPosterModal, setShowPosterModal] = useState(false);
    const [formData, setFormData] = useState<Omit<GameEvent, 'id'>>(() => {
        if (!event) return defaultEvent;
        // Ensure date is in 'YYYY-MM-DD' format for the input
        const date = new Date(event.date).toISOString().split('T')[0];
        return { ...event, date };
    });
    
    const [liveStats, setLiveStats] = useState<Record<string, Partial<Pick<PlayerStats, 'kills' | 'deaths' | 'headshots'>>>>(event?.liveStats || {});
    
    // --- Audio Recording State & Handlers ---
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [permissionError, setPermissionError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingIntervalRef = useRef<number | null>(null);

    const stopRecordingCleanup = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.stream) {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }
        setIsRecording(false);
        setRecordingSeconds(0);
    }

    const handleStartRecording = async () => {
        setPermissionError(null);
        setFormData(f => ({ ...f, audioBriefingUrl: undefined })); // Clear previous recording

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            const audioChunks: Blob[] = [];

            mediaRecorderRef.current.addEventListener("dataavailable", event => {
                audioChunks.push(event.data);
            });

            mediaRecorderRef.current.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); // webm is well supported
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    setFormData(f => ({ ...f, audioBriefingUrl: base64data }));
                };
                stopRecordingCleanup();
            });

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingSeconds(0);
            recordingIntervalRef.current = window.setInterval(() => {
                setRecordingSeconds(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setPermissionError("Microphone access denied. Please allow microphone permissions in your browser settings and try again.");
            stopRecordingCleanup();
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }
    };

    const handleRemoveAudio = () => {
        setFormData(f => ({ ...f, audioBriefingUrl: undefined }));
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };
    // --- End Audio Recording ---


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

    const handleAssignPlayerTeam = (playerId: string, teamKey: string | null) => {
        setFormData(prev => {
            const currentTeams = { ...(prev.teams || { alpha: [], bravo: [] }) };
            Object.keys(currentTeams).forEach(key => {
                currentTeams[key] = (currentTeams[key] || []).filter(id => id !== playerId);
            });
            if (teamKey) {
                currentTeams[teamKey] = [...(currentTeams[teamKey] || []), playerId];
            }
            return { ...prev, teams: currentTeams };
        });
    };

    const handleAutoBalanceTeams = () => {
        const count = formData.teamCount || 2;
        const activeTeams: string[] = ['alpha', 'bravo'];
        if (count >= 3) activeTeams.push('charlie');
        if (count === 4) activeTeams.push('delta');

        const candidateIds = formData.attendees.length > 0 
            ? formData.attendees.map(a => a.playerId) 
            : signedUpPlayersDetails.map(p => p.id);

        if (candidateIds.length === 0) {
            alert("No checked-in operators or signed up players to balance into teams!");
            return;
        }

        const shuffled = [...candidateIds].sort(() => Math.random() - 0.5);
        const newTeams: Record<string, string[]> = {
            alpha: [],
            bravo: [],
            charlie: [],
            delta: []
        };

        shuffled.forEach((playerId, index) => {
            const teamIndex = index % count;
            const assignedTeamKey = activeTeams[teamIndex];
            newTeams[assignedTeamKey].push(playerId);
        });

        setFormData(prev => ({
            ...prev,
            teams: newTeams
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

    const handleFinalizeEvent = async () => {
        if (!confirm('Are you sure you want to finalize this event? This will award/deduct RP for all involved players and cannot be easily undone.')) {
            return;
        }
    
        const noShowPenaltyRule = gamificationSettings.find(r => r.id === 'g_no_show_penalty');
        const noShowPenaltyXp = noShowPenaltyRule ? noShowPenaltyRule.xp : 0; // This value is negative
    
        const attendeePlayerIds = new Set(formData.attendees.map(a => a.playerId));
        const eventSignups = signups.filter(s => s.eventId === event?.id);
        const noShowPlayerIds = new Set(
            eventSignups.filter(s => !attendeePlayerIds.has(s.playerId)).map(s => s.playerId)
        );
    
        const newTransactions: Transaction[] = [];
    
        const updatedPlayers = players.map(player => {
            let mutablePlayer = { ...player };
    
            // Case 1: Player attended the event
            const attendeeInfo = formData.attendees.find(a => a.playerId === player.id);
            if (attendeeInfo) {
                let xpGained = formData.participationXp || 50;
                let matchResult: "win" | "loss" | "draw" | undefined = undefined;

                if (formData.winningTeamId) {
                    const playerTeam = Object.keys(formData.teams || {}).find(teamKey =>
                        formData.teams?.[teamKey]?.includes(player.id)
                    );
                    
                    if (formData.winningTeamId === "tie") {
                        matchResult = "draw";
                    } else if (playerTeam) {
                        if (formData.winningTeamId === playerTeam) {
                            matchResult = "win";
                            xpGained += (formData.winXpAward || 50);
                        } else {
                            matchResult = "loss";
                        }
                    }
                }
    
                if (attendeeInfo.paymentStatus?.startsWith('Paid') && event?.id) {
                    newTransactions.push({
                        id: `txn-${event.id}-${player.id}-fee`,
                        date: formData.date, type: 'Event Revenue', description: `Event Fee: ${formData.title}`,
                        amount: formData.gameFee, relatedEventId: event.id, relatedPlayerId: player.id,
                        paymentStatus: attendeeInfo.paymentStatus
                    });
                    (attendeeInfo.rentedGearIds || []).forEach(gearId => {
                        const gear = inventory.find(i => i.id === gearId);
                        if (gear) {
                            const rentalPrice = formData.rentalPriceOverrides?.[gearId] ?? gear.salePrice;
                            newTransactions.push({
                                id: `txn-${event.id}-${player.id}-${gearId}`, date: formData.date,
                                type: 'Rental Revenue', description: `Rental: ${gear.name}`, amount: rentalPrice,
                                relatedEventId: event.id, relatedPlayerId: player.id, relatedInventoryId: gearId,
                                paymentStatus: attendeeInfo.paymentStatus
                            });
                        }
                    });
                }
    
                const newMatchRecord = {
                    eventId: event!.id,
                    result: matchResult,
                    playerStats: {
                        kills: 0,
                        deaths: 0,
                        headshots: 0,
                    }
                };
    
                const currentStats = mutablePlayer.stats || { kills: 0, deaths: 0, headshots: 0, gamesPlayed: 0, xp: 0 };
                
                // Check and award event badges to attendee
                const eventBadgeIds = formData.eventBadges || [];
                const availableBadges = dataContext?.badges || [];
                const badgesToAward = availableBadges.filter(b => eventBadgeIds.includes(b.id));
                const newBadgesForPlayer = badgesToAward.filter(b => !(mutablePlayer.badges || []).some(pb => pb.id === b.id));

                mutablePlayer = {
                    ...mutablePlayer,
                    stats: {
                        ...currentStats,
                        xp: currentStats.xp + xpGained,
                        kills: currentStats.kills,
                        deaths: currentStats.deaths,
                        headshots: currentStats.headshots,
                        gamesPlayed: currentStats.gamesPlayed + 1,
                    },
                    badges: newBadgesForPlayer.length > 0 
                        ? [...(mutablePlayer.badges || []), ...newBadgesForPlayer] 
                        : (mutablePlayer.badges || []),
                    matchHistory: [...(mutablePlayer.matchHistory || []), newMatchRecord]
                };

                // Trigger badge earned notifications
                newBadgesForPlayer.forEach(badge => {
                    dataContext?.createNotification?.({
                        title: `Badge Earned: ${mutablePlayer.name}`,
                        message: `${mutablePlayer.name} (${mutablePlayer.playerCode}) earned the "${badge.name}" badge in ${formData.title}!`,
                        type: 'badge_earned',
                        playerId: mutablePlayer.id,
                        playerName: `${mutablePlayer.name} ${mutablePlayer.surname || ''}`.trim(),
                        playerCallsign: mutablePlayer.callsign,
                        playerCode: mutablePlayer.playerCode,
                        playerAvatarUrl: mutablePlayer.avatarUrl,
                        badgeName: badge.name,
                        badgeIconUrl: badge.iconUrl,
                        eventId: event?.id,
                        eventTitle: formData.title,
                    });
                });
            }
            // Case 2: Player was a no-show
            else if (noShowPlayerIds.has(player.id) && noShowPenaltyXp < 0) {
                const currentStats = mutablePlayer.stats || { kills: 0, deaths: 0, headshots: 0, gamesPlayed: 0, xp: 0 };
                const newXp = currentStats.xp + noShowPenaltyXp;
                const newAdjustment: XpAdjustment = {
                    amount: noShowPenaltyXp,
                    reason: `Penalty for no-show at event: ${formData.title}`,
                    date: new Date().toISOString(),
                };
                mutablePlayer = {
                    ...mutablePlayer,
                    stats: { ...currentStats, xp: newXp },
                    xpAdjustments: [...(mutablePlayer.xpAdjustments || []), newAdjustment],
                };
            }
    
            // Recalculate rank for any player whose XP changed
            if (mutablePlayer.stats && mutablePlayer.stats.xp !== (player.stats?.xp ?? 0)) {
                const newRank = getRankForPlayer(mutablePlayer, dataContext!.ranks);
                if (newRank) {
                    // Check if player ranked up
                    if (player.rank && newRank.id !== player.rank.id && newRank.minXp > player.rank.minXp) {
                        dataContext?.createNotification?.({
                            title: `Rank Promoted: ${mutablePlayer.name}`,
                            message: `${mutablePlayer.name} (${mutablePlayer.playerCode}) achieved the rank of ${newRank.name}!`,
                            type: 'rank_up',
                            playerId: mutablePlayer.id,
                            playerName: `${mutablePlayer.name} ${mutablePlayer.surname || ''}`.trim(),
                            playerCallsign: mutablePlayer.callsign,
                            playerCode: mutablePlayer.playerCode,
                            playerAvatarUrl: mutablePlayer.avatarUrl,
                            rankTierName: newRank.name,
                            rankIconUrl: newRank.iconUrl,
                            eventId: event?.id,
                            eventTitle: formData.title,
                        });
                    }
                    mutablePlayer.rank = newRank;
                }
            }
    
            return mutablePlayer;
        });
    
        setPlayers(updatedPlayers);
        setTransactions(prev => [...prev, ...newTransactions]);
    
        const finalEventData: GameEvent = {
            ...(event || {}), ...formData,
            id: event?.id || '', status: 'Completed',
            liveStats: liveStats,
        };
        onSave(finalEventData);
        dataContext?.logActivity(`Finalized event: ${finalEventData.title}`, { eventId: finalEventData.id });
    
        // Clean up all signups for this finalized event
        const cleanupPromises = eventSignups.map(signup => deleteDoc('signups', signup.id));
        await Promise.all(cleanupPromises);
    };

    const handleGearToggle = (itemId: string) => {
        setFormData(prev => {
            const gearForRent = prev.gearForRent || [];
            const isCurrentlyChecked = gearForRent.includes(itemId);
            let newGear;
            let newOverrides = { ...(prev.rentalPriceOverrides || {}) };
    
            if (isCurrentlyChecked) {
                newGear = gearForRent.filter(id => id !== itemId);
                // Remove the price override when the item is deselected
                delete newOverrides[itemId];
            } else {
                newGear = [...gearForRent, itemId];
            }
            
            return { ...prev, gearForRent: newGear, rentalPriceOverrides: newOverrides };
        });
    };

    const handlePriceOverrideChange = (itemId: string, priceStr: string) => {
        const price = Number(priceStr);
        if (isNaN(price) || price < 0) return;
    
        setFormData(prev => {
            const overrides = { ...(prev.rentalPriceOverrides || {}) };
            const item = inventory.find(i => i.id === itemId);
    
            // If the new price is the same as the default, we can remove the override to keep data clean
            if (item && item.salePrice === price) {
                delete overrides[itemId];
            } else {
                overrides[itemId] = price;
            }
    
            return { ...prev, rentalPriceOverrides: overrides };
        });
    };

    const handleBadgeToggle = (badgeId: string) => {
        setFormData(prev => {
            const eventBadges = prev.eventBadges || [];
            const newBadges = eventBadges.includes(badgeId)
                ? eventBadges.filter(id => id !== badgeId)
                : [...eventBadges, badgeId];
            return { ...prev, eventBadges: newBadges };
        });
    };

    const handleSaveClick = () => {
        if (formData.status === 'Active') {
            const unpaid = formData.attendees.filter(a => a.paymentStatus === 'Unpaid');
            if (unpaid.length > 0) {
                const unpaidNames = unpaid.map(a => {
                    const p = players.find(player => player.id === a.playerId);
                    return p ? (p.callsign || p.name) : 'Unknown Player';
                }).join(', ');
                alert(`Cannot save as Active! The following checked-in players must have a payment method chosen first: ${unpaidNames}.`);
                return;
            }
        }
        const eventData = {
             ...(event || {}),
            ...formData,
            id: event?.id || '',
            liveStats: liveStats,
        };
        onSave(eventData);
    };

    const handleCancelEvent = async () => {
        if (!event) return;
        if (!confirm(`Are you sure you want to cancel "${formData.title || event.title}"? The event will be marked as Cancelled and players will be notified.`)) {
            return;
        }

        const cancelledEventData: GameEvent = {
            ...(event || {}),
            ...formData,
            id: event.id,
            status: 'Cancelled',
            liveStats: liveStats,
        };

        setFormData(prev => ({ ...prev, status: 'Cancelled' }));
        onSave(cancelledEventData);
        dataContext?.logActivity(`Cancelled event: ${cancelledEventData.title}`, { eventId: cancelledEventData.id });
        dataContext?.createNotification?.({
            title: `Event Cancelled: ${cancelledEventData.title}`,
            message: `The event "${cancelledEventData.title}" scheduled for ${cancelledEventData.date} has been officially cancelled.`,
            type: 'system',
            eventId: cancelledEventData.id,
            eventTitle: cancelledEventData.title,
        });
    };

    const handleReactivateEvent = () => {
        if (!event) return;
        const reactivatedEventData: GameEvent = {
            ...(event || {}),
            ...formData,
            id: event.id,
            status: 'Upcoming',
            liveStats: liveStats,
        };

        setFormData(prev => ({ ...prev, status: 'Upcoming' }));
        onSave(reactivatedEventData);
        dataContext?.logActivity(`Reactivated event: ${reactivatedEventData.title}`, { eventId: reactivatedEventData.id });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Button onClick={onBack} variant="secondary" size="sm" className="mr-4">
                        <ArrowLeftIcon className="w-5 h-5" />
                    </Button>
                    <h1 className="text-2xl font-bold text-white">{event ? 'Manage Event' : 'Create New Event'}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setShowPosterModal(true)}
                        size="sm"
                        className="!bg-gradient-to-r !from-red-700 !to-red-600 hover:!from-red-600 hover:!to-red-500 text-white font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                    >
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Generate Poster (JPG)</span>
                    </Button>
                    {event && (
                        <Button
                            onClick={() => setShowQRModal(true)}
                            size="sm"
                            className="!bg-zinc-900 hover:!bg-red-900/60 !border !border-red-500/40 text-red-400 font-bold flex items-center gap-2"
                        >
                            <QrCode className="w-4 h-4 text-red-400" />
                            <span>Enlarge Event QR Pass</span>
                        </Button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Event Details & Live Stats */}
                <div className="lg:col-span-2 space-y-6">
                    <DashboardCard title="Event Configuration" icon={<CalendarIcon className="w-6 h-6" />}>
                        <div className="p-6 space-y-4">
                            <Input label="Event Title" value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} />
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-sm font-medium text-gray-400 flex items-center gap-1.5">
                                            <Sparkles className="w-4 h-4 text-red-500 shrink-0" />
                                            <span>Game Type / Scenario Setup</span>
                                        </label>
                                        {formData.gameTypeId && (
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/60 font-semibold tracking-wider uppercase flex items-center gap-1 shrink-0">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                LINKED
                                            </span>
                                        )}
                                    </div>
                                    <select
                                        value={formData.gameTypeId || ''}
                                        onChange={(e) => {
                                            const selectedId = e.target.value;
                                            if (!selectedId) {
                                                setFormData((f) => ({ ...f, gameTypeId: undefined }));
                                            } else {
                                                const selectedType = dataContext?.gameTypes?.find((gt) => gt.id === selectedId);
                                                if (selectedType) {
                                                    setFormData((f) => ({
                                                        ...f,
                                                        gameTypeId: selectedType.id,
                                                        type: (selectedType.category || 'Scenario') as EventType,
                                                        title: f.title || selectedType.name,
                                                        description: selectedType.description || f.description,
                                                        rules: selectedType.rules || f.rules,
                                                        theme: selectedType.theme || f.theme,
                                                        imageUrl: selectedType.imageUrl || f.imageUrl,
                                                        audioBriefingUrl: selectedType.audioBriefingUrl || f.audioBriefingUrl,
                                                        participationXp: selectedType.participationXp ?? f.participationXp,
                                                    }));
                                                }
                                            }
                                        }}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-medium truncate"
                                    >
                                        <option value="">-- Select Game Type / Scenario --</option>
                                        {dataContext?.gameTypes && dataContext.gameTypes.length > 0 ? (
                                            Object.entries(
                                                dataContext.gameTypes.reduce((acc, gt) => {
                                                    const cat = gt.category || 'Scenario';
                                                    if (!acc[cat]) acc[cat] = [];
                                                    acc[cat].push(gt);
                                                    return acc;
                                                }, {} as Record<string, GameType[]>)
                                            ).map(([cat, gts]) => (
                                                <optgroup key={cat} label={cat}>
                                                    {gts.map((gt) => (
                                                        <option key={gt.id} value={gt.id}>
                                                            {gt.name} (+{gt.participationXp ?? 50} XP)
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))
                                        ) : (
                                            <option value="" disabled>
                                                No Game Types configured in Admin Setup
                                            </option>
                                        )}
                                    </select>
                                    {formData.gameTypeId ? (
                                        (() => {
                                            const linkedGt = dataContext?.gameTypes?.find(g => g.id === formData.gameTypeId);
                                            return (
                                                <div className="mt-1.5 flex items-center justify-between gap-2 px-2.5 py-1.5 bg-zinc-950/80 border border-red-900/40 rounded-md text-[11px] text-zinc-300">
                                                    <div className="flex items-center gap-2 truncate">
                                                        <span className="font-semibold text-white truncate">{linkedGt?.name || 'Scenario'}</span>
                                                        <span className="text-amber-400 font-mono font-bold shrink-0">+{linkedGt?.participationXp ?? 50} XP</span>
                                                        {linkedGt?.rules && <span className="text-emerald-400 text-[10px] hidden md:inline">✓ Rules</span>}
                                                        {linkedGt?.imageUrl && <span className="text-blue-400 text-[10px] hidden md:inline">✓ Media</span>}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData((f) => ({ ...f, gameTypeId: undefined }))}
                                                        className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider hover:underline shrink-0"
                                                    >
                                                        Unlink
                                                    </button>
                                                </div>
                                            );
                                        })()
                                    ) : (
                                        <p className="text-[11px] text-zinc-500 mt-1 leading-tight">
                                            Loads rules, media & XP configured under Game Types Setup in Admin.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5 flex items-center gap-1.5">
                                        <Palette className="w-4 h-4 text-red-500 shrink-0" />
                                        <span>Theme (Poster Artwork Concept)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.theme || ''}
                                        onChange={(e) => setFormData((f) => ({ ...f, theme: e.target.value }))}
                                        placeholder="e.g. Tactical Night Raid with red neon accents, dark fog"
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-zinc-600 font-medium"
                                    />
                                    <p className="text-[11px] text-zinc-500 mt-1 leading-tight">
                                        Enter a custom theme prompt or visual poster artwork idea.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Input label="Date" type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
                                <Input label="Start Time" type="time" value={formData.startTime} onChange={e => setFormData(f => ({ ...f, startTime: e.target.value }))} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Location</label>
                                    <select
                                        value={formData.location}
                                        onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="">-- Select Preset Location --</option>
                                        {availableLocations.map(loc => (
                                            <option key={loc.id || loc.name} value={loc.name}>
                                                {loc.name}{loc.address ? ` (${loc.address})` : ''}
                                            </option>
                                        ))}
                                        {formData.location && !availableLocations.some(l => l.name === formData.location) && (
                                            <option value={formData.location}>{formData.location}</option>
                                        )}
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
                             <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Gear Available for Rent</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto bg-zinc-900/50 p-2 rounded-md border border-zinc-700/50">
                                    {inventory.filter(i => i.isRental).map(item => {
                                        const isChecked = (formData.gearForRent || []).includes(item.id);
                                        const overridePrice = formData.rentalPriceOverrides?.[item.id];
                                        return (
                                            <div key={item.id} className="bg-zinc-800 p-2 rounded-md">
                                                <div className="flex items-center justify-between">
                                                    <label className="flex items-center gap-3 cursor-pointer flex-grow">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => handleGearToggle(item.id)}
                                                            className="h-4 w-4 rounded border-gray-600 bg-zinc-700 text-red-500 focus:ring-red-500"
                                                        />
                                                        <span className="text-sm text-gray-200">{item.name}</span>
                                                    </label>
                                                    <span className="text-xs text-gray-500 mr-2">Default: R{item.salePrice.toFixed(2)}</span>
                                                </div>
                                                {isChecked && (
                                                    <div className="mt-2 pl-7">
                                                        <Input 
                                                            label="Event Rental Price (R)"
                                                            type="number"
                                                            value={overridePrice ?? item.salePrice}
                                                            onChange={(e) => handlePriceOverrideChange(item.id, e.target.value)}
                                                            className="!py-1.5"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Event Commendations (Badges)</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto bg-zinc-900/50 p-2 rounded-md border border-zinc-700/50">
                                    {legendaryBadges.map(badge => (
                                        <label key={badge.id} className="flex items-center gap-3 p-2 rounded-md bg-zinc-800 hover:bg-zinc-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={(formData.eventBadges || []).includes(badge.id)}
                                                onChange={() => handleBadgeToggle(badge.id)}
                                                className="h-4 w-4 rounded border-gray-600 bg-zinc-700 text-red-500 focus:ring-red-500"
                                            />
                                            {badge.iconUrl && badge.iconUrl.trim() !== '' ? (
                                                <img src={badge.iconUrl} alt={badge.name} className="w-6 h-6 object-contain"/>
                                            ) : (
                                                <SparklesIcon className="w-6 h-6 text-amber-400" />
                                            )}
                                            <span className="text-sm text-amber-300">{badge.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2 mt-4">
                                <label className="block text-sm font-bold text-white flex items-center gap-2">
                                    <UsersIcon className="w-4 h-4 text-red-500" />
                                    Teams Format (Optional Toggle: 2, 3, or 4 Teams)
                                </label>
                                <p className="text-xs text-zinc-400">Select how many teams participate in this scenario or skirmish event.</p>
                                <div className="grid grid-cols-3 gap-2 pt-1">
                                    {[2, 3, 4].map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setFormData(f => ({ ...f, teamCount: num }))}
                                            className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 ${
                                                (formData.teamCount || 2) === num
                                                    ? 'bg-red-600/90 text-white border-red-500 shadow-md shadow-red-950'
                                                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                                            }`}
                                        >
                                            <span className="text-sm font-black">{num} Teams</span>
                                            <span className="text-[10px] font-mono opacity-80">
                                                {num === 2 ? 'Alpha vs Bravo' : num === 3 ? 'Alpha / Bravo / Charlie' : '4-Way Battle'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <Input label="Game Fee (R)" type="number" value={formData.gameFee} onChange={e => setFormData(f => ({ ...f, gameFee: Number(e.target.value) }))} />
                                <Input label="Participation RP" type="number" value={formData.participationXp} onChange={e => setFormData(f => ({ ...f, participationXp: Number(e.target.value) }))} />
                                <Input label="Win Bonus RP" type="number" value={formData.winXpAward ?? 50} onChange={e => setFormData(f => ({ ...f, winXpAward: Number(e.target.value) }))} />
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Event Status</label>
                                    <select 
                                        value={formData.status} 
                                        onChange={e => {
                                            const newStatus = e.target.value as EventStatus;
                                            if (newStatus === 'Active') {
                                                const unpaid = formData.attendees.filter(a => a.paymentStatus === 'Unpaid');
                                                if (unpaid.length > 0) {
                                                    const unpaidNames = unpaid.map(a => {
                                                        const p = players.find(player => player.id === a.playerId);
                                                        return p ? (p.callsign || p.name) : 'Unknown Player';
                                                    }).join(', ');
                                                    alert(`Cannot set status to Active! The following checked-in players must have a payment method chosen first: ${unpaidNames}.`);
                                                    return;
                                                }
                                            }
                                            setFormData(f => ({ ...f, status: newStatus }));
                                        }} 
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        {EVENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-700/50 mt-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!!formData.votingEnabled}
                                        onChange={(e) => setFormData(f => ({ ...f, votingEnabled: e.target.checked }))}
                                        className="h-5 w-5 rounded border-gray-600 bg-zinc-700 text-red-500 focus:ring-red-500"
                                    />
                                    <div>
                                        <span className="text-white font-bold">Enable Game Type Voting</span>
                                        <p className="text-xs text-gray-400">Allow players to vote for their preferred game type when signing up.</p>
                                    </div>
                                </label>
                                
                                {formData.votingEnabled && (
                                    <div className="mt-3 text-sm text-zinc-300">
                                        <h4 className="font-bold text-red-400 mb-2">Current Votes:</h4>
                                        {Object.keys(formData.gameTypeVotes || {}).length > 0 ? (
                                            <ul className="list-disc pl-5">
                                                {Object.entries(
                                                    Object.values(formData.gameTypeVotes || {}).reduce((acc, gameTypeId) => {
                                                        acc[gameTypeId] = (acc[gameTypeId] || 0) + 1;
                                                        return acc;
                                                    }, {} as Record<string, number>)
                                                ).map(([gameTypeId, count]) => {
                                                    const gtName = dataContext?.gameTypes?.find(g => g.id === gameTypeId)?.name || gameTypeId;
                                                    return (
                                                        <li key={gameTypeId}>{gtName}: <span className="font-bold text-amber-400">{count} vote(s)</span></li>
                                                    );
                                                })}
                                            </ul>
                                        ) : (
                                            <p className="italic text-zinc-500">No votes yet.</p>
                                        )}
                                    </div>
                                )}
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Audio Briefing</label>
                                    <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-700/50 min-h-[96px] flex flex-col justify-center">
                                        {formData.audioBriefingUrl && !isRecording && (
                                            <div className="flex items-center gap-4">
                                                <audio src={formData.audioBriefingUrl} controls className="flex-grow w-full" />
                                                <div className="flex flex-col gap-2">
                                                    <Button variant="secondary" size="sm" onClick={handleStartRecording}>Record Again</Button>
                                                    <Button variant="danger" size="sm" onClick={handleRemoveAudio}>Remove</Button>
                                                </div>
                                            </div>
                                        )}
                                
                                        {isRecording && (
                                            <div className="flex items-center justify-center gap-4 p-4">
                                                <div className="relative w-6 h-6">
                                                    <div className="absolute inset-0 bg-red-600 rounded-full animate-ping"></div>
                                                    <div className="relative w-6 h-6 bg-red-600 rounded-full border-2 border-zinc-900"></div>
                                                </div>
                                                <p className="font-mono text-lg text-red-400">{formatTime(recordingSeconds)}</p>
                                                <Button variant="danger" onClick={handleStopRecording}>Stop</Button>
                                            </div>
                                        )}
                                
                                        {!formData.audioBriefingUrl && !isRecording && (
                                            <Button variant="secondary" className="w-full" onClick={handleStartRecording}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-1a6 6 0 11-12 0H3a7.001 7.001 0 006 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-2v-2.07z" clipRule="evenodd" /></svg>
                                                Record Briefing
                                            </Button>
                                        )}
                                
                                        {permissionError && (
                                             <p className="text-xs text-red-400 mt-2 text-center">{permissionError}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DashboardCard>
                    <DashboardCard 
                        title={`Team Rosters (${formData.teamCount || 2} Teams)`} 
                        icon={<UsersIcon className="w-6 h-6 text-red-500" />}
                        headerAction={
                            <Button size="sm" onClick={handleAutoBalanceTeams} className="!bg-red-600 hover:!bg-red-500 text-xs">
                                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                Auto-Balance Teams
                            </Button>
                        }
                    >
                        <div className="p-6 space-y-6">
                            {/* Active Team Grid */}
                            <div className={`grid grid-cols-1 ${(formData.teamCount || 2) >= 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'} gap-3`}>
                                {[
                                    { key: 'alpha', name: 'Alpha Team', border: 'border-red-500/40', bg: 'bg-red-950/40', text: 'text-red-400', badge: 'bg-red-900/60 text-red-200 border-red-700' },
                                    { key: 'bravo', name: 'Bravo Team', border: 'border-blue-500/40', bg: 'bg-blue-950/40', text: 'text-blue-400', badge: 'bg-blue-900/60 text-blue-200 border-blue-700' },
                                    ...((formData.teamCount || 2) >= 3 ? [{ key: 'charlie', name: 'Charlie Team', border: 'border-emerald-500/40', bg: 'bg-emerald-950/40', text: 'text-emerald-400', badge: 'bg-emerald-900/60 text-emerald-200 border-emerald-700' }] : []),
                                    ...((formData.teamCount || 2) === 4 ? [{ key: 'delta', name: 'Delta Team', border: 'border-amber-500/40', bg: 'bg-amber-950/40', text: 'text-amber-400', badge: 'bg-amber-900/60 text-amber-200 border-amber-700' }] : []),
                                ].map(team => {
                                    const teamPlayerIds = formData.teams?.[team.key] || [];
                                    const teamPlayers = players.filter(p => teamPlayerIds.includes(p.id));
                                    return (
                                        <div key={team.key} className={`p-3 rounded-xl border ${team.border} ${team.bg} space-y-2`}>
                                            <div className="flex items-center justify-between pb-1 border-b border-white/10">
                                                <span className={`font-black text-sm uppercase tracking-wider ${team.text}`}>
                                                    {team.name}
                                                </span>
                                                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${team.badge}`}>
                                                    {teamPlayers.length} Players
                                                </span>
                                            </div>
                                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                                {teamPlayers.length > 0 ? (
                                                    teamPlayers.map(p => (
                                                        <div key={p.id} className="text-xs bg-zinc-900/80 p-2 rounded flex items-center justify-between border border-zinc-800">
                                                            <span className="font-semibold text-white truncate max-w-[120px]">{p.callsign || p.name}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAssignPlayerTeam(p.id, null)}
                                                                className="text-[10px] text-zinc-500 hover:text-red-400 px-1"
                                                                title="Remove from team"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-[11px] text-zinc-500 italic py-2 text-center">No operators assigned</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Checked-in Operator Assignment Matrix */}
                            <div className="space-y-3 pt-2 border-t border-zinc-800">
                                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                                    Manual Team Assignment ({attendeesDetails.length} Checked-in Operators)
                                </h4>
                                {attendeesDetails.length > 0 ? (
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                        {attendeesDetails.map(player => {
                                            const currentTeam = Object.keys(formData.teams || {}).find(k => 
                                                formData.teams?.[k]?.includes(player.id)
                                            );

                                            return (
                                                <div key={player.id} className="bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                                                    <div>
                                                        <p className="text-xs font-bold text-white">{player.name}</p>
                                                        <p className="text-[10px] text-zinc-400 font-mono">{player.callsign || 'No callsign'}</p>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        {[
                                                            { key: 'alpha', label: 'Alpha', activeClass: 'bg-red-600 text-white border-red-500' },
                                                            { key: 'bravo', label: 'Bravo', activeClass: 'bg-blue-600 text-white border-blue-500' },
                                                            ...((formData.teamCount || 2) >= 3 ? [{ key: 'charlie', label: 'Charlie', activeClass: 'bg-emerald-600 text-white border-emerald-500' }] : []),
                                                            ...((formData.teamCount || 2) === 4 ? [{ key: 'delta', label: 'Delta', activeClass: 'bg-amber-600 text-white border-amber-500' }] : []),
                                                        ].map(t => (
                                                            <button
                                                                key={t.key}
                                                                type="button"
                                                                onClick={() => handleAssignPlayerTeam(player.id, currentTeam === t.key ? null : t.key)}
                                                                className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                                                                    currentTeam === t.key
                                                                        ? t.activeClass
                                                                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                                                                }`}
                                                            >
                                                                {t.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-xs text-zinc-500 py-2 italic text-center">Check in operators on the right to assign them to teams.</p>
                                )}
                            </div>
                        </div>
                    </DashboardCard>
                    <DashboardCard title={`Attended Operators (${attendeesDetails.length})`} icon={<UsersIcon className="w-6 h-6" />}>
                        <div className="p-6">
                            {attendeesDetails.length > 0 ? (
                                <ul className="space-y-3">
                                    {attendeesDetails.map(player => (
                                        <li key={player.id} className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-white text-sm">{player.name}</p>
                                                <p className="text-xs text-zinc-400 font-mono">Callsign: {player.callsign || 'N/A'}</p>
                                            </div>
                                            <span className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold">
                                                +{formData.participationXp || 500} RP
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-zinc-500 text-sm text-center py-4">No operators checked in yet.</p>
                            )}
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
                                    <div className="flex flex-wrap gap-1.5 items-center mt-2">
                                        <Button size="sm" variant={attendee.paymentStatus === 'Paid (Card)' ? 'primary' : 'secondary'} onClick={() => handlePaymentStatus(player.id, 'Paid (Card)')}>Card</Button>
                                        <Button size="sm" variant={attendee.paymentStatus === 'Paid (Cash)' ? 'primary' : 'secondary'} onClick={() => handlePaymentStatus(player.id, 'Paid (Cash)')}>Cash</Button>
                                        <Button size="sm" variant={attendee.paymentStatus === 'Paid (EFT)' ? 'primary' : 'secondary'} onClick={() => handlePaymentStatus(player.id, 'Paid (EFT)')}>EFT</Button>
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
                                <p className="text-xs text-green-400">RP and stats have been awarded.</p>
                            </div>
                        )}
                        {event && formData.status === 'Cancelled' && (
                            <div className="bg-red-950/60 border border-red-700/70 p-3 rounded-lg text-center">
                                <Ban className="w-7 h-7 mx-auto text-red-400 mb-1.5" />
                                <p className="font-bold text-red-300 text-sm">Event is currently Cancelled</p>
                                <p className="text-xs text-red-400/80">Hidden from player countdowns & marked cancelled.</p>
                            </div>
                        )}
                        {event && formData.status !== 'Completed' && formData.status !== 'Cancelled' && (
                            <div className="space-y-3 bg-zinc-900/50 p-4 border border-zinc-800 rounded-lg">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-400">Winning Team Declaration</label>
                                    <select
                                        value={formData.winningTeamId || ''}
                                        onChange={e => setFormData(f => ({ ...f, winningTeamId: (e.target.value as any) || null }))}
                                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        <option value="">-- No Winner Declared --</option>
                                        <option value="alpha">Alpha Team</option>
                                        <option value="bravo">Bravo Team</option>
                                        {(formData.teamCount || 2) >= 3 && <option value="charlie">Charlie Team</option>}
                                        {(formData.teamCount || 2) === 4 && <option value="delta">Delta Team</option>}
                                        <option value="tie">Draw / Tie</option>
                                    </select>
                                </div>
                                <Button onClick={handleFinalizeEvent} variant="primary" className="w-full !bg-green-600 hover:!bg-green-500 mt-2">
                                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                                    Finalize Event & Award RP
                                </Button>
                            </div>
                        )}
                        <Button onClick={handleSaveClick} variant="secondary" className="w-full">
                            Save Changes
                        </Button>
                        {event && formData.status !== 'Cancelled' && (
                            <Button 
                                onClick={handleCancelEvent} 
                                variant="secondary" 
                                className="w-full !border-red-600/50 !text-red-400 hover:!bg-red-950/50"
                            >
                                <Ban className="w-4 h-4 mr-2 text-red-400" />
                                Cancel Event
                            </Button>
                        )}
                        {event && formData.status === 'Cancelled' && (
                            <Button 
                                onClick={handleReactivateEvent} 
                                variant="secondary" 
                                className="w-full !border-emerald-500/50 !text-emerald-400 hover:!bg-emerald-950/50"
                            >
                                <RotateCcw className="w-4 h-4 mr-2 text-emerald-400" />
                                Reactivate Event
                            </Button>
                        )}
                        {event && (
                            <Button onClick={() => onDelete(event.id)} variant="danger" className="w-full">
                                <TrashIcon className="w-5 h-5 mr-2" />
                                Delete Event Permanently
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {showQRModal && event && (
                <EventQRCodeModal
                    event={event}
                    signups={signups}
                    onClose={() => setShowQRModal(false)}
                />
            )}

            {showPosterModal && (
                <EventPosterModal
                    event={{
                        ...(event || {}),
                        ...formData,
                        id: event?.id || 'preview_event',
                        liveStats: liveStats
                    }}
                    inventory={inventory}
                    companyDetails={companyDetails}
                    onClose={() => setShowPosterModal(false)}
                    onUpdateEventImage={(newUrl) => {
                        setFormData(f => ({ ...f, imageUrl: newUrl }));
                    }}
                />
            )}
        </div>
    );
};
