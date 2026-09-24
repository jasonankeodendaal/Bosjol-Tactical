import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { Player, GameEvent, Rank } from '../types';
import { 
    TrendingUp, 
    Sparkles, 
    Crosshair,
    ChevronRight
} from 'lucide-react';

interface PlayerXpGrowthChartProps {
    player: Player;
    events?: GameEvent[];
    ranks?: Rank[];
}

interface XpDataPoint {
    id: string;
    date: Date;
    dateLabel: string;
    label: string;
    type: 'match' | 'adjustment' | 'season_start' | 'current';
    xpDelta: number;
    cumulativeXp: number;
    rankName?: string;
    details?: string;
}

export const PlayerXpGrowthChart: React.FC<PlayerXpGrowthChartProps> = ({
    player,
    events = [],
    ranks = []
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [timeRange, setTimeRange] = useState<'all' | '30d' | 'recent5'>('all');
    const [hoveredPointId, setHoveredPointId] = useState<string | null>(null);

    const totalXp = player.stats?.xp || 0;

    // Flatten rank tiers in ascending order for milestone tracking
    const allTiers = useMemo(() => {
        return (ranks || [])
            .flatMap(rank => (rank.tiers || []).map(tier => ({
                ...tier,
                parentRankName: rank.name,
                color: rank.color || '#f59e0b'
            })))
            .sort((a, b) => a.minXp - b.minXp);
    }, [ranks]);

    const getRankForXp = (xpVal: number) => {
        if (!allTiers.length) return 'Recruit';
        const unlocked = allTiers.filter(t => xpVal >= t.minXp);
        return unlocked.length > 0 ? unlocked[unlocked.length - 1].name : allTiers[0].name;
    };

    // Construct chronological timeline of XP progression
    const allDataPoints: XpDataPoint[] = useMemo(() => {
        const rawTimeline: {
            date: Date;
            label: string;
            type: 'match' | 'adjustment' | 'season_start';
            xpDelta: number;
            details?: string;
        }[] = [];

        // 1. Process match history
        const history = player.matchHistory || [];
        history.forEach((match, idx) => {
            const matchedEvent = (events || []).find(e => e.id === match.eventId);
            let matchDate: Date;
            
            if (match.date && !isNaN(new Date(match.date).getTime())) {
                matchDate = new Date(match.date);
            } else if (matchedEvent?.date && !isNaN(new Date(matchedEvent.date).getTime())) {
                matchDate = new Date(matchedEvent.date);
            } else {
                const d = new Date();
                d.setDate(d.getDate() - ((history.length - idx) * 7));
                matchDate = d;
            }

            const xpEarned = match.xpGained || 50;
            rawTimeline.push({
                date: matchDate,
                label: match.eventName || matchedEvent?.title || `Operation #${idx + 1}`,
                type: 'match',
                xpDelta: xpEarned,
                details: match.result ? `Outcome: ${match.result}` : undefined
            });
        });

        // 2. Process XP Adjustments
        const adjustments = player.xpAdjustments || [];
        adjustments.forEach((adj, idx) => {
            let adjDate: Date;
            if (adj.date && !isNaN(new Date(adj.date).getTime())) {
                adjDate = new Date(adj.date);
            } else {
                const d = new Date();
                d.setDate(d.getDate() - (idx * 3));
                adjDate = d;
            }

            rawTimeline.push({
                date: adjDate,
                label: adj.reason || 'Commendation',
                type: 'adjustment',
                xpDelta: adj.amount || 0,
                details: adj.amount >= 0 ? `+${adj.amount} RP` : `${adj.amount} RP`
            });
        });

        rawTimeline.sort((a, b) => a.date.getTime() - b.date.getTime());

        const result: XpDataPoint[] = [];

        if (rawTimeline.length === 0) {
            const now = new Date();
            const seasonStart = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
            
            result.push({
                id: 'start',
                date: seasonStart,
                dateLabel: seasonStart.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                label: 'Season Enlistment',
                type: 'season_start',
                xpDelta: 0,
                cumulativeXp: 0,
                rankName: getRankForXp(0),
                details: 'Initial deployment'
            });

            result.push({
                id: 'current',
                date: now,
                dateLabel: now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                label: 'Current Record',
                type: 'current',
                xpDelta: totalXp,
                cumulativeXp: totalXp,
                rankName: getRankForXp(totalXp),
                details: 'Live Verified RP'
            });
        } else {
            const firstDate = new Date(rawTimeline[0].date.getTime() - (2 * 24 * 60 * 60 * 1000));
            result.push({
                id: 'season_init',
                date: firstDate,
                dateLabel: firstDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                label: 'Season Enlistment',
                type: 'season_start',
                xpDelta: 0,
                cumulativeXp: 0,
                rankName: getRankForXp(0),
                details: 'Initial deployment'
            });

            let runningXp = 0;
            rawTimeline.forEach((item, idx) => {
                runningXp = Math.max(0, runningXp + item.xpDelta);
                result.push({
                    id: `pt_${idx}`,
                    date: item.date,
                    dateLabel: item.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    label: item.label,
                    type: item.type,
                    xpDelta: item.xpDelta,
                    cumulativeXp: runningXp,
                    rankName: getRankForXp(runningXp),
                    details: item.details
                });
            });

            if (totalXp > runningXp || result.length === 2) {
                const now = new Date();
                result.push({
                    id: 'current_standing',
                    date: now,
                    dateLabel: now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    label: 'Current Season Standing',
                    type: 'current',
                    xpDelta: Math.max(0, totalXp - runningXp),
                    cumulativeXp: totalXp,
                    rankName: getRankForXp(totalXp),
                    details: 'Real-time verified total'
                });
            }
        }

        return result;
    }, [player.matchHistory, player.xpAdjustments, events, totalXp, allTiers]);

    // Filter by selected time range
    const filteredPoints = useMemo(() => {
        if (timeRange === 'all' || allDataPoints.length <= 2) return allDataPoints;

        if (timeRange === 'recent5') {
            const lastPoints = allDataPoints.slice(-5);
            return lastPoints[0]?.type === 'season_start' ? lastPoints : [allDataPoints[0], ...lastPoints];
        }

        if (timeRange === '30d') {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 30);
            const inRange = allDataPoints.filter(p => p.date >= cutoff || p.type === 'current');
            return inRange.length > 0 ? [allDataPoints[0], ...inRange] : allDataPoints.slice(-3);
        }

        return allDataPoints;
    }, [allDataPoints, timeRange]);

    // Active displayed node in Center Holo-HUD
    const activePoint = useMemo(() => {
        if (hoveredPointId) {
            return filteredPoints.find(p => p.id === hoveredPointId) || null;
        }
        return filteredPoints[filteredPoints.length - 1] || null;
    }, [hoveredPointId, filteredPoints]);

    // Summary statistics
    const statsSummary = useMemo(() => {
        const gains = filteredPoints.map(p => p.xpDelta).filter(d => d > 0);
        const highest = gains.length > 0 ? Math.max(...gains) : 0;
        const avg = gains.length > 0 ? Math.round(gains.reduce((a, b) => a + b, 0) / gains.length) : 0;
        const totalMatches = (player.matchHistory || []).length;
        
        // Progress toward next rank
        const currentRankTier = allTiers.find(t => totalXp >= t.minXp && (!t.maxXp || totalXp < t.maxXp)) || allTiers[0];
        const nextRankTier = allTiers.find(t => t.minXp > totalXp);
        const nextMin = nextRankTier?.minXp || (currentRankTier?.maxXp || totalXp + 500);
        const curMin = currentRankTier?.minXp || 0;
        const rankProgressPct = Math.min(100, Math.max(0, Math.round(((totalXp - curMin) / Math.max(1, nextMin - curMin)) * 100)));

        return {
            highestGain: highest,
            avgGain: avg,
            totalRecordedEvents: totalMatches,
            rankProgressPct,
            currentTierName: player.rank?.name || getRankForXp(totalXp),
            nextTierName: nextRankTier?.name || 'Max Rank'
        };
    }, [filteredPoints, player.matchHistory, totalXp, allTiers, player.rank]);

    // Draw Tiny D3 3D Holographic Circle Timeloop (Ultra Compact: 104x104px)
    useEffect(() => {
        if (!svgRef.current || filteredPoints.length === 0) return;

        const size = 104;
        const center = size / 2;
        const radius = 38; // Compact radius for tiny side-by-side radar

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        svg.attr('width', size)
           .attr('height', size)
           .attr('viewBox', `0 0 ${size} ${size}`);

        const defs = svg.append('defs');

        // Radial Glow Filter for 3D Depth
        const glowFilter = defs.append('filter')
            .attr('id', 'timeloop-tiny-glow')
            .attr('x', '-20%').attr('y', '-20%')
            .attr('width', '140%').attr('height', '140%');
        glowFilter.append('feGaussianBlur')
            .attr('stdDeviation', '2.5')
            .attr('result', 'coloredBlur');
        const feMerge = glowFilter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Radial Gradient for Holographic Timeloop Core
        const coreGradient = defs.append('radialGradient')
            .attr('id', 'timeloop-tiny-core')
            .attr('cx', '50%').attr('cy', '50%')
            .attr('r', '50%');
        coreGradient.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b').attr('stop-opacity', '0.22');
        coreGradient.append('stop').attr('offset', '70%').attr('stop-color', '#ef4444').attr('stop-opacity', '0.06');
        coreGradient.append('stop').attr('offset', '100%').attr('stop-color', '#000000').attr('stop-opacity', '0.85');

        // Timeloop Arc Linear Gradient
        const arcGradient = defs.append('linearGradient')
            .attr('id', 'timeloop-tiny-arc')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '100%').attr('y2', '100%');
        arcGradient.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6').attr('stop-opacity', '0.8');
        arcGradient.append('stop').attr('offset', '50%').attr('stop-color', '#f59e0b').attr('stop-opacity', '0.95');
        arcGradient.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', '1');

        const g = svg.append('g').attr('transform', `translate(${center}, ${center})`);

        // 1. Inner Holo Core
        g.append('circle')
            .attr('r', radius - 8)
            .attr('fill', 'url(#timeloop-tiny-core)');

        // 2. Background Track Groove
        g.append('circle')
            .attr('r', radius)
            .attr('fill', 'none')
            .attr('stroke', '#27272a')
            .attr('stroke-width', 3)
            .attr('stroke-opacity', 0.5);

        // 3. Polar coordinate conversion for timeline points
        const startAngle = -Math.PI / 2; // Top 12 o'clock
        const sweepAngle = Math.PI * 1.75; // 315 deg sweep

        const maxCumulative = Math.max(
            d3.max(filteredPoints, d => d.cumulativeXp) || totalXp || 100,
            100
        );

        const pointAngles = filteredPoints.map((d, i) => {
            const pct = filteredPoints.length > 1 
                ? (i / (filteredPoints.length - 1))
                : (d.cumulativeXp / maxCumulative);
            const angle = startAngle + (pct * sweepAngle);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return { ...d, angle, x, y };
        });

        // 4. Draw continuous Timeloop Trajectory Curve
        const arcGenerator = d3.arc()
            .innerRadius(radius - 1.8)
            .outerRadius(radius + 1.8)
            .startAngle(startAngle + Math.PI / 2)
            .endAngle(startAngle + sweepAngle + Math.PI / 2)
            .cornerRadius(2);

        g.append('path')
            .attr('d', arcGenerator as any)
            .attr('fill', 'url(#timeloop-tiny-arc)')
            .attr('filter', 'url(#timeloop-tiny-glow)')
            .attr('opacity', 0.95);

        // 5. Radar Dial Ticks (Compact)
        const tickCount = 16;
        for (let i = 0; i < tickCount; i++) {
            const tickAngle = (i / tickCount) * Math.PI * 2;
            const isMajor = i % 4 === 0;
            const r1 = radius + 4;
            const r2 = radius + (isMajor ? 7 : 5);
            g.append('line')
                .attr('x1', Math.cos(tickAngle) * r1)
                .attr('y1', Math.sin(tickAngle) * r1)
                .attr('x2', Math.cos(tickAngle) * r2)
                .attr('y2', Math.sin(tickAngle) * r2)
                .attr('stroke', isMajor ? '#f59e0b' : '#52525b')
                .attr('stroke-width', isMajor ? 1.2 : 0.6)
                .attr('opacity', isMajor ? 0.8 : 0.3);
        }

        // 6. Interactive Node Orbs
        pointAngles.forEach((pt) => {
            const isHovered = hoveredPointId === pt.id;
            const isLatest = pt.type === 'current' || pt.id === pointAngles[pointAngles.length - 1].id;

            const nodeGroup = g.append('g')
                .attr('class', 'timeloop-node cursor-pointer')
                .on('mouseenter', () => setHoveredPointId(pt.id))
                .on('mouseleave', () => setHoveredPointId(null))
                .on('click', () => setHoveredPointId(pt.id));

            if (isHovered || isLatest) {
                nodeGroup.append('circle')
                    .attr('cx', pt.x)
                    .attr('cy', pt.y)
                    .attr('r', isHovered ? 5.5 : 4)
                    .attr('fill', 'none')
                    .attr('stroke', isHovered ? '#f59e0b' : '#10b981')
                    .attr('stroke-width', 1.2)
                    .attr('stroke-opacity', 0.8)
                    .attr('filter', 'url(#timeloop-tiny-glow)');
            }

            nodeGroup.append('circle')
                .attr('cx', pt.x)
                .attr('cy', pt.y)
                .attr('r', isHovered ? 3.5 : isLatest ? 2.8 : 1.8)
                .attr('fill', isLatest ? '#10b981' : pt.type === 'adjustment' ? '#3b82f6' : '#f59e0b')
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 0.8);
        });

    }, [filteredPoints, hoveredPointId, totalXp]);

    return (
        <div className="w-full rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900/90 to-black p-2.5 sm:p-3 shadow-[0_12px_28px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl font-mono text-xs space-y-2 shrink-0 overflow-hidden">
            {/* Header Control Strip (Shrink-To-Fit, Zero Outlines) */}
            <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-white/5">
                <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <TrendingUp className="w-2.5 h-2.5 text-amber-400" />
                    </div>
                    <span className="font-black text-white uppercase tracking-wider text-[10px]">
                        TIMELOOP RP TRAJECTORY
                    </span>
                    <span className="px-1 py-0.2 rounded text-[7.5px] font-bold bg-amber-500/15 text-amber-300">
                        3D RADAR
                    </span>
                </div>

                {/* Range Filter Buttons */}
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-zinc-900/90 shadow-inner">
                    {[
                        { id: 'all', label: 'All' },
                        { id: '30d', label: '30D' },
                        { id: 'recent5', label: 'Recent' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setTimeRange(tab.id as any)}
                            className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold uppercase transition-all ${
                                timeRange === tab.id
                                    ? 'bg-amber-500 text-black shadow-sm font-extrabold'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Side-by-Side Shrink-To-Fit Layout: Micro Radar on Left, Live Stats HUD on Right */}
            <div className="flex flex-row items-center gap-2.5 sm:gap-4">
                {/* 1. Micro Circle Timeloop Radar (Left Column) */}
                <div className="relative w-[104px] h-[104px] flex items-center justify-center shrink-0">
                    <svg ref={svgRef} className="block overflow-visible" />

                    {/* Centered Holo HUD */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-1">
                        <span className="text-[6.5px] uppercase tracking-wider text-zinc-400 font-bold">
                            {activePoint?.id === 'current_standing' || !hoveredPointId ? 'SEASON' : 'DELTA'}
                        </span>
                        <span className="text-xs font-black text-white font-mono tracking-tight leading-none my-0.5">
                            {(activePoint?.cumulativeXp || totalXp).toLocaleString()}
                        </span>
                        <span className="text-[7px] font-bold text-emerald-400 truncate max-w-[50px] leading-tight">
                            {activePoint?.rankName || statsSummary.currentTierName}
                        </span>
                    </div>
                </div>

                {/* 2. Compact Live Metrics Panel (Right Column, Shrink to Fit) */}
                <div className="flex-1 min-w-0 space-y-1.5 font-mono text-[9.5px]">
                    {/* Active Node Info Strip */}
                    <div className="p-1.5 rounded-xl bg-zinc-900/80 shadow-sm flex items-center justify-between gap-1.5">
                        <div className="truncate min-w-0">
                            <span className="text-amber-400 font-bold uppercase truncate block text-[9px]">
                                {activePoint?.label || 'Current Standing'}
                            </span>
                            <span className="text-zinc-500 text-[8px]">
                                {activePoint?.dateLabel || 'Today'}
                            </span>
                        </div>
                        <div className="text-right shrink-0">
                            <span className="font-bold text-white block text-[10px]">
                                {(activePoint?.cumulativeXp || totalXp).toLocaleString()} RP
                            </span>
                            {activePoint && activePoint.xpDelta > 0 && (
                                <span className="text-emerald-400 font-bold text-[8px] block">
                                    +{activePoint.xpDelta} RP
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Peak & Avg Micro Strip */}
                    <div className="grid grid-cols-2 gap-1 text-[8.5px]">
                        <div className="px-1.5 py-1 rounded-lg bg-zinc-950/70 shadow-inner flex items-center justify-between">
                            <span className="text-zinc-500 uppercase">Peak:</span>
                            <span className="font-bold text-emerald-400">+{statsSummary.highestGain.toLocaleString()}</span>
                        </div>
                        <div className="px-1.5 py-1 rounded-lg bg-zinc-950/70 shadow-inner flex items-center justify-between">
                            <span className="text-zinc-500 uppercase">Avg/Op:</span>
                            <span className="font-bold text-amber-400">~{statsSummary.avgGain.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Next Rank Progress Bar */}
                    <div className="px-1.5 py-1 rounded-lg bg-zinc-950/70 shadow-inner space-y-0.5">
                        <div className="flex items-center justify-between text-[8px]">
                            <span className="text-zinc-400 truncate">Milestone: <strong className="text-white">{statsSummary.nextTierName}</strong></span>
                            <span className="text-amber-400 font-bold">{statsSummary.rankProgressPct}%</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden flex shadow-inner">
                            <div 
                                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
                                style={{ width: `${statsSummary.rankProgressPct}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
