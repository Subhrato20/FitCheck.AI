
import fal_client
import base64
import mimetypes
from urllib.request import urlretrieve
import os
import pathlib
from glob import glob
import time
from config import Config

# Configuration
UPLOAD_FOLDER = "backend/uploads"
OUTPUT_FOLDER = "backend/generated_videos"
SHOE_NAME = "White Nike AirForce One"

# Create output directory if it doesn't exist
pathlib.Path(OUTPUT_FOLDER).mkdir(parents=True, exist_ok=True)

# Configure FAL client with API key from environment
if Config.FAL_KEY:
    fal_client.api_key = Config.FAL_KEY
else:
    print("Warning: FAL_KEY not found in environment variables. Video generation may fail.")

def process_image(image_path, output_filename, shoe_name):
    """Process a single image and generate a video"""
    print(f"\nProcessing image: {os.path.basename(image_path)}")
    
    try:
        # Read and encode the image
        mime = mimetypes.guess_type(image_path)[0] or "image/png"
        with open(image_path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("utf-8")
        data_uri = f"data:{mime};base64,{b64}"

        # Generate the video with the original prompt
        print(f"Generating video for {os.path.basename(image_path)}...")
        result = fal_client.run(
            "fal-ai/veo3/fast/image-to-video",
            arguments={
                "prompt": f"A cinematic video of a person doing a casual fit check in front of a mirror. The camera smoothly rotates to capture front, back, left, and right views. The environment is bright, well-lit, and stylish. The focus is primarily on the sneakers: close-up shots, slow pans, zooms, and dramatic angles highlight how the sneakers pair with the outfit. Do not change anything about the shoe — its design, color, and details must remain exactly the same. They are wearing {shoe_name}. The rest of the clothing remains secondary, slightly blurred or framed to keep attention on the sneakers. Natural gestures, like adjusting pants or shifting weight, emphasize the sneakers as the centerpiece of the drip.",
                "image_url": data_uri,
                "duration": "8s",
                "generate_audio": False,
                "resolution": "720p",
            }
        )

        # Save the video
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)
        print(f"Saving video to: {output_path}")
        urlretrieve(result["video"]["url"], output_path)
        return True
        
    except Exception as e:
        print(f"Error processing {image_path}: {str(e)}")
        return False

def main():
    # Get image files from the uploads folder
    image_patterns = ["*.jpg", "*.jpeg", "*.png", "*.gif", "*.webp"]
    image_files = []
    
    for pattern in image_patterns:
        image_files.extend(glob(os.path.join(UPLOAD_FOLDER, pattern)))
        if len(image_files) >= 4:  # Limit to 4 images
            image_files = image_files[:4]
            break
    
    if not image_files:
        print("No image files found in the uploads folder!")
        return
    
    print(f"Found {len(image_files)} images to process")
    
    # Process each image
    for i, image_path in enumerate(image_files, 1):
        timestamp = int(time.time())
        output_filename = f"fitcheck_{i}_{timestamp}.mp4"
        
        print(f"\n{'='*50}")
        print(f"Processing image {i}/{len(image_files)}: {os.path.basename(image_path)}")
        print(f"Output will be saved as: {output_filename}")
        print(f"{'='*50}")
        
        success = process_image(image_path, output_filename, SHOE_NAME)
        if success:
            print(f"✓ Successfully processed {os.path.basename(image_path)}")
        else:
            print(f"✗ Failed to process {os.path.basename(image_path)}")
        
        # Add a small delay between processing images
        if i < len(image_files):
            print("\nWaiting a moment before next image...")
            time.sleep(2)
    
    print("\nAll done! Check the generated_videos folder for your videos.")

if __name__ == "__main__":
    main()
