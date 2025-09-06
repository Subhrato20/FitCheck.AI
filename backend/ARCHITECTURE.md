# FitCheck.AI Backend Architecture

## Overview
The backend has been refactored into a modular architecture for better maintainability, testability, and separation of concerns.

## Project Structure

```
backend/
├── app.py                 # Main Flask application with routes only
├── config.py             # Application configuration
├── models.py             # Data models and structures
├── utils.py              # Utility functions
├── services/             # Business logic services
│   ├── __init__.py
│   └── gemini_service.py # Google Gemini AI service
├── uploads/              # Uploaded images
├── generated/            # Generated visualizations
└── requirements.txt      # Dependencies
```

## Module Descriptions

### `app.py`
- **Purpose**: Main Flask application with route definitions only
- **Responsibilities**:
  - Define Flask routes (`/health`, `/upload`, `/generate-outfits`, `/test-gemini`)
  - Handle HTTP requests and responses
  - Coordinate between services
  - File upload handling

### `config.py`
- **Purpose**: Centralized configuration management
- **Responsibilities**:
  - Application settings (file sizes, folders, CORS origins)
  - Google Gemini API configuration
  - Image processing settings
  - Directory initialization

### `models.py`
- **Purpose**: Data models and structures
- **Responsibilities**:
  - `ShoeRecommendation` dataclass
  - `OutfitVisualization` dataclass
  - `ShoeVisualization` dataclass
  - Default shoe recommendations for fallback scenarios

### `utils.py`
- **Purpose**: Utility functions and helpers
- **Responsibilities**:
  - File validation (`allowed_file`)
  - Image processing helpers
  - Temporary file management
  - Data validation and formatting

### `services/gemini_service.py`
- **Purpose**: Google Gemini AI integration
- **Responsibilities**:
  - Outfit analysis and shoe recommendations
  - Outfit visualization generation
  - API connection testing
  - Error handling and fallback logic

## Key Benefits

1. **Separation of Concerns**: Each module has a single responsibility
2. **Testability**: Services can be easily unit tested
3. **Maintainability**: Changes to AI logic don't affect route handling
4. **Reusability**: Services can be used by other parts of the application
5. **Configuration Management**: All settings centralized in one place
6. **Error Handling**: Consistent error handling across modules

## Usage

The refactored application maintains the same API endpoints and functionality:

- `GET /health` - Health check
- `POST /upload` - Upload image and get shoe recommendations
- `POST /generate-outfits` - Generate outfit visualizations
- `GET /test-gemini` - Test Gemini API connection

## Dependencies

All dependencies remain the same as defined in `requirements.txt`. The modular structure doesn't introduce any new dependencies.
