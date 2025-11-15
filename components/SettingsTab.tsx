

import React, { useState, useEffect } from 'react';
import type { CompanyDetails, SocialLink, CarouselMedia } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { ImageUpload } from './ImageUpload';
import { BuildingOfficeIcon, AtSymbolIcon, SparklesIcon, CogIcon, CreditCardIcon, ExclamationTriangleIcon, TrashIcon, PlusIcon, XIcon, MusicalNoteIcon, KeyIcon, InformationCircleIcon } from './icons/Icons';

interface SettingsTabProps {
    companyDetails: CompanyDetails;
    setCompanyDetails: (d: CompanyDetails | ((p: CompanyDetails) => CompanyDetails)) => Promise<void>;
    socialLinks: SocialLink[];
    setSocialLinks: (d: SocialLink[] | ((p: SocialLink[]) => SocialLink[])) => void;
    carouselMedia: CarouselMedia[];
    setCarouselMedia: (d: CarouselMedia[] | ((p: CarouselMedia[]) => CarouselMedia[])) => void;
    onDeleteAllData: () => void;
    addDoc: <T extends {}>(collectionName: string, data: T) => Promise<void>;
    updateDoc: <T extends { id: string; }>(collectionName: string, doc: T) => Promise<void>;
    deleteDoc: (collectionName: string, docId: string) => Promise<void>;
}

type MigrationStatus = 'idle' | 'migrating' | 'complete' | 'error';
interface StorageInfo {
    free: number;
    size: number;
}

// Helper function to ensure companyDetails object has all required arrays/objects to prevent render errors.
const normalizeCompanyDetails = (details: CompanyDetails): CompanyDetails => ({
    ...details,
    bankInfo: details?.bankInfo ?? { bankName: '', accountNumber: '', routingNumber: '' },
});

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};


const FileUploadField: React.FC<{
    label: string;
    fileUrl: string | undefined;
    onUpload: (url: string) => void;
    onRemove: () => void;
    accept: string;
    previewType?: 'image' | 'audio';
}> = ({ label, fileUrl, onUpload, onRemove, accept, previewType = 'image' }) => {
    const previewContent = () => {
        if (!fileUrl) return null;
        switch (previewType) {
            case 'image':
                return <img src={fileUrl} alt="preview" className="w-16 h-16 object-contain rounded-md bg-zinc-800 p-1" />;
            case 'audio':
                return (
                    <div className="w-16 h-16 flex items-center justify-center rounded-md bg-zinc-800 p-1">
                        <MusicalNoteIcon className="w-8 h-8 text-gray-400" />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>
            {fileUrl ? (
                <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-lg border border-zinc-700/50">
                    {previewContent()}
                    <p className="text-xs text-gray-400 truncate flex-grow">File uploaded</p>
                    <Button variant="danger" size="sm" onClick={onRemove} className="!p-2 flex-shrink-0">
                        <TrashIcon className="w-4 h-4" />
                    </Button>
                </div>
            ) : (
                <ImageUpload onUpload={(urls) => { if(urls.length > 0) onUpload(urls[0]); }} accept={accept} />
            )}
        </div>
    );
};


export const SettingsTab: React.FC<SettingsTabProps> = ({ 
    companyDetails, 
    setCompanyDetails, 
    socialLinks,
    setSocialLinks,
    carouselMedia,
    setCarouselMedia,
    onDeleteAllData,
    addDoc, updateDoc, deleteDoc
}) => {
    const [formData, setFormData] = useState(() => normalizeCompanyDetails(companyDetails));
    const [socialLinksData, setSocialLinksData] = useState(socialLinks);
    const [carouselMediaData, setCarouselMediaData] = useState(carouselMedia);
    const [carouselUploadProgress, setCarouselUploadProgress] = useState<number | null>(null);
    const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>('idle');
    const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        setFormData(normalizeCompanyDetails(companyDetails));
        setSocialLinksData(socialLinks);
        setCarouselMediaData(carouselMedia);
    }, [companyDetails, socialLinks, carouselMedia]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Save company details
            await setCompanyDetails(formData);

            // 2. Diff and save Social Links
            const originalLinks = new Map(socialLinks.map(l => [l.id, l]));
            const newLinks = new Map(socialLinksData.map(l => [l.id, l]));

            for (const link of socialLinksData) {
                const original = originalLinks.get(link.id);
                if (!original) { // It's new if it has a temp id and is not in the original map
                    const { id, ...data } = link;
                    await addDoc('socialLinks', data);
                } else if (JSON.stringify(original) !== JSON.stringify(link)) { // It's updated
                    await updateDoc('socialLinks', link);
                }
            }
            for (const original of socialLinks) {
                if (!newLinks.has(original.id)) { // It was deleted
                    await deleteDoc('socialLinks', original.id);
                }
            }
            
            // 3. Diff and save Carousel Media
            const originalMedia = new Map(carouselMedia.map(m => [m.id, m]));
            const newMedia = new Map(carouselMediaData.map(m => [m.id, m]));
            for (const media of carouselMediaData) {
                if (!originalMedia.has(media.id)) { // It's new
                    const { id, ...data } = media;
                    await addDoc('carouselMedia', data);
                }
            }
            for (const original of carouselMedia) {
                if (!newMedia.has(original.id)) { // It was deleted
                    await deleteDoc('carouselMedia', original.id);
                }
            }

            alert("Settings saved successfully!");
        } catch (error) {
            console.error("Failed to save settings:", error);
            alert(`An error occurred while saving: ${(error as Error).message}`);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleSocialLinkChange = (id: string, field: keyof Omit<SocialLink, 'id'>, value: string) => {
        setSocialLinksData(prev => prev.map(link => link.id === id ? { ...link, [field]: value } : link));
    };

    const handleAddSocialLink = () => {
        setSocialLinksData(prev => [...prev, { id: `temp_${Date.now()}`, name: '', url: '', iconUrl: '' }]);
    };
    
    const handleRemoveSocialLink = (id: string) => {
        setSocialLinksData(prev => prev.filter(link => link.id !== id));
    };

    const handleCarouselMediaUpload = (urls: string[]) => {
        const newMedia = urls.map(url => ({
            id: `temp_${Date.now()}-${Math.random()}`,
            type: url.includes('.mp4') || url.includes('.webm') ? 'video' as const : 'image' as const, // Simple check based on extension in url
            url: url
        }));
        setCarouselMediaData(prev => [...prev, ...newMedia]);
    };

    const handleRemoveCarouselMedia = (id: string) => {
        setCarouselMediaData(prev => prev.filter(media => media.id !== id));
    };
    
    const isDirty = JSON.stringify(formData) !== JSON.stringify(normalizeCompanyDetails(companyDetails)) ||
                    JSON.stringify(socialLinksData.map(l => ({...l, id: ''}))) !== JSON.stringify(socialLinks.map(l => ({...l, id: ''}))) || // complex check needed
                    socialLinksData.length !== socialLinks.length ||
                    carouselMediaData.length !== carouselMedia.length;


    return (
        <div className="space-y-6">
             <DashboardCard title="Core Company Details" icon={<BuildingOfficeIcon className="w-6 h-6" />}>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <Input label="Company Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                    </div>
                    <div className="md:col-span-2">
                        <Input label="Address" value={formData.address} onChange={e => setFormData(f => ({ ...f, address: e.target.value }))} />
                    </div>
                    <Input label="Registration Number" value={formData.regNumber || ''} onChange={e => setFormData(f => ({ ...f, regNumber: e.target.value }))} />
                    <Input label="VAT Number" value={formData.vatNumber || ''} onChange={e => setFormData(f => ({ ...f, vatNumber: e.target.value }))} />
                    <Input label="Phone" value={formData.phone} onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))} />
                    <Input label="Email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                    <div className="md:col-span-2">
                        <Input label="Website" value={formData.website} onChange={e => setFormData(f => ({ ...f, website: e.target.value }))} />
                    </div>
                    
                    <div className="md:col-span-2 pt-6 border-t border-zinc-800">
                         <h4 className="font-semibold text-gray-200 mb-4 text-lg flex items-center gap-2"><CreditCardIcon className="w-5 h-5"/>Financial Details</h4>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input label="Bank Name" value={formData.bankInfo.bankName} onChange={e => setFormData(f => ({ ...f, bankInfo: {...f.bankInfo, bankName: e.target.value} }))} />
                            <Input label="Account Number" value={formData.bankInfo.accountNumber} onChange={e => setFormData(f => ({ ...f, bankInfo: {...f.bankInfo, accountNumber: e.target.value} }))} />
                            <Input label="Routing/Branch Number" value={formData.bankInfo.routingNumber} onChange={e => setFormData(f => ({ ...f, bankInfo: {...f.bankInfo, routingNumber: e.target.value} }))} />
                        </div>
                    </div>
                </div>
            </DashboardCard>
            
            <DashboardCard title="Branding & Visuals" icon={<SparklesIcon className="w-6 h-6" />}>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FileUploadField
                        label="Company Logo"
                        fileUrl={formData.logoUrl}
                        onUpload={(url) => setFormData(f => ({ ...f, logoUrl: url }))}
                        onRemove={() => setFormData(f => ({ ...f, logoUrl: '' }))}
                        accept="image/*"
                    />
                    <FileUploadField
                        label="Login Screen Background"
                        fileUrl={formData.loginBackgroundUrl}
                        onUpload={(url) => setFormData(f => ({ ...f, loginBackgroundUrl: url }))}
                        onRemove={() => setFormData(f => ({ ...f, loginBackgroundUrl: '' }))}
                        accept="image/*,video/*"
                    />
                     <FileUploadField
                        label="Login Screen Audio"
                        fileUrl={formData.loginAudioUrl}
                        onUpload={(url) => setFormData(f => ({ ...f, loginAudioUrl: url }))}
                        onRemove={() => setFormData(f => ({ ...f, loginAudioUrl: '' }))}
                        accept="audio/*"
                        previewType="audio"
                    />
                    <FileUploadField
                        label="Player Dashboard BG"
                        fileUrl={formData.playerDashboardBackgroundUrl}
                        onUpload={(url) => setFormData(f => ({ ...f, playerDashboardBackgroundUrl: url }))}
                        onRemove={() => setFormData(f => ({ ...f, playerDashboardBackgroundUrl: '' }))}
                        accept="image/*"
                    />
                    <FileUploadField
                        label="Admin Dashboard BG"
                        fileUrl={formData.adminDashboardBackgroundUrl}
                        onUpload={(url) => setFormData(f => ({ ...f, adminDashboardBackgroundUrl: url }))}
                        onRemove={() => setFormData(f => ({ ...f, adminDashboardBackgroundUrl: '' }))}
                        accept="image/*"
                    />
                </div>
            </DashboardCard>

            <DashboardCard title="App & Content Settings" icon={<CogIcon className="w-6 h-6" />}>
                <div className="p-6 space-y-6">
                     <div className="bg-blue-900/40 border border-blue-700 text-blue-200 p-4 rounded-lg">
                        <h4 className="font-bold text-lg flex items-center gap-2"><InformationCircleIcon className="w-5 h-5"/>Data Connection Status Indicator</h4>
                        <p className="text-sm mt-1">
                            A small colored light is displayed in the footer to indicate the application's data source status.
                        </p>
                        <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
                            <li><span className="font-bold text-green-400">Green Light:</span> Connected to the live Firebase database. All data is real-time.</li>
                            <li><span className="font-bold text-blue-400">Blue Light:</span> Connected to a custom API server (advanced). Bypasses Firebase storage limits.</li>
                            <li><span className="font-bold text-yellow-400">Yellow Light:</span> Firebase is disabled or failed to connect. The app is running on local "mock" data. No changes will be saved.</li>
                            <li><span className="font-bold text-gray-400">Flickering Light:</span> Indicates a lost connection to the active data source (e.g., API server is down).</li>
                        </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Minimum Signup Age" type="number" value={formData.minimumSignupAge} onChange={e => setFormData(f => ({...f, minimumSignupAge: Number(e.target.value)}))} />
                        <Input
                            label="Android APK URL"
                            value={formData.apkUrl || ''}
                            onChange={(e) => setFormData(f => ({ ...f, apkUrl: e.target.value }))}
                            placeholder="https://.../app.apk"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1.5">Fixed Event Rules</label>
                        <textarea value={formData.fixedEventRules || ''} onChange={e => setFormData(f => ({...f, fixedEventRules: e.target.value}))} rows={5} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                     <div className="pt-6 border-t border-zinc-800">
                        <h4 className="font-semibold text-gray-200 mb-4 text-lg">Front Page Carousel Media</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                            {carouselMediaData.map(media => (
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
                        <ImageUpload 
                            onUpload={handleCarouselMediaUpload} 
                            accept="image/*,video/*" 
                            multiple 
                            onProgress={(percent) => {
                                setCarouselUploadProgress(percent);
                                if (percent === 100) {
                                    setTimeout(() => setCarouselUploadProgress(null), 1500);
                                }
                            }}
                        />
                         {carouselUploadProgress !== null && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-400 mb-1 text-center">
                                    {carouselUploadProgress < 100 ? `Processing... ${carouselUploadProgress}%` : 'Upload Complete!'}
                                </p>
                                <div className="w-full bg-zinc-700 rounded-full h-2.5">
                                    <div className="bg-red-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${carouselUploadProgress}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                     <div className="pt-6 border-t border-zinc-800">
                        <h4 className="font-semibold text-gray-200 mb-4 text-lg">Social Links</h4>
                        <div className="space-y-3">
                        {socialLinksData.map(link => (
                            <div key={link.id} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end bg-zinc-900/50 p-3 rounded-lg border border-zinc-700/50">
                                <Input value={link.name} onChange={(e) => handleSocialLinkChange(link.id, 'name', e.target.value)} placeholder="Name (e.g., Facebook)" label="Name"/>
                                <Input value={link.url} onChange={(e) => handleSocialLinkChange(link.id, 'url', e.target.value)} placeholder="Full URL" label="URL"/>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Icon</label>
                                    {link.iconUrl ? (
                                        <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-md">
                                            <img src={link.iconUrl} alt="icon" className="w-8 h-8 object-contain rounded"/>
                                            <Button variant="danger" size="sm" className="!p-2 ml-auto" onClick={() => handleSocialLinkChange(link.id, 'iconUrl', '')}>
                                                <XIcon className="w-4 h-4"/>
                                            </Button>
                                        </div>
                                    ) : (
                                        <ImageUpload onUpload={(base64s) => { if (base64s.length > 0) handleSocialLinkChange(link.id, 'iconUrl', base64s[0]) }} accept="image/*" />
                                    )}
                                </div>
                                <Button variant="danger" className="!py-2.5" onClick={() => handleRemoveSocialLink(link.id)}>
                                    <TrashIcon className="w-5 h-5"/>
                                </Button>
                            </div>
                        ))}
                        </div>
                         <Button variant="secondary" size="sm" className="mt-4" onClick={handleAddSocialLink}><PlusIcon className="w-4 h-4 mr-2"/>Add Social Link</Button>
                     </div>
                </div>
            </DashboardCard>

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
                <Button onClick={handleSave} disabled={!isDirty || isSaving} className="w-full py-3 text-lg shadow-lg">
                    {isSaving ? 'Saving...' : isDirty ? 'Save All Settings' : 'All Changes Saved'}
                </Button>
            </div>
        </div>
    );
}