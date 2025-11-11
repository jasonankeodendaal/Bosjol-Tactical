import React, { useState, useRef, useCallback } from 'react';
import { UploadCloudIcon } from './icons/Icons';

interface FileUploadProps {
  onUpload: (base64: string) => void;
  accept: string; // e.g., 'image/*', 'audio/mp3', 'video/mp4'
}

export const ImageUpload: React.FC<FileUploadProps> = ({ onUpload, accept }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File | null) => {
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          onUpload(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      handleFileChange(event.target.files?.[0] ?? null);
  }

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  const onDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      handleFileChange(event.dataTransfer.files?.[0] ?? null);
  }, []);
  
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
        <div className="flex flex-col items-center justify-center p-5 text-center">
          <UploadCloudIcon className="w-8 h-8 mb-4 text-gray-500" />
          <p className="mb-2 text-sm text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag & drop
          </p>
          <p className="text-xs text-gray-500 uppercase">{accept.replace('image/', '').replace('audio/', '').replace('video/', '')}</p>
          {fileName && <p className="text-xs text-amber-400 mt-2 truncate max-w-full">{fileName}</p>}
        </div>
        <input ref={fileInputRef} id={`dropzone-file-${accept}`} type="file" className="hidden" onChange={onFileChange} accept={accept} />
      </label>
    </div>
  );
};