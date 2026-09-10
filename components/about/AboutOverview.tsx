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
        <div className="space-y-4 sm:space-y-6">
            {/* Tactical Combat Arena Visual Hero Banner */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.85)] group">
                <div className="relative h-48 sm:h-64 md:h-72 w-full overflow-hidden">
                    <img 
                        src="/images/tactical_arena_banner_1789071688526.jpg" 
                        alt="Bosjol Tactical Combat Arena" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-90 contrast-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/60" />

                    {/* Top HUD Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-red-500/40 backdrop-blur-md">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                            <span className="text-[9.5px] sm:text-[11px] font-mono font-bold text-white tracking-wider uppercase">LIVE ARENA SECTOR 7</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-emerald-500/40 backdrop-blur-md">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[9.5px] sm:text-[11px] font-mono font-bold text-emerald-400 tracking-wider">MARSHAL MESH ACTIVE</span>
                        </div>
                    </div>

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-red-600/80 text-white font-mono text-[9px] font-bold uppercase tracking-wider">
                                    Official Combat Grounds
                                </span>
                                <span className="text-[10px] font-mono text-zinc-300">Gauteng, South Africa</span>
                            </div>
                            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white uppercase tracking-wider drop-shadow-md">
                                Bosjol Tactical Combat Complex
                            </h2>
                            <p className="text-[11px] sm:text-xs text-zinc-300 max-w-xl line-clamp-2 sm:line-clamp-none drop-shadow">
                                Multi-sector tactical combat arena featuring modular shipping container CQB compounds, woodland tactical lanes, forward operating bases, and fiber-linked digital chrono stations.
                            </p>
                        </div>

                        {/* Telemetry Pills */}
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 self-stretch sm:self-auto shrink-0">
                            <div className="px-2.5 py-1.5 rounded-xl bg-black/70 border border-white/10 backdrop-blur-md text-center">
                                <div className="text-[8.5px] sm:text-[9.5px] font-mono text-zinc-400 uppercase">Acreage</div>
                                <div className="text-xs sm:text-sm font-black font-mono text-amber-400">12.5 Ha</div>
                            </div>
                            <div className="px-2.5 py-1.5 rounded-xl bg-black/70 border border-white/10 backdrop-blur-md text-center">
                                <div className="text-[8.5px] sm:text-[9.5px] font-mono text-zinc-400 uppercase">Capacity</div>
                                <div className="text-xs sm:text-sm font-black font-mono text-cyan-400">120+ Ops</div>
                            </div>
                            <div className="px-2.5 py-1.5 rounded-xl bg-black/70 border border-white/10 backdrop-blur-md text-center">
                                <div className="text-[8.5px] sm:text-[9.5px] font-mono text-zinc-400 uppercase">Chrono</div>
                                <div className="text-xs sm:text-sm font-black font-mono text-emerald-400">1.50J Cap</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4 Core Operational Pillars - Side-by-Side 3D Squares on Mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-zinc-900/95 via-zinc-950/90 to-black border border-amber-500/30 hover:border-amber-500/60 transition-all space-y-2 shadow-[0_10px_25px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_16px_35px_rgba(245,158,11,0.2)] hover:-translate-y-1 backdrop-blur-md group flex flex-col justify-between">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-[11px] sm:text-sm font-black text-white uppercase tracking-wider truncate">Combat Progression</h4>
                                <p className="text-[8.5px] sm:text-[10px] text-amber-400 font-mono truncate">Rank Points Engine</p>
                            </div>
                        </div>
                        <ul className="text-[9.5px] sm:text-xs text-zinc-300 space-y-1 pt-1.5 border-t border-white/10 leading-tight">
                            <li className="flex items-start gap-1">
                                <span className="text-amber-400 font-bold">•</span>
                                <span><strong>+500 RP</strong> per confirmed finalized match.</span>
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-amber-400 font-bold">•</span>
                                <span><strong>6 Tiers:</strong> Rookie to Legendary.</span>
                            </li>
                            <li className="flex items-start gap-1 hidden sm:flex">
                                <span className="text-amber-400 font-bold">•</span>
                                <span>Automated discounts &amp; VIP perks.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="pt-1 text-[8.5px] sm:text-[9.5px] font-mono text-amber-400/80 uppercase">Tier System Auto-Sync</div>
                </div>

                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-zinc-900/95 via-zinc-950/90 to-black border border-red-500/30 hover:border-red-500/60 transition-all space-y-2 shadow-[0_10px_25px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_16px_35px_rgba(239,68,68,0.2)] hover:-translate-y-1 backdrop-blur-md group flex flex-col justify-between">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                                <Gauge className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-[11px] sm:text-sm font-black text-white uppercase tracking-wider truncate">Ballistics &amp; Chrono</h4>
                                <p className="text-[8.5px] sm:text-[10px] text-red-400 font-mono truncate">Joules &amp; MED Safety</p>
                            </div>
                        </div>
                        <ul className="text-[9.5px] sm:text-xs text-zinc-300 space-y-1 pt-1.5 border-t border-white/10 leading-tight">
                            <li className="flex items-start gap-1">
                                <span className="text-red-400 font-bold">•</span>
                                <span><strong>1.50J / 400 FPS</strong> strict Assault AEG cap.</span>
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-red-400 font-bold">•</span>
                                <span>Color zip-tie chrono validation tags.</span>
                            </li>
                            <li className="flex items-start gap-1 hidden sm:flex">
                                <span className="text-red-400 font-bold">•</span>
                                <span>MED enforced from 0m to 20m.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="pt-1 text-[8.5px] sm:text-[9.5px] font-mono text-red-400/80 uppercase">Tamper-Proof Tagging</div>
                </div>

                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-zinc-900/95 via-zinc-950/90 to-black border border-emerald-500/30 hover:border-emerald-500/60 transition-all space-y-2 shadow-[0_10px_25px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_16px_35px_rgba(16,185,129,0.2)] hover:-translate-y-1 backdrop-blur-md group flex flex-col justify-between">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-[11px] sm:text-sm font-black text-white uppercase tracking-wider truncate">Field Command</h4>
                                <p className="text-[8.5px] sm:text-[10px] text-emerald-400 font-mono truncate">QR Check-in &amp; Roster</p>
                            </div>
                        </div>
                        <ul className="text-[9.5px] sm:text-xs text-zinc-300 space-y-1 pt-1.5 border-t border-white/10 leading-tight">
                            <li className="flex items-start gap-1">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span>Instant QR pass scan for check-in.</span>
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span>Rental package tracking &amp; inventory.</span>
                            </li>
                            <li className="flex items-start gap-1 hidden sm:flex">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span>Auto faction &amp; squad balance.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="pt-1 text-[8.5px] sm:text-[9.5px] font-mono text-emerald-400/80 uppercase">Sub-Second QR Check-In</div>
                </div>

                <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-b from-zinc-900/95 via-zinc-950/90 to-black border border-cyan-500/30 hover:border-cyan-500/60 transition-all space-y-2 shadow-[0_10px_25px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_16px_35px_rgba(6,182,212,0.2)] hover:-translate-y-1 backdrop-blur-md group flex flex-col justify-between">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shrink-0 group-hover:scale-105 transition-transform shadow-inner">
                                <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-[11px] sm:text-sm font-black text-white uppercase tracking-wider truncate">Cloud Synchrony</h4>
                                <p className="text-[8.5px] sm:text-[10px] text-cyan-400 font-mono truncate">Supabase Realtime CDC</p>
                            </div>
                        </div>
                        <ul className="text-[9.5px] sm:text-xs text-zinc-300 space-y-1 pt-1.5 border-t border-white/10 leading-tight">
                            <li className="flex items-start gap-1">
                                <span className="text-cyan-400 font-bold">•</span>
                                <span>&lt;15ms WebSocket live synchronization.</span>
                            </li>
                            <li className="flex items-start gap-1">
                                <span className="text-cyan-400 font-bold">•</span>
                                <span>Automated Ledger double-entry.</span>
                            </li>
                            <li className="flex items-start gap-1 hidden sm:flex">
                                <span className="text-cyan-400 font-bold">•</span>
                                <span>Row-Level Security on all tables.</span>
                            </li>
                        </ul>
                    </div>
                    <div className="pt-1 text-[8.5px] sm:text-[9.5px] font-mono text-cyan-400/80 uppercase">WebSocket Stream Active</div>
                </div>
            </div>

            {/* Tactical Field Layout Illustration (Interactive Graphic) */}
            <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] relative overflow-hidden space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-white/10">
                    <div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                            <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider">
                                Combat Arena Map &amp; Zone Architecture
                            </h3>
                        </div>
                        <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
                            Zone safety classifications, engagement corridors, safe staging, and forward operating bases.
                        </p>
                    </div>
                    <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 shadow-sm">
                            GREEN: SAFE ZONE
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-bold bg-red-950 text-red-400 border border-red-800/60 shadow-sm">
                            RED: HOT ZONE
                        </span>
                    </div>
                </div>

                {/* SVG Visual Tactical Field Map */}
                <div className="relative w-full rounded-xl sm:rounded-2xl bg-zinc-900/90 border border-zinc-800/80 p-2 sm:p-4 overflow-hidden shadow-inner">
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
                        <path d="M 470 100 Q 520 80 570 100" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="5 3" />
                        <path d="M 750 300 Q 700 320 650 300" fill="none" stroke="#f87171" strokeWidth="2" strokeDasharray="5 3" />
                    </svg>

                    {/* Side-by-Side 3D Legend Tiles on Mobile */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 pt-2.5 sm:pt-3 text-[10px] sm:text-[11px] border-t border-white/10">
                        <div className="p-2 rounded-xl bg-black/50 border border-emerald-500/20 shadow-sm flex items-center gap-1.5 text-zinc-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                            <span className="truncate"><strong>Safe Staging:</strong> Goggles off.</span>
                        </div>
                        <div className="p-2 rounded-xl bg-black/50 border border-amber-500/20 shadow-sm flex items-center gap-1.5 text-zinc-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                            <span className="truncate"><strong>Chrono:</strong> 1.50J max AEG.</span>
                        </div>
                        <div className="p-2 rounded-xl bg-black/50 border border-indigo-500/20 shadow-sm flex items-center gap-1.5 text-zinc-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></span>
                            <span className="truncate"><strong>CQB Village:</strong> Semi only.</span>
                        </div>
                        <div className="p-2 rounded-xl bg-black/50 border border-red-500/20 shadow-sm flex items-center gap-1.5 text-zinc-300">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                            <span className="truncate"><strong>Hot Zone:</strong> Eye-pro 100%.</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 8-Step Complete Match Day Lifecycle Walkthrough - 2-Column Side-by-Side 3D Squares on Mobile */}
            <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-white/10">
                    <div>
                        <div className="flex items-center gap-2">
                            <Workflow className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                            <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider">
                                Chronological Match Day Lifecycle (8 Steps)
                            </h3>
                        </div>
                        <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
                            Standard operating timeline from dawn registration and chrono tagging to final cloud ledger synchronization.
                        </p>
                    </div>
                    <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-red-950/80 text-red-400 border border-red-800/60 self-start sm:self-auto shadow-sm">
                        07:30 &rarr; 17:00 SCHEDULE
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                    {[
                        {
                            step: '01',
                            time: '07:30 - 08:30',
                            title: 'Arrival & QR Sign-In',
                            desc: 'Operators present QR player codes at Registration HQ. Waivers validated & ticket fees settled.',
                            color: 'text-cyan-400',
                            border: 'border-cyan-500/30'
                        },
                        {
                            step: '02',
                            time: '08:00 - 09:00',
                            title: 'Chrono & Tagging',
                            desc: 'Replicas tested with game BB weights. Joules recorded; color zip-tie tag affixed to trigger guard.',
                            color: 'text-amber-400',
                            border: 'border-amber-500/30'
                        },
                        {
                            step: '03',
                            time: '08:45 - 09:15',
                            title: 'Armory Rental Issue',
                            desc: 'Rental packages issued (G&G Raider AEG, 2x Hi-Cap mags, 11.1v LiPo, mesh mask, 2k BBs).',
                            color: 'text-emerald-400',
                            border: 'border-emerald-500/30'
                        },
                        {
                            step: '04',
                            time: '09:15 - 09:45',
                            title: 'Safety Briefing & SOP',
                            desc: 'Mandatory rules: "Blind Man" cease-fire drill, dead-rag deployment, hit honor code & MED rules.',
                            color: 'text-red-400',
                            border: 'border-red-500/30'
                        },
                        {
                            step: '05',
                            time: '09:45 - 10:00',
                            title: 'Factions & Radio Sync',
                            desc: 'Alpha (Blue) vs Bravo (Red) assigned. Squad leaders designated, UHF/FRS radio channels tuned.',
                            color: 'text-indigo-400',
                            border: 'border-indigo-500/30'
                        },
                        {
                            step: '06',
                            time: '10:00 - 13:00',
                            title: 'Phase 1 Engagements',
                            desc: 'Dynamic scenario rotations: Team Deathmatch warmup, Sector Domination & CQB Hostage Rescue.',
                            color: 'text-pink-400',
                            border: 'border-pink-500/30'
                        },
                        {
                            step: '07',
                            time: '13:00 - 16:30',
                            title: 'Phase 2 Scenario Ops',
                            desc: 'Tactical missions: VIP Escort, Search & Destroy bomb defusal & King of the Hill compound defense.',
                            color: 'text-purple-400',
                            border: 'border-purple-500/30'
                        },
                        {
                            step: '08',
                            time: '16:30 - 17:00',
                            title: 'Event Finalization',
                            desc: 'Game master clicks Finalize Event. +500 RP awarded, badges unlocked, leaderboard updated.',
                            color: 'text-emerald-400',
                            border: 'border-emerald-500/30'
                        }
                    ].map((item, idx) => (
                        <div key={idx} className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border ${item.border} space-y-1.5 shadow-[0_6px_16px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.8)] hover:-translate-y-0.5 transition-all flex flex-col justify-between`}>
                            <div className="space-y-1">
                                <div className="flex items-center justify-between gap-1">
                                    <span className={`text-sm sm:text-base font-black font-mono ${item.color}`}>{item.step}</span>
                                    <span className="text-[8.5px] sm:text-[10px] font-mono font-bold text-zinc-400 bg-black/60 px-1.5 py-0.5 rounded border border-zinc-800 shrink-0">
                                        {item.time}
                                    </span>
                                </div>
                                <h4 className="text-[11px] sm:text-xs font-bold text-white uppercase leading-tight">{item.title}</h4>
                                <p className="text-[9.5px] sm:text-[11px] text-zinc-400 leading-snug">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Squad Radio Comms & Frequency Allocations Table */}
            <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950/95 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.15)] space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-white/10">
                    <div>
                        <div className="flex items-center gap-2">
                            <RadioTower className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                            <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider">
                                Squad Radio Frequency Plan &amp; Protocol (UHF/FRS)
                            </h3>
                        </div>
                        <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
                            Standard channel assignments for Baofeng, Motorola, and Midland tactical radios.
                        </p>
                    </div>
                    <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 sm:py-1 rounded-full border border-amber-800/50 self-start sm:self-auto shadow-sm">
                        FRS/GMRS STANDARD
                    </span>
                </div>

                {/* Mobile Side-by-Side Channel Squares */}
                <div className="grid grid-cols-2 md:hidden gap-2">
                    {[
                        { ch: 'CH 01', freq: '462.5625 MHz', tone: 'Open (CSQ)', role: 'Marshal / Emergency', desc: 'Cease-fire alerts ("Blind Man"), injury calls & emergency stop sirens.', color: 'text-amber-400', border: 'border-amber-500/40', badge: 'bg-amber-950/80 text-amber-300' },
                        { ch: 'CH 02', freq: '462.5875 MHz', tone: '67.0 Hz', role: 'Alpha Faction (Blue)', desc: 'Blue team tactical moves, spotter calls & objective capture status.', color: 'text-blue-400', border: 'border-blue-500/40', badge: 'bg-blue-950/80 text-blue-300' },
                        { ch: 'CH 03', freq: '462.6125 MHz', tone: '71.9 Hz', role: 'Bravo Faction (Red)', desc: 'Red team assaults, sniper overwatch calls & flank maneuvers.', color: 'text-red-400', border: 'border-red-500/40', badge: 'bg-red-950/80 text-red-300' },
                        { ch: 'CH 04', freq: '462.6375 MHz', tone: '77.0 Hz', role: 'Armory & Logistics', desc: 'Rental battery swaps, BB restock & chrono marshal check-ins.', color: 'text-emerald-400', border: 'border-emerald-500/40', badge: 'bg-emerald-950/80 text-emerald-300' }
                    ].map((radio, idx) => (
                        <div key={idx} className={`p-2.5 rounded-xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border ${radio.border} shadow-[0_6px_14px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] space-y-1.5 flex flex-col justify-between`}>
                            <div>
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-black font-mono ${radio.color}`}>{radio.ch}</span>
                                    <span className="text-[8.5px] font-mono text-zinc-400 bg-black/60 px-1 py-0.5 rounded border border-zinc-800">{radio.tone}</span>
                                </div>
                                <div className="text-[10px] font-mono text-white font-bold">{radio.freq}</div>
                                <div className={`text-[9px] font-bold uppercase ${radio.color} mt-0.5`}>{radio.role}</div>
                                <p className="text-[8.5px] text-zinc-400 leading-snug mt-1">{radio.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
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

