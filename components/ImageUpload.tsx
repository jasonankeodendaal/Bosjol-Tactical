/** @jsxImportSource react */
import React, { useState, useRef, useCallback } from 'react';
import { UploadCloudIcon } from './icons/Icons';

interface FileUploadProps {
  onUpload: (base64s: string[]) => void;
  accept: string;
  multiple?: boolean;
  onProgress?: (percent: number) => void;
}

const compressImage = (file: File, maxSizeKB: number = 950): Promise<string> => {
    return new Promise((resolve, reject) => {
        const MAX_WIDTH = 1920;
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            if (!event.target?.result) {
                return reject(new Error("Couldn't read file for compression."));
            }
            const img = new Image();
            img.src = event.target.result as string;

            img.onload = () => {
                let { width, height } = img;

                if (width > height && width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                } else if (height > MAX_WIDTH) { // Using MAX_WIDTH for both height and width for simplicity
                    width *= MAX_WIDTH / height;
                    height = MAX_WIDTH;
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context for image compression.'));
                }
                
                ctx.drawImage(img, 0, 0, width, height);

                const performCompression = (quality: number): string => {
                    const dataUrl = canvas.toDataURL('image/jpeg', quality);
                    // Base64 is approx 4/3 the size of the original data.
                    const sizeInBytes = Math.floor(dataUrl.length * (3/4)); 

                    if (sizeInBytes / 1024 <= maxSizeKB || quality <= 0.1) {
                        return dataUrl;
                    }
                    // Recursively lower quality to meet size target
                    return performCompression(quality - 0.1);
                };
                
                resolve(performCompression(0.9)); // Start with 90% quality
            };
            img.onerror = (err) => reject(new Error(`Image load error for compression: ${err}`));
        };
        reader.onerror = (err) => reject(new Error(`File read error for compression: ${err}`));
    });
};


const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
                resolve(e.target.result);
            } else {
                reject(new Error('Failed to read file as base64.'));
            }
        };
        reader.onerror = (err) => reject(new Error(`File read error: ${err}`));
        reader.readAsDataURL(file);
    });
};

export const ImageUpload: React.FC<FileUploadProps> = ({ onUpload, accept, multiple = false, onProgress }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setFileName(multiple ? `${files.length} file(s) selected` : files[0].name);
    onProgress?.(0);

    const filesArray = Array.from(files);
    const results: string[] = [];
    let processedCount = 0;

    for (const file of filesArray) {
        try {
            if (file.type.startsWith('image/')) {
                results.push(await compressImage(file));
            } else {
                // For non-image files like videos, just read them.
                results.push(await readFileAsBase64(file));
            }
        } catch (err) {
            console.error(`Failed to process file ${file.name}:`, err);
            // We can decide to alert the user here or just skip the file.
            // Skipping is a smoother UX.
        } finally {
            processedCount++;
            const percent = Math.round((processedCount / filesArray.length) * 100);
            onProgress?.(percent);
        }
    }

    if (results.length > 0) {
        onUpload(results);
    } else if (filesArray.length > 0) {
        // This case handles if all files failed to process
        alert('Could not process any of the selected files. Please try again with valid files.');
    }
}, [onUpload, multiple, onProgress]);

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