import os
import base64
import uuid
import asyncio
import concurrent.futures
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

from config import Config
from utils import allowed_file
from services.gemini_service import GeminiService
from services.video_service import VideoService
from services.exa_service import ExaService

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=Config.CORS_ORIGINS)

# Initialize configuration
Config.init_app(app)

# Initialize services
gemini_service = GeminiService()
video_service = VideoService()
exa_service = ExaService()


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
        
        # Get shoe recommendations using Gemini service
        recommendations = gemini_service.analyze_outfit_and_recommend_shoes(filepath)
        
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
            # Generate visualization for each angle using Gemini service
            generated_path = gemini_service.generate_outfit_visualization(original_image_path, shoe_desc, angle)
            
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

def process_single_shoe(shoe, original_image_path, angles):
    """Process a single shoe and generate all angle visualizations"""
    shoe_desc = f"{shoe.get('brand', '')} {shoe.get('name', '')} in {shoe.get('color', '')}"
    shoe_visualizations = []
    
    for angle in angles:
        # Generate AI-powered visualization for each angle using Gemini Image Generation
        generated_path = gemini_service.generate_outfit_image_with_shoes(original_image_path, shoe_desc, angle)
        
        # Convert to base64 for sending to frontend
        with open(generated_path, 'rb') as img_file:
            img_base64 = base64.b64encode(img_file.read()).decode('utf-8')
        
        shoe_visualizations.append({
            "angle": angle,
            "image": f"data:image/jpeg;base64,{img_base64}"
        })
    
    return {
        "shoe": shoe,
        "visualizations": shoe_visualizations
    }

@app.route('/generate-outfits-ai', methods=['POST'])
def generate_outfits_ai():
    """Generate AI-powered outfit visualizations using Gemini 2.5 Flash Image Preview"""
    
    data = request.json
    image_id = data.get('image_id')
    shoes = data.get('shoes', [])
    
    if not image_id or not shoes:
        return jsonify({"error": "Missing image_id or shoes data"}), 400
    
    original_image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_id)
    
    if not os.path.exists(original_image_path):
        return jsonify({"error": "Original image not found"}), 404
    
    angles = ['front', 'back', 'left', 'right']
    
    # Process shoes in parallel for better performance
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        # Submit all shoe processing tasks
        future_to_shoe = {
            executor.submit(process_single_shoe, shoe, original_image_path, angles): shoe 
            for shoe in shoes
        }
        
        results = []
        for future in concurrent.futures.as_completed(future_to_shoe):
            try:
                result = future.result()
                results.append(result)
            except Exception as e:
                print(f"Error processing shoe: {str(e)}")
                # Add error result for this shoe
                shoe = future_to_shoe[future]
                results.append({
                    "shoe": shoe,
                    "visualizations": [],
                    "error": str(e)
                })
    
    return jsonify({
        "success": True,
        "results": results
    })

@app.route('/generate-videos', methods=['POST'])
def generate_videos():
    """Generate videos for front angle images of recommended shoes"""
    
    data = request.json
    image_id = data.get('image_id')
    shoes = data.get('shoes', [])
    
    if not image_id or not shoes:
        return jsonify({"error": "Missing image_id or shoes data"}), 400
    
    original_image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_id)
    
    if not os.path.exists(original_image_path):
        return jsonify({"error": "Original image not found"}), 404
    
    try:
        # Generate front angle images for all shoes first using AI image generation
        front_angle_images = []
        for i, shoe in enumerate(shoes):
            shoe_desc = f"{shoe.get('brand', '')} {shoe.get('name', '')} in {shoe.get('color', '')}"
            print(f"Generating front angle image for shoe {i+1}: {shoe_desc}")
            front_image_path = gemini_service.generate_outfit_image_with_shoes(original_image_path, shoe_desc, 'front')
            print(f"Generated image path: {front_image_path}")
            
            # Verify the generated image exists and is valid
            if front_image_path and os.path.exists(front_image_path):
                file_size = os.path.getsize(front_image_path)
                print(f"Image file size: {file_size} bytes")
                front_angle_images.append(front_image_path)
            else:
                print(f"Warning: Generated image not found or invalid: {front_image_path}")
                # Use original image as fallback
                front_angle_images.append(original_image_path)
        
        # Generate videos asynchronously
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            results = loop.run_until_complete(
                video_service.generate_videos_for_all_shoes(original_image_path, shoes, front_angle_images)
            )
        finally:
            loop.close()
        
        # Convert results to JSON-serializable format
        json_results = []
        for result in results:
            json_results.append({
                "shoe": result.shoe,
                "videos": [
                    {
                        "angle": video.angle,
                        "video_url": video.video_url,
                        "status": video.status
                    }
                    for video in result.videos
                ]
            })
        
        return jsonify({
            "success": True,
            "results": json_results
        })
        
    except Exception as e:
        print(f"Error in video generation: {str(e)}")
        return jsonify({"error": f"Video generation failed: {str(e)}"}), 500

@app.route('/search-products', methods=['POST'])
def search_products():
    """Search for products using Firecrawl based on shoe recommendations"""
    
    data = request.json
    shoes = data.get('shoes', [])
    outfit_description = data.get('outfit_description', '')
    
    if not shoes:
        return jsonify({"error": "No shoes provided for search"}), 400
    
    try:
        # Search for products using Exa
        search_results = exa_service.search_shoes_for_outfit(outfit_description, shoes)
        
        # Group results by shoe recommendation
        grouped_results = {}
        for result in search_results:
            shoe_info = result.get('shoe_info', {})
            shoe_key = f"{shoe_info.get('brand', '')} {shoe_info.get('name', '')}"
            
            if shoe_key not in grouped_results:
                grouped_results[shoe_key] = {
                    'shoe': shoe_info,
                    'search_results': []
                }
            
            grouped_results[shoe_key]['search_results'].append({
                'url': result.get('url', ''),
                'title': result.get('title', ''),
                'description': result.get('description', ''),
                'source': result.get('source', ''),
                'search_query': result.get('search_query', '')
            })
        
        # Convert to list format
        results = []
        for shoe_key, data in grouped_results.items():
            results.append({
                'shoe': data['shoe'],
                'search_results': data['search_results'][:2]  # Limit to 2 results per shoe
            })
        
        return jsonify({
            "success": True,
            "results": results
        })
        
    except Exception as e:
        print(f"Error in product search: {str(e)}")
        return jsonify({"error": f"Product search failed: {str(e)}"}), 500

@app.route('/test-gemini', methods=['GET'])
def test_gemini():
    """Test Gemini API connection"""
    result = gemini_service.test_connection()
    
    if result["success"]:
        return jsonify(result)
    else:
        return jsonify(result), 500

@app.route('/test-exa', methods=['GET'])
def test_exa():
    """Test Exa API connection"""
    result = exa_service.test_connection()
    
    if result["success"]:
        return jsonify(result)
    else:
        return jsonify(result), 500

if __name__ == '__main__':
    app.run(debug=True, port=8080)