import React from 'react';
import type { Transaction, Player } from '../types';
import { 
    Receipt, 
    Image as ImageIcon, 
    Eye, 
    Edit3, 
    Trash2, 
    Calendar, 
    TrendingUp,
    Sparkles,
    Shield,
    ShoppingBag,
    Flag,
    DollarSign
} from 'lucide-react';

interface BusinessCardTransactionProps {
    transaction: Transaction;
    players: Player[];
    onInspect: (transaction: Transaction) => void;
    onEditExpense: (transaction: Transaction) => void;
    onEditProfit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
}

export const BusinessCardTransaction: React.FC<BusinessCardTransactionProps> = ({
    transaction: t,
    players,
    onInspect,
    onEditExpense,
    onEditProfit,
    onDelete,
}) => {
    const isExpense = t.type === 'Expense';
    const hasProfit = Boolean(t.profitMade && Number(t.profitMade) > 0);
    const isDedicatedProfit = Boolean(hasProfit && (!t.amount || t.amount <= 0 || t.category === 'Resale & Equipment Profit' || t.profitName));
    const isGameFee = t.type === 'Event Revenue' || (t.type && /event|game/i.test(t.type));
    const isRental = t.type === 'Rental Revenue' || (t.type && /rental/i.test(t.type));
    const isRetail = t.type === 'Retail Revenue' || (t.type && /retail|shop|ammo|sales/i.test(t.type));

    const player = players.find(p => p.id === t.relatedPlayerId || p.id === t.playerId);
    const hasSlip = Boolean(t.receiptImageUrl && t.receiptImageUrl.trim() !== '');

    // Monetary figure calculation
    const amountVal = isDedicatedProfit 
        ? Number(t.profitMade || 0) 
        : Number(t.amount || 0);

    const isIncome = !isExpense || isDedicatedProfit;

    // 3D Depth Tactile Styling (Ultra-compact, Professional Shrink-to-Fit)
    const cardGradient = isDedicatedProfit
        ? 'from-emerald-950/70 via-zinc-900/90 to-zinc-950 text-emerald-300 shadow-[0_6px_16px_rgba(16,185,129,0.12),inset_0_1px_0_0_rgba(52,211,153,0.18)]'
        : isExpense
            ? 'from-red-950/60 via-zinc-900/90 to-zinc-950 text-red-300 shadow-[0_6px_16px_rgba(239,68,68,0.12),inset_0_1px_0_0_rgba(248,113,113,0.15)]'
            : isGameFee
                ? 'from-amber-950/60 via-zinc-900/90 to-zinc-950 text-amber-300 shadow-[0_6px_16px_rgba(245,158,11,0.12),inset_0_1px_0_0_rgba(251,191,36,0.15)]'
                : isRental
                    ? 'from-blue-950/60 via-zinc-900/90 to-zinc-950 text-blue-300 shadow-[0_6px_16px_rgba(59,130,246,0.12),inset_0_1px_0_0_rgba(96,165,250,0.15)]'
                    : 'from-purple-950/60 via-zinc-900/90 to-zinc-950 text-purple-300 shadow-[0_6px_16px_rgba(168,85,247,0.12),inset_0_1px_0_0_rgba(192,132,252,0.15)]';

    const typeBadge = isDedicatedProfit
        ? 'bg-emerald-900/70 text-emerald-200'
        : isExpense
            ? 'bg-red-900/70 text-red-200'
            : isGameFee
                ? 'bg-amber-900/70 text-amber-200'
                : isRental
                    ? 'bg-blue-900/70 text-blue-200'
                    : 'bg-purple-900/70 text-purple-200';

    const typeLabel = isDedicatedProfit
        ? 'PROFIT'
        : isExpense
            ? 'EXPENSE'
            : isGameFee
                ? 'GAME FEE'
                : isRental
                    ? 'RENTAL'
                    : isRetail
                        ? 'SALES'
                        : 'REVENUE';

    const dateFormatted = new Date(t.date || t.profitDate || Date.now()).toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric' 
    });

    return (
        <div className={`group relative bg-gradient-to-br ${cardGradient} p-2 sm:p-2.5 rounded-xl flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(0,0,0,0.9)] h-full min-w-0 select-none backdrop-blur-md font-sans`}>
            {/* Top Row: Type pill & Date */}
            <div className="space-y-1">
                <div className="flex items-center justify-between gap-1 pb-1 border-b border-white/[0.08]">
                    <span className={`px-1.5 py-0.2 rounded-md text-[7.5px] sm:text-[8px] font-black uppercase tracking-wider font-mono truncate max-w-[85px] shadow-sm ${typeBadge}`}>
                        {typeLabel}
                    </span>
                    <span className="text-[7.5px] sm:text-[8px] text-zinc-400 font-mono shrink-0 flex items-center gap-0.5">
                        <Calendar className="w-2 h-2 text-zinc-500" />
                        {dateFormatted}
                    </span>
                </div>

                {/* Category line */}
                {t.category && (
                    <div className="text-[8px] font-bold text-zinc-400 truncate leading-tight font-mono" title={t.category}>
                        {t.category}
                    </div>
                )}

                {/* Primary Card Title & Amount */}
                <div className="space-y-0.5">
                    <h4 
                        className="text-[10px] sm:text-[11px] font-black text-white leading-tight line-clamp-2 break-words" 
                        title={t.profitName || t.expenseName || t.description || 'Transaction'}
                    >
                        {t.profitName || t.expenseName || t.description || 'Untitled Entry'}
                    </h4>

                    {/* Monetary Figure (Embossed 3D shrink-to-fit) */}
                    <div className="flex items-baseline justify-between gap-1 pt-0.5">
                        <div className={`font-mono font-black text-[11px] sm:text-xs leading-none tracking-tight ${isIncome ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.3)]' : 'text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.3)]'}`}>
                            {isIncome ? '+' : '-'}R{amountVal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </div>
                        {hasProfit && !isDedicatedProfit && (
                            <span className="text-[7.5px] font-mono text-emerald-300 font-bold bg-emerald-950/90 px-1 py-0.2 rounded shadow-inner">
                                +R{Number(t.profitMade).toFixed(0)}
                            </span>
                        )}
                    </div>

                    {/* Operational Reason / Purpose Snippet */}
                    {(t.expenseReason || t.profitReason) && (
                        <p className="text-[7.5px] text-zinc-400 italic line-clamp-1 break-words leading-tight" title={t.profitReason || t.expenseReason}>
                            "{t.profitReason || t.expenseReason}"
                        </p>
                    )}
                </div>
            </div>

            {/* Bottom Meta & Action Controls */}
            <div className="pt-1.5 mt-1.5 border-t border-white/[0.08] space-y-1">
                {/* Payment method & Vendor / Operator row */}
                <div className="flex items-center justify-between text-[7.5px] sm:text-[8px] text-zinc-400 gap-1 flex-wrap">
                    <span className="px-1 py-0.2 bg-zinc-950/80 rounded text-zinc-300 font-mono shadow-inner shrink-0">
                        {t.paymentMethod || 'EFT'}
                    </span>

                    {/* Vendor or Player */}
                    <span className="text-zinc-300 truncate max-w-[75px] font-medium" title={t.paidTo || player?.name || ''}>
                        {t.paidTo ? t.paidTo : (player?.name ? player.name : '')}
                    </span>

                    {/* Verified Slip Badge */}
                    {hasSlip && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onInspect(t);
                            }}
                            className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[7.5px] font-bold font-mono bg-amber-950/90 hover:bg-amber-900 text-amber-300 transition-colors cursor-pointer shrink-0 shadow-sm"
                            title="Slip attached - click to view"
                        >
                            <ImageIcon className="w-2 h-2" />
                            <span>Slip</span>
                        </button>
                    )}
                </div>

                {/* Compact Action Bar */}
                <div className="flex items-center justify-between pt-0.5 border-t border-white/[0.05] text-[8px] gap-1">
                    <span className="text-[7px] text-zinc-500 font-mono truncate max-w-[55px]" title={t.notes || t.id}>
                        {t.notes ? t.notes : `#${t.id.slice(-4)}`}
                    </span>

                    <div className="flex items-center gap-0.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => onInspect(t)}
                            className="p-0.5 rounded bg-zinc-950/90 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all text-[8px] flex items-center shadow-inner"
                            title="Inspect details"
                        >
                            <Eye className="w-2.5 h-2.5 text-zinc-400" />
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                if (isDedicatedProfit) {
                                    onEditProfit(t);
                                } else {
                                    onEditExpense(t);
                                }
                            }}
                            className="p-0.5 rounded bg-zinc-950/90 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all text-[8px] flex items-center shadow-inner"
                            title="Edit"
                        >
                            <Edit3 className="w-2.5 h-2.5 text-zinc-400" />
                        </button>

                        <button
                            type="button"
                            onClick={() => onDelete(t)}
                            className="p-0.5 rounded bg-zinc-950/90 hover:bg-red-950/90 text-zinc-500 hover:text-red-400 transition-all text-[8px] flex items-center shadow-inner"
                            title="Delete"
                        >
                            <Trash2 className="w-2.5 h-2.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
