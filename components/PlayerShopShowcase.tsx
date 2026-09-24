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
    Sparkles,
    Flame,
    Eye,
    PlusCircle
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
                const matchIncludes = (item.rentalIncludes || '').toLowerCase().includes(q);
                if (!matchName && !matchDesc && !matchCategory && !matchIncludes) return false;
            }
            if (selectedCategory !== 'all' && item.category !== selectedCategory) {
                return false;
            }
            return true;
        });
    }, [shopItems, searchTerm, selectedCategory]);

    return (
        <div className="w-full space-y-4">
            {/* Top Free-View Header Banner (Borderless 3D Depth) */}
            <div className="relative rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-black p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl overflow-hidden">
                <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500/20 via-zinc-900 to-zinc-950 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_10px_25px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider font-mono">
                                    Tactical Armory Showcase
                                </h2>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 shadow-inner">
                                    Open Catalog
                                </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                                Browse available armory stock, gear, BBs & rentals. Purchases & gear assignments complete on-site at counter.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <div className="px-3.5 py-2 rounded-2xl bg-zinc-900/90 shadow-[0_8px_20px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.06)] text-right">
                            <span className="text-[9px] text-zinc-500 block uppercase font-mono tracking-wider">Display Inventory</span>
                            <span className="text-xs font-mono font-bold text-amber-400">
                                {filteredItems.length} Products Active
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Free-View Filter Bar & Search */}
            <div className="p-3 rounded-3xl bg-zinc-950/70 shadow-[0_16px_35px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md space-y-2.5">
                <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search armory gear, rentals, inclusions, accessories..."
                        className="w-full bg-zinc-900/90 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-inner border-0"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
                        >
                            &times;
                        </button>
                    )}
                </div>

                {/* Categorized Pills (Shrink to fit) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-1.5 rounded-2xl text-[10px] font-bold font-mono uppercase tracking-wider whitespace-nowrap transition-all shadow-[0_4px_12px_rgba(0,0,0,0.4)] ${
                                selectedCategory === cat
                                    ? 'bg-amber-600 text-white shadow-[0_6px_16px_rgba(217,119,6,0.5)] scale-[1.02]'
                                    : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                            }`}
                        >
                            {cat === 'all' ? `All (${shopItems.length})` : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid: Side by Side Free-View with 3D Depth Shadowing & No Box Outlines */}
            {filteredItems.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-zinc-950/50 shadow-[0_16px_35px_rgba(0,0,0,0.7)] text-zinc-500 space-y-2">
                    <ShoppingBag className="w-9 h-9 mx-auto text-zinc-600" />
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">No showcase items listed</p>
                    <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                        There are currently no items in this category available in the showcase. Check back before game day!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredItems.map(item => {
                        const inStock = item.stock > 0;
                        const isRental = item.isRental || /rental/i.test(item.name);

                        return (
                            <div
                                key={item.id}
                                onClick={() => setInspectingItem(item)}
                                className="group relative rounded-3xl bg-gradient-to-b from-zinc-900/80 via-zinc-950 to-black p-3 shadow-[0_16px_35px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.07)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.98),inset_0_1px_0_0_rgba(255,255,255,0.14)] transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99] overflow-hidden"
                            >
                                {/* Subtle 3D Depth Highlight */}
                                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                <div>
                                    {/* Product Image Square Container */}
                                    <div className="w-full h-32 sm:h-36 rounded-2xl bg-zinc-950 overflow-hidden relative mb-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.05)] flex items-center justify-center">
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center text-zinc-700 space-y-1">
                                                <Package className="w-8 h-8 text-zinc-600" />
                                                <span className="text-[9px] uppercase font-mono tracking-wider">Bosjol Gear</span>
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="absolute top-2 left-2 flex items-center gap-1">
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-md ${
                                                inStock 
                                                    ? 'bg-emerald-950/90 text-emerald-300 shadow-emerald-950/60' 
                                                    : 'bg-red-950/90 text-red-300 shadow-red-950/60'
                                            }`}>
                                                {inStock ? `${item.stock} left` : 'Sold Out'}
                                            </span>
                                        </div>

                                        {isRental && (
                                            <div className="absolute top-2 right-2">
                                                <span className="px-2 py-0.5 rounded-lg text-[8px] font-mono font-bold uppercase bg-amber-500/90 text-black shadow">
                                                    RENTAL
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Category & Title */}
                                    <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400/90 block truncate mb-0.5">
                                        {item.category || 'Armory'}
                                    </span>
                                    <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-amber-300 transition-colors" title={item.name}>
                                        {item.name}
                                    </h4>

                                    {/* Rental Inclusions Prompt (+ Add what is included with Rental 1, 2, 3...) */}
                                    {isRental && (
                                        <div className="mt-1.5 p-1.5 rounded-xl bg-amber-950/20 border border-amber-500/20 text-[10px] text-amber-300 flex items-center gap-1.5">
                                            <PlusCircle className="w-3 h-3 text-amber-400 shrink-0" />
                                            <span className="truncate">
                                                {item.rentalIncludes ? `Includes: ${item.rentalIncludes}` : '+ Add what is included with Rental'}
                                            </span>
                                        </div>
                                    )}

                                    {item.description && !isRental && (
                                        <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1 leading-snug">
                                            {item.description}
                                        </p>
                                    )}
                                </div>

                                {/* Price & Quick Inspect */}
                                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
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
                                        className="p-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white shadow-sm transition-colors"
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
                    <div className="space-y-4 text-xs">
                        {inspectingItem.imageUrl && (
                            <div className="w-full h-52 rounded-3xl bg-zinc-950 overflow-hidden shadow-[0_16px_35px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.06)] flex items-center justify-center p-2">
                                <img
                                    src={inspectingItem.imageUrl}
                                    alt={inspectingItem.name}
                                    className="w-full h-full object-contain rounded-2xl"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2.5 p-3.5 rounded-3xl bg-zinc-900/90 shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)]">
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

                        {/* Rental Inclusions Detail Box (+ Add what is included with Rental 1, 2, 3...) */}
                        {(inspectingItem.isRental || /rental/i.test(inspectingItem.name)) && (
                            <div className="space-y-1.5 p-3.5 rounded-3xl bg-amber-950/20 border border-amber-500/30">
                                <h5 className="text-[11px] font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    + Rental Package Includes (Rental 1, 2, 3...)
                                </h5>
                                <p className="text-xs text-amber-200/90 font-mono leading-relaxed">
                                    {inspectingItem.rentalIncludes || 'Includes standard replica rifle, high-capacity magazine, battery, charger, and full-face tactical mask.'}
                                </p>
                            </div>
                        )}

                        {inspectingItem.description && (
                            <div className="space-y-1">
                                <h5 className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-wider">
                                    Item Specifications & Information
                                </h5>
                                <div className="p-3 rounded-2xl bg-zinc-950/80 shadow-inner text-zinc-300 text-xs leading-relaxed">
                                    {inspectingItem.description}
                                </div>
                            </div>
                        )}

                        <div className="p-3.5 rounded-2xl bg-amber-950/20 text-amber-300/90 shadow-sm text-[11px] flex items-center gap-2">
                            <Info className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>
                                Want to purchase or reserve this item? Speak to the Armory Marshal or registration counter on your next event briefing!
                            </span>
                        </div>

                        <div className="pt-1 flex justify-end">
                            <button
                                onClick={() => setInspectingItem(null)}
                                className="px-5 py-2.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold uppercase transition-colors shadow-lg"
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

