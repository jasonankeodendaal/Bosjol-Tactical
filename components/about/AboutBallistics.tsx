import React, { useState } from 'react';
import { 
    Gauge, 
    Crosshair, 
    AlertTriangle, 
    CheckCircle2, 
    Info, 
    Shield, 
    Zap, 
    Thermometer, 
    Sliders,
    Sparkles,
    ShieldAlert
} from 'lucide-react';

export const AboutBallistics: React.FC = () => {
    const [selectedWeaponClass, setSelectedWeaponClass] = useState<'aeg' | 'dmr' | 'sniper' | 'pistol' | 'lmg'>('aeg');

    const weaponClasses = [
        {
            id: 'aeg',
            name: 'Assault AEG / Carbine',
            maxJoules: 1.50,
            fps020: 400,
            med: '5 Meters',
            tagColor: 'GREEN ZIP-TIE',
            tagBg: 'bg-emerald-950 text-emerald-300 border-emerald-800',
            fireModes: 'Semi & Full-Auto (Max 20 RPS)',
            desc: 'Standard tactical assault rifles, carbines, and SMGs (M4, AK, MP5, MCX, G36, SCAR-L).',
            data: [
                { weight: '0.20g Standard', fps: 400, ms: 122, joules: 1.49, med: '5m' },
                { weight: '0.25g Tactical', fps: 358, ms: 109, joules: 1.49, med: '5m' },
                { weight: '0.28g Match Grade', fps: 338, ms: 103, joules: 1.49, med: '5m' },
                { weight: '0.30g Heavy Bio', fps: 327, ms: 100, joules: 1.49, med: '5m' },
                { weight: '0.32g Precision', fps: 316, ms: 96, joules: 1.49, med: '5m' }
            ]
        },
        {
            id: 'dmr',
            name: 'Designated Marksman Rifle (DMR)',
            maxJoules: 1.88,
            fps020: 450,
            med: '15 Meters',
            tagColor: 'AMBER ZIP-TIE',
            tagBg: 'bg-amber-950 text-amber-300 border-amber-800',
            fireModes: 'Mechanically or Electronically Locked Semi-Auto Only',
            desc: 'High-power semi-automatic precision rifles with magnified optic (SR-25, M14 EBR, SCAR-H, HK417).',
            data: [
                { weight: '0.20g Standard', fps: 450, ms: 137, joules: 1.88, med: '15m' },
                { weight: '0.28g Match Grade', fps: 380, ms: 116, joules: 1.88, med: '15m' },
                { weight: '0.30g Heavy Bio', fps: 367, ms: 112, joules: 1.88, med: '15m' },
                { weight: '0.32g Precision', fps: 356, ms: 108, joules: 1.88, med: '15m' },
                { weight: '0.36g Heavy Match', fps: 335, ms: 102, joules: 1.88, med: '15m' }
            ]
        },
        {
            id: 'sniper',
            name: 'Bolt Action Sniper Rifle (BASR)',
            maxJoules: 2.32,
            fps020: 500,
            med: '20 Meters',
            tagColor: 'RED ZIP-TIE',
            tagBg: 'bg-red-950 text-red-300 border-red-800',
            fireModes: 'Manual Bolt Action Cocking Only (Spring / HPA)',
            desc: 'Extreme-range bolt action precision platforms (VSR-10, TAC-41, L96, SSG10, SRS A2).',
            data: [
                { weight: '0.20g Standard', fps: 500, ms: 152, joules: 2.32, med: '20m' },
                { weight: '0.36g Heavy Sniper', fps: 372, ms: 113, joules: 2.32, med: '20m' },
                { weight: '0.40g Ultra Heavy', fps: 353, ms: 107, joules: 2.32, med: '20m' },
                { weight: '0.43g Sniper Elite', fps: 341, ms: 104, joules: 2.32, med: '20m' },
                { weight: '0.45g Competition', fps: 333, ms: 101, joules: 2.32, med: '20m' }
            ]
        },
        {
            id: 'pistol',
            name: 'Sidearm / GBB Pistol / CQB Gun',
            maxJoules: 1.14,
            fps020: 350,
            med: '0 Meters (CQB Legal)',
            tagColor: 'BLUE ZIP-TIE',
            tagBg: 'bg-blue-950 text-blue-300 border-blue-800',
            fireModes: 'Semi-Auto / Safe',
            desc: 'Secondary gas blowback pistols, AEPs, and CQB carbines (Hi-Capa, Glock, P226, 1911, AAP-01).',
            data: [
                { weight: '0.20g Standard', fps: 350, ms: 106, joules: 1.14, med: '0m' },
                { weight: '0.25g Tactical', fps: 313, ms: 95, joules: 1.14, med: '0m' },
                { weight: '0.28g Match Grade', fps: 295, ms: 90, joules: 1.14, med: '0m' }
            ]
        },
        {
            id: 'lmg',
            name: 'Light Support Weapon (LMG / GPMG)',
            maxJoules: 1.50,
            fps020: 400,
            med: '10 Meters',
            tagColor: 'WHITE ZIP-TIE',
            tagBg: 'bg-zinc-800 text-zinc-100 border-zinc-600',
            fireModes: 'Full-Auto (Max 3-Second Bursts)',
            desc: 'Dedicated heavy support squad weapons with box magazines (M249, PKM, RPK, Stoner 96, M60).',
            data: [
                { weight: '0.20g Standard', fps: 400, ms: 122, joules: 1.49, med: '10m' },
                { weight: '0.25g Tactical', fps: 358, ms: 109, joules: 1.49, med: '10m' },
                { weight: '0.28g Match Grade', fps: 338, ms: 103, joules: 1.49, med: '10m' }
            ]
        }
    ];

    const currentClass = weaponClasses.find(w => w.id === selectedWeaponClass) || weaponClasses[0];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <div>
                    <div className="flex items-center gap-2">
                        <Gauge className="w-5 h-5 text-red-500" />
                        <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                            Ballistics Academy &amp; Kinetic Energy Chronograph Standard
                        </h3>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Joules-first testing protocol, BB weight calculations, Joule creep physics, and Minimum Engagement Distances.
                    </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    JOULE MEASURED STANDARD
                </span>
            </div>

            {/* Weapon Class Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {weaponClasses.map((w) => (
                    <button
                        key={w.id}
                        onClick={() => setSelectedWeaponClass(w.id as any)}
                        className={`p-3 rounded-2xl text-left transition-all border flex flex-col justify-between gap-1.5 ${
                            selectedWeaponClass === w.id
                                ? 'bg-red-600 text-white font-bold border-red-500 shadow-lg shadow-red-900/40 scale-[1.02]'
                                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border-zinc-800/90'
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase truncate">{w.name.split('(')[0]}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                selectedWeaponClass === w.id ? 'bg-black/40 text-white' : 'bg-zinc-950 text-amber-400'
                            }`}>
                                {w.maxJoules} J
                            </span>
                        </div>
                        <div className={`text-[10px] font-mono ${selectedWeaponClass === w.id ? 'text-red-100' : 'text-zinc-400'}`}>
                            MED: {w.med}
                        </div>
                    </button>
                ))}
            </div>

            {/* Active Class Detailed Breakdown Table */}
            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-red-400 uppercase">
                                WEAPON CLASS SPECIFICATION:
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${currentClass.tagBg}`}>
                                TAG: {currentClass.tagColor}
                            </span>
                        </div>
                        <h4 className="text-base sm:text-xl font-black text-white uppercase mt-0.5">
                            {currentClass.name}
                        </h4>
                        <p className="text-xs text-zinc-400">
                            {currentClass.desc} • <strong>Fire Mode:</strong> {currentClass.fireModes}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                        <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
                            <div className="text-[10px] text-zinc-400 uppercase">Max Energy</div>
                            <div className="text-sm font-black text-amber-400">{currentClass.maxJoules} Joules</div>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
                            <div className="text-[10px] text-zinc-400 uppercase">Base FPS (0.20g)</div>
                            <div className="text-sm font-black text-red-400">{currentClass.fps020} FPS</div>
                        </div>
                        <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-center">
                            <div className="text-[10px] text-zinc-400 uppercase">Min Engagement</div>
                            <div className="text-sm font-black text-emerald-400">{currentClass.med}</div>
                        </div>
                    </div>
                </div>

                {/* Ballistics Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                        <thead>
                            <tr className="bg-zinc-900/90 text-zinc-400 text-[10px] uppercase border-b border-zinc-800">
                                <th className="p-2.5">BB Weight</th>
                                <th className="p-2.5">Max Velocity (FPS)</th>
                                <th className="p-2.5">Velocity (m/s)</th>
                                <th className="p-2.5">Max Kinetic Energy (Joules)</th>
                                <th className="p-2.5">Minimum Engagement Distance</th>
                                <th className="p-2.5">Chrono Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                            {currentClass.data.map((row, i) => (
                                <tr key={i} className="hover:bg-zinc-900/40 transition-colors">
                                    <td className="p-2.5 font-bold text-white flex items-center gap-1.5">
                                        <Crosshair className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>{row.weight}</span>
                                    </td>
                                    <td className="p-2.5 text-red-400 font-bold">{row.fps} FPS</td>
                                    <td className="p-2.5 text-zinc-300">{row.ms} m/s</td>
                                    <td className="p-2.5 text-amber-400 font-bold">{row.joules} J</td>
                                    <td className="p-2.5 text-emerald-400 font-bold">{row.med}</td>
                                    <td className="p-2.5">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                                            PASSED FIELD LEGAL
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Joule Creep & Physics Formula Explained */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                    <div className="flex items-center gap-2 text-cyan-400">
                        <Zap className="w-5 h-5" />
                        <h4 className="text-sm font-black uppercase tracking-wider">The Physics of "Joule Creep"</h4>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                        Why does Bosjol Tactical Airsoft chrono by <strong>Joules</strong> rather than simple 0.20g FPS?
                    </p>
                    <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 font-mono text-xs text-zinc-200 space-y-1">
                        <div className="text-[10px] text-zinc-400 uppercase">Kinetic Energy Equation:</div>
                        <div className="text-amber-400 font-bold text-sm">E = ½ · m · v²</div>
                        <div className="text-[11px] text-zinc-400">
                            Where <em>m</em> = BB mass (kg) and <em>v</em> = muzzle velocity (m/s).
                        </div>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                        In high air-volume cylinders (HPA, heavy spring sniper cylinders, large bore barrels), heavier BBs accelerate longer down the barrel. A replica reading 395 FPS on 0.20g (1.45J) might produce 1.75 Joules on 0.32g BBs. This is why marshals test your weapon with the <strong>exact BB weight you will shoot on the field</strong>.
                    </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                    <div className="flex items-center gap-2 text-amber-400">
                        <Thermometer className="w-5 h-5" />
                        <h4 className="text-sm font-black uppercase tracking-wider">Gas Pressure &amp; Ambient Temperature</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                            <span className="font-bold text-emerald-400">Green Gas (Propane / 110 PSI)</span>
                            <p className="text-[11px] text-zinc-400">
                                Ideal for 15°C to 28°C. In high summer heat (35°C+), pressure climbs to 140+ PSI, increasing FPS.
                            </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                            <span className="font-bold text-red-400">Red / Black Gas (150-180 PSI)</span>
                            <p className="text-[11px] text-zinc-400">
                                Formulated specifically for cold winter operations (&lt; 10°C) to prevent cooldown freeze.
                            </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                            <span className="font-bold text-cyan-400">CO2 12g Powerlets (800+ PSI)</span>
                            <p className="text-[11px] text-zinc-400">
                                Regulated through valve pin. Exceptional cold weather reliability; chrono tested on fresh cartridge.
                            </p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                            <span className="font-bold text-purple-400">HPA Regulators (Tournament Lock)</span>
                            <p className="text-[11px] text-zinc-400">
                                High Pressure Air tanks must have a tournament lock zip-tie installed by chrono marshals.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
