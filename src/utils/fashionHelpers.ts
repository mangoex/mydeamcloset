import { ClothingCategory, Season, WeatherCondition, Occasion } from '../types/wardrobe';

export interface SeasonInfo {
  id: Season;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  accentColor: string;
}

export const SEASONS_LIST: SeasonInfo[] = [
  {
    id: 'primavera',
    label: 'Primavera',
    shortLabel: 'Primavera',
    icon: '🌸',
    description: 'Temperaturas templadas, brisa suave y tonos frescos',
    accentColor: '#10b981',
  },
  {
    id: 'verano',
    label: 'Verano',
    shortLabel: 'Verano',
    icon: '☀️',
    description: 'Calor, telas ligeras, lino y transpirabilidad',
    accentColor: '#f59e0b',
  },
  {
    id: 'otono',
    label: 'Otoño',
    shortLabel: 'Otoño',
    icon: '🍂',
    description: 'Capas ligeras, entretiempo y tonos tierra',
    accentColor: '#d97706',
  },
  {
    id: 'invierno',
    label: 'Invierno',
    shortLabel: 'Invierno',
    icon: '❄️',
    description: 'Bajas temperaturas, abrigos estructurados y punto cálido',
    accentColor: '#3b82f6',
  },
];

export interface WeatherInfo {
  id: WeatherCondition;
  label: string;
  shortLabel: string;
  icon: string;
  tempGuide: string;
}

export const WEATHER_CONDITIONS: WeatherInfo[] = [
  {
    id: 'calor_extremo',
    label: 'Calor Extremo (>30°C)',
    shortLabel: 'Calor >30°C',
    icon: '🔥',
    tempGuide: '30°C a 38°C',
  },
  {
    id: 'calor',
    label: 'Soleado y Cálido (22-29°C)',
    shortLabel: 'Cálido 22-29°C',
    icon: '☀️',
    tempGuide: '22°C a 29°C',
  },
  {
    id: 'templado',
    label: 'Templado / Agradable (16-21°C)',
    shortLabel: 'Templado 16-21°C',
    icon: '⛅',
    tempGuide: '16°C a 21°C',
  },
  {
    id: 'frio_moderado',
    label: 'Fresco / Frío Moderado (10-15°C)',
    shortLabel: 'Frío 10-15°C',
    icon: '🧣',
    tempGuide: '10°C a 15°C',
  },
  {
    id: 'frio_extremo',
    label: 'Frío Intenso (<10°C)',
    shortLabel: 'Frío <10°C',
    icon: '❄️',
    tempGuide: '0°C a 9°C',
  },
  {
    id: 'lluvia',
    label: 'Día Lluvioso / Húmedo',
    shortLabel: 'Lluvia',
    icon: '🌧️',
    tempGuide: 'Precipitación',
  },
  {
    id: 'viento',
    label: 'Ventoso / Cortavientos',
    shortLabel: 'Viento',
    icon: '💨',
    tempGuide: 'Brisa fuerte',
  },
];

export const CATEGORIES_LIST: { id: ClothingCategory; label: string; icon: string }[] = [
  { id: 'top', label: 'Partes Superiores', icon: '👕' },
  { id: 'bottom', label: 'Pantalones & Faldas', icon: '👖' },
  { id: 'outerwear', label: 'Abrigos & Chaquetas', icon: '🧥' },
  { id: 'footwear', label: 'Calzado', icon: '👟' },
  { id: 'one_piece', label: 'Vestidos & Enterizos', icon: '👗' },
  { id: 'accessory', label: 'Accesorios', icon: '🕶️' },
];

export const OCCASIONS_LIST: { id: Occasion; label: string; icon: string }[] = [
  { id: 'casual', label: 'Casual Diario', icon: '☕' },
  { id: 'oficina', label: 'Oficina / Trabajo', icon: '💼' },
  { id: 'cita', label: 'Cita / Cena Romántica', icon: '🥂' },
  { id: 'noche', label: 'Salida Nocturna / Fiesta', icon: '✨' },
  { id: 'formal', label: 'Evento Formal / Gala', icon: '🎩' },
  { id: 'viaje', label: 'Viaje / Paseo', icon: '✈️' },
  { id: 'deporte', label: 'Deportivo / Relajado', icon: '🏃' },
];

export function getWarmthLabel(warmth: number): { text: string; colorClass: string } {
  switch (warmth) {
    case 1:
      return { text: 'Muy fresco (Ultra ligero)', colorClass: 'text-amber-700 bg-amber-50' };
    case 2:
      return { text: 'Ligero (Primavera/Verano)', colorClass: 'text-emerald-700 bg-emerald-50' };
    case 3:
      return { text: 'Medio (Entretiempo)', colorClass: 'text-sky-700 bg-sky-50' };
    case 4:
      return { text: 'Abrigador (Otoño/Invierno)', colorClass: 'text-indigo-700 bg-indigo-50' };
    case 5:
      return { text: 'Térmico / Pesado (Frío extremo)', colorClass: 'text-blue-900 bg-blue-100' };
    default:
      return { text: 'Estándar', colorClass: 'text-stone-700 bg-stone-100' };
  }
}
