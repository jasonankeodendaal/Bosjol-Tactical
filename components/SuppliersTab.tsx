import React, { useState } from 'react';
import type { Supplier } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { TruckIcon, PlusIcon, PencilIcon, TrashIcon, AtSymbolIcon, PhoneIcon, GlobeAltIcon } from './icons/Icons';

interface SuppliersTabProps {
    suppliers: Supplier[];
    setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
}

const SupplierEditorModal: React.FC<{ supplier: Supplier | {}, onClose: () => void, onSave: (s: Supplier) => void }> = ({ supplier, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: 'name' in supplier ? supplier.name : '',
        contactPerson: 'contactPerson' in supplier ? supplier.contactPerson : '',
        email: 'email' in supplier ? supplier.email : '',
        phone: 'phone' in supplier ? supplier.phone : '',
        website: 'website' in supplier ? supplier.website : '',
        address: 'address' in supplier ? supplier.address : '',
    });

    const handleSaveClick = () => {
        const finalSupplier = Object.assign({}, supplier, formData) as Supplier;
        onSave(finalSupplier);
    }

    return (
        <Modal isOpen={true} onClose={onClose} title={'id' in supplier ? 'Edit Supplier' : 'Add New Supplier'}>
            <div className="space-y-4">
                <Input label="Supplier Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                <Input label="Contact Person" value={formData.contactPerson} onChange={e => setFormData(f => ({ ...f, contactPerson: e.target.value }))} />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Email" type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                    <Input label="Phone" type="tel" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <Input label="Website" value={formData.website} onChange={e => setFormData(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
                <Input label="Address" value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="mt-6">
                <Button className="w-full" onClick={handleSaveClick}>Save Supplier</Button>
            </div>
        </Modal>
    )
};


export const SuppliersTab: React.FC<SuppliersTabProps> = ({ suppliers, setSuppliers }) => {
    const [isEditing, setIsEditing] = useState<Supplier | {} | null>(null);
    const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

    const handleSave = (supplierData: Supplier) => {
        if ('id' in supplierData && supplierData.id) {
            setSuppliers(ss => ss.map(s => s.id === supplierData.id ? supplierData : s));
        } else {
            setSuppliers(ss => [...ss, { ...supplierData, id: `sup${Date.now()}` }]);
        }
        setIsEditing(null);
    };

    const handleDelete = () => {
        if (!deletingSupplier) return;
        setSuppliers(ss => ss.filter(s => s.id !== deletingSupplier.id));
        setDeletingSupplier(null);
    };


    return (
        <div>
            {isEditing && <SupplierEditorModal supplier={isEditing} onClose={() => setIsEditing(null)} onSave={handleSave} />}
            {deletingSupplier && (
                <Modal isOpen={true} onClose={() => setDeletingSupplier(null)} title="Confirm Deletion">
                    <p className="text-gray-300">Are you sure you want to delete the supplier "{deletingSupplier.name}"? This action cannot be undone.</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <Button variant="secondary" onClick={() => setDeletingSupplier(null)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete}>Delete</Button>
                    </div>
                </Modal>
            )}
            <DashboardCard title="Manage Suppliers" icon={<TruckIcon className="w-6 h-6" />}>
                <div className="p-4">
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setIsEditing({})} size="sm">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Add Supplier
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {suppliers.map(s => (
                            <div key={s.id} className="bg-zinc-800/50 p-4 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-lg text-white">{s.name}</h4>
                                        {s.contactPerson && <p className="text-sm text-gray-300">Attn: {s.contactPerson}</p>}
                                        <div className="mt-2 space-y-1 text-sm">
                                            {s.website && <a href={s.website} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline flex items-center gap-1.5"><GlobeAltIcon className="w-4 h-4" /> Website</a>}
                                            {s.email && <p className="text-gray-300 flex items-center gap-1.5"><AtSymbolIcon className="w-4 h-4" /> {s.email}</p>}
                                            {s.phone && <p className="text-gray-300 flex items-center gap-1.5"><PhoneIcon className="w-4 h-4" /> {s.phone}</p>}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        <Button size="sm" variant="secondary" onClick={() => setIsEditing(s)}><PencilIcon className="w-4 h-4" /></Button>
                                        <Button size="sm" variant="danger" onClick={() => setDeletingSupplier(s)}><TrashIcon className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DashboardCard>
        </div>
    )
};