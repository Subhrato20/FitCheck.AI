import os
import json
import base64
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image
import io
from dotenv import load_dotenv
import requests
from typing import List, Dict, Any
import uuid
import tempfile
import google.generativeai as genai

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://localhost:8080"])

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['GENERATED_FOLDER'] = 'generated'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

# Create necessary directories
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['GENERATED_FOLDER'], exist_ok=True)

# Configure Google Gemini API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

# Initialize Gemini models
gemini_pro_vision = genai.GenerativeModel('gemini-2.5-pro')  # For shoe recommendations
gemini_flash = genai.GenerativeModel('gemini-2.5-flash')  # For image generation

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def analyze_outfit_and_recommend_shoes(image_path: str) -> List[Dict[str, str]]:
    """Use Gemini 2.5 Pro to analyze outfit and recommend shoes using function calling"""
    
    try:
        # Open and prepare the image
        with Image.open(image_path) as img:
            # Ensure image is in RGB mode
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize if too large (Gemini has size limits)
            max_size = 1024
            if img.width > max_size or img.height > max_size:
                img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            # Save to temporary file for Gemini
            temp_path = os.path.join(app.config['UPLOAD_FOLDER'], f"temp_{uuid.uuid4().hex}.jpg")
            img.save(temp_path)
        
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
        prompt = """You are a fashion expert AI assistant. Analyze the outfit in this image and recommend exactly 4 shoes that would perfectly complement the style.

        Consider:
        - The outfit's style, colors, and formality level
        - Current fashion trends
        - Versatility and practicality
        - The overall aesthetic and vibe

        Return exactly 4 shoe recommendations that would work well with this outfit. Use the recommend_shoes function to provide your recommendations."""
        
        # Generate response with function calling
        response = gemini_pro_vision.generate_content(
            [uploaded_file, prompt],
            tools=[recommend_shoes_func],
            tool_config={"function_calling_config": {"mode": "AUTO"}}
        )
        
        # Extract recommendations from the function call response
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
        
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        # Ensure we have exactly 4 recommendations
        if len(shoes) > 4:
            shoes = shoes[:4]
        elif len(shoes) < 4:
            # Add default recommendations if needed
            default_shoes = [
                {"name": "Air Force 1", "brand": "Nike", "color": "White", "style": "sneakers", "reason": "Classic versatile choice"},
                {"name": "Chelsea Boot", "brand": "Dr. Martens", "color": "Black", "style": "boots", "reason": "Timeless and stylish"},
                {"name": "Stan Smith", "brand": "Adidas", "color": "White/Green", "style": "sneakers", "reason": "Clean minimalist design"},
                {"name": "Old Skool", "brand": "Vans", "color": "Black/White", "style": "sneakers", "reason": "Casual street style"}
            ]
            while len(shoes) < 4:
                shoes.append(default_shoes[len(shoes)])
        
        return shoes
        
    except Exception as e:
        print(f"Error in shoe recommendation: {str(e)}")
        # Return default recommendations on error
        return [
            {"name": "Air Jordan 1", "brand": "Nike", "color": "Black/Red", "style": "sneakers", "reason": "Classic streetwear staple"},
            {"name": "Chuck Taylor All Star", "brand": "Converse", "color": "White", "style": "sneakers", "reason": "Timeless casual option"},
            {"name": "Gazelle", "brand": "Adidas", "color": "Navy/White", "style": "sneakers", "reason": "Retro athletic style"},
            {"name": "Classic Slip-On", "brand": "Vans", "color": "Checkerboard", "style": "slip-ons", "reason": "Effortless skate style"}
        ]

def generate_outfit_visualization(original_image_path: str, shoe_description: str, angle: str) -> str:
    """Generate visualization of person wearing the recommended shoes using Gemini 2.5 Flash"""
    
    try:
        # Open and prepare the original image
        with Image.open(original_image_path) as img:
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize for processing
            max_size = 768
            if img.width > max_size or img.height > max_size:
                img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            # Save to temporary file
            temp_path = os.path.join(app.config['UPLOAD_FOLDER'], f"temp_viz_{uuid.uuid4().hex}.jpg")
            img.save(temp_path)
        
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
        response = gemini_flash.generate_content([uploaded_file, prompt])
        
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        # For now, create a placeholder image with the description
        # In production, you would use Gemini's image generation capabilities when available
        img = Image.new('RGB', (512, 768), color=(245, 245, 247))
        
        from PIL import ImageDraw, ImageFont
        draw = ImageDraw.Draw(img)
        
        # Try to use a default font
        try:
            # Try different font paths for different systems
            font_paths = [
                "/System/Library/Fonts/Helvetica.ttc",  # macOS
                "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",  # Linux
                "C:\\Windows\\Fonts\\Arial.ttf"  # Windows
            ]
            font = None
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
        if response.text:
            desc_lines = response.text[:200].split('\n')
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
        filepath = os.path.join(app.config['GENERATED_FOLDER'], filename)
        img.save(filepath, quality=95)
        
        return filepath
        
    except Exception as e:
        print(f"Error generating visualization: {str(e)}")
        # Create error placeholder
        img = Image.new('RGB', (512, 768), color=(200, 200, 200))
        from PIL import ImageDraw
        draw = ImageDraw.Draw(img)
        draw.text((256, 384), "Visualization Error", fill=(100, 100, 100), anchor="mm")
        filename = f"error_{uuid.uuid4().hex}.jpg"
        filepath = os.path.join(app.config['GENERATED_FOLDER'], filename)
        img.save(filepath)
        return filepath

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "FitCheck.AI Backend with Gemini is running!"})

@app.route('/upload', methods=['POST'])
def upload_image():
    """Handle image upload and return shoe recommendations using Gemini 2.5 Pro"""
    
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if file and allowed_file(file.filename):
        # Save the uploaded file
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # Get shoe recommendations using Gemini
        recommendations = analyze_outfit_and_recommend_shoes(filepath)
        
        # Store the image path for later use
        return jsonify({
            "success": True,
            "image_id": unique_filename,
            "recommendations": recommendations
        })
    
    return jsonify({"error": "Invalid file type"}), 400

@app.route('/generate-outfits', methods=['POST'])
def generate_outfits():
    """Generate outfit visualizations for recommended shoes using Gemini 2.5 Flash"""
    
    data = request.json
    image_id = data.get('image_id')
    shoes = data.get('shoes', [])
    
    if not image_id or not shoes:
        return jsonify({"error": "Missing image_id or shoes data"}), 400
    
    original_image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_id)
    
    if not os.path.exists(original_image_path):
        return jsonify({"error": "Original image not found"}), 404
    
    results = []
    angles = ['front', 'back', 'left', 'right']
    
    for shoe in shoes:
        shoe_desc = f"{shoe.get('brand', '')} {shoe.get('name', '')} in {shoe.get('color', '')}"
        shoe_visualizations = []
        
        for angle in angles:
            # Generate visualization for each angle using Gemini Flash
            generated_path = generate_outfit_visualization(original_image_path, shoe_desc, angle)
            
            # Convert to base64 for sending to frontend
            with open(generated_path, 'rb') as img_file:
                img_base64 = base64.b64encode(img_file.read()).decode('utf-8')
            
            shoe_visualizations.append({
                "angle": angle,
                "image": f"data:image/jpeg;base64,{img_base64}"
            })
        
        results.append({
            "shoe": shoe,
            "visualizations": shoe_visualizations
        })
    
    return jsonify({
        "success": True,
        "results": results
    })

@app.route('/test-gemini', methods=['GET'])
def test_gemini():
    """Test Gemini API connection"""
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content("Say 'Gemini API is working!' in exactly 5 words.")
        return jsonify({
            "success": True,
            "message": response.text,
            "model": "gemini-pro"
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=8080)