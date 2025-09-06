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

@dataclass
class VideoGeneration:
    """Data class for video generation results"""
    angle: str
    video_url: str
    status: str  # 'processing', 'completed', 'failed'

@dataclass
class ShoeVideoGeneration:
    """Data class for shoe video generation results"""
    shoe: Dict[str, str]
    videos: List[VideoGeneration]

class DefaultShoes:
    """Default shoe recommendations for fallback scenarios"""
    
    FALLBACK_SHOES = [
        {"name": "Air Jordan 1", "brand": "Nike", "color": "Black/Red", "style": "sneakers", "reason": "Classic streetwear staple"},
        {"name": "Chuck Taylor All Star", "brand": "Converse", "color": "White", "style": "sneakers", "reason": "Timeless casual option"}
    ]
    
    DEFAULT_SHOES = [
        {"name": "Air Force 1", "brand": "Nike", "color": "White", "style": "sneakers", "reason": "Classic versatile choice"},
        {"name": "Chelsea Boot", "brand": "Dr. Martens", "color": "Black", "style": "boots", "reason": "Timeless and stylish"}
    ]
