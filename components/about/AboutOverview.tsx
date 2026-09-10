import React from 'react';
import { 
    Compass, 
    Target, 
    Workflow, 
    Users, 
    Gauge, 
    RadioTower, 
    ShieldCheck, 
    Clock, 
    CheckCircle2, 
    AlertTriangle, 
    Sparkles, 
    Radio, 
    MapPin, 
    Flag, 
    Crosshair,
    Eye,
    Zap,
    Boxes,
    Flame,
    Glasses,
    HeartPulse
} from 'lucide-react';

export const AboutOverview: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* 4 Core Operational Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-amber-500/30 hover:border-amber-500/60 transition-all space-y-2.5 shadow-lg backdrop-blur-md group">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 group-hover:scale-110 transition-transform">
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-wider">Combat Progression</h4>
                            <p className="text-[10px] text-amber-400 font-mono">Rank Points (RP) Engine</p>
                        </div>
                    </div>
                    <ul className="text-xs text-zinc-300 space-y-1.5 pt-2 border-t border-zinc-800/80">
                        <li className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">•</span>
                            <span><strong>+500 RP</strong> awarded automatically per confirmed finalized combat match.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">•</span>
                            <span><strong>6 Tier Hierarchy:</strong> Rookie &rarr; Veteran &rarr; Elite &rarr; Pro &rarr; Master &rarr; Legendary.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>Automated unlock triggers for rental discounts, VIP staging, and calling cards.</span>
                        </li>
                    </ul>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-red-500/30 hover:border-red-500/60 transition-all space-y-2.5 shadow-lg backdrop-blur-md group">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shrink-0 group-hover:scale-110 transition-transform">
                            <Gauge className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-wider">Ballistics & Chrono</h4>
                            <p className="text-[10px] text-red-400 font-mono">Joules & MED Safety</p>
                        </div>
                    </div>
                    <ul className="text-xs text-zinc-300 space-y-1.5 pt-2 border-t border-zinc-800/80">
                        <li className="flex items-start gap-1.5">
                            <span className="text-red-400 font-bold">•</span>
                            <span><strong>1.50 Joules / 400 FPS (0.20g)</strong> strict ceiling for standard Assault AEGs.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                            <span className="text-red-400 font-bold">•</span>
                            <span>Mandatory <strong>Joule-Tested</strong> chrono check with color-coded tamper-evident tags.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                            <span className="text-red-400 font-bold">•</span>
                            <span>Enforced Minimum Engagement Distance (MED): 0m (Pistols) up to 20m (Snipers).</span>
                        </li>
                    </ul>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-emerald-500/30 hover:border-emerald-500/60 transition-all space-y-2.5 shadow-lg backdrop-blur-md group">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 group-hover:scale-110 transition-transform">
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-wider">Field Command</h4>
                            <p className="text-[10px] text-emerald-400 font-mono">QR Check-in & Signups</p>
                        </div>
                    </div>
                    <ul className="text-xs text-zinc-300 space-y-1.5 pt-2 border-t border-zinc-800/80">
                        <li className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>Instant QR pass scan for player registration, waiver validation, and squad assignment.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>Real-time rental package tracking with auto armory deduction and return logging.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">•</span>
                            <span>Live dynamic game roster generation for fair team balance and balanced combat.</span>
                        </li>
                    </ul>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/80 border border-cyan-500/30 hover:border-cyan-500/60 transition-all space-y-2.5 shadow-lg backdrop-blur-md group">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0 group-hover:scale-110 transition-transform">
                            <Radio className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-wider">Cloud Synchrony</h4>
                            <p className="text-[10px] text-cyan-400 font-mono">Supabase Realtime CDC</p>
                        </div>
                    </div>
                    <ul className="text-xs text-zinc-300 space-y-1.5 pt-2 border-t border-zinc-800/80">
                        <li className="flex items-start gap-1.5">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span>Sub-15ms WebSocket synchronization across field marshals, armory, and players.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span>Automated double-entry Financial Ledger posting for ticket entry and gear revenue.</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span>Row-Level Security protecting operator personal contact info and medical records.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Tactical Field Layout Illustration (Interactive Graphic) */}
            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl relative overflow-hidden space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                    <div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-red-500" />
                            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                                Bosjol Tactical Combat Arena Map & Zone Architecture
                            </h3>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Zone safety classification, engagement corridors, safe staging, and forward operating bases.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                            GREEN: SAFE ZONE
                        </span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-red-950 text-red-400 border border-red-800/60">
                            RED: HOT ZONE
                        </span>
                    </div>
                </div>

                {/* SVG Visual Tactical Field Map */}
                <div className="relative w-full rounded-2xl bg-zinc-900/90 border border-zinc-800 p-3 sm:p-4 overflow-hidden">
                    <svg viewBox="0 0 900 380" className="w-full h-auto text-zinc-300 select-none font-mono">
                        <defs>
                            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                            </pattern>
                            <linearGradient id="safeZoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#064e3b" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#022c22" stopOpacity="0.8" />
                            </linearGradient>
                            <linearGradient id="hotZoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#450a0a" stopOpacity="0.6" />
                            </linearGradient>
                            <linearGradient id="cqbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.7" />
                            </linearGradient>
                        </defs>

                        {/* Background Grid */}
                        <rect width="900" height="380" fill="url(#grid)" />

                        {/* SAFE ZONE AREA (Green) */}
                        <rect x="20" y="20" width="220" height="340" rx="16" fill="url(#safeZoneGrad)" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />
                        <text x="130" y="50" textAnchor="middle" fill="#34d399" fontSize="13" fontWeight="bold" letterSpacing="2">SAFE STAGING AREA</text>
                        <text x="130" y="68" textAnchor="middle" fill="#a7f3d0" fontSize="10">(NO BBS • MAGS OUT • GOGGLES OFF OK)</text>

                        {/* Staging Sub-buildings */}
                        <rect x="35" y="85" width="90" height="55" rx="8" fill="#18181b" stroke="#34d399" strokeWidth="1" />
                        <text x="80" y="110" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">HQ REGISTRATION</text>
                        <text x="80" y="125" textAnchor="middle" fill="#9ca3af" fontSize="8">QR Scan &amp; Sign-in</text>

                        <rect x="135" y="85" width="90" height="55" rx="8" fill="#18181b" stroke="#34d399" strokeWidth="1" />
                        <text x="180" y="110" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">ARMORY / RENTALS</text>
                        <text x="180" y="125" textAnchor="middle" fill="#9ca3af" fontSize="8">Battery &amp; Gun Issue</text>

                        <rect x="35" y="155" width="190" height="60" rx="8" fill="#18181b" stroke="#34d399" strokeWidth="1" />
                        <text x="130" y="180" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">CHRONOGRAPH STATION</text>
                        <text x="130" y="196" textAnchor="middle" fill="#f59e0b" fontSize="9">Joules Test &amp; Color Zip-Tie Tagging</text>

                        <rect x="35" y="230" width="190" height="115" rx="8" fill="#18181b" stroke="#34d399" strokeWidth="1" />
                        <text x="130" y="255" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">STAGING TABLES &amp; TECH BENCH</text>
                        <text x="130" y="272" textAnchor="middle" fill="#9ca3af" fontSize="8">Gear Prep • Hydration • Battery Charge</text>
                        <text x="130" y="295" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">BARREL COVER MANDATORY</text>

                        {/* BUFFER ZONE / FIRING RANGE (Yellow) */}
                        <rect x="250" y="20" width="80" height="340" rx="12" fill="#78350f" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
                        <text x="290" y="140" textAnchor="middle" transform="rotate(-90 290 140)" fill="#fbbf24" fontSize="11" fontWeight="bold" letterSpacing="1">TEST FIRING RANGE</text>
                        <text x="290" y="260" textAnchor="middle" transform="rotate(-90 290 260)" fill="#fbbf24" fontSize="9">EYE PROTECTION MANDATORY</text>

                        {/* ACTIVE COMBAT HOT ZONE (Red) */}
                        <rect x="340" y="20" width="540" height="340" rx="16" fill="url(#hotZoneGrad)" stroke="#ef4444" strokeWidth="2" />
                        <text x="610" y="48" textAnchor="middle" fill="#f87171" fontSize="13" fontWeight="bold" letterSpacing="2">ACTIVE COMBAT SECTOR (LIVE FIELD)</text>

                        {/* Alpha Spawn HQ */}
                        <rect x="355" y="65" width="110" height="65" rx="8" fill="#18181b" stroke="#3b82f6" strokeWidth="1.5" />
                        <text x="410" y="90" textAnchor="middle" fill="#60a5fa" fontSize="11" fontWeight="bold">ALPHA HQ SPAWN</text>
                        <text x="410" y="105" textAnchor="middle" fill="#93c5fd" fontSize="8">Blue Faction Base</text>
                        <text x="410" y="120" textAnchor="middle" fill="#60a5fa" fontSize="8">Touch-Base Respawn</text>

                        {/* Bravo Spawn HQ */}
                        <rect x="755" y="275" width="110" height="65" rx="8" fill="#18181b" stroke="#ef4444" strokeWidth="1.5" />
                        <text x="810" y="300" textAnchor="middle" fill="#f87171" fontSize="11" fontWeight="bold">BRAVO HQ SPAWN</text>
                        <text x="810" y="315" textAnchor="middle" fill="#fca5a5" fontSize="8">Red Faction Base</text>
                        <text x="810" y="330" textAnchor="middle" fill="#f87171" fontSize="8">Touch-Base Respawn</text>

                        {/* Central CQB Village */}
                        <rect x="500" y="90" width="220" height="190" rx="12" fill="url(#cqbGrad)" stroke="#818cf8" strokeWidth="1.5" />
                        <text x="610" y="115" textAnchor="middle" fill="#c7d2fe" fontSize="12" fontWeight="bold">CQB VILLAGE COMPOUND</text>
                        <text x="610" y="130" textAnchor="middle" fill="#a5b4fc" fontSize="9">Multi-Room Structures • Semi-Auto Only</text>

                        {/* Buildings inside CQB */}
                        <rect x="520" y="145" width="70" height="50" rx="4" fill="#27272a" stroke="#a5b4fc" strokeWidth="1" />
                        <text x="555" y="172" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">BUNKER A</text>
                        <text x="555" y="185" textAnchor="middle" fill="#a5b4fc" fontSize="7">Flag Objective</text>

                        <rect x="630" y="145" width="70" height="50" rx="4" fill="#27272a" stroke="#a5b4fc" strokeWidth="1" />
                        <text x="665" y="172" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">BUNKER B</text>
                        <text x="665" y="185" textAnchor="middle" fill="#a5b4fc" fontSize="7">Bomb Site</text>

                        <rect x="575" y="210" width="70" height="55" rx="4" fill="#27272a" stroke="#fbbf24" strokeWidth="1" />
                        <text x="610" y="235" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="bold">COMMAND POST</text>
                        <text x="610" y="248" textAnchor="middle" fill="#d1d5db" fontSize="7">VIP Extraction LZ</text>

                        {/* Sniper Overwatch Hills */}
                        <circle cx="420" cy="270" r="38" fill="#1c1917" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 2" />
                        <text x="420" y="265" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">SNIPER RIDGE</text>
                        <text x="420" y="278" textAnchor="middle" fill="#6ee7b7" fontSize="7">20m MED Required</text>

                        <circle cx="800" cy="115" r="38" fill="#1c1917" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 2" />
                        <text x="800" y="110" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="bold">EAST OVERWATCH</text>
                        <text x="800" y="123" textAnchor="middle" fill="#6ee7b7" fontSize="7">Overwatch Hill</text>

                        {/* Movement Flow Arrows */}
                        <path d="M 470 100 Q 520 80 570 100" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="5 3" markerEnd="url(#arrow)" />
                        <path d="M 750 300 Q 700 320 650 300" fill="none" stroke="#f87171" strokeWidth="2" strokeDasharray="5 3" />
                    </svg>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-[11px] border-t border-zinc-800">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                            <span><strong>Safe Staging:</strong> Goggles off, barrel sock on.</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
                            <span><strong>Chrono Line:</strong> 1.50J max Assault, 2.32J Sniper.</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0"></span>
                            <span><strong>CQB Village:</strong> Semi-auto only, flashlights OK.</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
                            <span><strong>Hot Zone:</strong> Eye-pro 100% mandatory at all times.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 8-Step Complete Match Day Lifecycle Walkthrough */}
            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                    <div>
                        <div className="flex items-center gap-2">
                            <Workflow className="w-5 h-5 text-red-500" />
                            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                                Chronological Match Day Lifecycle (8-Step Tactical Walkthrough)
                            </h3>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Standard operating timeline from dawn registration and chrono tagging to final cloud ledger synchronization.
                        </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-950/80 text-red-400 border border-red-800/60 self-start sm:self-auto">
                        07:30 &rarr; 17:00 SCHEDULE
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        {
                            step: '01',
                            time: '07:30 - 08:30',
                            title: 'Arrival & QR Sign-In',
                            desc: 'Operators present QR player codes at Registration HQ. Waivers validated, emergency contacts recorded, ticket fees settled into cloud ledger.',
                            color: 'text-cyan-400',
                            border: 'border-cyan-500/30'
                        },
                        {
                            step: '02',
                            time: '08:00 - 09:00',
                            title: 'Chrono & Tagging',
                            desc: 'Primary replicas and sidearms tested with game BB weights. FPS/Joules recorded; color zip-tie tag affixed to trigger guard or buffer tube.',
                            color: 'text-amber-400',
                            border: 'border-amber-500/30'
                        },
                        {
                            step: '03',
                            time: '08:45 - 09:15',
                            title: 'Armory Rental Issue',
                            desc: 'Rental packages issued (G&G Raider AEG, 2x Hi-Cap mags, 11.1v LiPo, full-face mesh mask, speedloader, 2,000 bio BBs).',
                            color: 'text-emerald-400',
                            border: 'border-emerald-500/30'
                        },
                        {
                            step: '04',
                            time: '09:15 - 09:45',
                            title: 'Safety Briefing & SOP',
                            desc: 'Mandatory field rules: "Blind Man" cease-fire drill, dead-rag deployment, hit honor code, MED rules, and sector boundary markers.',
                            color: 'text-red-400',
                            border: 'border-red-500/30'
                        },
                        {
                            step: '05',
                            time: '09:45 - 10:00',
                            title: 'Factions & Radio Sync',
                            desc: 'Alpha (Blue) vs. Bravo (Red) assigned. Squad leaders designated, UHF/FRS radio channels tuned (CH 01 HQ, CH 02 Alpha, CH 03 Bravo).',
                            color: 'text-indigo-400',
                            border: 'border-indigo-500/30'
                        },
                        {
                            step: '06',
                            time: '10:00 - 13:00',
                            title: 'Phase 1 Engagements',
                            desc: 'Dynamic scenario rotations: Team Deathmatch warmup, Sector Domination with electronic capture clocks, and CQB Hostage Rescue.',
                            color: 'text-pink-400',
                            border: 'border-pink-500/30'
                        },
                        {
                            step: '07',
                            time: '13:00 - 16:30',
                            title: 'Phase 2 Scenario Ops',
                            desc: 'Post-lunch tactical missions: VIP Escort, Search & Destroy bomb defusal, and King of the Hill compound defense under marshal supervision.',
                            color: 'text-purple-400',
                            border: 'border-purple-500/30'
                        },
                        {
                            step: '08',
                            time: '16:30 - 17:00',
                            title: 'Event Finalization',
                            desc: 'Game master triggers Finalize Event in Manage Event console. +500 RP awarded, badges unlocked, leaderboard updated, financial ledger balanced.',
                            color: 'text-emerald-400',
                            border: 'border-emerald-500/30'
                        }
                    ].map((item, idx) => (
                        <div key={idx} className={`p-3.5 rounded-2xl bg-zinc-900/70 border ${item.border} space-y-1.5 backdrop-blur-sm hover:bg-zinc-900 transition-all`}>
                            <div className="flex items-center justify-between">
                                <span className={`text-base font-black font-mono ${item.color}`}>{item.step}</span>
                                <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                                    {item.time}
                                </span>
                            </div>
                            <h4 className="text-xs font-bold text-white uppercase">{item.title}</h4>
                            <p className="text-[11px] text-zinc-400 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Squad Radio Comms & Frequency Allocations Table */}
            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                    <div>
                        <div className="flex items-center gap-2">
                            <RadioTower className="w-5 h-5 text-amber-500" />
                            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                                Squad Radio Frequency Plan & Communications Protocol (UHF/FRS)
                            </h3>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Standard channel assignments for Baofeng, Motorola, and Midland tactical radios.
                        </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800/50">
                        FRS/GMRS STANDARD
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                        <thead>
                            <tr className="bg-zinc-900/90 text-zinc-400 text-[10px] uppercase border-b border-zinc-800">
                                <th className="p-2.5">Channel</th>
                                <th className="p-2.5">Frequency (MHz)</th>
                                <th className="p-2.5">CTCSS Tone</th>
                                <th className="p-2.5">Designated Net / Role</th>
                                <th className="p-2.5">Operational Traffic Guidelines</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                            <tr className="hover:bg-zinc-900/40">
                                <td className="p-2.5 font-bold text-amber-400">CH 01</td>
                                <td className="p-2.5 font-bold text-white">462.5625 MHz</td>
                                <td className="p-2.5 text-zinc-400">CSQ (Open)</td>
                                <td className="p-2.5 text-red-400 font-bold">Marshal Command &amp; Emergency</td>
                                <td className="p-2.5 text-zinc-400 text-[11px]">Cease-fire alerts ("Blind Man"), injury evacuation, rule disputes, game start/stop sirens.</td>
                            </tr>
                            <tr className="hover:bg-zinc-900/40">
                                <td className="p-2.5 font-bold text-blue-400">CH 02</td>
                                <td className="p-2.5 font-bold text-white">462.5875 MHz</td>
                                <td className="p-2.5 text-zinc-400">67.0 Hz</td>
                                <td className="p-2.5 text-blue-400 font-bold">Alpha Faction (Blue Team)</td>
                                <td className="p-2.5 text-zinc-400 text-[11px]">Blue squad tactical movement, target spotting, perimeter calls, objective capture status.</td>
                            </tr>
                            <tr className="hover:bg-zinc-900/40">
                                <td className="p-2.5 font-bold text-red-400">CH 03</td>
                                <td className="p-2.5 font-bold text-white">462.6125 MHz</td>
                                <td className="p-2.5 text-zinc-400">71.9 Hz</td>
                                <td className="p-2.5 text-red-400 font-bold">Bravo Faction (Red Team)</td>
                                <td className="p-2.5 text-zinc-400 text-[11px]">Red squad coordinated assaults, sniper overwatch calls, flanking maneuvers, defense reinforcement.</td>
                            </tr>
                            <tr className="hover:bg-zinc-900/40">
                                <td className="p-2.5 font-bold text-emerald-400">CH 04</td>
                                <td className="p-2.5 font-bold text-white">462.6375 MHz</td>
                                <td className="p-2.5 text-zinc-400">77.0 Hz</td>
                                <td className="p-2.5 text-emerald-400 font-bold">Armory, Tech &amp; Logistics</td>
                                <td className="p-2.5 text-zinc-400 text-[11px]">Rental battery swap calls, BB restock requests, chronograph re-checks, chronograph marshals.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
