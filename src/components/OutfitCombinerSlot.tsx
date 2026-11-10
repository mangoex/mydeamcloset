import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ClothingItem, ClothingCategory, Outfit, Season, WeatherCondition } from '../types/wardrobe';
import { AssistantConfig } from '../types/auth';
import { SEASONS_LIST, WEATHER_CONDITIONS, getWarmthLabel } from '../utils/fashionHelpers';
import { ASSISTANT_AVATARS, generateStylistCompliment } from '../services/authService';
import { evaluateFashionQuestion } from '../services/fashionAdvisor';
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Bookmark,
  BookmarkCheck,
  Plus,
  Sparkles,
  Info,
  Layers,
  Thermometer,
  RotateCcw,
  Palette,
  Check,
  Heart,
  Sliders,
} from 'lucide-react';

interface OutfitCombinerSlotProps {
  wardrobe: ClothingItem[];
  savedOutfits: Outfit[];
  onSaveOutfit: (outfit: Outfit) => void;
  onOpenUpload: (preselectedCategory?: ClothingCategory) => void;
}

export const OutfitCombinerSlot: React.FC<OutfitCombinerSlotProps> = ({
  wardrobe,
  savedOutfits,
  onSaveOutfit,
  onOpenUpload,
}) => {
  // Season & Weather Filters
  const [selectedSeason, setSelectedSeason] = useState<Season | 'all'>('all');
  const [selectedWeather, setSelectedWeather] = useState<WeatherCondition | 'all'>('all');

  // Active section focus for keyboard navigation (0: Top, 1: Bottom, 2: Shoes, 3: Outerwear)
  const [activeTier, setActiveTier] = useState<number>(0);
  const [includeOuterwear, setIncludeOuterwear] = useState<boolean>(false);

  // Selected Indices in each category
  const [topIndex, setTopIndex] = useState<number>(0);
  const [bottomIndex, setBottomIndex] = useState<number>(0);
  const [footwearIndex, setFootwearIndex] = useState<number>(0);
  const [outerwearIndex, setOuterwearIndex] = useState<number>(0);

  // Toast / feedback when saving
  const [justSaved, setJustSaved] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  // Filter items by category & current season/weather
  const filteredTops = useMemo(() => {
    return wardrobe.filter((item) => {
      const isTop = item.category === 'top' || (item.category === 'outerwear' && !includeOuterwear);
      if (!isTop) return false;
      if (selectedSeason !== 'all' && !item.seasons.includes(selectedSeason)) return false;
      if (selectedWeather !== 'all' && !item.weather.includes(selectedWeather)) return false;
      return true;
    });
  }, [wardrobe, selectedSeason, selectedWeather, includeOuterwear]);

  const filteredBottoms = useMemo(() => {
    return wardrobe.filter((item) => {
      if (item.category !== 'bottom') return false;
      if (selectedSeason !== 'all' && !item.seasons.includes(selectedSeason)) return false;
      if (selectedWeather !== 'all' && !item.weather.includes(selectedWeather)) return false;
      return true;
    });
  }, [wardrobe, selectedSeason, selectedWeather]);

  const filteredFootwear = useMemo(() => {
    return wardrobe.filter((item) => {
      if (item.category !== 'footwear') return false;
      if (selectedSeason !== 'all' && !item.seasons.includes(selectedSeason)) return false;
      if (selectedWeather !== 'all' && !item.weather.includes(selectedWeather)) return false;
      return true;
    });
  }, [wardrobe, selectedSeason, selectedWeather]);

  const filteredOuterwear = useMemo(() => {
    return wardrobe.filter((item) => {
      if (item.category !== 'outerwear') return false;
      if (selectedSeason !== 'all' && !item.seasons.includes(selectedSeason)) return false;
      if (selectedWeather !== 'all' && !item.weather.includes(selectedWeather)) return false;
      return true;
    });
  }, [wardrobe, selectedSeason, selectedWeather]);

  // Keep indices in safe bounds when filter changes
  useEffect(() => {
    if (topIndex >= filteredTops.length && filteredTops.length > 0) setTopIndex(0);
  }, [filteredTops.length, topIndex]);

  useEffect(() => {
    if (bottomIndex >= filteredBottoms.length && filteredBottoms.length > 0) setBottomIndex(0);
  }, [filteredBottoms.length, bottomIndex]);

  useEffect(() => {
    if (footwearIndex >= filteredFootwear.length && filteredFootwear.length > 0) setFootwearIndex(0);
  }, [filteredFootwear.length, footwearIndex]);

  useEffect(() => {
    if (outerwearIndex >= filteredOuterwear.length && filteredOuterwear.length > 0) setOuterwearIndex(0);
  }, [filteredOuterwear.length, outerwearIndex]);

  // Currently selected items
  const currentTop = filteredTops[topIndex] || null;
  const currentBottom = filteredBottoms[bottomIndex] || null;
  const currentFootwear = filteredFootwear[footwearIndex] || null;
  const currentOuterwear = includeOuterwear ? filteredOuterwear[outerwearIndex] || null : null;

  // Navigation handlers per tier
  // If user presses right arrow -> next garment; if left arrow -> previous garment
  const handleNextTop = useCallback(() => {
    if (filteredTops.length === 0) return;
    setTopIndex((prev) => (prev + 1) % filteredTops.length);
    setActiveTier(0);
  }, [filteredTops.length]);

  const handlePrevTop = useCallback(() => {
    if (filteredTops.length === 0) return;
    setTopIndex((prev) => (prev - 1 + filteredTops.length) % filteredTops.length);
    setActiveTier(0);
  }, [filteredTops.length]);

  const handleNextBottom = useCallback(() => {
    if (filteredBottoms.length === 0) return;
    setBottomIndex((prev) => (prev + 1) % filteredBottoms.length);
    setActiveTier(1);
  }, [filteredBottoms.length]);

  const handlePrevBottom = useCallback(() => {
    if (filteredBottoms.length === 0) return;
    setBottomIndex((prev) => (prev - 1 + filteredBottoms.length) % filteredBottoms.length);
    setActiveTier(1);
  }, [filteredBottoms.length]);

  const handleNextFootwear = useCallback(() => {
    if (filteredFootwear.length === 0) return;
    setFootwearIndex((prev) => (prev + 1) % filteredFootwear.length);
    setActiveTier(2);
  }, [filteredFootwear.length]);

  const handlePrevFootwear = useCallback(() => {
    if (filteredFootwear.length === 0) return;
    setFootwearIndex((prev) => (prev - 1 + filteredFootwear.length) % filteredFootwear.length);
    setActiveTier(2);
  }, [filteredFootwear.length]);

  const handleNextOuterwear = useCallback(() => {
    if (filteredOuterwear.length === 0) return;
    setOuterwearIndex((prev) => (prev + 1) % filteredOuterwear.length);
    setActiveTier(3);
  }, [filteredOuterwear.length]);

  const handlePrevOuterwear = useCallback(() => {
    if (filteredOuterwear.length === 0) return;
    setOuterwearIndex((prev) => (prev - 1 + filteredOuterwear.length) % filteredOuterwear.length);
    setActiveTier(3);
  }, [filteredOuterwear.length]);

  // Shuffle all sections simultaneously
  const handleShuffleAll = () => {
    setIsShuffling(true);
    if (filteredTops.length > 1) {
      let nextT = Math.floor(Math.random() * filteredTops.length);
      if (nextT === topIndex) nextT = (nextT + 1) % filteredTops.length;
      setTopIndex(nextT);
    }
    if (filteredBottoms.length > 1) {
      let nextB = Math.floor(Math.random() * filteredBottoms.length);
      if (nextB === bottomIndex) nextB = (nextB + 1) % filteredBottoms.length;
      setBottomIndex(nextB);
    }
    if (filteredFootwear.length > 1) {
      let nextF = Math.floor(Math.random() * filteredFootwear.length);
      if (nextF === footwearIndex) nextF = (nextF + 1) % filteredFootwear.length;
      setFootwearIndex(nextF);
    }
    if (includeOuterwear && filteredOuterwear.length > 1) {
      let nextO = Math.floor(Math.random() * filteredOuterwear.length);
      if (nextO === outerwearIndex) nextO = (nextO + 1) % filteredOuterwear.length;
      setOuterwearIndex(nextO);
    }
    setTimeout(() => setIsShuffling(false), 300);
  };

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (activeTier === 0) handleNextTop();
        else if (activeTier === 1) handleNextBottom();
        else if (activeTier === 2) handleNextFootwear();
        else if (activeTier === 3) handleNextOuterwear();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (activeTier === 0) handlePrevTop();
        else if (activeTier === 1) handlePrevBottom();
        else if (activeTier === 2) handlePrevFootwear();
        else if (activeTier === 3) handlePrevOuterwear();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveTier((prev) => (prev + 1) % (includeOuterwear ? 4 : 3));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveTier((prev) => (prev - 1 + (includeOuterwear ? 4 : 3)) % (includeOuterwear ? 4 : 3));
      } else if (e.key === ' ') {
        e.preventDefault();
        handleShuffleAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeTier,
    includeOuterwear,
    handleNextTop,
    handlePrevTop,
    handleNextBottom,
    handlePrevBottom,
    handleNextFootwear,
    handlePrevFootwear,
    handleNextOuterwear,
    handlePrevOuterwear,
  ]);

  // Check if current combination is already saved
  const assembledItemIds = useMemo(() => {
    const ids: string[] = [];
    if (currentTop) ids.push(currentTop.id);
    if (currentBottom) ids.push(currentBottom.id);
    if (currentFootwear) ids.push(currentFootwear.id);
    if (currentOuterwear) ids.push(currentOuterwear.id);
    return ids;
  }, [currentTop, currentBottom, currentFootwear, currentOuterwear]);

  const isAlreadySaved = useMemo(() => {
    if (assembledItemIds.length < 2) return false;
    return savedOutfits.some((so) => {
      if (so.itemIds.length !== assembledItemIds.length) return false;
      return assembledItemIds.every((id) => so.itemIds.includes(id));
    });
  }, [assembledItemIds, savedOutfits]);

  // Analyze current combination honestly with fashion rules
  const combinationAnalysis = useMemo(() => {
    if (!currentTop || !currentBottom) return null;
    const prompt = `¿Combina ${currentTop.name} (${currentTop.colors?.join(', ') || ''}) con ${currentBottom.name} (${currentBottom.colors?.join(', ') || ''}) y calzado ${currentFootwear?.name || ''}?`;
    return evaluateFashionQuestion(prompt, undefined, wardrobe);
  }, [currentTop, currentBottom, currentFootwear, wardrobe]);

  // Save current look
  const handleSaveCurrentLook = () => {
    if (assembledItemIds.length < 2) return;

    const topName = currentTop?.name || 'Prenda Superior';
    const bottomName = currentBottom?.name || 'Prenda Inferior';
    const shoeName = currentFootwear?.name || 'Zapatos';

    // Harmony calculation
    const allColors = [
      ...(currentTop?.colors || []),
      ...(currentBottom?.colors || []),
      ...(currentFootwear?.colors || []),
    ];
    const uniqueColors = Array.from(new Set(allColors));
    const harmony = Math.min(98, 88 + (uniqueColors.length <= 4 ? 8 : 4));

    const avgWarmth = Math.round(
      ((currentTop?.warmth || 3) +
        (currentBottom?.warmth || 3) +
        (currentFootwear?.warmth || 3)) /
        3
    );

    const outfitSeason: Season = selectedSeason !== 'all' ? selectedSeason : (currentTop?.seasons[0] || 'primavera');
    const outfitWeather: WeatherCondition = selectedWeather !== 'all' ? selectedWeather : (currentTop?.weather[0] || 'templado');

    const newOutfit: Outfit = {
      id: 'combiner-' + Date.now(),
      title: `${topName} con ${bottomName}`,
      itemIds: assembledItemIds,
      season: outfitSeason,
      weather: outfitWeather,
      occasion: 'casual',
      harmonyScore: harmony,
      temperatureSuitability: `Ideal para nivel de abrigo térmico ${avgWarmth}/5 (${getWarmthLabel(avgWarmth).text}).`,
      styleExplanation: `Look armado manualmente en el probador interactivo combinando ${topName}, ${bottomName} y ${shoeName}.`,
      stylingTips: [
        'Ajusta la prenda superior según la ocasión (fajada o suelta).',
        'Los zapatos completan y anclan la silueta del conjunto.',
      ],
      savedAt: Date.now(),
    };

    onSaveOutfit(newOutfit);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2400);
  };

  const hasTops = filteredTops.length > 0;
  const hasBottoms = filteredBottoms.length > 0;
  const hasFootwear = filteredFootwear.length > 0;
  const canAssembleLook = hasTops && hasBottoms && hasFootwear;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-stone-400">
            Probador & Combinador Visual
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Armador Interactivo de Outfits
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Usa las flechas laterales para deslizar y cambiar la parte de arriba, la de abajo y los zapatos hasta encontrar tu look perfecto.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={handleShuffleAll}
            disabled={!hasTops && !hasBottoms && !hasFootwear}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-stone-200 hover:border-stone-300 text-stone-800 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Mezclar aleatoriamente las tres prendas (Espacio)"
          >
            <Shuffle className={`w-3.5 h-3.5 text-stone-700 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>Mezclar Outfit</span>
          </button>

          <button
            onClick={handleSaveCurrentLook}
            disabled={!canAssembleLook || isAlreadySaved}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95 whitespace-nowrap ${
              isAlreadySaved || justSaved
                ? 'bg-emerald-700 text-white'
                : 'bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            {isAlreadySaved || justSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Guardado en Mis Looks</span>
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5" />
                <span>Guardar este Look</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Season & Weather Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <span className="text-stone-400 font-medium mr-1 whitespace-nowrap">Temporada:</span>
          <button
            onClick={() => setSelectedSeason('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              selectedSeason === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Todas
          </button>
          {SEASONS_LIST.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSeason(s.id)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedSeason === s.id
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Climate & Layer Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400 font-medium">Clima:</span>
            <select
              value={selectedWeather}
              onChange={(e) => setSelectedWeather(e.target.value as WeatherCondition | 'all')}
              className="px-2 py-1 text-xs border border-stone-200 rounded-md bg-stone-50 text-stone-700 cursor-pointer focus:outline-none"
            >
              <option value="all">Cualquier Clima</option>
              {WEATHER_CONDITIONS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.icon} {w.shortLabel}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIncludeOuterwear(!includeOuterwear)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 ${
              includeOuterwear
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
            title="Activar o desactivar capa de abrigo/chaqueta"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>+ Abrigo</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Dressing Room Carousel Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: The Pure Outfit Stage (Matching user reference layout exactly) */}
        <div className="lg:col-span-8 flex justify-center">
          <div className="w-full max-w-lg bg-[#dedede] sm:bg-[#e1e1df] rounded-3xl p-4 sm:p-8 shadow-inner border border-stone-300/80 flex flex-col items-center select-none relative overflow-hidden min-h-[660px]">
            {/* Subtle Studio Ambient Background Vignette */}
            <div className="absolute inset-0 bg-radial from-white/40 via-transparent to-stone-400/20 pointer-events-none" />

            {/* Optional Outerwear Layer (Top overlay when enabled) */}
            {includeOuterwear && (
              <div
                className={`w-full relative py-2 transition-all duration-200 ${
                  activeTier === 3 ? 'ring-2 ring-stone-900/40 rounded-2xl bg-white/30' : ''
                }`}
                onClick={() => setActiveTier(3)}
              >
                <div className="text-[11px] font-mono uppercase tracking-wider text-stone-600 text-center mb-1">
                  Capa de Abrigo / Chaqueta
                </div>
                <div className="relative flex items-center justify-between w-full h-32 sm:h-36">
                  {/* Left Arrow < */}
                  <button
                    onClick={handlePrevOuterwear}
                    disabled={filteredOuterwear.length <= 1}
                    className="z-10 p-2 sm:p-3 text-stone-900 hover:text-black hover:scale-120 active:scale-90 transition-all cursor-pointer disabled:opacity-20 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    title="Prenda de abrigo anterior"
                  >
                    <ChevronLeft className="w-8 h-8 sm:w-11 sm:h-11 stroke-[3.5]" />
                  </button>

                  {/* Garment Display */}
                  <div className="flex-1 h-full flex flex-col items-center justify-center px-2">
                    {currentOuterwear ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img
                          src={currentOuterwear.imageUrl}
                          alt={currentOuterwear.name}
                          className="max-h-full max-w-[200px] object-contain drop-shadow-sm transition-all duration-200 hover:scale-103"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full border-2 border-dashed border-stone-400/60 rounded-xl flex flex-col items-center justify-center p-2 text-center bg-white/40">
                        <span className="text-xs text-stone-600 font-medium">Sin abrigos</span>
                        <button
                          onClick={() => onOpenUpload('outerwear')}
                          className="mt-1 text-[11px] font-semibold text-stone-900 underline cursor-pointer"
                        >
                          + Añadir abrigo
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Arrow > */}
                  <button
                    onClick={handleNextOuterwear}
                    disabled={filteredOuterwear.length <= 1}
                    className="z-10 p-2 sm:p-3 text-stone-900 hover:text-black hover:scale-120 active:scale-90 transition-all cursor-pointer disabled:opacity-20 disabled:hover:scale-100 disabled:cursor-not-allowed"
                    title="Siguiente prenda de abrigo"
                  >
                    <ChevronRight className="w-8 h-8 sm:w-11 sm:h-11 stroke-[3.5]" />
                  </button>
                </div>
              </div>
            )}

            {/* SECTION 1: PARTE DE ARRIBA (Tops: blusas, camisas, chalecos, suéteres) */}
            <div
              className={`w-full relative py-2 transition-all duration-200 ${
                activeTier === 0 ? 'ring-2 ring-stone-900/30 rounded-2xl bg-white/20' : ''
              }`}
              onClick={() => setActiveTier(0)}
            >
              <div className="relative flex items-center justify-between w-full h-44 sm:h-52">
                {/* Left Arrow < */}
                <button
                  onClick={handlePrevTop}
                  disabled={filteredTops.length <= 1}
                  className="z-10 p-2 sm:p-3 text-stone-900 hover:text-black hover:scale-125 active:scale-90 transition-transform cursor-pointer disabled:opacity-20 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  title="Prenda de arriba anterior (Flecha Izquierda)"
                >
                  <ChevronLeft className="w-9 h-9 sm:w-12 sm:h-12 stroke-[3.5]" />
                </button>

                {/* Garment Display */}
                <div className="flex-1 h-full flex flex-col items-center justify-center px-1">
                  {currentTop ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={currentTop.imageUrl}
                        alt={currentTop.name}
                        className="max-h-full max-w-[220px] sm:max-w-[260px] object-contain drop-shadow-sm transition-all duration-300 hover:scale-103"
                      />
                      <span className="absolute bottom-0 bg-stone-900/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded opacity-0 hover:opacity-100 transition-opacity">
                        {currentTop.name} ({topIndex + 1}/{filteredTops.length})
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full max-w-[240px] border-2 border-dashed border-stone-400 rounded-2xl flex flex-col items-center justify-center p-4 text-center bg-white/40">
                      <span className="text-xs font-semibold text-stone-800">
                        No hay prendas de arriba
                      </span>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Blusas, camisas, chalecos, suéteres...
                      </p>
                      <button
                        onClick={() => onOpenUpload('top')}
                        className="mt-2.5 px-3 py-1 bg-stone-900 text-white rounded-md text-xs font-medium cursor-pointer hover:bg-stone-800 transition-colors inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Subir parte de arriba</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Arrow > */}
                <button
                  onClick={handleNextTop}
                  disabled={filteredTops.length <= 1}
                  className="z-10 p-2 sm:p-3 text-stone-900 hover:text-black hover:scale-125 active:scale-90 transition-transform cursor-pointer disabled:opacity-20 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  title="Siguiente prenda de arriba (Flecha Derecha)"
                >
                  <ChevronRight className="w-9 h-9 sm:w-12 sm:h-12 stroke-[3.5]" />
                </button>
              </div>
            </div>

            {/* SECTION 2: PARTE DE ABAJO (Bottoms: shorts, pantalones, faldas, jeans) */}
            <div
              className={`w-full relative py-2 transition-all duration-200 ${
                activeTier === 1 ? 'ring-2 ring-stone-900/30 rounded-2xl bg-white/20' : ''
              }`}
              onClick={() => setActiveTier(1)}
            >
              <div className="relative flex items-center justify-between w-full h-52 sm:h-64">
                {/* Left Arrow < */}
                <button
                  onClick={handlePrevBottom}
                  disabled={filteredBottoms.length <= 1}
                  className="z-10 p-2 sm:p-3 text-stone-900 hover:text-black hover:scale-125 active:scale-90 transition-transform cursor-pointer disabled:opacity-20 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  title="Prenda de abajo anterior (Flecha Izquierda)"
                >
                  <ChevronLeft className="w-9 h-9 sm:w-12 sm:h-12 stroke-[3.5]" />
                </button>

                {/* Garment Display */}
                <div className="flex-1 h-full flex flex-col items-center justify-center px-1">
                  {currentBottom ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={currentBottom.imageUrl}
                        alt={currentBottom.name}
                        className="max-h-full max-w-[210px] sm:max-w-[250px] object-contain drop-shadow-sm transition-all duration-300 hover:scale-103"
                      />
                      <span className="absolute bottom-0 bg-stone-900/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded opacity-0 hover:opacity-100 transition-opacity">
                        {currentBottom.name} ({bottomIndex + 1}/{filteredBottoms.length})
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full max-w-[240px] border-2 border-dashed border-stone-400 rounded-2xl flex flex-col items-center justify-center p-4 text-center bg-white/40">
                      <span className="text-xs font-semibold text-stone-800">
                        No hay prendas de abajo
                      </span>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Shorts, pantalones, jeans, faldas...
                      </p>
                      <button
                        onClick={() => onOpenUpload('bottom')}
                        className="mt-2.5 px-3 py-1 bg-stone-900 text-white rounded-md text-xs font-medium cursor-pointer hover:bg-stone-800 transition-colors inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Subir parte de abajo</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Arrow > */}
                <button
                  onClick={handleNextBottom}
                  disabled={filteredBottoms.length <= 1}
                  className="z-10 p-2 sm:p-3 text-stone-900 hover:text-black hover:scale-125 active:scale-90 transition-transform cursor-pointer disabled:opacity-20 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  title="Siguiente prenda de abajo (Flecha Derecha)"
                >
                  <ChevronRight className="w-9 h-9 sm:w-12 sm:h-12 stroke-[3.5]" />
                </button>
              </div>
            </div>

            {/* SECTION 3: ZAPATOS (Footwear: tenis, botas, tacones, zapatillas, flats) */}
            <div
              className={`w-full relative py-2 transition-all duration-200 ${
                activeTier === 2 ? 'ring-2 ring-stone-900/30 rounded-2xl bg-white/20' : ''
              }`}
              onClick={() => setActiveTier(2)}
            >
              <div className="relative flex items-center justify-between w-full h-36 sm:h-44">
                {/* Left Arrow < */}
                <button
                  onClick={handlePrevFootwear}
                  disabled={filteredFootwear.length <= 1}
                  className="z-10 p-2 sm:p-3 text-stone-900 hover:text-black hover:scale-125 active:scale-90 transition-transform cursor-pointer disabled:opacity-20 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  title="Calzado anterior (Flecha Izquierda)"
                >
                  <ChevronLeft className="w-9 h-9 sm:w-12 sm:h-12 stroke-[3.5]" />
                </button>

                {/* Garment Display */}
                <div className="flex-1 h-full flex flex-col items-center justify-center px-1">
                  {currentFootwear ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img
                        src={currentFootwear.imageUrl}
                        alt={currentFootwear.name}
                        className="max-h-full max-w-[200px] sm:max-w-[240px] object-contain drop-shadow-sm transition-all duration-300 hover:scale-103"
                      />
                      <span className="absolute bottom-0 bg-stone-900/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded opacity-0 hover:opacity-100 transition-opacity">
                        {currentFootwear.name} ({footwearIndex + 1}/{filteredFootwear.length})
                      </span>
                    </div>
                  ) : (
                    <div className="w-full h-full max-w-[240px] border-2 border-dashed border-stone-400 rounded-2xl flex flex-col items-center justify-center p-3 text-center bg-white/40">
                      <span className="text-xs font-semibold text-stone-800">
                        No hay zapatos registrados
                      </span>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Tenis, botas, tacones, zapatillas...
                      </p>
                      <button
                        onClick={() => onOpenUpload('footwear')}
                        className="mt-2 px-3 py-1 bg-stone-900 text-white rounded-md text-xs font-medium cursor-pointer hover:bg-stone-800 transition-colors inline-flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Subir calzado</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Right Arrow > */}
                <button
                  onClick={handleNextFootwear}
                  disabled={filteredFootwear.length <= 1}
                  className="z-10 p-2 sm:p-3 text-stone-900 hover:text-black hover:scale-125 active:scale-90 transition-transform cursor-pointer disabled:opacity-20 disabled:hover:scale-100 disabled:cursor-not-allowed"
                  title="Siguiente calzado (Flecha Derecha)"
                >
                  <ChevronRight className="w-9 h-9 sm:w-12 sm:h-12 stroke-[3.5]" />
                </button>
              </div>
            </div>

            {/* Bottom Keyboard hint */}
            <div className="text-[10px] text-stone-500 font-mono text-center pt-3 flex items-center justify-center gap-2">
              <span>Atajos:</span>
              <kbd className="bg-white/70 px-1.5 py-0.5 rounded border border-stone-300">←</kbd>
              <kbd className="bg-white/70 px-1.5 py-0.5 rounded border border-stone-300">→</kbd>
              <span>cambiar prenda</span>
              <span>·</span>
              <kbd className="bg-white/70 px-1.5 py-0.5 rounded border border-stone-300">Espacio</kbd>
              <span>mezclar</span>
            </div>
          </div>
        </div>

        {/* Right: Outfit Breakdown, Color Palette & Stylist Notes */}
        <div className="lg:col-span-4 space-y-5">
          {/* Active Look Summary Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-xs font-mono uppercase text-stone-400">Detalles del Look</span>
                <h3 className="text-base font-serif font-bold text-stone-900">
                  Composición Actual
                </h3>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded">
                Armonía 94%
              </span>
            </div>

            {/* Selected Garments Quick List */}
            <div className="space-y-3">
              {/* Top Item */}
              <div
                onClick={() => setActiveTier(0)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                  activeTier === 0 ? 'border-stone-900 bg-stone-50/80 shadow-xs' : 'border-stone-100 hover:bg-stone-50/50'
                }`}
              >
                <div className="w-12 h-12 bg-white border border-stone-200 rounded-lg p-1 shrink-0 flex items-center justify-center overflow-hidden">
                  {currentTop ? (
                    <img src={currentTop.imageUrl} alt={currentTop.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-stone-400">Sin foto</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                    <span>PARTE DE ARRIBA</span>
                    <span>{hasTops ? `${topIndex + 1}/${filteredTops.length}` : '0/0'}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-stone-900 truncate">
                    {currentTop?.name || 'Ninguna seleccionada'}
                  </h4>
                  <p className="text-[11px] text-stone-500 truncate">
                    {currentTop?.subCategory || 'Blusa, Camisa, Suéter'}
                  </p>
                </div>
              </div>

              {/* Bottom Item */}
              <div
                onClick={() => setActiveTier(1)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                  activeTier === 1 ? 'border-stone-900 bg-stone-50/80 shadow-xs' : 'border-stone-100 hover:bg-stone-50/50'
                }`}
              >
                <div className="w-12 h-12 bg-white border border-stone-200 rounded-lg p-1 shrink-0 flex items-center justify-center overflow-hidden">
                  {currentBottom ? (
                    <img src={currentBottom.imageUrl} alt={currentBottom.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-stone-400">Sin foto</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                    <span>PARTE DE ABAJO</span>
                    <span>{hasBottoms ? `${bottomIndex + 1}/${filteredBottoms.length}` : '0/0'}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-stone-900 truncate">
                    {currentBottom?.name || 'Ninguna seleccionada'}
                  </h4>
                  <p className="text-[11px] text-stone-500 truncate">
                    {currentBottom?.subCategory || 'Pantalón, Jeans, Falda'}
                  </p>
                </div>
              </div>

              {/* Footwear Item */}
              <div
                onClick={() => setActiveTier(2)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                  activeTier === 2 ? 'border-stone-900 bg-stone-50/80 shadow-xs' : 'border-stone-100 hover:bg-stone-50/50'
                }`}
              >
                <div className="w-12 h-12 bg-white border border-stone-200 rounded-lg p-1 shrink-0 flex items-center justify-center overflow-hidden">
                  {currentFootwear ? (
                    <img src={currentFootwear.imageUrl} alt={currentFootwear.name} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-stone-400">Sin foto</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                    <span>ZAPATOS</span>
                    <span>{hasFootwear ? `${footwearIndex + 1}/${filteredFootwear.length}` : '0/0'}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-stone-900 truncate">
                    {currentFootwear?.name || 'Ninguna seleccionada'}
                  </h4>
                  <p className="text-[11px] text-stone-500 truncate">
                    {currentFootwear?.subCategory || 'Tenis, Botas, Zapatillas'}
                  </p>
                </div>
              </div>

              {/* Optional Outerwear Item */}
              {includeOuterwear && (
                <div
                  onClick={() => setActiveTier(3)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                    activeTier === 3 ? 'border-stone-900 bg-stone-50/80 shadow-xs' : 'border-stone-100 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="w-12 h-12 bg-white border border-stone-200 rounded-lg p-1 shrink-0 flex items-center justify-center overflow-hidden">
                    {currentOuterwear ? (
                      <img src={currentOuterwear.imageUrl} alt={currentOuterwear.name} className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-stone-400">Sin foto</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                      <span>CAPA DE ABRIGO</span>
                      <span>{filteredOuterwear.length > 0 ? `${outerwearIndex + 1}/${filteredOuterwear.length}` : '0/0'}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-stone-900 truncate">
                      {currentOuterwear?.name || 'Ninguno seleccionado'}
                    </h4>
                    <p className="text-[11px] text-stone-500 truncate">
                      {currentOuterwear?.subCategory || 'Chaqueta, Blazer, Trench'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                onClick={handleSaveCurrentLook}
                disabled={!canAssembleLook || isAlreadySaved}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm ${
                  isAlreadySaved || justSaved
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                {isAlreadySaved || justSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Guardado en Mis Looks</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Guardar esta Combinación</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Objective Style Compatibility & Pattern Clash Card */}
          {combinationAnalysis && (
            <div
              className={`rounded-2xl border p-4 space-y-2.5 transition-colors ${
                combinationAnalysis.verdict === 'NO_COMBINA'
                  ? 'bg-red-50/70 border-red-200'
                  : combinationAnalysis.verdict === 'CUIDADO_DEPENDE'
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-emerald-50/70 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-stone-700" />
                  <span>Compatibilidad de Estilo</span>
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${combinationAnalysis.badgeColor}`}
                >
                  {combinationAnalysis.badge}
                </span>
              </div>

              <div className="bg-white/95 p-3 rounded-xl border border-stone-200 shadow-2xs space-y-1 text-xs text-stone-800">
                <p className="font-semibold text-stone-900">{combinationAnalysis.title}</p>
                <p className="text-[11px] text-stone-600 leading-relaxed">{combinationAnalysis.reason}</p>
                {combinationAnalysis.verdict !== 'SI_COMBINA' && (
                  <p className="text-[11px] text-stone-700 font-medium pt-1.5 border-t border-stone-100">
                    💡 <strong>Solución:</strong> {combinationAnalysis.fixRecommendation.split('\n')[0]}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Color & Thermal Balance Card */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-stone-600" />
              <span>Balance Estilístico</span>
            </span>

            <div className="space-y-2 text-xs text-stone-600">
              <div className="flex items-center justify-between">
                <span className="text-stone-500">Paleta Cromática:</span>
                <span className="font-medium text-stone-800">
                  {Array.from(
                    new Set([
                      ...(currentTop?.colors || []),
                      ...(currentBottom?.colors || []),
                      ...(currentFootwear?.colors || []),
                    ])
                  ).join(' + ') || 'Por definir'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500">Abrigo Estimado:</span>
                <span className="font-medium text-stone-800">
                  Nivel{' '}
                  {Math.round(
                    ((currentTop?.warmth || 3) +
                      (currentBottom?.warmth || 3) +
                      (currentFootwear?.warmth || 3)) /
                      3
                  )}
                  /5
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-stone-500">Temporadas Clave:</span>
                <span className="font-medium text-stone-800 capitalize">
                  {currentTop?.seasons?.join(', ') || 'Todas'}
                </span>
              </div>
            </div>
          </div>

          {/* Tip / Instructions */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 space-y-1">
            <span className="font-semibold block">¿Cómo funciona?</span>
            <p className="text-[11px] leading-relaxed">
              Pulsa la <strong>flecha derecha (&gt;)</strong> para avanzar a la siguiente prenda o la <strong>flecha izquierda (&lt;)</strong> para volver a la anterior en cada una de las 3 secciones (arriba, abajo y calzado).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
