import React, { useState, useMemo } from 'react';
import type { Player, Transaction, Signup, GameEvent, Raffle, InventoryItem } from '../types';
import { Modal } from './Modal';
import { Button } from './Button';
import { 
    Receipt, 
    Calendar, 
    ShoppingBag, 
    CreditCard, 
    Banknote, 
    Send, 
    Ticket, 
    Shield, 
    CheckCircle2, 
    Printer, 
    TrendingUp, 
    Clock, 
    Filter, 
    Search,
    ChevronRight,
    Tag,
    DollarSign,
    PackageCheck,
    Layers,
    Crosshair
} from 'lucide-react';

interface PlayerExpenseHistoryTabProps {
    player: Player;
    transactions: Transaction[];
    signups: Signup[];
    events: GameEvent[];
    raffles: Raffle[];
    inventory?: InventoryItem[];
}

export interface UnifiedExpenseItem {
    id: string;
    type: 'shop' | 'event_entry' | 'rental_gear' | 'raffle';
    title: string;
    description: string;
    date: string;
    amount: number;
    paymentMethod: string;
    paymentStatus: string;
    receiptNumber: string;
    itemCount?: number;
    items?: Array<{
        name: string;
        quantity: number;
        price: number;
        total: number;
        category?: string;
    }>;
    originalTx?: Transaction;
    originalSignup?: Signup;
    relatedEvent?: GameEvent;
}

export const PlayerExpenseHistoryTab: React.FC<PlayerExpenseHistoryTabProps> = ({
    player,
    transactions,
    signups,
    events,
    raffles,
    inventory = [],
}) => {
    const [filterType, setFilterType] = useState<'all' | 'shop' | 'event' | 'rental' | 'raffle'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeReceipt, setActiveReceipt] = useState<UnifiedExpenseItem | null>(null);

    // 1. Build unified expenses list
    const unifiedExpenses = useMemo(() => {
        const list: UnifiedExpenseItem[] = [];

        // A. POS Transactions linked to this player
        const playerTx = transactions.filter(t => 
            t.playerId === player.id || 
            t.relatedPlayerId === player.id ||
            t.customerCode === player.playerCode
        );

        playerTx.forEach(tx => {
            const items = (tx.items || []).map(it => ({
                name: it.name,
                quantity: it.quantity,
                price: it.price,
                total: it.total,
                category: it.category,
            }));

            list.push({
                id: `tx_${tx.id}`,
                type: 'shop',
                title: tx.description || 'Armory Counter Sale',
                description: tx.notes ? `${tx.description} — ${tx.notes}` : tx.description,
                date: tx.date || new Date().toISOString(),
                amount: Number(tx.amount || 0),
                paymentMethod: tx.paymentMethod || 'Cash',
                paymentStatus: tx.paymentStatus || 'Paid',
                receiptNumber: tx.receiptNumber || tx.id.slice(0, 14),
                itemCount: items.length || 1,
                items: items.length > 0 ? items : [{
                    name: tx.description,
                    quantity: 1,
                    price: Number(tx.amount || 0),
                    total: Number(tx.amount || 0),
                }],
                originalTx: tx,
            });
        });

        // B. Event Signups with entry fees or rental packages
        const playerSignups = signups.filter(s => s.playerId === player.id);

        playerSignups.forEach(signup => {
            const ev = events.find(e => e.id === signup.eventId);
            const entryFee = Number(signup.totalCost ?? ev?.entryFee ?? 0);
            const hasRental = signup.needsRentalRifle || (signup.requestedGearIds && signup.requestedGearIds.length > 0);

            // Separate items breakdown
            const signupItems: Array<{ name: string; quantity: number; price: number; total: number; category?: string }> = [];
            
            // Base entry fee
            if (ev?.entryFee) {
                signupItems.push({
                    name: `Event Entry: ${ev.name || 'Skirmish'}`,
                    quantity: 1,
                    price: Number(ev.entryFee),
                    total: Number(ev.entryFee),
                    category: 'Event Ticket',
                });
            }

            // Rental rifle
            if (signup.needsRentalRifle) {
                const rentalPrice = ev?.rentalWeaponFee || 150;
                signupItems.push({
                    name: 'Primary AEG Rifle Rental',
                    quantity: 1,
                    price: rentalPrice,
                    total: rentalPrice,
                    category: 'Rental Gear',
                });
            }

            // Add-ons
            (signup.requestedGearIds || []).forEach(gearId => {
                const gearItem = inventory.find(i => i.id === gearId);
                const price = gearItem ? Number(gearItem.salePrice || 50) : 50;
                signupItems.push({
                    name: gearItem?.name || 'Tactical Add-on Gear',
                    quantity: 1,
                    price,
                    total: price,
                    category: 'Rental Add-on',
                });
            });

            // If entry fee > 0 or has rental, register as an expense
            if (entryFee > 0 || signupItems.length > 0) {
                const totalAmount = entryFee > 0 ? entryFee : signupItems.reduce((acc, i) => acc + i.total, 0);
                
                list.push({
                    id: `signup_${signup.id}`,
                    type: hasRental ? 'rental_gear' : 'event_entry',
                    title: ev ? `Event: ${ev.name}` : 'Tactical Skirmish Entry',
                    description: `Registered for ${ev?.name || 'Skirmish'} ${signup.assignedRifleId ? `(Assigned: ${signup.assignedRifleId})` : ''}`,
                    date: signup.registeredAt || ev?.date || new Date().toISOString(),
                    amount: totalAmount,
                    paymentMethod: signup.paymentStatus === 'Paid (Card)' ? 'Card' : signup.paymentStatus === 'Paid (EFT)' ? 'EFT' : 'Cash',
                    paymentStatus: signup.paymentStatus || 'Paid',
                    receiptNumber: `EVT-${signup.id.slice(0, 8).toUpperCase()}`,
                    itemCount: signupItems.length || 1,
                    items: signupItems,
                    originalSignup: signup,
                    relatedEvent: ev,
                });
            }
        });

        // C. Raffle Tickets
        raffles.forEach(raffle => {
            const playerTickets = (raffle.tickets || []).filter(t => t.playerId === player.id);
            if (playerTickets.length > 0) {
                const ticketPrice = Number(raffle.ticketPrice || 50);
                const totalRaffleExpense = playerTickets.length * ticketPrice;
                const ticketCodes = playerTickets.map(t => t.code).join(', ');

                list.push({
                    id: `raffle_${raffle.id}`,
                    type: 'raffle',
                    title: `Raffle: ${raffle.name || 'Tactical Draw'}`,
                    description: `Purchased ${playerTickets.length} ticket(s) [${ticketCodes}]`,
                    date: playerTickets[0].purchaseDate || new Date().toISOString(),
                    amount: totalRaffleExpense,
                    paymentMethod: playerTickets[0].paymentStatus?.includes('Card') ? 'Card' : 'Cash',
                    paymentStatus: 'Paid',
                    receiptNumber: `RAF-${raffle.id.slice(0, 6).toUpperCase()}`,
                    itemCount: playerTickets.length,
                    items: playerTickets.map((t, idx) => ({
                        name: `Ticket #${idx + 1} (${t.code})`,
                        quantity: 1,
                        price: ticketPrice,
                        total: ticketPrice,
                        category: 'Raffle Entry',
                    })),
                });
            }
        });

        // Sort descending by date
        return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, signups, events, raffles, player, inventory]);

    // Statistics calculations
    const stats = useMemo(() => {
        const totalSpent = unifiedExpenses.reduce((sum, e) => sum + e.amount, 0);
        const shopTotal = unifiedExpenses.filter(e => e.type === 'shop').reduce((sum, e) => sum + e.amount, 0);
        const eventTotal = unifiedExpenses.filter(e => e.type === 'event_entry').reduce((sum, e) => sum + e.amount, 0);
        const rentalTotal = unifiedExpenses.filter(e => e.type === 'rental_gear').reduce((sum, e) => sum + e.amount, 0);
        const raffleTotal = unifiedExpenses.filter(e => e.type === 'raffle').reduce((sum, e) => sum + e.amount, 0);

        return {
            totalSpent,
            shopTotal,
            eventTotal,
            rentalTotal,
            raffleTotal,
            count: unifiedExpenses.length,
        };
    }, [unifiedExpenses]);

    // Filtered list based on search and tab
    const filteredExpenses = useMemo(() => {
        return unifiedExpenses.filter(item => {
            if (filterType === 'shop' && item.type !== 'shop') return false;
            if (filterType === 'event' && item.type !== 'event_entry') return false;
            if (filterType === 'rental' && item.type !== 'rental_gear') return false;
            if (filterType === 'raffle' && item.type !== 'raffle') return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const matchTitle = item.title.toLowerCase().includes(q);
                const matchDesc = item.description.toLowerCase().includes(q);
                const matchReceipt = item.receiptNumber.toLowerCase().includes(q);
                if (!matchTitle && !matchDesc && !matchReceipt) return false;
            }

            return true;
        });
    }, [unifiedExpenses, filterType, searchQuery]);

    const handlePrintReceipt = () => {
        window.print();
    };

    return (
        <div className="w-full space-y-3 sm:space-y-4">
            {/* Top Side-by-Side 3D Depth Squares (KPI Strip) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                {/* 1. Total Lifetime Spent */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 shadow-[0_12px_28px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.06)] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 truncate">
                            Total Expenses
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shadow-inner">
                            <DollarSign className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-base sm:text-xl font-mono font-black text-emerald-400 tracking-tight">
                            R{stats.totalSpent.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            {stats.count} transactions recorded
                        </p>
                    </div>
                </div>

                {/* 2. Armory & Shop Purchases */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 shadow-[0_12px_28px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.06)] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 truncate">
                            Armory & Shop
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shadow-inner">
                            <ShoppingBag className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-base sm:text-xl font-mono font-black text-amber-400 tracking-tight">
                            R{stats.shopTotal.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            Counter gear & consumables
                        </p>
                    </div>
                </div>

                {/* 3. Event Entries */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 shadow-[0_12px_28px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.06)] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 truncate">
                            Events & Skirmishes
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shadow-inner">
                            <Calendar className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-base sm:text-xl font-mono font-black text-blue-400 tracking-tight">
                            R{stats.eventTotal.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            Field passes & tournaments
                        </p>
                    </div>
                </div>

                {/* 4. Equipment Rentals */}
                <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 shadow-[0_12px_28px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.06)] flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 truncate">
                            Rental Packages
                        </span>
                        <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shadow-inner">
                            <Layers className="w-3.5 h-3.5" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <p className="text-base sm:text-xl font-mono font-black text-purple-400 tracking-tight">
                            R{stats.rentalTotal.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            AEGs, masks & add-ons
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter & Search Bar: shrink down neatly */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-950/80 shadow-[0_12px_24px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.05)] space-y-2">
                <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search expenses by receipt #, description or event name..."
                        className="w-full bg-zinc-900/90 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-inner"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
                        >
                            &times;
                        </button>
                    )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                            filterType === 'all'
                                ? 'bg-amber-600 text-white shadow-[0_4px_12px_rgba(217,119,6,0.4)]'
                                : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                        }`}
                    >
                        All Expenses ({unifiedExpenses.length})
                    </button>
                    <button
                        onClick={() => setFilterType('shop')}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                            filterType === 'shop'
                                ? 'bg-amber-600 text-white shadow-[0_4px_12px_rgba(217,119,6,0.4)]'
                                : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                        }`}
                    >
                        Armory Shop ({unifiedExpenses.filter(e => e.type === 'shop').length})
                    </button>
                    <button
                        onClick={() => setFilterType('event')}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                            filterType === 'event'
                                ? 'bg-amber-600 text-white shadow-[0_4px_12px_rgba(217,119,6,0.4)]'
                                : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                        }`}
                    >
                        Events ({unifiedExpenses.filter(e => e.type === 'event_entry').length})
                    </button>
                    <button
                        onClick={() => setFilterType('rental')}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                            filterType === 'rental'
                                ? 'bg-amber-600 text-white shadow-[0_4px_12px_rgba(217,119,6,0.4)]'
                                : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                        }`}
                    >
                        Rentals ({unifiedExpenses.filter(e => e.type === 'rental_gear').length})
                    </button>
                    <button
                        onClick={() => setFilterType('raffle')}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                            filterType === 'raffle'
                                ? 'bg-amber-600 text-white shadow-[0_4px_12px_rgba(217,119,6,0.4)]'
                                : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                        }`}
                    >
                        Raffles ({unifiedExpenses.filter(e => e.type === 'raffle').length})
                    </button>
                </div>
            </div>

            {/* Expense Cards: Side by Side 3D Depth Squares */}
            {filteredExpenses.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-zinc-950/60 shadow-[0_12px_24px_rgba(0,0,0,0.6)] text-zinc-500 space-y-2">
                    <Receipt className="w-8 h-8 mx-auto text-zinc-600" />
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">No expense records found</p>
                    <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                        Purchases made at the armory shop or event registrations will be automatically linked to your callsign.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                    {filteredExpenses.map(item => {
                        const dateObj = new Date(item.date);
                        const formattedDate = dateObj.toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                        });
                        const formattedTime = dateObj.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        });

                        return (
                            <div
                                key={item.id}
                                onClick={() => setActiveReceipt(item)}
                                className="group relative rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-3 sm:p-3.5 shadow-[0_12px_28px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(255,255,255,0.12)] transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99] overflow-hidden"
                            >
                                <div className="space-y-2">
                                    {/* Top Row: Type Pill, Receipt Code & Payment */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 truncate">
                                            {item.type === 'shop' && (
                                                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 shadow-sm flex items-center gap-1">
                                                    <ShoppingBag className="w-2.5 h-2.5" /> Armory POS
                                                </span>
                                            )}
                                            {item.type === 'event_entry' && (
                                                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase bg-blue-500/20 text-blue-300 shadow-sm flex items-center gap-1">
                                                    <Calendar className="w-2.5 h-2.5" /> Event Ticket
                                                </span>
                                            )}
                                            {item.type === 'rental_gear' && (
                                                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300 shadow-sm flex items-center gap-1">
                                                    <Layers className="w-2.5 h-2.5" /> Rental Gear
                                                </span>
                                            )}
                                            {item.type === 'raffle' && (
                                                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 shadow-sm flex items-center gap-1">
                                                    <Ticket className="w-2.5 h-2.5" /> Raffle
                                                </span>
                                            )}

                                            <span className="text-[10px] font-mono text-zinc-400 truncate">
                                                #{item.receiptNumber}
                                            </span>
                                        </div>

                                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-zinc-800 text-zinc-300 shrink-0">
                                            {item.paymentMethod}
                                        </span>
                                    </div>

                                    {/* Middle: Title & Description */}
                                    <div>
                                        <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-amber-400 transition-colors">
                                            {item.title}
                                        </h4>
                                        <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                                            {item.description}
                                        </p>
                                    </div>

                                    {/* Items count summary */}
                                    {item.items && item.items.length > 0 && (
                                        <div className="p-1.5 rounded-lg bg-zinc-950/70 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                                            <span className="truncate">
                                                {item.items[0].name} {item.items.length > 1 && `+${item.items.length - 1} more`}
                                            </span>
                                            <span className="text-zinc-500 shrink-0 ml-2">
                                                {item.itemCount} {item.itemCount === 1 ? 'item' : 'items'}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Row: Date & Amount in 3D bar */}
                                <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                                        <Clock className="w-3 h-3 text-zinc-600" />
                                        <span>{formattedDate} &bull; {formattedTime}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs sm:text-sm font-mono font-black text-emerald-400">
                                            R{item.amount.toFixed(2)}
                                        </span>
                                        <button
                                            type="button"
                                            className="p-1 rounded-md bg-zinc-800/80 group-hover:bg-amber-600 group-hover:text-white text-zinc-400 transition-colors"
                                            title="View Full Itemized Receipt"
                                        >
                                            <ChevronRight className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Top-Class Detailed Receipt Modal */}
            {activeReceipt && (
                <Modal 
                    isOpen={true} 
                    onClose={() => setActiveReceipt(null)} 
                    title="Itemized Tactical Expense Receipt"
                >
                    <div className="space-y-3.5 text-xs font-mono">
                        {/* Printable Receipt Box */}
                        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 shadow-[0_12px_28px_rgba(0,0,0,0.9)] text-zinc-300 print:bg-white print:text-black">
                            {/* Header */}
                            <div className="text-center border-b border-zinc-800 pb-2.5 space-y-0.5">
                                <h3 className="font-black text-sm uppercase text-white tracking-widest">
                                    BOSJOL TACTICAL AIRSOFT
                                </h3>
                                <p className="text-[10px] text-zinc-400">Operator Expense Statement</p>
                                <p className="text-[10px] text-zinc-500">
                                    Receipt #{activeReceipt.receiptNumber} &bull; {new Date(activeReceipt.date).toLocaleString()}
                                </p>
                            </div>

                            {/* Operator Details */}
                            <div className="text-[11px] space-y-1 bg-zinc-900/60 p-2.5 rounded-xl">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Operator:</span>
                                    <span className="text-white font-bold">
                                        {player.name} {player.surname} {player.callsign && `"${player.callsign}"`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Player Code:</span>
                                    <span className="text-amber-400 font-bold">{player.playerCode}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Payment Tendered:</span>
                                    <span className="text-zinc-200">{activeReceipt.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Status:</span>
                                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" /> Paid & Settled
                                    </span>
                                </div>
                            </div>

                            {/* Itemized list */}
                            <div className="border-t border-b border-zinc-800 py-2.5 space-y-1.5">
                                <div className="flex justify-between text-[10px] uppercase text-zinc-500 pb-1 border-b border-zinc-800/60">
                                    <span>Item / Description</span>
                                    <span>Amount</span>
                                </div>

                                {activeReceipt.items && activeReceipt.items.length > 0 ? (
                                    activeReceipt.items.map((it, idx) => (
                                        <div key={idx} className="flex justify-between items-center text-xs py-0.5">
                                            <div className="truncate pr-2">
                                                <span className="text-white font-medium">
                                                    {it.quantity > 1 ? `${it.quantity}x ` : ''}{it.name}
                                                </span>
                                                {it.category && (
                                                    <span className="text-[9px] text-zinc-500 ml-1.5">
                                                        ({it.category})
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-emerald-400 font-bold shrink-0">
                                                R{it.total.toFixed(2)}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-white">{activeReceipt.title}</span>
                                        <span className="text-emerald-400 font-bold">
                                            R{activeReceipt.amount.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="space-y-1 text-xs">
                                <div className="flex justify-between items-center text-sm font-black text-white pt-1">
                                    <span className="tracking-wider">TOTAL CHARGED:</span>
                                    <span className="text-emerald-400 text-base">
                                        R{activeReceipt.amount.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <p className="text-center text-[9px] text-zinc-500 pt-2 border-t border-zinc-900">
                                Verified electronic record &bull; Bosjol Tactical Airsoft Systems
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="pt-2 flex justify-between gap-2">
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={handlePrintReceipt} 
                                className="flex items-center gap-1.5 text-xs font-bold"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print Receipt</span>
                            </Button>
                            <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => setActiveReceipt(null)}
                                className="!bg-amber-600 hover:!bg-amber-500 text-xs font-bold"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
