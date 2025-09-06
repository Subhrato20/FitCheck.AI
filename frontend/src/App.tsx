import React, { useState, useEffect } from 'react';
import ImageUpload from './components/ImageUpload';
import ShoeRecommendations from './components/ShoeRecommendations';
import OutfitVisualization from './components/OutfitVisualization';
import VideoVisualization from './components/VideoVisualization';
import { generateOutfitsAI, generateVideos, healthCheck } from './services/api';
import { ShoeRecommendation, ShoeVisualization, ShoeVideoGeneration, UploadResponse } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'recommendations' | 'visualizations' | 'videos'>('upload');
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
    setIsLoading(false); // Stop loading for recommendations
    
    // Start generating AI visualizations asynchronously in the background
    generateVisualizationsAsync(data.image_id, data.recommendations);
  };

  const generateVisualizationsAsync = async (imageId: string, shoes: ShoeRecommendation[]) => {
    try {
      setIsGeneratingVisualizations(true);
      const results = await generateOutfitsAI(imageId, shoes);
      setVisualizations(results);
      setStep('visualizations');
      
      // Automatically start generating videos after visualizations are complete
      generateVideosAsync(imageId, shoes);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate visualizations. Please try again.');
      // Stay on recommendations step if generation fails
    } finally {
      setIsGeneratingVisualizations(false);
    }
  };

  const generateVideosAsync = async (imageId: string, shoes: ShoeRecommendation[]) => {
    try {
      setIsGeneratingVideos(true);
      const results = await generateVideos(imageId, shoes);
      setVideoGenerations(results);
      // Don't automatically switch to videos step - let user choose when to view them
    } catch (err: any) {
      console.error('Video generation failed:', err);
      // Don't show error to user since this is background processing
    } finally {
      setIsGeneratingVideos(false);
    }
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };


  const handleLiveCheck = () => {
    // Simply navigate to videos step - videos should already be generated in background
    if (videoGenerations.length > 0) {
      setStep('videos');
    } else if (isGeneratingVideos) {
      // If still generating, show a message
      setError('Videos are still being generated. Please wait a moment and try again.');
    } else {
      // If no videos and not generating, start generation now
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
    <div className="min-h-screen bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-800 mb-4 drop-shadow-2xl">
          FitCheck.AI
        </h1>
        <p className="text-lg md:text-xl text-stone-700 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
          AI-Powered Shoe Recommendations with Visual Try-On
        </p>
        
        {/* Backend Status */}
        <div className={`mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          backendStatus === 'online' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 
          backendStatus === 'offline' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 
          'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            backendStatus === 'online' ? 'bg-green-400' : 
            backendStatus === 'offline' ? 'bg-red-400' : 
            'bg-yellow-400'
          }`} />
          <span>
            Backend: {backendStatus === 'checking' ? 'Checking...' : 
                     backendStatus === 'online' ? 'Connected' : 
                     'Offline (Start backend on port 8080)'}
          </span>
        </div>
      </div>

      {/* Navigation Steps */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-8 md:mb-12">
        {['upload', 'recommendations', 'visualizations', 'videos'].map((s, index) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
              step === s || 
              (s === 'recommendations' && (recommendations.length > 0 || isLoading)) ||
              (s === 'visualizations' && visualizations.length > 0) ||
              (s === 'videos' && (videoGenerations.length > 0 || isGeneratingVideos))
              ? 'bg-white text-stone-700 shadow-lg' : 'bg-white/20 text-stone-600/70'
            }`}>
              {index + 1}
            </div>
            <span className={`text-sm font-semibold transition-all duration-300 drop-shadow-md ${
              step === s ? 'text-stone-800' : 'text-stone-600'
            }`}>
              {s === 'upload' ? 'Upload Photo' : 
               s === 'recommendations' ? 'Processing...' : 
               s === 'visualizations' ? 'View AI Try-On' :
               isGeneratingVideos ? 'Generating Videos...' : 'Live Check Videos'}
            </span>
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl text-center backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Loading Overlay */}
      {(isLoading || isGeneratingVideos) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl text-center shadow-2xl border border-white/20">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-stone-600 rounded-full mx-auto mb-6 animate-spin" />
            <p className="text-gray-700 text-lg font-medium">
              {step === 'upload' ? 'Analyzing your outfit...' :
               step === 'recommendations' ? 'Generating AI visualizations in background...' :
               step === 'videos' ? 'Generating live fit check videos...' :
               'Processing...'}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        {step === 'upload' && (
          <div className="bg-white/98 backdrop-blur-sm p-6 md:p-8 lg:p-10 rounded-3xl shadow-2xl border border-white/30">
            <ImageUpload 
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
            {backendStatus === 'offline' && (
              <p className="text-center mt-6 text-red-600 font-medium">
                Please start the backend server on port 8080 to continue
              </p>
            )}
          </div>
        )}

        {(step === 'recommendations' || (recommendations.length > 0 && isLoading)) && recommendations.length > 0 && (
          <ShoeRecommendations
            recommendations={recommendations}
            isGeneratingVisualizations={isGeneratingVisualizations}
          />
        )}

        {step === 'visualizations' && visualizations.length > 0 && (
          <OutfitVisualization 
            visualizations={visualizations} 
            onLiveCheck={handleLiveCheck}
            isGeneratingVideos={isGeneratingVideos}
            hasVideos={videoGenerations.length > 0}
            onBackToRecommendations={handleBackToRecommendations}
          />
        )}

        {step === 'videos' && videoGenerations.length > 0 && (
          <VideoVisualization 
            videoGenerations={videoGenerations} 
            onBackToVisualizations={handleBackToVisualizations}
          />
        )}

        {/* Back/Reset Button */}
        {(step === 'recommendations' || step === 'visualizations' || step === 'videos') && (
          <div className="text-center mt-8">
            <button
              onClick={resetApp}
              className="bg-white/20 hover:bg-white text-stone-700 hover:text-stone-800 border-2 border-white/30 hover:border-white px-8 py-3 rounded-full font-semibold transition-all duration-300 backdrop-blur-sm hover:shadow-lg"
            >
              Start Over with New Photo
            </button>
          </div>
        )}
      </div>

      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;
