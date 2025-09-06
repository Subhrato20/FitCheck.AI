# FitCheck.AI - AI-Powered Shoe Recommendation & Outfit Visualization

An intelligent fashion app that analyzes your outfit photos using **Google Gemini 2.5 Pro** to recommend perfect shoe matches, then uses **Gemini 2.5 Flash (Nano Banana)** to generate visualizations of how you'd look wearing each recommended shoe from multiple angles.

## 🌟 Features

- **Smart Photo Upload**: Upload your outfit photo with drag-and-drop support
- **AI Shoe Recommendations**: Powered by **Gemini 2.5 Pro** with function calling for structured shoe recommendations
- **Multi-Angle Visualization**: Uses **Gemini 2.5 Flash** to generate outfit visualizations from front, back, left, and right angles
- **Beautiful UI**: Modern, responsive React TypeScript interface with smooth animations
- **Real-time Processing**: Fast AI-powered analysis using Google's latest Gemini models

## 🚀 Tech Stack

### AI Models
- **Gemini 2.5 Pro**: For intelligent shoe recommendations using function calling
- **Gemini 2.5 Flash (Nano Banana)**: For generating outfit visualizations

### Backend
- **Flask**: Python web framework
- **Google Generative AI SDK**: Official Google SDK for Gemini models
- **Pillow**: Image processing
- **Flask-CORS**: Cross-origin resource sharing

### Frontend
- **React**: UI framework
- **TypeScript**: Type-safe JavaScript
- **Vite**: Build tool and dev server
- **Framer Motion**: Animation library
- **Lucide React**: Icon library

## 📋 Prerequisites

- Python 3.8+ 
- Node.js 16+
- Google API Key (for Gemini models)

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

5. Edit `.env` and add your Google API key:
```
GOOGLE_API_KEY=your_actual_google_api_key_here
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

1. **Upload Photo**: Click or drag-drop your outfit photo into the upload zone
2. **Get Recommendations**: Gemini 2.5 Pro analyzes your outfit and suggests 4 complementary shoes with:
   - Shoe name
   - Brand
   - Color
   - Style type
   - Reason for recommendation
3. **View Visualizations**: Click "Generate Outfit Visualizations" to see AI-generated views
4. **Explore Angles**: Switch between front, back, left, and right views for each shoe
5. **Navigate Shoes**: Use the navigation buttons or tabs to switch between different shoe recommendations

## 🔑 Getting a Google API Key

1. Visit [Google AI Studio](https://makersuite.google.com/)
2. Sign in with your Google account
3. Navigate to [Get API Key](https://makersuite.google.com/app/apikey)
4. Create a new API key
5. Copy the key and add it to your `.env` file

## 🎯 How It Works

### Shoe Recommendation Flow (Gemini 2.5 Pro)
1. User uploads outfit photo
2. Image is processed and sent to Gemini 2.5 Pro
3. Uses **function calling** to ensure structured output with exactly 4 shoe recommendations
4. Each recommendation includes brand, name, color, style, and reasoning

### Visualization Generation (Gemini 2.5 Flash)
1. For each recommended shoe, generates 4 angle views
2. Uses the original photo + shoe description
3. Creates visualization showing how the outfit would look with the recommended shoes
4. Provides detailed descriptions of the visual harmony

## 📂 Project Structure

```
FitCheck.AI/
├── backend/
│   ├── app.py              # Flask application with Gemini integration
│   ├── requirements.txt    # Python dependencies
│   ├── env.template        # Environment variables template
│   ├── uploads/            # Uploaded images (auto-created)
│   └── generated/          # Generated visualizations (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ImageUpload.tsx
│   │   │   ├── ShoeRecommendations.tsx
│   │   │   └── OutfitVisualization.tsx
│   │   ├── types.ts        # TypeScript types
│   │   ├── App.tsx         # Main app component
│   │   └── *.css           # Styling files
│   ├── package.json        # Node dependencies
│   └── vite.config.ts      # Vite configuration
│
└── README.md               # This file
```

## 🔧 API Endpoints

### Backend Endpoints

- `GET /health` - Health check endpoint
- `POST /upload` - Upload outfit image and get Gemini 2.5 Pro shoe recommendations
- `POST /generate-outfits` - Generate outfit visualizations using Gemini 2.5 Flash
- `GET /test-gemini` - Test Gemini API connection

### Request/Response Examples

#### Upload Image
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

#### Generate Visualizations
```json
// Request: POST /generate-outfits
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

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the backend directory with:

```env
GOOGLE_API_KEY=your_google_api_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

### CORS Settings

The backend is configured to accept requests from:
- `http://localhost:5173` (Vite default)
- `http://localhost:3000` (Alternative port)

Modify `app.py` if you need different origins.

## 🎯 Future Enhancements

- **Full Image Generation**: When Gemini 2.5 Flash (Nano Banana) image generation becomes available
- **Real-time Try-On**: Live AR visualization using device camera
- **Shoe Database**: Connect to real shoe retailers for purchase links
- **User Profiles**: Save favorite recommendations and outfit history
- **Social Sharing**: Share outfit combinations with friends
- **Style Learning**: AI learns your preferences over time

## 🐛 Troubleshooting

### Backend Issues

1. **Google API Error**: Ensure your API key is valid and has Gemini API access enabled
2. **Import Errors**: Make sure all pip packages are installed: `pip install -r requirements.txt`
3. **Model Access**: Ensure your API key has access to both Gemini 2.5 Pro and Flash models

### Frontend Issues

1. **CORS Errors**: Ensure backend is running and CORS is configured
2. **Build Errors**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. **API Connection**: Check that backend is running on port 8080

## 🚀 Performance Tips

- Images are automatically resized for optimal Gemini processing
- Function calling ensures consistent structured output
- Batch processing for multiple angle generation
- Caching can be implemented for repeated requests

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please create an issue in the GitHub repository.

---

Built with ❤️ using Google's Gemini AI models for next-generation fashion technology