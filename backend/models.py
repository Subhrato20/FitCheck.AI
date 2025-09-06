from typing import List, Dict, Any
from dataclasses import dataclass

@dataclass
class ShoeRecommendation:
    """Data class for shoe recommendations"""
    name: str
    brand: str
    color: str
    style: str
    reason: str

@dataclass
class OutfitVisualization:
    """Data class for outfit visualizations"""
    angle: str
    image: str

@dataclass
class ShoeVisualization:
    """Data class for shoe visualization results"""
    shoe: Dict[str, str]
    visualizations: List[OutfitVisualization]

class DefaultShoes:
    """Default shoe recommendations for fallback scenarios"""
    
    FALLBACK_SHOES = [
        {"name": "Air Jordan 1", "brand": "Nike", "color": "Black/Red", "style": "sneakers", "reason": "Classic streetwear staple"},
        {"name": "Chuck Taylor All Star", "brand": "Converse", "color": "White", "style": "sneakers", "reason": "Timeless casual option"},
        {"name": "Gazelle", "brand": "Adidas", "color": "Navy/White", "style": "sneakers", "reason": "Retro athletic style"},
        {"name": "Classic Slip-On", "brand": "Vans", "color": "Checkerboard", "style": "slip-ons", "reason": "Effortless skate style"}
    ]
    
    DEFAULT_SHOES = [
        {"name": "Air Force 1", "brand": "Nike", "color": "White", "style": "sneakers", "reason": "Classic versatile choice"},
        {"name": "Chelsea Boot", "brand": "Dr. Martens", "color": "Black", "style": "boots", "reason": "Timeless and stylish"},
        {"name": "Stan Smith", "brand": "Adidas", "color": "White/Green", "style": "sneakers", "reason": "Clean minimalist design"},
        {"name": "Old Skool", "brand": "Vans", "color": "Black/White", "style": "sneakers", "reason": "Casual street style"}
    ]
