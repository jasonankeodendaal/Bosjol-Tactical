import React, { useState, useMemo, useEffect } from 'react';
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
    PlusCircle,
    Shield,
    Crosshair,
    Zap,
    Bookmark,
    ArrowUpDown,
    Check,
    X,
    Layers,
    SlidersHorizontal,
    CircleDollarSign,
    ChevronRight
} from 'lucide-react';

interface PlayerShopShowcaseProps {
    inventory: InventoryItem[];
    player?: Player;
}

export const PlayerShopShowcase: React.FC<PlayerShopShowcaseProps> = ({ inventory, player }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [inspectingItem, setInspectingItem] = useState<InventoryItem | null>(null);
    const [rentalsOnly, setRentalsOnly] = useState<boolean>(false);
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

    // Filter items: Only available in shop
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
                const matchIncludes = (item.rentalIncludes || '').toLowerCase().includes(q);
                const matchSku = (item.sku || '').toLowerCase().includes(q);
                if (!matchName && !matchDesc && !matchCategory && !matchIncludes && !matchSku) return false;
            }

            // Category filter
            if (selectedCategory !== 'all' && (item.category || 'Gear') !== selectedCategory) {
                return false;
            }

            // Rentals only
            if (rentalsOnly) {
                const isRental = item.isRental || /rental/i.test(item.name);
                if (!isRental) return false;
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
            // Featured: Rentals and in-stock items first
            const aRental = a.isRental || /rental/i.test(a.name) ? 1 : 0;
            const bRental = b.isRental || /rental/i.test(b.name) ? 1 : 0;
            if (bRental !== aRental) return bRental - aRental;
            return (b.stock || 0) - (a.stock || 0);
        });
    }, [shopItems, searchTerm, selectedCategory, rentalsOnly, inStockOnly, wishlistOnly, wishlistIds, sortBy]);

    // Highlighted spotlight item (e.g. primary rental or highest stock item)
    const spotlightItem = useMemo(() => {
        return shopItems.find(i => (i.isRental || /rental/i.test(i.name)) && i.stock > 0 && i.imageUrl) || shopItems[0] || null;
    }, [shopItems]);

    // Group items by category if viewing 'all' and no active search
    const categorizedGroups = useMemo(() => {
        if (selectedCategory !== 'all' || searchTerm.trim() || wishlistOnly || rentalsOnly) {
            return null;
        }
        const groups: Record<string, InventoryItem[]> = {};
        filteredItems.forEach(item => {
            const cat = item.category || 'General Armory';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });
        return groups;
    }, [filteredItems, selectedCategory, searchTerm, wishlistOnly, rentalsOnly]);

    return (
        <div className="w-full space-y-4">
            {/* Top Free-View Header Banner (3D Depth Shadowing, No Box Outlines) */}
            <div className="relative rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-black p-5 sm:p-6 shadow-[0_24px_50px_rgba(0,0,0,0.95),inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-xl overflow-hidden">
                <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500/25 via-zinc-900 to-zinc-950 text-amber-400 flex items-center justify-center shrink-0 shadow-[0_12px_30px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.15)]">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-mono">
                                    Tactical Armory & Field Shop
                                </h2>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 shadow-inner">
                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                    OPERATOR CATALOGUE
                                </span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed mt-0.5">
                                Browse items available in the shop catalogue. Only items toggled for shop in the inventory are showcased here.
                            </p>
                        </div>
                    </div>

                    {/* Quick Stats Pill Strip */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 shrink-0 font-mono text-xs">
                        <div className="px-3.5 py-2 rounded-2xl bg-zinc-900/90 shadow-[0_8px_20px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.06)] text-center shrink-0">
                            <span className="text-[9px] text-zinc-500 block uppercase tracking-wider">Armory Stock</span>
                            <span className="text-xs font-bold text-white">{shopItems.length} Products</span>
                        </div>
                        <div className="px-3.5 py-2 rounded-2xl bg-zinc-900/90 shadow-[0_8px_20px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.06)] text-center shrink-0">
                            <span className="text-[9px] text-zinc-500 block uppercase tracking-wider">Rental Units</span>
                            <span className="text-xs font-bold text-amber-400">
                                {shopItems.filter(i => i.isRental || /rental/i.test(i.name)).length} Available
                            </span>
                        </div>
                        {wishlistIds.length > 0 && (
                            <button
                                onClick={() => setWishlistOnly(v => !v)}
                                className={`px-3.5 py-2 rounded-2xl transition-all shadow-[0_8px_20px_rgba(0,0,0,0.6)] text-center shrink-0 ${
                                    wishlistOnly 
                                        ? 'bg-amber-600 text-white shadow-[0_8px_20px_rgba(217,119,6,0.5)]' 
                                        : 'bg-zinc-900/90 text-zinc-300 hover:text-white'
                                }`}
                            >
                                <span className="text-[9px] block uppercase tracking-wider">Saved Wishlist</span>
                                <span className="text-xs font-bold flex items-center justify-center gap-1">
                                    <Bookmark className="w-3 h-3 fill-current" />
                                    {wishlistIds.length} Saved
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Side-by-Side Main Content (Side by Side Free-View, No Box Container Outlines) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left Side Rail: Categorized Navigation, Quick Filters & Armory Spotlight */}
                <div className="lg:col-span-4 xl:col-span-3.5 space-y-3.5">
                    {/* Search & Filter Station */}
                    <div className="p-4 rounded-3xl bg-zinc-950/80 shadow-[0_20px_45px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl space-y-3">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search replicas, BBs, gas, gear..."
                                className="w-full bg-zinc-900/90 rounded-2xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 border-0 shadow-inner"
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

                        {/* Sort Order Selector */}
                        <div className="flex items-center justify-between gap-2 text-xs font-mono">
                            <span className="text-[10px] uppercase text-zinc-500 flex items-center gap-1">
                                <ArrowUpDown className="w-3 h-3 text-amber-500" />
                                <span>Sort View:</span>
                            </span>
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value as any)}
                                className="bg-zinc-900 text-white rounded-xl px-2.5 py-1 text-[11px] font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 border-0 shadow-sm"
                            >
                                <option value="featured">Featured / Priority</option>
                                <option value="priceLow">Price: Low to High</option>
                                <option value="priceHigh">Price: High to Low</option>
                                <option value="stock">Highest Stock</option>
                            </select>
                        </div>

                        {/* Quick Toggle Filters */}
                        <div className="space-y-1 pt-1 border-t border-white/5 font-mono text-[11px]">
                            <label className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 cursor-pointer transition-colors">
                                <span className="flex items-center gap-1.5 text-zinc-300">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                    <span>Rentals & Packages Only</span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={rentalsOnly}
                                    onChange={e => setRentalsOnly(e.target.checked)}
                                    className="h-3.5 w-3.5 rounded bg-zinc-800 border-0 text-amber-500 focus:ring-amber-500"
                                />
                            </label>

                            <label className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 cursor-pointer transition-colors">
                                <span className="flex items-center gap-1.5 text-zinc-300">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>In Stock Available Only</span>
                                </span>
                                <input
                                    type="checkbox"
                                    checked={inStockOnly}
                                    onChange={e => setInStockOnly(e.target.checked)}
                                    className="h-3.5 w-3.5 rounded bg-zinc-800 border-0 text-emerald-500 focus:ring-emerald-500"
                                />
                            </label>

                            {wishlistIds.length > 0 && (
                                <label className="flex items-center justify-between p-2 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 cursor-pointer transition-colors">
                                    <span className="flex items-center gap-1.5 text-zinc-300">
                                        <Bookmark className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                        <span>My Saved Wishlist ({wishlistIds.length})</span>
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={wishlistOnly}
                                        onChange={e => setWishlistOnly(e.target.checked)}
                                        className="h-3.5 w-3.5 rounded bg-zinc-800 border-0 text-amber-500 focus:ring-amber-500"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Categorized Vertical Rail (Clean, Top Class, Shrink to Fit) */}
                    <div className="p-4 rounded-3xl bg-zinc-950/80 shadow-[0_20px_45px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-xl space-y-2">
                        <div className="flex items-center justify-between pb-2 border-b border-white/5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-amber-500" />
                                <span>Armory Categories</span>
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">{categoryStats.categories.length - 1} Departments</span>
                        </div>

                        <div className="space-y-1">
                            {categoryStats.categories.map(cat => {
                                const isActive = selectedCategory === cat;
                                const count = categoryStats.counts[cat] || 0;

                                return (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full text-left px-3 py-2 rounded-2xl text-xs font-mono font-bold flex items-center justify-between transition-all active:scale-[0.99] ${
                                            isActive
                                                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-[0_6px_18px_rgba(217,119,6,0.45)]'
                                                : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 hover:text-white'
                                        }`}
                                    >
                                        <span className="truncate uppercase tracking-wider text-[11px]">
                                            {cat === 'all' ? 'All Armory Stock' : cat}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] shrink-0 ml-1 font-mono ${
                                            isActive ? 'bg-black/30 text-white' : 'bg-zinc-800 text-zinc-400'
                                        }`}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Armory Spotlight / Featured Card */}
                    {spotlightItem && (
                        <div 
                            onClick={() => setInspectingItem(spotlightItem)}
                            className="p-4 rounded-3xl bg-gradient-to-b from-amber-950/30 via-zinc-950 to-black shadow-[0_20px_45px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(245,158,11,0.2)] cursor-pointer group space-y-2.5 transition-all hover:scale-[1.01]"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
                                    ARMORY SPOTLIGHT
                                </span>
                                <span className="text-[10px] font-mono font-bold text-emerald-400">
                                    R{(spotlightItem.salePrice || 0).toFixed(2)}
                                </span>
                            </div>

                            {spotlightItem.imageUrl && (
                                <div className="w-full h-32 rounded-2xl bg-zinc-950 overflow-hidden relative shadow-inner flex items-center justify-center">
                                    <img
                                        src={spotlightItem.imageUrl}
                                        alt={spotlightItem.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                    <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded-md bg-black/80 text-[8px] font-mono text-amber-300">
                                        Tap to Inspect
                                    </span>
                                </div>
                            )}

                            <div>
                                <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                                    {spotlightItem.name}
                                </h4>
                                {spotlightItem.rentalIncludes && (
                                    <p className="text-[10px] text-amber-200/90 font-mono line-clamp-2 mt-0.5">
                                        Includes: {spotlightItem.rentalIncludes}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side Main Area: Categorized Open-Spaced Grid (Shrink to Fit, No Box Outlines) */}
                <div className="lg:col-span-8 xl:col-span-8.5 space-y-4">
                    {/* Active Filter Bar & Results Count */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
                                <span>{selectedCategory === 'all' ? 'All Armory Inventory' : selectedCategory}</span>
                                <span className="text-xs font-normal text-zinc-500">
                                    ({filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'})
                                </span>
                            </h3>
                            {searchTerm && (
                                <p className="text-[11px] text-amber-400 font-mono mt-0.5">
                                    Filtering matching "{searchTerm}"
                                </p>
                            )}
                        </div>

                        {/* Active filter reset tags */}
                        {(rentalsOnly || inStockOnly || wishlistOnly || selectedCategory !== 'all' || searchTerm) && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('all');
                                    setRentalsOnly(false);
                                    setInStockOnly(false);
                                    setWishlistOnly(false);
                                }}
                                className="text-[10px] font-mono text-zinc-400 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors self-start sm:self-center"
                            >
                                <X className="w-3 h-3" />
                                <span>Reset Filters</span>
                            </button>
                        )}
                    </div>

                    {/* Empty State */}
                    {filteredItems.length === 0 ? (
                        <div className="p-16 text-center rounded-3xl bg-zinc-950/60 shadow-[0_20px_45px_rgba(0,0,0,0.85)] text-zinc-500 space-y-3">
                            <ShoppingBag className="w-10 h-10 mx-auto text-zinc-600" />
                            <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider font-mono">
                                No Equipment Found Matching Query
                            </h4>
                            <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                                Adjust your category filter, clear the search text, or turn off "In Stock Only" to view all available field inventory.
                            </p>
                        </div>
                    ) : categorizedGroups ? (
                        /* Categorized Grouped Layout (Top Class, Open Spaced, Side-by-Side Sections) */
                        <div className="space-y-6">
                            {Object.entries(categorizedGroups).map(([groupName, items]) => (
                                <div key={groupName} className="space-y-3">
                                    {/* Department Header */}
                                    <div className="flex items-center justify-between pb-1 border-b border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-amber-500 shadow-sm" />
                                            <h4 className="text-xs font-mono font-black text-white uppercase tracking-wider">
                                                {groupName}
                                            </h4>
                                            <span className="text-[10px] font-mono text-zinc-500">
                                                ({items.length})
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => setSelectedCategory(groupName)}
                                            className="text-[10px] font-mono text-amber-400 hover:text-amber-300 flex items-center gap-0.5 transition-colors"
                                        >
                                            <span>View Only</span>
                                            <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {/* Items Side-by-Side Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                                        {items.map(item => renderItemCard(item))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Flat Grid Layout (When filtered or searching) */
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                            {filteredItems.map(item => renderItemCard(item))}
                        </div>
                    )}
                </div>
            </div>

            {/* Inspect Product Modal (Detailed User-Friendly Specs, Zero Outlines) */}
            {inspectingItem && (
                <Modal isOpen={true} onClose={() => setInspectingItem(null)} title={inspectingItem.name}>
                    <div className="space-y-4 text-xs font-sans">
                        {/* High-res Image Preview */}
                        {inspectingItem.imageUrl ? (
                            <div className="w-full h-56 rounded-3xl bg-zinc-950 overflow-hidden shadow-[0_16px_35px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.06)] flex items-center justify-center p-3">
                                <img
                                    src={inspectingItem.imageUrl}
                                    alt={inspectingItem.name}
                                    className="w-full h-full object-contain rounded-2xl"
                                />
                            </div>
                        ) : (
                            <div className="w-full h-36 rounded-3xl bg-zinc-950 flex flex-col items-center justify-center text-zinc-600 space-y-1 shadow-inner">
                                <Package className="w-9 h-9 text-zinc-700" />
                                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                                    Bosjol Tactical Armory
                                </span>
                            </div>
                        )}

                        {/* Specs Micro-Grid (Borderless 3D Depth) */}
                        <div className="grid grid-cols-2 gap-2.5 p-4 rounded-3xl bg-zinc-900/90 shadow-[0_12px_28px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.06)] font-mono">
                            <div>
                                <span className="text-[10px] text-zinc-500 uppercase block">Retail Counter Price</span>
                                <span className="text-lg font-black text-emerald-400">
                                    R{(inspectingItem.salePrice || 0).toFixed(2)}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-zinc-500 uppercase block">Current Stock</span>
                                <span className={`text-sm font-bold ${inspectingItem.stock > 0 ? 'text-white' : 'text-red-400'}`}>
                                    {inspectingItem.stock > 0 ? `${inspectingItem.stock} Units in Armory` : 'Sold Out'}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] text-zinc-500 uppercase block">Category</span>
                                <span className="text-xs text-zinc-300">{inspectingItem.category || 'Gear'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] text-zinc-500 uppercase block">Condition</span>
                                <span className="text-xs text-zinc-300">{inspectingItem.condition || 'Field Ready'}</span>
                            </div>
                            {inspectingItem.sku && (
                                <div>
                                    <span className="text-[10px] text-zinc-500 uppercase block">SKU / Code</span>
                                    <span className="text-xs text-zinc-400">{inspectingItem.sku}</span>
                                </div>
                            )}
                        </div>

                        {/* Rental Package Inclusions Breakdown (Prominently Highlighted) */}
                        {(inspectingItem.isRental || /rental/i.test(inspectingItem.name) || inspectingItem.rentalIncludes) && (
                            <div className="space-y-1.5 p-4 rounded-3xl bg-amber-950/30 shadow-[0_10px_25px_rgba(245,158,11,0.15)] text-amber-200">
                                <h5 className="text-[11px] font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-amber-400" />
                                    <span>Included With This Rental Package</span>
                                </h5>
                                <p className="text-xs font-mono text-amber-100 leading-relaxed">
                                    {inspectingItem.rentalIncludes || 'Includes standard replica rifle, high-capacity magazine, battery, charger, and full-face protective mask.'}
                                </p>
                            </div>
                        )}

                        {/* Full Description & Specs */}
                        {inspectingItem.description && (
                            <div className="space-y-1">
                                <h5 className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-wider">
                                    Item Specifications & Information
                                </h5>
                                <div className="p-3.5 rounded-2xl bg-zinc-950/80 shadow-inner text-zinc-300 text-xs leading-relaxed">
                                    {inspectingItem.description}
                                </div>
                            </div>
                        )}

                        {/* Marshal Counter Callout */}
                        <div className="p-3.5 rounded-2xl bg-zinc-900/60 text-zinc-300 shadow-sm text-[11px] flex items-center gap-2.5">
                            <Info className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>
                                Ready to deploy with this gear? Inform the Marshal at the counter or assign it during your event sign-up.
                            </span>
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="pt-2 flex items-center justify-between gap-2">
                            <button
                                onClick={(e) => toggleWishlist(inspectingItem.id, e)}
                                className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold uppercase flex items-center gap-1.5 transition-all ${
                                    wishlistIds.includes(inspectingItem.id)
                                        ? 'bg-amber-600 text-white shadow-md'
                                        : 'bg-zinc-900 text-zinc-300 hover:text-white'
                                }`}
                            >
                                <Bookmark className="w-3.5 h-3.5 fill-current" />
                                <span>{wishlistIds.includes(inspectingItem.id) ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
                            </button>

                            <button
                                onClick={() => setInspectingItem(null)}
                                className="px-5 py-2 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono text-xs font-bold uppercase transition-colors shadow-sm"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );

    // Render individual item card with 3D Depth Shadowing and Zero Box Outlines
    function renderItemCard(item: InventoryItem) {
        const inStock = item.stock > 0;
        const isLowStock = item.stock > 0 && item.stock <= 5;
        const isRental = item.isRental || /rental/i.test(item.name);
        const isWishlisted = wishlistIds.includes(item.id);

        return (
            <div
                key={item.id}
                onClick={() => setInspectingItem(item)}
                className="group relative rounded-3xl bg-gradient-to-b from-zinc-900/80 via-zinc-950 to-black p-4 shadow-[0_16px_35px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.07)] hover:shadow-[0_22px_45px_rgba(0,0,0,0.98),inset_0_1px_0_0_rgba(255,255,255,0.14)] transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99] overflow-hidden"
            >
                {/* Subtle 3D Top Sheen */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/[0.03] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div>
                    {/* Image Box (Zero Outline, Inner Depth) */}
                    <div className="w-full h-36 sm:h-40 rounded-2xl bg-zinc-950 overflow-hidden relative mb-3 shadow-[0_10px_22px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.05)] flex items-center justify-center">
                        {item.imageUrl ? (
                            <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-zinc-700 space-y-1">
                                <Package className="w-9 h-9 text-zinc-600" />
                                <span className="text-[9px] uppercase font-mono tracking-wider">Armory Stock</span>
                            </div>
                        )}

                        {/* Floating Stock Pill */}
                        <div className="absolute top-2 left-2 flex items-center gap-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-md ${
                                !inStock
                                    ? 'bg-red-950/90 text-red-300'
                                    : isLowStock
                                    ? 'bg-amber-950/90 text-amber-300'
                                    : 'bg-emerald-950/90 text-emerald-300'
                            }`}>
                                {!inStock ? 'Sold Out' : isLowStock ? `Low (${item.stock})` : `${item.stock} in stock`}
                            </span>
                        </div>

                        {/* Rental Badge */}
                        {isRental && (
                            <div className="absolute top-2 right-2">
                                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-amber-500/95 text-black shadow-md flex items-center gap-1">
                                    <Sparkles className="w-2.5 h-2.5" />
                                    <span>RENTAL</span>
                                </span>
                            </div>
                        )}

                        {/* Wishlist Bookmark Button */}
                        <button
                            type="button"
                            onClick={(e) => toggleWishlist(item.id, e)}
                            className={`absolute bottom-2 right-2 p-1.5 rounded-xl backdrop-blur-md shadow-md transition-all ${
                                isWishlisted 
                                    ? 'bg-amber-500 text-black scale-105' 
                                    : 'bg-black/60 text-zinc-400 hover:text-white'
                            }`}
                            title={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                        >
                            <Bookmark className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-current' : ''}`} />
                        </button>
                    </div>

                    {/* Category & Title */}
                    <span className="text-[9px] font-mono uppercase tracking-wider text-amber-400/90 block truncate mb-0.5">
                        {item.category || 'General Armory'}
                    </span>
                    <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-amber-300 transition-colors" title={item.name}>
                        {item.name}
                    </h4>

                    {/* Rental Inclusions Pill */}
                    {isRental && (
                        <div className="mt-1.5 p-2 rounded-2xl bg-amber-950/30 text-[10px] text-amber-200 flex items-center gap-1.5 shadow-inner">
                            <PlusCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate font-mono">
                                {item.rentalIncludes ? `Includes: ${item.rentalIncludes}` : 'Includes replica, mask, battery & BBs'}
                            </span>
                        </div>
                    )}

                    {/* Description snippet for non-rentals */}
                    {item.description && !isRental && (
                        <p className="text-[10px] text-zinc-400 line-clamp-2 mt-1.5 leading-snug">
                            {item.description}
                        </p>
                    )}
                </div>

                {/* Price Tag & Action */}
                <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between">
                    <div>
                        <span className="text-[8px] text-zinc-500 uppercase font-mono block">Counter Price</span>
                        <span className="text-sm sm:text-base font-mono font-black text-emerald-400">
                            R{(item.salePrice || 0).toFixed(2)}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setInspectingItem(item);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1 transition-all shadow-sm active:scale-95"
                    >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Specs</span>
                    </button>
                </div>
            </div>
        );
    }
};
