import React, { useState, useEffect } from 'react';
import type { CompanyDetails, SocialLink } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { ImageUpload } from './ImageUpload';
import { BuildingOfficeIcon, ExclamationTriangleIcon, TrashIcon, XIcon, PlusIcon } from './icons/Icons';

interface SettingsTabProps {
    companyDetails: CompanyDetails;
    setCompanyDetails: React.Dispatch<React.SetStateAction<CompanyDetails>>;
    onDeleteAllData: () => void;
}


export const SettingsTab: React.FC<SettingsTabProps> = ({ companyDetails, setCompanyDetails, onDeleteAllData }) => {
    const [formData, setFormData] = useState(companyDetails);
    const [socialLink, setSocialLink] = useState({ id: '', name: '', url: '', iconUrl: '' });
    
    useEffect(() => {
        setFormData(companyDetails);
    }, [companyDetails]);

    const handleSave = () => {
        setCompanyDetails(formData);
        alert("Company details saved!");
    };
    
    const handleSocialLinkChange = (id: string, field: keyof SocialLink, value: string) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.map(link => link.id === id ? { ...link, [field]: value } : link)
        }));
    };

    const handleAddSocialLink = () => {
        if (!socialLink.name || !socialLink.url) return;
        setFormData(prev => ({
            ...prev,
            socialLinks: [...prev.socialLinks, { ...socialLink, id: `sl${Date.now()}` }]
        }));
        setSocialLink({ id: '', name: '', url: '', iconUrl: '' });
    };
    
    const handleRemoveSocialLink = (id: string) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.filter(link => link.id !== id)
        }));
    };

    const handleCarouselMediaUpload = (base64: string) => {
        const type = base64.startsWith('data:image') ? 'image' : 'video';
        setFormData(prev => ({
            ...prev,
            carouselMedia: [...prev.carouselMedia, { id: `cm${Date.now()}`, type, url: base64 }]
        }))
    };

    const handleRemoveCarouselMedia = (id: string) => {
        setFormData(prev => ({
            ...prev,
            carouselMedia: prev.carouselMedia.filter(media => media.id !== id)
        }));
    };


    const isDirty = JSON.stringify(formData) !== JSON.stringify(companyDetails);

    return (
        <div className="space-y-6">
            <DashboardCard title="Company Details" icon={<BuildingOfficeIcon className="w-6 h-6" />}>
                 <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Company Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                        <Input label="Website" value={formData.website} onChange={e => setFormData(f => ({ ...f, website: e.target.value }))} />
                        <Input label="Phone" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
                        <Input label="Email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                        <Input label="Address" value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} className="md:col-span-2"/>
                        <Input label="Minimum Signup Age" type="number" value={formData.minimumSignupAge} onChange={e => setFormData(f => ({...f, minimumSignupAge: Number(e.target.value)}))} />
                    </div>
                     <div className="pt-4 border-t border-zinc-700">
                        <h4 className="font-semibold text-gray-200 mb-2">Branding & Assets</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">Company Logo</label>
                                <ImageUpload onUpload={(url) => setFormData(f => ({...f, logoUrl: url}))} accept="image/*" />
                                {formData.logoUrl && <img src={formData.logoUrl} alt="logo preview" className="w-24 h-24 object-contain rounded-md bg-zinc-800 p-1 mt-2" />}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">Login Screen Background (Image/Video)</label>
                                <ImageUpload onUpload={(url) => setFormData(f => ({...f, loginBackgroundUrl: url}))} accept="image/*,video/*" />
                            </div>
                             <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">Login Screen Audio</label>
                                <ImageUpload onUpload={(url) => setFormData(f => ({...f, loginAudioUrl: url}))} accept="audio/*" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">Android APK File</label>
                                <ImageUpload onUpload={(url) => setFormData(f => ({...f, apkUrl: url}))} accept=".apk" />
                            </div>
                        </div>
                     </div>
                     <div className="pt-4 border-t border-zinc-700">
                        <h4 className="font-semibold text-gray-200 mb-2">Front Page Carousel Media</h4>
                         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                            {formData.carouselMedia.map(media => (
                                <div key={media.id} className="relative group aspect-video bg-zinc-800 rounded-md overflow-hidden">
                                    {media.type === 'image' ? (
                                        <img src={media.url} alt="carousel item" className="w-full h-full object-cover" />
                                    ) : (
                                        <video src={media.url} muted loop className="w-full h-full object-cover" />
                                    )}
                                    <button
                                        onClick={() => handleRemoveCarouselMedia(media.id)}
                                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <XIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            ))}
                         </div>
                        <ImageUpload onUpload={handleCarouselMediaUpload} accept="image/*,video/*" />
                     </div>
                      <div className="pt-4 border-t border-zinc-700">
                        <h4 className="font-semibold text-gray-200 mb-2">Social Links</h4>
                        {formData.socialLinks.map(link => (
                            <div key={link.id} className="flex items-center gap-2 mb-2">
                                <Input value={link.name} onChange={(e) => handleSocialLinkChange(link.id, 'name', e.target.value)} placeholder="Name (e.g., Facebook)" />
                                <Input value={link.url} onChange={(e) => handleSocialLinkChange(link.id, 'url', e.target.value)} placeholder="URL" />
                                <Input value={link.iconUrl} onChange={(e) => handleSocialLinkChange(link.id, 'iconUrl', e.target.value)} placeholder="Icon URL" />
                                <Button variant="danger" size="sm" className="!p-2.5" onClick={() => handleRemoveSocialLink(link.id)}><TrashIcon className="w-5 h-5"/></Button>
                            </div>
                        ))}
                         <div className="flex items-end gap-2">
                            <Input value={socialLink.name} onChange={(e) => setSocialLink(s => ({...s, name: e.target.value}))} placeholder="Name" />
                            <Input value={socialLink.url} onChange={(e) => setSocialLink(s => ({...s, url: e.target.value}))} placeholder="URL" />
                            <Input value={socialLink.iconUrl} onChange={(e) => setSocialLink(s => ({...s, iconUrl: e.target.value}))} placeholder="Icon URL" />
                            <Button variant="secondary" size="sm" className="!p-2.5" onClick={handleAddSocialLink}><PlusIcon className="w-5 h-5"/></Button>
                        </div>
                     </div>
                     <div className="pt-4 border-t border-zinc-700">
                        <Button onClick={handleSave} disabled={!isDirty} className="w-full">
                            {isDirty ? 'Save Company Details' : 'Saved'}
                        </Button>
                     </div>
                 </div>
            </DashboardCard>
             <DashboardCard title="Danger Zone" icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-500"/>}>
                <div className="p-6 space-y-4">
                    <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg">
                        <h4 className="font-bold">Delete All Transactional Data</h4>
                        <p className="text-sm mb-3">This will permanently delete all players, events, inventory, financials, and other user-generated data. System data like ranks and badges will not be affected. This action cannot be undone.</p>
                        <Button onClick={onDeleteAllData} variant="danger">
                            <TrashIcon className="w-5 h-5 mr-2" />
                            Delete All Data
                        </Button>
                    </div>
                </div>
            </DashboardCard>
        </div>
    );
};