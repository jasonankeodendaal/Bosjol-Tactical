import React, { useState } from 'react';
import { 
    Boxes, 
    Shield, 
    Zap, 
    Wrench, 
    BatteryCharging, 
    Sparkles, 
    CheckCircle2, 
    Sliders, 
    AlertTriangle, 
    Info, 
    Layers, 
    Flame, 
    PackageCheck,
    Cpu,
    Target
} from 'lucide-react';

export const AboutArmory: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<'batteries' | 'gas' | 'hopup' | 'rentals'>('batteries');

    return (
        <div className="space-y-6">
            {/* Tactical Armory Visual Banner */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.85)] group">
                <div className="relative min-h-[260px] sm:min-h-[260px] md:min-h-[270px] w-full overflow-hidden p-3.5 sm:p-5 md:p-6 flex flex-col justify-between gap-3">
                    <img 
                        src="/images/airsoft_gear_armory_1789071700147.jpg" 
                        alt="Tactical Armory Gunsmith Workbench" 
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-[0.7] contrast-110 pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-transparent to-black/60 pointer-events-none" />

                    {/* HUD Tactical Tags */}
                    <div className="relative z-10 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 border border-amber-500/50 backdrop-blur-md shadow-md">
                            <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-[9px] sm:text-[10.5px] font-mono font-bold text-amber-300 tracking-wider uppercase whitespace-nowrap">
                                GUNSMITH REQUISITION
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/75 border border-cyan-500/50 backdrop-blur-md shadow-md">
                            <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="text-[9px] sm:text-[10.5px] font-mono font-bold text-cyan-300 tracking-wider whitespace-nowrap">
                                ETU &amp; HOP-UP BENCH
                            </span>
                        </div>
                    </div>

                    {/* Bottom Headline */}
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-4">
                        <div className="space-y-1 min-w-0">
                            <span className="px-2 py-0.5 rounded bg-amber-600/90 text-white font-mono text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider shadow-sm">
                                Hardware Engineering
                            </span>
                            <h2 className="text-base sm:text-2xl font-black text-white uppercase tracking-wider leading-tight drop-shadow-md">
                                Tactical Armory &amp; Replica Technology
                            </h2>
                            <p className="text-[10.5px] sm:text-xs text-zinc-300 max-w-xl leading-relaxed drop-shadow">
                                Comprehensive mechanical standards covering LiPo/Li-Ion discharge curves, gas thermodynamic pressures, R-Hop buckings, and turnkey rental systems.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                            <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-black/75 border border-white/15 backdrop-blur-md text-left sm:text-right font-mono shadow-md">
                                <div className="text-[8px] sm:text-[9px] text-zinc-400 uppercase">Rental Fleet</div>
                                <div className="text-[11px] sm:text-xs font-bold text-amber-400">40+ COMBAT SETUPS</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-zinc-800">
                <div>
                    <div className="flex items-center gap-2">
                        <Boxes className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider">
                            Tactical Armory &amp; Hardware Engineering Specifications
                        </h3>
                    </div>
                    <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
                        Deep technical guides for battery chemistries, gas pressures, hop-up buckings, and rental gear armory management.
                    </p>
                </div>
                <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-zinc-900 text-amber-400 border border-zinc-800 self-start sm:self-auto shadow-sm">
                    TECH MASTER SPECS
                </span>
            </div>

            {/* Category Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
                {[
                    { id: 'batteries', label: 'Battery Chemistries', icon: <BatteryCharging className="w-4 h-4" />, desc: 'LiPo, Li-Ion, C-Ratings, Voltage' },
                    { id: 'gas', label: 'Gas & HPA Systems', icon: <Flame className="w-4 h-4" />, desc: 'Green Gas, CO2, HPA Regulators' },
                    { id: 'hopup', label: 'Hop-Up & Barrel Tech', icon: <Target className="w-4 h-4" />, desc: 'R-Hop, Buckings, Tightbore Inner Barrels' },
                    { id: 'rentals', label: 'Rental Packages', icon: <PackageCheck className="w-4 h-4" />, desc: 'Armory Bundles, Gear Maintenance' }
                ].map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id as any)}
                        className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl text-left transition-all border flex flex-col justify-between gap-1 sm:gap-1.5 ${
                            selectedCategory === cat.id
                                ? 'bg-red-600 text-white font-bold border-red-500 shadow-lg shadow-red-900/40 scale-[1.02]'
                                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-zinc-800/90'
                        }`}
                    >
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <div className={`p-1.5 rounded-lg shrink-0 ${selectedCategory === cat.id ? 'bg-black/30 text-white' : 'bg-zinc-950 text-red-400 border border-zinc-800'}`}>
                                {cat.icon}
                            </div>
                            <span className="text-[11px] sm:text-xs font-black uppercase truncate">{cat.label}</span>
                        </div>
                        <div className={`text-[9px] sm:text-[10px] truncate ${selectedCategory === cat.id ? 'text-red-100' : 'text-zinc-400'}`}>
                            {cat.desc}
                        </div>
                    </button>
                ))}
            </div>

            {/* 1. BATTERIES */}
            {selectedCategory === 'batteries' && (
                <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-zinc-800">
                        <div>
                            <h4 className="text-sm sm:text-base font-black text-white uppercase flex items-center gap-2">
                                <BatteryCharging className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> LiPo, Li-Ion &amp; NiMH Battery Chemistry Standards
                            </h4>
                            <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
                                Safe charging, storage voltages, discharge rates (C-Rating), and MOSFET compatibility.
                            </p>
                        </div>
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 sm:py-1 rounded-full border border-amber-800/50 self-start sm:self-auto">
                            SMART CHARGING ONLY
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
                        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2 flex flex-col justify-between">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-[11px] sm:text-xs font-black text-amber-400 uppercase truncate">11.1v 3S LiPo Battery</span>
                                    <span className="text-[9.5px] sm:text-[10px] font-mono text-zinc-400 shrink-0">11.1V (12.6V Max)</span>
                                </div>
                                <p className="text-[10.5px] sm:text-xs text-zinc-300 leading-snug">
                                    High rate of fire and instantaneous trigger response. Requires an electronic trigger unit (ETU) or MOSFET to prevent trigger contact arcing.
                                </p>
                            </div>
                            <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-[10px] sm:text-[11px] font-mono text-zinc-400 space-y-0.5">
                                <div>• <strong>Nominal Voltage:</strong> 3.7V / cell (11.1V total)</div>
                                <div>• <strong>Storage Voltage:</strong> 3.85V / cell</div>
                                <div>• <strong>Low Cutoff:</strong> 3.2V / cell (Never drain &lt; 3.0V)</div>
                            </div>
                        </div>

                        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2 flex flex-col justify-between">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-[11px] sm:text-xs font-black text-emerald-400 uppercase truncate">7.4v 2S LiPo Battery</span>
                                    <span className="text-[9.5px] sm:text-[10px] font-mono text-zinc-400 shrink-0">7.4V (8.4V Max)</span>
                                </div>
                                <p className="text-[10.5px] sm:text-xs text-zinc-300 leading-snug">
                                    Universal compatibility for all stock and rental AEGs. Safe for standard mechanical switch assemblies without burning contacts.
                                </p>
                            </div>
                            <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-[10px] sm:text-[11px] font-mono text-zinc-400 space-y-0.5">
                                <div>• <strong>Nominal Voltage:</strong> 3.7V / cell (7.4V total)</div>
                                <div>• <strong>Storage Voltage:</strong> 3.85V / cell</div>
                                <div>• <strong>Low Cutoff:</strong> 3.2V / cell</div>
                            </div>
                        </div>

                        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2 flex flex-col justify-between">
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-[11px] sm:text-xs font-black text-cyan-400 uppercase truncate">Li-Ion 18650 / 21700</span>
                                    <span className="text-[9.5px] sm:text-[10px] font-mono text-zinc-400 shrink-0">7.4V / 11.1V Titans</span>
                                </div>
                                <p className="text-[10.5px] sm:text-xs text-zinc-300 leading-snug">
                                    Exceptional capacity (3000mAh to 6000mAh) without puffing risk. Holds charge for months without voltage degradation.
                                </p>
                            </div>
                            <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-[10px] sm:text-[11px] font-mono text-zinc-400 space-y-0.5">
                                <div>• <strong>Form Factor:</strong> Solid cylindrical steel cells</div>
                                <div>• <strong>Safety:</strong> No pouch swell or fire hazard</div>
                                <div>• <strong>All-Day Play:</strong> Lasts 5,000+ rounds on single charge</div>
                            </div>
                        </div>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-amber-950/20 border border-amber-800/40 text-[11px] sm:text-xs text-amber-200 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="leading-snug">
                            <strong>LiPo Battery Safety Warning:</strong> Never charge unattended. Always use a dedicated balance charger inside a fire-resistant LiPo Safe Bag. Swollen or punctured batteries must be brought immediately to the tech bench for neutralization.
                        </div>
                    </div>
                </div>
            )}

            {/* 2. GAS & HPA */}
            {selectedCategory === 'gas' && (
                <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-zinc-800">
                        <div>
                            <h4 className="text-sm sm:text-base font-black text-white uppercase flex items-center gap-2">
                                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" /> Gas Blowback (GBB), CO2 &amp; High-Pressure Air (HPA)
                            </h4>
                            <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
                                Propellant pressures, cooldown management, silicone lubrication, and tournament lock mandates.
                            </p>
                        </div>
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-red-400 bg-red-950/60 px-2.5 py-0.5 sm:py-1 rounded-full border border-red-800/50 self-start sm:self-auto">
                            PRESSURE TESTED
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                            <h5 className="text-[11px] sm:text-xs font-black text-emerald-400 uppercase">Green Gas &amp; Silicone Maintenance</h5>
                            <p className="text-[10.5px] sm:text-xs text-zinc-300 leading-snug">
                                Green Gas is propane with trace silicone oil. Keeps magazine O-rings pliable and prevents slow leaks. Never store GBB magazines completely empty; keep a 2-second partial charge inside to preserve seals.
                            </p>
                            <ul className="text-[10.5px] sm:text-xs text-zinc-400 space-y-1 pt-1.5 border-t border-zinc-800">
                                <li>• Clean inner barrel with isopropyl alcohol (never spray silicone down barrel).</li>
                                <li>• Lubricate slide rails with high-viscosity synthetic grease or 100% silicone oil.</li>
                            </ul>
                        </div>

                        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                            <h5 className="text-[11px] sm:text-xs font-black text-cyan-400 uppercase">HPA Tanks, Regulators &amp; Tournament Locks</h5>
                            <p className="text-[10.5px] sm:text-xs text-zinc-300 leading-snug">
                                HPA delivers ultra-consistent shot-to-shot velocity regardless of rate of fire or temperature. All HPA regulators must receive a marshal tamper-evident zip-tie tournament lock after chrono.
                            </p>
                            <ul className="text-[10.5px] sm:text-xs text-zinc-400 space-y-1 pt-1.5 border-t border-zinc-800">
                                <li>• Tank Hydro-Test dates inspected before fill station access (5-year carbon cycle).</li>
                                <li>• Breaking tournament lock results in immediate ejection from field.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. HOP-UP & BARREL */}
            {selectedCategory === 'hopup' && (
                <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-zinc-800">
                        <div>
                            <h4 className="text-sm sm:text-base font-black text-white uppercase flex items-center gap-2">
                                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" /> Hop-Up Engineering &amp; Precision Barrel Tuning
                            </h4>
                            <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
                                Magnus effect backspin physics, bucking degrees (50° to 70°), and inner barrel bore dynamics.
                            </p>
                        </div>
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2.5 py-0.5 sm:py-1 rounded-full border border-indigo-800/50 self-start sm:self-auto">
                            MAGNUS EFFECT
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
                        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                            <h5 className="text-[11px] sm:text-xs font-black text-white uppercase">Bucking Hardness (Shore Durometer)</h5>
                            <ul className="text-[10.5px] sm:text-xs text-zinc-300 space-y-1">
                                <li>• <strong>50° (Soft):</strong> Optimal for sub-330 FPS / CQB &amp; cold weather.</li>
                                <li>• <strong>60° (Medium):</strong> Balanced standard for 350-400 FPS Assault rifles.</li>
                                <li>• <strong>70° / 80° (Hard):</strong> Designed for 450+ FPS DMRs and high-energy Snipers.</li>
                            </ul>
                        </div>

                        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                            <h5 className="text-[11px] sm:text-xs font-black text-white uppercase">Flat-Hop &amp; R-Hop Patches</h5>
                            <p className="text-[10.5px] sm:text-xs text-zinc-300 leading-snug">
                                Standard hop nubs provide a tiny contact point. R-Hop installs an elongated concave silicone patch covering 5mm of the barrel window, delivering stable backspin for 0.32g to 0.45g heavy BBs at 70+ meters.
                            </p>
                        </div>

                        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                            <h5 className="text-[11px] sm:text-xs font-black text-white uppercase">Tightbore vs. Widebore Barrels</h5>
                            <p className="text-[10.5px] sm:text-xs text-zinc-300 leading-snug">
                                <strong>6.03mm Tightbore:</strong> Increases FPS and air efficiency.<br />
                                <strong>6.05mm / 6.08mm Widebore:</strong> Creates a uniform air cushion around the BB, reducing friction on high-pressure HPA setups.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. RENTALS & GEAR */}
            {selectedCategory === 'rentals' && (
                <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-zinc-800">
                        <div>
                            <h4 className="text-sm sm:text-base font-black text-white uppercase flex items-center gap-2">
                                <PackageCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> Bosjol Tactical Rental Packages &amp; Inventory Management
                            </h4>
                            <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
                                Complete gear setups for recruits, sanitization SOPs, and automatic armory reservations.
                            </p>
                        </div>
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 sm:py-1 rounded-full border border-emerald-800/50 self-start sm:self-auto">
                            TURNKEY BUNDLES
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                            <h5 className="text-[11px] sm:text-xs font-black text-emerald-400 uppercase">Standard Combat Rental Bundle Includes:</h5>
                            <ul className="text-[10.5px] sm:text-xs text-zinc-300 space-y-1.5">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                                    <span className="leading-tight">G&amp;G Combat Machine / Specna Arms Core M4 Carbine (360 FPS)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                                    <span className="leading-tight">2x High-Capacity 300-Round Winding Magazines</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                                    <span className="leading-tight">High-Output 11.1v LiPo / Li-Ion Battery with Free Swaps</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                                    <span className="leading-tight">Full-Face Thermal Anti-Fog Protective Mask (ANSI Z87.1+)</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                                    <span className="leading-tight">2,000 High-Grade 0.25g Bio-Degradable BBs + Speedloader</span>
                                </li>
                            </ul>
                        </div>

                        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                            <h5 className="text-[11px] sm:text-xs font-black text-cyan-400 uppercase">Armory Sanitization &amp; Tech Inspection</h5>
                            <p className="text-[10.5px] sm:text-xs text-zinc-300 leading-snug">
                                Every returned mask undergoes hospital-grade UV-C and antibacterial sanitization. Every AEG has its inner barrel cleaned, motor height adjusted, and undergoes a 5-shot chronograph test before return to the armory racks.
                            </p>
                            <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-[10px] sm:text-[11px] font-mono text-zinc-400">
                                Auto-tracked in Bosjol Armory Database with serial numbers and maintenance schedules.
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
