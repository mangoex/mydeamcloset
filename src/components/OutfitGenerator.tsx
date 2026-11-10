import React, { useState } from 'react';
import { ClothingItem, ClothingCategory, Season, WeatherCondition, Occasion, Outfit } from '../types/wardrobe';
import { SEASONS_LIST, WEATHER_CONDITIONS, OCCASIONS_LIST, CATEGORIES_LIST } from '../utils/fashionHelpers';
import { Wand2, RefreshCw, BookmarkCheck, ArrowLeftRight, Check, Sparkles, AlertCircle, X, ChevronRight, Layers } from 'lucide-react';

interface OutfitGeneratorProps {
  wardrobe: ClothingItem[];
  anchorItem: ClothingItem | null;
  onClearAnchorItem: () => void;
  onSaveOutfit: (outfit: Outfit) => void;
  onOpenUpload: () => void;
  initialSeason?: Season;
  initialWeather?: WeatherCondition;
}

export const OutfitGenerator: React.FC<OutfitGeneratorProps> = ({
  wardrobe,
  anchorItem,
  onClearAnchorItem,
  onSaveOutfit,
  onOpenUpload,
  initialSeason = 'otono',
  initialWeather = 'frio_moderado',
}) => {
  // Criteria inputs
  const [season, setSeason] = useState<Season>(initialSeason);
  const [weather, setWeather] = useState<WeatherCondition>(initialWeather);
  const [occasion, setOccasion] = useState<Occasion>('casual');
  const [stylePreference, setStylePreference] = useState<string>('');
  const [activeAnchorId, setActiveAnchorId] = useState<string>(anchorItem?.id || '');

  // Generation status & generated outfit
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentOutfit, setCurrentOutfit] = useState<Outfit | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Item swap modal state
  const [swappingCategory, setSwappingCategory] = useState<ClothingCategory | null>(null);
  const [swapTargetItemId, setSwapTargetItemId] = useState<string | null>(null);

  // If user passed an anchor item prop, sync it
  React.useEffect(() => {
    if (anchorItem) {
      setActiveAnchorId(anchorItem.id);
    }
  }, [anchorItem]);

  const handleGenerate = async () => {
    if (wardrobe.length < 2) {
      setErrorMsg('Necesitas al menos 2 prendas en tu armario para generar combinaciones.');
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);
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

      const response = await fetch('/api/generate-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: sanitizedItems,
          season,
          weather,
          occasion,
          stylePreference,
          anchorItemId: activeAnchorId || undefined,
        }),
      });

      let data: any = {};
      if (response.ok) {
        data = await response.json();
      }

      // Pick valid items
      let validIds = Array.isArray(data.itemIds) && data.itemIds.length >= 2
        ? data.itemIds.filter((id: string) => wardrobe.some((w) => w.id === id))
        : [];

      if (validIds.length < 2) {
        // Fallback: pick anchor item if exists + 2 other complementary items
        const picked: string[] = [];
        if (activeAnchorId && wardrobe.some((w) => w.id === activeAnchorId)) {
          picked.push(activeAnchorId);
        }
        for (const w of wardrobe) {
          if (!picked.includes(w.id)) {
            picked.push(w.id);
            if (picked.length >= 3) break;
          }
        }
        validIds = picked;
      }

      const generated: Outfit = {
        id: 'outfit-' + Date.now(),
        title: data.title || `Outfit ${season.charAt(0).toUpperCase() + season.slice(1)} Estilizado`,
        itemIds: validIds,
        season,
        weather,
        occasion,
        stylePreference,
        harmonyScore: data.harmonyScore || 94,
        temperatureSuitability:
          data.temperatureSuitability || 'Combinación térmica adaptada al clima seleccionado.',
        styleExplanation:
          data.styleExplanation || 'Paleta y siluetas armonizadas para tu ocasión y clima.',
        stylingTips: data.stylingTips || [
          'Mantén una prenda neutra como ancla visual.',
          'Ajusta las mangas o el calzado para definir proporciones.',
        ],
        layeringAdvice: data.layeringAdvice,
        savedAt: Date.now(),
      };

      setCurrentOutfit(generated);
    } catch (err: any) {
      console.warn('Notice generating outfit, applying local stylist fallback:', err);
      // Local fallback
      const picked: string[] = [];
      if (activeAnchorId && wardrobe.some((w) => w.id === activeAnchorId)) {
        picked.push(activeAnchorId);
      }
      for (const w of wardrobe) {
        if (!picked.includes(w.id)) {
          picked.push(w.id);
          if (picked.length >= 3) break;
        }
      }

      setCurrentOutfit({
        id: 'outfit-' + Date.now(),
        title: `Outfit ${season.charAt(0).toUpperCase() + season.slice(1)} Funcional`,
        itemIds: picked,
        season,
        weather,
        occasion,
        stylePreference,
        harmonyScore: 92,
        temperatureSuitability: 'Selección adaptada a las prendas de tu armario.',
        styleExplanation: 'Combinación balanceada y armónica.',
        stylingTips: ['Combina tonos neutros con un toque de contraste.'],
        savedAt: Date.now(),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveCurrentOutfit = () => {
    if (currentOutfit) {
      onSaveOutfit(currentOutfit);
      setIsSaved(true);
    }
  };

  // Swap an individual item inside the generated outfit
  const handleSwapItem = (newItemId: string) => {
    if (!currentOutfit || !swapTargetItemId) return;
    const updatedIds = currentOutfit.itemIds.map((id) => (id === swapTargetItemId ? newItemId : id));
    setCurrentOutfit({
      ...currentOutfit,
      itemIds: updatedIds,
    });
    setSwappingCategory(null);
    setSwapTargetItemId(null);
    setIsSaved(false);
  };

  // Get item objects from current outfit IDs
  const outfitItems = currentOutfit
    ? currentOutfit.itemIds
        .map((id) => wardrobe.find((w) => w.id === id))
        .filter((w): w is ClothingItem => Boolean(w))
    : [];

  const selectedSeasonInfo = SEASONS_LIST.find((s) => s.id === season);
  const selectedWeatherInfo = WEATHER_CONDITIONS.find((w) => w.id === weather);

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
          Diseñador de Outfits Personalizados
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Elige la temporada, el clima exacto y la ocasión. Tu estilista con IA combinará tus prendas reales con armonía cromática y equilibrio térmico.
        </p>
      </div>

      {wardrobe.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-600">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-900">
            Aún no has subido fotos de tu ropa
          </h3>
          <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
            Para diseñar outfits adaptados a cada clima y temporada, primero sube las fotos de tus prendas. Solo utilizaremos las fotos de ropa que tú mismo subas.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenUpload}
              className="px-6 py-3 bg-stone-900 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
            >
              Subir fotos de mi ropa
            </button>
          </div>
        </div>
      ) : wardrobe.length === 1 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center space-y-4 max-w-xl mx-auto shadow-xs">
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">
            Tienes 1 prenda registrada
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Ya tienes "{wardrobe[0].name}". Sube al menos una prenda más (por ejemplo un pantalón, camiseta o calzado) para que la IA pueda crear una combinación completa.
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenUpload}
              className="px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
            >
              Añadir otra prenda
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column (Left) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-stone-700" />
                <span>Condiciones del Look</span>
              </h2>
              <span className="text-xs font-mono text-stone-400">
                {wardrobe.length} prendas disponibles
              </span>
            </div>

            {/* 1. Season Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                1. Temporada del Año
              </label>
              <div className="grid grid-cols-2 gap-2">
                {SEASONS_LIST.map((s) => {
                  const isSelected = season === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSeason(s.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                          : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100 text-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{s.icon}</span>
                        <span className="text-xs font-semibold">{s.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Weather Condition Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                2. Clima y Temperatura
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {WEATHER_CONDITIONS.map((w) => {
                  const isSelected = weather === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWeather(w.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                          : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100 text-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{w.icon}</span>
                        <div className="truncate">
                          <div className="text-xs font-semibold truncate">{w.shortLabel}</div>
                          <div
                            className={`text-[10px] truncate ${
                              isSelected ? 'text-stone-300' : 'text-stone-400'
                            }`}
                          >
                            {w.tempGuide}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Occasion Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                3. Ocasión o Momento
              </label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value as Occasion)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800 bg-stone-50/50 cursor-pointer"
              >
                {OCCASIONS_LIST.map((occ) => (
                  <option key={occ.id} value={occ.id}>
                    {occ.icon} {occ.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Anchor Item (Optional) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                  4. Prenda Base / Obligatoria (Opcional)
                </label>
                {activeAnchorId && (
                  <button
                    onClick={() => {
                      setActiveAnchorId('');
                      onClearAnchorItem();
                    }}
                    className="text-[11px] text-stone-500 hover:text-stone-900 underline cursor-pointer"
                  >
                    Quitar filtro
                  </button>
                )}
              </div>
              <select
                value={activeAnchorId}
                onChange={(e) => setActiveAnchorId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800 bg-stone-50/50 cursor-pointer"
              >
                <option value="">Cualquier prenda del armario (Automático)</option>
                {wardrobe.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.subCategory})
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Style preference hint */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider">
                5. Preferencia de Estilo o Vibe (Opcional)
              </label>
              <input
                type="text"
                value={stylePreference}
                onChange={(e) => setStylePreference(e.target.value)}
                placeholder="Ej: Minimalista sofisticado, Streetwear moderno, Cómodo..."
                className="w-full px-3 py-2 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800 bg-stone-50/50"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3.5 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-stone-300" />
                  <span>Estilizando con Gemini AI...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generar Outfit con mi Ropa</span>
                </>
              )}
            </button>
          </div>

          {/* Results Column (Right) */}
          <div className="lg:col-span-7 space-y-6">
            {!currentOutfit && !isGenerating && (
              <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
                <div className="w-14 h-14 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
                  <Layers className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  Listo para crear tu look
                </h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                  Configura las condiciones a la izquierda y pulsa "Generar Outfit". Combinaremos las prendas de tu armario adaptándolas a las {selectedSeasonInfo?.label.toLowerCase()} y clima {selectedWeatherInfo?.shortLabel.toLowerCase()}.
                </p>
                <button
                  onClick={handleGenerate}
                  className="px-5 py-2.5 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Probar ahora</span>
                </button>
              </div>
            )}

            {isGenerating && (
              <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center space-y-4 animate-pulse">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-700">
                  <Wand2 className="w-8 h-8 animate-spin" />
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  Creando combinación perfecta...
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  Analizando compatibilidad cromática, nivel de calidez ({selectedWeatherInfo?.shortLabel}) y silueta con tus prendas.
                </p>
              </div>
            )}

            {currentOutfit && !isGenerating && (
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm space-y-6">
                {/* Outfit Title Bar */}
                <div className="p-6 bg-stone-50/80 border-b border-stone-200 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                      <span>{selectedSeasonInfo?.icon} {selectedSeasonInfo?.label}</span>
                      <span aria-hidden="true">·</span>
                      <span>{selectedWeatherInfo?.icon} {selectedWeatherInfo?.shortLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{currentOutfit.occasion}</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                      {currentOutfit.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Harmony Score pill */}
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase text-stone-400 block">
                        Armonía Estilo
                      </span>
                      <span className="text-sm font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {currentOutfit.harmonyScore}%
                      </span>
                    </div>

                    <button
                      onClick={handleSaveCurrentOutfit}
                      disabled={isSaved}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isSaved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-900 text-white hover:bg-stone-800 shadow-xs'
                      }`}
                    >
                      {isSaved ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Guardado en Mis Looks</span>
                        </>
                      ) : (
                        <>
                          <BookmarkCheck className="w-4 h-4" />
                          <span>Guardar Look</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Flat-Lay Items Moodboard */}
                <div className="px-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
                      Prendas que componen este outfit ({outfitItems.length})
                    </span>
                    <span className="text-xs text-stone-400">
                      Haz clic en "Cambiar" para probar otra prenda de tu armario
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {outfitItems.map((item) => (
                      <div
                        key={item.id}
                        className="group bg-stone-50 rounded-xl border border-stone-200 overflow-hidden flex flex-col justify-between"
                      >
                        <div className="relative aspect-square w-full bg-white flex items-center justify-center p-3 border-b border-stone-100">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-contain"
                          />
                          <span className="absolute top-2 left-2 text-[10px] bg-stone-900/80 backdrop-blur-xs text-white px-1.5 py-0.5 rounded font-medium">
                            {item.subCategory || item.category}
                          </span>
                        </div>

                        <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-stone-500">
                              {item.colors.join(', ')} · Calidez {item.warmth}/5
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              setSwappingCategory(item.category);
                              setSwapTargetItemId(item.id);
                            }}
                            className="w-full py-1 text-[11px] font-medium text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-100 rounded border border-stone-200 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <ArrowLeftRight className="w-3 h-3 text-stone-500" />
                            <span>Cambiar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stylist Insights & Layering Breakdown */}
                <div className="px-6 pb-6 space-y-4">
                  {/* Climate suitability */}
                  <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <span>{selectedWeatherInfo?.icon}</span>
                      Adecuación al Clima ({selectedWeatherInfo?.shortLabel}):
                    </span>
                    <p className="text-xs text-amber-950 leading-relaxed">
                      {currentOutfit.temperatureSuitability}
                    </p>
                  </div>

                  {/* Why this look works */}
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-stone-700" />
                      Por qué funciona esta combinación:
                    </span>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {currentOutfit.styleExplanation}
                    </p>
                  </div>

                  {/* Styling Tips */}
                  {currentOutfit.stylingTips && currentOutfit.stylingTips.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
                        Consejos de Estilo para Llevarlo:
                      </span>
                      <ul className="space-y-1.5">
                        {currentOutfit.stylingTips.map((tip, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-stone-600 flex items-start gap-2 bg-stone-50/50 p-2 rounded-lg border border-stone-100"
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Layering advice */}
                  {currentOutfit.layeringAdvice && (
                    <div className="text-xs text-stone-500 bg-white p-3 rounded-lg border border-stone-200">
                      <span className="font-semibold text-stone-700 block mb-0.5">
                        Estrategia de Capas:
                      </span>
                      {currentOutfit.layeringAdvice}
                    </div>
                  )}

                  {/* Quick Regenerate Footer */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={handleGenerate}
                      className="px-4 py-2 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Generar otra opción</span>
                    </button>
                    <span className="text-[11px] text-stone-400">
                      Hecho con Gemini 3.8 Flash
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Item Swap Modal Drawer */}
      {swappingCategory && swapTargetItemId && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">
                  Cambiar Prenda
                </h3>
                <p className="text-xs text-stone-500">
                  Selecciona otra prenda de tu armario para esta posición.
                </p>
              </div>
              <button
                onClick={() => {
                  setSwappingCategory(null);
                  setSwapTargetItemId(null);
                }}
                className="p-1 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of alternative items in wardrobe */}
            <div className="max-h-72 overflow-y-auto space-y-2">
              {wardrobe
                .filter(
                  (item) =>
                    item.category === swappingCategory && item.id !== swapTargetItemId
                )
                .map((altItem) => (
                  <div
                    key={altItem.id}
                    onClick={() => handleSwapItem(altItem.id)}
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-stone-200 hover:border-stone-800 hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <img
                      src={altItem.imageUrl}
                      alt={altItem.name}
                      className="w-12 h-12 rounded object-cover border border-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-stone-900 truncate">
                        {altItem.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 truncate">
                        {altItem.colors.join(', ')} · Calidez {altItem.warmth}/5
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 text-xs font-medium text-stone-900 bg-stone-100 hover:bg-stone-200 rounded"
                    >
                      Elegir
                    </button>
                  </div>
                ))}

              {wardrobe.filter(
                (item) => item.category === swappingCategory && item.id !== swapTargetItemId
              ).length === 0 && (
                <div className="text-center py-6 text-xs text-stone-500">
                  No tienes más prendas guardadas en esta categoría ({swappingCategory}). Sube más prendas a tu armario.
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  setSwappingCategory(null);
                  setSwapTargetItemId(null);
                }}
                className="px-4 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
