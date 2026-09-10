import React from 'react';
import { 
    Cpu, 
    Database, 
    Zap, 
    Server, 
    Lock, 
    Radio, 
    Workflow, 
    CheckCircle2, 
    Layers, 
    Sparkles, 
    ShieldCheck, 
    ArrowRight, 
    Activity 
} from 'lucide-react';

export const AboutArchitecture: React.FC = () => {
    const schemas = [
        { name: 'players', desc: 'Operator profiles, rank tiers, career RP, contact data, callsigns, and avatar URIs.' },
        { name: 'events', desc: 'Tactical matches, game dates, locations, ticket pricing, rental bundles, and status.' },
        { name: 'signups', desc: 'Confirmed player registrations, rental equipment bookings, and check-in QR codes.' },
        { name: 'ranks', desc: 'Tier configurations, minimum XP brackets, insignia badge SVGs, and unlocked perks.' },
        { name: 'badges', desc: 'Legendary medals, match milestones, achievement criteria, and bonus RP formulas.' },
        { name: 'ledger', desc: 'Double-entry accounting journal for event ticket fees, rentals, BB sales, and payouts.' },
        { name: 'armory', desc: 'Rental gun inventory, battery health logs, serial numbers, and maintenance schedules.' },
        { name: 'attendance', desc: 'Historical match scan logs, marshal check-in timestamps, and squad rosters.' },
        { name: 'news', desc: 'Field announcements, tactical briefings, rule updates, and upcoming scenario ops.' },
        { name: 'gallery', desc: 'High-resolution combat photos, media uploads, and match highlights.' },
        { name: 'rules', desc: 'Official field safety codes, scenario ROE, chrono thresholds, and FAQ knowledgebase.' },
        { name: 'feedback', desc: 'Operator match reviews, marshal ratings, and incident safety reports.' },
        { name: 'system_settings', desc: 'Company branding, logos, slogans, banking details, and global chrono limits.' }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-zinc-800">
                <div>
                    <div className="flex items-center gap-2">
                        <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                        <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider">
                            Cloud Infrastructure, Realtime CDC &amp; Database Architecture
                        </h3>
                    </div>
                    <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
                        High-availability Supabase Cloud PostgreSQL, WebSocket data streaming, and double-entry ledger bookkeeping.
                    </p>
                </div>
                <span className="px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60 self-start sm:self-auto">
                    SUPABASE POSTGRESQL CDC
                </span>
            </div>

            {/* 3 Core Architecture Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-950/80 border border-cyan-500/30 space-y-2 shadow-lg flex flex-col justify-between">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-cyan-400">
                            <Database className="w-4 h-4 sm:w-5 sm:h-5" />
                            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">Relational Schemas</h4>
                        </div>
                        <p className="text-[10.5px] sm:text-xs text-zinc-300 leading-relaxed">
                            Enterprise-grade PostgreSQL tables with strict foreign key relationships, automated triggers, and Row-Level Security (RLS) protecting confidential operator medical and contact records.
                        </p>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-[10px] sm:text-[11px] text-zinc-400">
                        Zero data loss • Strict JSON constraints
                    </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-950/80 border border-emerald-500/30 space-y-2 shadow-lg flex flex-col justify-between">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">WebSocket Realtime CDC</h4>
                        </div>
                        <p className="text-[10.5px] sm:text-xs text-zinc-300 leading-relaxed">
                            Change Data Capture (CDC) broadcasts database mutations over persistent WebSockets (`postgres_changes`). QR code attendance scans reflect across all marshal screens with &lt;15ms latency.
                        </p>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-[10px] sm:text-[11px] text-zinc-400">
                        Sub-15ms broadcast • Auto-reconnect
                    </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-zinc-950/80 border border-amber-500/30 space-y-2 shadow-lg flex flex-col justify-between">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-amber-400">
                            <Server className="w-4 h-4 sm:w-5 sm:h-5" />
                            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider">Automated Ledger Engine</h4>
                        </div>
                        <p className="text-[10.5px] sm:text-xs text-zinc-300 leading-relaxed">
                            When Game Masters click "Finalize Event", the accounting engine computes total confirmed ticket admissions and rental fees, writing balanced income ledger records without manual accounting.
                        </p>
                    </div>
                    <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-[10px] sm:text-[11px] text-zinc-400">
                        Double-entry accounting • Audit logged
                    </div>
                </div>
            </div>

            {/* Event Finalization Cascade Data Flow Diagram */}
            <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-zinc-800">
                    <div>
                        <div className="flex items-center gap-2">
                            <Workflow className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                            <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                                Event Finalization Cloud Cascade (Atomic Transaction)
                            </h4>
                        </div>
                        <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
                            What happens under the hood when a Game Master finalizes a match.
                        </p>
                    </div>
                    <span className="text-[10px] sm:text-xs font-mono font-bold text-red-400 bg-red-950/60 px-2.5 py-0.5 sm:py-1 rounded-full border border-red-800/50 self-start sm:self-auto">
                        ATOMIC CASCADE
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-red-400">STEP 01</span>
                        <h5 className="text-[11px] sm:text-xs font-bold text-white uppercase">Attendance Lock</h5>
                        <p className="text-[10px] sm:text-[11px] text-zinc-400 leading-relaxed">
                            System verifies all QR-scanned check-in records and locks the event roster against new modifications.
                        </p>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-amber-400">STEP 02</span>
                        <h5 className="text-[11px] sm:text-xs font-bold text-white uppercase">RP &amp; XP Increment</h5>
                        <p className="text-[10px] sm:text-[11px] text-zinc-400 leading-relaxed">
                            Every attended operator receives +500 RP. Progression engine evaluates new tier thresholds and triggers level-ups.
                        </p>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-cyan-400">STEP 03</span>
                        <h5 className="text-[11px] sm:text-xs font-bold text-white uppercase">Milestone Badges</h5>
                        <p className="text-[10px] sm:text-[11px] text-zinc-400 leading-relaxed">
                            Player match count counters increment. Milestone badges (10 matches, 25 matches, Iron Will) are granted.
                        </p>
                    </div>

                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-1">
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-400">STEP 04</span>
                        <h5 className="text-[11px] sm:text-xs font-bold text-white uppercase">Ledger Journal Entry</h5>
                        <p className="text-[10px] sm:text-[11px] text-zinc-400 leading-relaxed">
                            Auto-calculates ticket income and rental gear fees, posting permanent entries into the Financial Ledger.
                        </p>
                    </div>
                </div>
            </div>

            {/* Schemas Showcase Grid */}
            <div className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-zinc-800">
                    <div>
                        <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                            <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" /> Database Collections &amp; Relational Schemas
                        </h4>
                        <p className="text-[10px] sm:text-xs text-zinc-400 mt-0.5">
                            Standard PostgreSQL tables managed within the Bosjol Tactical system.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
                    {schemas.map((s, idx) => (
                        <div key={idx} className="p-2.5 sm:p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] sm:text-xs font-mono font-bold text-cyan-400 truncate">{s.name}</span>
                                <span className="text-[9.5px] sm:text-[10px] font-mono text-zinc-500 shrink-0">public.{s.name}</span>
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-zinc-400 leading-normal">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
