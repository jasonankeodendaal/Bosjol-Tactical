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
    Info,
    Shield
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-zinc-800">
                <div>
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                        <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider">
                            Safety Code &amp; Standard Operating Procedures (SOP)
                        </h3>
                    </div>
                    <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
                        Non-negotiable safety mandates, emergency cease-fire drills, eye protection standards, and medical protocols.
                    </p>
                </div>
                <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-red-950 text-red-400 border border-red-800/60 self-start sm:self-auto">
                    ZERO TOLERANCE POLICY
                </span>
            </div>

            {/* "BLIND MAN" Emergency Drill Highlight Box */}
            <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-red-950/30 border-2 border-red-500/50 shadow-2xl space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-red-500/30">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-red-600 text-white shrink-0 animate-pulse">
                            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider truncate">
                                EMERGENCY "BLIND MAN" CEASE-FIRE PROTOCOL
                            </h4>
                            <p className="text-[10px] sm:text-xs text-red-300 font-medium">
                                Immediate universal cease-fire call for lost eye protection, medical emergency, or civilian on field.
                            </p>
                        </div>
                    </div>
                    <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-red-900 text-white self-start sm:self-auto shrink-0">
                        ANY PLAYER CAN CALL THIS
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-black/50 border border-red-800/60 space-y-1">
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-red-400">STEP 01</span>
                        <h5 className="text-[11px] sm:text-xs font-bold text-white uppercase">SHOUT LOUDLY</h5>
                        <p className="text-[10px] sm:text-[11px] text-zinc-300 leading-relaxed">
                            Any operator who witnesses a fallen goggle, injury, or civilian immediately yells <strong>"BLIND MAN! BLIND MAN!"</strong>.
                        </p>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-black/50 border border-red-800/60 space-y-1">
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-red-400">STEP 02</span>
                        <h5 className="text-[11px] sm:text-xs font-bold text-white uppercase">REPEAT &amp; ECHO</h5>
                        <p className="text-[10px] sm:text-[11px] text-zinc-300 leading-relaxed">
                            Every operator hearing the call must immediately echo <strong>"BLIND MAN!"</strong> across the field to spread the alert.
                        </p>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-black/50 border border-red-800/60 space-y-1">
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-red-400">STEP 03</span>
                        <h5 className="text-[11px] sm:text-xs font-bold text-white uppercase">SAFE &amp; BARREL DOWN</h5>
                        <p className="text-[10px] sm:text-[11px] text-zinc-300 leading-relaxed">
                            Cease all firing immediately. Switch weapon selector to <strong>SAFE</strong>, point barrel at ground, and remain frozen in place.
                        </p>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-black/50 border border-red-800/60 space-y-1">
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-red-400">STEP 04</span>
                        <h5 className="text-[11px] sm:text-xs font-bold text-white uppercase">AWAIT "ALL CLEAR"</h5>
                        <p className="text-[10px] sm:text-[11px] text-zinc-300 leading-relaxed">
                            Field marshals secure the casualty or hazard. Only marshals can declare <strong>"GAME ON / ALL CLEAR!"</strong> to resume play.
                        </p>
                    </div>
                </div>
            </div>

            {/* Ballistic Eyewear & Safe Staging Rules */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2.5 sm:space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <Glasses className="w-4 h-4 sm:w-5 sm:h-5" />
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">Ballistic Eye &amp; Face Protection Standard</h4>
                    </div>
                    <ul className="text-[10.5px] sm:text-xs text-zinc-300 space-y-1.5 sm:space-y-2">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>ANSI Z87.1+ / EN166 Class F/B:</strong> Full-seal wrap-around goggles or glasses with mandatory retention strap.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>Lower Face Mesh Guard:</strong> Steel wire mesh mask protecting teeth, nose, and jaw. Mandatory for players under 18.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>Never Remove Goggles on Field:</strong> Lifting or wiping goggles in the combat zone results in immediate field expulsion.</span>
                        </li>
                    </ul>
                </div>

                <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2.5 sm:space-y-3">
                    <div className="flex items-center gap-2 text-amber-400">
                        <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">Safe Zone Staging Protocols</h4>
                    </div>
                    <ul className="text-[10.5px] sm:text-xs text-zinc-300 space-y-1.5 sm:space-y-2">
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span><strong>Magazine Out:</strong> Magazines must be removed from all replicas before passing through the safe zone threshold.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span><strong>Clear Chamber:</strong> Fire two clearing shots into the clearing barrel before entering safe staging.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span><strong>Barrel Sock Attached:</strong> High-visibility barrel blocking sock or muzzle cover must be installed on all long guns.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Prohibited Items & Medical Care */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-zinc-950/80 border border-red-500/30 space-y-2.5 sm:space-y-3">
                    <div className="flex items-center gap-2 text-red-400">
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">Strictly Prohibited Equipment</h4>
                    </div>
                    <ul className="text-[10.5px] sm:text-xs text-zinc-300 space-y-1.5">
                        <li className="flex items-center gap-2">
                            <span className="text-red-500 font-bold shrink-0">✕</span>
                            <span>Metal, steel, glass, or non-biodegradable plastic BBs.</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-red-500 font-bold shrink-0">✕</span>
                            <span>High-power Class 3B/4 or unfiltered IR lasers (retinal damage hazard).</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-red-500 font-bold shrink-0">✕</span>
                            <span>Homemade fireworks, unapproved pyrotechnics, or real-steel firearms/knives.</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-red-500 font-bold shrink-0">✕</span>
                            <span>Replicas exceeding chronograph energy ceilings or lacking chrono tag.</span>
                        </li>
                    </ul>
                </div>

                <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-zinc-950/80 border border-emerald-500/30 space-y-2.5 sm:space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5" />
                        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">First Aid, Hydration &amp; Eye Wash Stations</h4>
                    </div>
                    <p className="text-[10.5px] sm:text-xs text-zinc-300 leading-relaxed">
                        HQ Registration is equipped with a certified Trauma First Aid Kit, automated external defibrillator (AED), sterile eye wash stations, and emergency cold packs.
                    </p>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[10.5px] sm:text-xs text-zinc-300 space-y-1">
                        <div className="text-emerald-400 font-bold">Hydration Requirement:</div>
                        <div>Operators must consume at least 500ml of water or electrolyte drink every 60 minutes during summer combat operations.</div>
                    </div>
                </div>
            </div>

            {/* Safe Staging Zone vs Hot Combat Zone Equipment Clearance Matrix */}
            <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2 min-w-0">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
                        <div className="min-w-0">
                            <h4 className="text-sm sm:text-base font-black text-white uppercase truncate">
                                Field Zone Readiness &amp; Equipment Safety Status Matrix
                            </h4>
                            <p className="text-[10px] sm:text-xs text-zinc-400">
                                Strictly enforced transitions between Safe Staging (Chrono / Parking / HQ) and Hot Combat Arena.
                            </p>
                        </div>
                    </div>
                    <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800/60 self-start sm:self-auto shrink-0">
                        SOP BOUNDARY GATES
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {/* Safe Staging Area Status Card */}
                    <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-emerald-500/30 space-y-2.5 sm:space-y-3">
                        <div className="flex items-center justify-between gap-1">
                            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60 truncate">
                                SAFE ZONE (STAGING / HQ)
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-mono text-zinc-400 uppercase shrink-0">NO EYE-PRO REQ</span>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs">
                            <div className="p-2 sm:p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between gap-2">
                                <span className="text-zinc-300 truncate">Magazine in Weapon</span>
                                <span className="font-mono font-bold text-[9.5px] sm:text-[11px] text-red-400 px-1.5 sm:px-2 py-0.5 rounded bg-red-950/60 border border-red-800/40 shrink-0">PROHIBITED</span>
                            </div>
                            <div className="p-2 sm:p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between gap-2">
                                <span className="text-zinc-300 truncate">Weapon Selector Switch</span>
                                <span className="font-mono font-bold text-[9.5px] sm:text-[11px] text-emerald-400 px-1.5 sm:px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 shrink-0">SAFE LOCK</span>
                            </div>
                            <div className="p-2 sm:p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between gap-2">
                                <span className="text-zinc-300 truncate">Barrel Blocking Sock</span>
                                <span className="font-mono font-bold text-[9.5px] sm:text-[11px] text-emerald-400 px-1.5 sm:px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 shrink-0">ON MANDATORY</span>
                            </div>
                            <div className="p-2 sm:p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between gap-2">
                                <span className="text-zinc-300 truncate">Dry Firing / Trigger Pull</span>
                                <span className="font-mono font-bold text-[9.5px] sm:text-[11px] text-red-400 px-1.5 sm:px-2 py-0.5 rounded bg-red-950/60 border border-red-800/40 shrink-0">FORBIDDEN</span>
                            </div>
                        </div>
                    </div>

                    {/* Hot Combat Arena Status Card */}
                    <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-red-500/30 space-y-2.5 sm:space-y-3">
                        <div className="flex items-center justify-between gap-1">
                            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-mono font-bold bg-red-950 text-red-300 border border-red-800/60 truncate">
                                HOT COMBAT ZONE (SECTORS 1-7)
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-mono text-red-400 uppercase font-bold shrink-0">EYE-PRO REQ</span>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs">
                            <div className="p-2 sm:p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between gap-2">
                                <span className="text-zinc-300 truncate">Ballistic Eye Protection</span>
                                <span className="font-mono font-bold text-[9.5px] sm:text-[11px] text-emerald-400 px-1.5 sm:px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 shrink-0">100% OF TIME</span>
                            </div>
                            <div className="p-2 sm:p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between gap-2">
                                <span className="text-zinc-300 truncate">Chrono Zip-Tie Tag</span>
                                <span className="font-mono font-bold text-[9.5px] sm:text-[11px] text-emerald-400 px-1.5 sm:px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 shrink-0">VERIFIED</span>
                            </div>
                            <div className="p-2 sm:p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between gap-2">
                                <span className="text-zinc-300 truncate">Red Dead-Rag on Person</span>
                                <span className="font-mono font-bold text-[9.5px] sm:text-[11px] text-amber-400 px-1.5 sm:px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/40 shrink-0">MANDATORY</span>
                            </div>
                            <div className="p-2 sm:p-2.5 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between gap-2">
                                <span className="text-zinc-300 truncate">Civilian / Goggle Loss</span>
                                <span className="font-mono font-bold text-[9.5px] sm:text-[11px] text-red-400 px-1.5 sm:px-2 py-0.5 rounded bg-red-950/60 border border-red-800/40 shrink-0">"BLIND MAN"</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
