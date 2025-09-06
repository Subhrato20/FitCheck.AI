#!/usr/bin/env python3
"""
Quick test script to verify Google Gemini API connection
"""

import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

def test_gemini_connection():
    """Test if Gemini API is properly configured"""
    
    api_key = os.getenv('GOOGLE_API_KEY')
    
    if not api_key:
        print("❌ Error: GOOGLE_API_KEY not found in .env file")
        print("Please create a .env file in the backend directory with:")
        print("GOOGLE_API_KEY=your_actual_api_key_here")
        return False
    
    try:
        # Configure API
        genai.configure(api_key=api_key)
        
        # Test with basic model
        print("🔄 Testing Gemini connection...")
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content("Say 'Gemini is working!' in exactly 3 words.")
        
        print("✅ Success! Gemini API is connected.")
        print(f"Response: {response.text}")
        
        # Test available models
        print("\n📋 Available Models:")
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"  - {m.name}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error connecting to Gemini: {str(e)}")
        print("\nPossible issues:")
        print("1. Invalid API key")
        print("2. API key doesn't have Gemini access")
        print("3. Network connection issues")
        return False

if __name__ == "__main__":
    print("🚀 FitCheck.AI - Gemini API Test")
    print("=" * 40)
    
    if test_gemini_connection():
        print("\n✨ Your backend is ready to use Gemini models!")
        print("You can now run: python app.py")
    else:
        print("\n⚠️  Please fix the issues above before running the app")
