import os
from typing import List, Dict, Any, Optional
from exa_py import Exa
from config import Config

class ExaService:
    """Service class for Exa web search operations"""
    
    def __init__(self):
        """Initialize Exa service with API key"""
        self.api_key = Config.EXA_API_KEY
        if self.api_key:
            self.exa = Exa(self.api_key)
        else:
            self.exa = None
    
    def search_products(self, query: str, limit: int = 2) -> List[Dict[str, Any]]:
        """
        Search for products using Exa web search
        
        Args:
            query: Search query for products
            limit: Number of results to return (default: 2)
            
        Returns:
            List of search results with URLs and metadata
        """
        try:
            if not self.exa:
                print("Exa API key not configured, using fallback results")
                return self._get_fallback_results(query)
            
            print(f"Searching for: {query}")
            
            # Search using Exa
            results = self.exa.search(
                query,
                type="auto",  # Let Exa choose between neural and keyword search
                num_results=limit
            )
            
            # Process results
            processed_results = []
            for result in results.results:
                processed_results.append({
                    'url': result.url,
                    'title': result.title,
                    'description': getattr(result, 'text', '')[:200] + '...' if hasattr(result, 'text') and result.text else 'No description available',
                    'source': self._extract_domain(result.url),
                    'search_query': query
                })
            
            print(f"Found {len(processed_results)} results")
            return processed_results
                
        except Exception as e:
            print(f"Error in Exa search: {str(e)}")
            return self._get_fallback_results(query)
    
    def _extract_domain(self, url: str) -> str:
        """Extract domain from URL"""
        try:
            from urllib.parse import urlparse
            parsed = urlparse(url)
            return parsed.netloc.replace('www.', '')
        except:
            return 'Unknown'
    
    def _get_fallback_results(self, query: str) -> List[Dict[str, Any]]:
        """
        Provide fallback results when Exa API fails
        
        Args:
            query: The search query
            
        Returns:
            List of fallback search results
        """
        # Create fallback results with popular shoe shopping sites
        fallback_sites = [
            {
                "url": "https://www.nike.com",
                "title": "Nike Official Store",
                "description": "Shop the latest Nike shoes and sneakers",
                "source": "nike.com"
            },
            {
                "url": "https://www.adidas.com",
                "title": "Adidas Official Store", 
                "description": "Discover Adidas shoes and athletic footwear",
                "source": "adidas.com"
            },
            {
                "url": "https://www.zappos.com",
                "title": "Zappos - Shoes & Clothing",
                "description": "Free shipping on shoes, clothing and more",
                "source": "zappos.com"
            },
            {
                "url": "https://www.footlocker.com",
                "title": "Foot Locker",
                "description": "Athletic shoes, sneakers and apparel",
                "source": "footlocker.com"
            },
            {
                "url": "https://www.amazon.com/s?k=shoes",
                "title": "Amazon - Shoes",
                "description": "Shop shoes on Amazon with fast delivery",
                "source": "amazon.com"
            },
            {
                "url": "https://www.dsw.com",
                "title": "DSW Designer Shoe Warehouse",
                "description": "Designer shoes at great prices",
                "source": "dsw.com"
            }
        ]
        
        # Return 2 random fallback results
        import random
        selected = random.sample(fallback_sites, min(2, len(fallback_sites)))
        
        for result in selected:
            result["search_query"] = query
            
        return selected
    
    def search_shoes_for_outfit(self, outfit_description: str, shoe_recommendations: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        """
        Search for specific shoes based on outfit and recommendations
        
        Args:
            outfit_description: Description of the outfit
            shoe_recommendations: List of shoe recommendations from Gemini
            
        Returns:
            List of search results for each shoe recommendation
        """
        all_results = []
        
        for shoe in shoe_recommendations:
            # Create search query for this specific shoe
            brand = shoe.get('brand', '')
            name = shoe.get('name', '')
            color = shoe.get('color', '')
            style = shoe.get('style', '')
            
            # Build comprehensive search query
            query_parts = []
            if brand:
                query_parts.append(brand)
            if name:
                query_parts.append(name)
            if color:
                query_parts.append(color)
            if style:
                query_parts.append(style)
            
            # Add shopping context
            query_parts.append("shoes")
            query_parts.append("buy")
            query_parts.append("online")
            
            search_query = " ".join(query_parts)
            
            print(f"Searching for: {search_query}")
            
            # Search for this shoe
            results = self.search_products(search_query, limit=2)
            
            # Add shoe info to results
            for result in results:
                result['shoe_info'] = shoe
                result['search_query'] = search_query
            
            all_results.extend(results)
        
        return all_results
    
    def test_connection(self) -> Dict[str, Any]:
        """Test Exa API connection"""
        try:
            if not self.exa:
                return {
                    "success": False,
                    "error": "Exa API key not configured"
                }
            
            # Simple test search
            test_results = self.exa.search("test shoes", num_results=1)
            
            return {
                "success": True,
                "message": "Exa API is working!",
                "test_results_count": len(test_results.results) if test_results.results else 0
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
