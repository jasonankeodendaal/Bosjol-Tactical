import React, { useState } from 'react';
import { CompanyDetails } from '../types';
import { 
    ShieldCheckIcon, 
    SparklesIcon, 
    TerminalIcon, 
    UsersIcon, 
    TrophyIcon, 
    BoltIcon, 
    CpuChipIcon, 
    ServerIcon,
    GlobeAltIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    DocumentTextIcon,
    BuildingOfficeIcon,
    RocketLaunchIcon,
    CircleStackIcon,
    ClockIcon,
    ArrowPathIcon,
    TicketIcon,
    QrCodeIcon,
    MapPinIcon,
    CreditCardIcon,
    KeyIcon
} from './icons/Icons';

interface AboutTabProps {
    companyDetails?: CompanyDetails;
}

export const AboutTab: React.FC<AboutTabProps> = ({ companyDetails }) => {
    const [activeSubTab, setActiveSubTab] = useState<'overview' | 'architecture' | 'gamification' | 'automation' | 'fieldguide'>('overview');
    const [faqSearch, setFaqSearch] = useState('');
    const [expandedFaq, setExpandedFaq] = useState<string | null>('faq-1');

    const faqs = [
        {
            id: 'faq-1',
            category: 'Event Operations',
            question: 'How does single-click Event Finalization cascade stats across operators?',
            answer: 'When a Game Master clicks "Finalize Event" on the Manage Event page, the engine loops through all signed-up operators. It calculates earned XP from recorded kills (+100 XP), headshot bonuses (+50 XP), and event attendance (+500 XP), subtracts death penalties (-25 XP), updates their lifetime career stats, and automatically posts the event earnings to the Financial Ledger.'
        },
        {
            id: 'faq-2',
            category: 'Data & Persistence',
            question: 'What happens if the internet connection drops during an airsoft event?',
            answer: 'The Bosjol engine utilizes dual-layer offline fallbacks (`localStorage` + `DataContext` optimistic state). Any player edits, check-ins, or score entries remain saved on the local device and automatically synchronize to the Supabase cloud database as soon as network connectivity is restored.'
        },
        {
            id: 'faq-3',
            category: 'Ranks & Gamification',
            question: 'How do Rank Level-Ups and Perk unlocks work?',
            answer: 'As players accumulate XP from field matches, the engine compares their total XP against the configured Rank Hierarchy (Recruit -> Operative -> Veteran -> Specialist -> Commander -> Tactical Elite). Upon crossing a rank threshold, a level-up notification is generated and any attached rank perks (e.g. rental discounts, free raffle entries) auto-deposit to their profile.'
        },
        {
            id: 'faq-4',
            category: 'Financial Ledger',
            question: 'How are entry fees and rental gear revenue calculated automatically?',
            answer: 'During event finalization, the system checks total attended signups and requested rental gear. It computes `(Attended Players × Base Entry Fee) + (Rentals Issued × Rental Price)` and injects a detailed income transaction record into the Finance tab without requiring manual data entry.'
        },
        {
            id: 'faq-5',
            category: 'Security & Access',
            question: 'How are player credentials and admin privileges secured?',
            answer: 'The system uses Supabase Row-Level Security (RLS) combined with JWT role authorization. Super Admins and Field Admins possess granular access controls over sensitive player medical notes, emergency contacts, financial ledgers, and inventory controls.'
        }
    ];

    const filteredFaqs = faqs.filter(f => 
        !faqSearch.trim() || 
        f.question.toLowerCase().includes(faqSearch.toLowerCase()) || 
        f.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
        f.category.toLowerCase().includes(faqSearch.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Command Header Banner */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border border-zinc-800/80 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
                    <ShieldCheckIcon className="w-80 h-80 text-red-600" />
                </div>
                
                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-800/50 flex items-center gap-1">
                                <RocketLaunchIcon className="w-3 h-3 text-red-400" /> System v2.5 Tactical Engine
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 flex items-center gap-1">
                                <CheckCircleIcon className="w-3 h-3 text-emerald-400" /> Operational & Realtime Sync Active
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-950/80 text-amber-400 border border-amber-800/50">
                                19 Collections
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                            {companyDetails?.name || 'Bosjol Airsoft Club'}
                            <span className="text-xs font-mono text-zinc-500 font-normal">/ Command Architecture</span>
                        </h2>
                        <p className="text-sm text-zinc-400 max-w-3xl mt-1 leading-relaxed">
                            Comprehensive tactical event management, operator progression engine, financial auto-ledger, and real-time operational command center engineered specifically for high-intensity tactical airsoft operations.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 self-stretch lg:self-auto bg-zinc-950/90 p-1.5 rounded-xl border border-zinc-800/90 shadow-inner overflow-x-auto">
                        <NavBtn active={activeSubTab === 'overview'} onClick={() => setActiveSubTab('overview')} icon={<InformationCircleIcon className="w-4 h-4" />} label="Overview" />
                        <NavBtn active={activeSubTab === 'architecture'} onClick={() => setActiveSubTab('architecture')} icon={<ServerIcon className="w-4 h-4" />} label="Architecture" />
                        <NavBtn active={activeSubTab === 'gamification'} onClick={() => setActiveSubTab('gamification')} icon={<TrophyIcon className="w-4 h-4" />} label="Progression" />
                        <NavBtn active={activeSubTab === 'automation'} onClick={() => setActiveSubTab('automation')} icon={<BoltIcon className="w-4 h-4" />} label="Automations" />
                        <NavBtn active={activeSubTab === 'fieldguide'} onClick={() => setActiveSubTab('fieldguide')} icon={<DocumentTextIcon className="w-4 h-4" />} label="Field Guide" />
                    </div>
                </div>

                {/* Performance Metrics Bar */}
                <div className="mt-6 pt-5 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <MetricPill title="Realtime Latency" value="< 15 ms" subtitle="WebSocket Replication" icon={<ArrowPathIcon className="w-4 h-4 text-emerald-400" />} />
                    <MetricPill title="Database Engine" value="PostgreSQL" subtitle="Row-Level Security Active" icon={<CircleStackIcon className="w-4 h-4 text-blue-400" />} />
                    <MetricPill title="Persistence" value="Dual-Layer" subtitle="Cloud + Local Storage" icon={<CpuChipIcon className="w-4 h-4 text-purple-400" />} />
                    <MetricPill title="Uptime SLA" value="99.9%" subtitle="Zero-Downtime Cache" icon={<ShieldCheckIcon className="w-4 h-4 text-amber-400" />} />
                </div>
            </div>

            {/* Sub-tab 1: Overview */}
            {activeSubTab === 'overview' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FeatureCard 
                            title="Tactical Roster & Events" 
                            icon={<UsersIcon className="w-5 h-5 text-red-400" />}
                            badge="Core Operations"
                        >
                            <p className="text-xs text-zinc-300 mb-3">Comprehensive match planning, player signups, and automated attendance validation.</p>
                            <ul className="text-[11px] text-zinc-400 space-y-2 list-none">
                                <li className="flex items-start gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" /> <span><strong>Event Finalization:</strong> Single-click cascade updates kills, deaths, headshots, and XP across signed-up operators.</span></li>
                                <li className="flex items-start gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" /> <span><strong>QR Code & Call-Sign Verification:</strong> Rapid player check-in at field entry points using embedded scanner codes.</span></li>
                                <li className="flex items-start gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" /> <span><strong>Rental Gear Allocator:</strong> Tracks rifle, mask, and battery rentals per operator with auto-inventory deduction.</span></li>
                            </ul>
                        </FeatureCard>

                        <FeatureCard 
                            title="Gamification & Career Ranks" 
                            icon={<TrophyIcon className="w-5 h-5 text-amber-400" />}
                            badge="Progression Engine"
                        >
                            <p className="text-xs text-zinc-300 mb-3">Psychological retention loops keeping operators engaged across multi-match seasons.</p>
                            <ul className="text-[11px] text-zinc-400 space-y-2 list-none">
                                <li className="flex items-start gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" /> <span><strong>Precision XP Mathematics:</strong> Participation XP (+500), combat kills (+100 XP), and headshot precision multipliers (+50 XP).</span></li>
                                <li className="flex items-start gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" /> <span><strong>Milestone & Legendary Badges:</strong> Auto-unlocked based on permanent stats (e.g. "Sharpshooter", "1000 Kills").</span></li>
                                <li className="flex items-start gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" /> <span><strong>Dynamic Rank Perks:</strong> Automated reward distribution (e.g. rental discounts, free raffle entries) upon promotion.</span></li>
                            </ul>
                        </FeatureCard>

                        <FeatureCard 
                            title="Global Leaderboard & Honor System" 
                            icon={<GlobeAltIcon className="w-5 h-5 text-emerald-400" />}
                            badge="Competition"
                        >
                            <p className="text-xs text-zinc-300 mb-3">Public operator standings fostering healthy rivalry and team recognition.</p>
                            <ul className="text-[11px] text-zinc-400 space-y-2 list-none">
                                <li className="flex items-start gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> <span><strong>Live Dynamic Standings:</strong> Sort operators by Total XP, Kill/Death ratio, headshots, or games attended.</span></li>
                                <li className="flex items-start gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> <span><strong>Tactical Field Honors:</strong> Special commendations awarded by Game Masters for sportsmanship and leadership.</span></li>
                                <li className="flex items-start gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> <span><strong>Rivalry Matrix:</strong> Instant breakdown showing operators directly above and below your standing.</span></li>
                            </ul>
                        </FeatureCard>

                        <FeatureCard 
                            title="Financial Auto-Ledger & Accounting" 
                            icon={<CreditCardIcon className="w-5 h-5 text-blue-400" />}
                            badge="Financial Control"
                        >
                            <p className="text-xs text-zinc-300 mb-3">Zero-effort bookkeeping for field revenue, gear rentals, and expenses.</p>
                            <ul className="text-[11px] text-zinc-400 space-y-2 list-none">
                                <li className="flex items-start gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" /> <span><strong>Automated Event Revenue:</strong> Calculates `(Players × Entry Fee) + Rentals` directly into income records.</span></li>
                                <li className="flex items-start gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" /> <span><strong>Voucher & Raffle Management:</strong> Issue promotional discount codes and host tactical raffle draws.</span></li>
                                <li className="flex items-start gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" /> <span><strong>Bank Info & Invoicing:</strong> Integrated banking details on player check-out screens for easy field payments.</span></li>
                            </ul>
                        </FeatureCard>

                        <FeatureCard 
                            title="Tactical Inventory & Equipment" 
                            icon={<BuildingOfficeIcon className="w-5 h-5 text-purple-400" />}
                            badge="Resource Management"
                        >
                            <p className="text-xs text-zinc-300 mb-3">Real-time tracking of rental gear, airsoft BB stock, batteries, and pyrotechnics.</p>
                            <ul className="text-[11px] text-zinc-400 space-y-2 list-none">
                                <li className="flex items-start gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" /> <span><strong>Stock Allocation Guard:</strong> Prevents overbooking rentals when available field stock reaches zero.</span></li>
                                <li className="flex items-start gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" /> <span><strong>Supplier Integration:</strong> Directory of verified tactical gear suppliers and equipment costs.</span></li>
                                <li className="flex items-start gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" /> <span><strong>Item Statusing:</strong> Flag equipment as Available, Rented, Maintenance, or Decommissioned.</span></li>
                            </ul>
                        </FeatureCard>

                        <FeatureCard 
                            title="Multi-Role Admin & Security" 
                            icon={<ShieldCheckIcon className="w-5 h-5 text-yellow-400" />}
                            badge="Access Control"
                        >
                            <p className="text-xs text-zinc-300 mb-3">Granular permissions protecting player medical records and administrative functions.</p>
                            <ul className="text-[11px] text-zinc-400 space-y-2 list-none">
                                <li className="flex items-start gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" /> <span><strong>Role-Based Access:</strong> Separate UI views and API endpoints for Players, Marshals, and Super Admins.</span></li>
                                <li className="flex items-start gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" /> <span><strong>Emergency Contact Access:</strong> Instant field operator medical notes and emergency contact phone numbers.</span></li>
                                <li className="flex items-start gap-1.5"><CheckCircleIcon className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" /> <span><strong>JSON Data Backup:</strong> One-click full-database JSON export and restoration for absolute data safety.</span></li>
                            </ul>
                        </FeatureCard>
                    </div>

                    {/* Operational Visual Workflow */}
                    <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-xl space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
                            <SparklesIcon className="w-5 h-5 text-red-500" />
                            <h3 className="font-black text-white text-base uppercase tracking-wider">Operational Lifecycle Diagram</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <FlowStep number="01" title="Match Scheduling" desc="Admin creates event with pricing, game rules, location maps, and rental caps." />
                            <FlowStep number="02" title="Operator Signups" desc="Players reserve spots, select rental bundles, and receive digital entry passes." />
                            <FlowStep number="03" title="Field Execution" desc="Marshals verify QR codes, log combat performance (kills, headshots) in real time." />
                            <FlowStep number="04" title="Finalization & Sync" desc="Single-click cascade updates XP, ranks, financial ledger, and global leaderboard." />
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-tab 2: Architecture */}
            {activeSubTab === 'architecture' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-6">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                <CpuChipIcon className="w-5 h-5 text-red-500" /> Technical Architecture & Data Replication Engine
                            </h3>
                            <p className="text-sm text-zinc-400">
                                The Bosjol engine combines a zero-latency client state manager with persistent browser storage (`localStorage`) and automated Supabase PostgreSQL real-time WebSocket replication.
                            </p>
                        </div>

                        {/* Interactive Flow Visual */}
                        <div className="p-5 bg-black/60 rounded-xl border border-zinc-800 space-y-4">
                            <h4 className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold">Data Synchronization Flowchart</h4>
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
                                <ArchNode title="React 18 SPA" tag="UI Layer" color="border-red-500/50 text-red-400 bg-red-950/30" desc="Fast responsive views" />
                                <div className="hidden md:flex items-center justify-center text-zinc-600 font-bold">➔</div>
                                <ArchNode title="DataContext" tag="State Manager" color="border-amber-500/50 text-amber-400 bg-amber-950/30" desc="Optimistic UI updates" />
                                <div className="hidden md:flex items-center justify-center text-zinc-600 font-bold">➔</div>
                                <ArchNode title="Local Cache" tag="Persistence" color="border-purple-500/50 text-purple-400 bg-purple-950/30" desc="Offline survival" />
                            </div>
                            <div className="pt-3 border-t border-zinc-800/60 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-left">
                                    <div className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1.5"><CheckCircleIcon className="w-4 h-4" /> Optimistic State Updates</div>
                                    <p className="text-[11px] text-zinc-400 leading-normal">UI updates immediately when actions occur, rendering changes instantaneously before waiting for network acknowledgments.</p>
                                </div>
                                <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-left">
                                    <div className="text-xs font-bold text-blue-400 mb-1 flex items-center gap-1.5"><ArrowPathIcon className="w-4 h-4" /> Realtime WebSockets</div>
                                    <p className="text-[11px] text-zinc-400 leading-normal">Supabase PostgreSQL CDC (Change Data Capture) streams live score updates to all active field marshal screens.</p>
                                </div>
                                <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-left">
                                    <div className="text-xs font-bold text-purple-400 mb-1 flex items-center gap-1.5"><ShieldCheckIcon className="w-4 h-4" /> Row Level Security</div>
                                    <p className="text-[11px] text-zinc-400 leading-normal">Strict PostgreSQL RLS policies restrict unauthorized access to administrative controls and sensitive player medical details.</p>
                                </div>
                            </div>
                        </div>

                        {/* Database Schema Collections */}
                        <div>
                            <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2 uppercase tracking-wide">
                                <CircleStackIcon className="w-4 h-4 text-emerald-400" /> 19 Database Collections Schema
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {['players', 'events', 'signups', 'inventory', 'vouchers', 'raffles', 'sponsors', 'suppliers', 'locations', 'transactions', 'ranks', 'badges', 'legendaryBadges', 'honors', 'notifications', 'settings', 'socialLinks', 'carouselMedia', 'admins'].map(col => (
                                    <span key={col} className="px-2.5 py-1 rounded-md bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-300 flex items-center gap-1.5 shadow-sm">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                        public.{col}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-tab 3: Gamification */}
            {activeSubTab === 'gamification' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="p-6 rounded-2xl bg-zinc-900/40 border border-amber-900/30 space-y-6">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                <SparklesIcon className="w-5 h-5 text-amber-500" /> Gamification & Combat XP Mathematics
                            </h3>
                            <p className="text-sm text-zinc-400">
                                Every combat action, headshot multiplier, and attendance streak is converted into career progress.
                            </p>
                        </div>

                        {/* Mathematics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-4 border border-emerald-900/40 rounded-xl bg-emerald-950/20">
                                <div className="text-xs font-mono text-emerald-400 font-bold uppercase mb-1">Participation Reward</div>
                                <div className="text-2xl font-black text-white mb-1">+500 XP</div>
                                <p className="text-xs text-zinc-400 leading-relaxed">Awarded per finalized event attended. Rewards operator consistency regardless of match outcome.</p>
                            </div>
                            <div className="p-4 border border-blue-900/40 rounded-xl bg-blue-950/20">
                                <div className="text-xs font-mono text-blue-400 font-bold uppercase mb-1">Combat Eliminator</div>
                                <div className="text-2xl font-black text-white mb-1">+100 XP / Kill</div>
                                <p className="text-xs text-zinc-400 leading-relaxed">Awarded for confirmed opponent eliminations. +50 XP bonus for logged headshot accuracy.</p>
                            </div>
                            <div className="p-4 border border-red-900/40 rounded-xl bg-red-950/20">
                                <div className="text-xs font-mono text-red-400 font-bold uppercase mb-1">Combat Penalties</div>
                                <div className="text-2xl font-black text-white mb-1">-25 XP / Death</div>
                                <p className="text-xs text-zinc-400 leading-relaxed">-25 XP per tactical casualty. -200 XP penalty for unexcused event no-shows.</p>
                            </div>
                        </div>

                        {/* Rank Structure Visual Pyramid */}
                        <div className="p-5 bg-black/50 rounded-xl border border-zinc-800 space-y-3">
                            <h4 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                                <TrophyIcon className="w-4 h-4 text-amber-400" /> Operator Rank Hierarchy & Promotion Perks
                            </h4>
                            <div className="space-y-2">
                                {[
                                    { rank: 'Recruit', xp: '0 XP', color: 'bg-zinc-700 text-zinc-200', perk: 'Standard Match Access' },
                                    { rank: 'Operative', xp: '1,000 XP', color: 'bg-emerald-700 text-emerald-100', perk: '5% Off Gear Rental' },
                                    { rank: 'Veteran', xp: '3,500 XP', color: 'bg-blue-700 text-blue-100', perk: '10% Off Gear Rental + Veteran Badge' },
                                    { rank: 'Specialist', xp: '7,500 XP', color: 'bg-purple-700 text-purple-100', perk: 'Free Entry Raffle Ticket per Event' },
                                    { rank: 'Commander', xp: '15,000 XP', color: 'bg-amber-600 text-amber-950', perk: '15% Discount on Entry Fees' },
                                    { rank: 'Tactical Elite', xp: '30,000 XP+', color: 'bg-red-600 text-white', perk: 'VIP Field Pass & Custom Callsign Insignia' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 gap-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2.5 py-1 rounded text-xs font-black uppercase tracking-wider ${item.color}`}>
                                                {item.rank}
                                            </span>
                                            <span className="text-xs font-mono text-zinc-400 font-bold">{item.xp}</span>
                                        </div>
                                        <div className="text-xs text-zinc-300 font-medium bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
                                            🎁 {item.perk}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-tab 4: Automation */}
            {activeSubTab === 'automation' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="p-6 rounded-2xl bg-zinc-900/40 border border-emerald-900/30 space-y-6">
                        <div>
                            <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                <BoltIcon className="w-5 h-5 text-emerald-500" /> Background Automation Cascades
                            </h3>
                            <p className="text-sm text-zinc-400">
                                Automated triggers handle score updates, accounting, and seasonal resets behind the scenes.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <WorkflowStep 
                                num="01" 
                                title="Event Finalization Cascade" 
                                tag="Combat Engine"
                                desc="When an admin finalizes an event, the system iterates over all signed-up operators, calculates net earned XP, updates lifetime kills/deaths/headshots, and stamps the match as finalized in single-transaction atomic speed."
                            />
                            <WorkflowStep 
                                num="02" 
                                title="Financial Auto-Ledger Balancing" 
                                tag="Accounting Engine"
                                desc="Intercepts attendee counts and rental requests during event closure to automatically format and deposit an Income Ledger transaction: `(Players × Ticket Price) + (Rentals × Fee)`."
                            />
                            <WorkflowStep 
                                num="03" 
                                title="Stock Auto-Deduction & Return Guard" 
                                tag="Inventory Engine"
                                desc="Reserving rental gear deducts available stock in real time. Finalizing an event automatically flags items for return check, ensuring field gear balances reflect physical inventory."
                            />
                            <WorkflowStep 
                                num="04" 
                                title="Seasonal Rank Reset Protocol" 
                                tag="Season Engine"
                                desc="Monitors the system clock against the configured 'Next Rank Reset Date'. When reached, season XP resets while preserving permanent career badges, badges showcase, and prestige rank medals."
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-tab 5: Field Guide & FAQ */}
            {activeSubTab === 'fieldguide' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1 flex items-center gap-2">
                                    <DocumentTextIcon className="w-5 h-5 text-red-500" /> Field Operator & Game Master Manual
                                </h3>
                                <p className="text-sm text-zinc-400">
                                    Answers to common operational questions, field check-in workflows, and system guidelines.
                                </p>
                            </div>
                            <input 
                                type="text"
                                placeholder="Search field manual & FAQs..."
                                value={faqSearch}
                                onChange={(e) => setFaqSearch(e.target.value)}
                                className="w-full sm:w-64 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                            />
                        </div>

                        <div className="space-y-3">
                            {filteredFaqs.map((faq) => {
                                const isOpen = expandedFaq === faq.id;
                                return (
                                    <div key={faq.id} className="rounded-xl bg-zinc-950 border border-zinc-800/80 overflow-hidden shadow-sm">
                                        <button 
                                            onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                                            className="w-full text-left p-4 flex justify-between items-center gap-3 hover:bg-zinc-900/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-950/80 text-red-400 border border-red-900/50">
                                                    {faq.category}
                                                </span>
                                                <h4 className="font-bold text-white text-sm">{faq.question}</h4>
                                            </div>
                                            <span className="text-zinc-500 font-bold text-base">{isOpen ? '−' : '+'}</span>
                                        </button>
                                        {isOpen && (
                                            <div className="p-4 pt-0 text-xs text-zinc-300 leading-relaxed border-t border-zinc-900/60 bg-zinc-900/20">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {filteredFaqs.length === 0 && (
                                <div className="p-8 text-center text-zinc-500 text-xs font-mono">
                                    No FAQs found matching "{faqSearch}".
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper Components
interface NavBtnProps {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}
const NavBtn: React.FC<NavBtnProps> = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
            active 
                ? 'bg-red-600 text-white shadow-lg shadow-red-950/50 border border-red-500' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent'
        }`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

const MetricPill: React.FC<{ title: string; value: string; subtitle: string; icon: React.ReactNode }> = ({ title, value, subtitle, icon }) => (
    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70 shadow-inner flex items-center gap-3">
        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0">{icon}</div>
        <div>
            <div className="text-[10px] font-mono uppercase text-zinc-500 font-bold">{title}</div>
            <div className="text-sm font-black text-white">{value}</div>
            <div className="text-[10px] text-zinc-400">{subtitle}</div>
        </div>
    </div>
);

const FeatureCard: React.FC<{ title: string; icon: React.ReactNode; badge: string; children: React.ReactNode }> = ({ title, icon, badge, children }) => (
    <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition-colors shadow-inner flex flex-col justify-between">
        <div>
            <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-zinc-800/60 mb-3">
                <div className="flex items-center gap-2">
                    {icon}
                    <h4 className="font-bold text-white text-sm uppercase tracking-wide">{title}</h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-zinc-900 text-zinc-400 border border-zinc-800">{badge}</span>
            </div>
            {children}
        </div>
    </div>
);

const FlowStep: React.FC<{ number: string; title: string; desc: string }> = ({ number, title, desc }) => (
    <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-left space-y-1">
        <div className="text-xs font-mono font-black text-red-500 mb-1">STEP {number}</div>
        <div className="text-xs font-bold text-white">{title}</div>
        <div className="text-[11px] text-zinc-400 leading-normal">{desc}</div>
    </div>
);

const ArchNode: React.FC<{ title: string; tag: string; color: string; desc: string }> = ({ title, tag, color, desc }) => (
    <div className={`p-3 rounded-xl border ${color} flex flex-col items-center justify-center space-y-1`}>
        <span className="text-[9px] font-mono uppercase tracking-wider font-bold opacity-80">{tag}</span>
        <span className="text-xs font-black">{title}</span>
        <span className="text-[10px] opacity-75">{desc}</span>
    </div>
);

const WorkflowStep: React.FC<{ num: string; title: string; tag: string; desc: string }> = ({ num, title, tag, desc }) => (
    <div className="flex gap-4 p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 items-start">
        <div className="text-lg font-black font-mono text-emerald-400 bg-emerald-950/50 h-10 w-10 flex items-center justify-center rounded-lg border border-emerald-800/50 shrink-0">
            {num}
        </div>
        <div className="space-y-1">
            <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm">{title}</h4>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-zinc-900 text-emerald-400 border border-emerald-900/50">{tag}</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default AboutTab;
