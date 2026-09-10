import React, { useState } from 'react';
import { 
    Target, 
    Flame, 
    Flag, 
    Shield, 
    Zap, 
    Lock, 
    Trophy, 
    Compass, 
    Moon, 
    Crosshair, 
    AlertTriangle, 
    CheckCircle2, 
    Info, 
    Users, 
    Clock, 
    Radio,
    Sparkles,
    ShieldAlert
} from 'lucide-react';

export const AboutOperations: React.FC = () => {
    const [selectedScenario, setSelectedScenario] = useState<number>(0);

    const scenarios = [
        {
            id: 'tdm',
            title: 'Team Deathmatch (TDM / Attrition)',
            subtitle: 'Warmup & Core Combat Mechanics',
            icon: <Flame className="w-5 h-5 text-red-400" />,
            duration: '20 - 30 Minutes',
            respawnType: 'Touch-Base HQ or 3-Min Wave',
            playerCapacity: '10 to 100+ Players',
            objective: 'Reach 50 confirmed team eliminations or hold highest ticket count at match clock expiration.',
            rules: [
                'Two factions deploy from opposing HQ spawn points on marshal air-horn signal.',
                'Struck operators must shout "HIT!", raise red dead-rag, and walk directly back to HQ touch-pad.',
                'No ghosting: eliminated players cannot speak, signal, point, or relay enemy positions on radios.',
                'Full-auto allowed outside CQB structures in short 2-second bursts; semi-auto only inside structures.'
            ],
            scoring: '+500 RP Attendance for all participants; +150 RP for winning faction members.',
            tacticalTip: 'Establish a solid 3-man fire-and-maneuver squad. Never move across open corridors without suppressing overwatch fire.'
        },
        {
            id: 'domination',
            title: 'Sector Domination (3-Point Control)',
            subtitle: 'Territory Control & Strategic Bleed',
            icon: <Flag className="w-5 h-5 text-amber-400" />,
            duration: '35 - 45 Minutes',
            respawnType: 'FOB Spawn or Main Base',
            playerCapacity: '20 to 100+ Players',
            objective: 'Capture and hold 3 digital control flags (Alpha Bunker, Bravo Village, Charlie Bridge) to accumulate 1,000 points.',
            rules: [
                'Control boxes feature digital buttons. Press and hold faction color for 5 continuous seconds to claim.',
                'Each controlled sector awards 1 ticket per 10 seconds to the controlling faction.',
                'Capturing both Alpha and Bravo unlocks the Forward Operating Base (FOB) for 50-meter closer squad respawns.',
                'Defenders cannot camp within 10 meters of an enemy captured FOB.'
            ],
            scoring: '+500 RP Attendance, +250 RP for players with confirmed flag captures logged by field marshals.',
            tacticalTip: 'Split your team 40% defense, 60% dynamic attack. Securing the central CQB Village provides line of sight on both exterior flags.'
        },
        {
            id: 'vip',
            title: 'VIP Extraction / High-Value Target (HVT)',
            subtitle: 'Asymmetric Escort & Ambush',
            icon: <Shield className="w-5 h-5 text-emerald-400" />,
            duration: '25 - 35 Minutes',
            respawnType: '1 Life for VIP • 1 Respawn for Squad',
            playerCapacity: '12 to 50 Players',
            objective: 'Assault team must locate and escort an unarmed VIP to Extraction LZ Alpha. Defenders set ambushes.',
            rules: [
                'The VIP wears a high-visibility vest and carries only a 1-shot sidearm or no weapon.',
                'VIP must physically touch an escorting operator to move; if escort is hit, VIP freezes in place.',
                'VIP has 1 life; if hit by defending BBs, round ends in immediate Defending Faction Victory.',
                'Extraction requires VIP to stay inside the designated 5x5m LZ for 30 uninterrupted seconds.'
            ],
            scoring: '+500 RP Attendance, +300 RP VIP Escort Commendation for successful extraction.',
            tacticalTip: 'Use smoke grenades to mask open crossings. Keep a designated point-man 10 meters ahead of the VIP to trigger ambushes early.'
        },
        {
            id: 'bomb',
            title: 'Search & Destroy / Bomb Defusal',
            subtitle: 'Round-Based CQB Plant & Defuse',
            icon: <Zap className="w-5 h-5 text-cyan-400" />,
            duration: '15 Mins / Round (Best of 5)',
            respawnType: 'Single Life (No Respawns per Round)',
            playerCapacity: '10 to 30 Players',
            objective: 'Attackers must carry the electronic bomb briefcase to Site A (Armory) or Site B (Bunker) and arm the 45s timer.',
            rules: [
                'Arming requires typing the 4-digit code and holding the arm switch for 5 seconds.',
                'Defenders have 45 seconds once armed to reach the briefcase and hold the defuse switch for 10 continuous seconds.',
                'Eliminated operators must sit down with dead-rag on and cannot communicate in any manner.',
                'Sides switch automatically after 3 completed rounds.'
            ],
            scoring: '+500 RP Attendance, +200 RP for Bomb Planter or Defuser.',
            tacticalTip: 'Fake a push towards Site A with heavy grenades while your carrier quietly sneaks towards Site B through the flanking drainage trench.'
        },
        {
            id: 'hostage',
            title: 'CQB Hostage Rescue & Room Clearance',
            subtitle: 'Precision Infiltration & Civilian ROE',
            icon: <Lock className="w-5 h-5 text-purple-400" />,
            duration: '25 - 35 Minutes',
            respawnType: 'Single Life with 1 Buddy Revive',
            playerCapacity: '12 to 40 Players',
            objective: 'Special Forces team must breach the 2-story CQB compound, eliminate guards, and safely extract 2 civilian hostages.',
            rules: [
                'Semi-automatic fire only inside all buildings and enclosed structures.',
                'Strict Civilian ROE: -200 RP penalty and round loss if a hostage is struck by friendly BB fire.',
                'Hostages must be untied (15-second physical action) before they can follow operators to the extraction van.',
                'Flashlights permitted; weapon-mounted strobes capped at max 10Hz.'
            ],
            scoring: '+500 RP Attendance, +250 RP Hostage Rescuer Award.',
            tacticalTip: 'Slice the pie on all doorways before entering. Call out "CLEAR!" upon securing every single room to avoid friendly crossfire.'
        },
        {
            id: 'koth',
            title: 'King of the Hill (Fortress Defense)',
            subtitle: 'High-Density Fortified Compound Assault',
            icon: <Trophy className="w-5 h-5 text-yellow-400" />,
            duration: '30 Minutes Continuous',
            respawnType: 'Continuous Rolling Respawns (30s delay)',
            playerCapacity: '20 to 100+ Players',
            objective: 'Hold the fortified central bunker hilltop for a cumulative total of 15 minutes on the digital master clock.',
            rules: [
                'A single electronic clock box rests inside the bunker with two large buttons (Red / Blue).',
                'When your team clears the bunker, tap your button to start your faction clock and pause the enemy clock.',
                'Sound flash grenades thrown into the bunker count as an instant elimination for all occupants without hard cover.',
                'Support gunners (LMGs) can lay suppressive fire onto surrounding berms.'
            ],
            scoring: '+500 RP Attendance, +150 RP for team holding hill at victory.',
            tacticalTip: 'Do not cluster 10 players inside one room—a single grenade will wipe your squad. Keep 4 players inside and 6 players guarding outer flanks.'
        },
        {
            id: 'intel',
            title: 'Downed Pilot / Cipher Intel Retrieval',
            subtitle: 'Grid Search & Extraction Under Fire',
            icon: <Compass className="w-5 h-5 text-teal-400" />,
            duration: '35 - 45 Minutes',
            respawnType: 'Wave Respawn every 5 Minutes',
            playerCapacity: '16 to 60 Players',
            objective: 'Locate 3 classified flight recorder canisters hidden across the wilderness sector and return them to HQ Comms Tower.',
            rules: [
                'Marshals broadcast GPS coordinates or terrain clues over radio CH 01 at match start.',
                'Canisters weigh 5kg each and must be hand-carried (no throwing or kicking canisters).',
                'If a carrier is hit, they must place the canister on the ground where struck.',
                'Whichever team banks 2 out of 3 canisters at their HQ antenna wins.'
            ],
            scoring: '+500 RP Attendance, +200 RP Intel Courier Bonus.',
            tacticalTip: 'Dispatch fast recon scouts to secure canister locations early while your main heavy squad ambushes the enemy return routes.'
        },
        {
            id: 'nightops',
            title: 'Night Ops / Blackout Infiltration',
            subtitle: 'Low-Light & Tracer Combat Simulation',
            icon: <Moon className="w-5 h-5 text-blue-400" />,
            duration: '30 - 45 Minutes (Night Match)',
            respawnType: 'Base Touch with Red Chem-Light Dead Marker',
            playerCapacity: '16 to 60 Players',
            objective: 'Night assault on illuminated compound using green/red tracer BBs and weapon-mounted tactical lights.',
            rules: [
                'Tracer units or muzzle flash simulators mandatory for night engagements.',
                'Dead players MUST immediately activate a RED chemical light-stick or red LED beacon on top of their helmet.',
                'Laser pointers: Eye-safe Class 1 / 3R green/red only. No high-power IR lasers without marshal clearance.',
                'Sound devices (thunder-V) permitted until 22:00 curfew.'
            ],
            scoring: '+500 RP Attendance, +100 RP Night Raider Commendation.',
            tacticalTip: 'Momentary light discipline is critical. Flash your weapon light for 0.5s to acquire the target, shoot, and immediately relocate.'
        }
    ];

    const currentScenario = scenarios[selectedScenario];

    return (
        <div className="space-y-6">
            {/* Tactical Special Ops Visual Banner */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.85)] group">
                <div className="relative h-44 sm:h-56 md:h-64 w-full overflow-hidden">
                    <img 
                        src="/images/tactical_special_ops_1789071723177.jpg" 
                        alt="Special Operations CQB Stack" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-90 contrast-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-transparent to-black/60" />

                    {/* HUD Tactical Tags */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-cyan-500/40 backdrop-blur-md">
                            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                            <span className="text-[9.5px] sm:text-[11px] font-mono font-bold text-cyan-300 tracking-wider uppercase">SQUAD TACTICS &amp; ROE</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-amber-500/40 backdrop-blur-md">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[9.5px] sm:text-[11px] font-mono font-bold text-amber-300 tracking-wider">8 MATCH FORMATS</span>
                        </div>
                    </div>

                    {/* Bottom Headline */}
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                        <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded bg-red-600/80 text-white font-mono text-[9px] font-bold uppercase tracking-wider">
                                Mission Command Directive
                            </span>
                            <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-wider drop-shadow-md">
                                Scenario Operations &amp; Combat Blueprints
                            </h2>
                            <p className="text-[11px] sm:text-xs text-zinc-300 max-w-xl line-clamp-2 sm:line-clamp-none drop-shadow">
                                Standardized tournament and skirmish rules of engagement designed for dynamic squad teamwork, CQB room clearing, and objective mastery.
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="px-3 py-1.5 rounded-xl bg-black/70 border border-white/10 backdrop-blur-md text-right font-mono">
                                <div className="text-[9px] text-zinc-400">FAIR PLAY CODE</div>
                                <div className="text-xs font-bold text-emerald-400">HONOR SYSTEM 100%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header with Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-zinc-800">
                <div>
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider">
                            8 Official Combat Match Formats &amp; Rules of Engagement (ROE)
                        </h3>
                    </div>
                    <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
                        Comprehensive tactical blueprints, respawn rules, scoring algorithms, and pro operator tips.
                    </p>
                </div>
                <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-zinc-900 text-red-400 border border-zinc-800 self-start sm:self-auto shrink-0">
                    SELECT SCENARIO BELOW
                </span>
            </div>

            {/* Scenario Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-2">
                {scenarios.map((sc, idx) => (
                    <button
                        key={sc.id}
                        onClick={() => setSelectedScenario(idx)}
                        className={`p-2 sm:p-2.5 rounded-xl text-left transition-all border flex flex-col justify-between gap-1.5 sm:gap-2 ${
                            selectedScenario === idx
                                ? 'bg-red-600 text-white font-bold border-red-500 shadow-lg shadow-red-900/40 scale-[1.02]'
                                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-zinc-800/90'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className={`p-1 sm:p-1.5 rounded-lg ${selectedScenario === idx ? 'bg-black/30' : 'bg-zinc-950 border border-zinc-800'}`}>
                                {sc.icon}
                            </div>
                            <span className="text-[9.5px] sm:text-[10px] font-mono font-bold opacity-70">0{idx + 1}</span>
                        </div>
                        <div className="text-[10.5px] sm:text-[11px] font-black uppercase tracking-tight leading-tight line-clamp-2">
                            {sc.title.split('(')[0]}
                        </div>
                    </button>
                ))}
            </div>

            {/* Active Scenario Detailed Deep Dive Card */}
            <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-3 sm:space-y-4 relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3 pb-2.5 sm:pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 shrink-0">
                            {currentScenario.icon}
                        </div>
                        <div className="min-w-0">
                            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-red-400 uppercase tracking-widest">
                                SCENARIO BLUEPRINT #0{selectedScenario + 1}
                            </span>
                            <h4 className="text-sm sm:text-xl font-black text-white uppercase tracking-tight truncate">
                                {currentScenario.title}
                            </h4>
                            <p className="text-[10.5px] sm:text-xs text-zinc-400 font-medium truncate">
                                {currentScenario.subtitle}
                            </p>
                        </div>
                    </div>

                    {/* Scenario Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] sm:text-[11px] font-mono font-bold text-zinc-300 flex items-center gap-1 sm:gap-1.5">
                            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                            <span>{currentScenario.duration}</span>
                        </div>
                        <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] sm:text-[11px] font-mono font-bold text-zinc-300 flex items-center gap-1 sm:gap-1.5">
                            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
                            <span>{currentScenario.playerCapacity}</span>
                        </div>
                        <div className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-red-950/80 border border-red-800/60 text-[10px] sm:text-[11px] font-mono font-bold text-red-300">
                            {currentScenario.respawnType}
                        </div>
                    </div>
                </div>

                {/* Objective Callout Box */}
                <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-1">
                    <div className="text-[9.5px] sm:text-[10px] font-mono uppercase font-bold text-red-400 flex items-center gap-1">
                        <Target className="w-3.5 h-3.5" /> PRIMARY MISSION WIN CONDITION:
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                        {currentScenario.objective}
                    </p>
                </div>

                {/* Rules & Mechanics Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5 sm:space-y-2">
                        <h5 className="text-[11px] sm:text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" /> Operational Rules &amp; Field Mechanics
                        </h5>
                        <ul className="text-[10.5px] sm:text-xs text-zinc-300 space-y-1 sm:space-y-1.5">
                            {currentScenario.rules.map((r, i) => (
                                <li key={i} className="flex items-start gap-1.5 sm:gap-2">
                                    <span className="text-red-400 font-bold font-mono text-[9.5px] sm:text-xs">0{i+1}.</span>
                                    <span>{r}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-2.5 sm:space-y-3">
                        {/* Scoring Formula Box */}
                        <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-amber-500/30 space-y-1">
                            <h5 className="text-[11px] sm:text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> RP &amp; Badge Reward Formula
                            </h5>
                            <p className="text-[10.5px] sm:text-xs text-zinc-200 leading-relaxed">
                                {currentScenario.scoring}
                            </p>
                        </div>

                        {/* Pro Operator Tactical Tip */}
                        <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-cyan-500/30 space-y-1">
                            <h5 className="text-[11px] sm:text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Pro Operator Field Tip
                            </h5>
                            <p className="text-[10.5px] sm:text-xs text-zinc-300 leading-relaxed italic">
                                "{currentScenario.tacticalTip}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hit Calling & Medic Revive Universal SOP Matrix */}
            <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-zinc-800">
                    <div>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                            <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider">
                                Universal Hit Calling, Ricochet &amp; Medic Protocols
                            </h3>
                        </div>
                        <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
                            Airsoft is an honor-based sport. Zero tolerance for uncalled hits or aggressive conduct.
                        </p>
                    </div>
                    <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800/60 self-start sm:self-auto shrink-0">
                        HONOR CODE STRICT
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
                    <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-1.5 sm:space-y-2">
                        <div className="flex items-center gap-2 text-red-400">
                            <Crosshair className="w-4 h-4" />
                            <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider">What Counts as a Hit</h4>
                        </div>
                        <ul className="text-[10.5px] sm:text-xs text-zinc-300 space-y-1 sm:space-y-1.5">
                            <li className="flex items-start gap-1.5">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span>Direct BB strike to any part of body, head, helmet, boots, or uniform.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span>Direct hit on plate carrier, pouches, backpacks, or holsters.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-emerald-400 font-bold">✓</span>
                                <span>Friendly fire: hits from teammates count as valid hits.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-amber-400 font-bold">~</span>
                                <span>Gun hits: Gun hits disable primary weapon unless switching to sidearm.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-1.5 sm:space-y-2">
                        <div className="flex items-center gap-2 text-amber-400">
                            <Flame className="w-4 h-4" />
                            <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider">Hit Confirmation Procedure</h4>
                        </div>
                        <ul className="text-[10.5px] sm:text-xs text-zinc-300 space-y-1 sm:space-y-1.5">
                            <li className="flex items-start gap-1.5">
                                <span className="text-red-400 font-bold">1.</span>
                                <span>Loudly shout <strong>"HIT!"</strong> immediately with hands high.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-red-400 font-bold">2.</span>
                                <span>Unfurl and display your red dead-rag on your head or held high.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-red-400 font-bold">3.</span>
                                <span>Never call hits on opposing players. Inform a field marshal instead.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-red-400 font-bold">4.</span>
                                <span>Dead players do not talk, point, or reveal tactical positions.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-1.5 sm:space-y-2">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Shield className="w-4 h-4" />
                            <h4 className="text-[11px] sm:text-xs font-black uppercase tracking-wider">Surrender &amp; "Bang-Bang"</h4>
                        </div>
                        <ul className="text-[10.5px] sm:text-xs text-zinc-300 space-y-1 sm:space-y-1.5">
                            <li className="flex items-start gap-1.5">
                                <span className="text-cyan-400 font-bold">•</span>
                                <span>If within 3 meters directly behind an unaware player, say <strong>"Surrender!"</strong>.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-cyan-400 font-bold">•</span>
                                <span>Courteous sportsmanship to prevent painful point-blank BB impacts.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-cyan-400 font-bold">•</span>
                                <span>If two players round a corner simultaneously, both fall back 5m and re-engage.</span>
                            </li>
                            <li className="flex items-start gap-1.5">
                                <span className="text-cyan-400 font-bold">•</span>
                                <span>Blind firing around walls without looking down sights is strictly prohibited.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
