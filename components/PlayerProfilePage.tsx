import React, { useState, useMemo, useEffect, useContext } from 'react';
import type { Player, GameEvent, Tier, XpAdjustment, LegendaryBadge, PlayerRole, Rank, CompanyDetails, Badge } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { BadgePill } from './BadgePill';
import { EventCard } from './EventCard';
import { MOCK_PLAYER_ROLES, UNRANKED_TIER } from '../constants';
import { ArrowLeftIcon, UserIcon, ChartBarIcon, CalendarIcon, TrophyIcon, CrosshairsIcon, PlusCircleIcon, TrashIcon, ShieldCheckIcon } from './icons/Icons';
import { Modal } from './Modal';
import { InfoTooltip } from './InfoTooltip';
import { DataContext } from '../data/DataContext';
import { UrlOrUploadField } from './UrlOrUploadField';
import { SendCredentialsModal } from './SendCredentialsModal';
import { motion } from 'framer-motion';
import { getRankForPlayer, getRankProgression as computeRankProgression, FALLBACK_RECRUIT_TIER, resolveRankIcon, getRankBadgeSvg } from '../utils/rankUtils';
import { calculatePlayerPerformance } from '../utils/playerPerformanceUtils';

const getTierForPlayer = (player: Player, ranks: Rank[]): Tier => {
    return getRankForPlayer(player, ranks);
};

const getRankProgression = (player: Player, ranks: Rank[]) => {
    return computeRankProgression(player, ranks);
};

interface PlayerProfilePageProps {
    player: Player;
    players: Player[];
    events: GameEvent[];
    legendaryBadges: LegendaryBadge[];
    onBack: () => void;
    onUpdatePlayer: (player: Player) => void;
    onDeletePlayer?: (playerId: string) => void;
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
                    tooltip="Enter the amount of Rank Points (XP) to adjust. Use a positive number (e.g., 100) to award a bonus, or a negative number (e.g., -50) to issue a penalty. Deducting XP can cause a player to rank down. This adjustment will be logged and visible to the player."
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

export const PlayerProfilePage: React.FC<PlayerProfilePageProps> = ({ player, players, events, legendaryBadges, onBack, onUpdatePlayer, onDeletePlayer, ranks, companyDetails }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...player });
    const [isAwardingXp, setIsAwardingXp] = useState(false);
    const [selectedLegendaryBadge, setSelectedLegendaryBadge] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [isResettingPin, setIsResettingPin] = useState(false);
    const [isSendingCredentials, setIsSendingCredentials] = useState(false);
    const dataContext = useContext(DataContext);
    
    const [showSqlModal, setShowSqlModal] = useState(false);
    const [copiedSql, setCopiedSql] = useState(false);

    useEffect(() => {
        setFormData(player);
    }, [player]);

    const playerTier = getTierForPlayer(player, ranks);
    const playerRank = ranks.find(rank => (rank.tiers || []).some(t => t.id === playerTier.id));
    
    // Dynamically calculate career performance from XP earned, badges rewarded, match history, and honors
    const perf = useMemo(() => {
        return calculatePlayerPerformance(player, dataContext?.honors, dataContext?.badges, legendaryBadges);
    }, [player, dataContext?.honors, dataContext?.badges, legendaryBadges]);

    const { stats, matchHistory } = player;
    const kills = perf.kills;
    const deaths = perf.deaths;
    const kdr = perf.kdr;

    const handleSave = () => {
        let dataToSave = { ...formData, age: Number(formData.age) };
        if (!dataToSave.avatarUrl) {
            dataToSave.avatarUrl = `https://api.dicebear.com/8.x/bottts/svg?seed=${dataToSave.name}${dataToSave.surname}`;
        }
        // Retain latest stats, rank, and xpAdjustments from current player prop
        const updatedPlayer: Player = {
            ...player,
            ...dataToSave,
            stats: player.stats || dataToSave.stats,
            rank: player.rank || playerTier,
            xpAdjustments: player.xpAdjustments || [],
        };
        onUpdatePlayer(updatedPlayer);
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
        setFormData(f => ({ ...f, avatarUrl: '' }));
    };

    const handleAwardXp = (amount: number, reason: string) => {
        const newAdjustment: XpAdjustment = {
            amount,
            reason,
            date: new Date().toISOString(),
        };
        
        const currentStats = player.stats || { kills: 0, deaths: 0, headshots: 0, gamesPlayed: 0, xp: 0 };
        const newXp = (currentStats.xp ?? 0) + amount;
        
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

        // Update local form state immediately
        setFormData(updatedPlayer);

        // Notify parent / DataContext to persist update
        onUpdatePlayer(updatedPlayer);

        // Notify admin if player ranked up
        if (newTier.id !== (player.rank?.id || playerTier.id) && newTier.minXp > (player.rank?.minXp || 0)) {
            dataContext?.createNotification?.({
                title: `Rank Promoted: ${player.name}`,
                message: `${player.name} (${player.playerCode}) advanced to ${newTier.name}!`,
                type: 'rank_up',
                playerId: player.id,
                playerName: `${player.name} ${player.surname || ''}`.trim(),
                playerCallsign: player.callsign,
                playerCode: player.playerCode,
                playerAvatarUrl: player.avatarUrl,
                rankTierName: newTier.name,
                rankIconUrl: newTier.iconUrl,
            });
        }

        setIsAwardingXp(false);
    };
    
    const handleAwardLegendaryBadge = () => {
        const badgeToAward = legendaryBadges.find(b => b.id === selectedLegendaryBadge);
        if (!badgeToAward) {
            alert("Please select a valid badge to award.");
            return;
        }

        const playerAlreadyHasBadge = (player.legendaryBadges || []).some(b => b.id === badgeToAward.id);
        if (playerAlreadyHasBadge) {
            alert(`${player.name} already has the "${badgeToAward.name}" badge.`);
            return;
        }

        const updatedPlayer: Player = {
            ...player,
            legendaryBadges: [...(player.legendaryBadges || []), badgeToAward],
        };
        onUpdatePlayer(updatedPlayer);

        // Auto-notify admin of legendary badge award
        dataContext?.createNotification?.({
            title: `Legendary Badge Awarded`,
            message: `${player.name} (${player.playerCode}) was awarded the "${badgeToAward.name}" Legendary Badge!`,
            type: 'legendary_badge_earned',
            playerId: player.id,
            playerName: `${player.name} ${player.surname || ''}`.trim(),
            playerCallsign: player.callsign,
            playerCode: player.playerCode,
            playerAvatarUrl: player.avatarUrl,
            badgeName: badgeToAward.name,
            badgeIconUrl: badgeToAward.iconUrl,
        });

        setSelectedLegendaryBadge(''); // Reset dropdown
    };

    const handleRevokeLegendaryBadge = (badgeId: string) => {
        if (confirm("Are you sure you want to revoke this legendary badge from the player?")) {
            const updatedPlayer: Player = {
                ...player,
                legendaryBadges: (player.legendaryBadges || []).filter(b => b.id !== badgeId),
            };
            onUpdatePlayer(updatedPlayer);
        }
    };
    
    const availableBadgesToAward = (legendaryBadges || []).filter(
        globalBadge => globalBadge && !(player?.legendaryBadges || []).some(playerBadge => playerBadge?.id === globalBadge.id)
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

    // Progression widget data
    const { current, next, rank } = getRankProgression(player, ranks);
    const playerXP = player.stats?.xp ?? 0;
    const startXp = current.minXp;
    const endXp = next ? next.minXp : 0;
    const progressPercentage = next ? (
        endXp > startXp ? Math.min(((playerXP - startXp) / (endXp - startXp)) * 100, 100) : 0
      ) : 100;
    const percentile = (players || []).length > 1
        ? (((players || []).filter(p => (p?.stats?.xp ?? 0) < playerXP).length / ((players || []).length - 1)) * 100)
        : 100;

    const allStandardBadges = dataContext?.badges || [];

    const handleAwardStandardBadge = (badge: Badge) => {
        const updatedPlayer: Player = {
            ...player,
            badges: [...(player.badges || []), badge],
        };
        onUpdatePlayer(updatedPlayer);
    };

    const handleRevokeStandardBadge = (badgeId: string) => {
        if (confirm("Are you sure you want to revoke this standard badge? The player may re-earn it automatically if they still meet the criteria.")) {
            const updatedPlayer: Player = {
                ...player,
                badges: (player.badges || []).filter(b => b.id !== badgeId),
            };
            onUpdatePlayer(updatedPlayer);
        }
    };


    const playerSqlSnippet = `-- ==========================================================
-- MANUAL XP AWARD SQL QUERY FOR POSTGRESQL / SUPABASE
-- Target Operator: ${player.name} (${player.callsign})
-- Player ID: ${player.id}
-- ==========================================================

-- Award 500 XP (replace 500 with desired amount & reason)
UPDATE public.players
SET 
  stats = jsonb_set(
    COALESCE(stats, '{"kills":0,"deaths":0,"headshots":0,"gamesPlayed":0,"xp":0}'::jsonb),
    '{xp}',
    to_jsonb(COALESCE((stats->>'xp')::int, 0) + 500)
  ),
  "xpAdjustments" = COALESCE("xpAdjustments", '[]'::jsonb) || jsonb_build_object(
    'amount', 500,
    'reason', 'Manual Admin XP Award',
    'date', CURRENT_TIMESTAMP
  )
WHERE id = '${player.id}';`;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {isAwardingXp && <AwardXpModal onClose={() => setIsAwardingXp(false)} onSave={handleAwardXp} />}
            {isResettingPin && <ResetPinModal onClose={() => setIsResettingPin(false)} onSave={handleResetPin} />}
            {isSendingCredentials && <SendCredentialsModal player={player} onClose={() => setIsSendingCredentials(false)} />}
            {showSqlModal && (
                <Modal title={`SQL Query: Award XP to ${player.callsign}`} onClose={() => setShowSqlModal(false)}>
                    <div className="space-y-4">
                        <p className="text-sm text-zinc-300">
                            Run this SQL query directly in your Supabase SQL Editor or PostgreSQL terminal to manually award XP and log the adjustment for <strong className="text-white">{player.name} ({player.callsign})</strong>.
                        </p>
                        <div className="relative bg-zinc-950 p-4 rounded-lg border border-zinc-800 font-mono text-xs text-green-400 overflow-x-auto">
                            <pre>{playerSqlSnippet}</pre>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(playerSqlSnippet);
                                    setCopiedSql(true);
                                    setTimeout(() => setCopiedSql(false), 2000);
                                }}
                                className="absolute top-2 right-2 px-3 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded font-sans transition-colors"
                            >
                                {copiedSql ? 'Copied!' : 'Copy SQL'}
                            </button>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button variant="secondary" onClick={() => setShowSqlModal(false)}>Close</Button>
                        </div>
                    </div>
                </Modal>
            )}
            <header className="flex items-center mb-6">
                <Button onClick={onBack} variant="secondary" size="sm" className="mr-4">
                    <ArrowLeftIcon className="w-5 h-5" />
                </Button>
                <img 
                    src={player.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.callsign || player.name || 'OP')}&background=18181b&color=ef4444&bold=true`} 
                    alt={player.name} 
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.callsign || player.name || 'OP')}&background=18181b&color=ef4444&bold=true`;
                    }}
                    className="w-12 h-12 rounded-full object-cover mr-4 border border-zinc-700" 
                />
                <div>
                    <h1 className="text-2xl font-bold text-white">{player.name} "{player.callsign}" {player.surname}</h1>
                    <div className="flex items-center mt-1">
                        <img 
                            src={resolveRankIcon(playerTier.iconUrl, playerRank?.name || playerTier.name, playerTier.name, playerRank?.rankBadgeUrl)} 
                            alt={playerTier.name} 
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(playerTier.name || playerRank?.name || '');
                            }}
                            className="w-6 h-6 mr-2 object-contain drop-shadow-sm" 
                        />
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
                                            apiServerUrl={companyDetails?.apiServerUrl}
                                        />
                                    </div>
                                    <Input label="First Name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))}/>
                                    <Input label="Surname" value={formData.surname} onChange={e => setFormData(f => ({...f, surname: e.target.value}))}/>
                                    <Input 
                                        label="Callsign (Admin Assigned)" 
                                        value={formData.callsign} 
                                        onChange={e => setFormData(f => ({...f, callsign: e.target.value}))}
                                        tooltip="As an Administrator, you have exclusive authority to assign and change player callsigns. Regular players cannot edit their callsigns."
                                    />
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
                                    <div className="pt-2 flex gap-2">
                                        <Button variant="secondary" onClick={() => setIsSendingCredentials(true)} className="w-full">
                                            Send Credentials
                                        </Button>
                                        <Button variant="secondary" onClick={() => setShowSqlModal(true)} className="w-full text-xs">
                                            SQL Query
                                        </Button>
                                    </div>
                                    {onDeletePlayer && (
                                        <div className="pt-2 border-t border-zinc-800/80 mt-2">
                                            <Button 
                                                variant="danger" 
                                                onClick={() => {
                                                    if (confirm(`Are you sure you want to permanently delete operator "${player.name} ${player.surname || ''}" (${player.playerCode})? This action cannot be undone.`)) {
                                                        onDeletePlayer(player.id);
                                                    }
                                                }} 
                                                className="w-full flex items-center justify-center gap-2"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                Delete Operator
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </DashboardCard>
                    <DashboardCard title="Legendary Awards" icon={<TrophyIcon className="w-6 h-6 text-amber-400" />}>
                        <div className="p-6 space-y-3">
                            {(player.legendaryBadges || []).length > 0 ? (player.legendaryBadges || []).map(badge => (
                                <div key={badge.id} className="flex items-center justify-between gap-3 bg-zinc-800/50 p-2 rounded-md">
                                    <div className="flex items-center gap-3">
                                        {badge.iconUrl && badge.iconUrl.trim() !== '' ? (
                                            <img src={badge.iconUrl} alt={badge.name} className="w-8 h-8"/>
                                        ) : (
                                            <TrophyIcon className="w-8 h-8 text-amber-400" />
                                        )}
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

                    {/* Official Honors Card */}
                    <DashboardCard title="Player Honors (MOTM / MOTMth / MOTYr)" icon={<TrophyIcon className="w-6 h-6 text-amber-400" />}>
                        <div className="p-6 space-y-3">
                            {(() => {
                                const playerHonors = dataContext?.honors?.filter(h => h.playerId === player.id) || [];
                                if (playerHonors.length === 0) {
                                    return <p className="text-gray-500 text-center text-sm">No official honors assigned yet.</p>;
                                }
                                return playerHonors.map(h => {
                                    const typeNorm = (h.type || '').toLowerCase();
                                    let icon = '🎖️';
                                    let label = h.type || 'Honor';
                                    if (typeNorm.includes('year') || typeNorm === 'man_of_the_year') {
                                        icon = '👑';
                                        label = h.type || 'Man of Year';
                                    } else if (typeNorm.includes('month') || typeNorm === 'man_of_the_month') {
                                        icon = '🏆';
                                        label = h.type || 'Man of Month';
                                    } else if (typeNorm.includes('match') || typeNorm === 'man_of_the_match') {
                                        icon = '🌟';
                                        label = h.type || 'Man of Match';
                                    }

                                    return (
                                        <div key={h.id} className="p-3 bg-zinc-800/60 rounded-lg border border-amber-500/30 flex items-start gap-3">
                                            {h.badgeImageUrl ? (
                                                <img src={h.badgeImageUrl} alt={h.title} className="w-10 h-10 object-contain drop-shadow flex-shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-zinc-950/80 border border-amber-500/40 flex items-center justify-center text-xl flex-shrink-0">
                                                    {icon}
                                                </div>
                                            )}
                                            <div className="flex-grow min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                                        <span>{icon}</span> <span>{label}</span>
                                                    </span>
                                                    <span className="text-[11px] text-zinc-400 font-mono">{h.date}</span>
                                                </div>
                                                <p className="text-sm font-bold text-white truncate">{h.title}</p>
                                                {h.notes && <p className="text-xs text-zinc-300 italic mt-1 bg-zinc-900/60 p-1.5 rounded line-clamp-2">"{h.notes}"</p>}
                                            </div>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </DashboardCard>
                    <DashboardCard title="Standard Badges" icon={<TrophyIcon className="w-6 h-6" />}>
                        <div className="p-6 space-y-3 max-h-60 overflow-y-auto">
                            {allStandardBadges.length > 0 ? allStandardBadges.map(badge => {
                                const hasBadge = (player.badges || []).some(b => b.id === badge.id);
                                return (
                                    <div key={badge.id} className="flex items-center justify-between gap-3 bg-zinc-800/50 p-2 rounded-md">
                                        <div className="flex items-center gap-3">
                                            {badge.iconUrl && badge.iconUrl.trim() !== '' ? (
                                                <img src={badge.iconUrl} alt={badge.name} className="w-8 h-8"/>
                                            ) : (
                                                <TrophyIcon className="w-8 h-8 text-zinc-400" />
                                            )}
                                            <p className="font-semibold text-white">{badge.name}</p>
                                        </div>
                                        {hasBadge ? (
                                            <Button size="sm" variant="danger" onClick={() => handleRevokeStandardBadge(badge.id)}>Revoke</Button>
                                        ) : (
                                            <Button size="sm" variant="secondary" onClick={() => handleAwardStandardBadge(badge)}>Award</Button>
                                        )}
                                    </div>
                                )
                            }) : <p className="text-gray-500 text-center text-sm">No standard badges configured.</p>}
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
                    <DashboardCard title="Rank & Progression" icon={<ShieldCheckIcon className="w-6 h-6"/>}>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <img 
                                    src={resolveRankIcon(current.iconUrl, rank?.name, current.name, rank?.rankBadgeUrl)} 
                                    alt={rank?.name || current.name} 
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(current.name || rank?.name || '');
                                    }}
                                    className="w-16 h-16 object-contain drop-shadow-md"
                                />
                                <div>
                                    <p className="text-sm text-gray-400 uppercase tracking-wider">{rank?.name || 'Unranked'}</p>
                                    <p className="text-2xl font-bold text-white">{current.name}</p>
                                </div>
                            </div>

                            <div className="space-y-1 mb-4">
                                <div className="flex justify-between items-baseline">
                                    <p className="text-sm font-semibold text-gray-300">Progression</p>
                                    <p className="text-sm font-mono text-amber-300">{playerXP.toLocaleString()} / {next ? next.minXp.toLocaleString() : 'MAX'} RP</p>
                                </div>
                                <div className="w-full bg-zinc-900 rounded-full h-4 border border-zinc-800 shadow-inner overflow-hidden relative p-0.5">
                                    <motion.div 
                                        key={`profile-xp-bar-${playerXP}`}
                                        className="bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 h-full rounded-full shadow-[0_0_12px_rgba(245,158,11,0.5)] relative overflow-hidden"
                                        initial={{ width: '0%' }}
                                        animate={{ width: `${progressPercentage}%` }}
                                        transition={{ 
                                            type: 'spring',
                                            stiffness: 50,
                                            damping: 15,
                                            duration: 1.1 
                                        }}
                                    >
                                        <motion.div 
                                            animate={{ x: ['-100%', '200%'] }}
                                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                                            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-12 pointer-events-none"
                                        />
                                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    </motion.div>
                                </div>
                                <p className="text-right text-xs text-gray-400 font-mono">
                                    {next ? `${(next.minXp - playerXP > 0 ? next.minXp - playerXP : 0).toLocaleString()} RP to ${next.name}` : 'Maximum Rank Reached!'}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-zinc-700/50">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-400 mb-1">Percentile</h4>
                                        <p className="text-lg font-bold text-white">Top {(100 - percentile).toFixed(1)}%</p>
                                        <div className="w-full h-2 bg-zinc-950 rounded-full border border-zinc-800 overflow-hidden relative mt-1">
                                            <motion.div 
                                                key={`profile-percentile-${percentile}`}
                                                className="h-full rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] relative overflow-hidden"
                                                initial={{ width: '0%' }}
                                                animate={{ width: `${percentile}%` }}
                                                transition={{ 
                                                    type: 'spring', 
                                                    stiffness: 45, 
                                                    damping: 14, 
                                                    duration: 1.2 
                                                }}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">of all operators</p>
                                    </div>
                                    {next && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-400 mb-1">Next Tier Unlocks</h4>
                                            <ul className="text-xs text-gray-300 list-disc list-inside space-y-0.5">
                                                {(next.perks || []).map((perk, i) => <li key={i}>{perk}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DashboardCard>
                    <DashboardCard title="Lifetime Performance" icon={<ChartBarIcon className="w-6 h-6"/>}>
                        <div className="p-4 sm:p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                                <span className="text-xs text-zinc-400">
                                    Career metrics dynamically computed from matches, XP adjustments, badges, and honors.
                                </span>
                                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                                    Grade: <strong className="text-emerald-400">{perf.combatGrade}</strong> ({perf.combatRating}/100)
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-center">
                                    <p className="text-xs text-zinc-400">Total Rank Points</p>
                                    <p className="text-2xl sm:text-3xl font-black font-mono text-amber-300 mt-1">
                                        {perf.totalLifetimeXp.toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-red-400 font-mono mt-0.5">+{perf.avgXpPerMatch} RP/match</p>
                                </div>
                                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-center">
                                    <p className="text-xs text-zinc-400">Matches Played</p>
                                    <p className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                                        {perf.matchesPlayed.toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Career events</p>
                                </div>
                                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-center">
                                    <p className="text-xs text-zinc-400">Badges Earned</p>
                                    <p className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                                        {perf.totalBadgesEarned}
                                    </p>
                                    <p className="text-[10px] text-amber-400 font-mono mt-0.5">{perf.legendaryBadgesCount} Mythic</p>
                                </div>
                                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-center">
                                    <p className="text-xs text-zinc-400">Badge Bonus RP</p>
                                    <p className="text-2xl sm:text-3xl font-black font-mono text-amber-400 mt-1">
                                        +{perf.badgeRewardsXp.toLocaleString()}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Commendation rewards</p>
                                </div>
                                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-center">
                                    <p className="text-xs text-zinc-400">Official Honors</p>
                                    <p className="text-2xl sm:text-3xl font-black font-mono text-purple-300 mt-1">
                                        {perf.honorsCount}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{perf.motmCount} MotM • {perf.motmthCount} MotMth</p>
                                </div>
                                <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-center">
                                    <p className="text-xs text-zinc-400">Combat Rating</p>
                                    <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-1">
                                        {perf.combatRating}<span className="text-xs text-zinc-500 font-normal">/100</span>
                                    </p>
                                    <p className="text-[10px] text-emerald-400 font-mono mt-0.5">Grade {perf.combatGrade}</p>
                                </div>
                            </div>
                        </div>
                    </DashboardCard>
                     <DashboardCard title="Match & Event History" icon={<CalendarIcon className="w-6 h-6" />}>
                        <div className="p-4 space-y-3 max-h-[40rem] overflow-y-auto">
                            {player?.matchHistory && player.matchHistory.length > 0 ? (
                                player.matchHistory
                                    .map(record => ({...record, event: (events || []).find(e => e.id === record?.eventId)}))
                                    .filter(record => record.event)
                                    .sort((a,b) => new Date(b.event!.date).getTime() - new Date(a.event!.date).getTime())
                                    .map(({ event }, index) => (
                                        <div key={index} className="bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/80 flex items-center justify-between gap-3">
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-white text-sm truncate">{event!.title}</h4>
                                                <p className="text-xs text-zinc-400 font-mono mt-0.5">{new Date(event!.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold font-mono">
                                                    Attended
                                                </span>
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
