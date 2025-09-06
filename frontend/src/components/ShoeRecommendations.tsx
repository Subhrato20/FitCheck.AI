import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight, Wand2 } from 'lucide-react';
import { ShoeRecommendation } from '../types/index';

interface ShoeRecommendationsProps {
  recommendations: ShoeRecommendation[];
  isGeneratingVisualizations: boolean;
  onSearchProducts?: () => void;
}

const ShoeRecommendations: React.FC<ShoeRecommendationsProps> = ({
  recommendations,
  isGeneratingVisualizations,
  onSearchProducts
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextShoe = () => {
    setCurrentIndex((prev) => (prev + 1) % recommendations.length);
  };

  const prevShoe = () => {
    setCurrentIndex((prev) => (prev - 1 + recommendations.length) % recommendations.length);
  };

  const getStyleIcon = (style: string) => {
    const styleLower = style.toLowerCase();
    if (styleLower.includes('sneaker') || styleLower.includes('athletic')) {
      return '👟';
    } else if (styleLower.includes('boot')) {
      return '🥾';
    } else if (styleLower.includes('heel') || styleLower.includes('dress')) {
      return '👠';
    } else if (styleLower.includes('slip') || styleLower.includes('loafer')) {
      return '👞';
    } else {
      return '👟';
    }
  };

  const getStyleColor = (style: string) => {
    const styleLower = style.toLowerCase();
    if (styleLower.includes('sneaker') || styleLower.includes('athletic')) {
      return 'bg-blue-100 text-blue-800';
    } else if (styleLower.includes('boot')) {
      return 'bg-amber-100 text-amber-800';
    } else if (styleLower.includes('heel') || styleLower.includes('dress')) {
      return 'bg-pink-100 text-pink-800';
    } else if (styleLower.includes('slip') || styleLower.includes('loafer')) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  };

  if (recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                AI Shoe Recommendations
              </h2>
              <p className="text-gray-600">
                Powered by Gemini 2.5 Pro
              </p>
            </div>
          </div>
          
          {isGeneratingVisualizations && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-lg">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-purple-700 font-medium text-sm">
                Generating AI Visualizations...
              </span>
            </div>
          )}
        </div>

        {/* Shoe Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevShoe}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="flex gap-2">
            {recommendations.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-purple-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextShoe}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Current Shoe Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-gray-50/80 to-gray-100/80 rounded-2xl p-6 md:p-8 backdrop-blur-sm"
          >
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center text-4xl">
                  {getStyleIcon(recommendations[currentIndex].style)}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {recommendations[currentIndex].name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStyleColor(recommendations[currentIndex].style)}`}>
                    {recommendations[currentIndex].style}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Brand</p>
                    <p className="font-semibold text-gray-800">
                      {recommendations[currentIndex].brand}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Color</p>
                    <p className="font-semibold text-gray-800">
                      {recommendations[currentIndex].color}
                    </p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-2">Why this works:</p>
                  <p className="text-gray-700 leading-relaxed">
                    {recommendations[currentIndex].reason}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Shoe List */}
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            All Recommendations ({recommendations.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((shoe, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setCurrentIndex(index)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                  index === currentIndex
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {getStyleIcon(shoe.style)}
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-800">
                      {shoe.brand} {shoe.name}
                    </h5>
                    <p className="text-sm text-gray-600">
                      {shoe.color} • {shoe.style}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          {onSearchProducts && (
            <button
              onClick={onSearchProducts}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              🔍 Search for Shoes Online
            </button>
          )}
        </div>

        {/* Background Generation Notice */}
        {isGeneratingVisualizations && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-800">
                  AI Visualizations in Progress
                </h4>
                <p className="text-sm text-purple-600">
                  We're generating realistic images of you wearing each recommended shoe. 
                  This may take a few moments. You'll be automatically taken to the results when ready!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ShoeRecommendations;
