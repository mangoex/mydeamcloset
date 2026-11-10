import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Users,
  Shirt,
  BookmarkCheck,
  Search,
  ChevronDown,
  ChevronUp,
  FileCode,
  Sparkles,
  ClipboardCheck,
} from 'lucide-react';
import { ClothingItem } from '../types/wardrobe';
import {
  exportDatabaseAsJsonFile,
  importDatabaseFromJsonFile,
  restoreDatabaseFromRawJson,
  getDatabaseSummaryStats,
  findAndConsolidateRenatasWardrobe,
} from '../services/authService';

interface DatabaseMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWardrobe?: ClothingItem[];
  onDataRestored?: () => void;
}

export const DatabaseMigrationModal: React.FC<DatabaseMigrationModalProps> = ({
  isOpen,
  onClose,
  currentWardrobe,
  onDataRestored,
}) => {
  const [downloadInfo, setDownloadInfo] = useState<{
    fileName: string;
    itemCount: number;
  } | null>(null);
  const [showGarmentGallery, setShowGarmentGallery] = useState<boolean>(true);
  const [showPasteJson, setShowPasteJson] = useState<boolean>(false);
  const [pastedJsonText, setPastedJsonText] = useState<string>('');
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const stats = getDatabaseSummaryStats(currentWardrobe);
  const renataClothes = stats.renataItems;

  const handleDownload = () => {
    try {
      const result = exportDatabaseAsJsonFile(renataClothes);
      setDownloadInfo({
        fileName: result.fileName,
        itemCount: result.itemCount,
      });
      setTimeout(() => setDownloadInfo(null), 8000);
    } catch (e: any) {
      console.error('Error downloading database:', e);
    }
  };

  const handleScanBrowserStorage = () => {
    const recovered = findAndConsolidateRenatasWardrobe(currentWardrobe);
    setScanMessage(
      `✓ Escaneo finalizado: se encontraron ${recovered.length} prendas asociadas a Renata.`
    );
    if (onDataRestored) {
      onDataRestored();
    }
    setTimeout(() => setScanMessage(null), 5000);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ loading: true });
    const result = await importDatabaseFromJsonFile(file);

    if (result.success) {
      setImportStatus({
        loading: false,
        success: true,
        message: `¡Base de datos restaurada! Se cargaron ${result.userCount} usuarios y ${result.totalItems} prendas en la cuenta de Renata.`,
      });
      if (onDataRestored) {
        onDataRestored();
      }
    } else {
      setImportStatus({
        loading: false,
        success: false,
        message: result.error || 'No se pudo importar la base de datos.',
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRestorePastedJson = async () => {
    if (!pastedJsonText.trim()) return;
    setImportStatus({ loading: true });
    const result = await restoreDatabaseFromRawJson(pastedJsonText);

    if (result.success) {
      setImportStatus({
        loading: false,
        success: true,
        message: `¡Prendas restauradas! Se actualizaron ${result.totalItems} prendas en el armario de Renata.`,
      });
      setPastedJsonText('');
      setShowPasteJson(false);
      if (onDataRestored) {
        onDataRestored();
      }
    } else {
      setImportStatus({
        loading: false,
        success: false,
        message: result.error || 'Error al procesar el texto JSON.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="p-6 bg-stone-900 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-[11px] font-mono uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>Migración Completa de Base de Datos a Vercel</span>
          </div>

          <h2 className="text-2xl font-serif font-bold tracking-tight text-white mt-1">
            Armario y Base de Datos de Renata
          </h2>
          <p className="text-stone-300 text-xs mt-1 leading-relaxed">
            Exporta todas las 18 prendas creadas por Renata con sus fotos en alta calidad, colores y estilos para subirlas a Vercel. Miguel mantendrá su armario propio separado.
          </p>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status highlight card for Renata's 18 Clothes */}
          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-700 font-bold block">
                  Armario de Renata
                </span>
                <h3 className="text-base font-bold text-stone-900 mt-0.5 flex items-center gap-2">
                  <span>{renataClothes.length} prendas detectadas</span>
                  {renataClothes.length === 18 ? (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded-full border border-emerald-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      18 prendas completas
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-semibold rounded-full border border-amber-300">
                      {renataClothes.length} prendas activas
                    </span>
                  )}
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {renataClothes.length === 18
                    ? '¡Perfecto! Están listas todas las 18 prendas que Renata subió en esta aplicación. Al descargar el archivo JSON se incluirán todas sus fotografías y atributos.'
                    : `Se han recopilado ${renataClothes.length} prendas. Puedes verificar la lista abajo o hacer un escaneo profundo en caso de que alguna prenda haya quedado en otra pestaña.`}
                </p>
              </div>

              <button
                onClick={handleScanBrowserStorage}
                className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs transition-all active:scale-95"
                title="Escanear claves del navegador para verificar prendas"
              >
                <Search className="w-3.5 h-3.5 text-stone-600" />
                <span>Escanear</span>
              </button>
            </div>

            {scanMessage && (
              <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{scanMessage}</span>
              </div>
            )}
          </div>

          {/* Collapsible Gallery of Renata's detected garments */}
          <div className="border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/50">
            <button
              onClick={() => setShowGarmentGallery(!showGarmentGallery)}
              className="w-full p-3.5 bg-stone-100/70 hover:bg-stone-100 flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Shirt className="w-4 h-4 text-stone-700" />
                <span className="text-xs font-bold text-stone-900">
                  Previsualizar prendas de Renata a exportar ({renataClothes.length})
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-stone-500">
                <span>{showGarmentGallery ? 'Ocultar' : 'Ver prendas'}</span>
                {showGarmentGallery ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {showGarmentGallery && (
              <div className="p-3 max-h-56 overflow-y-auto">
                {renataClothes.length === 0 ? (
                  <div className="text-center py-6 text-stone-400 text-xs">
                    No hay prendas registradas aún en el armario.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {renataClothes.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-2 bg-white rounded-xl border border-stone-200 flex items-center gap-2 shadow-2xs hover:border-stone-300 transition-all"
                      >
                        <div className="w-11 h-11 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-100 flex items-center justify-center">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Shirt className="w-5 h-5 text-stone-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-stone-400 font-mono block">
                            #{idx + 1} • {item.category}
                          </span>
                          <p className="text-xs font-semibold text-stone-900 truncate">
                            {item.name}
                          </p>
                          <span className="text-[10px] text-stone-500 truncate block">
                            {item.colors?.slice(0, 2).join(', ') || 'Color estándar'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Database Summary Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-stone-400 text-xs mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Cuentas</span>
              </div>
              <span className="text-lg font-bold text-stone-900 font-mono">
                {stats.userCount}
              </span>
              <span className="text-[10px] text-stone-500 block truncate">
                Renata & Miguel
              </span>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-stone-400 text-xs mb-1">
                <Shirt className="w-3.5 h-3.5" />
                <span>Ropa Renata</span>
              </div>
              <span className="text-lg font-bold text-rose-600 font-mono">
                {renataClothes.length}
              </span>
              <span className="text-[10px] text-stone-500 block">Fotos & Atributos</span>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-stone-400 text-xs mb-1">
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Looks Renata</span>
              </div>
              <span className="text-lg font-bold text-stone-900 font-mono">
                {stats.totalOutfits}
              </span>
              <span className="text-[10px] text-stone-500 block">Guardados</span>
            </div>
          </div>

          {/* Action 1: Download Complete Database */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold block">
                Paso 1: Descargar aquí
              </span>
              <h4 className="text-sm font-bold text-stone-900">
                Descargar Base de Datos Completa (.json)
              </h4>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                Descarga el archivo que contiene exactamente las {renataClothes.length} prendas de Renata, sus fotos, estilos, cuentas y contraseñas.
              </p>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all active:scale-98"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>
                Descargar Archivo JSON ({renataClothes.length} prendas de Renata)
              </span>
            </button>

            {downloadInfo && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>¡Archivo descargado exitosamente!</span>
                </div>
                <p className="text-[11px] text-emerald-700 pl-6">
                  Se incluyeron <strong>{downloadInfo.itemCount} prendas</strong> de Renata en el archivo <code className="bg-emerald-100 px-1 rounded">{downloadInfo.fileName}</code>.
                </p>
              </div>
            )}
          </div>

          {/* Action 2: Import / Restore Database */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">
                Paso 2: Cargar en tu despliegue de Vercel
              </span>
              <h4 className="text-sm font-bold text-stone-900">
                Restaurar / Importar Base de Datos (.json)
              </h4>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                Abre tu sitio en Vercel, presiona el botón "Base de Datos" y sube el archivo JSON descargado para que Renata tenga sus {renataClothes.length} prendas en Vercel de inmediato.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importStatus.loading}
                className="flex-1 py-2.5 bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all active:scale-98 disabled:opacity-50"
              >
                <Upload className="w-4 h-4 text-stone-700" />
                <span>
                  {importStatus.loading ? 'Cargando...' : 'Seleccionar archivo .json'}
                </span>
              </button>

              <button
                onClick={() => setShowPasteJson(!showPasteJson)}
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{showPasteJson ? 'Cerrar editor' : 'Pegar JSON'}</span>
              </button>
            </div>

            {/* Paste JSON Direct Editor */}
            {showPasteJson && (
              <div className="p-3 bg-white border border-stone-200 rounded-xl space-y-2 animate-in fade-in">
                <label className="text-[11px] font-semibold text-stone-700 block">
                  Pega el contenido del archivo JSON aquí:
                </label>
                <textarea
                  value={pastedJsonText}
                  onChange={(e) => setPastedJsonText(e.target.value)}
                  placeholder='{"appName": "My Dream Closet", "wardrobes": {...}}'
                  className="w-full h-28 p-2 text-[11px] font-mono border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
                <button
                  onClick={handleRestorePastedJson}
                  disabled={importStatus.loading || !pastedJsonText.trim()}
                  className="w-full py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
                >
                  Restaurar Prendas desde Texto
                </button>
              </div>
            )}

            {importStatus.message && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
                  importStatus.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                {importStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Formato universal compatible con Vercel</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white rounded-lg font-semibold hover:bg-stone-800 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
