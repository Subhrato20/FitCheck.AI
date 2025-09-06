import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Application configuration class"""
    
    # Flask configuration
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size
    UPLOAD_FOLDER = 'uploads'
    GENERATED_FOLDER = 'generated'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    
    # CORS origins
    CORS_ORIGINS = [
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:3000", 
        "http://localhost:8080"
    ]
    
    # Google Gemini API configuration
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
    
    # Gemini model names
    GEMINI_PRO_VISION_MODEL = 'gemini-2.5-pro'
    GEMINI_FLASH_MODEL = 'gemini-2.5-flash'
    GEMINI_PRO_MODEL = 'gemini-pro'
    GEMINI_IMAGE_GENERATION_MODEL = 'gemini-2.5-flash-image-preview'
    
    # Image processing settings
    MAX_IMAGE_SIZE = 1024
    VIZ_MAX_IMAGE_SIZE = 768
    VIZ_IMAGE_DIMENSIONS = (512, 768)
    
    @staticmethod
    def init_app(app):
        """Initialize application with configuration"""
        app.config['MAX_CONTENT_LENGTH'] = Config.MAX_CONTENT_LENGTH
        app.config['UPLOAD_FOLDER'] = Config.UPLOAD_FOLDER
        app.config['GENERATED_FOLDER'] = Config.GENERATED_FOLDER
        
        # Create necessary directories
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(Config.GENERATED_FOLDER, exist_ok=True)
