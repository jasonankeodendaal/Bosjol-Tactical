import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import * as d3 from 'd3';
import type { Transaction, Player, GameEvent, Location, CompanyDetails } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { UrlOrUploadField } from './UrlOrUploadField';
import { CurrencyDollarIcon, PrinterIcon, ArrowTrendingUpIcon } from './icons/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { PrintableReport } from './PrintableReport';
import { useData } from '../data/DataContext';
import { BusinessCardTransaction } from './BusinessCardTransaction';
import { FinanceGrowthComparison } from './FinanceGrowthComparison';
import { 
    Receipt, 
    Plus, 
    Trash2, 
    Edit3, 
    Image as ImageIcon, 
    Eye, 
    ZoomIn, 
    Calendar, 
    Coins, 
    Building2, 
    FileText, 
    CheckCircle2, 
    TrendingUp, 
    Scale, 
    Layers, 
    LayoutGrid, 
    List, 
    Filter, 
    BarChart3, 
    FolderKanban, 
    Folder, 
    Loader2, 
    X,
    Sparkles,
    Flag,
    Shield,
    ShoppingBag,
    DollarSign,
    Activity,
    PieChart,
    ChevronRight
} from 'lucide-react';

type TimeFilter = 'day' | 'week' | 'month' | '90days' | 'all';
type ViewCategory = 'all' | 'game_fees' | 'rentals' | 'retail' | 'expenses' | 'profits' | 'growth';
type LayoutMode = 'cards' | 'table';

export const EXPENSE_CATEGORIES = [
    'Fuel & Power Generation',
    'Field Maintenance & Barricades',
    'Tactical BBs & Ammo Restock',
    'Safety, First Aid & Protection',
    'Staff & Marshal Compensation',
    'Canteen, Water & Refreshments',
    'Radios, Chrono & Comms',
    'Rental Gear Repair & Spares',
    'Facility Rent & Arena Permits',
    'Armory Hardware & Tech Parts',
    'Marketing, Media & Player Patches',
    'Vehicle & Logistics Fuel',
    'Insurance & Legal Compliance',
    'Software, Web & IT Infrastructure',
    'Trophies, Medals & Player Awards',
    'Pyrotechnics & Smoke Supplies',
    'Target Systems & Electronic Props',
    'Cleaning & Field Sanitation',
    'Utility Bills (Water/Electricity)',
    'General Operating Expense'
];

export const PROFIT_CATEGORIES = [
    'Resale & Equipment Profit',
    'Ammo & Consumables Resale',
    'Rental Asset Profit',
    'Event Ticket Surplus',
    'Canteen & Catering Margin',
    'Sponsorship & Partner Payout',
    'Custom Armory & Tech Services',
    'Private Field Booking / Corporate Event',
    'Merchandise & Branded Patch Sales',
    'Chrono Tuning & Gun Repairs',
    'Storage & Locker Rental Fees',
    'Raffle & Prize Drawing Margin',
    'General Profit & Return'
];

const QUICK_PRESETS = [
    { name: 'Generator Fuel (Diesel)', category: 'Fuel & Power Generation', reason: 'Fuel refill for field generator & floodlights' },
    { name: 'Bio-BB 0.25g Bulk Carton', category: 'Tactical BBs & Ammo Restock', reason: 'Replenish arena bio-BB inventory' },
    { name: 'Trauma Kit & First Aid Restock', category: 'Safety, First Aid & Protection', reason: 'Safety compliance & emergency eyewash refills' },
    { name: 'Field Netting & Camo Repair', category: 'Field Maintenance & Barricades', reason: 'Mending boundary safety netting & arena barricades' },
    { name: 'Marshal Radios & Chrono Batteries', category: 'Radios, Chrono & Comms', reason: 'Fresh AAA & 9V batteries for marshalling team' },
    { name: 'Canteen Bottled Water & Ice', category: 'Canteen, Water & Refreshments', reason: 'Hydration supply for skirmish participants' },
    { name: 'Rental Goggles & Mesh Replacements', category: 'Rental Gear Repair & Spares', reason: 'Replacing scratched rental masks & mesh guards' },
    { name: 'Marshal Game Day Stipend', category: 'Staff & Marshal Compensation', reason: 'Official field marshalling & safety briefing duty' },
];

const PROFIT_PRESETS = [
    { name: 'Bulk BB Resale Surplus', sourceName: 'Bio-BB 0.25g Bulk Carton', category: 'Ammo & Consumables Resale', reason: 'Resale of bulk BBs at arena registration booth' },
    { name: 'Rental Fleet Turnaround Return', sourceName: 'Rental Gear Spares', category: 'Rental Asset Profit', reason: 'Net rental fee profit on refurbished marker fleet' },
    { name: 'Tournament Gate / Entry Surplus', sourceName: 'Special Skirmish Op', category: 'Event Ticket Surplus', reason: 'Event margin profit realization from tactical skirmish day' },
    { name: 'Canteen Refreshment Net Gain', sourceName: 'Canteen Bottled Water & Ice', category: 'Canteen & Catering Margin', reason: 'Weekend energy drink and hydration sales profit' },
    { name: 'Surplus Weapon / Gear Resale', sourceName: 'Tactical Gear Restock', category: 'Resale & Equipment Profit', reason: 'Profit margin from player second-hand armory consignment' },
    { name: 'Armory Upgrades & Tech Tuning', sourceName: 'Armory Hardware Parts', category: 'Custom Armory & Tech Services', reason: 'Labor and parts margin on AEG gearbox upgrades' },
];

// Shrink-to-Fit Tactile 3D KPI Pill (High-Density Professional)
const TacticalKpiPill: React.FC<{ 
    title: string; 
    value: string; 
    colorClass: string; 
    subtitle?: string; 
    icon?: React.ReactNode;
    badge?: string;
    onClick?: () => void;
    active?: boolean;
}> = ({ title, value, colorClass, subtitle, icon, badge, onClick, active }) => (
    <div 
        onClick={onClick}
        className={`p-1.5 sm:p-2 rounded-xl transition-all select-none flex-1 min-w-[105px] sm:min-w-[125px] flex flex-col justify-between cursor-pointer font-sans ${
            active 
                ? 'bg-gradient-to-br from-zinc-800/90 via-zinc-900 to-black shadow-[0_8px_20px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.12)] ring-1 ring-amber-400/80 scale-[1.01]' 
                : 'bg-gradient-to-br from-zinc-950/90 via-zinc-900/70 to-black/90 shadow-[0_4px_14px_rgba(0,0,0,0.65),inset_0_1px_0_0_rgba(255,255,255,0.04)] hover:bg-zinc-900/80'
        }`}
    >
        <div className="flex items-center justify-between gap-1 text-[7.5px] sm:text-[8px] uppercase font-mono text-zinc-400 font-bold leading-none">
            <span className="flex items-center gap-1 truncate">
                {icon}
                <span className="truncate">{title}</span>
            </span>
            {badge && (
                <span className="px-1 py-0.2 rounded text-[7px] font-bold bg-white/[0.08] text-zinc-300">
                    {badge}
                </span>
            )}
        </div>
        <div className={`text-[11px] sm:text-xs font-mono font-black mt-1 leading-none tracking-tight ${colorClass}`}>
            {value}
        </div>
        {subtitle && (
            <p className="text-[7px] sm:text-[7.5px] font-mono text-zinc-500 mt-0.5 truncate leading-none">
                {subtitle}
            </p>
        )}
    </div>
);

// Dynamic D3 Multi-Stream Financial Pulse Canvas (Area Wave + Flow Breakdown)
interface MultiStreamPoint {
    key: string;
    label: string;
    gameFees: number;
    rentals: number;
    retail: number;
    expenses: number;
    profits: number;
    net: number;
}

const DynamicMultiStreamPulseChart: React.FC<{
    data: MultiStreamPoint[];
    activeStream: 'all' | 'game_fees' | 'rentals' | 'retail' | 'expenses' | 'net';
    onStreamChange: (stream: 'all' | 'game_fees' | 'rentals' | 'retail' | 'expenses' | 'net') => void;
}> = ({ data, activeStream, onStreamChange }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const [containerWidth, setContainerWidth] = useState<number>(600);
    const [hoveredPoint, setHoveredPoint] = useState<MultiStreamPoint | null>(null);

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

    useEffect(() => {
        if (!svgRef.current || data.length === 0) return;

        const width = containerWidth;
        const height = 88;
        const margin = { top: 6, right: 8, bottom: 16, left: 24 };
        const innerWidth = Math.max(width - margin.left - margin.right, 40);
        const innerHeight = Math.max(height - margin.top - margin.bottom, 30);

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        svg.attr('width', width)
           .attr('height', height)
           .attr('viewBox', `0 0 ${width} ${height}`);

        const defs = svg.append('defs');

        // 3D Glow filter
        const glowFilter = defs.append('filter')
            .attr('id', 'finance-glow-tight')
            .attr('x', '-20%').attr('y', '-20%')
            .attr('width', '140%').attr('height', '140%');
        glowFilter.append('feGaussianBlur').attr('stdDeviation', '2').attr('result', 'coloredBlur');
        const feMerge = glowFilter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Gradients
        const addGrad = (id: string, color: string) => {
            const grad = defs.append('linearGradient')
                .attr('id', id)
                .attr('x1', '0%').attr('y1', '0%')
                .attr('x2', '0%').attr('y2', '100%');
            grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.35);
            grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.0);
        };

        addGrad('game-fees-grad-tight', '#f59e0b');
        addGrad('rentals-grad-tight', '#3b82f6');
        addGrad('retail-grad-tight', '#a855f7');
        addGrad('expenses-grad-tight', '#ef4444');
        addGrad('net-grad-tight', '#10b981');

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const xScale = d3.scalePoint<string>()
            .domain(data.map(d => d.key))
            .range([0, innerWidth])
            .padding(0.08);

        const maxInflow = d3.max(data, d => Math.max(d.gameFees + d.rentals + d.retail, d.expenses, d.net, 100)) || 1000;
        const minVal = Math.min(d3.min(data, d => Math.min(0, d.net)) || 0, 0);

        const yScale = d3.scaleLinear()
            .domain([minVal, maxInflow * 1.15])
            .range([innerHeight, 0]);

        // Background gridlines
        const yTicks = yScale.ticks(2);
        yTicks.forEach(tick => {
            const y = yScale(tick);
            g.append('line')
                .attr('x1', 0)
                .attr('y1', y)
                .attr('x2', innerWidth)
                .attr('y2', y)
                .attr('stroke', '#27272a')
                .attr('stroke-width', 0.5)
                .attr('stroke-dasharray', '2,2');

            g.append('text')
                .attr('x', -3)
                .attr('y', y + 2.5)
                .attr('fill', '#71717a')
                .attr('font-size', '7.5px')
                .attr('font-family', 'monospace')
                .attr('text-anchor', 'end')
                .text(tick >= 1000 ? `R${(tick / 1000).toFixed(0)}k` : `R${tick}`);
        });

        // Area Generators
        const drawAreaAndLine = (
            accessor: (d: MultiStreamPoint) => number, 
            color: string, 
            gradId: string, 
            dashed = false
        ) => {
            const area = d3.area<MultiStreamPoint>()
                .x(d => xScale(d.key) || 0)
                .y0(yScale(0))
                .y1(d => yScale(accessor(d)))
                .curve(d3.curveMonotoneX);

            const line = d3.line<MultiStreamPoint>()
                .x(d => xScale(d.key) || 0)
                .y(d => yScale(accessor(d)))
                .curve(d3.curveMonotoneX);

            g.append('path')
                .datum(data)
                .attr('fill', `url(#${gradId})`)
                .attr('d', area);

            const path = g.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', color)
                .attr('stroke-width', 1.3)
                .attr('d', line)
                .attr('filter', 'url(#finance-glow-tight)');

            if (dashed) {
                path.attr('stroke-dasharray', '2.5,1.5');
            }
        };

        if (activeStream === 'all' || activeStream === 'game_fees') {
            drawAreaAndLine(d => d.gameFees, '#f59e0b', 'game-fees-grad-tight');
        }
        if (activeStream === 'all' || activeStream === 'rentals') {
            drawAreaAndLine(d => d.rentals, '#3b82f6', 'rentals-grad-tight');
        }
        if (activeStream === 'all' || activeStream === 'retail') {
            drawAreaAndLine(d => d.retail, '#a855f7', 'retail-grad-tight');
        }
        if (activeStream === 'all' || activeStream === 'expenses') {
            drawAreaAndLine(d => d.expenses, '#ef4444', 'expenses-grad-tight', true);
        }
        if (activeStream === 'all' || activeStream === 'net') {
            drawAreaAndLine(d => d.net, '#10b981', 'net-grad-tight');
        }

        // Timeline Checkpoint Nodes
        data.forEach(d => {
            const x = xScale(d.key) || 0;
            const isHovered = hoveredPoint?.key === d.key;

            const col = g.append('g')
                .attr('class', 'stream-col cursor-pointer')
                .on('mouseenter', () => setHoveredPoint(d))
                .on('mouseleave', () => setHoveredPoint(null));

            col.append('rect')
                .attr('x', x - 10)
                .attr('y', 0)
                .attr('width', 20)
                .attr('height', innerHeight)
                .attr('fill', 'transparent');

            if (isHovered) {
                col.append('line')
                    .attr('x1', x)
                    .attr('y1', 0)
                    .attr('x2', x)
                    .attr('y2', innerHeight)
                    .attr('stroke', '#ffffff')
                    .attr('stroke-width', 0.8)
                    .attr('stroke-dasharray', '2,1');
            }

            // X-axis label
            col.append('text')
                .attr('x', x)
                .attr('y', innerHeight + 11)
                .attr('fill', isHovered ? '#ffffff' : '#71717a')
                .attr('font-size', '7.5px')
                .attr('font-family', 'monospace')
                .attr('text-anchor', 'middle')
                .text(d.label);
        });

    }, [data, containerWidth, activeStream, hoveredPoint]);

    if (data.length === 0) {
        return (
            <div className="h-20 flex items-center justify-center text-[10px] text-zinc-500 italic font-mono">
                No financial records recorded for this timeframe
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full space-y-1 select-none font-mono">
            {/* Stream Selector Controls */}
            <div className="flex items-center justify-between gap-1 flex-wrap text-[7.5px] sm:text-[8px]">
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-zinc-900/80 shadow-inner flex-wrap">
                    {[
                        { id: 'all', label: 'All' },
                        { id: 'game_fees', label: 'Game Fees', color: 'text-amber-400' },
                        { id: 'rentals', label: 'Rentals', color: 'text-blue-400' },
                        { id: 'retail', label: 'Retail', color: 'text-purple-400' },
                        { id: 'expenses', label: 'Expenses', color: 'text-red-400' },
                        { id: 'net', label: 'Net', color: 'text-emerald-400' },
                    ].map(st => (
                        <button
                            key={st.id}
                            onClick={() => onStreamChange(st.id as any)}
                            className={`px-1.5 py-0.2 rounded font-bold uppercase transition-all ${
                                activeStream === st.id
                                    ? 'bg-zinc-800 text-white shadow-sm font-extrabold'
                                    : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            {st.label}
                        </button>
                    ))}
                </div>

                {/* Hover inspection pill */}
                {hoveredPoint && (
                    <div className="px-1.5 py-0.2 rounded-md bg-zinc-900 text-zinc-300 font-bold flex items-center gap-1.5 shadow-sm text-[7.5px]">
                        <span className="text-amber-400">{hoveredPoint.label}:</span>
                        <span>Game: <strong className="text-white">R{hoveredPoint.gameFees}</strong></span>
                        <span>Gear: <strong className="text-blue-400">R{hoveredPoint.rentals}</strong></span>
                        <span>Shop: <strong className="text-purple-400">R{hoveredPoint.retail}</strong></span>
                        <span>Exp: <strong className="text-red-400">R{hoveredPoint.expenses}</strong></span>
                        <span>Net: <strong className="text-emerald-400">R{hoveredPoint.net}</strong></span>
                    </div>
                )}
            </div>

            {/* Canvas */}
            <div className="w-full relative h-[88px] overflow-hidden">
                <svg ref={svgRef} className="w-full block overflow-visible" />
            </div>
        </div>
    );
};

export const FinanceTab: React.FC<{ 
    transactions: Transaction[], 
    players: Player[], 
    events: GameEvent[], 
    locations: Location[], 
    companyDetails: CompanyDetails,
    addDoc?: <T extends {}>(collection: string, data: T) => Promise<string>,
    updateDoc?: <T extends {id: string}>(collection: string, doc: Partial<T> & {id: string}) => Promise<void>,
    deleteDoc?: (collection: string, docId: string) => Promise<void>,
}> = ({ 
    transactions = [], 
    players = [], 
    events = [], 
    locations = [], 
    companyDetails,
    addDoc: propAddDoc,
    updateDoc: propUpdateDoc,
    deleteDoc: propDeleteDoc,
}) => {
    const contextData = useData();
    const addDoc = propAddDoc || contextData?.addDoc;
    const updateDoc = propUpdateDoc || contextData?.updateDoc;
    const deleteDoc = propDeleteDoc || contextData?.deleteDoc;

    // Filter states
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
    const [viewCategory, setViewCategory] = useState<ViewCategory>('all');
    const [layoutMode, setLayoutMode] = useState<LayoutMode>('cards');
    const [groupByCategory, setGroupByCategory] = useState<boolean>(false);
    const [playerFilter, setPlayerFilter] = useState<string>('all');
    const [eventFilter, setEventFilter] = useState<string>('all');
    const [locationFilter, setLocationFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeStreamFilter, setActiveStreamFilter] = useState<'all' | 'game_fees' | 'rentals' | 'retail' | 'expenses' | 'net'>('all');

    // Custom Categories State
    const [customExpenseCategories, setCustomExpenseCategories] = useState<string[]>([]);
    const [customProfitCategories, setCustomProfitCategories] = useState<string[]>([]);
    const [isCreatingExpenseCategory, setIsCreatingExpenseCategory] = useState<boolean>(false);
    const [newExpenseCategoryName, setNewExpenseCategoryName] = useState<string>('');
    const [isCreatingProfitCategory, setIsCreatingProfitCategory] = useState<boolean>(false);
    const [newProfitCategoryName, setNewProfitCategoryName] = useState<string>('');

    // Active Category Lists
    const allExpenseCategoriesList = useMemo(() => {
        const set = new Set([...EXPENSE_CATEGORIES, ...customExpenseCategories]);
        transactions.forEach(t => {
            if (t.category && (t.type === 'Expense' || (t.amount && t.amount > 0))) {
                set.add(t.category);
            }
        });
        return Array.from(set);
    }, [customExpenseCategories, transactions]);

    const allProfitCategoriesList = useMemo(() => {
        const set = new Set([...PROFIT_CATEGORIES, ...customProfitCategories]);
        transactions.forEach(t => {
            if (t.category && (t.profitMade && Number(t.profitMade) > 0)) {
                set.add(t.category);
            }
        });
        return Array.from(set);
    }, [customProfitCategories, transactions]);

    const handleAddCustomExpenseCategory = () => {
        const trimmed = newExpenseCategoryName.trim();
        if (trimmed) {
            setCustomExpenseCategories(prev => Array.from(new Set([...prev, trimmed])));
            setExpenseFormData(prev => ({ ...prev, category: trimmed }));
            setNewExpenseCategoryName('');
            setIsCreatingExpenseCategory(false);
        }
    };

    const handleAddCustomProfitCategory = () => {
        const trimmed = newProfitCategoryName.trim();
        if (trimmed) {
            setCustomProfitCategories(prev => Array.from(new Set([...prev, trimmed])));
            setProfitFormData(prev => ({ ...prev, category: trimmed }));
            setNewProfitCategoryName('');
            setIsCreatingProfitCategory(false);
        }
    };

    // Modal states
    const [isPrinting, setIsPrinting] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Transaction | null>(null);
    const [editingProfit, setEditingProfit] = useState<Transaction | null>(null);
    const [inspectingExpense, setInspectingExpense] = useState<Transaction | null>(null);
    const [zoomSlip, setZoomSlip] = useState(false);

    // Form state: DEDICATED EXPENSE ONLY FORM
    const [expenseFormData, setExpenseFormData] = useState({
        expenseName: '',
        expenseReason: '',
        pricePaid: '',
        date: new Date().toISOString().slice(0, 10),
        category: EXPENSE_CATEGORIES[0],
        paymentMethod: 'EFT',
        paidTo: '',
        receiptImageUrl: '',
        notes: '',
    });

    // Form state: DEDICATED PROFIT & RETURNS FORM
    const [profitFormData, setProfitFormData] = useState({
        profitName: '',
        profitReason: '',
        profitMade: '',
        date: new Date().toISOString().slice(0, 10),
        sourceExpenseName: '',
        sourceCost: '',
        category: PROFIT_CATEGORIES[0],
        paymentMethod: 'EFT',
        paidTo: '',
        notes: '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [saveProgress, setSaveProgress] = useState<{
        stage: 'validating' | 'transmitting' | 'verifying' | 'success' | 'error';
        progress: number;
        message: string;
        details?: string;
        type: 'expense' | 'profit';
    } | null>(null);
    const [statusBanner, setStatusBanner] = useState<string | null>(null);

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

    // Reset Forms
    const resetExpenseForm = () => {
        setExpenseFormData({
            expenseName: '',
            expenseReason: '',
            pricePaid: '',
            date: new Date().toISOString().slice(0, 10),
            category: EXPENSE_CATEGORIES[0],
            paymentMethod: 'EFT',
            paidTo: '',
            receiptImageUrl: '',
            notes: '',
        });
        setEditingExpense(null);
    };

    const resetProfitForm = () => {
        setProfitFormData({
            profitName: '',
            profitReason: '',
            profitMade: '',
            date: new Date().toISOString().slice(0, 10),
            sourceExpenseName: '',
            sourceCost: '',
            category: PROFIT_CATEGORIES[0],
            paymentMethod: 'EFT',
            paidTo: '',
            notes: '',
        });
        setEditingProfit(null);
    };

    const handleOpenNewExpense = () => {
        resetExpenseForm();
        setIsExpenseModalOpen(true);
    };

    const handleOpenNewProfit = () => {
        resetProfitForm();
        setIsProfitModalOpen(true);
    };

    const handleOpenEditExpense = (expense: Transaction) => {
        setEditingExpense(expense);
        setExpenseFormData({
            expenseName: expense.expenseName || expense.description || '',
            expenseReason: expense.expenseReason || '',
            pricePaid: String(expense.amount || ''),
            date: expense.date ? expense.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
            category: expense.category || EXPENSE_CATEGORIES[0],
            paymentMethod: (expense.paymentMethod as string) || 'EFT',
            paidTo: expense.paidTo || '',
            receiptImageUrl: expense.receiptImageUrl || '',
            notes: expense.notes || '',
        });
        setIsExpenseModalOpen(true);
    };

    const handleOpenEditProfit = (item: Transaction) => {
        setEditingProfit(item);
        setProfitFormData({
            profitName: item.profitName || item.description || '',
            profitReason: item.profitReason || '',
            profitMade: String(item.profitMade || item.amount || ''),
            date: item.profitDate ? item.profitDate.slice(0, 10) : (item.date ? item.date.slice(0, 10) : new Date().toISOString().slice(0, 10)),
            sourceExpenseName: item.expenseName || '',
            sourceCost: item.amount ? String(item.amount) : '',
            category: item.category || PROFIT_CATEGORIES[0],
            paymentMethod: (item.paymentMethod as string) || 'EFT',
            paidTo: item.paidTo || '',
            notes: item.notes || '',
        });
        setIsProfitModalOpen(true);
    };

    const handleSelectPreset = (preset: typeof QUICK_PRESETS[0]) => {
        setExpenseFormData(prev => ({
            ...prev,
            expenseName: preset.name,
            category: preset.category,
            expenseReason: prev.expenseReason || preset.reason,
        }));
    };

    const handleSelectProfitPreset = (preset: typeof PROFIT_PRESETS[0]) => {
        setProfitFormData(prev => ({
            ...prev,
            profitName: preset.name,
            sourceExpenseName: prev.sourceExpenseName || preset.sourceName,
            category: preset.category,
            profitReason: prev.profitReason || preset.reason,
        }));
    };

    const handleSaveExpense = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const rawExpenseName = (expenseFormData.expenseName || '').trim();
        const trimmedName = rawExpenseName || 'Operating Expense';
        const rawPricePaid = parseFloat(String(expenseFormData.pricePaid));
        const numericAmount = !isNaN(rawPricePaid) ? rawPricePaid : 0;

        setIsSaving(true);
        setSaveProgress({
            stage: 'validating',
            progress: 25,
            message: 'Validating expense details...',
            type: 'expense',
        });

        try {
            const expenseDate = expenseFormData.date 
                ? (expenseFormData.date.includes('T') ? expenseFormData.date : `${expenseFormData.date}T12:00:00Z`)
                : new Date().toISOString();

            const expensePayload: any = {
                description: trimmedName,
                expenseName: trimmedName,
                expenseReason: (expenseFormData.expenseReason || '').trim(),
                amount: numericAmount,
                date: expenseDate,
                type: 'Expense',
                category: expenseFormData.category || 'General Operating Expense',
                paymentMethod: expenseFormData.paymentMethod || 'EFT',
                paidTo: (expenseFormData.paidTo || '').trim(),
                receiptImageUrl: (expenseFormData.receiptImageUrl || '').trim(),
                notes: (expenseFormData.notes || '').trim(),
                status: 'completed',
                paymentStatus: 'Paid',
            };

            setSaveProgress({
                stage: 'transmitting',
                progress: 65,
                message: 'Live persisting to transactions ledger...',
                type: 'expense',
            });

            if (editingExpense) {
                expensePayload.id = editingExpense.id;
                if (updateDoc) {
                    await updateDoc('transactions', expensePayload);
                }
            } else {
                const generatedId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
                expensePayload.id = generatedId;
                if (addDoc) {
                    await addDoc('transactions', expensePayload);
                }
            }

            setSaveProgress({
                stage: 'verifying',
                progress: 90,
                message: 'Verifying real-time broadcast...',
                type: 'expense',
            });

            await new Promise(resolve => setTimeout(resolve, 200));

            setSaveProgress({
                stage: 'success',
                progress: 100,
                message: `Expense "${trimmedName}" recorded and synced!`,
                type: 'expense',
            });

            setStatusBanner(`Expense "${trimmedName}" (-R${numericAmount.toFixed(0)}) recorded.`);

            setTimeout(() => {
                setIsExpenseModalOpen(false);
                resetExpenseForm();
                setSaveProgress(null);
                setIsSaving(false);
            }, 500);
            setTimeout(() => setStatusBanner(null), 4000);
        } catch (err: any) {
            console.error('Error saving expense:', err);
            setSaveProgress({
                stage: 'error',
                progress: 100,
                message: 'Failed to save expense',
                details: err?.message || String(err),
                type: 'expense',
            });
            setIsSaving(false);
        }
    };

    const handleSaveProfit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const rawProfitName = (profitFormData.profitName || '').trim();
        const trimmedProfitName = rawProfitName || 'Realized Profit';
        const rawProfitMade = parseFloat(String(profitFormData.profitMade));
        const numericProfit = !isNaN(rawProfitMade) ? rawProfitMade : 0;
        const rawSourceCost = parseFloat(String(profitFormData.sourceCost));
        const numericSourceCost = !isNaN(rawSourceCost) ? rawSourceCost : 0;

        setIsSaving(true);
        setSaveProgress({
            stage: 'validating',
            progress: 25,
            message: 'Validating profit details...',
            type: 'profit',
        });

        try {
            const profitDate = profitFormData.date 
                ? (profitFormData.date.includes('T') ? profitFormData.date : `${profitFormData.date}T12:00:00Z`)
                : new Date().toISOString();

            const profitPayload: any = {
                description: trimmedProfitName,
                profitName: trimmedProfitName,
                expenseName: (profitFormData.sourceExpenseName || '').trim(),
                profitReason: (profitFormData.profitReason || '').trim(),
                amount: numericSourceCost,
                profitMade: numericProfit,
                date: profitDate,
                profitDate: profitDate,
                type: 'Expense',
                category: profitFormData.category || 'Resale & Equipment Profit',
                paymentMethod: profitFormData.paymentMethod || 'EFT',
                paidTo: (profitFormData.paidTo || '').trim(),
                notes: (profitFormData.notes || '').trim(),
                status: 'completed',
                paymentStatus: 'Paid',
            };

            setSaveProgress({
                stage: 'transmitting',
                progress: 65,
                message: 'Live persisting profit entry...',
                type: 'profit',
            });

            if (editingProfit) {
                profitPayload.id = editingProfit.id;
                if (updateDoc) {
                    await updateDoc('transactions', profitPayload);
                }
            } else {
                const generatedId = `prf_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
                profitPayload.id = generatedId;
                if (addDoc) {
                    await addDoc('transactions', profitPayload);
                }
            }

            setSaveProgress({
                stage: 'verifying',
                progress: 90,
                message: 'Verifying real-time broadcast...',
                type: 'profit',
            });

            await new Promise(resolve => setTimeout(resolve, 200));

            setSaveProgress({
                stage: 'success',
                progress: 100,
                message: `Profit "${trimmedProfitName}" (+R${numericProfit.toFixed(0)}) synced!`,
                type: 'profit',
            });

            setStatusBanner(`Profit "${trimmedProfitName}" (+R${numericProfit.toFixed(0)}) recorded.`);

            setTimeout(() => {
                setIsProfitModalOpen(false);
                resetProfitForm();
                setSaveProgress(null);
                setIsSaving(false);
            }, 500);
            setTimeout(() => setStatusBanner(null), 4000);
        } catch (err: any) {
            console.error('Error saving profit:', err);
            setSaveProgress({
                stage: 'error',
                progress: 100,
                message: 'Failed to save profit entry',
                details: err?.message || String(err),
                type: 'profit',
            });
            setIsSaving(false);
        }
    };

    const handleDeleteExpense = async (expense: Transaction) => {
        const itemTitle = expense.profitName || expense.expenseName || expense.description || 'record';
        if (!window.confirm(`Permanently remove "${itemTitle}" from the financial ledger?`)) {
            return;
        }
        try {
            if (deleteDoc) {
                await deleteDoc('transactions', expense.id);
            }
            if (inspectingExpense?.id === expense.id) {
                setInspectingExpense(null);
            }
            setStatusBanner(`Record removed from ledger.`);
            setTimeout(() => setStatusBanner(null), 4000);
        } catch (err: any) {
            console.error('Error deleting transaction:', err);
            alert(`Failed to delete transaction: ${err?.message || 'Unknown error'}`);
        }
    };

    // Filter transactions
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
            if (location) {
                 eventIdsInLocation = events.filter(e => e.location === location.name).map(e => e.id);
            }
        }
        
        return transactions.filter(t => {
            const tDate = new Date(t.date || t.profitDate || Date.now());
            if (tDate < startDate) return false;

            // View Category Filter
            if (viewCategory === 'game_fees' && t.type !== 'Event Revenue' && !(/event|game/i.test(t.type || ''))) return false;
            if (viewCategory === 'rentals' && t.type !== 'Rental Revenue' && !(/rental/i.test(t.type || ''))) return false;
            if (viewCategory === 'retail' && t.type !== 'Retail Revenue' && !(/retail|shop|ammo|sales/i.test(t.type || ''))) return false;
            if (viewCategory === 'expenses' && (t.type !== 'Expense' || Boolean(t.profitMade && Number(t.profitMade) > 0 && (!t.amount || t.amount <= 0)))) return false;
            if (viewCategory === 'profits' && (!t.profitMade || Number(t.profitMade) <= 0)) return false;

            // Player and event filters
            const pId = t.relatedPlayerId || t.playerId;
            if (playerFilter !== 'all' && pId !== playerFilter) return false;
            
            const eId = t.relatedEventId || t.eventId;
            if (eventFilter !== 'all' && eId !== eventFilter) return false;
            if (eventIdsInLocation && eId && !eventIdsInLocation.includes(eId)) return false;

            // Global Category Filter
            if (categoryFilter !== 'all') {
                if ((t.category || '') !== categoryFilter) return false;
            }

            // Search query filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchDesc = (t.description || '').toLowerCase().includes(query);
                const matchName = (t.expenseName || '').toLowerCase().includes(query);
                const matchProfitName = (t.profitName || '').toLowerCase().includes(query);
                const matchReason = (t.expenseReason || '').toLowerCase().includes(query);
                const matchProfitReason = (t.profitReason || '').toLowerCase().includes(query);
                const matchVendor = (t.paidTo || '').toLowerCase().includes(query);
                const matchCategory = (t.category || '').toLowerCase().includes(query);
                const matchReceipt = (t.receiptNumber || t.notes || '').toLowerCase().includes(query);
                if (!matchDesc && !matchName && !matchProfitName && !matchReason && !matchProfitReason && !matchVendor && !matchCategory && !matchReceipt) {
                    return false;
                }
            }

            return true;
        });
    }, [timeFilter, viewCategory, playerFilter, eventFilter, locationFilter, categoryFilter, searchQuery, transactions, events, locations]);

    // Financial Metrics Calculation (Detailed Itemized Breakdown)
    const metrics = useMemo(() => {
        let gameFeesTotal = 0;
        let gameFeesCount = 0;
        let rentalsTotal = 0;
        let rentalsCount = 0;
        let retailTotal = 0;
        let retailCount = 0;
        let expenses = 0;
        let expenseCount = 0;
        let verifiedSlipsCount = 0;
        let outstanding = 0;
        let totalProfitsMade = 0;
        let profitsCount = 0;

        for (const t of transactions) {
            const tDate = new Date(t.date || t.profitDate || Date.now());
            const now = new Date();
            let startDate: Date;
            switch (timeFilter) {
                case 'day': startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()); break;
                case 'week': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
                case 'month': startDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
                case '90days': startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
                case 'all': default: startDate = new Date(0); break;
            }
            if (tDate < startDate) continue;

            const amt = Number(t.amount || 0);

            if (t.type === 'Expense') {
                if (amt > 0) {
                    expenses += amt;
                    expenseCount += 1;
                }
                if (t.receiptImageUrl && t.receiptImageUrl.trim() !== '') {
                    verifiedSlipsCount += 1;
                }
                if (t.profitMade && Number(t.profitMade) > 0) {
                    totalProfitsMade += Number(t.profitMade);
                    profitsCount += 1;
                }
            } else if (t.type === 'Event Revenue' || (t.type && /event|game/i.test(t.type))) {
                gameFeesTotal += amt;
                gameFeesCount += 1;
                if (t.paymentStatus === 'Unpaid') outstanding += amt;
            } else if (t.type === 'Rental Revenue' || (t.type && /rental/i.test(t.type))) {
                rentalsTotal += amt;
                rentalsCount += 1;
                if (t.paymentStatus === 'Unpaid') outstanding += amt;
            } else if (t.type === 'Retail Revenue' || (t.type && /retail|shop|ammo|sales/i.test(t.type))) {
                retailTotal += amt;
                retailCount += 1;
                if (t.paymentStatus === 'Unpaid') outstanding += amt;
            }
        }
        
        const totalGrossRevenue = gameFeesTotal + rentalsTotal + retailTotal;
        const netProfit = totalGrossRevenue - expenses + totalProfitsMade;
        const profitMargin = totalGrossRevenue > 0 ? Math.round((netProfit / totalGrossRevenue) * 100) : 0;

        return {
            gameFeesTotal,
            gameFeesCount,
            rentalsTotal,
            rentalsCount,
            retailTotal,
            retailCount,
            totalGrossRevenue,
            expenses,
            expenseCount,
            verifiedSlipsCount,
            totalProfitsMade,
            profitsCount,
            netProfit,
            profitMargin,
            outstanding,
        };
    }, [transactions, timeFilter]);
    
    // Dynamic Multi-Stream Pulse Chart Data Points
    const multiStreamData = useMemo(() => {
        const dataMap = new Map<string, MultiStreamPoint>();
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
            const date = new Date(t.date || t.profitDate || Date.now());
            let key: string;
            switch(timeFilter) {
                case 'day': key = date.toISOString().split(':')[0]; break;
                case 'week': case 'month': case '90days': key = date.toISOString().split('T')[0]; break;
                case 'all': key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; break;
            }

            if (!dataMap.has(key)) {
                dataMap.set(key, {
                    key,
                    label: formatLabel(date),
                    gameFees: 0,
                    rentals: 0,
                    retail: 0,
                    expenses: 0,
                    profits: 0,
                    net: 0
                });
            }
            
            const entry = dataMap.get(key)!;
            const amt = Number(t.amount || 0);

            if (t.type === 'Expense') {
                entry.expenses += amt;
                if (t.profitMade && Number(t.profitMade) > 0) {
                    entry.profits += Number(t.profitMade);
                }
            } else if (t.type === 'Event Revenue' || (t.type && /event|game/i.test(t.type))) {
                entry.gameFees += amt;
            } else if (t.type === 'Rental Revenue' || (t.type && /rental/i.test(t.type))) {
                entry.rentals += amt;
            } else if (t.type === 'Retail Revenue' || (t.type && /retail|shop|ammo|sales/i.test(t.type))) {
                entry.retail += amt;
            }

            entry.net = (entry.gameFees + entry.rentals + entry.retail) - entry.expenses + entry.profits;
        });
        
        return Array.from(dataMap.values())
            .sort((a, b) => new Date(a.key).getTime() - new Date(b.key).getTime());

    }, [filteredTransactions, timeFilter]);

    // All active categories for dropdown selection
    const allDropdownCategories = useMemo(() => {
        if (viewCategory === 'expenses') {
            return allExpenseCategoriesList;
        } else if (viewCategory === 'profits') {
            return allProfitCategoriesList;
        }
        return Array.from(new Set([...allExpenseCategoriesList, ...allProfitCategoriesList]));
    }, [viewCategory, allExpenseCategoriesList, allProfitCategoriesList]);

    // Category Breakdown Counts & Sums
    const categoryStats = useMemo(() => {
        const statsMap = new Map<string, { count: number, total: number }>();

        transactions.forEach(t => {
            const cat = t.category || 'General Operating Expense';
            if (!statsMap.has(cat)) {
                statsMap.set(cat, { count: 0, total: 0 });
            }
            const s = statsMap.get(cat)!;
            s.count += 1;
            if (t.profitMade && Number(t.profitMade) > 0) {
                s.total += Number(t.profitMade);
            } else {
                s.total += Number(t.amount || 0);
            }
        });

        return statsMap;
    }, [transactions]);

    // Categorized groups when in Category Grouping view mode
    const categorizedGroups = useMemo(() => {
        const groups: { [key: string]: Transaction[] } = {};
        
        filteredTransactions.forEach(t => {
            const cat = t.category || 'General Operating Expense';
            if (!groups[cat]) {
                groups[cat] = [];
            }
            groups[cat].push(t);
        });

        return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
    }, [filteredTransactions]);

    const reportFilters = {
        timeFilter, playerFilter, eventFilter, locationFilter,
        timeFilterLabel: timeFilter,
        playerFilterLabel: players.find(p => p.id === playerFilter)?.name || 'All Players',
        eventFilterLabel: events.find(e => e.id === eventFilter)?.title || 'All Events',
        locationFilterLabel: locations.find(l => l.id === locationFilter)?.name || 'All Locations',
    };

    return (
        <div className="w-full space-y-2 font-sans select-none">
            {isPrinting && createPortal(
                <PrintableReport
                    transactions={filteredTransactions}
                    metrics={{
                        ...metrics,
                        totalRevenue: metrics.totalGrossRevenue,
                        'Event Revenue': metrics.gameFeesTotal,
                        'Rental Revenue': metrics.rentalsTotal,
                        'Retail Revenue': metrics.retailTotal,
                    }}
                    filters={reportFilters}
                    companyDetails={companyDetails}
                    players={players}
                    events={events}
                />,
                document.getElementById('printable-report-container')!
            )}

            {/* Notification Banner */}
            <AnimatePresence>
                {statusBanner && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="p-1.5 sm:p-2 rounded-xl bg-emerald-950/90 text-emerald-300 text-[10px] flex items-center justify-between shadow-md backdrop-blur-md"
                    >
                        <div className="flex items-center gap-1.5 font-mono">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{statusBanner}</span>
                        </div>
                        <button onClick={() => setStatusBanner(null)} className="text-zinc-400 hover:text-white">
                            <X className="w-2.5 h-2.5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 1. TOP HEADER & ACTION CONTROLS (Shrink-to-Fit, 3D Depth) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2 sm:p-2.5 rounded-xl bg-zinc-950/90 shadow-[0_8px_20px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center shadow-inner shrink-0">
                        <Coins className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h2 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                                FINANCIAL LEDGER
                            </h2>
                            <span className="px-1.5 py-0.2 rounded-full text-[7.5px] font-mono bg-zinc-800 text-zinc-300">
                                {filteredTransactions.length} Entries
                            </span>
                        </div>
                        <p className="text-[8.5px] text-zinc-400 leading-none mt-0.5 font-mono">
                            Game fees, rentals, sales, operating expenses & ROI
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 flex-wrap">
                    <Button 
                        onClick={handleOpenNewExpense} 
                        variant="danger" 
                        size="sm" 
                        className="!py-0.5 !px-2 text-[9.5px] sm:text-[10px] font-bold flex items-center gap-1 shadow-sm rounded-lg"
                    >
                        <Receipt className="w-3 h-3" />
                        <span>Log Expense</span>
                    </Button>

                    <Button 
                        onClick={handleOpenNewProfit} 
                        variant="secondary" 
                        size="sm" 
                        className="!py-0.5 !px-2 text-[9.5px] sm:text-[10px] font-bold flex items-center gap-1 !bg-emerald-950/80 hover:!bg-emerald-900 !text-emerald-300 !border-emerald-500/40 shadow-sm rounded-lg"
                    >
                        <ArrowTrendingUpIcon className="w-3 h-3 text-emerald-400" />
                        <span>Log Profit</span>
                    </Button>

                    <button 
                        onClick={handlePrint} 
                        className="p-1 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[9.5px] font-mono font-bold flex items-center gap-1 transition shadow-xs"
                    >
                        <PrinterIcon className="w-3 h-3" />
                        <span className="hidden sm:inline">Print</span>
                    </button>
                </div>
            </div>

            {/* 2. ITEMIZED FINANCIAL KPI STRIP (Shrink-to-Fit 6-Column Grid) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
                <TacticalKpiPill 
                    title="Game Fees" 
                    value={`R${metrics.gameFeesTotal.toLocaleString()}`} 
                    colorClass="text-amber-400" 
                    subtitle={`${metrics.gameFeesCount} Match Tickets`}
                    icon={<Flag className="w-2.5 h-2.5 text-amber-400" />}
                    onClick={() => setViewCategory(viewCategory === 'game_fees' ? 'all' : 'game_fees')}
                    active={viewCategory === 'game_fees'}
                />
                <TacticalKpiPill 
                    title="Gear Rentals" 
                    value={`R${metrics.rentalsTotal.toLocaleString()}`} 
                    colorClass="text-blue-400" 
                    subtitle={`${metrics.rentalsCount} Fleet Hires`}
                    icon={<Shield className="w-2.5 h-2.5 text-blue-400" />}
                    onClick={() => setViewCategory(viewCategory === 'rentals' ? 'all' : 'rentals')}
                    active={viewCategory === 'rentals'}
                />
                <TacticalKpiPill 
                    title="Shop Sales" 
                    value={`R${metrics.retailTotal.toLocaleString()}`} 
                    colorClass="text-purple-400" 
                    subtitle={`${metrics.retailCount} Retail Items`}
                    icon={<ShoppingBag className="w-2.5 h-2.5 text-purple-400" />}
                    onClick={() => setViewCategory(viewCategory === 'retail' ? 'all' : 'retail')}
                    active={viewCategory === 'retail'}
                />
                <TacticalKpiPill 
                    title="Expenses" 
                    value={`R${metrics.expenses.toLocaleString()}`} 
                    colorClass="text-red-400" 
                    subtitle={`${metrics.expenseCount} Outflows (${metrics.verifiedSlipsCount} Slips)`}
                    icon={<Receipt className="w-2.5 h-2.5 text-red-400" />}
                    onClick={() => setViewCategory(viewCategory === 'expenses' ? 'all' : 'expenses')}
                    active={viewCategory === 'expenses'}
                />
                <TacticalKpiPill 
                    title="Realized ROI" 
                    value={`R${metrics.totalProfitsMade.toLocaleString()}`} 
                    colorClass="text-emerald-400" 
                    subtitle={`${metrics.profitsCount} Surplus Marks`}
                    icon={<Sparkles className="w-2.5 h-2.5 text-emerald-400" />}
                    onClick={() => setViewCategory(viewCategory === 'profits' ? 'all' : 'profits')}
                    active={viewCategory === 'profits'}
                />
                <TacticalKpiPill 
                    title="Net Margin" 
                    value={`R${metrics.netProfit.toLocaleString()}`} 
                    colorClass={metrics.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'} 
                    subtitle={`${metrics.profitMargin}% (${metrics.outstanding > 0 ? `R${metrics.outstanding} Due` : 'Clear'})`}
                    icon={<Scale className="w-2.5 h-2.5 text-emerald-400" />}
                />
            </div>

            {/* 3. DYNAMIC MULTI-STREAM FINANCIAL PULSE (Ultra Compact Height: 88px) */}
            <div className="p-2 sm:p-2.5 rounded-xl bg-zinc-950/90 shadow-[0_10px_24px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md space-y-1.5">
                <div className="flex items-center justify-between pb-1 border-b border-white/5">
                    <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10.5px] font-black font-mono text-white uppercase tracking-wider">
                            Multi-Stream Financial Flow
                        </span>
                    </div>

                    {/* Timeframe selector */}
                    <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-zinc-900 shadow-inner font-mono text-[8px]">
                        {[
                            { id: 'day', label: 'Day' },
                            { id: 'week', label: 'Week' },
                            { id: 'month', label: 'Month' },
                            { id: '90days', label: '90D' },
                            { id: 'all', label: 'All' },
                        ].map(tf => (
                            <button
                                key={tf.id}
                                onClick={() => setTimeFilter(tf.id as TimeFilter)}
                                className={`px-1.5 py-0.2 rounded font-bold transition-all ${
                                    timeFilter === tf.id
                                        ? 'bg-amber-600 text-white shadow-xs'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                {tf.label}
                            </button>
                        ))}
                    </div>
                </div>

                <DynamicMultiStreamPulseChart 
                    data={multiStreamData}
                    activeStream={activeStreamFilter}
                    onStreamChange={setActiveStreamFilter}
                />
            </div>

            {/* 4. FILTER & VIEW MODE CONTROLS (Shrink to Fit) */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 p-2 rounded-xl bg-zinc-950/80 shadow-[0_6px_16px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.04)] text-xs">
                {/* View Category Pills */}
                <div className="flex items-center gap-0.5 flex-wrap font-mono text-[8.5px] sm:text-[9px]">
                    <button
                        onClick={() => setViewCategory('all')}
                        className={`px-2 py-0.5 rounded-lg font-bold transition-all ${
                            viewCategory === 'all'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-zinc-400 hover:text-white bg-zinc-900/60'
                        }`}
                    >
                        All ({transactions.length})
                    </button>
                    <button
                        onClick={() => setViewCategory('game_fees')}
                        className={`px-2 py-0.5 rounded-lg font-bold transition-all flex items-center gap-0.5 ${
                            viewCategory === 'game_fees'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-amber-400/80 hover:text-amber-300 bg-zinc-900/60'
                        }`}
                    >
                        <Flag className="w-2 h-2" />
                        <span>Game Fees ({metrics.gameFeesCount})</span>
                    </button>
                    <button
                        onClick={() => setViewCategory('rentals')}
                        className={`px-2 py-0.5 rounded-lg font-bold transition-all flex items-center gap-0.5 ${
                            viewCategory === 'rentals'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-blue-400/80 hover:text-blue-300 bg-zinc-900/60'
                        }`}
                    >
                        <Shield className="w-2 h-2" />
                        <span>Rentals ({metrics.rentalsCount})</span>
                    </button>
                    <button
                        onClick={() => setViewCategory('retail')}
                        className={`px-2 py-0.5 rounded-lg font-bold transition-all flex items-center gap-0.5 ${
                            viewCategory === 'retail'
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'text-purple-400/80 hover:text-purple-300 bg-zinc-900/60'
                        }`}
                    >
                        <ShoppingBag className="w-2 h-2" />
                        <span>Sales ({metrics.retailCount})</span>
                    </button>
                    <button
                        onClick={() => setViewCategory('expenses')}
                        className={`px-2 py-0.5 rounded-lg font-bold transition-all flex items-center gap-0.5 ${
                            viewCategory === 'expenses'
                                ? 'bg-red-600 text-white shadow-xs'
                                : 'text-red-400/80 hover:text-red-300 bg-zinc-900/60'
                        }`}
                    >
                        <Receipt className="w-2 h-2" />
                        <span>Expenses ({metrics.expenseCount})</span>
                    </button>
                    <button
                        onClick={() => setViewCategory('profits')}
                        className={`px-2 py-0.5 rounded-lg font-bold transition-all flex items-center gap-0.5 ${
                            viewCategory === 'profits'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-emerald-400/80 hover:text-emerald-300 bg-zinc-900/60'
                        }`}
                    >
                        <Sparkles className="w-2 h-2" />
                        <span>Profits ({metrics.profitsCount})</span>
                    </button>
                    <button
                        onClick={() => setViewCategory('growth')}
                        className={`px-2 py-0.5 rounded-lg font-bold transition-all flex items-center gap-0.5 ${
                            viewCategory === 'growth'
                                ? 'bg-cyan-600 text-white shadow-xs'
                                : 'text-cyan-400/80 hover:text-cyan-300 bg-zinc-900/60'
                        }`}
                    >
                        <BarChart3 className="w-2 h-2" />
                        <span>Growth</span>
                    </button>
                </div>

                {/* Search & Layout Toggles */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Search Field */}
                    <div className="relative w-36">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search entry..."
                            className="w-full bg-zinc-900/90 rounded-lg px-2 py-0.5 text-[9px] text-white font-mono placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-inner"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                                <X className="w-2.5 h-2.5" />
                            </button>
                        )}
                    </div>

                    {/* Group by category */}
                    <button
                        onClick={() => setGroupByCategory(!groupByCategory)}
                        className={`px-2 py-0.5 rounded-lg text-[8.5px] font-mono font-bold transition-all flex items-center gap-1 shadow-xs ${
                            groupByCategory 
                                ? 'bg-amber-950 text-amber-300 shadow-inner' 
                                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                        }`}
                    >
                        <FolderKanban className="w-2.5 h-2.5" />
                        <span>{groupByCategory ? 'Grouped' : 'Group'}</span>
                    </button>

                    {/* Layout switcher */}
                    <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 shadow-inner">
                        <button
                            onClick={() => setLayoutMode('cards')}
                            className={`p-1 px-1.5 rounded-md text-[8.5px] font-mono font-bold transition-all ${
                                layoutMode === 'cards' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            <LayoutGrid className="w-2.5 h-2.5" />
                        </button>
                        <button
                            onClick={() => setLayoutMode('table')}
                            className={`p-1 px-1.5 rounded-md text-[8.5px] font-mono font-bold transition-all ${
                                layoutMode === 'table' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-white'
                            }`}
                        >
                            <List className="w-2.5 h-2.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 5. INTERACTIVE 1-TAP CATEGORY PILLS (Shrink to Fit) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-thin text-[8px] sm:text-[8.5px] font-mono">
                <button
                    onClick={() => setCategoryFilter('all')}
                    className={`px-2 py-0.5 rounded-lg whitespace-nowrap font-bold transition-all shadow-xs ${
                        categoryFilter === 'all'
                            ? 'bg-amber-600 text-white'
                            : 'bg-zinc-950/80 text-zinc-400 hover:text-white'
                    }`}
                >
                    All ({filteredTransactions.length})
                </button>
                {allDropdownCategories.map(cat => {
                    const stat = categoryStats.get(cat);
                    if (!stat && categoryFilter !== cat) return null;
                    const count = stat ? stat.count : 0;
                    return (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(categoryFilter === cat ? 'all' : cat)}
                            className={`px-2 py-0.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1 shadow-xs ${
                                categoryFilter === cat
                                    ? 'bg-emerald-950 text-emerald-300 font-bold'
                                    : 'bg-zinc-950/80 text-zinc-400 hover:text-zinc-200'
                            }`}
                        >
                            <span>{cat}</span>
                            <span className="text-[7.5px] opacity-70 bg-black/40 px-1 py-0.2 rounded">
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* DEDICATED VIEW: GROWTH & MULTI-PERIOD COMPARISON ENGINE */}
            {viewCategory === 'growth' && (
                <FinanceGrowthComparison transactions={transactions} />
            )}

            {/* STANDARD VIEWS: SIDE-BY-SIDE 3D CARDS / TABLE */}
            {viewCategory !== 'growth' && (
                <div className="space-y-2">
                    {/* Empty State */}
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-8 px-3 rounded-xl bg-zinc-950/90 shadow-[0_10px_24px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.06)] text-zinc-500 space-y-1.5 font-mono">
                            <Receipt className="w-6 h-6 text-zinc-600 mx-auto" />
                            <p className="text-[11px] text-zinc-200 font-bold">No records found matching current category or filters</p>
                            <p className="text-[9px] text-zinc-500 max-w-sm mx-auto">
                                Adjust timeframe/category or log a new transaction above.
                            </p>
                        </div>
                    ) : layoutMode === 'cards' ? (
                        /* SIDE-BY-SIDE 3D BUSINESS CARDS GRID (Shrink-to-fit) */
                        groupByCategory ? (
                            <div className="space-y-2">
                                {categorizedGroups.map(([categoryName, groupItems]) => {
                                    const groupSum = groupItems.reduce((acc, curr) => {
                                        if (curr.profitMade && Number(curr.profitMade) > 0) {
                                            return acc + Number(curr.profitMade);
                                        }
                                        return acc + (curr.type === 'Expense' ? -Number(curr.amount || 0) : Number(curr.amount || 0));
                                    }, 0);

                                    return (
                                        <div key={categoryName} className="space-y-1.5 rounded-xl bg-zinc-950/80 p-2 sm:p-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.05)]">
                                            <div className="flex items-center justify-between pb-1 border-b border-white/5 text-[9.5px]">
                                                <span className="font-black uppercase tracking-wider text-zinc-200 flex items-center gap-1 font-mono">
                                                    <Folder className="w-3 h-3 text-amber-400" />
                                                    <span>{categoryName}</span>
                                                    <span className="text-[8.5px] text-zinc-500 font-mono">({groupItems.length})</span>
                                                </span>
                                                <span className={`font-mono font-bold ${groupSum >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {groupSum >= 0 ? '+' : ''}R{groupSum.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-2 items-stretch">
                                                {groupItems.map(t => (
                                                    <BusinessCardTransaction
                                                        key={t.id}
                                                        transaction={t}
                                                        players={players}
                                                        onInspect={setInspectingExpense}
                                                        onEditExpense={handleOpenEditExpense}
                                                        onEditProfit={handleOpenEditProfit}
                                                        onDelete={handleDeleteExpense}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5 sm:gap-2 items-stretch">
                                {filteredTransactions.map(t => (
                                    <BusinessCardTransaction
                                        key={t.id}
                                        transaction={t}
                                        players={players}
                                        onInspect={setInspectingExpense}
                                        onEditExpense={handleOpenEditExpense}
                                        onEditProfit={handleOpenEditProfit}
                                        onDelete={handleDeleteExpense}
                                    />
                                ))}
                            </div>
                        )
                    ) : (
                        /* COMPACT LINEAR TABLE VIEW */
                        <div className="rounded-xl bg-zinc-950/90 shadow-[0_10px_24px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.06)] overflow-hidden">
                            <table className="w-full text-left text-[10px] font-mono">
                                <thead className="bg-zinc-900/90 text-zinc-400 uppercase text-[8px] tracking-wider border-b border-white/5">
                                    <tr>
                                        <th className="p-2">Date</th>
                                        <th className="p-2">Type / Category</th>
                                        <th className="p-2">Description</th>
                                        <th className="p-2">Paid To</th>
                                        <th className="p-2 text-right">Amount</th>
                                        <th className="p-2 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredTransactions.map(t => {
                                        const isExp = t.type === 'Expense';
                                        const hasProf = Boolean(t.profitMade && Number(t.profitMade) > 0);
                                        const isInc = !isExp || hasProf;
                                        const amt = hasProf ? Number(t.profitMade) : Number(t.amount || 0);

                                        return (
                                            <tr key={t.id} className="hover:bg-zinc-900/60 transition-colors">
                                                <td className="p-2 text-zinc-400 text-[9px]">
                                                    {new Date(t.date || t.profitDate || Date.now()).toLocaleDateString()}
                                                </td>
                                                <td className="p-2">
                                                    <span className={`px-1.5 py-0.2 rounded text-[7.5px] font-bold ${
                                                        hasProf ? 'bg-emerald-950 text-emerald-300' : isExp ? 'bg-red-950 text-red-300' : 'bg-blue-950 text-blue-300'
                                                    }`}>
                                                        {t.category || t.type}
                                                    </span>
                                                </td>
                                                <td className="p-2 font-bold text-white max-w-[180px] truncate">
                                                    {t.profitName || t.expenseName || t.description}
                                                </td>
                                                <td className="p-2 text-zinc-400 text-[9px]">
                                                    {t.paidTo || '—'}
                                                </td>
                                                <td className={`p-2 text-right font-black ${isInc ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {isInc ? '+' : '-'}R{amt.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                                </td>
                                                <td className="p-2 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button 
                                                            onClick={() => setInspectingExpense(t)} 
                                                            className="p-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                                                            title="Inspect"
                                                        >
                                                            <Eye className="w-2.5 h-2.5" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteExpense(t)} 
                                                            className="p-1 rounded bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-2.5 h-2.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 1: LOG / EDIT OPERATING EXPENSE                     */}
            {/* ========================================================= */}
            <Modal
                isOpen={isExpenseModalOpen}
                onClose={() => {
                    setIsExpenseModalOpen(false);
                    resetExpenseForm();
                    setSaveProgress(null);
                }}
                title={editingExpense ? 'Edit Operating Expense' : 'Log Business & Field Expense'}
                maxWidth="md"
            >
                <form onSubmit={handleSaveExpense} className="space-y-2.5 text-xs font-sans">
                    {/* Quick Presets Strip */}
                    {!editingExpense && (
                        <div className="space-y-1">
                            <span className="text-[9.5px] font-bold text-zinc-400 font-mono uppercase">Quick Presets:</span>
                            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
                                {QUICK_PRESETS.map((p, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelectPreset(p)}
                                        className="px-1.5 py-0.2 rounded-md text-[8.5px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white whitespace-nowrap transition font-mono shadow-xs"
                                    >
                                        + {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Input
                            label="Expense Item / Title *"
                            value={expenseFormData.expenseName}
                            onChange={e => setExpenseFormData({ ...expenseFormData, expenseName: e.target.value })}
                            placeholder="e.g. Generator Fuel, 0.25g BB Bulk Carton"
                            required
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input
                                label="Price Paid (ZAR) *"
                                type="number"
                                step="0.01"
                                value={expenseFormData.pricePaid}
                                onChange={e => setExpenseFormData({ ...expenseFormData, pricePaid: e.target.value })}
                                placeholder="0.00"
                                required
                            />

                            <div>
                                <label className="block text-[10.5px] font-medium text-zinc-300 mb-1">
                                    Expense Category
                                </label>
                                <select
                                    value={expenseFormData.category}
                                    onChange={e => setExpenseFormData({ ...expenseFormData, category: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                                >
                                    {allExpenseCategoriesList.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input
                                label="Date"
                                type="date"
                                value={expenseFormData.date}
                                onChange={e => setExpenseFormData({ ...expenseFormData, date: e.target.value })}
                            />

                            <Input
                                label="Paid To / Vendor"
                                value={expenseFormData.paidTo}
                                onChange={e => setExpenseFormData({ ...expenseFormData, paidTo: e.target.value })}
                                placeholder="e.g. Shell Petrol, Tactical Supplier"
                            />
                        </div>

                        <Input
                            label="Operational Purpose / Reason"
                            value={expenseFormData.expenseReason}
                            onChange={e => setExpenseFormData({ ...expenseFormData, expenseReason: e.target.value })}
                            placeholder="e.g. Replenish floodlight fuel for night skirmish"
                        />

                        <UrlOrUploadField
                            label="Slip / Receipt Image"
                            fileUrl={expenseFormData.receiptImageUrl}
                            onUrlSet={url => setExpenseFormData({ ...expenseFormData, receiptImageUrl: url })}
                            onRemove={() => setExpenseFormData({ ...expenseFormData, receiptImageUrl: url => '' })}
                        />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/5">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                setIsExpenseModalOpen(false);
                                resetExpenseForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="danger"
                            size="sm"
                            disabled={isSaving}
                            className="font-bold"
                        >
                            {isSaving ? 'Saving...' : editingExpense ? 'Update Expense' : 'Save Expense'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* ========================================================= */}
            {/* MODAL 2: LOG / EDIT REALIZED PROFIT                       */}
            {/* ========================================================= */}
            <Modal
                isOpen={isProfitModalOpen}
                onClose={() => {
                    setIsProfitModalOpen(false);
                    resetProfitForm();
                    setSaveProgress(null);
                }}
                title={editingProfit ? 'Edit Realized Profit' : 'Log Realized Profit & ROI Markup'}
                maxWidth="md"
            >
                <form onSubmit={handleSaveProfit} className="space-y-2.5 text-xs font-sans">
                    {!editingProfit && (
                        <div className="space-y-1">
                            <span className="text-[9.5px] font-bold text-zinc-400 font-mono uppercase">Quick Presets:</span>
                            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
                                {PROFIT_PRESETS.map((p, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelectProfitPreset(p)}
                                        className="px-1.5 py-0.2 rounded-md text-[8.5px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white whitespace-nowrap transition font-mono shadow-xs"
                                    >
                                        + {p.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Input
                            label="Profit Title / Item *"
                            value={profitFormData.profitName}
                            onChange={e => setProfitFormData({ ...profitFormData, profitName: e.target.value })}
                            placeholder="e.g. Bulk BB Resale Surplus"
                            required
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input
                                label="Realized Profit Amount (ZAR) *"
                                type="number"
                                step="0.01"
                                value={profitFormData.profitMade}
                                onChange={e => setProfitFormData({ ...profitFormData, profitMade: e.target.value })}
                                placeholder="0.00"
                                required
                            />

                            <div>
                                <label className="block text-[10.5px] font-medium text-zinc-300 mb-1">
                                    Profit Category
                                </label>
                                <select
                                    value={profitFormData.category}
                                    onChange={e => setProfitFormData({ ...profitFormData, category: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-2.5 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                >
                                    {allProfitCategoriesList.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <Input
                            label="Operational Reason / Margin Details"
                            value={profitFormData.profitReason}
                            onChange={e => setProfitFormData({ ...profitFormData, profitReason: e.target.value })}
                            placeholder="e.g. Surplus margin realized on player BB carton resale"
                        />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/5">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                setIsProfitModalOpen(false);
                                resetProfitForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="secondary"
                            size="sm"
                            disabled={isSaving}
                            className="font-bold !bg-emerald-600 hover:!bg-emerald-500 text-white"
                        >
                            {isSaving ? 'Saving...' : editingProfit ? 'Update Profit' : 'Save Profit'}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* ========================================================= */}
            {/* MODAL 3: EXPENSE SLIP AUDIT & DETAIL INSPECTOR            */}
            {/* ========================================================= */}
            {inspectingExpense && (
                <Modal
                    isOpen={Boolean(inspectingExpense)}
                    onClose={() => {
                        setInspectingExpense(null);
                        setZoomSlip(false);
                    }}
                    title="Transaction Audit & Slip Voucher"
                    maxWidth="lg"
                >
                    <div className="space-y-2.5 text-xs font-sans">
                        <div className="p-2.5 rounded-xl bg-zinc-950 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <span className={`px-1.5 py-0.2 rounded-md text-[8px] font-black uppercase tracking-wider font-mono ${
                                    inspectingExpense.profitMade && Number(inspectingExpense.profitMade) > 0
                                        ? 'bg-emerald-950 text-emerald-300'
                                        : 'bg-red-950 text-red-300'
                                }`}>
                                    {inspectingExpense.category || 'Financial Entry'}
                                </span>
                                <h3 className="text-xs sm:text-sm font-black text-white mt-0.5">
                                    {inspectingExpense.profitName || inspectingExpense.expenseName || inspectingExpense.description}
                                </h3>
                                <p className="text-[9.5px] text-zinc-400 font-mono mt-0.5">
                                    Date: {new Date(inspectingExpense.date || inspectingExpense.profitDate || Date.now()).toLocaleString()}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-[8.5px] text-zinc-400 uppercase font-mono font-bold">
                                    {inspectingExpense.profitMade && Number(inspectingExpense.profitMade) > 0 ? 'Profit Realized' : 'Price Paid'}
                                </p>
                                <p className={`text-lg font-mono font-black ${
                                    inspectingExpense.profitMade && Number(inspectingExpense.profitMade) > 0 ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                    {inspectingExpense.profitMade && Number(inspectingExpense.profitMade) > 0 ? '+' : '-'}R{Number(inspectingExpense.profitMade || inspectingExpense.amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </p>
                            </div>
                        </div>

                        {(inspectingExpense.expenseReason || inspectingExpense.profitReason) && (
                            <div className="p-2 rounded-lg bg-zinc-900/80 shadow-inner">
                                <p className="text-[8.5px] text-zinc-400 uppercase font-mono font-bold mb-0.5">Operational Reason</p>
                                <p className="text-zinc-200 text-[11px] leading-relaxed">
                                    "{inspectingExpense.profitReason || inspectingExpense.expenseReason}"
                                </p>
                            </div>
                        )}

                        <div className="p-2.5 rounded-xl bg-zinc-950 shadow-inner space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-zinc-300 flex items-center gap-1 text-[11px] font-mono">
                                    <ImageIcon className="w-3 h-3 text-amber-400" />
                                    <span>Slip / Proof of Payment Document</span>
                                </span>
                                {inspectingExpense.receiptImageUrl && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setZoomSlip(!zoomSlip)}
                                            className="text-[8.5px] text-zinc-400 hover:text-white flex items-center gap-0.5 font-mono"
                                        >
                                            <ZoomIn className="w-2.5 h-2.5" /> {zoomSlip ? 'Fit View' : 'Zoom Slip'}
                                        </button>
                                        <a
                                            href={inspectingExpense.receiptImageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[8.5px] text-blue-400 hover:underline font-mono"
                                        >
                                            Open Full
                                        </a>
                                    </div>
                                )}
                            </div>

                            {inspectingExpense.receiptImageUrl ? (
                                <div className={`relative overflow-hidden rounded-lg bg-black flex items-center justify-center ${zoomSlip ? 'max-h-[450px]' : 'max-h-56'}`}>
                                    <img
                                        src={inspectingExpense.receiptImageUrl}
                                        alt="Expense Slip Proof"
                                        className={`w-full object-contain ${zoomSlip ? 'scale-125 transition-transform duration-200 cursor-zoom-out' : 'cursor-zoom-in'}`}
                                        onClick={() => setZoomSlip(!zoomSlip)}
                                    />
                                </div>
                            ) : (
                                <div className="py-5 px-3 text-center rounded-lg bg-zinc-900/40 text-zinc-500">
                                    <Receipt className="w-5 h-5 mx-auto mb-1 opacity-50" />
                                    <p className="font-mono text-[9.5px]">No digital slip image was attached to this transaction.</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-2 flex items-center justify-between border-t border-white/5">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleDeleteExpense(inspectingExpense)}
                                className="!text-red-400 hover:!bg-red-950/40 text-xs"
                            >
                                <Trash2 className="w-3 h-3 mr-1" /> Delete
                            </Button>

                            <div className="flex items-center gap-1">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        const exp = inspectingExpense;
                                        setInspectingExpense(null);
                                        if (exp.profitMade && Number(exp.profitMade) > 0 && (!exp.amount || exp.amount <= 0 || exp.category === 'Resale & Equipment Profit')) {
                                            handleOpenEditProfit(exp);
                                        } else {
                                            handleOpenEditExpense(exp);
                                        }
                                    }}
                                    className="text-xs"
                                >
                                    <Edit3 className="w-3 h-3 mr-1" /> Edit
                                </Button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
