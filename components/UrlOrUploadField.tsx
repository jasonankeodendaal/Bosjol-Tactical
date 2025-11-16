/** @jsxImportSource react */
import React from 'react';
import { ImageUpload } from './ImageUpload';
import { Input } from './Input';
import { Button } from './Button';
import { TrashIcon, MusicalNoteIcon } from './icons/Icons';

interface UrlOrUploadFieldProps {
    label: string;
    fileUrl: string | undefined;
    onUrlSet: (url: string) => void;
    onRemove: () => void;
    accept: string;
    previewType?: 'image' | 'audio';
    apiServerUrl?: string;
}

export const UrlOrUploadField: React.FC<UrlOrUploadFieldProps> = ({ label, fileUrl, onUrlSet, onRemove, accept, previewType = 'image', apiServerUrl }) => {
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

    const handleUrlInput = (e: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
        const inputElement = e.target as HTMLInputElement;
        if (inputElement.value) {
            onUrlSet(inputElement.value);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">{label}</label>
            {fileUrl ? (
                <div className="flex items-center gap-3 bg-zinc-900/50 p-2 rounded-lg border border-zinc-700/50">
                    {previewContent()}
                    <p className="text-xs text-gray-400 truncate flex-grow">File configured</p>
                    <Button variant="danger" size="sm" onClick={onRemove} className="!p-2 flex-shrink-0">
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
                    <Input 
                        placeholder="Paste direct URL"
                        onBlur={handleUrlInput}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleUrlInput(e);
                            }
                        }}
                    />
                </div>
            )}
        </div>
    );
};
