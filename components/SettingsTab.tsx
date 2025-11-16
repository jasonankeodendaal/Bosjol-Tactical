



import React, { useState, useEffect, useContext } from 'react';
import type { CompanyDetails, SocialLink, CarouselMedia } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { ImageUpload } from './ImageUpload';
import { BuildingOfficeIcon, AtSymbolIcon, SparklesIcon, CogIcon, CreditCardIcon, ExclamationTriangleIcon, TrashIcon, PlusIcon, XIcon, MusicalNoteIcon, KeyIcon, InformationCircleIcon, CloudArrowDownIcon, UploadCloudIcon } from './icons/Icons';
import { Modal } from './Modal';
import { DataContext } from '../data/DataContext';
import { UrlOrUploadField } from './UrlOrUploadField';

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
    restoreFromBackup: (backupData: any) => Promise<void>;
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


export const SettingsTab: React.FC<SettingsTabProps> = ({ 
    companyDetails, 
    setCompanyDetails, 
    socialLinks,
    setSocialLinks,
    carouselMedia,
    setCarouselMedia,
    onDeleteAllData,
    addDoc, updateDoc, deleteDoc,
    restoreFromBackup,
}) => {
    const dataContext = useContext(DataContext);
    if (!dataContext) throw new Error("DataContext is not available");

    const [formData, setFormData] = useState(() => normalizeCompanyDetails(companyDetails));
    const [socialLinksData, setSocialLinksData] = useState(socialLinks);
    const [carouselMediaData, setCarouselMediaData] = useState(carouselMedia);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    
    const [backupFile, setBackupFile] = useState<File | null>(null);
    const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);
    const [restoreConfirmText, setRestoreConfirmText] = useState('');
    
    // This effect syncs local form state with context state, but ONLY if the form isn't dirty.
    // This prevents external updates from overwriting local unsaved changes.
    useEffect(() => {
        if (!isDirty) {
            setFormData(normalizeCompanyDetails(companyDetails));
            setSocialLinksData(socialLinks);
            setCarouselMediaData(carouselMedia);
        }
    }, [companyDetails, socialLinks, carouselMedia, isDirty]);

    // This effect calculates and sets the dirty state whenever local or context state changes.
    useEffect(() => {
        const dirty = JSON.stringify(formData) !== JSON.stringify(normalizeCompanyDetails(companyDetails)) ||
                        JSON.stringify(socialLinksData) !== JSON.stringify(socialLinks) ||
                        JSON.stringify(carouselMediaData) !== JSON.stringify(carouselMedia);
        setIsDirty(dirty);
    }, [formData, companyDetails, socialLinksData, socialLinks, carouselMediaData, carouselMedia]);


    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. Save company details
            await setCompanyDetails(formData);

            // 2. Diff and save Social Links
            const originalLinks = new Map(socialLinks.map(l => [l.id, l]));
            const newLinks = new Map(socialLinksData.map(l => [l.id, l]));

            for (const link of socialLinksData) {
                if (!originalLinks.has(link.id)) { // It's new
                    const { id, ...data } = link;
                    await addDoc('socialLinks', data);
                } else if (JSON.stringify(originalLinks.get(link.id)) !== JSON.stringify(link)) { // It's updated
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
    
    const handleCreateBackup = () => {
        const backupData = {
            players: dataContext.players,
            events: dataContext.events,
            ranks: dataContext.ranks,
            badges: dataContext.badges,
            legendaryBadges: dataContext.legendaryBadges,
            gamificationSettings: dataContext.gamificationSettings,
            sponsors: dataContext.sponsors,
            companyDetails: dataContext.companyDetails,
            creatorDetails: dataContext.creatorDetails,
            socialLinks: dataContext.socialLinks,
            carouselMedia: dataContext.carouselMedia,
            vouchers: dataContext.vouchers,
            inventory: dataContext.inventory,
            suppliers: dataContext.suppliers,
            transactions: dataContext.transactions,
            locations: dataContext.locations,
            raffles: dataContext.raffles,
        };

        const jsonString = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().split('T')[0];
        a.download = `bosjol-backup-${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRestore = async () => {
        if (!backupFile) {
            alert("Please select a backup file first.");
            return;
        }

        try {
            const fileContent = await backupFile.text();
            const backupData = JSON.parse(fileContent);
            
            // Basic validation
            if (!backupData.players || !backupData.companyDetails) {
                throw new Error("Invalid or corrupted backup file.");
            }

            await restoreFromBackup(backupData);
            alert("Restore successful! The application will now reload.");
            // DataContext handles reload
        } catch (error) {
            console.error("Restore failed:", error);
            alert(`Restore failed: ${(error as Error).message}`);
        } finally {
            setIsRestoreConfirmOpen(false);
            setBackupFile(null);
            setRestoreConfirmText('');
        }
    };


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
                    <UrlOrUploadField
                        label="Company Logo"
                        fileUrl={formData.logoUrl}
                        onUrlSet={(url) => setFormData(f => ({ ...f, logoUrl: url }))}
                        onRemove={() => setFormData(f => ({ ...f, logoUrl: '' }))}
                        accept="image/*"
                        apiServerUrl={dataContext.companyDetails.apiServerUrl}
                    />
                    <UrlOrUploadField
                        label="Login Screen Background"
                        fileUrl={formData.loginBackgroundUrl}
                        onUrlSet={(url) => setFormData(f => ({ ...f, loginBackgroundUrl: url }))}
                        onRemove={() => setFormData(f => ({ ...f, loginBackgroundUrl: '' }))}
                        accept="image/*,video/*"
                        apiServerUrl={dataContext.companyDetails.apiServerUrl}
                    />
                     <UrlOrUploadField
                        label="Login Screen Audio"
                        fileUrl={formData.loginAudioUrl}
                        onUrlSet={(url) => setFormData(f => ({ ...f, loginAudioUrl: url }))}
                        onRemove={() => setFormData(f => ({ ...f, loginAudioUrl: '' }))}
                        accept="audio/*"
                        previewType="audio"
                        apiServerUrl={dataContext.companyDetails.apiServerUrl}
                    />
                    <UrlOrUploadField
                        label="Player Dashboard BG"
                        fileUrl={formData.playerDashboardBackgroundUrl}
                        onUrlSet={(url) => setFormData(f => ({ ...f, playerDashboardBackgroundUrl: url }))}
                        onRemove={() => setFormData(f => ({ ...f, playerDashboardBackgroundUrl: '' }))}
                        accept="image/*"
                        apiServerUrl={dataContext.companyDetails.apiServerUrl}
                    />
                    <UrlOrUploadField
                        label="Admin Dashboard BG"
                        fileUrl={formData.adminDashboardBackgroundUrl}
                        onUrlSet={(url) => setFormData(f => ({ ...f, adminDashboardBackgroundUrl: url }))}
                        onRemove={() => setFormData(f => ({ ...f, adminDashboardBackgroundUrl: '' }))}
                        accept="image/*"
                        apiServerUrl={dataContext.companyDetails.apiServerUrl}
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
                        <div className="space-y-2">
                            <ImageUpload 
                                onUpload={handleCarouselMediaUpload} 
                                accept="image/*,video/*" 
                                multiple
                                apiServerUrl={dataContext.companyDetails.apiServerUrl} 
                            />
                             <div className="flex items-center gap-2">
                                <hr className="flex-grow border-zinc-600"/><span className="text-xs text-zinc-500">OR</span><hr className="flex-grow border-zinc-600" />
                            </div>
                             <div className="flex gap-2">
                                <Input 
                                    placeholder="Paste Image/Video URL"
                                    className="flex-grow"
                                    id="carousel-url-input"
                                />
                                <Button onClick={() => {
                                    const input = document.getElementById('carousel-url-input') as HTMLInputElement;
                                    if (input && input.value) {
                                        handleCarouselMediaUpload([input.value]);
                                        input.value = '';
                                    }
                                }}>Add URL</Button>
                            </div>
                        </div>
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
                                        <div className="space-y-2">
                                            <ImageUpload onUpload={(urls) => { if (urls.length > 0) handleSocialLinkChange(link.id, 'iconUrl', urls[0]) }} accept="image/*" apiServerUrl={dataContext.companyDetails.apiServerUrl} />
                                            <div className="flex items-center gap-2">
                                                <hr className="flex-grow border-zinc-600" /><span className="text-xs text-zinc-500">OR</span><hr className="flex-grow border-zinc-600" />
                                            </div>
                                            <Input 
                                                placeholder="Paste Icon URL"
                                                onBlur={(e) => { if(e.target.value) handleSocialLinkChange(link.id, 'iconUrl', e.target.value) }}
                                            />
                                        </div>
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

            <DashboardCard title="Backup & Restore" icon={<CogIcon className="w-6 h-6" />}>
                <div className="p-6 space-y-6">
                    <div>
                        <h4 className="font-semibold text-gray-200 text-lg mb-2">Create Full Backup</h4>
                        <p className="text-sm text-gray-400 mb-4">Download a single JSON file containing all application data, including players, events, inventory, settings, and more. Keep this file in a safe place.</p>
                        <Button onClick={handleCreateBackup} variant="secondary">
                            <CloudArrowDownIcon className="w-5 h-5 mr-2" />
                            Download Backup File
                        </Button>
                    </div>
                    <div className="pt-6 border-t border-zinc-800">
                         <h4 className="font-semibold text-gray-200 text-lg mb-2">Restore from Backup</h4>
                         <p className="text-sm text-gray-400 mb-4">Upload a previously created backup file to restore the entire application state. <span className="font-bold text-red-400">Warning:</span> This will completely wipe all current data before importing the backup.</p>
                         <div className="flex flex-col sm:flex-row items-center gap-4">
                            <label className="w-full sm:w-auto">
                                <span className="sr-only">Choose backup file</span>
                                <input 
                                    type="file" 
                                    accept=".json" 
                                    onChange={(e) => setBackupFile(e.target.files ? e.target.files[0] : null)}
                                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-gray-200 hover:file:bg-zinc-700"
                                />
                            </label>
                            <Button onClick={() => setIsRestoreConfirmOpen(true)} disabled={!backupFile}>
                                <UploadCloudIcon className="w-5 h-5 mr-2" />
                                Restore from Backup
                            </Button>
                         </div>
                    </div>
                </div>
            </DashboardCard>
            {isRestoreConfirmOpen && (
                <Modal isOpen={true} onClose={() => setIsRestoreConfirmOpen(false)} title="Confirm Data Restore">
                    <p className="text-amber-300">You are about to <span className="font-bold">completely wipe all existing data</span> and replace it with the contents of the backup file: <span className="font-mono bg-zinc-800 px-1 rounded">{backupFile?.name}</span>.</p>
                    <p className="text-red-400 font-bold mt-2">This action is irreversible.</p>
                    <p className="text-gray-300 mt-4">To confirm, please type "RESTORE" in the box below.</p>
                    <Input 
                        value={restoreConfirmText}
                        onChange={(e) => setRestoreConfirmText(e.target.value)}
                        className="mt-2"
                        placeholder='Type "RESTORE"'
                    />
                    <div className="mt-6">
                        <Button
                            variant="danger"
                            className="w-full"
                            disabled={restoreConfirmText !== 'RESTORE'}
                            onClick={handleRestore}
                        >
                            Confirm and Restore Data
                        </Button>
                    </div>
                </Modal>
            )}

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