import React, { useState } from 'react';
import type { Supplier } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { TruckIcon, PlusIcon, PencilIcon, TrashIcon, AtSymbolIcon, PhoneIcon, GlobeAltIcon, MapPinIcon } from './icons/Icons';

interface SuppliersTabProps {
    suppliers: Supplier[];
    setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
    addDoc: <T extends {}>(collectionName: string, data: T) => Promise<void>;
    updateDoc: <T extends { id: string; }>(collectionName: string, doc: T) => Promise<void>;
    deleteDoc: (collectionName: string, docId: string) => Promise<void>;
}

const SupplierEditorModal: React.FC<{ 
    supplier: Partial<Supplier>, 
    onClose: () => void, 
    onSave: (s: Supplier | Omit<Supplier, 'id'>) => void 
}> = ({ supplier, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: supplier.name || '',
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        website: supplier.website || '',
        address: supplier.address || '',
    });

    const handleSaveClick = () => {
        const finalSupplier = { ...supplier, ...formData };
        onSave(finalSupplier);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={supplier.id ? 'Edit Tactical Supplier' : 'Add Tactical Supplier'}>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 text-xs">
                <Input label="Supplier / Company Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                <Input label="Account Manager / Contact Person" value={formData.contactPerson} onChange={e => setFormData(f => ({ ...f, contactPerson: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2">
                    <Input label="Email Address" type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                    <Input label="Phone / WhatsApp" type="tel" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <Input label="Website URL" value={formData.website} onChange={e => setFormData(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
                <Input label="Dispatch Warehouse Address" value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="mt-4">
                <Button className="w-full !py-2 text-xs" onClick={handleSaveClick}>Save Supplier Details</Button>
            </div>
        </Modal>
    );
};

export const SuppliersTab: React.FC<SuppliersTabProps> = ({ suppliers, setSuppliers, addDoc, updateDoc, deleteDoc }) => {
    const [isEditing, setIsEditing] = useState<Partial<Supplier> | null>(null);
    const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

    const handleSave = (supplierData: Supplier | Omit<Supplier, 'id'>) => {
        if ('id' in supplierData) {
            updateDoc('suppliers', supplierData);
        } else {
            addDoc('suppliers', supplierData);
        }
        setIsEditing(null);
    };

    const handleDelete = () => {
        if (!deletingSupplier) return;
        deleteDoc('suppliers', deletingSupplier.id);
        setDeletingSupplier(null);
    };

    return (
        <div className="w-full space-y-3 sm:space-y-4">
            {isEditing && <SupplierEditorModal supplier={isEditing} onClose={() => setIsEditing(null)} onSave={handleSave} />}
            {deletingSupplier && (
                <Modal isOpen={true} onClose={() => setDeletingSupplier(null)} title="Confirm Deletion">
                    <p className="text-gray-300 text-xs">Are you sure you want to delete "{deletingSupplier.name}"? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="secondary" size="sm" onClick={() => setDeletingSupplier(null)}>Cancel</Button>
                        <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
                    </div>
                </Modal>
            )}

            {/* Free View Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                    <TruckIcon className="w-5 h-5 text-red-500" />
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                            Suppliers & Tactical Distributors
                        </h2>
                        <p className="text-[10px] sm:text-xs text-zinc-400">
                            {suppliers.length} procurement partners &bull; Armory restock & gear imports
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsEditing({})} size="sm" className="!py-1 !px-2.5 text-xs">
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Add Supplier
                    </Button>
                </div>
            </div>

            {/* Side-by-side Grid on Mobile & Tablets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 max-h-[70vh] overflow-y-auto pr-1">
                {suppliers.map(s => (
                    <div key={s.id} className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700 transition-all">
                        <div>
                            <div className="flex justify-between items-start gap-1">
                                <div className="min-w-0">
                                    <h4 className="font-bold text-xs sm:text-sm text-white truncate">{s.name}</h4>
                                    {s.contactPerson && (
                                        <p className="text-[10px] text-zinc-400 truncate">Attn: {s.contactPerson}</p>
                                    )}
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <button 
                                        onClick={() => setIsEditing(s)}
                                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                    >
                                        <PencilIcon className="w-3 h-3" />
                                    </button>
                                    <button 
                                        onClick={() => setDeletingSupplier(s)}
                                        className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-zinc-800/50 space-y-1 text-[10px]">
                            {s.website && (
                                <a href={s.website} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline flex items-center gap-1">
                                    <GlobeAltIcon className="w-3 h-3" /> Visit Website
                                </a>
                            )}
                            {s.email && (
                                <p className="text-zinc-400 flex items-center gap-1 truncate">
                                    <AtSymbolIcon className="w-3 h-3" /> {s.email}
                                </p>
                            )}
                            {s.phone && (
                                <p className="text-zinc-400 flex items-center gap-1">
                                    <PhoneIcon className="w-3 h-3" /> {s.phone}
                                </p>
                            )}
                            {s.address && (
                                <p className="text-zinc-500 flex items-center gap-1 truncate">
                                    <MapPinIcon className="w-3 h-3" /> {s.address}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
