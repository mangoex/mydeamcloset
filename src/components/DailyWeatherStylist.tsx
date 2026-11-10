import React, { useState } from 'react';
import { ClothingItem, Season, WeatherCondition, Outfit } from '../types/wardrobe';
import { WEATHER_CONDITIONS, SEASONS_LIST } from '../utils/fashionHelpers';
import { CloudSun, Sparkles, RefreshCw, Wand2, Thermometer, Wind, Umbrella, Check } from 'lucide-react';

interface DailyWeatherStylistProps {
  wardrobe: ClothingItem[];
  onSaveOutfit: (outfit: Outfit) => void;
  onOpenUpload: () => void;
}

export const DailyWeatherStylist: React.FC<DailyWeatherStylistProps> = ({
  wardrobe,
  onSaveOutfit,
  onOpenUpload,
}) => {
  // Simulated today's weather controls
  const [temperature, setTemperature] = useState<number>(18);
  const [currentSeason, setCurrentSeason] = useState<Season>('primavera');
  const [isRaining, setIsRaining] = useState<boolean>(false);
  const [isWindy, setIsWindy] = useState<boolean>(false);

  // Daily outfit result
  const [dailyOutfit, setDailyOutfit] = useState<Outfit | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Map temperature and conditions to weather enum
  const getWeatherCondition = (temp: number, rain: boolean, wind: boolean): WeatherCondition => {
    if (rain) return 'lluvia';
    if (wind) return 'viento';
    if (temp >= 30) return 'calor_extremo';
    if (temp >= 22) return 'calor';
    if (temp >= 16) return 'templado';
    if (temp >= 10) return 'frio_moderado';
    return 'frio_extremo';
  };

  const weatherEnum = getWeatherCondition(temperature, isRaining, isWindy);
  const weatherMeta = WEATHER_CONDITIONS.find((w) => w.id === weatherEnum);

  const handleGenerateTodayLook = async () => {
    if (wardrobe.length < 2) return;
    setIsLoading(true);
    setIsSaved(false);

    try {
      const sanitizedItems = wardrobe.map((it) => ({
        id: it.id,
        name: it.name,
        category: it.category,
        subCategory: it.subCategory,
        colors: it.colors,
        warmth: it.warmth,
        seasons: it.seasons,
        weather: it.weather,
        vibes: it.vibes,
        material: it.material,
      }));

      const res = await fetch('/api/generate-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: sanitizedItems,
          season: currentSeason,
          weather: weatherEnum,
          occasion: 'casual',
          stylePreference: 'Look diario cómodo, favorecedor y práctico',
        }),
      });

      let data: any = {};
      if (res.ok) {
        data = await res.json();
      }

      const selectedIds = (data.itemIds && data.itemIds.length >= 2)
        ? data.itemIds
        : wardrobe.slice(0, Math.min(3, wardrobe.length)).map((w) => w.id);

      const outfit: Outfit = {
        id: 'daily-' + Date.now(),
        title: data.title || `Look del Día · ${temperature}°C`,
        itemIds: selectedIds,
        season: currentSeason,
        weather: weatherEnum,
        occasion: 'casual',
        harmonyScore: data.harmonyScore || 95,
        temperatureSuitability:
          data.temperatureSuitability || `Perfecto para una jornada de ${temperature}°C.`,
        styleExplanation: data.styleExplanation || 'Combinación práctica para salir con estilo hoy.',
        stylingTips: data.stylingTips || [
          'Prenda exterior accesible por si cambia el clima.',
          'Zapatos cómodos para la jornada.',
        ],
        layeringAdvice: data.layeringAdvice,
        savedAt: Date.now(),
      };

      setDailyOutfit(outfit);
    } catch (err) {
      console.warn('Notice generating daily outfit, using fallback combination:', err);
      // Fallback outfit selection directly from wardrobe
      const fallbackIds = wardrobe.slice(0, Math.min(3, wardrobe.length)).map((w) => w.id);
      setDailyOutfit({
        id: 'daily-' + Date.now(),
        title: `Look del Día · ${temperature}°C`,
        itemIds: fallbackIds,
        season: currentSeason,
        weather: weatherEnum,
        occasion: 'casual',
        harmonyScore: 92,
        temperatureSuitability: `Selección adaptada para ${temperature}°C`,
        styleExplanation: 'Combinación balanceada con prendas de tu armario.',
        stylingTips: ['Lleva prendas en capas para mayor confort térmico.'],
        savedAt: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dailyItems = dailyOutfit
    ? dailyOutfit.itemIds
        .map((id) => wardrobe.find((w) => w.id === id))
        .filter((w): w is ClothingItem => Boolean(w))
    : [];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
          ¿Qué me pongo hoy?
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Ajusta la temperatura y el pronóstico de hoy. La IA revisará tu armario y elegirá el look óptimo en segundos sin que tengas que pensarlo.
        </p>
      </div>

      {/* Weather Station Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 text-2xl border border-amber-100">
              {weatherMeta?.icon || '⛅'}
            </div>
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-stone-400">
                Pronóstico del Día
              </div>
              <div className="text-2xl font-serif font-bold text-stone-900">
                {temperature}°C · {weatherMeta?.shortLabel}
              </div>
              <p className="text-xs text-stone-500">
                {temperature < 15
                  ? 'Ambiente fresco: se recomienda abrigo o suéter en capas.'
                  : temperature > 25
                  ? 'Ambiente cálido: se recomiendan prendas transpirables y ligeras.'
                  : 'Temperatura templada: ideal para sobrecamisa, denim o chaqueta fina.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerateTodayLook}
            disabled={isLoading || wardrobe.length < 2}
            className="px-6 py-3 bg-stone-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-stone-800 transition-colors flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-stone-300" />
                <span>Revisando tu armario...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Recomiéndame el look de hoy</span>
              </>
            )}
          </button>
        </div>

        {/* Temperature slider & conditions toggles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Temperature Slider */}
          <div className="space-y-2 md:col-span-2 bg-stone-50 p-4 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-stone-500" />
                Ajustar Temperatura Actual:
              </span>
              <span className="text-sm font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200">
                {temperature}°C
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="38"
              value={temperature}
              onChange={(e) => setTemperature(parseInt(e.target.value))}
              className="w-full accent-stone-900 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400 font-mono">
              <span>5°C (Frío invernal)</span>
              <span>18°C (Templado)</span>
              <span>32°C (Calor intenso)</span>
            </div>
          </div>

          {/* Quick weather factors */}
          <div className="space-y-2.5">
            <span className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
              Condición Atmosférica:
            </span>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsRaining(!isRaining)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center justify-between cursor-pointer transition-colors ${
                  isRaining
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Umbrella className="w-3.5 h-3.5" />
                  <span>¿Está lloviendo?</span>
                </span>
                <span className="text-[10px]">{isRaining ? 'Sí' : 'No'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsWindy(!isWindy)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border flex items-center justify-between cursor-pointer transition-colors ${
                  isWindy
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Wind className="w-3.5 h-3.5" />
                  <span>¿Hay viento fuerte?</span>
                </span>
                <span className="text-[10px]">{isWindy ? 'Sí' : 'No'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Outfit Result Card */}
      {dailyOutfit && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
            <div>
              <div className="text-xs font-mono uppercase text-stone-400 mb-1">
                Tu recomendación personalizada para hoy
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                {dailyOutfit.title}
              </h2>
            </div>

            <button
              onClick={() => {
                onSaveOutfit(dailyOutfit);
                setIsSaved(true);
              }}
              disabled={isSaved}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                isSaved
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-stone-900 text-white hover:bg-stone-800'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Guardado en Mis Looks</span>
                </>
              ) : (
                <span>Guardar este outfit</span>
              )}
            </button>
          </div>

          {/* Items Collage */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {dailyItems.map((item) => (
              <div
                key={item.id}
                className="bg-stone-50 rounded-xl border border-stone-200 overflow-hidden"
              >
                <div className="aspect-square w-full bg-white flex items-center justify-center p-2 border-b border-stone-100">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-semibold text-stone-900 truncate">{item.name}</h4>
                  <p className="text-[11px] text-stone-500 truncate">
                    {item.subCategory} · Calidez {item.warmth}/5
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Explanation */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
            <span className="font-semibold text-stone-800 uppercase tracking-wider block">
              Por qué te recomendamos esto para hoy:
            </span>
            <p className="text-stone-600 leading-relaxed">{dailyOutfit.styleExplanation}</p>
            {dailyOutfit.stylingTips && (
              <div className="pt-2 text-stone-500">
                <span className="font-medium text-stone-700">Tip rápido: </span>
                {dailyOutfit.stylingTips[0]}
              </div>
            )}
          </div>
        </div>
      )}

      {wardrobe.length < 2 && (
        <div className="text-center py-6 bg-white p-6 rounded-xl border border-stone-200">
          <p className="text-xs text-stone-500 mb-3">
            {wardrobe.length === 0
              ? 'Aún no has subido fotos de ropa. Sube fotos de tus prendas para que la IA cree tu outfit de hoy.'
              : 'Tienes 1 prenda en tu armario. Sube al menos otra foto de ropa para que la IA pueda armar una combinación completa.'}
          </p>
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Subir fotos de ropa
          </button>
        </div>
      )}
    </div>
  );
};
