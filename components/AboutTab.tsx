import React, { useState } from 'react';
import { 
    InformationCircleIcon, ServerStackIcon, CpuChipIcon, ShieldCheckIcon, 
    PhotoIcon, CurrencyDollarIcon, SparklesIcon, TrophyIcon, CheckCircleIcon, 
    ArrowPathIcon, GlobeAltIcon, CircleStackIcon, UserIcon, TicketIcon,
    CalendarIcon, UsersIcon, BellIcon, ArchiveBoxIcon, MapPinIcon, TruckIcon,
    ChartPieIcon, GiftIcon, StarIcon, CogIcon, ClipboardListIcon, CrosshairsIcon, CrownIcon, ChevronDownIcon
} from './icons/Icons';

export const AboutTab: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<'admin' | 'player' | 'gamification' | 'automation'>('admin');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const docSections = [
        { id: 'admin', label: '1. Admin Command', icon: <ShieldCheckIcon className="w-4 h-4 text-red-400" /> },
        { id: 'player', label: '2. Player Interface', icon: <UserIcon className="w-4 h-4 text-blue-400" /> },
        { id: 'gamification', label: '3. Progression Engine', icon: <TrophyIcon className="w-4 h-4 text-amber-400" /> },
        { id: 'automation', label: '4. System Automations', icon: <CpuChipIcon className="w-4 h-4 text-emerald-400" /> },
    ] as const;

    const currentSection = docSections.find(s => s.id === selectedTab);

    return (
        <div className="w-full max-w-full overflow-hidden space-y-4 sm:space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <InformationCircleIcon className="w-6 h-6 text-red-500" />
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider drop-shadow-md">
                            Bosjol System Documentation
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 max-w-2xl">
                            The ultimate field manual. Complete step-by-step documentation for every module, dashboard, and automation engine within the tactical platform.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-mono font-bold bg-zinc-900/80 border border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                        PLATFORM MANUAL &bull; v3.0
                    </span>
                </div>
            </div>

            {/* Mobile Dropdown Menu for Documentation Sections */}
            <div className="sm:hidden relative border-b border-zinc-800/80 pb-3">
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-md"
                >
                    <div className="flex items-center gap-2.5">
                        {currentSection?.icon}
                        <span>{currentSection?.label}</span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                    <>
                        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" onClick={() => setDropdownOpen(false)} />
                        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1.5 space-y-0.5">
                            {docSections.map(section => (
                                <button
                                    key={section.id}
                                    onClick={() => {
                                        setSelectedTab(section.id);
                                        setDropdownOpen(false);
                                    }}
                                    className={`w-full text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-3 transition-colors ${
                                        selectedTab === section.id
                                            ? 'bg-red-600/20 text-red-400 border-l-2 border-red-500 font-extrabold'
                                            : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                                    }`}
                                >
                                    {section.icon}
                                    <span>{section.label}</span>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Desktop Navigation Tabs */}
            <div className="hidden sm:flex items-center gap-2 pb-2 border-b border-zinc-800/80">
                <TabButton active={selectedTab === 'admin'} onClick={() => setSelectedTab('admin')} icon={<ShieldCheckIcon className="w-4 h-4" />} label="1. Admin Command" />
                <TabButton active={selectedTab === 'player'} onClick={() => setSelectedTab('player')} icon={<UserIcon className="w-4 h-4" />} label="2. Player Interface" />
                <TabButton active={selectedTab === 'gamification'} onClick={() => setSelectedTab('gamification')} icon={<TrophyIcon className="w-4 h-4" />} label="3. Progression Engine" />
                <TabButton active={selectedTab === 'automation'} onClick={() => setSelectedTab('automation')} icon={<CpuChipIcon className="w-4 h-4" />} label="4. System Automations" />
            </div>

            <div className="pb-8">
                {/* ADMIN COMMAND SECTION */}
                {selectedTab === 'admin' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="p-4 rounded-xl bg-zinc-900/40 border border-red-900/30">
                            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                <ShieldCheckIcon className="w-5 h-5 text-red-500" /> Admin Command Center
                            </h3>
                            <p className="text-sm text-zinc-400 mb-6">
                                The Admin Dashboard is the central nervous system of the platform. It provides God-view access to every metric, player, and configuration. Below is a detailed breakdown of every module.
                            </p>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <ModuleCard title="Events Management" icon={<CalendarIcon className="w-5 h-5 text-blue-400" />}>
                                    <p className="text-xs text-zinc-300 mb-2">Create, schedule, and finalize tactical field events.</p>
                                    <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                                        <li><strong className="text-white">Creation:</strong> Set dates, maps, max capacities, and entry fees.</li>
                                        <li><strong className="text-white">Roster Tracking:</strong> View live signups and gear requests.</li>
                                        <li><strong className="text-white">Finalization:</strong> Execute the end-of-day sequence (distributes XP, logs finance, updates ranks).</li>
                                    </ul>
                                </ModuleCard>
                                
                                <ModuleCard title="Player Database" icon={<UsersIcon className="w-5 h-5 text-green-400" />}>
                                    <p className="text-xs text-zinc-300 mb-2">The complete CRM for your operator roster.</p>
                                    <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                                        <li><strong className="text-white">Profiles:</strong> View lifetime stats, match histories, and contact info.</li>
                                        <li><strong className="text-white">Manual Adjustments:</strong> Override XP, assign legendary badges, or edit waivers.</li>
                                        <li><strong className="text-white">Access Control:</strong> Instantly ban or promote players to admin status.</li>
                                    </ul>
                                </ModuleCard>

                                <ModuleCard title="Progression & Ranks" icon={<CrownIcon className="w-5 h-5 text-amber-400" />}>
                                    <p className="text-xs text-zinc-300 mb-2">Control the XP thresholds and military hierarchy.</p>
                                    <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                                        <li><strong className="text-white">Custom Tiers:</strong> Define precise XP boundaries for ranks (e.g., Bronze, Silver, General).</li>
                                        <li><strong className="text-white">Perks:</strong> Attach automatic rewards (e.g., "Free Entry Voucher") when players hit specific milestones.</li>
                                    </ul>
                                </ModuleCard>

                                <ModuleCard title="Inventory & Logistics" icon={<ArchiveBoxIcon className="w-5 h-5 text-purple-400" />}>
                                    <p className="text-xs text-zinc-300 mb-2">Track physical armory assets and rentals.</p>
                                    <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                                        <li><strong className="text-white">Stock Tracking:</strong> Monitor AEGs, masks, and HPA systems.</li>
                                        <li><strong className="text-white">Rental Income:</strong> Assign rental prices which automatically feed into the Finance ledger during event finalization.</li>
                                    </ul>
                                </ModuleCard>

                                <ModuleCard title="Finance Ledger" icon={<CurrencyDollarIcon className="w-5 h-5 text-emerald-400" />}>
                                    <p className="text-xs text-zinc-300 mb-2">Automated accounting and revenue tracking.</p>
                                    <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                                        <li><strong className="text-white">Auto-Income:</strong> Event signups and gear rentals are automatically booked here.</li>
                                        <li><strong className="text-white">Expense Tracking:</strong> Log field maintenance, BB restocks, and marshal pay.</li>
                                        <li><strong className="text-white">Analytics:</strong> View real-time P&L (Profit & Loss) and revenue breakdowns.</li>
                                    </ul>
                                </ModuleCard>

                                <ModuleCard title="Vouchers & Raffles" icon={<TicketIcon className="w-5 h-5 text-pink-400" />}>
                                    <p className="text-xs text-zinc-300 mb-2">Marketing and player retention tools.</p>
                                    <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                                        <li><strong className="text-white">Vouchers:</strong> Generate single-use or multi-use discount codes (Fixed % or $$ off).</li>
                                        <li><strong className="text-white">Raffles:</strong> Run end-of-season giveaways, assign tickets, and pick randomized winners securely.</li>
                                    </ul>
                                </ModuleCard>

                                <ModuleCard title="Locations & Suppliers" icon={<MapPinIcon className="w-5 h-5 text-orange-400" />}>
                                    <p className="text-xs text-zinc-300 mb-2">Manage physical venues and business partners.</p>
                                    <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                                        <li><strong className="text-white">Locations:</strong> Store GPS coordinates, briefing images, and field limits for multiple arenas.</li>
                                        <li><strong className="text-white">Suppliers:</strong> Maintain contact records for BB vendors, prop makers, and uniform suppliers.</li>
                                    </ul>
                                </ModuleCard>

                                <ModuleCard title="System Settings" icon={<CogIcon className="w-5 h-5 text-zinc-400" />}>
                                    <p className="text-xs text-zinc-300 mb-2">Deep platform configuration and data management.</p>
                                    <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                                        <li><strong className="text-white">Branding:</strong> Update logos, hero images, and dashboard audio tracks.</li>
                                        <li><strong className="text-white">Data Wipes:</strong> Securely execute full-system resets or player-only wipes for new seasons.</li>
                                        <li><strong className="text-white">Socials:</strong> Link Discord, Instagram, and web presences.</li>
                                    </ul>
                                </ModuleCard>
                            </div>
                        </div>
                    </div>
                )}

                {/* PLAYER INTERFACE SECTION */}
                {selectedTab === 'player' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="p-4 rounded-xl bg-zinc-900/40 border border-blue-900/30">
                            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                <UserIcon className="w-5 h-5 text-blue-500" /> Player Dashboard Experience
                            </h3>
                            <p className="text-sm text-zinc-400 mb-6">
                                The Player UI is designed for mobile-first engagement. It provides operators with a slick, gamified interface to track their career, sign up for ops, and flaunt their achievements.
                            </p>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <ModuleCard title="Operator Profile Card" icon={<ClipboardListIcon className="w-5 h-5 text-cyan-400" />}>
                                    <p className="text-xs text-zinc-300 mb-2">The digital ID and primary stat tracker.</p>
                                    <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                                        <li><strong className="text-white">Live Stats:</strong> Displays K/D ratio, Total XP, and current Rank progression bar.</li>
                                        <li><strong className="text-white">QR Integration:</strong> Used for quick check-ins at the field.</li>
                                        <li><strong className="text-white">Customization:</strong> Players can update their callsign, avatar, and bio directly.</li>
                                    </ul>
                                </ModuleCard>

                                <ModuleCard title="Event Queue & Signups" icon={<CrosshairsIcon className="w-5 h-5 text-red-400" />}>
                                    <p className="text-xs text-zinc-300 mb-2">Frictionless deployment interface.</p>
                                    <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                                        <li><strong className="text-white">Upcoming Ops:</strong> View dates, locations, and mission briefings for future games.</li>
                                        <li><strong className="text-white">1-Click Signup:</strong> Secure a slot instantly. Request rental gear (Masks, AEGs) during the signup flow.</li>
                                        <li><strong className="text-white">Withdrawal:</strong> Players can back out before the lock-in period without penalty.</li>
                                    </ul>
                                </ModuleCard>

                                <ModuleCard title="Badges & Honors Cabinet" icon={<SparklesIcon className="w-5 h-5 text-yellow-400" />}>
                                    <p className="text-xs text-zinc-300 mb-2">Visual representation of achievements.</p>
                                    <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                                        <li><strong className="text-white">Legendary Badges:</strong> Rare commendations awarded by admins (e.g., "Juggernaut", "Medic").</li>
                                        <li><strong className="text-white">Milestone Badges:</strong> Auto-unlocked based on stats (e.g., "1000 Kills", "Sharpshooter").</li>
                                        <li><strong className="text-white">Showcase:</strong> Publicly visible to other players on the leaderboard.</li>
                                    </ul>
                                </ModuleCard>

                                <ModuleCard title="Global Leaderboard" icon={<GlobeAltIcon className="w-5 h-5 text-emerald-400" />}>
                                    <p className="text-xs text-zinc-300 mb-2">Fostering healthy competition.</p>
                                    <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
                                        <li><strong className="text-white">Dynamic Ranking:</strong> Live updates of the top operators sorted by Total XP.</li>
                                        <li><strong className="text-white">Rivalry:</strong> See who is directly above or below you in the standings.</li>
                                    </ul>
                                </ModuleCard>
                            </div>
                        </div>
                    </div>
                )}

                {/* GAMIFICATION SECTION */}
                {selectedTab === 'gamification' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="p-4 rounded-xl bg-zinc-900/40 border border-amber-900/30">
                            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                <TrophyIcon className="w-5 h-5 text-amber-500" /> Progression Engine
                            </h3>
                            <p className="text-sm text-zinc-400 mb-6">
                                The system utilizes psychological progression loops to maximize player retention. Every action on the field translates to digital permanent records.
                            </p>

                            <div className="space-y-4">
                                <div className="p-4 bg-black/40 rounded-lg border border-zinc-800">
                                    <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
                                        <ArrowPathIcon className="w-4 h-4" /> The XP Mathematics
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="p-3 border border-zinc-800/80 rounded bg-zinc-900/50">
                                            <div className="text-green-400 font-bold mb-1">Base Participation</div>
                                            <div className="text-xs text-zinc-400">+500 XP per attended event. Rewards consistency regardless of skill level.</div>
                                        </div>
                                        <div className="p-3 border border-zinc-800/80 rounded bg-zinc-900/50">
                                            <div className="text-blue-400 font-bold mb-1">Combat Performance</div>
                                            <div className="text-xs text-zinc-400">+100 XP per Kill. +50 XP Headshot bonus. Incentivizes aggressive, tactical play.</div>
                                        </div>
                                        <div className="p-3 border border-zinc-800/80 rounded bg-zinc-900/50">
                                            <div className="text-red-400 font-bold mb-1">Penalties</div>
                                            <div className="text-xs text-zinc-400">-25 XP per Tactical Death. -200 XP No-Show penalty to ensure roster integrity.</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-black/40 rounded-lg border border-zinc-800 flex flex-col sm:flex-row gap-4 items-center">
                                    <div className="flex-shrink-0">
                                        <CrownIcon className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.4)]" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-1">Dynamic Rank Promotions</h4>
                                        <p className="text-xs text-zinc-400 leading-relaxed">
                                            When a player crosses an XP threshold defined in the Admin "Ranks" tab, the system immediately plays a level-up animation on their next login. If the rank has attached perks (e.g. <em>"10% off next rental"</em>), the system automatically deposits those rewards into the player's inventory.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* AUTOMATION SECTION */}
                {selectedTab === 'automation' && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="p-4 rounded-xl bg-zinc-900/40 border border-emerald-900/30">
                            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                <CpuChipIcon className="w-5 h-5 text-emerald-500" /> Background Automations
                            </h3>
                            <p className="text-sm text-zinc-400 mb-6">
                                To eliminate manual data entry, the Bosjol engine utilizes automated cascading functions to synchronize finance, attendance, and progression simultaneously.
                            </p>

                            <div className="space-y-3">
                                <AutomationStep 
                                    number="01" 
                                    title="Event Finalization Cascade" 
                                    desc="When an admin finalizes an event, a single click iterates through every signed-up player. It calculates their net XP based on inputted kills/deaths, updates their lifetime records, removes them from the active queue, and stamps the event as historical." 
                                />
                                <AutomationStep 
                                    number="02" 
                                    title="Financial Auto-Ledger" 
                                    desc="During finalization, the system intercepts the player count and rental gear requests. It calculates (Players × Entry Fee) + (Rental Requests × Rental Price) and automatically injects a precise Income record into the Finance tab." 
                                />
                                <AutomationStep 
                                    number="03" 
                                    title="Seasonal Rank Reset" 
                                    desc="If a 'Next Rank Reset Date' is configured in Settings, the system monitors the clock. Upon the exact date, it strips all active players of their XP and resets them to the baseline tier, keeping their badges intact for prestige." 
                                />
                                <AutomationStep 
                                    number="04" 
                                    title="Real-Time Sync (Supabase)" 
                                    desc="Using PostgreSQL WebSockets, if Player A signs up on their phone, Admin B sees the roster update instantly on their desktop without refreshing the page. Zero-latency state synchronization." 
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
            active
                ? 'bg-red-600 text-white shadow-lg shadow-red-900/40 border border-red-500'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-transparent'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const ModuleCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800/80 hover:border-zinc-700 transition-colors shadow-inner">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/60 mb-3">
            {icon}
            <h4 className="font-bold text-white text-sm uppercase tracking-wide">{title}</h4>
        </div>
        {children}
    </div>
);

const AutomationStep: React.FC<{ number: string; title: string; desc: string }> = ({ number, title, desc }) => (
    <div className="flex gap-4 p-3 rounded-lg bg-zinc-950/40 border border-zinc-800/60">
        <div className="text-xl font-black font-mono text-emerald-900/80 bg-emerald-500/10 h-12 w-12 flex items-center justify-center rounded-lg border border-emerald-500/20 flex-shrink-0">
            {number}
        </div>
        <div>
            <h4 className="font-bold text-white text-sm mb-1">{title}</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
        </div>
    </div>
);
