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
    CheckCircle2
} from 'lucide-react';

type TimeFilter = 'day' | 'week' | 'month' | '90days' | 'all';
type ViewCategory = 'all' | 'revenue' | 'expenses' | 'profits';

const EXPENSE_CATEGORIES = [
    'Fuel & Power Generation',
    'Field Maintenance & Props',
    'Tactical BBs & Ammo Restock',
    'Safety, First Aid & Protection',
    'Staff & Marshal Compensation',
    'Canteen, Water & Refreshments',
    'Radios, Chrono & Comms',
    'Rental Gear Repair & Spares',
    'Facility Rent & Permits',
    'Marketing, Media & Badges',
    'General Operating Expense'
];

const QUICK_PRESETS = [
    { name: 'Generator Fuel (Diesel)', category: 'Fuel & Power Generation', reason: 'Fuel refill for field generator & floodlights' },
    { name: 'Bio-BB 0.25g Bulk Carton', category: 'Tactical BBs & Ammo Restock', reason: 'Replenish arena bio-BB inventory' },
    { name: 'Trauma Kit & First Aid Restock', category: 'Safety, First Aid & Protection', reason: 'Safety compliance & emergency eyewash refills' },
    { name: 'Field Netting & Camo Repair', category: 'Field Maintenance & Props', reason: 'Mending boundary safety netting & arena barricades' },
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
    { name: 'Surplus Weapon / Gear Resale', sourceName: 'Tactical Gear Restock', category: 'Equipment Resale', reason: 'Profit margin from player second-hand armory consignment' },
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
    const [playerFilter, setPlayerFilter] = useState<string>('all');
    const [eventFilter, setEventFilter] = useState<string>('all');
    const [locationFilter, setLocationFilter] = useState<string>('all');
    const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');
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
    const [isPrintingVoucher, setIsPrintingVoucher] = useState(false);

    // Form state
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
        profitMade: '',
        profitName: '',
        profitReason: '',
        profitDate: new Date().toISOString().slice(0, 10),
    });

    // Profit Entry Form State (Independent Entity)
    const [profitFormData, setProfitFormData] = useState({
        profitName: '',
        profitReason: '',
        profitMade: '',
        date: new Date().toISOString().slice(0, 10),
        sourceExpenseName: '',
        sourceCost: '',
        category: 'Resale & Equipment Profit',
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
            profitMade: '',
            profitName: '',
            profitReason: '',
            profitDate: new Date().toISOString().slice(0, 10),
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
            category: 'Resale & Equipment Profit',
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
            profitMade: expense.profitMade ? String(expense.profitMade) : '',
            profitName: expense.profitName || '',
            profitReason: expense.profitReason || '',
            profitDate: expense.profitDate ? expense.profitDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
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
            category: item.category || 'Resale & Equipment Profit',
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
            alert('Please enter an expense name.');
            return;
        }
        const numericAmount = parseFloat(String(expenseFormData.pricePaid));
        if (isNaN(numericAmount) || numericAmount <= 0) {
            alert('Please enter a valid price paid (amount greater than 0).');
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
                category: expenseFormData.category || 'Business Expense',
                paymentMethod: expenseFormData.paymentMethod || 'EFT',
                paidTo: expenseFormData.paidTo.trim(),
                receiptImageUrl: expenseFormData.receiptImageUrl.trim(),
                notes: expenseFormData.notes.trim(),
                profitMade: expenseFormData.profitMade ? parseFloat(expenseFormData.profitMade) : 0,
                profitName: expenseFormData.profitName.trim(),
                profitReason: expenseFormData.profitReason.trim(),
                profitDate: expenseFormData.profitDate 
                    ? (expenseFormData.profitDate.includes('T') ? expenseFormData.profitDate : `${expenseFormData.profitDate}T12:00:00Z`) 
                    : '',
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
            alert('Please enter a profit or income name.');
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
                amount: parsedSourceCost, // Optional source cost baseline
                date: realizationDate,
                type: 'Expense', // Kept in ledger structure so it appears seamlessly in finance records
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
        if (!window.confirm(`Permanently remove business expense "${expense.expenseName || expense.description}" (R${expense.amount.toFixed(0)}) from the financial ledger?`)) {
            return;
        }
        try {
            if (deleteDoc) {
                await deleteDoc('transactions', expense.id);
            }
            if (inspectingExpense?.id === expense.id) {
                setInspectingExpense(null);
            }
            setStatusBanner(`Expense removed from ledger.`);
            setTimeout(() => setStatusBanner(null), 4000);
        } catch (err: any) {
            console.error('Error deleting expense:', err);
            alert(`Failed to delete expense: ${err?.message || 'Unknown error'}`);
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
            const tDate = new Date(t.date);
            if (tDate < startDate) return false;

            // View Category Filter
            if (viewCategory === 'revenue' && t.type === 'Expense') return false;
            if (viewCategory === 'expenses' && t.type !== 'Expense') return false;
            if (viewCategory === 'profits' && (!t.profitMade || Number(t.profitMade) <= 0)) return false;

            // Player and event filters
            if (playerFilter !== 'all' && t.relatedPlayerId !== playerFilter) return false;
            if (eventFilter !== 'all' && t.relatedEventId !== eventFilter) return false;
            if (eventIdsInLocation && t.relatedEventId && !eventIdsInLocation.includes(t.relatedEventId)) return false;

            // Expense Category Filter
            if (viewCategory === 'expenses' && expenseCategoryFilter !== 'all') {
                if ((t.category || 'General Operating Expense') !== expenseCategoryFilter) return false;
            }

            // Search query filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                const matchDesc = (t.description || '').toLowerCase().includes(query);
                const matchName = (t.expenseName || '').toLowerCase().includes(query);
                const matchReason = (t.expenseReason || '').toLowerCase().includes(query);
                const matchVendor = (t.paidTo || '').toLowerCase().includes(query);
                const matchReceipt = (t.receiptNumber || '').toLowerCase().includes(query);
                if (!matchDesc && !matchName && !matchReason && !matchVendor && !matchReceipt) {
                    return false;
                }
            }

            return true;
        });
    }, [timeFilter, viewCategory, playerFilter, eventFilter, locationFilter, expenseCategoryFilter, searchQuery, transactions, events, locations]);

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
            // Respect timeFilter for overall metrics
            const tDate = new Date(t.date);
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
                expenses += Number(t.amount || 0);
                expenseCount += 1;
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

            {/* Notification Banner */}
            <AnimatePresence>
                {statusBanner && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between"
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

            {/* Top Bar: Title & Actions - Shrink to fit */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-zinc-800/60">
                <div className="flex items-center gap-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                        <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider leading-tight">
                            Financial Intelligence & Ledger
                        </h2>
                        <p className="text-[10px] text-zinc-400 leading-none mt-0.5">
                            Cash flow, business expense slips, POS revenue & realtime ledger reconciliation
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Separate Expense & Profit Entry Buttons */}
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

            {/* Shrink-to-fit Filter Row - Free view borderless layout */}
            <div className="flex flex-wrap items-center gap-2 py-1">
                <select 
                    value={timeFilter} 
                    onChange={e => setTimeFilter(e.target.value as TimeFilter)} 
                    className="bg-transparent hover:bg-zinc-900 border-b border-zinc-800 focus:border-red-500 px-2 py-1 text-white text-xs focus:outline-none transition-colors"
                >
                    <option value="day" className="bg-zinc-900">Today</option>
                    <option value="week" className="bg-zinc-900">This Week</option>
                    <option value="month" className="bg-zinc-900">This Month</option>
                    <option value="90days" className="bg-zinc-900">Last 90 Days</option>
                    <option value="all" className="bg-zinc-900">All Time</option>
                </select>

                <select 
                    value={playerFilter} 
                    onChange={e => setPlayerFilter(e.target.value)} 
                    className="bg-transparent hover:bg-zinc-900 border-b border-zinc-800 focus:border-red-500 px-2 py-1 text-white text-xs focus:outline-none transition-colors"
                >
                    <option value="all" className="bg-zinc-900">All Players</option>
                    {players.map(p => <option key={p.id} value={p.id} className="bg-zinc-900">{p.name}</option>)}
                </select>

                <select 
                    value={eventFilter} 
                    onChange={e => setEventFilter(e.target.value)} 
                    className="bg-transparent hover:bg-zinc-900 border-b border-zinc-800 focus:border-red-500 px-2 py-1 text-white text-xs focus:outline-none transition-colors"
                >
                    <option value="all" className="bg-zinc-900">All Events</option>
                    {events.map(e => <option key={e.id} value={e.id} className="bg-zinc-900">{e.title}</option>)}
                </select>

                <select 
                    value={locationFilter} 
                    onChange={e => setLocationFilter(e.target.value)} 
                    className="bg-transparent hover:bg-zinc-900 border-b border-zinc-800 focus:border-red-500 px-2 py-1 text-white text-xs focus:outline-none transition-colors"
                >
                    <option value="all" className="bg-zinc-900">All Fields</option>
                    {locations.map(l => <option key={l.id} value={l.id} className="bg-zinc-900">{l.name}</option>)}
                </select>
            </div>
             
            {/* Shrink-to-fit KPI Bar - Free view layout with no box containers or outlines */}
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

            {/* View Mode Switcher: Shrink-to-fit text tabs with free-view design */}
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
                </div>

                {/* Sub-filters for Expenses & Search */}
                <div className="flex items-center gap-2">
                    {viewCategory === 'expenses' && (
                        <select
                            value={expenseCategoryFilter}
                            onChange={e => setExpenseCategoryFilter(e.target.value)}
                            className="bg-transparent hover:bg-zinc-900 border-b border-zinc-800 px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-red-500 transition-colors"
                        >
                            <option value="all" className="bg-zinc-900">All Expense Categories</option>
                            {EXPENSE_CATEGORIES.map(cat => (
                                <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>
                            ))}
                        </select>
                    )}

                    <div className="relative flex-1 sm:w-48">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search description, vendor..."
                            className="w-full bg-transparent hover:bg-zinc-900/50 border-b border-zinc-800 pl-1 pr-6 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 transition-colors"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Visualizer & Ledger Side-by-side in shrink-to-fit free view */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Revenue Trend Visualizer */}
                <div className="lg:col-span-5 py-2 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                                <ArrowTrendingUpIcon className="w-3.5 h-3.5 text-emerald-400"/> Revenue Stream Trend
                            </span>
                            <div className="flex gap-2 text-[9px]">
                                <span className="flex items-center gap-1 text-zinc-400"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Event</span>
                                <span className="flex items-center gap-1 text-zinc-400"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Rental</span>
                                <span className="flex items-center gap-1 text-zinc-400"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Retail</span>
                            </div>
                        </div>
                        <BarChart data={chartData} />
                    </div>
                    <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-400">
                        <span>Period Total: <strong className="text-emerald-400 font-mono">R{metrics.totalRevenue.toFixed(0)}</strong></span>
                        <span>Deductions: <strong className="text-red-400 font-mono">-R{metrics.expenses.toFixed(0)}</strong></span>
                        <span>Net: <strong className={`font-mono ${metrics.netProfit >= 0 ? 'text-white' : 'text-red-400'}`}>R{metrics.netProfit.toFixed(0)}</strong></span>
                    </div>
                </div>

                {/* Ledger & Transaction Feed - Free view borderless layout */}
                <div className="lg:col-span-7 py-2 flex flex-col">
                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-zinc-800/60">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-zinc-400" />
                            {viewCategory === 'expenses' ? 'Business Expense Records' : viewCategory === 'profits' ? 'Profits & ROI Returns Records' : 'Ledger Entries'} ({filteredTransactions.length})
                        </span>

                        {viewCategory === 'expenses' && (
                            <button
                                onClick={handleOpenNewExpense}
                                className="text-[10px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Log Expense
                            </button>
                        )}
                        {viewCategory === 'profits' && (
                            <button
                                onClick={handleOpenNewProfit}
                                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Log Profit
                            </button>
                        )}
                    </div>

                    <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                        {filteredTransactions.length === 0 ? (
                            <div className="text-center py-8 px-4 text-zinc-500">
                                <Receipt className="w-6 h-6 text-zinc-600 mx-auto mb-1.5" />
                                <p className="text-xs text-zinc-400 font-bold">No records found for current filters</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5">
                                    {viewCategory === 'profits' 
                                        ? 'No profits/returns logged yet. Use the "Log Profit" button above to record income or returns.' 
                                        : 'Adjust the timeframe or log a new business expense above.'}
                                </p>
                                {viewCategory === 'expenses' && (
                                    <button onClick={handleOpenNewExpense} className="mt-2 text-xs font-bold text-red-400 hover:text-red-300 inline-flex items-center gap-1">
                                        <Plus className="w-3.5 h-3.5" /> Add Business Expense
                                    </button>
                                )}
                                {viewCategory === 'profits' && (
                                    <button onClick={handleOpenNewProfit} className="mt-2 text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1">
                                        <Plus className="w-3.5 h-3.5" /> Log Profit Entry
                                    </button>
                                )}
                            </div>
                        ) : (
                            [...filteredTransactions].reverse().map(t => {
                                const isExpense = t.type === 'Expense';
                                const isProfitItem = viewCategory === 'profits' || (t.profitMade && Number(t.profitMade) > 0);
                                const player = players.find(p => p.id === t.relatedPlayerId);
                                const hasSlip = Boolean(t.receiptImageUrl && t.receiptImageUrl.trim() !== '');

                                if (viewCategory === 'profits') {
                                    return (
                                        <div 
                                            key={t.id} 
                                            className="py-2 px-1 border-b border-zinc-800/50 hover:bg-zinc-900/20 transition-all"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0 flex-1 space-y-0.5">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                                                            <ArrowTrendingUpIcon className="w-3 h-3" /> Profit
                                                        </span>
                                                        <span className="text-[10px] text-zinc-400 font-mono">
                                                            Source: {t.expenseName || t.description} {Number(t.amount || 0) > 0 ? `(Cost: R${t.amount.toFixed(0)})` : ''}
                                                        </span>
                                                    </div>

                                                    <p className="font-bold text-white text-xs">
                                                        {t.profitName || 'Resale / Return Revenue'}
                                                    </p>

                                                    {t.profitReason && (
                                                        <p className="text-[10px] text-zinc-300 italic">
                                                            "{t.profitReason}"
                                                        </p>
                                                    )}

                                                    <div className="flex items-center gap-2 text-[9px] text-zinc-500">
                                                        <span>Realized: {t.profitDate ? new Date(t.profitDate).toLocaleDateString() : new Date(t.date).toLocaleDateString()}</span>
                                                        {t.paidTo && <span>&bull; Vendor: <strong className="text-zinc-400">{t.paidTo}</strong></span>}
                                                    </div>
                                                </div>

                                                <div className="flex flex-col items-end gap-1 shrink-0">
                                                    <div className="font-mono font-black text-emerald-400 text-xs sm:text-sm">
                                                        +R{Number(t.profitMade || 0).toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => setInspectingExpense(t)}
                                                            className="p-1 hover:text-white text-zinc-400 transition-colors text-[10px]"
                                                            title="Inspect full details"
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleOpenEditProfit(t)}
                                                            className="p-1 hover:text-white text-zinc-400 transition-colors text-[10px]"
                                                            title="Edit profit entry"
                                                        >
                                                            <Edit3 className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteExpense(t)}
                                                            className="p-1 hover:text-red-400 text-zinc-500 transition-colors text-[10px]"
                                                            title="Delete profit entry"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div 
                                        key={t.id} 
                                        className="py-2 px-1 border-b border-zinc-800/40 hover:bg-zinc-900/20 transition-all"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className={`text-[9px] font-black uppercase tracking-wider ${
                                                        isExpense 
                                                            ? 'text-red-400' 
                                                            : 'text-emerald-400'
                                                    }`}>
                                                        {isExpense ? 'Expense' : (t.type || 'Revenue')}
                                                    </span>

                                                    {isExpense && t.category && (
                                                        <span className="text-[9px] text-zinc-400 font-medium truncate max-w-[150px]">
                                                            &bull; {t.category}
                                                        </span>
                                                    )}

                                                    {hasSlip && (
                                                        <button 
                                                            onClick={() => setInspectingExpense(t)}
                                                            className="inline-flex items-center gap-1 px-1 py-0.2 rounded text-[9px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 transition-colors"
                                                            title="Click to inspect uploaded slip"
                                                        >
                                                            <ImageIcon className="w-2.5 h-2.5" />
                                                            <span>Slip</span>
                                                        </button>
                                                    )}

                                                    {Boolean(t.profitMade && Number(t.profitMade) > 0) && (
                                                        <span className="text-[9px] text-emerald-400 font-bold">
                                                            (+R{Number(t.profitMade).toFixed(0)} profit)
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="font-bold text-white text-xs mt-0.5 truncate">
                                                    {t.expenseName || t.description}
                                                </p>

                                                {/* Reason / Details preview */}
                                                {t.expenseReason && (
                                                    <p className="text-[10px] text-zinc-400 italic line-clamp-1 mt-0.5">
                                                        "{t.expenseReason}"
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-2 text-[9px] text-zinc-500 mt-0.5 flex-wrap">
                                                    <span>{new Date(t.date).toLocaleDateString()}</span>
                                                    {t.paidTo && <span>&bull; Paid to: <strong className="text-zinc-400">{t.paidTo}</strong></span>}
                                                    {player && <span>&bull; Player: <strong className="text-zinc-400">{player.name}</strong></span>}
                                                    {t.paymentMethod && <span>&bull; {t.paymentMethod}</span>}
                                                </div>
                                            </div>

                                            {/* Amount & Actions */}
                                            <div className="flex flex-col items-end gap-1 shrink-0">
                                                <div className={`font-mono font-black text-xs sm:text-sm ${isExpense ? 'text-red-400' : 'text-emerald-400'}`}>
                                                    {isExpense ? '-' : '+'}R{t.amount.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}
                                                </div>

                                                <div className="flex items-center gap-1">
                                                    {isExpense && (
                                                        <>
                                                            <button
                                                                onClick={() => setInspectingExpense(t)}
                                                                className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                                                                title="Inspect expense slip & details"
                                                            >
                                                                <Eye className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleOpenEditExpense(t)}
                                                                className="p-1 text-zinc-500 hover:text-zinc-300 transition-colors"
                                                                title="Edit expense"
                                                            >
                                                                <Edit3 className="w-3 h-3" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteExpense(t)}
                                                                className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                                                                title="Delete expense"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* MODAL 1: LOG / EDIT BUSINESS EXPENSE & UPLOAD SLIP         */}
            {/* ========================================================= */}
            <Modal
                isOpen={isExpenseModalOpen}
                onClose={() => {
                    setIsExpenseModalOpen(false);
                    resetExpenseForm();
                }}
                title={editingExpense ? 'Edit Business Expense' : 'Log Business Expense & Upload Slip'}
                maxWidth="xl"
            >
                <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
                    {/* Tactical Presets (Only shown when adding new expense) */}
                    {!editingExpense && (
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-400" /> Quick Tactical Presets:
                                </span>
                                <span className="text-[9px] text-zinc-500">Tap to autofill</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                                {QUICK_PRESETS.map((preset, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelectPreset(preset)}
                                        className="px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] border border-zinc-700/60 transition-colors text-left"
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Expense Name & Price Paid */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-8">
                            <Input
                                label="Expense Name / Description *"
                                value={expenseFormData.expenseName}
                                onChange={e => setExpenseFormData(prev => ({ ...prev, expenseName: e.target.value }))}
                                placeholder="e.g. 50L Diesel Generator Refill, Chrono Batteries, Bio-BBs"
                                required
                            />
                        </div>
                        <div className="sm:col-span-4">
                            <Input
                                label="Price Paid (ZAR / R) *"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={expenseFormData.pricePaid}
                                onChange={e => setExpenseFormData(prev => ({ ...prev, pricePaid: e.target.value }))}
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    {/* Business Justification / Reason */}
                    <div>
                        <label className="block text-zinc-300 font-bold mb-1">
                            Business Justification / Reason *
                        </label>
                        <textarea
                            rows={2}
                            value={expenseFormData.expenseReason}
                            onChange={e => setExpenseFormData(prev => ({ ...prev, expenseReason: e.target.value }))}
                            placeholder="Why was this business expense incurred? (e.g. Fuel replenishment for Saturday night combat ops spotlights on Field Alpha)"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-white placeholder-zinc-500 text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                            required
                        />
                    </div>

                    {/* Category, Payment Method & Vendor */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="block text-zinc-300 font-bold mb-1">Expense Category</label>
                            <select
                                value={expenseFormData.category}
                                onChange={e => setExpenseFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                            >
                                {EXPENSE_CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-zinc-300 font-bold mb-1">Payment Method</label>
                            <select
                                value={expenseFormData.paymentMethod}
                                onChange={e => setExpenseFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                            >
                                <option value="EFT">EFT / Bank Transfer</option>
                                <option value="Card">Card / POS</option>
                                <option value="Cash">Cash</option>
                                <option value="Petty Cash">Petty Cash</option>
                                <option value="Company Account">Company Account</option>
                            </select>
                        </div>

                        <div>
                            <Input
                                label="Paid To / Vendor"
                                value={expenseFormData.paidTo}
                                onChange={e => setExpenseFormData(prev => ({ ...prev, paidTo: e.target.value }))}
                                placeholder="e.g. BP Garage, Makro, Builders"
                            />
                        </div>
                    </div>

                    {/* Date & Additional Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <Input
                                label="Date of Expense"
                                type="date"
                                value={expenseFormData.date}
                                onChange={e => setExpenseFormData(prev => ({ ...prev, date: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <Input
                                label="Receipt / Invoice Number / Slip Ref"
                                value={expenseFormData.notes}
                                onChange={e => setExpenseFormData(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="e.g. INV-98124 or Slip #4012"
                            />
                        </div>
                    </div>

                    {/* SLIP UPLOAD (OPTIONAL IMAGE OF SLIP) */}
                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                                <ImageIcon className="w-4 h-4 text-red-400" />
                                <span>Receipt / Slip Photo (Optional)</span>
                            </span>
                            <span className="text-[10px] text-zinc-400">Photo, scanned slip, or image URL</span>
                        </div>

                        <UrlOrUploadField
                            label=""
                            value={expenseFormData.receiptImageUrl}
                            onChange={(url) => setExpenseFormData(prev => ({ ...prev, receiptImageUrl: url }))}
                            onRemove={() => setExpenseFormData(prev => ({ ...prev, receiptImageUrl: '' }))}
                            placeholder="Paste slip URL or click Upload Slip to pick a photo..."
                        />

                        {expenseFormData.receiptImageUrl && (
                            <div className="mt-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <img 
                                        src={expenseFormData.receiptImageUrl} 
                                        alt="Uploaded slip thumbnail" 
                                        className="w-10 h-10 object-cover rounded border border-zinc-700" 
                                    />
                                    <div>
                                        <p className="font-semibold text-white text-[11px]">Slip attached successfully</p>
                                        <p className="text-[9px] text-emerald-400">Ready to save & sync to live database</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setExpenseFormData(prev => ({ ...prev, receiptImageUrl: '' }))}
                                    className="text-red-400 hover:text-red-300 text-[10px] font-bold"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>

                    {/* PROFIT MADE SECTION (OPTIONAL) */}
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                                <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-400" />
                                <span>Profits Made / Revenue Generated from this Expense (Optional)</span>
                            </span>
                            <span className="text-[10px] text-zinc-400">Track ROI, resale gain or return</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Input
                                    label="Profit Made Amount (R / ZAR)"
                                    type="number"
                                    step="0.01"
                                    value={expenseFormData.profitMade}
                                    onChange={e => setExpenseFormData(prev => ({ ...prev, profitMade: e.target.value }))}
                                    placeholder="e.g. 1500"
                                />
                            </div>
                            <div>
                                <Input
                                    label="Profit / Income Name"
                                    value={expenseFormData.profitName}
                                    onChange={e => setExpenseFormData(prev => ({ ...prev, profitName: e.target.value }))}
                                    placeholder="e.g. BB Resale Return / Event Ticket Profit"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Input
                                    label="Profit Reason / Description"
                                    value={expenseFormData.profitReason}
                                    onChange={e => setExpenseFormData(prev => ({ ...prev, profitReason: e.target.value }))}
                                    placeholder="e.g. Sold 30 cartons at skirmish entrance"
                                />
                            </div>
                            <div>
                                <Input
                                    label="Profit Realization Date"
                                    type="date"
                                    value={expenseFormData.profitDate}
                                    onChange={e => setExpenseFormData(prev => ({ ...prev, profitDate: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
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
                            className="flex items-center gap-1.5"
                        >
                            <Check className="w-4 h-4" />
                            <span>{isSaving ? 'Saving...' : (editingExpense ? 'Update Expense' : 'Save & Sync Expense')}</span>
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* ========================================================= */}
            {/* DEDICATED MODAL: LOG / EDIT PROFIT & RETURNS (SEPARATE)    */}
            {/* ========================================================= */}
            <Modal
                isOpen={isProfitModalOpen}
                onClose={() => {
                    setIsProfitModalOpen(false);
                    resetProfitForm();
                }}
                title={editingProfit ? 'Edit Profit & Returns Entry' : 'Log Profit & Revenue Return'}
                maxWidth="xl"
            >
                <form onSubmit={handleSaveProfit} className="space-y-4 text-xs">
                    {/* Quick Profit Presets */}
                    {!editingProfit && (
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-emerald-400" /> Quick Profit Presets:
                                </span>
                                <span className="text-[9px] text-zinc-500">Tap to autofill profit reason & category</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                                {PROFIT_PRESETS.map((preset, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelectProfitPreset(preset)}
                                        className="px-2 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-white text-[10px] border border-emerald-500/30 transition-colors text-left"
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Profit Name & Profit Amount */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-8">
                            <Input
                                label="Profit / Return Title *"
                                value={profitFormData.profitName}
                                onChange={e => setProfitFormData(prev => ({ ...prev, profitName: e.target.value }))}
                                placeholder="e.g. Bulk BB Resale Profit, Gear Resale Return, Event Gate Surplus"
                                required
                            />
                        </div>
                        <div className="sm:col-span-4">
                            <Input
                                label="Profit Amount (R / ZAR) *"
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={profitFormData.profitMade}
                                onChange={e => setProfitFormData(prev => ({ ...prev, profitMade: e.target.value }))}
                                placeholder="e.g. 1250"
                                required
                            />
                        </div>
                    </div>

                    {/* Profit Reason & Category */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-7">
                            <Input
                                label="Profit Reason / Origin Description"
                                value={profitFormData.profitReason}
                                onChange={e => setProfitFormData(prev => ({ ...prev, profitReason: e.target.value }))}
                                placeholder="e.g. Realized margin from weekend 0.25g bio-BB ammo resale"
                            />
                        </div>
                        <div className="sm:col-span-5">
                            <label className="block text-[10px] text-zinc-400 uppercase font-black tracking-wider mb-1">
                                Profit Category
                            </label>
                            <select
                                value={profitFormData.category}
                                onChange={e => setProfitFormData(prev => ({ ...prev, category: e.target.value }))}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                            >
                                <option value="Resale & Equipment Profit">Resale & Equipment Profit</option>
                                <option value="Ammo & Consumables Resale">Ammo & Consumables Resale</option>
                                <option value="Rental Asset Profit">Rental Asset Profit</option>
                                <option value="Event Ticket Surplus">Event Ticket Surplus</option>
                                <option value="Canteen & Catering Margin">Canteen & Catering Margin</option>
                                <option value="Sponsorship & Partner Payout">Sponsorship & Partner Payout</option>
                                <option value="General Profit & Return">General Profit & Return</option>
                            </select>
                        </div>
                    </div>

                    {/* Optional Underlying Cost / Originating Asset */}
                    <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">
                                Associated Asset / Source Details (Optional)
                            </span>
                            <span className="text-[10px] text-zinc-500">Helps track gross origin & vendor</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                                label="Source Item / Purchase Name"
                                value={profitFormData.sourceExpenseName}
                                onChange={e => setProfitFormData(prev => ({ ...prev, sourceExpenseName: e.target.value }))}
                                placeholder="e.g. Bio-BB 0.25g Bulk Carton (Supplier Restock)"
                            />
                            <Input
                                label="Original Cost Price (R) (If applicable)"
                                type="number"
                                step="0.01"
                                value={profitFormData.sourceCost}
                                onChange={e => setProfitFormData(prev => ({ ...prev, sourceCost: e.target.value }))}
                                placeholder="e.g. 800"
                            />
                        </div>
                    </div>

                    {/* Realization Date & Channel Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                            label="Realization Date *"
                            type="date"
                            value={profitFormData.date}
                            onChange={e => setProfitFormData(prev => ({ ...prev, date: e.target.value }))}
                            required
                        />
                        <div>
                            <label className="block text-[10px] text-zinc-400 uppercase font-black tracking-wider mb-1">
                                Inflow Method
                            </label>
                            <select
                                value={profitFormData.paymentMethod}
                                onChange={e => setProfitFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                            >
                                <option value="EFT">EFT / Wire Transfer</option>
                                <option value="Cash">Cash at Field</option>
                                <option value="Card">Card Swipe / POS</option>
                                <option value="SnapScan">SnapScan / QR Pay</option>
                            </select>
                        </div>
                        <Input
                            label="Vendor / Payer / Source"
                            value={profitFormData.paidTo}
                            onChange={e => setProfitFormData(prev => ({ ...prev, paidTo: e.target.value }))}
                            placeholder="e.g. Registration Counter, Player Consignment"
                        />
                    </div>

                    {/* Extra Notes */}
                    <Input
                        label="Internal Reference / Notes"
                        value={profitFormData.notes}
                        onChange={e => setProfitFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="e.g. Batch #42 surplus reconciliation"
                    />

                    {/* Submit Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
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
                            variant="primary"
                            size="sm"
                            disabled={isSaving}
                            className="!bg-emerald-600 hover:!bg-emerald-500 !text-white flex items-center gap-1.5"
                        >
                            <Check className="w-4 h-4" />
                            <span>{isSaving ? 'Saving...' : (editingProfit ? 'Update Profit Entry' : 'Save & Record Profit')}</span>
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* ========================================================= */}
            {/* MODAL 2: EXPENSE SLIP AUDIT & DETAIL INSPECTOR            */}
            {/* ========================================================= */}
            {inspectingExpense && (
                <Modal
                    isOpen={Boolean(inspectingExpense)}
                    onClose={() => {
                        setInspectingExpense(null);
                        setZoomSlip(false);
                    }}
                    title="Business Expense Audit & Slip"
                    maxWidth="lg"
                >
                    <div className="space-y-4 text-xs">
                        {/* Header details */}
                        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">
                                    {inspectingExpense.category || 'Business Expense'}
                                </span>
                                <h3 className="text-base font-black text-white mt-1">
                                    {inspectingExpense.expenseName || inspectingExpense.description}
                                </h3>
                                <p className="text-[11px] text-zinc-400 mt-0.5">
                                    Recorded on: {new Date(inspectingExpense.date).toLocaleString()}
                                </p>
                            </div>

                            <div className="text-right sm:text-right">
                                <p className="text-[10px] text-zinc-400 uppercase font-black">Price Paid</p>
                                <p className="text-2xl font-mono font-black text-red-400">
                                    -R{inspectingExpense.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                </p>
                            </div>
                        </div>

                        {/* Business Reason */}
                        {inspectingExpense.expenseReason && (
                            <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800">
                                <p className="text-[10px] text-zinc-400 uppercase font-black mb-1">Business Justification / Reason</p>
                                <p className="text-zinc-200 leading-relaxed text-xs">
                                    {inspectingExpense.expenseReason}
                                </p>
                            </div>
                        )}

                        {/* Profit Made / Return Generated (if any) */}
                        {Boolean(inspectingExpense.profitMade && Number(inspectingExpense.profitMade) > 0) && (
                            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-emerald-400 uppercase font-black flex items-center gap-1">
                                        <ArrowTrendingUpIcon className="w-3.5 h-3.5" /> Profit Made / Revenue Generated
                                    </span>
                                    <span className="font-mono font-black text-emerald-400 text-base">
                                        +R{Number(inspectingExpense.profitMade).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </span>
                                </div>
                                <p className="text-white font-bold text-xs">{inspectingExpense.profitName || 'Resale / Return Revenue'}</p>
                                {inspectingExpense.profitReason && (
                                    <p className="text-[11px] text-zinc-300">"{inspectingExpense.profitReason}"</p>
                                )}
                                {inspectingExpense.profitDate && (
                                    <p className="text-[10px] text-zinc-400">Realized on: {new Date(inspectingExpense.profitDate).toLocaleDateString()}</p>
                                )}
                            </div>
                        )}

                        {/* Key Attributes Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800/80">
                                <span className="text-zinc-500 block text-[9px] uppercase font-bold">Payment Method</span>
                                <span className="text-white font-semibold">{inspectingExpense.paymentMethod || 'EFT'}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800/80">
                                <span className="text-zinc-500 block text-[9px] uppercase font-bold">Paid To / Vendor</span>
                                <span className="text-white font-semibold">{inspectingExpense.paidTo || 'Direct / Armory'}</span>
                            </div>
                            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800/80">
                                <span className="text-zinc-500 block text-[9px] uppercase font-bold">Slip Ref / Invoice</span>
                                <span className="text-white font-semibold">{inspectingExpense.notes || inspectingExpense.receiptNumber || 'None'}</span>
                            </div>
                        </div>

                        {/* Slip Image Showcase */}
                        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
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
                                <div className={`relative overflow-hidden rounded-lg bg-black border border-zinc-800 flex items-center justify-center ${zoomSlip ? 'max-h-[600px]' : 'max-h-72'}`}>
                                    <img
                                        src={inspectingExpense.receiptImageUrl}
                                        alt="Expense Slip Proof"
                                        className={`w-full object-contain ${zoomSlip ? 'scale-125 transition-transform duration-200 cursor-zoom-out' : 'cursor-zoom-in'}`}
                                        onClick={() => setZoomSlip(!zoomSlip)}
                                    />
                                </div>
                            ) : (
                                <div className="py-8 px-4 text-center border border-dashed border-zinc-800 rounded-lg text-zinc-500">
                                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="font-semibold">No digital slip image was attached to this expense.</p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const exp = inspectingExpense;
                                            setInspectingExpense(null);
                                            handleOpenEditExpense(exp);
                                        }}
                                        className="mt-2 text-red-400 hover:text-red-300 font-bold text-xs"
                                    >
                                        + Click here to upload slip image
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
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
                                        if (exp.profitMade && (!exp.amount || exp.amount <= 0 || exp.category === 'Resale & Equipment Profit')) {
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
            {/* MODAL 3: SUPABASE LIVE SYNC SQL MIGRATION SNIPPET         */}
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
                        <pre className="p-3 rounded-xl bg-black border border-zinc-800 text-[11px] font-mono text-zinc-300 max-h-72 overflow-y-auto whitespace-pre-wrap">
                            {BUSINESS_EXPENSES_SQL_SCHEMA}
                        </pre>
                        <button
                            onClick={handleCopySql}
                            className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center gap-1.5 border border-zinc-700 transition-colors shadow"
                        >
                            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
                        </button>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
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
