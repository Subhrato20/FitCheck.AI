import os
import json
import uuid
import mimetypes
from typing import List, Dict, Any
import google.generativeai as genai
from google import genai as new_genai
from google.genai import types
from PIL import Image, ImageDraw, ImageFont

from config import Config
from models import DefaultShoes
from utils import prepare_image_for_processing, clean_temp_file, create_placeholder_image

class GeminiService:
    """Service class for Google Gemini AI operations"""
    
    def __init__(self):
        """Initialize Gemini models"""
        if Config.GOOGLE_API_KEY:
            genai.configure(api_key=Config.GOOGLE_API_KEY)
            # Initialize new GenAI client for image generation
            self.genai_client = new_genai.Client(api_key=Config.GOOGLE_API_KEY)
        
        self.gemini_pro_vision = genai.GenerativeModel(Config.GEMINI_PRO_VISION_MODEL)
        self.gemini_flash = genai.GenerativeModel(Config.GEMINI_FLASH_MODEL)
        self.gemini_pro = genai.GenerativeModel(Config.GEMINI_PRO_MODEL)
    
    def analyze_outfit_and_recommend_shoes(self, image_path: str) -> List[Dict[str, str]]:
        """Use Gemini 2.5 Pro to analyze outfit and recommend shoes using function calling"""
        
        try:
            # Prepare image for processing
            temp_path = prepare_image_for_processing(image_path)
            
            # Upload image to Gemini
            uploaded_file = genai.upload_file(temp_path)
            
            # Define the function for shoe recommendations
            recommend_shoes_func = genai.protos.FunctionDeclaration(
                name="recommend_shoes",
                description="Recommend shoes based on the outfit in the image",
                parameters=genai.protos.Schema(
                    type=genai.protos.Type.OBJECT,
                    properties={
                        "recommendations": genai.protos.Schema(
                            type=genai.protos.Type.ARRAY,
                            items=genai.protos.Schema(
                                type=genai.protos.Type.OBJECT,
                                properties={
                                    "name": genai.protos.Schema(
                                        type=genai.protos.Type.STRING,
                                        description="The shoe model name"
                                    ),
                                    "brand": genai.protos.Schema(
                                        type=genai.protos.Type.STRING,
                                        description="The brand name"
                                    ),
                                    "color": genai.protos.Schema(
                                        type=genai.protos.Type.STRING,
                                        description="The primary color(s)"
                                    ),
                                    "style": genai.protos.Schema(
                                        type=genai.protos.Type.STRING,
                                        description="The type of shoe"
                                    ),
                                    "reason": genai.protos.Schema(
                                        type=genai.protos.Type.STRING,
                                        description="Why this shoe works with the outfit"
                                    )
                                },
                                required=["name", "brand", "color", "style", "reason"]
                            )
                        )
                    },
                    required=["recommendations"]
                )
            )
            
            # Create the prompt for Gemini
            prompt = """You are a fashion expert AI assistant. Analyze the outfit in this image and recommend exactly 2 shoes that would perfectly complement the style.

            Consider:
            - The outfit's style, colors, and formality level
            - Current fashion trends
            - Versatility and practicality
            - The overall aesthetic and vibe

            Return exactly 2 shoe recommendations that would work well with this outfit. Use the recommend_shoes function to provide your recommendations."""
            
            # Generate response with function calling
            response = self.gemini_pro_vision.generate_content(
                [uploaded_file, prompt],
                tools=[recommend_shoes_func],
                tool_config={"function_calling_config": {"mode": "AUTO"}}
            )
            
            # Extract recommendations from the function call response
            shoes = self._extract_shoe_recommendations(response)
            
            # Clean up temp file
            clean_temp_file(temp_path)
            
            # Ensure we have exactly 2 recommendations
            from utils import ensure_shoe_count
            shoes = ensure_shoe_count(shoes, 2)
            
            return shoes
            
        except Exception as e:
            print(f"Error in shoe recommendation: {str(e)}")
            # Return default recommendations on error
            return DefaultShoes.FALLBACK_SHOES
    
    def _extract_shoe_recommendations(self, response) -> List[Dict[str, str]]:
        """Extract shoe recommendations from Gemini response"""
        shoes = []
        
        # Check if there's a function call in the response
        if response.candidates and response.candidates[0].content.parts:
            for part in response.candidates[0].content.parts:
                if part.function_call:
                    # Extract the recommendations from the function call
                    args = part.function_call.args
                    if "recommendations" in args:
                        shoes = [dict(rec) for rec in args["recommendations"]]
        
        # If function calling didn't work, try parsing text response
        if not shoes and response.text:
            try:
                # Try to extract JSON from the text response
                text = response.text
                if '```json' in text:
                    text = text.split('```json')[1].split('```')[0]
                elif '[' in text and ']' in text:
                    text = text[text.index('['):text.rindex(']')+1]
                
                parsed = json.loads(text.strip())
                if isinstance(parsed, list):
                    shoes = parsed
                elif isinstance(parsed, dict) and 'recommendations' in parsed:
                    shoes = parsed['recommendations']
            except:
                pass
        
        return shoes
    
    def generate_outfit_visualization(self, original_image_path: str, shoe_description: str, angle: str) -> str:
        """Generate visualization of person wearing the recommended shoes using Gemini 2.5 Flash"""
        
        try:
            # Prepare image for processing
            temp_path = prepare_image_for_processing(original_image_path, Config.VIZ_MAX_IMAGE_SIZE)
            
            # Upload image to Gemini
            uploaded_file = genai.upload_file(temp_path)
            
            # Create prompt for image generation/editing
            prompt = f"""Based on this image of a person, I need you to describe in detail how they would look wearing {shoe_description} from a {angle} view angle.
            
            Describe:
            1. How the shoes would complement their outfit
            2. The overall appearance from the {angle} angle
            3. How the shoes change the outfit's aesthetic
            4. The visual harmony between the shoes and the existing outfit
            
            Be specific about colors, styles, and visual details."""
            
            # Generate description using Gemini Flash
            response = self.gemini_flash.generate_content([uploaded_file, prompt])
            
            # Clean up temp file
            clean_temp_file(temp_path)
            
            # Create visualization image
            return self._create_visualization_image(shoe_description, angle, response.text)
            
        except Exception as e:
            print(f"Error generating visualization: {str(e)}")
            return self._create_error_visualization()
    
    def generate_outfit_image_with_shoes(self, original_image_path: str, shoe_description: str, angle: str) -> str:
        """Generate actual image of person wearing the recommended shoes using Gemini 2.5 Flash Image Preview"""
        
        try:
            print(f"Starting image generation for: {shoe_description} - {angle} angle")
            print(f"Original image path: {original_image_path}")
            
            # Prepare image for processing
            temp_path = prepare_image_for_processing(original_image_path, Config.VIZ_MAX_IMAGE_SIZE)
            print(f"Prepared temp image path: {temp_path}")
            
            # Read and encode the original image
            with open(temp_path, 'rb') as image_file:
                image_data = image_file.read()
            
            # Create prompt for image generation
            prompt = f"""Generate a realistic image of this person wearing {shoe_description} from a {angle} view angle. 
            
            Requirements:
            - Show the person wearing the exact shoes described: {shoe_description}
            - Maintain the same outfit, pose, and background as the original image
            - Ensure the shoes are clearly visible and match the description
            - Keep the same lighting and overall aesthetic
            - The image should look natural and realistic
            - Focus on the {angle} angle view as requested
            
            Make sure the shoes complement the outfit perfectly and the overall look is cohesive."""
            
            # Create content with the image and prompt
            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_bytes(
                            data=image_data,
                            mime_type="image/jpeg"
                        ),
                        types.Part.from_text(text=prompt),
                    ],
                ),
            ]
            
            # Configure for image generation
            generate_content_config = types.GenerateContentConfig(
                response_modalities=["IMAGE", "TEXT"],
            )
            
            # Generate the image
            file_index = 0
            generated_image_path = None
            
            for chunk in self.genai_client.models.generate_content_stream(
                model=Config.GEMINI_IMAGE_GENERATION_MODEL,
                contents=contents,
                config=generate_content_config,
            ):
                if (
                    chunk.candidates is None
                    or chunk.candidates[0].content is None
                    or chunk.candidates[0].content.parts is None
                ):
                    continue
                    
                if (chunk.candidates[0].content.parts[0].inline_data and 
                    chunk.candidates[0].content.parts[0].inline_data.data):
                    
                    # Generate filename
                    filename = f"generated_{uuid.uuid4().hex}_{angle}.jpg"
                    filepath = os.path.join(Config.GENERATED_FOLDER, filename)
                    
                    # Save the generated image
                    inline_data = chunk.candidates[0].content.parts[0].inline_data
                    data_buffer = inline_data.data
                    file_extension = mimetypes.guess_extension(inline_data.mime_type) or ".jpg"
                    
                    with open(filepath, "wb") as f:
                        f.write(data_buffer)
                    
                    generated_image_path = filepath
                    file_index += 1
                    print(f"Generated image saved to: {filepath}")
                    print(f"Image data size: {len(data_buffer)} bytes")
                    
                elif chunk.candidates[0].content.parts[0].text:
                    print(f"AI Response: {chunk.candidates[0].content.parts[0].text}")
            
            # Clean up temp file
            clean_temp_file(temp_path)
            
            if generated_image_path:
                return generated_image_path
            else:
                print("No image was generated, falling back to placeholder")
                return self._create_visualization_image(shoe_description, angle, "AI image generation failed")
            
        except Exception as e:
            print(f"Error generating outfit image: {str(e)}")
            # Clean up temp file
            if 'temp_path' in locals():
                clean_temp_file(temp_path)
            return self._create_error_visualization()
    
    def _create_visualization_image(self, shoe_description: str, angle: str, description: str = "") -> str:
        """Create visualization image with AI description"""
        img = Image.new('RGB', Config.VIZ_IMAGE_DIMENSIONS, color=(245, 245, 247))
        
        draw = ImageDraw.Draw(img)
        
        # Try to use a default font
        try:
            font_paths = [
                "/System/Library/Fonts/Helvetica.ttc",  # macOS
                "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",  # Linux
                "C:\\Windows\\Fonts\\Arial.ttf"  # Windows
            ]
            font = None
            small_font = None
            for font_path in font_paths:
                if os.path.exists(font_path):
                    font = ImageFont.truetype(font_path, 24)
                    small_font = ImageFont.truetype(font_path, 16)
                    break
            if not font:
                font = ImageFont.load_default()
                small_font = font
        except:
            font = ImageFont.load_default()
            small_font = font
        
        # Draw the visualization info
        text_lines = [
            "AI-Generated Outfit Visualization",
            "",
            f"Wearing: {shoe_description}",
            f"View: {angle.upper()}",
            "",
            "🦶 Outfit with Recommended Shoes"
        ]
        
        # Add some of the AI's description (truncated)
        if description:
            desc_lines = description[:200].split('\n')
            text_lines.extend(["", "Description:"] + desc_lines[:3])
        
        y_position = 100
        for line in text_lines:
            if line:
                # Create a bounding box for text
                bbox = draw.textbbox((256, y_position), line, font=small_font if len(line) > 30 else font, anchor="mm")
                # Draw white background for text
                draw.rectangle([(bbox[0]-5, bbox[1]-2), (bbox[2]+5, bbox[3]+2)], fill=(255, 255, 255))
                # Draw text
                draw.text((256, y_position), line, fill=(50, 50, 50), 
                         font=small_font if len(line) > 30 else font, anchor="mm")
            y_position += 35
        
        # Add a stylized shoe icon
        shoe_y = y_position + 50
        draw.ellipse([(206, shoe_y), (306, shoe_y + 40)], fill=(102, 126, 234), outline=(76, 75, 162), width=3)
        draw.text((256, shoe_y + 20), "SHOE", fill=(255, 255, 255), font=font, anchor="mm")
        
        # Save the visualization
        filename = f"generated_{uuid.uuid4().hex}_{angle}.jpg"
        filepath = os.path.join(Config.GENERATED_FOLDER, filename)
        img.save(filepath, quality=95)
        
        return filepath
    
    def _create_error_visualization(self) -> str:
        """Create error placeholder visualization"""
        img = Image.new('RGB', Config.VIZ_IMAGE_DIMENSIONS, color=(200, 200, 200))
        draw = ImageDraw.Draw(img)
        draw.text((256, 384), "Visualization Error", fill=(100, 100, 100), anchor="mm")
        filename = f"error_{uuid.uuid4().hex}.jpg"
        filepath = os.path.join(Config.GENERATED_FOLDER, filename)
        img.save(filepath)
        return filepath
    
    def test_connection(self) -> Dict[str, Any]:
        """Test Gemini API connection"""
        try:
            response = self.gemini_pro.generate_content("Say 'Gemini API is working!' in exactly 5 words.")
            return {
                "success": True,
                "message": response.text,
                "model": Config.GEMINI_PRO_MODEL
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
