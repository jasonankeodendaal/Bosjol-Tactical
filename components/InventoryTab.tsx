import React, { useState } from 'react';
import type { InventoryItem, Supplier } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { ArchiveBoxIcon, PlusIcon, PencilIcon, TrashIcon } from './icons/Icons';
import { INVENTORY_CATEGORIES, INVENTORY_CONDITIONS } from '../constants';

interface InventoryTabProps {
    inventory: InventoryItem[];
    setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    suppliers: Supplier[];
}

const InventoryEditorModal: React.FC<{ item: InventoryItem | {}, onClose: () => void, onSave: (item: InventoryItem) => void, suppliers: Supplier[] }> = ({ item, onClose, onSave, suppliers }) => {
    const [formData, setFormData] = useState<Omit<InventoryItem, 'id'>>({
        name: 'name' in item ? item.name : '',
        description: 'description' in item ? item.description : '',
        salePrice: 'salePrice' in item ? item.salePrice : 0,
        stock: 'stock' in item ? item.stock : 0,
        type: 'type' in item ? item.type : 'Weapon',
        isRental: 'isRental' in item ? item.isRental : false,
        category: 'category' in item ? item.category : 'AEG Rifle',
        condition: 'condition' in item ? item.condition : 'New',
        purchasePrice: 'purchasePrice' in item ? item.purchasePrice : 0,
        reorderLevel: 'reorderLevel' in item ? item.reorderLevel : 0,
        supplierId: 'supplierId' in item ? item.supplierId : '',
        sku: 'sku' in item ? item.sku : '',
    });

    const handleSaveClick = () => {
        const finalItem = { ...item, ...formData } as InventoryItem;
        onSave(finalItem);
    }

    return (
        <Modal isOpen={true} onClose={onClose} title={'id' in item ? 'Edit Item' : 'Add New Item'}>
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
}

export const InventoryTab: React.FC<InventoryTabProps> = ({ inventory, setInventory, suppliers }) => {
    const [isEditing, setIsEditing] = useState<InventoryItem | {} | null>(null);
    const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

    const handleSave = (item: InventoryItem) => {
        if (item.id) {
            setInventory(inv => inv.map(i => i.id === item.id ? item : i));
        } else {
            setInventory(inv => [...inv, { ...item, id: `inv${Date.now()}` }]);
        }
        setIsEditing(null);
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        setInventory(inv => inv.filter(i => i.id !== deletingItem.id));
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
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setIsEditing({})}><PlusIcon className="w-5 h-5 mr-2"/>Add Item</Button>
                    </div>
                    <div className="overflow-x-auto max-h-[60vh]">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-400 uppercase bg-zinc-800/50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Category</th>
                                    <th scope="col" className="px-6 py-3 text-center">Stock</th>
                                    <th scope="col" className="px-6 py-3 text-right">Price</th>
                                    <th scope="col" className="px-6 py-3 text-center">Rental</th>
                                    <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventory.map(item => (
                                    <tr key={item.id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                                        <td className="px-6 py-4 font-medium text-white">{item.name}</td>
                                        <td className="px-6 py-4">{item.category}</td>
                                        <td className={`px-6 py-4 text-center font-bold ${item.stock <= (item.reorderLevel || 0) ? 'text-red-400' : 'text-white'}`}>{item.stock}</td>
                                        <td className="px-6 py-4 text-right font-mono text-green-400">R{item.salePrice.toFixed(2)}</td>
                                        <td className="px-6 py-4 text-center">{item.isRental ? '✔️' : '❌'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="secondary" onClick={() => setIsEditing(item)}><PencilIcon className="w-4 h-4"/></Button>
                                                <Button size="sm" variant="danger" onClick={() => setDeletingItem(item)}><TrashIcon className="w-4 h-4"/></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
};