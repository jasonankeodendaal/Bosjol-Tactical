import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ArrowLeft, 
    X, 
    Calendar, 
    Clock, 
    MapPin, 
    Users, 
    Volume2, 
    Check, 
    CheckCircle2, 
    AlertTriangle, 
    Shield, 
    Trophy, 
    Crosshair, 
    CreditCard, 
    Vote, 
    FileText, 
    Info, 
    ChevronRight,
    ExternalLink,
    Sparkles,
    ShieldCheck,
    ClipboardList,
    Receipt,
    Eye
} from 'lucide-react';
import type { GameEvent, Player, Signup, Location, InventoryItem } from '../types';
import { BadgePill } from './BadgePill';
import { Button } from './Button';
import { DataContext } from '../data/DataContext';
import { AuthContext } from '../auth/AuthContext';
import { EquipmentRentalsSummaryModal } from './EquipmentRentalsSummaryModal';

interface PlayerEventFullViewProps {
    event: GameEvent;
    player: Player;
    locations: Location[];
    signups: Signup[];
    onClose: () => void;
    onSignUp: (id: string, requestedGearIds: string[], note: string, voteGameTypeId?: string) => void;
}

export const PlayerEventFullView: React.FC<PlayerEventFullViewProps> = ({
    event,
    player,
    locations,
    signups,
    onClose,
    onSignUp
}) => {
    const dataContext = useContext(DataContext);
    const auth = useContext(AuthContext);
    const isAdmin = auth?.user?.role === 'admin' || player?.role === 'admin' || (player as any)?.isAdmin;
    const adminBg = dataContext?.companyDetails?.adminBackgroundUrl;

    const [showRentalsSummaryModal, setShowRentalsSummaryModal] = useState(false);
    const [summaryModalInitialTab, setSummaryModalInitialTab] = useState<'my-gear' | 'admin-manifest'>('my-gear');

    // Total rentals count for this event across attendees and signups
    const totalEventRentalsCount = useMemo(() => {
        let count = 0;
        (event.attendees || []).forEach(a => {
            count += (a.rentedGearIds || []).length;
        });
        signups.filter(s => s.eventId === event.id).forEach(s => {
            count += (s.requestedGearIds || []).length;
        });
        return count;
    }, [event.attendees, signups, event.id]);

    // Check if player is already signed up
    const isSignedUp = useMemo(() => {
        return signups.some(s => s.eventId === event.id && s.playerId === player.id);
    }, [signups, event.id, player.id]);

    const existingSignup = useMemo(() => {
        return signups.find(s => s.eventId === event.id && s.playerId === player.id);
    }, [signups, event.id, player.id]);

    // Attending players count
    const attendingCount = useMemo(() => {
        const count = signups.filter(s => s.eventId === event.id).length;
        if (count > 0) return count;
        return event.attendees?.length || 0;
    }, [signups, event.id, event.attendees]);

    // Inventory and rentals
    const availableGear = useMemo(() => {
        if (!dataContext) return [];
        if (event.gearForRent && event.gearForRent.length > 0) {
            return event.gearForRent.map(itemId => {
                const item = dataContext.inventory.find(i => i.id === itemId);
                if (!item) return null;
                const price = event.rentalPriceOverrides?.[itemId] ?? item.salePrice;
                return { ...item, salePrice: price };
            }).filter((item): item is InventoryItem => item !== null);
        }
        // Fallback to all available inventory rentals
        return dataContext.inventory
            .filter(i => (i.category === 'Rental' || i.category === 'Weapon') && i.status === 'Available')
            .map(item => {
                const price = event.rentalPriceOverrides?.[item.id] ?? item.salePrice;
                return { ...item, salePrice: price };
            });
    }, [dataContext, event]);

    const isGunOrRifle = (item: InventoryItem) => {
        const nameLower = (item.name || '').toLowerCase();
        const category = item.category || '';
        const type = item.type || '';
        return (
            category.includes('Rifle') ||
            category === 'SMG' ||
            category === 'Weapon' ||
            type === 'Weapon' ||
            nameLower.includes('rental') ||
            nameLower.includes('rentl') ||
            nameLower.includes('rifle') ||
            nameLower.includes('gun') ||
            nameLower.includes('aeg') ||
            nameLower.includes('gbb') ||
            nameLower.includes('pistol') ||
            nameLower.includes('shotgun') ||
            nameLower.includes('m4') ||
            nameLower.includes('ak')
        );
    };

    const weaponRentals = useMemo(() => {
        return availableGear.filter(isGunOrRifle).sort((a, b) => {
            return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        });
    }, [availableGear]);

    const extraRentals = useMemo(() => {
        return availableGear.filter(item => !isGunOrRifle(item));
    }, [availableGear]);

    // Track rental counts from other signups to calculate available stock
    const alreadyRentedCount = useMemo(() => {
        const counts: Record<string, number> = {};
        // Count from confirmed attendees
        (event.attendees || []).forEach(a => {
            (a.rentedGearIds || []).forEach(id => {
                counts[id] = (counts[id] || 0) + 1;
            });
        });
        // Count from players signed up but not yet confirmed
        const eventSignups = signups.filter(s => s.eventId === event.id);
        eventSignups.forEach(s => {
            if (s.playerId !== player.id || !isSignedUp) {
                (s.requestedGearIds || []).forEach(id => {
                    counts[id] = (counts[id] || 0) + 1;
                });
            }
        });
        return counts;
    }, [event.attendees, event.id, player.id, isSignedUp, signups]);

    const [selectedGear, setSelectedGear] = useState<string[]>([]);
    const [wantsWeaponRental, setWantsWeaponRental] = useState<boolean>(false);
    const [note, setNote] = useState('');
    const [selectedVoteGameTypeId, setSelectedVoteGameTypeId] = useState<string>('');
    const hasInitialized = useRef(false);

    // Initialize state from existing signup or defaults
    useEffect(() => {
        if (hasInitialized.current) return;

        if (isSignedUp && existingSignup) {
            const gearIds = existingSignup.requestedGearIds || [];
            setSelectedGear(gearIds);
            const hasWeapon = gearIds.some(id => {
                const item = availableGear.find(g => g.id === id);
                return item ? isGunOrRifle(item) : false;
            });
            setWantsWeaponRental(hasWeapon);
            if (existingSignup.note) {
                setNote(existingSignup.note);
            }
            if (event.gameTypeVotes?.[player.id]) {
                setSelectedVoteGameTypeId(event.gameTypeVotes[player.id]);
            }
            hasInitialized.current = true;
        } else {
            setSelectedGear([]);
            setWantsWeaponRental(false);
            setNote('');
            if (event.votingEnabled && event.gameTypeId) {
                setSelectedVoteGameTypeId(event.gameTypeId);
            }
            hasInitialized.current = true;
        }
    }, [isSignedUp, existingSignup, availableGear, event.gameTypeVotes, event.votingEnabled, event.gameTypeId, player.id]);

    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Total Cost
    const totalCost = useMemo(() => {
        const gearCost = selectedGear.reduce((sum, gearId) => {
            const item = availableGear.find(g => g.id === gearId);
            return sum + (item?.salePrice || 0);
        }, 0);
        return event.gameFee + gearCost;
    }, [selectedGear, availableGear, event.gameFee]);

    const locationDetails = useMemo(() => {
        return locations.find(l => l.name.toLowerCase() === event.location.toLowerCase()) || 
               locations.find(l => l.name.toLowerCase().includes(event.location.toLowerCase()));
    }, [locations, event.location]);

    const handleGearToggle = (itemId: string) => {
        setSelectedGear(prev => 
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const handleWeaponRentalToggle = (checked: boolean) => {
        setWantsWeaponRental(checked);
        if (checked) {
            const nextAvailableWeapon = weaponRentals.find(item => {
                const availableStock = item.stock - (alreadyRentedCount[item.id] || 0);
                return availableStock > 0;
            });
            if (nextAvailableWeapon) {
                setSelectedGear(prev => {
                    const filtered = prev.filter(id => {
                        const item = availableGear.find(g => g.id === id);
                        return item ? !isGunOrRifle(item) : true;
                    });
                    return [...filtered, nextAvailableWeapon.id];
                });
            } else {
                setWantsWeaponRental(false);
                alert("All primary rental weapons are currently out of stock!");
            }
        } else {
            setSelectedGear(prev => 
                prev.filter(id => {
                    const item = availableGear.find(g => g.id === id);
                    return item ? !isGunOrRifle(item) : true;
                })
            );
        }
    };

    const selectableVotingGameTypes = useMemo(() => {
        if (!dataContext?.gameTypes) return [];
        if (event.votingGameTypeIds && event.votingGameTypeIds.length > 0) {
            return dataContext.gameTypes.filter(gt => event.votingGameTypeIds?.includes(gt.id));
        }
        return dataContext.gameTypes;
    }, [dataContext?.gameTypes, event.votingGameTypeIds]);

    const eventTypeColors: Record<string, string> = {
        Mission: 'bg-red-500/20 text-red-400 border-red-500/40',
        Training: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
        Briefing: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        Maintenance: 'bg-amber-500/20 text-amber-400 border-amber-500/40'
    };

    const assignedWeaponItem = useMemo(() => {
        const assignedId = selectedGear.find(id => {
            const item = availableGear.find(g => g.id === id);
            return item ? isGunOrRifle(item) : false;
        });
        return availableGear.find(g => g.id === assignedId);
    }, [selectedGear, availableGear]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col overflow-hidden text-zinc-100"
        >
            {/* Ambient Tactical Depth Orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

            {/* Admin Custom Background Wallpaper Texture */}
            {adminBg && (
                <div 
                    className="absolute inset-0 bg-cover bg-center opacity-15 mix-blend-overlay pointer-events-none -z-10" 
                    style={{ backgroundImage: `url(${adminBg})` }} 
                />
            )}

            {/* Top Tactical Command Header Bar (Shrink to fit, open layout) */}
            <header className="flex-shrink-0 px-3 py-2.5 sm:px-6 sm:py-3.5 border-b border-white/10 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between gap-3 z-20">
                {/* Left: Back Action Button */}
                <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 rounded-xl bg-white/[0.05] hover:bg-red-600 hover:text-white border border-white/10 transition-all duration-200 text-zinc-300 flex items-center gap-1.5 shrink-0 group active:scale-95"
                        title="Return to Schedule"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider hidden xs:inline">Back</span>
                    </button>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider border ${eventTypeColors[event.type] || 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                                {event.type}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-mono uppercase tracking-wider bg-zinc-900/90 text-amber-400 border border-amber-500/30">
                                {event.theme || 'Tactical Skirmish'}
                            </span>
                            {isSignedUp && (
                                <span className="px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    Registered
                                </span>
                            )}
                        </div>
                        <h1 className="text-sm sm:text-lg lg:text-xl font-black text-white tracking-wide truncate mt-0.5">
                            {event.title}
                        </h1>
                    </div>
                </div>

                {/* Right: Quick Meta Stats & Close */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    {/* Equipment Rentals Summary Action Button */}
                    <button
                        onClick={() => {
                            setSummaryModalInitialTab(isAdmin ? 'admin-manifest' : 'my-gear');
                            setShowRentalsSummaryModal(true);
                        }}
                        className="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-white/[0.05] hover:bg-red-600 hover:text-white border border-white/10 text-zinc-300 transition-all text-xs font-bold flex items-center gap-1.5 shrink-0 group active:scale-95 shadow-sm"
                        title="View Equipment Rentals Summary"
                    >
                        <ClipboardList className="w-3.5 h-3.5 text-red-400 group-hover:text-white transition-colors" />
                        <span className="hidden sm:inline">Equipment Rentals Summary</span>
                        <span className="sm:hidden">Rentals</span>
                        {totalEventRentalsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-red-600 group-hover:bg-black/40 text-white text-[10px] font-mono font-bold">
                                {totalEventRentalsCount}
                            </span>
                        )}
                    </button>

                    <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-zinc-300 font-mono">
                        <div className="flex items-center gap-1.5 text-red-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <span className="text-zinc-600">•</span>
                        <div className="flex items-center gap-1.5 text-zinc-300">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>{event.startTime}</span>
                        </div>
                        <span className="text-zinc-600">•</span>
                        <div className="flex items-center gap-1.5 text-emerald-400">
                            <Users className="w-3.5 h-3.5" />
                            <span>{attendingCount} attending</span>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 rounded-xl bg-white/[0.05] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/10 transition-colors"
                        aria-label="Close view"
                    >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
            </header>

            {/* Main Scrollable Content Body - Side-by-side Free View (Zero Heavy Box Containers) */}
            <main className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-6 lg:p-8 min-h-0 pb-28 lg:pb-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-start">
                    
                    {/* LEFT COLUMN: Tactical Intelligence, Location, Briefing, Rules (Free View Open Layout) */}
                    <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                        
                        {/* 1. Hero Visual Banner (Square/Free View frame without heavy borders) */}
                        <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-zinc-950 aspect-[16/8] sm:aspect-[21/9] border border-white/10 group">
                            {event.imageUrl ? (
                                <img 
                                    src={event.imageUrl} 
                                    alt={event.title} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
                                    <Crosshairs className="w-12 h-12 text-zinc-700" />
                                </div>
                            )}

                            {/* Cinematic Gradient Vignette */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

                            {/* Attending Count Pill in top corner */}
                            <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md border border-emerald-500/40 text-[10px] sm:text-xs font-bold text-emerald-400 flex items-center gap-1.5 shadow-lg">
                                <Users className="w-3 h-3 text-emerald-400" />
                                <span>{attendingCount} Operator{attendingCount === 1 ? '' : 's'} Deployed</span>
                            </div>

                            {/* Bottom Title & Theme Overlay */}
                            <div className="absolute bottom-2.5 left-3 right-3 sm:bottom-4 sm:left-5 sm:right-5 flex justify-between items-end gap-2">
                                <div>
                                    <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-amber-400 drop-shadow">
                                        {event.theme}
                                    </span>
                                    <h2 className="text-base sm:text-2xl font-black text-white tracking-wide drop-shadow-md">
                                        {event.title}
                                    </h2>
                                </div>
                                <div className="text-right font-mono text-[10px] sm:text-xs text-zinc-300 drop-shadow">
                                    <p className="text-white font-bold">{new Date(event.date).toLocaleDateString()}</p>
                                    <p className="text-zinc-400">{event.startTime}</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Free View Location Row with Direct [Open Map] Button (As seen in Screenshot 1) */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-2 border-b border-white/10">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                                    <span className="text-sm sm:text-base font-bold text-white tracking-wide">
                                        {locationDetails ? locationDetails.name : event.location}
                                    </span>
                                </div>
                                {locationDetails?.address && (
                                    <p className="text-xs text-zinc-400 pl-6">
                                        {locationDetails.address}
                                    </p>
                                )}
                            </div>

                            {locationDetails?.pinLocationUrl && (
                                <a 
                                    href={locationDetails.pinLocationUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="px-3.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/40 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm self-start sm:self-auto shrink-0"
                                >
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>Open Map</span>
                                    <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
                                </a>
                            )}
                        </div>

                        {/* Location Photos Horizontal Gallery (if present) */}
                        {locationDetails?.imageUrls && locationDetails.imageUrls.length > 0 && (
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                                    Site Reconnaissance Photos
                                </span>
                                <div className="flex space-x-2 overflow-x-auto pb-1.5 scrollbar-thin">
                                    {locationDetails.imageUrls.map((url, i) => (
                                        <img 
                                            key={i} 
                                            src={url} 
                                            alt={`Recon ${i+1}`} 
                                            className="w-28 h-18 sm:w-36 sm:h-22 object-cover rounded-xl border border-white/10 hover:border-red-500/50 transition-all flex-shrink-0" 
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 3. Audio Briefing (if recorded) */}
                        {event.audioBriefingUrl && (
                            <div className="space-y-1.5 py-2 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <Volume2 className="w-4 h-4 text-amber-400" />
                                    <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                                        Audio Mission Briefing
                                    </h3>
                                </div>
                                <audio 
                                    controls 
                                    src={event.audioBriefingUrl} 
                                    className="w-full rounded-xl bg-black/60 border border-white/10"
                                >
                                    Your browser does not support audio playback.
                                </audio>
                            </div>
                        )}

                        {/* 4. Operational Briefing (Free View Open Layout - No Box Containers) */}
                        <div className="space-y-2 py-2 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-red-400" />
                                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-300">
                                    Operational Briefing
                                </h3>
                            </div>
                            <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-line font-normal">
                                {event.description || 'No specific operational briefing recorded for this skirmish.'}
                            </p>
                        </div>

                        {/* 5. Rules of Engagement (Free View Open Layout - No Box Containers) */}
                        <div className="space-y-2 py-2 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-amber-400" />
                                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-300">
                                    Rules of Engagement
                                </h3>
                            </div>
                            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-line font-normal">
                                {event.rules || 'Standard CQB / Field safety rules apply. Eye protection mandatory at all times.'}
                            </p>
                        </div>

                        {/* 6. Event Commendations / Badges (Free View Square Grid) */}
                        {event.eventBadges && event.eventBadges.length > 0 && dataContext?.legendaryBadges && (
                            <div className="space-y-2 pt-2">
                                <div className="flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-amber-400" />
                                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-300">
                                        Event Commendations & Accolades
                                    </h3>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {event.eventBadges.map(badgeId => {
                                        const badge = dataContext.legendaryBadges.find(b => b.id === badgeId);
                                        if (!badge) return null;
                                        return (
                                            <div 
                                                key={badgeId} 
                                                className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-amber-500/40 text-center transition-all group"
                                                title={badge.description}
                                            >
                                                {badge.iconUrl ? (
                                                    <img src={badge.iconUrl} alt={badge.name} className="w-10 h-10 mx-auto object-contain group-hover:scale-110 transition-transform" />
                                                ) : (
                                                    <Trophy className="w-10 h-10 mx-auto text-amber-400" />
                                                )}
                                                <p className="text-xs font-bold text-amber-300 mt-1 truncate">{badge.name}</p>
                                                <p className="text-[10px] text-zinc-400 line-clamp-1">{badge.description}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Armory Requisition & Registration Free-View Panel */}
                    <div className="lg:col-span-5 space-y-4 sm:space-y-5">
                        
                        {/* Free View Section: Registration Status & Pricing */}
                        <div className="space-y-3 pb-3 border-b border-white/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-emerald-400" />
                                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                                        Registration & Fees
                                    </h3>
                                </div>
                                <span className="text-[10px] font-mono text-zinc-400">Payable on-site</span>
                            </div>

                            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm">
                                <span className="text-zinc-300 font-medium">Standard Battlefield Entry</span>
                                <span className="font-mono font-bold text-emerald-400 text-sm sm:text-base">
                                    R{event.gameFee.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {/* Free View Section: Rental Equipment & Armory Requisition */}
                        {availableGear.length > 0 && !isSignedUp && (
                            <div className="space-y-3 pb-3 border-b border-white/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Crosshair className="w-4 h-4 text-red-500" />
                                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                                            Armory Equipment Rental
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-mono text-zinc-400">Optional</span>
                                </div>

                                {/* 1. Base Primary Gun Rental Toggle */}
                                {weaponRentals.length > 0 && (
                                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5">
                                        <div className="flex justify-between items-center gap-2">
                                            <div>
                                                <h4 className="font-bold text-white text-xs sm:text-sm">Base Gun / Rifle Rental</h4>
                                                <p className="text-[10px] sm:text-xs text-zinc-400">Next available armory replica (Rental 1, 2, etc.)</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                                <input 
                                                    type="checkbox" 
                                                    checked={wantsWeaponRental}
                                                    onChange={(e) => handleWeaponRentalToggle(e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                            </label>
                                        </div>

                                        {wantsWeaponRental && assignedWeaponItem && (
                                            <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base">⚙️</span>
                                                    <div>
                                                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Assigned Armory Unit</p>
                                                        <p className="font-bold text-red-400 text-xs truncate max-w-[180px] sm:max-w-[220px]">
                                                            {assignedWeaponItem.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="font-mono font-bold text-white text-sm">
                                                    R{assignedWeaponItem.salePrice.toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 2. Extra Gear & Protection (Tactical gloves, masks, vests) */}
                                {extraRentals.length > 0 && (
                                    <div className="space-y-1.5 pt-1">
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                                            Extra Gear & Protection
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {extraRentals.map(item => {
                                                const availableStock = item.stock - (alreadyRentedCount[item.id] || 0);
                                                const isAvailable = availableStock > 0;
                                                const isSelected = selectedGear.includes(item.id);

                                                return (
                                                    <button
                                                        key={item.id}
                                                        type="button"
                                                        disabled={!isAvailable}
                                                        onClick={() => handleGearToggle(item.id)}
                                                        className={`p-2.5 rounded-xl border text-left transition-all duration-200 flex items-center justify-between text-xs ${
                                                            isSelected 
                                                                ? 'bg-red-600/20 border-red-500/80 text-white font-semibold shadow-sm' 
                                                                : isAvailable 
                                                                    ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06] text-zinc-300' 
                                                                    : 'bg-black/30 border-white/5 text-zinc-600 cursor-not-allowed opacity-40'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2 min-w-0 pr-1">
                                                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'border-red-500 bg-red-600' : 'border-zinc-600 bg-transparent'}`}>
                                                                {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                                                            </div>
                                                            <span className="truncate">{item.name}</span>
                                                        </div>
                                                        <div className="text-right shrink-0">
                                                            <span className="font-mono font-bold text-white">R{item.salePrice.toFixed(2)}</span>
                                                            <span className="block text-[8px] text-zinc-500">
                                                                {isAvailable ? `${availableStock} left` : 'Out of stock'}
                                                            </span>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Free View Section: Game Type Voting (if enabled by admin) */}
                        {event.votingEnabled && (
                            <div className="space-y-2 pb-3 border-b border-white/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Vote className="w-4 h-4 text-amber-400" />
                                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                                            Game Type Vote
                                        </h3>
                                    </div>
                                    <span className="text-[10px] text-amber-400 font-semibold">Community Preference</span>
                                </div>

                                {!isSignedUp ? (
                                    <div className="space-y-1">
                                        <p className="text-[11px] text-zinc-400">
                                            Cast your vote for which game type you'd like to play at this match:
                                        </p>
                                        <select 
                                            value={selectedVoteGameTypeId} 
                                            onChange={e => setSelectedVoteGameTypeId(e.target.value)} 
                                            className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                                        >
                                            <option value="">-- Select Game Type (Optional) --</option>
                                            {selectableVotingGameTypes.map(gt => (
                                                <option key={gt.id} value={gt.id}>{gt.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300 font-semibold text-center">
                                        Your Vote: {dataContext?.gameTypes?.find(g => g.id === event.gameTypeVotes?.[player.id])?.name || 'No vote submitted'}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Free View Section: Operator Note to Admin */}
                        {!isSignedUp && (
                            <div className="space-y-1.5 pb-3 border-b border-white/10">
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                                    Note to Command (Optional)
                                </label>
                                <textarea 
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    rows={2} 
                                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition-colors" 
                                    placeholder="e.g. Arriving 15 minutes late, needing extra ammo..." 
                                />
                            </div>
                        )}

                        {/* Total Cost Calculation Summary (Desktop View) */}
                        {!isSignedUp && (
                            <div className="hidden lg:block space-y-2 pt-1">
                                <div className="space-y-1.5 text-xs text-zinc-400">
                                    <div className="flex justify-between items-center">
                                        <span>Field Game Fee:</span>
                                        <span className="font-mono text-zinc-200">R{event.gameFee.toFixed(2)}</span>
                                    </div>
                                     {selectedGear.length > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span>Rental Requisitions ({selectedGear.length} item{selectedGear.length === 1 ? '' : 's'}):</span>
                                            <span className="font-mono text-zinc-200">R{(totalCost - event.gameFee).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-base font-black text-white pt-2 border-t border-white/10">
                                        <span>Total Due On-Site:</span>
                                        <span className="font-mono text-emerald-400 text-lg">R{totalCost.toFixed(2)}</span>
                                    </div>
                                </div>

                                {selectedGear.length > 0 && (
                                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <ClipboardList className="w-4 h-4 text-red-400 shrink-0" />
                                            <span className="text-xs text-zinc-300 font-medium truncate">
                                                {selectedGear.length} rental item{selectedGear.length === 1 ? '' : 's'} selected
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSummaryModalInitialTab('my-gear');
                                                setShowRentalsSummaryModal(true);
                                            }}
                                            className="text-xs font-bold text-red-400 hover:text-red-300 underline underline-offset-2 shrink-0 flex items-center gap-1"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>Verify Gear</span>
                                        </button>
                                    </div>
                                )}

                                <Button 
                                    onClick={() => onSignUp(event.id, isSignedUp ? [] : selectedGear, note, selectedVoteGameTypeId)}
                                    variant={isSignedUp ? 'danger' : 'primary'}
                                    className="w-full py-3 text-sm font-black tracking-wider uppercase shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                                >
                                    {isSignedUp ? 'Withdraw Registration' : 'Confirm Registration'}
                                </Button>
                            </div>
                        )}

                        {/* Already Signed Up Summary Card & Equipment Verification */}
                        {isSignedUp && (
                            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Deployment Confirmed</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                                        Roster Verified
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-300">
                                    You are officially registered for this match. Please arrive 15 minutes before the briefing start time.
                                </p>

                                {/* Itemized Reserved Gear Verification Block */}
                                {existingSignup?.requestedGearIds && existingSignup.requestedGearIds.length > 0 ? (
                                    <div className="pt-2 border-t border-emerald-500/20 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                                                <ClipboardList className="w-3.5 h-3.5 text-emerald-400" />
                                                <span>Reserved Equipment ({existingSignup.requestedGearIds.length}):</span>
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSummaryModalInitialTab('my-gear');
                                                    setShowRentalsSummaryModal(true);
                                                }}
                                                className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 flex items-center gap-1"
                                            >
                                                <Eye className="w-3 h-3" />
                                                <span>Verify Full List</span>
                                            </button>
                                        </div>

                                        <div className="space-y-1.5 bg-black/40 p-2.5 rounded-lg border border-emerald-500/20 max-h-48 overflow-y-auto">
                                            {existingSignup.requestedGearIds.map(id => {
                                                const item = availableGear.find(g => g.id === id);
                                                return item ? (
                                                    <div key={id} className="flex justify-between items-center text-zinc-200 font-mono text-xs">
                                                        <span className="truncate pr-2 font-sans font-medium text-white">• {item.name}</span>
                                                        <span className="text-emerald-400 font-bold shrink-0">R{item.salePrice.toFixed(2)}</span>
                                                    </div>
                                                ) : null;
                                            })}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSummaryModalInitialTab('my-gear');
                                                setShowRentalsSummaryModal(true);
                                            }}
                                            className="w-full py-2 px-3 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            <Receipt className="w-3.5 h-3.5" />
                                            <span>View Equipment Rental Summary & Receipt</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="pt-2 border-t border-emerald-500/20 text-xs text-zinc-400 flex items-center justify-between">
                                        <span>No rental gear requested (Personal gear).</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSummaryModalInitialTab('my-gear');
                                                setShowRentalsSummaryModal(true);
                                            }}
                                            className="text-[11px] font-bold text-zinc-300 hover:text-white underline"
                                        >
                                            Check rentals
                                        </button>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <Button 
                                        onClick={() => onSignUp(event.id, [], '', undefined)}
                                        variant="danger"
                                        className="w-full py-2 text-xs font-bold uppercase tracking-wider"
                                    >
                                        Withdraw Registration
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Admin Manifest Quick Link */}
                        {isAdmin && (
                            <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10 flex items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                    <ShieldCheck className="w-4 h-4 text-red-400 shrink-0" />
                                    <span className="text-zinc-300 font-bold truncate">
                                        Admin Armory Manifest ({totalEventRentalsCount} reserved)
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSummaryModalInitialTab('admin-manifest');
                                        setShowRentalsSummaryModal(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] shrink-0 transition-colors"
                                >
                                    Open Manifest
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Mobile-Only Fixed Bottom Sticky Bar for Total & Primary Registration Action (Shrink-to-fit) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 shadow-2xl z-30 flex items-center justify-between gap-3">
                {!isSignedUp ? (
                    <>
                        <div className="min-w-0">
                            <p className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">Total Due On-Site</p>
                            <p className="text-base font-mono font-black text-emerald-400 leading-none">
                                R{totalCost.toFixed(2)}
                            </p>
                        </div>
                        <button
                            onClick={() => onSignUp(event.id, selectedGear, note, selectedVoteGameTypeId)}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.5)] active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                        >
                            <span>Confirm Registration</span>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => onSignUp(event.id, [], '', undefined)}
                        className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                    >
                        Withdraw Registration
                    </button>
                )}
            </div>

            {/* Equipment Rentals Summary Modal */}
            <AnimatePresence>
                {showRentalsSummaryModal && (
                    <EquipmentRentalsSummaryModal
                        event={event}
                        player={player}
                        players={dataContext?.players || []}
                        signups={signups}
                        inventory={dataContext?.inventory || []}
                        onClose={() => setShowRentalsSummaryModal(false)}
                        isAdmin={isAdmin}
                        initialTab={summaryModalInitialTab}
                        selectedGearIds={selectedGear}
                        operatorNote={note}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};
