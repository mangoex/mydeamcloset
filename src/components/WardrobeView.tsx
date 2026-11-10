import React, { useState } from 'react';
import { ClothingItem, ClothingCategory, Season, WeatherCondition } from '../types/wardrobe';
import { CATEGORIES_LIST, SEASONS_LIST, WEATHER_CONDITIONS, getWarmthLabel } from '../utils/fashionHelpers';
import {
  Search,
  Sparkles,
  Wand2,
  Trash2,
  Info,
  Plus,
  Filter,
  X,
  CheckSquare,
  Square,
  Check,
  AlertTriangle,
  Layers,
} from 'lucide-react';

interface WardrobeViewProps {
  wardrobe: ClothingItem[];
  onOpenUpload: () => void;
  onDeleteItem: (id: string) => void;
  onDeleteMultipleItems?: (ids: string[]) => void;
  onSelectAnchorItem: (item: ClothingItem) => void;
  onNavigateToCombiner?: () => void;
  userName?: string;
}

export const WardrobeView: React.FC<WardrobeViewProps> = ({
  wardrobe,
  onOpenUpload,
  onDeleteItem,
  onDeleteMultipleItems,
  onSelectAnchorItem,
  onNavigateToCombiner,
  userName,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | 'all'>('all');
  const [selectedSeason, setSelectedSeason] = useState<Season | 'all'>('all');
  const [selectedWeather, setSelectedWeather] = useState<WeatherCondition | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Selection states
  const [detailItem, setDetailItem] = useState<ClothingItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<ClothingItem | null>(null);
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [showBatchConfirm, setShowBatchConfirm] = useState<boolean>(false);

  // Filter items
  const filteredItems = wardrobe.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedSeason !== 'all' && !item.seasons.includes(selectedSeason)) return false;
    if (selectedWeather !== 'all' && !item.weather.includes(selectedWeather)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchSub = item.subCategory?.toLowerCase().includes(q);
      const matchColors = item.colors.some((c) => c.toLowerCase().includes(q));
      const matchMat = item.material?.toLowerCase().includes(q);
      if (!matchName && !matchSub && !matchColors && !matchMat) return false;
    }
    return true;
  });

  const categoryCounts = CATEGORIES_LIST.reduce((acc, cat) => {
    acc[cat.id] = wardrobe.filter((i) => i.category === cat.id).length;
    return acc;
  }, {} as Record<string, number>);

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    if (selectedItemIds.length === filteredItems.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredItems.map((item) => item.id));
    }
  };

  const handleConfirmSingleDelete = () => {
    if (itemToDelete) {
      onDeleteItem(itemToDelete.id);
      setItemToDelete(null);
    }
  };

  const handleConfirmBatchDelete = () => {
    if (selectedItemIds.length > 0) {
      if (onDeleteMultipleItems) {
        onDeleteMultipleItems(selectedItemIds);
      } else {
        selectedItemIds.forEach((id) => onDeleteItem(id));
      }
      setSelectedItemIds([]);
      setShowBatchConfirm(false);
      setIsSelectionMode(false);
    }
  };

  return (
    <div className="space-y-8 relative pb-16">
      {/* Editorial Hero Banner & Context */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-sm">
        <div className="max-w-2xl relative z-10 space-y-3">
          <div className="text-xs font-mono uppercase tracking-widest text-stone-400">
            {userName ? `Armario Privado de ${userName}` : 'Armario Cápsula Inteligente'}
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight text-balance">
            {userName ? `El Closet de ${userName}` : 'Tu Ropa, Infinitas Posibilidades de Estilo'}
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Sube fotos de tus prendas. La IA las aísla sobre fondo blanco de estudio y las combina según el clima y temporada. Puedes eliminar las prendas que ya no uses en cualquier momento.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-4 py-2 bg-white text-stone-900 text-xs sm:text-sm font-semibold rounded-lg hover:bg-stone-100 transition-colors cursor-pointer shadow-xs whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Fotos de Ropa</span>
            </button>
            {onNavigateToCombiner && wardrobe.length > 0 && (
              <button
                onClick={onNavigateToCombiner}
                className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-stone-100 hover:bg-stone-700 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer border border-stone-700 whitespace-nowrap shrink-0 shadow-xs"
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Probar en el Combinador</span>
              </button>
            )}
            <div className="text-xs text-stone-400 font-mono flex items-center gap-2">
              <span>{wardrobe.length} {wardrobe.length === 1 ? 'prenda registrada' : 'prendas registradas'}</span>
              <span>·</span>
              <span>{wardrobe.length === 0 ? 'Sube tus fotos para comenzar' : 'Listas para armar outfits'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            Todas ({wardrobe.length})
          </button>
          {CATEGORIES_LIST.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="font-mono text-[11px] opacity-70">
                ({categoryCounts[cat.id] || 0})
              </span>
            </button>
          ))}
        </div>

        {/* Secondary filters: Season, Weather, Search & Batch Selection Toggle */}
        <div className="bg-white p-4 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por prenda, tela o color..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-800 bg-stone-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Season Selector */}
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value as Season | 'all')}
              className="px-3 py-1.5 text-xs border border-stone-200 rounded-lg bg-stone-50/50 focus:outline-none focus:ring-1 focus:ring-stone-800 cursor-pointer"
            >
              <option value="all">Todas las Estaciones</option>
              {SEASONS_LIST.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.label}
                </option>
              ))}
            </select>

            {/* Weather Selector */}
            <select
              value={selectedWeather}
              onChange={(e) => setSelectedWeather(e.target.value as WeatherCondition | 'all')}
              className="px-3 py-1.5 text-xs border border-stone-200 rounded-lg bg-stone-50/50 focus:outline-none focus:ring-1 focus:ring-stone-800 cursor-pointer"
            >
              <option value="all">Cualquier Clima</option>
              {WEATHER_CONDITIONS.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.icon} {w.shortLabel}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            {/* Batch Select / Delete Mode Toggle */}
            {wardrobe.length > 0 && (
              <button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode);
                  setSelectedItemIds([]);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                  isSelectionMode
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{isSelectionMode ? 'Cancelar selección' : 'Seleccionar varias para eliminar'}</span>
              </button>
            )}

            {(selectedCategory !== 'all' ||
              selectedSeason !== 'all' ||
              selectedWeather !== 'all' ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSeason('all');
                  setSelectedWeather('all');
                  setSearchQuery('');
                }}
                className="text-xs text-stone-500 hover:text-stone-900 underline underline-offset-4 cursor-pointer"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Wardrobe Grid */}
      {wardrobe.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-14 text-center space-y-6 max-w-2xl mx-auto shadow-xs">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-700">
            <Plus className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              Tu armario está esperando tus prendas
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto leading-relaxed">
              Sube fotos de tu ropa o toma fotos con tu cámara. La app eliminará automáticamente el fondo y acomodará la prenda en medio de un lienzo blanco limpio para crear outfits a medida.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenUpload}
              className="px-6 py-3.5 bg-stone-900 text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Subir primera foto de mi ropa</span>
            </button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif font-bold text-stone-900">
            No encontramos prendas con esos filtros
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Prueba cambiando la temporada o los filtros de búsqueda, o añade una nueva foto de tu ropa.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedSeason('all');
              setSelectedWeather('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
          >
            Ver todas mis prendas ({wardrobe.length})
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const isSelected = selectedItemIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`group bg-white rounded-xl border transition-all flex flex-col relative overflow-hidden ${
                  isSelected
                    ? 'border-stone-900 ring-2 ring-stone-900 shadow-md'
                    : 'border-stone-200 hover:border-stone-300 hover:shadow-md'
                }`}
              >
                {/* Selection Checkbox Overlay */}
                {isSelectionMode && (
                  <button
                    type="button"
                    onClick={() => toggleItemSelection(item.id)}
                    className="absolute top-2.5 left-2.5 z-20 w-7 h-7 rounded-lg bg-white/95 border border-stone-300 shadow-sm flex items-center justify-center cursor-pointer transition-colors"
                  >
                    {isSelected ? (
                      <Check className="w-4 h-4 text-stone-950 font-bold" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded border border-stone-300" />
                    )}
                  </button>
                )}

                {/* Image Container with White Studio Background and Centered Garment */}
                <div
                  onClick={isSelectionMode ? () => toggleItemSelection(item.id) : undefined}
                  className={`relative aspect-square w-full bg-white overflow-hidden flex items-center justify-center p-3 border-b border-stone-100 ${
                    isSelectionMode ? 'cursor-pointer' : ''
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.display = 'none';
                    }}
                    className="w-full h-full object-contain group-hover:scale-104 transition-transform duration-300 pointer-events-none"
                  />

                  {/* Category icon tag in corner (hidden or shifted in selection mode) */}
                  {!isSelectionMode && (
                    <div className="absolute top-2.5 left-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded">
                      {item.subCategory || item.category}
                    </div>
                  )}

                  {/* Warmth indicator */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100/90 text-stone-800 shadow-xs backdrop-blur-xs">
                      Calidez {item.warmth}/5
                    </span>
                  </div>
                </div>

                {/* Card Content with unboxed metadata discipline (§1.A) */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-stone-900 line-clamp-1 group-hover:text-stone-700">
                      {item.name}
                    </h3>

                    {/* Unboxed metadata with typographic separators */}
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 flex-wrap">
                      <span>{item.colors.join(', ')}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.material || 'Tejido'}</span>
                    </div>

                    {/* Seasons text list */}
                    <div className="text-[11px] text-stone-500 pt-0.5">
                      <span className="text-stone-400">Estaciones: </span>
                      {item.seasons
                        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                        .join(' · ')}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onSelectAnchorItem(item)}
                      title="Armar un outfit incluyendo esta prenda"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-stone-900 text-white hover:bg-stone-800 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Crear Outfit</span>
                    </button>
                    <button
                      onClick={() => setDetailItem(item)}
                      title="Ver detalles"
                      className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      title="Eliminar prenda del armario"
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Bar for Batch Delete Selection Mode */}
      {isSelectionMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 border border-stone-700 animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-xl w-[90%] justify-between">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="bg-stone-800 px-2.5 py-1 rounded-md font-mono text-stone-200">
              {selectedItemIds.length} seleccionada{selectedItemIds.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={selectAllFiltered}
              className="text-stone-300 hover:text-white underline underline-offset-4 cursor-pointer ml-1"
            >
              {selectedItemIds.length === filteredItems.length
                ? 'Deseleccionar todas'
                : 'Seleccionar todas'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedItemIds([]);
              }}
              className="px-3 py-1.5 text-xs text-stone-300 hover:text-white cursor-pointer"
            >
              Cancelar
            </button>

            <button
              disabled={selectedItemIds.length === 0}
              onClick={() => setShowBatchConfirm(true)}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar ({selectedItemIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Single Item Deletion Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">
                  ¿Eliminar esta prenda?
                </h3>
                <p className="text-xs text-stone-500">
                  Esta acción la quitará permanentemente de tu armario.
                </p>
              </div>
            </div>

            {/* Garment Preview */}
            <div className="flex items-center gap-3.5 p-3 bg-stone-50 rounded-xl border border-stone-200">
              <div className="w-14 h-14 rounded-lg bg-white border border-stone-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                <img
                  src={itemToDelete.imageUrl}
                  alt={itemToDelete.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-stone-900 truncate">
                  {itemToDelete.name}
                </h4>
                <p className="text-[11px] text-stone-500 truncate">
                  {itemToDelete.subCategory} · {itemToDelete.colors.join(', ')}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sí, eliminar prenda</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Deletion Confirmation Modal */}
      {showBatchConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-stone-900">
                  ¿Eliminar {selectedItemIds.length} prendas?
                </h3>
                <p className="text-xs text-stone-500">
                  Se eliminarán permanentemente las prendas seleccionadas de tu armario.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBatchConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar {selectedItemIds.length} prendas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {detailItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-stone-200 overflow-hidden my-8">
            <div className="relative aspect-square sm:aspect-4/3 bg-white border-b border-stone-200 flex items-center justify-center p-6">
              <img
                src={detailItem.imageUrl}
                alt={detailItem.name}
                className="max-h-full max-w-full object-contain"
              />
              <button
                onClick={() => setDetailItem(null)}
                className="absolute top-3 right-3 p-1.5 bg-stone-900/70 hover:bg-stone-900 text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs font-mono uppercase text-stone-500">
                  {detailItem.category.toUpperCase()} · {detailItem.subCategory}
                </span>
                <h2 className="text-xl font-serif font-bold text-stone-900 mt-0.5">
                  {detailItem.name}
                </h2>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div>
                  <span className="text-stone-500 block">Colores:</span>
                  <span className="font-semibold text-stone-800">
                    {detailItem.colors.join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Material:</span>
                  <span className="font-semibold text-stone-800">
                    {detailItem.material || 'No especificado'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Calidez Térmica:</span>
                  <span className="font-semibold text-stone-800">
                    Nivel {detailItem.warmth}/5 ({getWarmthLabel(detailItem.warmth).text})
                  </span>
                </div>
                <div>
                  <span className="text-stone-500 block">Estaciones:</span>
                  <span className="font-semibold text-stone-800">
                    {detailItem.seasons
                      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                      .join(', ')}
                  </span>
                </div>
              </div>

              {/* Styling Advice */}
              {detailItem.stylingAdvice && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-stone-600" />
                    Consejo de Estilista:
                  </span>
                  <p className="text-xs text-stone-600 bg-amber-50/50 p-3 rounded-lg border border-amber-100 italic">
                    "{detailItem.stylingAdvice}"
                  </p>
                </div>
              )}

              {/* Action */}
              <div className="pt-3 flex items-center justify-between gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    const item = detailItem;
                    setDetailItem(null);
                    setItemToDelete(item);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Prenda</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDetailItem(null)}
                    className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      const item = detailItem;
                      setDetailItem(null);
                      onSelectAnchorItem(item);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg cursor-pointer flex items-center gap-1.5"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Crear Outfit con esto</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
