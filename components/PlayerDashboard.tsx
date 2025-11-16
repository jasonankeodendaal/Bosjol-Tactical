/** @jsxImportSource react */
import React, { useState, useEffect, useMemo, useContext, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player, Sponsor, GameEvent, PlayerStats, MatchRecord, InventoryItem, Rank, Badge, LegendaryBadge, Raffle, Location } from '../types';
import { DashboardCard } from './DashboardCard';
import { EventCard } from './EventCard';
import { UserIcon, ClipboardListIcon, CalendarIcon, ShieldCheckIcon, ChartBarIcon, TrophyIcon, SparklesIcon, HomeIcon, ChartPieIcon, CrosshairsIcon, CogIcon, UsersIcon, CurrencyDollarIcon, XIcon, CheckCircleIcon, UserCircleIcon, Bars3Icon, TicketIcon, CrownIcon, GlobeAltIcon, AtSymbolIcon, PhoneIcon, ChatBubbleLeftRightIcon, MapPinIcon } from './icons/Icons';
import { BadgePill } from './BadgePill';
import { MOCK_RANKS, MOCK_WEAPONS, MOCK_EQUIPMENT, MOCK_PLAYER_ROLES, UNRANKED_RANK, MOCK_BADGES } from '../constants';
import { ImageUpload } from './ImageUpload';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { InfoTooltip } from './InfoTooltip';
import { Leaderboard } from './Leaderboard';
import { AuthContext } from '../auth/AuthContext';
import { DataContext } from '../data/DataContext';
import { Loader } from './Loader';

const PlayerChatsTab = lazy(() => import('./PlayerChatsTab'));

const getRankForPlayer = (player: Player, ranks: Rank[]): Rank => {
    if (player.stats.gamesPlayed < 10) {
        return UNRANKED_RANK;
    }
    const sortedRanks = [...ranks].sort((a, b) => b.minXp - a.minXp);
    const rank = sortedRanks.find(r => player.stats.xp >= r.minXp);
    return rank || ranks[0] || UNRANKED_RANK;
};

interface PlayerDashboardProps {
    player: Player;
    players: Player[];
    sponsors: Sponsor[];
    onPlayerUpdate: (player: Player) => void;
    events: GameEvent[];
    onEventSignUp: (eventId: string, requestedGearIds: string[], note: string) => void;
    legendaryBadges: LegendaryBadge[];
    raffles: Raffle[];
    ranks: Rank[];
    locations: Location[];
}

type Tab = 'Overview' | 'Events' | 'Chats' | 'Raffles' | 'Stats' | 'Achievements' | 'Leaderboard' | 'Settings';

const ProgressBar: React.FC<{ value: number; max: number; isThin?: boolean }> = ({ value, max, isThin=false }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className={`w-full bg-zinc-700 rounded-full ${isThin ? 'h-1.5' : 'h-2.5'}`}>
            <div className="bg-red-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const EventDetailsModal: React.FC<{ event: GameEvent, player: Player, onClose: () => void, onSignUp: (id: string, requestedGearIds: string[], note: string) => void, locations: Location[] }> = ({ event, player, onClose, onSignUp, locations }) => {
    const isSignedUp = event.signedUpPlayers.includes(player.id);
    const [selectedGear, setSelectedGear] = useState<string[]>([]);
    const [note, setNote] = useState('');
    const [totalCost, setTotalCost] = useState(event.gameFee);
    const dataContext = useContext(DataContext);

    const alreadyRentedCount = useMemo(() => {
        const counts: Record<string, number> = {};
        // Count from confirmed attendees
        event.attendees.forEach(a => {
            (a.rentedGearIds || []).forEach(id => {
                counts[id] = (counts[id] || 0) + 1;
            });
        });
        // Count from players signed up but not yet confirmed
        (event.rentalSignups || []).forEach(s => {
            // Exclude the current player from this count if they are already signed up, to allow them to "re-signup" without their own rentals blocking them.
            if (s.playerId !== player.id || !isSignedUp) {
                 (s.requestedGearIds || []).forEach(id => {
                    counts[id] = (counts[id] || 0) + 1;
                });
            }
        });
        return counts;
    }, [event.attendees, event.rentalSignups, player.id, isSignedUp]);

    const gearCost = useMemo(() => {
        return selectedGear.reduce((sum, gearId) => {
            const item = event.gearForRent.find(g => g.id === gearId);
            return sum + (item?.salePrice || 0);
        }, 0);
    }, [selectedGear, event.gearForRent]);

    useEffect(() => {
        setTotalCost(event.gameFee + gearCost);
    }, [gearCost, event.gameFee]);
    
    const locationDetails = useMemo(() => locations.find(l => l.name === event.location), [locations, event.location]);


    const handleGearToggle = (itemId: string) => {
        setSelectedGear(prev => 
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };


    return (
        <Modal isOpen={true} onClose={onClose} title={event.title}>
            <div className="max-h-[70vh] overflow-y-auto pr-2">
                {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="w-full h-48 object-cover rounded-lg mb-4" />}
                <div className="flex justify-between items-center mb-4">
                     <BadgePill color="amber">{event.theme}</BadgePill>
                     <p className="text-sm font-semibold text-gray-300">{new Date(event.date).toLocaleDateString()} @ {event.startTime}</p>
                </div>
                <div className="space-y-4 text-gray-300">
                    <div>
                        <h3 className="font-bold text-lg text-white mb-2">Location</h3>
                        {locationDetails ? (
                            <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
                                <p className="font-semibold text-gray-200">{locationDetails.name}</p>
                                <p className="text-xs text-gray-400">{locationDetails.address}</p>
                                {locationDetails.pinLocationUrl && (
                                    <a href={locationDetails.pinLocationUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline text-xs flex items-center gap-1 mt-1">
                                        <MapPinIcon className="w-3 h-3"/> Open in Maps
                                    </a>
                                )}
                                {locationDetails.imageUrls.length > 0 && (
                                    <div className="flex space-x-2 overflow-x-auto mt-2 pb-1">
                                        {locationDetails.imageUrls.map((url, i) => (
                                            <img key={i} src={url} alt={`Location view ${i+1}`} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : <p>{event.location}</p>}
                    </div>
                     {event.audioBriefingUrl && (
                        <div>
                            <h3 className="font-bold text-lg text-white mb-2">Audio Briefing</h3>
                            <audio controls src={event.audioBriefingUrl} className="w-full">
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    )}
                    <div>
                        <h3 className="font-bold text-lg text-white mb-1">Briefing</h3>
                        <p>{event.description}</p>
                    </div>
                     <div>
                        <h3 className="font-bold text-lg text-white mb-1">Rules of Engagement</h3>
                        <p>{event.rules}</p>
                    </div>
                    {event.eventBadges && event.eventBadges.length > 0 && dataContext?.legendaryBadges && (
                         <div>
                            <h3 className="font-bold text-lg text-white mb-2">Event Commendations</h3>
                             <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {event.eventBadges.map(badgeId => {
                                    const badge = dataContext.legendaryBadges.find(b => b.id === badgeId);
                                    if (!badge) return null;
                                    return (
                                        <div key={badgeId} className="bg-zinc-800/50 p-2 rounded-lg text-center border border-amber-700/50" title={badge.description}>
                                            <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10 mx-auto"/>
                                            <p className="text-xs font-semibold text-amber-300 mt-1 truncate">{badge.name}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                     
                    {!isSignedUp && (
                        <div className="pt-4 border-t border-zinc-700/50">
                            <h3 className="font-bold text-lg text-white mb-2">Registration & Fees</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-gray-300 text-sm">
                                    <span>Game Fee:</span>
                                    <span className="font-semibold text-white">R{event.gameFee.toFixed(2)} (Payable on-site)</span>
                                </div>
                                {event.gearForRent.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-200 mb-2">Rent Gear</h4>
                                        <div className="space-y-2">
                                            {event.gearForRent.map(item => {
                                                const availableStock = item.stock - (alreadyRentedCount[item.id] || 0);
                                                const isAvailable = availableStock > 0;
                                                return (
                                                    <label key={item.id} className={`flex justify-between items-center bg-zinc-800/50 p-2 rounded-md text-sm ${isAvailable ? 'cursor-pointer hover:bg-zinc-800' : 'opacity-50 grayscale'} transition-all`}>
                                                        <div className="flex items-center">
                                                            <input
                                                                type="checkbox"
                                                                disabled={!isAvailable}
                                                                checked={selectedGear.includes(item.id)}
                                                                onChange={() => handleGearToggle(item.id)}
                                                                className="h-4 w-4 rounded border-gray-600 bg-zinc-700 text-red-500 focus:ring-red-500 mr-3 disabled:cursor-not-allowed"
                                                            />
                                                            <span>{item.name}</span>
                                                        </div>
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-semibold">R{item.salePrice.toFixed(2)}</span>
                                                            <span className={`text-xs ${isAvailable ? 'text-gray-400' : 'text-red-400 font-bold'}`}>
                                                                {isAvailable ? `${availableStock} available` : 'Out of Stock'}
                                                            </span>
                                                        </div>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-semibold text-gray-200 mb-2">Note to Admin (Optional)</h4>
                                    <textarea 
                                        value={note}
                                        onChange={e => setNote(e.target.value)}
                                        rows={2} 
                                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" 
                                        placeholder="e.g., I will be arriving 30 mins late." 
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-700/50">
                 {!isSignedUp && (
                    <div className="space-y-1 text-sm mb-4">
                        <div className="flex justify-between items-center text-gray-300">
                            <span>Game Fee:</span>
                            <span className="font-semibold">R{event.gameFee.toFixed(2)}</span>
                        </div>
                        {gearCost > 0 && (
                            <div className="flex justify-between items-center text-gray-300">
                                <span>Rental Gear:</span>
                                <span className="font-semibold">R{gearCost.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center text-lg font-bold text-white pt-1 border-t border-zinc-700/50 mt-1">
                            <span>Total Due:</span>
                            <span className="text-green-400">R{totalCost.toFixed(2)}</span>
                        </div>
                    </div>
                )}
                <Button 
                    onClick={() => onSignUp(event.id, isSignedUp ? [] : selectedGear, note)}
                    variant={isSignedUp ? 'danger' : 'primary'}
                    className="w-full"
                >
                     {isSignedUp ? 'Withdraw Registration' : 'Confirm Registration'}
                </Button>
            </div>
        </Modal>
    )
}

const Tabs: React.FC<{ activeTab: Tab; setActiveTab: (tab: Tab) => void; }> = ({ activeTab, setActiveTab }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const tabs: {name: Tab, icon: React.ReactNode}[] = [
        {name: 'Overview', icon: <HomeIcon className="w-5 h-5"/>},
        {name: 'Events', icon: <CalendarIcon className="w-5 h-5"/>},
        {name: 'Chats', icon: <ChatBubbleLeftRightIcon className="w-5 h-5"/>},
        {name: 'Raffles', icon: <TicketIcon className="w-5 h-5"/>},
        {name: 'Stats', icon: <ChartBarIcon className="w-5 h-5"/>},
        {name: 'Achievements', icon: <TrophyIcon className="w-5 h-5"/>},
        {name: 'Leaderboard', icon: <TrophyIcon className="w-5 h-5"/>},
        {name: 'Settings', icon: <UserCircleIcon className="w-5 h-5"/>},
    ];
    const activeTabInfo = tabs.find(t => t.name === activeTab);

    return (
        <div className="border-b border-zinc-800 mb-6">
            <div className="lg:hidden relative">
                 <button 
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center justify-between w-full px-4 py-3 text-left text-gray-200 bg-zinc-900/50 rounded-md border border-zinc-700"
                >
                    <div className="flex items-center gap-3">
                        {activeTabInfo?.icon}
                        <span className="font-semibold">{activeTab}</span>
                    </div>
                    <Bars3Icon className="w-6 h-6"/>
                </button>
                <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-full bg-zinc-900 border border-zinc-700 rounded-md shadow-lg z-50 p-2"
                    >
                        {tabs.map(tab => (
                            <button
                                key={tab.name}
                                onClick={() => {
                                    setActiveTab(tab.name);
                                    setMenuOpen(false);
                                }}
                                className={`w-full text-left flex items-center gap-3 p-3 rounded-md text-sm font-medium ${activeTab === tab.name ? 'bg-red-600/20 text-red-400' : 'text-gray-300 hover:bg-zinc-800'}`}
                            >
                                {tab.icon} {tab.name}
                            </button>
                        ))}
                    </motion.div>
                )}
                </AnimatePresence>
            </div>
            <nav className="hidden lg:flex -mb-px space-x-6 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`${
                            activeTab === tab.name
                                ? 'border-red-500 text-red-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        } flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors uppercase tracking-wider`}
                    >
                        {tab.icon}
                        {tab.name}
                    </button>
                ))}
            </nav>
        </div>
    );
}

const calculateBadgeProgress = (badge: Badge, player: Player, ranks: Rank[]) => {
    const isEarned = player.badges.some(b => b.id === badge.id);
    if (isEarned) return { current: 1, max: 1, percentage: 100, isEarned: true, text: 'Unlocked' };

    const { criteria } = badge;
    let current = 0;
    let max = 1;

    switch (criteria.type) {
        case 'kills':
            current = player.stats.kills;
            max = Number(criteria.value);
            break;
        case 'headshots':
            current = player.stats.headshots;
            max = Number(criteria.value);
            break;
        case 'gamesPlayed':
            current = player.stats.gamesPlayed;
            max = Number(criteria.value);
            break;
        case 'rank':
            const playerRank = getRankForPlayer(player, ranks);
            if (playerRank.name === criteria.value) {
                 return { current: 1, max: 1, percentage: 100, isEarned: true, text: 'Unlocked' };
            }
            return { current: 0, max: 1, percentage: 0, isEarned: false, text: `Reach ${criteria.value} Rank` };
        case 'custom':
            return { current: 0, max: 1, percentage: 0, isEarned: false, text: 'Admin Awarded' };
    }
    
    const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
    return { current, max, percentage, isEarned: false, text: `${current.toLocaleString()} / ${max.toLocaleString()}` };
};

const BadgeProgressCard: React.FC<{badge: Badge, player: Player, ranks: Rank[]}> = ({ badge, player, ranks }) => {
    const progress = calculateBadgeProgress(badge, player, ranks);
    
    const baseClasses = "bg-zinc-800/50 p-3 rounded-lg border flex items-center gap-4 transition-all duration-300";
    const unlockedClasses = "border-red-500/50 shadow-lg shadow-red-900/10";
    const lockedClasses = "border-zinc-700/50 opacity-70";

    return (
        <div className={`${baseClasses} ${progress.isEarned ? unlockedClasses : lockedClasses}`}>
             <img src={badge.iconUrl} alt={badge.name} className={`w-12 h-12 flex-shrink-0 ${!progress.isEarned ? 'grayscale' : ''}`} />
             <div className="flex-grow">
                <h5 className={`font-bold ${progress.isEarned ? 'text-red-400' : 'text-gray-300'}`}>{badge.name}</h5>
                <p className="text-xs text-gray-400 mb-1.5">{badge.description}</p>
                {!progress.isEarned && (
                    <>
                        <ProgressBar value={progress.current} max={progress.max} isThin />
                        <p className="text-xs text-right text-gray-500 mt-1">{progress.text}</p>
                    </>
                )}
             </div>
        </div>
    );
}

const OverviewTab: React.FC<Pick<PlayerDashboardProps, 'player' | 'events' | 'sponsors' | 'ranks'>> = ({ player, events, sponsors, ranks }) => {
    const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
    const nextEvent = events.filter(e => e.status === 'Upcoming').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    const playerRank = getRankForPlayer(player, ranks);
    const currentRankIndex = ranks.findIndex(r => r.name === playerRank.name);
    const nextRank = ranks[currentRankIndex + 1];

    const xpForCurrentRank = playerRank.minXp;
    const xpForNextRank = nextRank ? nextRank.minXp : playerRank.minXp;
    
    const xpProgressInTier = player.stats.xp - xpForCurrentRank;
    const xpNeededForNextRank = xpForNextRank - xpForCurrentRank;

    return (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
                <DashboardCard title="Player Profile" icon={<UserIcon className="w-6 h-6" />}>
                    <div className="p-6 text-center">
                         <img src={player.avatarUrl} alt={player.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-red-500 object-cover" />
                        <h2 className="text-xl font-bold text-white">{player.name} {player.surname}</h2>
                        <p className="text-sm text-gray-400">"{player.callsign}" {player.preferredRole && `- ${player.preferredRole}`}</p>
                        <div className="mt-4">
                            <BadgePill color={player.status === 'Active' ? 'green' : player.status === 'On Leave' ? 'amber' : 'red'}>{player.status}</BadgePill>
                        </div>
                        {player.bio && <p className="text-sm text-gray-300 mt-4 px-4 italic">"{player.bio}"</p>}
                    </div>
                </DashboardCard>
                 <DashboardCard 
                    title="Rank & Progression" 
                    icon={<ShieldCheckIcon className="w-6 h-6" />}
                    titleAddon={<InfoTooltip text="Your rank is a measure of your experience and achievements. It's determined by your total accumulated Rank Points (XP). To receive an official rank, you must participate in at least 10 matches. XP is awarded for completing matches, eliminating opponents (with bonuses for headshots), and achieving objectives specific to certain game modes. Higher ranks unlock new gear, perks, and prestige within the community." />}
                  >
                    <div className="p-6 space-y-4">
                        <div className="text-center">
                            <img src={playerRank.iconUrl} alt={playerRank.name} className="h-16 mx-auto mb-2" />
                            <h3 className="text-lg font-bold text-red-500">{playerRank.name}</h3>
                            <p className="text-sm text-gray-400">{player.stats.xp.toLocaleString()} Rank Points</p>
                        </div>
                        {nextRank && playerRank.name !== "Unranked" ? (
                             <div>
                                <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                                    <span>Progress to {nextRank.name}</span>
                                     <div className="flex items-center gap-1">
                                        <span>{xpProgressInTier.toLocaleString()} / {xpNeededForNextRank.toLocaleString()}</span>
                                        <InfoTooltip text="This bar shows your XP progress within your current rank. It visualizes the Rank Points you've earned since your last promotion relative to the amount needed to reach the next rank. Fill the bar completely to achieve your next promotion and unlock its associated rewards." />
                                    </div>
                                </div>
                                <ProgressBar value={xpProgressInTier} max={xpNeededForNextRank} />
                            </div>
                        ) : (
                             <div>
                                <p className="text-center text-sm font-semibold text-red-400">
                                    {playerRank.name === "Unranked" ? "Play 10 matches to get ranked" : "Maximum Rank Achieved!"}
                                </p>
                                <ProgressBar value={playerRank.name === "Unranked" ? player.stats.gamesPlayed : 1} max={playerRank.name === "Unranked" ? 10 : 1} />
                            </div>
                        )}
                         <div className="pt-4 border-t border-zinc-800">
                            <h4 className="font-bold text-gray-300 text-sm mb-2 text-center">Current Rank Unlocks</h4>
                            <ul className="space-y-1.5 text-xs text-center">
                                {playerRank.unlocks.map((unlock, i) => (
                                    <li key={i} className="flex items-center justify-center text-gray-400">
                                        <CheckCircleIcon className="w-4 h-4 mr-2 text-green-400 flex-shrink-0" />
                                        <span>{unlock}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </DashboardCard>
            </div>
             <div className="lg:col-span-2 space-y-6">
                {nextEvent ? (
                    <DashboardCard title="Next Mission" icon={<CalendarIcon className="w-6 h-6" />}>
                        <div className="p-2">
                             <EventCard event={nextEvent} />
                        </div>
                    </DashboardCard>
                ) : (
                    <DashboardCard title="Next Mission" icon={<CalendarIcon className="w-6 h-6" />}>
                        <p className="text-center text-gray-500 p-6">No upcoming events scheduled. Stand by for new orders.</p>
                    </DashboardCard>
                )}
                 <DashboardCard title="Official Sponsors" icon={<SparklesIcon className="w-6 h-6" />}>
                     <div className="relative w-full overflow-hidden py-6">
                        {sponsors.length > 0 ? (
                            <div className="flex whitespace-nowrap scrolling-wrapper">
                                {[...sponsors, ...sponsors].map((sponsor, index) => (
                                    <button 
                                        key={`${sponsor.id}-${index}`}
                                        className="flex flex-col items-center justify-center p-3 mx-6 text-center w-32 shrink-0 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg"
                                        onClick={() => setSelectedSponsor(sponsor)}
                                    >
                                        <img src={sponsor.logoUrl} alt={sponsor.name} className="h-16 object-contain mb-2 rounded-md transition-transform duration-300 hover:scale-110" />
                                        <p className="text-xs font-semibold text-gray-300 line-clamp-1">{sponsor.name}</p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center text-sm py-2">No current sponsors.</p>
                        )}
                    </div>
                </DashboardCard>
             </div>
             {selectedSponsor && (
                <Modal isOpen={true} onClose={() => setSelectedSponsor(null)} title={selectedSponsor.name}>
                    <div className="flex flex-col items-center text-center">
                        <img src={selectedSponsor.logoUrl} alt={selectedSponsor.name} className="h-24 object-contain mb-4 bg-white/10 p-2 rounded-lg"/>
                        <div className="space-y-2 text-gray-300">
                            {selectedSponsor.website && (
                                <a href={selectedSponsor.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-red-400 hover:underline">
                                    <GlobeAltIcon className="w-5 h-5"/>
                                    <span>Visit Website</span>
                                </a>
                            )}
                            {selectedSponsor.email && (
                                <p className="flex items-center justify-center gap-2">
                                    <AtSymbolIcon className="w-5 h-5"/>
                                    <span>{selectedSponsor.email}</span>
                                </p>
                            )}
                            {selectedSponsor.phone && (
                                <p className="flex items-center justify-center gap-2">
                                    <PhoneIcon className="w-5 h-5"/>
                                    <span>{selectedSponsor.phone}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    )
};

const EventsTab: React.FC<Pick<PlayerDashboardProps, 'player' | 'events' | 'onEventSignUp' | 'locations'>> = ({ player, events, onEventSignUp, locations }) => {
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
    const dataContext = useContext(DataContext);

    const filteredEvents = useMemo(() => {
        const sorted = [...events].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (filter === 'upcoming') {
            return sorted.filter(e => e.status === 'Upcoming' || e.status === 'In Progress');
        }
        return sorted.filter(e => e.status === 'Completed' || e.status === 'Cancelled');
    }, [events, filter]);

    const eventForModal = useMemo(() => {
        if (!selectedEventId) return null;
        return events.find(e => e.id === selectedEventId) || null;
    }, [selectedEventId, events]);

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Events Schedule</h2>
                <div className="flex space-x-1 p-1 bg-zinc-900 rounded-lg border border-zinc-700">
                    <Button size="sm" variant={filter === 'upcoming' ? 'primary' : 'secondary'} onClick={() => setFilter('upcoming')}>Upcoming</Button>
                    <Button size="sm" variant={filter === 'past' ? 'primary' : 'secondary'} onClick={() => setFilter('past')}>Past Events</Button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {filteredEvents.length > 0 ? filteredEvents.map(event => (
                    <div key={event.id} onClick={() => setSelectedEventId(event.id)} className="cursor-pointer">
                        <EventCard event={event}/>
                    </div>
                )) : <p className="text-center text-gray-500 py-4 sm:col-span-full">No {filter} events found.</p>}
            </div>
             {eventForModal && <EventDetailsModal event={eventForModal} player={player} onClose={() => setSelectedEventId(null)} onSignUp={onEventSignUp} locations={locations} />}
        </div>
    )
}

const StatDisplay: React.FC<{ value: string | number, label: string, tooltip?: string }> = ({ value, label, tooltip }) => (
    <div className="text-center">
        <p className="text-2xl font-bold text-white">{value}</p>
        <div className="flex items-center justify-center gap-1">
            <p className="text-sm text-gray-400">{label}</p>
            {tooltip && <InfoTooltip text={tooltip} />}
        </div>
    </div>
);

const StatsTab: React.FC<Pick<PlayerDashboardProps, 'player' | 'events'>> = ({ player, events }) => {
    const { stats, matchHistory } = player;
    const kdr = stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : stats.kills.toFixed(2);
    
    const bestMatch = useMemo(() => {
        if (matchHistory.length === 0) return null;
        return matchHistory.reduce((best, current) => {
            return current.playerStats.kills > best.playerStats.kills ? current : best;
        });
    }, [matchHistory]);
    
    const bestMatchEvent = bestMatch ? events.find(e => e.id === bestMatch.eventId) : null;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                 <DashboardCard 
                    title="Lifetime Stats" 
                    icon={<ChartBarIcon className="w-6 h-6" />}
                    titleAddon={<InfoTooltip text="Your complete performance statistics across all matches played, providing a comprehensive overview of your entire career." />}
                 >
                    <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-y-6">
                        <StatDisplay value={kdr} label="K/D Ratio" tooltip="Kill/Death Ratio. Calculated as Total Kills divided by Total Deaths. A higher number is better."/>
                        <StatDisplay value={stats.kills.toLocaleString()} label="Total Kills" tooltip="Total number of opponents eliminated across all your matches."/>
                        <StatDisplay value={stats.deaths.toLocaleString()} label="Total Deaths" tooltip="Total number of times you've been eliminated across all your matches."/>
                        <StatDisplay value={stats.headshots.toLocaleString()} label="Total Headshots" tooltip="Total number of eliminations made with a shot to the head. Headshots often award bonus XP."/>
                        <StatDisplay value={stats.gamesPlayed.toLocaleString()} label="Matches Played" tooltip="The total number of official matches you have participated in and completed."/>
                        <StatDisplay value={stats.xp.toLocaleString()} label="Total Rank Points" tooltip="Your lifetime accumulation of experience points (XP). This value determines your rank and position on the leaderboard."/>
                    </div>
                </DashboardCard>
                <DashboardCard 
                    title="Match History" 
                    icon={<CalendarIcon className="w-6 h-6" />}
                    titleAddon={<InfoTooltip text="A detailed log of your performance in every past match. This allows you to review your kills, deaths, and headshots for specific games to analyze your performance over time." />}
                >
                    <div className="p-6 space-y-4 max-h-[40rem] overflow-y-auto">
                        {player.matchHistory.length > 0 ? (
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
            <div className="lg:col-span-1 space-y-6">
                 {bestMatch && bestMatchEvent && (
                    <DashboardCard 
                        title="Best Match" 
                        icon={<TrophyIcon className="w-6 h-6"/>}
                        titleAddon={<InfoTooltip text="This highlights your single best performance on record, based on the number of kills achieved in a single match. It's a snapshot of you at your most effective." />}
                    >
                        <div className="p-2">
                             <EventCard event={bestMatchEvent} />
                             <div className="grid grid-cols-3 gap-2 text-center p-3">
                                <StatDisplay value={bestMatch.playerStats.kills} label="Kills" />
                                <StatDisplay value={bestMatch.playerStats.deaths} label="Deaths" />
                                <StatDisplay value={bestMatch.playerStats.headshots} label="Headshots" />
                            </div>
                        </div>
                    </DashboardCard>
                 )}
            </div>
        </div>
    )
}

const AchievementsTab: React.FC<{ player: Player, ranks: Rank[] }> = ({ player, ranks }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardCard 
                title="Badge Progress" 
                icon={<TrophyIcon className="w-6 h-6" />}
                titleAddon={<InfoTooltip text="Badges are digital commendations awarded for completing specific in-game challenges. This section shows your progress towards unlocking each one. Once a badge's criteria are met, it will be automatically awarded to your profile for everyone to see." />}
            >
                <div className="p-6 space-y-3 max-h-[30rem] overflow-y-auto">
                    {MOCK_BADGES.map(badge => (
                        <BadgeProgressCard key={badge.id} badge={badge} player={player} ranks={ranks} />
                    ))}
                </div>
            </DashboardCard>
            <DashboardCard title="Legendary Commendations" icon={<TrophyIcon className="w-6 h-6 text-amber-400"/>}>
                <div className="p-6 grid grid-cols-1 gap-3">
                    {player.legendaryBadges.length > 0 ? player.legendaryBadges.map(badge => (
                        <div key={badge.id} className="legendary-badge-item bg-zinc-800/50 p-3 rounded-lg border flex items-center gap-4">
                            <img src={badge.iconUrl} alt={badge.name} className="w-12 h-12 flex-shrink-0" />
                            <div className="flex-grow">
                                <h5 className="font-bold text-amber-300">{badge.name}</h5>
                                <p className="text-xs text-gray-300">{badge.description}</p>
                            </div>
                        </div>
                    )) : (
                        <p className="text-gray-500 text-center py-4">No legendary badges earned.</p>
                    )}
                </div>
            </DashboardCard>
        </div>
    )
}

const LeaderboardTab: React.FC<Pick<PlayerDashboardProps, 'player' | 'players'>> = ({ player: currentPlayer, players }) => {
    return (
        <DashboardCard title="Leaderboard" icon={<TrophyIcon className="w-6 h-6" />} fullHeight>
            <Leaderboard players={players} currentPlayerId={currentPlayer.id} />
        </DashboardCard>
    );
}

const SettingsTab: React.FC<Pick<PlayerDashboardProps, 'player' | 'onPlayerUpdate'>> = ({ player, onPlayerUpdate }) => {
    const [isUploading, setIsUploading] = useState(false);
    const dataContext = useContext(DataContext);
    const [formData, setFormData] = useState({
        name: player.name,
        surname: player.surname,
        callsign: player.callsign,
        bio: player.bio || '',
        preferredRole: player.preferredRole || MOCK_PLAYER_ROLES[0],
        email: player.email,
        phone: player.phone,
        address: player.address || '',
        allergies: player.allergies || '',
        medicalNotes: player.medicalNotes || '',
    });
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        const hasChanged = 
            player.name !== formData.name ||
            player.surname !== formData.surname ||
            player.callsign !== formData.callsign ||
            (player.bio || '') !== formData.bio ||
            (player.preferredRole || MOCK_PLAYER_ROLES[0]) !== formData.preferredRole ||
            player.email !== formData.email ||
            player.phone !== formData.phone ||
            (player.address || '') !== formData.address ||
            (player.allergies || '') !== formData.allergies ||
            (player.medicalNotes || '') !== formData.medicalNotes;
        setIsDirty(hasChanged);
    }, [formData, player]);

    const handleAvatarUpload = (urls: string[]) => {
        if (urls.length > 0) {
            onPlayerUpdate({ ...player, avatarUrl: urls[0] });
        }
        setIsUploading(false);
    };

    const handleRemoveAvatar = () => {
        const defaultAvatar = `https://api.dicebear.com/8.x/bottts/svg?seed=${player.name}${player.surname}`;
        onPlayerUpdate({ ...player, avatarUrl: defaultAvatar });
    };

    const handleSave = () => {
        onPlayerUpdate({ ...player, ...formData });
        setIsDirty(false);
    };

    return (
        <>
            <DashboardCard title="Operator Profile Settings" icon={<UserCircleIcon className="w-6 h-6"/>}>
                <div className="p-6 space-y-6">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 flex flex-col items-center">
                            <h4 className="font-bold text-gray-200 mb-2">Avatar</h4>
                            <div className="relative group w-32 h-32 mb-2">
                                <img src={player.avatarUrl} alt={player.name} className="w-32 h-32 rounded-full mx-auto border-2 border-red-500 object-cover" />
                                <div 
                                    className="absolute top-0 left-0 w-32 h-32 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={() => setIsUploading(true)}
                                >
                                    <p className="text-xs font-bold text-white">CHANGE</p>
                                </div>
                            </div>
                            <Button size="sm" variant="secondary" onClick={handleRemoveAvatar} className="!text-xs">Reset to default</Button>
                             <div className="flex items-center gap-2 mt-4">
                                <h4 className="font-bold text-gray-200">Player Code</h4>
                                <InfoTooltip text="This is your unique Operator ID within the Bosjol Tactical system. Admins will use this code to quickly check you into events and to manually assign kills or other stats to you during live games. Keep it handy on game day!" />
                             </div>
                             <div className="bg-zinc-800 text-red-400 font-mono text-lg tracking-widest px-4 py-2 rounded-md border border-zinc-700 mt-2">
                                {player.playerCode}
                             </div>
                        </div>
                        <div className="lg:col-span-2 space-y-4">
                             <h4 className="font-bold text-lg text-red-400 mb-2">Personal Details</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input label="First Name" value={formData.name} onChange={(e) => setFormData(p => ({...p, name: e.target.value}))} />
                                <Input label="Last Name" value={formData.surname} onChange={(e) => setFormData(p => ({...p, surname: e.target.value}))} />
                            </div>
                             <Input label="Callsign" value={formData.callsign} onChange={(e) => setFormData(p => ({...p, callsign: e.target.value}))} tooltip="Your callsign is your in-game nickname, how other players will know you on the field. Choose something unique and memorable!" />
                             <Input label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData(p => ({...p, email: e.target.value}))} tooltip="Your email address is used for official communications from Bosjol Tactical, including event confirmations, important announcements, and account-related notifications. We will never share your email with third parties."/>
                              <Input label="Phone Number" type="tel" value={formData.phone} onChange={(e) => setFormData(p => ({...p, phone: e.target.value}))} />
                        </div>
                    </div>

                     <div className="space-y-4 mt-6 pt-6 border-t border-zinc-800">
                         <h4 className="font-bold text-lg text-red-400 mb-2">Gameplay & Personal Info</h4>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Bio</label>
                            <textarea value={formData.bio} onChange={e => setFormData(p => ({...p, bio: e.target.value}))} rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="A short bio about your playstyle, background, or interests." />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Preferred Role</label>
                                <select value={formData.preferredRole} onChange={e => setFormData(p => ({...p, preferredRole: e.target.value as Player['preferredRole']}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                                    {MOCK_PLAYER_ROLES.map(role => <option key={role}>{role}</option>)}
                                </select>
                            </div>
                             <Input label="Address" value={formData.address} onChange={(e) => setFormData(p => ({...p, address: e.target.value}))} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Allergies & Medical Notes</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input placeholder="e.g., Peanuts, Penicillin" value={formData.allergies} onChange={(e) => setFormData(p => ({...p, allergies: e.target.value}))} />
                                <Input placeholder="e.g., Diabetic, carries epi-pen" value={formData.medicalNotes} onChange={(e) => setFormData(p => ({...p, medicalNotes: e.target.value}))} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 mt-6 pt-6 border-t border-zinc-800">
                        <Button className="w-full" onClick={handleSave} disabled={!isDirty}>
                           {isDirty ? 'Save Changes' : 'Saved'}
                        </Button>
                    </div>
                </div>
            </DashboardCard>
             {isUploading && (
                 <Modal isOpen={true} onClose={() => setIsUploading(false)} title="Upload New Avatar">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
                        <ImageUpload onUpload={handleAvatarUpload} accept="image/png, image/jpeg, image/gif" apiServerUrl={dataContext?.companyDetails.apiServerUrl} />
                    </div>
                </Modal>
            )}
        </>
    )
};

const RafflesTab: React.FC<Pick<PlayerDashboardProps, 'player' | 'raffles' | 'players'>> = ({ player, raffles, players }) => {
    const myTickets = raffles.flatMap(raffle => 
        raffle.tickets
            .filter(ticket => ticket.playerId === player.id)
            .map(ticket => ({ raffle, ticket }))
    ).sort((a,b) => new Date(b.raffle.drawDate).getTime() - new Date(a.raffle.drawDate).getTime());

    const myWins = raffles
        .filter(raffle => raffle.status === 'Completed')
        .flatMap(raffle => 
            raffle.winners
                .filter(winner => winner.playerId === player.id)
                .map(winner => {
                    const prize = raffle.prizes.find(p => p.id === winner.prizeId);
                    const ticket = raffle.tickets.find(t => t.id === winner.ticketId);
                    return { raffle, prize, ticket };
                })
        );
    
    const completedRaffles = raffles.filter(r => r.status === 'Completed').sort((a,b) => new Date(b.drawDate).getTime() - new Date(a.drawDate).getTime());
    
    return (
        <div className="space-y-6">
            {myWins.length > 0 && (
                <div className="space-y-4">
                    {myWins.map(({raffle, prize, ticket}) => (
                        <div key={raffle.id + prize!.id} className="legendary-badge-item bg-zinc-800/50 p-4 rounded-lg border text-center">
                            <TrophyIcon className="w-12 h-12 text-amber-400 mx-auto mb-2"/>
                            <h3 className="text-xl font-bold text-amber-300">Congratulations, you've won!</h3>
                            <p className="text-gray-300">You won <span className="font-bold">{prize!.name}</span> in the "{raffle.name}" raffle.</p>
                            <p className="text-xs text-gray-500 mt-2">Winning Ticket: {ticket!.code}</p>
                            <p className="text-sm font-semibold mt-3 text-white">Please see an admin to redeem your prize.</p>
                        </div>
                    ))}
                </div>
            )}
            <DashboardCard title="My Raffle Tickets" icon={<TicketIcon className="w-6 h-6"/>}>
                <div className="p-4">
                    {myTickets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myTickets.map(({raffle, ticket}) => (
                                <div key={ticket.id} className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700 text-center">
                                    <h4 className="font-bold text-red-400">{raffle.name}</h4>
                                    <p className="font-mono text-lg text-white my-2 bg-zinc-900 py-1 rounded-md border border-zinc-700">{ticket.code}</p>
                                    <p className="text-xs text-gray-400">Draw Date: {new Date(raffle.drawDate).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-4">You have not purchased any raffle tickets.</p>
                    )}
                </div>
            </DashboardCard>
            <DashboardCard title="Past Raffle Results" icon={<ClipboardListIcon className="w-6 h-6"/>}>
                <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                    {completedRaffles.length > 0 ? completedRaffles.map(raffle => {
                        return(
                            <div key={raffle.id} className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                                <h4 className="font-bold text-lg text-white">{raffle.name}</h4>
                                <p className="text-xs text-gray-500 mb-3">Drawn on {new Date(raffle.drawDate).toLocaleDateString()}</p>
                                <div className="space-y-2">
                                    {raffle.winners.length > 0 ? raffle.prizes.sort((a, b) => a.place - b.place).map(prize => {
                                        const winner = raffle.winners.find(w => w.prizeId === prize.id);
                                        const winnerPlayer = winner ? players.find(p => p.id === winner.playerId) : null;
                                        return (
                                            <div key={prize.id} className="flex justify-between items-center text-sm bg-zinc-900/50 p-2 rounded-md">
                                                <p className="font-semibold text-amber-300">{prize.place.toString()}. {prize.name}</p>
                                                <p className="text-gray-200">{winnerPlayer ? winnerPlayer.name : 'Not Drawn'}</p>
                                            </div>
                                        )
                                    }) : <p className="text-sm text-gray-500 text-center">No winners were drawn for this raffle.</p>}
                                </div>
                            </div>
                        )
                    }) : (
                        <p className="text-center text-gray-500 py-4">No raffles have been completed yet.</p>
                    )}
                </div>
            </DashboardCard>
        </div>
    );
}

export const PlayerDashboard: React.FC<PlayerDashboardProps> = ({ player, players, sponsors, onPlayerUpdate, events, onEventSignUp, legendaryBadges, raffles, ranks, locations }) => {
    const [activeTab, setActiveTab] = useState<Tab>('Overview');
    const auth = useContext(AuthContext);
    const dataContext = useContext(DataContext);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab') as Tab | null;
        const validTabs: Tab[] = ['Overview', 'Events', 'Chats', 'Raffles', 'Stats', 'Achievements', 'Leaderboard', 'Settings'];
        if (tab && validTabs.includes(tab)) {
            setActiveTab(tab);
        }
    }, []);

    useEffect(() => {
        if(auth) {
            auth.setHelpTopic(`player-dashboard-${activeTab.toLowerCase()}`);
        }
    }, [activeTab, auth]);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <Suspense fallback={<Loader />}>
                {activeTab === 'Overview' && <OverviewTab player={player} events={events} sponsors={sponsors} ranks={ranks} />}
                {activeTab === 'Events' && <EventsTab player={player} events={events} onEventSignUp={onEventSignUp} locations={locations} />}
                {activeTab === 'Chats' && <PlayerChatsTab />}
                {activeTab === 'Raffles' && <RafflesTab player={player} raffles={raffles} players={players} />}
                {activeTab === 'Stats' && <StatsTab player={player} events={events} />}
                {activeTab === 'Achievements' && <AchievementsTab player={player} ranks={ranks} />}
                {activeTab === 'Leaderboard' && <LeaderboardTab player={player} players={players} />}
                {activeTab === 'Settings' && <SettingsTab player={player} onPlayerUpdate={onPlayerUpdate} />}
            </Suspense>
        </div>
    );
};