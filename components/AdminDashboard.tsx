
import React, { useState, useEffect, useRef, useMemo, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// FIX: Changed RaffleTicket to RaffleTicketDoc as it is the correct exported type.
import type { Player, GameEvent, Tier, GamificationSettings, Badge, Sponsor, CompanyDetails, PaymentStatus, EventAttendee, Voucher, MatchRecord, EventStatus, EventType, InventoryItem, Supplier, Transaction, Location, SocialLink, GamificationRule, PlayerStats, Raffle, RaffleTicketDoc, LegendaryBadge, Prize, Signup, CarouselMedia, Rank, Admin } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { UsersIcon, CogIcon, CalendarIcon, TrashIcon, ShieldCheckIcon, PlusIcon, TrophyIcon, BuildingOfficeIcon, SparklesIcon, PencilIcon, XIcon, TicketIcon, AtSymbolIcon, PhoneIcon, GlobeAltIcon, ArrowLeftIcon, ArchiveBoxIcon, CurrencyDollarIcon, TruckIcon, MapPinIcon, MinusIcon, KeyIcon, Bars3Icon, ChevronDownIcon, ExclamationTriangleIcon, InformationCircleIcon, CreditCardIcon, CheckCircleIcon, PrinterIcon, PlusCircleIcon, CodeBracketIcon, ChartBarIcon, BellIcon } from './icons/Icons';
import { BadgePill } from './BadgePill';
import { Modal } from './Modal';
import { UNRANKED_TIER } from '../constants';
import { getRankForPlayer, resolveRankIcon, getRankBadgeSvg } from '../utils/rankUtils';
import { generatePlayerCodeFromName, generateUniquePlayerCode } from '../utils/playerCodeGenerator';
import { PlayerProfilePage } from './PlayerProfilePage';
import { ErrorBoundary } from './ErrorBoundary';
import { FinanceTab } from './FinanceTab';
import { SuppliersTab } from './SuppliersTab';
import { LocationsTab } from './LocationsTab';
import { EventsTab } from './EventsTab';
import { ManageEventPage } from './ManageEventPage';
import { ProgressionTab } from './ProgressionTab';
import { InventoryTab } from './InventoryTab';
import { VouchersRafflesTab } from './VouchersRafflesTab';
import { SponsorsTab } from './SponsorsTab';
import { Leaderboard } from './Leaderboard';
import { SettingsTab } from './SettingsTab';
import { AboutTab } from './AboutTab';
import { AdminNotificationsTab } from './AdminNotificationsTab';
import { AdminRulesManager } from './AdminRulesManager';
import { DataContext, DataContextType } from '../data/DataContext';
import { AuthContext } from '../auth/AuthContext';
import { SendCredentialsModal } from './SendCredentialsModal';

import { AdminGameTypesManager } from './AdminGameTypesManager';
import { generateUniquePlayerCode } from '../utils/playerCodeGenerator';
import { Eye, EyeOff, Sparkles, Search, Grid3X3, Layers, Award, ChevronRight, ChevronLeft, ArrowUpRight } from 'lucide-react';

export type AdminDashboardProps = Omit<DataContextType, 'loading' | 'isSeeding' | 'seedInitialData' | 'updatePlayerDoc' | 'addEventDoc' | 'deleteEventDoc' | 'updateEventDoc'> & {
    onDeleteAllData: () => void;
    deleteAllPlayers: () => Promise<void>;
    addPlayerDoc: (playerData: Omit<Player, 'id'>) => Promise<string>;
    onOpenInfoModal?: (ruleSetId?: string) => void;
};


type Tab = 'Events' | 'Game Types' | 'Players' | 'Notifications' | 'Rules' | 'Progression' | 'Ranks' | 'Inventory' | 'Locations' | 'Suppliers' | 'Finance' | 'Vouchers & Raffles' | 'Sponsors' | 'Leaderboard' | 'Settings' | 'About';
type View = 'dashboard' | 'player_profile' | 'manage_event';

const NewPlayerModal: React.FC<{
    onClose: () => void;
    players: Player[];
    companyDetails: CompanyDetails;
    ranks: Rank[];
    addPlayerDoc: (playerData: Omit<Player, 'id'>) => Promise<string>;
}> = ({ onClose, players, companyDetails, ranks, addPlayerDoc }) => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        callsign: '',
        email: '',
        phone: '',
        pin: '',
        age: '',
        idNumber: '',
    });
    const [nameError, setNameError] = useState('');
    const [surnameError, setSurnameError] = useState('');
    const [playerCode, setPlayerCode] = useState('');
    const [playerCodeError, setPlayerCodeError] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newlyCreatedPlayer, setNewlyCreatedPlayer] = useState<Player | null>(null);
    const dataContext = useContext(DataContext);

    const handleAutoGeneratePin = () => {
        // Generate a random 6-digit PIN between 100000 and 999999
        const generatedPin = Math.floor(100000 + Math.random() * 900000).toString();
        setFormData(f => ({ ...f, pin: generatedPin }));
        setShowPin(true);
    };


    useEffect(() => {
        const nameTrimmed = formData.name.trim();
        const surnameTrimmed = formData.surname.trim();
        if (nameTrimmed && surnameTrimmed) {
            const initials = (nameTrimmed.charAt(0) + surnameTrimmed.charAt(0)).toUpperCase();
            const existingPlayersWithInitials = players.filter(p => p.playerCode?.startsWith(initials));
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
            setPlayerCode(newPlayerCode);
            setPlayerCodeError('');
        }
    }, [formData.name, formData.surname, players]);

    const handlePlayerCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const code = e.target.value.toUpperCase();
        setPlayerCode(code);
        if (players.some(p => p.playerCode?.toUpperCase() === code)) {
            setPlayerCodeError('This Player Code is already taken.');
        } else {
            setPlayerCodeError('');
        }
    };


    const handleSave = async () => {
        // Validation - Mandatory First Name and Surname
        const trimmedName = formData.name.trim();
        const trimmedSurname = formData.surname.trim();
        let validationFailed = false;

        if (!trimmedName) {
            setNameError('First Name is mandatory.');
            validationFailed = true;
        } else {
            setNameError('');
        }

        if (!trimmedSurname) {
            setSurnameError('Surname is mandatory.');
            validationFailed = true;
        } else {
            setSurnameError('');
        }

        if (validationFailed) {
            alert('First Name and Surname are mandatory to register a new player.');
            return;
        }

        const ageNum = Number(formData.age);
        if (!formData.email || !formData.pin || !formData.age || !formData.idNumber || !playerCode) {
            alert('Please fill in all required fields.');
            return;
        }
        if (playerCodeError) {
            alert(playerCodeError);
            return;
        }
        if (!/^\d{6}$/.test(formData.pin)) {
            alert('PIN must be 6 digits.');
            return;
        }
        if (ageNum < companyDetails.minimumSignupAge) {
            alert(`Player must be at least ${companyDetails.minimumSignupAge} years old to sign up.`);
            return;
        }
        
        setIsSaving(true);
        
        const allTiers = ranks.flatMap(r => r.tiers || []).filter(Boolean).sort((a,b) => a.minXp - b.minXp);
        const firstTier = allTiers.length > 0 ? allTiers[0] : UNRANKED_TIER;
       
        const assignedCallsign = formData.callsign.trim() || trimmedName;

        const newPlayerData: Omit<Player, 'id'> = {
            name: trimmedName,
            surname: trimmedSurname,
            playerCode: playerCode,
            email: formData.email,
            phone: formData.phone,
            pin: formData.pin,
            age: ageNum,
            idNumber: formData.idNumber,
            role: 'player',
            callsign: assignedCallsign,
            rank: firstTier,
            status: 'Active',
            avatarUrl: `https://api.dicebear.com/8.x/bottts/svg?seed=${trimmedName}${trimmedSurname}`, // Default avatar
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
            address: '',
            allergies: '',
            medicalNotes: '',
            bio: '',
            preferredRole: 'Assault',
            activeAuthUID: '',
        };
        try {
            const newPlayerId = await addPlayerDoc(newPlayerData);
            const completePlayer: Player = { ...newPlayerData, id: newPlayerId };
            dataContext?.logActivity(`Created player: ${completePlayer.name}`);
            
            // Auto-trigger admin notification for new player
            dataContext?.createNotification?.({
                title: 'New Player Registered',
                message: `${completePlayer.name} ${completePlayer.surname || ''} (${completePlayer.playerCode}) was successfully registered.`,
                type: 'new_player',
                playerId: newPlayerId,
                playerName: `${completePlayer.name} ${completePlayer.surname || ''}`.trim(),
                playerCallsign: completePlayer.callsign,
                playerCode: completePlayer.playerCode,
                playerAvatarUrl: completePlayer.avatarUrl,
            });

            setNewlyCreatedPlayer(completePlayer);
        } catch (error) {
            console.error("Failed to create new player:", error);
            alert(`Error: Could not create player. Please check the console for details. Message: ${(error as Error).message}`);
            setIsSaving(false);
        }
    };

    return (
        <>
            {newlyCreatedPlayer && <SendCredentialsModal player={newlyCreatedPlayer} onClose={() => { setNewlyCreatedPlayer(null); onClose(); }} />}
            <Modal isOpen={!newlyCreatedPlayer} onClose={onClose} title="Create New Player">
                <div className="space-y-2 sm:space-y-4 text-xs sm:text-sm">
                     <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        <div>
                            <Input 
                                label="First Name *" 
                                value={formData.name} 
                                onChange={e => {
                                    const val = e.target.value;
                                    setFormData(f => ({ ...f, name: val }));
                                    if (val.trim()) setNameError('');
                                }} 
                                placeholder="e.g. John"
                                required
                            />
                            {nameError && <p className="text-red-500 text-[10px] sm:text-xs mt-0.5 font-medium">{nameError}</p>}
                        </div>
                        <div>
                            <Input 
                                label="Surname *" 
                                value={formData.surname} 
                                onChange={e => {
                                    const val = e.target.value;
                                    setFormData(f => ({ ...f, surname: val }));
                                    if (val.trim()) setSurnameError('');
                                }} 
                                placeholder="e.g. Doe"
                                required
                            />
                            {surnameError && <p className="text-red-500 text-[10px] sm:text-xs mt-0.5 font-medium">{surnameError}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        <Input 
                            label="Callsign" 
                            value={formData.callsign} 
                            onChange={e => setFormData(f => ({ ...f, callsign: e.target.value }))} 
                            placeholder="e.g. Ghost"
                            tooltip="Only Administrators can assign or change player callsigns."
                        />
                        <div>
                            <Input label="Player Code *" value={playerCode} onChange={handlePlayerCodeChange} placeholder="e.g. JD01" required />
                            {playerCodeError ? (
                                <p className="text-red-500 text-[10px] sm:text-xs mt-0.5">{playerCodeError}</p>
                            ) : (!formData.name.trim() || !formData.surname.trim()) ? (
                                <p className="text-amber-400/80 text-[10px] sm:text-xs mt-0.5">Code auto-generated from name &amp; surname</p>
                            ) : (
                                <p className="text-emerald-400 text-[10px] sm:text-xs mt-0.5 font-mono">✓ Auto-code from initials</p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        <Input label="Email" type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                        <Input label="Phone" type="tel" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        <Input label="Age" type="number" value={formData.age} onChange={e => setFormData(f => ({ ...f, age: e.target.value }))} />
                        <Input label="ID Number" value={formData.idNumber} onChange={e => setFormData(f => ({ ...f, idNumber: e.target.value }))} />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs sm:text-sm font-medium text-gray-300">
                                6-Digit PIN <span className="text-red-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={handleAutoGeneratePin}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 hover:text-red-300 hover:underline transition-colors cursor-pointer"
                                title="Click to auto-generate a random 6-digit PIN"
                            >
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Auto-Gen PIN</span>
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-grow">
                                <input
                                    type={showPin ? "text" : "password"}
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
                                    placeholder="Enter or Auto-Gen 6-digit PIN"
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500 pr-9 text-xs sm:text-sm"
                                />
                                {formData.pin && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPin(!showPin)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 transition-colors"
                                        title={showPin ? "Hide PIN" : "Show PIN"}
                                    >
                                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleAutoGeneratePin}
                                className="!py-2 !px-3 text-xs flex-shrink-0 flex items-center gap-1.5 border-zinc-700 hover:border-red-500/50 hover:bg-zinc-800 font-medium"
                                title="Generate a random 6-digit PIN"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-red-400" />
                                <span>Auto-Gen</span>
                            </Button>
                        </div>
                        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 mt-1">
                            <span>Operator uses this 6-digit PIN to authenticate and check into events.</span>
                            {formData.pin && formData.pin.length === 6 && (
                                <span className="text-emerald-400 font-mono font-bold flex items-center gap-0.5">
                                    ✓ 6 Digits Set
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="mt-3 sm:mt-6">
                    <Button className="w-full !py-2 sm:!py-2.5" onClick={handleSave} disabled={isSaving || !!playerCodeError}>
                        {isSaving ? 'Creating...' : 'Create Player'}
                    </Button>
                </div>
            </Modal>
        </>
    );
};

const Tabs: React.FC<{ activeTab: Tab; setActiveTab: (tab: Tab) => void; }> = ({ activeTab, setActiveTab }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const dataContext = useContext(DataContext);
    const unreadNotificationsCount = useMemo(() => {
        return (dataContext?.notifications || []).filter(n => !n.read).length;
    }, [dataContext?.notifications]);
    const totalPlayersCount = useMemo(() => {
        return (dataContext?.players || []).length;
    }, [dataContext?.players]);

    const tabs: {name: Tab, icon: React.ReactNode, badgeCount?: number, countBadge?: number}[] = [
        {name: 'Events', icon: <CalendarIcon className="w-5 h-5"/>},
        {name: 'Game Types', icon: <SparklesIcon className="w-5 h-5 text-red-500"/>},
        {name: 'Players', icon: <UsersIcon className="w-5 h-5"/>, countBadge: totalPlayersCount},
        {name: 'Notifications', icon: <BellIcon className="w-5 h-5"/>, badgeCount: unreadNotificationsCount},
        {name: 'Rules', icon: <InformationCircleIcon className="w-5 h-5"/>},
        {name: 'Progression', icon: <ShieldCheckIcon className="w-5 h-5"/>},
        {name: 'Ranks', icon: <ShieldCheckIcon className="w-5 h-5"/>},
        {name: 'Inventory', icon: <ArchiveBoxIcon className="w-5 h-5"/>},
        {name: 'Locations', icon: <MapPinIcon className="w-5 h-5"/>},
        {name: 'Suppliers', icon: <TruckIcon className="w-5 h-5"/>},
        {name: 'Finance', icon: <CurrencyDollarIcon className="w-5 h-5"/>},
        {name: 'Vouchers & Raffles', icon: <TicketIcon className="w-5 h-5"/>},
        {name: 'Sponsors', icon: <SparklesIcon className="w-5 h-5"/>},
        {name: 'Leaderboard', icon: <TrophyIcon className="w-5 h-5"/>},
        {name: 'Settings', icon: <CogIcon className="w-5 h-5"/>},
        {name: 'About', icon: <InformationCircleIcon className="w-5 h-5"/>},
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
                        {activeTabInfo?.countBadge !== undefined && (
                            <span className="bg-zinc-800 text-zinc-300 border border-zinc-700/80 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                                {activeTabInfo.countBadge}
                            </span>
                        )}
                        {activeTabInfo?.badgeCount !== undefined && activeTabInfo.badgeCount > 0 && (
                            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                {activeTabInfo.badgeCount}
                            </span>
                        )}
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
                                    Select Module Tab
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
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            {tab.countBadge !== undefined && (
                                                <span className="bg-zinc-800 text-zinc-300 border border-zinc-700/80 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                                                    {tab.countBadge}
                                                </span>
                                            )}
                                            {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                                                <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                    {tab.badgeCount}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Desktop View Header Tabs (No horizontal scrolling, fit to screen) */}
            <nav className="hidden sm:flex flex-wrap gap-x-2 gap-y-1.5 mb-4 justify-start" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`${
                            activeTab === tab.name
                                ? 'bg-red-500/20 text-red-400 border-red-500/50'
                                : 'bg-zinc-900/50 text-gray-400 hover:text-gray-200 hover:bg-zinc-800 border-zinc-800'
                        } flex items-center gap-1.5 whitespace-nowrap py-1.5 px-2.5 border rounded-md font-medium text-xs transition-colors uppercase tracking-wider relative flex-shrink-0`}
                    >
                        <div className="scale-90 opacity-80">{tab.icon}</div>
                        <span>{tab.name}</span>
                        {tab.countBadge !== undefined && (
                            <span className="ml-1 bg-zinc-800/90 text-zinc-300 border border-zinc-700/80 text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                                {tab.countBadge}
                            </span>
                        )}
                        {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                            <span className="ml-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                                {tab.badgeCount}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
};

const PlayerListItem = React.memo(({ player, rank, onViewPlayer, onDeletePlayer, onAssignCode }: { 
    player: Player; 
    rank: Tier; 
    onViewPlayer: (id: string) => void; 
    onDeletePlayer: (id: string) => void;
    onAssignCode?: (player: Player) => void;
}) => {
    const xp = player.stats?.xp || 0;
    const matchesCount = player.stats?.gamesPlayed ?? (player.matchHistory?.length || 0);
    const badgesCount = (player.badges?.length || 0) + (player.legendaryBadges?.length || 0);
    const resolvedIcon = resolveRankIcon(rank.iconUrl, rank.name);

    return (
        <div 
            onClick={() => onViewPlayer(player.id)} 
            className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-red-600/50 hover:bg-zinc-900/80 transition-all cursor-pointer flex items-center justify-between gap-2 group"
        >
            <div className="flex items-center gap-2 min-w-0">
                <img 
                    src={player.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(player.callsign || player.name || 'OP')}&background=18181b&color=ef4444&bold=true`} 
                    alt={player.name} 
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.callsign || player.name || 'OP')}&background=18181b&color=ef4444&bold=true`;
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-zinc-700 flex-shrink-0" 
                />
                <div className="min-w-0">
                    <p className="font-bold text-white text-xs sm:text-sm truncate">
                        {(player.name || 'Unnamed')} <span className="text-red-400">"{player.callsign || 'N/A'}"</span>
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 truncate">
                        <img 
                            src={resolvedIcon} 
                            alt={rank.name} 
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(rank.name);
                            }}
                            className="w-4 h-4 flex-shrink-0 object-contain drop-shadow-sm"
                        />
                        <span className="truncate font-medium text-zinc-300">{rank.name}</span>
                        <span className="text-zinc-600">&bull;</span>
                        {(!player.playerCode || player.playerCode === 'NO-CODE') ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAssignCode?.(player);
                                }}
                                className="inline-flex items-center gap-1 font-mono text-amber-400 bg-amber-950/70 hover:bg-amber-900/90 border border-amber-500/50 px-1.5 py-0.2 rounded text-[9px] font-bold transition-all shadow-xs"
                                title="Click to permanently sync this generated player code to the database."
                            >
                                <span>{generatePlayerCodeFromName(player.name, player.surname, player.id)}</span>
                                <span className="text-[8px] bg-amber-500 text-black px-1 py-0.1 rounded font-sans font-black tracking-tight">+ Save</span>
                            </button>
                        ) : (
                            <span className="font-mono text-zinc-300 font-bold">{player.playerCode}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                    <p className="font-bold text-amber-400 text-xs sm:text-sm">{xp.toLocaleString()} RP</p>
                    <p className="text-[9px] text-zinc-500">{matchesCount} {matchesCount === 1 ? 'event' : 'events'} &bull; {badgesCount} {badgesCount === 1 ? 'badge' : 'badges'}</p>
                </div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlayer(player.id);
                    }}
                    className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title={`Delete ${player.name}`}
                >
                    <TrashIcon className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
});

const PlayersTab: React.FC<Pick<AdminDashboardProps, 'players' | 'addPlayerDoc' | 'ranks' | 'companyDetails'> & { onViewPlayer: (id: string) => void; onDeletePlayer: (id: string) => void }> = ({ players, addPlayerDoc, ranks, companyDetails, onViewPlayer, onDeletePlayer }) => {
    const dataContext = useContext(DataContext);
    const [showNewPlayerModal, setShowNewPlayerModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'alpha-asc' | 'alpha-desc' | 'xp-desc' | 'matches-desc'>('alpha-asc');
    const [isAssigningAll, setIsAssigningAll] = useState(false);

    // Identify players missing valid player codes
    const missingCodePlayers = useMemo(() => {
        return players.filter(p => !p.playerCode || p.playerCode === 'NO-CODE' || p.playerCode.trim() === '');
    }, [players]);

    const handleAssignSingleCode = useCallback(async (targetPlayer: Player) => {
        const code = generateUniquePlayerCode(targetPlayer, players);
        if (dataContext?.updateDoc) {
            await dataContext.updateDoc('players', { id: targetPlayer.id, playerCode: code });
        }
        if (dataContext?.logActivity) {
            dataContext.logActivity(`Assigned player code ${code} to ${targetPlayer.name} ("${targetPlayer.callsign || targetPlayer.name}")`);
        }
    }, [players, dataContext]);

    const handleAssignAllMissingCodes = useCallback(async () => {
        if (missingCodePlayers.length === 0 || isAssigningAll) return;
        setIsAssigningAll(true);
        try {
            let pool = [...players];
            for (const p of missingCodePlayers) {
                const code = generateUniquePlayerCode(p, pool);
                pool = pool.map(x => x.id === p.id ? { ...x, playerCode: code } : x);
                if (dataContext?.updateDoc) {
                    await dataContext.updateDoc('players', { id: p.id, playerCode: code });
                }
            }
            if (dataContext?.logActivity) {
                dataContext.logActivity(`Auto-assigned player codes to ${missingCodePlayers.length} operators`);
            }
        } finally {
            setIsAssigningAll(false);
        }
    }, [missingCodePlayers, players, dataContext, isAssigningAll]);

    // Auto-alphabetical by default (A-Z by name/callsign, then surname)
    const filteredPlayers = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        const list = players.filter(p => {
            if (!query) return true;
            return (
                (p.name || '').toLowerCase().includes(query) ||
                (p.surname || '').toLowerCase().includes(query) ||
                (p.callsign || '').toLowerCase().includes(query) ||
                (p.playerCode || '').toLowerCase().includes(query)
            );
        });

        return list.sort((a, b) => {
            if (sortBy === 'alpha-asc') {
                const nameA = (a.name || a.callsign || '').trim();
                const nameB = (b.name || b.callsign || '').trim();
                const comp = nameA.localeCompare(nameB, undefined, { sensitivity: 'base', numeric: true });
                if (comp !== 0) return comp;
                const surA = (a.surname || '').trim();
                const surB = (b.surname || '').trim();
                const surComp = surA.localeCompare(surB, undefined, { sensitivity: 'base', numeric: true });
                if (surComp !== 0) return surComp;
                return (a.callsign || '').trim().localeCompare((b.callsign || '').trim(), undefined, { sensitivity: 'base', numeric: true });
            }
            if (sortBy === 'alpha-desc') {
                const nameA = (a.name || a.callsign || '').trim();
                const nameB = (b.name || b.callsign || '').trim();
                const comp = nameB.localeCompare(nameA, undefined, { sensitivity: 'base', numeric: true });
                if (comp !== 0) return comp;
                const surA = (a.surname || '').trim();
                const surB = (b.surname || '').trim();
                return surB.localeCompare(surA, undefined, { sensitivity: 'base', numeric: true });
            }
            if (sortBy === 'xp-desc') {
                return (b.stats?.xp ?? 0) - (a.stats?.xp ?? 0);
            }
            if (sortBy === 'matches-desc') {
                const matchesA = a.stats?.gamesPlayed ?? (a.matchHistory?.length || 0);
                const matchesB = b.stats?.gamesPlayed ?? (b.matchHistory?.length || 0);
                return matchesB - matchesA;
            }
            return 0;
        });
    }, [players, searchTerm, sortBy]);

    return (
        <div className="w-full space-y-3 sm:space-y-4">
            {showNewPlayerModal && <NewPlayerModal onClose={() => setShowNewPlayerModal(false)} players={players} addPlayerDoc={addPlayerDoc} companyDetails={companyDetails} ranks={ranks} />}
            
            {/* Top Free-View Header Bar with Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-800/40 flex items-center justify-center flex-shrink-0 text-red-500">
                        <UsersIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                                Registered Operators
                            </h2>
                            <span 
                                id="admin-players-total-count-badge"
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-red-600/20 text-red-400 border border-red-500/40 font-mono tracking-tight shadow-sm"
                                title="Total registered players"
                            >
                                {players.length} {players.length === 1 ? 'Player' : 'Players'}
                            </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                            {searchTerm ? (
                                <span>Showing <strong className="text-white font-bold">{filteredPlayers.length}</strong> of <strong className="text-white font-bold">{players.length}</strong> operators &bull; Auto-sorted alphabetically (A–Z)</span>
                            ) : (
                                <span>Total: <strong className="text-white font-bold">{players.length}</strong> {players.length === 1 ? 'player' : 'players'} registered &bull; Auto-sorted alphabetically (A–Z)</span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <div className="relative flex-grow sm:flex-grow-0">
                        <Input 
                            placeholder="Search callsign, code, name..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="!text-xs !py-1 w-full sm:w-60 pr-7"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 text-xs"
                                title="Clear search"
                            >
                                &times;
                            </button>
                        )}
                    </div>
                    <Button onClick={() => setShowNewPlayerModal(true)} size="sm" className="!py-1 !px-2.5 text-xs flex-shrink-0">
                        <PlusIcon className="w-3.5 h-3.5 mr-1" /> Add Player
                    </Button>
                </div>
            </div>

            {/* Quick Player Count & Alphabetical Controls Bar */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-zinc-900/50 border border-zinc-800/80 text-xs text-zinc-400">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-zinc-500 font-medium">Player Count:</span>
                    <span className="font-bold text-white bg-zinc-800 border border-zinc-700/80 px-2 py-0.5 rounded-md text-xs font-mono">
                        {players.length}
                    </span>
                    {searchTerm && (
                        <span className="text-xs text-zinc-400">
                            (Filtered: <strong className="text-red-400 font-bold">{filteredPlayers.length}</strong>)
                        </span>
                    )}
                    <span className="text-zinc-600 hidden sm:inline">&bull;</span>
                    <span className="text-zinc-500 text-[11px] hidden sm:inline">
                        Default: Alphabetical (A–Z)
                    </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-zinc-500 text-xs hidden sm:inline">Sort:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-red-500 cursor-pointer"
                        aria-label="Sort players"
                    >
                        <option value="alpha-asc">Alphabetical (A–Z) [Auto]</option>
                        <option value="alpha-desc">Alphabetical (Z–A)</option>
                        <option value="xp-desc">Rank Points (XP)</option>
                        <option value="matches-desc">Match Count</option>
                    </select>
                </div>
            </div>

            {/* Missing Player Codes Alert Banner */}
            {missingCodePlayers.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-gradient-to-r from-amber-950/70 via-zinc-900 to-zinc-900 border border-amber-500/50 text-xs text-amber-200 shadow-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-amber-400 text-lg flex-shrink-0">⚠️</span>
                        <div className="min-w-0">
                            <p className="font-bold text-amber-300">
                                {missingCodePlayers.length} {missingCodePlayers.length === 1 ? 'operator code needs' : 'operator codes need'} database sync
                            </p>
                            <p className="text-[11px] text-zinc-300 truncate">
                                Codes are required for event check-ins, voucher redemptions, and live game stat tracking.
                            </p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={handleAssignAllMissingCodes}
                        disabled={isAssigningAll}
                        className="!py-1.5 !px-3 text-xs bg-amber-500 hover:bg-amber-400 text-black font-black flex-shrink-0 whitespace-nowrap shadow-sm"
                    >
                        {isAssigningAll ? 'Assigning...' : `Auto-Assign All Codes (${missingCodePlayers.length})`}
                    </Button>
                </div>
            )}

            {/* Side by side grid on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 max-h-[72vh] overflow-y-auto pr-1">
                {filteredPlayers.map(p => {
                    const rank = getRankForPlayer(p, ranks);
                    return (
                        <PlayerListItem 
                            key={p.id} 
                            player={p} 
                            rank={rank} 
                            onViewPlayer={onViewPlayer} 
                            onDeletePlayer={onDeletePlayer} 
                            onAssignCode={handleAssignSingleCode}
                        />
                    );
                })}
                {filteredPlayers.length === 0 && (
                    <div className="col-span-full py-12 text-center text-zinc-500 text-xs sm:text-sm">
                        No operators matching "{searchTerm}".
                    </div>
                )}
            </div>
        </div>
    );
};

const LeaderboardTab: React.FC<{ players: Player[] }> = ({ players }) => {
    return (
        <div className="w-full">
            <Leaderboard players={players} isAdmin={true} />
        </div>
    );
};

const AdminRanksDisplayTab: React.FC<{ ranks: Rank[] }> = ({ ranks }) => {
    const activeRanks = ranks && ranks.length > 0 ? ranks : DEFAULT_RANKS;
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRankForInspect, setSelectedRankForInspect] = useState<Rank | null>(null);
    const [divisionFilter, setDivisionFilter] = useState<'all' | 'entry' | 'mid' | 'elite'>('all');

    const sortedRanks = useMemo(() => {
        return [...activeRanks].sort((a, b) => {
            const tiersA = a.tiers || [];
            const tiersB = b.tiers || [];
            const minXpA = tiersA.length > 0 ? Math.min(...tiersA.map(t => t.minXp)) : (a.minXp ?? 0);
            const minXpB = tiersB.length > 0 ? Math.min(...tiersB.map(t => t.minXp)) : (b.minXp ?? 0);
            return minXpA - minXpB;
        });
    }, [activeRanks]);

    const filteredRanks = useMemo(() => {
        return sortedRanks.filter((rank, idx) => {
            const matchesSearch = rank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (rank.tiers || []).some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
            if (!matchesSearch) return false;

            if (divisionFilter === 'entry') return idx < 5;
            if (divisionFilter === 'mid') return idx >= 5 && idx < 10;
            if (divisionFilter === 'elite') return idx >= 10;
            return true;
        });
    }, [sortedRanks, searchQuery, divisionFilter]);

    const totalSubTiers = useMemo(() => {
        return activeRanks.reduce((acc, r) => acc + (r.tiers?.length || 0), 0);
    }, [activeRanks]);

    const getRangeForTier = (tier: Tier, rank: Rank, rankIndex: number) => {
        const sortedTiersInRank = [...(rank.tiers || [])].sort((a,b) => a.minXp - b.minXp);
        const tierIndex = sortedTiersInRank.findIndex(r => r.id === tier.id);
        const nextTierInRank = sortedTiersInRank[tierIndex + 1];

        if (nextTierInRank) {
            return `${tier.minXp.toLocaleString()} - ${(nextTierInRank.minXp - 1).toLocaleString()} XP`;
        }
        
        const nextRank = sortedRanks[rankIndex + 1];
        if (nextRank && nextRank.tiers && nextRank.tiers.length > 0) {
            const nextRankFirstTier = [...nextRank.tiers].sort((a,b) => a.minXp - b.minXp)[0];
            return `${tier.minXp.toLocaleString()} - ${(nextRankFirstTier.minXp - 1).toLocaleString()} XP`;
        }
        return `${tier.minXp.toLocaleString()}+ XP`;
    };

    return (
        <div className="w-full space-y-3 sm:space-y-4">
            {/* Header & Quick Tactical Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-zinc-800/80">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-red-600/20 border border-red-500/40 text-red-400">
                            <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                            Rank Structure &amp; Hierarchy
                        </h2>
                    </div>
                    <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
                        Shrink-to-fit side-by-side squares view • <span className="text-white font-semibold">{activeRanks.length} Divisions</span> • <span className="text-red-400 font-semibold">{totalSubTiers} Sub-Tiers</span>
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {/* Search Field */}
                    <div className="relative flex-grow sm:w-48">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Filter ranks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-zinc-900/90 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
                                <XIcon className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tactical Filter Chips */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                        { id: 'all', label: `All Divisions (${sortedRanks.length})` },
                        { id: 'entry', label: 'Tier I: Cadet/Entry' },
                        { id: 'mid', label: 'Tier II: Field Special' },
                        { id: 'elite', label: 'Tier III: Master/Elite' }
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setDivisionFilter(btn.id as any)}
                            className={`px-2.5 py-1 rounded-lg text-[10.5px] sm:text-xs font-bold uppercase tracking-wider transition-all border ${
                                divisionFilter === btn.id
                                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-900/30'
                                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white border-zinc-800/80 hover:bg-zinc-800/80'
                            }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                <div className="hidden lg:flex items-center gap-1.5 text-[10.5px] font-mono text-zinc-400 bg-zinc-950/60 px-2.5 py-1 rounded-lg border border-zinc-800/60">
                    <Grid3X3 className="w-3 h-3 text-red-400" />
                    <span>Side-by-Side Square Matrix</span>
                </div>
            </div>

            {/* Side-by-Side Squares Grid - High Density, Shrink-To-Fit, Open-Spaced */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-3">
                {filteredRanks.map((rank) => {
                    const rankIndex = sortedRanks.findIndex(r => r.id === rank.id);
                    const resolvedRankBadge = resolveRankIcon(rank.rankBadgeUrl, rank.name);
                    const sortedTiers = [...(rank.tiers || [])].sort((a,b) => a.minXp - b.minXp);
                    const lowestXp = sortedTiers.length > 0 ? sortedTiers[0].minXp : (rank.minXp ?? 0);
                    const highestXp = sortedTiers.length > 0 ? sortedTiers[sortedTiers.length - 1].minXp : lowestXp;

                    return (
                        <div 
                            key={rank.id} 
                            onClick={() => setSelectedRankForInspect(rank)}
                            className="group relative cursor-pointer flex flex-col justify-between p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-zinc-900/90 via-zinc-950/80 to-black border border-zinc-800/80 hover:border-red-500/80 shadow-[0_8px_24px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.06)] hover:shadow-[0_12px_32px_rgba(239,68,68,0.25)] backdrop-blur-xl transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                            {/* Top Red Laser Glow Line */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1.5px] bg-gradient-to-r from-transparent via-red-500/70 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                            <div>
                                {/* Top Monospace Index & Tier Count */}
                                <div className="flex items-center justify-between gap-1 text-[9px] font-mono pb-1.5 border-b border-zinc-800/60">
                                    <span className="text-zinc-400 font-bold tracking-widest uppercase">
                                        #{String(rankIndex + 1).padStart(2, '0')}
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded bg-red-950/80 text-red-400 border border-red-900/50 font-bold text-[8.5px]">
                                        {sortedTiers.length} TIERS
                                    </span>
                                </div>

                                {/* Centered 3D Badge Insignia Frame */}
                                <div className="my-2 flex flex-col items-center justify-center">
                                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-2xl bg-gradient-to-b from-zinc-800/70 via-zinc-900/90 to-black border border-zinc-700/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.12),0_6px_16px_rgba(0,0,0,0.7)] group-hover:border-red-500/60 group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-300">
                                        <img 
                                            src={resolvedRankBadge} 
                                            alt={rank.name} 
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(rank.name);
                                            }}
                                            className="w-10 h-10 sm:w-12 sm:h-12 object-contain filter drop-shadow-[0_4px_10px_rgba(239,68,68,0.5)] group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                </div>

                                {/* Rank Title & XP Range */}
                                <div className="text-center space-y-1">
                                    <h3 className="text-xs sm:text-[13px] font-black text-white uppercase tracking-wider group-hover:text-red-400 transition-colors truncate">
                                        {rank.name}
                                    </h3>
                                    <div className="inline-block px-2 py-0.5 rounded-full bg-zinc-900/90 border border-zinc-700/60 text-[8.5px] sm:text-[9px] font-mono font-bold text-red-300 shadow-inner truncate max-w-full">
                                        {lowestXp.toLocaleString()} XP{sortedTiers.length > 1 ? ` – ${highestXp.toLocaleString()}` : '+'}
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Sub-Tiers Micro Preview & Quick Inspect Prompt */}
                            <div className="mt-2 pt-2 border-t border-zinc-800/60 flex items-center justify-between gap-1">
                                {/* Micro dots / pips for sub-tiers */}
                                <div className="flex items-center gap-0.5 overflow-hidden max-w-[65%]">
                                    {sortedTiers.slice(0, 5).map((subTier, i) => (
                                        <div 
                                            key={subTier.id || i}
                                            title={subTier.name}
                                            className="w-1.5 h-1.5 rounded-full bg-red-500/80 shadow-[0_0_4px_rgba(239,68,68,0.8)]"
                                        />
                                    ))}
                                    {sortedTiers.length > 5 && (
                                        <span className="text-[7.5px] font-mono text-zinc-500 font-bold leading-none">
                                            +{sortedTiers.length - 5}
                                        </span>
                                    )}
                                </div>

                                <span className="text-[8px] sm:text-[8.5px] font-mono font-bold uppercase text-zinc-400 group-hover:text-red-400 flex items-center gap-0.5 transition-colors">
                                    <span>Inspect</span>
                                    <ChevronRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" />
                                </span>
                            </div>
                        </div>
                    );
                })}

                {filteredRanks.length === 0 && (
                    <div className="col-span-full text-center text-zinc-400 py-12 bg-zinc-950/60 rounded-2xl border border-zinc-800/80">
                        <ShieldCheckIcon className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                        <p className="font-bold text-white text-sm">No Ranks Found</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Try adjusting your search query or filter selection.</p>
                    </div>
                )}
            </div>

            {/* Sub-Tier Inspection Modal */}
            <AnimatePresence>
                {selectedRankForInspect && (
                    <Modal
                        isOpen={true}
                        onClose={() => setSelectedRankForInspect(null)}
                        title={`${selectedRankForInspect.name} — Division Breakdown`}
                    >
                        {(() => {
                            const rank = selectedRankForInspect;
                            const rankIndex = sortedRanks.findIndex(r => r.id === rank.id);
                            const resolvedRankBadge = resolveRankIcon(rank.rankBadgeUrl, rank.name);
                            const sortedTiers = [...(rank.tiers || [])].sort((a,b) => a.minXp - b.minXp);
                            const lowestXp = sortedTiers.length > 0 ? sortedTiers[0].minXp : (rank.minXp ?? 0);
                            const highestXp = sortedTiers.length > 0 ? sortedTiers[sortedTiers.length - 1].minXp : lowestXp;

                            return (
                                <div className="space-y-4">
                                    {/* Division Header Banner */}
                                    <div className="flex items-center gap-3 sm:gap-4 p-3.5 rounded-2xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-950 border border-red-500/40 shadow-xl">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 flex items-center justify-center rounded-2xl bg-black/60 border border-red-500/40 shadow-[0_0_16px_rgba(239,68,68,0.3)]">
                                            <img 
                                                src={resolvedRankBadge} 
                                                alt={rank.name} 
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(rank.name);
                                                }}
                                                className="w-11 h-11 sm:w-13 sm:h-13 object-contain drop-shadow-[0_4px_10px_rgba(239,68,68,0.6)]"
                                            />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-red-600 text-white shadow-xs">
                                                    DIVISION #{String(rankIndex + 1).padStart(2, '0')}
                                                </span>
                                                <span className="text-[9px] font-mono font-bold text-zinc-300">
                                                    {sortedTiers.length} Sub-Tiers
                                                </span>
                                            </div>
                                            <h3 className="text-base sm:text-xl font-black text-white uppercase tracking-wider mt-1 truncate">
                                                {rank.name}
                                            </h3>
                                            <p className="text-[11px] text-zinc-400 mt-0.5">
                                                Overall Bracket: <strong className="text-red-400 font-mono">{lowestXp.toLocaleString()} XP{sortedTiers.length > 1 ? ` – ${highestXp.toLocaleString()} XP` : '+'}</strong>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Sub-Tiers Grid / List */}
                                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
                                        <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider px-1">
                                            Sub-Tier Progression Hierarchy ({sortedTiers.length})
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {sortedTiers.map((sub, tierIdx) => {
                                                const resolvedTierIcon = resolveRankIcon(sub.iconUrl, rank.name, sub.name);
                                                return (
                                                    <div 
                                                        key={sub.id || tierIdx} 
                                                        className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-850 transition-all flex items-center gap-2.5 shadow-sm"
                                                    >
                                                        <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-zinc-950 border border-zinc-800">
                                                            <img 
                                                                src={resolvedTierIcon} 
                                                                alt={sub.name} 
                                                                onError={(e) => {
                                                                    (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(sub.name || rank.name);
                                                                }}
                                                                className="w-7 h-7 object-contain drop-shadow"
                                                            />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center justify-between gap-1">
                                                                <h4 className="text-xs font-bold text-white truncate">{sub.name}</h4>
                                                                <span className="text-[8px] font-mono text-emerald-400 font-bold bg-zinc-950 px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap">
                                                                    {getRangeForTier(sub, rank, rankIndex)}
                                                                </span>
                                                            </div>
                                                            {sub.perks && sub.perks.length > 0 && (
                                                                <p className="text-[9.5px] text-zinc-400 truncate mt-0.5">
                                                                    Perks: {sub.perks.join(', ')}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Modal Footer Controls */}
                                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                                        <div className="flex items-center gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="secondary"
                                                disabled={rankIndex === 0}
                                                onClick={() => {
                                                    if (rankIndex > 0) setSelectedRankForInspect(sortedRanks[rankIndex - 1]);
                                                }}
                                                className="!px-2.5 !py-1 text-xs"
                                            >
                                                <ChevronLeft className="w-3.5 h-3.5 mr-0.5" /> Previous
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="secondary"
                                                disabled={rankIndex === sortedRanks.length - 1}
                                                onClick={() => {
                                                    if (rankIndex < sortedRanks.length - 1) setSelectedRankForInspect(sortedRanks[rankIndex + 1]);
                                                }}
                                                className="!px-2.5 !py-1 text-xs"
                                            >
                                                Next <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                                            </Button>
                                        </div>
                                        <Button size="sm" onClick={() => setSelectedRankForInspect(null)} className="!px-4 !py-1 text-xs">
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            );
                        })()}
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
};


export const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const [activeTab, setActiveTab] = useState<Tab>('Events');
    const [view, setView] = useState<View>('dashboard');
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    const dataContext = useContext(DataContext);
    if (!dataContext) throw new Error("DataContext not found");
    const auth = useContext(AuthContext);
    const adminUser = auth?.user as Admin;

    const { players, events, legendaryBadges, ranks, updateDoc, addDoc, deleteDoc, restoreFromBackup, setDoc, signups, companyDetails, logActivity } = props;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab') as Tab | null;
        const validTabs: Tab[] = ['Events', 'Players', 'Notifications', 'Rules', 'Progression', 'Ranks', 'Inventory', 'Locations', 'Suppliers', 'Finance', 'Vouchers & Raffles', 'Sponsors', 'Leaderboard', 'Settings', 'About'];
        if (tab && validTabs.includes(tab)) {
            setActiveTab(tab);
        }
    }, []);

    const getHelpTopic = () => {
        if (view === 'player_profile') return 'admin-player-profile';
        if (view === 'manage_event') return 'admin-manage-event';
        // Format tab name for help content key
        const formattedTab = (activeTab || '').toLowerCase().replace(' & ', '-').replace(/\s+/g, '-');
        return `admin-dashboard-${formattedTab}`;
    };

    const setHelpTopic = auth?.setHelpTopic;

    useEffect(() => {
        if (setHelpTopic) {
            const topic = getHelpTopic();
            setHelpTopic(topic);
            if (view === 'dashboard' && logActivity) {
                logActivity(`Viewed ${activeTab} tab`);
            }
        }
    }, [activeTab, view, setHelpTopic, logActivity]);

    const handleViewPlayer = useCallback((id: string) => {
        const player = players.find(p => p.id === id);
        logActivity(`Viewed profile for ${player?.name || 'Unknown Player'}`);
        setSelectedPlayerId(id);
        setView('player_profile');
    }, [logActivity, players]);

    const handleManageEvent = (id: string | null) => {
        const event = events.find(e => e.id === id);
        logActivity(id ? `Opened event manager for ${event?.title}` : 'Opened event manager to create new event');
        setSelectedEventId(id);
        setView('manage_event');
    }
    
    const handleSaveEvent = async (eventData: GameEvent) => {
        if (eventData.id) {
            await updateDoc('events', eventData);
        } else {
            const { id, ...newEventData } = eventData;
            const newId = await addDoc('events', newEventData);
            logActivity(`Created event: ${eventData.title}`, { eventId: newId });
        }
        setView('dashboard');
    }

    const handleDeleteEvent = async (eventId: string) => {
        const event = events.find(e => e.id === eventId);
        if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            await deleteDoc('events', eventId);
            logActivity(`Deleted event: ${event?.title || 'Unknown'}`);
            setView('dashboard');
        }
    }


    const handleUpdatePlayer = async (updatedPlayer: Player) => {
        await updateDoc('players', updatedPlayer);
        logActivity(`Updated profile for ${updatedPlayer.name}`);
    };

    const handleDeletePlayer = async (playerId: string) => {
        const playerToDelete = players.find(p => p.id === playerId);
        if (!playerToDelete) return;
        if (confirm(`Are you sure you want to permanently delete player "${playerToDelete.name} ${playerToDelete.surname || ''}" (${playerToDelete.playerCode})? This action cannot be undone.`)) {
            await deleteDoc('players', playerId);
            logActivity(`Deleted player: ${playerToDelete.name} (${playerToDelete.playerCode})`);
            if (view === 'player_profile') {
                setView('dashboard');
            }
        }
    };
    
    const selectedPlayer = players.find(p => p.id === selectedPlayerId);

    if (view === 'player_profile') {
        if (!selectedPlayer) {
            return (
                <div className="p-8 text-center text-gray-400 space-y-4 my-12 bg-zinc-900/80 rounded-xl border border-zinc-800 max-w-md mx-auto">
                    <p className="text-lg font-bold text-white">Player Not Found</p>
                    <p className="text-sm">The selected operator profile could not be loaded or was removed.</p>
                    <Button onClick={() => setView('dashboard')} className="w-full">Return to Dashboard</Button>
                </div>
            );
        }
        return (
            <ErrorBoundary fallbackTitle="Player Profile Error" onReset={() => setView('dashboard')}>
                <PlayerProfilePage 
                    player={selectedPlayer} 
                    players={players}
                    events={events} 
                    legendaryBadges={legendaryBadges}
                    onBack={() => setView('dashboard')}
                    onUpdatePlayer={handleUpdatePlayer}
                    onDeletePlayer={handleDeletePlayer}
                    ranks={ranks}
                    companyDetails={companyDetails}
                />
            </ErrorBoundary>
        );
    }

    if (view === 'manage_event') {
        const eventToManage = selectedEventId ? events.find(e => e.id === selectedEventId) : undefined;
        return (
            <ManageEventPage 
                event={eventToManage}
                players={props.players}
                inventory={props.inventory}
                gamificationSettings={props.gamificationSettings}
                legendaryBadges={props.legendaryBadges}
                onBack={() => setView('dashboard')}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
                setPlayers={props.setPlayers}
                setTransactions={props.setTransactions}
                signups={signups}
                setDoc={setDoc}
                deleteDoc={deleteDoc}
                companyDetails={companyDetails}
            />
        )
    }

    return (
        <div className="flex flex-col h-full">
            <header className="flex items-center justify-between p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-sm border-b border-zinc-800 flex-shrink-0">
                <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                    {adminUser?.avatarUrl && adminUser.avatarUrl.trim() !== '' && <img src={adminUser.avatarUrl} alt={adminUser?.name || 'Admin'} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-red-600 flex-shrink-0"/>}
                    <div className="overflow-hidden">
                        <h1 className="text-base sm:text-xl font-bold text-white truncate">{adminUser?.name || 'Admin'}</h1>
                        <p className="text-xs sm:text-sm text-red-400">Administrator</p>
                    </div>
                </div>
                <Button onClick={() => auth?.logout()} variant="secondary" size="sm" className="flex-shrink-0">Logout</Button>
            </header>
            <main className="flex-grow overflow-y-auto">
                <div className="p-4 sm:p-6 lg:p-8">
                    <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
                    {activeTab === 'Events' && <EventsTab events={events} onManageEvent={handleManageEvent} />}
                    {activeTab === 'Game Types' && <AdminGameTypesManager />}
                    {activeTab === 'Players' && <PlayersTab players={props.players} addPlayerDoc={props.addPlayerDoc} ranks={props.ranks} companyDetails={props.companyDetails} onViewPlayer={handleViewPlayer} onDeletePlayer={handleDeletePlayer}/>}
                    {activeTab === 'Notifications' && <AdminNotificationsTab 
                        notifications={dataContext.notifications || []}
                        onUpdateNotification={async (n) => { await dataContext.updateDoc('notifications', n); }}
                        onDeleteNotification={async (id) => { await dataContext.deleteDoc('notifications', id); }}
                        onClearAllNotifications={dataContext.clearAllNotifications}
                        onMarkAllAsRead={dataContext.markAllNotificationsAsRead}
                        onViewPlayer={handleViewPlayer}
                        players={props.players}
                    />}
                    {activeTab === 'Rules' && <AdminRulesManager onOpenInfoModal={props.onOpenInfoModal} />}
                    {activeTab === 'Progression' && <ProgressionTab 
                        ranks={props.ranks} setRanks={props.setRanks}
                        badges={props.badges} setBadges={props.setBadges}
                        legendaryBadges={props.legendaryBadges} setLegendaryBadges={props.setLegendaryBadges}
                        gamificationSettings={props.gamificationSettings} setGamificationSettings={props.setGamificationSettings}
                        addDoc={props.addDoc} updateDoc={props.updateDoc} deleteDoc={props.deleteDoc}
                        companyDetails={props.companyDetails}
                        setCompanyDetails={props.setCompanyDetails}
                    />}
                    {activeTab === 'Ranks' && <AdminRanksDisplayTab ranks={props.ranks} />}
                    {activeTab === 'Inventory' && <InventoryTab 
                        inventory={props.inventory} setInventory={props.setInventory}
                        suppliers={props.suppliers}
                        addDoc={props.addDoc} updateDoc={props.updateDoc} deleteDoc={props.deleteDoc}
                    />}
                    {activeTab === 'Locations' && <LocationsTab 
                        locations={props.locations} setLocations={props.setLocations}
                        addDoc={props.addDoc} updateDoc={props.updateDoc} deleteDoc={props.deleteDoc}
                    />}
                    {activeTab === 'Suppliers' && <SuppliersTab 
                        suppliers={props.suppliers} setSuppliers={props.setSuppliers}
                        addDoc={props.addDoc} updateDoc={props.updateDoc} deleteDoc={props.deleteDoc}
                    />}
                    {activeTab === 'Finance' && <FinanceTab 
                        transactions={props.transactions}
                        players={props.players}
                        events={props.events}
                        locations={props.locations}
                        companyDetails={props.companyDetails}
                    />}
                    {activeTab === 'Vouchers & Raffles' && <VouchersRafflesTab 
                        vouchers={props.vouchers} setVouchers={props.setVouchers}
                        raffles={props.raffles} setRaffles={props.setRaffles}
                        players={props.players}
                        addDoc={props.addDoc} updateDoc={props.updateDoc} deleteDoc={props.deleteDoc}
                    />}
                    {activeTab === 'Sponsors' && <SponsorsTab 
                        sponsors={props.sponsors} setSponsors={props.setSponsors}
                        companyDetails={props.companyDetails} setCompanyDetails={props.setCompanyDetails}
                        addDoc={props.addDoc} updateDoc={props.updateDoc} deleteDoc={props.deleteDoc}
                    />}
                    {activeTab === 'Leaderboard' && <LeaderboardTab players={props.players} />}
                    {activeTab === 'Settings' && <SettingsTab 
                        companyDetails={props.companyDetails} 
                        setCompanyDetails={props.setCompanyDetails}
                        socialLinks={props.socialLinks}
                        setSocialLinks={props.setSocialLinks}
                        carouselMedia={props.carouselMedia}
                        setCarouselMedia={props.setCarouselMedia}
                        onDeleteAllData={props.onDeleteAllData}
                        deleteAllPlayers={props.deleteAllPlayers}
                        addDoc={props.addDoc} updateDoc={props.updateDoc} deleteDoc={props.deleteDoc}
                        restoreFromBackup={restoreFromBackup}
                    />}
                    {activeTab === 'About' && <AboutTab companyDetails={props.companyDetails} />}
                </div>
            </main>
        </div>
    );
};