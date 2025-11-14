import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Transaction, Player, GameEvent, Location, CompanyDetails } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { CurrencyDollarIcon, PrinterIcon } from './icons/Icons';
import { motion } from 'framer-motion';
import { PrintableReport } from './PrintableReport';

type TimeFilter = 'day' | 'week' | 'month' | '90days' | 'all';

const StatCard: React.FC<{ title: string, value: string, colorClass: string }> = ({ title, value, colorClass }) => (
    <div className="bg-zinc-800/50 p-4 rounded-lg text-center border border-zinc-700/50">
        <p className="text-sm text-gray-400 uppercase tracking-wider">{title}</p>
        <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
    </div>
);

const BarChart: React.FC<{ data: { label: string, event: number, rental: number, retail: number }[] }> = ({ data }) => {
    const maxVal = Math.max(...data.map(d => d.event + d.rental + d.retail), 1);

    return (
        <div className="h-64 flex items-end justify-around space-x-1 px-2 border-b border-l border-zinc-700 pb-4 pl-4 relative">
            <span className="absolute left-0 top-0 -translate-x-full text-xs text-gray-500 pr-2">R {maxVal.toLocaleString()}</span>
            <span className="absolute left-0 bottom-0 -translate-x-full text-xs text-gray-500 pr-2">R 0</span>
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
                            transition={{duration: 0.5, ease: 'easeOut'}}
                            className="w-full flex flex-col justify-end rounded-t-sm"
                        >
                            <div style={{height: `${eventPercent}%`}} className="bg-green-500/80 group-hover:bg-green-400 w-full" />
                            <div style={{height: `${rentalPercent}%`}} className="bg-blue-500/80 group-hover:bg-blue-400 w-full" />
                            <div className="bg-amber-500/80 group-hover:bg-amber-400 w-full flex-grow" />
                        </motion.div>
                        <div className="absolute -bottom-5 text-xs text-gray-400">{d.label}</div>
                         <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-950 px-2 py-1 rounded text-xs text-white border border-zinc-700 whitespace-nowrap z-10">
                            <p className="text-green-400">Events: R {d.event.toFixed(2)}</p>
                            <p className="text-blue-400">Rentals: R {d.rental.toFixed(2)}</p>
                            <p className="text-amber-400">Retail: R {d.retail.toFixed(2)}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}


export const FinanceTab: React.FC<{ transactions: Transaction[], players: Player[], events: GameEvent[], locations: Location[], companyDetails: CompanyDetails }> = ({ transactions, players, events, locations, companyDetails }) => {
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
            }
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
                case 'day': key = date.toISOString().split(':')[0]; break; // Group by hour
                case 'week': case 'month': case '90days': key = date.toISOString().split('T')[0]; break; // Group by day
                case 'all': key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; break; // Group by month
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
        timeFilterLabel: document.querySelector(`select option[value="${timeFilter}"]`)?.textContent || timeFilter,
        playerFilterLabel: players.find(p => p.id === playerFilter)?.name || 'All Players',
        eventFilterLabel: events.find(e => e.id === eventFilter)?.title || 'All Events',
        locationFilterLabel: locations.find(l => l.id === locationFilter)?.name || 'All Locations',
    };

    return (
        <div className="space-y-6">
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
             <DashboardCard title="Financial Controls" icon={<CurrencyDollarIcon className="w-6 h-6" />}>
                 <div className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-grow">
                        <select value={timeFilter} onChange={e => setTimeFilter(e.target.value as TimeFilter)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option value="day">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="90days">Last 90 Days</option>
                            <option value="all">All Time</option>
                        </select>
                        <select value={playerFilter} onChange={e => setPlayerFilter(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option value="all">All Players</option>
                            {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <select value={eventFilter} onChange={e => setEventFilter(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option value="all">All Events</option>
                            {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                        </select>
                         <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500">
                            <option value="all">All Locations</option>
                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>
                    <Button onClick={handlePrint} variant="secondary" className="flex-shrink-0">
                        <PrinterIcon className="w-5 h-5 mr-2" />
                        Print Report
                    </Button>
                 </div>
             </DashboardCard>
             
             <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Total Revenue" value={`R ${metrics.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`} colorClass="text-green-400" />
                <StatCard title="Expenses" value={`R ${metrics.expenses.toLocaleString(undefined, {minimumFractionDigits: 2})}`} colorClass="text-red-400" />
                <StatCard title="Net Profit" value={`R ${metrics.netProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}`} colorClass={metrics.netProfit >= 0 ? 'text-white' : 'text-red-400'} />
                <StatCard title="Outstanding" value={`R ${metrics.outstanding.toLocaleString(undefined, {minimumFractionDigits: 2})}`} colorClass="text-amber-400" />
                <div className="col-span-2 lg:col-span-1 bg-zinc-800/50 p-4 rounded-lg border border-zinc-700/50 space-y-1">
                    <div className="flex justify-between items-center text-sm"><span className="text-gray-400">Event Fees:</span> <span className="font-semibold text-green-400">R {metrics['Event Revenue'].toFixed(2)}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-gray-400">Rentals:</span> <span className="font-semibold text-blue-400">R {metrics['Rental Revenue'].toFixed(2)}</span></div>
                    <div className="flex justify-between items-center text-sm"><span className="text-gray-400">Retail:</span> <span className="font-semibold text-amber-400">R {metrics['Retail Revenue'].toFixed(2)}</span></div>
                </div>
            </div>

             <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                    <DashboardCard title="Revenue Breakdown" icon={<CurrencyDollarIcon className="w-6 h-6" />}>
                        <div className="p-4">
                            <BarChart data={chartData} />
                        </div>
                    </DashboardCard>
                </div>
                <div className="xl:col-span-1">
                     <DashboardCard title="Transaction Ledger" icon={<CurrencyDollarIcon className="w-6 h-6" />}>
                        <div className="p-4">
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {[...filteredTransactions].reverse().map(t => {
                                    const player = players.find(p => p.id === t.relatedPlayerId);
                                    return (
                                        <div key={t.id} className="bg-zinc-800/50 p-3 rounded-md">
                                             <div className="flex justify-between items-center">
                                                <p className="font-semibold text-white truncate text-sm">{t.description}</p>
                                                <p className={`font-bold text-lg ${t.type === 'Expense' ? 'text-red-400' : 'text-green-400'}`}>
                                                    {t.type === 'Expense' ? '-' : ''} R{t.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                                </p>
                                             </div>
                                            <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                                                <span>{player?.name || 'N/A'}</span>
                                                <span>{new Date(t.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </DashboardCard>
                </div>
             </div>
        </div>
    );
};