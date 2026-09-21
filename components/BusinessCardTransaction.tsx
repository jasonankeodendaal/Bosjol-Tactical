import React from 'react';
import type { Transaction, Player } from '../types';
import { 
    Receipt, 
    Image as ImageIcon, 
    Eye, 
    Edit3, 
    Trash2, 
    Calendar, 
    User, 
    Layers,
    TrendingUp,
    ExternalLink
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
    const player = players.find(p => p.id === t.relatedPlayerId);
    const hasSlip = Boolean(t.receiptImageUrl && t.receiptImageUrl.trim() !== '');

    // Monetary figure calculation
    const amountVal = isDedicatedProfit 
        ? Number(t.profitMade || 0) 
        : Number(t.amount || 0);

    const isIncome = !isExpense || isDedicatedProfit;

    // Tactical aesthetic borders & gradients
    const cardBorder = isDedicatedProfit
        ? 'border-emerald-500/40 from-emerald-950/30 via-zinc-900 to-zinc-950'
        : isExpense
            ? 'border-red-500/35 from-red-950/25 via-zinc-900 to-zinc-950'
            : 'border-blue-500/35 from-blue-950/20 via-zinc-900 to-zinc-950';

    const typeBadge = isDedicatedProfit
        ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/40'
        : isExpense
            ? 'bg-red-950/90 text-red-400 border-red-500/40'
            : 'bg-blue-950/90 text-blue-400 border-blue-500/40';

    const dateFormatted = new Date(t.date || t.profitDate || Date.now()).toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric' 
    });

    return (
        <div className={`group relative bg-gradient-to-br ${cardBorder} border p-2 sm:p-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.65),inset_0_1px_1px_rgba(255,255,255,0.05)] flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(0,0,0,0.85)] rounded-none h-full min-w-0`}>
            {/* Top Row: Type chip & Date */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-white/[0.06]">
                    <span className={`px-1.5 py-0.2 text-[8px] sm:text-[9px] font-black uppercase tracking-wider border font-mono truncate max-w-[100px] ${typeBadge}`}>
                        {isDedicatedProfit ? 'PROFIT' : isExpense ? 'EXPENSE' : (t.type?.replace(' Revenue', '') || 'REV')}
                    </span>
                    <span className="text-[8px] sm:text-[9px] text-zinc-400 font-mono shrink-0 flex items-center gap-0.5">
                        <Calendar className="w-2.5 h-2.5 text-zinc-500 inline" />
                        {dateFormatted}
                    </span>
                </div>

                {/* Category line */}
                {t.category && (
                    <div className="text-[9px] font-bold text-zinc-400 truncate leading-tight" title={t.category}>
                        {t.category}
                    </div>
                )}

                {/* Primary Card Title & Amount */}
                <div className="space-y-1">
                    <h4 
                        className="text-[11px] sm:text-xs font-black text-white leading-snug line-clamp-2 break-words" 
                        title={t.profitName || t.expenseName || t.description || 'Transaction'}
                    >
                        {t.profitName || t.expenseName || t.description || 'Untitled Entry'}
                    </h4>

                    {/* Monetary Figure (Embossed shrink-to-fit) */}
                    <div className="flex items-baseline justify-between gap-1">
                        <div className={`font-mono font-black text-xs sm:text-sm leading-none tracking-tight ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isIncome ? '+' : '-'}R{amountVal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </div>
                        {hasProfit && !isDedicatedProfit && (
                            <span className="text-[8px] font-mono text-emerald-400 font-bold bg-emerald-950/70 px-1 py-0.2">
                                +R{Number(t.profitMade).toFixed(0)}
                            </span>
                        )}
                    </div>

                    {/* Operational Reason / Purpose Snippet */}
                    {(t.expenseReason || t.profitReason) && (
                        <p className="text-[9px] text-zinc-400 italic line-clamp-1 break-words mt-0.5" title={t.profitReason || t.expenseReason}>
                            "{t.profitReason || t.expenseReason}"
                        </p>
                    )}
                </div>
            </div>

            {/* Bottom Meta & Action Controls */}
            <div className="pt-2 mt-2 border-t border-white/[0.06] space-y-1.5">
                {/* Payment method & Vendor row */}
                <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-zinc-400 gap-1 flex-wrap">
                    <span className="px-1 py-0.2 bg-zinc-950 text-zinc-300 font-mono border border-zinc-800 shrink-0">
                        {t.paymentMethod || 'EFT'}
                    </span>

                    {/* Vendor or Player */}
                    <span className="text-zinc-400 truncate max-w-[90px]" title={t.paidTo || player?.name || ''}>
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
                            className="inline-flex items-center gap-0.5 px-1 py-0.2 text-[8px] font-bold font-mono bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-500/40 transition-colors cursor-pointer shrink-0"
                            title="Slip attached - click to view"
                        >
                            <ImageIcon className="w-2 h-2" />
                            <span>Slip</span>
                        </button>
                    )}
                </div>

                {/* Compact Action Bar */}
                <div className="flex items-center justify-between pt-1 border-t border-zinc-800/40 text-[9px] gap-1">
                    <span className="text-[8px] text-zinc-500 font-mono truncate max-w-[65px]" title={t.notes || t.id}>
                        {t.notes ? t.notes : `#${t.id.slice(-4)}`}
                    </span>

                    <div className="flex items-center gap-0.5 shrink-0">
                        <button
                            type="button"
                            onClick={() => onInspect(t)}
                            className="p-1 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors text-[9px] flex items-center"
                            title="Inspect voucher & receipt details"
                        >
                            <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-400" />
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
                            className="p-1 bg-zinc-950 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors text-[9px] flex items-center"
                            title="Edit transaction"
                        >
                            <Edit3 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-400" />
                        </button>

                        <button
                            type="button"
                            onClick={() => onDelete(t)}
                            className="p-1 bg-zinc-950 hover:bg-red-950 text-zinc-500 hover:text-red-400 transition-colors text-[9px] flex items-center"
                            title="Delete transaction"
                        >
                            <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
