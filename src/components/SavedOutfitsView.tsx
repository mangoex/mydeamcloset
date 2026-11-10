import React, { useState } from 'react';
import { Outfit, ClothingItem, Season } from '../types/wardrobe';
import { SEASONS_LIST, WEATHER_CONDITIONS } from '../utils/fashionHelpers';
import { BookmarkCheck, Trash2, Calendar, Wand2, X, Sparkles, ChevronRight, AlertTriangle } from 'lucide-react';

interface SavedOutfitsViewProps {
  savedOutfits: Outfit[];
  wardrobe: ClothingItem[];
  onDeleteOutfit: (id: string) => void;
  onNavigateToGenerator: () => void;
}

export const SavedOutfitsView: React.FC<SavedOutfitsViewProps> = ({
  savedOutfits,
  wardrobe,
  onDeleteOutfit,
  onNavigateToGenerator,
}) => {
  const [selectedSeason, setSelectedSeason] = useState<Season | 'all'>('all');
  const [activeModalOutfit, setActiveModalOutfit] = useState<Outfit | null>(null);
  const [outfitToDelete, setOutfitToDelete] = useState<Outfit | null>(null);

  const filteredOutfits = savedOutfits.filter((outfit) => {
    if (selectedSeason !== 'all' && outfit.season !== selectedSeason) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Mis Looks & Outfits Guardados
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Tu catálogo personal de combinaciones aprobadas, organizadas por temporada y clima.
          </p>
        </div>

        <button
          onClick={onNavigateToGenerator}
          className="px-4 py-2.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Wand2 className="w-4 h-4" />
          <span>Crear Nuevo Look</span>
        </button>
      </div>

      {/* Season Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedSeason('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            selectedSeason === 'all'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Todas las temporadas ({savedOutfits.length})
        </button>
        {SEASONS_LIST.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSeason(s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              selectedSeason === s.id
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* Grid of Outfits */}
      {filteredOutfits.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
            <BookmarkCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-serif font-bold text-stone-900">
            No tienes outfits guardados aún
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Utiliza el generador de outfits para crear looks personalizados con la ropa de tu armario y guárdalos aquí para acceder a ellos rápidamente.
          </p>
          <button
            onClick={onNavigateToGenerator}
            className="px-5 py-2.5 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            <span>Diseñar mi primer outfit</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOutfits.map((outfit) => {
            const seasonMeta = SEASONS_LIST.find((s) => s.id === outfit.season);
            const weatherMeta = WEATHER_CONDITIONS.find((w) => w.id === outfit.weather);
            const items = outfit.itemIds
              .map((id) => wardrobe.find((w) => w.id === id))
              .filter((w): w is ClothingItem => Boolean(w));

            return (
              <div
                key={outfit.id}
                className="bg-white rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
              >
                {/* Outfit Collage Header */}
                <div className="p-4 border-b border-stone-100 space-y-2">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span className="flex items-center gap-1 font-medium">
                      <span>{seasonMeta?.icon}</span>
                      <span>{seasonMeta?.label}</span>
                      <span>·</span>
                      <span>{weatherMeta?.shortLabel}</span>
                    </span>
                    <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[11px] font-semibold">
                      {outfit.harmonyScore}%
                    </span>
                  </div>

                  <h3 className="text-base font-serif font-bold text-stone-900 line-clamp-1">
                    {outfit.title}
                  </h3>
                </div>

                {/* Items Thumbnails Row */}
                <div className="p-4 bg-stone-50/50 flex-1">
                  <div className="grid grid-cols-4 gap-2">
                    {items.slice(0, 4).map((it) => (
                      <div
                        key={it.id}
                        className="aspect-square rounded-lg bg-white overflow-hidden border border-stone-200 flex items-center justify-center p-1"
                      >
                        <img
                          src={it.imageUrl}
                          alt={it.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ))}
                    {items.length > 4 && (
                      <div className="aspect-square rounded-lg bg-stone-200 flex items-center justify-center text-xs font-mono text-stone-600">
                        +{items.length - 4}
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 mt-3 line-clamp-2 italic">
                    "{outfit.styleExplanation}"
                  </p>
                </div>

                {/* Actions Footer */}
                <div className="p-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveModalOutfit(outfit)}
                    className="flex-1 py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-medium rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Ver detalles del look
                  </button>
                  <button
                    onClick={() => setOutfitToDelete(outfit)}
                    title="Eliminar outfit"
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Outfit Details Modal */}
      {activeModalOutfit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8">
            <div className="p-6 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div>
                <div className="text-xs text-stone-500 flex items-center gap-2 mb-1">
                  <span>{SEASONS_LIST.find((s) => s.id === activeModalOutfit.season)?.icon} {activeModalOutfit.season.toUpperCase()}</span>
                  <span>·</span>
                  <span className="capitalize">{activeModalOutfit.occasion}</span>
                </div>
                <h2 className="text-xl font-serif font-bold text-stone-900">
                  {activeModalOutfit.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveModalOutfit(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Items Breakdown */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                  Prendas del Armario Incluidas:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activeModalOutfit.itemIds
                    .map((id) => wardrobe.find((w) => w.id === id))
                    .filter((w): w is ClothingItem => Boolean(w))
                    .map((it) => (
                      <div
                        key={it.id}
                        className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 flex items-center gap-3"
                      >
                        <div className="w-12 h-12 rounded-lg bg-white border border-stone-200 shrink-0 flex items-center justify-center p-1 overflow-hidden">
                          <img
                            src={it.imageUrl}
                            alt={it.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-semibold text-stone-900 truncate">
                            {it.name}
                          </h4>
                          <p className="text-[11px] text-stone-500 truncate">
                            {it.subCategory}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Climate Suitability */}
              <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-900 block">
                  Adecuación al Clima:
                </span>
                <p className="text-xs text-amber-950">
                  {activeModalOutfit.temperatureSuitability}
                </p>
              </div>

              {/* Style reasoning */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-800 block">
                  Consejo de estilista:
                </span>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {activeModalOutfit.styleExplanation}
                </p>
              </div>

              {/* Styling Tips */}
              {activeModalOutfit.stylingTips && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-stone-700 uppercase tracking-wider block">
                    Tips para usar este outfit:
                  </span>
                  <ul className="space-y-1.5 text-xs text-stone-600">
                    {activeModalOutfit.stylingTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-stone-50 p-2 rounded-lg border border-stone-100">
                        <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end">
              <button
                onClick={() => setActiveModalOutfit(null)}
                className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Outfit Confirmation Modal */}
      {outfitToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">
                  ¿Eliminar este outfit?
                </h3>
                <p className="text-xs text-stone-500">
                  Esta combinación será eliminada de tus looks guardados.
                </p>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <h4 className="text-xs font-semibold text-stone-900 truncate">
                {outfitToDelete.title}
              </h4>
              <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                {outfitToDelete.styleExplanation}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOutfitToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteOutfit(outfitToDelete.id);
                  setOutfitToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sí, eliminar look</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
