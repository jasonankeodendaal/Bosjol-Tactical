import React, { useState, useEffect, useRef, useMemo } from 'react';
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

const SettingsTab: React.FC<Pick<AdminDashboardProps, 'companyDetails' | 'setCompanyDetails' | 'onDeleteAllData'>> = ({ companyDetails, setCompanyDetails, onDeleteAllData }) => {
    const [formData, setFormData] = useState(companyDetails);
    const [socialLink, setSocialLink] = useState({ id: '', name: '', url: '', iconUrl: '' });
    
    useEffect(() => {
        setFormData(companyDetails);
    }, [companyDetails]);

    const handleSave = () => {
        setCompanyDetails(formData);
        alert("Company details saved!");
    };
    
    const handleSocialLinkChange = (id: string, field: keyof SocialLink, value: string) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.map(link => link.id === id ? { ...link, [field]: value } : link)
        }));
    };

    const handleAddSocialLink = () => {
        if (!socialLink.name || !socialLink.url) return;
        setFormData(prev => ({
            ...prev,
            socialLinks: [...prev.socialLinks, { ...socialLink, id: `sl${Date.now()}` }]
        }));
        setSocialLink({ id: '', name: '', url: '', iconUrl: '' });
    };
    
    const handleRemoveSocialLink = (id: string) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.filter(link => link.id !== id)
        }));
    };

    const isDirty = JSON.stringify(formData) !== JSON.stringify(companyDetails);

    return (
        <div className="space-y-6">
            <DashboardCard title="Company Details" icon={<BuildingOfficeIcon className="w-6 h-6" />}>
                 <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Company Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                        <Input label="Website" value={formData.website} onChange={e => setFormData(f => ({ ...f, website: e.target.value }))} />
                        <Input label="Phone" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
                        <Input label="Email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                        <Input label="Address" value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} className="md:col-span-2"/>
                    </div>
                     <div className="pt-4 border-t border-zinc-700">
                        <h4 className="font-semibold text-gray-200 mb-2">Branding & Assets</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">Company Logo</label>
                                <ImageUpload onUpload={(url) => setFormData(f => ({...f, logoUrl: url}))} accept="image/*" />
                                {formData.logoUrl && <img src={formData.logoUrl} alt="logo preview" className="w-24 h-24 object-contain rounded-md bg-zinc-800 p-1 mt-2" />}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">Login Screen Background (Image/Video)</label>
                                <ImageUpload onUpload={(url) => setFormData(f => ({...f, loginBackgroundUrl: url}))} accept="image/*,video/*" />
                            </div>
                             <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">Login Screen Audio</label>
                                <ImageUpload onUpload={(url) => setFormData(f => ({...f, loginAudioUrl: url}))} accept="audio/*" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">Android APK File</label>
                                <ImageUpload onUpload={(url) => setFormData(f => ({...f, apkUrl: url}))} accept=".apk" />
                            </div>
                        </div>
                     </div>
                      <div className="pt-4 border-t border-zinc-700">
                        <h4 className="font-semibold text-gray-200 mb-2">Social Links</h4>
                        {formData.socialLinks.map(link => (
                            <div key={link.id} className="flex items-center gap-2 mb-2">
                                <Input value={link.name} onChange={(e) => handleSocialLinkChange(link.id, 'name', e.target.value)} placeholder="Name (e.g., Facebook)" />
                                <Input value={link.url} onChange={(e) => handleSocialLinkChange(link.id, 'url', e.target.value)} placeholder="URL" />
                                <Input value={link.iconUrl} onChange={(e) => handleSocialLinkChange(link.id, 'iconUrl', e.target.value)} placeholder="Icon URL" />
                                <Button variant="danger" size="sm" className="!p-2.5" onClick={() => handleRemoveSocialLink(link.id)}><TrashIcon className="w-5 h-5"/></Button>
                            </div>
                        ))}
                         <div className="flex items-end gap-2">
                            <Input value={socialLink.name} onChange={(e) => setSocialLink(s => ({...s, name: e.target.value}))} placeholder="Name" />
                            <Input value={socialLink.url} onChange={(e) => setSocialLink(s => ({...s, url: e.target.value}))} placeholder="URL" />
                            <Input value={socialLink.iconUrl} onChange={(e) => setSocialLink(s => ({...s, iconUrl: e.target.value}))} placeholder="Icon URL" />
                            <Button variant="secondary" size="sm" className="!p-2.5" onClick={handleAddSocialLink}><PlusIcon className="w-5 h-5"/></Button>
                        </div>
                     </div>
                     <div className="pt-4 border-t border-zinc-700">
                        <Button onClick={handleSave} disabled={!isDirty} className="w-full">
                            {isDirty ? 'Save Company Details' : 'Saved'}
                        </Button>
                     </div>
                 </div>
            </DashboardCard>
             <DashboardCard title="Danger Zone" icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-500"/>}>
                <div className="p-6 space-y-4">
                    <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg">
                        <h4 className="font-bold">Delete All Transactional Data</h4>
                        <p className="text-sm mb-3">This will permanently delete all players, events, inventory, financials, and other user-generated data. System data like ranks and badges will not be affected. This action cannot be undone.</p>
                        <Button onClick={onDeleteAllData} variant="danger">
                            <TrashIcon className="w-5 h-5 mr-2" />
                            Delete All Data
                        </Button>
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
}

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
        // {name: 'About', icon: <InformationCircleIcon className="w-5 h-5"/>},
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

const PlayersTab: React.FC<AdminDashboardProps & { onViewPlayer: (id: string) => void }> = ({ players, setPlayers, onViewPlayer }) => {
    const [showNewPlayerModal, setShowNewPlayerModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPlayers = players.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.callsign.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.playerCode.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a,b) => b.stats.xp - a.stats.xp);

    return (
        <div>
            {showNewPlayerModal && <NewPlayerModal onClose={() => setShowNewPlayerModal(false)} players={players} setPlayers={setPlayers} />}
            <DashboardCard title="Player Management" icon={<UsersIcon className="w-6 h-6" />}>
                <div className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                        <Input 
                            placeholder="Search by name, callsign, or code..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full sm:w-72"
                        />
                        <Button onClick={() => setShowNewPlayerModal(true)} className="w-full sm:w-auto">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Add New Player
                        </Button>
                    </div>
                    <div className="max-h-[60vh] overflow-y-auto pr-2">
                        <ul className="space-y-2">
                            {filteredPlayers.map(p => {
                                const rank = getRankForPlayer(p);
                                return (
                                    <li key={p.id} onClick={() => onViewPlayer(p.id)} className="flex items-center p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer border border-transparent hover:border-red-600/50">
                                        <img src={p.avatarUrl} alt={p.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                                        <div className="flex-grow">
                                            <p className="font-bold text-white">{p.name} "{p.callsign}" {p.surname}</p>
                                            <div className="flex items-center text-sm text-gray-400">
                                                <img src={rank.iconUrl} alt={rank.name} className="w-5 h-5 mr-1.5"/>
                                                <span>{rank.name}</span>
                                                <span className="mx-2">|</span>
                                                <span className="font-mono">{p.playerCode}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-red-400 text-lg">{p.stats.xp.toLocaleString()} XP</p>
                                            <p className="text-xs text-gray-500">K/D: {(p.stats.deaths > 0 ? p.stats.kills / p.stats.deaths : p.stats.kills).toFixed(2)}</p>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
};


export const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const [activeTab, setActiveTab] = useState<Tab>('Events');
    const [view, setView] = useState<View>('dashboard');
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    const { players, setPlayers, events, setEvents, legendaryBadges, setLegendaryBadges } = props;

    const handleViewPlayer = (id: string) => {
        setSelectedPlayerId(id);
        setView('player_profile');
    };

    const handleManageEvent = (id: string | null) => {
        setSelectedEventId(id);
        setView('manage_event');
    }

    const handleUpdatePlayer = (updatedPlayer: Player) => {
        setPlayers(prev => prev.map(p => p.id === updatedPlayer.id ? updatedPlayer : p));
    };
    
    const selectedPlayer = players.find(p => p.id === selectedPlayerId);

    if (view === 'player_profile' && selectedPlayer) {
        return <PlayerProfilePage 
            player={selectedPlayer} 
            events={events} 
            legendaryBadges={legendaryBadges}
            onBack={() => setView('dashboard')}
            onUpdatePlayer={handleUpdatePlayer}
        />;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
            {activeTab === 'Players' && <PlayersTab {...props} onViewPlayer={handleViewPlayer}/>}
            {activeTab === 'Finance' && <FinanceTab {...props} />}
            {activeTab === 'Suppliers' && <SuppliersTab {...props} />}
            {activeTab === 'Locations' && <LocationsTab {...props} />}
            {activeTab === 'Settings' && <SettingsTab companyDetails={props.companyDetails} setCompanyDetails={props.setCompanyDetails} onDeleteAllData={props.onDeleteAllData} />}
            
            {/* Render other tab content based on activeTab */}
            {['Events', 'Progression', 'Inventory', 'Vouchers & Raffles', 'Sponsors', 'About'].includes(activeTab) && (
                <DashboardCard title={activeTab} icon={<CogIcon className="w-6 h-6"/>}>
                    <p className="p-6 text-center text-gray-500">
                        The "{activeTab}" tab is under construction. Check back later for more features.
                    </p>
                </DashboardCard>
            )}
        </div>
    );
};
