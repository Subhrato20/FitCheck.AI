import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { UploadResponse } from '../types';

interface ImageUploadProps {
  onUploadSuccess: (data: UploadResponse) => void;
  onUploadError: (error: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onUploadError('Please select a valid image file');
      return;
    }

    if (file.size > 16 * 1024 * 1024) { // 16MB limit
      onUploadError('File size must be less than 16MB');
      return;
    }

    setUploadedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post<UploadResponse>('http://localhost:8080/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onUploadSuccess(response.data);
    } catch (error) {
      console.error('Upload error:', error);
      onUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess, onUploadError]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemove = useCallback(() => {
    setPreview(null);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence>
        {!preview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative border-2 border-dashed rounded-3xl p-8 md:p-12 text-center transition-all duration-300 ${
              isDragOver 
                ? 'border-stone-400 bg-stone-200/50' 
                : 'border-white/80 bg-white/40 hover:border-stone-300 hover:bg-white/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
            
            <motion.div
              animate={{ 
                scale: isDragOver ? 1.1 : 1,
                rotate: isDragOver ? 5 : 0 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-gray-700 drop-shadow-lg" />
            </motion.div>
            
            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 drop-shadow-lg">
              Upload Your Outfit Photo
            </h3>
            <p className="text-gray-800 mb-4 text-lg font-medium drop-shadow-md">
              Drag and drop your image here, or click to browse
            </p>
            <p className="text-sm text-gray-700 font-medium drop-shadow-sm">
              Supports JPG, PNG, GIF, WebP (max 16MB)
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20"
          >
            <div className="relative">
              <img
                src={preview}
                alt="Uploaded outfit"
                className="max-w-full max-h-80 w-auto h-auto object-contain rounded-2xl bg-white shadow-sm"
                style={{ maxWidth: '500px', maxHeight: '400px' }}
              />
              
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                  <div className="bg-white rounded-full p-4">
                    <Loader2 className="w-8 h-8 text-stone-600 loading-spinner" />
                  </div>
                </div>
              )}
              
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 mb-1">
                {uploadedFile?.name}
              </h4>
              <p className="text-sm text-gray-600">
                {(uploadedFile?.size && (uploadedFile.size / 1024 / 1024).toFixed(2))} MB
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUpload;
