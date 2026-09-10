import React, { useState, useMemo, useEffect, useContext } from 'react';
import type { Player, GameEvent, Tier, XpAdjustment, LegendaryBadge, PlayerRole, Rank, CompanyDetails, Badge } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { BadgePill } from './BadgePill';
import { EventCard } from './EventCard';
import { MOCK_PLAYER_ROLES, UNRANKED_TIER } from '../constants';
import { ArrowLeftIcon, UserIcon, ChartBarIcon, CalendarIcon, TrophyIcon, CrosshairsIcon, PlusCircleIcon, TrashIcon, ShieldCheckIcon } from './icons/Icons';
import { Eye, EyeOff, Sparkles, Send, Edit3, Code, Award, Key, Copy, Check, ChevronDown, Award as AwardIcon } from 'lucide-react';
import { Modal } from './Modal';
import { InfoTooltip } from './InfoTooltip';
import { DataContext } from '../data/DataContext';
import { UrlOrUploadField } from './UrlOrUploadField';
import { SendCredentialsModal } from './SendCredentialsModal';
import { motion } from 'framer-motion';
import { getRankForPlayer, getRankProgression as computeRankProgression, FALLBACK_RECRUIT_TIER, resolveRankIcon, getRankBadgeSvg } from '../utils/rankUtils';
import { calculatePlayerPerformance } from '../utils/playerPerformanceUtils';
import { generateUniquePlayerCode, generatePlayerCodeFromName } from '../utils/playerCodeGenerator';

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
        // Retain latest stats, rank, and xpAdjustments from form/player state
        const updatedPlayer: Player = {
            ...player,
            ...dataToSave,
            avatarUrl: dataToSave.avatarUrl,
            stats: dataToSave.stats || player.stats,
            rank: dataToSave.rank || player.rank || playerTier,
            xpAdjustments: dataToSave.xpAdjustments || player.xpAdjustments || [],
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
                    <div className="flex items-end gap-2">
                        <div className="flex-grow">
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
                                placeholder="Enter or Auto-Gen 6 digits"
                                inputMode="numeric"
                                pattern="\d{6}"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                const gen = Math.floor(100000 + Math.random() * 900000).toString();
                                setNewPin(gen);
                            }}
                            className="mb-1 text-xs whitespace-nowrap !py-2.5"
                            title="Auto-generate a random 6-digit PIN"
                        >
                            Auto-Gen
                        </Button>
                    </div>
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


    const playerHonors = useMemo(() => dataContext?.honors?.filter(h => h.playerId === player.id) || [], [dataContext?.honors, player.id]);

    return (
        <div className="p-2 sm:p-4 lg:p-6 max-w-7xl mx-auto space-y-2.5 sm:space-y-3.5">
            {isAwardingXp && <AwardXpModal onClose={() => setIsAwardingXp(false)} onSave={handleAwardXp} />}
            {isResettingPin && <ResetPinModal onClose={() => setIsResettingPin(false)} onSave={handleResetPin} />}
            {isSendingCredentials && <SendCredentialsModal player={player} onClose={() => setIsSendingCredentials(false)} />}

            {/* Compact Header & Action Toolbar */}
            <div className="bg-zinc-950/90 backdrop-blur-md border border-zinc-800/80 rounded-xl p-2.5 sm:p-3.5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                    <Button onClick={onBack} variant="secondary" size="sm" className="!p-2 shrink-0 h-9 w-9 flex items-center justify-center" title="Back to Players List">
                        <ArrowLeftIcon className="w-4 h-4" />
                    </Button>
                    <div className="relative shrink-0">
                        <img 
                            src={player.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.callsign || player.name || 'OP')}&background=18181b&color=ef4444&bold=true`} 
                            alt={player.name} 
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.callsign || player.name || 'OP')}&background=18181b&color=ef4444&bold=true`;
                            }}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-red-600/70 shadow-md" 
                        />
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-zinc-950 ${player.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <h1 className="text-sm sm:text-base md:text-lg font-black text-white truncate">{player.name} {player.surname}</h1>
                            {player.callsign && (
                                <span className="px-1.5 py-0.2 rounded bg-red-950/80 border border-red-500/40 text-red-400 font-mono text-[10px] sm:text-xs font-bold">
                                    "{player.callsign}"
                                </span>
                            )}
                            <BadgePill color={player.status === 'Active' ? 'green' : 'red'}>{player.status}</BadgePill>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-400 flex-wrap mt-0.5">
                            <span className="text-red-400 font-semibold flex items-center gap-1">
                                <img 
                                    src={resolveRankIcon(playerTier.iconUrl, playerRank?.name || playerTier.name, playerTier.name, playerRank?.rankBadgeUrl)} 
                                    alt={playerTier.name} 
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(playerTier.name || playerRank?.name || '');
                                    }}
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain inline-block" 
                                />
                                {playerRank ? `${playerRank.name} - ${playerTier.name}` : playerTier.name}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-zinc-300">Code: <strong className="text-amber-400">{((player.playerCode && player.playerCode !== 'NO-CODE') ? player.playerCode : generatePlayerCodeFromName(player.name, player.surname, player.id))}</strong></span>
                            {players && players.length > 0 && (
                                <>
                                    <span>•</span>
                                    <span className="text-[10px] text-zinc-500 font-mono">
                                        #{Math.max(1, players.findIndex(p => p.id === player.id) + 1)} of {players.length}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 md:pb-0 shrink-0 self-end md:self-auto">
                    <Button size="sm" variant={isEditing ? 'primary' : 'secondary'} onClick={() => setIsEditing(!isEditing)} className="!py-1.5 !px-2.5 text-xs flex items-center gap-1">
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
                    </Button>
                    <Button size="sm" onClick={() => setIsAwardingXp(true)} className="!py-1.5 !px-2.5 text-xs flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Award XP</span>
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => setIsSendingCredentials(true)} className="!py-1.5 !px-2.5 text-xs flex items-center gap-1" title="Send Login Credentials">
                        <Send className="w-3.5 h-3.5 text-blue-400" />
                        <span className="hidden sm:inline">Credentials</span>
                    </Button>
                    {onDeletePlayer && (
                        <Button 
                            size="sm" 
                            variant="danger" 
                            onClick={() => {
                                if (confirm(`Are you sure you want to permanently delete operator "${player.name} ${player.surname || ''}" (${player.playerCode})? This action cannot be undone.`)) {
                                    onDeletePlayer(player.id);
                                }
                            }}
                            className="!py-1.5 !px-2 text-xs"
                            title="Delete Operator"
                        >
                            <TrashIcon className="w-3.5 h-3.5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Responsive Grid: 2-column square side-by-side on mobile, 12-column on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-12 gap-2 sm:gap-3">
                {/* 1. Rank & Progression */}
                <div className="col-span-2 lg:col-span-7">
                    <DashboardCard title="Rank & Progression" icon={<ShieldCheckIcon className="w-4 h-4 text-red-400"/>} compact>
                        <div className="p-2.5 sm:p-3.5 flex flex-col justify-between gap-2.5">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <img 
                                        src={resolveRankIcon(current.iconUrl, rank?.name, current.name, rank?.rankBadgeUrl)} 
                                        alt={rank?.name || current.name} 
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(current.name || rank?.name || '');
                                        }}
                                        className="w-10 h-10 sm:w-12 sm:h-12 object-contain drop-shadow-md shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider truncate">{rank?.name || 'Unranked'}</p>
                                        <p className="text-sm sm:text-base font-black text-white truncate">{current.name}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-[10px] text-zinc-400">Progression</p>
                                    <p className="text-xs sm:text-sm font-black font-mono text-amber-300">
                                        {playerXP.toLocaleString()} <span className="text-zinc-500 font-normal">/ {next ? next.minXp.toLocaleString() : 'MAX'} RP</span>
                                    </p>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className="space-y-1">
                                <div className="w-full bg-zinc-900 rounded-full h-2.5 sm:h-3 border border-zinc-800 shadow-inner overflow-hidden relative p-0.5">
                                    <motion.div 
                                        key={`profile-xp-bar-${playerXP}`}
                                        className="bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 h-full rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] relative overflow-hidden"
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
                                    </motion.div>
                                </div>
                                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono">
                                    <span>Top {(100 - percentile).toFixed(1)}% of operators</span>
                                    <span className="text-amber-400/90 font-semibold">
                                        {next ? `${(next.minXp - playerXP > 0 ? next.minXp - playerXP : 0).toLocaleString()} RP to ${next.name}` : 'Maximum Rank Reached!'}
                                    </span>
                                </div>
                            </div>

                            {/* Next tier unlocks mini row */}
                            {next && (next.perks || []).length > 0 && (
                                <div className="pt-1.5 border-t border-zinc-800/60 flex items-center gap-1.5 overflow-x-auto text-[10px] text-zinc-400">
                                    <span className="font-semibold text-zinc-300 shrink-0">Unlocks:</span>
                                    {(next.perks || []).map((perk, i) => (
                                        <span key={i} className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300 whitespace-nowrap shrink-0">
                                            {perk}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </DashboardCard>
                </div>

                {/* 2. Lifetime Performance with Square Side-by-Side metric tiles */}
                <div className="col-span-2 lg:col-span-5">
                    <DashboardCard 
                        title="Performance" 
                        icon={<ChartBarIcon className="w-4 h-4 text-emerald-400"/>} 
                        compact 
                        titleAddon={
                            <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                                Grade: <strong className="text-emerald-400">{perf.combatGrade}</strong> ({perf.combatRating}/100)
                            </span>
                        }
                    >
                        {/* 6 Square Side-by-Side tiles (3 columns on mobile & desktop) */}
                        <div className="grid grid-cols-3 gap-1 sm:gap-2 p-2">
                            {/* Total RP */}
                            <div className="aspect-square p-1.5 sm:p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/80 flex flex-col justify-center items-center text-center hover:border-zinc-700 transition-colors">
                                <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-medium line-clamp-1">Total RP</span>
                                <span className="text-xs sm:text-base font-black font-mono text-amber-300 my-0.5">{perf.totalLifetimeXp.toLocaleString()}</span>
                                <span className="text-[8px] sm:text-[9px] text-red-400 font-mono line-clamp-1">+{perf.avgXpPerMatch}/m</span>
                            </div>
                            {/* Matches */}
                            <div className="aspect-square p-1.5 sm:p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/80 flex flex-col justify-center items-center text-center hover:border-zinc-700 transition-colors">
                                <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-medium line-clamp-1">Matches</span>
                                <span className="text-xs sm:text-base font-black font-mono text-white my-0.5">{perf.matchesPlayed}</span>
                                <span className="text-[8px] sm:text-[9px] text-zinc-500 font-mono line-clamp-1">Attended</span>
                            </div>
                            {/* Rating */}
                            <div className="aspect-square p-1.5 sm:p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/80 flex flex-col justify-center items-center text-center hover:border-zinc-700 transition-colors">
                                <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-medium line-clamp-1">Rating</span>
                                <span className="text-xs sm:text-base font-black font-mono text-emerald-400 my-0.5">{perf.combatRating}<span className="text-[9px] text-zinc-500 font-normal">/100</span></span>
                                <span className="text-[8px] sm:text-[9px] text-emerald-400 font-mono line-clamp-1">Grade {perf.combatGrade}</span>
                            </div>
                            {/* Badges */}
                            <div className="aspect-square p-1.5 sm:p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/80 flex flex-col justify-center items-center text-center hover:border-zinc-700 transition-colors">
                                <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-medium line-clamp-1">Badges</span>
                                <span className="text-xs sm:text-base font-black font-mono text-white my-0.5">{perf.totalBadgesEarned}</span>
                                <span className="text-[8px] sm:text-[9px] text-amber-400 font-mono line-clamp-1">{perf.legendaryBadgesCount} Mythic</span>
                            </div>
                            {/* Bonus RP */}
                            <div className="aspect-square p-1.5 sm:p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/80 flex flex-col justify-center items-center text-center hover:border-zinc-700 transition-colors">
                                <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-medium line-clamp-1">Bonus RP</span>
                                <span className="text-xs sm:text-base font-black font-mono text-amber-400 my-0.5">+{perf.badgeRewardsXp.toLocaleString()}</span>
                                <span className="text-[8px] sm:text-[9px] text-zinc-500 font-mono line-clamp-1">Awards</span>
                            </div>
                            {/* Honors */}
                            <div className="aspect-square p-1.5 sm:p-2 bg-zinc-950/70 rounded-lg border border-zinc-800/80 flex flex-col justify-center items-center text-center hover:border-zinc-700 transition-colors">
                                <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-medium line-clamp-1">Honors</span>
                                <span className="text-xs sm:text-base font-black font-mono text-purple-300 my-0.5">{perf.honorsCount}</span>
                                <span className="text-[8px] sm:text-[9px] text-purple-400 font-mono line-clamp-1">{perf.motmCount} MotM</span>
                            </div>
                        </div>
                    </DashboardCard>
                </div>

                {/* 3. Mobile Square Side-by-Side Pair 1: Legendary Awards (Left) & Standard Badges (Right) */}
                <div className="col-span-1 lg:col-span-3">
                    <DashboardCard 
                        title="Legendary" 
                        icon={<TrophyIcon className="w-3.5 h-3.5 text-amber-400" />} 
                        compact 
                        titleAddon={<span className="text-[10px] font-mono font-bold text-amber-400">{(player.legendaryBadges || []).length}</span>}
                    >
                        <div className="h-44 sm:h-52 p-2 flex flex-col justify-between text-xs">
                            <div className="space-y-1.5 overflow-y-auto custom-scrollbar pr-0.5 flex-grow">
                                {(player.legendaryBadges || []).length > 0 ? (player.legendaryBadges || []).map(badge => (
                                    <div key={badge.id} className="flex items-center justify-between gap-1.5 bg-zinc-900/70 p-1.5 rounded border border-zinc-800">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            {badge.iconUrl && badge.iconUrl.trim() !== '' ? (
                                                <img src={badge.iconUrl} alt={badge.name} className="w-5 h-5 shrink-0 object-contain"/>
                                            ) : (
                                                <TrophyIcon className="w-4 h-4 text-amber-400 shrink-0" />
                                            )}
                                            <span className="font-semibold text-amber-300 text-[10px] sm:text-xs truncate">{badge.name}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleRevokeLegendaryBadge(badge.id)} 
                                            className="text-zinc-500 hover:text-red-400 p-0.5"
                                            title="Revoke Badge"
                                        >
                                            <TrashIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                )) : (
                                    <p className="text-zinc-500 text-center text-[11px] py-6">No mythic awards yet.</p>
                                )}
                            </div>

                            {/* Award dropdown */}
                            {availableBadgesToAward.length > 0 && (
                                <div className="pt-1.5 border-t border-zinc-800/80 mt-1 flex gap-1">
                                    <select 
                                        value={selectedLegendaryBadge} 
                                        onChange={e => setSelectedLegendaryBadge(e.target.value)}
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded px-1.5 py-1 text-[10px] text-white focus:outline-none"
                                    >
                                        <option value="">Award...</option>
                                        {availableBadgesToAward.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                    </select>
                                    <Button size="sm" onClick={handleAwardLegendaryBadge} disabled={!selectedLegendaryBadge} className="!py-0.5 !px-2 text-[10px]">
                                        +
                                    </Button>
                                </div>
                            )}
                        </div>
                    </DashboardCard>
                </div>

                <div className="col-span-1 lg:col-span-3">
                    <DashboardCard 
                        title="Badges" 
                        icon={<TrophyIcon className="w-3.5 h-3.5 text-zinc-400" />} 
                        compact 
                        titleAddon={<span className="text-[10px] font-mono font-bold text-zinc-400">{(player.badges || []).length}</span>}
                    >
                        <div className="h-44 sm:h-52 p-2 overflow-y-auto custom-scrollbar space-y-1.5 text-xs">
                            {allStandardBadges.length > 0 ? allStandardBadges.map(badge => {
                                const hasBadge = (player.badges || []).some(b => b.id === badge.id);
                                return (
                                    <div key={badge.id} className="flex items-center justify-between gap-1.5 bg-zinc-900/70 p-1.5 rounded border border-zinc-800">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                            {badge.iconUrl && badge.iconUrl.trim() !== '' ? (
                                                <img src={badge.iconUrl} alt={badge.name} className="w-5 h-5 shrink-0 object-contain"/>
                                            ) : (
                                                <TrophyIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                                            )}
                                            <span className={`text-[10px] sm:text-xs font-semibold truncate ${hasBadge ? 'text-white' : 'text-zinc-500'}`}>{badge.name}</span>
                                        </div>
                                        {hasBadge ? (
                                            <button 
                                                onClick={() => handleRevokeStandardBadge(badge.id)}
                                                className="text-[9px] text-red-400 hover:underline px-1 py-0.5"
                                                title="Revoke"
                                            >
                                                Revoke
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleAwardStandardBadge(badge)}
                                                className="text-[9px] text-amber-400 hover:underline px-1 py-0.5"
                                                title="Award"
                                            >
                                                +Award
                                            </button>
                                        )}
                                    </div>
                                );
                            }) : (
                                <p className="text-zinc-500 text-center text-[11px] py-6">No standard badges configured.</p>
                            )}
                        </div>
                    </DashboardCard>
                </div>

                {/* 4. Mobile Square Side-by-Side Pair 2: Honors (Left) & XP History (Right) */}
                <div className="col-span-1 lg:col-span-3">
                    <DashboardCard 
                        title="Honors" 
                        icon={<TrophyIcon className="w-3.5 h-3.5 text-purple-400" />} 
                        compact 
                        titleAddon={<span className="text-[10px] font-mono font-bold text-purple-300">{perf.honorsCount}</span>}
                    >
                        <div className="h-44 sm:h-52 p-2 overflow-y-auto custom-scrollbar space-y-1.5 text-xs">
                            {playerHonors.length > 0 ? playerHonors.map(h => {
                                const typeNorm = (h.type || '').toLowerCase();
                                let icon = '🎖️';
                                if (typeNorm.includes('year') || typeNorm === 'man_of_the_year') icon = '👑';
                                else if (typeNorm.includes('month') || typeNorm === 'man_of_the_month') icon = '🏆';
                                else if (typeNorm.includes('match') || typeNorm === 'man_of_the_match') icon = '🌟';

                                return (
                                    <div key={h.id} className="p-1.5 bg-zinc-900/70 rounded border border-purple-500/30 flex items-center gap-1.5">
                                        <span className="text-sm shrink-0">{icon}</span>
                                        <div className="min-w-0 flex-grow">
                                            <p className="text-[10px] font-bold text-white truncate">{h.title}</p>
                                            <p className="text-[8px] text-purple-400 font-mono">{h.date} • {h.type}</p>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <p className="text-zinc-500 text-center text-[11px] py-6">No official honors yet.</p>
                            )}
                        </div>
                    </DashboardCard>
                </div>

                <div className="col-span-1 lg:col-span-3">
                    <DashboardCard 
                        title="XP Log" 
                        icon={<PlusCircleIcon className="w-3.5 h-3.5 text-emerald-400" />} 
                        compact 
                        titleAddon={<span className="text-[10px] font-mono font-bold text-emerald-400">{(player.xpAdjustments || []).length}</span>}
                    >
                        <div className="h-44 sm:h-52 p-2 overflow-y-auto custom-scrollbar space-y-1.5 text-xs">
                            {(player.xpAdjustments || []).length > 0 ? [...player.xpAdjustments].reverse().map((adj, i) => (
                                <div key={i} className="bg-zinc-900/70 p-1.5 rounded border border-zinc-800">
                                    <div className="flex justify-between items-baseline">
                                        <span className={`font-black font-mono text-[11px] ${adj.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {adj.amount >= 0 ? '+' : ''}{adj.amount.toLocaleString()} XP
                                        </span>
                                        <span className="text-[8px] text-zinc-500 font-mono">{new Date(adj.date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-[9px] text-zinc-400 italic truncate mt-0.5">"{adj.reason}"</p>
                                </div>
                            )) : (
                                <p className="text-zinc-500 text-center text-[11px] py-6">No manual adjustments.</p>
                            )}
                        </div>
                    </DashboardCard>
                </div>

                {/* 5. Operator Details (Full width on mobile, 6-col on desktop) */}
                <div className="col-span-2 lg:col-span-6">
                    <DashboardCard 
                        title="Operator Details" 
                        icon={<UserIcon className="w-4 h-4 text-red-400" />} 
                        compact 
                        titleAddon={
                            <button 
                                onClick={() => setIsEditing(!isEditing)} 
                                className="text-[10px] text-red-400 hover:underline flex items-center gap-1 font-semibold"
                            >
                                <Edit3 className="w-3 h-3" />
                                <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                            </button>
                        }
                    >
                        <div className="p-2.5 sm:p-3.5">
                            {isEditing ? (
                                <div className="space-y-2.5">
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <Input label="First Name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))}/>
                                        <Input label="Surname" value={formData.surname} onChange={e => setFormData(f => ({...f, surname: e.target.value}))}/>
                                    </div>
                                    <Input 
                                        label="Callsign (Admin Assigned)" 
                                        value={formData.callsign} 
                                        onChange={e => setFormData(f => ({...f, callsign: e.target.value}))}
                                        tooltip="As an Administrator, you have exclusive authority to assign and change player callsigns."
                                    />
                                    <div className="flex items-end gap-2">
                                        <div className="flex-grow">
                                            <Input 
                                                label="Player Code" 
                                                value={formData.playerCode || ''} 
                                                onChange={e => setFormData(f => ({...f, playerCode: e.target.value.toUpperCase()}))}
                                                placeholder="e.g. DD01, VLERMUIS101"
                                                tooltip="Unique player ID code used for event check-ins and live score sheets."
                                            />
                                        </div>
                                        <Button 
                                            type="button" 
                                            variant="secondary" 
                                            onClick={() => {
                                                const code = generateUniquePlayerCode(formData, (players || []).filter(p => p.id !== player.id));
                                                setFormData(f => ({ ...f, playerCode: code }));
                                            }}
                                            className="mb-1 text-xs whitespace-nowrap !py-2"
                                        >
                                            Auto-Gen
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Input label="Age" type="number" value={formData.age} onChange={e => setFormData(f => ({...f, age: Number(e.target.value)}))} />
                                        <Input label="ID Number" value={formData.idNumber} onChange={e => setFormData(f => ({...f, idNumber: e.target.value}))} />
                                    </div>
                                    <div className="flex items-end gap-2">
                                        <div className="flex-grow">
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
                                                placeholder="6-digit PIN"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => {
                                                const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
                                                setFormData(f => ({ ...f, pin: randomPin }));
                                            }}
                                            className="mb-1 text-xs whitespace-nowrap !py-2"
                                            title="Auto-generate a random 6-digit PIN"
                                        >
                                            Auto-Gen
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <Input label="Email" value={formData.email} onChange={e => setFormData(f => ({...f, email: e.target.value}))}/>
                                        <Input label="Phone" type="tel" value={formData.phone} onChange={e => setFormData(f => ({...f, phone: e.target.value}))}/>
                                    </div>
                                    <Input label="Address" value={formData.address} onChange={e => setFormData(f => ({...f, address: e.target.value}))}/>
                                    <textarea placeholder="Bio" value={formData.bio} onChange={e => setFormData(p => ({...p, bio: e.target.value}))} rows={2} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-red-500" />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Preferred Role</label>
                                            <select value={formData.preferredRole} onChange={e => setFormData(p => ({...p, preferredRole: e.target.value as PlayerRole}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-red-500">
                                                {MOCK_PLAYER_ROLES.map(role => <option key={role}>{role}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
                                            <select value={formData.status} onChange={(e) => setFormData(p => ({...p, status: e.target.value as Player['status']}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-red-500">
                                                <option>Active</option>
                                                <option>On Leave</option>
                                                <option>Retired</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <Input label="Allergies" value={formData.allergies} onChange={e => setFormData(f => ({...f, allergies: e.target.value}))}/>
                                        <Input label="Medical Notes" value={formData.medicalNotes} onChange={e => setFormData(f => ({...f, medicalNotes: e.target.value}))}/>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button variant="secondary" size="sm" onClick={handleCancel} className="w-full">Cancel</Button>
                                        <Button size="sm" onClick={handleSave} className="w-full">Save Profile</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* Structured 2-column info grid */}
                                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs">
                                        {/* Code */}
                                        <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
                                            <span className="text-[10px] text-zinc-400 block font-medium">Player Code</span>
                                            <span className="font-mono text-amber-400 font-bold text-xs">
                                                {((player.playerCode && player.playerCode !== 'NO-CODE') ? player.playerCode : generatePlayerCodeFromName(player.name, player.surname, player.id))}
                                            </span>
                                        </div>

                                        {/* PIN Code */}
                                        <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800 flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] text-zinc-400 block font-medium">PIN Code</span>
                                                <span className="font-mono text-red-400 font-bold text-xs tracking-wider">
                                                    {showPin ? player.pin : '••••••'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => setShowPin(!showPin)} className="p-1 text-zinc-400 hover:text-white" title="Toggle PIN visibility">
                                                    {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                                <button onClick={() => setIsResettingPin(true)} className="text-[9px] text-zinc-400 hover:text-white underline">
                                                    Reset
                                                </button>
                                            </div>
                                        </div>

                                        {/* Age & ID */}
                                        <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
                                            <span className="text-[10px] text-zinc-400 block font-medium">Age / ID</span>
                                            <span className="text-white font-medium truncate block">{player.age || '—'} / {player.idNumber || '—'}</span>
                                        </div>

                                        {/* Role & Status */}
                                        <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
                                            <span className="text-[10px] text-zinc-400 block font-medium">Role & Status</span>
                                            <span className="text-white font-medium truncate block">{player.preferredRole || 'Operator'} • {player.status}</span>
                                        </div>

                                        {/* Email */}
                                        <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
                                            <span className="text-[10px] text-zinc-400 block font-medium">Email</span>
                                            <span className="text-white font-medium truncate block" title={player.email}>{player.email || '—'}</span>
                                        </div>

                                        {/* Phone */}
                                        <div className="bg-zinc-900/60 p-2 rounded border border-zinc-800">
                                            <span className="text-[10px] text-zinc-400 block font-medium">Phone</span>
                                            <span className="text-white font-medium truncate block">{player.phone || '—'}</span>
                                        </div>
                                    </div>

                                    {/* Medical & Bio summary pills */}
                                    {(player.medicalNotes || player.allergies || player.bio || player.address) && (
                                        <div className="bg-zinc-900/40 p-2 rounded border border-zinc-800/80 text-[11px] space-y-1 text-zinc-300">
                                            {player.bio && <p className="line-clamp-1"><strong className="text-zinc-400">Bio:</strong> {player.bio}</p>}
                                            {player.address && <p className="line-clamp-1"><strong className="text-zinc-400">Address:</strong> {player.address}</p>}
                                            {(player.allergies || player.medicalNotes) && (
                                                <p className="line-clamp-1 text-red-300">
                                                    <strong>Medical:</strong> {player.allergies ? `Allergies: ${player.allergies}` : ''} {player.medicalNotes ? `Notes: ${player.medicalNotes}` : ''}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Bottom action bar */}
                                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                                        <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)} className="!py-1 text-xs">
                                            Edit
                                        </Button>
                                        <Button size="sm" onClick={() => setIsAwardingXp(true)} className="!py-1 text-xs">
                                            Award XP
                                        </Button>
                                        <Button size="sm" variant="secondary" onClick={() => setIsSendingCredentials(true)} className="!py-1 text-xs">
                                            Credentials
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </DashboardCard>
                </div>

                {/* 6. Match & Event History (Full width on mobile, 6-col on desktop) */}
                <div className="col-span-2 lg:col-span-6">
                    <DashboardCard 
                        title="Match History" 
                        icon={<CalendarIcon className="w-4 h-4 text-blue-400" />} 
                        compact 
                        titleAddon={<span className="text-[10px] font-mono text-zinc-400">{(player.matchHistory || []).length} matches</span>}
                    >
                        <div className="h-56 sm:h-64 p-2 overflow-y-auto custom-scrollbar space-y-1.5 text-xs">
                            {player?.matchHistory && player.matchHistory.length > 0 ? (
                                player.matchHistory
                                    .map(record => ({...record, event: (events || []).find(e => e.id === record?.eventId)}))
                                    .filter(record => record.event)
                                    .sort((a,b) => new Date(b.event!.date).getTime() - new Date(a.event!.date).getTime())
                                    .map(({ event }, index) => (
                                        <div key={index} className="bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/80 flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-white text-xs truncate">{event!.title}</h4>
                                                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                                                    {new Date(event!.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold font-mono shrink-0">
                                                Attended
                                            </span>
                                        </div>
                                    ))
                            ) : (
                                <p className="text-zinc-500 text-center text-xs py-8">No matches played yet.</p>
                            )}
                        </div>
                    </DashboardCard>
                </div>
            </div>
        </div>
    );
};
