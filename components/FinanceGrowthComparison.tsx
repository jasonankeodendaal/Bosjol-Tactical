import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';
import { 
    TrendingUp, 
    TrendingDown, 
    Calendar, 
    ArrowRight, 
    BarChart3, 
    Layers, 
    Scale, 
    Coins, 
    Receipt, 
    Sparkles,
    ChevronDown,
    Percent
} from 'lucide-react';
import { ArrowTrendingUpIcon } from './icons/Icons';

interface FinanceGrowthComparisonProps {
    transactions: Transaction[];
}

type ComparisonMode = 'days' | 'months' | 'years';
type ChartMetric = 'revenue' | 'expenses' | 'net' | 'profits';

export const FinanceGrowthComparison: React.FC<FinanceGrowthComparisonProps> = ({ transactions }) => {
    const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('months');
    const [chartMetric, setChartMetric] = useState<ChartMetric>('net');

    // Extract available years, months, and days from transactions
    const availableDates = useMemo(() => {
        const yearsSet = new Set<number>();
        const monthsSet = new Set<string>(); // 'YYYY-MM'
        const daysSet = new Set<string>(); // 'YYYY-MM-DD'

        transactions.forEach(t => {
            if (!t.date) return;
            const d = new Date(t.date);
            if (isNaN(d.getTime())) return;
            yearsSet.add(d.getFullYear());
            monthsSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
            daysSet.add(d.toISOString().slice(0, 10));
        });

        const currentYear = new Date().getFullYear();
        yearsSet.add(currentYear);
        yearsSet.add(currentYear - 1);

        const currentMonth = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
        const prevMonthDate = new Date();
        prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
        const prevMonth = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
        monthsSet.add(currentMonth);
        monthsSet.add(prevMonth);

        const todayStr = new Date().toISOString().slice(0, 10);
        const yestDate = new Date();
        yestDate.setDate(yestDate.getDate() - 1);
        const yestStr = yestDate.toISOString().slice(0, 10);
        daysSet.add(todayStr);
        daysSet.add(yestStr);

        return {
            years: Array.from(yearsSet).sort((a, b) => b - a),
            months: Array.from(monthsSet).sort().reverse(),
            days: Array.from(daysSet).sort().reverse(),
        };
    }, [transactions]);

    // Period selectors state
    const [dayA, setDayA] = useState<string>(() => availableDates.days[0] || new Date().toISOString().slice(0, 10));
    const [dayB, setDayB] = useState<string>(() => availableDates.days[1] || availableDates.days[0] || new Date().toISOString().slice(0, 10));

    const [monthA, setMonthA] = useState<string>(() => availableDates.months[0] || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
    const [monthB, setMonthB] = useState<string>(() => availableDates.months[1] || availableDates.months[0]);

    const [yearA, setYearA] = useState<number>(() => availableDates.years[0] || new Date().getFullYear());
    const [yearB, setYearB] = useState<number>(() => availableDates.years[1] || (availableDates.years[0] ? availableDates.years[0] - 1 : new Date().getFullYear() - 1));

    // Calculate metrics for a specific filter predicate
    const computePeriodMetrics = (filterFn: (d: Date) => boolean) => {
        let revenue = 0;
        let expenses = 0;
        let profitsMade = 0;
        let count = 0;
        let expenseCount = 0;
        let slipCount = 0;

        transactions.forEach(t => {
            if (!t.date) return;
            const d = new Date(t.date);
            if (isNaN(d.getTime())) return;

            if (filterFn(d)) {
                count++;
                if (t.type === 'Expense') {
                    expenses += Number(t.amount || 0);
                    expenseCount++;
                    if (t.receiptImageUrl && t.receiptImageUrl.trim() !== '') {
                        slipCount++;
                    }
                    if (t.profitMade && Number(t.profitMade) > 0) {
                        profitsMade += Number(t.profitMade);
                    }
                } else {
                    revenue += Number(t.amount || 0);
                }
            }
        });

        const netProfit = revenue - expenses;
        const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

        return {
            revenue,
            expenses,
            netProfit,
            profitsMade,
            profitMargin,
            count,
            expenseCount,
            slipCount
        };
    };

    // Calculate metrics for Period A and Period B based on mode
    const { periodAData, periodBData, labelA, labelB } = useMemo(() => {
        if (comparisonMode === 'days') {
            const dataA = computePeriodMetrics(d => d.toISOString().slice(0, 10) === dayA);
            const dataB = computePeriodMetrics(d => d.toISOString().slice(0, 10) === dayB);
            return {
                periodAData: dataA,
                periodBData: dataB,
                labelA: `Day: ${dayA}`,
                labelB: `Day: ${dayB}`
            };
        } else if (comparisonMode === 'years') {
            const dataA = computePeriodMetrics(d => d.getFullYear() === Number(yearA));
            const dataB = computePeriodMetrics(d => d.getFullYear() === Number(yearB));
            return {
                periodAData: dataA,
                periodBData: dataB,
                labelA: `Year ${yearA}`,
                labelB: `Year ${yearB}`
            };
        } else {
            // Months
            const dataA = computePeriodMetrics(d => {
                const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                return ym === monthA;
            });
            const dataB = computePeriodMetrics(d => {
                const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                return ym === monthB;
            });
            const formatMonth = (ym: string) => {
                const [y, m] = ym.split('-');
                const dt = new Date(Number(y), Number(m) - 1, 1);
                return dt.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
            };
            return {
                periodAData: dataA,
                periodBData: dataB,
                labelA: formatMonth(monthA),
                labelB: formatMonth(monthB)
            };
        }
    }, [comparisonMode, dayA, dayB, monthA, monthB, yearA, yearB, transactions]);

    // Calculate growth delta percentages
    const calcGrowth = (current: number, base: number) => {
        if (base === 0) {
            return current > 0 ? 100 : (current < 0 ? -100 : 0);
        }
        return ((current - base) / Math.abs(base)) * 100;
    };

    const revGrowth = calcGrowth(periodAData.revenue, periodBData.revenue);
    const expGrowth = calcGrowth(periodAData.expenses, periodBData.expenses);
    const netGrowth = calcGrowth(periodAData.netProfit, periodBData.netProfit);
    const prfGrowth = calcGrowth(periodAData.profitsMade, periodBData.profitsMade);

    // Timeline Growth Chart Series Data
    const growthChartSeries = useMemo(() => {
        if (comparisonMode === 'years') {
            // Compare by all years
            return availableDates.years.slice(0, 5).reverse().map(yr => {
                const m = computePeriodMetrics(d => d.getFullYear() === yr);
                return {
                    label: String(yr),
                    revenue: m.revenue,
                    expenses: m.expenses,
                    net: m.netProfit,
                    profits: m.profitsMade,
                };
            });
        } else if (comparisonMode === 'days') {
            // Last 7 days or selected days
            return availableDates.days.slice(0, 7).reverse().map(dy => {
                const m = computePeriodMetrics(d => d.toISOString().slice(0, 10) === dy);
                const dt = new Date(dy);
                return {
                    label: dt.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
                    revenue: m.revenue,
                    expenses: m.expenses,
                    net: m.netProfit,
                    profits: m.profitsMade,
                };
            });
        } else {
            // Months
            return availableDates.months.slice(0, 6).reverse().map(ym => {
                const m = computePeriodMetrics(d => {
                    const str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                    return str === ym;
                });
                const [y, mo] = ym.split('-');
                const dt = new Date(Number(y), Number(mo) - 1, 1);
                return {
                    label: dt.toLocaleDateString(undefined, { month: 'short' }),
                    revenue: m.revenue,
                    expenses: m.expenses,
                    net: m.netProfit,
                    profits: m.profitsMade,
                };
            });
        }
    }, [comparisonMode, availableDates, transactions]);

    const maxChartVal = useMemo(() => {
        const vals = growthChartSeries.map(s => {
            if (chartMetric === 'revenue') return s.revenue;
            if (chartMetric === 'expenses') return s.expenses;
            if (chartMetric === 'net') return Math.abs(s.net);
            return s.profits;
        });
        return Math.max(...vals, 100);
    }, [growthChartSeries, chartMetric]);

    return (
        <div className="bg-gradient-to-b from-zinc-900/90 via-zinc-950 to-black rounded-none border border-zinc-800/80 p-3.5 sm:p-4.5 space-y-4 shadow-[0_12px_32px_rgba(0,0,0,0.8)]">
            {/* Header & Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/70">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-none bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                        <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                            Financial Growth & Multi-Period Comparison Engine
                        </h3>
                        <p className="text-[10px] text-zinc-400">
                            Compare financial velocity, margins, and bottom-line growth across days, months & years
                        </p>
                    </div>
                </div>

                {/* Mode Selector */}
                <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-none border border-zinc-800">
                    <button
                        onClick={() => setComparisonMode('days')}
                        className={`px-2.5 py-1 text-[11px] font-bold transition-all ${
                            comparisonMode === 'days'
                                ? 'bg-zinc-800 text-white shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        Days
                    </button>
                    <button
                        onClick={() => setComparisonMode('months')}
                        className={`px-2.5 py-1 text-[11px] font-bold transition-all ${
                            comparisonMode === 'months'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        Months
                    </button>
                    <button
                        onClick={() => setComparisonMode('years')}
                        className={`px-2.5 py-1 text-[11px] font-bold transition-all ${
                            comparisonMode === 'years'
                                ? 'bg-zinc-800 text-white shadow-sm'
                                : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        Years
                    </button>
                </div>
            </div>

            {/* Selectors for Period A (Active/Focus) vs Period B (Baseline) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-zinc-950/80 border border-zinc-800/60">
                {/* Period A Selector */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            Period A (Current / Focus)
                        </span>
                        <span className="text-[9px] text-zinc-400 font-mono">Active Focus</span>
                    </div>

                    {comparisonMode === 'days' && (
                        <select
                            value={dayA}
                            onChange={e => setDayA(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700/80 text-white text-xs px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                        >
                            {availableDates.days.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    )}

                    {comparisonMode === 'months' && (
                        <select
                            value={monthA}
                            onChange={e => setMonthA(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700/80 text-white text-xs px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                        >
                            {availableDates.months.map(m => {
                                const [y, mo] = m.split('-');
                                const dt = new Date(Number(y), Number(mo) - 1, 1);
                                return (
                                    <option key={m} value={m}>
                                        {dt.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} ({m})
                                    </option>
                                );
                            })}
                        </select>
                    )}

                    {comparisonMode === 'years' && (
                        <select
                            value={yearA}
                            onChange={e => setYearA(Number(e.target.value))}
                            className="w-full bg-zinc-900 border border-zinc-700/80 text-white text-xs px-2.5 py-1.5 focus:outline-none focus:border-emerald-500"
                        >
                            {availableDates.years.map(y => (
                                <option key={y} value={y}>Fiscal Year {y}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Period B Selector */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-cyan-400" />
                            Period B (Benchmark / Previous)
                        </span>
                        <span className="text-[9px] text-zinc-400 font-mono">Historical Baseline</span>
                    </div>

                    {comparisonMode === 'days' && (
                        <select
                            value={dayB}
                            onChange={e => setDayB(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700/80 text-white text-xs px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
                        >
                            {availableDates.days.map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    )}

                    {comparisonMode === 'months' && (
                        <select
                            value={monthB}
                            onChange={e => setMonthB(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700/80 text-white text-xs px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
                        >
                            {availableDates.months.map(m => {
                                const [y, mo] = m.split('-');
                                const dt = new Date(Number(y), Number(mo) - 1, 1);
                                return (
                                    <option key={m} value={m}>
                                        {dt.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} ({m})
                                    </option>
                                );
                            })}
                        </select>
                    )}

                    {comparisonMode === 'years' && (
                        <select
                            value={yearB}
                            onChange={e => setYearB(Number(e.target.value))}
                            className="w-full bg-zinc-900 border border-zinc-700/80 text-white text-xs px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
                        >
                            {availableDates.years.map(y => (
                                <option key={y} value={y}>Fiscal Year {y}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* SIDE-BY-SIDE 3D COMPARISON BUSINESS CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* 1. REVENUE COMPARISON CARD */}
                <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 p-3 border border-zinc-800 shadow-md space-y-2 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80">
                            <span className="text-[10px] uppercase font-bold text-zinc-400">Gross Revenue</span>
                            <span className={`px-1.5 py-0.2 text-[9px] font-black font-mono flex items-center gap-0.5 ${
                                revGrowth >= 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                            }`}>
                                {revGrowth >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                                {revGrowth >= 0 ? `+${revGrowth.toFixed(1)}%` : `${revGrowth.toFixed(1)}%`}
                            </span>
                        </div>
                        <div className="mt-2 space-y-1">
                            <div className="flex items-baseline justify-between">
                                <span className="text-[10px] text-zinc-400 font-mono">{labelA}:</span>
                                <span className="font-mono font-black text-sm text-emerald-400">R{periodAData.revenue.toLocaleString(undefined, {minimumFractionDigits: 0})}</span>
                            </div>
                            <div className="flex items-baseline justify-between text-zinc-400">
                                <span className="text-[10px] font-mono">{labelB}:</span>
                                <span className="font-mono font-bold text-xs text-zinc-300">R{periodBData.revenue.toLocaleString(undefined, {minimumFractionDigits: 0})}</span>
                            </div>
                        </div>
                    </div>
                    <div className="pt-1.5 border-t border-zinc-800/60 text-[9px] text-zinc-400 flex items-center justify-between">
                        <span>Net Delta:</span>
                        <span className={`font-mono font-bold ${periodAData.revenue - periodBData.revenue >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {periodAData.revenue - periodBData.revenue >= 0 ? '+' : ''}R{(periodAData.revenue - periodBData.revenue).toLocaleString(undefined, {minimumFractionDigits: 0})}
                        </span>
                    </div>
                </div>

                {/* 2. EXPENSES COMPARISON CARD */}
                <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 p-3 border border-zinc-800 shadow-md space-y-2 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80">
                            <span className="text-[10px] uppercase font-bold text-zinc-400">Business Expenses</span>
                            <span className={`px-1.5 py-0.2 text-[9px] font-black font-mono flex items-center gap-0.5 ${
                                expGrowth <= 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                            }`}>
                                {expGrowth <= 0 ? <TrendingDown className="w-2.5 h-2.5" /> : <TrendingUp className="w-2.5 h-2.5" />}
                                {expGrowth >= 0 ? `+${expGrowth.toFixed(1)}%` : `${expGrowth.toFixed(1)}%`}
                            </span>
                        </div>
                        <div className="mt-2 space-y-1">
                            <div className="flex items-baseline justify-between">
                                <span className="text-[10px] text-zinc-400 font-mono">{labelA}:</span>
                                <span className="font-mono font-black text-sm text-red-400">R{periodAData.expenses.toLocaleString(undefined, {minimumFractionDigits: 0})}</span>
                            </div>
                            <div className="flex items-baseline justify-between text-zinc-400">
                                <span className="text-[10px] font-mono">{labelB}:</span>
                                <span className="font-mono font-bold text-xs text-zinc-300">R{periodBData.expenses.toLocaleString(undefined, {minimumFractionDigits: 0})}</span>
                            </div>
                        </div>
                    </div>
                    <div className="pt-1.5 border-t border-zinc-800/60 text-[9px] text-zinc-400 flex items-center justify-between">
                        <span>Slips Recorded:</span>
                        <span className="font-mono text-zinc-300">{periodAData.slipCount} slips vs {periodBData.slipCount}</span>
                    </div>
                </div>

                {/* 3. NET PROFIT BOTTOM LINE CARD */}
                <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 p-3 border border-zinc-800 shadow-md space-y-2 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80">
                            <span className="text-[10px] uppercase font-bold text-zinc-400">Net Profit (Bottom Line)</span>
                            <span className={`px-1.5 py-0.2 text-[9px] font-black font-mono flex items-center gap-0.5 ${
                                netGrowth >= 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                            }`}>
                                {netGrowth >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                                {netGrowth >= 0 ? `+${netGrowth.toFixed(1)}%` : `${netGrowth.toFixed(1)}%`}
                            </span>
                        </div>
                        <div className="mt-2 space-y-1">
                            <div className="flex items-baseline justify-between">
                                <span className="text-[10px] text-zinc-400 font-mono">{labelA}:</span>
                                <span className={`font-mono font-black text-sm ${periodAData.netProfit >= 0 ? 'text-white' : 'text-red-400'}`}>
                                    R{periodAData.netProfit.toLocaleString(undefined, {minimumFractionDigits: 0})}
                                </span>
                            </div>
                            <div className="flex items-baseline justify-between text-zinc-400">
                                <span className="text-[10px] font-mono">{labelB}:</span>
                                <span className="font-mono font-bold text-xs text-zinc-300">R{periodBData.netProfit.toLocaleString(undefined, {minimumFractionDigits: 0})}</span>
                            </div>
                        </div>
                    </div>
                    <div className="pt-1.5 border-t border-zinc-800/60 text-[9px] text-zinc-400 flex items-center justify-between">
                        <span>Net Profit Delta:</span>
                        <span className={`font-mono font-bold ${periodAData.netProfit - periodBData.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {periodAData.netProfit - periodBData.netProfit >= 0 ? '+' : ''}R{(periodAData.netProfit - periodBData.netProfit).toLocaleString(undefined, {minimumFractionDigits: 0})}
                        </span>
                    </div>
                </div>

                {/* 4. PROFITS & ROI RETURNS CARD */}
                <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 p-3 border border-zinc-800 shadow-md space-y-2 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80">
                            <span className="text-[10px] uppercase font-bold text-emerald-400">Profits & Returns</span>
                            <span className={`px-1.5 py-0.2 text-[9px] font-black font-mono flex items-center gap-0.5 ${
                                prfGrowth >= 0 ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                            }`}>
                                {prfGrowth >= 0 ? `+${prfGrowth.toFixed(1)}%` : `${prfGrowth.toFixed(1)}%`}
                            </span>
                        </div>
                        <div className="mt-2 space-y-1">
                            <div className="flex items-baseline justify-between">
                                <span className="text-[10px] text-zinc-400 font-mono">{labelA}:</span>
                                <span className="font-mono font-black text-sm text-emerald-400">R{periodAData.profitsMade.toLocaleString(undefined, {minimumFractionDigits: 0})}</span>
                            </div>
                            <div className="flex items-baseline justify-between text-zinc-400">
                                <span className="text-[10px] font-mono">{labelB}:</span>
                                <span className="font-mono font-bold text-xs text-zinc-300">R{periodBData.profitsMade.toLocaleString(undefined, {minimumFractionDigits: 0})}</span>
                            </div>
                        </div>
                    </div>
                    <div className="pt-1.5 border-t border-zinc-800/60 text-[9px] text-zinc-400 flex items-center justify-between">
                        <span>Margin Velocity:</span>
                        <span className="font-mono text-emerald-400 font-bold">{periodAData.profitMargin.toFixed(1)}% Margin</span>
                    </div>
                </div>
            </div>

            {/* INTERACTIVE GROWTH VISUALIZER BAR CHART */}
            <div className="p-3.5 bg-zinc-950 border border-zinc-800/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
                        Multi-Period Trajectory Visualizer ({comparisonMode.toUpperCase()})
                    </span>

                    {/* Metric Switcher */}
                    <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="text-zinc-500">Metric:</span>
                        <button
                            onClick={() => setChartMetric('revenue')}
                            className={`px-2 py-0.5 font-mono ${chartMetric === 'revenue' ? 'bg-emerald-600 text-white font-bold' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                        >
                            Revenue
                        </button>
                        <button
                            onClick={() => setChartMetric('expenses')}
                            className={`px-2 py-0.5 font-mono ${chartMetric === 'expenses' ? 'bg-red-600 text-white font-bold' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                        >
                            Expenses
                        </button>
                        <button
                            onClick={() => setChartMetric('net')}
                            className={`px-2 py-0.5 font-mono ${chartMetric === 'net' ? 'bg-zinc-100 text-black font-bold' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                        >
                            Net Profit
                        </button>
                        <button
                            onClick={() => setChartMetric('profits')}
                            className={`px-2 py-0.5 font-mono ${chartMetric === 'profits' ? 'bg-emerald-500 text-black font-bold' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
                        >
                            Profits & ROI
                        </button>
                    </div>
                </div>

                {/* Bars */}
                <div className="h-36 flex items-end justify-around space-x-2 pt-4 pb-4 px-2 border-b border-l border-zinc-800 relative">
                    <span className="absolute left-0 top-1 -translate-x-full text-[9px] text-zinc-500 font-mono pr-1">
                        R{maxChartVal >= 1000 ? `${(maxChartVal/1000).toFixed(0)}k` : maxChartVal.toFixed(0)}
                    </span>
                    <span className="absolute left-0 bottom-1 -translate-x-full text-[9px] text-zinc-500 font-mono pr-1">
                        R0
                    </span>

                    {growthChartSeries.map((item, idx) => {
                        let value = 0;
                        let barColor = 'bg-emerald-500';
                        if (chartMetric === 'revenue') {
                            value = item.revenue;
                            barColor = 'bg-emerald-500';
                        } else if (chartMetric === 'expenses') {
                            value = item.expenses;
                            barColor = 'bg-red-500';
                        } else if (chartMetric === 'net') {
                            value = item.net;
                            barColor = item.net >= 0 ? 'bg-zinc-200' : 'bg-red-600';
                        } else {
                            value = item.profits;
                            barColor = 'bg-emerald-400';
                        }

                        const barHeight = maxChartVal > 0 ? Math.min(100, Math.max(4, (Math.abs(value) / maxChartVal) * 100)) : 4;

                        return (
                            <div key={idx} className="flex-1 group relative flex flex-col items-center justify-end h-full">
                                <div
                                    style={{ height: `${barHeight}%` }}
                                    className={`w-full max-w-[48px] ${barColor} hover:brightness-125 transition-all shadow-sm`}
                                />
                                <span className="absolute -bottom-4 text-[9px] text-zinc-400 truncate max-w-[48px] text-center font-mono">
                                    {item.label}
                                </span>

                                {/* Tooltip */}
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-zinc-700 px-2 py-1 text-[10px] text-white pointer-events-none z-20 whitespace-nowrap shadow-xl">
                                    <p className="font-mono font-bold">R{value.toLocaleString(undefined, {minimumFractionDigits: 0})}</p>
                                    <p className="text-[8px] text-zinc-400 font-mono">{item.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
