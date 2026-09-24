import React, { useRef, useEffect, useMemo } from 'react';
import * as d3 from 'd3';
import type { GameEvent, Signup, InventoryItem } from '../types';
import { ChartBarIcon } from './icons/Icons';

interface AdminEventTrendsD3ChartProps {
    events: GameEvent[];
    signups: Signup[];
    inventory: InventoryItem[];
}

export const AdminEventTrendsD3Chart: React.FC<AdminEventTrendsD3ChartProps> = ({ events, signups, inventory }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Process event trends and rental popularity over time (sorted chronologically)
    const chartData = useMemo(() => {
        const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        return sortedEvents.map(ev => {
            const evSignups = signups.filter(s => s.eventId === ev.id);
            const attendeeCount = ev.attendees?.length || evSignups.length || 0;
            const rentalCount = (ev.attendees || []).reduce((acc, a) => acc + (a.rentedGearIds || []).length, 0) +
                evSignups.reduce((acc, s) => acc + (s.requestedGearIds || []).length, 0);

            return {
                date: new Date(ev.date || Date.now()),
                title: ev.title || 'Event',
                signups: attendeeCount,
                rentals: rentalCount
            };
        }).filter(d => !isNaN(d.date.getTime()));
    }, [events, signups]);

    useEffect(() => {
        if (!svgRef.current || chartData.length === 0) return;

        const container = containerRef.current;
        const width = container ? container.clientWidth : 650;
        const height = 280;
        const margin = { top: 20, right: 30, bottom: 40, left: 45 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Clear previous SVG contents
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const xExtent = d3.extent(chartData, d => d.date) as [Date, Date];
        const xScale = d3.scaleTime()
            .domain(xExtent[0] && xExtent[1] ? xExtent : [new Date(Date.now() - 30*86400000), new Date()])
            .range([0, innerWidth]);

        const maxVal = d3.max(chartData, d => Math.max(d.signups, d.rentals)) || 10;
        const yScale = d3.scaleLinear()
            .domain([0, maxVal * 1.15])
            .range([innerHeight, 0]);

        // Grid lines
        svg.append('g')
            .attr('class', 'grid-lines')
            .selectAll('line')
            .data(yScale.ticks(5))
            .enter()
            .append('line')
            .attr('x1', 0)
            .attr('x2', innerWidth)
            .attr('y1', d => yScale(d))
            .attr('y2', d => yScale(d))
            .attr('stroke', 'rgba(255, 255, 255, 0.05)')
            .attr('stroke-dasharray', '3,3');

        // Axes
        const xAxis = d3.axisBottom(xScale).ticks(Math.min(chartData.length, 6)).tickFormat(d => d3.timeFormat('%b %d')(d as Date));
        const yAxis = d3.axisLeft(yScale).ticks(5);

        svg.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(xAxis)
            .attr('color', 'rgba(156, 163, 175, 0.6)')
            .selectAll('text')
            .style('font-size', '10px')
            .style('font-family', 'monospace');

        svg.append('g')
            .call(yAxis)
            .attr('color', 'rgba(156, 163, 175, 0.6)')
            .selectAll('text')
            .style('font-size', '10px')
            .style('font-family', 'monospace');

        // Line generators
        const signupLine = d3.line<typeof chartData[0]>()
            .x(d => xScale(d.date))
            .y(d => yScale(d.signups))
            .curve(d3.curveMonotoneX);

        const rentalLine = d3.line<typeof chartData[0]>()
            .x(d => xScale(d.date))
            .y(d => yScale(d.rentals))
            .curve(d3.curveMonotoneX);

        // Area under signup line
        const signupArea = d3.area<typeof chartData[0]>()
            .x(d => xScale(d.date))
            .y0(innerHeight)
            .y1(d => yScale(d.signups))
            .curve(d3.curveMonotoneX);

        // Gradient for signups area
        const defs = svg.append('defs');
        const signupGradient = defs.append('linearGradient')
            .attr('id', 'signupGradient')
            .attr('x1', '0%')
            .attr('y1', '0%')
            .attr('x2', '0%')
            .attr('y2', '100%');
        signupGradient.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(239, 68, 68, 0.35)');
        signupGradient.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(239, 68, 68, 0)');

        svg.append('path')
            .datum(chartData)
            .attr('fill', 'url(#signupGradient)')
            .attr('d', signupArea);

        // Signups Line Path
        svg.append('path')
            .datum(chartData)
            .attr('fill', 'none')
            .attr('stroke', '#ef4444')
            .attr('stroke-width', 2.5)
            .attr('d', signupLine);

        // Rentals Line Path
        svg.append('path')
            .datum(chartData)
            .attr('fill', 'none')
            .attr('stroke', '#3b82f6')
            .attr('stroke-width', 2.5)
            .attr('stroke-dasharray', '4,4')
            .attr('d', rentalLine);

        // Data points (Signups)
        svg.selectAll('.dot-signup')
            .data(chartData)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d.date))
            .attr('cy', d => yScale(d.signups))
            .attr('r', 4)
            .attr('fill', '#ef4444')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1.5);

        // Data points (Rentals)
        svg.selectAll('.dot-rental')
            .data(chartData)
            .enter()
            .append('circle')
            .attr('cx', d => xScale(d.date))
            .attr('cy', d => yScale(d.rentals))
            .attr('r', 4)
            .attr('fill', '#3b82f6')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1.5);

    }, [chartData]);

    return (
        <div ref={containerRef} className="w-full bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-3 sm:p-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-red-950/50 text-red-400 border border-red-900/50">
                        <ChartBarIcon className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                            Event Sign-Up & Gear Rental Trends (D3.js)
                        </h4>
                        <p className="text-[10px] text-zinc-400">
                            Chronological analysis of player event attendance vs gear rental popularity
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-mono">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                        <span className="text-zinc-300 font-bold">Sign-Ups</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                        <span className="text-zinc-300 font-bold">Rentals</span>
                    </div>
                </div>
            </div>

            {chartData.length === 0 ? (
                <div className="h-[280px] flex items-center justify-center text-xs text-zinc-500 font-mono">
                    No event data available for D3 trend visualization.
                </div>
            ) : (
                <div className="w-full overflow-x-auto">
                    <svg ref={svgRef} className="w-full h-[280px] overflow-visible" />
                </div>
            )}
        </div>
    );
};
