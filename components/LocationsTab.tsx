import React, { useState } from 'react';
import type { Location } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { MapPinIcon, PlusIcon, PencilIcon, TrashIcon, AtSymbolIcon, PhoneIcon, GlobeAltIcon } from './icons/Icons';
import { UrlOrUploadField } from './UrlOrUploadField';
import { deleteFromSupabaseStorage } from '../utils/storageCleaner';

interface LocationsTabProps {
    locations: Location[];
    setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
    addDoc: <T extends {}>(collectionName: string, data: T) => Promise<void>;
    updateDoc: <T extends { id: string; }>(collectionName: string, doc: T) => Promise<void>;
    deleteDoc: (collectionName: string, docId: string) => Promise<void>;
}

const LocationEditorModal: React.FC<{ 
    location: Partial<Location>, 
    onClose: () => void, 
    onSave: (l: Location | Omit<Location, 'id'>) => void 
}> = ({ location, onClose, onSave }) => {
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
        const removedUrl = imageUrls[index];
        if (removedUrl) {
            deleteFromSupabaseStorage(removedUrl).catch(err => {
                console.warn('[LocationsTab] Error deleting removed location image from storage:', err);
            });
        }
        setImageUrls(current => current.filter((_, i) => i !== index));
    };
    
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
        <Modal isOpen={true} onClose={onClose} title={location.id ? 'Edit Operational Field' : 'Add New Operational Field'}>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 text-xs">
                <Input label="Field / Arena Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                <Input label="Physical Address" value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} />
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Field Terrain & Notes</label>
                    <textarea 
                        value={formData.description} 
                        onChange={e => setFormData(f => ({...f, description: e.target.value}))} 
                        rows={2} 
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500" 
                    />
                </div>
                <Input label="Google Maps Pin URL" value={formData.pinLocationUrl} onChange={e => setFormData(f => ({...f, pinLocationUrl: e.target.value}))} placeholder="https://maps.app.goo.gl/..." />
                <div className="grid grid-cols-2 gap-2">
                    <Input label="Contact Email" type="email" value={formData.email} onChange={e => setFormData(f => ({...f, email: e.target.value}))} />
                    <Input label="Contact Phone" type="tel" value={formData.phone} onChange={e => setFormData(f => ({...f, phone: e.target.value}))} />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Field Photo Gallery</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {imageUrls.map((url, index) => (
                             <div key={index} className="relative w-16 h-12 rounded overflow-hidden border border-zinc-700">
                                <img src={url} alt={`Preview ${index+1}`} className="w-full h-full object-cover"/>
                                <button 
                                    onClick={() => handleRemoveImage(index)} 
                                    className="absolute top-0 right-0 bg-red-600/80 hover:bg-red-600 text-white p-0.5"
                                >
                                    <TrashIcon className="w-2.5 h-2.5"/>
                                </button>
                            </div>
                        ))}
                    </div>
                    <UrlOrUploadField 
                        label="Add Photo URL"
                        fileUrl={undefined}
                        onUrlSet={handleAddImage}
                        onRemove={() => {}}
                        accept="image/*"
                    />
                </div>
            </div>
            <div className="mt-4">
                <Button className="w-full !py-2 text-xs" onClick={handleSaveClick}>Save Field Location</Button>
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
        <div className="w-full space-y-3 sm:space-y-4">
            {isEditing && <LocationEditorModal location={isEditing} onClose={() => setIsEditing(null)} onSave={handleSave} />}
            {deletingLocation && (
                <Modal isOpen={true} onClose={() => setDeletingLocation(null)} title="Confirm Deletion">
                    <p className="text-gray-300 text-xs">Are you sure you want to delete the location "{deletingLocation.name}"? This action cannot be undone.</p>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="secondary" size="sm" onClick={() => setDeletingLocation(null)}>Cancel</Button>
                        <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
                    </div>
                </Modal>
            )}

            {/* Free View Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-red-500" />
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                            Operational Fields & Arenas
                        </h2>
                        <p className="text-[10px] sm:text-xs text-zinc-400">
                            {locations.length} sanctioned battlefield sites &bull; Coordinates & Briefings
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsEditing({})} size="sm" className="!py-1 !px-2.5 text-xs">
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Add Field
                    </Button>
                </div>
            </div>

            {/* Side-by-side Grid on Mobile & Tablets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 max-h-[70vh] overflow-y-auto pr-1">
                {locations.map(loc => (
                    <div key={loc.id} className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700 transition-all">
                        <div>
                            <div className="flex justify-between items-start gap-1">
                                <div className="min-w-0">
                                    <h4 className="font-bold text-xs sm:text-sm text-white truncate">{loc.name}</h4>
                                    <p className="text-[10px] text-zinc-400 truncate">{loc.address}</p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <button 
                                        onClick={() => setIsEditing(loc)}
                                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                    >
                                        <PencilIcon className="w-3 h-3" />
                                    </button>
                                    <button 
                                        onClick={() => setDeletingLocation(loc)}
                                        className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>

                            {loc.imageUrls && loc.imageUrls.length > 0 && (
                                <div className="flex space-x-1.5 overflow-x-auto mt-2 pb-1 scrollbar-none">
                                    {loc.imageUrls.map((url, i) => (
                                        <img key={i} src={url} alt={`${loc.name} ${i}`} className="w-16 h-12 object-cover rounded-lg flex-shrink-0 border border-zinc-800" />
                                    ))}
                                </div>
                            )}

                            {loc.description && (
                                <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1.5">{loc.description}</p>
                            )}
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-zinc-800/50 space-y-1 text-[10px]">
                            {loc.pinLocationUrl && (
                                <a href={loc.pinLocationUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline flex items-center gap-1">
                                    <GlobeAltIcon className="w-3 h-3"/> View Google Map Pin
                                </a>
                            )}
                            {loc.contactInfo?.phone && (
                                <p className="text-zinc-400 flex items-center gap-1">
                                    <PhoneIcon className="w-3 h-3" /> {loc.contactInfo.phone}
                                </p>
                            )}
                            {loc.contactInfo?.email && (
                                <p className="text-zinc-400 flex items-center gap-1 truncate">
                                    <AtSymbolIcon className="w-3 h-3" /> {loc.contactInfo.email}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
