import React, { useState, useEffect, useContext, useRef } from 'react';
import type { CompanyDetails, SocialLink, CarouselMedia, Admin } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { BuildingOfficeIcon, AtSymbolIcon, SparklesIcon, CogIcon, CreditCardIcon, ExclamationTriangleIcon, TrashIcon, PlusIcon, XIcon, MusicalNoteIcon, KeyIcon, InformationCircleIcon, CloudArrowDownIcon, UploadCloudIcon, UserCircleIcon, CircleStackIcon, ArrowPathIcon, CheckCircleIcon } from './icons/Icons';
import { Modal } from './Modal';
import { DataContext } from '../data/DataContext';
import { UrlOrUploadField } from './UrlOrUploadField';
import { AuthContext } from '../auth/AuthContext';
import { deleteFromSupabaseStorage } from '../utils/storageCleaner';

interface SettingsTabProps {
    companyDetails: CompanyDetails;
    setCompanyDetails: (d: CompanyDetails | ((p: CompanyDetails) => CompanyDetails)) => Promise<void>;
    socialLinks: SocialLink[];
    setSocialLinks: (d: SocialLink[] | ((p: SocialLink[]) => SocialLink[])) => void;
    carouselMedia: CarouselMedia[];
    setCarouselMedia: (d: CarouselMedia[] | ((p: CarouselMedia[]) => CarouselMedia[])) => void;
    onDeleteAllData: () => void;
    deleteAllPlayers: () => Promise<void>;
    addDoc: <T extends {}>(collectionName: string, data: T) => Promise<void>;
    updateDoc: <T extends { id: string; }>(collectionName: string, doc: T) => Promise<void>;
    deleteDoc: (collectionName: string, docId: string) => Promise<void>;
    restoreFromBackup: (backupData: any) => Promise<void>;
}

const normalizeCompanyDetails = (details: CompanyDetails): CompanyDetails => ({
    ...details,
    bankInfo: details?.bankInfo ?? { bankName: '', accountNumber: '', routingNumber: '' },
});

export const SettingsTab: React.FC<SettingsTabProps> = ({ 
    companyDetails, 
    setCompanyDetails, 
    socialLinks,
    setSocialLinks,
    carouselMedia,
    setCarouselMedia,
    onDeleteAllData,
    deleteAllPlayers,
    addDoc, updateDoc, deleteDoc,
    restoreFromBackup,
}) => {
    const dataContext = useContext(DataContext);
    if (!dataContext) throw new Error("DataContext is not available");
    
    const auth = useContext(AuthContext);
    const adminUser = auth?.user?.role === 'admin' ? (auth.user as Admin) : null;

    const [formData, setFormData] = useState(() => normalizeCompanyDetails(companyDetails));
    const [adminFormData, setAdminFormData] = useState(adminUser);
    const [socialLinksData, setSocialLinksData] = useState(socialLinks);
    const [carouselMediaData, setCarouselMediaData] = useState(carouselMedia);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const justSavedRef = useRef(false);
    
    const [backupFile, setBackupFile] = useState<File | null>(null);
    const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);
    const [restoreConfirmText, setRestoreConfirmText] = useState('');

    const [isDeletePlayersConfirmOpen, setIsDeletePlayersConfirmOpen] = useState(false);
    const [deletePlayersConfirmText, setDeletePlayersConfirmText] = useState('');

    const [activeSection, setActiveSection] = useState<'profile' | 'company' | 'branding' | 'app' | 'backup' | 'danger'>('profile');
    
    useEffect(() => {
        if (justSavedRef.current) {
            justSavedRef.current = false;
            return;
        }
        if (!isDirty) {
            setFormData(normalizeCompanyDetails(companyDetails));
            setSocialLinksData(socialLinks);
            setCarouselMediaData(carouselMedia);
            if (adminUser) {
                setAdminFormData(adminUser);
            }
        }
    }, [companyDetails, socialLinks, carouselMedia, adminUser, isDirty]);

    const handleFormChange = (updater: (prev: CompanyDetails) => CompanyDetails) => {
        setFormData(prev => {
            const next = updater(prev);
            setIsDirty(true);
            return next;
        });
    };

    const handleSocialLinkChange = (id: string, field: keyof SocialLink, value: string) => {
        setSocialLinksData(prev => {
            const next = prev.map(item => item.id === id ? { ...item, [field]: value } : item);
            setIsDirty(true);
            return next;
        });
    };

    const handleAddSocialLink = () => {
        const newLink: SocialLink = { id: `link_${Date.now()}`, name: '', url: '', iconUrl: '' };
        setSocialLinksData(prev => [...prev, newLink]);
        setIsDirty(true);
    };

    const handleRemoveSocialLink = (id: string) => {
        setSocialLinksData(prev => prev.filter(item => item.id !== id));
        setIsDirty(true);
    };

    const handleAddCarouselMedia = (url: string) => {
        if (!url) return;
        const isVideo = url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('video');
        const newMedia: CarouselMedia = {
            id: `media_${Date.now()}`,
            type: isVideo ? 'video' : 'image',
            url,
        };
        setCarouselMediaData(prev => [...prev, newMedia]);
        setIsDirty(true);
    };

    const handleRemoveCarouselMedia = (id: string) => {
        const itemToRemove = carouselMediaData.find(item => item.id === id);
        if (itemToRemove?.url) {
            deleteFromSupabaseStorage(itemToRemove.url).catch(err => {
                console.warn('[SettingsTab] Error deleting removed carousel media from storage:', err);
            });
        }
        setCarouselMediaData(prev => prev.filter(item => item.id !== id));
        setIsDirty(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            justSavedRef.current = true;
            await setCompanyDetails(formData);
            setSocialLinks(socialLinksData);
            setCarouselMedia(carouselMediaData);

            if (adminUser && adminFormData) {
                await updateDoc('admins', adminFormData);
            }

            setIsDirty(false);
            alert('Settings saved successfully!');
        } catch (error) {
            justSavedRef.current = false;
            console.error('Failed to save settings:', error);
            alert(`Failed to save settings: ${(error as Error).message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateBackup = () => {
        const fullBackup = {
            version: '2.0',
            exportedAt: new Date().toISOString(),
            companyDetails: formData,
            socialLinks: socialLinksData,
            carouselMedia: carouselMediaData,
            players: dataContext.players,
            events: dataContext.events,
            inventory: dataContext.inventory,
            suppliers: dataContext.suppliers,
            locations: dataContext.locations,
            transactions: dataContext.transactions,
            vouchers: dataContext.vouchers,
            raffles: dataContext.raffles,
            sponsors: dataContext.sponsors,
            honors: dataContext.honors,
            ranks: dataContext.ranks,
            badges: dataContext.badges,
            legendaryBadges: dataContext.legendaryBadges,
            gamificationSettings: dataContext.gamificationSettings,
        };

        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute('download', `airsoft_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    const handleRestore = async () => {
        if (!backupFile) return;
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const parsedData = JSON.parse(e.target?.result as string);
                    await restoreFromBackup(parsedData);
                    alert('Restore successful! The application is reloading.');
                } catch (parseError) {
                    alert('Failed to parse backup JSON file.');
                }
            };
            reader.readAsText(backupFile);
        } catch (error) {
            alert(`Restore failed: ${(error as Error).message}`);
        } finally {
            setIsRestoreConfirmOpen(false);
            setBackupFile(null);
            setRestoreConfirmText('');
        }
    };

    const handleDeleteAllPlayers = async () => {
        try {
            await deleteAllPlayers();
            alert('All player data has been successfully deleted.');
        } catch (error) {
            alert(`Failed to delete players: ${(error as Error).message}`);
        } finally {
            setIsDeletePlayersConfirmOpen(false);
            setDeletePlayersConfirmText('');
        }
    };

    return (
        <div className="w-full space-y-3 sm:space-y-4">
            {/* Top Free-View Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                    <CogIcon className="w-5 h-5 text-red-500" />
                    <div>
                        <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wider">
                            System Settings & Configuration
                        </h2>
                        <p className="text-[10px] sm:text-xs text-zinc-400">
                            Manage arena profile, branding media, backup/restore and platform security
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Settings Section Dropdown Menu */}
                    <div className="relative flex items-center">
                        <select
                            value={activeSection}
                            onChange={(e) => setActiveSection(e.target.value as any)}
                            className="bg-zinc-900/90 border border-zinc-700/80 text-white text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-500 cursor-pointer shadow-sm hover:bg-zinc-800 transition-colors"
                            aria-label="Select Settings Section"
                        >
                            <option value="profile">👤 Admin Profile</option>
                            <option value="company">🏢 Company & Banking</option>
                            <option value="branding">✨ Branding & Media</option>
                            <option value="app">⚙️ App & Content</option>
                            <option value="backup">☁️ Backup & Restore</option>
                            <option value="danger">⚠️ Danger Zone</option>
                        </select>
                    </div>

                    <Button 
                        onClick={handleSave} 
                        disabled={!isDirty || isSaving} 
                        size="sm" 
                        className={`!py-1.5 !px-3.5 text-xs font-bold transition-all ${isDirty ? 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/30 animate-pulse' : 'bg-zinc-800 text-zinc-400'}`}
                    >
                        {isSaving ? 'Saving...' : isDirty ? 'Save Changes' : 'Saved'}
                    </Button>
                </div>
            </div>

            {/* Quick Section Nav Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
                {[
                    { id: 'profile', label: 'Admin Profile', icon: <UserCircleIcon className="w-3.5 h-3.5" /> },
                    { id: 'company', label: 'Company & Banking', icon: <BuildingOfficeIcon className="w-3.5 h-3.5" /> },
                    { id: 'branding', label: 'Branding & Media', icon: <SparklesIcon className="w-3.5 h-3.5" /> },
                    { id: 'app', label: 'App & Content', icon: <CogIcon className="w-3.5 h-3.5" /> },
                    { id: 'backup', label: 'Backup & Restore', icon: <CloudArrowDownIcon className="w-3.5 h-3.5" /> },
                    { id: 'danger', label: 'Danger Zone', icon: <ExclamationTriangleIcon className="w-3.5 h-3.5 text-red-400" /> },
                ].map(sec => (
                    <button
                        key={sec.id}
                        onClick={() => setActiveSection(sec.id as any)}
                        className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap text-xs ${activeSection === sec.id ? 'bg-red-600 text-white font-extrabold shadow-md shadow-red-950/40 border border-red-500' : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80'}`}
                    >
                        {sec.icon}
                        <span>{sec.label}</span>
                    </button>
                ))}
            </div>

            {/* SECTION 1: ADMIN PROFILE */}
            {activeSection === 'profile' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                    <div className="sm:col-span-1">
                        <UrlOrUploadField
                            label="Admin Avatar"
                            fileUrl={adminFormData?.avatarUrl}
                            onUrlSet={(url) => {
                                setAdminFormData(f => f ? ({ ...f, avatarUrl: url }) : null);
                                setIsDirty(true);
                            }}
                            onRemove={() => {
                                setAdminFormData(f => f ? ({ ...f, avatarUrl: '' }) : null);
                                setIsDirty(true);
                            }}
                            accept="image/*"
                            apiServerUrl={formData.apiServerUrl}
                        />
                    </div>
                    <div className="sm:col-span-2 space-y-2.5">
                        <Input
                            label="Admin Display Name"
                            value={adminFormData?.name || ''}
                            onChange={e => {
                                setAdminFormData(f => f ? ({ ...f, name: e.target.value }) : null);
                                setIsDirty(true);
                            }}
                        />
                        <Input
                            label="Admin Login Email (Read Only)"
                            value={adminFormData?.email || ''}
                            disabled
                        />
                    </div>
                </div>
            )}

            {/* SECTION 2: COMPANY & BANKING */}
            {activeSection === 'company' && (
                <div className="space-y-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        <div className="sm:col-span-2">
                            <Input label="Arena / Company Name" value={formData.name} onChange={e => handleFormChange(f => ({ ...f, name: e.target.value }))} />
                        </div>
                        <Input label="Phone" type="tel" value={formData.phone} onChange={e => handleFormChange(f => ({ ...f, phone: e.target.value }))} />
                        <div className="sm:col-span-2">
                            <Input label="Physical Arena Address" value={formData.address} onChange={e => handleFormChange(f => ({ ...f, address: e.target.value }))} />
                        </div>
                        <Input label="Official Email" value={formData.email} onChange={e => handleFormChange(f => ({ ...f, email: e.target.value }))} />
                        <Input label="Registration Number" value={formData.regNumber || ''} onChange={e => handleFormChange(f => ({ ...f, regNumber: e.target.value }))} />
                        <Input label="VAT Number" value={formData.vatNumber || ''} onChange={e => handleFormChange(f => ({ ...f, vatNumber: e.target.value }))} />
                        <Input label="Official Website" value={formData.website} onChange={e => handleFormChange(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
                    </div>

                    <div className="pt-3 border-t border-zinc-800/70">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 mb-2">
                            <CreditCardIcon className="w-3.5 h-3.5 text-amber-400" /> Financial & Banking Credentials
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <Input label="Bank Name" value={formData.bankInfo.bankName} onChange={e => handleFormChange(f => ({ ...f, bankInfo: {...f.bankInfo, bankName: e.target.value} }))} />
                            <Input label="Account Number" value={formData.bankInfo.accountNumber} onChange={e => handleFormChange(f => ({ ...f, bankInfo: {...f.bankInfo, accountNumber: e.target.value} }))} />
                            <Input label="Branch / Routing Number" value={formData.bankInfo.routingNumber} onChange={e => handleFormChange(f => ({ ...f, bankInfo: {...f.bankInfo, routingNumber: e.target.value} }))} />
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 3: BRANDING & MEDIA */}
            {activeSection === 'branding' && (
                <div className="space-y-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                        <UrlOrUploadField
                            label="Company Logo"
                            fileUrl={formData.logoUrl}
                            onUrlSet={(url) => handleFormChange(f => ({ ...f, logoUrl: url }))}
                            onRemove={() => handleFormChange(f => ({ ...f, logoUrl: '' }))}
                            accept="image/*"
                            apiServerUrl={formData.apiServerUrl}
                        />
                        <UrlOrUploadField
                            label="Login Background"
                            fileUrl={formData.loginBackgroundUrl}
                            onUrlSet={(url) => handleFormChange(f => ({ ...f, loginBackgroundUrl: url }))}
                            onRemove={() => handleFormChange(f => ({ ...f, loginBackgroundUrl: '' }))}
                            accept="image/*,video/*"
                            apiServerUrl={formData.apiServerUrl}
                        />
                        <UrlOrUploadField
                            label="Login Audio"
                            fileUrl={formData.loginAudioUrl}
                            onUrlSet={(url) => handleFormChange(f => ({ ...f, loginAudioUrl: url }))}
                            onRemove={() => handleFormChange(f => ({ ...f, loginAudioUrl: '' }))}
                            accept="audio/*"
                            previewType="audio"
                            apiServerUrl={formData.apiServerUrl}
                        />
                        <UrlOrUploadField
                            label="Player Dashboard BG"
                            fileUrl={formData.playerDashboardBackgroundUrl}
                            onUrlSet={(url) => handleFormChange(f => ({ ...f, playerDashboardBackgroundUrl: url }))}
                            onRemove={() => handleFormChange(f => ({ ...f, playerDashboardBackgroundUrl: '' }))}
                            accept="image/*,video/*"
                            previewType="video"
                            apiServerUrl={formData.apiServerUrl}
                        />
                        <UrlOrUploadField
                            label="Player Audio"
                            fileUrl={formData.playerDashboardAudioUrl}
                            onUrlSet={(url) => handleFormChange(f => ({ ...f, playerDashboardAudioUrl: url }))}
                            onRemove={() => handleFormChange(f => ({ ...f, playerDashboardAudioUrl: '' }))}
                            accept="audio/*"
                            previewType="audio"
                            apiServerUrl={formData.apiServerUrl}
                        />
                        <UrlOrUploadField
                            label="Admin Dashboard BG"
                            fileUrl={formData.adminDashboardBackgroundUrl}
                            onUrlSet={(url) => handleFormChange(f => ({ ...f, adminDashboardBackgroundUrl: url }))}
                            onRemove={() => handleFormChange(f => ({ ...f, adminDashboardBackgroundUrl: '' }))}
                            accept="image/*,video/*"
                            previewType="video"
                            apiServerUrl={formData.apiServerUrl}
                        />
                        <UrlOrUploadField
                            label="Admin Audio"
                            fileUrl={formData.adminDashboardAudioUrl}
                            onUrlSet={(url) => handleFormChange(f => ({ ...f, adminDashboardAudioUrl: url }))}
                            onRemove={() => handleFormChange(f => ({ ...f, adminDashboardAudioUrl: '' }))}
                            accept="audio/*"
                            previewType="audio"
                            apiServerUrl={formData.apiServerUrl}
                        />
                        <UrlOrUploadField
                            label="Sponsors BG"
                            fileUrl={formData.sponsorsBackgroundUrl}
                            onUrlSet={(url) => handleFormChange(f => ({ ...f, sponsorsBackgroundUrl: url }))}
                            onRemove={() => handleFormChange(f => ({ ...f, sponsorsBackgroundUrl: '' }))}
                            accept="image/*"
                            apiServerUrl={formData.apiServerUrl}
                        />
                    </div>
                </div>
            )}

            {/* SECTION 4: APP & CONTENT SETTINGS */}
            {activeSection === 'app' && (
                <div className="space-y-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <Input label="Minimum Signup Age" type="number" value={formData.minimumSignupAge} onChange={e => handleFormChange(f => ({...f, minimumSignupAge: Number(e.target.value)}))} />
                        <UrlOrUploadField
                            label="Android APK Download URL / File"
                            fileUrl={formData.apkUrl}
                            onUrlSet={(url) => handleFormChange(f => ({ ...f, apkUrl: url }))}
                            onRemove={() => handleFormChange(f => ({ ...f, apkUrl: '' }))}
                            accept=".apk,application/vnd.android.package-archive"
                            apiServerUrl={formData.apiServerUrl}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-zinc-400 mb-1">Standard Event Briefing / Safety Rules</label>
                        <textarea 
                            value={formData.fixedEventRules || ''} 
                            onChange={e => handleFormChange(f => ({...f, fixedEventRules: e.target.value}))} 
                            rows={3} 
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500" 
                        />
                    </div>

                    <div className="pt-2 border-t border-zinc-800/70">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Social Links</h4>
                            <Button variant="secondary" size="sm" className="!py-0.5 !px-2 text-xs" onClick={handleAddSocialLink}>
                                <PlusIcon className="w-3 h-3 mr-1"/>Add Link
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {socialLinksData.map(link => (
                                <div key={link.id} className="flex items-center gap-2 bg-zinc-950/60 p-2 rounded-lg border border-zinc-800">
                                    <Input value={link.name} onChange={(e) => handleSocialLinkChange(link.id, 'name', e.target.value)} placeholder="Network" className="!text-xs" />
                                    <Input value={link.url} onChange={(e) => handleSocialLinkChange(link.id, 'url', e.target.value)} placeholder="URL" className="!text-xs" />
                                    <button onClick={() => handleRemoveSocialLink(link.id)} className="p-1 text-zinc-500 hover:text-red-400">
                                        <TrashIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 5: BACKUP & RESTORE */}
            {activeSection === 'backup' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/80">
                    <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800 space-y-2">
                        <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                            <CloudArrowDownIcon className="w-4 h-4 text-green-400" /> Export Full System JSON
                        </h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                            Download a full JSON archive containing all players, inventory, matches, finances, and system configs.
                        </p>
                        <Button onClick={handleCreateBackup} size="sm" variant="secondary" className="w-full !py-1.5 text-xs">
                            <CloudArrowDownIcon className="w-4 h-4 mr-1.5" /> Download System Backup
                        </Button>
                    </div>

                    <div className="p-3 bg-zinc-950/60 rounded-lg border border-zinc-800 space-y-2">
                        <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                            <UploadCloudIcon className="w-4 h-4 text-amber-400" /> Restore from JSON
                        </h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                            Upload a previously exported backup file to restore database collections.
                        </p>
                        <div className="flex items-center gap-2">
                            <input 
                                type="file" 
                                accept=".json" 
                                onChange={(e) => setBackupFile(e.target.files ? e.target.files[0] : null)}
                                className="block w-full text-xs text-gray-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-zinc-800 file:text-gray-200"
                            />
                            <Button onClick={() => setIsRestoreConfirmOpen(true)} disabled={!backupFile} size="sm" className="!py-1.5 !px-2.5 text-xs flex-shrink-0">
                                Restore
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* SECTION 6: DANGER ZONE */}
            {activeSection === 'danger' && (
                <div className="space-y-2.5 p-3 rounded-xl bg-red-950/20 border border-red-900/50">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-2.5 bg-red-950/40 border border-red-800/40 rounded-lg">
                        <div>
                            <h4 className="font-bold text-white text-xs sm:text-sm">Delete All Transactional Data</h4>
                            <p className="text-[10px] sm:text-xs text-red-300">Wipes all players, events, tickets, match logs, and financial records.</p>
                        </div>
                        <Button onClick={onDeleteAllData} variant="danger" size="sm" className="!py-1 !px-2.5 text-xs flex-shrink-0">
                            <TrashIcon className="w-3.5 h-3.5 mr-1" /> Delete All Data
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-2.5 bg-red-950/40 border border-red-800/40 rounded-lg">
                        <div>
                            <h4 className="font-bold text-white text-xs sm:text-sm">Delete All Player Profiles Only</h4>
                            <p className="text-[10px] sm:text-xs text-red-300">Removes registered player documents while keeping arena configuration.</p>
                        </div>
                        <Button onClick={() => setIsDeletePlayersConfirmOpen(true)} variant="danger" size="sm" className="!py-1 !px-2.5 text-xs flex-shrink-0">
                            <TrashIcon className="w-3.5 h-3.5 mr-1" /> Delete Players
                        </Button>
                    </div>
                </div>
            )}

            {/* Modals */}
            {isRestoreConfirmOpen && (
                <Modal isOpen={true} onClose={() => setIsRestoreConfirmOpen(false)} title="Confirm Data Restore">
                    <p className="text-amber-300 text-xs">You are about to <span className="font-bold">completely wipe and replace all existing data</span> with the contents of: <span className="font-mono bg-zinc-800 px-1 rounded">{backupFile?.name}</span>.</p>
                    <p className="text-gray-300 text-xs mt-3">To confirm, please type "RESTORE" below.</p>
                    <Input 
                        value={restoreConfirmText}
                        onChange={(e) => setRestoreConfirmText(e.target.value)}
                        className="mt-2"
                        placeholder='Type "RESTORE"'
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setIsRestoreConfirmOpen(false)}>Cancel</Button>
                        <Button variant="danger" size="sm" disabled={restoreConfirmText !== 'RESTORE'} onClick={handleRestore}>
                            Confirm Restore
                        </Button>
                    </div>
                </Modal>
            )}

            {isDeletePlayersConfirmOpen && (
                <Modal isOpen={true} onClose={() => setIsDeletePlayersConfirmOpen(false)} title="Confirm Deletion of All Players">
                    <p className="text-amber-300 text-xs">You are about to <span className="font-bold">permanently delete all player data</span>. This action is irreversible.</p>
                    <p className="text-gray-300 text-xs mt-3">To confirm, please type "DELETE PLAYERS" below.</p>
                    <Input 
                        value={deletePlayersConfirmText}
                        onChange={(e) => setDeletePlayersConfirmText(e.target.value)}
                        className="mt-2"
                        placeholder='Type "DELETE PLAYERS"'
                    />
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setIsDeletePlayersConfirmOpen(false)}>Cancel</Button>
                        <Button variant="danger" size="sm" disabled={deletePlayersConfirmText !== 'DELETE PLAYERS'} onClick={handleDeleteAllPlayers}>
                            Delete All Players
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};
