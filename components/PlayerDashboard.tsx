import React, { useState, useEffect, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// FIX: Changed RankTier and SubRank to Rank and Tier respectively.
import type { Player, Sponsor, GameEvent, PlayerStats, MatchRecord, InventoryItem, Badge, LegendaryBadge, Raffle, Location, Signup, Rank, Tier, PlayerRole } from '../types';
import { DashboardCard } from './DashboardCard';
import { EventCard } from './EventCard';
import { UserIcon, ClipboardListIcon, CalendarIcon, ShieldCheckIcon, ChartBarIcon, TrophyIcon, SparklesIcon, HomeIcon, ChartPieIcon, CrosshairsIcon, CogIcon, UsersIcon, CurrencyDollarIcon, XIcon, CheckCircleIcon, UserCircleIcon, Bars3Icon, TicketIcon, CrownIcon, GlobeAltIcon, AtSymbolIcon, PhoneIcon, MapPinIcon } from './icons/Icons';
import { BadgePill } from './BadgePill';
// FIX: Changed UNRANKED_SUB_RANK to UNRANKED_TIER.
import { UNRANKED_TIER, MOCK_PLAYER_ROLES, MOCK_BADGES, MOCK_WEAPONS, MOCK_EQUIPMENT } from '../constants';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { InfoTooltip } from './InfoTooltip';
import { Leaderboard } from './Leaderboard';
import { AuthContext } from '../auth/AuthContext';
import { DataContext } from '../data/DataContext';
import { Loader } from './Loader';
import { UrlOrUploadField } from './UrlOrUploadField';

const getRankForPlayer = (player: Player, ranks: Rank[]): Tier => {
    if (!ranks || ranks.length === 0) return UNRANKED_TIER;
    // Rank is now always determined by XP. The gamesPlayed check is handled in the UI components.
    const allTiers = ranks.flatMap(rank => rank.tiers).sort((a, b) => b.minXp - a.minXp);
    const tier = allTiers.find(r => player.stats.xp >= r.minXp);
    // Find the lowest rank if no rank is found (for 0 xp)
    const lowestTier = [...allTiers].sort((a,b) => a.minXp - b.minXp)[0];
    return tier || lowestTier || UNRANKED_TIER;
};

const getRankProgression = (player: Player, ranks: Rank[]) => {
    const allTiers = ranks.flatMap(rank => rank.tiers).sort((a, b) => a.minXp - a.minXp);
    
    // The player's current rank based on XP
    const currentTier = getRankForPlayer(player, ranks);
    const currentTierIndex = allTiers.findIndex(r => r.id === currentTier.id);

    const previous = currentTierIndex > 0 ? allTiers[currentTierIndex - 1] : null;
    const next = currentTierIndex < allTiers.length - 1 ? allTiers[currentTierIndex + 1] : null;
    
    const rank = ranks.find(r => r.tiers.some(t => t.id === currentTier.id)) || null;

    return { previous, current: currentTier, next, rank };
}

const RankProgressionDisplay: React.FC<{ ranks: Rank[], player: Player }> = ({ ranks, player }) => {
    const [query, setQuery] = useState("");

    if (!ranks || ranks.length === 0) {
        return (
            <DashboardCard title="Rank Progression & Rewards" icon={<ShieldCheckIcon className="w-6 h-6"/>}>
                <div className="p-6 text-center text-gray-500">
                    <p>Rank progression data is currently unavailable.</p>
                </div>
            </DashboardCard>
        );
    }
    
    const { current: playerTier } = getRankProgression(player, ranks);

    const filteredRanks = ranks.map(rank => ({
        ...rank,
        tiers: rank.tiers.filter(tier => tier.name.toLowerCase().includes(query.toLowerCase()))
    })).filter(rank => rank.tiers.length > 0);
    
    const getRangeForTier = (tier: Tier, rank: Rank, rankIndex: number) => {
        const sortedTiersInRank = [...rank.tiers].sort((a,b) => a.minXp - b.minXp);
        const tierIndex = sortedTiersInRank.findIndex(r => r.id === tier.id);
        const nextTierInRank = sortedTiersInRank[tierIndex + 1];

        if (nextTierInRank) {
            return `${tier.minXp.toLocaleString()} - ${(nextTierInRank.minXp - 1).toLocaleString()} RP`;
        }
        
        const nextRank = ranks[rankIndex + 1];
        if(nextRank && nextRank.tiers.length > 0) {
            const nextRankFirstTier = [...nextRank.tiers].sort((a,b) => a.minXp - b.minXp)[0];
            return `${tier.minXp.toLocaleString()} - ${(nextRankFirstTier.minXp - 1).toLocaleString()} RP`;
        }
        return `${tier.minXp.toLocaleString()}+ RP`;
    }

    return (
        <DashboardCard title="Rank Progression & Rewards" icon={<ShieldCheckIcon className="w-6 h-6"/>}>
            <div className="p-6">
                 <div className="mb-4">
                    <Input
                        type="search"
                        placeholder="Filter ranks (e.g. 'Pro V', 'Master')"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="space-y-12 max-h-[70vh] overflow-y-auto pr-2">
                    {filteredRanks.map((rank, rankIndex) => (
                        <section key={rank.id} className="tier-section">
                            <div className="tier-header">
                                <img src={rank.rankBadgeUrl} alt={rank.name} className="w-16 h-16 flex-shrink-0"/>
                                <div>
                                    <h2 className="text-3xl font-bold text-red-400 uppercase tracking-wider">{rank.name}</h2>
                                    <p className="mt-1 text-sm text-gray-400">{rank.description}</p>
                                </div>
                            </div>

                            <div className="subrank-grid">
                                {rank.tiers.sort((a,b) => a.minXp - b.minXp).map((sub) => {
                                    const isCurrent = playerTier.id === sub.id;
                                    const isUnlocked = player.stats.xp >= sub.minXp;
                                    const cardClass = isCurrent ? 'subrank-card--current' : !isUnlocked ? 'subrank-card--locked' : '';
                                    return (
                                        <article key={sub.id} className={`subrank-card ${cardClass}`}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <img src={sub.iconUrl} alt={sub.name} className="w-10 h-10"/>
                                                <div>
                                                    <h3 className={`font-semibold ${isCurrent ? 'text-amber-300' : 'text-white'}`}>{sub.name}</h3>
                                                    <p className="text-xs text-gray-400 font-mono">{getRangeForTier(sub, rank, rankIndex)}</p>
                                                </div>
                                            </div>
                                            <ul className="list-none text-xs text-gray-300 space-y-1">
                                                {sub.perks.map((p, i) => (
                                                    <li key={i} className="flex items-start gap-1.5">
                                                        <CheckCircleIcon className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                                                        <span>{p}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </article>
                                    )
                                })}
                            </div>
                        </section>
                    ))}
                    {filteredRanks.length === 0 && (
                        <div className="text-center text-gray-500 py-8">No ranks matched your search.</div>
                    )}
                </div>
            </div>
        </DashboardCard>
    );
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
    signups: Signup[];
}

type Tab = 'Overview' | 'Events' | 'Raffles' | 'Ranks' | 'Stats' | 'Achievements' | 'Leaderboard' | 'Loadout' | 'Settings';

const ProgressBar: React.FC<{ value: number; max: number; isThin?: boolean }> = ({ value, max, isThin=false }) => {
    const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className={`w-full bg-zinc-700 rounded-full ${isThin ? 'h-1.5' : 'h-2.5'}`}>
            <div className="bg-red-500 h-full rounded-full" style={{ width: `${percentage}%` }}></div>
        </div>
    );
};

const StatDisplay: React.FC<{ value: string | number, label: string, tooltip?: string }> = ({ value, label, tooltip }) => (
    <div className="text-center">
        <p className="text-3xl font-bold text-white">{value}</p>
        <div className="flex items-center justify-center gap-1">
            <p className="text-sm text-gray-400">{label}</p>
            {tooltip && <InfoTooltip text={tooltip} />}
        </div>
    </div>
);

const EventDetailsModal: React.FC<{ event: GameEvent, player: Player, onClose: () => void, onSignUp: (id: string, requestedGearIds: string[], note: string) => void, locations: Location[], signups: Signup[] }> = ({ event, player, onClose, onSignUp, locations, signups }) => {
    const isSignedUp = useMemo(() => signups.some(s => s.eventId === event.id && s.playerId === player.id), [signups, event.id, player.id]);
    const [selectedGear, setSelectedGear] = useState<string[]>([]);
    const [note, setNote] = useState('');
    const dataContext = useContext(DataContext);

    const availableGear = useMemo(() => {
        if (!dataContext) return [];
        return event.gearForRent.map(itemId => {
            const item = dataContext.inventory.find(i => i.id === itemId);
            if (!item) return null;
            const price = event.rentalPriceOverrides?.[itemId] ?? item.salePrice;
            return { ...item, salePrice: price }; // Return item with a potentially overridden price
        }).filter((item): item is InventoryItem => item !== null);
    }, [dataContext, event]);


    const alreadyRentedCount = useMemo(() => {
        const counts: Record<string, number> = {};
        // Count from confirmed attendees
        event.attendees.forEach(a => {
            (a.rentedGearIds || []).forEach(id => {
                counts[id] = (counts[id] || 0) + 1;
            });
        });
        // Count from players signed up but not yet confirmed
        const eventSignups = signups.filter(s => s.eventId === event.id);
        eventSignups.forEach(s => {
            // Exclude the current player from this count if they are already signed up, to allow them to "re-signup" without their own rentals blocking them.
            if (s.playerId !== player.id || !isSignedUp) {
                 (s.requestedGearIds || []).forEach(id => {
                    counts[id] = (counts[id] || 0) + 1;
                });
            }
        });
        return counts;
    }, [event.attendees, event.id, player.id, isSignedUp, signups]);

    const totalCost = useMemo(() => {
        const gearCost = selectedGear.reduce((sum, gearId) => {
            const item = availableGear.find(g => g.id === gearId);
            return sum + (item?.salePrice || 0);
        }, 0);
        return event.gameFee + gearCost;
    }, [selectedGear, availableGear, event.gameFee]);
    
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
                                {availableGear.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-200 mb-2">Rent Gear</h4>
                                        <div className="space-y-2">
                                            {availableGear.map(item => {
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
                        
                            <div className="flex justify-between items-center text-gray-300">
                                <span>Rental Gear:</span>
                                <span className="font-semibold">R{(totalCost - event.gameFee).toFixed(2)}</span>
                            </div>
                        
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
        {name: 'Raffles', icon: <TicketIcon className="w-5 h-5"/>},
        {name: 'Ranks', icon: <ShieldCheckIcon className="w-5 h-5"/>},
        {name: 'Stats', icon: <ChartBarIcon className="w-5 h-5"/>},
        {name: 'Achievements', icon: <TrophyIcon className="w-5 h-5"/>},
        {name: 'Leaderboard', icon: <TrophyIcon className="w-5 h-5"/>},
        {name: 'Loadout', icon: <CrosshairsIcon className="w-5 h-5"/>},
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
            const allRanks = ranks.map(t => t.name);
            const targetRankName = criteria.value as string;

            // Find player's current tier name
            const playerRank = ranks.find(rank => rank.tiers.some(sub => sub.id === player.rank.id));
            const playerRankName = playerRank?.name;

            // Find the index of the player's tier and target tier
            const playerRankIndex = playerRankName ? allRanks.indexOf(playerRankName) : -1;
            const targetRankIndex = allRanks.indexOf(targetRankName);
            
            if (targetRankIndex > -1) {
                current = playerRankIndex > -1 ? playerRankIndex : 0;
                max = targetRankIndex;
                if (current >= max) {
                     return { current: max, max, percentage: 100, isEarned: true, text: 'Unlocked' };
                }
                 return { current, max, percentage: (current / max) * 100, isEarned: false, text: `Reach ${targetRankName} Rank` };
            }
            return { current: 0, max: 1, percentage: 0, isEarned: false, text: `Reach ${targetRankName} Rank` };
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

const OverviewTab: React.FC<Pick<PlayerDashboardProps, 'player' | 'players' | 'events' | 'sponsors' | 'ranks'>> = ({ player, players, events, sponsors, ranks }) => {
    const [selectedSponsor, setSelectedSponsor] = useState<Sponsor | null>(null);
    const nextEvent = events.filter(e => e.status === 'Upcoming').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    const { current, next, rank } = getRankProgression(player, ranks);
    
    const startXp = current.minXp;
    const endXp = next ? next.minXp : 0;
    const progressPercentage = next ? (
        endXp > startXp ? Math.min(((player.stats.xp - startXp) / (endXp - startXp)) * 100, 100) : 0
      ) : 100;

    const percentile = players.length > 1
        ? (players.filter(p => p.stats.xp < player.stats.xp).length / (players.length - 1)) * 100
        : 100;
        
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {selectedSponsor && (
                <Modal isOpen={true} onClose={() => setSelectedSponsor(null)} title={selectedSponsor.name}>
                     <div className="text-center">
                        <img src={selectedSponsor.logoUrl} alt={selectedSponsor.name} className="h-24 mx-auto mb-4" />
                        <p className="text-gray-400">Contact them via:</p>
                        <p className="text-white font-semibold">{selectedSponsor.email || 'N/A'}</p>
                        <p className="text-white font-semibold">{selectedSponsor.phone || 'N/A'}</p>
                        {selectedSponsor.website && <a href={selectedSponsor.website} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:underline mt-2 inline-block">Visit Website</a>}
                    </div>
                </Modal>
            )}
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
                {/* Profile Card */}
                <DashboardCard title="Player Profile" icon={<UserIcon className="w-6 h-6"/>}>
                    <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
                        <img src={player.avatarUrl} alt={player.callsign} className="w-24 h-24 rounded-full object-cover border-2 border-red-500 flex-shrink-0" />
                        <div className="text-center sm:text-left">
                             <div className="flex items-center justify-center sm:justify-start gap-2">
                                <h2 className="text-2xl font-bold text-white">{player.name}</h2>
                                <BadgePill color={player.status === 'Active' ? 'green' : 'red'}>{player.status}</BadgePill>
                             </div>
                            <p className="text-lg text-red-400 font-semibold">"{player.callsign}"</p>
                            <p className="text-sm text-gray-400 mt-2">{player.bio || 'No bio available.'}</p>
                        </div>
                    </div>
                </DashboardCard>
                
                <DashboardCard title="Rank & Progression" icon={<ShieldCheckIcon className="w-6 h-6"/>}>
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                            {rank && <img src={rank.rankBadgeUrl} alt={rank.name} className="w-16 h-16"/>}
                            <div>
                                <p className="text-sm text-gray-400 uppercase tracking-wider">{rank?.name || 'Unranked'}</p>
                                <p className="text-2xl font-bold text-white">{current.name}</p>
                            </div>
                        </div>

                        <div className="space-y-1 mb-4">
                            <div className="flex justify-between items-baseline">
                                <p className="text-sm font-semibold text-gray-300">Progression</p>
                                <p className="text-sm font-mono text-amber-300">{player.stats.xp.toLocaleString()} / {next ? next.minXp.toLocaleString() : 'MAX'} RP</p>
                            </div>
                            <div className="w-full bg-zinc-900 rounded-full h-4 border border-zinc-800 shadow-inner">
                                <motion.div 
                                    className="bg-gradient-to-r from-red-600 to-red-800 h-full rounded-full"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${progressPercentage}%` }}
                                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                                />
                            </div>
                             <p className="text-right text-xs text-gray-400">
                                {next ? `${(next.minXp - player.stats.xp > 0 ? next.minXp - player.stats.xp : 0).toLocaleString()} RP to ${next.name}` : 'Maximum Rank Reached!'}
                            </p>
                        </div>

                        <div className="mt-6 pt-4 border-t border-zinc-700/50">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 mb-1">Percentile</h4>
                                    <p className="text-lg font-bold text-white">Top {(100 - percentile).toFixed(1)}%</p>
                                    <p className="text-xs text-gray-500">of all operators</p>
                                </div>
                                {next && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-400 mb-1">Next Tier Unlocks</h4>
                                        <ul className="text-xs text-gray-300 list-disc list-inside space-y-0.5">
                                            {next.perks.map((perk, i) => <li key={i}>{perk}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DashboardCard>

                {/* Sponsors */}
                <DashboardCard title="Sponsors" icon={<SparklesIcon className="w-6 h-6" />} fullHeight>
                    <div className="p-4">
                        <div className="overflow-hidden relative h-32">
                             <div className="flex animate-marquee">
                                {[...sponsors, ...sponsors].map((sponsor, i) => (
                                    <div key={`${sponsor.id}-${i}`} className="flex-shrink-0 w-64 h-32 flex items-center justify-center p-4" onClick={() => setSelectedSponsor(sponsor)}>
                                        <img src={sponsor.logoUrl} alt={sponsor.name} className="max-h-full max-w-full object-contain cursor-pointer" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </DashboardCard>
            </div>
            {/* Right Column */}
            <div className="lg:col-span-1 space-y-6">
                <DashboardCard title="Next Mission" icon={<CalendarIcon className="w-6 h-6"/>}>
                    <div className="p-2">
                         {nextEvent ? (
                            <EventCard event={nextEvent}/>
                         ) : (
                            <p className="text-center text-gray-500 p-8">No upcoming events scheduled.</p>
                         )}
                    </div>
                </DashboardCard>
                <DashboardCard title="Lifetime Stats" icon={<ChartBarIcon className="w-6 h-6"/>}>
                     <div className="p-6 grid grid-cols-2 gap-y-4">
                        <div className="text-center">
                            <p className="text-2xl font-bold">{player.stats.kills}</p>
                            <p className="text-xs text-gray-400">Kills</p>
                        </div>
                         <div className="text-center">
                            <p className="text-2xl font-bold">{player.stats.deaths}</p>
                            <p className="text-xs text-gray-400">Deaths</p>
                        </div>
                         <div className="text-center">
                            <p className="text-2xl font-bold">{player.stats.headshots}</p>
                            <p className="text-xs text-gray-400">Headshots</p>
                        </div>
                         <div className="text-center">
                            <p className="text-2xl font-bold">{player.stats.gamesPlayed}</p>
                            <p className="text-xs text-gray-400">Games</p>
                        </div>
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
};

const EventsTab: React.FC<Pick<PlayerDashboardProps, 'events' | 'player' | 'onEventSignUp' | 'locations' | 'signups'>> = ({ events, player, onEventSignUp, locations, signups }) => {
    const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
    const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);

    const upcomingEvents = events
        .filter(e => e.status === 'Upcoming' || e.status === 'In Progress')
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const pastEvents = events
        .filter(e => e.status === 'Completed' || e.status === 'Cancelled')
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const eventsToShow = filter === 'upcoming' ? upcomingEvents : pastEvents;
    
    return (
        <DashboardCard title="Event Schedule" icon={<CalendarIcon className="w-6 h-6"/>}>
            {selectedEvent && <EventDetailsModal event={selectedEvent} player={player} onClose={() => setSelectedEvent(null)} onSignUp={onEventSignUp} locations={locations} signups={signups} />}
            <div className="p-4">
                 <div className="flex justify-start mb-4">
                    <div className="flex space-x-1 p-1 bg-zinc-900 rounded-lg border border-zinc-700">
                        <Button size="sm" variant={filter === 'upcoming' ? 'primary' : 'secondary'} onClick={() => setFilter('upcoming')}>Upcoming ({upcomingEvents.length})</Button>
                        <Button size="sm" variant={filter === 'past' ? 'primary' : 'secondary'} onClick={() => setFilter('past')}>Past ({pastEvents.length})</Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                    {eventsToShow.length > 0 ? eventsToShow.map(event => (
                        <div key={event.id} className="cursor-pointer" onClick={() => setSelectedEvent(event)}>
                            <EventCard event={event} />
                        </div>
                    )) : (
                         <p className="text-center text-gray-500 py-8 col-span-full">No {filter} events found.</p>
                    )}
                </div>
            </div>
        </DashboardCard>
    );
};

const RafflesTab: React.FC<Pick<PlayerDashboardProps, 'raffles' | 'player' | 'players'>> = ({ raffles, player, players }) => {
    const myTickets = raffles.flatMap(r => r.tickets.filter(t => t.playerId === player.id).map(t => ({...t, raffleName: r.name})));
    const pastRaffles = raffles.filter(r => r.status === 'Completed');
    const myWins = pastRaffles.flatMap(r => r.winners.filter(w => w.playerId === player.id).map(w => ({...w, raffleName: r.name, prize: r.prizes.find(p => p.id === w.prizeId)})));

    return (
        <div className="space-y-6">
            {myWins.length > 0 && (
// FIX: The RafflesTab component was truncated. It has been completed to correctly display raffle information.
                <DashboardCard title="Raffle Wins" icon={<TrophyIcon className="w-6 h-6 text-amber-400" />}>
                    <div className="p-4 space-y-2">
                        {myWins.map(win => (
                            <div key={win.id} className="bg-amber-900/50 p-3 rounded-lg border border-amber-700/50">
                                <p className="font-bold text-amber-300">You won: {win.prize?.name}</p>
                                <p className="text-sm text-amber-400">in the "{win.raffleName}" raffle!</p>
                            </div>
                        ))}
                    </div>
                </DashboardCard>
            )}
            <DashboardCard title="My Raffle Tickets" icon={<TicketIcon className="w-6 h-6" />}>
                <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                    {myTickets.length > 0 ? myTickets.map(ticket => (
                        <div key={ticket.id} className="bg-zinc-800/50 p-3 rounded-md flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-white">{ticket.raffleName}</p>
                                <p className="text-xs text-gray-400 font-mono">{ticket.code}</p>
                            </div>
                            <p className="text-xs text-gray-500">{new Date(ticket.purchaseDate).toLocaleDateString()}</p>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 py-4">You have no active raffle tickets.</p>
                    )}
                </div>
            </DashboardCard>
            <DashboardCard title="Past Raffle Results" icon={<TicketIcon className="w-6 h-6" />}>
                 <div className="p-4 space-y-4 max-h-80 overflow-y-auto">
                    {pastRaffles.length > 0 ? pastRaffles.map(raffle => (
                         <div key={raffle.id} className="bg-zinc-800/50 p-3 rounded-md">
                            <h4 className="font-bold text-white">{raffle.name}</h4>
                            <p className="text-xs text-gray-400 mb-2">Drawn on: {new Date(raffle.drawDate).toLocaleDateString()}</p>
                            <ul className="text-sm space-y-1">
                                {raffle.winners.map(winner => {
                                    const prize = raffle.prizes.find(p => p.id === winner.prizeId);
                                    const winnerPlayer = players.find(p => p.id === winner.playerId);
                                    return (
                                        <li key={winner.id} className="flex justify-between">
                                            <span className="text-gray-300">{prize?.place}. {prize?.name}</span>
                                            <span className="font-semibold text-amber-300">{winnerPlayer?.name}</span>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    )) : (
                        <p className="text-center text-gray-500 py-4">No past raffles.</p>
                    )}
                </div>
            </DashboardCard>
        </div>
    );
};

// FIX: Added missing StatsTab component
const StatsTab: React.FC<Pick<PlayerDashboardProps, 'player' | 'events'>> = ({ player, events }) => {
    const { stats, matchHistory } = player;
    const kdr = stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : stats.kills.toFixed(2);

    const bestMatch = useMemo(() => {
        if (!matchHistory || matchHistory.length === 0) return null;
        return [...matchHistory].sort((a, b) => b.playerStats.kills - a.playerStats.kills)[0];
    }, [matchHistory]);

    const bestEvent = bestMatch ? events.find(e => e.id === bestMatch.eventId) : null;

    return (
        <div className="space-y-6">
            <DashboardCard title="Lifetime Performance" icon={<ChartBarIcon className="w-6 h-6" />}>
                <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-y-6">
                    <StatDisplay value={kdr} label="K/D Ratio" tooltip="Kill/Death Ratio" />
                    <StatDisplay value={stats.kills.toLocaleString()} label="Total Kills" />
                    <StatDisplay value={stats.deaths.toLocaleString()} label="Total Deaths" />
                    <StatDisplay value={stats.headshots.toLocaleString()} label="Total Headshots" />
                    <StatDisplay value={stats.gamesPlayed.toLocaleString()} label="Matches Played" />
                    <StatDisplay value={stats.xp.toLocaleString()} label="Total RP" />
                </div>
            </DashboardCard>
            {bestMatch && bestEvent && (
                <DashboardCard title="Best Match Performance" icon={<SparklesIcon className="w-6 h-6" />}>
                    <div className="p-4">
                        <EventCard event={bestEvent} />
                        <div className="grid grid-cols-3 gap-2 text-center p-3 mt-2 bg-zinc-900/50 rounded-lg">
                            <StatDisplay value={bestMatch.playerStats.kills} label="Kills" />
                            <StatDisplay value={bestMatch.playerStats.deaths} label="Deaths" />
                            <StatDisplay value={bestMatch.playerStats.headshots} label="Headshots" />
                        </div>
                    </div>
                </DashboardCard>
            )}
            <DashboardCard title="Match History" icon={<CalendarIcon className="w-6 h-6" />}>
                <div className="p-4 space-y-4 max-h-[40rem] overflow-y-auto">
                    {matchHistory.length > 0 ? (
                        matchHistory
                            .map(record => ({ ...record, event: events.find(e => e.id === record.eventId) }))
                            .filter(record => record.event)
                            .sort((a, b) => new Date(b.event!.date).getTime() - new Date(a.event!.date).getTime())
                            .map(({ event, playerStats }, index) => (
                                <div key={index} className="bg-zinc-900/50 p-1 rounded-lg">
                                    <EventCard event={event!} />
                                    <div className="grid grid-cols-3 gap-2 text-center p-3">
                                        <StatDisplay value={playerStats.kills} label="Kills" />
                                        <StatDisplay value={playerStats.deaths} label="Deaths" />
                                        <StatDisplay value={playerStats.headshots} label="Headshots" />
                                    </div>
                                </div>
                            ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No match history.</p>
                    )}
                </div>
            </DashboardCard>
        </div>
    );
};

// FIX: Added missing AchievementsTab component
const AchievementsTab: React.FC<Pick<PlayerDashboardProps, 'player' | 'legendaryBadges' | 'ranks'>> = ({ player, legendaryBadges, ranks }) => {
    const dataContext = useContext(DataContext);
    const standardBadges = dataContext?.badges || MOCK_BADGES; // Fallback to mock if needed.

    return (
        <div className="space-y-6">
            <DashboardCard title="Badge Progress" icon={<TrophyIcon className="w-6 h-6" />}>
                 <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {standardBadges.map(badge => (
                        <BadgeProgressCard key={badge.id} badge={badge} player={player} ranks={ranks} />
                    ))}
                </div>
            </DashboardCard>
             <DashboardCard title="Legendary Commendations" icon={<TrophyIcon className="w-6 h-6 text-amber-400" />}>
                 <div className="p-4">
                    {player.legendaryBadges.length > 0 ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {player.legendaryBadges.map(badge => (
                                <div key={badge.id} className="bg-zinc-800/50 p-4 rounded-lg text-center border border-amber-700/50">
                                    <img src={badge.iconUrl} alt={badge.name} className="w-16 h-16 mx-auto mb-2"/>
                                    <p className="font-bold text-amber-300">{badge.name}</p>
                                    <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">No legendary commendations earned yet.</p>
                    )}
                 </div>
            </DashboardCard>
        </div>
    )
};

// FIX: Added missing LoadoutTab component
const LoadoutTab: React.FC<Pick<PlayerDashboardProps, 'player' | 'onPlayerUpdate'>> = ({ player, onPlayerUpdate }) => {
    const [loadout, setLoadout] = useState(player.loadout);

    const handleSave = () => {
        onPlayerUpdate({ ...player, loadout });
        alert("Loadout saved!");
    };

    return (
        <DashboardCard title="Loadout Customization" icon={<CrosshairsIcon className="w-6 h-6" />}>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Primary Weapon</label>
                        <select value={loadout.primaryWeapon} onChange={e => setLoadout(l => ({...l, primaryWeapon: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                            {MOCK_WEAPONS.primary.map((w: string) => <option key={w}>{w}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Secondary Weapon</label>
                        <select value={loadout.secondaryWeapon} onChange={e => setLoadout(l => ({...l, secondaryWeapon: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                            {MOCK_WEAPONS.secondary.map((w: string) => <option key={w}>{w}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Lethal Equipment</label>
                        <select value={loadout.lethal} onChange={e => setLoadout(l => ({...l, lethal: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                            {MOCK_EQUIPMENT.lethal.map((e: string) => <option key={e}>{e}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Tactical Equipment</label>
                        <select value={loadout.tactical} onChange={e => setLoadout(l => ({...l, tactical: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                            {MOCK_EQUIPMENT.tactical.map((e: string) => <option key={e}>{e}</option>)}
                        </select>
                    </div>
                </div>
                <div className="pt-4">
                    <Button onClick={handleSave} className="w-full">Save Loadout</Button>
                </div>
            </div>
        </DashboardCard>
    );
};

// FIX: Added missing SettingsTab component
const SettingsTab: React.FC<Pick<PlayerDashboardProps, 'player' | 'onPlayerUpdate'>> = ({ player, onPlayerUpdate }) => {
    const [formData, setFormData] = useState({ ...player });
    const dataContext = useContext(DataContext);
    const companyDetails = dataContext?.companyDetails;

    const handleSave = () => {
        onPlayerUpdate(formData);
        alert("Profile updated!");
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

    return (
        <DashboardCard title="Profile Settings" icon={<CogIcon className="w-6 h-6" />}>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <UrlOrUploadField
                            label="Avatar"
                            fileUrl={formData.avatarUrl}
                            onUrlSet={handleAvatarUpdate}
                            onRemove={handleRemoveAvatar}
                            accept="image/*"
                            apiServerUrl={companyDetails?.apiServerUrl}
                        />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="First Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                            <Input label="Surname" value={formData.surname} onChange={e => setFormData(f => ({ ...f, surname: e.target.value }))} />
                        </div>
                        <Input label="Callsign" value={formData.callsign} onChange={e => setFormData(f => ({ ...f, callsign: e.target.value }))} />
                    </div>
                </div>
                
                <div className="pt-4 border-t border-zinc-700/50">
                     <textarea placeholder="Bio" value={formData.bio} onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))} rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-700/50">
                    <Input label="Email" value={formData.email} onChange={e => setFormData(f => ({...f, email: e.target.value}))}/>
                    <Input label="Phone" type="tel" value={formData.phone} onChange={e => setFormData(f => ({...f, phone: e.target.value}))}/>
                    <Input label="Address" value={formData.address} onChange={e => setFormData(f => ({...f, address: e.target.value}))}/>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Preferred Role</label>
                        <select value={formData.preferredRole} onChange={e => setFormData(p => ({...p, preferredRole: e.target.value as PlayerRole}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                            {MOCK_PLAYER_ROLES.map(role => <option key={role}>{role}</option>)}
                        </select>
                    </div>
                    <Input label="Allergies" value={formData.allergies} onChange={e => setFormData(f => ({...f, allergies: e.target.value}))}/>
                    <Input label="Medical Notes" value={formData.medicalNotes} onChange={e => setFormData(f => ({...f, medicalNotes: e.target.value}))}/>
                </div>
                
                <div className="pt-4">
                    <Button onClick={handleSave} className="w-full">Save Changes</Button>
                </div>
            </div>
        </DashboardCard>
    );
};

// FIX: Added the main PlayerDashboard component which was missing, causing the export error.
export const PlayerDashboard: React.FC<PlayerDashboardProps> = (props) => {
    const [activeTab, setActiveTab] = useState<Tab>('Overview');
    const auth = useContext(AuthContext);

    useEffect(() => {
        if (auth) {
            const topic = `player-dashboard-${activeTab.toLowerCase().replace(/\s/g, '-')}`;
            auth.setHelpTopic(topic);
        }
    }, [activeTab, auth]);

    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-sm border-b border-zinc-800 flex-shrink-0">
                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                    <img src={props.player.avatarUrl} alt={props.player.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-red-600 flex-shrink-0" />
                    <div className="overflow-hidden">
                        <h1 className="text-base sm:text-xl font-bold text-white truncate">{props.player.name}</h1>
                        <p className="text-xs sm:text-sm text-red-400">"{props.player.callsign}"</p>
                    </div>
                </div>
                <Button onClick={() => auth?.logout()} variant="secondary" size="sm" className="flex-shrink-0">Logout</Button>
            </header>
            <main className="flex-grow overflow-y-auto">
                <div className="p-4 sm:p-6 lg:p-8">
                    <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                    {activeTab === 'Overview' && <OverviewTab player={props.player} players={props.players} events={props.events} sponsors={props.sponsors} ranks={props.ranks} />}
                    {activeTab === 'Events' && <EventsTab events={props.events} player={props.player} onEventSignUp={props.onEventSignUp} locations={props.locations} signups={props.signups} />}
                    {activeTab === 'Raffles' && <RafflesTab raffles={props.raffles} player={props.player} players={props.players} />}
                    {activeTab === 'Ranks' && <RankProgressionDisplay ranks={props.ranks} player={props.player} />}
                    {activeTab === 'Stats' && <StatsTab player={props.player} events={props.events} />}
                    {activeTab === 'Achievements' && <AchievementsTab player={props.player} legendaryBadges={props.legendaryBadges} ranks={props.ranks} />}
                    {activeTab === 'Leaderboard' && <DashboardCard title="Leaderboard" icon={<TrophyIcon className="w-6 h-6"/>} fullHeight><Leaderboard players={props.players} currentPlayerId={props.player.id}/></DashboardCard>}
                    {activeTab === 'Loadout' && <LoadoutTab player={props.player} onPlayerUpdate={props.onPlayerUpdate} />}
                    {activeTab === 'Settings' && <SettingsTab player={props.player} onPlayerUpdate={props.onPlayerUpdate} />}
                </div>
            </main>
        </div>
    );
};