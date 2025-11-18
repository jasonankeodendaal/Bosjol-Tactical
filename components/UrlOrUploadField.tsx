/** @jsxImportSource react */
import React, { useState, useCallback } from 'react';
import { ImageUpload } from './ImageUpload';
import { Input } from './Input';
import { Button } from './Button';
import { TrashIcon, MusicalNoteIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowPathIcon } from './icons/Icons';

interface UrlOrUploadFieldProps {
    label: string;
    fileUrl: string | undefined;
    onUrlSet: (url: string) => void;
    onRemove: () => void;
    accept: string;
    previewType?: 'image' | 'audio' | 'video';
    apiServerUrl?: string;
}

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid_cors' | 'invalid_format' | 'invalid_unreachable';

export const UrlOrUploadField: React.FC<UrlOrUploadFieldProps> = ({ label, fileUrl, onUrlSet, onRemove, accept, previewType, apiServerUrl }) => {
    const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
    const [urlInputValue, setUrlInputValue] = useState(fileUrl || '');

    const validateUrl = useCallback(async (url: string) => {
        if (!url) {
            setValidationStatus('idle');
            return;
        }

        setValidationStatus('validating');

        // Simple check for data URLs, which are always valid locally
        if (url.startsWith('data:')) {
            setValidationStatus('valid');
            onUrlSet(url);
            return;
        }

        try {
            // We use 'no-cors' mode. We can't inspect the response, but it lets us check reachability
            // without being blocked by CORS. A successful opaque response is a good sign.
            // A TypeError indicates a likely CORS issue or network failure.
            await fetch(url, { method: 'HEAD', mode: 'no-cors' });
            // If we reach here, the URL is likely valid and reachable, though we can't be 100% sure due to 'no-cors'.
            setValidationStatus('valid');
            onUrlSet(url);
        } catch (error) {
            // A TypeError is the most common result for a CORS-blocked request
            if (error instanceof TypeError) {
                 setValidationStatus('invalid_cors');
            } else {
                 setValidationStatus('invalid_unreachable');
            }
        }
    }, [onUrlSet]);

    const handleUrlInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const url = e.target.value.trim();
        validateUrl(url);
    };

    const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUrlInputValue(e.target.value);
        setValidationStatus('idle'); // Reset validation status on change
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
        if (!fileUrl) return null;
        if (previewType === 'audio') {
            return (
                <div className="w-16 h-16 flex items-center justify-center rounded-md bg-zinc-800 p-1">
                    <MusicalNoteIcon className="w-8 h-8 text-gray-400" />
                </div>
            );
        }

        const isVideo = previewType === 'video' || fileUrl.toLowerCase().includes('.mp4') || fileUrl.toLowerCase().includes('.webm') || fileUrl.startsWith('data:video');
        
        if (isVideo) {
            return <video src={fileUrl} muted loop playsInline autoPlay className="w-16 h-16 object-cover rounded-md bg-zinc-800" />;
        }
        
        // Default to image
        return <img src={fileUrl} alt="preview" className="w-16 h-16 object-contain rounded-md bg-zinc-800 p-1" />;
    };

    const handleRemove = () => {
        onRemove();
        setUrlInputValue('');
        setValidationStatus('idle');
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>
            {fileUrl ? (
                <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-lg border border-zinc-700/50">
                    {previewContent()}
                    <p className="text-xs text-gray-400 truncate flex-grow">File configured</p>
                    <Button variant="danger" size="sm" onClick={handleRemove} className="!p-2 flex-shrink-0">
                        <TrashIcon className="w-4 h-4" />
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    <ImageUpload onUpload={(urls) => { if(urls.length > 0) onUrlSet(urls[0]); }} accept={accept} apiServerUrl={apiServerUrl} />
                    <div className="flex items-center gap-2">
                        <hr className="flex-grow border-zinc-600"/>
                        <span className="text-xs text-zinc-500">OR</span>
                        <hr className="flex-grow border-zinc-600"/>
                    </div>
                    <div>
                        <Input 
                            placeholder="Paste direct URL"
                            value={urlInputValue}
                            onChange={handleUrlInputChange}
                            onBlur={handleUrlInputBlur}
                        />
                        <div className="mt-2 min-h-5">
                            {getValidationMessage()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};