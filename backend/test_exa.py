#!/usr/bin/env python3
"""
Test script for Exa integration
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.exa_service import ExaService

def test_exa_connection():
    """Test Exa API connection"""
    print("Testing Exa API connection...")
    
    # Check if API key is set
    api_key = os.getenv('EXA_API_KEY')
    if not api_key:
        print("❌ EXA_API_KEY not found in environment variables")
        print("Please add your Exa API key to the .env file")
        return False
    
    print(f"✅ API key found: {api_key[:10]}...")
    
    # Initialize service
    try:
        exa_service = ExaService()
        print("✅ Exa service initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize Exa service: {e}")
        return False
    
    # Test connection
    try:
        result = exa_service.test_connection()
        if result["success"]:
            print("✅ Exa API connection successful!")
            print(f"   Message: {result['message']}")
            return True
        else:
            print(f"❌ Exa API connection failed: {result.get('error', 'Unknown error')}")
            return False
    except Exception as e:
        print(f"❌ Error testing Exa connection: {e}")
        return False

def test_product_search():
    """Test product search functionality"""
    print("\nTesting product search...")
    
    try:
        exa_service = ExaService()
        
        # Test with sample shoe recommendations
        sample_shoes = [
            {
                "name": "Air Max 90",
                "brand": "Nike",
                "color": "White",
                "style": "Sneakers",
                "reason": "Perfect for casual outfits"
            },
            {
                "name": "Stan Smith",
                "brand": "Adidas",
                "color": "White",
                "style": "Sneakers", 
                "reason": "Classic and versatile"
            }
        ]
        
        print("Searching for sample shoes...")
        results = exa_service.search_shoes_for_outfit("casual outfit", sample_shoes)
        
        if results:
            print(f"✅ Found {len(results)} search results")
            for i, result in enumerate(results[:4]):  # Show first 4 results
                print(f"   Result {i+1}:")
                print(f"     Title: {result.get('title', 'N/A')}")
                print(f"     URL: {result.get('url', 'N/A')}")
                print(f"     Source: {result.get('source', 'N/A')}")
                print(f"     Shoe: {result.get('shoe_info', {}).get('brand', 'N/A')} {result.get('shoe_info', {}).get('name', 'N/A')}")
        else:
            print("❌ No search results found")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Error in product search test: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Exa Integration Test")
    print("=" * 40)
    
    # Test connection
    connection_ok = test_exa_connection()
    
    if connection_ok:
        # Test product search
        search_ok = test_product_search()
        
        if search_ok:
            print("\n🎉 All tests passed! Exa integration is working correctly.")
        else:
            print("\n⚠️  Connection works but product search failed.")
    else:
        print("\n❌ Exa integration test failed.")
        print("\nTo fix this:")
        print("1. Get an Exa API key from https://exa.ai")
        print("2. Add it to your .env file as EXA_API_KEY=your_key_here")
        print("3. Run this test again")
