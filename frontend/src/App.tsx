import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageUpload from './components/ImageUpload';
import ShoeRecommendations from './components/ShoeRecommendations';
import OutfitVisualization from './components/OutfitVisualization';
import VideoVisualization from './components/VideoVisualization';
import ProductSearch from './components/ProductSearch';
import { generateOutfitsAI, generateVideos, healthCheck } from './services/api';
import { ShoeRecommendation, ShoeVisualization, ShoeVideoGeneration, UploadResponse, ProductSearchResponse } from './types/index';

const App: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'recommendations' | 'visualizations' | 'videos' | 'products'>('upload');
  const [recommendations, setRecommendations] = useState<ShoeRecommendation[]>([]);
  const [visualizations, setVisualizations] = useState<ShoeVisualization[]>([]);
  const [videoGenerations, setVideoGenerations] = useState<ShoeVideoGeneration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingVisualizations, setIsGeneratingVisualizations] = useState(false);
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [currentImageId, setCurrentImageId] = useState<string>('');

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    const isOnline = await healthCheck();
    setBackendStatus(isOnline ? 'online' : 'offline');
  };

  const handleUploadSuccess = async (data: UploadResponse) => {
    setRecommendations(data.recommendations);
    setCurrentImageId(data.image_id);
    setStep('recommendations');
    setIsLoading(false);
    generateVisualizationsAsync(data.image_id, data.recommendations);
  };

  const generateVisualizationsAsync = async (imageId: string, shoes: ShoeRecommendation[]) => {
    try {
      setIsGeneratingVisualizations(true);
      const results = await generateOutfitsAI(imageId, shoes);
      setVisualizations(results);
      setStep('visualizations');
      generateVideosAsync(imageId, shoes);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate visualizations. Please try again.');
    } finally {
      setIsGeneratingVisualizations(false);
    }
  };

  const generateVideosAsync = async (imageId: string, shoes: ShoeRecommendation[]) => {
    try {
      setIsGeneratingVideos(true);
      const results = await generateVideos(imageId, shoes);
      setVideoGenerations(results);
    } catch (err: any) {
      console.error('Video generation failed:', err);
    } finally {
      setIsGeneratingVideos(false);
    }
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleLiveCheck = () => {
    if (videoGenerations.length > 0) {
      setStep('videos');
    } else if (isGeneratingVideos) {
      setError('Videos are still being generated. Please wait a moment and try again.');
    } else {
      generateVideosAsync(currentImageId, recommendations);
      setStep('videos');
    }
  };

  const handleBackToRecommendations = () => {
    setStep('recommendations');
  };

  const handleBackToVisualizations = () => {
    setStep('visualizations');
  };

  const handleSearchProducts = () => {
    setStep('products');
  };

  const handleProductSearchComplete = (_results: ProductSearchResponse[]) => {
    // Product search results handled by ProductSearch component
  };

  const resetApp = () => {
    setStep('upload');
    setRecommendations([]);
    setVisualizations([]);
    setVideoGenerations([]);
    setError(null);
    setIsGeneratingVisualizations(false);
    setIsGeneratingVideos(false);
    setCurrentImageId('');
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-white/70 backdrop-blur-lg rounded-xl shadow-xl border border-white/50 p-8">
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-4xl font-bold text-gray-900 mb-3"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              FitCheck<span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">.AI</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-base text-gray-600 leading-relaxed"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              AI-Powered Shoe Recommendations with Visual Try-On
            </motion.p>
            
          </div>


          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-center text-sm"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {step === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ImageUpload 
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={handleUploadError}
                />
                {backendStatus === 'offline' && (
                  <p className="text-center mt-4 text-red-600 text-sm font-medium">
                    Please start the backend server on port 8080 to continue
                  </p>
                )}
              </motion.div>
            )}

            {(step === 'recommendations' || (recommendations.length > 0 && isLoading)) && recommendations.length > 0 && (
              <motion.div
                key="recommendations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ShoeRecommendations
                  recommendations={recommendations}
                  isGeneratingVisualizations={isGeneratingVisualizations}
                  onSearchProducts={handleSearchProducts}
                />
              </motion.div>
            )}

            {step === 'visualizations' && visualizations.length > 0 && (
              <motion.div
                key="visualizations"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <OutfitVisualization 
                  visualizations={visualizations} 
                  onLiveCheck={handleLiveCheck}
                  isGeneratingVideos={isGeneratingVideos}
                  hasVideos={videoGenerations.length > 0}
                  onBackToRecommendations={handleBackToRecommendations}
                  onSearchProducts={handleSearchProducts}
                />
              </motion.div>
            )}

            {step === 'videos' && videoGenerations.length > 0 && (
              <motion.div
                key="videos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <VideoVisualization 
                  videoGenerations={videoGenerations} 
                  onBackToVisualizations={handleBackToVisualizations}
                  onSearchProducts={handleSearchProducts}
                />
              </motion.div>
            )}

            {step === 'products' && (
              <motion.div
                key="products"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ProductSearch
                  recommendations={recommendations}
                  onBack={handleBackToRecommendations}
                  onSearchComplete={handleProductSearchComplete}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(step === 'recommendations' || step === 'visualizations' || step === 'videos' || step === 'products') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-center mt-6"
              >
                <button
                  onClick={resetApp}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-800 px-6 py-2 rounded-lg font-medium transition-all duration-200 text-sm"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Start Over with New Photo
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {(isLoading || isGeneratingVideos) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/95 backdrop-blur-sm p-6 rounded-xl text-center shadow-xl border border-white/20"
            >
              <div className="w-8 h-8 border-3 border-gray-200 border-t-emerald-500 rounded-full mx-auto mb-4 animate-spin" />
              <p className="text-gray-700 text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                {step === 'upload' ? 'Analyzing your outfit...' :
                 step === 'recommendations' ? 'Generating AI visualizations...' :
                 step === 'videos' ? 'Generating live fit check videos...' :
                 'Processing...'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;