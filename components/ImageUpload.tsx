/** @jsxImportSource react */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloudIcon, CheckCircleIcon, XCircleIcon, CogIcon } from './icons/Icons';
import { uploadFile, firebase } from '../firebase';
import { Button } from './Button';

interface FileUploadProps {
  onUpload: (urls: string[]) => void;
  accept: string;
  multiple?: boolean;
  apiServerUrl?: string;
}

type UploadStatus = 'idle' | 'preparing' | 'uploading' | 'success' | 'error';
const OPTIMIZATION_THRESHOLD_BYTES = 500 * 1024; // 500KB

const workerScript = `
  const MAX_WIDTH = 1920;
  const MAX_HEIGHT = 1920;
  const QUALITY = 0.8;

  self.onmessage = async (event) => {
    const file = event.data.file;

    if (!file || !file.type.startsWith('image/')) {
        self.postMessage({ blob: file, error: 'Not an image file.' });
        return;
    }

    try {
        const imageBitmap = await self.createImageBitmap(file);
        
        let width = imageBitmap.width;
        let height = imageBitmap.height;

        if (width <= MAX_WIDTH && height <= MAX_HEIGHT) {
            self.postMessage({ blob: file });
            imageBitmap.close();
            return;
        }

        if (width > height) {
            if (width > MAX_WIDTH) {
                height = Math.round(height * (MAX_WIDTH / width));
                width = MAX_WIDTH;
            }
        } else {
            if (height > MAX_HEIGHT) {
                width = Math.round(width * (MAX_HEIGHT / height));
                height = MAX_HEIGHT;
            }
        }

        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get OffscreenCanvas context.');

        ctx.drawImage(imageBitmap, 0, 0, width, height);
        const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: QUALITY });
        
        self.postMessage({ blob });
        imageBitmap.close();

    } catch (e) {
        self.postMessage({ blob: file, fallback: true, error: e.message });
    }
  };
`;


const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const ImageUpload: React.FC<FileUploadProps> = ({ onUpload, accept, multiple = false, apiServerUrl }) => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTask, setUploadTask] = useState<firebase.storage.UploadTask | null>(null);
  const [progressData, setProgressData] = useState({ transferred: 0, total: 0 });
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    workerRef.current = new Worker(url);
    URL.revokeObjectURL(url);

    return () => {
        if (workerRef.current) {
            workerRef.current.terminate();
            workerRef.current = null;
        }
    };
  }, []);

  const performUpload = async (fileToUpload: Blob, name: string): Promise<string> => {
      setStatus('uploading');
      setMessage(`Uploading ${name}...`);
      setProgressData({ transferred: 0, total: fileToUpload.size });
      setUploadTask(null);

      if (apiServerUrl) {
          setMessage(`Uploading ${name}... (Progress not available for API server)`);
          const formData = new FormData();
          formData.append('file', fileToUpload, name);
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
          return uploadFile(fileToUpload, name, 'uploads', {
              onProgress: (snapshot) => {
                  setProgressData({
                      transferred: snapshot.bytesTransferred,
                      total: snapshot.totalBytes,
                  });
              },
              setUploadTask: setUploadTask,
          });
      }
  };


  const resetState = (delay: number) => {
    setTimeout(() => {
        setStatus('idle');
        setMessage('');
        setProgressData({ transferred: 0, total: 0 });
        if (fileInputRef.current) fileInputRef.current.value = "";
    }, delay);
  }

  const handleCancel = () => {
    if (uploadTask) {
        uploadTask.cancel();
    } else {
        setStatus('idle');
        setMessage('');
        setProgressData({ transferred: 0, total: 0 });
    }
  };

  const handleFilesChange = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const filesArray = multiple ? Array.from(files) : [files[0]];
    setStatus('preparing');
    setMessage(`Preparing ${filesArray.length} file(s)...`);

    const processingPromises = filesArray.map(file => {
      return new Promise<{blob: Blob, name: string}>((resolve) => {
        const isOptimizableImage = file.type.startsWith('image/') && !file.type.endsWith('gif') && file.size > OPTIMIZATION_THRESHOLD_BYTES;
        
        if (isOptimizableImage && workerRef.current) {
            const worker = workerRef.current;
            
            const handleMessage = (event: MessageEvent) => {
                if (event.data.error) console.warn('Image optimization fallback:', event.data.error);
                worker.removeEventListener('message', handleMessage);
                worker.removeEventListener('error', handleError);
                resolve({ blob: event.data.blob || file, name: file.name });
            };
            const handleError = (e: ErrorEvent) => {
                console.error("Worker error during optimization:", e.message);
                worker.removeEventListener('message', handleMessage);
                worker.removeEventListener('error', handleError);
                resolve({ blob: file, name: file.name });
            };
            
            worker.addEventListener('message', handleMessage);
            worker.addEventListener('error', handleError);
            worker.postMessage({ file });
        } else {
            resolve({ blob: file, name: file.name });
        }
      });
    });
    
    const filesToUpload = await Promise.all(processingPromises);
    const results: string[] = [];

    for (const { blob, name } of filesToUpload) {
        try {
            const url = await performUpload(blob, name);
            results.push(url);
        } catch (err) {
            console.error(`Failed to process file ${name}:`, err);
            const errorMessage = (err as Error).message;
            if (errorMessage.includes('canceled by user')) {
                setStatus('idle');
                setMessage('');
            } else {
                setStatus('error');
                setMessage(errorMessage);
                resetState(3000);
            }
            return;
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
        case 'preparing':
             return (
                <div className="flex flex-col items-center justify-center p-4 text-center">
                    <CogIcon className="w-8 h-8 text-blue-400 animate-spin mb-2"/>
                    <p className="text-sm font-semibold text-blue-300">Optimizing...</p>
                    <p className="text-xs text-gray-400 truncate max-w-full px-2">{message}</p>
                </div>
            );
        case 'uploading':
            const percentage = progressData.total > 0 ? Math.round((progressData.transferred / progressData.total) * 100) : (apiServerUrl ? 50 : 0);
            return (
                <div className="w-full flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-sm font-semibold text-gray-200 mb-2 truncate max-w-full px-2">{message}</p>
                    {progressData.total > 0 && (
                        <>
                            <div className="w-full bg-zinc-700 rounded-full h-2.5">
                                <motion.div
                                    className="bg-red-500 h-2.5 rounded-full"
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.3, ease: "linear" }}
                                />
                            </div>
                            <div className="w-full flex justify-between items-center text-xs text-gray-400 mt-2">
                                <span>{formatBytes(progressData.transferred)} / {formatBytes(progressData.total)}</span>
                                <span>{percentage}%</span>
                            </div>
                        </>
                    )}
                     <Button variant="secondary" size="sm" className="mt-4" onClick={handleCancel}>Cancel</Button>
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