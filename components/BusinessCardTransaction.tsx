import React from 'react';
import type { Transaction, Player } from '../types';
import { 
    Receipt, 
    Image as ImageIcon, 
    Eye, 
    Edit3, 
    Trash2, 
    CreditCard, 
    Calendar, 
    User, 
    Building, 
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    TrendingUp
} from 'lucide-react';
import { ArrowTrendingUpIcon } from './icons/Icons';

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
    const player = players.find(p => p.id === t.relatedPlayerId);
    const hasSlip = Boolean(t.receiptImageUrl && t.receiptImageUrl.trim() !== '');

    // Format monetary display
    const amountVal = isDedicatedProfit 
        ? Number(t.profitMade || 0) 
        : Number(t.amount || 0);

    // Business card color accents
    const isIncome = !isExpense || isDedicatedProfit;
    const accentColor = isDedicatedProfit
        ? 'border-emerald-500/50 from-emerald-950/20 via-zinc-900 to-zinc-950'
        : isExpense
            ? 'border-red-500/40 from-red-950/15 via-zinc-900 to-zinc-950'
            : 'border-blue-500/40 from-blue-950/15 via-zinc-900 to-zinc-950';

    const typeBadgeColor = isDedicatedProfit
        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
        : isExpense
            ? 'bg-red-950/80 text-red-400 border-red-500/40'
            : 'bg-blue-950/80 text-blue-400 border-blue-500/40';

    return (
        <div className={`relative group bg-gradient-to-br ${accentColor} border p-3.5 shadow-[0_8px_24px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.06)] rounded-none flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,0,0,0.9)]`}>
            {/* Top Row: Type Badge, Category & Date */}
            <div className="space-y-2">
                <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border font-mono ${typeBadgeColor}`}>
                            {isDedicatedProfit ? 'PROFIT & ROI' : isExpense ? 'EXPENSE SLIP' : (t.type || 'REVENUE')}
                        </span>
                        {t.category && (
                            <span className="text-[10px] text-zinc-400 font-bold truncate max-w-[140px]" title={t.category}>
                                {t.category}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 text-[9px] text-zinc-400 font-mono shrink-0">
                        <Calendar className="w-3 h-3 text-zinc-500" />
                        <span>{new Date(t.date || t.profitDate || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                </div>

                {/* Primary Card Title & Amount */}
                <div className="flex items-start justify-between gap-2 pt-1">
                    <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-black text-white leading-snug truncate" title={t.profitName || t.expenseName || t.description}>
                            {t.profitName || t.expenseName || t.description || 'Untitled Transaction'}
                        </h4>
                        
                        {(t.expenseReason || t.profitReason) && (
                            <p className="text-[10px] text-zinc-400 italic line-clamp-2 mt-0.5" title={t.profitReason || t.expenseReason}>
                                "{t.profitReason || t.expenseReason}"
                            </p>
                        )}
                    </div>

                    {/* Monetary Figure */}
                    <div className="text-right shrink-0">
                        <div className={`font-mono font-black text-sm sm:text-base leading-none ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isIncome ? '+' : '-'}R{amountVal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </div>
                        {hasProfit && !isDedicatedProfit && (
                            <div className="text-[9px] font-mono text-emerald-400 font-bold mt-0.5">
                                +R{Number(t.profitMade).toFixed(0)} profit
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Card Attributes & Actions */}
            <div className="pt-3 mt-2 border-t border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 flex-wrap gap-1.5">
                    {/* Payment Method Badge */}
                    <div className="flex items-center gap-1">
                        <span className="px-1.5 py-0.2 bg-zinc-950 text-zinc-300 font-mono text-[9px] border border-zinc-800">
                            {t.paymentMethod || 'EFT'}
                        </span>
                        {t.paidTo && (
                            <span className="text-zinc-400 truncate max-w-[110px]" title={t.paidTo}>
                                &bull; {t.paidTo}
                            </span>
                        )}
                        {player && (
                            <span className="text-zinc-400 truncate max-w-[110px]" title={player.name}>
                                &bull; {player.name}
                            </span>
                        )}
                    </div>

                    {/* Slip Attachment Pill */}
                    {hasSlip && (
                        <button
                            onClick={() => onInspect(t)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold font-mono bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 transition-colors cursor-pointer"
                            title="Click to view slip attachment"
                        >
                            <ImageIcon className="w-2.5 h-2.5" />
                            <span>Slip Verified</span>
                        </button>
                    )}
                </div>

                {/* Card Action Controls */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/40 text-[10px]">
                    <span className="text-[9px] text-zinc-500 font-mono truncate max-w-[120px]">
                        Ref: {t.notes || t.receiptNumber || t.id.slice(0, 8)}
                    </span>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onInspect(t)}
                            className="p-1 px-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                            title="Inspect details & receipt"
                        >
                            <Eye className="w-3 h-3 text-zinc-400" />
                            <span>Inspect</span>
                        </button>

                        <button
                            onClick={() => {
                                if (isDedicatedProfit) {
                                    onEditProfit(t);
                                } else {
                                    onEditExpense(t);
                                }
                            }}
                            className="p-1 px-1.5 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                            title="Edit transaction"
                        >
                            <Edit3 className="w-3 h-3 text-zinc-400" />
                            <span>Edit</span>
                        </button>

                        <button
                            onClick={() => onDelete(t)}
                            className="p-1 px-1.5 bg-zinc-950 hover:bg-red-950/70 text-zinc-400 hover:text-red-300 transition-colors flex items-center gap-1 text-[10px]"
                            title="Delete transaction"
                        >
                            <Trash2 className="w-3 h-3 text-zinc-500 hover:text-red-400" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
