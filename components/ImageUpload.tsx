/** @jsxImportSource react */
import React, { useState, useRef, useCallback } from 'react';
import { UploadCloudIcon } from './icons/Icons';

interface FileUploadProps {
  onUpload: (base64s: string[]) => void;
  accept: string;
  multiple?: boolean;
}

export const ImageUpload: React.FC<FileUploadProps> = ({ onUpload, accept, multiple = false }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesChange = useCallback((files: FileList | null) => {
    if (files && files.length > 0) {
      setFileName(multiple ? `${files.length} file(s) selected` : files[0].name);
      const promises = Array.from(files).map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (typeof e.target?.result === 'string') {
              resolve(e.target.result);
            } else {
              reject(new Error('Failed to read file.'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(promises).then(base64s => {
        onUpload(base64s);
      }).catch(err => console.error("Error reading files:", err));
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