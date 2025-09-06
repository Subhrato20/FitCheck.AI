import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

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

export interface ProductSearchResult {
  url: string;
  title: string;
  description: string;
  source: string;
  search_query: string;
}

export interface ProductSearchResponse {
  shoe: ShoeRecommendation;
  search_results: ProductSearchResult[];
}

export const uploadImage = async (file: File): Promise<{ image_id: string; recommendations: ShoeRecommendation[] }> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/upload', formData);
  return response.data;
};

export const generateOutfits = async (imageId: string, shoes: ShoeRecommendation[]): Promise<OutfitResult[]> => {
  const response = await axios.post(`${API_BASE_URL}/generate-outfits`, {
    image_id: imageId,
    shoes: shoes,
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data.results;
};

export const generateOutfitsAI = async (imageId: string, shoes: ShoeRecommendation[]): Promise<OutfitResult[]> => {
  const response = await axios.post(`${API_BASE_URL}/generate-outfits-ai`, {
    image_id: imageId,
    shoes: shoes,
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data.results;
};

export const generateVideos = async (imageId: string, shoes: ShoeRecommendation[]): Promise<any[]> => {
  const response = await axios.post(`${API_BASE_URL}/generate-videos`, {
    image_id: imageId,
    shoes: shoes,
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data.results;
};

export const searchProducts = async (shoes: ShoeRecommendation[], outfitDescription: string = ''): Promise<ProductSearchResponse[]> => {
  const response = await axios.post(`${API_BASE_URL}/search-products`, {
    shoes: shoes,
    outfit_description: outfitDescription,
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return response.data.results;
};

export const healthCheck = async (): Promise<boolean> => {
  try {
    await axios.get(`${API_BASE_URL}/health`);
    return true;
  } catch {
    return false;
  }
};