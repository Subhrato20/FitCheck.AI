# Backend Setup Instructions

## Quick Start

1. **Create your environment file:**
   ```bash
   cp env.template .env
   ```

2. **Get your Google API Key:**
   - Go to [Google AI Studio](https://makersuite.google.com/)
   - Sign in with your Google account
   - Navigate to [Get API Key](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key

3. **Add your API key to `.env`:**
   ```
   GOOGLE_API_KEY=your_actual_api_key_here
   ```

4. **Test your setup:**
   ```bash
   source venv/bin/activate  # If not already activated
   python test_gemini.py
   ```

5. **Run the backend:**
   ```bash
   python app.py
   ```

## Models Used

- **Gemini 2.5 Pro (gemini-2.0-flash-exp)**: For analyzing outfits and recommending shoes
- **Gemini 2.5 Flash (gemini-2.0-flash-exp)**: For generating outfit visualizations

Note: The models will be updated to use the specific versions (2.5 Pro and 2.5 Flash Nano Banana) when they become available in the API.

## Troubleshooting

### "GOOGLE_API_KEY not found"
- Make sure you've created the `.env` file
- Ensure the `.env` file is in the backend directory
- Check that the API key is correctly formatted

### "Error connecting to Gemini"
- Verify your API key is valid
- Check that your API key has access to Gemini models
- Ensure you have an active internet connection

### Import errors
- Make sure you've activated the virtual environment
- Run: `pip install -r requirements.txt`

## API Endpoints

- `POST /upload` - Upload image and get shoe recommendations
- `POST /generate-outfits` - Generate outfit visualizations
- `GET /health` - Check backend status
- `GET /test-gemini` - Test Gemini API connection
