export interface ShoeRecommendation {
  name: string;
  brand: string;
  color: string;
  style: string;
  reason: string;
}

export interface UploadResponse {
  success: boolean;
  image_id: string;
  recommendations: ShoeRecommendation[];
}

export interface Visualization {
  angle: string;
  image: string; // base64 encoded image
}

export interface ShoeVisualization {
  shoe: ShoeRecommendation;
  visualizations: Visualization[];
}

export interface GenerateOutfitsResponse {
  success: boolean;
  results: ShoeVisualization[];
}

export interface ApiError {
  error: string;
}

export interface VideoGeneration {
  angle: string;
  video_url: string;
  status: string;
}

export interface ShoeVideoGeneration {
  shoe: ShoeRecommendation;
  videos: VideoGeneration[];
}

export interface GenerateVideosResponse {
  success: boolean;
  results: ShoeVideoGeneration[];
}
