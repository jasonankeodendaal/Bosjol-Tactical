
import React, { useState } from 'react';
import type { Location } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { ImageUpload } from './ImageUpload';
import { MapPinIcon, PlusIcon, PencilIcon, TrashIcon, AtSymbolIcon, PhoneIcon, XIcon, GlobeAltIcon } from './icons/Icons';

interface LocationsTabProps {
    locations: Location[];
    setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
    addDoc: <T extends {}>(collectionName: string, data: T) => Promise<void>;
    updateDoc: <T extends { id: string; }>(collectionName: string, doc: T) => Promise<void>;
    deleteDoc: (collectionName: string, docId: string) => Promise<void>;
}

const LocationEditorModal: React.FC<{ location: Partial<Location>, onClose: () => void, onSave: (l: Location | Omit<Location, 'id'>) => void }> = ({ location, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: location.name || '',
        description: location.description || '',
        address: location.address || '',
        pinLocationUrl: location.pinLocationUrl || '',
        phone: location.contactInfo?.phone || '',
        email: location.contactInfo?.email || '',
    });
    const [imageUrls, setImageUrls] = useState<string[]>(location.imageUrls || []);

    const handleImageUpload = (index: number, url: string) => {
        const newImages = [...imageUrls];
        newImages[index] = url;
        setImageUrls(newImages);
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
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Location Images (up to 5)</label>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, index) => (
                           <div key={index} className="flex items-center gap-2">
                             {imageUrls[index] ? (
                                <div className="flex items-center gap-2 flex-grow">
                                    <img src={imageUrls[index]} alt={`Preview ${index+1}`} className="w-16 h-10 object-cover rounded-md"/>
                                    <p className="text-xs text-gray-400 truncate">Image {index+1}</p>
                                    <Button size="sm" variant="danger" className="!p-1.5 ml-auto" onClick={() => handleRemoveImage(index)}><XIcon className="w-4 h-4"/></Button>
                                </div>
                            ) : (
                                <div className="flex-grow">
                                     <ImageUpload onUpload={(urls) => handleImageUpload(index, urls[0])} accept="image/*" />
                                </div>
                            )}
                           </div>
                        ))}
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
            <DashboardCard title="Manage Locations" icon={<MapPinIcon className="w-6 h-6" />}>
                <div className="p-4">
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setIsEditing({})} size="sm">
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Add Location
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {locations.map(loc => (
                            <div key={loc.id} className="bg-zinc-800/50 p-4 rounded-lg flex flex-col">
                                <div className="flex justify-between items-start">
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-lg text-white">{loc.name}</h4>
                                        <p className="text-sm text-gray-400">{loc.address}</p>
                                    </div>
                                     <div className="flex gap-2 flex-shrink-0">
                                        <Button size="sm" variant="secondary" onClick={() => setIsEditing(loc)}><PencilIcon className="w-4 h-4" /></Button>
                                        <Button size="sm" variant="danger" onClick={() => setDeletingLocation(loc)}><TrashIcon className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                                 <div className="flex space-x-2 overflow-x-auto mt-3">
                                    {loc.imageUrls.map((url, i) => (
                                        <img key={i} src={url} alt={`${loc.name} ${i}`} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                                    ))}
                                </div>
                                <div className="mt-3 pt-3 border-t border-zinc-700 space-y-1 text-sm">
                                    {loc.pinLocationUrl && <a href={loc.pinLocationUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline flex items-center gap-1.5"><GlobeAltIcon className="w-4 h-4"/> View on Map</a>}
                                    {loc.contactInfo.email && <p className="text-gray-300 flex items-center gap-1.5"><AtSymbolIcon className="w-4 h-4" /> {loc.contactInfo.email}</p>}
                                    {loc.contactInfo.phone && <p className="text-gray-300 flex items-center gap-1.5"><PhoneIcon className="w-4 h-4" /> {loc.contactInfo.phone}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
};
