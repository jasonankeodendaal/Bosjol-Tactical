import React, { useState, useEffect, useContext } from 'react';
import type { CreatorDetails } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { ImageUpload } from './ImageUpload';
import { UserCircleIcon, AtSymbolIcon, CodeBracketIcon } from './icons/Icons';
import { DataContext } from '../data/DataContext';

export const CreatorDashboard: React.FC = () => {
    const dataContext = useContext(DataContext);
    if (!dataContext) throw new Error("DataContext not found");

    const { creatorDetails, setCreatorDetails } = dataContext;

    const [formData, setFormData] = useState(creatorDetails);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(creatorDetails);
    }, [creatorDetails]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await setCreatorDetails(formData);
            alert("Creator details updated successfully!");
        } catch (error) {
            console.error("Failed to save creator details:", error);
            alert(`An error occurred: ${(error as Error).message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const isDirty = JSON.stringify(formData) !== JSON.stringify(creatorDetails);

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-6">Creator Dashboard</h1>
            <div className="space-y-6">
                <DashboardCard title="Creator Profile" icon={<UserCircleIcon className="w-6 h-6" />}>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Display Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                        <Input label="Tagline" value={formData.tagline} onChange={e => setFormData(f => ({ ...f, tagline: e.target.value }))} />
                        <div className="md:col-span-2">
                             <label className="block text-sm font-medium text-gray-400 mb-1.5">Bio</label>
                            <textarea value={formData.bio} onChange={e => setFormData(f => ({...f, bio: e.target.value}))} rows={3} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500" />
                        </div>
                        <Input label="Email" type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                        <Input label="WhatsApp Number" value={formData.whatsapp} onChange={e => setFormData(f => ({ ...f, whatsapp: e.target.value }))} />
                        <div>
                             <label className="block text-sm font-medium text-gray-400 mb-1.5">Logo</label>
                            {formData.logoUrl ? (
                                <div className="flex items-center gap-2">
                                    <img src={formData.logoUrl} alt="logo preview" className="w-16 h-16 object-contain rounded-md bg-zinc-800 p-1" />
                                    <Button variant="danger" size="sm" onClick={() => setFormData(f => ({ ...f, logoUrl: '' }))}>Remove</Button>
                                </div>
                            ) : (
                                <ImageUpload onUpload={(urls) => { if (urls.length > 0) setFormData(f => ({ ...f, logoUrl: urls[0] })); }} accept="image/*" />
                            )}
                        </div>
                    </div>
                </DashboardCard>

                <DashboardCard title="App Source Code" icon={<CodeBracketIcon className="w-6 h-6" />}>
                    <div className="p-6">
                         <Input 
                            label="GitHub Repository URL" 
                            value={formData.githubUrl} 
                            onChange={e => setFormData(f => ({ ...f, githubUrl: e.target.value }))} 
                            placeholder="https://github.com/user/repo"
                        />
                         <p className="text-xs text-gray-400 mt-2">This link will be displayed on the Admin's API Setup page to allow them to download the server source code.</p>
                    </div>
                </DashboardCard>

                <div className="mt-6">
                    <Button onClick={handleSave} disabled={!isDirty || isSaving} className="w-full py-3 text-lg">
                        {isSaving ? 'Saving...' : isDirty ? 'Save Creator Settings' : 'All Changes Saved'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
