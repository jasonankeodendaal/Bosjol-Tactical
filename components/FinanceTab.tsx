import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Transaction, Player, GameEvent, Location, CompanyDetails } from '../types';
import { Button } from './Button';
import { CurrencyDollarIcon, PrinterIcon, ArrowTrendingUpIcon, ShieldCheckIcon } from './icons/Icons';
import { motion } from 'framer-motion';
import { PrintableReport } from './PrintableReport';

type TimeFilter = 'day' | 'week' | 'month' | '90days' | 'all';

const StatCard: React.FC<{ title: string, value: string, colorClass: string, subtitle?: string }> = ({ title, value, colorClass, subtitle }) => (
    <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between">
        <p className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">{title}</p>
        <p className={`text-base sm:text-xl font-mono font-black mt-1 ${colorClass}`}>{value}</p>
        {subtitle && <p className="text-[9px] text-zinc-400 mt-0.5">{subtitle}</p>}
    </div>
);

const BarChart: React.FC<{ data: { label: string, event: number, rental: number, retail: number }[] }> = ({ data }) => {
    const maxVal = Math.max(...data.map(d => d.event + d.rental + d.retail), 1);

    if (data.length === 0) {
        return (
            <div className="h-44 flex items-center justify-center text-xs text-zinc-500 italic">
                No revenue entries recorded for this period
            </div>
        );
    }

    return (
        <div className="h-44 flex items-end justify-around space-x-1 px-1 border-b border-l border-zinc-800 pb-3 pl-3 relative">
            <span className="absolute left-0 top-0 -translate-x-full text-[9px] text-zinc-400 pr-1">R{maxVal >= 1000 ? `${(maxVal/1000).toFixed(0)}k` : maxVal.toFixed(0)}</span>
            <span className="absolute left-0 bottom-0 -translate-x-full text-[9px] text-zinc-400 pr-1">R0</span>
            {data.map((d, index) => {
                const total = d.event + d.rental + d.retail;
                const totalHeight = maxVal > 0 ? (total / maxVal) * 100 : 0;
                
                const eventPercent = total > 0 ? (d.event / total) * 100 : 0;
                const rentalPercent = total > 0 ? (d.rental / total) * 100 : 0;
                
                return (
                    <div key={index} className="flex-1 group relative flex flex-col items-center justify-end h-full">
                         <motion.div
                            initial={{height: 0}}
                            animate={{height: `${totalHeight}%`}}
                            transition={{duration: 0.4, ease: 'easeOut'}}
                            className="w-full flex flex-col justify-end rounded-t-sm"
                        >
                            <div style={{height: `${eventPercent}%`}} className="bg-emerald-500/80 group-hover:bg-emerald-400 w-full" />
                            <div style={{height: `${rentalPercent}%`}} className="bg-blue-500/80 group-hover:bg-blue-400 w-full" />
                            <div className="bg-amber-500/80 group-hover:bg-amber-400 w-full flex-grow" />
                        </motion.div>
                        <div className="absolute -bottom-4 text-[9px] text-zinc-500 truncate max-w-[40px] text-center">{d.label}</div>
                         <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 px-2 py-1 rounded text-[10px] text-white border border-zinc-700 whitespace-nowrap z-20 pointer-events-none shadow-lg">
                            <p className="text-emerald-400">Events: R{(d.event || 0).toFixed(0)}</p>
                            <p className="text-blue-400">Rentals: R{(d.rental || 0).toFixed(0)}</p>
                            <p className="text-amber-400">Retail: R{(d.retail || 0).toFixed(0)}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export const FinanceTab: React.FC<{ 
    transactions: Transaction[], 
    players: Player[], 
    events: GameEvent[], 
    locations: Location[], 
    companyDetails: CompanyDetails 
}> = ({ transactions, players, events, locations, companyDetails }) => {
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
    const [playerFilter, setPlayerFilter] = useState<string>('all');
    const [eventFilter, setEventFilter] = useState<string>('all');
    const [locationFilter, setLocationFilter] = useState<string>('all');
    const [isPrinting, setIsPrinting] = useState(false);
    
    const handlePrint = () => {
        setIsPrinting(true);
    };

    useEffect(() => {
        if (isPrinting) {
            const handleAfterPrint = () => {
                setIsPrinting(false);
                window.removeEventListener('afterprint', handleAfterPrint);
            };
            window.addEventListener('afterprint', handleAfterPrint);
            
            const timeoutId = setTimeout(() => {
                window.print();
            }, 100);

            return () => {
                clearTimeout(timeoutId);
                window.removeEventListener('afterprint', handleAfterPrint);
            };
        }
    }, [isPrinting]);

    const filteredTransactions = useMemo(() => {
        const now = new Date();
        let startDate: Date;

        switch (timeFilter) {
            case 'day': startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
            case 'week': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
            case 'month': startDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
            case '90days': startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
            case 'all': default: startDate = new Date(0); break;
        }

        let eventIdsInLocation: string[] | null = null;
        if (locationFilter !== 'all') {
            const location = locations.find(l => l.id === locationFilter);
            if(location) {
                 eventIdsInLocation = events.filter(e => e.location === location.name).map(e => e.id);
            }
        }
        
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            if (tDate < startDate) return false;
            if (playerFilter !== 'all' && t.relatedPlayerId !== playerFilter) return false;
            if (eventFilter !== 'all' && t.relatedEventId !== eventFilter) return false;
            if (eventIdsInLocation && t.relatedEventId && !eventIdsInLocation.includes(t.relatedEventId)) return false;
            return true;
        });
    }, [timeFilter, playerFilter, eventFilter, locationFilter, transactions, events, locations]);

    const metrics = useMemo(() => {
        const revenueByType = {
            'Event Revenue': 0,
            'Rental Revenue': 0,
            'Retail Revenue': 0,
        };
        let expenses = 0;
        let outstanding = 0;

        for (const t of filteredTransactions) {
            if (t.type === 'Expense') {
                expenses += t.amount;
            } else if (t.type in revenueByType) {
                revenueByType[t.type as keyof typeof revenueByType] += t.amount;
                 if (t.paymentStatus === 'Unpaid') {
                    outstanding += t.amount;
                }
            }
        }
        
        const totalRevenue = Object.values(revenueByType).reduce((sum, val) => sum + val, 0);

        return {
            ...revenueByType,
            totalRevenue,
            expenses,
            netProfit: totalRevenue - expenses,
            outstanding,
        };
    }, [filteredTransactions]);
    
    const chartData = useMemo(() => {
        const dataMap = new Map<string, { event: number, rental: number, retail: number }>();
        const formatLabel = (date: Date) => {
            switch(timeFilter) {
                case 'day': return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'});
                case 'week': case 'month': return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                case '90days': return `W${Math.ceil(new Date(date).getDate() / 7)}`;
                case 'all': return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
                default: return '';
            }
        };

        filteredTransactions.forEach(t => {
            if (t.type === 'Expense') return;

            const date = new Date(t.date);
            let key: string;
            switch(timeFilter) {
                case 'day': key = date.toISOString().split(':')[0]; break;
                case 'week': case 'month': case '90days': key = date.toISOString().split('T')[0]; break;
                case 'all': key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; break;
            }

            if (!dataMap.has(key)) dataMap.set(key, { event: 0, rental: 0, retail: 0 });
            
            const entry = dataMap.get(key)!;
            if (t.type === 'Event Revenue') entry.event += t.amount;
            else if (t.type === 'Rental Revenue') entry.rental += t.amount;
            else if (t.type === 'Retail Revenue') entry.retail += t.amount;
        });
        
        return Array.from(dataMap.entries())
            .sort(([keyA], [keyB]) => new Date(keyA).getTime() - new Date(keyB).getTime())
            .map(([key, value]) => ({
                label: formatLabel(new Date(key)),
                ...value,
            }));

    }, [filteredTransactions, timeFilter]);

    const reportFilters = {
        timeFilter, playerFilter, eventFilter, locationFilter,
        timeFilterLabel: timeFilter,
        playerFilterLabel: players.find(p => p.id === playerFilter)?.name || 'All Players',
        eventFilterLabel: events.find(e => e.id === eventFilter)?.title || 'All Events',
        locationFilterLabel: locations.find(l => l.id === locationFilter)?.name || 'All Locations',
    };

    return (
        <div className="w-full space-y-3 sm:space-y-4">
            {isPrinting && createPortal(
                <PrintableReport
                    transactions={filteredTransactions}
                    metrics={metrics}
                    filters={reportFilters}
                    companyDetails={companyDetails}
                    players={players}
                    events={events}
                />,
                document.getElementById('printable-report-container')!
            )}

            {/* Free View Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-red-500" />
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                            Financial Intelligence & Ledger
                        </h2>
                        <p className="text-[10px] sm:text-xs text-zinc-400">
                            Cash flow, rental margins, player dues & live reconciliation
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={handlePrint} variant="secondary" size="sm" className="!py-1 !px-2.5 text-xs">
                        <PrinterIcon className="w-4 h-4 mr-1" />
                        Print Report
                    </Button>
                </div>
            </div>

            {/* Compact Filter Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <select 
                    value={timeFilter} 
                    onChange={e => setTimeFilter(e.target.value as TimeFilter)} 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                    <option value="day">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="90days">Last 90 Days</option>
                    <option value="all">All Time</option>
                </select>

                <select 
                    value={playerFilter} 
                    onChange={e => setPlayerFilter(e.target.value)} 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                    <option value="all">All Players</option>
                    {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>

                <select 
                    value={eventFilter} 
                    onChange={e => setEventFilter(e.target.value)} 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                    <option value="all">All Events</option>
                    {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>

                <select 
                    value={locationFilter} 
                    onChange={e => setLocationFilter(e.target.value)} 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                >
                    <option value="all">All Fields</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
            </div>
             
            {/* Stat Cards - Side by Side Grid on Mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                <StatCard title="Total Gross" value={`R${metrics.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`} colorClass="text-emerald-400" />
                <StatCard title="Expenses" value={`R${metrics.expenses.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`} colorClass="text-red-400" />
                <StatCard title="Net Profit" value={`R${metrics.netProfit.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`} colorClass={metrics.netProfit >= 0 ? 'text-white' : 'text-red-400'} />
                <StatCard title="Unpaid Dues" value={`R${metrics.outstanding.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`} colorClass="text-amber-400" />
                <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-center space-y-1 text-[10px]">
                    <div className="flex justify-between items-center"><span className="text-zinc-400">Events:</span> <span className="font-bold text-emerald-400 font-mono">R{(metrics['Event Revenue'] || 0).toFixed(0)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-zinc-400">Rentals:</span> <span className="font-bold text-blue-400 font-mono">R{(metrics['Rental Revenue'] || 0).toFixed(0)}</span></div>
                    <div className="flex justify-between items-center"><span className="text-zinc-400">Retail:</span> <span className="font-bold text-amber-400 font-mono">R{(metrics['Retail Revenue'] || 0).toFixed(0)}</span></div>
                </div>
            </div>

            {/* Visualizer & Ledger Side-by-side on large screens, compact stacked on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-7 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                            <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-emerald-400"/> Revenue Stream Trend
                        </span>
                        <div className="flex gap-2 text-[9px]">
                            <span className="flex items-center gap-1 text-zinc-400"><span className="w-2 h-2 rounded bg-emerald-500"></span> Event</span>
                            <span className="flex items-center gap-1 text-zinc-400"><span className="w-2 h-2 rounded bg-blue-500"></span> Rental</span>
                            <span className="flex items-center gap-1 text-zinc-400"><span className="w-2 h-2 rounded bg-amber-500"></span> Retail</span>
                        </div>
                    </div>
                    <BarChart data={chartData} />
                </div>

                <div className="lg:col-span-5 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                            Transaction Feed ({filteredTransactions.length})
                        </span>
                    </div>
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                        {filteredTransactions.length === 0 ? (
                            <p className="text-xs text-zinc-500 text-center py-6">No transactions in selected period</p>
                        ) : (
                            [...filteredTransactions].reverse().map(t => {
                                const player = players.find(p => p.id === t.relatedPlayerId);
                                return (
                                    <div key={t.id} className="p-2 rounded-lg bg-zinc-900/70 border border-zinc-800 flex justify-between items-center text-xs">
                                        <div className="min-w-0 pr-2">
                                            <p className="font-semibold text-white truncate text-[11px]">{t.description}</p>
                                            <p className="text-[9px] text-zinc-400 truncate">
                                                {player?.name || 'Armory/Direct'} &bull; {new Date(t.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className={`font-mono font-bold text-xs whitespace-nowrap ${t.type === 'Expense' ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {t.type === 'Expense' ? '-' : '+'}R{t.amount.toFixed(0)}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
