
import React, { useState, useMemo } from 'react';
import type { InventoryItem, Supplier } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { ArchiveBoxIcon, PlusIcon, PencilIcon, TrashIcon } from './icons/Icons';
import { INVENTORY_CATEGORIES, INVENTORY_CONDITIONS } from '../constants';
import { BadgePill } from './BadgePill';

interface InventoryTabProps {
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    suppliers: Supplier[];
    addDoc: <T extends {}>(collectionName: string, data: T) => Promise<void>;
    updateDoc: <T extends { id: string; }>(collectionName: string, doc: T) => Promise<void>;
    deleteDoc: (collectionName: string, docId: string) => Promise<void>;
}

const InventoryEditorModal: React.FC<{ item: Partial<InventoryItem>, onClose: () => void, onSave: (item: InventoryItem | Omit<InventoryItem, 'id'>) => void, suppliers: Supplier[] }> = ({ item, onClose, onSave, suppliers }) => {
    const [formData, setFormData] = useState<Omit<InventoryItem, 'id'>>({
        name: item.name || '',
        description: item.description || '',
        salePrice: item.salePrice || 0,
        stock: item.stock || 0,
        type: item.type || 'Weapon',
        isRental: item.isRental || false,
        category: item.category || 'AEG Rifle',
        condition: item.condition || 'New',
        purchasePrice: item.purchasePrice || 0,
        reorderLevel: item.reorderLevel || 0,
        supplierId: item.supplierId || '',
        sku: item.sku || '',
    });

    const handleSaveClick = () => {
        const finalItem = { ...item, ...formData };
        onSave(finalItem);
    }

    return (
        <Modal isOpen={true} onClose={onClose} title={item.id ? 'Edit Item' : 'Add New Item'}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <Input label="Item Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Sale/Rental Price" type="number" value={formData.salePrice} onChange={e => setFormData(f => ({ ...f, salePrice: Number(e.target.value) }))} />
                    <Input label="Stock Quantity" type="number" value={formData.stock} onChange={e => setFormData(f => ({ ...f, stock: Number(e.target.value) }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Purchase Price" type="number" value={formData.purchasePrice} onChange={e => setFormData(f => ({ ...f, purchasePrice: Number(e.target.value) }))} />
                    <Input label="Re-order Level" type="number" value={formData.reorderLevel} onChange={e => setFormData(f => ({ ...f, reorderLevel: Number(e.target.value) }))} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Category</label>
                        <select value={formData.category} onChange={e => setFormData(p => ({...p, category: e.target.value as InventoryItem['category']}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                            {INVENTORY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Condition</label>
                        <select value={formData.condition} onChange={e => setFormData(p => ({...p, condition: e.target.value as InventoryItem['condition']}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                            {INVENTORY_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Supplier</label>
                    <select value={formData.supplierId} onChange={e => setFormData(p => ({...p, supplierId: e.target.value}))} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500">
                        <option value="">None</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="flex items-center pt-2">
                    <input type="checkbox" id="isRental" checked={formData.isRental} onChange={e => setFormData(f => ({...f, isRental: e.target.checked}))} className="h-4 w-4 rounded border-gray-600 bg-zinc-700 text-red-500 focus:ring-red-500"/>
                    <label htmlFor="isRental" className="ml-2 text-sm text-gray-300">Available for Rental</label>
                </div>
            </div>
            <div className="mt-6">
                <Button className="w-full" onClick={handleSaveClick}>Save Item</Button>
            </div>
        </Modal>
    )
};

const InventoryItemCard: React.FC<{ item: InventoryItem, onEdit: (i: InventoryItem) => void, onDelete: (i: InventoryItem) => void }> = ({ item, onEdit, onDelete }) => (
    <div className="bg-zinc-800/50 p-4 rounded-lg border border-zinc-700 flex flex-col justify-between">
        <div>
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-lg text-white pr-4">{item.name}</h4>
                <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" variant="secondary" onClick={() => onEdit(item)} className="!p-2"><PencilIcon className="w-4 h-4"/></Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(item)} className="!p-2"><TrashIcon className="w-4 h-4"/></Button>
                </div>
            </div>
            <p className="text-xs text-gray-400 mb-3">{item.category}</p>
            {item.description && <p className="text-sm text-gray-300 line-clamp-2 mb-3">{item.description}</p>}
        </div>
        <div className="mt-auto pt-3 border-t border-zinc-700/50">
            <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-400">Stock:</p>
                <p className={`font-bold text-lg ${item.stock <= (item.reorderLevel || 0) ? 'text-red-400' : 'text-white'}`}>{item.stock}</p>
            </div>
             <div className="flex justify-between items-center">
                <p className="text-sm text-gray-400">Price:</p>
                <p className="font-mono font-bold text-green-400">R{item.salePrice.toFixed(2)}</p>
            </div>
             <div className="flex gap-2 mt-3">
                {item.isRental && <BadgePill color="blue">Rental</BadgePill>}
                {!item.isRental && <BadgePill color="green">For Sale</BadgePill>}
                <BadgePill color="amber">{item.condition}</BadgePill>
            </div>
        </div>
    </div>
);


export const InventoryTab: React.FC<InventoryTabProps> = ({ inventory, setInventory, suppliers, addDoc, updateDoc, deleteDoc }) => {
    const [isEditing, setIsEditing] = useState<Partial<InventoryItem> | null>(null);
    const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
    const [filter, setFilter] = useState<'all' | 'rental' | 'sale'>('all');

    const filteredInventory = useMemo(() => {
        if (filter === 'rental') return inventory.filter(i => i.isRental);
        if (filter === 'sale') return inventory.filter(i => !i.isRental);
        return inventory;
    }, [inventory, filter]);


    const handleSave = (item: InventoryItem | Omit<InventoryItem, 'id'>) => {
        if ('id' in item) {
            updateDoc('inventory', item);
        } else {
            addDoc('inventory', item);
        }
        setIsEditing(null);
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        deleteDoc('inventory', deletingItem.id);
        setDeletingItem(null);
    };

    return (
        <div>
            {isEditing && <InventoryEditorModal item={isEditing} onClose={() => setIsEditing(null)} onSave={handleSave} suppliers={suppliers} />}
            {deletingItem && (
                 <Modal isOpen={true} onClose={() => setDeletingItem(null)} title="Confirm Deletion">
                    <p className="text-gray-300">Are you sure you want to delete "{deletingItem.name}"? This action cannot be undone.</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <Button variant="secondary" onClick={() => setDeletingItem(null)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete}>Delete</Button>
                    </div>
                </Modal>
            )}
            <DashboardCard title="Inventory Management" icon={<ArchiveBoxIcon className="w-6 h-6"/>}>
                <div className="p-4">
                     <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                        <div className="flex space-x-1 p-1 bg-zinc-900 rounded-lg border border-zinc-700">
                            <Button size="sm" variant={filter === 'all' ? 'primary' : 'secondary'} onClick={() => setFilter('all')}>All</Button>
                            <Button size="sm" variant={filter === 'rental' ? 'primary' : 'secondary'} onClick={() => setFilter('rental')}>Rental</Button>
                            <Button size="sm" variant={filter === 'sale' ? 'primary' : 'secondary'} onClick={() => setFilter('sale')}>For Sale</Button>
                        </div>
                        <Button onClick={() => setIsEditing({})} size="sm" className="w-full sm:w-auto">
                            <PlusIcon className="w-5 h-5 mr-2"/>Add New Item
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                        {filteredInventory.map(item => (
                            <InventoryItemCard key={item.id} item={item} onEdit={setIsEditing} onDelete={setDeletingItem} />
                        ))}
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
};
