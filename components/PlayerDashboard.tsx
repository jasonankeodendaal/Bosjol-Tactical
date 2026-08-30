import React, { useState, useEffect, useMemo, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// FIX: Changed RankTier and SubRank to Rank and Tier respectively.
import type { Player, Sponsor, GameEvent, PlayerStats, MatchRecord, InventoryItem, Badge, LegendaryBadge, Raffle, Location, Signup, Rank, Tier, PlayerRole } from '../types';
import { DashboardCard } from './DashboardCard';
import { EventCard } from './EventCard';
import { UserIcon, ClipboardListIcon, CalendarIcon, ShieldCheckIcon, ChartBarIcon, TrophyIcon, SparklesIcon, HomeIcon, ChartPieIcon, CrosshairsIcon, CogIcon, UsersIcon, CurrencyDollarIcon, XIcon, CheckCircleIcon, UserCircleIcon, Bars3Icon, ChevronDownIcon, TicketIcon, CrownIcon, GlobeAltIcon, AtSymbolIcon, PhoneIcon, MapPinIcon, InformationCircleIcon } from './icons/Icons';
import { BadgePill } from './BadgePill';
// FIX: Changed UNRANKED_SUB_RANK to UNRANKED_TIER.
import { UNRANKED_TIER, MOCK_PLAYER_ROLES, MOCK_BADGES } from '../constants';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { InfoTooltip } from './InfoTooltip';
import { Leaderboard } from './Leaderboard';
import { AuthContext } from '../auth/AuthContext';
import { DataContext } from '../data/DataContext';
import { Loader } from './Loader';
import { UrlOrUploadField } from './UrlOrUploadField';
import { PlayerRankShowcase } from './PlayerRankShowcase';
import { PlayerRulesView } from './PlayerRulesView';
import { getRankForPlayer, getRankProgression, FALLBACK_RECRUIT_TIER } from '../utils/rankUtils';
import { resolveRankIcon, getRankBadgeSvg } from '../utils/rankBadges';
import { calculatePlayerPerformance } from '../utils/playerPerformanceUtils';
import { QrCode, Camera, ShieldCheck, LayoutGrid, CalendarDays } from 'lucide-react';
import { EventQRScannerModal } from './EventQRScannerModal';
import { EventCalendarView } from './EventCalendarView';
import { EventCountdownNotification } from './EventCountdownNotification';

const SponsorModal: React.FC<{ sponsor: Sponsor, onClose: () => void, onImageClick: (url: string) => void, backgroundUrl?: string }> = ({ sponsor, onClose, onImageClick, backgroundUrl }) => {
    const defaultBg = "https://www.toptal.com/designers/subtlepatterns/uploads/dark-geometric.png";
    const bgUrl = backgroundUrl || defaultBg;
    
    // Determine WhatsApp link formatting
    const formatPhoneLink = (phone: string) => {
        if (!phone) return '#';
        if (phone.startsWith('http')) return phone;
        return `https://wa.me/${(phone || '').replace(/\D/g, '')}`;
    };
    
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 sm:bg-black/60 backdrop-blur-xl sm:backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 z-[100] overflow-y-auto"
            aria-modal="true" role="dialog"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-4xl w-full sm:w-auto min-w-[300px] flex-shrink-0 my-auto"
            >
                {/* Background with overlay - Visible on mobile & desktop */}
                {bgUrl && (
                    <div 
                        className="absolute inset-0 z-0 opacity-45 sm:opacity-55 rounded-3xl overflow-hidden pointer-events-none"
                        style={{
                            backgroundImage: `url('${bgUrl}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    />
                )}
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-zinc-950/90 via-zinc-900/90 to-black/95 rounded-3xl shadow-2xl overflow-hidden border border-white/10 pointer-events-none"></div>
                
                {/* Content */}
                <div className="relative z-10 p-2 sm:p-10 flex flex-col md:flex-row gap-8 sm:gap-12 items-stretch justify-center pb-12 sm:pb-10">
                    
                    <button onClick={onClose} className="fixed sm:absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-white transition-colors bg-white/10 sm:bg-black/20 hover:bg-white/20 sm:hover:bg-black/40 rounded-full p-2.5 sm:p-2 z-50 shadow-lg sm:shadow-none" aria-label="Close sponsor details">
                        <XIcon className="w-6 h-6 sm:w-5 sm:h-5" />
                    </button>

                    {/* Left Column: Logo & Info */}
                    <div className="flex flex-col items-center md:items-start max-w-sm w-full md:w-80 text-center md:text-left shrink-0 mx-auto mt-8 sm:mt-0">
                        <div className="sm:bg-white/5 p-4 sm:p-6 sm:rounded-3xl sm:backdrop-blur-md sm:border border-white/10 sm:shadow-xl mb-4 sm:mb-6 w-full flex justify-center items-center h-32 sm:h-40">
                            {sponsor.logoUrl ? (
                                <img src={sponsor.logoUrl} alt={sponsor.name} className="max-h-full max-w-full object-contain drop-shadow-2xl" />
                            ) : (
                                <SparklesIcon className="w-12 h-12 text-amber-500" />
                            )}
                        </div>
                        
                        <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400 tracking-tight mb-2 sm:mb-4">{sponsor.name}</h2>
                        
                        {sponsor.bio && <p className="text-gray-300 sm:text-gray-400 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8">{sponsor.bio}</p>}
                        
                        {/* Contact Links */}
                        <div className="flex flex-col gap-3 w-full mt-auto">
                            {sponsor.website && (
                                <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-3 px-5 py-3.5 sm:py-3 bg-red-600/15 sm:bg-red-600/10 hover:bg-red-600/25 sm:hover:bg-red-600/20 text-red-400 rounded-2xl sm:rounded-xl border border-red-500/30 sm:border-red-500/20 transition-all group shadow-[0_0_15px_rgba(229,9,20,0.1)] sm:shadow-none">
                                    <GlobeAltIcon className="w-5 h-5 group-hover:scale-110 transition-transform"/>
                                    <span className="font-semibold tracking-wide text-sm">Visit Website</span>
                                </a>
                            )}
                            {sponsor.email && (
                                <a href={`mailto:${sponsor.email}`} className="flex items-center justify-center md:justify-start gap-3 px-5 py-3.5 sm:py-3 bg-white/10 sm:bg-white/5 hover:bg-white/15 sm:hover:bg-white/10 text-gray-200 sm:text-gray-300 rounded-2xl sm:rounded-xl border border-white/10 sm:border-white/5 transition-all group">
                                    <AtSymbolIcon className="w-5 h-5 group-hover:scale-110 transition-transform"/>
                                    <span className="font-medium text-sm truncate">{sponsor.email}</span>
                                </a>
                            )}
                            {sponsor.phone && (
                                <a href={formatPhoneLink(sponsor.phone)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center md:justify-start gap-3 px-5 py-3.5 sm:py-3 bg-white/10 sm:bg-white/5 hover:bg-white/15 sm:hover:bg-white/10 text-gray-200 sm:text-gray-300 rounded-2xl sm:rounded-xl border border-white/10 sm:border-white/5 transition-all group">
                                    <PhoneIcon className="w-5 h-5 group-hover:scale-110 transition-transform text-green-400"/>
                                    <span className="font-medium text-sm">{sponsor.phone}</span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Gallery (Only if exists) */}
                    {sponsor.imageUrls && sponsor.imageUrls.length > 0 && (
                        <div className="flex-1 min-w-0 w-full flex flex-col pt-8 md:pt-0 border-t border-white/10 md:border-t-0 md:border-l md:pl-10 mt-4 sm:mt-0">
                            <h4 className="font-mono text-xs text-gray-400 sm:text-gray-500 uppercase tracking-[0.2em] mb-4 text-center md:text-left">Media Showcase</h4>
                            <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 pt-2 custom-scrollbar snap-x snap-mandatory">
                                {sponsor.imageUrls.map((url, index) => (
                                    <motion.div 
                                        key={index}
                                        whileHover={{ scale: 1.03, y: -5 }}
                                        className="relative flex-none w-32 h-32 sm:w-48 sm:h-32 rounded-xl overflow-hidden cursor-pointer shadow-lg group snap-center border border-white/5 sm:border-none"
                                        onClick={() => onImageClick(url)}
                                    >
                                        <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay"></div>
                                        <img 
                                            src={url} 
                                            alt={`${sponsor.name} gallery image ${index + 1}`} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

const FullscreenImageViewer: React.FC<{ imageUrl: string, onClose: () => void }> = ({ imageUrl, onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 sm:p-8 z-[200]"
            aria-modal="true"
            role="dialog"
        >
            <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                src={imageUrl}
                alt="Fullscreen sponsor image"
                className="max-w-full max-h-full w-auto h-auto object-contain rounded-xl shadow-[0_0_40px_rgba(0,0,0,0.8)]"
                onClick={(e) => e.stopPropagation()}
            />
            <button onClick={onClose} className="absolute top-4 right-4 sm:top-8 sm:right-8 text-gray-400 hover:text-white transition-colors bg-black/40 hover:bg-black/60 rounded-full p-2 z-[210]" aria-label="Close image viewer">
                <XIcon className="w-8 h-8 sm:w-6 sm:h-6"/>
            </button>
        </motion.div>
    );
};


const RankAndLeaderboardTab: React.FC<Pick<PlayerDashboardProps, 'player' | 'players' | 'ranks' | 'events'> & { onNavigateTab?: (tab: string) => void }> = ({ player, players, ranks, events, onNavigateTab }) => {
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const dataContext = useContext(DataContext);

    return (
        <div className="space-y-6">
            {/* Free-View COD Mobile Style Rank Showcase */}
            <PlayerRankShowcase 
                player={player} 
                players={players} 
                ranks={ranks} 
                events={events}
                companyDetails={dataContext?.companyDetails}
                onNavigateTab={onNavigateTab}
            />

            {/* Free-View Seamless Leaderboard Drawer/Section */}
            <div className="pt-6 border-t border-zinc-800/80">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <TrophyIcon className="w-5 h-5 text-amber-400" />
                        <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider text-white font-mono">
                            Global Ranked Standings
                        </h3>
                    </div>
                    <button
                        onClick={() => setShowLeaderboard(prev => !prev)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-amber-400 font-bold uppercase transition-colors flex items-center gap-1.5"
                    >
                        <span>{showLeaderboard ? 'Hide Leaderboard' : 'Expand Leaderboard'}</span>
                        <ChevronDownIcon className={`w-4 h-4 transform transition-transform ${showLeaderboard ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {showLeaderboard && (
                    <div className="p-2 sm:p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
                        <Leaderboard players={players} currentPlayerId={player.id} />
                    </div>
                )}
            </div>
        </div>
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
    onOpenInfoModal?: (ruleSetId?: string) => void;
}

type Tab = 'Overview' | 'Events' | 'Raffles' | 'Ranks' | 'Rules' | 'Stats' | 'Achievements' | 'Settings';

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
                                            {badge.iconUrl ? (
                                                <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10 mx-auto"/>
                                            ) : (
                                                <TrophyIcon className="w-10 h-10 mx-auto text-amber-400" />
                                            )}
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
        {name: 'Rules', icon: <InformationCircleIcon className="w-5 h-5"/>},
        {name: 'Stats', icon: <ChartBarIcon className="w-5 h-5"/>},
        {name: 'Achievements', icon: <TrophyIcon className="w-5 h-5"/>},
        {name: 'Settings', icon: <UserCircleIcon className="w-5 h-5"/>},
    ];
    const activeTabInfo = tabs.find(t => t.name === activeTab);

    return (
        <div className="mb-6">
            {/* Mobile View Dropdown Menu */}
            <div className="sm:hidden relative">
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all active:scale-[0.99]"
                >
                    <div className="flex items-center gap-2.5 truncate">
                        <div className="text-red-400">{activeTabInfo?.icon}</div>
                        <span className="truncate">{activeTabInfo?.name || activeTab}</span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {menuOpen && (
                        <>
                            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs" onClick={() => setMenuOpen(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                className="absolute top-full left-0 right-0 mt-2 z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-2 max-h-80 overflow-y-auto"
                            >
                                <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 mb-1">
                                    Navigation View
                                </div>
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.name}
                                        onClick={() => {
                                            setActiveTab(tab.name);
                                            setMenuOpen(false);
                                        }}
                                        className={`w-full text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${
                                            activeTab === tab.name
                                                ? 'bg-red-600/20 text-red-400 border-l-2 border-red-500 font-extrabold'
                                                : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 truncate">
                                            <span className={activeTab === tab.name ? 'text-red-400' : 'text-zinc-400'}>{tab.icon}</span>
                                            <span className="truncate">{tab.name}</span>
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Desktop View Header Tabs */}
            <nav className="hidden sm:flex flex-wrap gap-x-1.5 gap-y-1.5 mb-4 justify-start" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`${
                            activeTab === tab.name
                                ? 'bg-red-500/20 text-red-400 border-red-500/50'
                                : 'bg-zinc-900/50 text-gray-400 hover:text-gray-200 hover:bg-zinc-800 border-zinc-800'
                        } flex items-center gap-1.5 whitespace-nowrap py-1.5 px-2.5 border rounded-md font-medium text-xs transition-colors uppercase tracking-wider flex-shrink-0`}
                    >
                        <div className="scale-90 opacity-80">{tab.icon}</div>
                        <span>{tab.name}</span>
                    </button>
                ))}
            </nav>
        </div>
    );
}

const calculateBadgeProgress = (badge: Badge, player: Player, ranks: Rank[]) => {
    const isEarned = player.badges.some(b => b.id === badge.id);
    if (isEarned) return { current: 1, max: 1, percentage: 100, isEarned: true, text: 'Unlocked' };

    if (!player.rank) { // Safety check for corrupted player data
        return { current: 0, max: 1, percentage: 0, isEarned: false, text: 'Rank data missing' };
    }

    const { criteria } = badge;
    let current = 0;
    let max = 1;

    switch (criteria.type) {
        case 'kills':
            current = player.stats?.kills ?? 0;
            max = Number(criteria.value);
            break;
        case 'headshots':
            current = player.stats?.headshots ?? 0;
            max = Number(criteria.value);
            break;
        case 'gamesPlayed':
            current = player.stats?.gamesPlayed ?? 0;
            max = Number(criteria.value);
            break;
        case 'rank':
            const allRanks = ranks.map(t => t.name);
            const targetRankName = criteria.value as string;

            // Find player's current tier name
            const playerRank = ranks.find(rank => (rank.tiers || []).some(sub => sub.id === player.rank.id));
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
             {badge.iconUrl ? (
                 <img src={badge.iconUrl} alt={badge.name} className={`w-12 h-12 flex-shrink-0 ${!progress.isEarned ? 'grayscale' : ''}`} />
             ) : (
                 <TrophyIcon className={`w-12 h-12 flex-shrink-0 ${progress.isEarned ? 'text-amber-400' : 'text-zinc-600'}`} />
             )}
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
    const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
    const nextEvent = events.filter(e => e.status === 'Upcoming').sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    const { current, next, rank } = getRankProgression(player, ranks);
    const dataContext = useContext(DataContext);
    const sponsorsBackgroundUrl = dataContext?.companyDetails?.sponsorsBackgroundUrl;

    const row1Sponsors = useMemo(() => sponsors.filter((_, i) => i < sponsors.length / 2), [sponsors]);
    const row2Sponsors = useMemo(() => sponsors.filter((_, i) => i >= sponsors.length / 2), [sponsors]);
    
    const startXp = current.minXp;
    const endXp = next ? next.minXp : 0;
    const playerXP = player.stats?.xp ?? 0;
    const progressPercentage = next ? (
        endXp > startXp ? Math.min(((playerXP - startXp) / (endXp - startXp)) * 100, 100) : 0
      ) : 100;

    const percentile = players.length > 1 ? (players.filter(p => (p.stats?.xp ?? 0) < playerXP).length / (players.length - 1)) * 100 : 100;
        
    const sortedPlayers = useMemo(() => [...players].sort((a, b) => (b.stats?.xp ?? 0) - (a.stats?.xp ?? 0)), [players]);
    const topThree = sortedPlayers.slice(0, 3);
    
    // Live calculated player performance incorporating match combat, badges, honors, and XP adjustments
    const perf = useMemo(() => {
        return calculatePlayerPerformance(player, dataContext?.honors, dataContext?.badges, dataContext?.legendaryBadges);
    }, [player, dataContext?.honors, dataContext?.badges, dataContext?.legendaryBadges]);

    const kills = perf.kills;
    const deaths = perf.deaths;
    const kdr = perf.kdr;

    return (
        <div className="space-y-4 mobile-overview-grid">
            <AnimatePresence>
                {fullscreenImage && (
                    <FullscreenImageViewer imageUrl={fullscreenImage} onClose={() => setFullscreenImage(null)} />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {selectedSponsor && (
                    <SponsorModal 
                        sponsor={selectedSponsor} 
                        onClose={() => setSelectedSponsor(null)} 
                        onImageClick={setFullscreenImage}
                        backgroundUrl={sponsorsBackgroundUrl}
                    />
                )}
            </AnimatePresence>
            <div className="overview-card">
                <h3 className="overview-section-title">Current Rank & Progression</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-6">
                    <div className="flex items-center justify-center sm:justify-start gap-5 flex-1">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl group-hover:bg-red-500/30 transition-colors duration-500"></div>
                            <img 
                                src={resolveRankIcon(current.iconUrl, rank?.name, current.name, rank?.rankBadgeUrl)} 
                                alt={rank?.name || current.name} 
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(current.name || rank?.name || '');
                                }}
                                className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-[0_10px_15px_rgba(229,9,20,0.4)] relative z-10 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300"
                            />
                        </div>
                        
                        <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs font-mono text-red-500/80 tracking-widest uppercase mb-1">Rank</span>
                            <p className="text-xl sm:text-2xl text-white uppercase tracking-widest font-black leading-none drop-shadow-md">{rank?.name || 'Unranked'}</p>
                            
                            <div className="mt-2 sm:mt-3 flex flex-col">
                                <span className="text-[10px] sm:text-xs font-mono text-amber-500/80 tracking-widest uppercase mb-1">Sub-Tier</span>
                                <p className="text-lg sm:text-xl font-bold text-gray-300 leading-none uppercase tracking-wider">{(current?.name || '').replace(new RegExp(`^${rank?.name || ''}\\s*`, 'i'), '') || current?.name || ''}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="sm:ml-auto text-center sm:text-right bg-gradient-to-b from-zinc-900/80 to-zinc-950/80 p-4 rounded-xl border border-zinc-800/50 shadow-inner sm:w-auto w-full flex sm:flex-col justify-between sm:justify-center items-center">
                        <p className="text-xs sm:text-sm font-mono text-gray-400 uppercase tracking-widest">Percentile</p>
                        <p className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 mt-1 sm:mt-2">Top {(100 - percentile).toFixed(1)}%</p>
                    </div>
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs sm:text-sm">
                        <p className="font-semibold text-gray-300">Progression</p>
                        <p className="font-mono text-amber-300">{playerXP.toLocaleString()} / {next ? next.minXp.toLocaleString() : 'MAX'} RP</p>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-4 border border-zinc-800 shadow-inner">
                        <motion.div 
                            className="bg-gradient-to-r from-red-800 to-red-600 h-full rounded-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                        />
                    </div>
                     <p className="text-right text-xs text-gray-400">
                        {next ? `${(next.minXp - playerXP > 0 ? next.minXp - playerXP : 0).toLocaleString()} RP to ${next.name}` : 'Maximum Rank Reached!'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="overview-card stats-summary-card flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2 mb-3">
                            <h3 className="overview-section-title !mb-0 flex items-center gap-2">
                                <CrosshairsIcon className="w-4 h-4 text-red-500" /> Live Summary
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${
                                perf.combatRating >= 80 ? 'bg-amber-950/60 text-amber-300 border-amber-500/40' :
                                perf.combatRating >= 60 ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' :
                                'bg-zinc-800/80 text-zinc-300 border-zinc-700/50'
                            }`}>
                                Index: {perf.combatRating} ({perf.combatGrade})
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-between">
                                <span className="text-zinc-400">Total RP:</span>
                                <span className="font-bold text-amber-300 font-mono">
                                    {perf.totalLifetimeXp.toLocaleString()} RP
                                </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-between">
                                <span className="text-zinc-400">Badges Earned:</span>
                                <span className="font-bold text-white font-mono">{perf.totalBadgesEarned}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-between">
                                <span className="text-zinc-400">Matches:</span>
                                <span className="font-bold text-white font-mono">{perf.matchesPlayed}</span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-between">
                                <span className="text-zinc-400">Avg RP/Match:</span>
                                <span className="font-bold text-red-400 font-mono">+{perf.avgXpPerMatch} RP</span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/60 space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-zinc-400 flex items-center gap-1 font-mono uppercase tracking-wider">
                                <TrophyIcon className="w-3 h-3 text-amber-400" />
                                {perf.honorsCount} Official Honors • +{perf.badgeRewardsXp} Badge RP
                            </span>
                            <span className="font-mono text-emerald-400 font-bold">Grade: {perf.combatGrade}</span>
                        </div>
                    </div>
                </div>
                <div className="overview-card next-event-card">
                    <h3 className="overview-section-title">Next Up</h3>
                     {nextEvent ? (<div><h4 className="font-bold text-white truncate">{nextEvent.title}</h4><p className="text-xs text-gray-400">{new Date(nextEvent.date).toLocaleDateString()}</p></div>) : (<p className="text-center text-gray-500 text-xs">No upcoming events.</p>)}
                </div>
            </div>
            
            <div className="overview-card commendations-card">
                <div className="flex items-center justify-between mb-3 border-b border-zinc-800/60 pb-2">
                    <h3 className="overview-section-title !mb-0">Commendations & Badges</h3>
                    <span className="text-xs text-amber-400 font-mono font-bold">
                        +{perf.badgeRewardsXp.toLocaleString()} Bonus RP
                    </span>
                </div>
                {((player.badges || []).length === 0 && (player.legendaryBadges || []).length === 0) ? (
                    <p className="text-center text-gray-500 py-4">No commendations earned yet.</p>
                ) : (
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-4 commendations-grid">
                        {(player.legendaryBadges || []).map(badge => (
                            <div key={badge.id} className="relative group flex justify-center items-center aspect-square legendary-badge-item !border-0" title={`${badge.name}: ${badge.description} (+250 RP)`}>
                                {badge.iconUrl ? (
                                    <img src={badge.iconUrl} alt={badge.name} className="w-12 h-12 object-contain" />
                                ) : (
                                    <SparklesIcon className="w-10 h-10 text-amber-400" />
                                )}
                            </div>
                        ))}
                        {(player.badges || []).map(badge => (
                            <div key={badge.id} className="relative group flex justify-center items-center aspect-square" title={`${badge.name}: ${badge.description} (+75 RP)`}>
                                {badge.iconUrl ? (
                                    <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10 object-contain"/>
                                ) : (
                                    <TrophyIcon className="w-8 h-8 text-zinc-500" />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Player Official Honors */}
            <div className="overview-card bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/20 border-amber-500/30">
                <div className="flex items-center justify-between mb-3 border-b border-amber-500/20 pb-2">
                    <h3 className="overview-section-title !mb-0 text-amber-400 flex items-center gap-2">
                        <TrophyIcon className="w-5 h-5 text-amber-400" /> My Hall of Fame Honors ({dataContext?.honors?.filter(h => h.playerId === player.id).length || 0})
                    </h3>
                    <span className="text-[11px] text-amber-500/80 font-mono uppercase tracking-wider">+{perf.honorsXp} Honor RP</span>
                </div>
                {(() => {
                    const playerHonors = dataContext?.honors?.filter(h => h.playerId === player.id) || [];
                    if (playerHonors.length === 0) {
                        return (
                            <p className="text-center text-zinc-500 text-xs py-4">
                                No official honors awarded yet. Excel in tactical matches to earn Man of the Match, Month, or Year!
                            </p>
                        );
                    }
                    return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {playerHonors.map(honor => {
                                const isMotm = honor.type === 'man_of_the_match';
                                const isMotMth = honor.type === 'man_of_the_month';
                                const isMotYr = honor.type === 'man_of_the_year';

                                return (
                                    <div
                                        key={honor.id}
                                        className={`p-3 rounded-xl border flex flex-col justify-between ${
                                            isMotYr ? 'bg-amber-950/40 border-amber-400/80 shadow-lg shadow-amber-950/50' :
                                            isMotMth ? 'bg-purple-950/40 border-purple-500/60' :
                                            'bg-zinc-800/60 border-amber-500/40'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 text-amber-300">
                                                    {isMotYr ? '👑 Man of Year' : isMotMth ? '🏆 Man of Month' : '🌟 Man of Match'}
                                                </span>
                                                <span className="text-[10px] text-zinc-400 font-mono">{honor.date}</span>
                                            </div>
                                            <p className="font-bold text-white text-sm">{honor.title}</p>
                                            {honor.notes && <p className="text-xs text-zinc-300 italic mt-1 bg-black/30 p-1.5 rounded">"{honor.notes}"</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })()}
            </div>
            
            <div className="overview-card lifetime-stats-card space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                    <div>
                        <h3 className="overview-section-title !mb-0 flex items-center gap-2">
                            <ChartBarIcon className="w-5 h-5 text-red-500" /> Lifetime Performance
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Real-time dynamic career metrics based on matches, XP earned, badges rewarded, and official honors.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Live Synced
                        </span>
                    </div>
                </div>

                <div className="p-2 sm:p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 lifetime-stats-grid">
                    <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                            <span>Total RP (XP)</span>
                            <InfoTooltip text="Total lifetime Rank Points earned across combat matches, badge rewards, honors, and XP bonuses." />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
                            {perf.totalLifetimeXp.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-red-400 font-mono mt-1">+{perf.avgXpPerMatch} RP / match avg</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                            <span>Matches Deployed</span>
                            <span className="text-[10px] font-mono text-zinc-500">Events</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black font-mono text-white">
                            {perf.matchesPlayed.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-1">Career matches</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                            <span>Badges Earned</span>
                            <span className="text-[10px] font-mono text-amber-400">{perf.legendaryBadgesCount} Mythic</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black font-mono text-white">
                            {perf.totalBadgesEarned}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-1">{perf.standardBadgesCount} Combat Badges</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                            <span>Badge Rewards RP</span>
                            <InfoTooltip text="Bonus Rank Points awarded from unlocking combat ribbons and legendary commendations." />
                        </div>
                        <p className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                            +{perf.badgeRewardsXp.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1">Earned badge bonuses</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                            <span>Official Honors</span>
                            <span className="text-[10px] font-mono text-purple-400">Hall of Fame</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black font-mono text-white">
                            {perf.honorsCount}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-1">{perf.motmCount} MotM • {perf.motmthCount} MotMth</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col justify-between">
                        <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                            <span>Combat Rating</span>
                            <span className="text-[10px] font-mono text-emerald-400">Grade {perf.combatGrade}</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                            {perf.combatRating}<span className="text-xs text-zinc-500 font-normal">/100</span>
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono mt-1">Overall Tactical Index</p>
                    </div>
                </div>
            </div>

             <div className="overview-card p-0 leaderboard-card">
                 <div className="p-4 sm:p-6"><h3 className="overview-section-title mb-0">Leaderboard - Top 3</h3></div>
                 <div className="leaderboard-podium-bg !p-0">
                    <motion.div className="podium-container !h-auto !max-w-full" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
                        {topThree.length > 1 && <PodiumPlayer player={topThree[1]} rank={2} delay={0.1} />}
                        {topThree.length > 0 && <PodiumPlayer player={topThree[0]} rank={1} delay={0} />}
                        {topThree.length > 2 && <PodiumPlayer player={topThree[2]} rank={3} delay={0.2} />}
                    </motion.div>
                </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-red-700/60 shadow-2xl bg-zinc-950/90 p-4 sm:p-5 group">
                {/* Uploaded Sponsors Background Backdrop */}
                {sponsorsBackgroundUrl && (
                    <>
                        <div 
                            className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none opacity-40 sm:opacity-50 transition-opacity"
                            style={{ backgroundImage: `url('${sponsorsBackgroundUrl}')` }}
                        />
                        <div className="absolute inset-0 z-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/85 pointer-events-none" />
                    </>
                )}

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2 border-b border-red-700/40 pb-2">
                        <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <SparklesIcon className="w-4 h-4 text-red-500" />
                            Official Sponsors & Brand Partners
                        </h3>
                        {sponsors.length > 0 && (
                            <span className="text-[10px] font-mono text-zinc-400">
                                {sponsors.length} Active {sponsors.length === 1 ? 'Partner' : 'Partners'}
                            </span>
                        )}
                    </div>
                    <div className="sponsor-carousel-container">
                        <div className="marquee-row animate-marquee">
                            {row1Sponsors.concat(row1Sponsors).map((sponsor, index) => (
                                <div key={`${sponsor.id}-${index}-1`} onClick={() => setSelectedSponsor(sponsor)} className="sponsor-item">
                                    {sponsor.logoUrl ? (
                                        <img src={sponsor.logoUrl} alt={sponsor.name} />
                                    ) : (
                                        <span className="text-xs font-bold text-amber-400 p-2">{sponsor.name}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        {row2Sponsors.length > 0 && (
                            <div className="marquee-row animate-marquee-reverse mt-4">
                                {row2Sponsors.concat(row2Sponsors).map((sponsor, index) => (
                                    <div key={`${sponsor.id}-${index}-2`} onClick={() => setSelectedSponsor(sponsor)} className="sponsor-item">
                                        {sponsor.logoUrl ? (
                                            <img src={sponsor.logoUrl} alt={sponsor.name} />
                                        ) : (
                                            <span className="text-xs font-bold text-amber-400 p-2">{sponsor.name}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const PodiumPlayer: React.FC<{ player: Player, rank: 1 | 2 | 3, delay: number }> = ({ player, rank, delay }) => {
    const podiumClass = `podium-${rank}`;
    const animationVariants = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay } } };
    return (
        <motion.div className={`podium-item ${podiumClass}`} variants={animationVariants}>
            <div className="podium-avatar-wrapper">
                <img 
                    src={player.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.callsign || player.name || 'OP')}&background=18181b&color=ef4444&bold=true`} 
                    alt={player.name} 
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.callsign || player.name || 'OP')}&background=18181b&color=ef4444&bold=true`;
                    }}
                    className="podium-avatar" 
                />
                <p className={`font-bold text-base mt-2 truncate max-w-full px-1 ${rank === 1 ? 'text-amber-300' : 'text-white'}`}>{player.callsign}</p>
                <p className="text-xs text-zinc-300">{(player.stats?.xp ?? 0).toLocaleString()} RP</p>
            </div><div className="podium-base">{rank}</div>
        </motion.div>
    );
};


const EventsTab: React.FC<Pick<PlayerDashboardProps, 'events' | 'player' | 'onEventSignUp' | 'locations' | 'signups'> & { onOpenQRScanner?: () => void }> = ({ events, player, onEventSignUp, locations, signups, onOpenQRScanner }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
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
            <div className="p-2 sm:p-4 space-y-3">
                 <div className="flex flex-wrap items-center justify-between mb-3 sm:mb-4 gap-2">
                    {/* Filter & View Mode Switcher */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Upcoming / Past Filter */}
                        <div className="flex space-x-1 p-0.5 sm:p-1 bg-zinc-900 rounded-lg border border-zinc-700">
                            <Button size="sm" className="!px-2 !py-1 !text-[10px] sm:!text-xs" variant={filter === 'upcoming' ? 'primary' : 'secondary'} onClick={() => setFilter('upcoming')}>Upcoming ({upcomingEvents.length})</Button>
                            <Button size="sm" className="!px-2 !py-1 !text-[10px] sm:!text-xs" variant={filter === 'past' ? 'primary' : 'secondary'} onClick={() => setFilter('past')}>Past ({pastEvents.length})</Button>
                        </div>

                        {/* Grid / Monthly Calendar Toggle */}
                        <div className="flex space-x-1 p-0.5 sm:p-1 bg-zinc-950 rounded-lg border border-zinc-800">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition-all ${
                                    viewMode === 'grid'
                                        ? 'bg-red-600 text-white shadow-sm'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                }`}
                                title="Grid Layout"
                            >
                                <LayoutGrid className="w-3.5 h-3.5" />
                                <span className="hidden xs:inline">Grid List</span>
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition-all ${
                                    viewMode === 'calendar'
                                        ? 'bg-red-600 text-white shadow-sm'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                }`}
                                title="Monthly Calendar Layout"
                            >
                                <CalendarDays className="w-3.5 h-3.5" />
                                <span className="hidden xs:inline">Monthly Calendar</span>
                            </button>
                        </div>
                    </div>

                    {onOpenQRScanner && (
                        <button
                            onClick={onOpenQRScanner}
                            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-[10px] sm:text-xs shadow-[0_0_12px_rgba(220,38,38,0.3)] transition flex items-center gap-1.5"
                        >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>QR Check-In Scanner</span>
                        </button>
                    )}
                </div>

                {/* View Content */}
                {viewMode === 'calendar' ? (
                    <EventCalendarView
                        events={events}
                        onSelectEvent={(ev) => setSelectedEvent(ev)}
                        activeFilter={filter}
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5 sm:gap-4 max-h-[65vh] overflow-y-auto pr-1 sm:pr-2">
                        {eventsToShow.length > 0 ? eventsToShow.map(event => (
                            <div key={event.id} className="cursor-pointer h-full" onClick={() => setSelectedEvent(event)}>
                                <EventCard 
                                    event={event} 
                                    signupsCount={signups ? signups.filter(s => s.eventId === event.id).length : undefined} 
                                />
                            </div>
                        )) : (
                             <p className="text-center text-gray-500 py-8 col-span-full text-xs sm:text-base">No {filter} events found.</p>
                        )}
                    </div>
                )}
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
    const dataContext = useContext(DataContext);
    const perf = useMemo(() => {
        return calculatePlayerPerformance(player, dataContext?.honors, dataContext?.badges, dataContext?.legendaryBadges);
    }, [player, dataContext?.honors, dataContext?.badges, dataContext?.legendaryBadges]);

    const { matchHistory } = player;

    return (
        <div className="space-y-6">
            <DashboardCard title="Lifetime Performance" icon={<ChartBarIcon className="w-6 h-6" />}>
                <div className="p-4 sm:p-6 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-center">
                            <p className="text-xs text-zinc-400">Total Rank Points</p>
                            <p className="text-2xl sm:text-3xl font-black font-mono text-amber-300 mt-1">
                                {perf.totalLifetimeXp.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-red-400 font-mono mt-0.5">+{perf.avgXpPerMatch} RP/match</p>
                        </div>
                        <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-center">
                            <p className="text-xs text-zinc-400">Matches Deployed</p>
                            <p className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
                                {perf.matchesPlayed.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Career events</p>
                        </div>
                        <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-center">
                            <p className="text-xs text-zinc-400">Badges Rewarded RP</p>
                            <p className="text-2xl sm:text-3xl font-black font-mono text-amber-400 mt-1">
                                +{perf.badgeRewardsXp.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{perf.totalBadgesEarned} Badges Unlocked</p>
                        </div>
                        <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80 text-center">
                            <p className="text-xs text-zinc-400">Official Honors</p>
                            <p className="text-2xl sm:text-3xl font-black font-mono text-purple-300 mt-1">
                                {perf.honorsCount}
                            </p>
                            <p className="text-[10px] text-zinc-400 font-mono mt-0.5">+{perf.honorsXp} Honor RP</p>
                        </div>
                    </div>

                    <div className="p-4 bg-zinc-900/40 rounded-xl border border-zinc-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-zinc-400">Tactical Grade:</span>
                            <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/40 font-mono">
                                {perf.combatGrade} ({perf.combatRating}/100)
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400 font-mono">
                            <span>Badges: <strong className="text-white">{perf.totalBadgesEarned}</strong></span>
                            <span>•</span>
                            <span>Honors: <strong className="text-purple-300">{perf.honorsCount}</strong></span>
                            <span>•</span>
                            <span>Avg RP/Event: <strong className="text-amber-300">+{perf.avgXpPerMatch} RP</strong></span>
                        </div>
                    </div>
                </div>
            </DashboardCard>
            <DashboardCard title="Match & Event History" icon={<CalendarIcon className="w-6 h-6" />}>
                <div className="p-4 space-y-3 max-h-[40rem] overflow-y-auto">
                    {matchHistory && matchHistory.length > 0 ? (
                        matchHistory
                            .map(record => ({ ...record, event: events.find(e => e.id === record.eventId) }))
                            .filter(record => record.event)
                            .sort((a, b) => new Date(b.event!.date).getTime() - new Date(a.event!.date).getTime())
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
                    {(player.legendaryBadges || []).length > 0 ? (
                         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {(player.legendaryBadges || []).map(badge => (
                                <div key={badge.id} className="bg-zinc-800/50 p-4 rounded-lg text-center border border-amber-700/50">
                                    {badge.iconUrl ? (
                                        <img src={badge.iconUrl} alt={badge.name} className="w-16 h-16 mx-auto mb-2"/>
                                    ) : (
                                        <SparklesIcon className="w-16 h-16 mx-auto mb-2 text-amber-400" />
                                    )}
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

// FIX: Added missing SettingsTab component
const SettingsTab: React.FC<Pick<PlayerDashboardProps, 'player' | 'onPlayerUpdate'>> = ({ player, onPlayerUpdate }) => {
    const [formData, setFormData] = useState({ ...player });
    const dataContext = useContext(DataContext);
    const companyDetails = dataContext?.companyDetails;

    useEffect(() => {
        setFormData(player);
    }, [player]);

    const handleSave = () => {
        let dataToSave = { 
            ...formData,
            // Security: Callsigns can only be assigned by administrators
            callsign: player.callsign || ''
        };
        if (!dataToSave.avatarUrl) {
            dataToSave.avatarUrl = `https://api.dicebear.com/8.x/bottts/svg?seed=${dataToSave.name}${dataToSave.surname}`;
        }
        // Strip composed data that doesn't exist on the main Firestore document
        // to prevent security rule violations on update.
        const { matchHistory, xpAdjustments, ...playerCoreData } = dataToSave;
        onPlayerUpdate(playerCoreData as Player);
        alert("Profile updated!");
    };
    
    const handleAvatarUpdate = (url: string) => {
        if (url) {
            setFormData(f => ({ ...f, avatarUrl: url }));
        }
    };

    const handleRemoveAvatar = () => {
        setFormData(f => ({ ...f, avatarUrl: '' }));
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
                        <div>
                            <Input 
                                label="Callsign" 
                                value={formData.callsign || 'Unassigned'} 
                                disabled
                                className="opacity-75 cursor-not-allowed bg-zinc-950/80 border-zinc-800 text-zinc-300 font-bold" 
                                tooltip="Callsign can only be assigned by an administrator."
                            />
                            <p className="text-xs text-amber-400/90 mt-1.5 flex items-center gap-1.5">
                                <span className="font-semibold">🔒 Official Callsign:</span>
                                <span>Can only be assigned or altered by an Administrator.</span>
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="pt-4 border-t border-zinc-700/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input icon={<AtSymbolIcon className="w-5 h-5"/>} label="Email" type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                        <Input icon={<PhoneIcon className="w-5 h-5"/>} label="Phone" type="tel" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                </div>
                


                <div className="pt-4 border-t border-zinc-700/50">
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">Personal & Medical Information</h3>
                    <div className="space-y-4">
                        <Input label="Address" value={formData.address || ''} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} />
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Bio</label>
                            <textarea value={formData.bio || ''} onChange={e => setFormData(p => ({...p, bio: e.target.value}))} rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="A short bio about yourself." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Allergies</label>
                            <textarea value={formData.allergies || ''} onChange={e => setFormData(p => ({...p, allergies: e.target.value}))} rows={2} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="List any known allergies." />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Medical Notes</label>
                            <textarea value={formData.medicalNotes || ''} onChange={e => setFormData(p => ({...p, medicalNotes: e.target.value}))} rows={2} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Any medical conditions admins should be aware of." />
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <Button onClick={handleSave} className="w-full">Save Changes</Button>
                </div>
            </div>
        </DashboardCard>
    );
};


export const PlayerDashboard: React.FC<PlayerDashboardProps> = (props) => {
    const { player, players, sponsors, events, onEventSignUp, legendaryBadges, raffles, ranks, locations, signups, onPlayerUpdate, onOpenInfoModal } = props;
    const [activeTab, setActiveTab] = useState<Tab>('Overview');
    const [showQRScanner, setShowQRScanner] = useState<boolean>(false);
    const auth = useContext(AuthContext);
    const data = useContext(DataContext);
    
    const setHelpTopic = auth?.setHelpTopic;
    const logActivity = data?.logActivity;
    
    useEffect(() => {
        if (setHelpTopic) {
            setHelpTopic(`player-dashboard-${activeTab.toLowerCase()}`);
        }
        if (logActivity) {
            logActivity(`Viewed ${activeTab} tab`);
        }
    }, [activeTab, setHelpTopic, logActivity]);

    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-sm border-b border-zinc-800 flex-shrink-0 gap-2">
                 <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                    <img 
                        src={player.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.callsign || player.name || 'OP')}&background=18181b&color=ef4444&bold=true`} 
                        alt={player.name} 
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.callsign || player.name || 'OP')}&background=18181b&color=ef4444&bold=true`;
                        }}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-red-600 flex-shrink-0"
                    />
                    <div className="overflow-hidden">
                        <h1 className="text-base sm:text-xl font-bold text-white truncate">{player.name}</h1>
                        <p className="text-xs sm:text-sm text-red-400">"{player.callsign}"</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={() => setShowQRScanner(true)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(220,38,38,0.3)] transition flex items-center gap-1.5 border border-red-500/30"
                        title="Scan Event QR Code for Check-In"
                    >
                        <QrCode className="w-4 h-4 text-white" />
                        <span className="hidden sm:inline">QR Check-In</span>
                    </button>
                    <Button onClick={auth?.logout} variant="secondary" size="sm" className="flex-shrink-0">Logout</Button>
                </div>
            </header>
            <main className="flex-grow overflow-y-auto">
                <div className="p-4 sm:p-6 lg:p-8 space-y-4">
                    <EventCountdownNotification 
                        player={player} 
                        events={events} 
                        signups={signups} 
                        onSelectEvent={(event) => {
                            setActiveTab('Events');
                        }} 
                    />
                    <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'Overview' && <OverviewTab player={player} players={players} events={events} sponsors={sponsors} ranks={ranks} />}
                            {activeTab === 'Events' && (
                                <EventsTab 
                                    events={events} 
                                    player={player} 
                                    onEventSignUp={onEventSignUp} 
                                    locations={locations} 
                                    signups={signups} 
                                    onOpenQRScanner={() => setShowQRScanner(true)}
                                />
                            )}
                            {activeTab === 'Raffles' && <RafflesTab raffles={raffles} player={player} players={players} />}
                            {activeTab === 'Ranks' && <RankAndLeaderboardTab ranks={ranks} player={player} players={players} events={events} onNavigateTab={(t) => setActiveTab(t as Tab)} />}
                            {activeTab === 'Rules' && <PlayerRulesView onOpenInfoModal={onOpenInfoModal} />}
                            {activeTab === 'Stats' && <StatsTab player={player} events={events} />}
                            {activeTab === 'Achievements' && <AchievementsTab player={player} legendaryBadges={legendaryBadges} ranks={ranks}/>}
                            {activeTab === 'Settings' && <SettingsTab player={player} onPlayerUpdate={onPlayerUpdate} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {showQRScanner && data && (
                <EventQRScannerModal
                    player={player}
                    events={events}
                    signups={signups}
                    onClose={() => setShowQRScanner(false)}
                    updateDoc={data.updateDoc}
                    deleteDoc={data.deleteDoc}
                    setDoc={data.setDoc}
                />
            )}
        </div>
    );
};
