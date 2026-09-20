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
import { QrCode, Ban, RotateCcw, Database, Sparkles, Image as ImageIcon, Palette, ClipboardList, Users, Check, Trophy, Award, UserPlus, Phone, UserX, Save, LayoutGrid, Layers, Shield, Sliders, Clock, MapPin, DollarSign, Flame, FileText, ChevronRight } from 'lucide-react';
import { EventQRCodeModal } from './EventQRCodeModal';
import { EventPosterModal } from './EventPosterModal';
import { EquipmentRentalsSummaryModal } from './EquipmentRentalsSummaryModal';
import { AddGuestPlayerModal } from './AddGuestPlayerModal';

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
    awardedBadges: {},
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
    const [showRentalManifestModal, setShowRentalManifestModal] = useState(false);
    const [activeSection, setActiveSection] = useState<'all' | 'details' | 'gear' | 'teams' | 'roster'>('all');
    const [formData, setFormData] = useState<Omit<GameEvent, 'id'>>(() => {
        if (!event) return defaultEvent;
        // Ensure date is in 'YYYY-MM-DD' format for the input
        const date = new Date(event.date).toISOString().split('T')[0];
        return { 
            ...event, 
            date,
            eventBadges: event.eventBadges || [],
            awardedBadges: event.awardedBadges || {},
        };
    });
    
    // Total rental items count across attendees and signups
    const eventRentalsCount = useMemo(() => {
        let count = 0;
        (formData.attendees || []).forEach(a => {
            count += (a.rentedGearIds || []).length;
        });
        signups.filter(s => s.eventId === event?.id).forEach(s => {
            count += (s.requestedGearIds || []).length;
        });
        return count;
    }, [formData.attendees, signups, event?.id]);
    
    // Counts for assigned commendations
    const { assignedCommendationsCount, assignedOperatorsCount } = useMemo(() => {
        const awarded = formData.awardedBadges || {};
        let totalCount = 0;
        let opsCount = 0;
        Object.values(awarded).forEach(badgeList => {
            if (Array.isArray(badgeList) && badgeList.length > 0) {
                totalCount += badgeList.length;
                opsCount += 1;
            }
        });
        return { assignedCommendationsCount: totalCount, assignedOperatorsCount: opsCount };
    }, [formData.awardedBadges]);

    const [liveStats, setLiveStats] = useState<Record<string, Partial<Pick<PlayerStats, 'kills' | 'deaths' | 'headshots'>>>>(event?.liveStats || {});
    const [showAddGuestModal, setShowAddGuestModal] = useState(false);
    
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
        const eventSignups = signups.filter(s => s.eventId === event?.id);
        return eventSignups.map(s => {
            const p = players.find(x => x.id === s.playerId);
            return {
                id: s.playerId,
                name: s.playerName || (p ? `${p.name} ${p.surname || ''}`.trim() : s.playerId),
                callsign: s.playerCallsign || p?.callsign || p?.name || 'Operator',
                isGuest: s.isGuest || false,
                signup: s,
                playerObj: p
            };
        });
    }, [signups, event?.id, players]);

    const attendeesDetails = useMemo(() => {
        return formData.attendees.map(a => {
            if (a.isGuest) {
                return {
                    id: a.playerId,
                    name: a.guestName || 'Guest Operator',
                    callsign: a.guestCallsign || 'Guest',
                    avatarUrl: '',
                    isGuest: true,
                    attendee: a,
                    playerObj: undefined
                };
            }
            const p = players.find(x => x.id === a.playerId);
            return {
                id: a.playerId,
                name: p ? `${p.name} ${p.surname || ''}`.trim() : a.playerId,
                callsign: p?.callsign || p?.name || 'Operator',
                avatarUrl: p?.avatarUrl || '',
                isGuest: false,
                attendee: a,
                playerObj: p
            };
        });
    }, [formData.attendees, players]);
    
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
    
    const handleAddGuestPlayer = async (guestAttendee: EventAttendee, isPendingSignup?: boolean) => {
        if (!event) return;

        if (isPendingSignup) {
            const signupId = `signup_${guestAttendee.playerId}`;
            const newSignupData = {
                id: signupId,
                eventId: event.id,
                playerId: guestAttendee.playerId,
                requestedGearIds: guestAttendee.rentedGearIds || [],
                note: guestAttendee.note || '',
                isGuest: true,
                guestName: guestAttendee.guestName,
                guestCallsign: guestAttendee.guestCallsign,
                guestPhone: guestAttendee.guestPhone,
                playerName: guestAttendee.guestName,
                playerCallsign: guestAttendee.guestCallsign,
                paymentStatus: guestAttendee.paymentStatus,
                signedUpAt: new Date().toISOString(),
            };
            await setDoc('signups', signupId, newSignupData);
        } else {
            const updatedAttendees = [...formData.attendees, guestAttendee];
            setFormData(prev => ({
                ...prev,
                attendees: updatedAttendees
            }));
            if (event.id) {
                await setDoc('events', event.id, {
                    ...formData,
                    attendees: updatedAttendees
                });
            }
        }
    };

    const handleCheckIn = async (playerId: string) => {
        if (!event) return;
        const signup = signups.find(s => s.playerId === playerId && s.eventId === event.id);

        const existingAttendee = formData.attendees.find(a => a.playerId === playerId);
        if (existingAttendee) {
            setFormData(prev => ({
                ...prev,
                attendees: prev.attendees.map(a => a.playerId === playerId ? { ...a, checkInStatus: 'checked_in' } : a)
            }));
            return;
        }

        const newAttendee: EventAttendee = {
            playerId,
            paymentStatus: signup?.paymentStatus || 'Unpaid',
            rentedGearIds: signup?.requestedGearIds || [],
            note: signup?.note || '',
            checkInStatus: 'checked_in',
            isGuest: signup?.isGuest || false,
            guestName: signup?.guestName,
            guestCallsign: signup?.guestCallsign,
            guestPhone: signup?.guestPhone,
        };
        
        setFormData(prev => ({
            ...prev,
            attendees: [...prev.attendees, newAttendee]
        }));
        
        if (signup) {
            await deleteDoc('signups', signup.id);
        }
    };

    const handleMarkNoShow = async (playerId: string) => {
        if (!event) return;
        const signup = signups.find(s => s.playerId === playerId && s.eventId === event.id);

        const existingAttendee = formData.attendees.find(a => a.playerId === playerId);
        if (existingAttendee) {
            setFormData(prev => ({
                ...prev,
                attendees: prev.attendees.map(a => a.playerId === playerId ? { ...a, checkInStatus: 'no_show' } : a)
            }));
            return;
        }

        const newAttendee: EventAttendee = {
            playerId,
            paymentStatus: signup?.paymentStatus || 'Unpaid',
            rentedGearIds: signup?.requestedGearIds || [],
            note: signup?.note ? `${signup.note} (No Show)` : 'No Show',
            checkInStatus: 'no_show',
            isGuest: signup?.isGuest || false,
            guestName: signup?.guestName,
            guestCallsign: signup?.guestCallsign,
            guestPhone: signup?.guestPhone,
        };

        setFormData(prev => ({
            ...prev,
            attendees: [...prev.attendees, newAttendee]
        }));

        if (signup) {
            await deleteDoc('signups', signup.id);
        }
    };

    const handleCheckOut = async (playerId: string) => {
        if (!event) return;

        const attendee = formData.attendees.find(a => a.playerId === playerId);
        if (!attendee) return;

        // If it was a guest player, remove from attendees directly
        if (attendee.isGuest) {
            setFormData(prev => ({
                ...prev,
                attendees: prev.attendees.filter(a => a.playerId !== playerId)
            }));
            return;
        }

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
    };
    
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
    
                const playerLiveStats = liveStats[player.id] || {};
                const killsToAdd = Number(playerLiveStats.kills) || 0;
                const deathsToAdd = Number(playerLiveStats.deaths) || 0;
                const headshotsToAdd = Number(playerLiveStats.headshots) || 0;

                const newMatchRecord = {
                    eventId: event!.id,
                    result: matchResult,
                    playerStats: {
                        kills: killsToAdd,
                        deaths: deathsToAdd,
                        headshots: headshotsToAdd,
                    }
                };
    
                const currentStats = mutablePlayer.stats || { kills: 0, deaths: 0, headshots: 0, gamesPlayed: 0, xp: 0 };
                
                // Check and award ONLY explicitly assigned commendation badges to this specific player
                const playerAssignedBadgeIds = formData.awardedBadges?.[player.id] || [];
                
                const allAvailableBadges: (Badge | LegendaryBadge)[] = [
                    ...(legendaryBadges || []),
                    ...(dataContext?.badges || []),
                ];
                
                const badgesToAward = allAvailableBadges.filter(b => playerAssignedBadgeIds.includes(b.id));

                const isLegendary = (bId: string) => (legendaryBadges || []).some(lb => lb.id === bId);

                const newLegendaryBadges = badgesToAward
                    .filter(b => isLegendary(b.id))
                    .filter(b => !(mutablePlayer.legendaryBadges || []).some(pb => pb.id === b.id)) as LegendaryBadge[];

                const newStandardBadges = badgesToAward
                    .filter(b => !isLegendary(b.id))
                    .filter(b => !(mutablePlayer.badges || []).some(pb => pb.id === b.id)) as Badge[];

                const combinedNewBadges = [...newLegendaryBadges, ...newStandardBadges];

                mutablePlayer = {
                    ...mutablePlayer,
                    stats: {
                        ...currentStats,
                        xp: currentStats.xp + xpGained,
                        kills: (currentStats.kills || 0) + killsToAdd,
                        deaths: (currentStats.deaths || 0) + deathsToAdd,
                        headshots: (currentStats.headshots || 0) + headshotsToAdd,
                        gamesPlayed: (currentStats.gamesPlayed || 0) + 1,
                    },
                    badges: newStandardBadges.length > 0 
                        ? [...(mutablePlayer.badges || []), ...newStandardBadges] 
                        : (mutablePlayer.badges || []),
                    legendaryBadges: newLegendaryBadges.length > 0
                        ? [...(mutablePlayer.legendaryBadges || []), ...newLegendaryBadges]
                        : (mutablePlayer.legendaryBadges || []),
                    matchHistory: [...(mutablePlayer.matchHistory || []), newMatchRecord]
                };

                // Trigger commendation awarded notifications ONLY for explicitly assigned badges
                combinedNewBadges.forEach(badge => {
                    dataContext?.createNotification?.({
                        title: `Commendation Awarded: ${mutablePlayer.name}`,
                        message: `${mutablePlayer.name} (${mutablePlayer.playerCode}) was awarded the "${badge.name}" commendation in ${formData.title}!`,
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

        // Persist all modified players to Supabase so XP, badges, stats, and ranks are saved live and permanently
        const modifiedPlayers = updatedPlayers.filter(p => {
            const orig = players.find(o => o.id === p.id);
            if (!orig) return false;
            return (
                (orig.stats?.xp ?? 0) !== (p.stats?.xp ?? 0) ||
                (orig.stats?.gamesPlayed ?? 0) !== (p.stats?.gamesPlayed ?? 0) ||
                (orig.stats?.kills ?? 0) !== (p.stats?.kills ?? 0) ||
                (orig.stats?.deaths ?? 0) !== (p.stats?.deaths ?? 0) ||
                (orig.stats?.headshots ?? 0) !== (p.stats?.headshots ?? 0) ||
                (orig.badges?.length || 0) !== (p.badges?.length || 0) ||
                (orig.legendaryBadges?.length || 0) !== (p.legendaryBadges?.length || 0) ||
                (orig.matchHistory?.length || 0) !== (p.matchHistory?.length || 0) ||
                (orig.xpAdjustments?.length || 0) !== (p.xpAdjustments?.length || 0) ||
                orig.rank?.id !== p.rank?.id
            );
        });

        const playerPersistPromises = modifiedPlayers.map(p => 
            dataContext?.updateDoc ? dataContext.updateDoc('players', p) : setDoc('players', p.id, p)
        );

        // Persist all newly generated transactions (event fees, gear rentals) to Supabase
        const transactionPersistPromises = newTransactions.map(tx => 
            dataContext?.setDoc ? dataContext.setDoc('transactions', tx.id, tx) : setDoc('transactions', tx.id, tx)
        );

        await Promise.all([...playerPersistPromises, ...transactionPersistPromises]);
    
        const finalEventData: GameEvent = {
            ...(event || {}), ...formData,
            id: event?.id || '', status: 'Completed',
            liveStats: liveStats,
            awardedBadges: formData.awardedBadges || {},
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
            
            // If an event badge was removed from the event's roster, also clean it up from player awards
            const nextAwarded = { ...(prev.awardedBadges || {}) };
            if (!newBadges.includes(badgeId)) {
                Object.keys(nextAwarded).forEach(pId => {
                    nextAwarded[pId] = (nextAwarded[pId] || []).filter(id => id !== badgeId);
                    if (nextAwarded[pId].length === 0) {
                        delete nextAwarded[pId];
                    }
                });
            }

            return { ...prev, eventBadges: newBadges, awardedBadges: nextAwarded };
        });
    };

    const handleTogglePlayerAwardedBadge = (playerId: string, badgeId: string) => {
        setFormData(prev => {
            const currentAwarded: Record<string, string[]> = { ...(prev.awardedBadges || {}) };
            const playerBadges = [...(currentAwarded[playerId] || [])];
            const hasBadge = playerBadges.includes(badgeId);
            const nextBadges = hasBadge
                ? playerBadges.filter(id => id !== badgeId)
                : [...playerBadges, badgeId];

            if (nextBadges.length === 0) {
                delete currentAwarded[playerId];
            } else {
                currentAwarded[playerId] = nextBadges;
            }

            return {
                ...prev,
                awardedBadges: currentAwarded,
            };
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
            awardedBadges: formData.awardedBadges || {},
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
            awardedBadges: formData.awardedBadges || {},
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
            awardedBadges: formData.awardedBadges || {},
        };

        setFormData(prev => ({ ...prev, status: 'Upcoming' }));
        onSave(reactivatedEventData);
        dataContext?.logActivity(`Reactivated event: ${reactivatedEventData.title}`, { eventId: reactivatedEventData.id });
    };

    return (
        <div className="p-2 sm:p-4 md:p-6 max-w-[1700px] mx-auto space-y-3 sm:space-y-4 min-w-0 w-full overflow-x-hidden">
            {/* Modern Top Header Bar */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-gradient-to-r from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)] w-full min-w-0">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 w-full sm:w-auto">
                    <Button onClick={onBack} variant="secondary" size="sm" className="!p-1.5 sm:!p-2 shrink-0">
                        <ArrowLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
                            <h1 className="text-sm sm:text-base md:text-xl font-black text-white truncate tracking-tight">
                                {event ? (formData.title || 'Manage Event') : 'Create New Event'}
                            </h1>
                            {formData.status && (
                                <span className={`text-[9px] sm:text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border shrink-0 ${
                                    formData.status === 'Active' 
                                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                                        : formData.status === 'Completed'
                                        ? 'bg-blue-950 text-blue-300 border-blue-500/50'
                                        : formData.status === 'Cancelled'
                                        ? 'bg-red-950 text-red-300 border-red-500/50'
                                        : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                                }`}>
                                    {formData.status}
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-zinc-400 truncate">
                            {formData.date} • {formData.startTime} • {formData.location || 'No location set'}
                        </p>
                    </div>
                </div>

                {/* Quick Action Pill Bar */}
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto justify-start sm:justify-end shrink-0">
                    <Button
                        onClick={handleSaveClick}
                        size="sm"
                        className="!bg-emerald-600 hover:!bg-emerald-500 text-white font-bold !text-[11px] sm:!text-xs !py-1 sm:!py-1.5 !px-2.5 sm:!px-3 shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center gap-1 sm:gap-1.5 shrink-0"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save</span>
                    </Button>

                    <Button
                        onClick={() => setShowPosterModal(true)}
                        size="sm"
                        className="!bg-gradient-to-r !from-red-700 !to-red-600 hover:!from-red-600 hover:!to-red-500 text-white font-bold !text-[11px] sm:!text-xs !py-1 sm:!py-1.5 !px-2 sm:!px-2.5 shadow-[0_0_12px_rgba(220,38,38,0.3)] flex items-center gap-1 sm:gap-1.5 shrink-0"
                    >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span className="hidden sm:inline">Poster Artwork</span>
                        <span className="sm:hidden">Poster</span>
                    </Button>

                    {event && (
                        <Button
                            onClick={() => setShowRentalManifestModal(true)}
                            size="sm"
                            className="!bg-zinc-900 hover:!bg-zinc-800 !border !border-zinc-700 text-zinc-200 font-bold !text-[11px] sm:!text-xs !py-1 sm:!py-1.5 !px-2 sm:!px-2.5 flex items-center gap-1 sm:gap-1.5 shrink-0"
                            title="View Equipment Rental Manifest"
                        >
                            <ClipboardList className="w-3.5 h-3.5 text-red-400" />
                            <span className="hidden md:inline">Rentals Manifest</span>
                            <span className="md:hidden">Rentals</span>
                            {eventRentalsCount > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white text-[9px] sm:text-[10px] font-mono font-bold">
                                    {eventRentalsCount}
                                </span>
                            )}
                        </Button>
                    )}

                    {event && (
                        <Button
                            onClick={() => setShowQRModal(true)}
                            size="sm"
                            className="!bg-zinc-900 hover:!bg-red-950/60 !border !border-red-500/40 text-red-400 font-bold !text-[11px] sm:!text-xs !py-1 sm:!py-1.5 !px-2 sm:!px-2.5 flex items-center gap-1 sm:gap-1.5 shrink-0"
                        >
                            <QrCode className="w-3.5 h-3.5 text-red-400" />
                            <span className="hidden sm:inline">QR Pass</span>
                        </Button>
                    )}

                    {event && (
                        <button
                            type="button"
                            onClick={() => setShowAddGuestModal(true)}
                            className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-purple-600/90 hover:bg-purple-500 text-white font-bold text-[11px] sm:text-xs flex items-center gap-1 sm:gap-1.5 transition-colors shadow-sm cursor-pointer shrink-0"
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">+ Add Guest</span>
                            <span className="sm:hidden">+ Guest</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Modern Section Navigator Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold w-full">
                {[
                    { id: 'all', label: 'All Panels (Side-by-Side)', icon: LayoutGrid },
                    { id: 'details', label: '1. Mission & Rules', icon: FileText },
                    { id: 'gear', label: '2. Gear & Badges', icon: Shield, badge: (formData.eventBadges || []).length > 0 ? `${(formData.eventBadges || []).length} Badges` : undefined },
                    { id: 'teams', label: '3. Tactical Teams', icon: Users, badge: `${formData.teamCount || 2} Teams` },
                    { id: 'roster', label: '4. Attendees & Finalize', icon: CheckCircleIcon, badge: `${attendeesDetails.length} Checked-in` },
                ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeSection === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveSection(tab.id as any)}
                            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0 text-[11px] sm:text-xs cursor-pointer ${
                                isActive
                                    ? 'bg-red-600 text-white shadow-md shadow-red-950 font-bold'
                                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
                            }`}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                            {tab.badge && (
                                <span className={`text-[9px] sm:text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                                    isActive ? 'bg-black/30 text-white' : 'bg-zinc-800 text-zinc-300'
                                }`}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Side-by-Side Master Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-start min-w-0 w-full">
                {/* Left Master Column */}
                <div className={`space-y-3 sm:space-y-3.5 min-w-0 ${activeSection === 'all' ? 'lg:col-span-6 xl:col-span-7' : activeSection === 'details' || activeSection === 'teams' ? 'lg:col-span-12' : 'hidden'}`}>
                    {/* Mission Profile & Configuration */}
                    {(activeSection === 'all' || activeSection === 'details') && (
                        <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 rounded-xl sm:rounded-2xl border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.4)] p-3 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3.5 min-w-0">
                            <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-4 h-4 text-red-500" />
                                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">Mission Configuration</h2>
                                </div>
                                <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400">Section 1</span>
                            </div>

                            <Input 
                                label="Event Title" 
                                value={formData.title} 
                                onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                                placeholder="e.g. Operation Nightfall: Castle Defense" 
                                className="!py-1.5 sm:!py-2 !text-xs sm:!text-sm"
                            />
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                                <div className="min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[11px] sm:text-xs font-semibold text-zinc-300 flex items-center gap-1 truncate">
                                            <Sparkles className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                            <span>Game Type / Scenario Preset</span>
                                        </label>
                                        {formData.gameTypeId && (
                                            <span className="text-[8px] sm:text-[9px] font-mono px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800/60 font-bold uppercase shrink-0">
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
                                        className="w-full min-w-0 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500 truncate"
                                    >
                                        <option value="">-- Select Game Type / Scenario --</option>
                                        {dataContext?.gameTypes && dataContext.gameTypes.length > 0 ? (
                                            Object.entries(
                                                dataContext.gameTypes.reduce((acc, gt) => {
                                                    const cat = gt.category || 'Scenario';
                                                    if (!acc[cat]) acc[cat] = [];
                                                    acc[cat].push(gt);
                                                    return acc;
                                                }, {} as Record<string, any[]>)
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
                                    {formData.gameTypeId && (() => {
                                        const linkedGt = dataContext?.gameTypes?.find(g => g.id === formData.gameTypeId);
                                        return (
                                            <div className="mt-1 flex items-center justify-between gap-1.5 px-2 py-1 bg-zinc-950/80 border border-red-900/40 rounded text-[10px] text-zinc-300">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <span className="font-semibold text-white truncate">{linkedGt?.name || 'Scenario'}</span>
                                                    <span className="text-amber-400 font-mono font-bold shrink-0">+{linkedGt?.participationXp ?? 50} XP</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setFormData((f) => ({ ...f, gameTypeId: undefined }))}
                                                    className="text-[9px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider shrink-0"
                                                >
                                                    Unlink
                                                </button>
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="min-w-0">
                                    <label className="block text-[11px] sm:text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                                        <Palette className="w-3.5 h-3.5 text-red-500 shrink-0" />
                                        <span>Theme Concept / Art Prompt</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.theme || ''}
                                        onChange={(e) => setFormData((f) => ({ ...f, theme: e.target.value }))}
                                        placeholder="e.g. Tactical Night Raid, dark fog, red neon"
                                        className="w-full min-w-0 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-zinc-600 truncate"
                                    />
                                </div>
                            </div>

                            {/* Date, Time, Location - Optimized 2-col to 3-col Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                                <Input label="Date" type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} className="!py-1.5 !text-xs" />
                                <Input label="Start Time" type="time" value={formData.startTime} onChange={e => setFormData(f => ({ ...f, startTime: e.target.value }))} className="!py-1.5 !text-xs" />
                                <div className="col-span-2 sm:col-span-1 min-w-0">
                                    <label className="block text-[11px] sm:text-xs font-semibold text-zinc-300 mb-1">Location</label>
                                    <select
                                        value={formData.location}
                                        onChange={e => setFormData(f => ({ ...f, location: e.target.value }))}
                                        className="w-full min-w-0 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500 truncate"
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

                            {/* Description & Rules Side-by-Side */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                                <div className="min-w-0">
                                    <label className="block text-[11px] sm:text-xs font-semibold text-zinc-300 mb-1">Mission Description</label>
                                    <textarea 
                                        value={formData.description} 
                                        onChange={e => setFormData(f => ({...f, description: e.target.value}))} 
                                        rows={2} 
                                        placeholder="Objective, briefing, or special instructions..."
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-zinc-600" 
                                    />
                                </div>
                                <div className="min-w-0">
                                    <label className="block text-[11px] sm:text-xs font-semibold text-zinc-300 mb-1">Field Rules & Safety</label>
                                    <textarea 
                                        value={formData.rules} 
                                        onChange={e => setFormData(f => ({...f, rules: e.target.value}))} 
                                        rows={2} 
                                        placeholder="FPS limits, engagement rules, reload limits..."
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-zinc-600" 
                                    />
                                </div>
                            </div>

                            {/* Economy, XP & Status (Compact 2x2 on Mobile, 4-col on Desktop) */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                                <Input label="Game Fee (R)" type="number" value={formData.gameFee} onChange={e => setFormData(f => ({ ...f, gameFee: Number(e.target.value) }))} className="!py-1.5 !text-xs" />
                                <Input label="Participation RP" type="number" value={formData.participationXp} onChange={e => setFormData(f => ({ ...f, participationXp: Number(e.target.value) }))} className="!py-1.5 !text-xs" />
                                <Input label="Win Bonus RP" type="number" value={formData.winXpAward ?? 50} onChange={e => setFormData(f => ({ ...f, winXpAward: Number(e.target.value) }))} className="!py-1.5 !text-xs" />
                                <div className="min-w-0">
                                    <label className="block text-[11px] sm:text-xs font-semibold text-zinc-300 mb-1">Event Status</label>
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
                                        className="w-full min-w-0 bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500 truncate"
                                    >
                                        {EVENT_STATUSES.map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Poster & Audio Briefing Side-by-Side */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-1">
                                <div className="min-w-0">
                                    <UrlOrUploadField
                                        label="Event Image Poster"
                                        fileUrl={formData.imageUrl}
                                        onUrlSet={(url) => setFormData(f => ({...f, imageUrl: url}))}
                                        onRemove={() => setFormData(f => ({...f, imageUrl: ''}))}
                                        accept="image/*"
                                        apiServerUrl={companyDetails.apiServerUrl}
                                    />
                                </div>

                                <div className="min-w-0">
                                    <label className="block text-[11px] sm:text-xs font-semibold text-zinc-300 mb-1">Audio Mission Briefing</label>
                                    <div className="bg-zinc-900/70 p-2 sm:p-2.5 rounded-lg border border-zinc-700/60 min-h-[64px] flex flex-col justify-center">
                                        {formData.audioBriefingUrl && !isRecording && (
                                            <div className="flex items-center gap-1.5 sm:gap-2">
                                                <audio src={formData.audioBriefingUrl} controls className="w-full h-7 sm:h-8" />
                                                <div className="flex gap-1 shrink-0">
                                                    <Button variant="secondary" size="sm" onClick={handleStartRecording} className="!text-[9px] sm:!text-[10px] !py-0.5 sm:!py-1 !px-1.5 sm:!px-2">Record</Button>
                                                    <Button variant="danger" size="sm" onClick={handleRemoveAudio} className="!text-[9px] sm:!text-[10px] !py-0.5 sm:!py-1 !px-1.5 sm:!px-2">✕</Button>
                                                </div>
                                            </div>
                                        )}
                                
                                        {isRecording && (
                                            <div className="flex items-center justify-between gap-2 p-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
                                                    <span className="font-mono text-xs text-red-400 font-bold">{formatTime(recordingSeconds)}</span>
                                                </div>
                                                <Button variant="danger" size="sm" onClick={handleStopRecording} className="!text-[10px] !py-1 !px-3">Stop</Button>
                                            </div>
                                        )}
                                
                                        {!formData.audioBriefingUrl && !isRecording && (
                                            <Button variant="secondary" size="sm" className="w-full !text-xs !py-1.5" onClick={handleStartRecording}>
                                                🎙️ Record Voice Briefing
                                            </Button>
                                        )}
                                
                                        {permissionError && (
                                             <p className="text-[10px] text-red-400 mt-1 text-center">{permissionError}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tactical Teams Configuration Card */}
                    {(activeSection === 'all' || activeSection === 'teams') && (
                        <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 rounded-xl sm:rounded-2xl border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.4)] p-3 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3.5 min-w-0">
                            <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-zinc-800">
                                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                    <Users className="w-4 h-4 text-red-500 shrink-0" />
                                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white truncate">
                                        Tactical Squads ({formData.teamCount || 2} Teams)
                                    </h2>
                                </div>
                                <Button size="sm" onClick={handleAutoBalanceTeams} className="!bg-red-600 hover:!bg-red-500 !text-[11px] sm:!text-xs !py-0.5 sm:!py-1 !px-2 sm:!px-2.5 font-bold flex items-center gap-1 sm:gap-1.5 shadow-sm shrink-0">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Auto-Balance</span>
                                </Button>
                            </div>

                            {/* Team count selector buttons */}
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                                {[2, 3, 4].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setFormData(f => ({ ...f, teamCount: num }))}
                                        className={`py-1 sm:py-1.5 px-1 sm:px-2 rounded-lg text-xs font-bold border transition-all flex flex-col items-center justify-center cursor-pointer ${
                                            (formData.teamCount || 2) === num
                                                ? 'bg-red-600 text-white border-red-500 shadow-sm'
                                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                                        }`}
                                    >
                                        <span className="text-[11px] sm:text-xs font-black">{num} Teams</span>
                                        <span className="text-[8px] sm:text-[9px] font-mono opacity-80 truncate max-w-full">
                                            {num === 2 ? 'Alpha vs Bravo' : num === 3 ? '3-Way Battle' : '4-Way Battle'}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Active Team Squad Boxes */}
                            <div className={`grid grid-cols-1 ${(formData.teamCount || 2) >= 3 ? 'sm:grid-cols-2 md:grid-cols-3' : 'sm:grid-cols-2'} gap-2 sm:gap-2.5`}>
                                {[
                                    { key: 'alpha', name: 'Alpha Team', border: 'border-red-500/40', bg: 'bg-red-950/30', text: 'text-red-400', badge: 'bg-red-900/60 text-red-200 border-red-700' },
                                    { key: 'bravo', name: 'Bravo Team', border: 'border-blue-500/40', bg: 'bg-blue-950/30', text: 'text-blue-400', badge: 'bg-blue-900/60 text-blue-200 border-blue-700' },
                                    ...((formData.teamCount || 2) >= 3 ? [{ key: 'charlie', name: 'Charlie Team', border: 'border-emerald-500/40', bg: 'bg-emerald-950/30', text: 'text-emerald-400', badge: 'bg-emerald-900/60 text-emerald-200 border-emerald-700' }] : []),
                                    ...((formData.teamCount || 2) === 4 ? [{ key: 'delta', name: 'Delta Team', border: 'border-amber-500/40', bg: 'bg-amber-950/30', text: 'text-amber-400', badge: 'bg-amber-900/60 text-amber-200 border-amber-700' }] : []),
                                ].map(team => {
                                    const teamPlayerIds = formData.teams?.[team.key] || [];
                                    const teamPlayers = players.filter(p => teamPlayerIds.includes(p.id));
                                    return (
                                        <div key={team.key} className={`p-2 sm:p-2.5 rounded-xl border ${team.border} ${team.bg} space-y-1 sm:space-y-1.5 min-w-0`}>
                                            <div className="flex items-center justify-between pb-1 border-b border-white/10">
                                                <span className={`font-black text-[11px] sm:text-xs uppercase tracking-wider truncate ${team.text}`}>
                                                    {team.name}
                                                </span>
                                                <span className={`text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border shrink-0 ${team.badge}`}>
                                                    {teamPlayers.length}
                                                </span>
                                            </div>
                                            <div className="space-y-1 max-h-32 sm:max-h-36 overflow-y-auto">
                                                {teamPlayers.length > 0 ? (
                                                    teamPlayers.map(p => (
                                                        <div key={p.id} className="text-[10px] sm:text-[11px] bg-zinc-900/90 px-2 py-0.5 sm:py-1 rounded flex items-center justify-between border border-zinc-800 gap-1">
                                                            <span className="font-semibold text-white truncate max-w-[120px]">{p.callsign || p.name}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleAssignPlayerTeam(p.id, null)}
                                                                className="text-[10px] text-zinc-500 hover:text-red-400 px-1 cursor-pointer shrink-0"
                                                                title="Remove from team"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-[10px] text-zinc-500 italic py-1 text-center">Empty squad</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Manual Team Assignment Matrix */}
                            {attendeesDetails.length > 0 && (
                                <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                                    <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                                        Assign Checked-in Operators ({attendeesDetails.length})
                                    </span>
                                    <div className="space-y-1.5 max-h-44 sm:max-h-48 overflow-y-auto pr-1">
                                        {attendeesDetails.map(player => {
                                            const currentTeam = Object.keys(formData.teams || {}).find(k => 
                                                formData.teams?.[k]?.includes(player.id)
                                            );

                                            return (
                                                <div key={player.id} className="bg-zinc-900/80 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-zinc-800 flex items-center justify-between gap-1.5 sm:gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[11px] sm:text-xs font-bold text-white truncate">{player.name}</p>
                                                        <p className="text-[9px] sm:text-[10px] text-zinc-400 font-mono truncate">{player.callsign || 'No callsign'}</p>
                                                    </div>

                                                    <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
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
                                                                className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold border transition-colors cursor-pointer ${
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
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Master Column */}
                <div className={`space-y-3 sm:space-y-3.5 min-w-0 ${activeSection === 'all' ? 'lg:col-span-6 xl:col-span-5' : activeSection === 'gear' || activeSection === 'roster' ? 'lg:col-span-12' : 'hidden'}`}>
                    {/* Equipment Rentals Configuration */}
                    {(activeSection === 'all' || activeSection === 'gear') && (
                        <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 rounded-xl sm:rounded-2xl border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.4)] p-3 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3 min-w-0">
                            <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-purple-400" />
                                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">Gear Available for Rent</h2>
                                </div>
                                <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400">
                                    {(formData.gearForRent || []).length} Enabled
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 max-h-48 sm:max-h-52 overflow-y-auto pr-1">
                                {inventory.filter(i => i.isRental).map(item => {
                                    const isChecked = (formData.gearForRent || []).includes(item.id);
                                    const overridePrice = formData.rentalPriceOverrides?.[item.id];
                                    return (
                                        <div key={item.id} className="bg-zinc-800/80 p-2 rounded-lg border border-zinc-700/60 min-w-0">
                                            <div className="flex items-center justify-between gap-1">
                                                <label className="flex items-center gap-1.5 cursor-pointer flex-grow min-w-0">
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => handleGearToggle(item.id)}
                                                        className="h-3.5 w-3.5 rounded border-gray-600 bg-zinc-700 text-red-500 focus:ring-red-500 shrink-0"
                                                    />
                                                    <span className="text-xs text-gray-200 truncate font-semibold">{item.name}</span>
                                                </label>
                                                <span className="text-[10px] text-zinc-400 font-mono shrink-0 ml-1">R{item.salePrice.toFixed(2)}</span>
                                            </div>
                                            {isChecked && (
                                                <div className="mt-1.5 pl-5">
                                                    <Input 
                                                        label="Rental Price (R)"
                                                        type="number"
                                                        value={overridePrice ?? item.salePrice}
                                                        onChange={(e) => handlePriceOverrideChange(item.id, e.target.value)}
                                                        className="!py-1 !text-xs"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Event Commendations & Operator Assignment */}
                    {(activeSection === 'all' || activeSection === 'gear') && (
                        <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 rounded-xl sm:rounded-2xl border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.4)] p-3 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3 min-w-0">
                            <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-zinc-800">
                                <div className="flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-amber-400" />
                                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">Event Commendations</h2>
                                </div>
                                <span className={`text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                                    assignedCommendationsCount > 0 
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                                        : 'bg-zinc-800 text-zinc-500'
                                }`}>
                                    {assignedCommendationsCount} Awarded
                                </span>
                            </div>

                            {/* Available Badges Checkbox Pills */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 sm:gap-1.5 max-h-32 sm:max-h-36 overflow-y-auto">
                                {legendaryBadges.map(badge => (
                                    <label key={badge.id} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700/80 cursor-pointer border border-zinc-700/50 min-w-0">
                                        <input
                                            type="checkbox"
                                            checked={(formData.eventBadges || []).includes(badge.id)}
                                            onChange={() => handleBadgeToggle(badge.id)}
                                            className="h-3.5 w-3.5 rounded border-gray-600 bg-zinc-700 text-red-500 focus:ring-red-500 shrink-0"
                                        />
                                        {badge.iconUrl && badge.iconUrl.trim() !== '' ? (
                                            <img src={badge.iconUrl} alt="" className="w-3.5 h-3.5 object-contain shrink-0"/>
                                        ) : (
                                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                        )}
                                        <span className="text-[10px] sm:text-[11px] text-amber-300 truncate font-semibold">{badge.name}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Operator Badges Assignment List */}
                            {(formData.eventBadges || []).length > 0 && attendeesDetails.length > 0 && (
                                <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                                    <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                                        Award Badges to Operators
                                    </span>
                                    <div className="space-y-1.5 max-h-44 sm:max-h-48 overflow-y-auto pr-1">
                                        {attendeesDetails.map(player => {
                                            const playerAssigned = formData.awardedBadges?.[player.id] || [];
                                            const activeBadgesList = legendaryBadges.filter(b => (formData.eventBadges || []).includes(b.id));

                                            return (
                                                <div key={player.id} className="bg-zinc-950/80 p-2 rounded-lg border border-zinc-800 flex flex-col gap-1.5">
                                                    <div className="flex items-center justify-between gap-1.5">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] font-black text-amber-400 shrink-0">
                                                                {(player.callsign || player.name || 'O')[0].toUpperCase()}
                                                            </div>
                                                            <span className="text-xs font-bold text-white truncate">{player.name}</span>
                                                            <span className="text-[10px] text-zinc-400 font-mono truncate">({player.callsign || 'N/A'})</span>
                                                        </div>
                                                        <span className="text-[9px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/40 shrink-0">
                                                            {playerAssigned.length} earned
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-1">
                                                        {activeBadgesList.map(badge => {
                                                            const isSelected = playerAssigned.includes(badge.id);
                                                            return (
                                                                <button
                                                                    key={badge.id}
                                                                    type="button"
                                                                    onClick={() => handleTogglePlayerAwardedBadge(player.id, badge.id)}
                                                                    className={`px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                                                                        isSelected 
                                                                            ? 'bg-amber-500 text-black font-bold' 
                                                                            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700'
                                                                    }`}
                                                                >
                                                                    <span className="truncate max-w-[85px] sm:max-w-[110px]">{badge.name}</span>
                                                                    {isSelected && <Check className="w-2.5 h-2.5 text-black stroke-[3]" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Operator Signups & Checked-in Manifest Card */}
                    {(activeSection === 'all' || activeSection === 'roster') && (
                        <div className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 rounded-xl sm:rounded-2xl border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.4)] p-3 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3.5 min-w-0">
                            {/* Header / Counts */}
                            <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-zinc-800">
                                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                    <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                                    <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white truncate">
                                        Operator Roster & Check-In
                                    </h2>
                                </div>
                                <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono shrink-0">
                                    <span className="text-zinc-400 bg-zinc-800 px-1.5 sm:px-2 py-0.5 rounded">
                                        Signed: <strong>{signedUpPlayersDetails.length}</strong>
                                    </span>
                                    <span className="text-emerald-300 bg-emerald-950 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-800/40">
                                        In: <strong>{formData.attendees.length}</strong>
                                    </span>
                                </div>
                            </div>

                            {/* Signed Up Operators List */}
                            <div className="space-y-1.5">
                                <span className="text-[11px] sm:text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                                    Signed Up ({signedUpPlayersDetails.length})
                                </span>
                                <div className="space-y-1.5 max-h-44 sm:max-h-48 overflow-y-auto pr-1">
                                    {signedUpPlayersDetails.length > 0 ? signedUpPlayersDetails.map(player => (
                                        <div key={player.id} className="bg-zinc-800/80 p-1.5 sm:p-2 rounded-lg border border-zinc-700/60 flex items-center justify-between gap-1.5 sm:gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 truncate">
                                                    <p className="font-bold text-white text-[11px] sm:text-xs truncate">{player.name}</p>
                                                    {player.isGuest && (
                                                        <span className="px-1 py-0.2 rounded text-[8px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                                            GUEST
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[9px] sm:text-[10px] text-zinc-400 font-mono truncate">@{player.callsign || 'N/A'}</p>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                                <Button size="sm" onClick={() => handleCheckIn(player.id)} className="!bg-emerald-600 hover:!bg-emerald-500 !text-[10px] sm:!text-[11px] !py-0.5 !px-1.5 sm:!px-2 font-bold">
                                                    Check In
                                                </Button>
                                                <Button size="sm" variant="danger" onClick={() => handleMarkNoShow(player.id)} className="!bg-amber-600 hover:!bg-amber-500 !text-[10px] sm:!text-[11px] !py-0.5 !px-1.5 sm:!px-2 font-bold">
                                                    No Show
                                                </Button>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-center text-zinc-500 text-xs py-2 italic">No waiting signups.</p>
                                    )}
                                </div>
                            </div>

                            {/* Checked-In Attendees List */}
                            <div className="space-y-1.5 pt-2 border-t border-zinc-800">
                                <span className="text-[11px] sm:text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                                    Checked In Operators ({formData.attendees.length})
                                </span>
                                <div className="space-y-1.5 max-h-52 sm:max-h-56 overflow-y-auto pr-1">
                                    {attendeesDetails.length > 0 ? attendeesDetails.map(player => {
                                        const attendee = player.attendee || formData.attendees.find(a => a.playerId === player.id)!;
                                        const isNoShow = attendee?.checkInStatus === 'no_show';

                                        return (
                                            <div key={player.id} className={`p-1.5 sm:p-2 rounded-lg border transition-all ${
                                                isNoShow ? 'bg-amber-950/20 border-amber-500/40' : 'bg-zinc-800/80 border-zinc-700/60'
                                            }`}>
                                                <div className="flex items-center justify-between gap-1.5">
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-1.5 truncate">
                                                            <p className="font-bold text-white text-[11px] sm:text-xs truncate">{player.name}</p>
                                                            {player.isGuest && (
                                                                <span className="px-1 py-0.2 rounded text-[8px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                                                    GUEST
                                                                </span>
                                                            )}
                                                            <span className={`px-1 py-0.2 rounded text-[8px] font-black uppercase ${
                                                                isNoShow ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
                                                            }`}>
                                                                {isNoShow ? 'NO SHOW' : 'CHECKED IN'}
                                                            </span>
                                                        </div>
                                                        <p className="text-[9px] sm:text-[10px] text-zinc-400 font-mono truncate">
                                                            {player.callsign || 'N/A'} {attendee?.guestPhone ? `• ${attendee.guestPhone}` : ''}
                                                        </p>
                                                    </div>

                                                    <Button size="sm" variant="danger" onClick={() => handleCheckOut(player.id)} title="Return to Signups" className="!p-1 shrink-0">
                                                        <MinusIcon className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>

                                                {/* Payment Status Buttons */}
                                                <div className="mt-1.5 pt-1.5 border-t border-zinc-700/60 flex items-center justify-between gap-1 flex-wrap">
                                                    <div className="flex gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCheckIn(player.id)}
                                                            className={`px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9px] font-bold border ${
                                                                !isNoShow ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                                                            }`}
                                                        >
                                                            In
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleMarkNoShow(player.id)}
                                                            className={`px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9px] font-bold border ${
                                                                isNoShow ? 'bg-amber-600 text-white border-amber-500' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                                                            }`}
                                                        >
                                                            No Show
                                                        </button>
                                                    </div>

                                                    <div className="flex gap-1">
                                                        {(['Paid (Card)', 'Paid (Cash)', 'Paid (EFT)', 'Unpaid'] as PaymentStatus[]).map(st => (
                                                            <button 
                                                                key={st}
                                                                type="button"
                                                                onClick={() => handlePaymentStatus(player.id, st)}
                                                                className={`px-1 sm:px-1.5 py-0.5 rounded text-[8.5px] sm:text-[9px] font-bold transition-all cursor-pointer ${
                                                                    attendee?.paymentStatus === st 
                                                                        ? 'bg-red-600 text-white shadow-sm' 
                                                                        : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                                                                }`}
                                                            >
                                                                {st.replace('Paid (', '').replace(')', '')}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <p className="text-center text-zinc-500 text-xs py-2 italic">No checked-in operators yet.</p>
                                    )}
                                </div>
                            </div>

                            {/* Winning Declaration & Event Finalization */}
                            {event && formData.status !== 'Completed' && formData.status !== 'Cancelled' && (
                                <div className="space-y-1.5 sm:space-y-2 pt-2 border-t border-zinc-800 bg-zinc-950/60 p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-zinc-800">
                                    <div className="space-y-1">
                                        <label className="block text-[11px] sm:text-xs font-semibold text-zinc-300">Winning Team Declaration</label>
                                        <select
                                            value={formData.winningTeamId || ''}
                                            onChange={e => setFormData(f => ({ ...f, winningTeamId: (e.target.value as any) || null }))}
                                            className="w-full min-w-0 bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                                        >
                                            <option value="">-- No Winner Declared --</option>
                                            <option value="alpha">Alpha Team</option>
                                            <option value="bravo">Bravo Team</option>
                                            {(formData.teamCount || 2) >= 3 && <option value="charlie">Charlie Team</option>}
                                            {(formData.teamCount || 2) === 4 && <option value="delta">Delta Team</option>}
                                            <option value="tie">Draw / Tie</option>
                                        </select>
                                    </div>

                                    <Button onClick={handleFinalizeEvent} variant="primary" className="w-full !bg-green-600 hover:!bg-green-500 !text-xs !py-1.5 sm:!py-2 font-bold">
                                        <CheckCircleIcon className="w-4 h-4 mr-1.5" />
                                        Finalize Event & Award RP
                                    </Button>
                                </div>
                            )}

                            {/* Secondary Actions: Cancel / Reactivate / Delete */}
                            <div className="flex gap-1.5 sm:gap-2 pt-1">
                                {event && formData.status !== 'Cancelled' && (
                                    <Button 
                                        onClick={handleCancelEvent} 
                                        variant="secondary" 
                                        className="flex-1 !border-red-600/50 !text-red-400 hover:!bg-red-950/50 !text-xs !py-1.5"
                                    >
                                        <Ban className="w-3.5 h-3.5 mr-1" />
                                        Cancel Event
                                    </Button>
                                )}
                                {event && formData.status === 'Cancelled' && (
                                    <Button 
                                        onClick={handleReactivateEvent} 
                                        variant="secondary" 
                                        className="flex-1 !border-emerald-500/50 !text-emerald-400 hover:!bg-emerald-950/50 !text-xs !py-1.5"
                                    >
                                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                        Reactivate
                                    </Button>
                                )}
                                {event && (
                                    <Button onClick={() => onDelete(event.id)} variant="danger" className="flex-1 !text-xs !py-1.5">
                                        <TrashIcon className="w-3.5 h-3.5 mr-1" />
                                        Delete
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}
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

            {showRentalManifestModal && (
                <EquipmentRentalsSummaryModal
                    event={{
                        ...(event || {}),
                        ...formData,
                        id: event?.id || 'preview_event',
                        liveStats: liveStats
                    }}
                    player={null}
                    players={players}
                    signups={signups}
                    inventory={inventory}
                    onClose={() => setShowRentalManifestModal(false)}
                    isAdmin={true}
                    initialTab="admin-manifest"
                />
            )}

            {showAddGuestModal && event && (
                <AddGuestPlayerModal
                    eventId={event.id}
                    inventory={inventory}
                    onClose={() => setShowAddGuestModal(false)}
                    onAddGuest={handleAddGuestPlayer}
                />
            )}
        </div>
    );
};
