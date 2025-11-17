

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloudIcon, CheckCircleIcon, XCircleIcon, CogIcon } from './icons/Icons';
import { Button } from './Button';

interface FileUploadProps {
  onUpload: (urls: string[]) => void;
  accept: string;
  multiple?: boolean;
  apiServerUrl?: string;
}

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const MAX_FILE_SIZE_BYTES = 500 * 1024; // 500KB for database storage

export const ImageUpload: React.FC<FileUploadProps> = ({ onUpload, accept, multiple = false, apiServerUrl }) => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const performUpload = useCallback(async (fileToUpload: File): Promise<string> => {
    setStatus('uploading');
    setMessage(`Processing ${fileToUpload.name}...`);
    
    if (apiServerUrl) {
        // Upload to external server
        const formData = new FormData();
        formData.append('file', fileToUpload);

        try {
            const response = await fetch(`${apiServerUrl}/upload`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Server returned an error.' }));
                throw new Error(errorData.message || `Upload failed with status: ${response.status}`);
            }
            const result = await response.json();
            return result.url;
        } catch (error) {
            console.error('API Server upload error:', error);
            throw new Error((error as Error).message || 'Failed to connect to the API server.');
        }
    } else {
        // Fallback to data URL
        if (fileToUpload.size > MAX_FILE_SIZE_BYTES) {
            throw new Error(`File > 500KB. Configure an API server for large files.`);
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result as string);
            };
            reader.onerror = (error) => {
                reject(new Error(`Failed to read file: ${error}`));
            };
            reader.readAsDataURL(fileToUpload);
        });
    }
  }, [apiServerUrl]);


  const resetState = (delay: number) => {
    setTimeout(() => {
        setStatus('idle');
        setMessage('');
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, delay);
  }

  const handleFilesChange = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const filesArray = multiple ? Array.from(files) : [files[0]];
    
    const results: string[] = [];

    for (const file of filesArray) {
        try {
            const url = await performUpload(file);
            results.push(url);
        } catch (err: any) {
            console.error(`Failed to process file ${file.name}:`, err);
            setStatus('error');
            setMessage(err.message);
            resetState(3000);
            return; // Stop processing further files on error
        }
    }

    if (results.length > 0) {
        setStatus('success');
        setMessage(multiple ? `${results.length} files uploaded!` : 'Upload complete!');
        onUpload(results);
    }
    
    resetState(1500);
    
}, [onUpload, multiple, performUpload]);

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
                    <CogIcon className="w-8 h-8 text-gray-400 animate-spin mb-3" />
                    <p className="text-sm font-semibold text-gray-200 mb-2 truncate max-w-full px-2">{message}</p>
                    <p className="text-xs text-gray-500">Please wait...</p>
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
                className="w-full"
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
