import React, { useState, useCallback } from 'react';
import { ImageUpload } from './ImageUpload';
import { Input } from './Input';
import { Button } from './Button';
import { TrashIcon, MusicalNoteIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from './icons/Icons';
import { deleteFromSupabaseStorage } from '../utils/storageCleaner';

interface UrlOrUploadFieldProps {
    label?: string;
    fileUrl?: string;
    value?: string;
    onUrlSet?: (url: string) => void;
    onChange?: (url: string) => void;
    onRemove?: () => void;
    accept?: string;
    previewType?: 'image' | 'audio' | 'video';
    apiServerUrl?: string;
    onUploadingChange?: (uploading: boolean) => void;
    placeholder?: string;
}

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid_cors' | 'invalid_format' | 'invalid_unreachable';

export const UrlOrUploadField: React.FC<UrlOrUploadFieldProps> = ({
    label,
    fileUrl,
    value,
    onUrlSet,
    onChange,
    onRemove,
    accept = 'image/*',
    previewType,
    apiServerUrl,
    onUploadingChange,
    placeholder
}) => {
    const effectiveUrl = fileUrl !== undefined ? fileUrl : (value || '');
    const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
    const [urlInputValue, setUrlInputValue] = useState(effectiveUrl || '');

    const handleUrlSet = useCallback((url: string) => {
        if (onUrlSet) onUrlSet(url);
        if (onChange) onChange(url);
    }, [onUrlSet, onChange]);

    const validateUrl = useCallback(async (url: string) => {
        if (!url) {
            setValidationStatus('idle');
            return;
        }

        setValidationStatus('validating');

        // Simple check for data URLs, which are always valid locally
        if (url.startsWith('data:')) {
            setValidationStatus('valid');
            handleUrlSet(url);
            return;
        }

        try {
            await fetch(url, { method: 'HEAD', mode: 'no-cors' });
            setValidationStatus('valid');
            handleUrlSet(url);
        } catch (error) {
            if (error instanceof TypeError) {
                 setValidationStatus('invalid_cors');
            } else {
                 setValidationStatus('invalid_unreachable');
            }
        }
    }, [handleUrlSet]);

    const handleUrlInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const url = e.target.value.trim();
        validateUrl(url);
    };

    const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setUrlInputValue(val);
        setValidationStatus('idle'); // Reset validation status on change
        if (val.trim()) {
            handleUrlSet(val.trim());
        }
    };

    const getValidationMessage = () => {
        switch(validationStatus) {
            case 'validating':
                return <div className="flex items-center gap-2 text-xs text-blue-400"><ArrowPathIcon className="w-4 h-4 animate-spin"/> Testing URL...</div>;
            case 'valid':
                return <div className="flex items-center gap-2 text-xs text-green-400"><CheckCircleIcon className="w-4 h-4"/> URL is valid and reachable.</div>;
            case 'invalid_cors':
                return <div className="flex items-center gap-2 text-xs text-amber-400"><ExclamationTriangleIcon className="w-4 h-4"/> This URL may be blocked by security policies (CORS). Services like Google Drive or Dropbox often block direct streaming. Please download the file and use the 'Upload' tab instead.</div>;
            case 'invalid_unreachable':
                 return <div className="flex items-center gap-2 text-xs text-red-400"><ExclamationTriangleIcon className="w-4 h-4"/> Could not reach this URL. Please check the link for typos.</div>;
            default:
                return null;
        }
    };

    const previewContent = () => {
        if (!effectiveUrl || typeof effectiveUrl !== 'string' || effectiveUrl.trim() === '') return null;
        const trimmedUrl = effectiveUrl.trim();
        if (previewType === 'audio' || trimmedUrl.toLowerCase().match(/\.(mp3|wav|ogg|aac|m4a)($|\?)/) || trimmedUrl.startsWith('data:audio')) {
            return (
                <div className="w-16 h-16 flex items-center justify-center rounded-md bg-zinc-800 p-1 flex-shrink-0">
                    <MusicalNoteIcon className="w-8 h-8 text-red-500" />
                </div>
            );
        }

        const isVideo = trimmedUrl.toLowerCase().match(/\.(mp4|webm|mov|ogg|m4v)($|\?)/) || trimmedUrl.startsWith('data:video');
        
        if (isVideo) {
            return <video src={trimmedUrl} muted loop playsInline autoPlay className="w-16 h-16 object-cover rounded-md bg-zinc-800 flex-shrink-0" />;
        }
        
        // Default to image with transparent checkerboard background preview
        return (
            <div className="w-16 h-16 rounded-md bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:6px_6px] bg-zinc-900 border border-zinc-700/50 flex items-center justify-center p-1 overflow-hidden shrink-0">
                <img 
                    src={trimmedUrl} 
                    alt="preview" 
                    className="max-w-full max-h-full object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" 
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.opacity = '0.5';
                    }}
                />
            </div>
        );
    };

    const handleRemove = () => {
        if (effectiveUrl) {
            deleteFromSupabaseStorage(effectiveUrl).catch(err => {
                console.warn('[UrlOrUploadField] Error cleaning removed storage file:', err);
            });
        }
        if (onRemove) onRemove();
        if (onChange) onChange('');
        setUrlInputValue('');
        setValidationStatus('idle');
    };

    return (
        <div>
            {label && (
                <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-400">{label}</label>
                </div>
            )}
            {effectiveUrl && typeof effectiveUrl === 'string' && effectiveUrl.trim() !== '' ? (
                <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-lg border border-zinc-700/50">
                    {previewContent()}
                    <div className="flex-grow min-w-0">
                        <p className="text-xs text-gray-300 font-medium truncate">Uploaded Asset</p>
                        <p className="text-[10px] text-zinc-500 truncate">{effectiveUrl.slice(0, 40)}...</p>
                    </div>
                    <Button variant="danger" size="sm" onClick={handleRemove} className="!p-2 flex-shrink-0">
                        <TrashIcon className="w-4 h-4" />
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    <ImageUpload 
                        onUpload={(urls) => { if(urls.length > 0) handleUrlSet(urls[0]); }} 
                        accept={accept} 
                        apiServerUrl={apiServerUrl} 
                        onUploadingChange={onUploadingChange} 
                    />
                </div>
            )}
        </div>
    );
};