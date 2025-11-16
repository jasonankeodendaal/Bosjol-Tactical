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

const compressVideo = (file: File, onProgress: (progress: number) => void): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.muted = true;
        video.style.display = 'none';
        let compressionTimeout: number | undefined;

        const cleanup = () => {
            if (compressionTimeout) clearTimeout(compressionTimeout);
            video.remove(); // Removes from DOM if attached
            // Revoke object URL to free memory
            if (video.src.startsWith('blob:')) {
                URL.revokeObjectURL(video.src);
            }
            // Remove listeners
            video.onloadedmetadata = null;
            video.onerror = null;
            video.onplay = null;
            video.onended = null;
        };

        // Set a timeout for the whole operation
        compressionTimeout = window.setTimeout(() => {
            cleanup();
            reject(new Error("Video optimization timed out. The file may be corrupt or too large."));
        }, 60000); // 60-second timeout

        video.onerror = () => {
            cleanup();
            reject(new Error("Failed to load video file. It may be corrupt or in an unsupported format."));
        };
        
        video.onloadedmetadata = () => {
            const MAX_DIMENSION = 720;
            let { videoWidth, videoHeight } = video;
            const aspectRatio = videoWidth / videoHeight;
            
            if (videoWidth > MAX_DIMENSION || videoHeight > MAX_DIMENSION) {
                if (videoWidth > videoHeight) {
                    videoWidth = MAX_DIMENSION;
                    videoHeight = videoWidth / aspectRatio;
                } else {
                    videoHeight = MAX_DIMENSION;
                    videoWidth = videoHeight * aspectRatio;
                }
            }
            
            videoWidth = Math.round(videoWidth);
            videoHeight = Math.round(videoHeight);

            const canvas = document.createElement('canvas');
            canvas.width = videoWidth;
            canvas.height = videoHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                cleanup();
                return reject(new Error('Could not get canvas context'));
            }
            
            const recordedChunks: Blob[] = [];
            const canvasStream = canvas.captureStream(30);
            
            if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported('video/webm')) {
                cleanup();
                return reject(new Error('Video recording (MediaRecorder) is not supported in this browser.'));
            }
            
            const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp9') ? 'video/webm; codecs=vp9' : 'video/webm';
            
            const mediaRecorder = new MediaRecorder(canvasStream, { mimeType, videoBitsPerSecond: 2 * 1024 * 1024 });

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) recordedChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                cleanup();
                resolve(new Blob(recordedChunks, { type: 'video/webm' }));
            };

            mediaRecorder.onerror = (e) => {
                cleanup();
                reject(e);
            }

            const drawFrame = () => {
                if (video.paused || video.ended) return;
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                onProgress(Math.min(100, (video.currentTime / video.duration) * 100));
                requestAnimationFrame(drawFrame);
            };
            
            video.onplay = () => {
                mediaRecorder.start();
                drawFrame();
            };
            
            video.onended = () => {
                if (mediaRecorder.state === 'recording') {
                    mediaRecorder.stop();
                }
                onProgress(100);
            };

            video.play().catch(e => {
                cleanup();
                reject(new Error(`Video playback failed: ${e.message}. Compression cannot start.`));
            });
        };
        
        // Use Object URL instead of Data URL for better performance with large files
        video.src = URL.createObjectURL(file);
        document.body.appendChild(video);
    });
};

const compressAudio = (file: File, onProgress: (progress: number) => void): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                if (!event.target?.result) {
                    return reject(new Error("Couldn't read audio file data."));
                }
                onProgress(10); // Decoding started
                const audioBuffer = await audioContext.decodeAudioData(event.target.result as ArrayBuffer);
                onProgress(30); // Decoding finished

                const destination = audioContext.createMediaStreamDestination();
                const source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(destination);
                
                const recordedChunks: Blob[] = [];
                const mimeType = 'audio/webm';
                if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported(mimeType)) {
                    audioContext.close();
                    return reject(new Error('Audio recording to WebM is not supported in this browser.'));
                }
                
                const mediaRecorder = new MediaRecorder(destination.stream, { mimeType });
                
                mediaRecorder.ondataavailable = (e) => {
                    if (e.data.size > 0) recordedChunks.push(e.data);
                };

                mediaRecorder.onstop = () => {
                    onProgress(100);
                    source.disconnect();
                    audioContext.close();
                    const finalBlob = new Blob(recordedChunks, { type: mimeType });
                    if (finalBlob.size > 0) {
                        resolve(finalBlob);
                    } else {
                        reject(new Error('Audio compression resulted in an empty file.'));
                    }
                };
                
                mediaRecorder.onerror = (e) => {
                    audioContext.close();
                    reject(e);
                };

                source.onended = () => {
                    if (mediaRecorder.state === 'recording') {
                        mediaRecorder.stop();
                    }
                };

                source.start();
                mediaRecorder.start();

            } catch (e) {
                audioContext.close();
                console.error("Audio processing failed:", e);
                reject(new Error("Failed to process audio file. It may be corrupt or in an unsupported format."));
            }
        };

        reader.onerror = (err) => {
            audioContext.close();
            reject(err)
        };
        reader.readAsArrayBuffer(file);
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
            const isVideo = file.type.startsWith('video/');
            const isAudio = file.type.startsWith('audio/');
            const isLargeImage = isImage && file.size > 500 * 1024; // Compress if image > 500KB
            const isLargeOrUncompressedAudio = isAudio && (file.type === 'audio/wav' || file.type === 'audio/x-wav' || file.size > 2 * 1024 * 1024);

            if (isLargeImage) {
                setMessage(`Compressing image: ${file.name}...`);
                setProgress(0);
                try {
                    fileToUpload = await compressImage(file);
                } catch (compressionError) {
                    console.warn('Image compression failed, uploading original file.', compressionError);
                }
            } else if (isVideo) {
                 setMessage(`Optimizing video: ${file.name}...`);
                 setProgress(0);
                 try {
                     fileToUpload = await compressVideo(file, (p) => setProgress(Math.round(p)));
                 } catch (compressionError) {
                     console.warn('Video optimization failed, uploading original file.', compressionError);
                     setMessage(`Optimization failed. Uploading original...`);
                     await new Promise(res => setTimeout(res, 1500));
                 }
            } else if (isLargeOrUncompressedAudio) {
                setMessage(`Optimizing audio: ${file.name}...`);
                setProgress(0);
                try {
                    fileToUpload = await compressAudio(file, (p) => setProgress(p));
                } catch (compressionError) {
                    console.warn('Audio optimization failed, uploading original file.', compressionError);
                    setMessage(`Optimization failed. Uploading original...`);
                    await new Promise(res => setTimeout(res, 1500));
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
