/** @jsxImportSource react */
import React, { useState, useRef, useCallback } from 'react';
import { UploadCloudIcon } from './icons/Icons';

interface FileUploadProps {
  onUpload: (urls: string[]) => void;
  accept: string;
  multiple?: boolean;
  onProgress?: (percent: number) => void;
  apiServerUrl?: string; // New prop for the custom API server
}

const compressImage = (file: File, maxSizeKB: number = 200): Promise<string> => {
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
                const performCompression = (quality: number): string => {
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    const sizeInBytes = Math.floor(dataUrl.length * (3/4));
                    if (sizeInBytes / 1024 <= maxSizeKB || quality <= 0.1) return dataUrl;
                    return performCompression(quality - 0.1);
                };
                resolve(performCompression(0.9));
            };
            img.onerror = (err) => reject(new Error(`Image load error: ${err}`));
        };
        reader.onerror = (err) => reject(new Error(`File read error: ${err}`));
    });
};

// FIX: Changed the type of the 'file' parameter from 'File' to 'Blob' to correctly handle the compressed audio blob.
const fileToBase64 = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

const compressAudio = (file: File, targetBitrate: number = 64000): Promise<string> => {
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
                console.warn(`${mimeType} is not supported. Falling back to base64 encoding without compression.`);
                if (file.size > 500 * 1024) {
                    return reject(new Error(`Audio file is too large (${(file.size / 1024).toFixed(0)}KB) and your browser doesn't support compression. Please keep audio under 500KB.`));
                }
                return resolve(await fileToBase64(file));
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

                const base64String = await fileToBase64(compressedBlob);
                resolve(base64String);
                await audioCtx.close();
            };

            source.onended = () => {
                mediaRecorder.stop();
            };
            
            mediaRecorder.start();
            source.start();

        } catch (error) {
            console.error("Audio compression failed:", error);
            console.warn("Falling back to base64 encoding without compression due to an error.");
            if (file.size > 500 * 1024) {
                return reject(new Error(`Audio processing failed. The original file is too large (${(file.size / 1024).toFixed(0)}KB). Please keep audio under 500KB.`));
            }
            resolve(await fileToBase64(file));
        }
    });
};


const uploadToServer = async (file: File, apiServerUrl: string): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${apiServerUrl}/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server upload failed: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    if (!result.url) {
        throw new Error('Server response did not include a file URL.');
    }
    return result.url;
};

export const ImageUpload: React.FC<FileUploadProps> = ({ onUpload, accept, multiple = false, onProgress, apiServerUrl }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onProgress?.(0);
    setFileName(multiple ? `${files.length} file(s) selected` : files[0].name);

    const filesArray = Array.from(files);
    const results: string[] = [];
    let processedCount = 0;

    for (const file of filesArray) {
        try {
            if (apiServerUrl) {
                // API Mode: Upload directly to the server
                results.push(await uploadToServer(file, apiServerUrl));
            } else {
                // Fallback Mode: Client-side processing
                if (file.type.startsWith('image/')) {
                    // Compress images to save space
                    results.push(await compressImage(file));
                } else if (file.type.startsWith('audio/')) {
                    // Compress audio to a smaller size before converting to base64
                    results.push(await compressAudio(file));
                } else {
                    // Block other file types like video
                    alert(`Cannot upload "${file.name}". Video and other large file types require setting up an External API Server to avoid exceeding database limits. This upload will be skipped.`);
                    continue; // Skip this file
                }
            }
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