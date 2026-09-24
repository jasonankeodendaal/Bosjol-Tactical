import React, { useState, useMemo } from 'react';
import type { InventoryItem, Player } from '../types';
import { Modal } from './Modal';
import { 
    ShoppingBag, 
    Search, 
    Package, 
    Tag, 
    Info, 
    CheckCircle, 
    Sparkles, 
    Eye, 
    Bookmark, 
    ArrowUpDown, 
    X, 
    Layers, 
    ChevronRight,
    Zap
} from 'lucide-react';

interface PlayerShopShowcaseProps {
    inventory: InventoryItem[];
    player?: Player;
}

export const PlayerShopShowcase: React.FC<PlayerShopShowcaseProps> = ({ inventory, player }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [inspectingItem, setInspectingItem] = useState<InventoryItem | null>(null);
    const [inStockOnly, setInStockOnly] = useState<boolean>(false);
    const [wishlistOnly, setWishlistOnly] = useState<boolean>(false);
    const [sortBy, setSortBy] = useState<'featured' | 'priceLow' | 'priceHigh' | 'stock'>('featured');

    // Wishlist bookmark state (in-memory, zero localStorage)
    const [wishlistIds, setWishlistIds] = useState<string[]>([]);

    const toggleWishlist = (itemId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setWishlistIds(prev => {
            return prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId];
        });
    };

    // Filter items: STRICTLY only items toggled as available in shop
    const shopItems = useMemo(() => {
        return inventory.filter(i => Boolean(i.availableInShop));
    }, [inventory]);

    // Categories list with counts
    const categoryStats = useMemo(() => {
        const counts: Record<string, number> = {};
        shopItems.forEach(i => {
            const cat = i.category || 'Gear';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        const list = Object.keys(counts).sort();
        return {
            categories: ['all', ...list],
            counts: { all: shopItems.length, ...counts }
        };
    }, [shopItems]);

    // Filtered & Sorted items
    const filteredItems = useMemo(() => {
        return shopItems.filter(item => {
            // Search matching
            if (searchTerm.trim()) {
                const q = searchTerm.toLowerCase();
                const matchName = item.name.toLowerCase().includes(q);
                const matchDesc = (item.description || '').toLowerCase().includes(q);
                const matchCategory = (item.category || '').toLowerCase().includes(q);
                const matchSku = (item.sku || '').toLowerCase().includes(q);
                if (!matchName && !matchDesc && !matchCategory && !matchSku) return false;
            }

            // Category filter
            if (selectedCategory !== 'all' && (item.category || 'Gear') !== selectedCategory) {
                return false;
            }

            // In stock only
            if (inStockOnly && (item.stock <= 0)) {
                return false;
            }

            // Wishlist only
            if (wishlistOnly && !wishlistIds.includes(item.id)) {
                return false;
            }

            return true;
        }).sort((a, b) => {
            if (sortBy === 'priceLow') {
                return (a.salePrice || 0) - (b.salePrice || 0);
            }
            if (sortBy === 'priceHigh') {
                return (b.salePrice || 0) - (a.salePrice || 0);
            }
            if (sortBy === 'stock') {
                return (b.stock || 0) - (a.stock || 0);
            }
            // Featured: In-stock items first, then higher stock
            const aStock = (a.stock || 0) > 0 ? 1 : 0;
            const bStock = (b.stock || 0) > 0 ? 1 : 0;
            if (bStock !== aStock) return bStock - aStock;
            return (b.stock || 0) - (a.stock || 0);
        });
    }, [shopItems, searchTerm, selectedCategory, inStockOnly, wishlistOnly, wishlistIds, sortBy]);

    // Group items by category if viewing 'all' and no active search
    const categorizedGroups = useMemo(() => {
        if (selectedCategory !== 'all' || searchTerm.trim() || wishlistOnly) {
            return null;
        }
        const groups: Record<string, InventoryItem[]> = {};
        filteredItems.forEach(item => {
            const cat = item.category || 'General';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });
        return groups;
    }, [filteredItems, selectedCategory, searchTerm, wishlistOnly]);

    return (
        <div className="w-full space-y-3 font-sans">
            {/* Top Free-View Header Banner (Shrink to fit, 3D Depth Shadowing) */}
            <div className="relative rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-black p-3.5 sm:p-4 shadow-[0_16px_36px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/25 via-zinc-900 to-zinc-950 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider font-mono">
                                    Tactical Field Shop
                                </h2>
                                <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-amber-500/15 text-amber-300">
                                    <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                                    SHOP CATALOGUE
                                </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                Showing items marked for shop ({shopItems.length} products available)
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats Pill Strip */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center font-mono text-xs">
                        <div className="px-3 py-1.5 rounded-xl bg-zinc-900/90 text-center shadow-sm">
                            <span className="text-[8.5px] text-zinc-500 block uppercase">Shop Stock</span>
                            <span className="text-[11px] font-bold text-white">{shopItems.length} Items</span>
                        </div>
                        {wishlistIds.length > 0 && (
                            <button
                                onClick={() => setWishlistOnly(v => !v)}
                                className={`px-3 py-1.5 rounded-xl transition-all shadow-sm text-center shrink-0 ${
                                    wishlistOnly 
                                        ? 'bg-amber-600 text-white shadow-md' 
                                        : 'bg-zinc-900/90 text-zinc-300 hover:text-white'
                                }`}
                            >
                                <span className="text-[8.5px] block uppercase">Wishlist</span>
                                <span className="text-[11px] font-bold flex items-center justify-center gap-1">
                                    <Bookmark className="w-3 h-3 fill-current" />
                                    {wishlistIds.length} Saved
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Instant Filter & Search Station (Shrink to Fit Top Bar) */}
            <div className="p-3 rounded-2xl bg-zinc-950/80 shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md space-y-2">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    {/* Search Input */}
                    <div className="relative flex-1 w-full">
                        <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Search shop products (name, sku, category)..."
                            className="w-full bg-zinc-900/90 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 border-0 shadow-inner"
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

                    {/* Quick Filter Toggles & Sort */}
                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-end">
                        <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-900/80 text-[10px] font-mono text-zinc-300 cursor-pointer hover:bg-zinc-800 transition-colors shadow-sm">
                            <CheckCircle className="w-3 h-3 text-emerald-400" />
                            <span>In Stock Only</span>
                            <input
                                type="checkbox"
                                checked={inStockOnly}
                                onChange={e => setInStockOnly(e.target.checked)}
                                className="h-3 w-3 rounded bg-zinc-800 border-0 text-emerald-500 focus:ring-emerald-500 ml-0.5"
                            />
                        </label>

                        <div className="flex items-center gap-1 text-[10px] font-mono">
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value as any)}
                                className="bg-zinc-900 text-zinc-200 rounded-xl px-2 py-1 text-[10px] font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 border-0 shadow-sm"
                            >
                                <option value="featured">Sort: Featured</option>
                                <option value="priceLow">Price: Low &rarr; High</option>
                                <option value="priceHigh">Price: High &rarr; Low</option>
                                <option value="stock">Highest Stock</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Category Pills (Shrink to Fit Horizontal Scroll Strip) */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none pt-0.5">
                    {categoryStats.categories.map(cat => {
                        const isActive = selectedCategory === cat;
                        const count = categoryStats.counts[cat] || 0;

                        return (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 transition-all shadow-sm ${
                                    isActive
                                        ? 'bg-amber-600 text-white shadow-[0_4px_12px_rgba(217,119,6,0.4)] scale-[1.02]'
                                        : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800'
                                }`}
                            >
                                <span>{cat === 'all' ? 'All Items' : cat}</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[8.5px] ${isActive ? 'bg-black/30 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Products Display (Shrink-To-Fit 3 Images in a Row with Floating Price Tags) */}
            <div className="space-y-3">
                {/* Active Filter Bar & Results Count */}
                <div className="flex items-center justify-between px-1 text-xs font-mono">
                    <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span>{selectedCategory === 'all' ? 'Shop Products' : selectedCategory}</span>
                        <span className="text-zinc-500 text-[10px]">({filteredItems.length} items)</span>
                    </span>

                    {(inStockOnly || wishlistOnly || selectedCategory !== 'all' || searchTerm) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('all');
                                setInStockOnly(false);
                                setWishlistOnly(false);
                            }}
                            className="text-[9.5px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-2.5 h-2.5" />
                            <span>Reset Filters</span>
                        </button>
                    )}
                </div>

                {/* Empty State */}
                {filteredItems.length === 0 ? (
                    <div className="p-12 text-center rounded-2xl bg-zinc-950/60 shadow-md text-zinc-500 space-y-2">
                        <ShoppingBag className="w-8 h-8 mx-auto text-zinc-600" />
                        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
                            No Products Found
                        </h4>
                        <p className="text-[11px] text-zinc-500 max-w-md mx-auto leading-relaxed">
                            {shopItems.length === 0 
                                ? 'No inventory items are toggled as "In Shop" in the Inventory tab.'
                                : 'Adjust your category filter, clear the search text, or turn off "In Stock Only" to view all shop items.'
                            }
                        </p>
                    </div>
                ) : categorizedGroups ? (
                    /* Categorized Grouped Layout (3 Products in a Row) */
                    <div className="space-y-4">
                        {Object.entries(categorizedGroups).map(([groupName, items]) => (
                            <div key={groupName} className="space-y-2">
                                {/* Department Header */}
                                <div className="flex items-center justify-between pb-1 border-b border-white/5">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm" />
                                        <h4 className="text-[11px] font-mono font-black text-white uppercase tracking-wider">
                                            {groupName}
                                        </h4>
                                        <span className="text-[9px] font-mono text-zinc-500">
                                            ({items.length})
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCategory(groupName)}
                                        className="text-[9.5px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-0.5 transition-colors"
                                    >
                                        <span>View Only</span>
                                        <ChevronRight className="w-3 h-3" />
                                    </button>
                                </div>

                                {/* 3 Product Images in a Row Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-2.5">
                                    {items.map(item => renderItemCard(item))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Flat Grid Layout (3 Product Images in a Row) */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-2.5">
                        {filteredItems.map(item => renderItemCard(item))}
                    </div>
                )}
            </div>

            {/* Inspect Product Modal (Detailed User-Friendly Specs, Zero Outlines) */}
            {inspectingItem && (
                <Modal isOpen={true} onClose={() => setInspectingItem(null)} title={inspectingItem.name}>
                    <div className="space-y-3 text-xs font-sans">
                        {/* High-res Image Preview */}
                        {inspectingItem.imageUrl ? (
                            <div className="w-full h-48 rounded-2xl bg-zinc-950 overflow-hidden shadow-inner flex items-center justify-center p-2 relative">
                                <img
                                    src={inspectingItem.imageUrl}
                                    alt={inspectingItem.name}
                                    className="w-full h-full object-contain rounded-xl"
                                />
                                {/* Prominent Price Tag on Modal Image */}
                                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-black/90 backdrop-blur-md shadow-lg border border-emerald-500/30 font-mono font-black text-emerald-400 text-sm flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>R{(inspectingItem.salePrice || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-32 rounded-2xl bg-zinc-950 flex flex-col items-center justify-center text-zinc-600 space-y-1 shadow-inner relative">
                                <Package className="w-8 h-8 text-zinc-700" />
                                <span className="text-[9px] font-mono uppercase tracking-widest text-zinc-500">
                                    Bosjol Tactical Shop
                                </span>
                                <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-lg bg-black/90 font-mono font-black text-emerald-400 text-xs">
                                    R{(inspectingItem.salePrice || 0).toFixed(2)}
                                </div>
                            </div>
                        )}

                        {/* Specs Micro-Grid */}
                        <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-zinc-900/90 shadow-sm font-mono">
                            <div>
                                <span className="text-[9px] text-zinc-500 uppercase block">Retail Price</span>
                                <span className="text-base font-black text-emerald-400">
                                    R{(inspectingItem.salePrice || 0).toFixed(2)}
                                </span>
                            </div>
                            <div>
                                <span className="text-[9px] text-zinc-500 uppercase block">Current Stock</span>
                                <span className={`text-xs font-bold ${inspectingItem.stock > 0 ? 'text-white' : 'text-red-400'}`}>
                                    {inspectingItem.stock > 0 ? `${inspectingItem.stock} in stock` : 'Sold Out'}
                                </span>
                            </div>
                            <div>
                                <span className="text-[9px] text-zinc-500 uppercase block">Category</span>
                                <span className="text-[11px] text-zinc-300">{inspectingItem.category || 'Gear'}</span>
                            </div>
                            <div>
                                <span className="text-[9px] text-zinc-500 uppercase block">Condition</span>
                                <span className="text-[11px] text-zinc-300">{inspectingItem.condition || 'New'}</span>
                            </div>
                            {inspectingItem.sku && (
                                <div className="col-span-2">
                                    <span className="text-[9px] text-zinc-500 uppercase block">SKU / Item Code</span>
                                    <span className="text-[11px] text-zinc-400">{inspectingItem.sku}</span>
                                </div>
                            )}
                        </div>

                        {/* Full Description & Specs */}
                        {inspectingItem.description && (
                            <div className="space-y-1">
                                <h5 className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-wider">
                                    Product Information
                                </h5>
                                <div className="p-2.5 rounded-xl bg-zinc-950/80 shadow-inner text-zinc-300 text-[11px] leading-relaxed">
                                    {inspectingItem.description}
                                </div>
                            </div>
                        )}

                        {/* Counter Purchase Callout */}
                        <div className="p-2.5 rounded-xl bg-zinc-900/60 text-zinc-300 shadow-sm text-[10px] flex items-center gap-2">
                            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>
                                Available for purchase directly at the counter on game day.
                            </span>
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="pt-1.5 flex items-center justify-between gap-2">
                            <button
                                onClick={(e) => toggleWishlist(inspectingItem.id, e)}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold uppercase flex items-center gap-1.5 transition-all ${
                                    wishlistIds.includes(inspectingItem.id)
                                        ? 'bg-amber-600 text-white shadow-md'
                                        : 'bg-zinc-900 text-zinc-300 hover:text-white'
                                }`}
                            >
                                <Bookmark className="w-3 h-3 fill-current" />
                                <span>{wishlistIds.includes(inspectingItem.id) ? 'Saved' : 'Wishlist'}</span>
                            </button>

                            <button
                                onClick={() => setInspectingItem(null)}
                                className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-[11px] font-bold uppercase transition-colors shadow-sm"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );

    // Render individual item card: Shrink-to-fit 3 in a row with floating price tag on the image
    function renderItemCard(item: InventoryItem) {
        const inStock = item.stock > 0;
        const isLowStock = item.stock > 0 && item.stock <= 5;
        const isWishlisted = wishlistIds.includes(item.id);

        return (
            <div
                key={item.id}
                onClick={() => setInspectingItem(item)}
                className="group relative rounded-2xl bg-gradient-to-b from-zinc-900/80 via-zinc-950 to-black p-2 sm:p-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(255,255,255,0.12)] transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99] overflow-hidden"
            >
                {/* Subtle 3D Top Sheen */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div>
                    {/* Image Box with Floating Price Tag Badge */}
                    <div className="w-full h-24 sm:h-28 rounded-xl bg-zinc-950 overflow-hidden relative mb-2 shadow-inner flex items-center justify-center">
                        {item.imageUrl ? (
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-zinc-700 space-y-0.5">
                                <Package className="w-6 h-6 text-zinc-600" />
                                <span className="text-[7.5px] uppercase font-mono tracking-wider">Shop Item</span>
                            </div>
                        )}

                        {/* Prominent Price Tag Showcase on the Product Image */}
                        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded-lg bg-black/85 backdrop-blur-md text-emerald-400 font-mono font-black text-[11px] shadow-md border border-emerald-500/25 flex items-center gap-1">
                                <Tag className="w-2.5 h-2.5 text-emerald-400" />
                                <span>R{(item.salePrice || 0).toFixed(0)}</span>
                            </span>
                        </div>

                        {/* Floating Stock Pill on Top-Left */}
                        <div className="absolute top-1.5 left-1.5">
                            <span className={`px-1.5 py-0.2 rounded-md text-[8px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                                !inStock
                                    ? 'bg-red-950/90 text-red-300'
                                    : isLowStock
                                    ? 'bg-amber-950/90 text-amber-300'
                                    : 'bg-zinc-950/90 text-zinc-300'
                            }`}>
                                {!inStock ? 'Sold Out' : isLowStock ? `Low (${item.stock})` : `${item.stock} left`}
                            </span>
                        </div>

                        {/* Wishlist Bookmark Button on Top-Right */}
                        <button
                            type="button"
                            onClick={(e) => toggleWishlist(item.id, e)}
                            className={`absolute top-1.5 right-1.5 p-1 rounded-lg backdrop-blur-md shadow-sm transition-all ${
                                isWishlisted 
                                    ? 'bg-amber-500 text-black scale-105' 
                                    : 'bg-black/60 text-zinc-400 hover:text-white'
                            }`}
                            title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                        >
                            <Bookmark className={`w-3 h-3 ${isWishlisted ? 'fill-current' : ''}`} />
                        </button>
                    </div>

                    {/* Category & Title */}
                    <div className="space-y-0.5">
                        <span className="text-[8px] font-mono uppercase tracking-wider text-amber-400/90 block truncate">
                            {item.category || 'Gear'}
                        </span>
                        <h4 className="font-bold text-[11px] text-white truncate group-hover:text-amber-300 transition-colors leading-tight" title={item.name}>
                            {item.name}
                        </h4>
                    </div>
                </div>

                {/* Bottom Quick Bar */}
                <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-emerald-400 font-bold font-mono">
                        R{(item.salePrice || 0).toFixed(2)}
                    </span>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setInspectingItem(item);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-[9px] font-mono font-bold uppercase flex items-center gap-0.5 transition-all shadow-sm"
                    >
                        <Eye className="w-2.5 h-2.5 text-amber-400" />
                        <span>Specs</span>
                    </button>
                </div>
            </div>
        );
    }
};
