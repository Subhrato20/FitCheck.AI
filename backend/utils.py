import os
import uuid
from PIL import Image
from typing import List, Dict, Any
from config import Config

def allowed_file(filename: str) -> bool:
    """Check if the uploaded file has an allowed extension"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def prepare_image_for_processing(image_path: str, max_size: int = None) -> str:
    """Prepare image for AI processing by resizing and converting to RGB"""
    if max_size is None:
        max_size = Config.MAX_IMAGE_SIZE
    
    with Image.open(image_path) as img:
        # Ensure image is in RGB mode
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize if too large
        if img.width > max_size or img.height > max_size:
            img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        
        # Save to temporary file
        temp_path = os.path.join(Config.UPLOAD_FOLDER, f"temp_{uuid.uuid4().hex}.jpg")
        img.save(temp_path)
        
        return temp_path

def create_placeholder_image(text: str, dimensions: tuple = None) -> str:
    """Create a placeholder image with text"""
    if dimensions is None:
        dimensions = Config.VIZ_IMAGE_DIMENSIONS
    
    img = Image.new('RGB', dimensions, color=(245, 245, 247))
    
    from PIL import ImageDraw, ImageFont
    draw = ImageDraw.Draw(img)
    
    # Try to use a default font
    try:
        font_paths = [
            "/System/Library/Fonts/Helvetica.ttc",  # macOS
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",  # Linux
            "C:\\Windows\\Fonts\\Arial.ttf"  # Windows
        ]
        font = None
        for font_path in font_paths:
            if os.path.exists(font_path):
                font = ImageFont.truetype(font_path, 24)
                break
        if not font:
            font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    # Draw text
    draw.text((dimensions[0]//2, dimensions[1]//2), text, fill=(50, 50, 50), font=font, anchor="mm")
    
    return img

def ensure_shoe_count(shoes: List[Dict[str, str]], target_count: int = 4) -> List[Dict[str, str]]:
    """Ensure we have exactly the target number of shoe recommendations"""
    if len(shoes) > target_count:
        return shoes[:target_count]
    elif len(shoes) < target_count:
        from models import DefaultShoes
        default_shoes = DefaultShoes.DEFAULT_SHOES
        while len(shoes) < target_count:
            shoes.append(default_shoes[len(shoes) % len(default_shoes)])
    return shoes

def clean_temp_file(file_path: str) -> None:
    """Clean up temporary files"""
    if os.path.exists(file_path):
        os.remove(file_path)
