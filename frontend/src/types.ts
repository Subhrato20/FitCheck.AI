export interface ShoeRecommendation {
  name: string;
  brand: string;
  color: string;
  style: string;
  reason: string;
}

export interface Visualization {
  angle: string;
  image: string;
}

export interface OutfitResult {
  shoe: ShoeRecommendation;
  visualizations: Visualization[];
}

export interface ShoeVisualization {
  shoe: ShoeRecommendation;
  visualizations: Visualization[];
}

export interface UploadResponse {
  success: boolean;
  image_id: string;
  recommendations: ShoeRecommendation[];
}