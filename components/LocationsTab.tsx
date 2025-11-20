


import React, { useState, useContext } from 'react';
import type { Location } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { MapPinIcon, PlusIcon, PencilIcon, TrashIcon, AtSymbolIcon, PhoneIcon, XIcon, GlobeAltIcon } from './icons/Icons';
// FIX: Corrected import for DataContext.
import { DataContext } from '../data/DataContext';
import { UrlOrUploadField } from './UrlOrUploadField';

interface LocationsTabProps {
    locations: Location[];
    setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
    addDoc: <T extends {}>(collectionName: string, data: T) => Promise<void>;
    updateDoc: <T extends { id: string; }>(collectionName: string, doc: T) => Promise<void>;
    deleteDoc: (collectionName: string, docId: string) => Promise<void>;
}

const LocationEditorModal: React.FC<{ location: Partial<Location>, onClose: () => void, onSave: (l: Location | Omit<Location, 'id'>) => void }> = ({ location, onClose, onSave }) => {
    // FIX: Use useContext to correctly access DataContext.
    const dataContext = useContext(DataContext);
    const [formData, setFormData] = useState({
        name: location.name || '',
        description: location.description || '',
        address: location.address || '',
        pinLocationUrl: location.pinLocationUrl || '',
        phone: location.contactInfo?.phone || '',
        email: location.contactInfo?.email || '',
    });
    const [imageUrls, setImageUrls] = useState<string[]>(location.imageUrls || []);

    const handleAddImage = (url: string) => {
        if (url && !imageUrls.includes(url)) {
            setImageUrls(prev => [...prev, url]);
        }
    };
    
    const handleRemoveImage = (index: number) => {
        setImageUrls(current => current.filter((_, i) => i !== index));
    }
    
    const handleSaveClick = () => {
        const finalLocation = {
            ...location,
            name: formData.name,
            description: formData.description,
            address: formData.address,
            pinLocationUrl: formData.pinLocationUrl,
            imageUrls: imageUrls.filter(Boolean),
            contactInfo: { phone: formData.phone, email: formData.email },
        };
        onSave(finalLocation);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={location.id ? 'Edit Location' : 'Add New Location'}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <Input label="Location Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                <Input label="Address" value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} />
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                    <textarea value={formData.description} onChange={e => setFormData(f => ({...f, description: e.target.value}))} rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                 <Input label="Google Maps Pin URL" value={formData.pinLocationUrl} onChange={e => setFormData(f => ({...f, pinLocationUrl: e.target.value}))} placeholder="https://maps.app.goo.gl/..." />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Contact Email" type="email" value={formData.email} onChange={e => setFormData(f => ({...f, email: e.target.value}))} />
                    <Input label="Contact Phone" type="tel" value={formData.phone} onChange={e => setFormData(f => ({...f, phone: e.target.value}))} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Location Images</label>
                    <div className="space-y-2">
                        {imageUrls.map((url, index) => (
                             <div key={index} className="flex items-center gap-2 bg-zinc-800/50 p-2 rounded-md">
                                <img src={url} alt={`Preview ${index+1}`} className="w-12 h-12 object-cover rounded"/>
                                <p className="text-xs text-gray-400 truncate flex-grow">{url}</p>
                                <Button variant="danger" size="sm" onClick={() => handleRemoveImage(index)} className="!p-2"><TrashIcon className="w-4 h-4"/></Button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                         <UrlOrUploadField 
                            label="Add New Image"
                            fileUrl={undefined}
                            onUrlSet={handleAddImage}
                            onRemove={() => {}} // Not used in 'add' mode
                            accept="image/*"
                            apiServerUrl={dataContext?.companyDetails?.apiServerUrl}
                        />
                    </div>
                </div>
            </div>
            <div className="mt-6">
                <Button className="w-full" onClick={handleSaveClick}>Save Location</Button>
            </div>
        </Modal>
    );
};

export const LocationsTab: React.FC<LocationsTabProps> = ({ locations, setLocations, addDoc, updateDoc, deleteDoc }) => {
    const [isEditing, setIsEditing] = useState<Partial<Location> | null>(null);
    const [deletingLocation, setDeletingLocation] = useState<Location | null>(null);

    const handleSave = (locationData: Location | Omit<Location, 'id'>) => {
        if ('id' in locationData) {
            updateDoc('locations', locationData);
        } else {
            addDoc('locations', locationData);
        }
        setIsEditing(null);
    };

    const handleDelete = () => {
        if (!deletingLocation) return;
        deleteDoc('locations', deletingLocation.id);
        setDeletingLocation(null);
    };

    return (
        <div>
            {isEditing && <LocationEditorModal location={isEditing} onClose={() => setIsEditing(null)} onSave={handleSave} />}
             {deletingLocation && (
                <Modal isOpen={true} onClose={() => setDeletingLocation(null)} title="Confirm Deletion">
                    <p className="text-gray-300">Are you sure you want to delete the location "{deletingLocation.name}"? This action cannot be undone.</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <Button variant="secondary" onClick={() => setDeletingLocation(null)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete}>Delete</Button>
                    </div>
                </Modal>
            )}
            <DashboardCard title="Manage Locations" icon="