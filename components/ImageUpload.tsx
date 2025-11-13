/** @jsxImportSource react */
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
        <div className="flex