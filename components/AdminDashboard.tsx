
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
import { DataContext, DataContextType } from '../data/DataContext';
import { AuthContext } from '../auth/AuthContext';
import { SendCredentialsModal } from './SendCredentialsModal';

export type AdminDashboardProps = Omit<DataContextType, 'loading' | 'isSeeding' | 'seedInitialData' | 'updatePlayerDoc' | 'addEventDoc' | 'deleteEventDoc' | 'updateEventDoc'> & {
    onDeleteAllData: () => void;
    deleteAllPlayers: () => Promise<void>;
    addPlayerDoc: (playerData: Omit<Player, 'id'>) => Promise<string>;
};


type Tab = 'Events' | 'Players' | 'Notifications' | 'Progression' | 'Ranks' | 'Inventory' | 'Locations' | 'Suppliers' | 'Finance' | 'Vouchers & Raffles' | 'Sponsors' | 'Leaderboard' | 'Settings' | 'About';
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
    const [playerCode, setPlayerCode] = useState('');
    const [playerCodeError, setPlayerCodeError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [newlyCreatedPlayer, setNewlyCreatedPlayer] = useState<Player | null>(null);
    const dataContext = useContext(DataContext);


    useEffect(() => {
        const { name, surname } = formData;
        if (name && surname) {
            const initials = (name.charAt(0) + surname.charAt(0)).toUpperCase();
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
        // Validation
        const ageNum = Number(formData.age);
        if (!formData.name || !formData.surname || !formData.email || !formData.pin || !formData.age || !formData.idNumber || !playerCode) {
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
       
        const assignedCallsign = formData.callsign.trim() || formData.name.trim();

        const newPlayerData: Omit<Player, 'id'> = {
            name: formData.name,
            surname: formData.surname,
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
                        <Input label="First Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                        <Input label="Surname" value={formData.surname} onChange={e => setFormData(f => ({ ...f, surname: e.target.value }))} />
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
                            <Input label="Player Code" value={playerCode} onChange={handlePlayerCodeChange} />
                            {playerCodeError && <p className="text-red-500 text-[10px] sm:text-xs mt-0.5">{playerCodeError}</p>}
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
                    <Input label="6-Digit PIN" type="password" value={formData.pin} onChange={e => setFormData(f => ({ ...f, pin: e.target.value.replace(/\D/g, '') }))} maxLength={6} />
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

    const tabs: {name: Tab, icon: React.ReactNode, badgeCount?: number}[] = [
        {name: 'Events', icon: <CalendarIcon className="w-5 h-5"/>},
        {name: 'Players', icon: <UsersIcon className="w-5 h-5"/>},
        {name: 'Notifications', icon: <BellIcon className="w-5 h-5"/>, badgeCount: unreadNotificationsCount},
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
                                        {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                                            <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                {tab.badgeCount}
                                            </span>
                                        )}
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

const PlayerListItem = React.memo(({ player, rank, onViewPlayer, onDeletePlayer }: { player: Player; rank: Tier; onViewPlayer: (id: string) => void; onDeletePlayer: (id: string) => void }) => {
    const kills = player.stats?.kills || 0;
    const deaths = player.stats?.deaths || 0;
    const xp = player.stats?.xp || 0;
    const kdr = deaths > 0 ? kills / deaths : kills;

    return (
        <div 
            onClick={() => onViewPlayer(player.id)} 
            className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 hover:border-red-600/50 hover:bg-zinc-900/80 transition-all cursor-pointer flex items-center justify-between gap-2 group"
        >
            <div className="flex items-center gap-2 min-w-0">
                <img src={player.avatarUrl} alt={player.name} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border border-zinc-700 flex-shrink-0" />
                <div className="min-w-0">
                    <p className="font-bold text-white text-xs sm:text-sm truncate">
                        {(player.name || 'Unnamed')} <span className="text-red-400">"{player.callsign || 'N/A'}"</span>
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-400 truncate">
                        {rank.iconUrl && <img src={rank.iconUrl} alt={rank.name} className="w-3.5 h-3.5 flex-shrink-0"/>}
                        <span className="truncate">{rank.name}</span>
                        <span className="text-zinc-600">&bull;</span>
                        <span className="font-mono text-zinc-300 font-bold">{player.playerCode || 'NO-CODE'}</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
                <div className="text-right">
                    <p className="font-bold text-amber-400 text-xs sm:text-sm">{xp.toLocaleString()} RP</p>
                    <p className="text-[9px] text-zinc-500">K/D {kdr.toFixed(1)}</p>
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
    const [showNewPlayerModal, setShowNewPlayerModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPlayers = players.filter(p => 
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.callsign || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.playerCode || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => (b.stats?.xp ?? 0) - (a.stats?.xp ?? 0));

    return (
        <div className="w-full space-y-3 sm:space-y-4">
            {showNewPlayerModal && <NewPlayerModal onClose={() => setShowNewPlayerModal(false)} players={players} addPlayerDoc={addPlayerDoc} companyDetails={companyDetails} ranks={ranks} />}
            
            {/* Top Free-View Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                    <UsersIcon className="w-5 h-5 text-red-500" />
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                            Registered Operators
                        </h2>
                        <p className="text-[10px] sm:text-xs text-zinc-400">
                            {players.length} total players registered &bull; Rank Points & match statistics
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Search callsign, code, name..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="!text-xs !py-1 w-44 sm:w-60"
                    />
                    <Button onClick={() => setShowNewPlayerModal(true)} size="sm" className="!py-1 !px-2.5 text-xs flex-shrink-0">
                        <PlusIcon className="w-3.5 h-3.5 mr-1" /> Add Player
                    </Button>
                </div>
            </div>

            {/* Side by side grid on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 max-h-[72vh] overflow-y-auto pr-1">
                {filteredPlayers.map(p => {
                    const rank = p.rank || UNRANKED_TIER;
                    return (
                        <PlayerListItem key={p.id} player={p} rank={rank} onViewPlayer={onViewPlayer} onDeletePlayer={onDeletePlayer} />
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

    const getRangeForTier = (tier: Tier, rank: Rank, rankIndex: number) => {
        const sortedTiersInRank = [...(rank.tiers || [])].sort((a,b) => a.minXp - b.minXp);
        const tierIndex = sortedTiersInRank.findIndex(r => r.id === tier.id);
        const nextTierInRank = sortedTiersInRank[tierIndex + 1];

        if (nextTierInRank) {
            return `${tier.minXp.toLocaleString()} - ${(nextTierInRank.minXp - 1).toLocaleString()} RP`;
        }
        
        const nextRank = ranks[rankIndex + 1];
        if(nextRank && nextRank.tiers && nextRank.tiers.length > 0) {
            const nextRankFirstTier = [...nextRank.tiers].sort((a,b) => a.minXp - b.minXp)[0];
            return `${tier.minXp.toLocaleString()} - ${(nextRankFirstTier.minXp - 1).toLocaleString()} RP`;
        }
        return `${tier.minXp.toLocaleString()}+ RP`;
    }

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-5 h-5 text-red-500" />
                    <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-wider">Rank Structure & Hierarchy</h2>
                </div>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/80 p-2.5 sm:p-3 rounded-lg flex items-center gap-2.5 text-[11px] sm:text-xs text-zinc-300">
                <InformationCircleIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
                <p>Read-only overview of rank badges and tiers. Manage progression rules in the <strong className="text-white">Progression</strong> tab.</p>
            </div>

            <div className="space-y-4 sm:space-y-6">
                {ranks.map((rank, rankIndex) => (
                    <div key={rank.id} className="p-3 sm:p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/20 space-y-3">
                        <div className="flex items-center gap-3 sm:gap-4 pb-2 border-b border-zinc-800/60">
                            <img src={rank.rankBadgeUrl} alt={rank.name} className="w-10 h-10 sm:w-16 sm:h-16 flex-shrink-0 object-contain drop-shadow-[0_0_12px_rgba(239,68,68,0.35)]"/>
                            <div className="min-w-0">
                                <h3 className="text-sm sm:text-xl font-black text-white uppercase tracking-wider">{rank.name}</h3>
                                <p className="text-[10px] sm:text-xs text-zinc-400 truncate mt-0.5">{rank.description || 'Standard tactical rank bracket'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {(rank.tiers || []).sort((a,b) => a.minXp - b.minXp).map((sub) => (
                                <div key={sub.id} className="p-2 sm:p-2.5 rounded-lg border border-zinc-800/60 bg-zinc-900/40 hover:bg-zinc-900/80 transition-all flex items-start gap-2.5">
                                    <img src={sub.iconUrl} alt={sub.name} className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0 object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]"/>
                                    <div className="min-w-0 flex-grow">
                                        <div className="flex items-center justify-between gap-1 flex-wrap">
                                            <h4 className="font-bold text-white text-xs sm:text-sm truncate">{sub.name}</h4>
                                            <span className="text-[9px] font-mono text-green-400 font-bold bg-zinc-800 px-1.5 py-0.2 rounded border border-green-500/20">{getRangeForTier(sub, rank, rankIndex)}</span>
                                        </div>
                                        {sub.perks && sub.perks.length > 0 && (
                                            <ul className="mt-1 text-[9px] sm:text-[11px] text-zinc-400 space-y-0.5">
                                                {sub.perks.map((p, i) => (
                                                    <li key={i} className="flex items-center gap-1 truncate">
                                                        <CheckCircleIcon className="w-2.5 h-2.5 text-red-400 flex-shrink-0" />
                                                        <span className="truncate">{p}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {ranks.length === 0 && (
                    <div className="text-center text-zinc-500 py-8 text-xs sm:text-base">No ranks have been configured. Go to the 'Progression' tab to set them up.</div>
                )}
            </div>
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
        const validTabs: Tab[] = ['Events', 'Players', 'Notifications', 'Progression', 'Ranks', 'Inventory', 'Locations', 'Suppliers', 'Finance', 'Vouchers & Raffles', 'Sponsors', 'Leaderboard', 'Settings', 'About'];
        if (tab && validTabs.includes(tab)) {
            setActiveTab(tab);
        }
    }, []);

    const getHelpTopic = () => {
        if (view === 'player_profile') return 'admin-player-profile';
        if (view === 'manage_event') return 'admin-manage-event';
        // Format tab name for help content key
        const formattedTab = activeTab.toLowerCase().replace(' & ', '-').replace(/\s+/g, '-');
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
                    {adminUser?.avatarUrl && <img src={adminUser.avatarUrl} alt={adminUser?.name || 'Admin'} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-red-600 flex-shrink-0"/>}
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
                    {activeTab === 'About' && <AboutTab />}
                </div>
            </main>
        </div>
    );
};