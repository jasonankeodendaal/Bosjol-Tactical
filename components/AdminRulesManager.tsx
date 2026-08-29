import React, { useState, useRef } from 'react';
import { useData } from '../data/DataContext';
import type { TacticalRuleSet, TacticalRuleItem, TacticalRuleCategory } from '../types';
import { DEFAULT_TACTICAL_RULE_SETS } from '../constants';
import { 
    Plus, Edit, Trash2, Shield, Crosshair, Target, AlertTriangle, Zap, Scale, 
    Upload, Download, RefreshCw, Eye, Check, X, FileText, Sparkles, AlertOctagon,
    Sliders, ChevronDown, ChevronUp, Layers, CheckCircle2
} from 'lucide-react';

interface AdminRulesManagerProps {
    onOpenInfoModal?: (ruleSetId?: string) => void;
}

const CATEGORY_OPTIONS: TacticalRuleCategory[] = [
    'Specific Game Rules',
    'Safety Rules',
    'Chronograph & FPS',
    'CQB Standards',
    'Medic & Respawn',
    'Field Protocols',
    'General'
];

export const AdminRulesManager: React.FC<AdminRulesManagerProps> = ({ onOpenInfoModal }) => {
    const { tacticalRules, addDoc, updateDoc, deleteDoc, setDoc } = useData();
    const [isCreatingSet, setIsCreatingSet] = useState(false);
    const [editingSet, setEditingSet] = useState<TacticalRuleSet | null>(null);
    const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
    const [uploadNotice, setUploadNotice] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form state for creating or editing a TacticalRuleSet
    const [formData, setFormData] = useState<Omit<TacticalRuleSet, 'id'>>({
        title: '',
        category: 'Specific Game Rules',
        shortDescription: '',
        icon: 'target',
        badge: 'GAME MODE',
        rules: [],
        isActive: true,
        lastUpdated: new Date().toISOString().split('T')[0]
    });

    // Temp individual rule item form (for 1-by-1 addition inside form)
    const [tempRule, setTempRule] = useState<TacticalRuleItem>({
        id: `r_${Date.now()}`,
        name: '',
        description: '',
        penalty: '',
        note: '',
        importance: 'standard'
    });

    const openCreateModal = () => {
        setFormData({
            title: '',
            category: 'Specific Game Rules',
            shortDescription: '',
            icon: 'target',
            badge: 'GAME MODE',
            rules: [],
            isActive: true,
            lastUpdated: new Date().toISOString().split('T')[0]
        });
        setEditingSet(null);
        setIsCreatingSet(true);
    };

    const openEditModal = (set: TacticalRuleSet) => {
        setEditingSet(set);
        setFormData({
            title: set.title,
            category: set.category,
            shortDescription: set.shortDescription,
            icon: set.icon || 'target',
            badge: set.badge || '',
            rules: set.rules || [],
            isActive: set.isActive !== false,
            lastUpdated: set.lastUpdated || new Date().toISOString().split('T')[0]
        });
        setIsCreatingSet(true);
    };

    const handleSaveSet = async () => {
        if (!formData.title.trim()) {
            alert("Please provide a Title for the Rule Set.");
            return;
        }

        const payload = {
            ...formData,
            lastUpdated: new Date().toISOString().split('T')[0]
        };

        try {
            if (editingSet) {
                await updateDoc('tacticalRules', { id: editingSet.id, ...payload });
            } else {
                const newId = `ruleset_${Date.now()}`;
                await setDoc('tacticalRules', newId, { id: newId, ...payload });
            }
            setIsCreatingSet(false);
            setEditingSet(null);
        } catch (err: any) {
            console.error("Error saving rule set:", err);
            alert(`Failed to save rule set: ${err?.message || err}`);
        }
    };

    const handleDeleteSet = async (set: TacticalRuleSet) => {
        if (confirm(`Are you sure you want to delete the rule set "${set.title}"?`)) {
            try {
                await deleteDoc('tacticalRules', set.id);
            } catch (err: any) {
                console.error("Error deleting rule set:", err);
            }
        }
    };

    const handleToggleActive = async (set: TacticalRuleSet) => {
        try {
            await updateDoc('tacticalRules', { ...set, isActive: !set.isActive });
        } catch (err: any) {
            console.error("Error toggling active state:", err);
        }
    };

    // Add 1-by-1 individual rule to current rule set form
    const handleAddRuleItem = () => {
        if (!tempRule.name.trim() || !tempRule.description.trim()) {
            alert("Rule Name and Description are required to add an individual rule item.");
            return;
        }

        if (editingRuleIndex !== null) {
            // Updating existing item in array
            const updated = [...formData.rules];
            updated[editingRuleIndex] = tempRule;
            setFormData(prev => ({ ...prev, rules: updated }));
            setEditingRuleIndex(null);
        } else {
            // Adding new item
            const newItem = {
                ...tempRule,
                id: tempRule.id || `r_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
            };
            setFormData(prev => ({ ...prev, rules: [...prev.rules, newItem] }));
        }

        // Reset temp rule
        setTempRule({
            id: `r_${Date.now()}`,
            name: '',
            description: '',
            penalty: '',
            note: '',
            importance: 'standard'
        });
    };

    const handleRemoveRuleItem = (index: number) => {
        setFormData(prev => ({
            ...prev,
            rules: prev.rules.filter((_, i) => i !== index)
        }));
    };

    // Load Default Tactical Presets Library
    const handleRestorePrebuiltPresets = async () => {
        if (confirm("Restore or overwrite with default pre-built tactical rule sets library (Safety, FPS, CQB, Domination, S&D, Medic)?")) {
            try {
                for (const preset of DEFAULT_TACTICAL_RULE_SETS) {
                    await setDoc('tacticalRules', preset.id, preset);
                }
                setUploadNotice("Default tactical rule set presets successfully loaded!");
                setTimeout(() => setUploadNotice(null), 4000);
            } catch (err: any) {
                console.error("Error restoring presets:", err);
                alert(`Failed to restore presets: ${err?.message || err}`);
            }
        }
    };

    // Upload JSON Prebuilt Rule Sets
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const parsed = JSON.parse(event.target?.result as string);
                const itemsToImport = Array.isArray(parsed) ? parsed : [parsed];

                let importedCount = 0;
                for (const item of itemsToImport) {
                    if (item.title && item.rules && Array.isArray(item.rules)) {
                        const newId = item.id || `uploaded_${Date.now()}_${importedCount}`;
                        await setDoc('tacticalRules', newId, {
                            id: newId,
                            title: item.title,
                            category: item.category || 'General',
                            shortDescription: item.shortDescription || '',
                            icon: item.icon || 'shield',
                            badge: item.badge || 'CUSTOM',
                            rules: item.rules,
                            isActive: true,
                            lastUpdated: new Date().toISOString().split('T')[0]
                        });
                        importedCount++;
                    }
                }

                setUploadNotice(`Successfully uploaded & imported ${importedCount} rule set(s)!`);
                setTimeout(() => setUploadNotice(null), 4000);
            } catch (err: any) {
                alert(`Invalid JSON format: ${err?.message || err}`);
            }
        };
        reader.readAsText(file);
    };

    // Export current rule sets to JSON
    const handleExportJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tacticalRules, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `tactical_rule_sets_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    return (
        <div className="w-full space-y-6 animate-fade-in p-2 sm:p-4">
            
            {/* Control Studio Header */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900/95 via-zinc-950/90 to-zinc-900/95 border border-red-500/30 shadow-[0_0_35px_rgba(220,38,38,0.2)] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider">
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Tactical Rules Studio</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                        Info Popup & Rule Set Builder
                    </h2>
                    <p className="text-xs text-zinc-400 max-w-xl">
                        Create custom rule sets, add rules 1 by 1, upload pre-built rule sets, or load tactical presets. These display live in the "i" info popup and Player Rules page.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                        onClick={openCreateModal}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-[0_0_20px_rgba(220,38,38,0.3)] transition flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New Rule Set</span>
                    </button>

                    <button
                        onClick={handleRestorePrebuiltPresets}
                        className="px-3.5 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1.5"
                        title="Load Pre-Built Tactical Rules"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Load Presets</span>
                    </button>

                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept=".json" 
                        className="hidden" 
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition flex items-center gap-1.5"
                        title="Upload JSON Rule Set File"
                    >
                        <Upload className="w-4 h-4 text-red-400" />
                        <span>Upload JSON</span>
                    </button>

                    <button
                        onClick={handleExportJson}
                        className="px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-semibold transition flex items-center gap-1.5"
                        title="Export JSON"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export</span>
                    </button>

                    {onOpenInfoModal && (
                        <button
                            onClick={() => onOpenInfoModal()}
                            className="px-3.5 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-red-400 border border-red-500/40 text-xs font-bold transition flex items-center gap-1.5"
                            title="Preview Info Popup Modal"
                        >
                            <Eye className="w-4 h-4" />
                            <span>Preview Popup</span>
                        </button>
                    )}
                </div>
            </div>

            {uploadNotice && (
                <div className="p-3.5 rounded-2xl bg-green-950/80 border border-green-500/50 text-green-300 text-xs font-bold flex items-center justify-between animate-fade-in">
                    <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        {uploadNotice}
                    </span>
                    <button onClick={() => setUploadNotice(null)} className="text-zinc-400 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Rule Sets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
                {(tacticalRules || []).map((set) => (
                    <div 
                        key={set.id}
                        className={`p-3 sm:p-4 rounded-2xl border transition-all duration-300 space-y-2 flex flex-col justify-between backdrop-blur-md ${
                            set.isActive !== false
                                ? 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 hover:border-red-500/40 shadow-sm hover:shadow-[0_0_20px_rgba(220,38,38,0.25)] transform hover:-translate-y-1'
                                : 'bg-zinc-950/40 border-zinc-900 opacity-60'
                        }`}
                    >
                        <div className="space-y-2">
                            <div className="flex items-start justify-between gap-1.5">
                                <div className="min-w-0">
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-red-400 block truncate">
                                        {set.category}
                                    </span>
                                    <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-1">{set.title}</h3>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                    <button
                                        onClick={() => handleToggleActive(set)}
                                        className={`px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider transition ${
                                            set.isActive !== false
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                                        }`}
                                    >
                                        {set.isActive !== false ? 'Active' : 'Hidden'}
                                    </button>
                                </div>
                            </div>

                            <p className="text-[10px] sm:text-xs text-zinc-400 line-clamp-2 leading-snug">
                                {set.shortDescription}
                            </p>

                            <div className="pt-1.5 border-t border-white/10">
                                <span className="text-[10px] font-semibold text-zinc-400 block mb-1">
                                    {set.rules.length} Rule Item{set.rules.length !== 1 ? 's' : ''}:
                                </span>
                                <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar pr-1">
                                    {set.rules.map((r, i) => (
                                        <div key={r.id || i} className="text-[10px] sm:text-xs text-zinc-300 flex items-center justify-between gap-1.5 py-0.5 border-b border-white/5">
                                            <span className="truncate">• {r.name}</span>
                                            {r.penalty && (
                                                <span className="text-[8.5px] px-1 py-0.5 rounded bg-red-950/80 text-red-400 font-mono shrink-0 truncate max-w-[50px]">
                                                    {r.penalty}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Admin Action Bar */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] sm:text-xs">
                            <button
                                onClick={() => onOpenInfoModal && onOpenInfoModal(set.id)}
                                className="text-zinc-400 hover:text-white text-[10px] font-medium flex items-center gap-1"
                            >
                                <Eye className="w-3 h-3 text-red-400" />
                                <span>Preview</span>
                            </button>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => openEditModal(set)}
                                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                                    title="Edit Rule Set"
                                >
                                    <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteSet(set)}
                                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/60 text-red-400 transition"
                                    title="Delete Rule Set"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CREATE / EDIT RULE SET MODAL */}
            {isCreatingSet && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-hidden">
                    <div className="relative w-full max-w-3xl h-[92vh] max-h-[820px] bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-red-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-zinc-100">
                        
                        {/* Modal Header */}
                        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60 shrink-0">
                            <div>
                                <h3 className="text-lg font-black uppercase text-white">
                                    {editingSet ? 'Edit Rule Set' : 'Build New Rule Set'}
                                </h3>
                                <p className="text-xs text-zinc-400">
                                    Configure title, category, description, and add rules 1 by 1.
                                </p>
                            </div>
                            <button 
                                onClick={() => setIsCreatingSet(false)}
                                className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                            
                            {/* General Meta Section */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                        Rule Set Title *
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="e.g., Airsoft Eyewear & Face Safety"
                                        value={formData.title}
                                        onChange={(e) => setFormData(f => ({ ...f, title: e.target.value }))}
                                        className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData(f => ({ ...f, category: e.target.value as TacticalRuleCategory }))}
                                        className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-red-500"
                                    >
                                        {CATEGORY_OPTIONS.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                        Short Description *
                                    </label>
                                    <textarea
                                        rows={2}
                                        placeholder="Brief summary of what this rule set covers..."
                                        value={formData.shortDescription}
                                        onChange={(e) => setFormData(f => ({ ...f, shortDescription: e.target.value }))}
                                        className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                        Badge Label (Optional)
                                    </label>
                                    <input 
                                        type="text"
                                        placeholder="e.g. MANDATORY, FPS SPEC, GAME MODE"
                                        value={formData.badge}
                                        onChange={(e) => setFormData(f => ({ ...f, badge: e.target.value }))}
                                        className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
                                        Icon Archetype
                                    </label>
                                    <select
                                        value={formData.icon}
                                        onChange={(e) => setFormData(f => ({ ...f, icon: e.target.value }))}
                                        className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                                    >
                                        <option value="shield">Shield (Safety)</option>
                                        <option value="crosshair">Crosshair (FPS/Chrono)</option>
                                        <option value="target">Target (Game Rules)</option>
                                        <option value="alert-triangle">Alert (Warnings)</option>
                                        <option value="zap">Zap (CQB)</option>
                                        <option value="scale">Scale (Medic/Honor)</option>
                                    </select>
                                </div>
                            </div>

                            {/* ADD INDIVIDUAL RULES 1 BY 1 */}
                            <div className="pt-4 border-t border-zinc-800 space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center justify-between">
                                    <span>Add Rules 1 by 1 ({formData.rules.length} items)</span>
                                </h4>

                                {/* Rule Input Form */}
                                <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                                                Rule Name / Heading *
                                            </label>
                                            <input 
                                                type="text"
                                                placeholder="e.g. Full-Seal Eyewear Standard"
                                                value={tempRule.name}
                                                onChange={(e) => setTempRule(r => ({ ...r, name: e.target.value }))}
                                                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                                                Importance Level
                                            </label>
                                            <select
                                                value={tempRule.importance}
                                                onChange={(e) => setTempRule(r => ({ ...r, importance: e.target.value as any }))}
                                                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                                            >
                                                <option value="standard">Standard</option>
                                                <option value="important">Important</option>
                                                <option value="critical">Critical</option>
                                            </select>
                                        </div>

                                        <div className="sm:col-span-2">
                                            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                                                Rule Detailed Description *
                                            </label>
                                            <textarea
                                                rows={2}
                                                placeholder="Full operational specification for this specific rule..."
                                                value={tempRule.description}
                                                onChange={(e) => setTempRule(r => ({ ...r, description: e.target.value }))}
                                                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500 resize-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                                                Violation Penalty (Optional)
                                            </label>
                                            <input 
                                                type="text"
                                                placeholder="e.g. Immediate Game Ejection, -100 XP"
                                                value={tempRule.penalty}
                                                onChange={(e) => setTempRule(r => ({ ...r, penalty: e.target.value }))}
                                                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                                                Special Note / Exception (Optional)
                                            </label>
                                            <input 
                                                type="text"
                                                placeholder="e.g. Mesh goggles banned without poly lenses"
                                                value={tempRule.note}
                                                onChange={(e) => setTempRule(r => ({ ...r, note: e.target.value }))}
                                                className="w-full px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-red-500"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddRuleItem}
                                        className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5"
                                    >
                                        <Plus className="w-3.5 h-3.5 text-red-400" />
                                        <span>{editingRuleIndex !== null ? 'Update Rule Item' : '+ Add Rule Item to List'}</span>
                                    </button>
                                </div>

                                {/* Rule List Table */}
                                <div className="space-y-2">
                                    {formData.rules.map((item, idx) => (
                                        <div 
                                            key={item.id || idx}
                                            className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-start justify-between gap-3 text-xs"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-white">{idx + 1}. {item.name}</span>
                                                    {item.importance && (
                                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 uppercase font-mono">
                                                            {item.importance}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-zinc-400 text-[11px] leading-relaxed">{item.description}</p>
                                                {item.penalty && (
                                                    <span className="text-[10px] text-red-400 font-semibold block">
                                                        Penalty: {item.penalty}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    onClick={() => {
                                                        setTempRule(item);
                                                        setEditingRuleIndex(idx);
                                                    }}
                                                    className="p-1 text-zinc-400 hover:text-white"
                                                    title="Edit rule item"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleRemoveRuleItem(idx)}
                                                    className="p-1 text-zinc-400 hover:text-red-400"
                                                    title="Remove rule item"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between shrink-0">
                            <button
                                onClick={() => setIsCreatingSet(false)}
                                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSaveSet}
                                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition"
                            >
                                Save Complete Rule Set
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
