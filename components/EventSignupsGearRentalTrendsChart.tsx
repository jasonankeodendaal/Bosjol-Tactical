import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { GameEvent, Signup } from '../types';
import { TrendingUp } from 'lucide-react';

interface EventSignupsGearRentalTrendsChartProps {
    events: GameEvent[];
    signups: Signup[];
}

interface EventTrendPoint {
    id: string;
    title: string;
    date: Date;
    dateLabel: string;
    signupsCount: number;
    rentalsCount: number;
}

export const EventSignupsGearRentalTrendsChart: React.FC<EventSignupsGearRentalTrendsChartProps> = ({
    events,
    signups = [],
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(360);
    const [hoveredPoint, setHoveredPoint] = useState<EventTrendPoint | null>(null);

    // Prepare chronological trend data points
    const trendData: EventTrendPoint[] = useMemo(() => {
        if (!events || events.length === 0) return [];

        const sorted = [...events]
            .filter(e => e.date)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return sorted.map(event => {
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

            return {
                id: event.id,
                title: event.title || 'Event',
                date: isNaN(d.getTime()) ? new Date() : d,
                dateLabel: isNaN(d.getTime()) ? 'TBD' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                signupsCount: totalSignups,
                rentalsCount: totalRentals,
            };
        });
    }, [events, signups]);

    // Summary metrics
    const metrics = useMemo(() => {
        if (trendData.length === 0) return { totalSignups: 0, totalRentals: 0, avgSignups: 0, rentalRate: 0 };
        const totalSignups = trendData.reduce((sum, d) => sum + d.signupsCount, 0);
        const totalRentals = trendData.reduce((sum, d) => sum + d.rentalsCount, 0);
        const avgSignups = Math.round(totalSignups / trendData.length);
        const rentalRate = totalSignups > 0 ? Math.round((totalRentals / totalSignups) * 100) : 0;
        return { totalSignups, totalRentals, avgSignups, rentalRate };
    }, [trendData]);

    // Handle container resize
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

    // Draw D3 tiny & simple trend lines
    useEffect(() => {
        if (!svgRef.current || trendData.length === 0) return;

        const width = containerWidth;
        const height = 30; // Tiny & simple sparkline height
        const margin = { top: 3, right: 8, bottom: 11, left: 8 };
        const innerWidth = Math.max(width - margin.left - margin.right, 30);
        const innerHeight = Math.max(height - margin.top - margin.bottom, 12);

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const maxVal = Math.max(
            d3.max(trendData, d => Math.max(d.signupsCount, d.rentalsCount)) || 4,
            4
        );

        const xScale = d3.scalePoint<string>()
            .domain(trendData.map(d => d.id))
            .range([0, innerWidth])
            .padding(0.15);

        const yScale = d3.scaleLinear()
            .domain([0, maxVal * 1.1])
            .range([innerHeight, 0]);

        // Gradients
        const defs = svg.append('defs');

        const signupGradient = defs.append('linearGradient')
            .attr('id', 'tiny-signup-gradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '0%').attr('y2', '100%');
        signupGradient.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.22);
        signupGradient.append('stop').attr('offset', '100%').attr('stop-color', '#10b981').attr('stop-opacity', 0.0);

        // Sign-up Area and Line
        const signupArea = d3.area<EventTrendPoint>()
            .x(d => xScale(d.id) || 0)
            .y0(innerHeight)
            .y1(d => yScale(d.signupsCount))
            .curve(d3.curveMonotoneX);

        const signupLine = d3.line<EventTrendPoint>()
            .x(d => xScale(d.id) || 0)
            .y(d => yScale(d.signupsCount))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(trendData)
            .attr('fill', 'url(#tiny-signup-gradient)')
            .attr('d', signupArea);

        g.append('path')
            .datum(trendData)
            .attr('fill', 'none')
            .attr('stroke', '#10b981')
            .attr('stroke-width', 1.5)
            .attr('d', signupLine);

        // Rental Line
        const rentalLine = d3.line<EventTrendPoint>()
            .x(d => xScale(d.id) || 0)
            .y(d => yScale(d.rentalsCount))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(trendData)
            .attr('fill', 'none')
            .attr('stroke', '#f59e0b')
            .attr('stroke-width', 1.2)
            .attr('stroke-dasharray', '2.5,1.5')
            .attr('d', rentalLine);

        // Micro Dots & Date labels
        trendData.forEach(d => {
            const cx = xScale(d.id) || 0;
            const cySignups = yScale(d.signupsCount);
            const cyRentals = yScale(d.rentalsCount);

            // Sign-up micro dot
            g.append('circle')
                .attr('cx', cx)
                .attr('cy', cySignups)
                .attr('r', 1.8)
                .attr('fill', '#10b981');

            // Rental micro dot
            g.append('circle')
                .attr('cx', cx)
                .attr('cy', cyRentals)
                .attr('r', 1.5)
                .attr('fill', '#f59e0b');

            // Micro axis label
            g.append('text')
                .attr('x', cx)
                .attr('y', innerHeight + 9)
                .attr('text-anchor', 'middle')
                .attr('fill', 'rgba(255,255,255,0.35)')
                .attr('font-size', '7px')
                .attr('font-family', 'monospace')
                .text(d.dateLabel);
        });

        // Hover Overlay
        const overlay = g.append('rect')
            .attr('width', innerWidth)
            .attr('height', innerHeight + 11)
            .attr('fill', 'transparent')
            .style('cursor', 'crosshair');

        overlay.on('mousemove', (event) => {
            const [mouseX] = d3.pointer(event);
            let closest = trendData[0];
            let minDiff = Infinity;
            trendData.forEach(d => {
                const px = xScale(d.id) || 0;
                const diff = Math.abs(px - mouseX);
                if (diff < minDiff) {
                    minDiff = diff;
                    closest = d;
                }
            });
            setHoveredPoint(closest);
        });

        overlay.on('mouseleave', () => {
            setHoveredPoint(null);
        });

    }, [containerWidth, trendData]);

    if (trendData.length === 0) return null;

    return (
        <div ref={containerRef} className="w-full rounded-xl bg-zinc-950/70 px-2 py-1 shadow-[0_4px_14px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-md font-mono text-[9px] shrink-0">
            {/* Ultra-Tiny Header & Live Legend */}
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
                <div className="flex items-center gap-1">
                    <TrendingUp className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                    <span className="font-bold text-zinc-300 uppercase tracking-wider text-[8.5px] truncate">
                        EVENT SIGN-UP & GEAR RENTAL TRENDS
                    </span>
                    <span className="px-1 py-0 rounded text-[7px] font-bold bg-white/[0.06] text-zinc-400">
                        D3.JS
                    </span>
                </div>

                {/* Micro Legend / Hover tooltip */}
                <div className="flex items-center gap-2 text-[8px]">
                    {hoveredPoint ? (
                        <div className="flex items-center gap-1.5 text-white bg-zinc-900/90 px-1.5 py-0.5 rounded shadow-sm">
                            <span className="font-bold text-amber-300 truncate max-w-[100px]">{hoveredPoint.title}:</span>
                            <span className="text-emerald-400 font-bold">{hoveredPoint.signupsCount} S</span>
                            <span className="text-zinc-600">&bull;</span>
                            <span className="text-amber-400 font-bold">{hoveredPoint.rentalsCount} R</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-zinc-400">
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                <span className="text-emerald-400 font-semibold">Sign-ups</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                <span className="text-amber-400 font-semibold">Rentals</span>
                            </span>
                            <span className="hidden md:inline text-zinc-500 text-[7.5px]">
                                (Avg: {metrics.avgSignups}/op &bull; {metrics.rentalRate}%)
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tiny D3 SVG Canvas */}
            <div className="w-full h-[30px] relative overflow-hidden mt-0.5">
                <svg
                    ref={svgRef}
                    width={containerWidth}
                    height={30}
                    className="overflow-visible block w-full"
                />
            </div>
        </div>
    );
};
