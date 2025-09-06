import os
import base64
import mimetypes
import asyncio
import uuid
import time
from urllib.request import urlretrieve
from typing import List, Dict, Any
import fal_client
from config import Config
from models import VideoGeneration, ShoeVideoGeneration

class VideoService:
    """Service class for video generation using FAL AI"""
    
    def __init__(self):
        """Initialize video service"""
        if Config.FAL_KEY:
            fal_client.api_key = Config.FAL_KEY
        else:
            raise ValueError("FAL_KEY not found in environment variables")
        
        # Create video output directory
        self.output_folder = "backend/generated_videos"
        os.makedirs(self.output_folder, exist_ok=True)
    
    async def generate_video_for_image(self, image_path: str, shoe_name: str, angle: str) -> str:
        """Generate a video for a specific image and shoe"""
        try:
            # Verify the image file exists and is readable
            if not os.path.exists(image_path):
                raise FileNotFoundError(f"Image file not found: {image_path}")
            
            # Check file size to ensure it's not empty
            file_size = os.path.getsize(image_path)
            if file_size == 0:
                raise ValueError(f"Image file is empty: {image_path}")
            
            print(f"Processing image: {image_path} (size: {file_size} bytes)")
            
            # Read and encode the image
            mime = mimetypes.guess_type(image_path)[0] or "image/png"
            with open(image_path, "rb") as f:
                image_data = f.read()
                b64 = base64.b64encode(image_data).decode("utf-8")
            data_uri = f"data:{mime};base64,{b64}"
            
            print(f"Image encoded successfully, data URI length: {len(data_uri)}")

            # Create unique filename
            timestamp = int(time.time())
            unique_id = str(uuid.uuid4())[:8]
            output_filename = f"fitcheck_{angle}_{unique_id}_{timestamp}.mp4"
            output_path = os.path.join(self.output_folder, output_filename)

            # Generate the video
            print(f"Generating video for {angle} angle with {shoe_name}...")
            
            # Run the FAL client call in a thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,
                lambda: fal_client.run(
                    "fal-ai/veo3/fast/image-to-video",
                    arguments={
                        "prompt": f"A cinematic video of a person doing a casual fit check in front of a mirror. The camera smoothly rotates to capture front, back, left, and right views. The environment is bright, well-lit, and stylish. The focus is primarily on the sneakers: close-up shots, slow pans, zooms, and dramatic angles highlight how the sneakers pair with the outfit. Do not change anything about the shoe — its design, color, and details must remain exactly the same. They are wearing {shoe_name}. The rest of the clothing remains secondary, slightly blurred or framed to keep attention on the sneakers. Natural gestures, like adjusting pants or shifting weight, emphasize the sneakers as the centerpiece of the drip.",
                        "image_url": data_uri,
                        "duration": "8s",
                        "generate_audio": False,
                        "resolution": "720p",
                    }
                )
            )

            # Save the video
            print(f"Saving video to: {output_path}")
            await loop.run_in_executor(
                None,
                lambda: urlretrieve(result["video"]["url"], output_path)
            )
            
            return output_path
            
        except Exception as e:
            print(f"Error generating video for {angle}: {str(e)}")
            raise e
    
    async def generate_videos_for_shoe(self, original_image_path: str, shoe: Dict[str, str], front_angle_image_path: str) -> ShoeVideoGeneration:
        """Generate videos for a single shoe using the front angle image"""
        shoe_name = f"{shoe.get('brand', '')} {shoe.get('name', '')} in {shoe.get('color', '')}"
        videos = []
        
        try:
            # Generate video for the front angle image
            video_path = await self.generate_video_for_image(front_angle_image_path, shoe_name, "front")
            
            # Convert video to base64 for serving
            with open(video_path, 'rb') as video_file:
                video_base64 = base64.b64encode(video_file.read()).decode('utf-8')
            
            videos.append(VideoGeneration(
                angle="front",
                video_url=f"data:video/mp4;base64,{video_base64}",
                status="completed"
            ))
            
        except Exception as e:
            print(f"Error generating video for shoe {shoe_name}: {str(e)}")
            videos.append(VideoGeneration(
                angle="front",
                video_url="",
                status="failed"
            ))
        
        return ShoeVideoGeneration(
            shoe=shoe,
            videos=videos
        )
    
    async def generate_videos_for_all_shoes(self, original_image_path: str, shoes: List[Dict[str, str]], front_angle_images: List[str]) -> List[ShoeVideoGeneration]:
        """Generate videos for all shoes asynchronously"""
        tasks = []
        
        for i, shoe in enumerate(shoes):
            if i < len(front_angle_images):
                task = self.generate_videos_for_shoe(original_image_path, shoe, front_angle_images[i])
                tasks.append(task)
        
        # Execute all video generation tasks concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results and handle exceptions
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"Error processing shoe {i}: {str(result)}")
                processed_results.append(ShoeVideoGeneration(
                    shoe=shoes[i] if i < len(shoes) else {},
                    videos=[VideoGeneration(angle="front", video_url="", status="failed")]
                ))
            else:
                processed_results.append(result)
        
        return processed_results
