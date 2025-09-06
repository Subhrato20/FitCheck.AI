import React, { useState } from 'react';
import { ShoeRecommendation, ProductSearchResult, ProductSearchResponse } from '../types/index';
import Button from './Button';
import { Search, RefreshCw, ArrowLeft } from 'lucide-react';

interface ProductSearchProps {
  recommendations: ShoeRecommendation[];
  onBack: () => void;
  onSearchComplete: (results: ProductSearchResponse[]) => void;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ 
  recommendations, 
  onBack, 
  onSearchComplete 
}) => {
  const [searchResults, setSearchResults] = useState<ProductSearchResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setIsSearching(true);
    setError(null);
    
    try {
      const { searchProducts } = await import('../services/api');
      const results = await searchProducts(recommendations);
      setSearchResults(results);
      onSearchComplete(results);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to search for products. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleProductSelect = (url: string) => {
    // Open the product URL in a new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white/98 backdrop-blur-sm p-6 md:p-8 lg:p-10 rounded-3xl shadow-2xl border border-white/30">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
          Find Your Perfect Shoes
        </h2>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Search for the recommended shoes online and choose where to buy them
        </p>
      </div>

      {searchResults.length === 0 && !isSearching && (
        <div className="text-center">
          <Button
            onClick={handleSearch}
            variant="primary"
            size="lg"
            leftIcon={<Search />}
          >
            Search for Shoes Online
          </Button>
        </div>
      )}

      {isSearching && (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-stone-600 rounded-full mx-auto mb-6 animate-spin" />
          <p className="text-gray-700 text-lg font-medium">
            Searching for your recommended shoes...
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl p-4 text-center mb-6">
          {error}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-8">
          {searchResults.map((result, index) => (
            <div key={index} className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-stone-800 mb-2">
                  {result.shoe.brand} {result.shoe.name}
                </h3>
                <p className="text-stone-600 mb-2">
                  <span className="font-semibold">Color:</span> {result.shoe.color}
                </p>
                <p className="text-stone-600 mb-2">
                  <span className="font-semibold">Style:</span> {result.shoe.style}
                </p>
                <p className="text-stone-600 mb-4">
                  <span className="font-semibold">Why it works:</span> {result.shoe.reason}
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-stone-700 mb-4">
                  Where to Buy ({result.search_results.length} options):
                </h4>
                
                {result.search_results.map((product, productIndex) => (
                  <div 
                    key={productIndex}
                    className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-white/30 hover:bg-white/80 transition-all duration-300 cursor-pointer"
                    onClick={() => handleProductSelect(product.url)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-stone-800 mb-2 line-clamp-2">
                          {product.title}
                        </h5>
                        <p className="text-stone-600 text-sm mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-stone-500">
                          <span>Source: {product.source}</span>
                          <span>•</span>
                          <span>Click to open in new tab</span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <div className="w-8 h-8 bg-stone-600 rounded-full flex items-center justify-center text-white text-sm">
                          →
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center gap-4 mt-8">
        <Button
          onClick={onBack}
          variant="outline"
          size="md"
          leftIcon={<ArrowLeft />}
        >
          Back to Recommendations
        </Button>
        
        {searchResults.length > 0 && (
          <Button
            onClick={handleSearch}
            variant="primary"
            size="md"
            leftIcon={<RefreshCw />}
          >
            Search Again
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;
