import React from 'react';
import { 
    ShieldAlert, 
    AlertTriangle, 
    Glasses, 
    HeartPulse, 
    CheckCircle2, 
    Flame, 
    XCircle, 
    Droplets, 
    ShieldCheck, 
    Eye, 
    Info 
} from 'lucide-react';

export const AboutSafetySOP: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Safety Eyepro & Gear Visual Banner */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.85)] group">
                <div className="relative h-44 sm:h-56 md:h-64 w-full overflow-hidden">
                    <img 
                        src="/images/safety_eyepro_gear_1789071734124.jpg" 
                        alt="Ballistic Full Seal Eye & Face Protection" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-95 contrast-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-transparent to-black/60" />

                    {/* HUD Tactical Tags */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-emerald-500/40 backdrop-blur-md">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[9.5px] sm:text-[11px] font-mono font-bold text-emerald-300 tracking-wider uppercase">ANSI Z87.1+ FULL SEAL</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-red-500/40 backdrop-blur-md">
                            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                            <span className="text-[9.5px] sm:text-[11px] font-mono font-bold text-red-300 tracking-wider">MANDATORY FACE MESH</span>
                        </div>
                    </div>

                    {/* Bottom Headline */}
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                        <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded bg-red-600/80 text-white font-mono text-[9px] font-bold uppercase tracking-wider">
                                Safety Protocol Alpha
                            </span>
                            <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-wider drop-shadow-md">
                                Field Safety Code &amp; Standard Operating Procedures
                            </h2>
                            <p className="text-[11px] sm:text-xs text-zinc-300 max-w-xl line-clamp-2 sm:line-clamp-none drop-shadow">
                                Certified ballistic eye protection, mandatory barrel blocking socks, and instantaneous "Blind Man" emergency cease-fire protocols.
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="px-3 py-1.5 rounded-xl bg-black/70 border border-white/10 backdrop-blur-md text-right font-mono">
                                <div className="text-[9px] text-zinc-400">SAFETY STANDARD</div>
                                <div className="text-xs font-bold text-emerald-400">MIL-PRF-32432 / EN166B</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <div>
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                        <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                            Safety Code &amp; Standard Operating Procedures (SOP)
                        </h3>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Non-negotiable safety mandates, emergency cease-fire drills, eye protection standards, and medical protocols.
                    </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-950 text-red-400 border border-red-800/60">
                    ZERO TOLERANCE POLICY
                </span>
            </div>

            {/* "BLIND MAN" Emergency Drill Highlight Box */}
            <div className="p-4 sm:p-6 rounded-3xl bg-red-950/30 border-2 border-red-500/50 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-red-500/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-red-600 text-white shrink-0 animate-pulse">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                                EMERGENCY "BLIND MAN" CEASE-FIRE PROTOCOL
                            </h4>
                            <p className="text-xs text-red-300 font-medium">
                                Immediate universal cease-fire call for lost eye protection, medical emergency, or civilian on field.
                            </p>
                        </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-900 text-white">
                        ANY PLAYER CAN CALL THIS
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-black/50 border border-red-800/60 space-y-1.5">
                        <span className="text-xs font-mono font-bold text-red-400">STEP 01</span>
                        <h5 className="text-xs font-bold text-white uppercase">SHOUT LOUDLY</h5>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">
                            Any operator who witnesses a fallen goggle, injury, or civilian immediately yells <strong>"BLIND MAN! BLIND MAN!"</strong>.
                        </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-black/50 border border-red-800/60 space-y-1.5">
                        <span className="text-xs font-mono font-bold text-red-400">STEP 02</span>
                        <h5 className="text-xs font-bold text-white uppercase">REPEAT &amp; ECHO</h5>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">
                            Every operator hearing the call must immediately echo <strong>"BLIND MAN!"</strong> across the field to spread the alert.
                        </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-black/50 border border-red-800/60 space-y-1.5">
                        <span className="text-xs font-mono font-bold text-red-400">STEP 03</span>
                        <h5 className="text-xs font-bold text-white uppercase">SAFE &amp; BARREL DOWN</h5>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">
                            Cease all firing immediately. Switch weapon selector to <strong>SAFE</strong>, point barrel at ground, and remain frozen in place.
                        </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-black/50 border border-red-800/60 space-y-1.5">
                        <span className="text-xs font-mono font-bold text-red-400">STEP 04</span>
                        <h5 className="text-xs font-bold text-white uppercase">AWAIT "ALL CLEAR"</h5>
                        <p className="text-[11px] text-zinc-300 leading-relaxed">
                            Field marshals secure the casualty or hazard. Only marshals can declare <strong>"GAME ON / ALL CLEAR!"</strong> to resume play.
                        </p>
                    </div>
                </div>
            </div>

            {/* Ballistic Eyewear & Safe Staging Rules */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <Glasses className="w-5 h-5" />
                        <h4 className="text-sm font-black uppercase tracking-wider">Ballistic Eye &amp; Face Protection Standard</h4>
                    </div>
                    <ul className="text-xs text-zinc-300 space-y-2">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>ANSI Z87.1+ / EN166 Class F/B:</strong> Full-seal wrap-around goggles or glasses with mandatory retention strap.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>Lower Face Mesh Guard:</strong> Steel wire mesh mask protecting teeth, nose, and jaw. Mandatory for players under 18.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>Never Remove Goggles on Field:</strong> Lifting or wiping goggles in the combat zone results in immediate field expulsion.</span>
                        </li>
                    </ul>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-3">
                    <div className="flex items-center gap-2 text-amber-400">
                        <ShieldCheck className="w-5 h-5" />
                        <h4 className="text-sm font-black uppercase tracking-wider">Safe Zone Staging Protocols</h4>
                    </div>
                    <ul className="text-xs text-zinc-300 space-y-2">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span><strong>Magazine Out:</strong> Magazines must be removed from all replicas before passing through the safe zone threshold.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span><strong>Clear Chamber:</strong> Fire two clearing shots into the clearing barrel before entering safe staging.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span><strong>Barrel Sock Attached:</strong> High-visibility barrel blocking sock or muzzle cover must be installed on all long guns.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Prohibited Items & Medical Care */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-red-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-red-400">
                        <XCircle className="w-5 h-5" />
                        <h4 className="text-sm font-black uppercase tracking-wider">Strictly Prohibited Equipment</h4>
                    </div>
                    <ul className="text-xs text-zinc-300 space-y-1.5">
                        <li className="flex items-center gap-2">
                            <span className="text-red-500 font-bold">✕</span>
                            <span>Metal, steel, glass, or non-biodegradable plastic BBs.</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-red-500 font-bold">✕</span>
                            <span>High-power Class 3B/4 or unfiltered IR lasers (retinal damage hazard).</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-red-500 font-bold">✕</span>
                            <span>Homemade fireworks, unapproved pyrotechnics, or real-steel firearms/knives.</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-red-500 font-bold">✕</span>
                            <span>Replicas exceeding chronograph energy ceilings or lacking chrono tag.</span>
                        </li>
                    </ul>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/80 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <HeartPulse className="w-5 h-5" />
                        <h4 className="text-sm font-black uppercase tracking-wider">First Aid, Hydration &amp; Eye Wash Stations</h4>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                        HQ Registration is equipped with a certified Trauma First Aid Kit, automated external defibrillator (AED), sterile eye wash stations, and emergency cold packs.
                    </p>
                    <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 space-y-1">
                        <div className="text-emerald-400 font-bold">Hydration Requirement:</div>
                        <div>Operators must consume at least 500ml of water or electrolyte drink every 60 minutes during summer combat operations.</div>
                    </div>
                </div>
            </div>

            {/* Safe Staging Zone vs Hot Combat Zone Equipment Clearance Matrix */}
            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-amber-400" />
                        <div>
                            <h4 className="text-sm sm:text-base font-black text-white uppercase">
                                Field Zone Readiness &amp; Equipment Safety Status Matrix
                            </h4>
                            <p className="text-xs text-zinc-400">
                                Strictly enforced transitions between Safe Staging (Chrono / Parking / HQ) and Hot Combat Arena.
                            </p>
                        </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800/60 self-start sm:self-auto">
                        SOP BOUNDARY GATES
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Safe Staging Area Status Card */}
                    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-emerald-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                                SAFE ZONE (STAGING / HQ)
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400 uppercase">NO EYE-PRO REQUIRED</span>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between">
                                <span className="text-zinc-300">Magazine in Weapon</span>
                                <span className="font-mono font-bold text-red-400 px-2 py-0.5 rounded bg-red-950/60 border border-red-800/40">PROHIBITED (OUT)</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between">
                                <span className="text-zinc-300">Weapon Selector Switch</span>
                                <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">LOCKED ON SAFE</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between">
                                <span className="text-zinc-300">Barrel Blocking Sock</span>
                                <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">MANDATORY ON</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between">
                                <span className="text-zinc-300">Dry Firing / Trigger Pull</span>
                                <span className="font-mono font-bold text-red-400 px-2 py-0.5 rounded bg-red-950/60 border border-red-800/40">STRICTLY FORBIDDEN</span>
                            </div>
                        </div>
                    </div>

                    {/* Hot Combat Arena Status Card */}
                    <div className="p-4 rounded-2xl bg-zinc-900/60 border border-red-500/30 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-red-950 text-red-300 border border-red-800/60">
                                HOT COMBAT ZONE (SECTORS 1-7)
                            </span>
                            <span className="text-[10px] font-mono text-red-400 uppercase font-bold">FULL EYE-PRO MANDATORY</span>
                        </div>
                        <div className="space-y-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between">
                                <span className="text-zinc-300">Ballistic Eye Protection</span>
                                <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">ON 100% OF TIME</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between">
                                <span className="text-zinc-300">Chrono Zip-Tie Tag</span>
                                <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40">INSPECTED &amp; VERIFIED</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between">
                                <span className="text-zinc-300">Red Dead-Rag on Person</span>
                                <span className="font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40">MANDATORY IN POUCH</span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between">
                                <span className="text-zinc-300">Civilian / Goggle Loss Protocol</span>
                                <span className="font-mono font-bold text-red-400 px-2 py-0.5 rounded bg-red-950/60 border border-red-800/40">"BLIND MAN" CEASE-FIRE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
