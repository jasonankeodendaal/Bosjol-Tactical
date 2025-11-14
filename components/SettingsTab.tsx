import React, { useState, useEffect } from 'react';
import type { CompanyDetails, SocialLink } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { ImageUpload } from './ImageUpload';
import { BuildingOfficeIcon, AtSymbolIcon, SparklesIcon, CogIcon, CreditCardIcon, ExclamationTriangleIcon, TrashIcon, PlusIcon, XIcon } from './icons/Icons';

interface SettingsTabProps {
    companyDetails: CompanyDetails;
    setCompanyDetails: (d: CompanyDetails | ((p: CompanyDetails) => CompanyDetails)) => void;
    onDeleteAllData: () => void;
}

// Helper function to ensure companyDetails object has all required arrays/objects to prevent render errors.
const normalizeCompanyDetails = (details: CompanyDetails): CompanyDetails => ({
    ...details,
    socialLinks: details?.socialLinks ?? [],
    carouselMedia: details?.carouselMedia ?? [],
    bankInfo: details?.bankInfo ?? { bankName: '', accountNumber: '', routingNumber: '' },
});


export const SettingsTab: React.FC<SettingsTabProps> = ({ companyDetails, setCompanyDetails, onDeleteAllData }) => {
    const [formData, setFormData] = useState(() => normalizeCompanyDetails(companyDetails));
    
    useEffect(() => {
        setFormData(normalizeCompanyDetails(companyDetails));
    }, [companyDetails]);

    const handleSave = () => {
        setCompanyDetails(formData);
        alert("Settings saved!");
    };
    
    const handleSocialLinkChange = (id: string, field: keyof Omit<SocialLink, 'id'>, value: string) => {
        setFormData(prev => ({
            ...prev,
            socialLinks: prev.socialLinks.map(link => link.id === id ? { ...link, [field]: value } : link)
        }));
    };

    const handleAddSocialLink = () => {
        setFormData(prev => ({
            ...prev,
            socialLinks: [...prev.socialLinks, { id: `sl${Date.now()}`, name: '', url: '', iconUrl: '' }]
        }));
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Column 1 */}
                 <div className="space-y-6">
                     <DashboardCard title="Company Information" icon={<BuildingOfficeIcon className="w-6 h-6" />}>
                        <div className="p-6 space-y-4">
                            <Input label="Company Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                            <Input label="Address" value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Registration Number" value={formData.regNumber || ''} onChange={e => setFormData(f => ({ ...f, regNumber: e.target.value }))} />
                                <Input label="VAT Number" value={formData.vatNumber || ''} onChange={e => setFormData(f => ({ ...f, vatNumber: e.target.value }))} />
                            </div>
                        </div>
                    </DashboardCard>
                    <DashboardCard title="Contact & Socials" icon={<AtSymbolIcon className="w-6 h-6" />}>
                        <div className="p-6 space-y-4">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Phone" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
                                <Input label="Email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                            </div>
                            <Input label="Website" value={formData.website} onChange={e => setFormData(f => ({ ...f, website: e.target.value }))} />

                             <div className="pt-4 border-t border-zinc-700">
                                <h4 className="font-semibold text-gray-200 mb-2">Social Links</h4>
                                <div className="space-y-2">
                                {formData.socialLinks.map(link => (
                                    <div key={link.id} className="flex items-center gap-2">
                                        <Input value={link.name} onChange={(e) => handleSocialLinkChange(link.id, 'name', e.target.value)} placeholder="Name (e.g., Facebook)" />
                                        <Input value={link.url} onChange={(e) => handleSocialLinkChange(link.id, 'url', e.target.value)} placeholder="URL" />
                                        <Input value={link.iconUrl} onChange={(e) => handleSocialLinkChange(link.id, 'iconUrl', e.target.value)} placeholder="Icon URL" />
                                        <Button variant="danger" size="sm" className="!p-2.5" onClick={() => handleRemoveSocialLink(link.id)}><TrashIcon className="w-5 h-5"/></Button>
                                    </div>
                                ))}
                                </div>
                                 <Button variant="secondary" size="sm" className="mt-3" onClick={handleAddSocialLink}><PlusIcon className="w-4 h-4 mr-2"/>Add Social Link</Button>
                             </div>
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Financial Details" icon={<CreditCardIcon className="w-6 h-6" />}>
                        <div className="p-6 space-y-4">
                             <Input label="Bank Name" value={formData.bankInfo.bankName} onChange={e => setFormData(f => ({ ...f, bankInfo: {...f.bankInfo, bankName: e.target.value} }))} />
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Account Number" value={formData.bankInfo.accountNumber} onChange={e => setFormData(f => ({ ...f, bankInfo: {...f.bankInfo, accountNumber: e.target.value} }))} />
                                <Input label="Routing/Branch Number" value={formData.bankInfo.routingNumber} onChange={e => setFormData(f => ({ ...f, bankInfo: {...f.bankInfo, routingNumber: e.target.value} }))} />
                            </div>
                        </div>
                    </DashboardCard>
                 </div>

                 {/* Column 2 */}
                <div className="space-y-6">
                    <DashboardCard title="Branding & Theming" icon={<SparklesIcon className="w-6 h-6" />}>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-400">Company Logo</label>
                                    <ImageUpload onUpload={(url) => setFormData(f => ({...f, logoUrl: url}))} accept="image/*" />
                                    {formData.logoUrl && <img src={formData.logoUrl} alt="logo preview" className="w-24 h-24 object-contain rounded-md bg-zinc-800 p-1 mt-2" />}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-400">Login Screen Background</label>
                                    <ImageUpload onUpload={(url) => setFormData(f => ({...f, loginBackgroundUrl: url}))} accept="image/*,video/*" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-400">Login Screen Audio</label>
                                    <ImageUpload onUpload={(url) => setFormData(f => ({...f, loginAudioUrl: url}))} accept="audio/*" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-400">Player Dashboard BG</label>
                                    <ImageUpload onUpload={(url) => setFormData(f => ({...f, playerDashboardBackgroundUrl: url}))} accept="image/*" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-400">Admin Dashboard BG</label>
                                    <ImageUpload onUpload={(url) => setFormData(f => ({...f, adminDashboardBackgroundUrl: url}))} accept="image/*" />
                                </div>
                            </div>
                        </div>
                    </DashboardCard>

                    <DashboardCard title="App & Game Settings" icon={<CogIcon className="w-6 h-6" />}>
                        <div className="p-6 space-y-4">
                            <Input label="Minimum Signup Age" type="number" value={formData.minimumSignupAge} onChange={e => setFormData(f => ({...f, minimumSignupAge: Number(e.target.value)}))} />
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1.5">Fixed Event Rules</label>
                                <textarea value={formData.fixedEventRules || ''} onChange={e => setFormData(f => ({...f, fixedEventRules: e.target.value}))} rows={5} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-400">Android APK File</label>
                                <ImageUpload onUpload={(url) => setFormData(f => ({...f, apkUrl: url}))} accept=".apk" />
                            </div>
                             <div className="pt-4 border-t border-zinc-700">
                                <h4 className="font-semibold text-gray-200 mb-2">Front Page Carousel Media</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
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
                        </div>
                    </DashboardCard>
                </div>
            </div>

            <DashboardCard title="Danger Zone" icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-500"/>}>
                <div className="p-6">
                    <div className="bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-center">
                        <div>
                            <h4 className="font-bold">Delete All Transactional Data</h4>
                            <p className="text-sm">This will permanently delete all players, events, inventory, financials, and other user-generated data. System data like ranks and badges will not be affected. This action cannot be undone.</p>
                        </div>
                        <Button onClick={onDeleteAllData} variant="danger" className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
                            <TrashIcon className="w-5 h-5 mr-2" />
                            Delete All Data
                        </Button>
                    </div>
                </div>
            </DashboardCard>

            <div className="mt-6 sticky bottom-6 z-20">
                <Button onClick={handleSave} disabled={!isDirty} className="w-full py-3 text-lg shadow-lg">
                    {isDirty ? 'Save All Settings' : 'All Changes Saved'}
                </Button>
            </div>
        </div>
    );
}