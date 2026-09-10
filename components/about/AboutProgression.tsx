import React from 'react';
import { 
    Trophy, 
    Award, 
    Zap, 
    Sparkles, 
    Shield, 
    Star, 
    Crown, 
    Flame, 
    CheckCircle2, 
    AlertTriangle, 
    Lock,
    Crosshair,
    HeartPulse,
    Moon,
    Users
} from 'lucide-react';
import { resolveRankIcon, getRankBadgeSvg } from '../../utils/rankBadges';

export const AboutProgression: React.FC = () => {
    const rankTiers = [
        {
            name: 'Rookie Tier',
            baseName: 'Rookie I',
            xp: '0 - 499 RP',
            gradient: 'from-zinc-800 to-zinc-950',
            border: 'border-zinc-700',
            accent: 'text-zinc-300',
            subranks: ['Rookie I (0-149 RP)', 'Rookie II (150-299 RP)', 'Rookie III (300-499 RP)'],
            perks: [
                'Standard Digital Calling Card',
                '5% Equipment Rental Discount',
                'Access to Open Public Skirmishes',
                'Armory Profile & Attendance History'
            ]
        },
        {
            name: 'Veteran Tier',
            baseName: 'Veteran I',
            xp: '500 - 1,749 RP',
            gradient: 'from-emerald-950/80 to-zinc-950',
            border: 'border-emerald-600/50',
            accent: 'text-emerald-400',
            subranks: ['Veteran I (500-849 RP)', 'Veteran II (850-1,249 RP)', 'Veteran III (1,250-1,749 RP)'],
            perks: [
                'Bronze Metal Insignia on Leaderboard',
                '10% BB & Gas Purchase Discount',
                'Squad Leader Nomination Rights',
                'Access to Night Ops Matches'
            ]
        },
        {
            name: 'Elite Tier',
            baseName: 'Elite I',
            xp: '1,750 - 3,499 RP',
            gradient: 'from-blue-950/80 to-zinc-950',
            border: 'border-blue-500/50',
            accent: 'text-blue-400',
            subranks: ['Elite I (1,750-2,249 RP)', 'Elite II (2,250-2,849 RP)', 'Elite III (2,850-3,499 RP)'],
            perks: [
                'Silver Wings Profile Crest',
                '15% Rental & Armory Discount',
                'VIP Staging Area Reserved Bench',
                'Early Access to MilSim Scenarios'
            ]
        },
        {
            name: 'Pro Tier',
            baseName: 'Pro I',
            xp: '3,500 - 5,999 RP',
            gradient: 'from-amber-950/80 to-zinc-950',
            border: 'border-amber-500/50',
            accent: 'text-amber-400',
            subranks: ['Pro I (3,500-4,199 RP)', 'Pro II (4,200-5,099 RP)', 'Pro III (5,100-5,999 RP)'],
            perks: [
                'Gold Star Operator Distinction',
                '20% Store & Field Entry Fee Discount',
                'Custom Neon Callsign Glow in Roster',
                'Marshal Assistant / Referee Eligibility'
            ]
        },
        {
            name: 'Master Tier',
            baseName: 'Master I',
            xp: '6,000 - 11,999 RP',
            gradient: 'from-purple-950/80 to-zinc-950',
            border: 'border-purple-500/50',
            accent: 'text-purple-400',
            subranks: ['Master I (6,000-7,799 RP)', 'Master II (7,800-9,799 RP)', 'Master III (9,800-11,999 RP)'],
            perks: [
                'Ruby Master Crest & Holographic Border',
                '25% All-Access Season Pass Discount',
                'Free Monthly Tactical Raffle Tickets',
                'Priority Gunsmith Bench Scheduling'
            ]
        },
        {
            name: 'Legendary Tier',
            baseName: 'Legendary I',
            xp: '12,000+ RP',
            gradient: 'from-red-950/90 to-zinc-950',
            border: 'border-red-500/60',
            accent: 'text-red-400',
            subranks: ['Legendary I (12,000-14,999 RP)', 'Legendary II (15,000-19,999 RP)', 'Apex Legend (20,000+ RP)'],
            perks: [
                'Mythic Obsidian Emblem & Golden Card Frame',
                'Hall of Legends Permanent Plaque',
                'VIP Armory Locker & Lifetime Discount',
                'Honorary Marshal Badge & Match Director Vote'
            ]
        }
    ];

    const medals = [
        {
            title: 'Iron Will Medal',
            desc: 'Complete 10 consecutive field events in a single season without missing a match.',
            bonus: '+1,000 RP Bonus',
            icon: <Shield className="w-5 h-5 text-amber-400" />
        },
        {
            title: 'Marksman Ace',
            desc: 'Awarded by field marshals for extraordinary sniper overwatch and objective defense.',
            bonus: '+500 RP Bonus',
            icon: <Crosshair className="w-5 h-5 text-red-400" />
        },
        {
            title: 'Squad Vanguard',
            desc: 'Successfully lead an assault squad to 3 consecutive sector capture victories.',
            bonus: '+750 RP Bonus',
            icon: <Users className="w-5 h-5 text-blue-400" />
        },
        {
            title: 'Combat Medic Honor',
            desc: 'Perform 15+ tactical teammate revives in a single scenario session.',
            bonus: '+500 RP Bonus',
            icon: <HeartPulse className="w-5 h-5 text-emerald-400" />
        },
        {
            title: 'Night Stalker',
            desc: 'Participate and excel in 5 official night infiltration tracer combat operations.',
            bonus: '+600 RP Bonus',
            icon: <Moon className="w-5 h-5 text-purple-400" />
        },
        {
            title: 'Sportsmanship Shield',
            desc: 'Recognized for exemplary honor, voluntary hit-calling, and assisting rookie players.',
            bonus: '+1,000 RP Bonus',
            icon: <Crown className="w-5 h-5 text-yellow-400" />
        }
    ];

    return (
        <div className="space-y-6">
            {/* 3D Rank & Trophy Showcase Banner */}
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.85)] group">
                <div className="relative h-44 sm:h-56 md:h-64 w-full overflow-hidden">
                    <img 
                        src="/images/rank_3d_pedestal.jpg" 
                        alt="3D Tactical Rank Badges & Pedestal" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-95 contrast-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-transparent to-black/60" />

                    {/* HUD Tactical Tags */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-amber-500/40 backdrop-blur-md">
                            <Trophy className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[9.5px] sm:text-[11px] font-mono font-bold text-amber-300 tracking-wider uppercase">TIER PROGRESSION ENGINE</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-purple-500/40 backdrop-blur-md">
                            <Crown className="w-3.5 h-3.5 text-purple-400" />
                            <span className="text-[9.5px] sm:text-[11px] font-mono font-bold text-purple-300 tracking-wider">LEGENDARY REWARDS</span>
                        </div>
                    </div>

                    {/* Bottom Headline */}
                    <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                        <div className="space-y-1">
                            <span className="px-2 py-0.5 rounded bg-amber-600/80 text-white font-mono text-[9px] font-bold uppercase tracking-wider">
                                Career Milestones
                            </span>
                            <h2 className="text-lg sm:text-2xl font-black text-white uppercase tracking-wider drop-shadow-md">
                                Operator Ranks, Tiers &amp; Insignia Badges
                            </h2>
                            <p className="text-[11px] sm:text-xs text-zinc-300 max-w-xl line-clamp-2 sm:line-clamp-none drop-shadow">
                                Earn Rank Points (RP) across 6 major tiers and 18 sub-ranks. Unlock equipment discounts, custom calling cards, and field privileges.
                            </p>
                        </div>
                        <div className="hidden sm:flex items-center gap-2">
                            <div className="px-3 py-1.5 rounded-xl bg-black/70 border border-white/10 backdrop-blur-md text-right font-mono">
                                <div className="text-[9px] text-zinc-400">MAX TIER</div>
                                <div className="text-xs font-bold text-purple-400">LEGENDARY (12,000+ RP)</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                <div>
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                            Career Progression, 6 Tier Hierarchy &amp; Operator Badges
                        </h3>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                        Earn Rank Points (RP) through match attendance, objective captures, and marshal commendations.
                    </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950 text-amber-400 border border-amber-800/60">
                    6 TIERS • 18 SUB-RANKS
                </span>
            </div>

            {/* 6 Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rankTiers.map((tier, idx) => {
                    const badgeUri = resolveRankIcon('', tier.baseName);
                    return (
                        <div 
                            key={idx} 
                            className={`p-4 sm:p-5 rounded-3xl bg-gradient-to-br ${tier.gradient} border ${tier.border} shadow-xl backdrop-blur-md space-y-3 relative overflow-hidden group hover:scale-[1.01] transition-all`}
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="w-14 h-14 flex items-center justify-center shrink-0">
                                    <img 
                                        src={badgeUri} 
                                        alt={tier.name}
                                        onError={(e) => {
                                            (e.currentTarget as HTMLImageElement).src = getRankBadgeSvg(tier.baseName);
                                        }}
                                        className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)] group-hover:scale-110 transition-transform"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                                        TIER 0{idx + 1}
                                    </div>
                                    <h4 className={`text-base font-black uppercase tracking-tight ${tier.accent}`}>
                                        {tier.name}
                                    </h4>
                                    <span className="inline-block text-[11px] font-mono font-bold text-amber-400 bg-black/60 px-2 py-0.5 rounded border border-amber-500/30 mt-0.5">
                                        {tier.xp}
                                    </span>
                                </div>
                            </div>

                            {/* Sub-ranks */}
                            <div className="pt-2 border-t border-white/10 space-y-1">
                                <div className="text-[10px] font-mono text-zinc-400 uppercase">Sub-Ranks Inside Tier:</div>
                                <div className="text-xs font-mono text-zinc-200">
                                    {tier.subranks.join(' • ')}
                                </div>
                            </div>

                            {/* Unlocked Perks */}
                            <div className="space-y-1">
                                <div className="text-[10px] font-mono text-zinc-400 uppercase">Tier Benefits &amp; Perks:</div>
                                <ul className="text-xs text-zinc-300 space-y-1">
                                    {tier.perks.map((p, i) => (
                                        <li key={i} className="flex items-start gap-1.5">
                                            <span className="text-amber-400 font-bold">•</span>
                                            <span>{p}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* RP Math Breakdown Grid */}
            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                    <div>
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-400" />
                            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                                Rank Points (RP) Earning &amp; Penalty Mathematics
                            </h3>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Automated calculations applied across confirmed player profiles during match finalization.
                        </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/50">
                        CLOUD CASCADE FORMULA
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-1">
                        <div className="text-xl font-black text-emerald-400 font-mono">+500 RP</div>
                        <div className="text-xs font-bold text-white uppercase">Match Finalization</div>
                        <p className="text-[11px] text-zinc-400">Awarded to all checked-in operators upon single-click event finalization.</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-1">
                        <div className="text-xl font-black text-emerald-400 font-mono">+250 RP</div>
                        <div className="text-xs font-bold text-white uppercase">Objective Capture / VIP</div>
                        <p className="text-[11px] text-zinc-400">Securing domination points, defusing bombs, or successful VIP extractions.</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center space-y-1">
                        <div className="text-xl font-black text-emerald-400 font-mono">+150 RP</div>
                        <div className="text-xs font-bold text-white uppercase">Marshal Commendation</div>
                        <p className="text-[11px] text-zinc-400">Awarded for outstanding team leadership, communication, or honor plays.</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-red-500/30 text-center space-y-1">
                        <div className="text-xl font-black text-red-400 font-mono">-200 RP</div>
                        <div className="text-xs font-bold text-red-300 uppercase">Safety SOP Penalty</div>
                        <p className="text-[11px] text-zinc-400">Chrono failure, blind-firing, uncalled hit warning, or safe-zone magazine violation.</p>
                    </div>
                </div>
            </div>

            {/* Legendary Achievement Medals Showcase */}
            <div className="p-4 sm:p-6 rounded-3xl bg-zinc-950/90 border border-zinc-800 shadow-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                    <div>
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-amber-400" />
                            <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                                Legendary Combat Medals &amp; Milestone Achievements
                            </h3>
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Special career badges awarded for extraordinary tactical milestones.
                        </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-800/50">
                        SEASONAL AWARDS
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {medals.map((m, i) => (
                        <div key={i} className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
                                        {m.icon}
                                    </div>
                                    <h4 className="text-xs font-black text-white uppercase">{m.title}</h4>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/40">
                                    {m.bonus}
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                                {m.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
