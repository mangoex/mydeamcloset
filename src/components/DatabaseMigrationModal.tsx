import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  FileJson,
  Users,
  Shirt,
  BookmarkCheck,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  exportDatabaseAsJsonFile,
  importDatabaseFromJsonFile,
  getDatabaseSummaryStats,
} from '../services/authService';

interface DatabaseMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
}

export const DatabaseMigrationModal: React.FC<DatabaseMigrationModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const stats = getDatabaseSummaryStats();

  const handleDownload = () => {
    try {
      exportDatabaseAsJsonFile();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 5000);
    } catch (e: any) {
      console.error('Error downloading database:', e);
    }
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
        message: `¡Base de datos importada con éxito! Se restauraron ${result.userCount} usuarios y ${result.totalItems} prendas.`,
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-6 bg-stone-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-[11px] font-mono uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>Migración y Respaldo de Base de Datos</span>
          </div>

          <h2 className="text-2xl font-serif font-bold tracking-tight text-white mt-1">
            Pasar Base de Datos a Vercel
          </h2>
          <p className="text-stone-300 text-xs mt-1 leading-relaxed">
            Descarga todas las prendas, fotografías, cuentas (Renata y Miguel) y preferencias en un archivo JSON para migrarlo a tu despliegue en Vercel.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Current Database Summary Badges */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-stone-400 text-xs mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Usuarios</span>
              </div>
              <span className="text-lg font-bold text-stone-900 font-mono">
                {stats.userCount}
              </span>
              <span className="text-[10px] text-stone-500 block truncate">
                {stats.users.map((u) => u.name).join(', ')}
              </span>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-stone-400 text-xs mb-1">
                <Shirt className="w-3.5 h-3.5" />
                <span>Prendas</span>
              </div>
              <span className="text-lg font-bold text-stone-900 font-mono">
                {stats.totalItems}
              </span>
              <span className="text-[10px] text-stone-500 block">Fotos & Datos</span>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-center">
              <div className="flex items-center justify-center gap-1 text-stone-400 text-xs mb-1">
                <BookmarkCheck className="w-3.5 h-3.5" />
                <span>Looks</span>
              </div>
              <span className="text-lg font-bold text-stone-900 font-mono">
                {stats.totalOutfits}
              </span>
              <span className="text-[10px] text-stone-500 block">Guardados</span>
            </div>
          </div>

          {/* Action 1: Download Database */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold block">
                  Paso 1: Descargar aquí
                </span>
                <h4 className="text-sm font-bold text-stone-900">
                  Descargar Base de Datos Completa (.json)
                </h4>
                <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                  Genera un archivo con los usuarios (Renata y Miguel), sus fotos y prendas subidas.
                </p>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all active:scale-98"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Descargar Archivo JSON de la Base de Datos</span>
            </button>

            {downloadSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  ¡Archivo descargado! Ahora ábrelo o impórtalo en tu aplicación de Vercel.
                </span>
              </div>
            )}
          </div>

          {/* Action 2: Import / Restore Database */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-500 font-bold block">
                Paso 2: Cargar en Vercel
              </span>
              <h4 className="text-sm font-bold text-stone-900">
                Restaurar / Importar Base de Datos (.json)
              </h4>
              <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                Abre tu aplicación en Vercel, entra a esta misma ventana y selecciona el archivo descargado para restaurar la ropa y cuentas al instante.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importStatus.loading}
              className="w-full py-2.5 bg-white hover:bg-stone-100 text-stone-900 border border-stone-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-2xs transition-all active:scale-98 disabled:opacity-50"
            >
              <Upload className="w-4 h-4 text-stone-700" />
              <span>{importStatus.loading ? 'Cargando datos...' : 'Seleccionar archivo .json para importar'}</span>
            </button>

            {importStatus.message && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in ${
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

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>Formato JSON universal</span>
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
