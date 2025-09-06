# FitCheck.AI - Complete AI Fashion Assistant

An intelligent fashion platform that analyzes your outfit photos and provides comprehensive shoe recommendations with AI-powered visualizations, video try-ons, and product search capabilities.

## 🌟 Features

### Core AI Capabilities
- **Smart Photo Upload**: Drag-and-drop outfit photo upload with validation
- **AI Shoe Recommendations**: Powered by **Google Gemini 2.5 Pro** with structured function calling
- **Multi-Angle Visualizations**: AI-generated outfit views from front, back, left, and right angles
- **Live Fit Check Videos**: Cinematic video generation using **FAL AI Veo3** for dynamic try-on experience
- **Product Search**: Real-time shoe shopping integration with **Exa AI** web search

### User Experience
- **Modern UI/UX**: Beautiful React TypeScript interface with smooth animations
- **Interactive Navigation**: Seamless flow between recommendations, visualizations, videos, and shopping
- **Real-time Processing**: Fast AI-powered analysis with progress indicators
- **Mobile Responsive**: Optimized for desktop and mobile devices
- **Download Capabilities**: Save generated images and videos locally

## 🚀 Tech Stack

### AI Services
- **Google Gemini 2.5 Pro**: Intelligent shoe recommendations with function calling
- **Google Gemini 2.5 Flash**: Multi-angle outfit visualizations
- **FAL AI Veo3**: Cinematic video generation for live fit checks
- **Exa AI**: Real-time web search for product discovery

### Backend
- **Flask**: Python web framework with modular architecture
- **Google Generative AI SDK**: Official Google SDK for Gemini models
- **FAL Client**: Video generation API integration
- **Exa Python SDK**: Web search and product discovery
- **Pillow**: Image processing and manipulation
- **Flask-CORS**: Cross-origin resource sharing
- **Concurrent Processing**: Async video generation with ThreadPoolExecutor

### Frontend
- **React 18**: Modern UI framework with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful icon library
- **Axios**: HTTP client for API communication
- **Custom CSS**: Modern glassmorphism and responsive design

## 📋 Prerequisites

- Python 3.8+ 
- Node.js 16+
- **Google API Key** (for Gemini models)
- **FAL AI API Key** (for video generation)
- **Exa API Key** (for product search)

## 🔧 Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
cp env.template .env
```

5. Edit `.env` and add your API keys:
```env
GOOGLE_API_KEY=your_google_api_key_here
FAL_KEY=your_fal_ai_api_key_here
EXA_API_KEY=your_exa_api_key_here
```

6. Run the Flask server:
```bash
python app.py
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

**Note**: Make sure the backend is running on `http://localhost:8080` before starting the frontend.

## 📝 How to Use

### Complete Workflow
1. **Upload Photo**: Drag-and-drop your outfit photo into the upload zone
2. **Get AI Recommendations**: Gemini 2.5 Pro analyzes your outfit and suggests 4 complementary shoes with detailed reasoning
3. **View Visualizations**: Automatically generated multi-angle outfit views (front, back, left, right)
4. **Watch Live Videos**: Cinematic fit check videos showing dynamic try-on experience
5. **Shop Products**: Search and find where to buy recommended shoes online
6. **Download Content**: Save generated images and videos locally

### Navigation Flow
- **Recommendations** → **Visualizations** → **Videos** → **Product Search**
- Seamless transitions between all features
- Back navigation and "Start Over" functionality

## 🔑 Getting API Keys

### Google API Key (Gemini)
1. Visit [Google AI Studio](https://makersuite.google.com/)
2. Sign in with your Google account
3. Navigate to [Get API Key](https://makersuite.google.com/app/apikey)
4. Create a new API key
5. Copy the key and add it to your `.env` file

### FAL AI API Key (Video Generation)
1. Visit [FAL AI](https://fal.ai/)
2. Sign up for an account
3. Navigate to your API keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

### Exa API Key (Product Search)
1. Visit [Exa](https://exa.ai/)
2. Sign up for an account
3. Navigate to your API keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

## 🎯 How It Works

### AI Processing Pipeline
1. **Photo Upload**: User uploads outfit photo with validation
2. **Shoe Analysis**: Gemini 2.5 Pro analyzes outfit and recommends 4 complementary shoes
3. **Visualization Generation**: Gemini 2.5 Flash creates multi-angle outfit views
4. **Video Creation**: FAL AI Veo3 generates cinematic fit check videos
5. **Product Search**: Exa AI searches for recommended shoes online

### Technical Architecture
- **Modular Backend**: Separated services for Gemini, FAL, and Exa integrations
- **Concurrent Processing**: Parallel video generation for better performance
- **Real-time Updates**: Live progress indicators and status updates
- **Error Handling**: Graceful fallbacks and user-friendly error messages

## 📂 Project Structure

```
FitCheck.AI/
├── backend/
│   ├── app.py                    # Main Flask application with all routes
│   ├── config.py                 # Application configuration
│   ├── models.py                 # Data models and structures
│   ├── utils.py                  # Utility functions
│   ├── ImageToVideo.py           # Video generation utilities
│   ├── services/                 # Business logic services
│   │   ├── gemini_service.py     # Google Gemini AI integration
│   │   ├── video_service.py      # FAL AI video generation
│   │   └── exa_service.py        # Exa AI product search
│   ├── uploads/                  # Uploaded images (auto-created)
│   ├── generated/                # Generated visualizations (auto-created)
│   ├── generated_videos/         # Generated videos (auto-created)
│   └── requirements.txt          # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/           # React components
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── ShoeRecommendations.tsx
│   │   │   ├── OutfitVisualization.tsx
│   │   │   ├── VideoVisualization.tsx
│   │   │   └── ProductSearch.tsx
│   │   ├── services/             # API services
│   │   │   └── api.ts
│   │   ├── types/                # TypeScript type definitions
│   │   │   └── index.ts
│   │   ├── utils/                # Utility functions
│   │   │   └── cn.ts
│   │   ├── App.tsx               # Main app component
│   │   └── main.tsx              # App entry point
│   ├── package.json              # Node dependencies
│   └── vite.config.ts            # Vite configuration
│
└── README.md                     # This file
```

## 🔧 API Endpoints

### Core Endpoints
- `GET /health` - Health check endpoint
- `POST /upload` - Upload outfit image and get AI shoe recommendations
- `POST /generate-outfits-ai` - Generate AI-powered outfit visualizations
- `POST /generate-videos` - Generate cinematic fit check videos
- `POST /search-products` - Search for recommended shoes online

### Testing Endpoints
- `GET /test-gemini` - Test Gemini API connection
- `GET /test-exa` - Test Exa API connection

### Request/Response Examples

#### Upload Image & Get Recommendations
```json
// Request: POST /upload
// Body: FormData with 'image' field

// Response:
{
  "success": true,
  "image_id": "unique_filename.jpg",
  "recommendations": [
    {
      "name": "Air Max 90",
      "brand": "Nike",
      "color": "White/Blue",
      "style": "sneakers",
      "reason": "Complements the casual athletic vibe"
    }
    // ... 3 more recommendations
  ]
}
```

#### Generate AI Visualizations
```json
// Request: POST /generate-outfits-ai
{
  "image_id": "unique_filename.jpg",
  "shoes": [/* shoe recommendations */]
}

// Response:
{
  "success": true,
  "results": [
    {
      "shoe": {/* shoe details */},
      "visualizations": [
        {
          "angle": "front",
          "image": "data:image/jpeg;base64,..."
        }
        // ... other angles
      ]
    }
    // ... other shoes
  ]
}
```

#### Generate Videos
```json
// Request: POST /generate-videos
{
  "image_id": "unique_filename.jpg",
  "shoes": [/* shoe recommendations */]
}

// Response:
{
  "success": true,
  "results": [
    {
      "shoe": {/* shoe details */},
      "videos": [
        {
          "angle": "front",
          "video_url": "data:video/mp4;base64,...",
          "status": "completed"
        }
      ]
    }
    // ... other shoes
  ]
}
```

#### Search Products
```json
// Request: POST /search-products
{
  "shoes": [/* shoe recommendations */],
  "outfit_description": "casual outfit"
}

// Response:
{
  "success": true,
  "results": [
    {
      "shoe": {/* shoe details */},
      "search_results": [
        {
          "url": "https://example.com/shoe",
          "title": "Nike Air Max 90",
          "description": "Classic sneaker...",
          "source": "nike.com"
        }
        // ... more results
      ]
    }
    // ... other shoes
  ]
}
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory with:

```env
# Required API Keys
GOOGLE_API_KEY=your_google_api_key_here
FAL_KEY=your_fal_ai_api_key_here
EXA_API_KEY=your_exa_api_key_here

# Optional Settings
FLASK_ENV=development
FLASK_DEBUG=True
```

### CORS Settings

The backend is configured to accept requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (Alternative port)

Modify `config.py` if you need different origins.

## 🎯 Future Enhancements

- **AR Try-On**: Live augmented reality visualization using device camera
- **User Profiles**: Save favorite recommendations and outfit history
- **Social Sharing**: Share outfit combinations with friends
- **Style Learning**: AI learns your preferences over time
- **Advanced Filters**: Filter recommendations by price, brand, style preferences
- **Outfit History**: Track and analyze your fashion choices over time

## 🐛 Troubleshooting

### Backend Issues

1. **API Key Errors**: Ensure all API keys are valid and have proper access:
   - Google API key has Gemini API access enabled
   - FAL AI key has video generation permissions
   - Exa API key has search permissions
2. **Import Errors**: Make sure all pip packages are installed: `pip install -r requirements.txt`
3. **Video Generation Fails**: Check FAL AI API key and quota limits
4. **Product Search Fails**: Verify Exa API key and fallback to default results

### Frontend Issues

1. **CORS Errors**: Ensure backend is running and CORS is configured
2. **Build Errors**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. **API Connection**: Check that backend is running on port 8080
4. **Video Playback Issues**: Ensure browser supports MP4 video format

## 🚀 Performance Tips

- **Image Optimization**: Images are automatically resized for optimal AI processing
- **Concurrent Processing**: Parallel video generation for faster results
- **Function Calling**: Ensures consistent structured output from Gemini
- **Fallback Systems**: Graceful degradation when services are unavailable
- **Caching**: Can be implemented for repeated requests to improve performance

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please create an issue in the GitHub repository.

---

Built with ❤️ using cutting-edge AI technology:
- **Google Gemini** for intelligent recommendations and visualizations
- **FAL AI Veo3** for cinematic video generation
- **Exa AI** for real-time product discovery

*Next-generation fashion technology powered by AI*