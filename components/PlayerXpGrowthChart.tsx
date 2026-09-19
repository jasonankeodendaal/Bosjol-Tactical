import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { Player, GameEvent, Rank } from '../types';
import { 
    TrendingUp 
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
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(600);
    const [timeRange, setTimeRange] = useState<'all' | '30d' | 'recent5'>('all');
    const [hoveredPoint, setHoveredPoint] = useState<XpDataPoint | null>(null);
    const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

    const totalXp = player.stats?.xp || 0;

    // Flatten rank tiers in ascending order for milestone lines and tooltip rank detection
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
                // Approximate sequential date if missing
                const d = new Date();
                d.setDate(d.getDate() - ((history.length - idx) * 7));
                matchDate = d;
            }

            const xpEarned = match.xpGained || 50;
            rawTimeline.push({
                date: matchDate,
                label: match.eventName || matchedEvent?.name || `Operation #${idx + 1}`,
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
                label: adj.reason || 'Tactical Commendation',
                type: 'adjustment',
                xpDelta: adj.amount || 0,
                details: adj.amount >= 0 ? `Commendation: +${adj.amount} RP` : `Adjustment: ${adj.amount} RP`
            });
        });

        // Sort chronologically ascending
        rawTimeline.sort((a, b) => a.date.getTime() - b.date.getTime());

        // Calculate running cumulative XP
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
                label: 'Current Combat Record',
                type: 'current',
                xpDelta: totalXp,
                cumulativeXp: totalXp,
                rankName: getRankForXp(totalXp),
                details: 'Live Verified RP'
            });
        } else {
            // Anchor start of season
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

            // If actual player total XP is higher than logged matches sum, add final current point
            if (totalXp > runningXp || result.length === 2) {
                const now = new Date();
                result.push({
                    id: 'current_standing',
                    date: now,
                    dateLabel: now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    label: 'Current Season Standing',
                    type: 'current',
                    xpDelta: totalXp - runningXp,
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
        if (allDataPoints.length <= 2) return allDataPoints;
        
        if (timeRange === 'recent5') {
            const sliceStart = Math.max(0, allDataPoints.length - 6);
            return allDataPoints.slice(sliceStart);
        }

        if (timeRange === '30d') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const filtered = allDataPoints.filter(p => p.date >= thirtyDaysAgo);
            return filtered.length >= 2 ? filtered : allDataPoints.slice(-5);
        }

        return allDataPoints;
    }, [allDataPoints, timeRange]);

    // Calculate chart metrics & summary stats
    const statsSummary = useMemo(() => {
        const deltas = allDataPoints.filter(p => p.type === 'match' || p.type === 'adjustment').map(p => p.xpDelta);
        const matchPoints = allDataPoints.filter(p => p.type === 'match');
        
        const highestGain = deltas.length > 0 ? Math.max(...deltas) : totalXp;
        const avgGain = matchPoints.length > 0 
            ? Math.round(matchPoints.reduce((acc, curr) => acc + curr.xpDelta, 0) / matchPoints.length) 
            : totalXp;

        const totalRecordedEvents = matchPoints.length;

        return {
            highestGain,
            avgGain,
            totalRecordedEvents,
            currentTotal: totalXp
        };
    }, [allDataPoints, totalXp]);

    // ResizeObserver for dynamic, fluid width
    useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.contentRect.width > 0) {
                    setContainerWidth(entry.contentRect.width);
                }
            }
        });

        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // Draw D3 line chart with animated transitions and hover effects
    useEffect(() => {
        if (!svgRef.current || filteredPoints.length === 0 || containerWidth <= 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const height = containerWidth < 500 ? 100 : 115;
        const margin = {
            top: 8,
            right: 12,
            bottom: 18,
            left: containerWidth < 500 ? 30 : 36
        };

        const innerWidth = containerWidth - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        svg
            .attr('width', containerWidth)
            .attr('height', height)
            .attr('viewBox', `0 0 ${containerWidth} ${height}`);

        const g = svg
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const xExtent = d3.extent(filteredPoints, d => d.date) as [Date, Date];
        const xScale = d3.scaleTime()
            .domain(xExtent[0] && xExtent[1] && xExtent[0].getTime() !== xExtent[1].getTime() 
                ? xExtent 
                : [new Date(Date.now() - 7 * 24 * 3600 * 1000), new Date()])
            .range([0, innerWidth]);

        const maxYValue = Math.max(
            d3.max(filteredPoints, d => d.cumulativeXp) || 100,
            100
        );

        const yScale = d3.scaleLinear()
            .domain([0, maxYValue * 1.15])
            .range([innerHeight, 0])
            .nice();

        // Definitions: Gradients & Glow Filters
        const defs = svg.append('defs');

        // Area Gradient (Amber gold glow fading to deep black)
        const areaGradient = defs.append('linearGradient')
            .attr('id', 'xp-chart-area-grad')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');

        areaGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#f59e0b')
            .attr('stop-opacity', 0.3);

        areaGradient.append('stop')
            .attr('offset', '70%')
            .attr('stop-color', '#d97706')
            .attr('stop-opacity', 0.05);

        areaGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#000000')
            .attr('stop-opacity', 0.0);

        // Line Stroke Gradient (Bright Gold to Red-Amber accent)
        const lineGradient = defs.append('linearGradient')
            .attr('id', 'xp-chart-line-grad')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '100%')
            .attr('y2', '0%');

        lineGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#fbbf24');

        lineGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#f59e0b');

        // Subtle Glow Filter
        const filter = defs.append('filter')
            .attr('id', 'd3-chart-glow')
            .attr('x', '-20%')
            .attr('y', '-20%')
            .attr('width', '140%')
            .attr('height', '140%');

        filter.append('feGaussianBlur')
            .attr('stdDeviation', '2')
            .attr('result', 'coloredBlur');

        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Horizontal Grid Lines (clean and minimal)
        const yTicks = yScale.ticks(3);
        g.append('g')
            .attr('class', 'grid')
            .selectAll('line')
            .data(yTicks)
            .enter()
            .append('line')
            .attr('x1', 0)
            .attr('x2', innerWidth)
            .attr('y1', d => yScale(d))
            .attr('y2', d => yScale(d))
            .attr('stroke', '#27272a')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '2,2');

        // Area Generator
        const area = d3.area<XpDataPoint>()
            .x(d => xScale(d.date))
            .y0(innerHeight)
            .y1(d => yScale(d.cumulativeXp))
            .curve(d3.curveMonotoneX);

        // Animated Area
        const areaPath = g.append('path')
            .datum(filteredPoints)
            .attr('class', 'area')
            .attr('d', area)
            .attr('fill', 'url(#xp-chart-area-grad)')
            .attr('opacity', 0);

        areaPath.transition()
            .duration(600)
            .attr('opacity', 1);

        // Line Generator
        const line = d3.line<XpDataPoint>()
            .x(d => xScale(d.date))
            .y(d => yScale(d.cumulativeXp))
            .curve(d3.curveMonotoneX);

        // Animated Main Path
        const path = g.append('path')
            .datum(filteredPoints)
            .attr('class', 'line')
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', 'url(#xp-chart-line-grad)')
            .attr('stroke-width', 2)
            .style('filter', 'url(#d3-chart-glow)');

        const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 0;
        path
            .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(800)
            .ease(d3.easeCubicOut)
            .attr('stroke-dashoffset', 0);

        // Data Nodes / Markers
        const pointsGroup = g.append('g').attr('class', 'data-points');

        pointsGroup.selectAll('.point-halo')
            .data(filteredPoints)
            .enter()
            .append('circle')
            .attr('class', 'point-halo')
            .attr('cx', d => xScale(d.date))
            .attr('cy', d => yScale(d.cumulativeXp))
            .attr('r', 0)
            .attr('fill', '#f59e0b')
            .attr('fill-opacity', 0.2)
            .transition()
            .delay((_, i) => (i * 60) + 300)
            .duration(400)
            .attr('r', 4);

        pointsGroup.selectAll('.point-core')
            .data(filteredPoints)
            .enter()
            .append('circle')
            .attr('class', 'point-core')
            .attr('cx', d => xScale(d.date))
            .attr('cy', d => yScale(d.cumulativeXp))
            .attr('r', 0)
            .attr('fill', '#ffffff')
            .attr('stroke', '#f59e0b')
            .attr('stroke-width', 1.5)
            .transition()
            .delay((_, i) => (i * 60) + 300)
            .duration(400)
            .attr('r', 2.5);

        // X-Axis (Dates)
        const xAxis = d3.axisBottom(xScale)
            .ticks(containerWidth < 500 ? 3 : 5)
            .tickFormat(d => d3.timeFormat('%b %d')(d as Date))
            .tickSizeOuter(0);

        const gx = g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(xAxis);

        gx.select('.domain').attr('stroke', '#3f3f46');
        gx.selectAll('.tick line').attr('stroke', '#3f3f46');
        gx.selectAll('.tick text')
            .attr('fill', '#71717a')
            .attr('font-size', '8.5px')
            .attr('font-family', 'monospace')
            .attr('dy', '6px');

        // Y-Axis (RP Values)
        const yAxis = d3.axisLeft(yScale)
            .ticks(3)
            .tickFormat(d => `${d}`)
            .tickSizeOuter(0);

        const gy = g.append('g').call(yAxis);
        gy.select('.domain').attr('stroke', '#3f3f46');
        gy.selectAll('.tick line').attr('stroke', '#27272a');
        gy.selectAll('.tick text')
            .attr('fill', '#71717a')
            .attr('font-size', '8.5px')
            .attr('font-family', 'monospace');

        // Interactive Crosshair & Live Hover Overlay
        const bisectDate = d3.bisector<XpDataPoint, Date>(d => d.date).left;

        const crosshairGroup = g.append('g')
            .attr('class', 'crosshair')
            .style('display', 'none');

        const verticalLine = crosshairGroup.append('line')
            .attr('y1', 0)
            .attr('y2', innerHeight)
            .attr('stroke', '#fbbf24')
            .attr('stroke-width', 1.5)
            .attr('stroke-dasharray', '3,3');

        const activeCircleHalo = crosshairGroup.append('circle')
            .attr('r', 10)
            .attr('fill', '#f59e0b')
            .attr('fill-opacity', 0.3)
            .attr('stroke', '#fbbf24')
            .attr('stroke-width', 1.5);

        const activeCircle = crosshairGroup.append('circle')
            .attr('r', 4.5)
            .attr('fill', '#ffffff')
            .attr('stroke', '#f59e0b')
            .attr('stroke-width', 2);

        // Full transparent overlay for smooth mouse interactions
        g.append('rect')
            .attr('class', 'overlay')
            .attr('width', innerWidth)
            .attr('height', innerHeight)
            .attr('fill', 'transparent')
            .attr('cursor', 'crosshair')
            .on('mouseenter', () => crosshairGroup.style('display', null))
            .on('mouseleave', () => {
                crosshairGroup.style('display', 'none');
                setHoveredPoint(null);
                setTooltipPos(null);
            })
            .on('mousemove', (event: MouseEvent) => {
                const [pointerX] = d3.pointer(event);
                const x0 = xScale.invert(pointerX);
                const idx = bisectDate(filteredPoints, x0, 1);
                const d0 = filteredPoints[idx - 1];
                const d1 = filteredPoints[idx];

                let closest = d0;
                if (d0 && d1) {
                    closest = x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime() ? d1 : d0;
                } else if (d1) {
                    closest = d1;
                }

                if (closest) {
                    const cx = xScale(closest.date);
                    const cy = yScale(closest.cumulativeXp);

                    verticalLine.attr('x1', cx).attr('x2', cx);
                    activeCircleHalo.attr('cx', cx).attr('cy', cy);
                    activeCircle.attr('cx', cx).attr('cy', cy);
                    
                    setHoveredPoint(closest);
                    
                    // Compute absolute pixel coordinates within container for floating tooltip
                    setTooltipPos({
                        x: cx + margin.left,
                        y: cy + margin.top
                    });
                }
            });

    }, [filteredPoints, containerWidth, allTiers]);

    return (
        <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-950/90 border border-zinc-800/80 shadow-md relative overflow-hidden backdrop-blur-md">
            
            {/* Compact Header: Title & Time Range Toggles */}
            <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-zinc-800/70">
                <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <h3 className="text-xs sm:text-sm font-black font-mono text-white uppercase tracking-wider truncate">
                        Season RP Growth & Trajectory
                    </h3>
                </div>

                {/* Range Filter Pills */}
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-zinc-900/90 border border-zinc-800 shrink-0">
                    {[
                        { id: 'all', label: 'All' },
                        { id: '30d', label: '30D' },
                        { id: 'recent5', label: 'Recent' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setTimeRange(tab.id as any)}
                            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all ${
                                timeRange === tab.id
                                    ? 'bg-amber-500 text-black shadow-sm'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Streamlined Metrics Micro-Strip */}
            <div className="grid grid-cols-3 gap-1.5 mb-1.5">
                <div className="px-2 py-1 rounded-md bg-zinc-900/40 border border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase text-zinc-400">Peak Gain</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">+{statsSummary.highestGain.toLocaleString()}</span>
                </div>

                <div className="px-2 py-1 rounded-md bg-zinc-900/40 border border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase text-zinc-400">Avg / Op</span>
                    <span className="text-xs font-mono font-bold text-zinc-200">~{statsSummary.avgGain.toLocaleString()}</span>
                </div>

                <div className="px-2 py-1 rounded-md bg-zinc-900/40 border border-zinc-800/60 flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase text-zinc-400">Recorded Ops</span>
                    <span className="text-xs font-mono font-bold text-amber-400">{statsSummary.totalRecordedEvents}</span>
                </div>
            </div>

            {/* D3 SVG Line Chart Canvas & Floating Hover Tooltip */}
            <div ref={containerRef} className="w-full relative min-h-[100px] sm:min-h-[115px] bg-zinc-950/80 rounded-lg border border-zinc-900/80 p-0.5 flex items-center justify-center">
                <svg ref={svgRef} className="w-full block overflow-visible" />

                {/* Floating Interactive Tooltip */}
                {hoveredPoint && tooltipPos && (
                    <div 
                        className="absolute pointer-events-none z-30 transition-all duration-75 ease-out -translate-y-full"
                        style={{
                            left: `${Math.min(Math.max(tooltipPos.x, 70), containerWidth - 70)}px`,
                            top: `${Math.max(tooltipPos.y - 6, 6)}px`,
                            transform: 'translate(-50%, -100%)'
                        }}
                    >
                        <div className="bg-zinc-900/95 border border-amber-500/50 shadow-lg rounded-lg p-1.5 px-2 min-w-[125px] max-w-[190px] text-xs font-mono backdrop-blur-md">
                            <div className="flex items-center justify-between gap-1.5 border-b border-zinc-800 pb-0.5 mb-0.5">
                                <span className="font-bold text-amber-400 uppercase truncate text-[9px]">
                                    {hoveredPoint.label}
                                </span>
                                <span className="text-[8px] text-zinc-400 whitespace-nowrap">
                                    {hoveredPoint.dateLabel}
                                </span>
                            </div>

                            <div className="flex items-center justify-between gap-2 text-[9px] mb-0.5">
                                <span className="text-zinc-400">Total:</span>
                                <span className="font-bold font-mono text-white">
                                    {hoveredPoint.cumulativeXp.toLocaleString()} RP
                                </span>
                            </div>

                            {hoveredPoint.xpDelta !== 0 && (
                                <div className="flex items-center justify-between gap-2 text-[8.5px]">
                                    <span className="text-zinc-400">Delta:</span>
                                    <span className={`font-bold font-mono ${hoveredPoint.xpDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {hoveredPoint.xpDelta >= 0 ? `+${hoveredPoint.xpDelta}` : hoveredPoint.xpDelta} RP
                                    </span>
                                </div>
                            )}

                            {hoveredPoint.rankName && (
                                <div className="flex items-center justify-between gap-2 text-[8px] text-zinc-400 pt-0.5 mt-0.5 border-t border-zinc-800/70">
                                    <span>Milestone:</span>
                                    <span className="text-amber-300 font-bold uppercase">{hoveredPoint.rankName}</span>
                                </div>
                            )}

                            {/* Pointer Arrow */}
                            <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-1.5 h-1.5 bg-zinc-900 border-r border-b border-amber-500/50 rotate-45" />
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};
