import React, { useState } from 'react';
import type { Sponsor } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { SparklesIcon, PlusIcon, PencilIcon, TrashIcon, GlobeAltIcon, AtSymbolIcon, PhoneIcon } from './icons/Icons';
import { UrlOrUploadField } from './UrlOrUploadField';
import { deleteFromSupabaseStorage } from '../utils/storageCleaner';

interface SponsorsTabProps {
    sponsors: Sponsor[];
    setSponsors: React.Dispatch<React.SetStateAction<Sponsor[]>>;
    addDoc: <T extends {}>(collectionName: string, data: T) => Promise<void>;
    updateDoc: <T extends { id: string; }>(collectionName: string, doc: T) => Promise<void>;
    deleteDoc: (collectionName: string, docId: string) => Promise<void>;
}

const SponsorEditorModal: React.FC<{ 
    sponsor: Partial<Sponsor>, 
    onClose: () => void, 
    onSave: (s: Sponsor | Omit<Sponsor, 'id'>) => void 
}> = ({ sponsor, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: sponsor.name || '',
        logoUrl: sponsor.logoUrl || '',
        email: sponsor.email || '',
        phone: sponsor.phone || '',
        website: sponsor.website || '',
        bio: sponsor.bio || '',
    });
    const [imageUrls, setImageUrls] = useState<string[]>(sponsor.imageUrls || []);

    const handleAddImage = (url: string) => {
        if (url && !imageUrls.includes(url)) {
            setImageUrls(prev => [...prev, url]);
        }
    };
    
    const handleRemoveImage = (index: number) => {
        const removedUrl = imageUrls[index];
        if (removedUrl) {
            deleteFromSupabaseStorage(removedUrl).catch(err => {
                console.warn('[SponsorsTab] Error deleting removed gallery image from storage:', err);
            });
        }
        setImageUrls(current => current.filter((_, i) => i !== index));
    };
    
    const handleSaveClick = () => {
        const finalSponsor = { ...sponsor, ...formData, imageUrls };
        onSave(finalSponsor);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={sponsor.id ? 'Edit Sponsor / Partner' : 'Add New Sponsor / Partner'}>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 text-xs">
                <Input label="Sponsor Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2">
                    <Input label="Email" type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                    <Input label="Phone" type="tel" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <Input label="Website" value={formData.website} onChange={e => setFormData(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
                <UrlOrUploadField
                    label="Sponsor Logo"
                    fileUrl={formData.logoUrl}
                    onUrlSet={(url) => setFormData(f => ({ ...f, logoUrl: url }))}
                    onRemove={() => setFormData(f => ({ ...f, logoUrl: '' }))}
                    accept="image/*"
                />
                 <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Partner Bio & Perks</label>
                    <textarea 
                        placeholder="Sponsor Bio & special airsoft discount codes for members" 
                        value={formData.bio} 
                        onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))} 
                        rows={3} 
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500" 
                    />
                </div>
                 <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Partner Photo Gallery</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {imageUrls.filter(url => url && typeof url === 'string' && url.trim() !== '').map((url, index) => (
                             <div key={index} className="relative w-14 h-12 rounded overflow-hidden border border-zinc-700">
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
                        label="Add Gallery Image"
                        fileUrl={undefined}
                        onUrlSet={handleAddImage}
                        onRemove={() => {}}
                        accept="image/*"
                    />
                </div>
            </div>
            <div className="mt-4">
                <Button className="w-full !py-2 text-xs" onClick={handleSaveClick}>Save Sponsor Partner</Button>
            </div>
        </Modal>
    );
};

export const SponsorsTab: React.FC<SponsorsTabProps> = ({ sponsors, setSponsors, addDoc, updateDoc, deleteDoc }) => {
    const [isEditing, setIsEditing] = useState<Partial<Sponsor> | null>(null);
    const [deletingSponsor, setDeletingSponsor] = useState<Sponsor | null>(null);

    const handleSave = (sponsor: Sponsor | Omit<Sponsor, 'id'>) => {
        if ('id' in sponsor) {
            updateDoc('sponsors', sponsor);
        } else {
            addDoc('sponsors', sponsor);
        }
        setIsEditing(null);
    };

    const handleDelete = () => {
        if (!deletingSponsor) return;
        deleteDoc('sponsors', deletingSponsor.id);
        setDeletingSponsor(null);
    };

    return (
        <div className="w-full space-y-3 sm:space-y-4">
            {isEditing && <SponsorEditorModal sponsor={isEditing} onClose={() => setIsEditing(null)} onSave={handleSave} />}
            {deletingSponsor && (
                <Modal isOpen={true} onClose={() => setDeletingSponsor(null)} title="Confirm Deletion">
                    <p className="text-gray-300 text-xs">Are you sure you want to delete the sponsor "{deletingSponsor.name}"? This will remove them from the player dashboard.</p>
                    <div className="flex justify-end gap-3 mt-4">
                        <Button variant="secondary" size="sm" onClick={() => setDeletingSponsor(null)}>Cancel</Button>
                        <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
                    </div>
                </Modal>
            )}

            {/* Free View Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5 text-red-500" />
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                            Sponsors & Brand Partnerships
                        </h2>
                        <p className="text-[10px] sm:text-xs text-zinc-400">
                            {sponsors.length} active partners &bull; Brand visibility & player perks
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsEditing({})} size="sm" className="!py-1 !px-2.5 text-xs">
                        <PlusIcon className="w-4 h-4 mr-1"/>Add Sponsor
                    </Button>
                </div>
            </div>

            {/* Side by side Grid on Mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 max-h-[70vh] overflow-y-auto pr-1">
                {sponsors.map(sponsor => (
                    <div 
                        key={sponsor.id} 
                        className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col justify-between hover:border-zinc-700 transition-all text-center relative group"
                    >
                        <div>
                            <div className="h-16 flex items-center justify-center p-1 bg-black/40 rounded-lg border border-zinc-800/60 mb-2">
                                {sponsor.logoUrl ? (
                                    <img src={sponsor.logoUrl} alt={sponsor.name} className="max-h-full max-w-full object-contain" />
                                ) : (
                                    <SparklesIcon className="w-6 h-6 text-amber-500/50" />
                                )}
                            </div>
                            <p className="font-bold text-xs sm:text-sm text-white truncate">{sponsor.name}</p>
                            {sponsor.bio && (
                                <p className="text-[10px] text-zinc-500 line-clamp-2 mt-1 text-left">{sponsor.bio}</p>
                            )}
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-zinc-800/50 flex items-center justify-between">
                            <div className="flex gap-1.5 text-[10px] text-zinc-400 text-left truncate">
                                {sponsor.website && (
                                    <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline flex items-center gap-0.5">
                                        <GlobeAltIcon className="w-3 h-3" /> Web
                                    </a>
                                )}
                            </div>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => setIsEditing(sponsor)} 
                                    className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                                >
                                    <PencilIcon className="w-3 h-3"/>
                                </button>
                                <button 
                                    onClick={() => setDeletingSponsor(sponsor)} 
                                    className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                                >
                                    <TrashIcon className="w-3 h-3"/>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
