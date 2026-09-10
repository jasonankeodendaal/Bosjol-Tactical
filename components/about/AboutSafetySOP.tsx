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
        </div>
    );
};
