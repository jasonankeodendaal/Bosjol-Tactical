
import React, { useState, useEffect, useRef, useMemo, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player, GameEvent, Rank, GamificationSettings, Badge, Sponsor, CompanyDetails, PaymentStatus, EventAttendee, Voucher, MatchRecord, EventStatus, EventType, InventoryItem, Supplier, Transaction, Location, SocialLink, GamificationRule, PlayerStats, Raffle, RaffleTicket, LegendaryBadge, Prize, RentalSignup, CarouselMedia } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { UsersIcon, CogIcon, CalendarIcon, TrashIcon, ShieldCheckIcon, PlusIcon, TrophyIcon, BuildingOfficeIcon, SparklesIcon, PencilIcon, XIcon, TicketIcon, AtSymbolIcon, PhoneIcon, GlobeAltIcon, ArrowLeftIcon, ArchiveBoxIcon, CurrencyDollarIcon, TruckIcon, MapPinIcon, MinusIcon, KeyIcon, Bars3Icon, ExclamationTriangleIcon, InformationCircleIcon, CreditCardIcon, CheckCircleIcon, PrinterIcon, PlusCircleIcon, CodeBracketIcon, ChatBubbleLeftRightIcon } from './icons/Icons';
import { BadgePill } from './BadgePill';
import { Modal } from './Modal';
import { MOCK_RANKS } from '../constants';
import { PlayerProfilePage } from './PlayerProfilePage';
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
import { ApiSetupTab } from './ApiSetupTab';
import { ChatsTab } from './ChatsTab';
import { DataContext, DataContextType } from '../data/DataContext';
import { AuthContext } from '../auth/AuthContext';

export type AdminDashboardProps = Omit<DataContextType, 'loading' | 'isSeeding' | 'seedInitialData' | 'updatePlayerDoc' | 'addEventDoc' | 'deleteEventDoc' | 'updateEventDoc'> & {
    onDeleteAllData: () => void;
    addPlayerDoc: (playerData: Omit<Player, 'id'>) => Promise<void>;
};


type Tab = 'Events' | 'Players' | 'Chats' | 'Progression' | 'Inventory' | 'Locations' | 'Suppliers' | 'Finance' | 'Vouchers & Raffles' | 'Sponsors' | 'Leaderboard' | 'Settings' | 'API Setup';
type View = 'dashboard' | 'player_profile' | 'manage_event';

const NewPlayerModal: React.FC<{
    onClose: () => void;
    players: Player[];
    companyDetails: CompanyDetails;
    addPlayerDoc: (playerData: Omit<Player, 'id'>) => Promise<void>;
}> = ({ onClose, players, companyDetails, addPlayerDoc }) => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        phone: '',
        pin: '',
        age: '',
        idNumber: '',
    });

    const handleSave = async () => {
        // Validation
        const ageNum = Number(formData.age);
        if (!formData.name || !formData.surname || !formData.email || !formData.pin || !formData.age || !formData.idNumber) {
            alert('Please fill in all required fields.');
            return;
        }
        if (!/^\d{4}$/.test(formData.pin)) {
            alert('PIN must be 4 digits.');
            return;
        }
        if (ageNum < companyDetails.minimumSignupAge) {
            alert(`Player must be at least ${companyDetails.minimumSignupAge} years old to sign up.`);
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
        
        const newPlayerData: Omit<Player, 'id'> = {
            name: formData.name,
            surname: formData.surname,
            playerCode: newPlayerCode,
            email: formData.email,
            phone: formData.phone,
            pin: formData.pin,
            age: ageNum,
            idNumber: formData.idNumber,
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

        await addPlayerDoc(newPlayerData);
        onClose();
    };

    return (
        <Modal isOpen={true} onClose={onClose} title="Create New Player">
            <div className="space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="First Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                    <Input label="Surname" value={formData.surname} onChange={e => setFormData(f => ({ ...f, surname: e.target.value }))} />
                </div>
                <Input label="Email" type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                <Input label="Phone" type="tel" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Age" type="number" value={formData.age} onChange={e => setFormData(f => ({ ...f, age: e.target.value }))} />
                    <Input label="ID Number" value={formData.idNumber} onChange={e => setFormData(f => ({ ...f, idNumber: e.target.value }))} />
                </div>
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
        {name: 'Chats', icon: <ChatBubbleLeftRightIcon className="w-5 h-5"/>},
        {name: 'Progression', icon: <ShieldCheckIcon className="w-5 h-5"/>},
        {name: 'Inventory', icon: <ArchiveBoxIcon className="w-5 h-5"/>},
        {name: 'Locations', icon: <MapPinIcon className="w-5 h-5"/>},
        {name: 'Suppliers', icon: <TruckIcon className="w-5 h-5"/>},
        {name: 'Finance', icon: <CurrencyDollarIcon className="w-5 h-5"/>},
        {name: 'Vouchers & Raffles', icon: <TicketIcon className="w-5 h-5"/>},
        {name: 'Sponsors', icon: <SparklesIcon className="w-5 h-5"/>},
        {name: 'Leaderboard', icon: <TrophyIcon className="w-5 h-5"/>},
        {name: 'Settings', icon: <CogIcon className="w-5 h-5"/>},
        {name: 'API Setup', icon: <CodeBracketIcon className="w-5 h-5"/>},
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

const PlayerListItem = React.memo(({ player, rank, onViewPlayer }: { player: Player; rank: Rank; onViewPlayer: (id: string) => void }) => {
    return (
        <li onClick={() => onViewPlayer(player.id)} className="flex items-center p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer border border-transparent hover:border-red-600/50">
            <img src={player.avatarUrl} alt={player.name} className="w-12 h-12 rounded-full object-cover mr-4" />
            <div className="flex-grow">
                <p className="font-bold text-white">{player.name} "{player.callsign}" {player.surname}</p>
                <div className="flex items-center text-sm text-gray-400">
                    <img src={rank.iconUrl} alt={rank.name} className="w-5 h-5 mr-1.5"/>
                    <span>{rank.name}</span>
                    <span className="mx-2">|</span>
                    <span className="font-mono">{player.playerCode}</span>
                </div>
            </div>
            <div className="text-right">
                <p className="font-bold text-red-400 text-lg">{player.stats.xp.toLocaleString()} XP</p>
                <p className="text-xs text-gray-500">K/D: {(player.stats.deaths > 0 ? player.stats.kills / player.stats.deaths : player.stats.kills).toFixed(2)}</p>
            </div>
        </li>
    );
});

const PlayersTab: React.FC<Pick<AdminDashboardProps, 'players' | 'addPlayerDoc' | 'ranks' | 'companyDetails'> & { onViewPlayer: (id: string) => void }> = ({ players, addPlayerDoc, ranks, companyDetails, onViewPlayer }) => {
    const [showNewPlayerModal, setShowNewPlayerModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPlayers = players.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.playerCode.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => b.stats.xp - a.stats.xp);

    return (
        <div>
            {showNewPlayerModal && <NewPlayerModal onClose={() => setShowNewPlayerModal(false)} players={players} addPlayerDoc={addPlayerDoc} companyDetails={companyDetails} />}
            <DashboardCard title="Player Management" icon={<UsersIcon className="w-6 h-6" />}>
                <div className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                        <Input 
                            placeholder="Search by name, callsign, or code..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full sm:w-72"
                        />
                        <Button onClick={() => setShowNewPlayerModal(true)} size="sm" className="w-full sm:w-auto">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Add New Player
                        </Button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto pr-2">
                        <ul className="space-y-2">
                            {filteredPlayers.map(p => {
                                const rank = ranks.find(r => r.id === p.rank.id) || p.rank;
                                return (
                                    <PlayerListItem key={p.id} player={p} rank={rank} onViewPlayer={onViewPlayer} />
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
};

const LeaderboardTab: React.FC<{ players: Player[] }> = ({ players }) => {
    return (
        <DashboardCard title="Global Leaderboard" icon={<TrophyIcon className="w-6 h-6" />} fullHeight>
            <Leaderboard players={players} />
        </DashboardCard>
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

    const { players, setPlayers, events, setEvents, legendaryBadges, ranks, updateDoc, addDoc, deleteDoc, restoreFromBackup } = props;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab') as Tab | null;
        const validTabs: Tab[] = ['Events', 'Players', 'Chats', 'Progression', 'Inventory', 'Locations', 'Suppliers', 'Finance', 'Vouchers & Raffles', 'Sponsors', 'Leaderboard', 'Settings', 'API Setup'];
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

    useEffect(() => {
        if(auth) {
            auth.setHelpTopic(getHelpTopic());
        }
    }, [activeTab, view, auth]);

    const handleViewPlayer = useCallback((id: string) => {
        setSelectedPlayerId(id);
        setView('player_profile');
    }, []);

    const handleManageEvent = (id: string | null) => {
        setSelectedEventId(id);
        setView('manage_event');
    }
    
    const handleSaveEvent = async (eventData: GameEvent) => {
        if (eventData.id) {
            await updateDoc('events', eventData);
        } else {
            const { id, ...newEventData } = eventData;
            await addDoc('events', newEventData);
        }
        setView('dashboard');
    }

    const handleDeleteEvent = async (eventId: string) => {
        if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            await deleteDoc('events', eventId);
            setView('dashboard');
        }
    }


    const handleUpdatePlayer = async (updatedPlayer: Player) => {
        await updateDoc('players', updatedPlayer);
    };
    
    const selectedPlayer = players.find(p => p.id === selectedPlayerId);

    if (view === 'player_profile' && selectedPlayer) {
        return (
            <PlayerProfilePage 
                player={selectedPlayer} 
                events={events} 
                legendaryBadges={legendaryBadges}
                onBack={() => setView('dashboard')}
                onUpdatePlayer={handleUpdatePlayer}
                ranks={ranks}
            />
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
                onBack={() => setView('dashboard')}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
                setPlayers={props.setPlayers}
                setTransactions={props.setTransactions}
            />
        )
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
            {activeTab === 'Events' && <EventsTab events={events} onManageEvent={handleManageEvent} />}
            {activeTab === 'Players' && <PlayersTab players={props.players} addPlayerDoc={props.addPlayerDoc} ranks={props.ranks} companyDetails={props.companyDetails} onViewPlayer={handleViewPlayer}/>}
            {activeTab === 'Chats' && <ChatsTab />}
            {activeTab === 'Progression' && <ProgressionTab 
                ranks={props.ranks} setRanks={props.setRanks}
                badges={props.badges} setBadges={props.setBadges}
                legendaryBadges={props.legendaryBadges} setLegendaryBadges={props.setLegendaryBadges}
                gamificationSettings={props.gamificationSettings} setGamificationSettings={props.setGamificationSettings}
                addDoc={props.addDoc} updateDoc={props.updateDoc} deleteDoc={props.deleteDoc}
            />}
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
                addDoc={props.addDoc} updateDoc={props.updateDoc} deleteDoc={props.deleteDoc}
                restoreFromBackup={restoreFromBackup}
            />}
            {activeTab === 'API Setup' && <ApiSetupTab creatorDetails={props.creatorDetails} />}
        </div>
    );
};