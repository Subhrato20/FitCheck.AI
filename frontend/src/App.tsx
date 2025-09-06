import React, { useState, useEffect } from 'react';
import ImageUpload from './components/ImageUpload';
import ShoeRecommendations from './components/ShoeRecommendations';
import OutfitVisualization from './components/OutfitVisualization';
import { generateOutfits, healthCheck } from './services/api';
import { ShoeRecommendation, ShoeVisualization, UploadResponse } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'recommendations' | 'visualizations'>('upload');
  const [imageId, setImageId] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<ShoeRecommendation[]>([]);
  const [visualizations, setVisualizations] = useState<ShoeVisualization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    const isOnline = await healthCheck();
    setBackendStatus(isOnline ? 'online' : 'offline');
  };

  const handleUploadSuccess = (data: UploadResponse) => {
    setImageId(data.image_id);
    setRecommendations(data.recommendations);
    setStep('recommendations');
    setIsLoading(false);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleGenerateVisualizations = async (shoes: ShoeRecommendation[]) => {
    if (!imageId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const results = await generateOutfits(imageId, shoes);
      setVisualizations(results);
      setStep('visualizations');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate visualizations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setStep('upload');
    setImageId(null);
    setRecommendations([]);
    setVisualizations([]);
    setError(null);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          fontSize: '3rem', 
          color: 'white', 
          marginBottom: '10px',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          FitCheck.AI
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: 'rgba(255, 255, 255, 0.9)' 
        }}>
          AI-Powered Shoe Recommendations with Visual Try-On
        </p>
        
        {/* Backend Status */}
        <div style={{ 
          marginTop: '20px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '20px',
          background: backendStatus === 'online' ? 'rgba(34, 197, 94, 0.2)' : 
                      backendStatus === 'offline' ? 'rgba(239, 68, 68, 0.2)' : 
                      'rgba(251, 191, 36, 0.2)',
          color: 'white'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: backendStatus === 'online' ? '#22c55e' : 
                       backendStatus === 'offline' ? '#ef4444' : 
                       '#fbbf24'
          }} />
          <span style={{ fontSize: '0.9rem' }}>
            Backend: {backendStatus === 'checking' ? 'Checking...' : 
                     backendStatus === 'online' ? 'Connected' : 
                     'Offline (Start backend on port 8080)'}
          </span>
        </div>
      </div>

      {/* Navigation Steps */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '40px',
        gap: '20px'
      }}>
        {['upload', 'recommendations', 'visualizations'].map((s, index) => (
          <div key={s} style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: step === s || 
                         (s === 'recommendations' && recommendations.length > 0) ||
                         (s === 'visualizations' && visualizations.length > 0)
                         ? 'white' : 'rgba(255, 255, 255, 0.3)',
              color: step === s ? '#764ba2' : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}>
              {index + 1}
            </div>
            <span style={{ 
              color: 'white', 
              fontWeight: step === s ? 'bold' : 'normal',
              opacity: step === s ? 1 : 0.7
            }}>
              {s === 'upload' ? 'Upload Photo' : 
               s === 'recommendations' ? 'Get Recommendations' : 
               'View Try-On'}
            </span>
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          maxWidth: '600px',
          margin: '0 auto 20px',
          padding: '15px',
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          {error}
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #e5e7eb',
              borderTop: '4px solid #764ba2',
              borderRadius: '50%',
              margin: '0 auto 20px',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{ color: '#374151', fontSize: '1.1rem' }}>
              {step === 'upload' ? 'Analyzing your outfit...' :
               step === 'recommendations' ? 'Generating visualizations...' :
               'Processing...'}
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {step === 'upload' && (
          <div style={{
            background: 'white',
            padding: '40px',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <ImageUpload 
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
            {backendStatus === 'offline' && (
              <p style={{
                textAlign: 'center',
                marginTop: '20px',
                color: '#ef4444'
              }}>
                Please start the backend server on port 8080 to continue
              </p>
            )}
          </div>
        )}

        {step === 'recommendations' && recommendations.length > 0 && (
          <ShoeRecommendations
            recommendations={recommendations}
            onGenerateVisualizations={handleGenerateVisualizations}
            isGenerating={isLoading}
          />
        )}

        {step === 'visualizations' && visualizations.length > 0 && (
          <OutfitVisualization visualizations={visualizations} />
        )}

        {/* Back/Reset Button */}
        {(step === 'recommendations' || step === 'visualizations') && (
          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button
              onClick={resetApp}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid white',
                padding: '12px 30px',
                borderRadius: '25px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = '#764ba2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                e.currentTarget.style.color = 'white';
              }}
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
