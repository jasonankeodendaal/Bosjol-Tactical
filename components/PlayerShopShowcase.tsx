import React, { useState, useMemo } from 'react';
import type { InventoryItem } from '../types';
import { Modal } from './Modal';
import { 
    ShoppingBag, 
    Search, 
    Package, 
    Tag, 
    Info, 
    CheckCircle, 
    AlertCircle, 
    Eye,
    Shield,
    Sparkles,
    Flame
} from 'lucide-react';

interface PlayerShopShowcaseProps {
    inventory: InventoryItem[];
}

export const PlayerShopShowcase: React.FC<PlayerShopShowcaseProps> = ({ inventory }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [inspectingItem, setInspectingItem] = useState<InventoryItem | null>(null);

    // Only items marked as available in shop
    const shopItems = useMemo(() => {
        return inventory.filter(i => Boolean(i.availableInShop));
    }, [inventory]);

    // Categories
    const categories = useMemo(() => {
        const set = new Set<string>();
        shopItems.forEach(i => {
            if (i.category) set.add(i.category);
        });
        return ['all', ...Array.from(set)];
    }, [shopItems]);

    // Filtered items
    const filteredItems = useMemo(() => {
        return shopItems.filter(item => {
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                const matchName = item.name.toLowerCase().includes(q);
                const matchDesc = (item.description || '').toLowerCase().includes(q);
                const matchCategory = (item.category || '').toLowerCase().includes(q);
                if (!matchName && !matchDesc && !matchCategory) return false;
            }
            if (selectedCategory !== 'all' && item.category !== selectedCategory) {
                return false;
            }
            return true;
        });
    }, [shopItems, searchTerm, selectedCategory]);

    return (
        <div className="w-full space-y-3 sm:space-y-4">
            {/* Top Tactical Banner & Notice */}
            <div className="relative rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-3 sm:p-4 shadow-[0_16px_35px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md overflow-hidden">
                <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-zinc-900 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_8px_16px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.1)]">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider font-mono">
                                    Tactical Armory Showcase
                                </h2>
                                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 shadow-inner">
                                    Catalog Only
                                </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                                Browse available armory stock, gear, BBs & equipment. Purchases are completed at the field counter.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="px-3 py-1.5 rounded-xl bg-zinc-900/90 shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.05)] text-right">
                            <span className="text-[10px] text-zinc-500 block uppercase font-mono">Items on Display</span>
                            <span className="text-xs font-mono font-bold text-amber-400">
                                {filteredItems.length} Products
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar & Search: shrink down neatly */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-zinc-950/80 shadow-[0_12px_24px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.05)] space-y-2">
                <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search armory gear, consumables, accessories..."
                        className="w-full bg-zinc-900/90 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-inner"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
                        >
                            &times;
                        </button>
                    )}
                </div>

                {/* Category chips shrink to fit */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold font-mono uppercase tracking-wider whitespace-nowrap transition-all ${
                                selectedCategory === cat
                                    ? 'bg-amber-600 text-white shadow-[0_4px_12px_rgba(217,119,6,0.4)] scale-[1.02]'
                                    : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 shadow-[0_2px_6px_rgba(0,0,0,0.4)]'
                            }`}
                        >
                            {cat === 'all' ? `All (${shopItems.length})` : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid: 3D effect shadowing depth squares, side by side, shrink down to fit */}
            {filteredItems.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-zinc-950/60 shadow-[0_12px_24px_rgba(0,0,0,0.6)] text-zinc-500 space-y-2">
                    <ShoppingBag className="w-8 h-8 mx-auto text-zinc-600" />
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">No showcase items listed</p>
                    <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                        There are currently no items in this category available in the showcase. Check back before game day!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
                    {filteredItems.map(item => {
                        const inStock = item.stock > 0;

                        return (
                            <div
                                key={item.id}
                                onClick={() => setInspectingItem(item)}
                                className="group relative rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-2.5 sm:p-3 shadow-[0_12px_28px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(255,255,255,0.12)] transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99] overflow-hidden"
                            >
                                {/* 3D subtle depth glow on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                <div>
                                    {/* Product Image Square Container */}
                                    <div className="w-full h-28 sm:h-32 rounded-xl bg-zinc-950 overflow-hidden relative mb-2 shadow-[0_6px_16px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.04)] flex items-center justify-center">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-zinc-700 space-y-1">
                                                <Package className="w-8 h-8" />
                                                <span className="text-[9px] uppercase font-mono tracking-wider">Bosjol Gear</span>
                                            </div>
                                        )}

                                        {/* Status Badge in 3D pill */}
                                        <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                                            <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-md ${
                                                inStock 
                                                    ? 'bg-emerald-950/80 text-emerald-300 shadow-emerald-950/50' 
                                                    : 'bg-red-950/80 text-red-300 shadow-red-950/50'
                                            }`}>
                                                {inStock ? `${item.stock} in stock` : 'Sold Out'}
                                            </span>
                                        </div>

                                        {item.condition && (
                                            <div className="absolute bottom-1.5 right-1.5">
                                                <span className="px-1.5 py-0.2 rounded-md text-[8px] font-mono font-bold uppercase bg-black/70 text-zinc-300 backdrop-blur-md">
                                                    {item.condition}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Category & Title */}
                                    <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400/90 block truncate mb-0.5">
                                        {item.category || 'Armory'}
                                    </span>
                                    <h4 className="font-bold text-xs text-white truncate group-hover:text-amber-300 transition-colors" title={item.name}>
                                        {item.name}
                                    </h4>

                                    {item.description && (
                                        <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-snug">
                                            {item.description}
                                        </p>
                                    )}
                                </div>

                                {/* Price & Quick Inspect */}
                                <div className="mt-2.5 pt-2 border-t border-zinc-800/40 flex items-center justify-between">
                                    <div>
                                        <span className="text-[8px] text-zinc-500 uppercase font-mono block">Counter Price</span>
                                        <span className="text-xs sm:text-sm font-mono font-black text-emerald-400">
                                            R{(item.salePrice || 0).toFixed(2)}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setInspectingItem(item);
                                        }}
                                        className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white shadow-sm transition-colors"
                                        title="View Specs"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Inspect Product Modal */}
            {inspectingItem && (
                <Modal isOpen={true} onClose={() => setInspectingItem(null)} title={inspectingItem.name}>
                    <div className="space-y-3.5 text-xs">
                        {inspectingItem.imageUrl && (
                            <div className="w-full h-52 rounded-2xl bg-zinc-950 overflow-hidden shadow-[0_12px_24px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] flex items-center justify-center p-2">
                                <img
                                    src={inspectingItem.imageUrl}
                                    alt={inspectingItem.name}
                                    className="w-full h-full object-contain rounded-xl"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-zinc-900/90 shadow-[0_8px_20px_rgba(0,0,0,0.7),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
                            <div>
                                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Retail Counter Price</span>
                                <span className="text-base font-mono font-black text-emerald-400">
                                    R{(inspectingItem.salePrice || 0).toFixed(2)}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Current Stock</span>
                                <span className={`text-sm font-mono font-bold ${inspectingItem.stock > 0 ? 'text-white' : 'text-red-400'}`}>
                                    {inspectingItem.stock > 0 ? `${inspectingItem.stock} Units Available` : 'Sold Out'}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Category</span>
                                <span className="text-xs text-zinc-300 font-mono">{inspectingItem.category}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Condition</span>
                                <span className="text-xs text-zinc-300 font-mono">{inspectingItem.condition}</span>
                            </div>
                        </div>

                        {inspectingItem.description && (
                            <div className="space-y-1">
                                <h5 className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-wider">
                                    Item Specifications & Information
                                </h5>
                                <div className="p-3 rounded-xl bg-zinc-950/80 shadow-inner text-zinc-300 text-xs leading-relaxed">
                                    {inspectingItem.description}
                                </div>
                            </div>
                        )}

                        <div className="p-3 rounded-xl bg-amber-950/20 text-amber-300/90 shadow-sm text-[11px] flex items-center gap-2">
                            <Info className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>
                                Want to purchase this item? Speak to the Armory Marshal or registration counter on your next event briefing!
                            </span>
                        </div>

                        <div className="pt-1 flex justify-end">
                            <button
                                onClick={() => setInspectingItem(null)}
                                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold uppercase transition-colors shadow-md"
                            >
                                Close Showcase
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};
