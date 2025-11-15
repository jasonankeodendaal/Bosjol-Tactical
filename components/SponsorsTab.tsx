import React, { useState } from 'react';
import type { Sponsor } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { ImageUpload } from './ImageUpload';
import { SparklesIcon, PlusIcon, PencilIcon, TrashIcon } from './icons/Icons';

interface SponsorsTabProps {
    sponsors: Sponsor[];
    setSponsors: React.Dispatch<React.SetStateAction<Sponsor[]>>;
}

const SponsorEditorModal: React.FC<{ sponsor: Sponsor | {}, onClose: () => void, onSave: (s: Sponsor) => void }> = ({ sponsor, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: 'name' in sponsor ? sponsor.name : '',
        logoUrl: 'logoUrl' in sponsor ? sponsor.logoUrl : '',
        email: 'email' in sponsor ? sponsor.email : '',
        phone: 'phone' in sponsor ? sponsor.phone : '',
        website: 'website' in sponsor ? sponsor.website : '',
    });
    
    const handleSaveClick = () => {
        const finalSponsor = { ...sponsor, ...formData } as Sponsor;
        onSave(finalSponsor);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={'id' in sponsor ? 'Edit Sponsor' : 'Add New Sponsor'}>
            <div className="space-y-4">
                <Input label="Sponsor Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Email" type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                    <Input label="Phone" type="tel" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
                </div>
                <Input label="Website" value={formData.website} onChange={e => setFormData(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Sponsor Logo</label>
                    {formData.logoUrl ? (
                        <div className="flex items-center gap-2">
                            <img src={formData.logoUrl} alt="logo preview" className="w-24 h-24 object-contain rounded-md bg-zinc-800 p-1" />
                            <Button variant="danger" size="sm" onClick={() => setFormData(f => ({ ...f, logoUrl: '' }))}>Remove</Button>
                        </div>
                    ) : (
                        <ImageUpload onUpload={(urls) => { if (urls.length > 0) setFormData(f => ({ ...f, logoUrl: urls[0] })); }} accept="image/*" />
                    )}
                </div>
            </div>
            <div className="mt-6">
                <Button className="w-full" onClick={handleSaveClick}>Save Sponsor</Button>
            </div>
        </Modal>
    );
};

export const SponsorsTab: React.FC<SponsorsTabProps> = ({ sponsors, setSponsors }) => {
    const [isEditing, setIsEditing] = useState<Sponsor | {} | null>(null);
    const [deletingSponsor, setDeletingSponsor] = useState<Sponsor | null>(null);

    const handleSave = (sponsor: Sponsor) => {
        if (sponsor.id) {
            setSponsors(prev => prev.map(s => s.id === sponsor.id ? sponsor : s));
        } else {
            setSponsors(prev => [...prev, { ...sponsor, id: `s${Date.now()}` }]);
        }
        setIsEditing(null);
    };

    const handleDelete = () => {
        if (!deletingSponsor) return;
        setSponsors(prev => prev.filter(s => s.id !== deletingSponsor.id));
        setDeletingSponsor(null);
    };

    return (
        <div>
            {isEditing && <SponsorEditorModal sponsor={isEditing} onClose={() => setIsEditing(null)} onSave={handleSave} />}
             {deletingSponsor && (
                <Modal isOpen={true} onClose={() => setDeletingSponsor(null)} title="Confirm Deletion">
                    <p className="text-gray-300">Are you sure you want to delete the sponsor "{deletingSponsor.name}"? This will remove them from the player dashboard.</p>
                    <div className="flex justify-end gap-4 mt-6">
                        <Button variant="secondary" onClick={() => setDeletingSponsor(null)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete}>Delete</Button>
                    </div>
                </Modal>
            )}
            <DashboardCard title="Manage Sponsors" icon={<SparklesIcon className="w-6 h-6"/>}>
                 <div className="p-4">
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setIsEditing({})} size="sm"><PlusIcon className="w-5 h-5 mr-2"/>Add Sponsor</Button>
                    </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {sponsors.map(sponsor => (
                            <div key={sponsor.id} className="bg-zinc-800/50 p-4 rounded-lg text-center relative group">
                                <img src={sponsor.logoUrl} alt={sponsor.name} className="h-20 object-contain mx-auto mb-3" />
                                <p className="font-bold text-white">{sponsor.name}</p>
                                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="sm" variant="secondary" className="!p-2" onClick={() => setIsEditing(sponsor)}><PencilIcon className="w-4 h-4"/></Button>
                                    <Button size="sm" variant="danger" className="!p-2" onClick={() => setDeletingSponsor(sponsor)}><TrashIcon className="w-4 h-4"/></Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
};