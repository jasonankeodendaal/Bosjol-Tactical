import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { Transaction, Player, GameEvent, Location, CompanyDetails } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { UrlOrUploadField } from './UrlOrUploadField';
import { CurrencyDollarIcon, PrinterIcon, ArrowTrendingUpIcon } from './icons/Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { PrintableReport } from './PrintableReport';
import { useData } from '../data/DataContext';
import { BUSINESS_EXPENSES_SQL_SCHEMA } from '../utils/supabaseSchema';
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
    Database, 
    Copy, 
    Check, 
    X,
    Sparkles,
    Calendar,
    Coins,
    Building2,
    FileText,
    CreditCard,
    CheckCircle2,
    TrendingUp,
    Scale,
    Layers,
    ArrowRight,
    LayoutGrid,
    List,
    Filter,
    BarChart3
} from 'lucide-react';

type TimeFilter = 'day' | 'week' | 'month' | '90days' | 'all';
type ViewCategory = 'all' | 'revenue' | 'expenses' | 'profits' | 'growth';
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

const StatCard: React.FC<{ title: string, value: string, colorClass: string, subtitle?: string }> = ({ title, value, colorClass, subtitle }) => (
    <div className="py-1 px-1.5 flex flex-col justify-between shrink-0">
        <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider leading-none truncate">{title}</p>
        <p className={`text-sm sm:text-base font-mono font-black mt-0.5 leading-tight ${colorClass}`}>{value}</p>
        {subtitle && <p className="text-[9px] text-zinc-500 mt-0.5 leading-none truncate">{subtitle}</p>}
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
    // Fallback to DataContext if prop not explicitly provided
    const contextData = useData();
    const addDoc = propAddDoc || contextData?.addDoc;
    const updateDoc = propUpdateDoc || contextData?.updateDoc;
    const deleteDoc = propDeleteDoc || contextData?.deleteDoc;

    // Filter states
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
    const [viewCategory, setViewCategory] = useState<ViewCategory>('all');
    const [layoutMode, setLayoutMode] = useState<LayoutMode>('cards');
    const [playerFilter, setPlayerFilter] = useState<string>('all');
    const [eventFilter, setEventFilter] = useState<string>('all');
    const [locationFilter, setLocationFilter] = useState<string>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Modal states
    const [isPrinting, setIsPrinting] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isProfitModalOpen, setIsProfitModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Transaction | null>(null);
    const [editingProfit, setEditingProfit] = useState<Transaction | null>(null);
    const [inspectingExpense, setInspectingExpense] = useState<Transaction | null>(null);
    const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);
    const [copiedSql, setCopiedSql] = useState(false);
    const [zoomSlip, setZoomSlip] = useState(false);

    // Form state: DEDICATED EXPENSE ONLY FORM (No Profit Fields Mixed In)
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
        const trimmedName = expenseFormData.expenseName.trim();
        if (!trimmedName) {
            alert('Please enter an expense item description.');
            return;
        }
        const numericAmount = parseFloat(String(expenseFormData.pricePaid));
        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert('Please enter a valid cost amount (greater than 0).');
            return;
        }

        setIsSaving(true);
        try {
            const expenseDate = expenseFormData.date 
                ? (expenseFormData.date.includes('T') ? expenseFormData.date : `${expenseFormData.date}T12:00:00Z`)
                : new Date().toISOString();

            const expensePayload: any = {
                description: trimmedName,
                expenseName: trimmedName,
                expenseReason: expenseFormData.expenseReason.trim(),
                amount: numericAmount,
                date: expenseDate,
                type: 'Expense',
                category: expenseFormData.category || 'General Operating Expense',
                paymentMethod: expenseFormData.paymentMethod || 'EFT',
                paidTo: expenseFormData.paidTo.trim(),
                receiptImageUrl: expenseFormData.receiptImageUrl.trim(),
                notes: expenseFormData.notes.trim(),
                status: 'completed',
                paymentStatus: 'Paid',
            };

            if (editingExpense) {
                expensePayload.id = editingExpense.id;
                if (updateDoc) {
                    await updateDoc('transactions', expensePayload);
                }
                setStatusBanner(`Business expense "${trimmedName}" updated and synced.`);
            } else {
                const generatedId = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
                expensePayload.id = generatedId;
                if (addDoc) {
                    await addDoc('transactions', expensePayload);
                }
                setStatusBanner(`Business expense "R${numericAmount.toFixed(0)} - ${trimmedName}" recorded and synced live.`);
            }

            setIsExpenseModalOpen(false);
            resetExpenseForm();
            setTimeout(() => setStatusBanner(null), 5000);
        } catch (err: any) {
            console.error('Error saving business expense:', err);
            alert(`Failed to save expense: ${err?.message || 'Unknown error'}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveProfit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmedProfitName = profitFormData.profitName.trim();
        if (!trimmedProfitName) {
            alert('Please enter a profit or return title.');
            return;
        }
        const numericProfit = parseFloat(String(profitFormData.profitMade));
        if (isNaN(numericProfit) || numericProfit <= 0) {
            alert('Please enter a valid profit amount (greater than 0).');
            return;
        }

        setIsSaving(true);
        try {
            const realizationDate = profitFormData.date 
                ? (profitFormData.date.includes('T') ? profitFormData.date : `${profitFormData.date}T12:00:00Z`)
                : new Date().toISOString();

            const parsedSourceCost = parseFloat(profitFormData.sourceCost) || 0;
            const sourceDesc = profitFormData.sourceExpenseName.trim() || trimmedProfitName;

            const profitPayload: any = {
                description: `Profit: ${trimmedProfitName}`,
                expenseName: sourceDesc,
                expenseReason: profitFormData.profitReason.trim() || `Profit realized: ${trimmedProfitName}`,
                amount: parsedSourceCost,
                date: realizationDate,
                type: 'Expense',
                category: profitFormData.category || 'Resale & Equipment Profit',
                paymentMethod: profitFormData.paymentMethod || 'EFT',
                paidTo: profitFormData.paidTo.trim(),
                notes: profitFormData.notes.trim(),
                profitMade: numericProfit,
                profitName: trimmedProfitName,
                profitReason: profitFormData.profitReason.trim(),
                profitDate: realizationDate,
                status: 'completed',
                paymentStatus: 'Paid',
            };

            if (editingProfit) {
                profitPayload.id = editingProfit.id;
                if (updateDoc) {
                    await updateDoc('transactions', profitPayload);
                }
                setStatusBanner(`Profit entry "${trimmedProfitName}" (+R${numericProfit.toFixed(0)}) updated.`);
            } else {
                const generatedId = `prf_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
                profitPayload.id = generatedId;
                if (addDoc) {
                    await addDoc('transactions', profitPayload);
                }
                setStatusBanner(`Profit entry "${trimmedProfitName}" (+R${numericProfit.toFixed(0)}) recorded & synced live.`);
            }

            setIsProfitModalOpen(false);
            resetProfitForm();
            setTimeout(() => setStatusBanner(null), 5000);
        } catch (err: any) {
            console.error('Error saving profit entry:', err);
            alert(`Failed to save profit entry: ${err?.message || 'Unknown error'}`);
        } finally {
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

    const handleCopySql = () => {
        navigator.clipboard.writeText(BUSINESS_EXPENSES_SQL_SCHEMA);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 2500);
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
            if (viewCategory === 'revenue' && t.type === 'Expense') return false;
            if (viewCategory === 'expenses' && (t.type !== 'Expense' || Boolean(t.profitMade && Number(t.profitMade) > 0 && (!t.amount || t.amount <= 0)))) return false;
            if (viewCategory === 'profits' && (!t.profitMade || Number(t.profitMade) <= 0)) return false;

            // Player and event filters
            if (playerFilter !== 'all' && t.relatedPlayerId !== playerFilter) return false;
            if (eventFilter !== 'all' && t.relatedEventId !== eventFilter) return false;
            if (eventIdsInLocation && t.relatedEventId && !eventIdsInLocation.includes(t.relatedEventId)) return false;

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

    // Financial Metrics Calculation
    const metrics = useMemo(() => {
        const revenueByType = {
            'Event Revenue': 0,
            'Rental Revenue': 0,
            'Retail Revenue': 0,
        };
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

            if (t.type === 'Expense') {
                if (Number(t.amount || 0) > 0) {
                    expenses += Number(t.amount || 0);
                    expenseCount += 1;
                }
                if (t.receiptImageUrl && t.receiptImageUrl.trim() !== '') {
                    verifiedSlipsCount += 1;
                }
                if (t.profitMade && Number(t.profitMade) > 0) {
                    totalProfitsMade += Number(t.profitMade);
                    profitsCount += 1;
                }
            } else if (t.type in revenueByType) {
                revenueByType[t.type as keyof typeof revenueByType] += Number(t.amount || 0);
                if (t.paymentStatus === 'Unpaid') {
                    outstanding += Number(t.amount || 0);
                }
            }
        }
        
        const totalRevenue = Object.values(revenueByType).reduce((sum, val) => sum + val, 0);

        return {
            ...revenueByType,
            totalRevenue,
            expenses,
            expenseCount,
            verifiedSlipsCount,
            netProfit: totalRevenue - expenses,
            outstanding,
            totalProfitsMade,
            profitsCount,
        };
    }, [transactions, timeFilter]);
    
    // Revenue trend chart data
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

    // All active categories for dropdown selection
    const allDropdownCategories = useMemo(() => {
        if (viewCategory === 'expenses') {
            return EXPENSE_CATEGORIES;
        } else if (viewCategory === 'profits') {
            return PROFIT_CATEGORIES;
        }
        // Combined unique list
        return Array.from(new Set([...EXPENSE_CATEGORIES, ...PROFIT_CATEGORIES]));
    }, [viewCategory]);

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

            {/* Notification Banner */}
            <AnimatePresence>
                {statusBanner && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="p-3 rounded-none bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between shadow-lg"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>{statusBanner}</span>
                        </div>
                        <button onClick={() => setStatusBanner(null)} className="text-zinc-400 hover:text-white">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Bar: Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800/60">
                <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                        <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider leading-tight">
                            Financial Intelligence & Business Card Ledger
                        </h2>
                        <p className="text-[10px] text-zinc-400 leading-none mt-0.5">
                            Realtime cash flow, separate expense & profit tracking, multi-period growth analysis & side-by-side business card vouchers
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Separate Log Expense Entry Button */}
                    <Button 
                        onClick={handleOpenNewExpense} 
                        variant="danger" 
                        size="sm" 
                        className="!py-1 !px-2.5 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                        title="Open dedicated business expense entry modal"
                    >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Log Expense</span>
                    </Button>

                    {/* Separate Log Profit Entry Button */}
                    <Button 
                        onClick={handleOpenNewProfit} 
                        variant="secondary" 
                        size="sm" 
                        className="!py-1 !px-2.5 text-xs font-bold flex items-center gap-1.5 !bg-emerald-950/60 hover:!bg-emerald-900/80 !text-emerald-300 !border-emerald-500/50 shadow-sm"
                        title="Open dedicated profit & returns entry modal"
                    >
                        <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Log Profit</span>
                    </Button>

                    {/* Print Report */}
                    <button 
                        onClick={handlePrint} 
                        className="p-1 px-2 text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                        <PrinterIcon className="w-3.5 h-3.5" />
                        <span>Print</span>
                    </button>

                    {/* SQL Live Sync Snippet */}
                    <button 
                        onClick={() => setIsSqlModalOpen(true)}
                        className="p-1 px-2 text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
                        title="View & copy Supabase live sync SQL schema snippet"
                    >
                        <Database className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-mono hidden md:inline">SQL Sync</span>
                    </button>
                </div>
            </div>

            {/* Top Filter Row: Timeframe, Categories & Scope */}
            <div className="flex flex-wrap items-center gap-2 py-1 bg-zinc-950/60 p-2 border border-zinc-800/60">
                {/* Timeframe selector */}
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <select 
                        value={timeFilter} 
                        onChange={e => setTimeFilter(e.target.value as TimeFilter)} 
                        className="bg-zinc-900 border border-zinc-700/80 px-2 py-1 text-white text-xs focus:outline-none focus:border-red-500 transition-colors"
                    >
                        <option value="day">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="all">All Time</option>
                    </select>
                </div>

                {/* Dropdown Categories Selector */}
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                    <Filter className="w-3.5 h-3.5 text-zinc-400" />
                    <select 
                        value={categoryFilter} 
                        onChange={e => setCategoryFilter(e.target.value)} 
                        className="bg-zinc-900 border border-zinc-700/80 px-2 py-1 text-white text-xs focus:outline-none focus:border-red-500 transition-colors max-w-[200px]"
                    >
                        <option value="all">All Categories</option>
                        {allDropdownCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Player selector */}
                <select 
                    value={playerFilter} 
                    onChange={e => setPlayerFilter(e.target.value)} 
                    className="bg-zinc-900 border border-zinc-700/80 px-2 py-1 text-white text-xs focus:outline-none focus:border-red-500 transition-colors"
                >
                    <option value="all">All Players</option>
                    {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>

                {/* Event selector */}
                <select 
                    value={eventFilter} 
                    onChange={e => setEventFilter(e.target.value)} 
                    className="bg-zinc-900 border border-zinc-700/80 px-2 py-1 text-white text-xs focus:outline-none focus:border-red-500 transition-colors"
                >
                    <option value="all">All Events</option>
                    {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                </select>

                {/* Location selector */}
                <select 
                    value={locationFilter} 
                    onChange={e => setLocationFilter(e.target.value)} 
                    className="bg-zinc-900 border border-zinc-700/80 px-2 py-1 text-white text-xs focus:outline-none focus:border-red-500 transition-colors"
                >
                    <option value="all">All Arenas & Fields</option>
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>

                {/* Layout Mode Toggle */}
                <div className="ml-auto flex items-center gap-1 bg-zinc-900 p-0.5 border border-zinc-800">
                    <button
                        onClick={() => setLayoutMode('cards')}
                        className={`p-1 flex items-center gap-1 text-[11px] font-bold transition-all ${
                            layoutMode === 'cards' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                        title="Side-by-side Business Card Concept Grid"
                    >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cards</span>
                    </button>
                    <button
                        onClick={() => setLayoutMode('table')}
                        className={`p-1 flex items-center gap-1 text-[11px] font-bold transition-all ${
                            layoutMode === 'table' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                        title="Compact Linear Ledger Rows"
                    >
                        <List className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">List</span>
                    </button>
                </div>
            </div>
             
            {/* KPI Bar */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-2 border-y border-zinc-800/60">
                <StatCard 
                    title="Total Gross" 
                    value={`R${metrics.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`} 
                    colorClass="text-emerald-400" 
                    subtitle="Events, Rentals & Shop"
                />
                <StatCard 
                    title="Business Expenses" 
                    value={`R${metrics.expenses.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`} 
                    colorClass="text-red-400" 
                    subtitle={`${metrics.expenseCount} entries (${metrics.verifiedSlipsCount} slips)`}
                />
                <StatCard 
                    title="Profits & Returns" 
                    value={`R${metrics.totalProfitsMade.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`} 
                    colorClass="text-emerald-400" 
                    subtitle={`${metrics.profitsCount} profit items`}
                />
                <StatCard 
                    title="Net Profit" 
                    value={`R${metrics.netProfit.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`} 
                    colorClass={metrics.netProfit >= 0 ? 'text-white' : 'text-red-400'} 
                    subtitle="Gross minus Expenses"
                />
                <StatCard 
                    title="Unpaid Dues" 
                    value={`R${metrics.outstanding.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 0})}`} 
                    colorClass="text-amber-400" 
                    subtitle="Pending fees"
                />
                <div className="py-1 px-1.5 flex flex-col justify-center space-y-0.5 text-[10px] shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-500">Events:</span>
                        <span className="font-bold text-emerald-400 font-mono">R{(metrics['Event Revenue'] || 0).toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-500">Rentals:</span>
                        <span className="font-bold text-blue-400 font-mono">R{(metrics['Rental Revenue'] || 0).toFixed(0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-500">Retail:</span>
                        <span className="font-bold text-amber-400 font-mono">R{(metrics['Retail Revenue'] || 0).toFixed(0)}</span>
                    </div>
                </div>
            </div>

            {/* View Mode Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-1">
                <div className="flex items-center gap-3 flex-wrap text-xs">
                    <button
                        onClick={() => setViewCategory('all')}
                        className={`py-1 transition-colors font-bold ${
                            viewCategory === 'all'
                                ? 'text-white border-b-2 border-red-500'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        All Transactions ({transactions.length})
                    </button>
                    <button
                        onClick={() => setViewCategory('expenses')}
                        className={`py-1 transition-colors font-bold flex items-center gap-1.5 ${
                            viewCategory === 'expenses'
                                ? 'text-red-400 border-b-2 border-red-500'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Business Expenses ({metrics.expenseCount})</span>
                    </button>
                    <button
                        onClick={() => setViewCategory('profits')}
                        className={`py-1 transition-colors font-bold flex items-center gap-1.5 ${
                            viewCategory === 'profits'
                                ? 'text-emerald-400 border-b-2 border-emerald-500'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <ArrowTrendingUpIcon className="w-3.5 h-3.5" />
                        <span>Profits & Returns ({metrics.profitsCount})</span>
                    </button>
                    <button
                        onClick={() => setViewCategory('revenue')}
                        className={`py-1 transition-colors font-bold ${
                            viewCategory === 'revenue'
                                ? 'text-emerald-400 border-b-2 border-emerald-500'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        Revenue Streams
                    </button>
                    <button
                        onClick={() => setViewCategory('growth')}
                        className={`py-1 transition-colors font-bold flex items-center gap-1.5 ${
                            viewCategory === 'growth'
                                ? 'text-cyan-400 border-b-2 border-cyan-400'
                                : 'text-zinc-400 hover:text-white'
                        }`}
                    >
                        <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Growth & Comparison Tool</span>
                    </button>
                </div>

                {/* Search Field */}
                <div className="relative w-full sm:w-56">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search item, vendor, category..."
                        className="w-full bg-zinc-900 border border-zinc-800 pl-2.5 pr-7 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>

            {/* DEDICATED VIEW: GROWTH & MULTI-PERIOD COMPARISON ENGINE */}
            {viewCategory === 'growth' && (
                <FinanceGrowthComparison transactions={transactions} />
            )}

            {/* STANDARD VIEWS: CHARTS + SIDE-BY-SIDE BUSINESS CARDS */}
            {viewCategory !== 'growth' && (
                <div className="space-y-4">
                    {/* Revenue Trend Visualizer Header Bar (when in Revenue or All) */}
                    {(viewCategory === 'all' || viewCategory === 'revenue') && (
                        <div className="p-3 bg-zinc-950 border border-zinc-800/80 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                                    <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-emerald-400"/> Revenue Velocity Trend
                                </span>
                                <div className="flex gap-2 text-[9px]">
                                    <span className="flex items-center gap-1 text-zinc-400"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Event</span>
                                    <span className="flex items-center gap-1 text-zinc-400"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Rental</span>
                                    <span className="flex items-center gap-1 text-zinc-400"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Retail</span>
                                </div>
                            </div>
                            <BarChart data={chartData} />
                            <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                                <span>Gross Inflow: <strong className="text-emerald-400 font-mono">R{metrics.totalRevenue.toFixed(0)}</strong></span>
                                <span>Deductions: <strong className="text-red-400 font-mono">-R{metrics.expenses.toFixed(0)}</strong></span>
                                <span>Period Net: <strong className={`font-mono ${metrics.netProfit >= 0 ? 'text-white' : 'text-red-400'}`}>R{metrics.netProfit.toFixed(0)}</strong></span>
                            </div>
                        </div>
                    )}

                    {/* Records Section Header */}
                    <div className="flex items-center justify-between pb-1 border-b border-zinc-800/60">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-zinc-400" />
                            {viewCategory === 'expenses' ? 'Business Expense Vouchers' : viewCategory === 'profits' ? 'Profits & ROI Returns Records' : 'Ledger Entries'} ({filteredTransactions.length})
                        </span>

                        <div className="flex items-center gap-2">
                            {viewCategory === 'expenses' && (
                                <button
                                    onClick={handleOpenNewExpense}
                                    className="text-[11px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Log Expense
                                </button>
                            )}
                            {viewCategory === 'profits' && (
                                <button
                                    onClick={handleOpenNewProfit}
                                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Log Profit
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Empty State */}
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-12 px-4 bg-zinc-950/60 border border-zinc-800/80 text-zinc-500 space-y-2">
                            <Receipt className="w-8 h-8 text-zinc-600 mx-auto" />
                            <p className="text-xs text-zinc-300 font-bold">No records found matching current category or filters</p>
                            <p className="text-[10px] text-zinc-500 max-w-sm mx-auto">
                                {viewCategory === 'profits' 
                                    ? 'No profits/returns recorded for this selection. Click "Log Profit" to record asset markup or return.' 
                                    : 'Adjust the timeframe/category or log a new business expense above.'}
                            </p>
                            <div className="pt-2 flex items-center justify-center gap-2">
                                {viewCategory === 'expenses' && (
                                    <Button variant="danger" size="sm" onClick={handleOpenNewExpense}>
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add Business Expense
                                    </Button>
                                )}
                                {viewCategory === 'profits' && (
                                    <Button variant="secondary" size="sm" onClick={handleOpenNewProfit} className="!bg-emerald-950 !text-emerald-300 !border-emerald-500/50">
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Record Profit Inflow
                                    </Button>
                                )}
                            </div>
                        </div>
                    ) : layoutMode === 'cards' ? (
                        /* SIDE-BY-SIDE BUSINESS CARD CONCEPT GRID */
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 items-stretch">
                            {[...filteredTransactions].reverse().map(t => (
                                <BusinessCardTransaction
                                    key={t.id}
                                    transaction={t}
                                    players={players}
                                    onInspect={item => setInspectingExpense(item)}
                                    onEditExpense={item => handleOpenEditExpense(item)}
                                    onEditProfit={item => handleOpenEditProfit(item)}
                                    onDelete={item => handleDeleteExpense(item)}
                                />
                            ))}
                        </div>
                    ) : (
                        /* COMPACT LINEAR TABLE ROW VIEW */
                        <div className="bg-zinc-950 border border-zinc-800 divide-y divide-zinc-800/60">
                            {[...filteredTransactions].reverse().map(t => {
                                const isExp = t.type === 'Expense';
                                const isProf = Boolean(t.profitMade && Number(t.profitMade) > 0);
                                const hasSlip = Boolean(t.receiptImageUrl && t.receiptImageUrl.trim() !== '');

                                return (
                                    <div key={t.id} className="p-2.5 flex items-center justify-between hover:bg-zinc-900/40 transition-colors gap-2">
                                        <div className="min-w-0 flex-1 space-y-0.5">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className={`px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase ${
                                                    isProf ? 'bg-emerald-950 text-emerald-400' : isExp ? 'bg-red-950 text-red-400' : 'bg-blue-950 text-blue-400'
                                                }`}>
                                                    {isProf ? 'PROFIT' : isExp ? 'EXPENSE' : (t.type || 'REVENUE')}
                                                </span>
                                                <span className="text-[10px] text-zinc-400 font-bold">{t.category}</span>
                                                {hasSlip && (
                                                    <span className="text-[9px] text-amber-300 bg-amber-950/70 px-1 py-0.2 font-mono">Slip Attached</span>
                                                )}
                                            </div>
                                            <p className="text-xs font-bold text-white truncate">{t.profitName || t.expenseName || t.description}</p>
                                            <p className="text-[10px] text-zinc-500 font-mono">
                                                {new Date(t.date || t.profitDate || Date.now()).toLocaleDateString()} &bull; {t.paidTo || 'Arena'} &bull; {t.paymentMethod || 'EFT'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className={`font-mono font-black text-sm ${!isExp || isProf ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {!isExp || isProf ? '+' : '-'}R{(isProf ? Number(t.profitMade) : Number(t.amount || 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => setInspectingExpense(t)} className="p-1 text-zinc-400 hover:text-white" title="Inspect">
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if (isProf) handleOpenEditProfit(t);
                                                        else handleOpenEditExpense(t);
                                                    }} 
                                                    className="p-1 text-zinc-400 hover:text-white" 
                                                    title="Edit"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => handleDeleteExpense(t)} className="p-1 text-zinc-500 hover:text-red-400" title="Delete">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 1: STRICTLY DEDICATED BUSINESS EXPENSE POPUP        */}
            {/* ========================================================= */}
            <Modal
                isOpen={isExpenseModalOpen}
                onClose={() => {
                    setIsExpenseModalOpen(false);
                    resetExpenseForm();
                }}
                title={editingExpense ? 'Edit Business Expense' : 'Log Business Expense & Upload Slip'}
                maxWidth="4xl"
            >
                {(() => {
                    const pricePaidNum = parseFloat(expenseFormData.pricePaid) || 0;

                    return (
                        <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
                            {/* SIDE-BY-SIDE 3D SQUARE CONTAINERS (NO OUTLINE) */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch">
                                {/* CONTAINER 1: EXPENSE PARAMETERS & VALUATION */}
                                <div className="bg-gradient-to-b from-zinc-800/95 via-zinc-850 to-zinc-900 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.85),0_6px_16px_-4px_rgba(0,0,0,0.6)] rounded-none border-0 p-3.5 flex flex-col justify-between space-y-3">
                                    <div className="space-y-3">
                                        {/* Container 3D Header */}
                                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-red-500 rounded-none shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                                <span className="font-mono text-[11px] font-black uppercase tracking-wider text-zinc-200">
                                                    01. Expense Parameters & Valuation
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-zinc-400 font-mono">Outflow Voucher</span>
                                        </div>

                                        {/* Quick Tactical Presets */}
                                        {!editingExpense && (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                                        <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Presets:
                                                    </span>
                                                    <span className="text-[9px] text-zinc-500 font-mono">1-tap autofill</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                                                    {QUICK_PRESETS.slice(0, 6).map((preset, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => handleSelectPreset(preset)}
                                                            className="px-2 py-0.5 rounded-none border-0 bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 hover:text-white text-[9px] font-medium shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.5)] transition-all active:translate-y-[1px]"
                                                        >
                                                            {preset.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Expense Name & Price Paid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                            <div className="sm:col-span-8 space-y-1">
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                                                    Expense Item / Description *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={expenseFormData.expenseName}
                                                    onChange={e => setExpenseFormData(prev => ({ ...prev, expenseName: e.target.value }))}
                                                    placeholder="e.g. 50L Diesel Generator Refill, Chrono Batteries"
                                                    className="w-full bg-zinc-950 text-white placeholder-zinc-500 text-xs px-2.5 py-1.5 rounded-none border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-1 focus:ring-red-500/70 transition-all"
                                                    required
                                                />
                                            </div>
                                            <div className="sm:col-span-4 space-y-1">
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                                                    Cost (ZAR) *
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-red-400">R</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        value={expenseFormData.pricePaid}
                                                        onChange={e => setExpenseFormData(prev => ({ ...prev, pricePaid: e.target.value }))}
                                                        placeholder="0.00"
                                                        className="w-full pl-6 pr-2 py-1.5 bg-zinc-950 text-white text-xs font-mono font-bold rounded-none border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-1 focus:ring-red-500/70 text-right transition-all"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Business Justification */}
                                        <div className="space-y-1">
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                                                Operational Reason / Purpose *
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={expenseFormData.expenseReason}
                                                onChange={e => setExpenseFormData(prev => ({ ...prev, expenseReason: e.target.value }))}
                                                placeholder="Why was this business expense incurred? (e.g. Fuel replenishment for spotlights & floodlights)"
                                                className="w-full bg-zinc-950 text-white placeholder-zinc-500 text-xs p-2 rounded-none border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-1 focus:ring-red-500/70 transition-all resize-none"
                                                required
                                            />
                                        </div>

                                        {/* Category, Payment Method & Vendor */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <div className="space-y-1">
                                                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                                    Category
                                                </label>
                                                <select
                                                    value={expenseFormData.category}
                                                    onChange={e => setExpenseFormData(prev => ({ ...prev, category: e.target.value }))}
                                                    className="w-full bg-zinc-950 text-white text-xs px-2 py-1.5 rounded-none border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-1 focus:ring-red-500/70"
                                                >
                                                    {EXPENSE_CATEGORIES.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                                    Payment Method
                                                </label>
                                                <select
                                                    value={expenseFormData.paymentMethod}
                                                    onChange={e => setExpenseFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                                    className="w-full bg-zinc-950 text-white text-xs px-2 py-1.5 rounded-none border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-1 focus:ring-red-500/70"
                                                >
                                                    <option value="EFT">EFT / Wire</option>
                                                    <option value="Card">Card / POS</option>
                                                    <option value="Cash">Cash at Field</option>
                                                    <option value="Petty Cash">Petty Cash</option>
                                                    <option value="Company Account">Company Card</option>
                                                </select>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                                    Paid To / Vendor
                                                </label>
                                                <input
                                                    type="text"
                                                    value={expenseFormData.paidTo}
                                                    onChange={e => setExpenseFormData(prev => ({ ...prev, paidTo: e.target.value }))}
                                                    placeholder="e.g. BP Garage, Makro"
                                                    className="w-full bg-zinc-950 text-white placeholder-zinc-500 text-xs px-2 py-1.5 rounded-none border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-1 focus:ring-red-500/70"
                                                />
                                            </div>
                                        </div>

                                        {/* Date & Slip Reference */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                                    Expense Date *
                                                </label>
                                                <input
                                                    type="date"
                                                    value={expenseFormData.date}
                                                    onChange={e => setExpenseFormData(prev => ({ ...prev, date: e.target.value }))}
                                                    className="w-full bg-zinc-950 text-white text-xs px-2 py-1.5 rounded-none border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-1 focus:ring-red-500/70"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                                    Receipt / Slip Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={expenseFormData.notes}
                                                    onChange={e => setExpenseFormData(prev => ({ ...prev, notes: e.target.value }))}
                                                    placeholder="e.g. INV-98124 or Slip #4012"
                                                    className="w-full bg-zinc-950 text-white placeholder-zinc-500 text-xs px-2 py-1.5 rounded-none border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-1 focus:ring-red-500/70"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CONTAINER 2: SLIP AUDIT & PROOF OF PAYMENT UPLOAD */}
                                <div className="bg-gradient-to-b from-zinc-800/95 via-zinc-850 to-zinc-900 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.85),0_6px_16px_-4px_rgba(0,0,0,0.6)] rounded-none border-0 p-3.5 flex flex-col justify-between space-y-3">
                                    <div className="space-y-3">
                                        {/* Container 3D Header */}
                                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-amber-400 rounded-none shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                                                <span className="font-mono text-[11px] font-black uppercase tracking-wider text-zinc-200">
                                                    02. Slip Audit & Verification Document
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-zinc-400 font-mono">Proof of Payment</span>
                                        </div>

                                        {/* 3D SQUARE SUB-PANEL: RECEIPT / SLIP PHOTO */}
                                        <div className="bg-zinc-950/90 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] rounded-none border-0 p-2.5 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-200 flex items-center gap-1.5">
                                                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                                                    <span>Slip / Invoice Attachment</span>
                                                </span>
                                                <span className="text-[9px] text-zinc-500 font-mono">Image or URL</span>
                                            </div>

                                            <UrlOrUploadField
                                                label=""
                                                value={expenseFormData.receiptImageUrl}
                                                onChange={(url) => setExpenseFormData(prev => ({ ...prev, receiptImageUrl: url }))}
                                                onRemove={() => setExpenseFormData(prev => ({ ...prev, receiptImageUrl: '' }))}
                                                placeholder="Paste slip image URL or click to upload..."
                                            />

                                            {expenseFormData.receiptImageUrl ? (
                                                <div className="p-2 bg-zinc-900 rounded-none border-0 shadow-[0_4px_10px_rgba(0,0,0,0.6)] flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <img 
                                                            src={expenseFormData.receiptImageUrl} 
                                                            alt="Uploaded slip thumbnail" 
                                                            className="w-10 h-10 object-cover rounded-none shadow-md" 
                                                        />
                                                        <div>
                                                            <p className="font-bold text-white text-[11px]">Slip attached successfully</p>
                                                            <p className="text-[9px] text-emerald-400 font-mono">Verified for financial ledger audit</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpenseFormData(prev => ({ ...prev, receiptImageUrl: '' }))}
                                                        className="text-red-400 hover:text-red-300 text-[10px] font-bold px-2 py-1 rounded-none bg-red-950/40 hover:bg-red-950/70 transition-colors"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="p-3 border border-dashed border-zinc-800 text-center text-zinc-500 text-[10px]">
                                                    Optional: Uploading slip photo stores digital proof of purchase on the permanent transaction record.
                                                </div>
                                            )}
                                        </div>

                                        {/* Ledger Info Note */}
                                        <div className="p-2.5 bg-zinc-950/70 border border-zinc-800/80 text-[10px] text-zinc-400 space-y-1">
                                            <p className="font-bold text-zinc-200 flex items-center gap-1">
                                                <Scale className="w-3.5 h-3.5 text-zinc-400" />
                                                Independent Expense Outflow
                                            </p>
                                            <p className="text-[9px] text-zinc-500 leading-relaxed">
                                                This expense is recorded directly against company operational costs. To record profits or returns from item resale, use the dedicated "Log Profit" flow.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* STICKY BOTTOM ACTION STRIP (ALWAYS REACHABLE) */}
                            <div className="sticky bottom-0 bg-zinc-900/95 -mx-3 -mb-3 sm:-mx-5 sm:-mb-5 p-3 sm:p-4 border-t border-zinc-800 backdrop-blur-md z-20 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-2xl">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-zinc-400 font-mono">Recorded Outflow:</span>
                                    <span className="px-2 py-0.5 rounded-none bg-red-950/60 text-red-300 font-mono font-bold text-xs shadow-inner">
                                        -R{pricePaidNum.toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsExpenseModalOpen(false);
                                            resetExpenseForm();
                                        }}
                                        className="px-3.5 py-1.5 rounded-none border-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all shadow-md active:translate-y-[1px]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-5 py-1.5 rounded-none border-0 bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-[0_4px_14px_rgba(239,68,68,0.4)] flex items-center gap-1.5 active:translate-y-[1px]"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>{isSaving ? 'Saving...' : (editingExpense ? 'Update Expense' : 'Save & Sync Expense')}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    );
                })()}
            </Modal>

            {/* ========================================================= */}
            {/* MODAL 2: STRICTLY DEDICATED PROFIT & RETURNS POPUP        */}
            {/* ========================================================= */}
            <Modal
                isOpen={isProfitModalOpen}
                onClose={() => {
                    setIsProfitModalOpen(false);
                    resetProfitForm();
                }}
                title={editingProfit ? 'Edit Profit & Returns Entry' : 'Log Profit & Revenue Return'}
                maxWidth="4xl"
            >
                {(() => {
                    const grossInflow = parseFloat(profitFormData.profitMade) || 0;
                    const sourceCost = parseFloat(profitFormData.sourceCost) || 0;
                    const netMargin = grossInflow - sourceCost;
                    const marginPercent = sourceCost > 0
                        ? ((netMargin / sourceCost) * 100).toFixed(1)
                        : (grossInflow > 0 ? '100.0' : '0.0');

                    return (
                        <form onSubmit={handleSaveProfit} className="space-y-4 text-xs">
                            {/* SIDE-BY-SIDE 3D SQUARE CONTAINERS (NO OUTLINE) */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 items-stretch">
                                {/* CONTAINER 1: REVENUE INFLOW & SOURCE */}
                                <div className="bg-gradient-to-b from-zinc-800/95 via-zinc-850 to-zinc-900 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.85),0_6px_16px_-4px_rgba(0,0,0,0.6)] rounded-none border-0 p-3.5 flex flex-col justify-between space-y-3">
                                    <div className="space-y-3">
                                        {/* Container 3D Header */}
                                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-emerald-400 rounded-none shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                                                <span className="font-mono text-[11px] font-black uppercase tracking-wider text-zinc-200">
                                                    01. Revenue Inflow & Return Source
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-zinc-400 font-mono">Realized Return</span>
                                        </div>

                                        {/* Quick Profit Presets */}
                                        {!editingProfit && (
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                                        <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> Presets:
                                                    </span>
                                                    <span className="text-[9px] text-zinc-500 font-mono">1-tap autofill</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                                                    {PROFIT_PRESETS.slice(0, 6).map((preset, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => handleSelectProfitPreset(preset)}
                                                            className="px-2 py-0.5 rounded-none border-0 bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300 hover:text-white text-[9px] font-medium shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),0_2px_4px_rgba(0,0,0,0.5)] transition-all active:translate-y-[1px]"
                                                        >
                                                            {preset.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Profit Name & Profit Amount */}
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                            <div className="sm:col-span-8 space-y-1">
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                                                    Profit / Return Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profitFormData.profitName}
                                                    onChange={e => setProfitFormData(prev => ({ ...prev, profitName: e.target.value }))}
                                                    placeholder="e.g. Bulk BB Resale Profit, Gear Resale Return"
                                                    className="w-full bg-zinc-950 text-white placeholder-zinc-500 text-xs px-2.5 py-1.5 rounded-none border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-1 focus:ring-emerald-500/70 transition-all"
                                                    required
                                                />
                                            </div>
                                            <div className="sm:col-span-4 space-y-1">
                                                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                                                    Profit (ZAR) *
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-emerald-400">R</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        value={profitFormData.profitMade}
                                                        onChange={e => setProfitFormData(prev => ({ ...prev, profitMade: e.target.value }))}
                                                        placeholder="0.00"
                                                        className="w-full pl-6 pr-2 py-1.5 bg-zinc-950 text-white text-xs font-mono font-bold rounded-none border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-1 focus:ring-emerald-500/70 text-right transition-all"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Profit Reason & Category */}
                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                            <div className="sm:col-span-7 space-y-1">
                                                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-300">
                                                    Reason / Origin Description
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profitFormData.profitReason}
                                                    onChange={e => setProfitFormData(prev => ({ ...prev, profitReason: e.target.value }))}
                                                    placeholder="e.g. Realized margin from weekend 0.25g bio-BB ammo"
                                                    className="w-full bg-zinc-950 text-white placeholder-zinc-500 text-xs px-2 py-1.5 rounded-none border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-1 focus:ring-emerald-500/70"
                                                />
                                            </div>

                                            <div className="sm:col-span-5 space-y-1">
                                                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-300">
                                                    Category
                                                </label>
                                                <select
                                                    value={profitFormData.category}
                                                    onChange={e => setProfitFormData(prev => ({ ...prev, category: e.target.value }))}
                                                    className="w-full bg-zinc-950 text-white text-xs px-2 py-1.5 rounded-none border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-1 focus:ring-emerald-500/70"
                                                >
                                                    {PROFIT_CATEGORIES.map(cat => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Inflow Method, Vendor/Payer & Date */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <div className="space-y-1">
                                                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                                    Inflow Method
                                                </label>
                                                <select
                                                    value={profitFormData.paymentMethod}
                                                    onChange={e => setProfitFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                                    className="w-full bg-zinc-950 text-white text-xs px-2 py-1.5 rounded-none border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-1 focus:ring-emerald-500/70"
                                                >
                                                    <option value="EFT">EFT / Wire</option>
                                                    <option value="Cash">Cash at Field</option>
                                                    <option value="Card">Card / POS</option>
                                                    <option value="SnapScan">SnapScan / QR</option>
                                                </select>
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                                    Vendor / Payer
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profitFormData.paidTo}
                                                    onChange={e => setProfitFormData(prev => ({ ...prev, paidTo: e.target.value }))}
                                                    placeholder="e.g. Counter, Player"
                                                    className="w-full bg-zinc-950 text-white placeholder-zinc-500 text-xs px-2 py-1.5 rounded-none border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-1 focus:ring-emerald-500/70"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                                    Realization Date *
                                                </label>
                                                <input
                                                    type="date"
                                                    value={profitFormData.date}
                                                    onChange={e => setProfitFormData(prev => ({ ...prev, date: e.target.value }))}
                                                    className="w-full bg-zinc-950 text-white text-xs px-2 py-1.5 rounded-none border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-1 focus:ring-emerald-500/70"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Internal Reference / Notes */}
                                        <div className="space-y-1">
                                            <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                                Internal Reference / Batch Notes
                                            </label>
                                            <input
                                                type="text"
                                                value={profitFormData.notes}
                                                onChange={e => setProfitFormData(prev => ({ ...prev, notes: e.target.value }))}
                                                placeholder="e.g. Batch #42 surplus reconciliation"
                                                className="w-full bg-zinc-950 text-white placeholder-zinc-500 text-xs px-2.5 py-1.5 rounded-none border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-1 focus:ring-emerald-500/70"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* CONTAINER 2: ASSET COGS COST BASIS & LIVE 3D MARGIN AUDIT */}
                                <div className="bg-gradient-to-b from-zinc-800/95 via-zinc-850 to-zinc-900 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.85),0_6px_16px_-4px_rgba(0,0,0,0.6)] rounded-none border-0 p-3.5 flex flex-col justify-between space-y-3">
                                    <div className="space-y-3">
                                        {/* Container 3D Header */}
                                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-cyan-400 rounded-none shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                                                <span className="font-mono text-[11px] font-black uppercase tracking-wider text-zinc-200">
                                                    02. Asset Cost & 3D Margin Audit
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-zinc-400 font-mono">COGS & Margin</span>
                                        </div>

                                        {/* 3D SQUARE SUB-PANEL: ORIGINATING ASSET / UNDERLYING COST */}
                                        <div className="bg-zinc-950/90 shadow-[inset_0_2px_6px_rgba(0,0,0,0.9)] rounded-none border-0 p-2.5 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                                                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                                                    <span>Originating Asset / COGS (Optional)</span>
                                                </span>
                                                <span className="text-[9px] text-zinc-500 font-mono">Cost Basis</span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                                                <div className="sm:col-span-7 space-y-1">
                                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                                        Source Item / Purchase Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={profitFormData.sourceExpenseName}
                                                        onChange={e => setProfitFormData(prev => ({ ...prev, sourceExpenseName: e.target.value }))}
                                                        placeholder="e.g. Bio-BB 0.25g Bulk Restock"
                                                        className="w-full bg-zinc-950 text-white placeholder-zinc-500 text-xs px-2 py-1.5 rounded-none border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-1 focus:ring-cyan-500/70"
                                                    />
                                                </div>

                                                <div className="sm:col-span-5 space-y-1">
                                                    <label className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                                                        Cost Price (ZAR)
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-zinc-500">R</span>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            value={profitFormData.sourceCost}
                                                            onChange={e => setProfitFormData(prev => ({ ...prev, sourceCost: e.target.value }))}
                                                            placeholder="0.00"
                                                            className="w-full pl-6 pr-2 py-1.5 bg-zinc-950 text-white text-xs font-mono font-bold rounded-none border-0 shadow-[inset_0_2px_4px_rgba(0,0,0,0.85)] focus:outline-none focus:ring-1 focus:ring-cyan-500/70 text-right"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 3D SQUARE SUB-PANEL: LIVE 3D METRIC CUBE */}
                                        <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-black shadow-[0_8px_20px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.06)] rounded-none border-0 p-3 space-y-2.5">
                                            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
                                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span>Live 3D Financial Return Metric</span>
                                                </span>
                                                <span className="text-[9px] text-zinc-400 font-mono">Real-time P&L</span>
                                            </div>

                                            {/* 4-Block Metric Matrix */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-center">
                                                <div className="p-2 bg-zinc-950/80 rounded-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
                                                    <span className="block text-[8px] font-bold uppercase tracking-wider text-zinc-400">Gross Return</span>
                                                    <span className="font-mono font-black text-xs text-white">R{grossInflow.toFixed(2)}</span>
                                                </div>
                                                <div className="p-2 bg-zinc-950/80 rounded-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
                                                    <span className="block text-[8px] font-bold uppercase tracking-wider text-zinc-400">COGS Cost</span>
                                                    <span className="font-mono font-bold text-xs text-red-400">R{sourceCost.toFixed(2)}</span>
                                                </div>
                                                <div className="p-2 bg-zinc-950/80 rounded-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
                                                    <span className="block text-[8px] font-bold uppercase tracking-wider text-zinc-400">Net Profit</span>
                                                    <span className={`font-mono font-black text-xs ${netMargin >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                        R{netMargin.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="p-2 bg-zinc-950/80 rounded-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
                                                    <span className="block text-[8px] font-bold uppercase tracking-wider text-zinc-400">Markup / ROI</span>
                                                    <span className="font-mono font-black text-xs text-cyan-300">
                                                        {sourceCost > 0 ? `+${marginPercent}%` : (grossInflow > 0 ? '100% Inflow' : '0%')}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Performance Tier Pill */}
                                            <div className="p-2 bg-zinc-950/90 rounded-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.9)] flex items-center justify-between text-[10px]">
                                                <span className="text-zinc-400 font-mono">Performance Tier:</span>
                                                <span className="font-bold text-emerald-400 font-mono">
                                                    {grossInflow === 0 
                                                        ? 'Awaiting amount...' 
                                                        : sourceCost === 0 
                                                            ? '⚡ 100% Direct Cash Return (No Cost Basis)' 
                                                            : netMargin > 0 
                                                                ? `💎 High-Yield Resale Return (+${marginPercent}%)` 
                                                                : netMargin === 0 
                                                                    ? '⚖️ Break-Even Return' 
                                                                    : '⚠️ Negative Margin Incurred'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* STICKY BOTTOM ACTION STRIP (ALWAYS REACHABLE) */}
                            <div className="sticky bottom-0 bg-zinc-900/95 -mx-3 -mb-3 sm:-mx-5 sm:-mb-5 p-3 sm:p-4 border-t border-zinc-800 backdrop-blur-md z-20 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-2xl">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-zinc-400 font-mono">Net Profit Addition:</span>
                                    <span className="px-2 py-0.5 rounded-none bg-emerald-950/60 text-emerald-300 font-mono font-bold text-xs shadow-inner">
                                        +R{netMargin.toFixed(2)}
                                    </span>
                                    {sourceCost > 0 && (
                                        <span className="text-[9px] text-zinc-400 font-mono">
                                            (After R{sourceCost.toFixed(2)} cost basis)
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsProfitModalOpen(false);
                                            resetProfitForm();
                                        }}
                                        className="px-3.5 py-1.5 rounded-none border-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all shadow-md active:translate-y-[1px]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="px-5 py-1.5 rounded-none border-0 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-[0_4px_14px_rgba(16,185,129,0.4)] flex items-center gap-1.5 active:translate-y-[1px]"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        <span>{isSaving ? 'Saving...' : (editingProfit ? 'Update Profit Entry' : 'Save & Record Profit')}</span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    );
                })()}
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
                    <div className="space-y-4 text-xs">
                        {/* Header details */}
                        <div className="p-3 rounded-none bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                                    inspectingExpense.profitMade && Number(inspectingExpense.profitMade) > 0
                                        ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                                        : 'bg-red-950 text-red-400 border-red-500/30'
                                }`}>
                                    {inspectingExpense.category || 'Financial Entry'}
                                </span>
                                <h3 className="text-base font-black text-white mt-1">
                                    {inspectingExpense.profitName || inspectingExpense.expenseName || inspectingExpense.description}
                                </h3>
                                <p className="text-[11px] text-zinc-400 mt-0.5">
                                    Recorded on: {new Date(inspectingExpense.date || inspectingExpense.profitDate || Date.now()).toLocaleString()}
                                </p>
                            </div>

                            <div className="text-right sm:text-right">
                                <p className="text-[10px] text-zinc-400 uppercase font-black">
                                    {inspectingExpense.profitMade && Number(inspectingExpense.profitMade) > 0 ? 'Profit Realized' : 'Price Paid'}
                                </p>
                                <p className={`text-2xl font-mono font-black ${
                                    inspectingExpense.profitMade && Number(inspectingExpense.profitMade) > 0 ? 'text-emerald-400' : 'text-red-400'
                                }`}>
                                    {inspectingExpense.profitMade && Number(inspectingExpense.profitMade) > 0 ? '+' : '-'}R{Number(inspectingExpense.profitMade || inspectingExpense.amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </p>
                            </div>
                        </div>

                        {/* Business Reason */}
                        {(inspectingExpense.expenseReason || inspectingExpense.profitReason) && (
                            <div className="p-3 bg-zinc-900/50 border border-zinc-800">
                                <p className="text-[10px] text-zinc-400 uppercase font-black mb-1">Operational Justification / Reason</p>
                                <p className="text-zinc-200 leading-relaxed text-xs">
                                    {inspectingExpense.profitReason || inspectingExpense.expenseReason}
                                </p>
                            </div>
                        )}

                        {/* Key Attributes Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                            <div className="p-2 bg-zinc-900 border border-zinc-800/80">
                                <span className="text-zinc-500 block text-[9px] uppercase font-bold">Payment Method</span>
                                <span className="text-white font-semibold">{inspectingExpense.paymentMethod || 'EFT'}</span>
                            </div>
                            <div className="p-2 bg-zinc-900 border border-zinc-800/80">
                                <span className="text-zinc-500 block text-[9px] uppercase font-bold">Paid To / Vendor</span>
                                <span className="text-white font-semibold">{inspectingExpense.paidTo || 'Direct / Armory'}</span>
                            </div>
                            <div className="p-2 bg-zinc-900 border border-zinc-800/80">
                                <span className="text-zinc-500 block text-[9px] uppercase font-bold">Slip Ref / Invoice</span>
                                <span className="text-white font-semibold">{inspectingExpense.notes || inspectingExpense.receiptNumber || 'None'}</span>
                            </div>
                        </div>

                        {/* Slip Image Showcase */}
                        <div className="p-3 bg-zinc-950 border border-zinc-800">
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                                    <ImageIcon className="w-4 h-4 text-amber-400" />
                                    <span>Slip / Proof of Payment Document</span>
                                </span>
                                {inspectingExpense.receiptImageUrl && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setZoomSlip(!zoomSlip)}
                                            className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1"
                                        >
                                            <ZoomIn className="w-3 h-3" /> {zoomSlip ? 'Standard View' : 'Zoom Slip'}
                                        </button>
                                        <a
                                            href={inspectingExpense.receiptImageUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[10px] text-blue-400 hover:underline"
                                        >
                                            Open Full
                                        </a>
                                    </div>
                                )}
                            </div>

                            {inspectingExpense.receiptImageUrl ? (
                                <div className={`relative overflow-hidden bg-black border border-zinc-800 flex items-center justify-center ${zoomSlip ? 'max-h-[600px]' : 'max-h-72'}`}>
                                    <img
                                        src={inspectingExpense.receiptImageUrl}
                                        alt="Expense Slip Proof"
                                        className={`w-full object-contain ${zoomSlip ? 'scale-125 transition-transform duration-200 cursor-zoom-out' : 'cursor-zoom-in'}`}
                                        onClick={() => setZoomSlip(!zoomSlip)}
                                    />
                                </div>
                            ) : (
                                <div className="py-8 px-4 text-center border border-dashed border-zinc-800 text-zinc-500">
                                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="font-semibold">No digital slip image was attached to this transaction.</p>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons (Sticky at bottom) */}
                        <div className="sticky bottom-0 bg-zinc-900/95 -mx-3 -mb-3 sm:-mx-5 sm:-mb-5 p-3 sm:p-4 border-t border-zinc-800 backdrop-blur-md z-20 flex items-center justify-between">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleDeleteExpense(inspectingExpense)}
                                className="!text-red-400 hover:!bg-red-950/40"
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                            </Button>

                            <div className="flex items-center gap-2">
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
                                >
                                    <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit Details
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                        window.print();
                                    }}
                                >
                                    <PrinterIcon className="w-3.5 h-3.5 mr-1" /> Print Voucher
                                </Button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* ========================================================= */}
            {/* MODAL 4: SUPABASE LIVE SYNC SQL MIGRATION SNIPPET         */}
            {/* ========================================================= */}
            <Modal
                isOpen={isSqlModalOpen}
                onClose={() => setIsSqlModalOpen(false)}
                title="Supabase Database Live Sync Migration"
                maxWidth="xl"
            >
                <div className="space-y-3 text-xs">
                    <p className="text-zinc-300">
                        Run this idempotent SQL script in your <strong>Supabase SQL Editor</strong> to ensure all table columns,
                        slip image fields, RLS security policies, and <strong>Supabase Realtime Live Sync</strong> are fully synchronized:
                    </p>

                    <div className="relative">
                        <pre className="p-3 bg-black border border-zinc-800 text-[11px] font-mono text-zinc-300 max-h-72 overflow-y-auto whitespace-pre-wrap">
                            {BUSINESS_EXPENSES_SQL_SCHEMA}
                        </pre>
                        <button
                            onClick={handleCopySql}
                            className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1.5 border border-zinc-700 transition-colors shadow"
                        >
                            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
                        </button>
                    </div>

                    <div className="p-2.5 bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                            <Database className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>Script enables <code>expenseName</code>, <code>expenseReason</code>, <code>receiptImageUrl</code> & Realtime publication.</span>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => setIsSqlModalOpen(false)}>
                            Close
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
