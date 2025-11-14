/** @jsxImportSource react */
import React, { useState, useRef, useCallback } from 'react';
import { UploadCloudIcon } from './icons/Icons';

interface FileUploadProps {
  onUpload: (base64s: string[]) => void;
  accept: string;
  multiple?: boolean;
}

const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        const JPEG_QUALITY = 0.8; // Using 80% quality for a good balance

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

                // Calculate new dimensions while maintaining aspect ratio
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context for image compression.'));
                }
                
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to JPEG for significant size reduction, which is the main goal
                const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
                resolve(dataUrl);
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

export const ImageUpload: React.FC<FileUploadProps> = ({ onUpload, accept, multiple = false }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      setFileName(multiple ? `${files.length} file(s) selected` : files[0].name);
      const promises = Array.from(files).map(file => {
        // Automatically compress files that are images. Other files (video, audio, etc.) are passed through.
        if (file.type.startsWith('image/')) {
            return compressImage(file);
        }
        return readFileAsBase64(file);
      });
      
      Promise.all(promises).then(base64s => {
        onUpload(base64s);
      }).catch(err => {
        console.error("Error processing files:", err);
        alert(`An error occurred while processing the files: ${err.message}`);
      });
    }
  }, [onUpload, multiple]);

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
