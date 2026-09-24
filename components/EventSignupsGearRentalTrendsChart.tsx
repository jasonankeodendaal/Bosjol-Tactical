import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { GameEvent, Signup } from '../types';
import { Clock, TrendingUp, Sparkles, Activity, Flag, ChevronRight } from 'lucide-react';

interface EventSignupsGearRentalTrendsChartProps {
    events: GameEvent[];
    signups: Signup[];
    onSelectEventId?: (eventId: string) => void;
}

interface TimespanLapNode {
    id: string;
    lapNumber: number;
    title: string;
    date: Date;
    dateLabel: string;
    timeLabel: string;
    dayLabel: string;
    signupsCount: number;
    rentalsCount: number;
    maxCapacity: number;
    status: 'Upcoming' | 'Active' | 'Completed';
}

export const EventSignupsGearRentalTrendsChart: React.FC<EventSignupsGearRentalTrendsChartProps> = ({
    events,
    signups = [],
    onSelectEventId,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(500);
    const [selectedLapId, setSelectedLapId] = useState<string | null>(null);
    const [hoveredLapId, setHoveredLapId] = useState<string | null>(null);

    // Prepare chronological Timespan Laps
    const lapNodes: TimespanLapNode[] = useMemo(() => {
        if (!events || events.length === 0) return [];

        const sorted = [...events]
            .filter(e => e.date)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const now = new Date();

        return sorted.map((event, index) => {
            const eventSignups = (signups || []).filter(s => s.eventId === event.id);
            const attendeePlayerIds = new Set<string>();
            eventSignups.forEach(s => { if (s.playerId) attendeePlayerIds.add(s.playerId); });
            (event.attendees || []).forEach(a => { if (a.playerId) attendeePlayerIds.add(a.playerId); });

            const totalSignups = attendeePlayerIds.size > 0 
                ? attendeePlayerIds.size 
                : Math.max(eventSignups.length, event.attendees?.length || 0);

            const totalRentals = (event.attendees || []).reduce((acc, a) => acc + (a.rentedGearIds || []).length, 0) +
                eventSignups.reduce((acc, s) => acc + (s.requestedGearIds || []).length, 0);

            const d = new Date(event.date);
            const validDate = isNaN(d.getTime()) ? new Date() : d;

            const timeStr = event.startTime || (event.date ? validDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00');
            const dateStr = validDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            const dayStr = validDate.toLocaleDateString(undefined, { weekday: 'short' });

            const isPast = validDate.getTime() + 6 * 3600 * 1000 < now.getTime();
            const isActive = Math.abs(validDate.getTime() - now.getTime()) < 6 * 3600 * 1000;

            return {
                id: event.id,
                lapNumber: index + 1,
                title: event.title || `Operation Lap #${index + 1}`,
                date: validDate,
                dateLabel: dateStr,
                timeLabel: timeStr,
                dayLabel: dayStr,
                signupsCount: totalSignups,
                rentalsCount: totalRentals,
                maxCapacity: event.maxPlayers || 30,
                status: isPast ? 'Completed' : isActive ? 'Active' : 'Upcoming',
            };
        });
    }, [events, signups]);

    // Summary metrics
    const metrics = useMemo(() => {
        if (lapNodes.length === 0) return { totalSignups: 0, totalRentals: 0, avgSignups: 0, rentalRate: 0 };
        const totalSignups = lapNodes.reduce((sum, d) => sum + d.signupsCount, 0);
        const totalRentals = lapNodes.reduce((sum, d) => sum + d.rentalsCount, 0);
        const avgSignups = Math.round(totalSignups / lapNodes.length);
        const rentalRate = totalSignups > 0 ? Math.round((totalRentals / totalSignups) * 100) : 0;
        return { totalSignups, totalRentals, avgSignups, rentalRate };
    }, [lapNodes]);

    const activeLap = useMemo(() => {
        const targetId = hoveredLapId || selectedLapId;
        if (targetId) {
            return lapNodes.find(n => n.id === targetId) || lapNodes[0] || null;
        }
        return null;
    }, [hoveredLapId, selectedLapId, lapNodes]);

    // Resize observer
    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.contentRect.width > 50) {
                    setContainerWidth(Math.floor(entry.contentRect.width));
                }
            }
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    // Draw D3 Timespan Laps Continuous Sparkline Wave
    useEffect(() => {
        if (!svgRef.current || lapNodes.length === 0) return;

        const width = containerWidth;
        const height = 22; // Ultra tiny timespan lap spark ribbon
        const margin = { top: 2, right: 6, bottom: 2, left: 6 };
        const innerWidth = Math.max(width - margin.left - margin.right, 30);
        const innerHeight = Math.max(height - margin.top - margin.bottom, 10);

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const maxVal = Math.max(
            d3.max(lapNodes, d => Math.max(d.signupsCount, d.rentalsCount)) || 4,
            4
        );

        const xScale = d3.scalePoint<string>()
            .domain(lapNodes.map(d => d.id))
            .range([0, innerWidth])
            .padding(0.08);

        const yScale = d3.scaleLinear()
            .domain([0, maxVal * 1.15])
            .range([innerHeight, 0]);

        // Gradient
        const defs = svg.append('defs');
        const lapGrad = defs.append('linearGradient')
            .attr('id', 'lap-wave-grad')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '0%').attr('y2', '100%');
        lapGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.25);
        lapGrad.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.0);

        // Sign-up Lap Velocity Line & Area
        const signupArea = d3.area<TimespanLapNode>()
            .x(d => xScale(d.id) || 0)
            .y0(innerHeight)
            .y1(d => yScale(d.signupsCount))
            .curve(d3.curveMonotoneX);

        const signupLine = d3.line<TimespanLapNode>()
            .x(d => xScale(d.id) || 0)
            .y(d => yScale(d.signupsCount))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(lapNodes)
            .attr('fill', 'url(#lap-wave-grad)')
            .attr('d', signupArea);

        g.append('path')
            .datum(lapNodes)
            .attr('fill', 'none')
            .attr('stroke', '#10b981')
            .attr('stroke-width', 1.4)
            .attr('d', signupLine);

        // Rental Lap Line (Amber dashed)
        const rentalLine = d3.line<TimespanLapNode>()
            .x(d => xScale(d.id) || 0)
            .y(d => yScale(d.rentalsCount))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(lapNodes)
            .attr('fill', 'none')
            .attr('stroke', '#f59e0b')
            .attr('stroke-width', 1.2)
            .attr('stroke-dasharray', '2.5,1.5')
            .attr('d', rentalLine);

        // Lap Split Nodes (Micro Checkpoints)
        lapNodes.forEach(d => {
            const cx = xScale(d.id) || 0;
            const cySignups = yScale(d.signupsCount);
            const isTarget = d.id === (hoveredLapId || selectedLapId);

            g.append('circle')
                .attr('cx', cx)
                .attr('cy', cySignups)
                .attr('r', isTarget ? 3 : 1.6)
                .attr('fill', isTarget ? '#ffffff' : '#10b981')
                .attr('stroke', '#064e3b')
                .attr('stroke-width', isTarget ? 1.5 : 0.8);
        });

    }, [containerWidth, lapNodes, hoveredLapId, selectedLapId]);

    if (lapNodes.length === 0) return null;

    return (
        <div 
            ref={containerRef} 
            className="w-full rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-black p-2.5 shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl font-mono text-xs space-y-2 shrink-0 overflow-hidden"
        >
            {/* 1. Timespan Laps Header Strip */}
            <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
                        <Flag className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-white uppercase tracking-wider text-[10px]">
                            TIMESPAN LAPS
                        </span>
                        <span className="text-[9px] text-zinc-400">
                            &bull; {lapNodes.length} Operation Laps
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[7.5px] font-bold bg-white/[0.08] text-zinc-300">
                            D3.JS
                        </span>
                    </div>
                </div>

                {/* Micro Lap Split Metrics */}
                <div className="flex items-center gap-2.5 text-[9px]">
                    <div className="flex items-center gap-1 text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span className="text-emerald-400 font-bold">{metrics.totalSignups}</span> Sign-ups
                    </div>
                    <div className="flex items-center gap-1 text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        <span className="text-amber-400 font-bold">{metrics.totalRentals}</span> Rentals
                    </div>
                    <div className="hidden sm:flex items-center gap-1 text-zinc-500 text-[8.5px]">
                        ({metrics.rentalRate}% Rental Rate)
                    </div>
                </div>
            </div>

            {/* 2. Timespan Lap Horizontal Checkpoint Rail (Compact Laps Format) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin scrollbar-thumb-zinc-800">
                {lapNodes.map((lap) => {
                    const isSelected = selectedLapId === lap.id;
                    const isHovered = hoveredLapId === lap.id;
                    const isHighlighted = isSelected || isHovered;

                    return (
                        <div
                            key={lap.id}
                            onMouseEnter={() => setHoveredLapId(lap.id)}
                            onMouseLeave={() => setHoveredLapId(null)}
                            onClick={() => {
                                setSelectedLapId(lap.id);
                                if (onSelectEventId) onSelectEventId(lap.id);
                            }}
                            className={`flex-shrink-0 min-w-[115px] sm:min-w-[125px] p-1.5 rounded-xl transition-all cursor-pointer select-none ${
                                isHighlighted
                                    ? 'bg-amber-950/40 shadow-[0_4px_12px_rgba(245,158,11,0.25),inset_0_1px_0_0_rgba(245,158,11,0.3)] scale-[1.02]'
                                    : 'bg-zinc-900/70 hover:bg-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_0_rgba(255,255,255,0.04)]'
                            }`}
                        >
                            {/* Lap Indicator & Split Time */}
                            <div className="flex items-center justify-between text-[8.5px] mb-0.5">
                                <span className="font-bold text-amber-400">
                                    LAP {String(lap.lapNumber).padStart(2, '0')}
                                </span>
                                <span className="text-[8px] px-1 rounded bg-zinc-950 text-zinc-400">
                                    {lap.dateLabel}
                                </span>
                            </div>

                            {/* Match Title */}
                            <p className="font-bold text-white text-[9.5px] truncate leading-tight mb-1" title={lap.title}>
                                {lap.title}
                            </p>

                            {/* Mini Dual Lap Gauge */}
                            <div className="space-y-0.5">
                                <div className="flex items-center justify-between text-[8px]">
                                    <span className="text-zinc-500">Ops:</span>
                                    <span className="text-emerald-400 font-bold">{lap.signupsCount}</span>
                                    <span className="text-zinc-500 ml-1">Gear:</span>
                                    <span className="text-amber-400 font-bold">{lap.rentalsCount}</span>
                                </div>
                                <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden flex gap-0.5">
                                    <div 
                                        className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                                        style={{ width: `${Math.min(100, (lap.signupsCount / Math.max(1, lap.maxCapacity)) * 100)}%` }}
                                    />
                                    <div 
                                        className="bg-amber-500 h-full transition-all duration-300 rounded-full"
                                        style={{ width: `${Math.min(100, (lap.rentalsCount / Math.max(1, lap.signupsCount || 1)) * 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 3. D3 Timespan Lap Spark Ribbon */}
            <div className="w-full relative pt-1 border-t border-white/5">
                <div className="flex items-center justify-between text-[8px] text-zinc-500 mb-0.5">
                    <span className="flex items-center gap-1">
                        <Activity className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Timespan Velocity Spark</span>
                    </span>
                    {activeLap && (
                        <span className="text-amber-300 font-bold truncate">
                            Focused: LAP {activeLap.lapNumber} &bull; {activeLap.title} ({activeLap.signupsCount} Ops, {activeLap.rentalsCount} Rentals)
                        </span>
                    )}
                </div>
                <div className="w-full h-[22px] relative overflow-hidden">
                    <svg
                        ref={svgRef}
                        width={containerWidth}
                        height={22}
                        className="overflow-visible block w-full"
                    />
                </div>
            </div>
        </div>
    );
};
