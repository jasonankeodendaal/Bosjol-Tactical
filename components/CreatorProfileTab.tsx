import React, { useState, useEffect } from 'react';
import type { CreatorDetails, ApiGuideStep } from '../types';
import { DashboardCard } from './DashboardCard';
import { Button } from './Button';
import { Input } from './Input';
import { UrlOrUploadField } from './UrlOrUploadField';
import { UserCircleIcon, CodeBracketIcon, PlusIcon, TrashIcon, PencilIcon } from './icons/Icons';

interface CreatorProfileTabProps {
    creatorDetails: CreatorDetails;
    setCreatorDetails: (d: CreatorDetails | ((p: CreatorDetails) => CreatorDetails)) => Promise<void>;
}

export const CreatorProfileTab: React.FC<CreatorProfileTabProps> = ({ creatorDetails, setCreatorDetails }) => {
    const [formData, setFormData] = useState(creatorDetails);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setIsDirty(JSON.stringify(formData) !== JSON.stringify(creatorDetails));
    }, [formData, creatorDetails]);

    const handleSave = async () => {
        setIsSaving(true);
        await setCreatorDetails(formData);
        setIsSaving(false);
    };
    
    const handleGuideChange = (index: number, field: keyof ApiGuideStep, value: string) => {
        const newGuide = [...formData.apiSetupGuide];
        newGuide[index] = { ...newGuide[index], [field]: value };
        setFormData(f => ({ ...f, apiSetupGuide: newGuide }));
    };

    const addGuideStep = () => {
        const newStep: ApiGuideStep = {
            id: `step_${Date.now()}`,
            title: 'New Step',
            content: '',
            codeBlock: '',
            codeLanguage: 'bash',
            fileName: ''
        };
        setFormData(f => ({ ...f, apiSetupGuide: [...f.apiSetupGuide, newStep] }));
    };

    const removeGuideStep = (index: number) => {
        if (confirm('Are you sure you want to delete this guide step?')) {
            setFormData(f => ({ ...f, apiSetupGuide: f.apiSetupGuide.filter((_, i) => i !== index) }));
        }
    };

    return (
        <div className="space-y-6">
            <DashboardCard title="Creator Profile" icon={<UserCircleIcon className="w-6 h-6" />}>
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <UrlOrUploadField 
                            label="Creator Logo"
                            fileUrl={formData.logoUrl}
                            onUrlSet={(url) => setFormData(f => ({ ...f, logoUrl: url }))}
                            onRemove={() => setFormData(f => ({ ...f, logoUrl: '' }))}
                            accept="image/*"
                        />
                    </div>
                    <div className="md:col-span-2 space-y-4">
                        <Input label="Name" value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} />
                        <Input label="Tagline" value={formData.tagline} onChange={e => setFormData(f => ({ ...f, tagline: e.target.value }))} />
                         <textarea 
                            placeholder="Bio" 
                            value={formData.bio} 
                            onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))}
                            rows={3}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="Contact Email" type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} />
                            <Input label="WhatsApp Number" type="tel" value={formData.whatsapp} onChange={e => setFormData(f => ({ ...f, whatsapp: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input label="GitHub Project URL" value={formData.githubUrl} onChange={e => setFormData(f => ({ ...f, githubUrl: e.target.value }))} />
                             <Input label="API Server ZIP URL" value={formData.sourceCodeZipUrl || ''} onChange={e => setFormData(f => ({ ...f, sourceCodeZipUrl: e.target.value }))} />
                        </div>
                    </div>
                </div>
            </DashboardCard>

            <DashboardCard title="API Setup Guide Editor" icon={<CodeBracketIcon className="w-6 h-6" />}>
                <div className="p-6 space-y-4">
                    {formData.apiSetupGuide.map((step, index) => (
                        <div key={step.id} className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-700 space-y-3">
                             <div className="flex justify-between items-center">
                                <h4 className="font-bold text-lg text-red-400">Step {index + 1}</h4>
                                <Button size="sm" variant="danger" onClick={() => removeGuideStep(index)}><TrashIcon className="w-4 h-4"/></Button>
                            </div>
                            <Input label="Title" value={step.title} onChange={e => handleGuideChange(index, 'title', e.target.value)} />
                             <textarea 
                                placeholder="Content (supports simple markdown for [links](url) and `code`)" 
                                value={step.content} 
                                onChange={e => handleGuideChange(index, 'content', e.target.value)}
                                rows={4}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 font-sans text-sm"
                            />
                             <textarea 
                                placeholder="Code Block (optional)" 
                                value={step.codeBlock} 
                                onChange={e => handleGuideChange(index, 'codeBlock', e.target.value)}
                                rows={6}
                                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-2 font-mono text-xs"
                            />
                             <div className="grid grid-cols-2 gap-4">
                                <Input label="Code Language (e.g., javascript, bash)" value={step.codeLanguage} onChange={e => handleGuideChange(index, 'codeLanguage', e.target.value)} />
                                <Input label="File Name (optional)" value={step.fileName} onChange={e => handleGuideChange(index, 'fileName', e.target.value)} />
                            </div>
                        </div>
                    ))}
                    <Button variant="secondary" onClick={addGuideStep}>
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Add Step
                    </Button>
                </div>
            </DashboardCard>

             <div className="mt-6 sticky bottom-6 z-20">
                <Button onClick={handleSave} disabled={!isDirty || isSaving} className="w-full py-3 text-lg shadow-lg">
                    {isSaving ? 'Saving...' : isDirty ? 'Save All Changes' : 'All Changes Saved'}
                </Button>
            </div>
        </div>
    );
};
