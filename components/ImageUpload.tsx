/** @jsxImportSource react */
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

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const compressAndEncode = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            if (!event.target?.result) {
                return reject(new Error("FileReader failed to read file."));
            }
            const img = new Image();
            img.src = event.target.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }

                let { width, height } = img;
                const MAX_DIMENSION = 1280; // Resize large images to a max of 1280px on one side

                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    if (width > height) {
                        height = Math.round((height * MAX_DIMENSION) / width);
                        width = MAX_DIMENSION;
                    } else {
                        width = Math.round((width * MAX_DIMENSION) / height);
                        height = MAX_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                let quality = 0.9;
                const FIRESTORE_LIMIT_BYTES = 950 * 1024; // ~950KB to be safe for Firestore doc limit

                // Using a loop instead of recursion to avoid stack depth issues.
                for (let i = 0; i < 10; i++) {
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    const sizeInBytes = Math.round((dataUrl.length * 3) / 4);
                    
                    if (sizeInBytes <= FIRESTORE_LIMIT_BYTES) {
                        return resolve(dataUrl);
                    }
                    
                    quality -= 0.1;
                    if (quality < 0.1) {
                        break; // Stop if quality gets too low
                    }
                }
                
                // Final check
                const finalDataUrl = canvas.toDataURL('image/jpeg', quality > 0 ? quality : 0.1);
                const finalSizeInBytes = Math.round((finalDataUrl.length * 3) / 4);
                if (finalSizeInBytes > FIRESTORE_LIMIT_BYTES) {
                     reject(new Error(`Image is too large to compress under 1MB. Size after max compression: ${formatBytes(finalSizeInBytes)}`));
                } else {
                    resolve(finalDataUrl);
                }
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};


export const ImageUpload: React.FC<FileUploadProps> = ({ onUpload, accept, multiple = false, apiServerUrl }) => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const performUpload = async (fileToUpload: File): Promise<string> => {
      setStatus('uploading');
      setMessage(`Processing ${fileToUpload.name}...`);

      if (apiServerUrl) {
          setMessage(`Uploading ${fileToUpload.name}...`);
          const formData = new FormData();
          formData.append('file', fileToUpload, fileToUpload.name);
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
      } else {
          // New logic for Firestore base64 upload
          if (fileToUpload.type.startsWith('image/')) {
              try {
                  const dataUrl = await compressAndEncode(fileToUpload);
                  return dataUrl;
              } catch (error) {
                  throw new Error(`Failed to compress image: ${(error as Error).message}`);
              }
          } else {
              return new Promise((resolve, reject) => {
                  const FIRESTORE_LIMIT_BYTES = 950 * 1024;
                  if (fileToUpload.size > FIRESTORE_LIMIT_BYTES) {
                      return reject(new Error(`File is too large (${formatBytes(fileToUpload.size)}). Only images can be compressed. Max size for non-image files is ~950KB.`));
                  }
                  const reader = new FileReader();
                  reader.readAsDataURL(fileToUpload);
                  reader.onload = () => resolve(reader.result as string);
                  reader.onerror = (error) => reject(error);
              });
          }
      }
  };


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
                    <CogIcon className="w-8 h-8 text-gray-400 animate-spin mb-3" />
                    <p className="text-sm font-semibold text-gray-200 mb-2 truncate max-w-full px-2">{message}</p>
                    <p className="text-xs text-gray-500">Please wait, this may take a moment...</p>
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