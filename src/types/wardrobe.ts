export type ClothingCategory =
  | 'top'
  | 'bottom'
  | 'outerwear'
  | 'footwear'
  | 'accessory'
  | 'one_piece';

export type Season = 'primavera' | 'verano' | 'otono' | 'invierno';

export type WeatherCondition =
  | 'calor_extremo' // 30°C+
  | 'calor'         // 22-29°C
  | 'templado'      // 16-21°C
  | 'frio_moderado' // 10-15°C
  | 'frio_extremo'  // <10°C
  | 'lluvia'        // Lluvia / Impermeable
  | 'viento';       // Ventoso

export type Occasion =
  | 'casual'
  | 'oficina'
  | 'noche'
  | 'formal'
  | 'deporte'
  | 'viaje'
  | 'cita';

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  subCategory: string;
  imageUrl: string;
  colors: string[];
  colorHex?: string;
  material?: string;
  warmth: number; // 1 to 5
  seasons: Season[];
  weather: WeatherCondition[];
  vibes: string[];
  stylingAdvice?: string;
  notes?: string;
  isCustomUpload?: boolean;
  createdAt: number;
}

export interface Outfit {
  id: string;
  title: string;
  itemIds: string[];
  season: Season;
  weather: WeatherCondition;
  occasion: Occasion;
  stylePreference?: string;
  harmonyScore: number;
  temperatureSuitability: string;
  styleExplanation: string;
  stylingTips: string[];
  layeringAdvice?: string;
  savedAt: number;
}
