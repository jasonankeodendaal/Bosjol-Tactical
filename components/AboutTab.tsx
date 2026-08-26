import React, { useState } from 'react';
import { 
    InformationCircleIcon, 
    ServerStackIcon, 
    CpuChipIcon, 
    ShieldCheckIcon, 
    PhotoIcon, 
    CurrencyDollarIcon,
    SparklesIcon,
    TrophyIcon,
    CheckCircleIcon,
    ArrowPathIcon,
    GlobeAltIcon,
    CircleStackIcon,
    UserIcon,
    TicketIcon
} from './icons/Icons';

export const AboutTab: React.FC = () => {
    const [selectedTab, setSelectedTab] = useState<'architecture' | 'automation' | 'finance' | 'gamification' | 'media'>('architecture');

    return (
        <div className="w-full max-w-full overflow-hidden space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <InformationCircleIcon className="w-5 h-5 text-red-500" />
                    <div>
                        <h2 className="text-base sm:text-xl font-black text-white uppercase tracking-wider">
                            System Architecture & Operations Guide
                        </h2>
                        <p className="text-[11px] sm:text-xs text-zinc-400">
                            Deep dive into the Bosjol tactical engine, automation cascades, security protocols & specifications.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-950/40 border border-emerald-800/30 text-emerald-400">
                        PWA Edition &bull; v2.5.0
                    </span>
                </div>
            </div>

            {/* Quick Metrics Bar - Free View */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/70 hover:border-red-500/30 transition-all">
                    <p className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">State Synchronizer</p>
                    <p className="text-sm sm:text-lg font-black text-white mt-0.5">Real-Time Sub</p>
                    <span className="text-[9px] text-emerald-400 font-mono">0ms Polling Latency</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/70 hover:border-blue-500/30 transition-all">
                    <p className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Database Engine</p>
                    <p className="text-sm sm:text-lg font-black text-blue-400 mt-0.5">PostgreSQL 15</p>
                    <span className="text-[9px] text-zinc-400 font-mono">23 Relational Collections</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/70 hover:border-purple-500/30 transition-all">
                    <p className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Auth Security</p>
                    <p className="text-sm sm:text-lg font-black text-purple-400 mt-0.5">PIN + RLS</p>
                    <span className="text-[9px] text-purple-300 font-mono">Row-Level Cryptography</span>
                </div>
                <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/70 hover:border-green-500/30 transition-all">
                    <p className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">Match Engine</p>
                    <p className="text-sm sm:text-lg font-black text-green-400 mt-0.5">Auto-Cascade</p>
                    <span className="text-[9px] text-green-300 font-mono">Instant XP & Ledgering</span>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800/80">
                <button
                    onClick={() => setSelectedTab('architecture')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        selectedTab === 'architecture'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                    <ServerStackIcon className="w-3.5 h-3.5" />
                    <span>1. Architecture</span>
                </button>
                <button
                    onClick={() => setSelectedTab('automation')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        selectedTab === 'automation'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                    <CpuChipIcon className="w-3.5 h-3.5" />
                    <span>2. Automation Engine</span>
                </button>
                <button
                    onClick={() => setSelectedTab('finance')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        selectedTab === 'finance'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                    <CurrencyDollarIcon className="w-3.5 h-3.5" />
                    <span>3. Finance & Integrity</span>
                </button>
                <button
                    onClick={() => setSelectedTab('gamification')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        selectedTab === 'gamification'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                    <TrophyIcon className="w-3.5 h-3.5" />
                    <span>4. Gamification Logic</span>
                </button>
                <button
                    onClick={() => setSelectedTab('media')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                        selectedTab === 'media'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                >
                    <PhotoIcon className="w-3.5 h-3.5" />
                    <span>5. Media Protocols</span>
                </button>
            </div>

            {/* TAB 1: ARCHITECTURE */}
            {selectedTab === 'architecture' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {/* Frontend Core */}
                        <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-2">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-800/60">
                                <GlobeAltIcon className="w-4 h-4 text-blue-400" />
                                <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">Frontend PWA Stack</h3>
                            </div>
                            <ul className="text-[11px] sm:text-xs text-zinc-300 space-y-2">
                                <li className="flex items-start gap-2">
                                    <CheckCircleIcon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-white">React 19 & TypeScript:</strong> Zero runtime type flaws with strict contract typing for players, ranks, and events.
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircleIcon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-white">Tailwind Tactical Engine:</strong> High-contrast responsive styling optimized for outdoor sun readability.
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircleIcon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-white">Offline Resilience:</strong> Instant state caching guarantees operators can browse loadouts even with zero field reception.
                                    </div>
                                </li>
                            </ul>
                        </div>

                        {/* Backend Infrastructure */}
                        <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-2">
                            <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-800/60">
                                <CircleStackIcon className="w-4 h-4 text-emerald-400" />
                                <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">Cloud Database & Sync</h3>
                            </div>
                            <ul className="text-[11px] sm:text-xs text-zinc-300 space-y-2">
                                <li className="flex items-start gap-2">
                                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-white">Supabase PostgreSQL 15:</strong> High-speed relational storage with native JSONB document flexibility.
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-white">WebSocket Subscriptions:</strong> Real-time bi-directional messaging updates attendance and live scores across all admin devices instantaneously.
                                    </div>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="text-white">Automated Health Fallbacks:</strong> Graceful fallback to cached mock states if database connectivity drops.
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: AUTOMATION ENGINE */}
            {selectedTab === 'automation' && (
                <div className="space-y-4">
                    <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-3">
                        <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-800/60">
                            <CpuChipIcon className="w-4 h-4 text-red-500" />
                            <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">
                                The 7-Step "Finalize Event" Automation Cascade
                            </h3>
                        </div>
                        <p className="text-[11px] sm:text-xs text-zinc-400">
                            When an administrator clicks <strong>Finalize Event</strong>, the following operations occur atomically in milliseconds:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] sm:text-xs">
                            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-start gap-2">
                                <span className="font-mono text-red-400 font-bold">01.</span>
                                <div><strong className="text-white">XP Aggregation:</strong> Computes Base Participation + (Kills &times; 100) + (Headshots &times; 50) &minus; (Deaths &times; 25).</div>
                            </div>
                            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-start gap-2">
                                <span className="font-mono text-red-400 font-bold">02.</span>
                                <div><strong className="text-white">No-Show Penalty:</strong> Automatically identifies absent signups and applies XP de-escalations.</div>
                            </div>
                            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-start gap-2">
                                <span className="font-mono text-red-400 font-bold">03.</span>
                                <div><strong className="text-white">Match History Snapshot:</strong> Freezes permanent match records with K/D, headshots, and date stamps.</div>
                            </div>
                            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-start gap-2">
                                <span className="font-mono text-red-400 font-bold">04.</span>
                                <div><strong className="text-white">Lifetime Accumulation:</strong> Updates global stats (Total Kills, Headshot accuracy, MVP records).</div>
                            </div>
                            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-start gap-2">
                                <span className="font-mono text-red-400 font-bold">05.</span>
                                <div><strong className="text-white">Rank & Tier Promotion:</strong> Evaluates thresholds and triggers instant promotions and notifications.</div>
                            </div>
                            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-start gap-2">
                                <span className="font-mono text-red-400 font-bold">06.</span>
                                <div><strong className="text-white">Financial Ledger Entry:</strong> Creates income entries splitting Event Fees and Rental Gear income.</div>
                            </div>
                            <div className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-start gap-2 sm:col-span-2">
                                <span className="font-mono text-red-400 font-bold">07.</span>
                                <div><strong className="text-white">Roster Cleanup:</strong> Flushes temporary queue slots while preserving permanent attendance records.</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: FINANCE */}
            {selectedTab === 'finance' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-2">
                        <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-800/60">
                            <CurrencyDollarIcon className="w-4 h-4 text-green-400" />
                            <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">Revenue Breakdown Streams</h3>
                        </div>
                        <ul className="text-[11px] sm:text-xs text-zinc-300 space-y-1.5">
                            <li><strong className="text-green-400">Event Revenue:</strong> Entry and match registration fees.</li>
                            <li><strong className="text-blue-400">Rental Revenue:</strong> Primary AEGs, HPA rigs, masks, and tactical gear hire.</li>
                            <li><strong className="text-amber-400">Retail & Consumables:</strong> Heavyweight BBs, green gas, pyro, and accessories.</li>
                            <li><strong className="text-red-400">Expenses:</strong> Field maintenance, marshals, and inventory restock entries.</li>
                        </ul>
                    </div>

                    <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-2">
                        <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-800/60">
                            <ShieldCheckIcon className="w-4 h-4 text-purple-400" />
                            <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">Data Snapshot & Backup Engine</h3>
                        </div>
                        <p className="text-[11px] sm:text-xs text-zinc-400 leading-relaxed">
                            Admins can export a full JSON snapshot containing all 23 tables in one click from the <strong>Settings</strong> tab, enabling zero-downtime recovery and local backup archives.
                        </p>
                    </div>
                </div>
            )}

            {/* TAB 4: GAMIFICATION */}
            {selectedTab === 'gamification' && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-3">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-800/60">
                        <TrophyIcon className="w-4 h-4 text-amber-400" />
                        <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">XP & Progression Algorithms</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] sm:text-xs">
                        <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
                            <p className="font-bold text-amber-400 uppercase tracking-wider">Kill & Objective XP</p>
                            <p className="text-zinc-300">Base: 100 XP per confirmed hit. Precision Headshot: +50 XP bonus.</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
                            <p className="font-bold text-red-400 uppercase tracking-wider">Death & Penalty Math</p>
                            <p className="text-zinc-300">Tactical Death: -25 XP. No-Show Penalty: -200 XP to deter phantom signups.</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
                            <p className="font-bold text-purple-400 uppercase tracking-wider">Legendary Badges</p>
                            <p className="text-zinc-300">Granted exclusively by Command for exceptional field valor, sportsmanship, and tactical dominance.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 5: MEDIA */}
            {selectedTab === 'media' && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-900/30 border border-zinc-800/80 space-y-3">
                    <div className="flex items-center gap-2 pb-1.5 border-b border-zinc-800/60">
                        <PhotoIcon className="w-4 h-4 text-purple-400" />
                        <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">CDN & Media Best Practices</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] sm:text-xs text-zinc-300">
                        <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                            <h4 className="font-bold text-white">Direct CDN Links vs Base64</h4>
                            <p className="text-zinc-400">
                                Always use direct HTTPS URLs for high-res tactical imagery and audio tracks. Direct URLs bypass database query payloads, enabling blazing-fast sub-50ms page hydration.
                            </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                            <h4 className="font-bold text-white">Recommended Asset Hosts</h4>
                            <p className="text-zinc-400">
                                Recommended tools: <strong>ImgBB</strong> (direct PNG/JPG links), <strong>Catbox.moe</strong> (tactical MP3 briefing audio), and <strong>Supabase Storage</strong> (built-in media bucket).
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
