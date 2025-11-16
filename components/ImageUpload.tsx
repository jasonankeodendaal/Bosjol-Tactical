/** @jsxImportSource react */
import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloudIcon, CheckCircleIcon, XCircleIcon } from './icons/Icons';
import { uploadFile } from '../firebase';

interface FileUploadProps {
  onUpload: (urls: string[]) => void;
  accept: string;
  multiple?: boolean;
  apiServerUrl?: string;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const MAX_WIDTH = 1600; // Max width for the image
        const QUALITY = 0.7; // JPEG quality
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            if (!event.target?.result) {
                return reject(new Error("Couldn't read file for compression."));
            }
            img.src = event.target.result as string;
            img.onload = () => {
                let { width, height } = img;
                if (width > MAX_WIDTH) {
                    height = (height * MAX_WIDTH) / width;
                    width = MAX_WIDTH;
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Could not get canvas context'));
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob(
                    (blob) => blob ? resolve(blob) : reject(new Error('Canvas to Blob failed')),
                    'image/jpeg',
                    QUALITY
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};


export const ImageUpload: React.FC<FileUploadProps> = ({ onUpload, accept, multiple = false, apiServerUrl }) => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomUpload = async (file: Blob, name: string): Promise<string> => {
    if (!apiServerUrl) throw new Error("API Server URL is not configured.");
    
    // Fetch does not support progress reporting for uploads easily.
    // For this implementation, we will not have granular progress for custom servers.
    setProgress(50); // Set to an intermediate state

    const formData = new FormData();
    formData.append('file', file, name);
    const response = await fetch(`${apiServerUrl}/upload`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API server upload failed: ${errorData.error || response.statusText}`);
    }
    const { url } = await response.json();
    return url;
};

  const resetState = () => {
    setTimeout(() => {
        setStatus('idle');
        setProgress(0);
        setMessage('');
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, 2000);
  }

  const handleFilesChange = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setStatus('uploading');
    const filesArray = multiple ? Array.from(files) : [files[0]];
    const results: string[] = [];

    for (const file of filesArray) {
        try {
            let fileToUpload: Blob = file;
            const isImage = file.type.startsWith('image/') && !file.type.endsWith('gif');
            const isLargeImage = isImage && file.size > 500 * 1024; // Compress if image > 500KB

            if (isLargeImage) {
                setMessage(`Compressing ${file.name}...`);
                setProgress(0);
                try {
                    fileToUpload = await compressImage(file);
                } catch (compressionError) {
                    console.warn('Image compression failed, uploading original file.', compressionError);
                    // fallback to original file
                }
            }

            if (fileToUpload.size > 25 * 1024 * 1024) {
                 throw new Error(`File is too large (> 25MB).`);
            }
            
            setMessage(`Uploading ${file.name}...`);
            const uploader = apiServerUrl ? (blob: Blob, name: string) => handleCustomUpload(blob, name) : uploadFile;
            
            const url = await uploader(fileToUpload, file.name, 'uploads', (p) => setProgress(Math.round(p)));
            results.push(url);

        } catch (err) {
            console.error(`Failed to process file ${file.name}:`, err);
            setStatus('error');
            setMessage((err as Error).message);
            resetState();
            return;
        }
    }

    if (results.length > 0) {
        setStatus('success');
        setMessage(multiple ? `${results.length} files uploaded!` : 'Upload complete!');
        setProgress(100);
        onUpload(results);
    }
    
    resetState();
    
}, [onUpload, multiple, apiServerUrl]);

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFilesChange(event.target.files);
  };

  const onDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      handleFilesChange(event.dataTransfer.files);
  }, [handleFilesChange]);
  
  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
  }

  const handleClick = () => {
    if (status === 'idle') {
        fileInputRef.current?.click();
    }
  };

  const renderContent = () => {
    switch(status) {
        case 'uploading':
            return (
                <div className="w-full flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-sm font-semibold text-gray-200 mb-2 truncate max-w-full px-2">{message}</p>
                    <div className="w-full bg-zinc-700 rounded-full h-2.5">
                        <motion.div
                            className="bg-red-500 h-2.5 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3, ease: "linear" }}
                        />
                    </div>
                    {progress > 0 && <p className="text-xs text-gray-400 mt-2">{progress}%</p>}
                </div>
            );
        case 'success':
            return (
                <div className="flex flex-col items-center justify-center text-center">
                    <CheckCircleIcon className="w-8 h-8 text-green-500 mb-2"/>
                    <p className="text-sm font-semibold text-green-400">{message}</p>
                </div>
            )
        case 'error':
            return (
                 <div className="flex flex-col items-center justify-center text-center p-4">
                    <XCircleIcon className="w-8 h-8 text-red-500 mb-2"/>
                    <p className="text-sm font-semibold text-red-400">Upload Failed</p>
                    <p className="text-xs text-gray-400 truncate max-w-full">{message}</p>
                </div>
            )
        case 'idle':
        default:
            return (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                    <UploadCloudIcon className="w-8 h-8 mb-4 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-gray-500 truncate max-w-full px-2">{`Accepted: ${accept}`}</p>
                </div>
            )
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div
        className={`flex flex-col items-center justify-center w-full min-h-32 border-2 border-zinc-700 border-dashed rounded-lg bg-zinc-800 ${status === 'idle' ? 'cursor-pointer hover:bg-zinc-700/50' : 'cursor-default'} transition-colors relative overflow-hidden`}
        onClick={handleClick}
        onDrop={status === 'idle' ? onDrop : undefined}
        onDragOver={status === 'idle' ? onDragOver : undefined}
      >
        <AnimatePresence mode="wait">
            <motion.div
                key={status}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
            >
                {renderContent()}
            </motion.div>
        </AnimatePresence>
        <input 
            ref={fileInputRef} 
            type="file" 
            className="hidden" 
            onChange={onFileChange}
            accept={accept}
            multiple={multiple}
            disabled={status !== 'idle'}
        />
      </div>
    </div>
  );
};