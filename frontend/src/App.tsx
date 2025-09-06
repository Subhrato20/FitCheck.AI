import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import ImageUpload from './components/ImageUpload';
import ShoeRecommendations from './components/ShoeRecommendations';
import OutfitVisualization from './components/OutfitVisualization';
import { UploadResponse, ShoeRecommendation, ShoeVisualization } from './types';
import axios from 'axios';

type AppState = 'upload' | 'recommendations' | 'visualizations';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('upload');
  const [recommendations, setRecommendations] = useState<ShoeRecommendation[]>([]);
  const [visualizations, setVisualizations] = useState<ShoeVisualization[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Debug: Log when component mounts
  React.useEffect(() => {
    console.log('FitCheck.AI App mounted successfully!');
  }, []);

  const handleUploadSuccess = (data: UploadResponse) => {
    setRecommendations(data.recommendations);
    setAppState('recommendations');
    setError(null);
    setSuccess('Image uploaded successfully! AI is analyzing your outfit...');
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
    setAppState('upload');
    
    // Clear error message after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  const handleGenerateVisualizations = async (shoes: ShoeRecommendation[]) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Get the image_id from the first recommendation (we'll need to store this)
      // For now, we'll use a placeholder - in a real app, you'd store this from upload
      const response = await axios.post('http://localhost:8080/generate-outfits', {
        image_id: 'placeholder', // This should be stored from upload response
        shoes: shoes
      });
      
      setVisualizations(response.data.results);
      setAppState('visualizations');
      setSuccess('Visualizations generated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Visualization generation error:', error);
      setError('Failed to generate visualizations. Please try again.');
      
      // Clear error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setAppState('upload');
    setRecommendations([]);
    setVisualizations([]);
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700">
      {/* Debug: Simple test to ensure React is working */}
      <div style={{ position: 'fixed', top: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px', borderRadius: '5px', fontSize: '12px', zIndex: 9999 }}>
        React App Status: ✅ Active
      </div>
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-xl">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  FitCheck.AI
                </h1>
                <p className="text-white/80 text-sm">
                  AI-Powered Shoe Recommendations
                </p>
              </div>
            </div>
            
            {appState !== 'upload' && (
              <button
                onClick={handleReset}
                className="bg-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/30 transition-colors"
              >
                Upload New Photo
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* App Content */}
        <AnimatePresence mode="wait">
          {appState === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-white mb-4">
                  Find Your Perfect Shoes
                </h2>
                <p className="text-xl text-white/90 max-w-2xl mx-auto">
                  Upload a photo of your outfit and let our AI powered by Google Gemini 
                  recommend the perfect shoes to complete your look.
                </p>
              </div>
              
              <ImageUpload
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </motion.div>
          )}

          {appState === 'recommendations' && (
            <motion.div
              key="recommendations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <ShoeRecommendations
                recommendations={recommendations}
                onGenerateVisualizations={handleGenerateVisualizations}
                isGenerating={isGenerating}
              />
            </motion.div>
          )}

          {appState === 'visualizations' && (
            <motion.div
              key="visualizations"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <OutfitVisualization visualizations={visualizations} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-md border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-white/80">
            <p className="mb-2">
              Powered by <span className="font-semibold">Google Gemini 2.5 Pro & Flash</span>
            </p>
            <p className="text-sm">
              Built with React, TypeScript, and Framer Motion
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
