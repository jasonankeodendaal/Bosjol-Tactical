/** @jsxImportSource react */
import React, { useState, useRef, useCallback } from 'react';
import { UploadCloudIcon } from './icons/Icons';

interface FileUploadProps {
  onUpload: (base64: string) => void;
  accept: string; // e.g., 'image/*', 'audio/mp3', 'video/mp4'
}

// Constants for image compression
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1080;
const MIME_TYPE = "image/jpeg";
const QUALITY = 0.8;

export const ImageUpload: React.FC<FileUploadProps> = ({ onUpload, accept }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((file: File | null) => {
    if (!file) {
      return;
    }
    
    setFileName(file.name);
    const reader = new FileReader();

    // Only compress files that are images. Other files (video, audio, etc.) are passed through.
    if (file.type.startsWith('image/')) {
      reader.onload = (readerEvent) => {
        if (typeof readerEvent.target?.result !== 'string') return;
        
        const image = new Image();
        image.src = readerEvent.target.result;
        image.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = image;

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
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          ctx.drawImage(image, 0, 0, width, height);
          
          // Get the compressed base64 string from the canvas
          onUpload(canvas.toDataURL(MIME_TYPE, QUALITY));
        };
        image.onerror = () => {
            console.error("Failed to load image for compression. Falling back to original file.");
            // Fallback to original if image loading fails
            if (readerEvent.target?.result) onUpload(readerEvent.target.result as string);
        }
      };
    } else {
      // For non-image files, pass through without compression
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          onUpload(e.target.result);
        }
      };
    }
    
    reader.readAsDataURL(file);
  }, [onUpload]);
  
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFileChange(event.target.files?.[0] ?? null);
  }

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const onDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      handleFileChange(event.dataTransfer.files?.[0] ?? null);
  }, [handleFileChange]);
  
  const onDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label
        htmlFor={`dropzone-file-${accept}`}
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
            id={`dropzone-file-${accept}`}
            ref={fileInputRef} 
            type="file" 
            className="hidden" 
            onChange={onFileChange}
            accept={accept} 
        />
      </label>
    </div>
  );
};