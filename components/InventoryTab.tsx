import React, { useState, useMemo } from 'react';
import type { InventoryItem, Supplier } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { ArchiveBoxIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, InformationCircleIcon } from './icons/Icons';
import { HelpCircle, Sparkles, ChevronRight, Copy, Check, ShieldCheck, Tag, Layers, RefreshCw, Cpu, CheckCircle2, ShoppingBag } from 'lucide-react';
import { INVENTORY_CATEGORIES, INVENTORY_CONDITIONS } from '../constants';
import { BadgePill } from './BadgePill';
import { UrlOrUploadField } from './UrlOrUploadField';

interface InventoryTabProps {
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    suppliers: Supplier[];
    addDoc: <T extends {}>(collectionName: string, data: T) => Promise<void>;
    updateDoc: <T extends { id: string; }>(collectionName: string, doc: T) => Promise<void>;
    deleteDoc: (collectionName: string, docId: string) => Promise<void>;
}

const isRentalName = (name?: string) => {
    if (!name) return false;
    return /rental/i.test(name.trim());
};

const InventoryEditorModal: React.FC<{ 
    item: Partial<InventoryItem>, 
    onClose: () => void, 
    onSave: (item: InventoryItem | Omit<InventoryItem, 'id'>) => void, 
    suppliers: Supplier[] 
}> = ({ item, onClose, onSave, suppliers }) => {
    const initialName = item.name || '';
    const initialIsRental = item.isRental || isRentalName(initialName);

    const [formData, setFormData] = useState<Omit<InventoryItem, 'id'>>({
        name: initialName,
        description: item.description || '',
        salePrice: item.salePrice || 0,
        stock: item.stock || 0,
        type: item.type || 'Weapon',
        isRental: initialIsRental,
        availableInShop: item.availableInShop ?? false,
        imageUrl: item.imageUrl || '',
        category: item.category || 'AEG Rifle',
        condition: item.condition || 'New',
        purchasePrice: item.purchasePrice || 0,
        reorderLevel: item.reorderLevel || 0,
        supplierId: item.supplierId || '',
        sku: item.sku || '',
    });

    const handleNameChange = (val: string) => {
        setFormData(f => ({
            ...f,
            name: val,
            isRental: isRentalName(val) ? true : f.isRental
        }));
    };

    const handleSaveClick = () => {
        const autoRental = formData.isRental || isRentalName(formData.name);
        const finalItem = { ...item, ...formData, isRental: autoRental };
        onSave(finalItem);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={item.id ? 'Edit Inventory Item' : 'Add New Inventory Item'}>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 text-xs">
                <div>
                    <Input label="Item Name" value={formData.name} onChange={e => handleNameChange(e.target.value)} />
                    {isRentalName(formData.name) && (
                        <p className="text-[10px] text-blue-400 font-semibold mt-1 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 shrink-0" />
                            <span>Rental name detected — automatically marked for rental availability</span>
                        </p>
                    )}
                </div>

                {/* Product Image Upload for Shop Showcase */}
                <div>
                    <UrlOrUploadField
                        label="Product Image (Shop Showcase & Catalog)"
                        value={formData.imageUrl || ''}
                        onChange={(val) => setFormData(f => ({ ...f, imageUrl: val }))}
                        placeholder="https://... or upload tactical item image"
                    />
                </div>

                {/* Shop Showcase Toggle */}
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-950/30 to-zinc-900 border border-amber-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                            <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                            <p className="font-bold text-white text-xs">Available in Shop</p>
                            <p className="text-[10px] text-zinc-400">Display item in Shop Showcase for operators & enable Admin POS counter sales</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFormData(f => ({ ...f, availableInShop: !f.availableInShop }))}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            formData.availableInShop ? 'bg-amber-500' : 'bg-zinc-700'
                        }`}
                        title={formData.availableInShop ? "Disable shop availability" : "Enable shop availability"}
                    >
                        <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                formData.availableInShop ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                    </button>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                    <textarea 
                        value={formData.description} 
                        onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} 
                        rows={2} 
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500" 
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Input label="Price (ZAR)" type="number" value={formData.salePrice} onChange={e => setFormData(f => ({ ...f, salePrice: Number(e.target.value) }))} />
                    <Input label="Stock" type="number" value={formData.stock} onChange={e => setFormData(f => ({ ...f, stock: Number(e.target.value) }))} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <Input label="Cost Price" type="number" value={formData.purchasePrice} onChange={e => setFormData(f => ({ ...f, purchasePrice: Number(e.target.value) }))} />
                    <Input label="Reorder Alert" type="number" value={formData.reorderLevel} onChange={e => setFormData(f => ({ ...f, reorderLevel: Number(e.target.value) }))} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                     <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
                        <select 
                            value={formData.category} 
                            onChange={e => setFormData(p => ({...p, category: e.target.value as InventoryItem['category']}))} 
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                        >
                            {INVENTORY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Condition</label>
                        <select 
                            value={formData.condition} 
                            onChange={e => setFormData(p => ({...p, condition: e.target.value as InventoryItem['condition']}))} 
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                        >
                            {INVENTORY_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Supplier</label>
                    <select 
                        value={formData.supplierId} 
                        onChange={e => setFormData(p => ({...p, supplierId: e.target.value}))} 
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                    >
                        <option value="">None</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="flex items-center pt-1">
                    <input 
                        type="checkbox" 
                        id="isRental" 
                        checked={formData.isRental} 
                        onChange={e => setFormData(f => ({...f, isRental: e.target.checked}))} 
                        className="h-4 w-4 rounded border-gray-600 bg-zinc-700 text-red-500 focus:ring-red-500"
                    />
                    <label htmlFor="isRental" className="ml-2 text-xs text-gray-300">Available for Rental Gear Hires</label>
                </div>

                {(formData.isRental || isRentalName(formData.name)) && (
                    <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-2">
                        <label className="block text-xs font-bold text-blue-300 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                            + Add What Is Included with Rental (e.g. AEG Rifle, Mag, Battery, Mask)
                        </label>
                        <textarea
                            value={formData.rentalIncludes || ''}
                            onChange={e => setFormData(f => ({ ...f, rentalIncludes: e.target.value }))}
                            placeholder="List included items for Rental 1, 2, 3 etc. (e.g., 1x M4 Rifle, 1x High-Cap Magazine, 1x 9.6V Battery, 1x Full Face Mask)"
                            rows={2}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                )}
            </div>
            <div className="mt-4">
                <Button className="w-full !py-2 text-xs" onClick={handleSaveClick}>Save Item</Button>
            </div>
        </Modal>
    );
};

const InventoryItemCard: React.FC<{ 
    item: InventoryItem, 
    onEdit: (i: InventoryItem) => void, 
    onDelete: (i: InventoryItem) => void 
}> = ({ item, onEdit, onDelete }) => {
    const isLowStock = item.stock <= (item.reorderLevel || 0);

    return (
        <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700 transition-all group overflow-hidden">
            <div>
                {item.imageUrl && (
                    <div className="w-full h-24 mb-2 rounded-lg bg-zinc-950 overflow-hidden border border-zinc-800 flex items-center justify-center relative">
                        <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                        />
                        {item.availableInShop && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/90 text-black shadow flex items-center gap-0.5">
                                <ShoppingBag className="w-2.5 h-2.5" /> SHOP
                            </span>
                        )}
                    </div>
                )}
                <div className="flex justify-between items-start gap-1 mb-1">
                    <h4 className="font-bold text-xs sm:text-sm text-white truncate" title={item.name}>{item.name}</h4>
                    <div className="flex gap-1 flex-shrink-0">
                        <button 
                            onClick={() => onEdit(item)} 
                            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                        >
                            <PencilIcon className="w-3 h-3"/>
                        </button>
                        <button 
                            onClick={() => onDelete(item)} 
                            className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                        >
                            <TrashIcon className="w-3 h-3"/>
                        </button>
                    </div>
                </div>
                <p className="text-[10px] text-zinc-400 mb-1 truncate">{item.category}</p>
                {item.description && (
                    <p className="text-[10px] text-zinc-500 line-clamp-1 mb-2">{item.description}</p>
                )}
                {item.rentalIncludes && (
                    <div className="mb-2 p-1.5 rounded-lg bg-blue-950/30 border border-blue-900/50 text-[10px] text-blue-200">
                        <span className="font-bold text-blue-300">Includes:</span> {item.rentalIncludes}
                    </div>
                )}
            </div>

            <div className="pt-2 border-t border-zinc-800/50 space-y-1.5">
                <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-400">Stock:</span>
                    <span className={`font-mono font-bold ${isLowStock ? 'text-red-400' : 'text-white'}`}>
                        {item.stock}
                    </span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                    <span className="text-zinc-400">Price:</span>
                    <span className="font-mono font-bold text-emerald-400">R{item.salePrice.toFixed(0)}</span>
                </div>
                <div className="flex flex-wrap gap-1 pt-1 items-center">
                    {item.availableInShop && !item.imageUrl && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 flex items-center gap-0.5">
                            <ShoppingBag className="w-2.5 h-2.5" /> In Shop
                        </span>
                    )}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.isRental ? 'bg-blue-950/60 text-blue-300 border border-blue-800/40' : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'}`}>
                        {item.isRental ? 'Rental' : 'Sale'}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">
                        {item.condition}
                    </span>
                </div>
            </div>
        </div>
    );
};

export const InventoryTab: React.FC<InventoryTabProps> = ({ inventory, setInventory, suppliers, addDoc, updateDoc, deleteDoc }) => {
    const [isEditing, setIsEditing] = useState<Partial<InventoryItem> | null>(null);
    const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
    const [filter, setFilter] = useState<'all' | 'shop' | 'rental' | 'sale' | 'inspection'>('all');
    const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
    const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

    const filteredInventory = useMemo(() => {
        if (filter === 'shop') return inventory.filter(i => i.availableInShop);
        if (filter === 'rental') return inventory.filter(i => i.isRental);
        if (filter === 'sale') return inventory.filter(i => !i.isRental);
        if (filter === 'inspection') return inventory.filter(i => i.condition === 'Needs Inspection');
        return inventory;
    }, [inventory, filter]);

    const handleSave = (item: InventoryItem | Omit<InventoryItem, 'id'>) => {
        const autoRental = item.isRental || (item.name ? isRentalName(item.name) : false);
        const itemToSave = { ...item, isRental: autoRental };
        if ('id' in itemToSave && itemToSave.id) {
            updateDoc('inventory', itemToSave as InventoryItem);
            setSavedFeedback(`"${itemToSave.name || 'Item'}" updated! Live sync active.`);
        } else {
            addDoc('inventory', itemToSave);
            setSavedFeedback(`"${itemToSave.name || 'Item'}" added! Live sync active.`);
        }
        setTimeout(() => setSavedFeedback(null), 3500);
        setIsEditing(null);
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        deleteDoc('inventory', deletingItem.id);
        setDeletingItem(null);
        setSavedFeedback('Item removed.');
        setTimeout(() => setSavedFeedback(null), 3000);
    };

    return (
        <div className="w-full space-y-3 sm:space-y-4">
            {isEditing && (
                <InventoryEditorModal 
                    item={isEditing} 
                    onClose={() => setIsEditing(null)} 
                    onSave={handleSave} 
                    suppliers={suppliers} 
                />
            )}
            {deletingItem && (
                <Modal isOpen={true} onClose={() => setDeletingItem(null)} title="Confirm Deletion">
                    <p className="text-gray-300 text-xs">Are you sure you want to delete "{deletingItem.name}"? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="secondary" size="sm" onClick={() => setDeletingItem(null)}>Cancel</Button>
                        <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
                    </div>
                </Modal>
            )}

            {/* Enlarged Guide & Setup Modal */}
            {showGuideModal && (
                <Modal isOpen={true} onClose={() => setShowGuideModal(false)} title="Inventory Setup & Management Guide">
                    <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs text-zinc-300 custom-scrollbar">
                        {/* Summary Header */}
                        <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border border-red-500/20 flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 shrink-0 mt-0.5">
                                <Cpu className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white mb-0.5">Smart Armory & Rental Allocation System</h4>
                                <p className="text-[11px] text-zinc-400 leading-relaxed">
                                    Learn how to configure weapons, gear, pricing, and how the automatic <strong className="text-zinc-200">"Rental 1, Rental 2"</strong> sequential auto-detection works for event signups.
                                </p>
                            </div>
                        </div>

                        {/* Guide Steps */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                            {/* Step 1 */}
                            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                                <div className="flex items-center gap-1.5 text-red-400 font-bold text-[11px] uppercase tracking-wider">
                                    <Tag className="w-3.5 h-3.5" />
                                    <span>1. Adding Weapons vs Gear</span>
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-relaxed">
                                    Click <strong className="text-white">+ Add Item</strong>. Set the item type to <strong className="text-white">Weapon</strong> for AEGs/Rifles or <strong className="text-white">Gear / Consumable</strong> for vests, gloves, BBs, etc.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                                <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px] uppercase tracking-wider">
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>2. Rental Packages ("Rental 1, 2...")</span>
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-relaxed">
                                    Check <strong className="text-white">"Available for Rental Gear Hires"</strong>. When named with sequential signatures (e.g. <em className="text-zinc-200">Rental 1, Rental 2</em>), the event signup engine auto-assigns the next available primary rifle sequentially.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                                    <Layers className="w-3.5 h-3.5" />
                                    <span>3. Extra Accessories & Add-ons</span>
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-relaxed">
                                    Non-primary items (Gloves, Masks, Chest Rigs) marked as rentals appear in the player signup modal as an optional <strong className="text-white">Extra Add-ons grid</strong> with real-time stock counters.
                                </p>
                            </div>

                            {/* Step 4 */}
                            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] uppercase tracking-wider">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    <span>4. Stock & Condition Auditing</span>
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-relaxed">
                                    Set reorder thresholds to receive low-stock alerts. If equipment is damaged, switch condition to <strong className="text-white">"Needs Inspection"</strong> to flag it for field servicing.
                                </p>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <Button size="sm" variant="primary" onClick={() => setShowGuideModal(false)}>
                                Got it
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Saved Notification Banner */}
            {savedFeedback && (
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs shadow-lg animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-medium">{savedFeedback}</span>
                    </div>
                    <button 
                        onClick={() => setSavedFeedback(null)}
                        className="text-emerald-400/60 hover:text-emerald-200 text-xs px-1"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Tiny Clickable Explanation Banner */}
            <div 
                onClick={() => setShowGuideModal(true)}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-red-500/20 bg-gradient-to-r from-red-950/20 via-zinc-900/60 to-zinc-900/40 p-2 sm:p-2.5 transition-all duration-200 hover:border-red-500/40 hover:bg-zinc-900/80 shadow-sm"
            >
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 group-hover:scale-105 transition-transform">
                            <InformationCircleIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-bold text-white group-hover:text-red-400 transition-colors">
                                    How to load & configure inventory
                                </span>
                                <span className="rounded bg-red-500/20 px-1 py-0.2 text-[9px] font-bold text-red-300">
                                    Guide
                                </span>
                            </div>
                            <p className="truncate text-[10px] text-zinc-400">
                                Click to enlarge instructions on setup, "Rental 1, 2" weapons & armory configuration
                            </p>
                        </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-red-400 group-hover:text-red-300">
                        <span className="hidden sm:inline">Read Guide</span>
                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                </div>
            </div>

            {/* Free View Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                    <ArchiveBoxIcon className="w-5 h-5 text-red-500" />
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                            Armory & Inventory
                        </h2>
                        <p className="text-[10px] sm:text-xs text-zinc-400">
                            {inventory.length} tactical units registered &bull; Rentals & Consumables
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsEditing({})} size="sm" className="!py-1 !px-2.5 text-xs">
                        <PlusIcon className="w-4 h-4 mr-1"/>Add Item
                    </Button>
                </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                        filter === 'all' 
                            ? 'bg-red-600 text-white shadow-md shadow-red-900/30' 
                            : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                    }`}
                >
                    All ({inventory.length})
                </button>
                <button
                    onClick={() => setFilter('shop')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-1 ${
                        filter === 'shop' 
                            ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30' 
                            : 'bg-zinc-900/70 text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 border border-zinc-800'
                    }`}
                >
                    <ShoppingBag className="w-3 h-3" />
                    In Shop ({inventory.filter(i => i.availableInShop).length})
                </button>
                <button
                    onClick={() => setFilter('rental')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                        filter === 'rental' 
                            ? 'bg-red-600 text-white shadow-md shadow-red-900/30' 
                            : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                    }`}
                >
                    Rentals
                </button>
                <button
                    onClick={() => setFilter('sale')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                        filter === 'sale' 
                            ? 'bg-red-600 text-white shadow-md shadow-red-900/30' 
                            : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                    }`}
                >
                    For Sale
                </button>
                <button
                    onClick={() => setFilter('inspection')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                        filter === 'inspection' 
                            ? 'bg-red-600 text-white shadow-md shadow-red-900/30' 
                            : 'bg-zinc-900/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-zinc-800'
                    }`}
                >
                    Inspection
                </button>
            </div>

            {/* Side-by-side Grid on Mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 max-h-[68vh] overflow-y-auto pr-1">
                {filteredInventory.map(item => (
                    <InventoryItemCard key={item.id} item={item} onEdit={setIsEditing} onDelete={setDeletingItem} />
                ))}
            </div>
        </div>
    );
};
