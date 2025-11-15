/** @jsxImportSource react */
import React, { useState, useRef, useCallback } from 'react';
import { UploadCloudIcon } from './icons/Icons';
import { uploadFile } from '../firebase';

interface FileUploadProps {
  onUpload: (urls: string[]) => void;
  accept: string;
  multiple?: boolean;
  onProgress?: (percent: number) => void;
  apiServerUrl?: string;
}

const compressImage = (file: File, maxSizeKB: number = 200): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const MAX_WIDTH = 1920;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            if (!event.target?.result) return reject(new Error("Couldn't read file."));
            const img = new Image();
            img.src = event.target.result as string;
            img.onload = () => {
                let { width, height } = img;
                if (width > height && width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                } else if (height > MAX_WIDTH) {
                    width *= MAX_WIDTH / height;
                    height = MAX_WIDTH;
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Could not get canvas context.'));
                ctx.drawImage(img, 0, 0, width, height);
                
                const performCompression = (quality: number) => {
                    canvas.toBlob((blob) => {
                        if (!blob) return reject(new Error('Canvas to Blob failed.'));
                        if (blob.size / 1024 <= maxSizeKB || quality <= 0.1) {
                            resolve(blob);
                        } else {
                            performCompression(quality - 0.1);
                        }
                    }, 'image/jpeg', quality);
                };
                performCompression(0.9);
            };
            img.onerror = (err) => reject(new Error(`Image load error: ${err}`));
        };
        reader.onerror = (err) => reject(new Error(`File read error: ${err}`));
    });
};

const compressAudio = (file: File, targetBitrate: number = 64000): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
        try {
            // @ts-ignore
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

            const mediaStreamDestination = audioCtx.createMediaStreamDestination();
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(mediaStreamDestination);
            
            const mimeType = 'audio/webm;codecs=opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                console.warn(`${mimeType} is not supported. Falling back to original file.`);
                if (file.size > 500 * 1024) {
                    return reject(new Error(`Audio file is too large (${(file.size / 1024).toFixed(0)}KB) and your browser doesn't support compression. Please keep audio under 500KB.`));
                }
                return resolve(file);
            }

            const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream, {
                mimeType,
                audioBitsPerSecond: targetBitrate,
            });

            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const compressedBlob = new Blob(chunks, { type: mimeType });
                
                if (compressedBlob.size > 500 * 1024) {
                     return reject(new Error(`Even after compression, the audio file is too large (${(compressedBlob.size / 1024).toFixed(0)}KB). Please upload a shorter audio clip.`));
                }
                resolve(compressedBlob);
                await audioCtx.close();
            };

            source.onended = () => {
                mediaRecorder.stop();
            };
            
            mediaRecorder.start();
            source.start();

        } catch (error) {
            console.error("Audio compression failed:", error);
            console.warn("Falling back to original file due to an error.");
            if (file.size > 500 * 1024) {
                return reject(new Error(`Audio processing failed. The original file is too large (${(file.size / 1024).toFixed(0)}KB). Please keep audio under 500KB.`));
            }
            resolve(file);
        }
    });
};

export const ImageUpload: React.FC<FileUploadProps> = ({ onUpload, accept, multiple = false, onProgress, apiServerUrl }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomUpload = async (file: Blob, name: string): Promise<string> => {
    if (!apiServerUrl) throw new Error("API Server URL is not configured.");
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

  const handleFilesChange = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onProgress?.(0);
    setFileName(multiple ? `${files.length} file(s) selected` : files[0].name);

    const filesArray = Array.from(files);
    const results: string[] = [];
    let processedCount = 0;

    const uploader = apiServerUrl ? handleCustomUpload : uploadFile;

    for (const file of filesArray) {
        try {
            let fileToUpload: Blob = file;

            // Only compress images and audio if we are using Firebase storage to save space.
            // A self-hosted server might have different storage constraints.
            if (!apiServerUrl) {
                if (file.type.startsWith('image/')) {
                    fileToUpload = await compressImage(file);
                } else if (file.type.startsWith('audio/')) {
                    fileToUpload = await compressAudio(file);
                }
            }
            
            // Limit for non-image/audio files on Firebase, or any file on custom server
            if (fileToUpload.size > 25 * 1024 * 1024) { // 25MB limit
                 alert(`Cannot upload "${file.name}". Files larger than 25MB are not supported for direct upload.`);
                 continue;
            }
            
            const url = await uploader(fileToUpload, file.name);
            results.push(url);

        } catch (err) {
            console.error(`Failed to process file ${file.name}:`, err);
            alert(`Error processing "${file.name}": ${(err as Error).message}`);
        } finally {
            processedCount++;
            const percent = Math.round((processedCount / filesArray.length) * 100);
            onProgress?.(percent);
        }
    }

    if (results.length > 0) {
        onUpload(results);
    }
    // Reset file input to allow re-uploading the same file
    if (fileInputRef.current) fileInputRef.current.value = "";
    
}, [onUpload, multiple, onProgress, apiServerUrl]);

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
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div
        className="flex flex-col items-center justify-center w-full min-h-32 border-2 border-zinc-700 border-dashed rounded-lg cursor-pointer bg-zinc-800 hover:bg-zinc-700/50 transition-colors"
        onClick={handleClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            <UploadCloudIcon className="w-8 h-8 mb-4 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-500 truncate max-w-full px-2">{fileName || `Accepted: ${accept}`}</p>
        </div>
        <input 
            ref={fileInputRef} 
            type="file" 
            className="hidden" 
            onChange={onFileChange}
            accept={accept}
            multiple={multiple}
        />
      </div>
    </div>
  );
};