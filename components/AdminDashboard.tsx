import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player, GameEvent, Rank, GamificationSettings, Badge, Sponsor, CompanyDetails, PaymentStatus, EventAttendee, Voucher, MatchRecord, EventStatus, EventType, InventoryItem, Supplier, Transaction, Location, SocialLink, GamificationRule, PlayerStats, Raffle, RaffleTicket, LegendaryBadge, Prize, RentalSignup } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { UsersIcon, CogIcon, CalendarIcon, TrashIcon, ShieldCheckIcon, PlusIcon, TrophyIcon, BuildingOfficeIcon, SparklesIcon, PencilIcon, XIcon, TicketIcon, AtSymbolIcon, PhoneIcon, GlobeAltIcon, ArrowLeftIcon, ArchiveBoxIcon, CurrencyDollarIcon, TruckIcon, MapPinIcon, MinusIcon, KeyIcon, Bars3Icon, ExclamationTriangleIcon, InformationCircleIcon, CreditCardIcon, CheckCircleIcon, PrinterIcon, PlusCircleIcon } from './icons/Icons';
import { BadgePill } from './BadgePill';
import { EventCard } from './EventCard';
import { Modal } from './Modal';
import { ImageUpload } from './ImageUpload';
import { MOCK_RANKS, UNRANKED_RANK, INVENTORY_CATEGORIES, INVENTORY_CONDITIONS, MOCK_EVENT_THEMES } from '../constants';
import { PlayerProfilePage } from './PlayerProfilePage';
import { InfoTooltip } from './InfoTooltip';
import { FinanceTab } from './FinanceTab';
import { SuppliersTab } from './SuppliersTab';
import { LocationsTab } from './LocationsTab';
import { USE_FIREBASE } from '../firebase';


const getRankForPlayer = (player: Player): Rank => {
    if (player.stats.gamesPlayed < 10) {
        return UNRANKED_RANK;
    }
    const sortedRanks = [...MOCK_RANKS].sort((a, b) => b.minXp - a.minXp);
    const rank = sortedRanks.find(r => player.stats.xp >= r.minXp);
    return rank || MOCK_RANKS[0];
};

interface AdminDashboardProps {
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    events: GameEvent[];
    setEvents: React.Dispatch<React.SetStateAction<GameEvent[]>>;
    ranks: Rank[];
    setRanks: React.Dispatch<React.SetStateAction<Rank[]>>;
    badges: Badge[];
    setBadges: React.Dispatch<React.SetStateAction<Badge[]>>;
    legendaryBadges: LegendaryBadge[];
    setLegendaryBadges: React.Dispatch<React.SetStateAction<LegendaryBadge[]>>;
    gamificationSettings: GamificationSettings;
    setGamificationSettings: React.Dispatch<React.SetStateAction<GamificationSettings>>;
    sponsors: Sponsor[];
    setSponsors: React.Dispatch<React.SetStateAction<Sponsor[]>>;
    companyDetails: CompanyDetails;
    setCompanyDetails: React.Dispatch<React.SetStateAction<CompanyDetails>>;
    vouchers: Voucher[];
    setVouchers: React.Dispatch<React.SetStateAction<Voucher[]>>;
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    suppliers: Supplier[];
    setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    locations: Location[];
    setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
    raffles: Raffle[];
    setRaffles: React.Dispatch<React.SetStateAction<Raffle[]>>;
    onDeleteAllData: () => void;
    onSeedInitialData: () => Promise<void>;
}

type Tab = 'Events' | 'Players' | 'Progression' | 'Inventory' | 'Locations' | 'Suppliers' | 'Finance' | 'Vouchers & Raffles' | 'Sponsors' | 'Settings' | 'About';
type View = 'dashboard' | 'player_profile' | 'manage_event';

const NewPlayerModal: React.FC<{
    onClose: () => void;
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
}> = ({ onClose, players, setPlayers }) => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        phone: '',
        pin: '',
    });

    const handleSave = () => {
        // Validation
        if (!formData.name || !formData.surname || !formData.email || !formData.pin) {
            alert('Please fill in all required fields.');
            return;
        }
        if (!/^\d{4}$/.test(formData.pin)) {
            alert('PIN must be 4 digits.');
            return;
        }

        // Auto-generate playerCode based on initials
        const initials = (formData.name.charAt(0) + formData.surname.charAt(0)).toUpperCase();
        const existingPlayersWithInitials = players.filter(p => p.playerCode.startsWith(initials));
        
        let newNumber = 1;
        if (existingPlayersWithInitials.length > 0) {
            const highestNumber = existingPlayersWithInitials.reduce((max, p) => {
                const numPart = p.playerCode.substring(initials.length);
                const num = parseInt(numPart, 10);
                return !isNaN(num) && num > max ? num : max;
            }, 0);
            newNumber = highestNumber + 1;
        }
        
        const newPlayerCode = `${initials}${String(newNumber).padStart(2, '0')}`;
        
        const newPlayer: Player = {
            id: `p${Date.now()}`,
            name: formData.name,
            surname: formData.surname,
            playerCode: newPlayerCode,
            email: formData.email,
            phone: formData.phone,
            pin: formData.pin,
            role: 'player',
            callsign: formData.name, // Default callsign to first name
            rank: MOCK_RANKS[0],
            status: 'Active',
            avatarUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=${formData.name}${formData.surname}`, // Default avatar
            stats: { kills: 0, deaths: 0, headshots: 0, gamesPlayed: 0, xp: 0 },
            matchHistory: [],
            xpAdjustments: [],
            badges: [],
            legendaryBadges: [],
            loadout: {
                primaryWeapon: 'M4A1 Assault Rifle',
                secondaryWeapon: 'X12 Pistol',
                lethal: 'Frag Grenade',
                tactical: 'Flashbang',
            },
        };

        setPlayers(prev => [...prev, newPlayer]);
        onClose();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Create New Player">
            <div className="space-y-4">
                <Input label="First Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                <Input label="Surname" value={formData.surname} onChange={e => setFormData(f => ({ ...f, surname: e.target.value }))} />
                <Input label="Email" type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                <Input label="Phone" type="tel" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
                <Input label="4-Digit PIN" type="password" value={formData.pin} onChange={e => setFormData(f => ({ ...f, pin: e.target.value.replace(/\D/g, '') }))} maxLength={4} />
            </div>
            <div className="mt-6">
                <Button className="w-full" onClick={handleSave}>Create Player</Button>
            </div>
        </Modal>
    );
};

const Tabs: React.FC<{ activeTab: Tab; setActiveTab: (tab: Tab) => void; }> = ({ activeTab, setActiveTab }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const tabs: {name: Tab, icon: React.ReactNode}[] = [
        {name: 'Events', icon: <CalendarIcon className="w-5 h-5"/>},
        {name: 'Players', icon: <UsersIcon className="w-5 h-5"/>},
        {name: 'Progression', icon: <ShieldCheckIcon className="w-5 h-5"/>},
        {name: 'Inventory', icon: <ArchiveBoxIcon className="w-5 h-5"/>},
        {name: 'Locations', icon: <MapPinIcon className="w-5 h-5"/>},
        {name: 'Suppliers', icon: <TruckIcon className="w-5 h-5"/>},
        {name: 'Finance', icon: <CurrencyDollarIcon className="w-5 h-5"/>},
        {name: 'Vouchers & Raffles', icon: <TicketIcon className="w-5 h-5"/>},
        {name: 'Sponsors', icon: <SparklesIcon className="w-5 h-5"/>},
        {name: 'Settings', icon: <CogIcon className="w-5 h-5"/>},
        {name: 'About', icon: <InformationCircleIcon className="w-5 h-5"/>},
    ];

    const activeTabInfo = tabs.find(t => t.name === activeTab);

    return (
        <div className="border-b border-zinc-800 mb-6">
             {/* Mobile Menu Button */}
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

            {/* Desktop Tabs */}
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

const EventEditorModal: React.FC<{
    event: Partial<GameEvent>;
    inventory: InventoryItem[];
    gamificationSettings: GamificationSettings;
    companyDetails: CompanyDetails;
    onClose: () => void;
    onSave: (event: Partial<GameEvent>) => void;
}> = ({ event, inventory, gamificationSettings, companyDetails, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        title: event.title || '',
        type: event.type || 'Mission',
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
        startTime: event.startTime || '',
        location: event.location || '',
        description: event.description || '',
        theme: event.theme || '',
        rules: 'id' in event ? event.rules || '' : companyDetails.fixedEventRules || '',
        participationXp: event.participationXp || 0,
        gameFee: event.gameFee || 0,
        imageUrl: event.imageUrl || '',
        gearForRent: event.gearForRent?.map(g => g.id) || [],
        xpOverrides: event.xpOverrides || {},
    });

    const rentalGear = inventory.filter(i => i.isRental);

    const handleGearChange = (gearId: string) => {
        setFormData(f => {
            const gearSet = new Set(f.gearForRent);
            if (gearSet.has(gearId)) {
                gearSet.delete(gearId);
            } else {
                gearSet.add(gearId);
            }
            return { ...f, gearForRent: Array.from(gearSet) };
        });
    };

    const handleXpOverrideChange = (ruleId: string, value: string) => {
        const numericValue = parseInt(value, 10);
        setFormData(f => ({
            ...f,
            xpOverrides: {
                ...f.xpOverrides,
                [ruleId]: isNaN(numericValue) ? undefined : numericValue
            }
        }));
    };

    const handleSubmit = () => {
        const finalGear = inventory.filter(g => formData.gearForRent.includes(g.id));
        const finalEventData = {
            ...formData,
            date: new Date(`${formData.date}T${formData.startTime || '00:00'}:00Z`).toISOString(),
            gearForRent: finalGear,
        };
        onSave({ ...event, ...finalEventData });
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={event.id ? 'Edit Event' : 'Create Event'}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <h4 className="text-base font-semibold text-red-500 border-b border-zinc-700 pb-2">Core Details</h4>
                <Input label="Event Title" value={formData.title} onChange={e => setFormData(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Operation Nightfall" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Event Type</label>
                        <select value={formData.type} onChange={e => setFormData(f => ({ ...f, type: e.target.value as EventType }))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option>Mission</option>
                            <option>Training</option>
                            <option>Briefing</option>
                            <option>Maintenance</option>
                        </select>
                    </div>
                    <Input label="Location" value={formData.location} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} placeholder="e.g., Verdansk" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Date" type="date" value={formData.date} onChange={e => setFormData(f => ({ ...f, date: e.target.value }))} />
                    <Input label="Start Time" type="time" value={formData.startTime} onChange={e => setFormData(f => ({ ...f, startTime: e.target.value }))} />
                </div>

                <h4 className="text-base font-semibold text-red-500 border-b border-zinc-700 pb-2 pt-2">Gameplay & Briefing</h4>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                 <div>
                    <Input label="Theme" value={formData.theme} onChange={e => setFormData(f => ({ ...f, theme: e.target.value }))} placeholder="e.g., Modern Warfare" />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {MOCK_EVENT_THEMES.map(theme => (
                            <button key={theme} type="button" onClick={() => setFormData(f => ({...f, theme: theme}))} className="px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-gray-300 rounded-md border border-zinc-700 transition-colors">
                                {theme}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Rules of Engagement</label>
                    <textarea value={formData.rules} onChange={e => setFormData(f => ({ ...f, rules: e.target.value }))} rows={5} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>

                <h4 className="text-base font-semibold text-red-500 border-b border-zinc-700 pb-2 pt-2">Rewards & Logistics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Participation XP" type="number" value={formData.participationXp} onChange={e => setFormData(f => ({ ...f, participationXp: parseInt(e.target.value, 10) || 0 }))} tooltip="Base XP awarded to all players who attend and complete the event."/>
                    <Input label="Game Fee (R)" type="number" value={formData.gameFee} onChange={e => setFormData(f => ({ ...f, gameFee: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                    <div className="flex items-center mb-2">
                         <h5 className="text-sm font-semibold text-gray-300">Event-Specific XP Overrides</h5>
                         <div className="ml-1.5"><InfoTooltip text="Use these fields to set temporary XP rules for this event only. If left blank, the global gamification settings will be used." /></div>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-700">
                        {gamificationSettings.map(rule => (
                            <Input 
                                key={rule.id}
                                label={rule.name}
                                type="number"
                                value={formData.xpOverrides[rule.id] ?? ''}
                                onChange={e => handleXpOverrideChange(rule.id, e.target.value)}
                                placeholder={`Default: ${rule.xp}`}
                            />
                        ))}
                    </div>
                </div>
                
                <h4 className="text-base font-semibold text-red-500 border-b border-zinc-700 pb-2 pt-2">Visuals & Gear</h4>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Event Image</label>
                    <ImageUpload onUpload={base64 => setFormData(f => ({...f, imageUrl: base64}))} accept="image/*" />
                    {formData.imageUrl && <img src={formData.imageUrl} alt="Preview" className="w-full h-24 object-cover mt-2 rounded-md" />}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Gear for Rent</label>
                    <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-900/50 rounded-lg border border-zinc-700 max-h-40 overflow-y-auto">
                        {rentalGear.map(item => (
                            <label key={item.id} className="flex items-center space-x-3 text-sm text-gray-300">
                                <input
                                    type="checkbox"
                                    checked={formData.gearForRent.includes(item.id)}
                                    onChange={() => handleGearChange(item.id)}
                                    className="h-4 w-4 rounded border-gray-600 bg-zinc-700 text-red-500 focus:ring-red-500"
                                />
                                <span>{item.name} (R{item.salePrice})</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <Button className="w-full" onClick={handleSubmit}>Save Event</Button>
            </div>
        </Modal>
    );
};

const PlayerLiveStatTracker: React.FC<{
    player: Player;
    stats: GameEvent['liveStats'][string];
    onStatChange: (playerId: string, stat: keyof PlayerStats, delta: number) => void;
}> = ({ player, stats, onStatChange }) => {
    return (
        <li className="flex items-center justify-between bg-zinc-800/50 p-2 rounded-md">
            <div className="flex items-center">
                <img src={player.avatarUrl} alt={player.name} className="w-8 h-8 rounded-full mr-3 object-cover"/>
                <span className="text-gray-300 font-semibold">{player.name}</span>
            </div>
            <div className="flex items-center gap-2">
                {['kills', 'deaths', 'headshots'].map(statKey => (
                     <div key={statKey} className="flex flex-col items-center">
                        <span className="text-xs text-gray-400 uppercase">{statKey.slice(0,1)}</span>
                         <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-md">
                            <Button size="sm" variant="secondary" className="!p-1" onClick={() => onStatChange(player.id, statKey as keyof PlayerStats, -1)}><MinusIcon className="w-3 h-3"/></Button>
                            <span className="font-mono w-6 text-center text-amber-300">{stats?.[statKey as keyof PlayerStats] || 0}</span>
                            <Button size="sm" variant="secondary" className="!p-1" onClick={() => onStatChange(player.id, statKey as keyof PlayerStats, 1)}><PlusIcon className="w-3 h-3"/></Button>
                        </div>
                    </div>
                ))}
            </div>
        </li>
    );
};


const ManageEventPage: React.FC<{
    event: GameEvent;
    players: Player[];
    vouchers: Voucher[];
    inventory: InventoryItem[];
    gamificationSettings: GamificationSettings;
    onBack: () => void;
    onUpdateEvent: (event: GameEvent) => void;
    onUpdateVoucher: (voucher: Voucher) => void;
    onFinalizeEvent: (event: GameEvent, finalPlayers: Player[], newTransactions: Transaction[]) => void;
}> = ({ event, players, vouchers, inventory, gamificationSettings, onBack, onUpdateEvent, onUpdateVoucher, onFinalizeEvent }) => {
    
    const [liveStats, setLiveStats] = useState<GameEvent['liveStats']>(event.liveStats || {});
    const [elapsedTime, setElapsedTime] = useState(event.gameDurationSeconds || 0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef<number | null>(null);
    
    useEffect(() => {
        if (isTimerRunning) {
            timerRef.current = window.setInterval(() => {
                setElapsedTime(prevTime => prevTime + 1);
            }, 1000);
        } else {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }

        return () => { // Cleanup on unmount
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isTimerRunning]);
    
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const handleMarkAbsent = (playerId: string) => {
        const updatedEvent = {
            ...event,
            signedUpPlayers: event.signedUpPlayers.filter(id => id !== playerId),
            rentalSignups: (event.rentalSignups || []).filter(r => r.playerId !== playerId),
            absentPlayers: [...(event.absentPlayers || []), playerId],
        };
        onUpdateEvent(updatedEvent);
    };

    const handleConfirmAttendance = (
        playerId: string, 
        paymentStatus: PaymentStatus, 
        voucherCode: string, 
        rentedGearIds: string[],
        note: string,
        discountAmount: number,
        discountReason: string
    ) => {
         const confirmedRentals = event.attendees.reduce((acc, attendee) => {
            (attendee.rentedGearIds || []).forEach(id => { acc[id] = (acc[id] || 0) + 1; });
            return acc;
        }, {} as Record<string, number>);

        for (const gearId of rentedGearIds) {
            const item = inventory.find(i => i.id === gearId);
            if (item) {
                const availableStock = item.stock - (confirmedRentals[gearId] || 0);
                if (availableStock <= 0) {
                    alert(`Cannot approve rental for "${item.name}". No stock available.`);
                    return;
                }
            }
        }
        
        let finalVoucherCode = undefined;
        if (voucherCode) {
            const voucher = vouchers.find(v => v.code.toLowerCase() === voucherCode.toLowerCase());

            if (!voucher) {
                alert("Voucher code not found.");
                return;
            }
            if (voucher.status !== 'Active') {
                alert(`Voucher "${voucher.code}" is not active (${voucher.status}).`);
                return;
            }
            if (voucher.assignedToPlayerId && voucher.assignedToPlayerId !== playerId) {
                alert(`Voucher "${voucher.code}" is assigned to another player.`);
                return;
            }
            if (voucher.usageLimit && voucher.redemptions.length >= voucher.usageLimit) {
                 alert(`Voucher "${voucher.code}" has reached its total usage limit.`);
                return;
            }
            if (voucher.perUserLimit) {
                const userRedemptions = voucher.redemptions.filter(r => r.playerId === playerId).length;
                if (userRedemptions >= voucher.perUserLimit) {
                    alert(`You have already used voucher "${voucher.code}" the maximum number of times.`);
                    return;
                }
            }

            const updatedVoucher = { ...voucher };
            updatedVoucher.redemptions = [
                ...updatedVoucher.redemptions,
                { playerId, eventId: event.id, date: new Date().toISOString() }
            ];

            if (updatedVoucher.usageLimit && updatedVoucher.redemptions.length >= updatedVoucher.usageLimit) {
                updatedVoucher.status = 'Depleted';
            }

            onUpdateVoucher(updatedVoucher);
            finalVoucherCode = voucher.code;
        }


        const newAttendee: EventAttendee = { playerId, paymentStatus, voucherCode: finalVoucherCode, rentedGearIds, note, discountAmount, discountReason };
        const updatedEvent = {
            ...event,
            signedUpPlayers: event.signedUpPlayers.filter(id => id !== playerId),
            rentalSignups: (event.rentalSignups || []).filter(r => r.playerId !== playerId),
            attendees: [...event.attendees, newAttendee],
        };
        onUpdateEvent(updatedEvent);
    }
    
    const handleStartEvent = () => {
         if (event.signedUpPlayers.length > 0) {
            if (!confirm("There are still players who are signed up but not confirmed. Are you sure you want to start the event? They will be marked as absent.")) {
                return;
            }
        }
        const playerIds = event.attendees.map(a => a.playerId);
        const shuffled = [...playerIds].sort(() => 0.5 - Math.random());
        const midpoint = Math.ceil(shuffled.length / 2);
        const alpha = shuffled.slice(0, midpoint);
        const bravo = shuffled.slice(midpoint);

        const updatedEvent = { 
            ...event, 
            status: 'In Progress' as EventStatus, 
            teams: { alpha, bravo },
            absentPlayers: [...(event.absentPlayers || []), ...event.signedUpPlayers],
            signedUpPlayers: [],
            rentalSignups: [],
        };
        onUpdateEvent(updatedEvent);
    }
    
    const handleStatChange = (playerId: string, stat: keyof PlayerStats, delta: number) => {
        setLiveStats(prev => {
            const currentStats = prev?.[playerId] || { kills: 0, deaths: 0, headshots: 0 };
            const currentVal = currentStats[stat] || 0;
            const newVal = Math.max(0, currentVal + delta);
            return {
                ...prev,
                [playerId]: { ...currentStats, [stat]: newVal }
            };
        });
    };

    const handleFinishEvent = () => {
        if (!confirm("Are you sure you want to finish this event? This will finalize stats, award XP, and generate financial records. This action cannot be undone.")) return;
        
        setIsTimerRunning(false);
        if(timerRef.current) clearInterval(timerRef.current);

        const getXp = (ruleId: string, defaultValue: number): number => {
            return event.xpOverrides?.[ruleId] ?? gamificationSettings.find(r => r.id === ruleId)?.xp ?? defaultValue;
        };
        
        const killXp = getXp('g_kill', 10);
        const headshotXp = getXp('g_headshot', 25);
        const deathXp = getXp('g_death', -5);
        const gameXp = getXp('g_game', 100);
        
        const newTransactions: Transaction[] = [];

        const updatedPlayers = players.map(player => {
            const attendee = event.attendees.find(a => a.playerId === player.id);
            if (attendee) {
                // Generate Financial Transactions
                 const gameFeeTransactionAmount = event.gameFee - (attendee.discountAmount || 0);

                if (gameFeeTransactionAmount > 0) {
                    newTransactions.push({
                        id: `txn-rev-event-${event.id}-${player.id}`,
                        date: event.date,
                        type: 'Event Revenue',
                        description: `Event Fee: ${event.title}${attendee.discountReason ? ` (Discount: ${attendee.discountReason})` : ''}`,
                        amount: gameFeeTransactionAmount,
                        relatedEventId: event.id,
                        relatedPlayerId: player.id,
                        paymentStatus: attendee.paymentStatus
                    });
                }


                (attendee.rentedGearIds || []).forEach(gearId => {
                    const gearItem = inventory.find(i => i.id === gearId);
                    if (gearItem) {
                        newTransactions.push({
                             id: `txn-rev-rental-${event.id}-${player.id}-${gearId}`,
                             date: event.date,
                             type: 'Rental Revenue',
                             description: `Rental: ${gearItem.name}`,
                             amount: gearItem.salePrice,
                             relatedEventId: event.id,
                             relatedPlayerId: player.id,
                             relatedInventoryId: gearId,
                             paymentStatus: attendee.paymentStatus
                        });
                    }
                });


                // Update Player Stats
                const playerLiveStats = liveStats?.[player.id] || {};
                const kills = playerLiveStats.kills || 0;
                const deaths = playerLiveStats.deaths || 0;
                const headshots = playerLiveStats.headshots || 0;

                const newMatchRecord: MatchRecord = { eventId: event.id, playerStats: { kills, deaths, headshots } };
                
                const calculatedXp = event.participationXp + 
                            (kills * killXp) +
                            (headshots * headshotXp) +
                            (deaths * deathXp);
                return {
                    ...player,
                    stats: {
                        ...player.stats,
                        kills: player.stats.kills + kills,
                        deaths: player.stats.deaths + deaths,
                        headshots: player.stats.headshots + headshots,
                        gamesPlayed: player.stats.gamesPlayed + 1,
                        xp: player.stats.xp + calculatedXp
                    },
                    matchHistory: [...player.matchHistory, newMatchRecord]
                };
            }
            return player;
        });

        const finalEventState: GameEvent = {
            ...event,
            status: 'Completed',
            liveStats: liveStats,
            gameDurationSeconds: elapsedTime,
        };
        
        onFinalizeEvent(finalEventState, updatedPlayers, newTransactions);
    };


    const signedUpPlayersList = event.signedUpPlayers.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];

    const AttendanceManager: React.FC<{player:Player, rentalRequest?: RentalSignup}> = ({player, rentalRequest}) => {
        const [finalGear, setFinalGear] = useState<string[]>(rentalRequest?.requestedGearIds || []);
        const [voucherInput, setVoucherInput] = useState('');
        const [manualDiscount, setManualDiscount] = useState<number | ''>('');
        const [discountReason, setDiscountReason] = useState('');
        const [total, setTotal] = useState(0);

         useEffect(() => {
            const gearCost = finalGear.reduce((sum, id) => {
                const item = inventory.find(i => i.id === id);
                return sum + (item?.salePrice || 0);
            }, 0);
            setTotal(event.gameFee + gearCost - (Number(manualDiscount) || 0));
        }, [finalGear, manualDiscount, event.gameFee, inventory]);

        const handleGearToggle = (itemId: string) => {
            setFinalGear(prev => 
                prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
            );
        };

        const handleConfirm = (paymentStatus: PaymentStatus) => {
            if(Number(manualDiscount) > 0 && !discountReason.trim()){
                alert("Please provide a reason for the manual discount.");
                return;
            }
            handleConfirmAttendance(player.id, paymentStatus, voucherInput, finalGear, rentalRequest?.note || '', Number(manualDiscount) || 0, discountReason);
        }

        return (
             <div className="bg-zinc-800 p-3 rounded-md space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <img src={player.avatarUrl} alt={player.name} className="w-8 h-8 rounded-full mr-3 object-cover" />
                        <span className="font-bold text-gray-200">{player.name}</span>
                    </div>
                    <Button size="sm" variant='danger' onClick={() => handleMarkAbsent(player.id)}>Mark Absent</Button>
                </div>

                {rentalRequest?.note && (
                    <div className="bg-amber-900/50 border border-amber-700/50 p-2 rounded-md">
                        <p className="text-xs font-bold text-amber-300">Player Note:</p>
                        <p className="text-sm text-amber-200 italic">"{rentalRequest.note}"</p>
                    </div>
                )}
                
                <div>
                    <p className="text-xs font-semibold text-gray-400 mb-1">Rental Gear (Requested in <span className="text-amber-400">yellow</span>)</p>
                     <div className="grid grid-cols-2 gap-2 p-2 bg-zinc-900/50 rounded-lg border border-zinc-700 max-h-32 overflow-y-auto">
                        {event.gearForRent.map(item => {
                            const isRequested = rentalRequest?.requestedGearIds.includes(item.id);
                            return (
                                <label key={item.id} className={`flex items-center space-x-2 text-sm ${isRequested ? 'text-amber-300' : 'text-gray-300'}`}>
                                    <input
                                        type="checkbox"
                                        checked={finalGear.includes(item.id)}
                                        onChange={() => handleGearToggle(item.id)}
                                        className="h-4 w-4 rounded border-gray-600 bg-zinc-700 text-red-500 focus:ring-red-500"
                                    />
                                    <span>{item.name}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
                
                 <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-700">
                    <Input label="Manual Discount (R)" type="number" value={manualDiscount} onChange={e => setManualDiscount(Number(e.target.value) || '')} placeholder="e.g., 50"/>
                    <Input label="Discount Reason" value={discountReason} onChange={e => setDiscountReason(e.target.value)} placeholder="Required for discount"/>
                 </div>
                <div className="flex flex-col sm:flex-row gap-2 items-center pt-2 border-t border-zinc-700">
                     <div className="w-full text-center sm:text-left">
                        <span className="text-sm text-gray-400">Final Total: </span>
                        <span className="font-bold text-xl text-green-400">R{total.toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                        <Button size="sm" className="flex-1" onClick={() => handleConfirm('Paid (Cash)')}>Paid Cash</Button>
                        <Button size="sm" className="flex-1" onClick={() => handleConfirm('Paid (Card)')}>Paid Card</Button>
                    </div>
                </div>
            </div>
        )
    }

    const renderContent = () => {
        if (event.status === 'In Progress' || event.status === 'Completed') {
             const teamAlpha = (event.teams?.alpha.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[]) || [];
             const teamBravo = (event.teams?.bravo.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[]) || [];

             return (
                 <div className="space-y-4">
                    <div className="bg-zinc-800/50 p-6 rounded-lg text-center border border-zinc-700">
                        <p className="text-lg text-gray-400">Game Clock</p>
                        <p className="text-6xl font-mono font-bold text-amber-300 my-2">{formatTime(elapsedTime)}</p>
                        {event.status === 'In Progress' && (
                            <div className="flex justify-center gap-4 mt-4">
                                <Button onClick={() => setIsTimerRunning(prev => !prev)} variant="primary" size="md">
                                    {isTimerRunning ? 'Pause Clock' : 'Start Clock'}
                                </Button>
                                <Button variant="secondary" size="md" onClick={() => {
                                    setIsTimerRunning(false);
                                    setElapsedTime(0);
                                }}>
                                    Reset Clock
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-350px)] overflow-y-auto">
                        <DashboardCard title="Team Alpha" icon={<UsersIcon />}>
                        <ul className="space-y-2 p-4">
                            {teamAlpha.map(p => (
                                <PlayerLiveStatTracker key={p.id} player={p} stats={liveStats?.[p.id]} onStatChange={handleStatChange} />
                            ))}
                        </ul>
                        </DashboardCard>
                        <DashboardCard title="Team Bravo" icon={<UsersIcon />}>
                            <ul className="space-y-2 p-4">
                            {teamBravo.map(p => (
                                <PlayerLiveStatTracker key={p.id} player={p} stats={liveStats?.[p.id]} onStatChange={handleStatChange} />
                            ))}
                        </ul>
                        </DashboardCard>
                    </div>
                    {event.status === 'In Progress' && <Button variant="danger" className="w-full mt-6" onClick={handleFinishEvent}>Finish Event & Finalize Stats</Button>}
                 </div>
             );
        }

        return (
            <div className="space-y-4">
                <DashboardCard title={`Attendance & Payment (${signedUpPlayersList.length} remaining)`} icon={<UsersIcon />}>
                    <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto p-4">
                        {signedUpPlayersList.length > 0 ? signedUpPlayersList.map(player => (
                            <AttendanceManager key={player.id} player={player} rentalRequest={event.rentalSignups?.find(r => r.playerId === player.id)} />
                        )) : <p className="text-center text-gray-500 py-4">All players processed or none signed up.</p>}
                    </div>
                </DashboardCard>
                 <div className="mt-6">
                    <Button onClick={handleStartEvent} className="w-full" disabled={event.attendees.length < 2}>Start Event</Button>
                    <p className="text-xs text-center text-gray-500 mt-2">Requires at least 2 confirmed attendees to start.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <header className="flex items-center mb-6">
                <Button onClick={onBack} variant="secondary" size="sm" className="mr-4">
                    <ArrowLeftIcon className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-white">Manage: {event.title}</h1>
                    <p className="text-sm text-gray-400">{new Date(event.date).toLocaleDateString()}</p>
                </div>
            </header>
            {renderContent()}
        </div>
    )
}

const EventsTab: React.FC<Pick<AdminDashboardProps, 'events' | 'setEvents' | 'players' | 'vouchers' | 'setVouchers' | 'setPlayers' | 'gamificationSettings' | 'inventory' | 'companyDetails' | 'setTransactions'> & {onManageEvent: (id: string) => void}> = ({ events, setEvents, players, vouchers, setVouchers, setPlayers, gamificationSettings, inventory, companyDetails, setTransactions, onManageEvent }) => {
    const [editingEvent, setEditingEvent] = useState<Partial<GameEvent> | null>(null);
    const [deletingEvent, setDeletingEvent] = useState<GameEvent | null>(null);

    const handleSaveEvent = (eventData: Partial<GameEvent>) => {
        if (eventData.id) {
            setEvents(prev => prev.map(e => e.id === eventData.id ? { ...e, ...eventData } as GameEvent : e));
        } else {
            const newEvent: GameEvent = {
                id: `e${Date.now()}`,
                status: 'Upcoming',
                attendees: [],
                signedUpPlayers: [],
                absentPlayers: [],
                rentalSignups: [],
                liveStats: {},
                gameDurationSeconds: 0,
                ...eventData
            } as GameEvent;
            setEvents(prev => [newEvent, ...prev]);
        }
        setEditingEvent(null);
    };

    const handleDeleteEvent = () => {
        if (!deletingEvent) return;
        setEvents(prev => prev.filter(e => e.id !== deletingEvent.id));
        setDeletingEvent(null);
    };

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={() => setEditingEvent({})}>
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Create Event
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map(event => (
                    <div key={event.id} className="bg-zinc-900/80 rounded-lg overflow-hidden border border-zinc-800/80 flex flex-col h-full">
                        <div className="flex-grow">
                            <EventCard event={event} />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-zinc-800/50 border-t border-zinc-700/50">
                            <Button onClick={() => onManageEvent(event.id)} className="flex-grow text-sm">
                                Manage Event
                            </Button>
                            <div className="flex gap-2 ml-3">
                                <Button size="sm" variant="secondary" onClick={() => setEditingEvent(event)} className="!p-2.5">
                                    <PencilIcon className="w-4 h-4"/>
                                </Button>
                                <Button size="sm" variant="danger" onClick={() => setDeletingEvent(event)} className="!p-2.5">
                                    <TrashIcon className="w-4 h-4"/>
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {editingEvent && <EventEditorModal event={editingEvent} inventory={inventory} gamificationSettings={gamificationSettings} companyDetails={companyDetails} onClose={() => setEditingEvent(null)} onSave={handleSaveEvent} />}
            
            {deletingEvent && (
                 <Modal isOpen={true} onClose={() => setDeletingEvent(null)} title="Confirm Deletion">
                    <p className="text-gray-300">Are you sure you want to delete the event "{deletingEvent.title}"? This action cannot be undone.</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <Button variant="secondary" onClick={() => setDeletingEvent(null)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDeleteEvent}>Delete</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const PlayersTab: React.FC<{ players: Player[], onPlayerSelect: (id: string) => void, setPlayers: React.Dispatch<React.SetStateAction<Player[]>> }> = ({ players, onPlayerSelect, setPlayers }) => {
    const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
    
    return (
        <div>
            {isCreatingPlayer && <NewPlayerModal onClose={() => setIsCreatingPlayer(false)} players={players} setPlayers={setPlayers} />}
            <div className="flex justify-end mb-4">
                <Button onClick={() => setIsCreatingPlayer(true)}>
                    <PlusIcon className="w-5 h-5 mr-2" />
                    New Player
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map(player => {
                const rank = getRankForPlayer(player);
                return (
                        <div key={player.id} onClick={() => onPlayerSelect(player.id)} className="bg-zinc-800/50 p-4 rounded-lg flex items-center gap-4 cursor-pointer hover:bg-zinc-800 transition-colors border border-transparent hover:border-red-600/50">
                            <img src={player.avatarUrl} alt={player.name} className="w-16 h-16 rounded-full object-cover border-2 border-zinc-700"/>
                            <div>
                                <p className="font-bold text-lg text-white">{player.name} {player.surname}</p>
                                <p className="text-sm text-gray-400">"{player.callsign}"</p>
                                <div className="flex items-center mt-1">
                                    <img src={rank.iconUrl} alt={rank.name} className="w-5 h-5 mr-1.5" />
                                    <span className="text-xs font-semibold text-red-400">{rank.name}</span>
                                </div>
                            </div>
                        </div>
                )
                })}
            </div>
        </div>
    )
}

const RanksTab: React.FC<Pick<AdminDashboardProps, 'ranks' | 'setRanks' | 'badges'> & { setEditingBadge: (badge: Badge | {}) => void; }> = ({ ranks, setRanks, badges, setEditingBadge }) => {
    const [ranksData, setRanksData] = useState<Rank[]>(ranks);
    const [isDirty, setIsDirty] = useState(false);
    const [deletingRank, setDeletingRank] = useState<({ rank: Rank, index: number }) | null>(null);

    useEffect(() => {
        setRanksData(ranks);
    }, [ranks]);

    useEffect(() => {
        setIsDirty(JSON.stringify(ranks) !== JSON.stringify(ranksData));
    }, [ranks, ranksData]);

    const handleRankChange = (index: number, field: keyof Rank, value: any) => {
        const newRanks = [...ranksData];
        newRanks[index] = { ...newRanks[index], [field]: value };
        setRanksData(newRanks);
    };

    const handleUnlockChange = (rankIndex: number, unlockIndex: number, value: string) => {
        const newRanks = [...ranksData];
        const currentUnlocks = newRanks[rankIndex]?.unlocks;
        const newUnlocks = Array.isArray(currentUnlocks) ? [...currentUnlocks] : [];
        newUnlocks[unlockIndex] = value;
        // FIX: Corrected typo from `newRranks` to `newRanks`.
        newRanks[rankIndex] = { ...newRanks[rankIndex], unlocks: newUnlocks };
        setRanksData(newRanks);
    };

    const handleAddUnlock = (rankIndex: number) => {
        const newRanks = [...ranksData];
        const newUnlocks = [...(newRanks[rankIndex]?.unlocks || []), ''];
        newRanks[rankIndex] = { ...newRanks[rankIndex], unlocks: newUnlocks };
        setRanksData(newRanks);
    };

    const handleRemoveUnlock = (rankIndex: number, unlockIndex: number) => {
        const newRanks = [...ranksData];
        const newUnlocks = (newRanks[rankIndex]?.unlocks || []).filter((_, i) => i !== unlockIndex);
        newRanks[rankIndex] = { ...newRanks[rankIndex], unlocks: newUnlocks };
        setRanksData(newRanks);
    };

    const handleAddNewRank = () => {
        const highestXp = ranksData.length > 0 ? Math.max(...ranksData.map(r => r.minXp)) : -100;
        const newRank: Rank = {
            name: 'New Rank',
            tier: 'New Tier',
            minXp: highestXp + 100,
            iconUrl: '',
            unlocks: [],
        };
        setRanksData([...ranksData, newRank]);
    };

    const handleDeleteRank = () => {
        if (deletingRank === null) return;
        setRanksData(ranksData.filter((_, i) => i !== deletingRank.index));
        setDeletingRank(null);
    };

    const handleSave = () => {
        const sorted = [...ranksData].sort((a, b) => a.minXp - b.minXp);
        setRanks(sorted);
        setIsDirty(false);
    };

    const ranksByTier = ranksData.reduce((acc: Record<string, Rank[]>, rank) => {
        if (!acc[rank.tier]) {
            acc[rank.tier] = [];
        }
        acc[rank.tier].push(rank);
        return acc;
    }, {} as Record<string, Rank[]>);

    return (
        <div>
            {deletingRank && (
                 <Modal isOpen={true} onClose={() => setDeletingRank(null)} title="Confirm Deletion">
                    <p className="text-gray-300">Are you sure you want to delete the rank "{deletingRank.rank.name}"? This action cannot be undone.</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <Button variant="secondary" onClick={() => setDeletingRank(null)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDeleteRank}>Delete Rank</Button>
                    </div>
                </Modal>
            )}

            <DashboardCard title="Rank Structure" icon={<ShieldCheckIcon className="w-6 h-6" />} titleAddon={<InfoTooltip text="Define the player progression system. Ranks are awarded based on accumulated Rank Points (XP)." />}>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {Object.entries(ranksByTier).map(([tier, ranksInTier]) => (
                        <div key={tier}>
                            <h4 className="font-bold text-red-400 text-lg mb-2">{tier}</h4>
                            <div className="space-y-4">
                            {ranksInTier.map(rank => {
                                const originalIndex = ranksData.findIndex(r => r.name === rank.name && r.tier === rank.tier);
                                return (
                                <div key={originalIndex} className={`relative bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/50`}>
                                    <div className="absolute top-3 right-3">
                                        <Button size="sm" variant="danger" onClick={() => setDeletingRank({rank, index: originalIndex})}>
                                            <TrashIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                                        <div className="space-y-4 md:col-span-1 flex flex-col items-center md:items-start text-center md:text-left">
                                             <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center p-2 border-4 border-zinc-700">
                                                {rank.iconUrl ? <img src={rank.iconUrl} alt={rank.name} className="w-full h-full object-contain" /> : <ShieldCheckIcon className="w-8 h-8 text-zinc-600"/>}
                                            </div>
                                             <ImageUpload onUpload={base64 => handleRankChange(originalIndex, 'iconUrl', base64)} accept="image/*"/>
                                        </div>
                                        <div className="space-y-4 md:col-span-2">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Input label="Rank Name" value={rank.name} onChange={e => handleRankChange(originalIndex, 'name', e.target.value)} />
                                                <Input label="Minimum RP Required" type="number" value={rank.minXp} onChange={e => handleRankChange(originalIndex, 'minXp', parseInt(e.target.value) || 0)} tooltip="The amount of Rank Points (XP) a player must have to achieve this rank."/>
                                            </div>
                                            <Input label="Tier Name" value={rank.tier} onChange={e => handleRankChange(originalIndex, 'tier', e.target.value)} />
                                            <div>
                                                <div className="flex items-center mb-1.5">
                                                    <label className="block text-sm font-medium text-gray-400">Unlockable Perks</label>
                                                </div>
                                                <div className="space-y-2">
                                                    {(rank.unlocks || []).map((unlock, unlockIndex) => (
                                                         <div key={unlockIndex} className="flex items-center gap-2">
                                                            <Input value={unlock} onChange={e => handleUnlockChange(originalIndex, unlockIndex, e.target.value)} placeholder="e.g., New skin, 5% discount"/>
                                                            <Button size="sm" variant="danger" onClick={() => handleRemoveUnlock(originalIndex, unlockIndex)} className="!p-2">
                                                                <XIcon className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button size="sm" variant="secondary" className="mt-2 w-full" onClick={() => handleAddUnlock(originalIndex)}>
                                                    <PlusIcon className="w-4 h-4 mr-2"/> Add Perk
                                                </Button>
                                            </div>
                                             <div>
                                                <div className="flex items-center mb-1.5">
                                                    <label className="block text-sm font-medium text-gray-400">Badge Awarded</label>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <select value={rank.badgeAwarded || ''} onChange={e => handleRankChange(originalIndex, 'badgeAwarded', e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
                                                        <option value="">None</option>
                                                        {badges.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                    </select>
                                                    <Button size="sm" variant="secondary" onClick={() => setEditingBadge({})} className="!p-2.5">
                                                        <PlusIcon className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                )
                            })}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-zinc-800 flex items-center justify-between gap-4">
                    <Button variant="secondary" onClick={handleAddNewRank}>
                        <PlusIcon className="w-5 h-5 mr-2"/>
                        Add New Rank Tier
                    </Button>
                    <Button className="flex-grow" onClick={handleSave} disabled={!isDirty}>
                        {isDirty ? 'Save Rank Structure' : 'All Changes Saved'}
                    </Button>
                </div>
            </DashboardCard>
        </div>
    );
};

const BadgeEditorModal: React.FC<{badge: Badge | {}, onClose: () => void, onSave: (b: Badge) => void}> = ({badge, onClose, onSave}) => {
    const [formData, setFormData] = useState({
        name: 'name' in badge ? badge.name : '',
        description: 'description' in badge ? badge.description : '',
        criteria_type: 'criteria' in badge ? badge.criteria.type : 'kills',
        criteria_value: 'criteria' in badge ? badge.criteria.value : '',
    });
    const [badgeIcon, setBadgeIcon] = useState('iconUrl' in badge ? badge.iconUrl : '');

    const handleSaveClick = () => {
        const newBadgeData = {
            name: formData.name,
            description: formData.description,
            iconUrl: badgeIcon,
            criteria: {
                type: formData.criteria_type as Badge['criteria']['type'],
                value: isNaN(Number(formData.criteria_value)) ? formData.criteria_value : Number(formData.criteria_value)
            }
        };
        const finalBadge = Object.assign({}, badge, newBadgeData) as Badge;
        onSave(finalBadge);
    }

    return (
        <Modal isOpen={true} onClose={onClose} title={'id' in badge ? 'Edit Badge' : 'Create Badge'}>
            <div className="space-y-4">
                <Input label="Badge Name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))}/>
                <Input label="Description" value={formData.description} onChange={e => setFormData(f => ({...f, description: e.target.value}))}/>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <div className="flex items-center mb-1.5">
                            <label className="block text-sm font-medium text-gray-400">Criteria Type</label>
                            <div className="ml-1.5"><InfoTooltip text="The condition a player must meet to earn this badge."/></div>
                        </div>
                        <select value={formData.criteria_type} onChange={e => setFormData(f => ({...f, criteria_type: e.target.value as Badge['criteria']['type']}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option value="kills">Kills</option>
                            <option value="headshots">Headshots</option>
                            <option value="gamesPlayed">Games Played</option>
                            <option value="rank">Rank</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    <Input label="Criteria Value" value={formData.criteria_value} onChange={e => setFormData(f => ({...f, criteria_value: e.target.value}))} placeholder="e.g., 50 or Gold" tooltip="For 'Kills', 'Headshots', or 'Games Played', enter a number. For 'Rank', enter the rank name (e.g., Gold). For 'Custom', this can be left blank as it's manually awarded."/>
                </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Badge Icon</label>
                    <ImageUpload onUpload={setBadgeIcon} accept="image/*" />
                    {badgeIcon && <img src={badgeIcon} alt="Icon Preview" className="w-16 h-16 mt-2 rounded-full object-cover"/>}
                </div>
            </div>
            <div className="mt-6">
                <Button className="w-full" onClick={handleSaveClick}>Save Badge</Button>
            </div>
        </Modal>
    )
}

const BadgesTab: React.FC<Pick<AdminDashboardProps, 'badges'> & { setEditingBadge: (badge: Badge | {}) => void; onDeleteBadge: (id: string) => void; }> = ({ badges, setEditingBadge, onDeleteBadge }) => {
    return (
        <div>
            <DashboardCard title="Manage Standard Badges" icon={<TrophyIcon className="w-6 h-6"/>} titleAddon={<InfoTooltip text="Create and manage achievements that players can earn by meeting specific criteria in games or by reaching new ranks." />}>
                <div className="p-4">
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setEditingBadge({})}>
                            <PlusIcon className="w-5 h-5 mr-2" />
                            New Badge
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {badges.map(badge => (
                            <div key={badge.id} className="bg-zinc-800/50 p-4 rounded-lg flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <img src={badge.iconUrl} alt={badge.name} className="w-16 h-16 rounded-full object-cover"/>
                                    <div>
                                        <p className="font-bold text-lg text-white">{badge.name}</p>
                                        <p className="text-sm text-gray-400 mb-1">{badge.description}</p>
                                        <BadgePill color="blue">{badge.criteria.type}: {badge.criteria.value}</BadgePill>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                    <Button size="sm" variant="secondary" onClick={() => setEditingBadge(badge)}><PencilIcon className="w-4 h-4"/></Button>
                                    <Button size="sm" variant="danger" onClick={() => onDeleteBadge(badge.id)}><TrashIcon className="w-4 h-4"/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
}

const LegendaryBadgesTab: React.FC<{
    legendaryBadges: LegendaryBadge[],
    setLegendaryBadges: React.Dispatch<React.SetStateAction<LegendaryBadge[]>>,
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
}> = ({ legendaryBadges, setLegendaryBadges, setPlayers }) => {
    const [editingLegendaryBadge, setEditingLegendaryBadge] = useState<LegendaryBadge | {} | null>(null);

    const handleSave = (badgeData: LegendaryBadge) => {
        if ('id' in badgeData && badgeData.id) {
            setLegendaryBadges(bs => bs.map(b => b.id === badgeData.id ? badgeData : b));
        } else {
            setLegendaryBadges(bs => [...bs, { ...badgeData, id: `leg${Date.now()}` }]);
        }
        setEditingLegendaryBadge(null);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this legendary badge? This will revoke it from all players who have received it.')) {
            setLegendaryBadges(bs => bs.filter(b => b.id !== id));
            // Also remove from players
            setPlayers(ps => ps.map(p => ({
                ...p,
                legendaryBadges: p.legendaryBadges.filter(b => b.id !== id)
            })));
        }
    };

    const LegendaryBadgeEditorModal: React.FC<{badge: LegendaryBadge | {}, onClose: () => void, onSave: (b: LegendaryBadge) => void}> = ({badge, onClose, onSave}) => {
        const [formData, setFormData] = useState({
            name: 'name' in badge ? badge.name : '',
            description: 'description' in badge ? badge.description : '',
            howToObtain: 'howToObtain' in badge ? badge.howToObtain : '',
        });
        const [badgeIcon, setBadgeIcon] = useState('iconUrl' in badge ? badge.iconUrl : '');

        const handleSaveClick = () => {
            const finalBadge = {
                ...badge,
                name: formData.name,
                description: formData.description,
                howToObtain: formData.howToObtain,
                iconUrl: badgeIcon
            } as LegendaryBadge;
            onSave(finalBadge);
        };

        return (
            <Modal isOpen={true} onClose={onClose} title={'id' in badge ? 'Edit Legendary Badge' : 'Create Legendary Badge'}>
                <div className="space-y-4">
                    <Input label="Badge Name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))}/>
                    <Input label="Description" value={formData.description} onChange={e => setFormData(f => ({...f, description: e.target.value}))}/>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">How to Obtain</label>
                        <textarea value={formData.howToObtain} onChange={e => setFormData(f => ({...f, howToObtain: e.target.value}))} rows={2} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Badge Icon</label>
                        <ImageUpload onUpload={setBadgeIcon} accept="image/*" />
                        {badgeIcon && <img src={badgeIcon} alt="Icon Preview" className="w-16 h-16 mt-2 rounded-full object-cover"/>}
                    </div>
                </div>
                <div className="mt-6">
                    <Button className="w-full" onClick={handleSaveClick}>Save Badge</Button>
                </div>
            </Modal>
        )
    };

    return (
        <>
            {editingLegendaryBadge && <LegendaryBadgeEditorModal badge={editingLegendaryBadge} onClose={() => setEditingLegendaryBadge(null)} onSave={handleSave} />}
            <DashboardCard title="Manage Legendary Badges" icon={<TrophyIcon className="w-6 h-6 text-amber-400" />} titleAddon={<InfoTooltip text="Create and manage prestigious awards that can be manually gifted to players for exceptional performance or sportsmanship." />}>
                <div className="p-4">
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setEditingLegendaryBadge({})}>
                            <PlusIcon className="w-5 h-5 mr-2" />
                            New Legendary Badge
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {legendaryBadges.map(badge => (
                            <div key={badge.id} className="bg-zinc-800/50 p-4 rounded-lg flex items-start justify-between gap-4 border border-amber-500/20">
                                <div className="flex items-start gap-4 flex-grow">
                                    <img src={badge.iconUrl} alt={badge.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0"/>
                                    <div className="flex-grow">
                                        <p className="font-bold text-lg text-amber-300">{badge.name}</p>
                                        <p className="text-sm text-gray-300 mb-2">{badge.description}</p>
                                        <div className="w-full pt-2 border-t border-zinc-700/50">
                                            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase">How to Obtain</p>
                                            <p className="text-xs text-gray-300">{badge.howToObtain}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 flex-shrink-0">
                                    <Button size="sm" variant="secondary" onClick={() => setEditingLegendaryBadge(badge)}><PencilIcon className="w-4 h-4"/></Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDelete(badge.id)}><TrashIcon className="w-4 h-4"/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DashboardCard>
        </>
    );
}


const VouchersAndRafflesTab: React.FC<Pick<AdminDashboardProps, 'vouchers' | 'setVouchers' | 'players' | 'events' | 'raffles' | 'setRaffles'>> = ({ vouchers, setVouchers, players, events, raffles, setRaffles }) => {
    const [isEditingVoucher, setIsEditingVoucher] = useState<Voucher | {} | null>(null);
    const [isEditingRaffle, setIsEditingRaffle] = useState<Raffle | {} | null>(null);
    const [managingRaffle, setManagingRaffle] = useState<Raffle | null>(null);
    
    // --- VOUCHER LOGIC ---
    const handleSaveVoucher = (voucherData: Voucher) => {
        if ('id' in voucherData && voucherData.id) {
            setVouchers(vs => vs.map(v => v.id === voucherData.id ? voucherData : v));
        } else {
            setVouchers(vs => [...vs, { ...voucherData, id: `v${Date.now()}` }]);
        }
        setIsEditingVoucher(null);
    };
    const handleDeleteVoucher = (id: string) => {
        if(confirm('Are you sure you want to delete this voucher?')) {
            setVouchers(vs => vs.filter(v => v.id !== id));
        }
    };

    // --- RAFFLE LOGIC ---
    const handleSaveRaffle = (raffleData: Raffle) => {
        if (raffleData.id) {
            setRaffles(rs => rs.map(r => r.id === raffleData.id ? raffleData : r));
        } else {
            const newRaffle: Raffle = {
                ...raffleData,
                id: `r${Date.now()}`,
                createdAt: new Date().toISOString(),
                status: 'Active',
                tickets: [],
                winners: [],
            };
            setRaffles(rs => [newRaffle, ...rs]);
        }
        setIsEditingRaffle(null);
    };

    const handleUpdateRaffle = (updatedRaffle: Raffle) => {
        setRaffles(rs => rs.map(r => r.id === updatedRaffle.id ? updatedRaffle : r));
        setManagingRaffle(updatedRaffle); // Keep the modal in sync
    };

    const handleDeleteRaffle = (id: string) => {
        if(confirm('Are you sure you want to delete this raffle event and all its tickets? This cannot be undone.')) {
            setRaffles(rs => rs.filter(r => r.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            {isEditingVoucher && <VoucherEditorModal voucher={isEditingVoucher} onClose={() => setIsEditingVoucher(null)} onSave={handleSaveVoucher} players={players}/>}
            {isEditingRaffle && <RaffleEditorModal raffle={isEditingRaffle} onClose={() => setIsEditingRaffle(null)} onSave={handleSaveRaffle} />}
            {managingRaffle && <RaffleManagerModal raffle={managingRaffle} players={players} onClose={() => setManagingRaffle(null)} onUpdateRaffle={handleUpdateRaffle} />}
            
            <DashboardCard title="Raffle Events" icon={<TicketIcon className="w-6 h-6"/>}>
                <div className="p-4">
                     <div className="flex justify-end mb-4">
                        <Button onClick={() => setIsEditingRaffle({})}>
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Create Raffle
                        </Button>
                    </div>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {raffles.length > 0 ? raffles.map(raffle => (
                             <div key={raffle.id} className="bg-zinc-800/50 p-3 rounded-lg flex items-center justify-between gap-4">
                                <div className="flex-grow">
                                    <h4 className="font-bold text-white text-lg">{raffle.name}</h4>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mt-1">
                                        <span>Draw Date: {new Date(raffle.drawDate).toLocaleDateString()}</span>
                                        <span>Prizes: {raffle.prizes.length}</span>
                                        <span>Tickets Sold: {raffle.tickets.length}</span>
                                        <BadgePill color={raffle.status === 'Active' ? 'green' : raffle.status === 'Completed' ? 'blue' : 'amber'}>{raffle.status}</BadgePill>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => setManagingRaffle(raffle)}>Manage</Button>
                                    <Button size="sm" variant="secondary" onClick={() => setIsEditingRaffle(raffle)}><PencilIcon className="w-4 h-4"/></Button>
                                    <Button size="sm" variant="danger" onClick={() => handleDeleteRaffle(raffle.id)}><TrashIcon className="w-4 h-4"/></Button>
                                </div>
                             </div>
                        )) : <p className="text-gray-500 text-center py-6">No raffle events created yet.</p>}
                    </div>
                </div>
            </DashboardCard>

            <DashboardCard title="Manage Vouchers" icon={<TicketIcon className="w-6 h-6"/>} titleAddon={<InfoTooltip text="Create discount or free entry vouchers for players. Vouchers can be universal or assigned to a specific player." />}>
                <div className="p-4">
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setIsEditingVoucher({})}>
                            <PlusIcon className="w-5 h-5 mr-2" />
                            New Voucher
                        </Button>
                    </div>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                        {vouchers.map(v => {
                             const assignedPlayer = v.assignedToPlayerId ? players.find(p => p.id === v.assignedToPlayerId) : null;
                            return (
                                <div key={v.id} className="bg-zinc-800/50 p-3 rounded-lg flex items-center justify-between gap-4">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <p className="font-mono text-lg text-red-400 bg-zinc-900 px-3 py-1 rounded-md">{v.code}</p>
                                            <BadgePill color={v.status === 'Active' ? 'green' : 'red'}>{v.status}</BadgePill>
                                        </div>
                                        <p className="font-semibold text-white">{v.description}</p>
                                        <p className="text-sm text-gray-300">Discount: {v.type === 'fixed' ? `R${v.discount}` : `${v.discount}%`}</p>
                                        <div className="text-xs text-gray-400 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                                            <span>Uses: {v.redemptions.length} / {v.usageLimit || '∞'}</span>
                                            {v.perUserLimit && <span>User Limit: {v.perUserLimit}</span>}
                                            {assignedPlayer && <span>Assigned to: {assignedPlayer.name}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => setIsEditingVoucher(v)}><PencilIcon className="w-4 h-4"/></Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDeleteVoucher(v.id)}><TrashIcon className="w-4 h-4"/></Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
};

const VoucherEditorModal: React.FC<{voucher: Voucher | {}, onClose: () => void, onSave: (v: Voucher) => void, players: Player[]}> = ({voucher, onClose, onSave, players}) => {
    const [formData, setFormData] = useState({
        code: 'code' in voucher ? voucher.code : '',
        description: 'description' in voucher ? voucher.description : '',
        discount: 'discount' in voucher ? voucher.discount : 0,
        type: 'type' in voucher ? voucher.type : 'fixed',
        assignedToPlayerId: 'assignedToPlayerId' in voucher ? voucher.assignedToPlayerId : '',
        usageLimit: 'usageLimit' in voucher ? voucher.usageLimit : '',
        perUserLimit: 'perUserLimit' in voucher ? voucher.perUserLimit : '',
    });

    const handleSaveClick = () => {
         const finalVoucher = {
             ...voucher,
             ...formData,
             usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
             perUserLimit: formData.perUserLimit ? Number(formData.perUserLimit) : undefined,
             status: 'Active',
             redemptions: 'redemptions' in voucher ? voucher.redemptions : [],
         } as Voucher;
         onSave(finalVoucher);
    }

    return (
        <Modal isOpen={true} onClose={onClose} title={'id' in voucher ? 'Edit Voucher' : 'Create Voucher'}>
            <div className="space-y-4">
                <Input label="Voucher Code" value={formData.code} onChange={e => setFormData(f => ({...f, code: e.target.value.toUpperCase()}))}/>
                <Input label="Description" value={formData.description} onChange={e => setFormData(f => ({...f, description: e.target.value}))}/>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Discount Value" type="number" value={formData.discount} onChange={e => setFormData(f => ({...f, discount: Number(e.target.value)}))} />
                     <div>
                       <label className="block text-sm font-medium text-gray-400 mb-1.5">Discount Type</label>
                        <select value={formData.type} onChange={e => setFormData(f => ({...f, type: e.target.value as Voucher['type']}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option value="fixed">Fixed (R)</option>
                            <option value="percentage">Percentage (%)</option>
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Input label="Total Usage Limit" type="number" placeholder="Unlimited" value={formData.usageLimit} onChange={e => setFormData(f => ({...f, usageLimit: e.target.value}))} tooltip="Total times this voucher can be used by anyone."/>
                    <Input label="Per User Limit" type="number" placeholder="Unlimited" value={formData.perUserLimit} onChange={e => setFormData(f => ({...f, perUserLimit: e.target.value}))} tooltip="How many times a single player can use this voucher."/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Assign to Player (Optional)</label>
                    <select value={formData.assignedToPlayerId} onChange={e => setFormData(f => ({...f, assignedToPlayerId: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="">All Players</option>
                        {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>
            <div className="mt-6">
                <Button className="w-full" onClick={handleSaveClick}>Save Voucher</Button>
            </div>
        </Modal>
    )
}

const RaffleEditorModal: React.FC<{raffle: Raffle | {}, onClose: () => void, onSave: (r: Raffle) => void}> = ({raffle, onClose, onSave}) => {
    const [formData, setFormData] = useState({
        name: 'name' in raffle ? raffle.name : '',
        location: 'location' in raffle ? raffle.location : '',
        contactPhone: 'contactPhone' in raffle ? raffle.contactPhone : '',
        drawDate: 'drawDate' in raffle ? new Date(raffle.drawDate).toISOString().split('T')[0] : '',
    });
    const [prizes, setPrizes] = useState<Omit<Prize, 'id' | 'place'>[]>(
      'prizes' in raffle ? raffle.prizes.sort((a,b) => a.place - b.place) : [{name: ''}]
    );

    const handlePrizeChange = (index: number, value: string) => {
        const newPrizes = [...prizes];
        newPrizes[index] = { name: value };
        setPrizes(newPrizes);
    };

    const addPrize = () => prizes.length < 3 && setPrizes([...prizes, {name: ''}]);
    const removePrize = (index: number) => setPrizes(prizes.filter((_, i) => i !== index));

    const handleSaveClick = () => {
        const finalPrizes: Prize[] = prizes
            .filter(p => p.name.trim() !== '')
            .map((p, i) => ({
                id: `p${Date.now()}${i}`,
                name: p.name,
                place: (i + 1) as Prize['place']
            }));

        if (finalPrizes.length === 0) {
            alert('Please add at least one prize.');
            return;
        }

        const finalRaffle = {
            ...raffle,
            ...formData,
            drawDate: new Date(formData.drawDate).toISOString(),
            prizes: finalPrizes,
        } as Raffle;
        onSave(finalRaffle);
    }

    return (
        <Modal isOpen={true} onClose={onClose} title={'id' in raffle ? 'Edit Raffle Event' : 'Create Raffle Event'}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <Input label="Raffle Name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))}/>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Draw Date" type="date" value={formData.drawDate} onChange={e => setFormData(f => ({...f, drawDate: e.target.value}))}/>
                    <Input label="Location" value={formData.location} onChange={e => setFormData(f => ({...f, location: e.target.value}))}/>
                </div>
                 <Input label="Contact Phone" type="tel" value={formData.contactPhone} onChange={e => setFormData(f => ({...f, contactPhone: e.target.value}))}/>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Prizes (Max 3)</label>
                    <div className="space-y-2">
                        {prizes.map((prize, index) => (
                             <div key={index} className="flex items-center gap-2">
                                <span className="font-bold text-gray-400">{index+1}.</span>
                                <Input value={prize.name} onChange={e => handlePrizeChange(index, e.target.value)} placeholder={`Prize for ${index+1}${index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'} place`}/>
                                <Button size="sm" variant="danger" onClick={() => removePrize(index)} disabled={prizes.length === 1}><TrashIcon className="w-4 h-4"/></Button>
                            </div>
                        ))}
                    </div>
                     {prizes.length < 3 && <Button size="sm" variant="secondary" onClick={addPrize} className="mt-2 w-full"><PlusIcon className="w-4 h-4 mr-1"/>Add Prize</Button>}
                 </div>
            </div>
             <div className="mt-6">
                <Button className="w-full" onClick={handleSaveClick}>Save Raffle</Button>
            </div>
        </Modal>
    )
};

const RaffleManagerModal: React.FC<{raffle: Raffle, players: Player[], onClose: () => void, onUpdateRaffle: (r: Raffle) => void}> = ({raffle, players, onClose, onUpdateRaffle}) => {
    const [selectedPlayer, setSelectedPlayer] = useState('');
    const [winnerModal, setWinnerModal] = useState<boolean>(false);

    const handleSellTicket = (paymentStatus: PaymentStatus) => {
        if (!selectedPlayer) {
            alert("Please select a player.");
            return;
        }
        const safeName = raffle.name.slice(0, 10).replace(/\s+/g, '').toUpperCase();
        const newTicket: RaffleTicket = {
            id: `t${raffle.id}${raffle.tickets.length + 1}`,
            code: `RFL-${safeName}-${String(raffle.tickets.length + 1).padStart(3, '0')}`,
            playerId: selectedPlayer,
            purchaseDate: new Date().toISOString(),
            paymentStatus,
        };
        const updatedRaffle = {
            ...raffle,
            tickets: [...raffle.tickets, newTicket]
        };
        onUpdateRaffle(updatedRaffle);
        setSelectedPlayer('');
    };

    const handleDrawWinners = () => {
        if (!confirm(`This will randomly draw ${raffle.prizes.length} winner(s) and finalize the raffle. This action cannot be undone. Proceed?`)) return;

        const soldTickets = [...raffle.tickets];
        const uniquePlayerIds = [...new Set(soldTickets.map(t => t.playerId))];
        
        if (uniquePlayerIds.length === 0) {
            alert("No tickets have been sold yet. Cannot draw a winner.");
            return;
        }

        const winners: Raffle['winners'] = [];
        let eligibleTickets = [...soldTickets];

        for (const prize of raffle.prizes.sort((a,b) => a.place - b.place)) {
            if (eligibleTickets.length === 0) break; // No more tickets to draw from

            const winnerTicketIndex = Math.floor(Math.random() * eligibleTickets.length);
            const winnerTicket = eligibleTickets[winnerTicketIndex];
            
            winners.push({
                prizeId: prize.id,
                ticketId: winnerTicket.id,
                playerId: winnerTicket.playerId,
            });

            // A player can only win one prize. Remove all their tickets from future draws.
            eligibleTickets = eligibleTickets.filter(t => t.playerId !== winnerTicket.playerId);
        }

        const updatedRaffle = {
            ...raffle,
            status: 'Completed' as Raffle['status'],
            winners: winners,
        };
        onUpdateRaffle(updatedRaffle);
        setWinnerModal(true);
    }
    
    return (
        <Modal isOpen={true} onClose={onClose} title={`Manage: ${raffle.name}`}>
             {winnerModal && (
                <Modal isOpen={true} onClose={() => setWinnerModal(false)} title="Raffle Results">
                    <div className="text-center space-y-4">
                        <TrophyIcon className="w-16 h-16 text-amber-400 mx-auto animate-pulse" />
                        <h3 className="text-2xl font-bold text-white">Winners Announced!</h3>
                        <div className="space-y-2">
                             {raffle.prizes.sort((a, b) => a.place - b.place).map(prize => {
                                const winner = raffle.winners.find(w => w.prizeId === prize.id);
                                const winnerPlayer = winner ? players.find(p => p.id === winner.playerId) : null;
                                return (
                                    <div key={prize.id} className="bg-zinc-800 p-2 rounded-md">
                                        <p className="text-amber-300 font-semibold">{prize.place}st Place: {prize.name}</p>
                                        <p className="text-white text-lg">{winnerPlayer ? winnerPlayer.name : 'Not Drawn'}</p>
                                    </div>
                                )
                            })}
                        </div>
                        <Button onClick={() => setWinnerModal(false)} className="mt-4">Close</Button>
                    </div>
                </Modal>
            )}

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {raffle.status !== 'Completed' && (
                    <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                        <h4 className="font-bold text-red-400 mb-3">Ticket Seller</h4>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <select value={selectedPlayer} onChange={e => setSelectedPlayer(e.target.value)} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                                <option value="">Select a player...</option>
                                {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.callsign})</option>)}
                            </select>
                            <Button onClick={() => handleSellTicket('Paid (Cash)')} disabled={!selectedPlayer} className="flex-shrink-0">Paid Cash</Button>
                            <Button onClick={() => handleSellTicket('Paid (Card)')} disabled={!selectedPlayer} className="flex-shrink-0">Paid Card</Button>
                        </div>
                    </div>
                )}
                
                 <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                     <h4 className="font-bold text-red-400 mb-3">Sold Tickets ({raffle.tickets.length})</h4>
                     <div className="space-y-2 max-h-48 overflow-y-auto">
                        {raffle.tickets.map(ticket => {
                            const player = players.find(p => p.id === ticket.playerId);
                            return (
                                <div key={ticket.id} className="grid grid-cols-3 items-center bg-zinc-900/50 p-2 rounded-md text-sm">
                                    <span className="font-mono text-red-300">{ticket.code}</span>
                                    <span className="text-gray-200">{player?.name || 'Unknown Player'}</span>
                                    <BadgePill color={ticket.paymentStatus.startsWith('Paid') ? 'green' : 'red'} className="justify-self-end">{ticket.paymentStatus}</BadgePill>
                                </div>
                            )
                        })}
                     </div>
                </div>

                {raffle.status === 'Completed' && (
                    <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700">
                         <h4 className="font-bold text-amber-400 mb-3 text-center text-lg">Raffle Winners</h4>
                         <div className="space-y-2">
                             {raffle.prizes.sort((a, b) => a.place - b.place).map(prize => {
                                const winner = raffle.winners.find(w => w.prizeId === prize.id);
                                const winnerPlayer = winner ? players.find(p => p.id === winner.playerId) : null;
                                return (
                                    <div key={prize.id} className="flex justify-between items-center text-sm bg-zinc-900/50 p-2 rounded-md">
                                        <p className="font-semibold text-amber-300">{prize.place}. {prize.name}</p>
                                        <p className="text-gray-200 font-bold text-base">{winnerPlayer ? winnerPlayer.name : 'Not Drawn'}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
             {raffle.status !== 'Completed' && (
                <div className="mt-6">
                    <Button variant="danger" className="w-full" onClick={handleDrawWinners} disabled={raffle.tickets.length === 0}>
                       Run Raffle & Draw Winners
                    </Button>
                </div>
            )}
        </Modal>
    )
}

const SponsorsTab: React.FC<Pick<AdminDashboardProps, 'sponsors' | 'setSponsors'>> = ({ sponsors, setSponsors }) => {
    const [isEditing, setIsEditing] = useState<Sponsor | {} | null>(null);

    const handleSave = (sponsorData: Sponsor) => {
        if ('id' in sponsorData && sponsorData.id) {
            setSponsors(ss => ss.map(s => s.id === sponsorData.id ? sponsorData : s));
        } else {
            setSponsors(ss => [...ss, { ...sponsorData, id: `s${Date.now()}` }]);
        }
        setIsEditing(null);
    };

     const handleDelete = (id: string) => {
        if(confirm('Are you sure you want to delete this sponsor?')) {
            setSponsors(ss => ss.filter(s => s.id !== id));
        }
    };

    const SponsorEditorModal: React.FC<{sponsor: Sponsor | {}, onClose: () => void, onSave: (s: Sponsor) => void}> = ({sponsor, onClose, onSave}) => {
        const [formData, setFormData] = useState({
            name: 'name' in sponsor ? sponsor.name : '',
            email: 'email' in sponsor ? sponsor.email : '',
            phone: 'phone' in sponsor ? sponsor.phone : '',
            website: 'website' in sponsor ? sponsor.website : '',
        });
        const [logo, setLogo] = useState('logoUrl' in sponsor ? sponsor.logoUrl : '');

        const handleSaveClick = () => {
            const finalSponsor = Object.assign({}, sponsor, { ...formData, logoUrl: logo }) as Sponsor;
            onSave(finalSponsor);
        }

        return (
            <Modal isOpen={true} onClose={onClose} title={'id' in sponsor ? 'Edit Sponsor' : 'Add Sponsor'}>
                <div className="space-y-4">
                    <Input label="Sponsor Name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))}/>
                    <Input label="Website" value={formData.website} onChange={e => setFormData(f => ({...f, website: e.target.value}))} placeholder="https://..."/>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Email" type="email" value={formData.email} onChange={e => setFormData(f => ({...f, email: e.target.value}))}/>
                        <Input label="Phone" type="tel" value={formData.phone} onChange={e => setFormData(f => ({...f, phone: e.target.value}))}/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Sponsor Logo</label>
                        <ImageUpload onUpload={setLogo} accept="image/*" />
                        {logo && <img src={logo} alt="Logo Preview" className="h-16 mt-2 rounded-md bg-white p-1"/>}
                    </div>
                </div>
                 <div className="mt-6">
                    <Button className="w-full" onClick={handleSaveClick}>Save Sponsor</Button>
                </div>
            </Modal>
        )
    };
    
    return (
        <div>
            {isEditing && <SponsorEditorModal sponsor={isEditing} onClose={() => setIsEditing(null)} onSave={handleSave} />}
            <DashboardCard title="Manage Sponsors" icon={<SparklesIcon className="w-6 h-6"/>}>
                 <div className="p-4">
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setIsEditing({})}>
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Add Sponsor
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sponsors.map(s => (
                            <div key={s.id} className="bg-zinc-800/50 p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start gap-4">
                                        <img src={s.logoUrl} alt={s.name} className="h-16 rounded-md bg-white p-1" />
                                        <div>
                                            <h4 className="font-bold text-lg text-white">{s.name}</h4>
                                            {s.website && <a href={s.website} target="_blank" rel="noopener noreferrer" className="text-sm text-red-400 hover:underline flex items-center gap-1.5"><GlobeAltIcon className="w-4 h-4"/> Website</a>}
                                            {s.email && <p className="text-sm text-gray-300 flex items-center gap-1.5"><AtSymbolIcon className="w-4 h-4"/> {s.email}</p>}
                                            {s.phone && <p className="text-sm text-gray-300 flex items-center gap-1.5"><PhoneIcon className="w-4 h-4"/> {s.phone}</p>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        <Button size="sm" variant="secondary" onClick={() => setIsEditing(s)}><PencilIcon className="w-4 h-4"/></Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDelete(s.id)}><TrashIcon className="w-4 h-4"/></Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DashboardCard>
        </div>
    )
}

const InventoryTab: React.FC<Pick<AdminDashboardProps, 'inventory' | 'setInventory' | 'suppliers'>> = ({ inventory, setInventory, suppliers }) => {
    const [isEditing, setIsEditing] = useState<InventoryItem | {} | null>(null);
    const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
    const [activeView, setActiveView] = useState<'rental' | 'retail'>('rental');

    const handleSave = (itemData: InventoryItem) => {
        if ('id' in itemData && itemData.id) {
            setInventory(inv => inv.map(i => i.id === itemData.id ? itemData : i));
        } else {
            setInventory(inv => [...inv, { ...itemData, id: `inv${Date.now()}` }]);
        }
        setIsEditing(null);
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        setInventory(inv => inv.filter(i => i.id !== deletingItem.id));
        setDeletingItem(null);
    };

    const displayedInventory = inventory.filter(item => 
        activeView === 'rental' ? item.isRental : !item.isRental
    );
    
    const conditionColors: Record<InventoryItem['condition'], 'green' | 'amber' | 'red'> = {
        'New': 'green',
        'Used': 'amber',
        'Needs Repair': 'red'
    };

    const InventoryEditorModal: React.FC<{ item: InventoryItem | {}, onClose: () => void, onSave: (i: InventoryItem) => void }> = ({ item, onClose, onSave }) => {
        const [formData, setFormData] = useState({
            name: 'name' in item ? item.name : '',
            description: 'description' in item ? item.description : '',
            salePrice: 'salePrice' in item ? item.salePrice : 0,
            stock: 'stock' in item ? item.stock : 0,
            isRental: 'isRental' in item ? item.isRental : false,
            category: 'category' in item ? item.category : INVENTORY_CATEGORIES[0],
            condition: 'condition' in item ? item.condition : INVENTORY_CONDITIONS[0],
            purchasePrice: 'purchasePrice' in item ? item.purchasePrice : 0,
            reorderLevel: 'reorderLevel' in item ? item.reorderLevel : 0,
            supplierId: 'supplierId' in item ? item.supplierId : '',
        });

        const handleSaveClick = () => {
            const finalItem = {
                ...item,
                ...formData,
                type: 'type' in item ? item.type : 'Other'
            } as InventoryItem;
            onSave(finalItem);
        };

        return (
            <Modal isOpen={true} onClose={onClose} title={'id' in item ? 'Edit Item' : 'Add Item'}>
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <Input label="Item Name" value={formData.name} onChange={e => setFormData(f => ({...f, name: e.target.value}))}/>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                        <textarea value={formData.description} onChange={e => setFormData(f => ({...f, description: e.target.value}))} rows={2} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Category</label>
                            <select value={formData.category} onChange={e => setFormData(f => ({...f, category: e.target.value as InventoryItem['category']}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                                {INVENTORY_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1.5">Condition</label>
                            <select value={formData.condition} onChange={e => setFormData(f => ({...f, condition: e.target.value as InventoryItem['condition']}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                                {INVENTORY_CONDITIONS.map(con => <option key={con} value={con}>{con}</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <Input label="Stock" type="number" value={formData.stock} onChange={e => setFormData(f => ({...f, stock: Number(e.target.value)}))} />
                        <Input label="Re-order Level" type="number" value={formData.reorderLevel} onChange={e => setFormData(f => ({...f, reorderLevel: Number(e.target.value)}))} tooltip="A notification will be shown when stock falls to this level."/>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <Input label="Sale / Rental Price (R)" type="number" value={formData.salePrice} onChange={e => setFormData(f => ({...f, salePrice: Number(e.target.value)}))} />
                        <Input label="Purchase Price (R)" type="number" value={formData.purchasePrice} onChange={e => setFormData(f => ({...f, purchasePrice: Number(e.target.value)}))} tooltip="The cost per unit to acquire this item." />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Supplier</label>
                        <select value={formData.supplierId} onChange={e => setFormData(f => ({...f, supplierId: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option value="">None</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <label className="flex items-center space-x-3 text-sm text-gray-300">
                        <input
                            type="checkbox"
                            checked={formData.isRental}
                            onChange={e => setFormData(f => ({...f, isRental: e.target.checked}))}
                            className="h-4 w-4 rounded border-gray-600 bg-zinc-700 text-red-500 focus:ring-red-500"
                        />
                        <span>Is this item available for rent?</span>
                    </label>
                </div>
                <div className="mt-6">
                    <Button className="w-full" onClick={handleSaveClick}>Save Item</Button>
                </div>
            </Modal>
        )
    }

    return (
        <div>
            {isEditing && <InventoryEditorModal item={isEditing} onClose={() => setIsEditing(null)} onSave={handleSave} />}
            {deletingItem && (
                 <Modal isOpen={true} onClose={() => setDeletingItem(null)} title="Confirm Deletion">
                    <p className="text-gray-300">Are you sure you want to delete the item "{deletingItem.name}"? This will not affect past financial records but cannot be undone.</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <Button variant="secondary" onClick={() => setDeletingItem(null)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete}>Delete</Button>
                    </div>
                </Modal>
            )}
            <DashboardCard title="Manage Inventory" icon={<ArchiveBoxIcon className="w-6 h-6"/>}>
                <div className="p-4">
                    <div className="flex justify-between mb-4">
                         <div className="flex space-x-1 p-1 bg-zinc-900/80 rounded-lg border border-zinc-700">
                            <Button size="sm" variant={activeView === 'rental' ? 'primary' : 'secondary'} onClick={() => setActiveView('rental')}>Rental Gear</Button>
                            <Button size="sm" variant={activeView === 'retail' ? 'primary' : 'secondary'} onClick={() => setActiveView('retail')}>Retail Items</Button>
                        </div>
                        <Button onClick={() => setIsEditing({isRental: activeView === 'rental'})}>
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Add Item
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
                        {displayedInventory.map(item => (
                            <div key={item.id} className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-white text-base flex-grow pr-2">{item.name}</h4>
                                        <div className="flex-shrink-0">
                                            <p className="font-mono text-xl font-bold text-green-400">R{item.salePrice.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 my-2">
                                        <BadgePill color={conditionColors[item.condition]}>{item.condition}</BadgePill>
                                        <BadgePill color="blue">{item.category}</BadgePill>
                                    </div>
                                    <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                                </div>
                                <div className="flex justify-between items-end mt-3 pt-3 border-t border-zinc-700/50">
                                    <div>
                                        <p className="text-xs text-gray-400">In Stock</p>
                                        <p className={`font-bold text-xl ${item.stock <= (item.reorderLevel || 0) ? 'text-red-400' : 'text-white'}`}>{item.stock}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="secondary" onClick={() => setIsEditing(item)}><PencilIcon className="w-4 h-4"/></Button>
                                        <Button size="sm" variant="danger" onClick={() => setDeletingItem(item)}><TrashIcon className="w-4 h-4"/></Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
};

const GamificationSettingsTab: React.FC<Pick<AdminDashboardProps, 'gamificationSettings' | 'setGamificationSettings'>> = ({ gamificationSettings, setGamificationSettings }) => {
    const [settings, setSettings] = useState<GamificationRule[]>(gamificationSettings);

    const handleSettingChange = (id: string, value: string) => {
        const numericValue = parseInt(value, 10);
        if (!isNaN(numericValue)) {
            setSettings(s => s.map(rule => rule.id === id ? { ...rule, xp: numericValue } : rule));
        }
    };
    const handleSave = () => {
        setGamificationSettings(settings);
        alert('Gamification settings saved.');
    };
    
    return (
        <DashboardCard title="Gamification Settings" icon={<TrophyIcon className="w-6 h-6" />}>
            <div className="p-6 space-y-4">
                {settings.map(rule => (
                    <div key={rule.id} className="grid grid-cols-3 items-center gap-4">
                        <div className="col-span-2">
                            <label className="font-semibold text-gray-200">{rule.name}</label>
                            <p className="text-sm text-gray-400">{rule.description}</p>
                        </div>
                        <Input type="number" value={rule.xp} onChange={e => handleSettingChange(rule.id, e.target.value)} />
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-zinc-800">
                <Button onClick={handleSave} className="w-full">Save Gamification Settings</Button>
            </div>
        </DashboardCard>
    )
}

const SettingsTab: React.FC<Pick<AdminDashboardProps, 'companyDetails' | 'setCompanyDetails' | 'onDeleteAllData' | 'onSeedInitialData' | 'gamificationSettings' | 'setGamificationSettings'>> = ({ companyDetails, setCompanyDetails, onDeleteAllData, onSeedInitialData, gamificationSettings, setGamificationSettings }) => {
    const [details, setDetails] = useState<CompanyDetails>(companyDetails);
    
    const handleDetailChange = (field: keyof Omit<CompanyDetails, 'socialLinks' | 'bankInfo'>, value: string) => {
        setDetails(d => ({ ...d, [field]: value }));
    };
    
    const handleSocialLinkChange = (id: string, field: keyof Omit<SocialLink, 'id'>, value: string) => {
        setDetails(d => ({...d, socialLinks: d.socialLinks.map(link => link.id === id ? {...link, [field]: value} : link)}));
    }

    const handleSaveDetails = () => {
        setCompanyDetails(details);
        alert('Company details saved.');
    };
    
    return (
        <div className="space-y-6">
            <DashboardCard title="Company & App Settings" icon={<BuildingOfficeIcon className="w-6 h-6" />}>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <Input label="Company Name" value={details.name} onChange={e => handleDetailChange('name', e.target.value)} />
                    <Input label="Company Address" value={details.address} onChange={e => handleDetailChange('address', e.target.value)} />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Phone" value={details.phone} onChange={e => handleDetailChange('phone', e.target.value)} />
                        <Input label="Email" value={details.email} onChange={e => handleDetailChange('email', e.target.value)} />
                    </div>
                    <Input label="Website" value={details.website} onChange={e => handleDetailChange('website', e.target.value)} />
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Company Logo</label>
                        <ImageUpload onUpload={url => handleDetailChange('logoUrl', url)} accept="image/*" />
                        {details.logoUrl && <img src={details.logoUrl} className="h-16 mt-2" alt="Logo preview"/>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Login Screen Background (Image or Video)</label>
                        <ImageUpload onUpload={url => handleDetailChange('loginBackgroundUrl', url)} accept="image/*,video/*" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Login Screen Background Audio</label>
                        <ImageUpload onUpload={url => handleDetailChange('loginAudioUrl', url)} accept="audio/*" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Player Dashboard Background</label>
                        <ImageUpload onUpload={url => handleDetailChange('playerDashboardBackgroundUrl', url)} accept="image/*" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Admin Dashboard Background</label>
                        <ImageUpload onUpload={url => handleDetailChange('adminDashboardBackgroundUrl', url)} accept="image/*" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Android APK URL</label>
                        <Input value={details.apkUrl} onChange={e => handleDetailChange('apkUrl', e.target.value)} placeholder="Direct link to APK file for download"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Social Links</label>
                        <div className="space-y-2">
                            {details.socialLinks.map(link => (
                                <div key={link.id} className="grid grid-cols-3 gap-2 items-center">
                                    <Input value={link.name} onChange={e => handleSocialLinkChange(link.id, 'name', e.target.value)} placeholder="e.g. Facebook"/>
                                    <Input value={link.url} onChange={e => handleSocialLinkChange(link.id, 'url', e.target.value)} placeholder="https://..."/>
                                    <ImageUpload onUpload={url => handleSocialLinkChange(link.id, 'iconUrl', url)} accept="image/*" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Fixed Event Rules</label>
                        <textarea value={details.fixedEventRules} onChange={e => handleDetailChange('fixedEventRules', e.target.value)} rows={5} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                </div>
                <div className="p-4 border-t border-zinc-800">
                    <Button onClick={handleSaveDetails} className="w-full">Save App Settings</Button>
                </div>
            </DashboardCard>

            <GamificationSettingsTab gamificationSettings={gamificationSettings} setGamificationSettings={setGamificationSettings} />

            <DashboardCard title="Danger Zone" icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-500"/>} >
                <div className="p-6 space-y-4">
                    <div>
                        <h4 className="font-bold text-red-400">Delete Transactional Data</h4>
                        <p className="text-sm text-gray-400 mb-2">This will permanently delete all players, events, inventory, transactions, etc. System settings like ranks and company details will be preserved. This is irreversible.</p>
                        <Button variant="danger" onClick={onDeleteAllData}>Wipe All Player & Event Data</Button>
                    </div>
                    {USE_FIREBASE && (
                         <div className="pt-4 border-t border-zinc-700">
                             <h4 className="font-bold text-amber-400">Seed Initial Data</h4>
                            <p className="text-sm text-gray-400 mb-2">If you have a fresh Firebase project, this will populate the necessary system settings (Ranks, Badges, etc.). It will not overwrite existing data.</p>
                            <Button variant="secondary" onClick={onSeedInitialData}>Seed Firebase with System Data</Button>
                        </div>
                    )}
                </div>
            </DashboardCard>
        </div>
    );
};


const AboutTab: React.FC = () => {
    return (
        <DashboardCard title="About This Application" icon={<InformationCircleIcon className="w-6 h-6" />}>
            <div className="p-6 space-y-4 text-gray-300">
                <p>This is the <strong>Bosjol Tactical Solutions Admin Dashboard</strong>, a comprehensive management tool for airsoft fields and event organizers.</p>
                <p>Features include:</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Player Management & Stat Tracking</li>
                    <li>Event Creation & Live Game Management</li>
                    <li>Customizable Ranks, Badges, and Gamification</li>
                    <li>Inventory and Rental Management</li>
                    <li>Financial Tracking and Reporting</li>
                </ul>
                <p className="pt-4 border-t border-zinc-700">Built for performance and ease of use, providing admins with complete control over their operations.</p>
            </div>
        </DashboardCard>
    );
}

export const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const [view, setView] = useState<View>('dashboard');
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('Events');
    const [editingBadge, setEditingBadge] = useState<Badge | {} | null>(null);

    const handlePlayerSelect = (id: string) => {
        setSelectedPlayerId(id);
        setView('player_profile');
    };

    const handleManageEvent = (id: string) => {
        setSelectedEventId(id);
        setView('manage_event');
    };

    const handleBackToDashboard = () => {
        setView('dashboard');
        setSelectedPlayerId(null);
        setSelectedEventId(null);
    };
    
    const handleUpdatePlayer = (updatedPlayer: Player) => {
        props.setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    };

    const handleUpdateEvent = (updatedEvent: GameEvent) => {
        props.setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
    };
    
    const handleUpdateVoucher = (updatedVoucher: Voucher) => {
        props.setVouchers(prev => prev.map(v => v.id === updatedVoucher.id ? updatedVoucher : v));
    };

    const handleFinalizeEvent = (finalizedEvent: GameEvent, finalPlayers: Player[], newTransactions: Transaction[]) => {
        props.setEvents(prev => prev.map(e => e.id === finalizedEvent.id ? finalizedEvent : e));
        props.setPlayers(finalPlayers);
        props.setTransactions(prev => [...prev, ...newTransactions]);
        setView('dashboard');
    };

    const handleSaveBadge = (badgeData: Badge) => {
        if ('id' in badgeData && badgeData.id) {
            props.setBadges(bs => bs.map(b => b.id === badgeData.id ? badgeData : b));
        } else {
            props.setBadges(bs => [...bs, { ...badgeData, id: `b${Date.now()}` }]);
        }
        setEditingBadge(null);
    };

     const handleDeleteBadge = (id: string) => {
        if(confirm('Are you sure you want to delete this badge? This will not revoke it from players who have already earned it.')) {
            props.setBadges(bs => bs.filter(b => b.id !== id));
        }
    };

    if (view === 'player_profile' && selectedPlayerId) {
        const player = props.players.find(p => p.id === selectedPlayerId);
        if (player) {
            return <PlayerProfilePage player={player} events={props.events} legendaryBadges={props.legendaryBadges} onBack={handleBackToDashboard} onUpdatePlayer={handleUpdatePlayer} />;
        }
    }

    if (view === 'manage_event' && selectedEventId) {
        const event = props.events.find(e => e.id === selectedEventId);
        if (event) {
            return <ManageEventPage 
                event={event} 
                players={props.players}
                vouchers={props.vouchers}
                inventory={props.inventory}
                gamificationSettings={props.gamificationSettings}
                onBack={handleBackToDashboard} 
                onUpdateEvent={handleUpdateEvent} 
                onUpdateVoucher={handleUpdateVoucher}
                onFinalizeEvent={handleFinalizeEvent}
            />;
        }
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
            {editingBadge && <BadgeEditorModal badge={editingBadge} onClose={() => setEditingBadge(null)} onSave={handleSaveBadge} />}
            
            {activeTab === 'Events' && <EventsTab {...props} onManageEvent={handleManageEvent} />}
            {activeTab === 'Players' && <PlayersTab players={props.players} setPlayers={props.setPlayers} onPlayerSelect={handlePlayerSelect} />}
            {activeTab === 'Progression' && (
                <div className="space-y-6">
                    <RanksTab ranks={props.ranks} setRanks={props.setRanks} badges={props.badges} setEditingBadge={setEditingBadge} />
                    <BadgesTab badges={props.badges} setEditingBadge={setEditingBadge} onDeleteBadge={handleDeleteBadge} />
                    <LegendaryBadgesTab legendaryBadges={props.legendaryBadges} setLegendaryBadges={props.setLegendaryBadges} setPlayers={props.setPlayers} />
                </div>
            )}
            {activeTab === 'Inventory' && <InventoryTab {...props} />}
            {activeTab === 'Locations' && <LocationsTab {...props} />}
            {activeTab === 'Suppliers' && <SuppliersTab {...props} />}
            {activeTab === 'Finance' && <FinanceTab {...props} />}
            {activeTab === 'Vouchers & Raffles' && <VouchersAndRafflesTab {...props} />}
            {activeTab === 'Sponsors' && <SponsorsTab {...props} />}
            {activeTab === 'Settings' && <SettingsTab {...props} />}
            {activeTab === 'About' && <AboutTab />}
        </div>
    );
};
