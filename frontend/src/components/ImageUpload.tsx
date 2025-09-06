import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import { UploadResponse } from '../types';
import Button from './Button';

interface ImageUploadProps {
  onUploadSuccess: (data: UploadResponse) => void;
  onUploadError: (error: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadSuccess, onUploadError }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onUploadError('Please select a valid image file');
      return;
    }

    if (file.size > 16 * 1024 * 1024) {
      onUploadError('File size must be less than 16MB');
      return;
    }

    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="w-full">
      <AnimatePresence>
        {!preview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 cursor-pointer ${
              isDragOver 
                ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50' 
                : 'border-gray-300 bg-white/50 hover:border-emerald-300 hover:bg-gradient-to-br hover:from-emerald-50/30 hover:to-teal-50/30'
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
                y: isDragOver ? -5 : 0,
                rotate: isDragOver ? 5 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="mb-6"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                <UploadCloud className="w-8 h-8 text-emerald-600" />
              </div>
            </motion.div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
              Upload Your Outfit Photo
            </h3>
            <p className="text-gray-600 mb-4 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              Drag and drop your image here, or click to browse
            </p>
            <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
              JPG, PNG, GIF, WebP • Max 16MB
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative bg-white/80 backdrop-blur rounded-xl p-4 shadow-lg border border-white/50"
          >
            <div className="flex justify-center">
              <div className="relative group">
                <img
                  src={preview}
                  alt="Uploaded outfit"
                  className="max-w-full max-h-80 w-auto h-auto object-contain rounded-lg bg-white shadow-sm"
                  style={{ maxWidth: '500px', maxHeight: '400px' }}
                />
                
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white rounded-full p-4"
                    >
                      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    </motion.div>
                  </div>
                )}
                
                {!isUploading && (
                  <Button
                    onClick={handleRemove}
                    variant="tertiary"
                    size="sm"
                    className="absolute top-3 right-3 backdrop-blur opacity-0 group-hover:opacity-100 !p-2"
                    leftIcon={<X />}
                  />
                )}
              </div>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageUpload;